// Scene: a glass chart card whose bars grow and whose trend line draws itself, coins floating up around it.
import { palette, stage, rand, uid, layer, at, box, mo, svg, lin, backdrop, glow, blobs, motes, coin, mix, rgba, r, dashPath } from './_kit.mjs';

export const meta = {
  id: 'growth', name: 'Growth', mood: 'calm', poster: 0.62,
  summary: 'Glass chart card: bars grow one by one, the trend line draws, a dot lands on top, coins drift upwards.',
  niches: ['budget-expense', 'banking-payments', 'investing-crypto', 'business-invoice'],
  keywords: ['budget', 'money', 'finance', 'savings', 'expense', 'spending', 'invest', 'portfolio', 'bank', 'wallet', 'income', 'invoice', 'revenue', 'chart'],
};

export function render(ctx, o = {}) {
  const { hero = true, intensity = 1 } = o;
  const g = stage(ctx, o.box), p = palette(ctx), R = rand(ctx, 'growth');
  const { W, H, cx, cy, S } = g;
  let h = '';
  if (hero) h += backdrop(ctx, p.dark
    ? `radial-gradient(ellipse 70% 80% at 50% 40%, ${mix(p.base, p.accent, 0.16)} 0%, ${mix(p.base, '#000', 0.2)} 75%)`
    : `radial-gradient(ellipse 70% 80% at 50% 40%, ${mix(p.base, '#fff', 0.6)} 0%, ${mix(p.base, p.accent, 0.08)} 80%)`);
  h += layer(ctx, blobs(ctx, R, { colors: [p.accent, p.accent2], n: 4, a: (p.dark ? 0.22 : 0.18) * intensity }));
  // Coins rising across the canvas.
  h += motes(ctx, R, { n: hero ? 14 : 10, area: { x: 0, y: H * 0.35, w: W, h: H * 0.65 }, min: S * 0.035, max: S * 0.07, rise: H * 0.75, o: 0.85 * intensity, wobble: 0.15, cycles: [1], shape: (s) => coin(s) });
  if (!hero) return h;
  const cw = S * 0.92, ch = S * 0.6, x0 = cx - cw / 2, y0 = cy - ch / 2;
  h += glow(cx, cy, S * 1.5, p.accent, p.dark ? 0.35 : 0.25);
  const card = `<div style="position:absolute;inset:0;border-radius:${r(S * 0.06)}px;background:${p.dark ? 'linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.05))' : 'linear-gradient(160deg, rgba(255,255,255,.92), rgba(255,255,255,.7))'};border:${r(Math.max(2, S * 0.004))}px solid ${p.dark ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.95)'};box-shadow:0 ${r(S * 0.04)}px ${r(S * 0.1)}px ${rgba(p.dark ? '#000' : mix(p.accent, '#000', 0.5), p.dark ? 0.45 : 0.18)};backdrop-filter:blur(${r(S * 0.02)}px)"></div>`;
  h += box(x0, y0, cw, ch, card, 'z-index:2');
  // Bars.
  const n = 7, pad = cw * 0.09, bw = (cw - pad * 2) / n * 0.58, gap = (cw - pad * 2) / n;
  const hs = [0.32, 0.44, 0.38, 0.55, 0.5, 0.7, 0.86];
  const base = y0 + ch - pad * 0.9, top = y0 + pad * 1.1, span = base - top;
  const pts = [];
  hs.forEach((v, i) => {
    const bx = x0 + pad + gap * i + (gap - bw) / 2, bh = span * v;
    const c = i === n - 1 ? p.accent : mix(p.accent, p.dark ? '#fff' : p.base, p.dark ? 0.55 : 0.55);
    const bar = `<div style="position:absolute;inset:0;border-radius:${r(bw * 0.28)}px;background:linear-gradient(180deg, ${mix(c, '#fff', 0.2)}, ${c})"></div>`;
    h += box(bx, base - bh, bw, bh, mo(ctx, bar, { type: 'grow', axis: 'y', in: 0.04 + i * 0.045, len: 0.12, out: 0.9, over: 0.04 }, 'transform-origin:50% 100%'), 'z-index:3');
    pts.push([bx + bw / 2, base - bh - span * 0.08]);
  });
  // Trend line + landing dot.
  let d = `M${r(pts[0][0])} ${r(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i]; d += ` C${r((ax + bx) / 2)} ${r(ay)} ${r((ax + bx) / 2)} ${r(by)} ${r(bx)} ${r(by)}`; }
  h += box(0, 0, W, H, svg(W, H, dashPath(ctx, d, { stroke: p.dark ? '#fff' : mix(p.accent, '#000', 0.25), width: S * 0.012, mode: 'draw', inT: 0.22, len: 0.32, out: 0.9, extra: `style="filter:drop-shadow(0 0 ${r(S * 0.01)}px ${rgba(p.accent, 0.8)})"` }), { vb: `0 0 ${r(W)} ${r(H)}` }), 'z-index:4;pointer-events:none');
  const [lx, ly] = pts[pts.length - 1], ds = S * 0.055;
  h += at(lx, ly, ds, ds, mo(ctx, `<div style="position:absolute;inset:0;border-radius:50%;background:${p.accent};border:${r(ds * 0.18)}px solid ${p.dark ? '#fff' : '#fff'};box-shadow:0 0 ${r(ds)}px ${rgba(p.accent, 0.9)}"></div>`, { type: 'grow', in: 0.53, len: 0.08, out: 0.9, over: 0.25 }), 'z-index:5');
  // Two hero coins floating next to the card.
  h += at(x0 + cw * 1.0, y0 + ch * 0.08, S * 0.16, S * 0.16, mo(ctx, coin(S * 0.16), { type: 'float', y: S * 0.025, x: S * 0.008, rot: 6, phase: 0.2 }), 'z-index:6');
  h += at(x0 - cw * 0.02, y0 + ch * 0.92, S * 0.12, S * 0.12, mo(ctx, coin(S * 0.12), { type: 'float', y: S * 0.02, x: S * 0.006, rot: -8, phase: 0.65 }), 'z-index:6');
  return h;
}
