// Benefit checklist with tick circles (feature-list and comparison layouts).
import { style, markup } from '../lib/html.mjs';
import { rgba } from '../lib/color.mjs';

export function checklist({ items = [], size = 4.2, mark = 'check', color, gap = 2.4 }, { theme, u }) {
  const s = u * size;
  const c = color || theme.accent;
  const glyph = mark === 'cross'
    ? `<path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>`
    : `<path d="M6 12.5l4 4 8-9" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<div class="checklist" style="${style({ display: 'flex', flexDirection: 'column', gap: u * gap })}">`
    + items.map((t) => `<div style="${style({ display: 'flex', alignItems: 'center', gap: s * 0.6, fontFamily: 'var(--font-text)', fontSize: s, fontWeight: 600, lineHeight: 1.2, color: theme.text })}">`
      + `<span style="${style({ width: s * 1.3, height: s * 1.3, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: mark === 'cross' ? rgba(theme.text, 0.12) : c, color: mark === 'cross' ? rgba(theme.text, 0.55) : theme.accentText || '#fff' })}"><svg viewBox="0 0 24 24" width="${s * 0.9}" height="${s * 0.9}">${glyph}</svg></span>`
      + `<span>${markup(t)}</span></div>`).join('')
    + `</div>`;
}
