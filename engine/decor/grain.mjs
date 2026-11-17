// Film grain overlay — kills gradient banding and adds a printed feel. {type:'grain', opacity}
import { style } from '../lib/html.mjs';

const svg = (freq) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`)}`;

export function render(spec, { W, H }) {
  return `<div class="decor grain" style="${style({
    position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: spec.opacity ?? 0.07,
    backgroundImage: `url("${svg(spec.frequency ?? 0.85)}")`, backgroundSize: `${Math.round(W / 4)}px`,
    mixBlendMode: spec.blend || 'overlay', pointerEvents: 'none',
  })}"></div>`;
}
