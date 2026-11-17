// Scene: a flower blooming in the loop — stems swaying, butterflies wandering, fireflies glowing.
import { palette, stage, rand, uid, layer, at, box, mo, sprite, svg, lin, rad, backdrop, glow, blobs, stars, loopPath, mix, rgba, r } from './_kit.mjs';

export const meta = {
  id: 'bloom', name: 'Bloom', mood: 'gentle', poster: 0.45,
  summary: 'A flower opens petal by petal and closes again before the loop restarts; stems sway, butterflies wander, fireflies glow.',
  niches: ['plant-identifier', 'habit-tracker', 'period-fertility', 'pregnancy-baby', 'skincare-beauty', 'pet-care', 'water-tracker'],
  keywords: ['plant', 'plants', 'garden', 'flower', 'grow', 'growth', 'habit', 'streak', 'bloom', 'cycle', 'period', 'fertility', 'pregnancy', 'baby', 'skin', 'beauty', 'self care'],
};

const butterfly = (s, c1, c2) => {
  const id = uid('bf');
  const wing = (dir) => `<g class="wing"><path d="M50 50 C${50 + dir * 8} 20 ${50 + dir * 44} 8 ${50 + dir * 46} 30 C${50 + dir * 48} 46 ${50 + dir * 20} 50 50 52 Z" fill="url(#${id})"/><path d="M50 54 C${50 + dir * 20} 58 ${50 + dir * 38} 66 ${50 + dir * 30} 82 C${50 + dir * 22} 90 ${50 + dir * 8} 74 50 56 Z" fill="${c2}" fill-opacity=".9"/></g>`;
  return svg(s, s, `<defs>${lin(id, [[0, mix(c1, '#fff', 0.35)], [1, c1]])}</defs>${wing(-1)}${wing(1)}<ellipse cx="50" cy="56" rx="3" ry="16" fill="#2B2340"/>`);
};

