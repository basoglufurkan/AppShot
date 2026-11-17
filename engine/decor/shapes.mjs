// Bold geometric shapes (circle, pill, square, ring) — playful and brutal themes. {type:'shapes', count, colors}
import { style } from '../lib/html.mjs';
import { rng } from '../lib/util.mjs';

export function render(spec, { W, H, theme, seed, slotW = W }) {
  const r = rng(`${seed}:shapes`);
  const colors = spec.colors || [theme.accent, theme.secondary || theme.accent];
  const n = spec.count ?? Math.round((W / slotW) * 4);
  const outline = spec.outline ? `${Math.max(2, slotW * 0.008)}px solid ${theme.stroke || '#000'}` : undefined;
  let out = '';
  for (let i = 0; i < n; i++) {
    const kind = ['circle', 'pill', 'square', 'ring'][Math.floor(r() * 4)];
    const s = slotW * (0.1 + r() * 0.16);
    const w = kind === 'pill' ? s * 2 : s;
    const c = colors[i % colors.length];
    out += `<div style="${style({
      position: 'absolute', left: (Math.floor(r() * (W / slotW)) + (r() < 0.5 ? r() * 0.08 : 0.92 + r() * 0.08)) * slotW - w / 2, top: (r() < 0.35 ? 0.3 + r() * 0.2 : 0.62 + r() * 0.35) * H, width: w, height: s,
      borderRadius: kind === 'square' ? s * 0.18 : s, background: kind === 'ring' ? 'transparent' : c,
      border: kind === 'ring' ? `${s * 0.16}px solid ${c}` : outline, transform: `rotate(${Math.round(r() * 60 - 30)}deg)`, opacity: spec.opacity ?? 1,
    })}"></div>`;
  }
  return `<div class="decor shapes" style="position:absolute;inset:0;pointer-events:none">${out}</div>`;
}
