// iPad Pro / Air with uniform thin bezels (portrait).
import { shell } from '../lib/device.mjs';
import { style } from '../lib/html.mjs';

export const meta = {
  id: 'ipad', kind: 'tablet', label: 'iPad (thin bezel)',
  screenAspect: 2064 / 2752, finishes: ['graphite', 'silver', 'black', 'blue'],
};

export function render({ width, src, color = 'graphite', shadow, accent, screenAspect = meta.screenAspect, fit, position }) {
  const b = 0.04;
  return shell({
    width, src, screenAspect, fit, position, shadow, accent, finishName: color,
    bezel: { l: b, r: b, t: b, b: b },
    bodyRadius: 0.07, screenRadius: 0.035, edgeWidth: 0.005, innerBorder: 0.003,
    buttons: [
      { side: 'r', top: 0.06, len: 0.05, w: 0.008 },
      { side: 'r', top: 0.12, len: 0.05, w: 0.008 },
    ],
    extras: ({ W, sx, sy, sw }) => {
      const d = W * 0.012;
      return `<div style="${style({ position: 'absolute', left: sx + sw / 2 - d / 2, top: sy / 2 - d / 2, width: d, height: d, borderRadius: '50%', background: '#1a1a1d', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' })}"></div>`;
    },
  });
}
