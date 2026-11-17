// Dominant-colour extraction from an RGBA image (app icon, screenshots).
import { toHex, toHsl } from './color.mjs';

export function dominantColors(img, { max = 6, step } = {}) {
  const { width, height, data } = img;
  step = step || Math.max(1, Math.floor(Math.sqrt((width * height) / 40000)));
  const buckets = new Map();
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const o = (y * width + x) * 4;
      if (data[o + 3] < 200) continue;
      const r = data[o], g = data[o + 1], b = data[o + 2];
      const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      const e = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
      e.r += r; e.g += g; e.b += b; e.n++;
      buckets.set(key, e);
    }
  }
  const total = [...buckets.values()].reduce((a, e) => a + e.n, 0) || 1;
  const cands = [...buckets.values()].map((e) => {
    const hex = toHex({ r: e.r / e.n, g: e.g / e.n, b: e.b / e.n });
    const { s, l } = toHsl(hex);
    const share = e.n / total;
    const vivid = s * (1 - Math.abs(l - 0.5) * 1.6);
    return { hex, share, s, l, score: share * (0.35 + vivid * 1.6) };
  }).sort((a, b) => b.score - a.score);
  const picked = [];
  for (const c of cands) {
    if (picked.length >= max) break;
    if (picked.some((p) => dist(p.hex, c.hex) < 48)) continue;
    picked.push(c);
  }
  return picked.map((c) => ({ hex: c.hex, share: Math.round(c.share * 1000) / 1000, saturation: Math.round(c.s * 100) / 100, lightness: Math.round(c.l * 100) / 100 }));
}

function dist(a, b) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
  return Math.sqrt((r1 - r2) ** 2 * 0.3 + (g1 - g2) ** 2 * 0.59 + (b1 - b2) ** 2 * 0.11) * 1.7;
}
