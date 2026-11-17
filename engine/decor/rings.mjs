// Concentric rings radiating from a point (sonar / focus feel). {type:'rings', x, y, count, color, opacity}
import { style } from '../lib/html.mjs';
import { rgba } from '../lib/color.mjs';

export function render(spec, { W, H, theme, slotW = W }) {
  const n = spec.count ?? 5;
  const cx = (spec.x ?? 0.5) * W, cy = (spec.y ?? 0.62) * H;
  const step = (spec.step ?? 0.18) * slotW;
  const line = Math.max(1, slotW * 0.0022);
  let out = '';
  for (let i = 1; i <= n; i++) {
    const s = step * i * 2;
    out += `<div style="${style({
      position: 'absolute', left: cx - s / 2, top: cy - s / 2, width: s, height: s, borderRadius: '50%',
      border: `${line}px solid ${rgba(spec.color || theme.accent, (spec.opacity ?? 0.35) * (1 - i / (n + 1)))}`,
    })}"></div>`;
  }
  return `<div class="decor rings" style="${style({ position: 'absolute', inset: 0, pointerEvents: 'none' })}">${out}</div>`;
}
