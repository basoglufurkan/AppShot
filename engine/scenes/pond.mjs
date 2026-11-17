// Scene: a calm pond — ripples spreading, lily pads drifting, koi circling a lotus in the middle.
import { palette, stage, rand, uid, layer, at, box, mo, sprite, svg, lin, rad, backdrop, glow, blobs, rings, mix, rgba, r } from './_kit.mjs';

export const meta = {
  id: 'pond', name: 'Pond', mood: 'calm', poster: 0.35,
  summary: 'Still water: ripples, drifting lily pads, two koi circling a glowing lotus. Calm, premium.',
  niches: ['meditation-mindfulness', 'mental-health-therapy', 'mood-journal', 'yoga-pilates', 'quit-addiction'],
  keywords: ['meditation', 'mindfulness', 'calm', 'breathe', 'breathing', 'relax', 'anxiety', 'stress', 'zen', 'therapy', 'journal', 'mood'],
};

const koi = (w, c1, c2, id = uid('koi')) => svg(w, w * 0.45, `<defs>${lin(id, [[0, c1], [1, mix(c1, '#fff', 0.35)]], { x1: 0, y1: 0, x2: 1, y2: 0 })}</defs>
  <path d="M8 22 C14 12 20 14 26 18 C40 6 72 6 88 20 C92 22 92 24 88 26 C72 40 40 40 26 28 C20 32 14 34 8 24 Z" fill="url(#${id})"/>
  <path d="M8 22 C2 14 0 12 2 10 C6 14 10 18 12 22 C10 26 6 30 2 34 C0 32 2 30 8 24 Z" fill="${c1}" fill-opacity=".85"/>
  <ellipse cx="56" cy="16" rx="9" ry="5" fill="${c2}" fill-opacity=".95"/><ellipse cx="40" cy="27" rx="7" ry="4" fill="${c2}" fill-opacity=".9"/>
  <path d="M60 30 C64 38 70 40 74 38" fill="none" stroke="${c1}" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>
  <path d="M60 14 C64 6 70 4 74 6" fill="none" stroke="${c1}" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>
  <circle cx="82" cy="20" r="1.6" fill="#1a1a1a"/>`, { vb: '0 0 100 45' });

const pad = (w, c, id = uid('pad')) => svg(w, w, `<defs>${rad(id, [[0, mix(c, '#fff', 0.2)], [1, c]], { cx: 0.4, cy: 0.4, r: 0.6 })}</defs>
  <path d="M50 50 L92 38 A44 44 0 1 1 82 22 Z" fill="url(#${id})"/><path d="M50 50 L30 20 M50 50 L20 62 M50 50 L60 88" stroke="${mix(c, '#000', 0.25)}" stroke-opacity=".35" stroke-width="1.5"/>`);

function lotus(s, petal, core) {
  const id = uid('lp'), id2 = uid('lp');
  const petals = (n, len, wid, rot0, fill) => Array.from({ length: n }, (_, i) => `<path d="M50 50 C${50 - wid} ${50 - len * 0.45} ${50 - wid * 0.4} ${50 - len} 50 ${50 - len} C${50 + wid * 0.4} ${50 - len} ${50 + wid} ${50 - len * 0.45} 50 50Z" fill="url(#${fill})" transform="rotate(${rot0 + (360 / n) * i} 50 50)"/>`).join('');
  return svg(s, s, `<defs>${lin(id, [[0, mix(petal, '#fff', 0.65)], [1, petal]])}${lin(id2, [[0, mix(petal, '#fff', 0.85)], [1, mix(petal, '#fff', 0.3)]])}</defs>
    ${petals(8, 44, 16, 22.5, id)}${petals(8, 34, 13, 0, id2)}<circle cx="50" cy="50" r="9" fill="${core}"/><circle cx="47" cy="47" r="3" fill="#fff" fill-opacity=".6"/>`);
}

export function render(ctx, o = {}) {
  const { hero = true, intensity = 1 } = o;
  const g = stage(ctx, o.box), p = palette(ctx), R = rand(ctx, 'pond');
  const { W, H, cx, cy, S } = g;
  const water = mix(p.dark ? '#0B3B47' : '#9ED8D9', p.accent, 0.18);
  if (hero) var h = backdrop(ctx, p.dark
    ? `radial-gradient(ellipse 70% 90% at 50% 45%, ${mix(water, '#fff', 0.08)} 0%, ${mix(water, '#000', 0.45)} 85%)`
    : `radial-gradient(ellipse 70% 90% at 50% 45%, ${mix(water, '#fff', 0.55)} 0%, ${water} 90%)`);
  else h = '';
  h += layer(ctx, blobs(ctx, R, { colors: [mix(water, '#fff', 0.5), p.accent], n: 4, a: 0.16 * intensity }));
  // Ripples here and there.
  for (let i = 0; i < 6; i++) h += rings(ctx, { cx: W * (0.08 + R() * 0.84), cy: H * (0.12 + R() * 0.76), size: S * (0.5 + R() * 0.5), color: rgba('#fff', 0.35 * intensity), n: 2, cycles: 1 + Math.floor(R() * 2), width: 0.004, s0: 0.1, s1: 1 });
  // Lily pads drifting.
  const green = mix('#3E9B5A', p.accent, 0.15);
  for (let i = 0; i < 9; i++) {
    const s = S * (0.12 + R() * 0.14);
    let x = W * (0.04 + R() * 0.92), y = H * (0.08 + R() * 0.84);
    if (hero && Math.abs(x - cx) < S * 0.45 && Math.abs(y - cy) < S * 0.4) x += (x < cx ? -1 : 1) * S * 0.5;
    h += at(x, y, s, s, mo(ctx, pad(s, green), { type: 'float', x: s * 0.12, y: s * 0.08, rot: 8, phase: R() }, `transform:rotate(${Math.round(R() * 360)}deg)`), `opacity:${Math.min(1, 0.9 * intensity)}`);
  }
  if (!hero) return h;
  const ls = S * 0.36;
  h += glow(cx, cy, ls * 2.4, mix('#FFC2D6', p.accent, 0.2), 0.45);
  h += rings(ctx, { cx, cy, size: ls * 2.2, color: rgba('#fff', 0.45), n: 3, cycles: 2, width: 0.004, s0: 0.4, s1: 1.15 });
  h += at(cx, cy, ls * 0.9, ls * 0.9, pad(ls * 0.9, mix(green, '#000', 0.1)), 'z-index:2');
  h += at(cx, cy, ls, ls, mo(ctx, lotus(ls, mix('#FF8FB1', p.accent, 0.12), '#FFD34D'), { type: 'pulse', mode: 'breathe', amp: 0.05, cycles: 2 }), 'z-index:4');
  // Koi circling the lotus.
  const kw = S * 0.26;
  [[mix('#FF7A2F', '#fff', 0.05), '#fff', 0.0], ['#F6F1E8', '#FF5A1F', 0.5]].forEach(([c1, c2, ph], i) => {
    const fish = mo(ctx, koi(kw, c1, c2), { type: 'osc', prop: 'rotate', lo: -5, hi: 5, cycles: 10 + i * 2 });
    h += sprite(ctx, kw, kw * 0.45, fish, { type: 'orbit', rx: S * (0.5 + i * 0.06), ry: S * (0.33 + i * 0.04), face: true, cycles: 1, phase: ph }, { x: cx, y: cy, z: 3 });
  });
  return h;
}
