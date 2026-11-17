// Three devices fanned out — breadth of features or variety of content (themes, templates, results).
import { topText, deviceWidth } from './_shared.mjs';

export const meta = {
  id: 'trio-fan', name: 'Three-device fan',
  summary: 'Centre device in front, two angled devices behind. Communicates variety and depth.',
  bestFor: ['templates', 'themes', 'content variety', 'closing shot'], needs: { screens: 3 },
  options: { angle: 'side device rotation (11)', deviceScale: 'centre width ratio (0.56)' },
};

export function render(ctx) {
  const { W, H, opt } = ctx;
  const t = topText(ctx);
  const width = deviceWidth(ctx, opt('deviceScale', ctx.kind === 'tablet' ? 0.46 : 0.56));
  const a = opt('angle', 11);
  const top = t.bottom + H * 0.04;
  const n = ctx.screens.length;
  const left = ctx.placeDevice({ width: width * 0.9, cx: W * 0.24, top: top + H * 0.045, screen: n > 1 ? 1 : 0, rotate: -a, z: 1 });
  const right = ctx.placeDevice({ width: width * 0.9, cx: W * 0.76, top: top + H * 0.045, screen: n > 2 ? 2 : 0, rotate: a, z: 1 });
  const mid = ctx.placeDevice({ width, cx: W / 2, top, screen: 0, z: 3 });
  return t.html + left.html + right.html + mid.html;
}
