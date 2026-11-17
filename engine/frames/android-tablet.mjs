// Android tablet (Galaxy Tab / Pixel Tablet proportions, portrait).
import { shell } from '../lib/device.mjs';
import { style } from '../lib/html.mjs';

export const meta = {
  id: 'android-tablet', kind: 'tablet', label: 'Android tablet',
  screenAspect: 1600 / 2560, finishes: ['graphite', 'silver', 'black', 'natural'],
};

export function render({ width, src, color = 'graphite', shadow, accent, screenAspect = meta.screenAspect, fit, position }) {
  const b = 0.045;
  return shell({
    width, src, screenAspect, fit, position, shadow, accent, finishName: color,
    bezel: { l: b, r: b, t: b * 1.1, b: b * 1.1 },
    bodyRadius: 0.06, screenRadius: 0.025, edgeWidth: 0.005, innerBorder: 0.003,
    buttons: [{ side: 'r', top: 0.08, len: 0.06, w: 0.008 }],
    extras: ({ W, sx, sy, sw }) => {
      const d = W * 0.012;
      return `<div style="${style({ position: 'absolute', left: sx + sw / 2 - d / 2, top: sy / 2 - d / 2, width: d, height: d, borderRadius: '50%', background: '#111' })}"></div>`;
    },
  });
}
