// iOS-style notification banner. Great for reminder, habit, finance alert and delivery apps.
import { style, esc, markup, icon as iconHtml } from '../lib/html.mjs';

export function notification({ app, icon, title, body, time = 'now', w = 84, dark }, { theme, u }) {
  const isDark = dark ?? theme.dark;
  const bg = isDark ? 'rgba(40,40,46,0.78)' : 'rgba(250,250,252,0.86)';
  const fg = isDark ? '#fff' : '#111';
  const ic = u * 8.2;
  return `<div class="notif" style="${style({
    width: u * w, display: 'flex', gap: u * 2.6, alignItems: 'flex-start', padding: `${u * 2.6}px ${u * 3}px`,
    borderRadius: u * 5.2, background: bg, color: fg, fontFamily: 'var(--font-text)',
    backdropFilter: `blur(${u * 3}px) saturate(1.6)`, WebkitBackdropFilter: `blur(${u * 3}px) saturate(1.6)`,
    boxShadow: `0 ${u * 1.6}px ${u * 5}px rgba(0,0,0,${isDark ? 0.45 : 0.16})`,
  })}">`
    + `<div style="${style({ width: ic, height: ic, borderRadius: ic * 0.24, overflow: 'hidden', flex: 'none', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' })}">${icon ? iconHtml(icon, ic) : ''}</div>`
    + `<div style="flex:1;min-width:0">`
    + `<div style="${style({ display: 'flex', justifyContent: 'space-between', fontSize: u * 2.9, fontWeight: 650, lineHeight: 1.2, opacity: 0.9 })}"><span>${esc(app || '')}</span><span style="opacity:.55;font-weight:500">${esc(time)}</span></div>`
    + (title ? `<div style="${style({ fontSize: u * 3.3, fontWeight: 650, lineHeight: 1.25, marginTop: u * 0.4 })}">${markup(title)}</div>` : '')
    + (body ? `<div style="${style({ fontSize: u * 3.2, lineHeight: 1.3, opacity: 0.86, marginTop: u * 0.3 })}">${markup(body)}</div>` : '')
    + `</div></div>`;
}
