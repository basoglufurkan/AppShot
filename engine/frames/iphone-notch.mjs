// iPhone with a notch (iPhone X → 14 proportions).
import { shell } from '../lib/device.mjs';
import { style } from '../lib/html.mjs';

export const meta = {
  id: 'iphone-notch', kind: 'phone', label: 'iPhone (notch)',
  screenAspect: 1284 / 2778, finishes: ['black', 'silver', 'white', 'gold', 'blue', 'pink'],
};

export function render({ width, src, color = 'black', shadow, accent, screenAspect = meta.screenAspect, fit, position }) {
  const b = 0.042;
  return shell({
    width, src, screenAspect, fit, position, shadow, accent, finishName: color,
    bezel: { l: b, r: b, t: b, b: b },
    bodyRadius: 0.16, screenRadius: 0.118,
    buttons: [
      { side: 'l', top: 0.17, len: 0.045 },
      { side: 'l', top: 0.24, len: 0.075 },
      { side: 'l', top: 0.33, len: 0.075 },
      { side: 'r', top: 0.26, len: 0.11 },
    ],
    extras: ({ sx, sy, sw, sh, finish }) => {
      const nw = sw * 0.47, nh = sh * 0.036;
      const r = nh * 0.62;
      return `<div class="dv-notch" style="${style({ position: 'absolute', left: sx + (sw - nw) / 2, top: sy - 1, width: nw, height: nh, background: finish.island, borderRadius: `0 0 ${r}px ${r}px` })}"></div>`;
    },
  });
}
