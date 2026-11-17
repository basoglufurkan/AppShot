// App Store app preview video (15–30 s, plays first, before the screenshots, autoplays muted).
// storyboard(): scenes in screenshot order (hook first, same captions). Each scene plays real footage full-bleed —
// a screen recording from raw/<locale>/clips/<screen>.mp4 (its liveliest window, starting on a full frame), else the
// capture — under a camera that eases in on localised action (engine/lib/footage.mjs), with the caption as kinetic
// type on a soft scrim. Timing keeps every caption readable and Apple's default poster frame (5 s) on a finished
// caption. Short dissolves, an end frame with icon, name and the purchase disclosure Apple asks for.
// renderPreview(): poses every frame in Chrome (window.__appshot.preview.pose(t)), adds 180° motion blur where the
// camera or the type moves, and pipes it into ffmpeg — H.264 High (level 4.0), 10 Mbps, 30 fps, stereo 256 kbps AAC.

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ENGINE_DIR, readJson, exists, ensureDir, fileUrl, L } from './lib/util.mjs';
import { compose, sizeSpec } from './compose.mjs';
import { defaultDisclaimer } from './lib/disclaimers.mjs';
import { readPngInfo } from './lib/png.mjs';
import { analyzeMedia, bestWindow, cameraPath, captionPlacement, snapTaps, spotlightRect, readTaps } from './lib/footage.mjs';
import { promoLayout } from './templates/preview-frame.mjs';
import { detectBeats, snapCuts } from './lib/beats.mjs';
import { cueSheet, mixFilter } from './lib/sfx.mjs';
import { motionQA, audioQA } from './lib/motionqa.mjs';

export const LIMITS = readJson(path.join(ENGINE_DIR, 'sizes.json')).limits.preview;
const CLIP_EXT = ['.mp4', '.mov', '.m4v'];
// Layouts whose shot has no app screen worth filming.
const NO_UI = ['text-hero', 'review-quote', 'social-proof'];
const words = (s) => String(s || '').replace(/\*\*|_/g, '').trim().split(/\s+/).filter(Boolean).length;
const r2 = (v) => Math.round(v * 100) / 100;

/** "raw/{locale}/today.png" → the first file that exists for this locale (locale, language, unlocalised). */
export function localized(ws, p, locale) {
  if (!p || typeof p !== 'string') return null;
  if (path.isAbsolute(p)) return exists(p) ? p : null;
  const lang = String(locale).split('-')[0];
  const cands = p.includes('{locale}') ? [p.replace('{locale}', locale), p.replace('{locale}', lang), p.replace('/{locale}', '').replace('{locale}/', '')] : [p];
  for (const c of cands) { const abs = path.resolve(ws, c); if (exists(abs)) return abs; }
  return null;
}

const refOf = (shot, kind) => {
  let r = shot?.screen ?? shot?.screens?.[0];
  if (r && typeof r === 'object') r = r[kind] || r.phone || Object.values(r)[0];
  return typeof r === 'string' ? r : null;
};

/**
 * Screen recording for a capture: raw/<locale>/clips/<name>.mp4, then raw/<lang>/clips, then raw/clips.
 * A localised capture (raw/pt-BR/x.png) never falls back to the unlocalised clips: the footage would show another
 * language than the screenshots that follow it.
 */
export function findClip(ws, ref, still, locale) {
  const name = path.basename(ref || still || '').replace(/\.\w+$/, '');
  if (!name) return null;
  const lang = String(locale).split('-')[0];
  const parts = still ? path.relative(ws, still).split(path.sep) : [];
  const localisedStill = parts.includes(locale) || parts.includes(lang);
  const dirs = [still && path.join(path.dirname(still), 'clips'), path.join(ws, 'raw', locale, 'clips'), path.join(ws, 'raw', lang, 'clips'), !localisedStill && path.join(ws, 'raw', 'clips')].filter(Boolean);
  for (const d of dirs) for (const ext of CLIP_EXT) { const f = path.join(d, name + ext); if (exists(f)) return f; }
  return null;
}

/** Duration / size / fps of any video (ffprobe), with the audio stream when there is one. */
export function probeMedia(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,profile,level,width,height,r_frame_rate,bit_rate,channels,sample_rate:format=duration,size,bit_rate', '-of', 'json', file], { encoding: 'utf8' });
  if (r.status !== 0) return null;
  const j = JSON.parse(r.stdout);
  const v = (j.streams || []).find((s) => s.codec_type === 'video') || {};
  const a = (j.streams || []).find((s) => s.codec_type === 'audio') || null;
  const [n, d] = String(v.r_frame_rate || '0/1').split('/').map(Number);
  return {
    width: v.width, height: v.height, fps: d ? n / d : 0, codec: v.codec_name, profile: v.profile, level: v.level, videoKbps: Number(v.bit_rate || 0) / 1000,
    duration: Number(j.format?.duration || 0), bytes: Number(j.format?.size || 0), kbps: Number(j.format?.bit_rate || 0) / 1000,
    audio: a ? { codec: a.codec_name, channels: a.channels, rate: Number(a.sample_rate), kbps: Number(a.bit_rate || 0) / 1000 } : null,
  };
}

/** Canvas for a preview size in an orientation. */
export function previewSize(sizeId, orientation = 'portrait') {
  const size = sizeSpec(sizeId);
  const land = orientation === 'landscape' || !size.landscape && size.width > size.height;
  const [W, H] = land && size.landscape ? size.landscape : [size.width, size.height];
  return { ...size, width: W, height: H, orientation: W > H ? 'landscape' : 'portrait' };
}


const plainText = (s) => String(s || '').replace(/\*\*|_/g, '').replace(/\s+/g, ' ').trim();
const r3 = (v) => Math.round(v * 1000) / 1000;

/**
 * Decide the preview: scenes in screenshot order (hook first, same captions), the liveliest window of each recording,
 * a camera path per scene, caption side and tone, and timing that leaves every caption on screen long enough to read
 * and keeps Apple's default poster frame (5 s) on a finished caption.
 * @returns {{ W, H, size, kind, style, xf, timeline, duration, poster, posterHint, disclaimer, tagline, end, reasons, warnings }}
 */
