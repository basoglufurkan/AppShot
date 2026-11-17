// Modern Android phone with centred punch-hole camera (Pixel / Galaxy proportions).
import { shell } from '../lib/device.mjs';
import { style } from '../lib/html.mjs';

export const meta = {
  id: 'android', kind: 'phone', label: 'Android (punch-hole)',
  screenAspect: 1080 / 2400, finishes: ['black', 'silver', 'white', 'blue', 'pink', 'natural'],
};

export function render({ width, src, color = 'black', shadow, accent, screenAspect = meta.screenAspect, fit, position }) {
  const b = 0.032;
  return shell({
    width, src, screenAspect, fit, position, shadow, accent, finishName: color,
    bezel: { l: b, r: b, t: b * 1.15, b: b * 1.15 },
    bodyRadius: 0.11, screenRadius: 0.085,
    buttons: [
      { side: 'r', top: 0.2, len: 0.06 },
      { side: 'r', top: 0.3, len: 0.12 },
    ],
    extras: ({ sx, sy, sw }) => {
      const d = sw * 0.04;
      return `<div class="dv-hole" style="${style({ position: 'absolute', left: sx + sw / 2 - d / 2, top: sy + sw * 0.035, width: d, height: d, borderRadius: '50%', background: '#000', boxShadow: '0 0 0 1px rgba(255,255,255,0.06)' })}"></div>`;
    },
  });
}
