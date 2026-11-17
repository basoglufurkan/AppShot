// "Without vs With" columns — kill the objection by contrasting the old way with your app.
import { topText, deviceWidth, pad } from './_shared.mjs';
import { markup } from '../lib/html.mjs';
import { surface } from '../components/_card.mjs';
import { checklist } from '../components/checklist.mjs';
import { style } from '../lib/html.mjs';

export const meta = {
  id: 'comparison', name: 'Comparison',
  summary: 'Two columns: the old way (crosses) versus your app (checks); device below.',
  bestFor: ['switching from spreadsheets/notes/competitors (no competitor names!)', 'premium vs free', 'objection handling'], needs: { screens: 0, fields: ['compare.left', 'compare.right'] },
  options: { 'compare.left': '{title, items[]}', 'compare.right': '{title, items[]}' },
};

export function render(ctx) {
  const { W, H, u, shot, L, theme } = ctx;
  const p = pad(ctx);
  const t = topText(ctx, { h: 0.18 });
  const cmp = shot.compare || {};
  const colW = (W - p * 2 - u * 3) / 2;
  const top = t.bottom + H * 0.02;
  const col = (side, good) => {
    const c = cmp[side] || {};
    const items = L(c.items) || [];
    const sf = surface(theme, u, { radius: 4, pad: [3, 3] });
    const css = good ? { ...sf, background: theme.accent, color: theme.accentText } : { ...sf, background: theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', boxShadow: 'none' };
    const sub = { ...theme, text: good ? theme.accentText : theme.text, accent: good ? theme.accentText : theme.accent, accentText: good ? theme.accent : theme.accentText };
    return `<div style="${style({ ...css, width: colW, minHeight: H * 0.3 })}"><div style="${style({ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: u * 4.6, marginBottom: u * 2.6, lineHeight: 1.1 })}">${markup(L(c.title) || (good ? ctx.appName : '—'))}</div>`
      + checklist({ items: Array.isArray(items) ? items.slice(0, 5) : [items], size: 3.4, mark: good ? 'check' : 'cross', gap: 2 }, { ...ctx, theme: sub })
      + `</div>`;
  };
  const cols = `<div style="position:absolute;left:${p}px;top:${top}px;width:${W - p * 2}px;display:flex;gap:${u * 3}px;align-items:stretch;z-index:5">${col('left', false)}${col('right', true)}</div>`;
  const dev = ctx.screens[0]?.missing ? '' : ctx.placeDevice({ width: deviceWidth(ctx, 0.62), cx: W / 2, top: H * 0.66, z: 1 }).html;
  return t.html + cols + dev;
}
