// Scene: conversation bubbles popping in one by one, typing dots, hearts floating up, friends around.
// variant "dating": more hearts, bigger avatars.
import { palette, stage, rand, uid, layer, at, box, mo, svg, lin, rad, backdrop, glow, blobs, HEART, mix, rgba, r } from './_kit.mjs';

export const meta = {
  id: 'chat', name: 'Chat', mood: 'lively', poster: 0.55,
  summary: 'Message bubbles pop in one after another, typing dots, hearts floating up, friend avatars drifting around.',
  niches: ['social-community', 'dating'],
  keywords: ['chat', 'message', 'messages', 'messaging', 'friends', 'social', 'community', 'dating', 'match', 'date', 'family', 'group', 'connect', 'meet'],
  variants: ['dating'],
};

const avatar = (s, c1, c2) => {
  const id = uid('av');
  return svg(s, s, `<defs>${lin(id, [[0, c1], [1, c2]])}</defs><circle cx="50" cy="50" r="48" fill="url(#${id})"/><circle cx="50" cy="40" r="16" fill="#fff" fill-opacity=".9"/><path d="M20 84 C26 64 74 64 80 84 C70 94 30 94 20 84 Z" fill="#fff" fill-opacity=".9"/>`, { css: `filter:drop-shadow(0 ${r(s * 0.06)}px ${r(s * 0.1)}px rgba(0,0,0,.25))` });
};

export function render(ctx, o = {}) {
  const { hero = true, intensity = 1, variant } = o;
  const g = stage(ctx, o.box), p = palette(ctx), R = rand(ctx, 'chat');
  const { W, H, cx, cy, S } = g;
  const pink = mix('#FF4F81', p.accent, 0.2);
  let h = hero ? backdrop(ctx, p.dark
    ? `radial-gradient(ellipse 65% 85% at 50% 45%, ${mix(p.base, p.accent, 0.18)} 0%, ${mix(p.base, '#000', 0.3)} 80%)`
    : `radial-gradient(ellipse 65% 85% at 50% 45%, ${mix(p.base, '#fff', 0.7)} 0%, ${mix(p.base, p.accent, 0.1)} 85%)`) : '';
  h += layer(ctx, blobs(ctx, R, { colors: [p.accent, p.accent2, pink], n: 5, a: (p.dark ? 0.22 : 0.18) * intensity }));
  // Hearts floating up.
  const nh = (variant === 'dating' ? 16 : 9) * (hero ? 1 : 0.7);
  for (let i = 0; i < nh; i++) {
    const s = S * (0.04 + R() * 0.05);
    const heart = svg(s, s, `<path d="${HEART}" fill="${i % 3 ? pink : mix(pink, '#fff', 0.35)}"/>`);
    h += at(W * (0.05 + R() * 0.9), H * (0.7 + R() * 0.25), s, s, mo(ctx, heart, { type: 'travel', x0: 0, y0: 0, x1: (R() - 0.5) * S * 0.2, y1: -H * (0.5 + R() * 0.3), wx: s * 0.8, s0: 0.6, s1: 1.1, fi: 0.12, fo: 0.4, o: 0.85 * intensity, cycles: 1, phase: R() }));
  }
  // Friends drifting around the edges.
  const cols = [[p.accent, p.accent2], ['#FFB347', '#FF6F91'], ['#4FACFE', '#00F2FE'], ['#A18CD1', '#FBC2EB'], ['#43E97B', '#38F9D7'], ['#FA709A', '#FEE140']];
  for (let i = 0; i < 6; i++) {
    const s = S * (variant === 'dating' ? 0.2 : 0.14) * (0.8 + R() * 0.4);
    const side = i % 2 ? 1 : -1;
    const x = hero ? cx + side * (S * 0.75 + R() * (W / 2 - S * 0.75)) : W * (0.05 + R() * 0.9);
    h += at(Math.max(s, Math.min(W - s, x)), H * (0.15 + R() * 0.7), s, s, mo(ctx, avatar(s, ...cols[i % cols.length]), { type: 'float', x: s * 0.1, y: s * 0.15, rot: 4, phase: R() }), `opacity:${intensity}`);
  }
  if (!hero) return h;
  h += glow(cx, cy, S * 1.4, p.accent, p.dark ? 0.35 : 0.25);
  // Bubbles.
  const bw = S * 0.62, rows = [[-1, 0.9, 0.06], [1, 0.75, 0.2], [-1, 0.6, 0.34]];
  const bh = S * 0.15, gap = S * 0.05, total = rows.length * bh + (rows.length) * gap + bh * 0.8;
  let y = cy - total / 2;
  rows.forEach(([side, wf, tin], i) => {
    const w = bw * wf, x = cx + (side < 0 ? -bw / 2 : bw / 2 - w);
    const mine = side > 0;
    const bg = mine ? `linear-gradient(135deg, ${mix(p.accent, '#fff', 0.1)}, ${p.accent2})` : (p.dark ? 'rgba(255,255,255,.14)' : '#FFFFFF');
    const lineC = mine ? rgba('#fff', 0.85) : rgba(p.dark ? '#fff' : '#0B0B12', 0.25);
    const bubble = `<div style="position:absolute;inset:0;border-radius:${r(bh * 0.45)}px;${mine ? `border-bottom-right-radius:${r(bh * 0.12)}px` : `border-bottom-left-radius:${r(bh * 0.12)}px`};background:${bg};box-shadow:0 ${r(bh * 0.12)}px ${r(bh * 0.3)}px rgba(0,0,0,${p.dark ? 0.35 : 0.12});${p.dark && !mine ? 'backdrop-filter:blur(8px);' : ''}">
      <div style="position:absolute;left:12%;top:30%;width:64%;height:14%;border-radius:99px;background:${lineC}"></div><div style="position:absolute;left:12%;top:56%;width:42%;height:14%;border-radius:99px;background:${lineC}"></div></div>`;
    h += box(x, y, w, bh, ctx.motion(bubble, { type: 'pop', in: tin, out: 0.93, dy: bh * 0.4, css: 'position:absolute;inset:0' }), 'z-index:4');
    y += bh + gap;
  });
  // Typing dots.
  const tw = bh * 1.6, tx = cx - bw / 2;
  let dots = '';
  for (let i = 0; i < 3; i++) dots += box(tw * (0.22 + i * 0.22), bh * 0.32, bh * 0.26, bh * 0.26, mo(ctx, '', { type: 'osc', prop: 'opacity', lo: 0.25, hi: 1, cycles: 8, phase: i * 0.15 }, `border-radius:50%;background:${p.dark ? '#fff' : '#9AA0AE'}`));
  h += box(tx, y, tw, bh * 0.9, ctx.motion(`<div style="position:absolute;inset:0;border-radius:${r(bh * 0.45)}px;background:${p.dark ? 'rgba(255,255,255,.14)' : '#fff'}">${dots}</div>`, { type: 'pop', in: 0.48, out: 0.93, dy: bh * 0.3, css: 'position:absolute;inset:0' }), 'z-index:4');
  return h;
}
