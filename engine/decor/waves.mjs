// Layered waves along the bottom (or top) edge. {type:'waves', edge:'bottom'|'top', colors, height}
import { style } from '../lib/html.mjs';
import { rgba } from '../lib/color.mjs';

export function render(spec, { W, H, theme, slotW = W }) {
  const colors = spec.colors || [rgba(theme.accent, 0.25), rgba(theme.accent, 0.4)];
  const h = (spec.height ?? 0.22) * H;
  const periods = Math.max(1, Math.round(W / slotW) * (spec.periods ?? 1.5));
  const layers = colors.map((c, i) => {
    const amp = 18 - i * 5, base = 40 + i * 18;
    let d = `M0 ${base}`;
    const steps = Math.ceil(periods * 2);
    for (let s = 0; s < steps; s++) {
      const x1 = ((s + 0.5) / steps) * 1000, x2 = ((s + 1) / steps) * 1000;
      d += ` Q${x1.toFixed(1)} ${base + (s % 2 ? amp : -amp)} ${x2.toFixed(1)} ${base}`;
    }
    d += ' L1000 100 L0 100 Z';
    return `<path d="${d}" fill="${c}"/>`;
  }).join('');
  const flip = spec.edge === 'top' ? 'scaleY(-1)' : undefined;
  return `<svg class="decor waves" viewBox="0 0 1000 100" preserveAspectRatio="none" style="${style({ position: 'absolute', left: 0, width: W, height: h, top: spec.edge === 'top' ? 0 : H - h, transform: flip, pointerEvents: 'none' })}">${layers}</svg>`;
}
