// Creative asset: a strip of real screens sliding in an endless loop — "show the firsthand experience" in search.
// On a wide safe band (the iPhone search card shows only the top ≈61% of the 3:2 asset, ≈2.46:1) the phrase sits
// beside the strip so whole screens stay visible; on taller canvases it sits on top.
import { phrase, backdrop } from './_creative.mjs';
import { esc } from '../lib/html.mjs';

export const meta = {
  id: 'creative-carousel', name: 'Creative · carousel', landscape: true, creative: true,
  summary: 'Short phrase beside or above a row of rounded screens sliding sideways forever (seamless loop). The interface does the selling; every screen stays whole inside the visible band.',
  bestFor: ['search results 3:2', 'universal 16:9', 'content-rich apps'], needs: { screens: 2 },
  options: { phraseAt: 'side|top (side when the safe area is wider than 2.2:1)', textShare: 'side: width share of the phrase (0.34)', gap: 'gap between screens as a fraction of screen width (0.12)' },
};

export function render(ctx) {
  const { W, H, safe, opt, theme } = ctx;
  let html = backdrop(ctx);
  const side = ctx.headline && opt('phraseAt', safe.w / safe.h > 2.2 ? 'side' : 'top') === 'side';
  const startSide = ctx.rtl ? 'right' : 'left';
  let top = safe.y, height = safe.h, clip = null;
  if (side) {
    // Phrase on the reading side, strip on the other; the strip runs off the far canvas edge and fades in behind the phrase.
    const tw = safe.w * opt('textShare', 0.34);
    const gapX = safe.w * 0.035;
    html += phrase(ctx, { x: ctx.rtl ? safe.x + safe.w - tw : safe.x, y: safe.y, w: tw, h: safe.h }, { align: startSide, k: ctx.creative === 'search' ? 0.08 : 0.075, lines: 3, subhead: '' });
    const fade = safe.w * 0.05;
    clip = ctx.rtl ? { x: 0, w: safe.x + safe.w - tw - gapX + fade, fade, dir: 'left' } : { x: safe.x + tw + gapX - fade, w: W - (safe.x + tw + gapX - fade), fade, dir: 'right' };
  } else if (ctx.headline) {
    const band = safe.h * (ctx.creative === 'search' ? 0.22 : 0.2);
    html += phrase(ctx, { x: safe.x, y: safe.y, w: safe.w, h: band }, { align: 'center', k: ctx.creative === 'search' ? 0.075 : 0.07, lines: 2, subhead: '' });
    top = safe.y + band + safe.h * 0.04;
    height = safe.h - band - safe.h * 0.04;
  }
  const list = ctx.screens.length ? ctx.screens : [{ src: '', aspect: 0.46 }];
  const cardH = height;
  const cards = list.map((sc) => ({ sc, w: cardH * (sc.aspect || 0.46) }));
  const gap = cards[0].w * opt('gap', 0.12);
  const setW = cards.reduce((a, c) => a + c.w + gap, 0);
  const copies = Math.max(2, Math.ceil((W * 2) / setW) + 1);
  const r = cards[0].w * 0.09;
  const shadow = `0 ${H * 0.012}px ${H * 0.03}px rgba(0,0,0,${theme.dark ? 0.45 : 0.18})`;
  let x = 0, row = '';
  for (let c = 0; c < copies; c++) for (const card of cards) {
    row += `<div style="position:absolute;left:${x}px;top:0;width:${card.w}px;height:${cardH}px;border-radius:${r}px;overflow:hidden;box-shadow:${shadow};background:#000"><img src="${esc(card.sc.src)}" style="width:100%;height:100%;object-fit:cover;object-position:top center;display:block"></div>`;
    x += card.w + gap;
  }
  const track = ctx.motion(`<div style="position:relative;width:${x}px;height:${cardH}px">${row}</div>`, { type: 'carousel', distance: setW });
  if (!clip) {
    // Start so the middle of the first copy sits at the canvas centre; the loop shifts exactly one set width.
    const start = W / 2 - setW / 2 - setW;
    return html + `<div style="position:absolute;left:${start}px;top:${top}px;width:${x}px;height:${cardH}px;z-index:3">${track}</div>`;
  }
  // Side mode: a clipped window; shadows need a little room above and below the cards.
  const pad = H * 0.05;
  const start = clip.w / 2 - setW / 2 - setW;
  const mask = `linear-gradient(to ${clip.dir}, transparent 0, #000 ${clip.fade}px)`;
  return html + `<div style="position:absolute;left:${clip.x}px;top:${top - pad}px;width:${clip.w}px;height:${cardH + pad * 2}px;overflow:hidden;z-index:3;-webkit-mask-image:${mask};mask-image:${mask}">`
    + `<div style="position:absolute;left:${start}px;top:${pad}px;width:${x}px;height:${cardH}px">${track}</div></div>`;
}
