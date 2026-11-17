// Scene: weather — a sun with turning rays half behind a cloud, clouds drifting, rain falling from another cloud.
import { palette, stage, rand, uid, layer, at, box, mo, svg, lin, rad, backdrop, glow, cloud, mix, rgba, r } from './_kit.mjs';

export const meta = {
  id: 'sky', name: 'Sky', mood: 'gentle', poster: 0.4,
  summary: 'Sun with slowly turning rays peeking over a cloud, clouds drifting, rain falling from a second cloud.',
  niches: ['weather'],
  keywords: ['weather', 'forecast', 'rain', 'sun', 'temperature', 'storm', 'wind', 'radar', 'climate', 'uv'],
};

export function render(ctx, o = {}) {
  const { hero = true, intensity = 1 } = o;
  const g = stage(ctx, o.box), p = palette(ctx), R = rand(ctx, 'sky');
  const { W, H, cx, cy, S } = g;
  const top = p.dark ? mix('#0E2A5A', p.accent, 0.12) : mix('#5AB2FF', p.accent, 0.12);
  const low = p.dark ? mix('#2C5C8A', p.accent2, 0.1) : mix('#CDEBFF', p.accent2, 0.08);
  let h = hero ? backdrop(ctx, `linear-gradient(180deg, ${top} 0%, ${low} 100%)`) : '';
  for (let i = 0; i < 8; i++) {
    const w = S * (0.4 + R() * 0.5), x = W * (i / 8) + R() * W * 0.06, y = H * (0.1 + R() * 0.75);
    if (hero && Math.abs(x + w / 2 - cx) < S * 0.6 && Math.abs(y - cy) < S * 0.4) continue;
    h += box(x, y, w, w / 2, mo(ctx, cloud(w, '#fff', p.dark ? 0.35 : 0.7), { type: 'float', x: S * 0.07, y: S * 0.01, rot: 0, phase: R() }), `opacity:${intensity}`);
  }
  if (!hero) return h;
  const ss = S * 0.42, sx = cx - S * 0.12, sy = cy - S * 0.14;
  h += glow(sx, sy, ss * 2.8, '#FFC94A', 0.55);
  const rays = svg(ss * 1.7, ss * 1.7, Array.from({ length: 12 }, (_, i) => `<rect x="48" y="2" width="4" height="13" rx="2" fill="#FFD25C" transform="rotate(${i * 30} 50 50)"/>`).join(''));
  h += at(sx, sy, ss * 1.7, ss * 1.7, mo(ctx, rays, { type: 'spin', cycles: 1 }), 'z-index:2');
  const sid = uid('sun');
  h += at(sx, sy, ss, ss, mo(ctx, svg(ss, ss, `<defs>${rad(sid, [[0, '#FFF6B5'], [0.6, '#FFC93C'], [1, '#FF9F1C']], { cx: 0.4, cy: 0.35, r: 0.7 })}</defs><circle cx="50" cy="50" r="46" fill="url(#${sid})"/>`, { css: 'filter:drop-shadow(0 0 30px rgba(255,190,60,.7))' }), { type: 'pulse', mode: 'breathe', amp: 0.04, cycles: 2 }), 'z-index:3');
  // Rain cloud on the right.
  const rw = S * 0.62, rx = cx + S * 0.38, ry = cy - S * 0.2;
  for (let i = 0; i < 14; i++) {
    const dx = rx + (R() - 0.5) * rw * 0.6, ds = S * 0.012;
    h += box(dx, ry + rw * 0.1, ds, S * 0.07, mo(ctx, `<div style="position:absolute;inset:0;border-radius:99px;background:linear-gradient(180deg, rgba(160,210,255,0), ${p.dark ? '#9ED0FF' : '#4A90E2'})"></div>`, { type: 'travel', x0: 0, y0: 0, x1: -S * 0.04, y1: S * 0.42, fi: 0.1, fo: 0.3, o: 0.9, cycles: 3, phase: R() }, 'transform:rotate(8deg)'), 'z-index:4');
  }
  h += box(rx - rw / 2, ry - rw / 4, rw, rw / 2, mo(ctx, cloud(rw, p.dark ? '#C9D6E8' : '#E6EEF8', 1), { type: 'float', x: S * 0.02, y: S * 0.01, rot: 0, phase: 0.3 }), 'z-index:5');
  // Front cloud over the sun.
  const fw = S * 0.78;
  h += box(sx - fw * 0.25, sy + ss * 0.05, fw, fw / 2, mo(ctx, cloud(fw, '#fff', 1), { type: 'float', x: S * 0.03, y: S * 0.012, rot: 0, phase: 0.6 }), 'z-index:6;filter:drop-shadow(0 20px 30px rgba(0,40,90,.18))');
  return h;
}