export function storyboard({ plan, profile, ws, locale, sizeId, orientation, music }) {
  const cfg = plan.preview || {};
  const size = previewSize(sizeId, orientation || cfg.orientation);
  const W = size.width, H = size.height;
  const kind = size.kind === 'tablet' ? 'tablet' : 'phone';
  const style = cfg.style === 'framed' ? 'framed' : cfg.style === 'promo' || size.promo ? 'promo' : 'store';
  const xf = cfg.crossfade ?? (style === 'framed' ? 0.5 : style === 'promo' ? 0.6 : 0.33);
  const zMax = Math.min(1.4, cfg.maxZoom ?? 1.3);
  const cacheRoot = ensureDir(path.join(ws, '.cache', 'preview'));
  const reasons = [], warnings = [];
  const shots = plan.shots || [];
  const byRef = (r) => (typeof r === 'number' ? shots[r] : shots.find((s) => s.id === r) || shots[Number(r) - 1]);
  if (style === 'framed') warnings.push('style "framed" puts a frame around the footage — Apple has rejected app previews for that (forum threads 797679, 799983); use it for promo videos, not the App Store');

  let list;
  if (cfg.segments?.length) {
    list = cfg.segments.map((seg) => ({ seg, shot: seg.shot !== undefined ? byRef(seg.shot) || {} : {} }));
    reasons.push(`Story: ${list.length} scene(s) set in plan.preview.segments.`);
  } else {
    const seen = new Set();
    list = shots.filter((s) => !NO_UI.includes(s.layout) && refOf(s, kind))
      .filter((s) => { const r = refOf(s, kind); if (seen.has(r)) return false; seen.add(r); return true; })
      .slice(0, cfg.count || 5).map((shot) => ({ seg: (cfg.shots || {})[shot.id] || {}, shot }));
    reasons.push(`Story: the first ${list.length} screenshots in order, hook first — the preview plays before them, so it opens on the same promise with the same captions.`);
  }
  if (!list.length) throw new Error('No app screens to show — add captures to appshot/raw (or list plan.preview.segments).');
  if (list.length < 3) warnings.push(`only ${list.length} distinct screen(s) — capture or record more screens for a fuller story (3–5 is the sweet spot)`);

  // ---- footage per scene ----
  const scenes = list.map(({ seg, shot }, i) => {
    const ref = seg.screen || refOf(shot, kind);
    const still = localized(ws, ref, locale);
    let clip = seg.clip ? localized(ws, seg.clip, locale) : findClip(ws, ref, still, locale);
    if (seg.clip && !clip) warnings.push(`scene ${i + 1}: clip "${seg.clip}" not found`);
    let caption = seg.caption === false || cfg.captions === false ? '' : L(seg.caption ?? shot.headline, locale, plan.defaultLocale) || '';
    if (words(caption) > 7) {
      const alt = ((shot.alternatives || {})[locale] || []).filter((a) => words(a) <= 6).sort((a, b) => words(a) - words(b))[0];
      if (alt) caption = alt;
      else warnings.push(`scene ${i + 1}: caption has ${words(caption)} words — keep preview copy short so it can be read in time`);
    }
    let info = clip ? probeMedia(clip) : null;
    if (clip && !info) warnings.push(`scene ${i + 1}: cannot read ${path.basename(clip)} (ffprobe)`);
    let stillAspect = null;
    if (still) { try { const p = readPngInfo(still); stillAspect = p.width / p.height; } catch {} }
    // Footage must be the same device class as the capture it replaces (no phone recording over an iPad capture).
    const cls = (a) => (a == null ? null : a < 0.62 || a > 1.6 ? 'phone' : 'tablet');
    if (info?.width && !seg.clip && cls(info.width / info.height) !== (cls(stillAspect) || kind)) {
      reasons.push(`scene ${i + 1}: ${path.relative(ws, clip)} is ${cls(info.width / info.height)} footage, the capture is not — the still stays.`);
      info = null;
    }
    if (!info) clip = null;
    const media = clip || still;
    const an = media ? analyzeMedia(media, cacheRoot) : null;
    // Taps (from <clip>.taps.json, live-logged while recording, or inline) snapped to the screen's reaction.
    const taps = clip ? snapTaps(an, seg.taps || readTaps(clip)) : [];
    // Effects on the caption: numbers roll in (odometer) unless turned off; "decode" scrambles then locks the letters
    // (Latin scripts only — glyph soup reads as noise in Devanagari, Arabic or CJK).
    let effect = seg.effect ?? cfg.effect ?? null;
    if (effect === 'decode' && !/^[\u0000-\u024F\u2000-\u206F\s]*$/.test(plainText(caption))) { reasons.push(`scene ${i + 1}: "decode" needs a Latin-script caption — the words rise instead.`); effect = null; }
    const numbers = cfg.effects !== false && effect !== 'decode' && effect !== 'none' && /[0-9]/.test(plainText(caption));
    return { i, id: shot.id || `seg${i + 1}`, caption, ref, still, clip, an, seg, taps, effect, numbers, aspect: info?.width ? info.width / info.height : stillAspect || (kind === 'tablet' ? 0.75 : 0.46), missing: !media };
  });

  // ---- variant B (for Product Page Optimization): open on the strongest moment instead of the screenshot hook ----
  if (cfg.variant === 'b' && scenes.length > 2) {
    const strength = (s) => (s.taps.length ? 2 : 0) + (s.an && !s.an.image && s.an.frames.length ? (s.an.frames.reduce((a, f) => a + f.act, 0) / s.an.frames.length) * 40 : 0);
    let bi = 1;
    for (let k = 2; k < scenes.length; k++) if (strength(scenes[k]) > strength(scenes[bi])) bi = k;
    const [lead] = scenes.splice(bi, 1);
    scenes.unshift(lead);
    scenes.forEach((s, k) => (s.i = k));
    reasons.push(`Variant B (action first): opens on "${plainText(lead.caption)}" — the scene with the ${lead.taps.length ? 'tap and the most motion' : 'most motion'}; the screenshot hook follows. Test it against A with Product Page Optimization.`);
  }
  // ---- variant C (payoff first): open on the fullest, most finished screen — the result the app gives you ----
  if (cfg.variant === 'c' && scenes.length > 2) {
    const fullness = (s) => (s.an?.frames.length ? Math.max(...s.an.frames.map((f) => f.rich)) : 0) + (s.clip ? 4 : 0);
    let bi = 1;
    for (let k = 2; k < scenes.length; k++) if (fullness(scenes[k]) > fullness(scenes[bi])) bi = k;
    const [lead] = scenes.splice(bi, 1);
    scenes.unshift(lead);
    scenes.forEach((s, k) => (s.i = k));
    reasons.push(`Variant C (payoff first): opens on "${plainText(lead.caption)}" — the fullest, most finished screen (the result the app gives); the screenshot hook follows. A third Product Page Optimization treatment.`);
  }

  // ---- timing: hook ~3 s, then ~2.8 s scenes; every caption readable; 15–30 s; poster at 5 s on a finished caption ----
  const endMode = cfg.end ?? (cfg.endCard === false ? 'none' : 'brand');
  const endLen = endMode === 'none' ? 0 : cfg.endDuration ?? 2.2;
  const read = (c) => (c ? 0.5 + plainText(c).length / 17 : 0); // reveal + characters at ~17 per second
  const EXIT = 0.35, CAP_IN = 0.12;
  for (const s of scenes) {
    const base = s.i === 0 ? cfg.hook ?? 3.2 : cfg.segment ?? 2.8;
    const need = s.caption ? (s.i === 0 ? 0.2 : CAP_IN) + read(s.caption) + EXIT + xf : 1.6;
    s.len = Math.max(base, need, 1.6);
  }
  const total = () => scenes.reduce((a, s) => a + s.len, 0) + endLen - xf * (scenes.length + (endLen ? 1 : 0) - 1);
  const minT = LIMITS.minSec + 0.4, maxT = Math.min(cfg.maxDuration ?? LIMITS.maxSec, LIMITS.maxSec) - 0.4;
  while (total() > maxT && scenes.length > 1) { const d = scenes.pop(); warnings.push(`dropped "${d.id}" to stay under ${LIMITS.maxSec} s`); }
  if (total() < minT) {
    // Longer scenes where there is footage left to show first, then evenly.
    let need = minT - total();
    for (const s of scenes) if (s.clip && s.an) { const spare = Math.max(0, Math.min(s.an.duration - s.len, 1.2)); const add = Math.min(spare, need); s.len += add; need -= add; }
    if (need > 0) scenes.forEach((s) => (s.len += need / scenes.length));
  }
  const starts = () => { let t = 0; return scenes.map((s) => { const st = t; t += s.len - xf; return st; }); };
  const poster = cfg.poster ?? LIMITS.posterDefaultSec;
  for (let pass = 0; pass < 4; pass++) {
    const st = starts();
    const k = scenes.findIndex((s, j) => st[j] <= poster && poster < st[j] + s.len - xf);
    if (k < 0) break;
    const s = scenes[k], start = st[k];
    const revealDone = start + (k === 0 ? 0 : CAP_IN + 0.55 + 0.06 * words(s.caption));
    const exitStart = start + s.len - xf - EXIT;
    if (revealDone > poster - 0.1 && k > 0) scenes[k - 1].len += revealDone - poster + 0.15 + xf;
    else if (exitStart < poster + 0.15) s.len += poster + 0.15 - exitStart;
    else break;
  }
  // Music: every cut (and the end frame) lands on a beat, as long as each caption keeps its reading time.
  let beatInfo = null;
  if (music) {
    try {
      beatInfo = detectBeats(music, { from: Number(cfg.musicStart || 0), seconds: 45, cacheRoot });
      if (beatInfo.confidence >= 0.3) {
        const need = (s) => Math.max(1.6, s.caption ? (s.i === 0 ? 0.2 : CAP_IN) + read(s.caption) + EXIT + xf : 1.6);
        const list2 = [...scenes.map((s) => ({ len: s.len, need: need(s) })), ...(endLen ? [{ len: endLen, need: endLen }] : [])];
        const lens = snapCuts(list2, beatInfo.beats, xf);
        scenes.forEach((s, k) => (s.len = lens[k]));
        // Still too short for Apple: stretch the last scene by whole beats.
        let guard = 0;
        while (total() < minT && guard++ < 16) scenes[scenes.length - 1].len += beatInfo.period;
        reasons.push(`Music: ${beatInfo.bpm} BPM (confidence ${beatInfo.confidence}) — cuts snapped to the beat${cfg.musicStart ? `, track from ${cfg.musicStart} s` : ''}.`);
      } else reasons.push(`Music: no steady beat found (confidence ${beatInfo.confidence}) — cuts keep their reading-time timing.`);
    } catch (e) { warnings.push(`music: ${e.message}`); }
  }
  if (total() > maxT) warnings.push(`total ${total().toFixed(1)} s is over ${LIMITS.maxSec} s — shorten captions or drop a scene`);

  // ---- per-scene window, camera, caption placement ----
  const st = starts();
  const timeline = scenes.map((s, k) => {
    let win = { start: 0, len: s.len, why: 'still' };
    if (s.clip && s.an) {
      const from = s.seg.start !== undefined ? Number(s.seg.start) : undefined, to = s.seg.end !== undefined ? Number(s.seg.end) : undefined;
      win = bestWindow(s.an, s.len, { from, to, taps: s.taps });
      // Frame 0 is the autoplay start and the thumbnail: full AND already moving. If the opening window idles for
      // its first second, start it just before the first change (still on a full frame, still inside the clip).
      if (k === 0 && s.seg.start === undefined) {
        const maxRich = Math.max(1, ...s.an.frames.map((f) => f.rich));
        const move = s.an.frames.find((f) => f.t >= win.start && f.act > 0.004);
        const shift = move ? Math.max(win.start, move.t - 0.4) : win.start;
        const fr = s.an.frames.reduce((a, f) => (Math.abs(f.t - shift) < Math.abs(a.t - shift) ? f : a), s.an.frames[0]);
        if (move && move.t - win.start > 0.9 && shift + s.len <= s.an.duration + 0.05 && fr.rich / maxRich >= 0.75) {
          reasons.push(`hook: the clip idles for ${(move.t - win.start).toFixed(1)} s — it now starts at ${shift.toFixed(1)} s so frame 0 is already moving.`);
          win = { ...win, start: r3(shift), why: `${win.why}, moved to open on motion` };
        }
      }
    }
    const cam = s.an ? cameraPath(s.an, win, s.len, { zMax, mode: cfg.camera || 'auto', focus: s.seg.focus, taps: s.taps }) : { keys: [[1, 0.5, 0.5]], maxZoom: 1, focusY: 0.5 };
    const place = s.an ? captionPlacement(s.an, win, cam, s.seg.captionAt || cfg.captionAt) : { at: 'top', tone: 'dark' };
    // Taps inside the window, in scene time; touch hotspots are allowed by Apple ("graphic elements, such as touch hotspots").
    const shown = cfg.touches === false ? [] : s.taps.filter((t) => t.t >= win.start + 0.05 && t.t <= win.start + Math.min(win.len, s.len) - 0.3).map((t) => ({ ...t, t: r3(t.t - win.start) }));
    // Spotlight: a hand-set rect, or "auto" (the most concentrated change), dimming the rest for ≤ 1.6 s.
    const want = s.seg.spotlight ?? (cfg.spotlight === 'auto' ? 'auto' : null);
    let spot = null;
    // With a tap in the scene, "auto" lights the band around the tapped control just before the press.
    const tapBand = shown.length ? [0.04, r3(Math.max(0.06, Math.min(0.86, shown[0].y - 0.05))), 0.92, 0.1] : null;
    const rect = Array.isArray(want) ? want : want === 'auto' ? tapBand || (s.an ? spotlightRect(s.an, win) : null) : null;
    if (rect) {
      const tIn = shown.length ? Math.max(0.25, shown[0].t - 1.0) : Math.max(0.4, (k === 0 ? 0.2 : CAP_IN) + 0.7);
      const tOut = Math.min(tIn + 1.6, s.len - xf - 0.45, shown.length ? shown[0].t + 0.35 : Infinity);
      if (tOut - tIn >= 0.8) spot = { r: rect, in: r3(tIn), out: r3(tOut) };
    }
    return {
      ...s, an: undefined, kind: s.clip ? 'clip' : 'still', start: r3(st[k]), len: r3(s.len), fadeIn: k ? xf : 0, win, cam, at: place.at, tone: place.tone,
      capIn: style === 'promo' ? (k === 0 ? 0.3 : 0.32) : k === 0 ? -1 : CAP_IN, capOut: r3(s.len - xf - EXIT), touches: shown, spot,
    };
  });
  const lastScene = timeline[timeline.length - 1];
  if (endLen) timeline.push({ i: timeline.length, id: 'end', kind: 'end', start: r3(lastScene.start + lastScene.len - xf), len: r3(endLen), fadeIn: xf, caption: '', tone: lastScene.tone, endMode });
  const last = timeline[timeline.length - 1];
  const duration = r3(last.start + last.len);

  let disclaimer = cfg.disclaimer === false ? '' : L(cfg.disclaimer, locale, plan.defaultLocale) || '';
  if (!disclaimer && cfg.disclaimer !== false) {
    disclaimer = defaultDisclaimer(profile, locale);
    if (disclaimer) reasons.push(`End frame discloses "${disclaimer}" — the scan found ${profile?.monetization?.subscriptions ? 'subscriptions' : 'in-app purchases'} and Apple asks previews to say so. Confirm the wording or set plan.preview.disclaimer.`);
  }
  if (!endLen && disclaimer) warnings.push('end: "none" drops the purchase disclosure — show it in the footage instead');
  // End-card tagline in the viewer's language only: an English subtitle on a Hindi end card reads as unfinished. Without
  // a translation the card restates the screenshot hook, which every locale has.
  const lang = String(locale).split('-')[0];
  const own = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v[locale] ?? v[Object.keys(v).find((k) => k.split('-')[0] === lang)] : v) || '';
  let tagline = plainText(own(cfg.tagline) || own(plan.app?.subtitle));
  if (!tagline && (cfg.tagline || plan.app?.subtitle)) {
    tagline = plainText(own(list[0].shot?.headline));
    reasons.push(tagline ? `End frame tagline: the plan has no ${locale} subtitle, so it restates the hook "${tagline}" — set plan.preview.tagline.${locale} to change it.` : `End frame: no ${locale} tagline, name only — set plan.preview.tagline.${locale}.`);
  }
  const cta = style === 'promo' ? L(cfg.cta, locale, plan.defaultLocale) || '' : '';

  for (const s of timeline) {
    if (s.kind === 'end') continue;
    const src = s.clip ? `recording ${path.relative(ws, s.clip)} (${s.win.why})` : s.still ? `still ${path.relative(ws, s.still)}` : 'PLACEHOLDER (no capture)';
    const cam = s.cam.push || s.kind === 'still' ? 'slow push (no localised action)' : s.cam.maxZoom > 1.04 ? `camera eases to ${s.cam.maxZoom.toFixed(2)}× on the action` : 'camera stays wide';
    const extra = [s.touches?.length ? `${s.touches.length} touch hotspot${s.touches.length > 1 ? 's' : ''}${s.touches.some((t) => t.snapped) ? ' (snapped to the reaction)' : ''}` : '', s.spot ? `spotlight ${s.spot.in.toFixed(1)}–${s.spot.out.toFixed(1)} s` : ''].filter(Boolean).join(', ');
    const capWhere = style === 'promo' ? (W > H * 1.3 ? 'caption beside the device' : 'caption above the device') : `caption ${s.at}, ${s.tone} scrim`;
    reasons.push(`${fmt(s.start)}–${fmt(s.start + s.len)} ${s.i === 0 ? 'hook' : `scene ${s.i + 1}`}: "${plainText(s.caption)}" — ${src}; ${cam}${extra ? `; ${extra}` : ''}; ${capWhere}.`);
  }
  if (endLen) reasons.push(`${fmt(last.start)}–${fmt(duration)} end frame (${endMode}): ${style === 'promo' ? 'the brand background' : 'the last scene blurred'}${endMode === 'brand' ? ', icon and name' : ''}${style === 'promo' && L(cfg.cta, locale) ? ', call to action' : ''}${disclaimer ? ', disclosure' : ''}.`);
  const posterHint = timeline[0].len > 1.6 ? r3(Math.min(timeline[0].len - xf - EXIT - 0.2, 1.4)) : poster;
  if (style === 'promo') reasons.push(`${fmt(duration)} total; scenes push in on a spring (${Math.round(xf * 30)} frames), the device rises in on the first scene and floats in 3D.`);
  else reasons.push(`${fmt(duration)} total; cuts are ${Math.round(xf * 30)}-frame dissolves (Apple: "straightforward transitions, like dissolves and fades"); full-bleed footage, no frame (Apple rejects framing around the capture). Poster: Apple's default 5 s lands on a finished caption; ${fmt(posterHint)} (the hook) is the strongest pick.`);
  const stills = timeline.filter((s) => s.kind === 'still');
  const recName = stills.length ? path.basename(stills[0].ref || stills[0].id).replace(/\.\w+$/, '') : '';
  if (stills.length && style === 'promo') warnings.push(`${stills.length} scene(s) use still captures — recordings make a livelier promo: node scripts/preview.mjs record --name ${recName}`);
  else if (stills.length) warnings.push(`${stills.length} of ${timeline.length - (endLen ? 1 : 0)} scene(s) use still captures. Apple: previews use footage captured on device (guideline 2.3.4) — record them: node scripts/preview.mjs record --name ${recName}`);
  for (const s of timeline) if (s.missing) warnings.push(`scene ${s.i + 1}: no capture for "${s.ref}" — placeholder`);
  if (kind === 'tablet' && timeline.some((s) => s.aspect && s.aspect < 0.62)) warnings.push('phone captures in an iPad preview — capture the iPad app for this size');
  if (style === 'promo') reasons.push('Promo mode: device frame floating in 3D over the brand background and the app\'s key-art scene, scenes push in sideways — for social, YouTube and the Play promo video, not for App Store previews.');
  return { W, H, size, kind, style, xf, zMax, timeline, duration, poster, posterHint, disclaimer, tagline, cta, end: endMode, beats: beatInfo, reasons, warnings };
}

