// Hand-drawn curved arrow between two canvas points (callouts).
import { style } from '../lib/html.mjs';

export function arrow({ from, to, bend = 0.25, color, width = 0.7 }, { theme, u }) {
  const c = color || theme.accent;
  const [x1, y1] = from, [x2, y2] = to;
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
  const minX = Math.min(x1, x2, mx) - u * 4, minY = Math.min(y1, y2, my) - u * 4;
  const maxX = Math.max(x1, x2, mx) + u * 4, maxY = Math.max(y1, y2, my) + u * 4;
  const W = maxX - minX, H = maxY - minY;
  const p = (x, y) => `${(x - minX).toFixed(1)} ${(y - minY).toFixed(1)}`;
  const ang = Math.atan2(y2 - my, x2 - mx);
  const head = u * 2.6;
  const h1 = [x2 - Math.cos(ang - 0.5) * head, y2 - Math.sin(ang - 0.5) * head];
  const h2 = [x2 - Math.cos(ang + 0.5) * head, y2 - Math.sin(ang + 0.5) * head];
  const sw = u * width;
  return `<svg class="arrow" width="${W}" height="${H}" style="${style({ position: 'absolute', left: minX, top: minY, overflow: 'visible' })}">`
    + `<path d="M${p(x1, y1)} Q${p(mx, my)} ${p(x2, y2)}" stroke="${c}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`
    + `<path d="M${p(...h1)} L${p(x2, y2)} L${p(...h2)}" stroke="${c}" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
