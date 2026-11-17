// Minimal outline device: thin stroke, no metal. Pairs with editorial and mono themes.
import { style, round } from '../lib/html.mjs';
import { esc } from '../lib/html.mjs';
import { shadowFilter } from '../lib/device.mjs';

export const meta = { id: 'outline', kind: 'phone', label: 'Outline (thin stroke)', screenAspect: 1320 / 2868, finishes: ['any CSS colour'] };

export function render({ width, src, color = '#111111', shadow = 'none', accent, screenAspect = meta.screenAspect, fit = 'cover', position = 'top center' }) {
  const W = width;
  const pad = W * 0.03;
  const sw = W - pad * 2;
  const sh = sw / screenAspect;
  const H = sh + pad * 2;
  const stroke = Math.max(2, W * 0.008);
  const html = `<div class="dv dv-outline" style="${style({ position: 'relative', width: W, height: H, filter: shadowFilter(shadow, W, accent) })}">`
    + `<div style="${style({ position: 'absolute', inset: 0, borderRadius: W * 0.15, border: `${round(stroke)}px solid ${color}` })}"></div>`
    + `<div class="dv-screen" style="${style({ position: 'absolute', left: pad, top: pad, width: sw, height: sh, borderRadius: W * 0.12, overflow: 'hidden', background: '#000' })}">`
    + (src ? `<img class="dv-img" src="${esc(src)}" style="${style({ width: '100%', height: '100%', objectFit: fit, objectPosition: position, display: 'block' })}">` : '')
    + `</div></div>`;
  return { html, width: W, height: H, screen: { x: pad, y: pad, w: sw, h: sh, r: W * 0.12 } };
}
