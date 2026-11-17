// Two overlapping devices — show a flow (input → result) or two related screens.
import { topText, deviceWidth } from './_shared.mjs';

export const meta = {
  id: 'duo-devices', name: 'Two devices',
  summary: 'Back device offset left, front device offset right; tells a two-step story.',
  bestFor: ['before → after flows', 'input → result', 'two key screens'], needs: { screens: 2 },
  options: { spread: 'horizontal offset (0.17)', rotate: 'degrees for both (5)', deviceScale: 'width ratio (0.62)' },
};

export function render(ctx) {
  const { W, H, opt } = ctx;
  const t = topText(ctx);
  const width = deviceWidth(ctx, opt('deviceScale', ctx.kind === 'tablet' ? 0.55 : 0.64));
  const spread = W * opt('spread', 0.17);
  const rot = opt('rotate', 5);
  const back = ctx.placeDevice({ width: width * 0.94, cx: W / 2 - spread, top: t.bottom + H * 0.03, screen: 0, rotate: -rot, z: 1 });
  const front = ctx.placeDevice({ width, cx: W / 2 + spread, top: t.bottom + H * 0.085, screen: ctx.screens.length > 1 ? 1 : 0, rotate: rot, z: 2 });
  return t.html + back.html + front.html;
}
