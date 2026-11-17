// iPhone with Home button (iPhone 6–8 Plus proportions, for the legacy 5.5" slot).
import { shell } from '../lib/device.mjs';
import { style } from '../lib/html.mjs';

export const meta = {
  id: 'iphone-classic', kind: 'phone', label: 'iPhone (Home button)',
  screenAspect: 1242 / 2208, finishes: ['white', 'black', 'silver', 'gold'],
};

export function render({ width, src, color = 'white', shadow, accent, screenAspect = meta.screenAspect, fit, position }) {
  return shell({
    width, src, screenAspect, fit, position, shadow, accent, finishName: color,
    bezel: { l: 0.065, r: 0.065, t: 0.24, b: 0.24 },
    bodyRadius: 0.17, screenRadius: 0.004, innerBorder: 0.002,
    buttons: [
      { side: 'l', top: 0.13, len: 0.04 },
      { side: 'l', top: 0.2, len: 0.065 },
      { side: 'l', top: 0.28, len: 0.065 },
      { side: 'r', top: 0.2, len: 0.07 },
    ],
    extras: ({ W, H, sy, sh, finish }) => {
      const d = W * 0.15;
      const ring = finish.clay ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.18)';
      const home = `<div style="${style({ position: 'absolute', left: (W - d) / 2, top: sy + sh + (H - sy - sh - d) / 2, width: d, height: d, borderRadius: '50%', boxShadow: `inset 0 0 0 ${Math.max(1, W * 0.005)}px ${ring}` })}"></div>`;
      const sp = `<div style="${style({ position: 'absolute', left: W * 0.4, top: sy * 0.48, width: W * 0.2, height: W * 0.018, borderRadius: W, background: 'rgba(0,0,0,0.28)' })}"></div>`;
      const cam = `<div style="${style({ position: 'absolute', left: W * 0.5 - W * 0.012, top: sy * 0.25, width: W * 0.024, height: W * 0.024, borderRadius: '50%', background: 'rgba(0,0,0,0.35)' })}"></div>`;
      return home + sp + cam;
    },
  });
}
