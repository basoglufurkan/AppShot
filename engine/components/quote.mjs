// Review quote card. Use REAL review text (App Store / Play reviews, with permission where required).
import { style, markup, esc } from '../lib/html.mjs';
import { surface } from './_card.mjs';
import { stars } from './stars.mjs';

export function quote({ text, author, rating = 5, w = 80, size = 1 }, ctx) {
  const { theme, u } = ctx;
  const sf = surface(theme, u, { radius: 4.4, pad: [3.6 * size, 4 * size] });
  return `<div class="quote" style="${style({ ...sf, width: u * w, fontFamily: 'var(--font-text)' })}">`
    + (rating ? `<div style="margin-bottom:${u * 1.8}px">${stars({ value: rating, size: 4.2 * size }, ctx)}</div>` : '')
    + `<div style="${style({ fontSize: u * 4.1 * size, lineHeight: 1.36, fontWeight: 550 })}">“${markup(text)}”</div>`
    + (author ? `<div style="${style({ fontSize: u * 3 * size, marginTop: u * 2, opacity: 0.6, fontWeight: 600 })}">— ${esc(author)}</div>` : '')
    + `</div>`;
}
