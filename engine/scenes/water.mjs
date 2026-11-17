// Scene: a glass of water with a moving surface, bubbles rising inside and drops falling in — hydration.
import { palette, stage, rand, uid, layer, at, box, mo, svg, lin, backdrop, glow, blobs, motes, mix, rgba, r } from './_kit.mjs';

export const meta = {
  id: 'water', name: 'Water', mood: 'calm', poster: 0.45,
  summary: 'A glass whose water surface rolls in a seamless wave, bubbles rising inside, drops falling in, bubbles in the air.',
  niches: ['water-tracker'],
  keywords: ['water', 'hydration', 'hydrate', 'drink', 'drinking', 'glass', 'cups', 'intake', 'thirst'],
};

export function render(ctx, o = {}) {
  const { hero = true, intensity = 1 } = o;
  const g = stage(ctx, o.box), p = palette(ctx), R = rand(ctx, 'water');
  const { W, H, cx, cy, S } = g;
  const blue = mix('#3BA7FF', p.accent, 0.25);
  let h = hero ? backdrop(ctx, p.dark
    ? `radial-gradient(ellipse 65% 85% at 50% 45%, ${mix(p.base, blue, 0.25)} 0%, ${mix(p.base, '#000', 0.35)} 85%)`
    : `radial-gradient(ellipse 65% 85% at 50% 45%, ${mix('#F2FAFF', blue, 0.05)} 0%, ${mix('#CDEBFF', blue, 0.12)} 85%)`) : '';
  h += layer(ctx, blobs(ctx, R, { colors: [blue, p.accent], n: 4, a: (p.dark ? 0.2 : 0.18) * intensity }));
  h += motes(ctx, R, { n: hero ? 22 : 16, color: 'transparent', min: S * 0.02, max: S * 0.05, rise: H * 0.7, o: 0.8 * intensity,
    shape: (s) => `<div style="position:absolute;inset:0;border-radius:50%;border:${r(Math.max(2, s * 0.08))}px solid ${rgba(p.dark ? '#fff' : blue, 0.55)};background:radial-gradient(circle at 35% 30%, rgba(255,255,255,.55), rgba(255,255,255,0) 45%)"></div>` });
  if (!hero) return h;
  const gw = S * 0.42, gh = S * 0.62, x0 = cx - gw / 2, y0 = cy - gh / 2 + S * 0.04;
  h += glow(cx, cy, S * 1.3, blue, p.dark ? 0.45 : 0.3);
  const clip = uid('gc'), wv = uid('wv');
  const glassD = 'M8 6 L92 6 L82 132 C81 138 77 140 72 140 L28 140 C23 140 19 138 18 132 Z';
  // Wave surface: a long repeating wave that slides by exactly one wavelength.
  const lam = 50;
  let wave = 'M-100 60';
  for (let x = -100; x < 250; x += lam) wave += ` C${x + lam * 0.25} 52 ${x + lam * 0.25} 52 ${x + lam * 0.5} 60 C${x + lam * 0.75} 68 ${x + lam * 0.75} 68 ${x + lam} 60`;
  wave += ' L250 200 L-100 200 Z';
  const slide = (d, a, cyc) => ctx.motion('', { tag: 'g', type: 'slide', distance: -lam, cycles: cyc }).replace('</g>', `<path d="${d}" fill="url(#${wv})" fill-opacity="${a}"/></g>`);
  let bubbles = '';
  for (let i = 0; i < 8; i++) {
    const bx = 22 + R() * 56, bs = 2 + R() * 3;
    bubbles += ctx.motion('', { tag: 'g', type: 'travel', x0: 0, y0: 0, x1: (R() - 0.5) * 6, y1: -70, wx: 2, fi: 0.1, fo: 0.3, o: 0.8, cycles: 1 + (i % 2), phase: R() })
      .replace('</g>', `<circle cx="${r(bx)}" cy="134" r="${r(bs)}" fill="#fff" fill-opacity=".55"/></g>`);
  }
  h += box(x0, y0, gw, gh * 1.0, svg(gw, gh, `<defs><clipPath id="${clip}"><path d="${glassD}"/></clipPath>${lin(wv, [[0, mix(blue, '#fff', 0.25)], [1, mix(blue, '#003A70', 0.35)]])}</defs>
    <path d="${glassD}" fill="#fff" fill-opacity="${p.dark ? 0.08 : 0.45}"/>
    <g clip-path="url(#${clip})"><g transform="translate(0 6)">${slide(wave, 0.55, 2)}</g><g transform="translate(-20 12)">${slide(wave, 1, 1)}</g>${bubbles}</g>
    <path d="${glassD}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2.4"/><path d="M16 16 L24 120" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/>`, { vb: '0 0 100 142', css: `filter:drop-shadow(0 ${r(gh * 0.05)}px ${r(gh * 0.08)}px rgba(0,40,90,.25))` }), 'z-index:3');
  // Drops falling into the glass.
  for (let i = 0; i < 3; i++) {
    const ds = S * 0.06;
    const drop = svg(ds, ds, `<path d="M50 4 C64 30 80 48 80 64 C80 82 66 94 50 94 C34 94 20 82 20 64 C20 48 36 30 50 4 Z" fill="${mix(blue, '#fff', 0.2)}"/><ellipse cx="40" cy="62" rx="6" ry="10" fill="#fff" fill-opacity=".6"/>`);
    h += at(cx + (i - 1) * gw * 0.18, y0 + gh * 0.3, ds, ds, mo(ctx, drop, { type: 'travel', x0: 0, y0: -S * 0.5, x1: 0, y1: 0, ease: 'in', win: [0.12 + i * 0.28, 0.26 + i * 0.28], fi: 0.15, fo: 0.15, o: 1 }), 'z-index:4');
  }
  return h;
}
