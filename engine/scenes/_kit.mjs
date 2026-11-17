// Scene kit: shared helpers for animated key-art scenes (engine/scenes/*.mjs).
// A scene paints a whole creative canvas: its own background, ambient life spread over the full width
// (iPad and Mac show the whole 21:9) and one hero object centred in the safe area (iPhone shows only the middle).
// Every moving part is a ctx.motion() spec, so loops stay seamless (see skills/design/motion.md).

import { mix, rgba, shift, isDark } from '../lib/color.mjs';
import { rng } from '../lib/util.mjs';

export { mix, rgba, shift };
export const r = (v) => Math.round(v * 10) / 10;
const TAU = Math.PI * 2;

/** Colours for a scene: theme base/accent, a second accent, and `ink` for strokes on the background. */
export function palette(ctx) {
  const t = ctx.theme;
  const base = typeof t.bg === 'string' ? t.bg : t.bg?.color || t.bg?.base || t.bg?.colors?.[0] || '#101018';
  const dark = t.dark ?? isDark(base);
  const accent = t.accent || '#5B5BF7';
  const accent2 = t.secondary || ctx.plan.brand?.secondary || shift(accent, { h: 42, s: 0.05 });
  return {
    dark, base, accent, accent2, text: t.text,
    ink: dark ? '#FFFFFF' : '#0B0B12',
    deep: dark ? mix(base, '#000000', 0.25) : mix(base, '#FFFFFF', 0.4),
  };
}

/** Hero geometry: centre and size of the focus box (safe area, or a box handed in by the layout). */
export function stage(ctx, box) {
  const b = box || ctx.safe;
  return { W: ctx.W, H: ctx.H, cx: b.x + b.w / 2, cy: b.y + b.h / 2, S: Math.min(b.w, b.h), box: b };
}

/** Deterministic random stream per scene (same app + asset → same scene). */
export const rand = (ctx, id) => rng(`${ctx.seed}:${ctx.W}x${ctx.H}:scene:${id}`);
let uidN = 0;
export const uid = (k = 'g') => `${k}${(++uidN).toString(36)}`;

/** Absolutely positioned box (top-left x, y). */
export const box = (x, y, w, h, inner, css = '') => `<div style="position:absolute;left:${r(x)}px;top:${r(y)}px;width:${r(w)}px;height:${r(h)}px;${css}">${inner}</div>`;
/** Box centred on cx, cy. */
export const at = (cx, cy, w, h, inner, css = '') => box(cx - w / 2, cy - h / 2, w, h, inner, css);
/** Full-canvas layer. */
export const layer = (ctx, inner, css = '') => box(0, 0, ctx.W, ctx.H, inner, `overflow:hidden;${css}`);
/** Motion wrapper that fills its parent box (transform origin = the box centre unless css says otherwise). */
export const mo = (ctx, inner, spec, css = '') => ctx.motion(inner, { ...spec, css: `position:absolute;inset:0;${css}` });
/** A sprite drawn around the origin and moved by an absolute-coordinate motion (path / orbit about a centre). */
export const sprite = (ctx, w, h, inner, spec, { x = 0, y = 0, z } = {}) =>
  box(x, y, 0, 0, ctx.motion(box(-w / 2, -h / 2, w, h, inner), { ...spec, css: 'position:absolute;left:0;top:0;width:0;height:0' }), z !== undefined ? `z-index:${z}` : '');