const fmt = (s) => { const d = Math.round(s * 10); return `${Math.floor(d / 600)}:${String(Math.floor((d % 600) / 10)).padStart(2, '0')}${d % 10 ? `.${d % 10}` : ''}`; };
const even = (v) => Math.max(2, Math.round(v / 2) * 2);

/** Decode a clip window into JPEG frames sized for the camera's deepest zoom (cached), so every frame is exact. */
function clipFrames({ clip, from, len, w, h, fps, cacheRoot }) {
  const st = fs.statSync(clip);
  const key = crypto.createHash('sha1').update([clip, st.size, st.mtimeMs, from, len, w, h, fps, 'v2'].join('|')).digest('hex').slice(0, 16);
  const dir = ensureDir(path.join(cacheRoot, key));
  if (!exists(path.join(dir, 'done'))) {
    const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(from), '-t', String(len), '-i', clip,
      '-vf', `fps=${fps},scale=${w}:${h}:force_original_aspect_ratio=increase:flags=lanczos,crop=${w}:${h}:(iw-${w})/2:0`, '-q:v', '2', path.join(dir, '%05d.jpg')], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error(`ffmpeg could not decode ${clip}: ${r.stderr.slice(-400)}`);
    fs.writeFileSync(path.join(dir, 'done'), '');
  }
  const n = fs.readdirSync(dir).filter((f) => f.endsWith('.jpg')).length;
  return { n, dir, base: fileUrl(dir) + '/', first: path.join(dir, '00001.jpg'), last: path.join(dir, `${String(n).padStart(5, '0')}.jpg`) };
}

