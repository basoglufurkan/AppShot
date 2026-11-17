// Hairline grid, optionally faded towards the edges. {type:'grid', size, color, opacity, fade}
import { style } from '../lib/html.mjs';
import { rgba } from '../lib/color.mjs';

export function render(spec, { W, H, theme, slotW = W }) {
  const size = (spec.size ?? 0.09) * slotW;
  const c = rgba(spec.color || theme.text, spec.opacity ?? 0.08);
  const line = Math.max(1, slotW * 0.0015);
  const mask = spec.fade === false ? undefined : 'radial-gradient(ellipse at 50% 40%, #000 30%, transparent 80%)';
  return `<div class="decor grid" style="${style({
    position: 'absolute', left: 0, top: 0, width: W, height: H, pointerEvents: 'none',
    backgroundImage: `linear-gradient(${c} ${line}px, transparent ${line}px), linear-gradient(90deg, ${c} ${line}px, transparent ${line}px)`,
    backgroundSize: `${size}px ${size}px`, WebkitMaskImage: mask, maskImage: mask,
  })}"></div>`;
}
