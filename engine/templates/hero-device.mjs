// Big headline on top, one large device bleeding off the bottom. The workhorse — safest first shot.
import { topText, deviceWidth } from './_shared.mjs';

export const meta = {
  id: 'hero-device', name: 'Hero device', hook: true,
  summary: 'Headline band on top, one large device rising from the bottom edge.',
  bestFor: ['first shot', 'core screen', 'any niche'], needs: { screens: 1 },
  options: { deviceScale: 'device width / canvas width (0.8 phone, 0.74 tablet)', bleed: 'false = fit whole device', rotate: 'degrees', textSize: 'max headline size in u (10)' },
};

export function render(ctx) {
  const { W, H, opt } = ctx;
  const t = topText(ctx);
  const top = t.bottom + H * 0.022;
  let width = deviceWidth(ctx);
  if (opt('bleed', true) === false) width = ctx.fitDevice({ maxW: width, maxH: H - top - H * 0.04 });
  const d = ctx.placeDevice({ width, cx: W / 2, top, rotate: opt('rotate', 0) });
  return t.html + d.html;
}
