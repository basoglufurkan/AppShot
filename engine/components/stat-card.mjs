// Floating stat/insight card: icon + big value + label. Used by floating-cards and big-number.
import { style, icon as iconHtml, markup, round } from '../lib/html.mjs';
import { surface } from './_card.mjs';
import { rgba } from '../lib/color.mjs';

export function statCard({ icon, title, value, trend, w = 40, size = 1 }, { theme, u }) {
  const s = size;
  const sf = surface(theme, u, { radius: 3.6 * s, pad: [2.4 * s, 2.8 * s] });
  const iconBox = icon ? `<div style="${style({
    width: u * 8.4 * s, height: u * 8.4 * s, borderRadius: u * 2.4 * s, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: rgba(theme.accent, theme.dark ? 0.24 : 0.14),
  })}">${iconHtml(icon, u * 5.2 * s)}</div>` : '';
  const trendHtml = trend ? `<span style="${style({ color: theme.positive || '#22C55E', fontWeight: 700, fontSize: u * 2.8 * s, marginLeft: u * 1.2 })}">${markup(trend)}</span>` : '';
  return `<div class="stat-card" style="${style({ ...sf, width: u * w, display: 'flex', alignItems: 'center', gap: u * 2.4 * s, fontFamily: 'var(--font-text)' })}">`
    + iconBox
    + `<div style="min-width:0">`
    + (value ? `<div style="${style({ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: u * 5.2 * s, lineHeight: 1.05, letterSpacing: '-0.02em', whiteSpace: 'nowrap' })}">${markup(value)}${trendHtml}</div>` : '')
    + (title ? `<div style="${style({ fontSize: u * 3 * s, lineHeight: 1.2, opacity: 0.68, marginTop: round(u * 0.5), fontWeight: 550 })}">${markup(title)}</div>` : '')
    + `</div></div>`;
}
