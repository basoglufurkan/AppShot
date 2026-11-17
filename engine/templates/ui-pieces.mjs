// "Exploded UI": crops of real interface pieces float above a dimmed device, each one legible.
import { topText, deviceWidth } from './_shared.mjs';

export const meta = {
  id: 'ui-pieces', name: 'Exploded UI pieces',
  summary: 'Device in the background, 1–3 magnified crops of its UI floating in front with depth.',
  bestFor: ['widgets', 'cards', 'settings that matter', 'dense UIs'], needs: { screens: 1, fields: ['pieces[]'] },
  options: { 'pieces[]': '{rect:[x,y,w,h] of screenshot, x, y (canvas fractions), w (canvas fraction), rotate, screen}', dim: 'device dim 0–1 (0.35)' },
};

export function render(ctx) {
  const { W, H, shot, opt } = ctx;
  const t = topText(ctx);
  const d = ctx.placeDevice({ width: deviceWidth(ctx, 0.72), cx: W / 2, top: t.bottom + H * 0.03, z: 1 });
  const dim = opt('dim', 0.35);
  const shade = `<div style="position:absolute;left:${d.x + d.screen.x}px;top:${d.y + d.screen.y}px;width:${d.screen.w}px;height:${d.screen.h}px;border-radius:${d.screen.r}px;background:rgba(0,0,0,${dim});z-index:2"></div>`;
  const pieces = (shot.pieces || []).slice(0, 3).map((pc, i) => {
    const sc = ctx.screens[pc.screen || 0];
    const w = W * (pc.w ?? 0.82);
    const m = ctx.c.magnifier({ src: sc.src, rect: pc.rect, w, imgAspect: sc.aspect });
    const x = pc.x !== undefined ? pc.x * W : (W - w) / 2;
    const y = pc.y !== undefined ? pc.y * H : t.bottom + H * (0.1 + i * 0.18);
    return ctx.at(x, y, m.html, { w, h: m.height, rotate: pc.rotate ?? (i % 2 ? 2 : -2), z: 5 + i });
  }).join('');
  return t.html + d.html + shade + pieces;
}
