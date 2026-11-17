// Scene: a paper plane looping through drifting clouds at dawn, its dashed route trailing behind — travel.
import { palette, stage, rand, uid, layer, at, box, mo, sprite, svg, canvasSvg, lin, backdrop, glow, cloud, eightPath, mix, rgba, r, dashPath } from './_kit.mjs';

export const meta = {
  id: 'flight', name: 'Flight', mood: 'gentle', poster: 0.2,
  summary: 'Paper plane flying a figure-eight through clouds at dawn, dashed route behind it, birds gliding.',
  niches: ['travel-planner'],
  keywords: ['travel', 'trip', 'flight', 'flights', 'vacation', 'holiday', 'itinerary', 'hotel', 'booking', 'explore', 'journey', 'abroad'],
};

export function render(ctx, o = {}) {
  const { hero = true, intensity = 1 } = o;
  const g = stage(ctx, o.box), p = palette(ctx), R = rand(ctx, 'flight');
  const { W, H, cx, cy, S } = g;
  const top = p.dark ? mix('#1B1F4B', p.accent, 0.12) : mix('#8EC5FF', p.accent, 0.12);
  const mid = p.dark ? mix('#6A3D7A', p.accent2, 0.15) : mix('#C9B6FF', p.accent2, 0.1);
  const low = p.dark ? '#F08A5D' : '#FFD3B6';
  let h = hero ? backdrop(ctx, `linear-gradient(180deg, ${top} 0%, ${mid} 60%, ${low} 100%)`) : '';
  h += glow(W * 0.62, H * 0.95, S * 1.6, '#FFC38B', 0.5 * intensity);
  // Clouds in two depths.
  for (let i = 0; i < 11; i++) {
    const far = i < 5, w = S * (far ? 0.35 + R() * 0.25 : 0.55 + R() * 0.45);
    const x = W * (i / 11) + (R() - 0.5) * W * 0.08, y = H * (far ? 0.12 + R() * 0.4 : 0.55 + R() * 0.38);
    h += box(x - w / 2, y - w / 4, w, w / 2, mo(ctx, cloud(w, '#fff', far ? 0.55 : p.dark ? 0.75 : 0.95), { type: 'float', x: S * (far ? 0.04 : 0.08), y: S * 0.01, rot: 0, phase: R() }), `opacity:${intensity}`);
  }
  // Birds.
  for (let i = 0; i < 5; i++) {
    const bs = S * (0.03 + R() * 0.025);
    const bird = svg(bs, bs, `<path d="M4 50 C22 30 38 34 50 52 C62 34 78 30 96 50" fill="none" stroke="${p.dark ? '#1a1033' : '#3A3A5C'}" stroke-opacity=".7" stroke-width="7" stroke-linecap="round"/>`);
    h += at(W * (0.08 + R() * 0.84), H * (0.1 + R() * 0.35), bs, bs, mo(ctx, mo(ctx, bird, { type: 'osc', prop: 'scaleY', lo: 0.4, hi: 1, cycles: 18 + i * 2, phase: R() }), { type: 'float', x: S * 0.05, y: S * 0.02, rot: 0, phase: R() }));
  }
  if (!hero) return h;
  const d = eightPath(cx, cy, S * 0.62, S * 0.42);
  h += canvasSvg(ctx, `<path d="${d}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="${r(S * 0.007)}" stroke-dasharray="${r(S * 0.02)} ${r(S * 0.025)}" stroke-linecap="round"/>`, 'z-index:2');
  const ps = S * 0.28, id = uid('pp');
  const plane = svg(ps, ps, `<defs>${lin(id, [[0, '#FFFFFF'], [1, '#DCE6FF']])}</defs>
    <path d="M96 50 L6 18 L30 50 Z" fill="url(#${id})"/><path d="M96 50 L6 82 L30 50 Z" fill="#C7D3F5"/><path d="M96 50 L30 50 L22 66 Z" fill="#AEBBE6"/>`, { css: `filter:drop-shadow(0 ${r(ps * 0.08)}px ${r(ps * 0.1)}px rgba(40,30,80,.3))` });
  h += sprite(ctx, ps, ps, plane, { type: 'path', d, face: true, cycles: 1 }, { z: 5 });
  return h;
}
