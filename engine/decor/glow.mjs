// Soft light bloom behind a subject. {type:'glow', color, x, y, size, opacity}
import { style } from '../lib/html.mjs';
import { rgba } from '../lib/color.mjs';

export function render(spec, { W, H, theme, slotW = W }) {
  const c = spec.color || theme.accent;
  const s = (spec.size ?? 0.9) * Math.min(slotW, H * 0.75);
  const y = (spec.y ?? 0.62) * H;
  // In a panorama strip one glow per slot (x is relative to each slot) unless repeat: false.
  const slots = spec.repeat === false ? 1 : Math.max(1, Math.round(W / slotW));
  let out = '';
  for (let i = 0; i < slots; i++) {
    const x = slots > 1 ? (i + (spec.x ?? 0.5)) * slotW : (spec.x ?? 0.5) * W;
    out += `<div class="decor glow" style="${style({
      position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: '50%',
      background: `radial-gradient(circle, ${rgba(c, spec.opacity ?? 0.55)} 0%, ${rgba(c, 0)} 68%)`,
      filter: `blur(${Math.round(s * 0.06)}px)`, pointerEvents: 'none',
    })}"></div>`;
  }
  return out;
}
