// 2–4 flat screens in a staggered grid — "everything in one app" breadth shot.
import { topText } from './_shared.mjs';

export const meta = {
  id: 'screen-grid', name: 'Screen grid',
  summary: 'Two to four frameless screens in a staggered grid.',
  bestFor: ['breadth', 'all-in-one apps', 'templates & themes', 'closing shot'], needs: { screens: 2 },
  options: { gap: 'gap between screens in u (4)' },
};

export function render(ctx) {
  const { W, H, u, opt } = ctx;
  const t = topText(ctx, { h: 0.2 });
  const n = Math.min(4, Math.max(2, ctx.screens.length));
  const gap = u * opt('gap', 4);
  const cols = 2;
  const colW = (W - gap * 3) / cols;
  const top = t.bottom + H * 0.02;
  let html = t.html;
  for (let i = 0; i < n; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const dev = ctx.device({ width: colW, screen: i, frame: 'flat' });
    const stagger = col ? H * 0.06 : 0;
    const x = gap + col * (colW + gap);
    const y = top + stagger + row * (dev.height + gap);
    html += ctx.at(x, y, dev.html, { w: dev.width, h: dev.height, z: 2 });
  }
  return html;
}
