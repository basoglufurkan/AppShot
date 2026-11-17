// Panorama only: a device straddles the seam between this shot and the next, tying the set together.
import { pad, deviceWidth } from './_shared.mjs';
import * as hero from './hero-device.mjs';

export const meta = {
  id: 'bridge', name: 'Panorama bridge',
  summary: 'Caption on the left half; device centred on the right edge so it continues into the next screenshot.',
  bestFor: ['panorama sets', 'linking two screenshots', 'premium feel'], needs: { screens: 1, panorama: true },
  options: { rotate: 'device degrees (8)', deviceScale: 'width ratio (0.86)' },
};

export function render(ctx) {
  if (!ctx.panorama || ctx.isLast) return hero.render(ctx);
  const { W, H, opt } = ctx;
  const p = pad(ctx);
  const text = ctx.text({ x: p, y: H * 0.07, w: W * 0.62, h: H * 0.3, align: 'left', valign: 'top', max: 10.5, lines: 4 });
  const d = ctx.placeDevice({ width: deviceWidth(ctx, opt('deviceScale', 0.86)), cx: W, top: H * 0.34, rotate: opt('rotate', 8), z: 20 });
  return text + d.html;
}
