// Scene: a glowing heart that beats with the loop, pulse rings and an ECG trace running across the canvas.
import { palette, stage, rand, uid, layer, at, box, mo, svg, canvasSvg, lin, rad, backdrop, glow, rings, motes, mix, rgba, r, HEART, dashPath } from './_kit.mjs';

export const meta = {
  id: 'heartbeat', name: 'Heartbeat', mood: 'energetic', poster: 0.42,
  summary: 'Glowing heart beating on the loop, pulse rings, an ECG line with a running highlight, sparks.',
  niches: ['fitness-workout', 'home-workout', 'health-vitals', 'running-cycling', 'step-counter'],
  keywords: ['heart', 'heart rate', 'bpm', 'cardio', 'pulse', 'workout', 'training', 'fitness', 'health', 'calories', 'hiit'],
};

export function render(ctx, o = {}) {
  const { hero = true, intensity = 1 } = o;
  const g = stage(ctx, o.box), p = palette(ctx), R = rand(ctx, 'heartbeat');
  const { W, H, cx, S } = g;
  const red = mix('#FF3358', p.accent, 0.12);
  const beats = Math.max(8, Math.round((ctx.plan.creative?.duration || 12) * 1.0));
  const cy = g.cy - S * 0.06;
  let h = '';
  if (hero) h += backdrop(ctx, p.dark
    ? `radial-gradient(ellipse 60% 75% at 50% 45%, ${mix(p.base, red, 0.2)} 0%, ${mix(p.base, '#000', 0.15)} 70%)`
    : `radial-gradient(ellipse 60% 75% at 50% 45%, ${mix(p.base, red, 0.12)} 0%, ${p.base} 72%)`);
  // ECG paper.
  const step = S * 0.07;
  h += layer(ctx, '', `opacity:${0.5 * intensity};background-image:linear-gradient(${rgba(p.accent, p.dark ? 0.08 : 0.1)} 1px, transparent 1px),linear-gradient(90deg, ${rgba(p.accent, p.dark ? 0.08 : 0.1)} 1px, transparent 1px);background-size:${r(step)}px ${r(step)}px;background-position:${r(cx % step)}px ${r(cy % step)}px`);
  // ECG trace across the whole width.
  const y0 = hero ? cy + S * 0.36 : Math.min(H * 0.62, g.box.y + g.box.h * 0.82), a = S * (hero ? 0.13 : 0.1), P = S * 0.62;
  let d = `M${-P} ${r(y0)}`;
  for (let x = -P; x < W + P; x += P) {
    const q = (f) => r(x + P * f);
    d += ` L${q(0.3)} ${r(y0)} Q${q(0.34)} ${r(y0 - a * 0.16)} ${q(0.38)} ${r(y0)} L${q(0.45)} ${r(y0)} L${q(0.47)} ${r(y0 + a * 0.22)} L${q(0.5)} ${r(y0 - a)} L${q(0.535)} ${r(y0 + a * 0.5)} L${q(0.56)} ${r(y0)} L${q(0.68)} ${r(y0)} Q${q(0.74)} ${r(y0 - a * 0.3)} ${q(0.8)} ${r(y0)} L${q(1)} ${r(y0)}`;
  }
  const lw = Math.max(3, S * 0.011);
  h += canvasSvg(ctx, `<path d="${d}" fill="none" stroke="${rgba(p.accent, 0.22 * intensity)}" stroke-width="${r(lw)}" stroke-linejoin="round"/>`
    + dashPath(ctx, d, { stroke: p.accent, width: lw * 1.3, mode: 'flow', dash: '0.16 0.84', cycles: 2, extra: `style="filter:drop-shadow(0 0 ${r(lw * 3)}px ${rgba(p.accent, 0.9)})"` }), `opacity:${intensity}`);
  // Sparks.
  h += motes(ctx, R, { n: hero ? 22 : 14, area: { x: hero ? cx - S * 0.7 : 0, y: hero ? cy - S * 0.2 : H * 0.2, w: hero ? S * 1.4 : W, h: S * 0.7 }, color: rgba(mix(red, '#fff', 0.35), 0.9 * intensity), min: S * 0.008, max: S * 0.02, rise: S * 0.55 });
  if (!hero) return h;
  // Heart.
  const hs = S * 0.44, id = uid('hb'), hl = uid('hl');
  h += glow(cx, cy, hs * 2.6, red, 0.55);
  h += at(cx, cy, hs * 2.4, hs * 2.4, mo(ctx, glow(hs * 1.2, hs * 1.2, hs * 2.4, red, 0.5), { type: 'pulse', amp: 0.14, cycles: beats, glow: true, lo: 0.35 }));
  h += rings(ctx, { cx, cy: cy + hs * 0.02, size: hs * 2.2, color: rgba(red, 0.6), n: 2, cycles: Math.round(beats / 2), s0: 0.45, s1: 1.15, width: 0.008 });
  const heart = svg(hs, hs, `<defs>${lin(id, [[0, mix(red, '#fff', 0.25)], [0.55, red], [1, mix(red, '#5a0018', 0.45)]], { x1: 0.2, y1: 0, x2: 0.8, y2: 1 })}${rad(hl, [[0, '#fff', 0.75], [1, '#fff', 0]], { cx: 0.3, cy: 0.28, r: 0.3 })}</defs>
    <path d="${HEART}" fill="url(#${id})"/><path d="${HEART}" fill="url(#${hl})"/>
    <path d="M22 22 C26 15 33 13 38 15" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3.2" stroke-linecap="round"/>`, { css: `filter:drop-shadow(0 ${r(hs * 0.06)}px ${r(hs * 0.12)}px ${rgba('#000', p.dark ? 0.5 : 0.2)})` });
  h += at(cx, cy, hs, hs, mo(ctx, heart, { type: 'pulse', amp: 0.075, cycles: beats }));
  return h;
}