// In-page timeline. pose(t, clipT) poses every scene at time t (clip frames at clipT, so motion-blur sub-frames move
// the camera and the type but never ghost the footage) and returns how far anything moved in px since t − 1/30 s.
const PREVIEW_SCRIPT = `
(function(){
  const P = window.__PREVIEW;
  const slots = [...document.querySelectorAll('.slot')];
  slots.forEach((s, i) => { s.style.left = '0px'; s.style.zIndex = String(i + 1); s.style.opacity = '0'; s.style.visibility = 'hidden'; });
  const cl = (v) => Math.max(0, Math.min(1, v));
  const sm = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  // Apple-style spring by perceptual duration T and bounce (WWDC23 "Animate with springs").
  const spring = (t, T, b) => { if (t <= 0) return 0; const w0 = 2 * Math.PI / T, z = 1 - b; if (z >= 1) return 1 - (1 + w0 * t) * Math.exp(-w0 * t); const wd = w0 * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t)); };
  // Motion laws measured frame by frame on hand-animated reference reels (60 fps): an entrance keeps 0.81 of its
  // remaining distance every frame (no overshoot; 90 % there in ~0.19 s, whatever the duration), an exit grows ×1.45
  // a frame (accelerating out at full opacity), and blur is its own timeline — held ~11 frames, released over ~20,
  // so it clears after the move has landed (that is what makes an entrance feel heavy). Siblings never arrive
  // together: one rhythm per group.
  const K_IN = -Math.log(0.81) * 60, K_OUT = Math.log(1.45) * 60, STAGGER = 4 / 60;
  const arrive = (t, d) => (t <= 0 ? 0 : t >= d ? 1 : (1 - Math.exp(-K_IN * t)) / (1 - Math.exp(-K_IN * d)));
  const leave = (t, d) => (t <= 0 ? 0 : t >= d ? 1 : (Math.exp(K_OUT * t) - 1) / (Math.exp(K_OUT * d) - 1));
  const blurHold = (t, hold = 11 / 60, rel = 20 / 60) => (t < 0 ? 0 : t < hold ? 1 : 1 - cl((t - hold) / rel));
  // Badges, icons, avatars: scale up with a small overshoot.
  const backOut = (x) => { const c1 = 1.6, c3 = c1 + 1; x = cl(x); return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const expOut = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * cl(x)));
  const rnd = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
  // Kinetic type: every word in its own mask; highlights move onto the words so every style survives the split.
  function split(root) {
    // A highlighted phrase moves as one unit, so pills and markers stay one continuous shape.
    root.querySelectorAll('.hl').forEach((h) => {
      const w = document.createElement('span'); w.className = 'kw';
      const inner = document.createElement('span'); inner.className = 'kw-in hl';
      while (h.firstChild) inner.appendChild(h.firstChild);
      w.appendChild(inner); h.replaceWith(w);
    });
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = []; while (walker.nextNode()) if (!walker.currentNode.parentElement.closest('.kw-in')) nodes.push(walker.currentNode);
    for (const tn of nodes) {
      const hl = false;
      const frag = document.createDocumentFragment();
      for (const part of tn.nodeValue.split(/(\\s+)/)) {
        if (!part) continue;
        if (/^\\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); continue; }
        const w = document.createElement('span'); w.className = 'kw';
        const inner = document.createElement('span'); inner.className = 'kw-in' + (hl ? ' hl' : ''); inner.textContent = part;
        w.appendChild(inner); frag.appendChild(w);
      }
      tn.parentNode.replaceChild(frag, tn);
    }
  }
  const css = document.createElement('style');
  css.textContent = '.kw{display:inline-block;overflow:hidden;vertical-align:bottom;padding:.14em .22em .2em;margin:-.14em -.22em -.2em}.kw-in{display:inline-block}'
    + '.od{display:inline-block;overflow:hidden;vertical-align:top}.od-in{display:block}.od-in>span{display:block;text-align:center}.dc{display:inline-block;text-align:center}';
  document.head.appendChild(css);
  // ---- effects (each a pure function of the time, so a still and the video always agree) ----
  // Odometer: every digit of a number in the caption is a column 0-9 that rolls into place, the rightmost settling
  // first, higher digits travelling further. Built lazily (fonts must be laid out to measure the line).
  function buildOdometers(q) {
    if (q.odo) return q.odo;
    q.odo = [];
    q.words.forEach((w, j) => {
      if (!/[0-9]/.test(w.textContent)) return;
      const H = w.getBoundingClientRect().height / (q.scale || 1) || 0;
      if (!H) return;
      const walker = document.createTreeWalker(w, NodeFilter.SHOW_TEXT), nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      const cols = [];
      for (const tn of nodes) {
        const frag = document.createDocumentFragment();
        for (const ch of tn.nodeValue) {
          if (!/[0-9]/.test(ch)) { frag.appendChild(document.createTextNode(ch)); continue; }
          const c = document.createElement('span'); c.className = 'od'; c.style.height = H + 'px';
          const inner = document.createElement('span'); inner.className = 'od-in';
          for (let k = 0; k <= 10; k++) { const d = document.createElement('span'); d.textContent = String(k % 10); d.style.height = H + 'px'; d.style.lineHeight = H + 'px'; inner.appendChild(d); }
          c.appendChild(inner); frag.appendChild(c); cols.push({ inner, target: Number(ch), H });
        }
        tn.parentNode.replaceChild(frag, tn);
      }
      w.style.fontVariantNumeric = 'tabular-nums';
      cols.reverse().forEach((c, order) => q.odo.push({ ...c, j, order }));
    });
    return q.odo;
  }
  function odometerAt(q, local, capIn) {
    let moving = false;
    for (const c of buildOdometers(q)) {
      const t0 = local - capIn - c.j * STAGGER - c.order * 0.05;
      const p = capIn < 0 ? 1 : expOut(t0 / 0.65);
      const pos = (c.target + 10 * (1 + c.order)) * p;
      c.inner.style.transform = 'translate(0,' + (-(pos % 10) * c.H).toFixed(2) + 'px)';
      c.inner.style.filter = p > 0 && p < 1 ? 'blur(' + ((1 - p) * c.H * 0.035).toFixed(2) + 'px)' : '';
      if (p > 0 && p < 1) moving = true;
    }
    return moving;
  }
  // Decode: each character cycles through glyphs, then locks, left to right (~28 ms a character). For codes,
  // prompts, commands — Latin scripts only (glyph soup reads as noise in other scripts).
  function buildDecode(q) {
    if (q.dec) return q.dec;
    q.dec = [];
    q.words.forEach((w, wi) => {
      const walker = document.createTreeWalker(w, NodeFilter.SHOW_TEXT), nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      for (const tn of nodes) {
        const frag = document.createDocumentFragment();
        for (const ch of tn.nodeValue) {
          const s = document.createElement('span'); s.className = 'dc'; s.textContent = ch; frag.appendChild(s); q.dec.push({ s, ch, wi });
        }
        tn.parentNode.replaceChild(frag, tn);
      }
    });
    for (const d of q.dec) d.s.style.width = d.s.getBoundingClientRect().width / (q.scale || 1) + 'px';
    return q.dec;
  }
  const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=<>/';
  function decodeAt(q, local, capIn) {
    const list = buildDecode(q);
    const locked = Math.floor(((local - capIn) * 1000) / 28);
    // A word (and its highlight pill or marker) appears with its first character, not before.
    const firstOf = {};
    list.forEach((d, i) => { if (firstOf[d.wi] === undefined) firstOf[d.wi] = i; });
    q.words.forEach((w, wi) => { if (firstOf[wi] !== undefined && (local < capIn || firstOf[wi] > locked + 6)) w.style.opacity = '0'; });
    list.forEach((d, i) => {
      if (local < capIn || i > locked + 6) { d.s.style.opacity = '0'; return; }
      if (i < locked || d.ch.trim() === '') { d.s.textContent = d.ch; d.s.style.opacity = '1'; }
      else { d.s.textContent = GLYPHS[Math.floor(rnd(i, Math.floor(local * 30)) * GLYPHS.length)]; d.s.style.opacity = '.45'; }
    });
    return local >= capIn && locked < list.length + 6;
  }
  // Beam: a light that runs along the border of a rounded box (the call to action, the spotlit control).
  const SVGNS = 'http://www.w3.org/2000/svg';
  function makeBeam(host, color) {
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:5';
    const id = 'bm' + Math.random().toString(36).slice(2, 8);
    svg.innerHTML = '<defs><filter id="' + id + '" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter></defs>'
      + '<rect fill="none" stroke="' + color + '" stroke-linecap="round" opacity=".75" filter="url(#' + id + ')"/><rect fill="none" stroke="' + color + '" stroke-linecap="round"/>';
    host.appendChild(svg);
    return { svg, rects: [...svg.querySelectorAll('rect')] };
  }
  function beamAt(b, local, w, h, r, o, width) {
    if (!b) return;
    if (o <= 0 || w <= 0) { b.svg.style.opacity = '0'; return; }
    const per = 2 * (w + h) - (8 - 2 * Math.PI) * r, seg = per * 0.18, head = ((local / 2.4) % 1) * per;
    b.svg.style.opacity = o.toFixed(3);
    b.svg.setAttribute('width', w); b.svg.setAttribute('height', h);
    b.rects.forEach((rc, k) => {
      rc.setAttribute('x', 0); rc.setAttribute('y', 0); rc.setAttribute('width', w); rc.setAttribute('height', h); rc.setAttribute('rx', r);
      rc.setAttribute('stroke-width', (k ? width : width * 3).toFixed(1));
      rc.setAttribute('stroke-dasharray', seg.toFixed(1) + ' ' + (per - seg).toFixed(1)); rc.setAttribute('stroke-dashoffset', (-head).toFixed(1));
    });
  }
  const parts = slots.map((el, i) => {
    const s = P.segments[i] || {};
    const cap = el.querySelector('[data-pv=caption]');
    if (cap && s.kinetic !== false) cap.querySelectorAll('.hd').forEach(split);
    const endName = el.querySelector('[data-end=name]');
    if (endName) endName.querySelectorAll('.hd,.sh').forEach(split);
    // The footage container: the full-bleed footage layer (store) or the device's screen (promo). The camera moves a
    // wrapper inside it; spotlight and touch hotspots sit in it too (constant size) and follow the camera.
    let img = el.querySelector('[data-pv-img]'), cam = el.querySelector('.pv-cam');
    if (img && !cam) {
      cam = document.createElement('div'); cam.className = 'pv-cam';
      cam.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;transform-origin:0 0';
      img.parentNode.insertBefore(cam, img); cam.appendChild(img);
    }
    const box = cam ? cam.parentElement : el;
    const bw = box.clientWidth || P.W, bh = box.clientHeight || P.H;
    const D = bw * 0.108;
    let spot = null;
    if (s.spot) {
      spot = document.createElement('div');
      spot.style.cssText = 'position:absolute;left:0;top:0;z-index:4;opacity:0;border-radius:' + (bw * 0.035) + 'px;box-shadow:0 0 ' + (bw * 0.07) + 'px ' + (bw * 3) + 'px rgba(0,0,0,.5);pointer-events:none';
      box.appendChild(spot);
    }
    const touches = (s.touches || []).map(() => {
      const mk = (css) => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;left:0;top:0;width:' + D + 'px;height:' + D + 'px;border-radius:50%;z-index:4;opacity:0;pointer-events:none;' + css; box.appendChild(d); return d; };
      return {
        // White with a thin dark rim and shadow: reads on a white button and on a black screen alike.
        ring: mk('border:' + (D * 0.05) + 'px solid rgba(255,255,255,.95);box-sizing:border-box;box-shadow:0 0 0 ' + (D * 0.02) + 'px rgba(0,0,0,.28),inset 0 0 0 ' + (D * 0.02) + 'px rgba(0,0,0,.22)'),
        dot: mk('background:radial-gradient(circle,rgba(255,255,255,.72) 0,rgba(255,255,255,.5) 62%,rgba(255,255,255,.42) 100%);box-shadow:inset 0 0 0 ' + (D * 0.05) + 'px rgba(255,255,255,.98),0 0 0 ' + (D * 0.022) + 'px rgba(0,0,0,.32),0 ' + (D * 0.07) + 'px ' + (D * 0.3) + 'px rgba(0,0,0,.4)'),
      };
    });
    // Beams: around the spotlit control, and around the call-to-action pill on the end card.
    const spotBeam = spot && P.beam !== false ? makeBeam(spot, 'rgba(255,255,255,.95)') : null;
    const ctaPill = el.querySelector('[data-end=cta] span');
    let ctaBeam = null;
    if (ctaPill && P.beam !== false) { ctaPill.style.position = 'relative'; ctaBeam = makeBeam(ctaPill, '#ffffff'); }
    return {
      spotBeam, ctaPill, ctaBeam,
      spot, touches, D, bw, bh, stage: el.querySelector('[data-pv=stage]'), device: el.querySelector('[data-pv=device]'),
      cam, img, scrim: el.querySelector('[data-pv=scrim]'), cap,
      words: cap ? [...cap.querySelectorAll('.kw-in')] : [], icon: el.querySelector('[data-end=icon]'), name: endName,
      nameWords: endName ? [...endName.querySelectorAll('.kw-in')] : [], note: el.querySelector('[data-end=note]'), ends: [...el.querySelectorAll('[data-pv=end]')],
    };
  });
  function camAt(s, local, q) {
    const k = s.cam.k, n = k.length;
    const x = Math.max(0, Math.min(n - 1, local * 30)), a = Math.floor(x), b = Math.min(n - 1, a + 1), f = x - a;
    let z = k[a][0] + (k[b][0] - k[a][0]) * f, cx = k[a][1] + (k[b][1] - k[a][1]) * f, cy = k[a][2] + (k[b][2] - k[a][2]) * f;
    // Each new scene settles in from a hair closer: energy on the cut without implying any app behaviour.
    if (s.fadeIn && P.style !== 'promo') z *= 1 + 0.045 * (1 - spring(local, 0.8, 0));
    z = Math.max(1, z);
    const h = 0.5 / z; cx = Math.max(h, Math.min(1 - h, cx)); cy = Math.max(h, Math.min(1 - h, cy));
    return { z, tx: q.bw / 2 - cx * q.bw * z, ty: q.bh / 2 - cy * q.bh * z };
  }
  function wordsAt(list, local, capIn, capOut, still) {
    let moving = false;
    list.forEach((w, j) => {
      let y = 0, o = 1, b = 0;
      if (w.__blur === undefined) w.__blur = (parseFloat(getComputedStyle(w).fontSize) || 40) * 0.07;
      if (capIn >= 0 && !still) {
        // Arrive (0.81 law) with the blur held, then released after the word has landed.
        const t0 = local - capIn - j * STAGGER, p = arrive(t0, 0.4);
        // Type keeps a shorter blur than objects (8 + 12 frames): it has to read the moment it lands.
        y = (1 - p) * 112; o = cl(t0 / 0.1); b = blurHold(t0, 8 / 60, 12 / 60) * (1 - 0.5 * p);
        if (t0 > 0 && t0 < 0.55) moving = true;
      }
      if (capOut != null) {
        // Leave (×1.45 law): accelerating up through the mask at full opacity, gone in 12 frames.
        const t1 = local - capOut - j * 0.03, e = leave(t1, 0.2);
        y -= e * 112; o *= 1 - cl((t1 - 0.12) / 0.08);
        if (t1 > 0 && t1 < 0.25) moving = true;
      }
      w.style.transform = 'translate(0,' + y.toFixed(2) + '%)'; w.style.opacity = o.toFixed(3);
      w.style.filter = b > 0.02 ? 'blur(' + (b * w.__blur).toFixed(2) + 'px)' : '';
    });
    return moving;
  }
  const firstScene = P.segments.findIndex((s) => s.kind !== 'bg');
  // Promo: the device's 3D pose — rises in on the first scene, then floats a few degrees, never still.
  function devicePose(t, local, first) {
    // Rises in on the 0.81 law: no bounce, heavy, mostly there in a fifth of a second.
    const p = first ? arrive(local, 0.7) : 1;
    const ty = (1 - p) * P.H * 0.32 + Math.sin(2 * Math.PI * t / 5.2) * P.H * 0.004;
    const rx = (1 - p) * 18 + 3 + Math.cos(2 * Math.PI * t / 7.3) * 1.2, ry = Math.sin(2 * Math.PI * t / 6.5) * 3.2;
    return { ty, rx, ry };
  }
  async function pose(t, clipT) {
    if (clipT === undefined) clipT = t;
    const waits = []; let motion = 0;
    if (P.bgScene && window.__appshot.setTime) window.__appshot.setTime(t, P.duration);
    P.segments.forEach((s, i) => {
      const el = slots[i], q = parts[i]; if (!el) return;
      const local = t - s.start, next = P.segments[i + 1];
      if (s.kind === 'bg') { el.style.opacity = '1'; el.style.visibility = 'visible'; return; }
      const promo = P.style === 'promo' && s.kind !== 'end';
      // A scene stays until the next one has fully dissolved (or pushed) over it.
      const on = local >= 0 && (!next || t <= next.start + next.fadeIn + 0.001);
      const o = !on ? 0 : promo ? 1 : s.fadeIn ? sm(0, s.fadeIn, local) : 1;
      el.style.opacity = String(o); el.style.visibility = o > 0 ? 'visible' : 'hidden';
      if (o <= 0) return;
      if (promo && q.stage) {
        // Push: the new scene slides in from the right on a spring, the old one drifts left and fades.
        const xAt = (tt) => { let x = 0; if (i > firstScene && s.fadeIn) x += (1 - spring(tt - s.start, 0.75, 0)) * P.W * 0.95; if (next && next.kind !== 'end' && tt > next.start) x -= spring(tt - next.start, 0.75, 0) * P.W * 0.45; return x; };
        const x = xAt(t), op = next && t > next.start ? 1 - sm(0, next.kind === 'end' ? next.fadeIn : 0.55, t - next.start) : 1;
        q.stage.style.transform = 'translate(' + x.toFixed(1) + 'px,0)'; q.stage.style.opacity = op.toFixed(3);
        motion = Math.max(motion, Math.abs(x - xAt(t - 1 / 30)));
        if (q.device) {
          const d = devicePose(t, local, i === firstScene), d0 = devicePose(t - 1 / 30, local - 1 / 30, i === firstScene);
          q.device.style.transform = 'perspective(' + Math.round(P.H * 2.2) + 'px) translate(0,' + d.ty.toFixed(1) + 'px) rotateX(' + d.rx.toFixed(2) + 'deg) rotateY(' + d.ry.toFixed(2) + 'deg)';
          motion = Math.max(motion, Math.abs(d.ty - d0.ty) + Math.abs(d.rx - d0.rx) * 8);
        }
      }
      if (q.cam && s.cam) {
        const c = camAt(s, local, q), c0 = camAt(s, local - 1 / 30, q);
        q.cam.style.transform = 'translate(' + c.tx.toFixed(2) + 'px,' + c.ty.toFixed(2) + 'px) scale(' + c.z.toFixed(5) + ')';
        motion = Math.max(motion, Math.abs(c.tx - c0.tx) + Math.abs(c.ty - c0.ty) + Math.abs(c.z - c0.z) * q.bh);
        const toScreen = (x, y) => [c.tx + x * q.bw * c.z, c.ty + y * q.bh * c.z];
        if (q.spot) {
          const [x0, y0] = toScreen(s.spot.r[0], s.spot.r[1]), w = s.spot.r[2] * q.bw * c.z, h = s.spot.r[3] * q.bh * c.z;
          const so = sm(s.spot.in, s.spot.in + 0.3, local) * (1 - sm(s.spot.out, s.spot.out + 0.3, local));
          q.spot.style.width = w.toFixed(1) + 'px'; q.spot.style.height = h.toFixed(1) + 'px';
          q.spot.style.transform = 'translate(' + x0.toFixed(1) + 'px,' + y0.toFixed(1) + 'px)'; q.spot.style.opacity = so.toFixed(3);
          beamAt(q.spotBeam, local - s.spot.in, w, h, q.bw * 0.035, so, Math.max(1.5, q.bw * 0.004));
        }
        // Touch hotspot: appears just before the press, presses (0.85), releases into an expanding ring.
        (s.touches || []).forEach((tp, j) => {
          const el2 = q.touches[j], lt = local - tp.t;
          let x = tp.x, y = tp.y, dO = 0, dS = 1, rO = 0, rS = 1;
          if (tp.kind === 'swipe') {
            const dur = tp.dur || 0.45;
            if (lt >= -0.18 && lt <= dur + 0.3) {
              dO = 0.85 * (lt < 0 ? cl((lt + 0.18) / 0.18) : lt > dur ? 1 - cl((lt - dur) / 0.3) : 1);
              const p = sm(0, dur, lt); x = tp.x + ((tp.x2 ?? tp.x) - tp.x) * p; y = tp.y + ((tp.y2 ?? tp.y) - tp.y) * p;
              dS = lt < 0 ? 0.6 + 0.4 * cl((lt + 0.18) / 0.18) : 0.9;
            }
          } else if (lt >= -0.18 && lt < 0) { const a = cl((lt + 0.18) / 0.18); dO = 0.85 * a; dS = 0.6 + 0.4 * (1 - (1 - a) * (1 - a)); }
          else if (lt >= 0 && lt < 0.12) { dO = 0.85; dS = 1 - 0.15 * sm(0, 0.08, lt); }
          else if (lt >= 0.12 && lt < 0.5) { const e = cl((lt - 0.12) / 0.35); dO = 0.85 * (1 - e); dS = 0.85 - 0.1 * e; rO = 0.65 * (1 - e); rS = 1 + 0.8 * (1 - Math.pow(1 - e, 3)); }
          const [X, Y] = toScreen(x, y), o = q.D / 2;
          el2.dot.style.transform = 'translate(' + (X - o).toFixed(1) + 'px,' + (Y - o).toFixed(1) + 'px) scale(' + dS.toFixed(3) + ')'; el2.dot.style.opacity = dO.toFixed(3);
          el2.ring.style.transform = 'translate(' + (X - o).toFixed(1) + 'px,' + (Y - o).toFixed(1) + 'px) scale(' + rS.toFixed(3) + ')'; el2.ring.style.opacity = rO.toFixed(3);
          if (dO > 0 || rO > 0) motion = Math.max(motion, 3);
        });
      }
      if (s.clip && q.img) {
        const k = Math.max(0, Math.min(s.clip.n - 1, Math.floor((clipT - s.start) * s.clip.fps + 0.001)));
        const src = s.clip.base + String(k + 1).padStart(5, '0') + '.jpg';
        if (q.img.getAttribute('src') !== src) { q.img.setAttribute('src', src); waits.push(q.img.decode().catch(() => {})); }
      }
      if (q.cap) {
        const vis = s.capIn < 0 ? 1 - sm(s.capOut, s.capOut + 0.35, local) : sm(s.capIn, s.capIn + 0.35, local) * (1 - sm(s.capOut, s.capOut + 0.35, local));
        if (q.scrim) q.scrim.style.opacity = vis.toFixed(3);
        if (q.words.length) {
          const dec = s.effect === 'decode';
          if (wordsAt(q.words, local, s.capIn, s.capOut, dec)) motion = Math.max(motion, 4);
          if (dec && s.capIn >= 0) decodeAt(q, local, s.capIn);
          if (s.numbers && P.effects !== false && !dec && odometerAt(q, local, s.capIn)) motion = Math.max(motion, 4);
        }
        else q.cap.style.opacity = vis.toFixed(3);
      }
      if (s.kind === 'end') {
        if (q.icon) {
          // The icon pops (a small overshoot, like a badge) with its blur held, then released.
          const t0 = local - 0.15, p = backOut(t0 / 0.3), bl = blurHold(t0, 0.12, 0.25);
          q.icon.style.transform = 'scale(' + (0.7 + 0.3 * p).toFixed(4) + ')'; q.icon.style.opacity = cl(t0 / 0.1).toFixed(3);
          q.icon.style.filter = bl > 0.02 && t0 > 0 ? 'blur(' + (bl * 6).toFixed(2) + 'px)' : '';
          if (t0 > 0 && t0 < 0.5) motion = Math.max(motion, 4);
        }
        if (q.ctaPill) {
          const t0 = local - 0.7, p = backOut(t0 / 0.25);
          q.ctaPill.style.display = 'inline-block'; q.ctaPill.style.transform = 'scale(' + (0.6 + 0.4 * p).toFixed(4) + ')'; q.ctaPill.style.opacity = cl(t0 / 0.08).toFixed(3);
          beamAt(q.ctaBeam, local - 0.9, q.ctaPill.offsetWidth, q.ctaPill.offsetHeight, q.ctaPill.offsetHeight / 2, sm(0.9, 1.1, local), 2.5);
        }
        if (q.nameWords.length && wordsAt(q.nameWords, local, 0.3, null)) motion = Math.max(motion, 4);
        if (q.note) q.note.style.opacity = sm(0.65, 1.0, local).toFixed(3);
        if (!q.icon && !q.nameWords.length) q.ends.forEach((e) => { e.style.opacity = sm(0.2, 0.6, local).toFixed(3); });
      }
    });
    await Promise.all(waits);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return motion;
  }
  window.__appshot.preview = { pose };
})();`;

