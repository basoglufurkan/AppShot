// Headline + 3–4 benefit bullets, device below. Packs several small features into one shot.
import { topText, deviceWidth, pad } from './_shared.mjs';

export const meta = {
  id: 'feature-list', name: 'Feature list',
  summary: 'Left-aligned headline, checklist of benefits, device rising from the bottom.',
  bestFor: ['later shots', 'bundling minor features', 'pro / premium perks'], needs: { screens: 1, fields: ['bullets[]'] },
  options: { deviceScale: 'width ratio (0.74)' },
};

export function render(ctx) {
  const { W, H, shot, L } = ctx;
  const p = pad(ctx);
  const t = topText(ctx, { align: 'left', h: ctx.kind === 'tablet' ? 0.15 : 0.17, max: 9 });
  const raw = L(shot.bullets) || [];
  const items = (Array.isArray(raw) ? raw : [raw]).slice(0, 4);
  const size = ctx.kind === 'tablet' ? 3.6 : 4.1;
  const list = ctx.c.checklist({ items, size });
  const listTop = t.bottom + H * 0.018;
  const listH = items.length * ctx.u * (size * 1.3 + 2.4);
  const listHtml = ctx.at(p, listTop, list, { w: W - p * 2, h: listH, z: 5 });
  const d = ctx.placeDevice({ width: deviceWidth(ctx, ctx.kind === 'tablet' ? 0.62 : 0.74), cx: W / 2, top: listTop + listH + H * 0.02 });
  return t.html + listHtml + d.html;
}
