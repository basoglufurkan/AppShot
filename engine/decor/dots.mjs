// Dot matrix pattern. {type:'dots', size, gap, color, opacity, fade}
import { style } from '../lib/html.mjs';
import { rgba } from '../lib/color.mjs';

export function render(spec, { W, H, theme, slotW = W }) {
  const gap = (spec.gap ?? 0.045) * slotW;
  const dot = (spec.size ?? 0.004) * slotW;
  const c = rgba(spec.color || theme.text, spec.opacity ?? 0.14);
  const mask = spec.fade === false ? undefined : 'linear-gradient(180deg, #000 0%, transparent 70%)';
  return `<div class="decor dots" style="${style({
    position: 'absolute', left: 0, top: 0, width: W, height: H, pointerEvents: 'none',
    backgroundImage: `radial-gradient(${c} ${dot}px, transparent ${dot + 0.5}px)`,
    backgroundSize: `${gap}px ${gap}px`, WebkitMaskImage: mask, maskImage: mask,
  })}"></div>`;
}
