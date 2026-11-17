// Scene: playful 3D-ish shapes bobbing and turning around a big glowing star, confetti falling — games, kids.
import { palette, stage, rand, uid, layer, at, box, mo, svg, lin, rad, backdrop, glow, blobs, mix, rgba, r } from './_kit.mjs';

export const meta = {
  id: 'playground', name: 'Playground', mood: 'lively', poster: 0.4,
  summary: 'Glossy shapes (spheres, cubes, rings, stars) bobbing and turning around a big glowing star; confetti falling.',
  niches: ['casual-games', 'kids-learning', 'sports-scores', 'customization-widgets'],
  keywords: ['game', 'games', 'play', 'puzzle', 'level', 'levels', 'kids', 'children', 'fun', 'arcade', 'match', 'score', 'win', 'reward'],
};

const STAR = 'M50 4 L62 36 L96 38 L69 59 L79 93 L50 73 L21 93 L31 59 L4 38 L38 36 Z';

function shape(kind, s, c) {
  const id = uid('sp');
  const g1 = mix(c, '#fff', 0.45), g2 = mix(c, '#000', 0.25);
  if (kind === 0) return svg(s, s, `<defs>${rad(id, [[0, g1], [0.6, c], [1, g2]], { cx: 0.35, cy: 0.3, r: 0.75 })}</defs><circle cx="50" cy="50" r="46" fill="url(#${id})"/><ellipse cx="36" cy="30" rx="12" ry="7" fill="#fff" fill-opacity=".5" transform="rotate(-30 36 30)"/>`);
  if (kind === 1) return svg(s, s, `<defs>${lin(id, [[0, g1], [1, g2]], { x1: 0, y1: 0, x2: 1, y2: 1 })}</defs><rect x="8" y="8" width="84" height="84" rx="22" fill="url(#${id})"/><rect x="18" y="14" width="50" height="16" rx="8" fill="#fff" fill-opacity=".35"/>`);
  if (kind === 2) return svg(s, s, `<defs>${lin(id, [[0, g1], [1, g2]], { x1: 0, y1: 0, x2: 1, y2: 1 })}</defs><circle cx="50" cy="50" r="34" fill="none" stroke="url(#${id})" stroke-width="20"/><path d="M28 30 A30 30 0 0 1 52 18" stroke="#fff" stroke-opacity=".45" stroke-width="6" fill="none" stroke-linecap="round"/>`);
  return svg(s, s, `<defs>${lin(id, [[0, g1], [1, g2]], { x1: 0, y1: 0, x2: 1, y2: 1 })}</defs><path d="${STAR}" fill="url(#${id})" stroke="${g1}" stroke-width="2" stroke-linejoin="round"/>`);
}

export function render(ctx, o = {}) {
  const { hero = true, intensity = 1 } = o;
  const g = stage(ctx, o.box), p = palette(ctx), R = rand(ctx, 'playground');
  const { W, H, cx, cy, S } = g;
  let h = hero ? backdrop(ctx, p.dark
    ? `radial-gradient(ellipse 70% 90% at 50% 45%, ${mix(p.accent, p.base, 0.55)} 0%, ${mix(p.accent2, '#000', 0.6)} 90%)`
    : `radial-gradient(ellipse 70% 90% at 50% 45%, ${mix(p.accent, '#fff', 0.75)} 0%, ${mix(p.accent2, '#fff', 0.45)} 90%)`) : '';
  h += layer(ctx, blobs(ctx, R, { colors: [p.accent, p.accent2, '#FFC93C'], n: 5, a: 0.25 * intensity }));
  const cols = [p.accent, p.accent2, '#FFC93C', '#FF6B6B', '#4FD1C5', '#A78BFA'];
  // Confetti.
  for (let i = 0; i < (hero ? 40 : 26); i++) {
    const s = S * (0.015 + R() * 0.02);
    h += at(W * R(), -S * 0.05, s, s * 0.55, mo(ctx, '', { type: 'travel', x0: 0, y0: 0, x1: (R() - 0.5) * S * 0.3, y1: H * 1.1, wx: S * 0.03, r0: 0, r1: 360 * (R() > 0.5 ? 2 : -2), fi: 0.05, fo: 0.1, o: 0.95 * intensity, cycles: 1, phase: R() }, `background:${cols[i % cols.length]};border-radius:2px`));
  }
  // Shapes around the hero.
  for (let i = 0; i < 12; i++) {
    const s = S * (0.1 + R() * 0.12);
    let x = W * (0.04 + R() * 0.92), y = H * (0.1 + R() * 0.8);
    if (hero && Math.hypot(x - cx, y - cy) < S * 0.55) x = cx + (x < cx ? -1 : 1) * (S * 0.6 + R() * S * 0.3);
    const inner = mo(ctx, shape(i % 4, s, cols[i % cols.length]), i % 2 ? { type: 'spin', cycles: 1, dir: R() > 0.5 ? 1 : -1 } : { type: 'osc', prop: 'rotate', lo: -20, hi: 20, cycles: 1, phase: R() });
    h += at(x, y, s, s, mo(ctx, inner, { type: 'float', x: s * 0.1, y: s * 0.25, rot: 0, phase: R() }), `opacity:${intensity}`);
  }
  if (!hero) return h;
  const ss = S * 0.5;
  h += glow(cx, cy, ss * 2.6, '#FFD54A', 0.55);
  const rays = `<div style="position:absolute;inset:0;border-radius:50%;background:repeating-conic-gradient(from 0deg, rgba(255,255,255,.28) 0deg 8deg, transparent 8deg 22deg);-webkit-mask-image:radial-gradient(circle, #000 20%, transparent 70%)"></div>`;
  h += at(cx, cy, ss * 2.4, ss * 2.4, mo(ctx, rays, { type: 'spin', cycles: 1 }), 'z-index:2');
  const id = uid('st');
  const star = svg(ss, ss, `<defs>${lin(id, [[0, '#FFF3A8'], [0.5, '#FFC93C'], [1, '#FF9F1C']], { x1: 0.2, y1: 0, x2: 0.8, y2: 1 })}</defs><path d="${STAR}" fill="url(#${id})" stroke="#FFF6C8" stroke-width="2.5" stroke-linejoin="round"/><path d="M50 14 L58 38 L50 34 Z" fill="#fff" fill-opacity=".5"/>`, { css: 'filter:drop-shadow(0 0 30px rgba(255,200,60,.8))' });
  h += at(cx, cy, ss, ss, mo(ctx, mo(ctx, star, { type: 'pulse', mode: 'breathe', amp: 0.08, cycles: 3 }), { type: 'osc', prop: 'rotate', lo: -8, hi: 8, cycles: 1 }), 'z-index:4');
  return h;
}
