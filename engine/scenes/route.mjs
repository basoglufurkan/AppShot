// Scene: a stylised map — a route draws itself between two pins, a dot travels along, the destination pulses.
import { palette, stage, rand, uid, layer, at, box, mo, sprite, svg, canvasSvg, backdrop, glow, rings, mix, rgba, r, dashPath } from './_kit.mjs';

export const meta = {
  id: 'route', name: 'Route', mood: 'gentle', poster: 0.7,
  summary: 'Stylised city map: a route draws itself between two pins, a dot follows it, the destination pulses.',
  niches: ['navigation-ev-parking', 'running-cycling', 'food-delivery', 'parenting-family-safety', 'step-counter'],
  keywords: ['map', 'maps', 'route', 'navigation', 'gps', 'parking', 'charging', 'ev', 'delivery', 'location', 'tracking', 'run', 'ride', 'cycling', 'directions'],
};

export function render(ctx, o = {}) {
  const { hero = true, intensity = 1 } = o;
  const g = stage(ctx, o.box), p = palette(ctx), R = rand(ctx, 'route');
  const { W, H, cx, cy, S } = g;
  const land = p.dark ? mix(p.base, '#1E2633', 0.6) : mix(p.base, '#EEF1F4', 0.7);
  const block = p.dark ? mix(land, '#fff', 0.05) : mix(land, '#000', 0.04);
  const road = p.dark ? mix(land, '#fff', 0.12) : '#FFFFFF';
  let h = hero ? backdrop(ctx, land) : '';
  // Blocks between streets, a park, a river.
  let map = `<path d="M${-W * 0.05} ${r(H * 0.8)} C${r(W * 0.25)} ${r(H * 0.62)} ${r(W * 0.45)} ${r(H * 1.0)} ${r(W * 1.05)} ${r(H * 0.74)}" stroke="${p.dark ? '#1D3B5A' : '#BFDDF5'}" stroke-width="${r(S * 0.09)}" fill="none"/>`;
  const step = S * 0.2;
  for (let x = -step; x < W + step; x += step) for (let y = -step; y < H + step; y += step) {
    const bw = step * (0.75 + R() * 0.12), bh = step * (0.75 + R() * 0.12);
    const park = R() < 0.07;
    map += `<rect x="${r(x)}" y="${r(y)}" width="${r(bw)}" height="${r(bh)}" rx="${r(step * 0.08)}" fill="${park ? (p.dark ? '#1F3B2C' : '#CDEBD3') : block}"/>`;
  }
  h += canvasSvg(ctx, map, `opacity:${hero ? 1 : 0.55 * intensity}`);
  h += layer(ctx, '', `background:radial-gradient(ellipse 55% 70% at 50% 50%, transparent 40%, ${rgba(land, 0.85)} 100%)`);
  if (!hero) return h;
  const a = [cx - S * 0.62, cy + S * 0.22], b = [cx + S * 0.55, cy - S * 0.2];
  const d = `M${r(a[0])} ${r(a[1])} C${r(cx - S * 0.3)} ${r(cy + S * 0.4)} ${r(cx - S * 0.2)} ${r(cy - S * 0.3)} ${r(cx + S * 0.05)} ${r(cy - S * 0.05)} S${r(cx + S * 0.35)} ${r(cy + S * 0.1)} ${r(b[0])} ${r(b[1])}`;
  h += glow(cx, cy, S * 1.4, p.accent, p.dark ? 0.25 : 0.18);
  h += canvasSvg(ctx, `<path d="${d}" fill="none" stroke="${road}" stroke-width="${r(S * 0.05)}" stroke-linecap="round"/>`
    + dashPath(ctx, d, { stroke: p.accent, width: S * 0.026, mode: 'draw', inT: 0.1, len: 0.45, out: 0.92, extra: `style="filter:drop-shadow(0 0 ${r(S * 0.012)}px ${rgba(p.accent, 0.8)})"` }), 'z-index:2');
  const pin = (s, c) => svg(s, s, `<path d="M50 96 C30 70 14 54 14 36 C14 16 30 4 50 4 C70 4 86 16 86 36 C86 54 70 70 50 96 Z" fill="${c}"/><circle cx="50" cy="36" r="14" fill="#fff"/>`, { css: `filter:drop-shadow(0 ${r(s * 0.06)}px ${r(s * 0.08)}px rgba(0,0,0,.3))` });
  const ps = S * 0.13;
  h += box(a[0] - ps / 2, a[1] - ps, ps, ps, mo(ctx, pin(ps, mix(p.accent2, '#000', 0.05)), { type: 'grow', in: 0.03, len: 0.06, out: 0.93, over: 0.2 }, 'transform-origin:50% 100%'), 'z-index:4');
  h += rings(ctx, { cx: b[0], cy: b[1], size: S * 0.4, color: rgba(p.accent, 0.7), n: 2, cycles: 3, width: 0.01, s0: 0.2, s1: 1 });
  h += box(b[0] - ps * 0.65, b[1] - ps * 1.3, ps * 1.3, ps * 1.3, mo(ctx, pin(ps * 1.3, p.accent), { type: 'grow', in: 0.55, len: 0.07, out: 0.93, over: 0.25 }, 'transform-origin:50% 100%'), 'z-index:5');
  const ds = S * 0.05;
  h += sprite(ctx, ds, ds, `<div style="position:absolute;inset:0;border-radius:50%;background:#fff;border:${r(ds * 0.22)}px solid ${p.accent};box-shadow:0 0 ${r(ds)}px ${rgba(p.accent, 0.9)}"></div>`, { type: 'path', d, win: [0.1, 0.55], out: 0.92 }, { z: 6 });
  return h;
}
