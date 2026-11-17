// Scene: a spinning record with sound rings, notes floating up and an equaliser breathing along the bottom.
// variant "voice": a glowing mic button with radial level bars (podcasts, voice, AI music).
import { palette, stage, rand, uid, layer, at, box, mo, svg, lin, rad, backdrop, glow, blobs, rings, mix, rgba, r } from './_kit.mjs';

export const meta = {
  id: 'sound', name: 'Sound', mood: 'lively', poster: 0.4,
  summary: 'Spinning record with sound rings, notes floating up, an equaliser along the bottom. Variant voice: glowing mic with radial level bars.',
  niches: ['music-streaming', 'ai-music-voice', 'podcast-stories'],
  keywords: ['music', 'song', 'songs', 'playlist', 'audio', 'sound', 'radio', 'podcast', 'voice', 'sing', 'karaoke', 'beat', 'dj', 'listen'],
  variants: ['voice'],
};

const note = (s, c) => svg(s, s, `<path d="M38 16 L84 6 L84 66 C84 76 74 84 64 82 C54 80 50 70 56 64 C62 58 72 60 76 62 L76 24 L46 30 L46 76 C46 86 36 94 26 92 C16 90 12 80 18 74 C24 68 34 70 38 72 Z" fill="${c}"/>`);

export function render(ctx, o = {}) {
  const { hero = true, intensity = 1, variant } = o;
  const g = stage(ctx, o.box), p = palette(ctx), R = rand(ctx, 'sound');
  const { W, H, cx, cy, S } = g;
  let h = hero ? backdrop(ctx, p.dark
    ? `radial-gradient(ellipse 65% 85% at 50% 45%, ${mix(p.base, p.accent, 0.2)} 0%, ${mix(p.base, '#000', 0.35)} 80%)`
    : `radial-gradient(ellipse 65% 85% at 50% 45%, ${mix(p.base, '#fff', 0.6)} 0%, ${mix(p.base, p.accent, 0.12)} 85%)`) : '';
  h += layer(ctx, blobs(ctx, R, { colors: [p.accent, p.accent2], n: 5, a: (p.dark ? 0.24 : 0.2) * intensity }));
  // Equaliser along the bottom.
  const n = Math.round(W / (S * 0.05)), bw = W / n;
  for (let i = 0; i < n; i++) {
    const bh = H * (0.1 + R() * 0.16);
    const c = mix(p.accent, p.accent2, i / n);
    h += box(i * bw + bw * 0.2, H - bh, bw * 0.6, bh, mo(ctx, `<div style="position:absolute;inset:0;border-radius:${r(bw * 0.3)}px ${r(bw * 0.3)}px 0 0;background:linear-gradient(180deg, ${c}, ${rgba(c, 0.15)})"></div>`,
      { type: 'osc', prop: 'scaleY', lo: 0.25, hi: 1, cycles: 3 + Math.floor(R() * 5), phase: R() }, 'transform-origin:50% 100%'), `opacity:${(hero ? 0.55 : 0.4) * intensity}`);
  }
  // Notes floating up.
  for (let i = 0; i < (hero ? 10 : 7); i++) {
    const s = S * (0.05 + R() * 0.05), x = W * (0.05 + R() * 0.9), y = H * (0.6 + R() * 0.3);
    h += at(x, y, s, s, mo(ctx, note(s, i % 2 ? mix(p.accent, '#fff', 0.2) : mix(p.accent2, '#fff', 0.2)), { type: 'travel', x0: 0, y0: 0, x1: (R() - 0.5) * S * 0.2, y1: -H * 0.55, wx: s * 0.6, r0: -12, r1: 12, fi: 0.15, fo: 0.35, o: 0.9 * intensity, cycles: 1, phase: R() }));
  }
  if (!hero) return h;
  const ds = S * 0.56;
  h += glow(cx, cy, ds * 2.2, p.accent, p.dark ? 0.5 : 0.35);
  h += rings(ctx, { cx, cy, size: ds * 2, color: rgba(p.accent, 0.55), n: 3, cycles: 4, width: 0.005, s0: 0.55, s1: 1.1 });
  if (variant === 'voice') {
    let bars = '';
    for (let i = 0; i < 36; i++) {
      bars += box(ds / 2 - ds * 0.012, 0, ds * 0.024, ds / 2, mo(ctx, `<div style="position:absolute;left:0;right:0;top:0;height:28%;border-radius:99px;background:${mix(p.accent, p.accent2, (i % 12) / 12)}"></div>`,
        { type: 'osc', prop: 'scaleY', lo: 0.3, hi: 1, cycles: 4 + (i % 5), phase: R() }, 'transform-origin:50% 100%'), `transform:rotate(${i * 10}deg);transform-origin:50% 100%`);
    }
    h += at(cx, cy, ds, ds, bars, 'z-index:3');
    const mic = svg(ds * 0.4, ds * 0.4, `<circle cx="50" cy="50" r="48" fill="${p.accent}"/><rect x="40" y="22" width="20" height="36" rx="10" fill="${p.dark ? '#0B0B12' : '#fff'}"/><path d="M30 48 C30 62 40 70 50 70 C60 70 70 62 70 48 M50 70 L50 80" stroke="${p.dark ? '#0B0B12' : '#fff'}" stroke-width="5" fill="none" stroke-linecap="round"/>`);
    h += at(cx, cy, ds * 0.4, ds * 0.4, mo(ctx, mic, { type: 'pulse', amp: 0.06, cycles: 6 }), `z-index:4;filter:drop-shadow(0 0 ${r(ds * 0.06)}px ${rgba(p.accent, 0.8)})`);
    return h;
  }
  const id = uid('lb');
  const grooves = Array.from({ length: 9 }, (_, i) => `<circle cx="50" cy="50" r="${44 - i * 2.6}" fill="none" stroke="#fff" stroke-opacity="${i % 2 ? 0.05 : 0.09}" stroke-width=".8"/>`).join('');
  const disc = svg(ds, ds, `<defs>${lin(id, [[0, mix(p.accent, '#fff', 0.2)], [1, p.accent2]])}</defs>
    <circle cx="50" cy="50" r="48" fill="#121218"/>${grooves}<circle cx="50" cy="50" r="17" fill="url(#${id})"/><circle cx="50" cy="50" r="2.4" fill="#121218"/>
    <path d="M20 26 A40 40 0 0 1 50 10" stroke="#fff" stroke-opacity=".22" stroke-width="5" fill="none" stroke-linecap="round"/>`, { css: `filter:drop-shadow(0 ${r(ds * 0.04)}px ${r(ds * 0.08)}px rgba(0,0,0,.45))` });
  h += at(cx, cy, ds, ds, mo(ctx, disc, { type: 'spin', cycles: 2 }), 'z-index:3');
  // A fixed shine over the spinning disc keeps the spin readable.
  h += at(cx, cy, ds, ds, svg(ds, ds, `<path d="M18 30 A38 38 0 0 1 40 13" stroke="#fff" stroke-opacity=".25" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M82 70 A38 38 0 0 1 60 87" stroke="#fff" stroke-opacity=".12" stroke-width="3" fill="none" stroke-linecap="round"/>`), 'z-index:4');
  return h;
}
