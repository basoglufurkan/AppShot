// Background cut diagonally into two colours, device crossing the cut. Bold, editorial energy.
import { topText, deviceWidth } from './_shared.mjs';
import { mix } from '../lib/color.mjs';

export const meta = {
  id: 'split-diagonal', name: 'Diagonal split',
  summary: 'Accent-coloured diagonal panel behind a tilted device.',
  bestFor: ['variety mid-set', 'bold brands', 'sports', 'finance'], needs: { screens: 1 },
  options: { panel: 'panel colour (theme accent)', cut: 'cut height 0–1 (0.55)', rotate: 'device degrees (-6)' },
};

export function render(ctx) {
  const { W, H, opt, theme } = ctx;
  const t = topText(ctx);
  const cut = opt('cut', 0.55);
  const panel = opt('panel', theme.dark ? mix(theme.accent, '#000000', 0.25) : theme.accent);
  const poly = `<div style="position:absolute;inset:0;background:${panel};clip-path:polygon(0 ${cut * 100 + 12}%, 100% ${cut * 100 - 12}%, 100% 100%, 0 100%);z-index:0"></div>`;
  const d = ctx.placeDevice({ width: deviceWidth(ctx, 0.78), cx: W / 2, top: t.bottom + H * 0.03, rotate: opt('rotate', -6) });
  return poly + t.html + d.html;
}