export function render(ctx, o = {}) {
  const { hero = true, intensity = 1 } = o;
  const g = stage(ctx, o.box), p = palette(ctx), R = rand(ctx, 'bloom');
  const { W, H, cx, cy, S } = g;
  const leafC = mix('#3FA35B', p.accent, 0.2);
  let h = hero ? backdrop(ctx, p.dark
    ? `radial-gradient(ellipse 65% 85% at 50% 40%, ${mix('#1D4B34', p.accent, 0.15)} 0%, ${mix('#0B1F16', p.base, 0.4)} 85%)`
    : `radial-gradient(ellipse 65% 85% at 50% 40%, ${mix('#F4FFF6', p.accent, 0.05)} 0%, ${mix('#CFEFD9', p.accent, 0.12)} 85%)`) : '';
  h += layer(ctx, blobs(ctx, R, { colors: [p.accent, p.accent2, leafC], n: 4, a: (p.dark ? 0.16 : 0.2) * intensity }));
  h += stars(ctx, R, { n: hero ? 40 : 28, color: rgba(p.dark ? '#E8FF9C' : '#FFFFFF', 0.9 * intensity), min: S * 0.006, max: S * 0.016, sparkle: 0, lo: 0.05 });
  // Stems with leaves along the bottom, swaying from their base.
  for (let i = 0; i < 16; i++) {
    const sh = S * (0.35 + R() * 0.45), sw = sh * 0.4, x = W * (i + 0.5) / 16 + (R() - 0.5) * W * 0.03;
    if (hero && Math.abs(x - cx) < S * 0.22) continue;
    const stem = svg(sw, sh, `<path d="M50 200 C46 150 56 100 50 30" stroke="${mix(leafC, '#000', 0.1)}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M50 120 C20 108 10 90 14 80 C34 82 48 98 50 118 Z" fill="${leafC}"/><path d="M51 86 C80 72 92 56 88 46 C66 50 54 66 51 84 Z" fill="${mix(leafC, '#fff', 0.15)}"/>`, { vb: '0 0 100 200' });
    h += box(x - sw / 2, H - sh * 0.92, sw, sh, mo(ctx, stem, { type: 'osc', prop: 'rotate', lo: -4, hi: 4, cycles: 1 + (i % 2), phase: R() }, 'transform-origin:50% 100%'), `opacity:${0.9 * intensity}`);
  }
  if (!hero) return h;
  const fs = S * 0.5;
  h += glow(cx, cy, fs * 2.4, mix('#FFD36E', p.accent2, 0.2), 0.45);
  // Main stem.
  const sy = cy + fs * 0.1, ly = cy + (H - cy) * 0.55;
  h += box(0, 0, W, H, svg(W, H, `<path d="M${r(cx)} ${r(sy)} C${r(cx - fs * 0.08)} ${r(cy + (H - cy) * 0.4)} ${r(cx + fs * 0.08)} ${r(cy + (H - cy) * 0.7)} ${r(cx)} ${r(H + 10)}" stroke="${mix(leafC, '#000', 0.1)}" stroke-width="${r(fs * 0.035)}" fill="none" stroke-linecap="round"/>
    <path d="M${r(cx)} ${r(ly)} C${r(cx - fs * 0.35)} ${r(ly - fs * 0.1)} ${r(cx - fs * 0.5)} ${r(ly - fs * 0.3)} ${r(cx - fs * 0.45)} ${r(ly - fs * 0.4)} C${r(cx - fs * 0.2)} ${r(ly - fs * 0.35)} ${r(cx - fs * 0.04)} ${r(ly - fs * 0.15)} ${r(cx)} ${r(ly)} Z" fill="${leafC}"/>`, { vb: `0 0 ${r(W)} ${r(H)}` }), 'z-index:2');
  // Petals open one after another, hold, close at the end of the loop.
  const pet = uid('pt'), petC = mix('#FF7EB6', p.accent2, 0.25);
  let petals = '';
  for (let i = 0; i < 10; i++) {
    const a = (360 / 10) * i;
    const one = svg(fs, fs, `<defs>${lin(pet, [[0, mix(petC, '#fff', 0.6)], [1, petC]], { x1: 0, y1: 1, x2: 0, y2: 0 })}</defs><path d="M50 50 C36 36 38 10 50 4 C62 10 64 36 50 50 Z" fill="url(#${pet})"/>`);
    petals += box(0, 0, fs, fs, mo(ctx, one, { type: 'grow', in: 0.04 + i * 0.018, len: 0.12, out: 0.88, from: 0.15, over: 0.05 }, 'transform-origin:50% 50%'), `transform:rotate(${a}deg)`);
  }
  const core = `<div style="position:absolute;left:38%;top:38%;width:24%;height:24%;border-radius:50%;background:radial-gradient(circle at 40% 35%, #FFF3B0, #FFB703);box-shadow:0 0 ${r(fs * 0.08)}px rgba(255,190,40,.8)"></div>`;
  h += box(cx - fs / 2, cy - fs / 2, fs, fs, mo(ctx, petals + core, { type: 'osc', prop: 'rotate', lo: -6, hi: 6, cycles: 1 }), 'z-index:4');
  // Butterflies wandering around the flower.
  [[mix('#6EC6FF', p.accent, 0.15), '#3A86FF', 0], [mix('#FFB347', p.accent2, 0.1), '#FF7A00', 0.5]].forEach(([c1, c2, ph], i) => {
    const bs = S * 0.19;
    const fly = mo(ctx, butterfly(bs, c1, c2), { type: 'osc', prop: 'scaleX', lo: 0.35, hi: 1, cycles: 30 + i * 6 });
    h += sprite(ctx, bs, bs, fly, { type: 'path', d: loopPath(cx, cy - S * 0.05, S * (0.6 + i * 0.12), S * (0.34 + i * 0.05), R, { wobble: 0.18 }), face: true, faceOffset: 90, cycles: 1, phase: ph }, { z: 6 });
  });
  return h;
}
