// Scene: night sky — glowing crescent moon, twinkling stars, a shooting star, clouds drifting low.
// variant "constellation": star lines draw themselves (astrology).
import { palette, stage, rand, uid, layer, at, box, mo, svg, canvasSvg, lin, rad, backdrop, glow, stars, cloud, mix, rgba, r, dashPath } from './_kit.mjs';

export const meta = {
  id: 'night-sky', name: 'Night sky', mood: 'calm', poster: 0.3,
  summary: 'Crescent moon with halo, twinkling stars, a shooting star, low clouds drifting. Variant constellation draws star lines.',
  niches: ['sleep-tracker', 'islamic-prayer', 'astrology-tarot', 'intermittent-fasting'],
  keywords: ['sleep', 'night', 'dream', 'bedtime', 'insomnia', 'snore', 'moon', 'star', 'astrology', 'horoscope', 'zodiac', 'prayer', 'ramadan', 'fasting'],
  variants: ['constellation'],
};

export function render(ctx, o = {}) {
  const { hero = true, intensity = 1, variant } = o;
  const g = stage(ctx, o.box), p = palette(ctx), R = rand(ctx, 'night-sky');
  const { W, H, cx, cy, S } = g;
  const top = p.dark ? mix('#070A24', p.accent, 0.1) : mix('#7E7BD6', p.accent, 0.15);
  const low = p.dark ? mix('#2A1B4D', p.accent2, 0.2) : mix('#F7C6D9', p.accent2, 0.15);
  let h = hero ? backdrop(ctx, `linear-gradient(180deg, ${top} 0%, ${mix(top, low, 0.55)} 62%, ${low} 100%)`) : '';
  h += stars(ctx, R, { n: Math.round((hero ? 120 : 80) * Math.min(1.4, W / H / 1.6)), color: rgba('#fff', 0.95 * intensity), min: S * 0.003, max: S * 0.011, sparkle: 0.1, avoid: hero ? { cx, cy, r: S * 0.28 } : null });
  // Shooting stars.
  for (const [ph, y] of [[0.12, 0.18], [0.58, 0.3]]) {
    const len = S * 0.45, sx = W * (0.15 + R() * 0.4), sy = H * y;
    const streak = `<div style="position:absolute;inset:0;transform:rotate(18deg);transform-origin:100% 50%;background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.95));border-radius:9px"></div>`;
    h += box(sx - len, sy, len, Math.max(3, S * 0.006), mo(ctx, streak, { type: 'travel', x0: 0, y0: 0, x1: S * 0.9, y1: S * 0.29, win: [ph, ph + 0.09], fi: 0.2, fo: 0.4, o: 0.9 * intensity }));
  }
  if (variant === 'constellation') {
    const pts = Array.from({ length: 7 }, (_, i) => [cx + (i - 3) * S * 0.28 + (R() - 0.5) * S * 0.1, cy - S * 0.38 + Math.sin(i * 1.3) * S * 0.12]);
    const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${r(x)} ${r(y)}`).join(' ');
    h += canvasSvg(ctx, dashPath(ctx, d, { stroke: rgba('#fff', 0.6), width: S * 0.004, mode: 'draw', inT: 0.1, len: 0.4, out: 0.9 }) + pts.map(([x, y]) => `<circle cx="${r(x)}" cy="${r(y)}" r="${r(S * 0.008)}" fill="#fff"/>`).join(''));
  }
  // Low clouds.
  for (let i = 0; i < 6; i++) {
    const w = S * (0.6 + R() * 0.6);
    h += box(W * (-0.1 + i * 0.2 + R() * 0.05), H * (0.72 + R() * 0.16), w, w / 2, mo(ctx, cloud(w, p.dark ? mix(low, '#fff', 0.25) : '#fff', p.dark ? 0.5 : 0.85), { type: 'float', x: S * 0.06, y: S * 0.01, rot: 0, phase: R() }), `opacity:${intensity}`);
  }
  if (!hero) return h;
  // Moon.
  const ms = S * 0.4, id = uid('moon'), mk = uid('mm');
  h += glow(cx, cy, ms * 3, mix('#FFE7A8', p.accent, 0.1), 0.42);
  h += at(cx, cy, ms * 2.2, ms * 2.2, mo(ctx, glow(ms * 1.1, ms * 1.1, ms * 2.2, '#FFF1C9', 0.4), { type: 'pulse', mode: 'breathe', amp: 0.08, cycles: 2, glow: true, lo: 0.6 }));
  const moon = svg(ms, ms, `<defs>${lin(id, [[0, '#FFF8E1'], [1, '#F5C96B']], { x1: 0.2, y1: 0, x2: 0.8, y2: 1 })}
    <mask id="${mk}"><rect width="100" height="100" fill="#fff"/><circle cx="66" cy="38" r="40" fill="#000"/></mask></defs>
    <g mask="url(#${mk})"><circle cx="50" cy="50" r="46" fill="url(#${id})"/><circle cx="28" cy="58" r="6" fill="#E9B85A" fill-opacity=".35"/><circle cx="38" cy="78" r="4" fill="#E9B85A" fill-opacity=".35"/><circle cx="20" cy="40" r="3" fill="#E9B85A" fill-opacity=".3"/></g>`, { css: `filter:drop-shadow(0 0 ${r(ms * 0.08)}px rgba(255,230,170,.7))` });
  h += at(cx, cy, ms, ms, mo(ctx, moon, { type: 'float', y: ms * 0.04, x: 0, rot: 3, cycles: 1 }), 'z-index:3');
  // Two little sparkles near the moon.
  for (const [dx, dy, s, ph] of [[0.62, -0.35, 0.1, 0], [0.75, 0.05, 0.06, 0.5]]) {
    h += at(cx + ms * dx, cy + ms * dy, ms * s, ms * s, mo(ctx, svg(ms * s, ms * s, `<path d="M50 0 C54 38 62 46 100 50 C62 54 54 62 50 100 C46 62 38 54 0 50 C38 46 46 38 50 0Z" fill="#FFF6D8"/>`), { type: 'osc', prop: 'scale', lo: 0.4, hi: 1, cycles: 2, phase: ph }), 'z-index:3');
  }
  return h;
}
