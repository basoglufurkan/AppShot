// Shared device-shell builder used by every frame in engine/frames/.
// Devices are drawn in CSS (no bitmap mockups), so they scale to any canvas and carry no licence baggage.

import { esc, style, round } from './html.mjs';
import { rgba } from './color.mjs';

/** Metal / plastic finishes: body gradient, edge highlight, side-button colour. */
export const FINISHES = {
  black:   { body: 'linear-gradient(145deg,#3a3a3e 0%,#151517 38%,#0b0b0c 62%,#2c2c30 100%)', edge: '#55555a', button: '#1d1d20', island: '#000' },
  graphite:{ body: 'linear-gradient(145deg,#5a5c60 0%,#2a2b2e 40%,#1b1c1e 62%,#47494d 100%)', edge: '#77797e', button: '#333538', island: '#000' },
  silver:  { body: 'linear-gradient(145deg,#f2f2f4 0%,#c9c9ce 40%,#aeaeb4 62%,#e6e6ea 100%)', edge: '#ffffff', button: '#b9b9bf', island: '#000' },
  white:   { body: 'linear-gradient(145deg,#ffffff 0%,#ececef 45%,#dcdce1 70%,#f7f7f9 100%)', edge: '#ffffff', button: '#d5d5da', island: '#000' },
  natural: { body: 'linear-gradient(145deg,#d9d5cf 0%,#aaa59c 42%,#8f8a82 64%,#cfcac2 100%)', edge: '#ece8e1', button: '#a19c93', island: '#000' },
  desert:  { body: 'linear-gradient(145deg,#e6d3bb 0%,#c3a888 42%,#a98d6d 64%,#dcc6a9 100%)', edge: '#f4e6d2', button: '#b89c7c', island: '#000' },
  gold:    { body: 'linear-gradient(145deg,#f6e3b8 0%,#d4b26f 42%,#b8954f 64%,#eed79f 100%)', edge: '#fff1cc', button: '#c9a660', island: '#000' },
  blue:    { body: 'linear-gradient(145deg,#56637f 0%,#2b3449 42%,#1d2333 64%,#48536d 100%)', edge: '#7987a6', button: '#2f384d', island: '#000' },
  pink:    { body: 'linear-gradient(145deg,#f8d7df 0%,#e3aebb 42%,#cf93a2 64%,#f2c9d3 100%)', edge: '#ffe8ee', button: '#dca3b1', island: '#000' },
};

export function finish(color = 'black') {
  if (FINISHES[color]) return FINISHES[color];
  // Any CSS colour → a clay-style single-colour finish.
  return { body: color, edge: rgba(color, 1), button: color, island: '#0a0a0a', clay: true };
}

/** Drop-shadow filter presets, scaled by device width. */
export function shadowFilter(kind = 'soft', w, accent = '#000') {
  const u = w / 100;
  switch (kind) {
    case 'none': return 'none';
    case 'hard': return `drop-shadow(${round(u * 2.4)}px ${round(u * 2.4)}px 0 rgba(0,0,0,0.95))`;
    case 'float': return `drop-shadow(0 ${round(u * 9)}px ${round(u * 14)}px rgba(0,0,0,0.34)) drop-shadow(0 ${round(u * 2)}px ${round(u * 3)}px rgba(0,0,0,0.18))`;
    case 'glow': return `drop-shadow(0 0 ${round(u * 10)}px ${rgba(accent, 0.55)}) drop-shadow(0 ${round(u * 4)}px ${round(u * 8)}px rgba(0,0,0,0.4))`;
    case 'soft':
    default: return `drop-shadow(0 ${round(u * 5)}px ${round(u * 9)}px rgba(0,0,0,0.26)) drop-shadow(0 ${round(u * 1)}px ${round(u * 2)}px rgba(0,0,0,0.14))`;
  }
}

/**
 * Build a device.
 * bezel: {l,t,r,b} as fractions of device width. Radii as fractions of device width.
 * screenAspect: screen width / height.
 */
