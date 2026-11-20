// Seal: a scalloped badge in the accent colour ("#1 car identifier", "4.9 on the App Store", "3 a day").
// Proof only when the claim is real and sourced (the checker requires a source on rating/awards); iOS only.
import { style, markup, plain } from '../lib/html.mjs';

export function seal({ value, label, size = 1, color, textColor, rotate = -6 }, { theme, u }) {
  const d = u * 30 * size;
  const bg = color || theme.accent;
  const fg = textColor || theme.accentText || '#fff';
  // A circle plus a ring of overlapping small circles: the union is the scalloped edge.
  const n = 16, R = 41, r = 9.6;
  const bumps = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return `<circle cx="${(50 + Math.cos(a) * R).toFixed(2)}" cy="${(50 + Math.sin(a) * R).toFixed(2)}" r="${r}"/>`;
  }).join('');
  // Short values ("#1", "4.9") run big; longer ones ("50K+") shrink to stay inside the disc.
  const chars = Math.max(1, [...plain(value)].length);
  const vs = Math.min(0.3, 0.6 / chars / 0.58);
  return `<div class="seal" style="${style({ position: 'relative', width: d, height: d, flex: 'none', transform: rotate ? `rotate(${rotate}deg)` : undefined })}">`
    + `<svg viewBox="0 0 100 100" width="${d}" height="${d}" style="position:absolute;left:0;top:0;overflow:visible;filter:drop-shadow(0 ${(u * 0.8).toFixed(1)}px ${(u * 1.8).toFixed(1)}px rgba(0,0,0,.2))"><g fill="${bg}"><circle cx="50" cy="50" r="${R}"/>${bumps}</g></svg>`
    + `<div style="${style({ position: 'absolute', left: 0, top: 0, width: d, height: d, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: fg, padding: d * 0.17 })}">`
    + `<div style="${style({ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: d * vs, lineHeight: 0.95, letterSpacing: '-0.03em', whiteSpace: 'nowrap' })}">${markup(value)}</div>`
    + (label ? `<div style="${style({ fontFamily: 'var(--font-text)', fontWeight: 700, fontSize: d * 0.095, lineHeight: 1.12, marginTop: d * 0.035 })}">${markup(label)}</div>` : '')
    + `</div></div>`;
}
