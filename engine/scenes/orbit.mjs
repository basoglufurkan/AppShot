// Scene: a glowing planet / orb with a tilted ring and moons orbiting in depth — science, AI, discovery.
import { palette, stage, rand, uid, layer, at, box, mo, sprite, svg, lin, rad, backdrop, glow, stars, blobs, mix, rgba, r } from './_kit.mjs';

export const meta = {
  id: 'orbit', name: 'Orbit', mood: 'gentle', poster: 0.4,
  summary: 'A glowing orb with a tilted ring, moons orbiting in front and behind, a star field. Science, AI, discovery.',
  niches: ['ai-chat-assistant', 'homework-solver', 'object-identifier', 'kids-learning'],
  keywords: ['ai', 'assistant', 'chatbot', 'gpt', 'science', 'space', 'astronomy', 'planet', 'solver', 'scan', 'identify', 'learn', 'smart'],
};

export function render(ctx, o = {}) {
  const { hero = true, intensity = 1 } = o;
  const g = stage(ctx, o.box), p = palette(ctx), R = rand(ctx, 'orbit');
  const { W, H, cx, cy, S } = g;
  let h = hero ? backdrop(ctx, p.dark
    ? `radial-gradient(ellipse 65% 80% at 50% 50%, ${mix(p.base, p.accent, 0.18)} 0%, ${mix(p.base, '#000', 0.35)} 80%)`
    : `radial-gradient(ellipse 65% 80% at 50% 50%, ${mix(p.base, '#fff', 0.7)} 0%, ${mix(p.base, p.accent, 0.12)} 85%)`) : '';
  h += layer(ctx, blobs(ctx, R, { colors: [p.accent, p.accent2], n: 4, a: (p.dark ? 0.2 : 0.16) * intensity }));
  h += stars(ctx, R, { n: hero ? 110 : 70, color: rgba(p.dark ? '#fff' : mix(p.accent, '#000', 0.3), 0.9 * intensity), min: S * 0.003, max: S * 0.01, sparkle: 0.14, avoid: hero ? { cx, cy, r: S * 0.3 } : null });
  if (!hero) return h;
  const ps = S * 0.42, tilt = -16;
  h += glow(cx, cy, ps * 2.8, p.accent, 0.5);
  h += at(cx, cy, ps * 2.2, ps * 2.2, mo(ctx, glow(ps * 1.1, ps * 1.1, ps * 2.2, p.accent2, 0.42), { type: 'pulse', mode: 'breathe', amp: 0.1, cycles: 2, glow: true, lo: 0.5 }));
  const ring = (half, id) => svg(ps * 2.1, ps * 2.1, `<defs>${lin(id, [[0, mix(p.accent2, '#fff', 0.5), 0.9], [0.5, mix(p.accent, '#fff', 0.3), 0.75], [1, mix(p.accent2, '#fff', 0.5), 0.9]], { x1: 0, y1: 0, x2: 1, y2: 0 })}</defs>
    <g transform="rotate(${tilt} 50 50)"><path d="${half === 'back' ? 'M8 50 A42 11 0 0 1 92 50' : 'M92 50 A42 11 0 0 1 8 50'}" fill="none" stroke="url(#${id})" stroke-width="${half === 'back' ? 3.2 : 3.6}" stroke-linecap="round"/>
    <path d="${half === 'back' ? 'M14 50 A36 8.5 0 0 1 86 50' : 'M86 50 A36 8.5 0 0 1 14 50'}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.2"/></g>`);
  h += at(cx, cy, ps * 2.1, ps * 2.1, ring('back', uid('rg')), 'z-index:2');
  const id = uid('pl'), sh = uid('ps');
  const planet = svg(ps, ps, `<defs>${rad(id, [[0, mix(p.accent2, '#fff', 0.55)], [0.45, mix(p.accent, p.accent2, 0.4)], [1, mix(p.accent, '#000', 0.55)]], { cx: 0.36, cy: 0.32, r: 0.75 })}
    ${rad(sh, [[0.6, '#000', 0], [1, '#000', 0.45]], { cx: 0.42, cy: 0.38, r: 0.62 })}</defs>
    <circle cx="50" cy="50" r="48" fill="url(#${id})"/>
    <path d="M6 44 C30 36 70 52 94 42" stroke="#fff" stroke-opacity=".12" stroke-width="7" fill="none"/><path d="M8 62 C34 54 66 70 92 60" stroke="#fff" stroke-opacity=".08" stroke-width="5" fill="none"/>
    <circle cx="50" cy="50" r="48" fill="url(#${sh})"/><ellipse cx="34" cy="28" rx="12" ry="6" fill="#fff" fill-opacity=".35" transform="rotate(-28 34 28)"/>`, { css: `filter:drop-shadow(0 0 ${r(ps * 0.08)}px ${rgba(p.accent, 0.7)})` });
  h += at(cx, cy, ps, ps, mo(ctx, planet, { type: 'float', y: ps * 0.03, x: 0, rot: 2, cycles: 1 }), 'z-index:3');
  h += at(cx, cy, ps * 2.1, ps * 2.1, ring('front', uid('rg')), 'z-index:5');
  // Moons in a tilted orbit (front: over the planet, back: behind it).
  const orbitBox = (inner) => at(cx, cy, 0, 0, `<div style="position:absolute;left:0;top:0;transform:rotate(${tilt}deg)">${inner}</div>`, 'z-index:auto');
  let moons = '';
  [[0.075, 1.08, 0.3, 0, '#fff'], [0.05, 1.32, 0.38, 0.45, mix(p.accent2, '#fff', 0.4)], [0.04, 0.92, 0.24, 0.75, mix(p.accent, '#fff', 0.5)]].forEach(([s, rx, ry, ph, c], i) => {
    const ms = ps * s * 2, idm = uid('mn');
    const m = svg(ms, ms, `<defs>${rad(idm, [[0, '#fff'], [1, mix(c, '#000', 0.2)]], { cx: 0.35, cy: 0.3, r: 0.8 })}</defs><circle cx="50" cy="50" r="48" fill="url(#${idm})"/>`, { css: `filter:drop-shadow(0 0 ${r(ms * 0.3)}px ${rgba(c, 0.8)})` });
    moons += sprite(ctx, ms, ms, m, { type: 'orbit', rx: ps * rx, ry: ps * ry, depth: 0.3, zFront: 6, zBack: 1, cycles: 1 + (i === 2 ? 1 : 0), phase: ph });
  });
  h += orbitBox(moons);
  return h;
}
