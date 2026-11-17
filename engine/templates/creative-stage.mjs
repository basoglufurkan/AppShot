// Creative asset: hero devices fanned on a stage, little or no text — key art for the product page header.
import { phrase, floatingDevice, assignScreens, stageGlow, backdrop } from './_creative.mjs';

export const meta = {
  id: 'creative-stage', name: 'Creative · stage', landscape: true, creative: true,
  summary: 'Three to five devices fanned around a centre hero on a glowing stage; optional short phrase above. One clear idea, no clutter.',
  bestFor: ['header 21:9', 'universal 16:9', 'brands whose UI is the hero'], needs: { screens: 1 },
  options: { devices: '3 or 5 (5 on 21:9, 3 otherwise)' },
};

export function render(ctx) {
  const { W, H, safe, opt } = ctx;
  let html = backdrop(ctx);
  let area = { ...safe };
  if (ctx.headline) {
    const band = safe.h * 0.24;
    html += phrase(ctx, { x: safe.x, y: safe.y, w: safe.w, h: band }, { align: 'center', k: 0.085, lines: 2, subhead: '' });
    area = { x: safe.x, y: safe.y + band + safe.h * 0.03, w: safe.w, h: safe.h - band - safe.h * 0.03 };
  }
  const n = opt('devices', W / H > 2 ? 5 : 3) >= 5 ? 5 : 3;
  const groups = assignScreens(ctx.screens.length, n);
  const frontW = ctx.fitDevice({ maxW: area.w / (n === 5 ? 3.6 : 2.4), maxH: area.h * 1.08 });
  const frontH = ctx.deviceHeight(frontW);
  const top = area.y + (area.h - frontH) / 2;
  const cx = W / 2;
  html += stageGlow(ctx, { cx, cy: top + frontH * 0.55, size: frontH * 1.5 });
  const ring = n === 5 ? [[2, 0.72, 1.62, 9], [1, 0.84, 0.86, 5]] : [[1, 0.84, 0.8, 6]];
  for (const [slot, scale, off, rot] of ring) {
    for (const dir of [-1, 1]) {
      const g = groups[dir < 0 ? slot * 2 - 1 : slot * 2] || groups[slot] || [0];
      html += floatingDevice(ctx, { cx: cx + dir * frontW * off, top: top + frontH * (1 - scale) * 0.6, width: frontW * scale, screens: g, rotate: dir * rot, z: 3 - slot, phase: (slot * 0.21 + (dir > 0 ? 0.5 : 0)) % 1 }).html;
    }
  }
  html += floatingDevice(ctx, { cx, top, width: frontW, screens: groups[0], z: 6, phase: 0.1 }).html;
  return html;
}