/** Inline SVG sized w × h with a 0 0 vw vh viewBox. */
export const svg = (w, h, inner, { vb = '0 0 100 100', css = '' } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${r(w)}" height="${r(h)}" viewBox="${vb}" preserveAspectRatio="xMidYMid meet" style="position:absolute;left:0;top:0;overflow:visible;${css}">${inner}</svg>`;
/** Full-canvas SVG in pixel units. */
export const canvasSvg = (ctx, inner, css = '') => svg(ctx.W, ctx.H, inner, { vb: `0 0 ${r(ctx.W)} ${r(ctx.H)}`, css });

export const lin = (id, stops, { x1 = 0, y1 = 0, x2 = 0, y2 = 1 } = {}) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
export const rad = (id, stops, { cx = 0.5, cy = 0.5, r: rr = 0.5, fx, fy } = {}) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${rr}"${fx !== undefined ? ` fx="${fx}" fy="${fy}"` : ''}>${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`;

/** Background layer from a CSS background string. */
export const backdrop = (ctx, background) => layer(ctx, '', `background:${background}`);

/** Soft radial glow (cheap: a gradient, no blur filter). */
export const glow = (cx, cy, size, color, a = 0.5, css = '') =>
  at(cx, cy, size, size, '', `border-radius:50%;background:radial-gradient(circle, ${rgba(color, a)} 0%, ${rgba(color, a * 0.45)} 32%, ${rgba(color, 0)} 68%);${css}`);

/** Twinkling dots / sparkles spread over an area. */
export function stars(ctx, R, { n = 60, area, color = '#fff', min = 2, max = 6, sparkle = 0.12, lo = 0.15, hi = 1, avoid } = {}) {
  const A = area || { x: 0, y: 0, w: ctx.W, h: ctx.H };
  let h = '';
  for (let i = 0; i < n; i++) {
    const x = A.x + R() * A.w, y = A.y + R() * A.h;
    if (avoid && Math.hypot(x - avoid.cx, y - avoid.cy) < avoid.r) continue;
    const s = min + (max - min) * R() ** 2;
    const big = R() < sparkle;
    const shape = big ? svg(s * 4, s * 4, `<path d="M50 0 C54 38 62 46 100 50 C62 54 54 62 50 100 C46 62 38 54 0 50 C38 46 46 38 50 0Z" fill="${color}"/>`) : '';
    const dot = big ? at(x, y, s * 4, s * 4, mo(ctx, shape, { type: 'osc', prop: 'opacity', lo, hi, cycles: 1 + Math.floor(R() * 3), phase: R() }))
      : at(x, y, s, s, mo(ctx, '', { type: 'osc', prop: 'opacity', lo, hi, cycles: 1 + Math.floor(R() * 4), phase: R() }, `border-radius:50%;background:${color}`));
    h += dot;
  }
  return h;
}

/** Particles rising (or falling with rise < 0) and fading: sparks, steam dots, bubbles, pollen. */
export function motes(ctx, R, { n = 20, area, color = '#fff', min = 4, max = 12, rise, cycles = [1, 2], wobble = 0.3, o = 0.9, shape } = {}) {
  const A = area || { x: 0, y: 0, w: ctx.W, h: ctx.H };
  const dist = rise ?? A.h * 0.6;
  let h = '';
  for (let i = 0; i < n; i++) {
    const s = min + (max - min) * R();
    const x = A.x + R() * A.w, y = A.y + A.h * (0.5 + R() * 0.5);
    const inner = shape ? shape(s, i, R) : `<div style="position:absolute;inset:0;border-radius:50%;background:${color}"></div>`;
    h += at(x, y, s, s, mo(ctx, inner, {
      type: 'travel', x0: 0, y0: 0, x1: (R() - 0.5) * s * 4, y1: -dist * (0.6 + R() * 0.4), wx: s * wobble * 4, wc: 1 + Math.floor(R() * 2),
      s0: 0.6 + R() * 0.3, s1: 1 + R() * 0.3, o, cycles: cycles[Math.floor(R() * cycles.length)], phase: R(),
    }));
  }
  return h;
}

/** Big soft colour fields drifting slowly (aurora / mesh feel). */
export function blobs(ctx, R, { colors, n = 5, a = 0.45, size = [0.35, 0.6] } = {}) {
  const { W, H } = ctx;
  let h = '';
  for (let i = 0; i < n; i++) {
    const s = Math.max(W, H) * (size[0] + R() * (size[1] - size[0]));
    const c = colors[i % colors.length];
    h += at(W * (0.08 + R() * 0.84), H * (0.1 + R() * 0.8), s, s,
      mo(ctx, '', { type: 'float', x: s * 0.08, y: s * 0.06, rot: 0, phase: R() }, `border-radius:50%;background:radial-gradient(circle, ${rgba(c, a)} 0%, ${rgba(c, 0)} 70%)`));
  }
  return h;
}

/** Concentric rings that expand and fade, staggered (sonar / ripple / heartbeat rings). */
export function rings(ctx, { cx, cy, size, color, n = 3, cycles = 2, width = 0.006, o = 0.7, s0 = 0.35, s1 = 1 } = {}) {
  let h = '';
  for (let i = 0; i < n; i++) {
    h += at(cx, cy, size, size, mo(ctx, '', { type: 'ripple', s0, s1, o, cycles, phase: i / n }, `border-radius:50%;border:${r(Math.max(2, size * width))}px solid ${color}`));
  }
  return h;
}

/** Fluffy cloud (SVG, 200 × 100 viewBox). */
export const cloud = (w, color = '#fff', a = 1, id = uid('cl')) => svg(w, w / 2, `<defs>${lin(id, [[0, color, a], [1, color, a * 0.78]])}</defs>
  <path d="M40 88 C18 88 6 74 10 60 C14 46 30 42 40 46 C42 28 58 16 78 20 C92 6 122 6 134 24 C150 16 176 24 180 46 C198 50 202 72 190 82 C184 88 176 88 168 88 Z" fill="url(#${id})"/>`, { vb: '0 0 200 100' });

/** Four-point sparkle star (100 × 100). */
export const sparkle = (s, color) => svg(s, s, `<path d="M50 0 C54 38 62 46 100 50 C62 54 54 62 50 100 C46 62 38 54 0 50 C38 46 46 38 50 0Z" fill="${color}"/>`);

/** Heart shape path in a 100 × 100 box. */
export const HEART = 'M50 90 C22 70 4 53 4 32 C4 15 17 5 31 5 C41 5 47 11 50 18 C53 11 59 5 69 5 C83 5 96 15 96 32 C96 53 78 70 50 90 Z';

/** Smooth closed loop (figure-eight) through the focus box — for flying / swimming sprites. */
export function eightPath(cx, cy, rx, ry, steps = 96) {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * TAU;
    const x = cx + rx * Math.sin(a), y = cy + ry * Math.sin(a) * Math.cos(a);
    d += `${i ? 'L' : 'M'}${r(x)} ${r(y)}`;
  }
  return d + 'Z';
}

