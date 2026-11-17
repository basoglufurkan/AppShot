// Matte single-colour "clay" phone. Pass any CSS colour as options.deviceColor (default: warm grey #E9E6E1).
import { shell } from '../lib/device.mjs';
import { style } from '../lib/html.mjs';

export const meta = { id: 'clay', kind: 'phone', label: 'Clay (matte, any colour)', screenAspect: 1320 / 2868, finishes: ['any CSS colour'] };

export function render({ width, src, color, accent, shadow, screenAspect = meta.screenAspect, fit, position }) {
  const b = 0.04;
  return shell({
    width, src, screenAspect, fit, position, shadow: shadow ?? 'float', accent,
    finishName: color && !color.startsWith('#') && !color.startsWith('rgb') ? '#E9E6E1' : (color || '#E9E6E1'),
    bezel: { l: b, r: b, t: b, b: b },
    bodyRadius: 0.17, screenRadius: 0.13,
    buttons: [],
    extras: ({ sx, sy, sw, sh }) => {
      const iw = sw * 0.29, ih = sh * 0.039;
      return `<div style="${style({ position: 'absolute', left: sx + (sw - iw) / 2, top: sy + sh * 0.0125, width: iw, height: ih, borderRadius: ih, background: '#0b0b0b' })}"></div>`;
    },
  });
}
