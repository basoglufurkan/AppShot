// Celebratory confetti — streaks, goals, games, kids. {type:'confetti', count, colors}
import { style } from '../lib/html.mjs';
import { rng } from '../lib/util.mjs';

export function render(spec, { W, H, theme, seed, slotW = W }) {
  const r = rng(`${seed}:confetti`);
  const colors = spec.colors || [theme.accent, theme.secondary || '#FFD23F', '#FF5D8F', '#3DDC97', '#4CC9F0'];
  const n = spec.count ?? Math.round((W / slotW) * 26);
  let out = '';
  for (let i = 0; i < n; i++) {
    const w = slotW * (0.012 + r() * 0.018);
    const h = r() < 0.4 ? w : w * (1.8 + r() * 1.6);
    out += `<i style="${style({
      position: 'absolute', left: (Math.floor(r() * (W / slotW)) + (r() < 0.5 ? r() * 0.14 : 0.86 + r() * 0.14)) * slotW, top: (r() * (spec.band ?? 0.45)) * H, width: w, height: h,
      background: colors[i % colors.length], borderRadius: r() < 0.3 ? '50%' : w * 0.25,
      transform: `rotate(${Math.round(r() * 180)}deg)`, opacity: 0.9,
    })}"></i>`;
  }
  return `<div class="decor confetti" style="position:absolute;inset:0;pointer-events:none">${out}</div>`;
}
