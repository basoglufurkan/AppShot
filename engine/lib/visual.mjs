// Visual traits of store screenshots — a reference the user likes, a competitor's set, or our own render — measured
// from the pixels so design decisions rest on numbers, not guesses:
//   tone (light / dark), palette and accent, background kind (flat / gradient / photo), how much of the canvas the
//   app UI fills (device size, full-bleed), where the caption sits and how much room it takes, how many devices
//   stand side by side, and whether neighbouring shots continue into each other (panorama).
// Any image ffmpeg reads works (PNG, JPEG, WebP, HEIC); PNG also works without ffmpeg.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { decodePng } from './png.mjs';
import { dominantColors } from './palette.mjs';
import { toHex, toHsl, luminance } from './color.mjs';

const W = 180;

/** RGBA pixels of an image, scaled to `w` px wide. */
export function loadImage(file, w = W) {
  const probe = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  const [ow, oh] = (probe.stdout || '').trim().split(',').map(Number);
  if (ow && oh) {
    const h = Math.max(2, Math.round((w * oh) / ow));
    const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-frames:v', '1', '-vf', `scale=${w}:${h}:flags=area`, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: 1 << 26 });
    if (r.status === 0 && r.stdout.length >= w * h * 4) return { width: w, height: h, data: new Uint8Array(r.stdout.buffer, r.stdout.byteOffset, w * h * 4), source: { width: ow, height: oh } };
  }
  if (/\.png$/i.test(file)) {
    const img = decodePng(fs.readFileSync(file));
    const h = Math.max(2, Math.round((w * img.height) / img.width)), data = new Uint8Array(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const sx = Math.floor((x * img.width) / w), sy = Math.floor((y * img.height) / h), o = (sy * img.width + sx) * 4, d = (y * w + x) * 4;
      data[d] = img.data[o]; data[d + 1] = img.data[o + 1]; data[d + 2] = img.data[o + 2]; data[d + 3] = img.data[o + 3];
    }
    return { width: w, height: h, data, source: { width: img.width, height: img.height } };
  }
  throw new Error(`Cannot read ${file} (install ffmpeg for JPEG / WebP / HEIC)`);
}

const lum = (d, o) => 0.2126 * d[o] + 0.7152 * d[o + 1] + 0.0722 * d[o + 2];
const r2 = (v) => Math.round(v * 100) / 100;

