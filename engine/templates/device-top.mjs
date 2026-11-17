// Device hangs from the top edge, caption sits below. Shows the lower half of a screen (tab bars, CTAs, bottom sheets).
import { bottomText, deviceWidth } from './_shared.mjs';

export const meta = {
  id: 'device-top', name: 'Device from top',
  summary: 'Device enters from the top edge; caption at the bottom. Great rhythm-breaker after hero shots.',
  bestFor: ['bottom sheets', 'tab bars', 'variety in a set'], needs: { screens: 1 },
  options: { deviceScale: 'device width / canvas width', reveal: 'fraction of device height visible (0.72)' },
};

export function render(ctx) {
  const { W, H, opt } = ctx;
  const t = bottomText(ctx);
  const width = deviceWidth(ctx);
  const dh = ctx.deviceHeight(width);
  const visibleBottom = t.top - H * 0.025;
  // reveal = visible fraction of the device; the rest hangs above the canvas.
  const reveal = opt('reveal', null);
  const top = reveal ? visibleBottom - dh * reveal - (dh * (1 - reveal)) : visibleBottom - dh;
  const d = ctx.placeDevice({ width, cx: W / 2, top: Math.min(top, H * 0.02) });
  return d.html + t.html;
}