/** Compose the preview page: one slot per scene, stacked, driven by PREVIEW_SCRIPT. */
export async function previewPage({ plan, ws, sb, locale, fps, profile }) {
  const cacheRoot = ensureDir(path.join(ws, '.cache', 'preview'));
  const shots = [], segments = [];
  let lastFrame = null;
  const promo = sb.style === 'promo';
  let bgScene = null;
  if (promo) {
    // The brand world behind the device: the scene the creative director picked for the App Store header.
    const want = plan.preview?.backdrop ?? 'auto';
    if (want !== 'none') {
      if (want !== 'auto') bgScene = want;
      else if (plan.creative?.scene) bgScene = plan.creative.scene;
      else { try { const { direct } = await import('./lib/director.mjs'); bgScene = (await direct({ plan, profile, locales: [locale] })).scene; } catch {} }
    }
    shots.push({ id: 'bg', layout: 'preview-frame', headline: '', options: { pv: { kind: 'bg', scene: bgScene }, ...(bgScene ? { backdrop: bgScene } : {}) } });
    segments.push({ start: 0, len: sb.duration, kind: 'bg' });
  }
  // Promo screens are smaller than the canvas: decode clip frames at the device screen size (× zoom).
  const screenW = promo ? (() => { const Lp = promoLayout(sb.W, sb.H); return Math.min(Lp.dev.maxW, Lp.dev.maxH * 0.479) * 0.928; })() : sb.W;
  for (const s of sb.timeline) {
    if (s.kind === 'end') {
      shots.push({ id: 'end', layout: 'preview-frame', headline: '', options: { pv: { kind: 'end', style: sb.style, tone: s.tone, endMode: s.endMode, bg: promo ? null : lastFrame, tagline: sb.tagline, disclaimer: sb.disclaimer, cta: sb.cta } } });
      segments.push({ start: s.start, len: s.len, fadeIn: s.fadeIn, kind: 'end' });
      continue;
    }
    let screen = s.still, clip = null;
    if (s.clip) {
      // Frames big enough for the deepest zoom, never above the recording itself.
      const k = sb.style === 'framed' ? 1 : Math.min(sb.zMax, 1.5);
      const fw = even(screenW * k), fh = even((screenW * k) / (s.aspect || sb.W / sb.H));
      const fr = clipFrames({ clip: s.clip, from: s.win.start, len: Math.min(s.win.len, s.len + 0.2), w: promo ? fw : even(sb.W * k), h: promo ? fh : even(sb.H * k), fps, cacheRoot });
      screen = fr.first; lastFrame = fr.last;
      clip = { base: fr.base, n: fr.n, fps };
    } else lastFrame = s.still;
    shots.push({ id: s.id, layout: 'preview-frame', headline: s.caption, screen: screen || `missing/${s.id}.png`, options: { pv: { kind: s.kind, style: sb.style, at: s.at, tone: s.tone } } });
    segments.push({ start: s.start, len: s.len, fadeIn: s.fadeIn, kind: s.kind, clip, cam: sb.style === 'framed' ? null : { k: s.cam.keys }, capIn: s.capIn, capOut: s.capOut,
      touches: sb.style === 'framed' ? [] : s.touches || [], spot: sb.style === 'framed' ? null : s.spot, effect: s.effect || null, numbers: !!s.numbers });
  }
  // Promo uses compose's panorama mode: one brand background behind transparent scene slots, so pushes show it.
  const p = { ...plan, panorama: promo, background: promo ? plan.background : undefined, creative: promo ? { motion: plan.creative?.motion || 'gentle' } : undefined, shots };
  const { html, W, H } = await compose({ plan: p, workspace: ws, sizeId: sb.size.id, size: sb.size, locale });
  const data = { segments, W, H, duration: sb.duration, style: sb.style, bgScene: !!bgScene, beam: plan.preview?.beam !== false, effects: plan.preview?.effects !== false };
  return { html: html.replace('</body>', `<script>window.__PREVIEW=${JSON.stringify(data)};${PREVIEW_SCRIPT}</script></body>`), W, H };
}

