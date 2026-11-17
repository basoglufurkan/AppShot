// Pill badge: "NEW", "AI-powered", "Offline", feature tags. Inline element.
import { esc, style, icon as iconHtml, markup } from '../lib/html.mjs';
import { rgba } from '../lib/color.mjs';

export function chip({ text, icon, variant = 'soft', size = 3.4 }, { theme, u }) {
  const fs = u * size;
  const v = {
    solid: { background: theme.accent, color: theme.accentText || '#fff' },
    soft: { background: rgba(theme.accent, theme.dark ? 0.22 : 0.14), color: theme.dark ? theme.text : theme.accent },
    glass: { background: theme.dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.7)', color: theme.text, backdropFilter: `blur(${u * 2}px)` },
    outline: { background: 'transparent', color: theme.text, boxShadow: `inset 0 0 0 ${Math.max(1.5, u * 0.3)}px ${rgba(theme.text, 0.35)}` },
  }[variant] || {};
  return `<span class="chip" style="${style({
    display: 'inline-flex', alignItems: 'center', gap: fs * 0.4, fontFamily: 'var(--font-text)', fontWeight: 650,
    fontSize: fs, lineHeight: 1, padding: `${fs * 0.55}px ${fs * 0.95}px`, borderRadius: fs * 2, letterSpacing: '0.01em', whiteSpace: 'nowrap', ...v,
  })}">${icon ? iconHtml(icon, fs * 1.15) : ''}<span>${markup(text)}</span></span>`;
}
