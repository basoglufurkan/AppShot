// Scene (fallback for any app): the app icon as a glowing glass tile, light sweeping across it,
// brand-colour particles orbiting and an aurora of brand colours drifting behind.
import { palette, stage, rand, layer, at, box, mo, sprite, backdrop, glow, blobs, stars, rings, mix, rgba, r, esc } from './_kit.mjs';

export const meta = {
  id: 'icon-glow', name: 'Icon glow', mood: 'gentle', poster: 0.3,
  summary: 'The app icon as hero: glowing tile, light sweep, orbiting brand particles, aurora background. Works for every app.',
  niches: ['customization-widgets', 'smart-home-remote', 'sports-scores', 'shopping-marketplace', 'business-invoice'],
  keywords: [],
};

export function render(ctx, o = {}) {
  const { hero = true, intensity = 1 } = o;
  const g = stage(ctx, o.box), p = palette(ctx), R = rand(ctx, 'icon-glow');
  const { W, H, cx, cy, S } = g;
  let h = '';
  if (hero) h += backdrop(ctx, p.dark ? mix(p.base, '#000', 0.2) : p.base);
  h += layer(ctx, blobs(ctx, R, { colors: [p.accent, p.accent2, mix(p.accent, p.accent2, 0.5)], n: 6, a: (p.dark ? 0.38 : 0.3) * intensity }));
  h += stars(ctx, R, { n: hero ? 46 : 30, color: rgba(p.dark ? '#fff' : p.accent, 0.8 * intensity), min: S * 0.004, max: S * 0.012, sparkle: 0.2, avoid: hero ? { cx, cy, r: S * 0.3 } : null });
  if (!hero) return h;
  const s = S * 0.42, rad = s * 0.2237;
  h += glow(cx, cy, s * 3, p.accent, p.dark ? 0.55 : 0.4);
  h += at(cx, cy, s * 2.4, s * 2.4, mo(ctx, glow(s * 1.2, s * 1.2, s * 2.4, p.accent2, 0.45), { type: 'pulse', mode: 'breathe', amp: 0.12, cycles: 2, glow: true, lo: 0.5 }));
  h += rings(ctx, { cx, cy, size: s * 2.3, color: rgba(p.accent, 0.5), n: 3, cycles: 2, s0: 0.5, s1: 1.1, width: 0.004 });
  // Orbiting particles (in front of / behind the tile).
  for (let i = 0; i < 7; i++) {
    const ds = S * (0.018 + R() * 0.02), c = i % 2 ? p.accent : p.accent2;
    h += sprite(ctx, ds, ds, `<div style="position:absolute;inset:0;border-radius:50%;background:${mix(c, '#fff', 0.3)};box-shadow:0 0 ${r(ds * 1.5)}px ${rgba(c, 0.9)}"></div>`,
      { type: 'orbit', rx: s * (0.85 + R() * 0.35), ry: s * (0.22 + R() * 0.12), depth: 0.35, zFront: 6, zBack: 2, cycles: 1 + (i % 2), phase: R() }, { x: cx, y: cy + s * 0.05 });
  }
  const icon = ctx.appIcon
    ? `<img src="${esc(ctx.appIcon)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">`
    : `<div style="position:absolute;inset:0;background:linear-gradient(145deg, ${mix(p.accent, '#fff', 0.15)}, ${p.accent} 45%, ${p.accent2});display:flex;align-items:center;justify-content:center;font:800 ${r(s * 0.5)}px/1 var(--font-display);color:${mix(p.accent, '#fff', 0.92)}">${esc((ctx.appName || 'A').slice(0, 1).toUpperCase())}</div>`;
  const sweep = `<div style="position:absolute;inset:0;overflow:hidden;border-radius:${r(rad)}px">${mo(ctx, `<div style="position:absolute;left:-60%;top:-20%;width:45%;height:140%;transform:rotate(18deg);background:linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent)"></div>`,
    { type: 'travel', x0: 0, x1: s * 2.2, y0: 0, y1: 0, fi: 0.05, fo: 0.05, o: 0.9, win: [0.55, 0.8] })}</div>`;
  const tile = `<div style="position:absolute;inset:0;border-radius:${r(rad)}px;overflow:hidden;box-shadow:0 ${r(s * 0.08)}px ${r(s * 0.2)}px ${rgba('#000', p.dark ? 0.55 : 0.25)}, 0 0 0 ${r(Math.max(2, s * 0.006))}px ${rgba('#fff', 0.18)} inset">${icon}
    <div style="position:absolute;inset:0;background:linear-gradient(160deg, rgba(255,255,255,.28), rgba(255,255,255,0) 42%)"></div></div>${sweep}`;
  h += box(cx - s / 2, cy - s / 2, s, s, mo(ctx, tile, { type: 'float', y: s * 0.035, x: 0, rot: 1.2, cycles: 1 }), 'z-index:4');
  return h;
}
