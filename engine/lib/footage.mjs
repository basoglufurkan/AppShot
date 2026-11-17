// Footage analysis for app previews: decodes a recording (or a capture) into tiny grey frames with ffmpeg and
// measures, per sample, how much changed (activity), where it changed (focus box), how full the screen is (richness)
// and how bright the caption bands are. From that: the liveliest window to use, a camera path that eases in on
// localised action (Screen Studio-style, critically damped springs, never past the source's native density) and
// where the caption should sit. Everything is deterministic and cached in appshot/.cache/preview/analysis.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { readJson, writeJson, exists, ensureDir } from './util.mjs';
import { readPngInfo } from './png.mjs';

const r3 = (v) => Math.round(v * 1000) / 1000;
const r4 = (v) => Math.round(v * 10000) / 10000;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function mediaSize(file) {
  if (/\.(png|jpe?g)$/i.test(file)) { const p = readPngInfo(file); return { width: p.width, height: p.height, image: true }; }
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  const [width, height] = r.stdout.trim().split(',').map(Number);
  return { width, height, image: false };
}

/** Grey samples of a clip (10 per second) or an image (one) → activity, focus box, richness, band brightness. */
export function analyzeMedia(file, cacheRoot, { fps = 10, w = 72 } = {}) {
  const st = fs.statSync(file);
  const key = crypto.createHash('sha1').update([file, st.size, st.mtimeMs, fps, w, 'v2'].join('|')).digest('hex').slice(0, 16);
  const cacheFile = path.join(ensureDir(path.join(cacheRoot, 'analysis')), `${key}.json`);
  if (exists(cacheFile)) return readJson(cacheFile);
  const { width, height, image } = mediaSize(file);
  const h = Math.max(2, Math.round((w * height) / width));
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `${image ? '' : `fps=${fps},`}scale=${w}:${h}:flags=area,format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`ffmpeg could not analyse ${file}: ${String(r.stderr).slice(-300)}`);
  const buf = r.stdout, size = w * h, n = Math.floor(buf.length / size);
  const top = Math.round(h * 0.06); // the status bar never counts as action
  // Focus = the densest cluster of change on a coarse grid, so twinkling backgrounds or a clock elsewhere do not
  // stretch the box over the whole screen.
  const GX = 6, GY = 12;
  const frames = [];
  let prev = null;
  for (let i = 0; i < n; i++) {
    const f = buf.subarray(i * size, (i + 1) * size);
    let sum = 0, sq = 0;
    for (let k = 0; k < size; k++) { const v = f[k]; sum += v; sq += v * v; }
    const mean = sum / size;
    const band = (y0, y1) => { let s = 0, c = 0; for (let y = Math.round(y0 * h); y < Math.round(y1 * h); y++) for (let x = 0; x < w; x++) { s += f[y * w + x]; c++; } return c ? s / c : 0; };
    let act = 0, box = null;
    if (prev) {
      const grid = new Float64Array(GX * GY);
      let cnt = 0;
      for (let y = top; y < h; y++) for (let x = 0; x < w; x++) {
        const d = Math.abs(f[y * w + x] - prev[y * w + x]);
        if (d > 16) { cnt++; grid[Math.min(GY - 1, Math.floor((y / h) * GY)) * GX + Math.min(GX - 1, Math.floor((x / w) * GX))] += d; }
      }
      act = cnt / ((h - top) * w);
      if (cnt >= 6) {
        let mi = 0;
        for (let k = 1; k < grid.length; k++) if (grid[k] > grid[mi]) mi = k;
        const thr = grid[mi] * 0.3, seen = new Uint8Array(grid.length), stack = [mi];
        let gx0 = GX, gy0 = GY, gx1 = -1, gy1 = -1, inside = 0, all = 0;
        for (let k = 0; k < grid.length; k++) all += grid[k];
        seen[mi] = 1;
        while (stack.length) {
          const k = stack.pop(), gx = k % GX, gy = Math.floor(k / GX);
          inside += grid[k]; gx0 = Math.min(gx0, gx); gy0 = Math.min(gy0, gy); gx1 = Math.max(gx1, gx); gy1 = Math.max(gy1, gy);
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const nx = gx + dx, ny = gy + dy, nk = ny * GX + nx;
            if (nx < 0 || ny < 0 || nx >= GX || ny >= GY || seen[nk] || grid[nk] < thr) continue;
            seen[nk] = 1; stack.push(nk);
          }
        }
        // A cluster that holds most of the change is a focus; diffuse change everywhere is not.
        if (inside / all > 0.55) box = [gx0 / GX, gy0 / GY, (gx1 + 1) / GX, (gy1 + 1) / GY].map(r3);
        else box = [0, 0, 1, 1];
      }
    }
    frames.push({ t: r3(i / fps), rich: Math.round(Math.sqrt(Math.max(0, sq / size - mean * mean)) * 10) / 10, lumTop: Math.round(band(0.04, 0.26)), lumBottom: Math.round(band(0.74, 0.96)), act: r4(act), box });
    prev = f;
  }
  const out = { fps, w, h, width, height, duration: image ? 0 : n / fps, image, frames };
  writeJson(cacheFile, out);
  return out;
}

const frameAt = (an, t) => an.frames[clamp(Math.round(t * an.fps), 0, an.frames.length - 1)];

/**
 * The liveliest `len` seconds that start on a full screen (no loading state, no fade-in): the first frame of a
 * segment is what the viewer sees on the cut, and the hook's first frame is the autoplay start.
 * Clips shorter than `len` start at their first full frame and hold the last frame.
 */
export function bestWindow(an, len, { from, to, taps = [] } = {}) {
  const lo = from ?? 0, hi = Math.min(to ?? an.duration, an.duration);
  const maxRich = Math.max(1, ...an.frames.filter((f) => f.t >= lo && f.t <= hi).map((f) => f.rich));
  const full = (t) => frameAt(an, t).rich / maxRich;
  if (hi - lo <= len + 0.05) {
    let s = lo;
    while (s < hi - 1.2 && full(s) < 0.75) s += 0.1;
    return { start: r3(s), len: r3(hi - s), why: s > lo ? `starts at ${s.toFixed(1)} s, the first full frame` : 'whole clip' };
  }
  let best = null;
  for (let s = lo; s <= hi - len + 1e-6; s += 0.1) {
    let a = 0, c = 0;
    for (const f of an.frames) if (f.t >= s && f.t < s + len) { a += f.act; c++; }
    const meanAct = a / Math.max(1, c);
    const r = full(s);
    // A tap and the screen's answer to it is the most telling moment a recording has: keep it inside the window,
    // with a beat before it and time to see the result after.
    // Full credit with ≥ 0.8 s before the press (the viewer reads the screen, the hotspot appears), half with less.
    const inTaps = taps.filter((tp) => tp.t >= s + 0.3 && tp.t <= s + len - 0.8).length;
    const roomy = taps.filter((tp) => tp.t >= s + 0.8 && tp.t <= s + len - 0.8).length;
    const score = meanAct * 40 + r - (r < 0.75 ? 2 : 0) - (s - lo) * 0.01 + inTaps * 0.75 + roomy * 0.75;
    if (!best || score > best.score) best = { start: r3(s), len: r3(len), score, why: `${inTaps ? `tap${inTaps > 1 ? 's' : ''} + reaction, ` : 'liveliest '}${len.toFixed(1)} s from ${s.toFixed(1)} s` };
  }
  return best;
}

/**
 * Camera keys at 30 fps for a scene of `sceneLen` seconds playing `win` of the clip: zoom towards localised action
 * (a timer ring, a toggle, a list growing), stay wide when the whole screen moves or nothing does. Critically damped
 * springs (no overshoot), look-ahead so the move starts before the action, hysteresis so it never twitches.
 * Returns { keys: [[z, cx, cy], …], maxZoom, focusY }.
 */
export function cameraPath(an, win, sceneLen, { zMax = 1.3, fps = 30, mode = 'auto', focus, taps = [] } = {}) {
  const n = Math.max(2, Math.ceil(sceneLen * fps) + 1);
  const keys = [];
  if (mode === 'none') { for (let i = 0; i < n; i++) keys.push([1, 0.5, 0.5]); return { keys, maxZoom: 1, focusY: 0.5 }; }
  if (focus) {
    // A rectangle chosen by hand ([x, y, w, h] fractions): ease in and stay.
    const [x, y, fw, fh] = focus;
    const z = clamp(Math.sqrt(0.25 / Math.max(0.01, fw * fh)), 1, zMax);
    return springTo(n, fps, () => ({ z, cx: x + fw / 2, cy: y + fh / 2 }), zMax);
  }
  if (an.image || !an.duration) {
    // A still: a slow, eased push towards the upper middle (where titles and hero numbers sit).
    for (let i = 0; i < n; i++) { const p = i / (n - 1), e = p * p * (3 - 2 * p); keys.push([r4(1 + 0.06 * e), 0.5, r4(0.5 - 0.04 * e)]); }
    return { keys, maxZoom: 1.06, focusY: 0.46, push: true };
  }
  // Targets at the analysis rate.
  const sr = an.fps, m = Math.ceil(sceneLen * sr) + 1;
  const raw = [];
  for (let k = 0; k < m; k++) {
    const f = frameAt(an, win.start + Math.min(k / sr, Math.max(0, win.len - 0.05)));
    let t = { z: 1, cx: 0.5, cy: 0.5, w: 0 };
    if (f.box && f.act > 0.002) {
      const [x0, y0, x1, y1] = f.box;
      const area = (x1 - x0) * (y1 - y0);
      // Phone UIs are centred: follow the action vertically, only lean sideways, so text at the edges stays whole.
      if (area < 0.4) t = { z: clamp(Math.sqrt(0.25 / Math.max(area, 0.01)), 1, zMax), cx: 0.5 + ((x0 + x1) / 2 - 0.5) * 0.35, cy: (y0 + y1) / 2, w: f.act };
    }
    // A tap is the strongest cue: lean in on it from just before the press until the screen has answered.
    const ct = win.start + k / sr;
    const tp = taps.find((x) => ct >= x.t - 0.7 && ct <= x.t + 0.9);
    if (tp) t = { z: Math.max(t.z, Math.min(zMax, 1.22)), cx: 0.5 + (tp.x - 0.5) * 0.35, cy: tp.y, w: 0.5 };
    raw.push(t);
  }
  // Look-ahead (0.6 s) weighted by activity, then hysteresis: switch only for a clear, lasting change.
  const ahead = raw.map((_, k) => {
    const win2 = raw.slice(k, k + 6);
    const wsum = win2.reduce((a, t) => a + (t.z > 1 ? t.w + 0.001 : 0.0004), 0);
    const avg = (key) => win2.reduce((a, t) => a + t[key] * (t.z > 1 ? t.w + 0.001 : 0.0004), 0) / wsum;
    const zoomed = win2.filter((t) => t.z > 1).length >= 3;
    return zoomed ? { z: avg('z'), cx: avg('cx'), cy: avg('cy') } : { z: 1, cx: 0.5, cy: 0.5 };
  });
  const held = [];
  let cur = ahead[0], since = 0;
  for (let k = 0; k < ahead.length; k++) {
    const a = ahead[k];
    const far = Math.abs(a.z - cur.z) > 0.08 || Math.hypot(a.cx - cur.cx, a.cy - cur.cy) > 0.12;
    if (far && (k - since) / sr >= 0.8) { cur = a; since = k; }
    held.push(cur);
  }
  const out = springTo(n, fps, (i) => held[Math.min(held.length - 1, Math.floor((i / fps) * sr))], zMax);
  if (out.maxZoom <= 1.02) {
    // Calm footage (nothing localised happens): a slow eased push keeps the shot alive without pretending action.
    out.keys = out.keys.map(([, cx, cy], i) => { const p = i / (n - 1), e = p * p * (3 - 2 * p); return [r4(1 + 0.045 * e), cx, r4(0.5 - 0.03 * e)]; });
    out.maxZoom = 1.045; out.push = true;
  }
  return out;
}

/** Critically damped spring (≈0.9 s settle) from wide to each target; centre clamped so the frame stays covered. */
function springTo(n, fps, target, zMax) {
  const w0 = (2 * Math.PI) / 0.9, dt = 1 / fps / 4;
  let z = 1, cx = 0.5, cy = 0.5, vz = 0, vx = 0, vy = 0, maxZoom = 1, fy = 0, fw = 0;
  const keys = [];
  for (let i = 0; i < n; i++) {
    const t = target(i);
    for (let s = 0; s < 4; s++) {
      vz += (w0 * w0 * (t.z - z) - 2 * w0 * vz) * dt; z += vz * dt;
      vx += (w0 * w0 * (t.cx - cx) - 2 * w0 * vx) * dt; cx += vx * dt;
      vy += (w0 * w0 * (t.cy - cy) - 2 * w0 * vy) * dt; cy += vy * dt;
    }
    const zz = clamp(z, 1, zMax);
    const h = 0.5 / zz;
    keys.push([r4(zz), r4(clamp(cx, h, 1 - h)), r4(clamp(cy, h, 1 - h))]);
    maxZoom = Math.max(maxZoom, zz);
    if (zz > 1.04) { fy += cy * (zz - 1); fw += zz - 1; }
  }
  return { keys, maxZoom: r3(maxZoom), focusY: fw ? r3(fy / fw) : 0.5 };
}

/** Caption side and tone for a scene: away from the action, and dark or light against the footage under it. */
export function captionPlacement(an, win, cam, prefer = 'auto') {
  const at = prefer === 'top' || prefer === 'bottom' ? prefer : cam.maxZoom > 1.05 && cam.focusY < 0.45 ? 'bottom' : 'top';
  const f = frameAt(an, win?.start || 0);
  const lum = at === 'top' ? f.lumTop : f.lumBottom;
  return { at, tone: lum < 150 ? 'dark' : 'light' };
}

/**
 * Align taps to the screen's reaction: the first jump in change near the tap point (or a full-screen change) within
 * −0.6…+0.9 s, minus 0.15 s for the finger. Hand-written or live-logged taps only need to be roughly right.
 */
export function snapTaps(an, taps) {
  if (!an || an.image || !an.frames?.length) return taps;
  return taps.map((tp) => {
    for (let i = 1; i < an.frames.length; i++) {
      const f = an.frames[i], p = an.frames[i - 1];
      if (f.t < tp.t - 0.6) continue;
      if (f.t > tp.t + 0.9) break;
      const near = f.box && tp.x >= f.box[0] - 0.2 && tp.x <= f.box[2] + 0.2 && tp.y >= f.box[1] - 0.2 && tp.y <= f.box[3] + 0.2;
      if (f.act >= 0.01 && f.act >= p.act * 3 && (near || f.act > 0.3)) return { ...tp, t: r3(Math.max(0, f.t - 0.15)), snapped: true };
    }
    return tp;
  });
}

/** The region worth a spotlight: where the most concentrated change of the window happens, padded. */
export function spotlightRect(an, win) {
  if (!an || an.image) return null;
  let best = null;
  for (const f of an.frames) {
    if (f.t < win.start || f.t > win.start + win.len || !f.box) continue;
    const [x0, y0, x1, y1] = f.box, area = (x1 - x0) * (y1 - y0);
    if (area > 0.35 || area < 0.004) continue;
    if (!best || f.act > best.act) best = { act: f.act, box: f.box };
  }
  if (!best) return null;
  const [x0, y0, x1, y1] = best.box;
  const pad = 0.035, w = Math.max(0.3, x1 - x0 + pad * 2), h = Math.max(0.1, y1 - y0 + pad * 2);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return [clamp(cx - w / 2, 0.02, 0.98 - w), clamp(cy - h / 2, 0.06, 0.96 - h), Math.min(w, 0.96), Math.min(h, 0.9)].map(r3);
}

/** Taps saved next to a clip: <clip>.taps.json → [{ t, x, y, kind: 'tap' | 'swipe', x2, y2, dur }] (clip time, fractions). */
export function readTaps(clip) {
  if (!clip) return [];
  const f = clip.replace(/\.\w+$/, '.taps.json');
  if (!exists(f)) return [];
  const j = readJson(f, { taps: [] });
  return (Array.isArray(j) ? j : j.taps || []).filter((t) => typeof t.t === 'number' && typeof t.x === 'number' && typeof t.y === 'number');
}
