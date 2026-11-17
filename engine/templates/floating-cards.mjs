// Device with insight cards floating around it ("+12% this week", "7-day streak").
import { topText, deviceWidth } from './_shared.mjs';

export const meta = {
  id: 'floating-cards', name: 'Floating cards', hook: true,
  summary: 'Device centred, 2–4 stat/insight cards floating over its edges.',
  bestFor: ['progress & results', 'health stats', 'finance insights', 'AI outputs'], needs: { screens: 1, fields: ['cards[]'] },
  options: { 'cards[].pos': 'tl|tr|ml|mr|bl|br', 'cards[].w': 'card width in u (44)' },
};

const POS = { tl: ['l', 0.39], tr: ['r', 0.42], ml: ['l', 0.56], mr: ['r', 0.6], bl: ['l', 0.74], br: ['r', 0.78] };
const ORDER = ['tr', 'ml', 'br', 'tl', 'mr', 'bl'];

export function render(ctx) {
  const { W, H, u, shot, L } = ctx;
  const t = topText(ctx);
  const width = deviceWidth(ctx, ctx.kind === 'tablet' ? 0.6 : 0.72);
  const d = ctx.placeDevice({ width, cx: W / 2, top: t.bottom + H * 0.025, z: 1 });
  const cards = (shot.cards || []).slice(0, 4).map((c, i) => {
    const pos = c.pos || ORDER[i];
    const [side, fy] = POS[pos] || POS.tr;
    const cw = c.w ?? 44;
    const x = side === 'l' ? W * 0.035 : W - u * cw - W * 0.035;
    const html = ctx.c.statCard({ icon: c.icon, title: L(c.title), value: L(c.value), trend: L(c.trend), w: cw, size: c.size ?? 1 });
    return ctx.at(x, H * (c.y ?? fy), html, { rotate: c.rotate ?? (side === 'l' ? -2.5 : 2.5), z: 4 });
  }).join('');
  return t.html + d.html + cards;
}
