// Creative asset: short phrase on one side, 1–3 floating devices on the other. Default for header and search results.
import { phrase, floatingDevice, assignScreens, popCards, stageGlow, backdrop } from './_creative.mjs';

export const meta = {
  id: 'creative-split', name: 'Creative · split', landscape: true, creative: true,
  summary: 'Short phrase on one side, floating devices on the other; the front screen cycles through features and cards pop in.',
  bestFor: ['header 21:9', 'search results 3:2', 'universal 16:9'], needs: { screens: 1 },
  options: { devices: '1–3 (3)', textSide: 'left|right', textShare: 'width share of the phrase (0.4)', bleed: 'header only: devices run off the bottom edge (true)', cards: 'shot.cards pop in during the loop' },
};

export function render(ctx) {
  const { H, safe, opt, shot } = ctx;
  const side = opt('textSide', ctx.rtl ? 'right' : 'left');
  const share = ctx.headline ? opt('textShare', ctx.creative === 'search' ? 0.38 : 0.4) : 0;
  const textW = safe.w * share;
  const gap = ctx.headline ? safe.w * 0.04 : 0;
  const textX = side === 'left' ? safe.x : safe.x + safe.w - textW;
  const area = { x: side === 'left' ? safe.x + textW + gap : safe.x, y: safe.y, w: safe.w - textW - gap, h: safe.h };
  let html = backdrop(ctx) + phrase(ctx, { x: textX, y: safe.y, w: textW, h: safe.h }, { align: side === 'left' ? 'left' : 'right' });

  const n = Math.max(1, Math.min(3, opt('devices', Math.min(3, ctx.screens.length + 1))));
  const groups = assignScreens(ctx.screens.length, n);
  const cx = area.x + area.w / 2;
  // On the 21:9 header the devices may run off the bottom edge: screen tops stay in the safe area,
  // the lower part sits where the product page draws its own UI.
  const bleed = ctx.creative === 'header' && opt('bleed', true);
  const maxH = bleed ? (H - area.y) * 1.25 : area.h * 1.02;
  const frontW = ctx.fitDevice({ maxW: area.w / (n === 1 ? 1 : n === 2 ? 1.55 : 2.05), maxH });
  const frontH = ctx.deviceHeight(frontW);
  const top = bleed ? area.y + H * 0.02 : area.y + (area.h - frontH) / 2;
  const sideW = frontW * 0.86;
  const spread = frontW * (n === 2 ? 0.62 : 0.74);
  const devices = [];
  if (n >= 2) devices.push(floatingDevice(ctx, { cx: cx + (n === 2 ? spread * 0.5 : spread), top: top + frontH * 0.07, width: sideW, screens: groups[1], rotate: 5, z: 2, phase: 0.33 }));
  if (n === 3) devices.push(floatingDevice(ctx, { cx: cx - spread, top: top + frontH * 0.07, width: sideW, screens: groups[2], rotate: -5, z: 2, phase: 0.66 }));
  const front = floatingDevice(ctx, { cx: n === 2 ? cx - spread * 0.5 : cx, top, width: frontW, screens: groups[0], z: 5, phase: 0 });
  html += stageGlow(ctx, { cx: front.x + front.w / 2, cy: top + frontH * 0.5, size: frontH * 1.25 });
  html += devices.map((d) => d.html).join('') + front.html;
  const visH = Math.min(frontH, H - top);
  html += popCards(ctx, shot.cards, [
    { x: front.x - front.w * 0.55, y: top + visH * 0.2 },
    { x: front.x + front.w * 0.55, y: top + visH * (bleed ? 0.48 : 0.62) },
  ]);
  return html;
}
