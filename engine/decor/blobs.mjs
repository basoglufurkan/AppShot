// Organic blob shapes (deterministic). {type:'blobs', count, colors, opacity, blur}
import { style } from '../lib/html.mjs';
import { rng } from '../lib/util.mjs';

function blobPath(r, points = 7) {
  const pts = Array.from({ length: points }, (_, i) => {
    const a = (i / points) * Math.PI * 2;
    const d = 0.65 + r() * 0.35;
    return [50 + Math.cos(a) * 48 * d, 50 + Math.sin(a) * 48 * d];
  });
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < points; i++) {
    const p0 = pts[(i - 1 + points) % points], p1 = pts[i], p2 = pts[(i + 1) % points], p3 = pts[(i + 2) % points];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + 'Z';
}

export function render(spec, { W, H, theme, seed, slotW = W }) {
  const r = rng(`${seed}:blobs`);
  const colors = spec.colors || [theme.accent, theme.secondary || theme.accent];
  const n = spec.count ?? Math.max(3, Math.round((W / slotW) * 2));
  let out = '';
  for (let i = 0; i < n; i++) {
    const s = slotW * (0.35 + r() * 0.45);
    const x = ((i + r()) / n) * W - s / 2;
    const y = (r() < 0.5 ? r() * 0.25 : 0.65 + r() * 0.3) * H - s / 2;
    out += `<svg viewBox="0 0 100 100" style="${style({ position: 'absolute', left: x, top: y, width: s, height: s, opacity: spec.opacity ?? 0.5, filter: spec.blur === 0 ? undefined : `blur(${Math.round(s * (spec.blur ?? 0.04))}px)`, transform: `rotate(${Math.round(r() * 360)}deg)` })}"><path d="${blobPath(r)}" fill="${colors[i % colors.length]}"/></svg>`;
  }
  return `<div class="decor blobs" style="position:absolute;inset:0;pointer-events:none">${out}</div>`;
}
