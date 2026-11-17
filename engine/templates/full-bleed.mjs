// The screenshot IS the canvas: content-first apps (photo, video, maps, games) where pixels sell.
import { pad } from './_shared.mjs';
import { esc } from '../lib/html.mjs';

export const meta = {
  id: 'full-bleed', name: 'Full bleed', hook: true,
  summary: 'Screenshot fills the canvas edge to edge under a gradient scrim with the caption.',
  bestFor: ['photo/video/camera', 'maps', 'games', 'immersive content'], needs: { screens: 1 },
  options: { scrim: 'top|bottom (top)', scrimStrength: '0–1 (0.88)', blur: 'blur of the UI under the caption in u (1.6, 0 = off)', focus: 'object-position of the screenshot' },
};

export function render(ctx) {
  const { W, H, opt, theme } = ctx;
  const p = pad(ctx);
  const sc = ctx.screens[0];
  const where = opt('scrim', 'top');
  const k = opt('scrimStrength', 0.88);
  const dir = where === 'top' ? '180deg' : '0deg';
  const scrim = `linear-gradient(${dir}, rgba(0,0,0,${k}) 0%, rgba(0,0,0,${k * 0.82}) 26%, rgba(0,0,0,${k * 0.35}) 38%, rgba(0,0,0,0) 50%)`;
  // Blur the UI under the caption band so app text never competes with the headline.
  const mask = `linear-gradient(${dir}, #000 0%, #000 30%, transparent 44%)`;
  const img = `<img src="${esc(sc.src)}" style="position:absolute;inset:0;width:${W}px;height:${H}px;object-fit:cover;object-position:${opt('focus', 'center top')};z-index:1">`
    + `<div style="position:absolute;inset:0;z-index:2;backdrop-filter:blur(${Math.round(ctx.u * opt('blur', 1.6))}px);-webkit-backdrop-filter:blur(${Math.round(ctx.u * opt('blur', 1.6))}px);-webkit-mask-image:${mask};mask-image:${mask}"></div>`
    + `<div style="position:absolute;inset:0;background:${scrim};z-index:3"></div>`;
  const h = H * 0.24;
  const y = where === 'top' ? H * 0.05 : H * 0.95 - h;
  return img + ctx.text({ x: p, y, w: W - p * 2, h, valign: 'center', color: '#fff', subColor: 'rgba(255,255,255,0.85)', max: opt('textSize', 10.5) });
}
