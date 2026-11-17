// Four-point sparkles — "magic"/AI/beauty accent. {type:'sparkles', count, color, area:'top'|'all'}
import { style } from '../lib/html.mjs';
import { rng } from '../lib/util.mjs';

const STAR = 'M50 0 C54 34 66 46 100 50 C66 54 54 66 50 100 C46 66 34 54 0 50 C34 46 46 34 50 0Z';

export function render(spec, { W, H, theme, seed, slotW = W }) {
  const r = rng(`${seed}:sparkles`);
  const n = spec.count ?? Math.round((W / slotW) * 6);
  const color = spec.color || theme.accent;
  let out = '';
  for (let i = 0; i < n; i++) {
    const s = slotW * (0.02 + r() * 0.045);
    // Never on the type: in the caption band (top 40 %) sparkles keep to the side margins; below it, anywhere.
    let x = r() * W, y = (spec.area === 'top' ? r() * 0.35 : r()) * H;
    if (y < H * 0.4) { const side = r() < 0.5; x = (side ? r() * 0.12 : 0.88 + r() * 0.1) * slotW + Math.floor(x / slotW) * slotW; }
    out += `<svg viewBox="0 0 100 100" style="${style({ position: 'absolute', left: x, top: y, width: s, height: s, opacity: 0.55 + r() * 0.45 })}"><path d="${STAR}" fill="${color}"/></svg>`;
  }
  return `<div class="decor sparkles" style="position:absolute;inset:0;pointer-events:none">${out}</div>`;
}
