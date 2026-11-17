// iPhone with Dynamic Island (iPhone 14 Pro → 17 Pro Max proportions).
import { shell } from '../lib/device.mjs';
import { style } from '../lib/html.mjs';

export const meta = {
  id: 'iphone', kind: 'phone', label: 'iPhone (Dynamic Island)',
  screenAspect: 1320 / 2868, finishes: ['black', 'natural', 'white', 'desert', 'silver', 'blue', 'graphite'],
};

export function render({ width, src, color = 'black', shadow, accent, screenAspect = meta.screenAspect, fit, position }) {
  const b = 0.036;
  return shell({
    width, src, screenAspect, fit, position, shadow, accent, finishName: color,
    bezel: { l: b, r: b, t: b, b: b },
    bodyRadius: 0.165, screenRadius: 0.13,
    buttons: [
      { side: 'l', top: 0.165, len: 0.045 },
      { side: 'l', top: 0.235, len: 0.075 },
      { side: 'l', top: 0.325, len: 0.075 },
      { side: 'r', top: 0.255, len: 0.11 },
      { side: 'r', top: 0.52, len: 0.06, w: 0.01 },
    ],
    extras: ({ sx, sy, sw, sh, finish }) => {
      const iw = sw * 0.29, ih = sh * 0.039, top = sy + sh * 0.0125;
      return `<div class="dv-island" style="${style({ position: 'absolute', left: sx + (sw - iw) / 2, top, width: iw, height: ih, borderRadius: ih, background: finish.island })}"></div>`;
    },
  });
}
