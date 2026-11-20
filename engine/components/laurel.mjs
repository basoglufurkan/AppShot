// Award laurel: wreath halves around a short line ("Editors' Choice", "4.8 rating").
// Only use for real, verifiable accolades.
import { style, markup } from '../lib/html.mjs';

// One sprig: a "(" stem on an arc around (CX, CY), leaves sitting on it — big ones tilted outward, small ones inward —
// and one leaf at the tip. Everything stays inside the 60 × 112 viewBox (the old sprig clipped its leaves flat).
const CX = 62, CY = 60, R = 46;
const f = (v) => v.toFixed(2);
function on(deg, off = 0, along = 0) {
  const a = (deg * Math.PI) / 180, nx = Math.cos(a), ny = Math.sin(a);
  return [CX + (R + off) * nx - along * ny, CY + (R + off) * ny + along * nx];
}
function leaf(deg, off, ry, tilt, color) {
  const [x, y] = on(deg, off, ry * 0.55);
  return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(ry * 0.42)}" ry="${f(ry)}" transform="rotate(${f(deg + tilt)} ${f(x)} ${f(y)})" fill="${color}"/>`;
}
function branch(flip, color) {
  const leaves = [];
  for (let k = 0; k < 7; k++) leaves.push(leaf(122 + k * 17, 5.5, 10.5 - k * 0.55, -28, color));
  for (let k = 0; k < 6; k++) leaves.push(leaf(130 + k * 17, -4.5, 7.6 - k * 0.45, 28, color));
  leaves.push(leaf(236, 0, 8.4, 0, color));
  const [x0, y0] = on(116), [x1, y1] = on(238);
  return `<svg viewBox="0 0 60 112" style="transform:${flip ? 'scaleX(-1)' : 'none'};display:block;height:100%;overflow:visible"><path d="M${f(x0)} ${f(y0)} A${R} ${R} 0 0 1 ${f(x1)} ${f(y1)}" stroke="${color}" stroke-width="2.2" fill="none" stroke-linecap="round"/>${leaves.join('')}</svg>`;
}

export function laurel({ title, sub, size = 1, color }, { theme, u }) {
  const c = color || theme.text;
  const h = u * 17 * size;
  return `<div class="laurel" style="${style({ display: 'inline-flex', alignItems: 'center', gap: u * 1.4 * size, height: h, color: c })}">`
    + `<div style="height:100%">${branch(false, c)}</div>`
    + `<div style="${style({ textAlign: 'center', fontFamily: 'var(--font-display)' })}">`
    + `<div style="${style({ fontWeight: 800, fontSize: u * 5.4 * size, lineHeight: 1, letterSpacing: '-0.02em' })}">${markup(title)}</div>`
    + (sub ? `<div style="${style({ fontFamily: 'var(--font-text)', fontWeight: 600, fontSize: u * 2.6 * size, opacity: 0.75, marginTop: u * 0.8, letterSpacing: '0.04em', textTransform: 'uppercase' })}">${markup(sub)}</div>` : '')
    + `</div>`
    + `<div style="height:100%">${branch(true, c)}</div></div>`;
}