/** Closed wobbly loop (ellipse with gentle noise) — for wandering sprites. */
export function loopPath(cx, cy, rx, ry, R, { steps = 96, wobble = 0.12, tilt = 0 } = {}) {
  const k1 = 2 + Math.floor(R() * 2), k2 = 3 + Math.floor(R() * 2), p1 = R() * TAU, p2 = R() * TAU;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * TAU;
    const n = 1 + wobble * (Math.sin(k1 * a + p1) * 0.6 + Math.sin(k2 * a + p2) * 0.4);
    let x = rx * n * Math.cos(a), y = ry * n * Math.sin(a);
    if (tilt) { const ct = Math.cos(tilt), st = Math.sin(tilt); [x, y] = [x * ct - y * st, x * st + y * ct]; }
    d += `${i ? 'L' : 'M'}${r(cx + x)} ${r(cy + y)}`;
  }
  return d + 'Z';
}

/** Stroke drawn with a dash motion (`draw` = appears then fades, `flow` = a bright segment running along). */
export const dashPath = (ctx, d, { stroke, width, mode = 'draw', dash = '1 1', cycles = 1, phase = 0, inT, len, out, extra = '' }) =>
  ctx.motion('', { tag: 'path', type: 'dash', mode, cycles, phase, in: inT, len, out, css: '' })
    .replace('<path class="mo"', `<path class="mo" d="${d}" pathLength="1" fill="none" stroke="${stroke}" stroke-width="${r(width)}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${dash}" stroke-dashoffset="${mode === 'draw' ? 1 : 0}" ${extra}`)
    .replace(/ style=""/, '');
export { esc } from '../lib/html.mjs';

/** Coin (100 × 100): gold disc, rim and a neutral emblem (never a currency sign — no prices in creative assets). */
export const coin = (s, id = uid('co')) => svg(s, s, `<defs>${lin(id, [[0, '#FFE58A'], [0.5, '#F6B93B'], [1, '#C77D0A']], { x1: 0.15, y1: 0, x2: 0.85, y2: 1 })}</defs>
  <circle cx="50" cy="50" r="48" fill="url(#${id})"/><circle cx="50" cy="50" r="38" fill="none" stroke="#FFF3C4" stroke-opacity=".7" stroke-width="4"/>
  <path d="M50 28 L56 44 L72 50 L56 56 L50 72 L44 56 L28 50 L44 44 Z" fill="#FFF7D6" fill-opacity=".85"/>
  <ellipse cx="34" cy="26" rx="14" ry="7" fill="#fff" fill-opacity=".45" transform="rotate(-30 34 26)"/>`);
