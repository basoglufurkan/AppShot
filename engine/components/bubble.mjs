// Chat bubble for AI-assistant, messaging, coaching and support apps.
import { style, markup, icon as iconHtml } from '../lib/html.mjs';

export function bubble({ text, from = 'user', w = 70, avatar }, { theme, u }) {
  const mine = from === 'user';
  const bg = mine ? theme.accent : theme.dark ? 'rgba(255,255,255,0.12)' : '#FFFFFF';
  const fg = mine ? theme.accentText || '#fff' : theme.text;
  const r = u * 5;
  const av = !mine && avatar ? `<div style="${style({ width: u * 8, height: u * 8, borderRadius: '50%', overflow: 'hidden', flex: 'none', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' })}">${iconHtml(avatar, u * 8)}</div>` : '';
  return `<div class="bubble" style="${style({ display: 'flex', gap: u * 2, alignItems: 'flex-end', justifyContent: mine ? 'flex-end' : 'flex-start' })}">${av}`
    + `<div style="${style({
      maxWidth: u * w, padding: `${u * 2.6}px ${u * 3.6}px`, background: bg, color: fg, fontFamily: 'var(--font-text)',
      fontSize: u * 3.6, lineHeight: 1.35, fontWeight: 500, borderRadius: mine ? `${r}px ${r}px ${u}px ${r}px` : `${r}px ${r}px ${r}px ${u}px`,
      boxShadow: `0 ${u * 1.2}px ${u * 3.5}px rgba(0,0,0,${theme.dark ? 0.35 : 0.12})`,
    })}">${markup(text)}</div></div>`;
}
