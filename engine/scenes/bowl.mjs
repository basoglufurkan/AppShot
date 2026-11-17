// Scene: a warm bowl with steam curling up and toppings dropping in — food, recipes, nutrition.
import { palette, stage, rand, uid, layer, at, box, mo, svg, lin, rad, backdrop, glow, blobs, motes, mix, rgba, r } from './_kit.mjs';

export const meta = {
  id: 'bowl', name: 'Bowl', mood: 'warm', poster: 0.5,
  summary: 'A colourful bowl, steam curling up, toppings dropping in one by one, herbs drifting around.',
  niches: ['recipes-meal-plan', 'food-delivery', 'nutrition-calorie', 'grocery-list'],
  keywords: ['recipe', 'recipes', 'cooking', 'meal', 'food', 'kitchen', 'calorie', 'nutrition', 'diet', 'grocery', 'restaurant', 'delivery', 'dish', 'cook'],
};

const leaf = (s, c) => svg(s, s, `<path d="M50 6 C78 20 88 56 50 94 C12 56 22 20 50 6 Z" fill="${c}"/><path d="M50 14 L50 88" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>`);
const slice = (s, c, core) => svg(s, s, `<circle cx="50" cy="50" r="46" fill="${c}"/><circle cx="50" cy="50" r="30" fill="${core}"/><circle cx="50" cy="50" r="10" fill="${c}" fill-opacity=".6"/>`);
const egg = (s) => svg(s, s, `<ellipse cx="50" cy="52" rx="46" ry="40" fill="#FFFDF5"/><circle cx="50" cy="54" r="20" fill="#FFB020"/><circle cx="44" cy="48" r="6" fill="#fff" fill-opacity=".5"/>`);

export function render(ctx, o = {}) {
  const { hero = true, intensity = 1 } = o;
  const g = stage(ctx, o.box), p = palette(ctx), R = rand(ctx, 'bowl');
  const { W, H, cx, S } = g;
  const cy = g.cy;
  const warm = p.dark ? mix('#3A1A0C', p.accent, 0.12) : mix('#FFE9CF', p.accent, 0.1);
  let h = hero ? backdrop(ctx, p.dark
    ? `radial-gradient(ellipse 65% 85% at 50% 40%, ${mix(warm, '#FF9A3D', 0.22)} 0%, ${mix(warm, '#000', 0.35)} 80%)`
    : `radial-gradient(ellipse 65% 85% at 50% 40%, ${mix(warm, '#fff', 0.6)} 0%, ${warm} 85%)`) : '';
  h += layer(ctx, blobs(ctx, R, { colors: ['#FF9A3D', p.accent], n: 4, a: (p.dark ? 0.18 : 0.2) * intensity }));
  // Herbs and seeds drifting around.
  const herbs = ['#4CAF50', '#7BC67E', '#E63946', '#FFB020'];
  for (let i = 0; i < 14; i++) {
    const s = S * (0.035 + R() * 0.04), x = W * R(), y = H * (0.08 + R() * 0.84);
    if (hero && Math.abs(x - cx) < S * 0.55 && Math.abs(y - cy) < S * 0.5) continue;
    const c = herbs[i % herbs.length];
    h += at(x, y, s, s, mo(ctx, i % 3 ? leaf(s, c) : slice(s, c, mix(c, '#fff', 0.5)), { type: 'float', x: s * 0.6, y: s * 0.9, rot: 25, phase: R() }, `transform:rotate(${Math.round(R() * 360)}deg)`), `opacity:${0.85 * intensity}`);
  }
  if (!hero) return h;
  const bw = S * 0.82, bh = bw * 0.5, top = cy - bh * 0.1;
  h += glow(cx, cy - S * 0.1, S * 1.4, '#FFB46B', p.dark ? 0.35 : 0.3);
  // Steam wisps.
  for (let i = 0; i < 5; i++) {
    const sw = S * 0.2, shh = S * 0.5, x = cx + (i - 2) * bw * 0.15;
    const wisp = svg(sw, shh, `<path d="M50 200 C10 160 90 130 50 92 C14 58 84 34 54 0" fill="none" stroke="#fff" stroke-opacity="${p.dark ? 0.42 : 0.8}" stroke-width="16" stroke-linecap="round"/>`, { vb: '0 0 100 200', css: `filter:blur(${r(sw * 0.07)}px)` });
    h += box(x - sw / 2, top - shh * 0.95, sw, shh, mo(ctx, wisp, { type: 'travel', x0: 0, y0: shh * 0.15, x1: (i % 2 ? 1 : -1) * sw * 0.3, y1: -shh * 0.35, s0: 0.85, s1: 1.15, fi: 0.3, fo: 0.4, o: 0.8, cycles: 2, phase: i / 5 }), 'z-index:2');
  }
  // Bowl.
  const id = uid('bw'), fid = uid('bf');
  const bowlC = mix('#E4572E', p.accent, 0.25);
  h += box(cx - bw / 2, top, bw, bh * 1.15, svg(bw, bh * 1.15, `<defs>${lin(id, [[0, mix(bowlC, '#fff', 0.15)], [1, mix(bowlC, '#000', 0.35)]])}${rad(fid, [[0, '#FFE1A0'], [1, '#F0B44C']], { cx: 0.5, cy: 0.4, r: 0.6 })}</defs>
    <ellipse cx="100" cy="112" rx="62" ry="7" fill="#000" fill-opacity=".22"/>
    <path d="M4 22 C8 78 52 104 100 104 C148 104 192 78 196 22 Z" fill="url(#${id})"/>
    <ellipse cx="100" cy="22" rx="96" ry="16" fill="${mix(bowlC, '#000', 0.25)}"/><ellipse cx="100" cy="22" rx="90" ry="12.5" fill="url(#${fid})"/>
    <path d="M22 22 C40 14 56 28 74 18 C92 10 108 28 126 18 C144 10 160 26 178 20" fill="none" stroke="#E8A93A" stroke-width="3"/>
    <path d="M18 42 C60 56 140 56 182 42" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="4"/>`, { vb: '0 0 200 115' }), 'z-index:4');
  // Toppings dropping in.
  const tops = [[egg, -0.2, 0.08], [(s) => slice(s, '#E63946', '#FF8A80'), 0.18, 0.3], [(s) => leaf(s, '#43A047'), 0.0, 0.52], [(s) => slice(s, '#7CB342', '#C5E1A5'), -0.05, 0.7]];
  tops.forEach(([fn, dx, ph], i) => {
    const s = S * (i ? 0.09 : 0.13);
    h += at(cx + bw * dx, top + bh * 0.02, s, s, mo(ctx, fn(s), { type: 'travel', x0: 0, y0: -S * 0.55, x1: 0, y1: 0, r0: -40 + i * 30, r1: i * 15, ease: 'in', win: [ph, ph + 0.18], fi: 0.1, fo: 0.05, o: 1 }), 'z-index:5');
    h += at(cx + bw * dx, top + bh * 0.06, s, s * 0.6, mo(ctx, fn(s), { type: 'grow', in: ph + 0.18, len: 0.02, out: 0.93, from: 0.9, fade: true }), 'z-index:5');
  });
  return h;
}
