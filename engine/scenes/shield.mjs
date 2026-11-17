// Scene: a glowing shield with a lock, scan rings, particles orbiting and a hex grid glinting — privacy & security.
import { palette, stage, rand, uid, layer, at, box, mo, sprite, svg, lin, backdrop, glow, rings, mix, rgba, r } from './_kit.mjs';

export const meta = {
  id: 'shield', name: 'Shield', mood: 'calm', poster: 0.4,
  summary: 'Glowing shield with a lock, scan rings, particles orbiting in depth, a hex grid glinting.',
  niches: ['vpn-security', 'password-manager', 'phone-cleaner', 'parenting-family-safety', 'banking-payments'],
  keywords: ['vpn', 'security', 'secure', 'privacy', 'private', 'password', 'passwords', 'protect', 'protection', 'antivirus', 'safe', 'lock', 'encrypt', 'cleaner'],
};

export function render(ctx, o = {}) {
  const { hero = true, intensity = 1 } = o;
  const g = stage(ctx, o.box), p = palette(ctx), R = rand(ctx, 'shield');
  const { W, H, cx, cy, S } = g;
  let h = hero ? backdrop(ctx, p.dark
    ? `radial-gradient(ellipse 60% 80% at 50% 45%, ${mix(p.base, p.accent, 0.2)} 0%, ${mix(p.base, '#000', 0.35)} 80%)`
    : `radial-gradient(ellipse 60% 80% at 50% 45%, ${mix(p.base, '#fff', 0.7)} 0%, ${mix(p.base, p.accent, 0.1)} 85%)`) : '';
  // Hex grid with a few cells glinting.
  const hs = S * 0.09, hw = hs * Math.sqrt(3);
  let grid = '';
  const hex = (x, y) => Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 3 * k + Math.PI / 6; return `${r(x + hs * 0.92 * Math.cos(a))},${r(y + hs * 0.92 * Math.sin(a))}`; }).join(' ');
  for (let row = 0, y = 0; y < H + hs; row++, y += hs * 1.5) for (let x = (row % 2) * hw / 2; x < W + hw; x += hw) grid += `<polygon points="${hex(x, y)}" fill="none" stroke="${rgba(p.accent, p.dark ? 0.1 : 0.14)}" stroke-width="1.5"/>`;
  h += layer(ctx, svg(W, H, grid, { vb: `0 0 ${r(W)} ${r(H)}` }), `opacity:${intensity};-webkit-mask-image:radial-gradient(ellipse 60% 70% at 50% 50%, #000 20%, transparent 80%)`);
  for (let i = 0; i < 14; i++) {
    const row = Math.floor(R() * (H / (hs * 1.5))), col = Math.floor(R() * (W / hw));
    const x = col * hw + (row % 2) * hw / 2, y = row * hs * 1.5;
    h += box(0, 0, W, H, mo(ctx, svg(W, H, `<polygon points="${hex(x, y)}" fill="${rgba(p.accent, 0.35)}"/>`, { vb: `0 0 ${r(W)} ${r(H)}` }), { type: 'osc', prop: 'opacity', lo: 0, hi: 0.9 * intensity, cycles: 1 + Math.floor(R() * 2), phase: R() }));
  }
  if (!hero) return h;
  const ss = S * 0.48;
  h += glow(cx, cy, ss * 2.6, p.accent, p.dark ? 0.55 : 0.35);
  h += rings(ctx, { cx, cy, size: ss * 2.4, color: rgba(p.accent, 0.6), n: 3, cycles: 2, width: 0.006, s0: 0.45, s1: 1.1 });
  const id = uid('sh'), id2 = uid('sh');
  const shield = svg(ss, ss, `<defs>${lin(id, [[0, mix(p.accent, '#fff', 0.25)], [1, mix(p.accent2, '#000', 0.15)]], { x1: 0.1, y1: 0, x2: 0.9, y2: 1 })}${lin(id2, [[0, '#fff', 0.45], [1, '#fff', 0]], { x1: 0, y1: 0, x2: 0.6, y2: 1 })}</defs>
    <path d="M50 4 L88 18 L88 46 C88 70 72 86 50 96 C28 86 12 70 12 46 L12 18 Z" fill="url(#${id})"/>
    <path d="M50 10 L82 22 L82 46 C82 66 68 80 50 89 L50 10 Z" fill="#000" fill-opacity=".08"/><path d="M50 4 L88 18 L88 30 C70 28 40 40 12 52 L12 18 Z" fill="url(#${id2})"/>
    <rect x="36" y="46" width="28" height="22" rx="4" fill="#fff"/><path d="M41 46 L41 39 C41 28 59 28 59 39 L59 46" fill="none" stroke="#fff" stroke-width="5"/><circle cx="50" cy="56" r="3.4" fill="${mix(p.accent, '#000', 0.4)}"/>`, { css: `filter:drop-shadow(0 0 ${r(ss * 0.08)}px ${rgba(p.accent, 0.8)})` });
  h += at(cx, cy, ss, ss, mo(ctx, shield, { type: 'pulse', mode: 'breathe', amp: 0.04, cycles: 2 }), 'z-index:4');
  for (let i = 0; i < 4; i++) {
    const ds = S * (0.022 + R() * 0.015);
    h += sprite(ctx, ds, ds, `<div style="position:absolute;inset:0;border-radius:50%;background:${mix(p.accent, '#fff', 0.5)};box-shadow:0 0 ${r(ds * 2)}px ${rgba(p.accent, 1)}"></div>`,
      { type: 'orbit', rx: ss * (0.78 + i * 0.1), ry: ss * (0.24 + i * 0.04), depth: 0.3, zFront: 6, zBack: 2, cycles: 1 + (i % 2), phase: i / 4 }, { x: cx, y: cy });
  }
  return h;
}
