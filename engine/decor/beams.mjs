// Light rays from a point — stage/spotlight drama for hero shots. {type:'beams', x, y, color, opacity}
import { style } from '../lib/html.mjs';
import { rgba } from '../lib/color.mjs';

export function render(spec, { W, H, theme, slotW = W }) {
  const c = spec.color || theme.accent;
  const x = (spec.x ?? 0.5) * W, y = (spec.y ?? 0.0) * H;
  const s = Math.max(H, slotW) * 2.2;
  const rays = `repeating-conic-gradient(from 0deg at 50% 50%, ${rgba(c, spec.opacity ?? 0.16)} 0deg 6deg, transparent 6deg 18deg)`;
  const mask = 'radial-gradient(circle at 50% 50%, #000 0%, transparent 45%)';
  return `<div class="decor beams" style="${style({ position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, background: rays, WebkitMaskImage: mask, maskImage: mask, pointerEvents: 'none' })}"></div>`;
}
