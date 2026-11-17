// App icon tile with the iOS squircle radius and a soft lift.
import { style, esc } from '../lib/html.mjs';

export function appIcon({ src, size = 22 }, { u }) {
  const s = u * size;
  if (!src) return '';
  return `<img class="app-icon" src="${esc(src)}" style="${style({ width: s, height: s, borderRadius: s * 0.225, display: 'block', boxShadow: `0 ${s * 0.08}px ${s * 0.22}px rgba(0,0,0,0.25), 0 0 0 ${Math.max(1, s * 0.006)}px rgba(0,0,0,0.06)` })}">`;
}
