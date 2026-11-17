// Scene: a camera lens with turning aperture blades, light leaks drifting, photo cards floating around.
import { palette, stage, rand, uid, layer, at, box, mo, svg, lin, rad, backdrop, glow, blobs, stars, mix, rgba, r } from './_kit.mjs';

export const meta = {
  id: 'lens', name: 'Lens', mood: 'lively', poster: 0.4,
  summary: 'Camera lens with aperture blades turning, colourful light leaks drifting, photo cards floating around it.',
  niches: ['camera-filters', 'photo-editor', 'ai-photo-editor', 'video-editor', 'collage-story-maker', 'ai-video-generator', 'ai-avatar-headshot', 'fashion-outfit'],
  keywords: ['photo', 'photos', 'camera', 'filter', 'filters', 'edit', 'editor', 'selfie', 'picture', 'video', 'collage', 'story', 'reels', 'portrait', 'retouch', 'avatar'],
};

const photo = (w, R) => {
  const id = uid('ph');
  const skies = [['#FF9A8B', '#FFD3A5'], ['#89F7FE', '#66A6FF'], ['#F6D365', '#FDA085'], ['#A18CD1', '#FBC2EB'], ['#84FAB0', '#8FD3F4']];
  const [a, b] = skies[Math.floor(R() * skies.length)];
  return svg(w, w * 1.18, `<defs>${lin(id, [[0, a], [1, b]])}</defs><rect x="0" y="0" width="100" height="118" rx="5" fill="#fff"/>
    <rect x="6" y="6" width="88" height="88" rx="2" fill="url(#${id})"/><circle cx="68" cy="34" r="10" fill="#fff" fill-opacity=".8"/>
    <path d="M6 94 L36 54 L54 76 L68 62 L94 94 Z" fill="#fff" fill-opacity=".55"/>`, { vb: '0 0 100 118', css: `filter:drop-shadow(0 ${r(w * 0.05)}px ${r(w * 0.08)}px rgba(0,0,0,.3))` });
};

export function render(ctx, o = {}) {
  const { hero = true, intensity = 1 } = o;
  const g = stage(ctx, o.box), p = palette(ctx), R = rand(ctx, 'lens');
  const { W, H, cx, cy, S } = g;
  let h = hero ? backdrop(ctx, p.dark ? mix(p.base, '#000', 0.3) : mix(p.base, '#fff', 0.3)) : '';
  h += layer(ctx, blobs(ctx, R, { colors: [p.accent, p.accent2, '#FF8A3D', '#FF4F81'], n: 6, a: (p.dark ? 0.32 : 0.26) * intensity }));
  h += stars(ctx, R, { n: hero ? 30 : 20, color: rgba('#fff', 0.9 * intensity), min: S * 0.006, max: S * 0.014, sparkle: 0.4, avoid: hero ? { cx, cy, r: S * 0.35 } : null });
  // Photo cards floating around.
  for (let i = 0; i < 8; i++) {
    const w = S * (0.17 + R() * 0.1), side = i % 2 ? 1 : -1;
    const x = hero ? cx + side * (S * 0.5 + R() * Math.max(S * 0.2, W / 2 - S * 0.6)) : W * (0.06 + R() * 0.88);
    const y = H * (0.15 + R() * 0.7);
    h += at(x, y, w, w * 1.18, mo(ctx, photo(w, R), { type: 'float', x: w * 0.06, y: w * 0.1, rot: 4, phase: R() }, `transform:rotate(${Math.round((R() - 0.5) * 30)}deg)`), `opacity:${intensity}`);
  }
  if (!hero) return h;
  const ls = S * 0.6;
  h += glow(cx, cy, ls * 2, p.accent, p.dark ? 0.5 : 0.35);
  const body = uid('lb'), glass = uid('lg');
  h += at(cx, cy, ls, ls, svg(ls, ls, `<defs>${lin(body, [[0, '#4A4A55'], [0.5, '#1B1B22'], [1, '#2E2E38']], { x1: 0, y1: 0, x2: 1, y2: 1 })}${rad(glass, [[0, mix(p.accent2, '#fff', 0.2)], [0.5, mix(p.accent, '#0B0B30', 0.55)], [1, '#05050F']], { cx: 0.42, cy: 0.38, r: 0.6 })}</defs>
    <circle cx="50" cy="50" r="49" fill="url(#${body})"/><circle cx="50" cy="50" r="44" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="1"/>
    ${Array.from({ length: 60 }, (_, i) => `<line x1="50" y1="3" x2="50" y2="6" stroke="#fff" stroke-opacity=".25" stroke-width=".6" transform="rotate(${i * 6} 50 50)"/>`).join('')}
    <circle cx="50" cy="50" r="38" fill="#0C0C12"/><circle cx="50" cy="50" r="34" fill="url(#${glass})"/>`, { css: `filter:drop-shadow(0 ${r(ls * 0.05)}px ${r(ls * 0.1)}px rgba(0,0,0,.5))` }), 'z-index:3');
  // Aperture blades turning inside the glass.
  const blades = Array.from({ length: 7 }, (_, i) => `<path d="M50 50 L50 20 C62 22 72 30 76 40 Z" fill="#14141C" fill-opacity=".85" stroke="#fff" stroke-opacity=".12" stroke-width=".5" transform="rotate(${(360 / 7) * i} 50 50)"/>`).join('');
  h += at(cx, cy, ls * 0.68, ls * 0.68, mo(ctx, svg(ls * 0.68, ls * 0.68, `<g transform="translate(-0.5 -0.5)">${blades}</g>`), { type: 'spin', cycles: 1 }), 'z-index:4;border-radius:50%;overflow:hidden');
  h += at(cx, cy, ls, ls, svg(ls, ls, `<ellipse cx="38" cy="34" rx="12" ry="6" fill="#fff" fill-opacity=".35" transform="rotate(-35 38 34)"/><circle cx="62" cy="64" r="3" fill="#fff" fill-opacity=".25"/>`), 'z-index:5');
  return h;
}
