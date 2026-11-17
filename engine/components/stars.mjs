// Star rating row. Only render with a REAL rating (the checker flags placeholder values).
import { style } from '../lib/html.mjs';

const STAR = 'M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9 5.6 21.4 7 14.3 1.7 9.3l7.2-.9z';

export function stars({ value = 5, size = 4, color = '#FFC43D', gap = 0.6 }, { u }) {
  const s = u * size;
  let out = '';
  for (let i = 0; i < 5; i++) {
    const fill = Math.max(0, Math.min(1, value - i));
    const id = `st${Math.random().toString(36).slice(2, 8)}`;
    out += `<svg viewBox="0 0 24 24" width="${s}" height="${s}" style="display:block"><defs><linearGradient id="${id}"><stop offset="${fill * 100}%" stop-color="${color}"/><stop offset="${fill * 100}%" stop-color="${color}" stop-opacity="0.25"/></linearGradient></defs><path d="${STAR}" fill="url(#${id})"/></svg>`;
  }
  return `<div class="stars" style="${style({ display: 'inline-flex', gap: s * gap * 0.25 })}">${out}</div>`;
}
