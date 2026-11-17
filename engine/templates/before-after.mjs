// One device, screen split by a slider: before on the left, after on the right.
import { topText, deviceWidth } from './_shared.mjs';
import { esc } from '../lib/html.mjs';

export const meta = {
  id: 'before-after', name: 'Before / after',
  summary: 'Split-screen slider inside one device. Photo/video editors, cleaners, scanners, translators.',
  bestFor: ['photo & video editing', 'AI enhancement', 'cleanup', 'scan → clean document'], needs: { screens: 2, fields: ['labels'] },
  options: { split: 'slider position 0–1 (0.5)', labels: '{before, after} (strings or per-locale objects) on chips' },
};

export function render(ctx) {
  const { W, H, u, opt, shot, L, theme } = ctx;
  const t = topText(ctx);
  const d = ctx.placeDevice({ width: deviceWidth(ctx), cx: W / 2, top: t.bottom + H * 0.022, screen: ctx.screens.length > 1 ? 1 : 0 });
  const before = ctx.screens[0];
  const s = opt('split', 0.5);
  const sx = d.x + d.screen.x, sy = d.y + d.screen.y, sw = d.screen.w, sh = d.screen.h;
  const clip = `<div style="position:absolute;left:${sx}px;top:${sy}px;width:${sw}px;height:${sh}px;border-radius:${d.screen.r}px;overflow:hidden;z-index:3;clip-path:inset(0 ${(1 - s) * 100}% 0 0)"><img src="${esc(before.src)}" style="width:100%;height:100%;object-fit:cover;object-position:top center;display:block"></div>`;
  const lx = sx + sw * s;
  const knob = u * 9;
  const line = `<div style="position:absolute;left:${lx - u * 0.35}px;top:${sy}px;width:${u * 0.7}px;height:${sh}px;background:#fff;z-index:4;box-shadow:0 0 ${u * 2}px rgba(0,0,0,.35)"></div>`
    + `<div style="position:absolute;left:${lx - knob / 2}px;top:${sy + sh * 0.42 - knob / 2}px;width:${knob}px;height:${knob}px;border-radius:50%;background:#fff;z-index:5;display:flex;align-items:center;justify-content:center;box-shadow:0 ${u}px ${u * 3}px rgba(0,0,0,.35)"><svg viewBox="0 0 24 24" width="${knob * 0.6}" height="${knob * 0.6}"><path d="M9 6l-5 6 5 6M15 6l5 6-5 6" stroke="#111" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
  const labels = shot.labels && (shot.labels.before !== undefined || shot.labels.after !== undefined)
    ? { before: L(shot.labels.before), after: L(shot.labels.after) }
    : shot.labels ? L(shot.labels) : null;
  const chips = labels && typeof labels === 'object'
    ? ctx.at(sx + u * 3, sy + sh * 0.1, ctx.c.chip({ text: labels.before || 'Before', variant: 'glass', size: 3 }), { z: 6 })
      + ctx.at(sx + sw - u * 3, sy + sh * 0.1, `<div style="transform:translateX(-100%)">${ctx.c.chip({ text: labels.after || 'After', variant: 'solid', size: 3 })}</div>`, { z: 6 })
    : '';
  return t.html + d.html + clip + line + chips;
}
