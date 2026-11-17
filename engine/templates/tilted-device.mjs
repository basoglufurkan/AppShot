// Device rotated for energy; optional 3D perspective. Good for 2nd/3rd shots to add motion.
import { topText, deviceWidth } from './_shared.mjs';

export const meta = {
  id: 'tilted-device', name: 'Tilted device', hook: true,
  summary: 'Caption on top, device rotated (2D or 3D perspective) for movement.',
  bestFor: ['dynamic niches', 'fitness', 'games', 'creative tools'], needs: { screens: 1 },
  options: { rotate: 'degrees (-9)', perspective: 'true = 3D tilt instead of flat rotation', deviceScale: 'width ratio (0.84)' },
};

export function render(ctx) {
  const { W, H, opt } = ctx;
  const t = topText(ctx);
  const width = deviceWidth(ctx, opt('deviceScale', ctx.kind === 'tablet' ? 0.72 : 0.84));
  const rot = opt('rotate', ctx.index % 2 ? 8 : -9);
  const d = ctx.placeDevice({
    width, cx: W / 2 + (rot < 0 ? W * 0.03 : -W * 0.03), top: t.bottom + H * 0.035,
    rotate: opt('perspective', false) ? undefined : rot,
    tilt: opt('perspective', false) ? { x: 14, y: rot * 2.2 } : undefined,
  });
  return t.html + d.html;
}
