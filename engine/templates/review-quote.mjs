// Real user reviews as cards. Builds trust; never fabricate review text.
import { topText, deviceWidth } from './_shared.mjs';

export const meta = {
  id: 'review-quote', name: 'Review quotes',
  summary: 'Headline + 1–3 genuine review cards; optional device peeking at the bottom.',
  bestFor: ['trust', 'late in the set', 'apps with strong reviews'], needs: { screens: 0, fields: ['quotes[]'] },
  options: { 'quotes[]': '{text, author, rating, source}', showDevice: 'true/false (true)' },
};

export function render(ctx) {
  const { W, H, u, shot, L, opt } = ctx;
  const t = topText(ctx, { h: 0.18 });
  const quotes = (shot.quotes || []).slice(0, 3);
  let y = t.bottom + H * 0.02;
  let html = t.html;
  quotes.forEach((q, i) => {
    const qw = ctx.kind === 'tablet' ? 70 : 84;
    const x = (W - u * qw) / 2 + (i % 2 ? u * 3 : -u * 3);
    html += ctx.at(x, y, ctx.c.quote({ text: L(q.text), author: L(q.author), rating: q.rating ?? 5, w: qw, size: quotes.length > 2 ? 0.85 : 1 }), { rotate: i % 2 ? 1.5 : -1.5, z: 5 + i });
    y += u * (quotes.length > 2 ? 30 : 36);
  });
  if (opt('showDevice', true) && !ctx.screens[0]?.missing) {
    html += ctx.placeDevice({ width: deviceWidth(ctx, 0.66), cx: W / 2, top: Math.max(y + H * 0.01, H * 0.62), z: 1 }).html;
  }
  return html;
}