/** Traits of one screenshot. */
export function traits(file) {
  const img = loadImage(file);
  const { width: w, height: h, data: d } = img;
  const at = (x, y) => (y * w + x) * 4;
  // Tone.
  let sum = 0;
  for (let i = 0; i < w * h; i++) sum += lum(d, i * 4);
  const mean = sum / (w * h) / 255;
  // Background: the outer frame (top rows, side columns) is what the design paints; flat, gradient or busy.
  const border = [];
  for (let y = 0; y < h; y++) for (const x of [0, 1, 2, w - 3, w - 2, w - 1]) border.push(at(x, y));
  for (let x = 0; x < w; x++) for (const y of [0, 1, 2]) border.push(at(x, y));
  const bl = border.map((o) => lum(d, o));
  const bMean = bl.reduce((a, b) => a + b, 0) / bl.length;
  const bStd = Math.sqrt(bl.reduce((a, b) => a + (b - bMean) ** 2, 0) / bl.length);
  // Local roughness along the border: a gradient changes slowly, a photo or a pattern changes pixel to pixel.
  let rough = 0;
  for (let y = 1; y < h; y++) rough += Math.abs(lum(d, at(1, y)) - lum(d, at(1, y - 1))) + Math.abs(lum(d, at(w - 2, y)) - lum(d, at(w - 2, y - 1)));
  rough /= 2 * (h - 1);
  const background = rough > 6 ? 'photo' : bStd > 10 ? 'gradient' : 'flat';
  const bgColor = (() => { let r = 0, g = 0, b = 0; for (const o of border) { r += d[o]; g += d[o + 1]; b += d[o + 2]; } return toHex({ r: r / border.length, g: g / border.length, b: b / border.length }); })();
  // Blocks (6 px): "content" when the block differs in colour from the row's background or has detail of its own
  // (UI, photos, type). Dark app screens on a dark canvas still show detail, so this finds devices either way.
  const B = 6, GX = Math.floor(w / B), GY = Math.floor(h / B), grid = new Uint8Array(GX * GY), det = new Float32Array(GX * GY);
  for (let gy = 0; gy < GY; gy++) {
    const yc = gy * B + B / 2 | 0, L = at(1, yc), R = at(w - 2, yc);
    for (let gx = 0; gx < GX; gx++) {
      let s1 = 0, s2 = 0, r = 0, g = 0, b = 0, n = 0;
      for (let y = gy * B; y < gy * B + B; y++) for (let x = gx * B; x < gx * B + B; x++) { const o = at(x, y), l = lum(d, o); s1 += l; s2 += l * l; r += d[o]; g += d[o + 1]; b += d[o + 2]; n++; }
      const std = Math.sqrt(Math.max(0, s2 / n - (s1 / n) ** 2)), t = (gx * B + B / 2) / w;
      const dr = r / n - (d[L] * (1 - t) + d[R] * t), dg = g / n - (d[L + 1] * (1 - t) + d[R + 1] * t), db = b / n - (d[L + 2] * (1 - t) + d[R + 2] * t);
      det[gy * GX + gx] = std;
      if (Math.sqrt(dr * dr + dg * dg + db * db) > 60 || std > 12) grid[gy * GX + gx] = 1;
    }
  }
  // Close one-block gaps horizontally and vertically, so a screen with calm areas stays one piece.
  const closed = grid.slice();
  for (let gy = 0; gy < GY; gy++) for (let gx = 0; gx < GX; gx++) {
    const k = gy * GX + gx; if (grid[k]) continue;
    const H2 = gx > 0 && gx < GX - 1 && grid[k - 1] && grid[k + 1], V2 = gy > 0 && gy < GY - 1 && grid[k - GX] && grid[k + GX];
    if (H2 || V2) closed[k] = 1;
  }
  // Connected components; the UI blocks are the big, tall ones (type makes short, wide ones).
  const lab = new Int32Array(GX * GY).fill(-1), comps = [];
  for (let k0 = 0; k0 < GX * GY; k0++) {
    if (!closed[k0] || lab[k0] >= 0) continue;
    const c = { n: 0, x0: GX, y0: GY, x1: 0, y1: 0 }, st = [k0]; lab[k0] = comps.length;
    while (st.length) {
      const k = st.pop(), x = k % GX, y = (k / GX) | 0;
      c.n++; c.x0 = Math.min(c.x0, x); c.x1 = Math.max(c.x1, x); c.y0 = Math.min(c.y0, y); c.y1 = Math.max(c.y1, y);
      for (const nk of [x > 0 ? k - 1 : -1, x < GX - 1 ? k + 1 : -1, y > 0 ? k - GX : -1, y < GY - 1 ? k + GX : -1]) if (nk >= 0 && closed[nk] && lab[nk] < 0) { lab[nk] = comps.length; st.push(nk); }
    }
    comps.push(c);
  }
  const tall = comps.filter((c) => (c.y1 - c.y0 + 1) / GY >= 0.22 && c.n / (GX * GY) >= 0.03).sort((a, b) => b.n - a.n);
  const ui = tall.length ? tall.reduce((a, c) => ({ n: a.n + c.n, x0: Math.min(a.x0, c.x0), x1: Math.max(a.x1, c.x1), y0: Math.min(a.y0, c.y0), y1: Math.max(a.y1, c.y1) })) : null;
  const uiTop = ui ? ui.y0 / GY : 1, uiBottom = ui ? (ui.y1 + 1) / GY : 1;
  const uiShare = r2(ui ? ui.n / (GX * GY) : 0);
  const fullBleed = uiShare > 0.8;
  const runs = Math.min(3, tall.filter((c) => c.n >= (tall[0]?.n || 1) * 0.35).length);
  // Caption: detail (type) in the band above or below the UI block.
  const band = (y0, y1) => { let e = 0, n = 0; for (let gy = Math.floor(y0 * GY); gy < Math.ceil(y1 * GY); gy++) for (let gx = 0; gx < GX; gx++) { const k = gy * GX + gx; if (ui && lab[k] >= 0 && tall.includes(comps[lab[k]])) continue; e += det[k] > 12 ? 1 : 0; n++; } return n ? e / n : 0; };
  const topText = uiTop > 0.06 ? band(0, uiTop) : 0, bottomText = uiBottom < 0.94 ? band(uiBottom, 1) : 0;
  let captionAt = fullBleed ? (band(0, 0.3) >= band(0.7, 1) ? 'top-overlay' : 'bottom-overlay') : topText >= bottomText ? (topText > 0.04 ? 'top' : 'none') : bottomText > 0.04 ? 'bottom' : 'none';
  const edges = []; for (let y = 0; y < h; y++) { let e = 0; for (let x = 1; x < w; x++) if (Math.abs(lum(d, at(x, y)) - lum(d, at(x - 1, y))) > 40) e++; edges.push(e / w); }
  // Type that touches the UI block merges into it: fall back to the busiest edge band at the very top or bottom.
  if (captionAt === 'none') {
    const rows = (a, b) => { let e = 0; for (let y = Math.floor(a * h); y < Math.floor(b * h); y++) e += edges[y]; return e / Math.max(1, Math.floor(b * h) - Math.floor(a * h)); };
    const t = rows(0.03, 0.17), bo = rows(0.83, 0.97);
    if (Math.max(t, bo) > 0.06) captionAt = t >= bo ? 'top' : 'bottom';
  }
  // Text area outside the UI block (Play: "taglines should not take up more than 20% of the image"): rows with type,
  // each counted by the width its type spans.
  let textArea = 0;
  for (let y = 0; y < h; y++) {
    const gy = Math.floor(y / B);
    if (ui && gy >= ui.y0 && gy <= ui.y1) continue;
    if (edges[y] < 0.04) continue;
    let x0 = -1, x1 = -1;
    for (let x = 1; x < w; x++) if (Math.abs(lum(d, at(x, y)) - lum(d, at(x - 1, y))) > 40) { if (x0 < 0) x0 = x; x1 = x; }
    if (x0 >= 0) textArea += (x1 - x0) / w;
  }
  const textShare = r2(textArea / h);
  const captionShare = r2(captionAt === 'top' ? Math.max(uiTop, 0.15) : captionAt === 'bottom' ? Math.max(1 - uiBottom, 0.15) : 0);
  // Palette and accent (most vivid colour with a real share).
  const palette = dominantColors(img, { max: 6 });
  const accent = [...palette].filter((c) => c.share > 0.008 && c.saturation > 0.35 && c.lightness > 0.2 && c.lightness < 0.85).sort((a, b) => b.saturation * Math.sqrt(b.share) - a.saturation * Math.sqrt(a.share))[0]?.hex || null;
  return {
    file, width: img.source.width, height: img.source.height, aspect: r2(img.source.width / img.source.height),
    tone: mean < 0.42 ? 'dark' : 'light', brightness: r2(mean), background, bgColor, bgHue: Math.round(toHsl(bgColor).h),
    accent, accentHue: accent ? Math.round(toHsl(accent).h) : null, palette: palette.map((c) => c.hex),
    uiShare, fullBleed, devices: fullBleed ? 1 : Math.max(0, Math.min(3, runs)), uiTop: r2(uiTop), uiBottom: r2(uiBottom),
    captionAt, captionShare, textShare, textDensity: r2((edges.reduce((a, b) => a + b, 0) / h) * 10),
    edgeL: edgeColumn(img, 1), edgeR: edgeColumn(img, w - 2),
  };
}

