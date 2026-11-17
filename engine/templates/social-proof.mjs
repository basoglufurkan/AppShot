// Rating + award laurels + headline, device peeking below. ONLY with real, verifiable numbers.
import { topText, deviceWidth } from './_shared.mjs';

export const meta = {
  id: 'social-proof', name: 'Social proof',
  summary: 'Laurel with a real rating or accolade, optional award row, device peeking from the bottom.',
  bestFor: ['shot 2–4 when the app has real ratings/awards/press', 'trust-sensitive niches'], needs: { screens: 1, fields: ['rating', 'awards[]'] },
  options: { 'rating.value': 'e.g. "4.8" (must be real)', 'rating.label': 'e.g. "12K ratings"', 'awards[]': '{title, sub}', 'rating.source': 'where the number comes from (required by checker)' },
};

export function render(ctx) {
  const { W, H, u, shot, L, theme } = ctx;
  const t = topText(ctx, { h: ctx.kind === 'tablet' ? 0.16 : 0.18 });
  let y = t.bottom + H * 0.02;
  let html = t.html;
  if (shot.rating) {
    const value = Number(String(L(shot.rating.value)).replace(',', '.')) || 5;
    const lr = ctx.c.laurel({ title: L(shot.rating.value), sub: L(shot.rating.label), size: 1.25 });
    const st = ctx.c.stars({ value, size: 5.4 });
    html += `<div style="position:absolute;left:0;top:${y}px;width:${W}px;display:flex;flex-direction:column;align-items:center;gap:${u * 1.6}px;z-index:5">${lr}${st}</div>`;
    y += u * 30;
  }
  const awards = (shot.awards || []).slice(0, 3);
  if (awards.length) {
    const row = awards.map((a) => ctx.c.laurel({ title: L(a.title), sub: L(a.sub), size: awards.length > 2 ? 0.62 : 0.78 })).join('');
    html += `<div style="position:absolute;left:0;top:${y}px;width:${W}px;display:flex;justify-content:center;gap:${u * 4}px;z-index:5;color:${theme.text}">${row}</div>`;
    y += u * 17;
  }
  const d = ctx.placeDevice({ width: deviceWidth(ctx, ctx.kind === 'tablet' ? 0.56 : 0.7), cx: W / 2, top: Math.max(y + H * 0.02, H * 0.5) });
  return html + d.html;
}