export function shell({
  width, screenAspect, bezel, bodyRadius, screenRadius, finishName = 'black', src,
  fit = 'cover', position = 'top center', extras = () => '', buttons = [], shadow = 'soft', accent,
  edgeWidth = 0.009, innerBorder = 0.006, screenBg = '#000', className = '',
}) {
  const f = finish(finishName);
  const W = width;
  const sw = W * (1 - bezel.l - bezel.r);
  const sh = sw / screenAspect;
  const H = sh + W * (bezel.t + bezel.b);
  const sx = W * bezel.l;
  const sy = W * bezel.t;
  const br = W * bodyRadius;
  const sr = W * screenRadius;
  const ew = Math.max(1, W * edgeWidth);
  const ib = Math.max(1, W * innerBorder);

  const bodyStyle = style({
    position: 'absolute', inset: 0, borderRadius: br, background: f.body,
    boxShadow: f.clay
      ? `inset 0 0 0 ${round(ew)}px rgba(255,255,255,0.18), inset ${round(-ew * 2)}px ${round(-ew * 2)}px ${round(ew * 6)}px rgba(0,0,0,0.18), inset ${round(ew * 2)}px ${round(ew * 2)}px ${round(ew * 6)}px rgba(255,255,255,0.25)`
      : `inset 0 0 0 ${round(ew * 0.6)}px ${f.edge}, inset 0 0 0 ${round(ew)}px rgba(0,0,0,0.35)`,
  });
  // Black glass around the screen (between metal frame and pixels).
  const glassStyle = style({
    position: 'absolute', left: sx - ib, top: sy - ib, width: sw + ib * 2, height: sh + ib * 2,
    borderRadius: sr + ib, background: f.clay ? 'rgba(0,0,0,0.88)' : '#050506',
  });
  const screenStyle = style({
    position: 'absolute', left: sx, top: sy, width: sw, height: sh, borderRadius: sr,
    overflow: 'hidden', background: screenBg, transform: 'translateZ(0)',
  });
  const img = src
    ? `<img class="dv-img" src="${esc(src)}" style="${style({ width: '100%', height: '100%', objectFit: fit, objectPosition: position, display: 'block' })}">`
    : `<div style="${style({ width: '100%', height: '100%', background: 'linear-gradient(160deg,#2a2a2e,#111)' })}"></div>`;

  const btns = buttons.map((b) => {
    const bw = W * (b.w ?? 0.012);
    const top = H * b.top;
    const len = H * b.len;
    const left = b.side === 'l' ? -bw * 0.55 : W - bw * 0.45;
    return `<i style="${style({ position: 'absolute', left, top, width: bw, height: len, borderRadius: bw, background: f.button, boxShadow: `inset 0 0 0 ${round(bw * 0.15)}px rgba(255,255,255,0.12)` })}"></i>`;
  }).join('');

  const ctx = { W, H, sx, sy, sw, sh, sr, finish: f };
  const html = `<div class="dv ${className}" style="${style({ position: 'relative', width: W, height: H, filter: shadowFilter(shadow, W, accent) })}">`
    + btns
    + `<div class="dv-body" style="${bodyStyle}"></div>`
    + `<div style="${glassStyle}"></div>`
    + `<div class="dv-screen" style="${screenStyle}">${img}</div>`
    + extras(ctx)
    + `</div>`;
  return { html, width: W, height: H, screen: { x: sx, y: sy, w: sw, h: sh, r: sr } };
}

/** A device-free rounded screen (flat style) sharing the same return shape. */
export function bare({ width, screenAspect, radius = 0.075, src, fit = 'cover', position = 'top center', shadow = 'soft', accent, border = 'rgba(0,0,0,0.08)' }) {
  const W = width;
  const H = W / screenAspect;
  const r = W * radius;
  const html = `<div class="dv dv-flat" style="${style({ position: 'relative', width: W, height: H, filter: shadowFilter(shadow, W, accent) })}">`
    + `<div class="dv-screen" style="${style({ position: 'absolute', inset: 0, borderRadius: r, overflow: 'hidden', background: '#000', boxShadow: `0 0 0 ${round(Math.max(1, W * 0.004))}px ${border}`, transform: 'translateZ(0)' })}">`
    + (src ? `<img class="dv-img" src="${esc(src)}" style="${style({ width: '100%', height: '100%', objectFit: fit, objectPosition: position, display: 'block' })}">` : '')
    + `</div></div>`;
  return { html, width: W, height: H, screen: { x: 0, y: 0, w: W, h: H, r } };
}