async function openPage({ page, html, W, H, ws, name }) {
  const file = path.join(ensureDir(path.join(ws, '.cache', 'preview')), `${name}.html`);
  fs.writeFileSync(file, html);
  await page.setViewport(W, H, 1);
  await page.goto(fileUrl(file));
  await page.evaluate('window.__appshot.ready');
}

/**
 * Render the preview video (and its poster still). blur: 180° motion blur from `subframes` samples on frames where
 * the camera or the type moves (static frames are sent once per sample, so they cost nothing extra).
 * @returns {Promise<{ file, poster, sb, W, H, frames, fps, duration }>}
 */
export async function renderPreview({ plan, profile, ws, locale, sizeId, orientation, page, out, fps = 30, scale = 1, music, sfx = null, blur = true, subframes = 6, qa = true, onProgress }) {
  const sb = storyboard({ plan, profile, ws, locale, sizeId, orientation, music });
  const { html, W, H } = await previewPage({ plan, ws, sb, locale, fps, profile });
  await openPage({ page, html, W, H, ws, name: `${sizeId}.${locale}` });
  ensureDir(path.dirname(out));
  const frames = Math.round(sb.duration * fps);
  const D = (frames / fps).toFixed(3);
  const N = blur ? Math.max(2, subframes) : 1;
  const ow = even(W * scale), oh = even(H * scale);
  const audioIn = music ? ['-i', music] : ['-f', 'lavfi', '-t', D, '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000'];
  // Sound effects (a pack the user owns): one input per cue, each with its peak on its event, mixed under the music.
  const cues = sfx ? cueSheet(sb, sfx, { cacheRoot: ensureDir(path.join(ws, '.cache', 'preview')), level: Number(plan.preview?.sfxLevel || 0) }) : [];
  const mix = mixFilter(cues, 2, { music: !!music });
  const aChain = (music
    ? `[1:a]atrim=start=${Number(plan.preview?.musicStart || 0)}:duration=${D},asetpts=N/SR/TB,afade=t=in:st=0:d=0.6,afade=t=out:st=${Math.max(0, D - 1.8)}:d=1.8,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,aformat=channel_layouts=stereo[base]`
    : '[1:a]aformat=sample_rates=48000:channel_layouts=stereo[base]') + ';' + mix.filter;
  // N samples per output frame → average them (tmix) → keep the last of every N (the full shutter window).
  const vPre = N > 1 ? `[0:v]tmix=frames=${N},select='eq(mod(n,${N}),${N - 1})',setpts=N/(${fps}*TB),` : '[0:v]';
  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps * N), '-c:v', 'mjpeg', '-i', '-', ...audioIn, ...mix.inputs,
    '-filter_complex', `${vPre}scale=${ow}:${oh}:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p[v];${aChain}`,
    '-map', '[v]', '-map', '[a]', '-t', D, '-r', String(fps),
    '-c:v', 'libx264', '-preset', 'medium', '-profile:v', 'high', '-level:v', '4.0', '-pix_fmt', 'yuv420p',
    // Apple's target is 10–12 Mbps: constant 10 Mbps (x264 would undershoot on calm UI footage). Drafts: small CRF files.
    ...(scale < 1 ? ['-crf', '24'] : ['-b:v', '10M', '-minrate', '10M', '-maxrate', '10M', '-bufsize', '10M', '-x264-params', 'nal-hrd=cbr:force-cfr=1']), '-g', String(fps * 2),
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-tag:v', 'avc1',
    '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', out,
  ], { stdio: ['pipe', 'ignore', 'pipe'] });
  let err = '';
  ff.stderr.on('data', (d) => { err += d; });
  const done = new Promise((resolve, reject) => ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg failed (${code}): ${err.slice(-600)}`)))));
  const write = async (buf) => { if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); };
  const shot = () => page.screenshot({ width: W, height: H, scale: 1, format: 'jpeg', quality: 94 });
  let blurred = 0;
  for (let f = 0; f < frames; f++) {
    const t = f / fps;
    const moved = await page.evaluate(`window.__appshot.preview.pose(${t.toFixed(5)}, ${t.toFixed(5)})`);
    // Below ~2.5 px per frame no blur is visible: slow pushes stay single renders.
    if (N > 1 && moved > 2.5) {
      // Shutter centred on the frame time, half a frame long (180°); the footage frame stays the same.
      blurred++;
      for (let k = 0; k < N; k++) {
        const tk = t + ((k + 0.5) / N - 0.5) * (0.5 / fps);
        await page.evaluate(`window.__appshot.preview.pose(${tk.toFixed(5)}, ${t.toFixed(5)})`);
        await write(await shot());
      }
    } else {
      const buf = await shot();
      for (let k = 0; k < N; k++) await write(buf);
    }
    if (onProgress && (f % fps === 0 || f === frames - 1)) onProgress(f + 1, frames);
  }
  ff.stdin.end();
  await done;
  const poster = out.replace(/\.\w+$/, '') + '-poster.png';
  await page.evaluate(`window.__appshot.preview.pose(${sb.poster})`);
  fs.writeFileSync(poster, await page.screenshot({ width: W, height: H, scale, format: 'png' }));
  // Motion QA on the finished file: dead holds, bare frames in cuts, a static opening.
  let check = null;
  if (qa) {
    try { check = motionQA(out, sb, { fps }); } catch (e) { check = { warnings: [`motion QA skipped: ${e.message}`] }; }
    try { const au = audioQA(out, { music: !!music, sfx: cues.length }); check.audio = au; check.warnings.push(...au.warnings); } catch {}
  }
  return { file: out, poster, sb, W, H, frames, fps, duration: frames / fps, blurred, cues, qa: check };
}

/** Stills at given times (review boards): the first frame, the middle of every scene's caption hold, the end. */
export async function previewStills({ plan, profile, ws, locale, sizeId, orientation, page, times, scale = 0.25, sb: given, music }) {
  const sb = given || storyboard({ plan, profile, ws, locale, sizeId, orientation, music });
  const { html, W, H } = await previewPage({ plan, ws, sb, locale, fps: 30, profile });
  await openPage({ page, html, W, H, ws, name: `${sizeId}.${locale}.stills` });
  const at = times || [0, ...sb.timeline.map((s) => (s.kind === 'end' ? s.start + s.len - 0.05 : s.start + Math.max(0.9, Math.min(s.capOut - 0.1, s.len * 0.6))))];
  const out = [];
  for (const t of at) {
    await page.evaluate(`window.__appshot.preview.pose(${t})`);
    out.push({ t, buf: await page.screenshot({ width: W, height: H, scale, format: 'jpeg', quality: 86 }) });
  }
  return { sb, stills: out, W, H };
}