/** A column of the image as 24 luminance samples (to test continuity between neighbouring shots). */
function edgeColumn(img, x) {
  const out = [];
  for (let k = 0; k < 24; k++) { const y = Math.floor(((k + 0.5) / 24) * img.height); out.push(Math.round(lum(img.data, (y * img.width + x) * 4))); }
  return out;
}

/** Traits of a set (in order): per shot, plus what the set does as a whole. */
export function setTraits(files) {
  const shots = files.map((f) => traits(f));
  const n = shots.length || 1;
  const share = (pred) => r2(shots.filter(pred).length / n);
  const mode = (key) => { const c = {}; for (const s of shots) c[s[key]] = (c[s[key]] || 0) + 1; return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null; };
  // Panorama: the right edge of one shot continues into the left edge of the next.
  let joins = 0;
  for (let i = 0; i + 1 < shots.length; i++) {
    const a = shots[i].edgeR, b = shots[i + 1].edgeL;
    const diff = a.reduce((s, v, k) => s + Math.abs(v - b[k]), 0) / a.length;
    const varA = Math.max(...a) - Math.min(...a);
    if (diff < 10 && varA > 25) joins++;
  }
  const hues = shots.map((s) => s.accentHue).filter((x) => x !== null);
  return {
    count: shots.length,
    tone: share((s) => s.tone === 'dark') >= 0.5 ? 'dark' : 'light', darkShare: share((s) => s.tone === 'dark'),
    background: mode('background'), captionAt: mode('captionAt'), fullBleedShare: share((s) => s.fullBleed),
    uiShare: r2(shots.reduce((a, s) => a + s.uiShare, 0) / n), captionShare: r2(shots.reduce((a, s) => a + s.captionShare, 0) / n),
    multiDevice: share((s) => s.devices > 1), panorama: shots.length > 1 && joins >= Math.max(1, Math.floor((shots.length - 1) / 2)),
    sameBackground: shots.length > 1 && new Set(shots.map((s) => s.bgColor)).size === 1,
    accentHue: hues.length ? circularMean(hues) : null, accents: [...new Set(shots.map((s) => s.accent).filter(Boolean))].slice(0, 4),
    bgColors: [...new Set(shots.map((s) => s.bgColor))].slice(0, 6),
    shots: shots.map(({ edgeL, edgeR, ...rest }) => rest),
  };
}

export function circularMean(hues) {
  let x = 0, y = 0;
  for (const h of hues) { x += Math.cos((h * Math.PI) / 180); y += Math.sin((h * Math.PI) / 180); }
  return Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
}

export const hueDist = (a, b) => (a == null || b == null ? 90 : Math.min(Math.abs(a - b), 360 - Math.abs(a - b)));

/** One line in words, for reasons and boards. */
export function describe(t) {
  const caption = { top: 'caption on top', bottom: 'caption at the bottom', 'top-overlay': 'caption over the screen (top)', 'bottom-overlay': 'caption over the screen (bottom)', none: 'little or no caption' }[t.captionAt] || '';
  const dev = t.fullBleed || t.fullBleedShare > 0.5 ? 'full-bleed screens' : (t.multiDevice ?? (t.devices > 1 ? 1 : 0)) > 0.5 ? 'several devices side by side' : `UI fills ${Math.round((t.uiShare || 0) * 100)} %`;
  return [t.tone, `${t.background} background`, dev, caption, t.panorama ? 'one panorama across shots' : '', t.accents?.length ? `accent ${t.accents[0]}` : t.accent ? `accent ${t.accent}` : ''].filter(Boolean).join(', ');
}

export { luminance };
