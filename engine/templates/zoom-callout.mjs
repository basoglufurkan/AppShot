// Device plus a magnified crop of one detail — makes small UI readable at thumbnail size.
import { topText, deviceWidth } from './_shared.mjs';

export const meta = {
  id: 'zoom-callout', name: 'Zoom callout',
  summary: 'Device on one side, a big magnified detail (chart, card, button) overlapping it.',
  bestFor: ['dense dashboards', 'charts', 'small but key UI', 'smart detail'], needs: { screens: 1, fields: ['zoom.rect'] },
  options: { 'zoom.rect': '[x,y,w,h] fractions of the screenshot', 'zoom.side': 'right|left', 'zoom.shape': 'rounded|circle', 'zoom.zoom': 'magnification vs on-device size (1.6)', 'zoom.scale': 'force magnifier width / canvas width', 'zoom.dim': 'darken everything else 0–1 (0)' },
};

export function render(ctx) {
  const { W, H, shot, theme, u } = ctx;
  const z = shot.zoom || { rect: [0.06, 0.3, 0.88, 0.18] };
  const side = z.side || (ctx.rtl ? 'left' : 'right');
  const t = topText(ctx);
  const width = deviceWidth(ctx, ctx.kind === 'tablet' ? 0.62 : 0.7);
  const cx = side === 'right' ? W * 0.4 : W * 0.6;
  const d = ctx.placeDevice({ width, cx, top: t.bottom + H * 0.03, z: 1 });
  const sc = ctx.screens[0];
  const [rx, ry, rw, rh] = z.rect;
  // Region on the device screen (canvas coords).
  const regX = d.x + d.screen.x + rx * d.screen.w;
  const regY = d.y + d.screen.y + ry * d.screen.h;
  const regW = rw * d.screen.w, regH = rh * d.screen.h;
  // Magnify at least ~1.6× the on-device size, but never wider than the canvas allows.
  const minW = z.shape === 'circle' ? W * 0.5 : Math.min(W * 0.92, regW * (z.zoom ?? 1.6));
  const mw = z.scale ? W * z.scale : Math.max(minW, W * (z.shape === 'circle' ? 0.5 : 0.6));
  const mag = ctx.c.magnifier({ src: sc.src, rect: z.rect, w: mw, shape: z.shape || 'rounded', imgAspect: sc.aspect });
  const mX = mw > W * 0.8 ? (W - mw) / 2 : side === 'right' ? W - mw - W * 0.045 : W * 0.045;
  const mY = Math.min(H - mag.height - H * 0.05, Math.max(t.bottom + H * 0.05, regY + regH / 2 - mag.height / 2 + H * 0.06));
  const ring = `<div style="position:absolute;left:${regX - u}px;top:${regY - u}px;width:${regW + 2 * u}px;height:${regH + 2 * u}px;border-radius:${u * 2.2}px;border:${Math.max(2, u * 0.55)}px solid ${theme.accent};z-index:3;box-shadow:0 0 0 ${u * 30}px rgba(0,0,0,${z.dim ?? 0})"></div>`;
  const magHtml = ctx.at(mX, mY, mag.html, { w: mw, h: mag.height, z: 4 });
  return t.html + d.html + ring + magHtml;
}
