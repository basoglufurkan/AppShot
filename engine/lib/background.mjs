// Background layer: solid, linear, radial, mesh, split, image.
// In panorama/strip mode this is called once with the full strip width so the
// background flows continuously across every screenshot.

import { style, cssUrl } from './html.mjs';
import { rng } from './util.mjs';
import { rgba } from './color.mjs';

export function backgroundHtml(bg, { W, H, slotW = W, seed = 'appshot' }) {
  bg = typeof bg === 'string' ? { type: 'solid', color: bg } : bg || { type: 'solid', color: '#fff' };
  const box = (css, extra = '') => `<div class="bg" style="${style({ position: 'absolute', left: 0, top: 0, width: W, height: H, ...css })}">${extra}</div>`;
  switch (bg.type) {
    case 'linear':
      return box({ background: `linear-gradient(${bg.angle ?? 180}deg, ${stops(bg.colors)})` });
    case 'radial':
      return box({ background: `radial-gradient(${bg.shape || 'ellipse'} at ${bg.at || '50% 30%'}, ${stops(bg.colors)})` });
    case 'split': {
      const [a, b] = bg.colors;
      const at = (bg.at ?? 0.55) * 100;
      return box({ background: `linear-gradient(${bg.angle ?? 165}deg, ${a} 0%, ${a} ${at}%, ${b} ${at}%, ${b} 100%)` });
    }
    case 'image':
      return box({ background: `${cssUrl(bg.src)} center/cover no-repeat` },
        bg.overlay ? `<div style="${style({ position: 'absolute', inset: 0, background: bg.overlay })}"></div>` : '');
    case 'mesh':
      return box({ background: bg.base || bg.colors?.[0] || '#000', overflow: 'hidden' }, meshBlobs(bg, { W, H, slotW, seed }));
    case 'solid':
    default:
      return box({ background: bg.color || '#fff' });
  }
}

function stops(colors = ['#000', '#333']) {
  return colors.map((c, i) => (Array.isArray(c) ? `${c[0]} ${c[1] * 100}%` : `${c} ${Math.round((i / Math.max(1, colors.length - 1)) * 100)}%`)).join(', ');
}

/** Soft blurred colour fields. Explicit `blobs` win; otherwise placed deterministically per slot. */
function meshBlobs(bg, { W, H, slotW, seed }) {
  const r = rng(seed + ':mesh');
  let blobs = bg.blobs;
  if (!blobs) {
    const palette = (bg.colors || []).slice(bg.base ? 0 : 1);
    const slots = Math.max(1, Math.round(W / slotW));
    const count = Math.max(palette.length, Math.ceil(slots * 2.2));
    blobs = Array.from({ length: count }, (_, i) => ({
      color: palette[i % palette.length],
      x: ((i + 0.5) / count) + (r() - 0.5) * (0.6 / count),
      y: r() < 0.5 ? 0.05 + r() * 0.3 : 0.6 + r() * 0.35,
      r: 0.55 + r() * 0.45,
      o: 0.75 + r() * 0.25,
    }));
  }
  const blur = slotW * (bg.blur ?? 0.16);
  return blobs.map((b) => {
    const size = slotW * (b.r ?? 0.7);
    // x/y are fractions of the whole layer; strip layers spread blobs along the full width.
    const cx = (b.x ?? 0.5) * W, cy = (b.y ?? 0.5) * H;
    return `<div style="${style({
      position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size,
      borderRadius: '50%', background: `radial-gradient(circle, ${b.color} 0%, ${rgba(b.color, 0)} 70%)`,
      opacity: b.o ?? 0.9, filter: `blur(${Math.round(blur)}px)`,
    })}"></div>`;
  }).join('');
}
