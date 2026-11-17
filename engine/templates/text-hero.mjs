// Typography only: app icon, statement, chips. Strong brand opener or a confident closing shot.
import { pad } from './_shared.mjs';

export const meta = {
  id: 'text-hero', name: 'Text hero', hook: true,
  summary: 'App icon + giant statement + optional chips/rating. No device.',
  bestFor: ['brand-led first shot', 'closing shot', 'manifesto', 'when UI is not yet impressive'], needs: { screens: 0, fields: ['chips[]'] },
  options: { textSize: 'headline size in u (13)', showIcon: 'true/false (true)' },
};

export function render(ctx) {
  const { W, H, u, shot, L, opt } = ctx;
  const p = pad(ctx);
  let html = '';
  const chipsH = shot.chips?.length ? u * 12 : 0;
  const iconH = opt('showIcon', true) && ctx.appIcon ? u * 26 + H * 0.04 : 0;
  // Centre the whole block (icon + statement + chips) optically, slightly above the middle.
  let y = Math.max(H * 0.1, (H - (iconH + H * 0.3 + chipsH)) * 0.42);
  if (opt('showIcon', true) && ctx.appIcon) {
    const s = 26;
    html += ctx.at(W / 2 - (u * s) / 2, y, ctx.c.appIcon({ src: ctx.appIcon, size: s }), { z: 5 });
    y += u * s + H * 0.04;
  }
  const textH = H * 0.3;
  html += ctx.text({ x: p, y, w: W - p * 2, h: textH, valign: 'top', max: opt('textSize', 13), min: 7, lines: 4 });
  const chips = (shot.chips || []).map((c) => ctx.c.chip({ text: L(c.text ?? c), icon: c.icon, variant: c.variant || 'soft', size: 3.6 })).join('');
  if (chips) html += `<div style="position:absolute;left:${p}px;top:${y + textH + H * 0.02}px;width:${W - p * 2}px;display:flex;flex-wrap:wrap;justify-content:center;gap:${u * 2}px;z-index:5">${chips}</div>`;
  return html;
}
