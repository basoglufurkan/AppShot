// Scene: an open book glowing from within — light rays turning slowly, sparkles (or letters) rising off the pages.
import { palette, stage, rand, uid, layer, at, box, mo, svg, lin, rad, backdrop, glow, blobs, stars, motes, sparkle, mix, rgba, r, esc } from './_kit.mjs';

export const meta = {
  id: 'book', name: 'Book', mood: 'warm', poster: 0.45,
  summary: 'An open book glowing from inside, light rays turning slowly, sparkles rising from the pages. Variant letters: glyphs of many scripts float up.',
  niches: ['books-audiobooks', 'study-flashcards', 'language-learning', 'notes-writing', 'bible-prayer', 'podcast-stories', 'translator'],
  keywords: ['book', 'books', 'read', 'reading', 'story', 'stories', 'audiobook', 'library', 'study', 'flashcards', 'learn', 'language', 'vocabulary', 'bible', 'notes', 'writing', 'translate'],
  variants: ['letters'],
};

const GLYPHS = ['A', 'é', 'ß', 'ğ', 'Ж', 'あ', '字', 'ع', 'ñ', 'Ω', '한', 'ü'];

export function render(ctx, o = {}) {
  const { hero = true, intensity = 1, variant } = o;
  const g = stage(ctx, o.box), p = palette(ctx), R = rand(ctx, 'book');
  const { W, H, cx, S } = g;
  const cy = g.cy + S * 0.06;
  const warm = mix('#FFD58A', p.accent, 0.2);
  let h = hero ? backdrop(ctx, p.dark
    ? `radial-gradient(ellipse 60% 80% at 50% 45%, ${mix(p.base, mix('#4B2A6B', p.accent, 0.3), 0.6)} 0%, ${mix(p.base, '#000', 0.3)} 80%)`
    : `radial-gradient(ellipse 60% 80% at 50% 45%, ${mix('#FFF6E5', p.accent, 0.06)} 0%, ${mix(p.base, '#F3D9B1', 0.45)} 85%)`) : '';
  h += layer(ctx, blobs(ctx, R, { colors: [p.accent, warm], n: 4, a: (p.dark ? 0.2 : 0.16) * intensity }));
  h += stars(ctx, R, { n: hero ? 50 : 36, color: rgba(p.dark ? '#FFE9B8' : mix(p.accent, '#000', 0.2), 0.8 * intensity), min: S * 0.004, max: S * 0.012, sparkle: 0.25, avoid: hero ? { cx, cy, r: S * 0.4 } : null });
  if (!hero) return h + motes(ctx, R, { n: 16, color: rgba(warm, 0.8 * intensity), min: S * 0.008, max: S * 0.018 });
  const bw = S * 0.9, bh = bw * 0.48;
  // Rays.
  const rays = `<div style="position:absolute;inset:0;border-radius:50%;background:repeating-conic-gradient(from 0deg, ${rgba(warm, p.dark ? 0.22 : 0.35)} 0deg 5deg, transparent 5deg 15deg);-webkit-mask-image:radial-gradient(circle, #000 18%, transparent 68%);mask-image:radial-gradient(circle, #000 18%, transparent 68%)"></div>`;
  h += at(cx, cy - bh * 0.25, S * 1.5, S * 1.5, mo(ctx, rays, { type: 'spin', cycles: 1, from: 0 }));
  h += glow(cx, cy - bh * 0.2, S * 1.1, warm, p.dark ? 0.6 : 0.5);
  h += at(cx, cy - bh * 0.2, S * 0.9, S * 0.9, mo(ctx, glow(S * 0.45, S * 0.45, S * 0.9, '#FFF2C6', 0.6), { type: 'pulse', mode: 'breathe', amp: 0.1, cycles: 3, glow: true, lo: 0.5 }));
  // Book.
  const pg = uid('pg'), pg2 = uid('pg'), cov = uid('cv');
  const cover = mix('#8E2F3C', p.accent, 0.35);
  const lines = (x0, dir) => Array.from({ length: 7 }, (_, i) => `<path d="M${x0} ${40 + i * 7} C${x0 + dir * 22} ${38 + i * 7} ${x0 + dir * 50} ${41 + i * 7} ${x0 + dir * 70} ${40 + i * 7}" stroke="#8A7A66" stroke-opacity=".38" stroke-width="1.6" fill="none"/>`).join('');
  h += box(cx - bw / 2, cy - bh / 2, bw, bh * 1.1, svg(bw, bh * 1.1, `<defs>${lin(pg, [[0, '#FFFDF6'], [1, '#EFE3CC']], { x1: 0, y1: 0, x2: 1, y2: 0 })}${lin(pg2, [[0, '#EFE3CC'], [1, '#FFFDF6']], { x1: 0, y1: 0, x2: 1, y2: 0 })}${lin(cov, [[0, mix(cover, '#fff', 0.1)], [1, mix(cover, '#000', 0.3)]])}</defs>
    <ellipse cx="100" cy="104" rx="84" ry="5" fill="#000" fill-opacity=".25"/>
    <path d="M6 22 L100 30 L194 22 L194 100 L100 106 L6 100 Z" fill="url(#${cov})"/>
    <path d="M12 16 C40 8 76 12 100 26 L100 98 C76 86 40 84 12 92 Z" fill="url(#${pg})"/>
    <path d="M188 16 C160 8 124 12 100 26 L100 98 C124 86 160 84 188 92 Z" fill="url(#${pg2})"/>
    <path d="M100 26 L100 98" stroke="#C9B48F" stroke-width="2"/>${lines(22, 1)}${lines(178, -1)}`, { vb: '0 0 200 110', css: `filter:drop-shadow(0 ${r(bh * 0.06)}px ${r(bh * 0.12)}px ${rgba('#000', p.dark ? 0.45 : 0.18)})` }), 'z-index:3');
  // What rises off the pages.
  const n = variant === 'letters' ? 12 : 22;
  for (let i = 0; i < n; i++) {
    const s = S * (variant === 'letters' ? 0.06 + R() * 0.05 : 0.02 + R() * 0.035);
    const x = cx + (R() - 0.5) * bw * 0.7, y = cy - bh * 0.15;
    const inner = variant === 'letters'
      ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:700 ${r(s)}px/1 var(--font-display), 'Noto Sans', sans-serif;color:${p.dark ? '#FFF2CF' : mix(p.accent, '#000', 0.25)};text-shadow:0 0 ${r(s * 0.3)}px ${rgba(warm, 0.9)}">${esc(GLYPHS[i % GLYPHS.length])}</div>`
      : sparkle(s, i % 3 ? '#FFF2C6' : warm);
    h += at(x, y, s, s, mo(ctx, inner, { type: 'travel', x0: 0, y0: 0, x1: (x - cx) * 0.6, y1: -S * (0.45 + R() * 0.25), wx: s * 0.6, wc: 1, s0: 0.5, s1: 1.1, r0: variant === 'letters' ? -15 + R() * 30 : 0, r1: variant === 'letters' ? -15 + R() * 30 : 0, fi: 0.2, fo: 0.35, o: 0.95, cycles: variant === 'letters' ? 1 : 1 + (i % 2), phase: R() }), 'z-index:4');
  }
  return h;
}
