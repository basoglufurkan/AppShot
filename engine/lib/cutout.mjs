// Hero art cutout: knock a plain light background out of a generated image so the object floats on the billboard.
// Image models (Codex, ChatGPT, Figma AI…) often return the object on white instead of a transparent canvas. A flood
// fill from the borders over near-white, low-chroma pixels removes it; white highlights inside the subject stay
// because they are not connected to the border. Edges get soft alpha, then the image is trimmed to the subject.

/** Share of border pixels that are already transparent — 1 means the image is a cutout already. */
export function transparentBorder({ width: W, height: H, data }) {
  let clear = 0, n = 0;
  const at = (x, y) => { n++; if (data[(y * W + x) * 4 + 3] < 16) clear++; };
  for (let x = 0; x < W; x++) { at(x, 0); at(x, H - 1); }
  for (let y = 1; y < H - 1; y++) { at(0, y); at(W - 1, y); }
  return n ? clear / n : 0;
}

/** RGBA in → trimmed RGBA out ({ width, height, data, removed }); tol = how far from white still counts as background. */
export function cutout(img, { tol = 38, floor = 7, margin = 8 } = {}) {
  const { width: W, height: H, data } = img;
  const dist = (p) => { const i = p * 4; return data[i + 3] < 16 ? 0 : Math.max(255 - data[i], 255 - data[i + 1], 255 - data[i + 2]); };
  const bg = new Uint8Array(W * H);
  const stack = [];
  for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
  while (stack.length) {
    const p = stack.pop();
    if (bg[p] || dist(p) > tol) continue;
    bg[p] = 1;
    const x = p % W, y = (p / W) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < W - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - W);
    if (y < H - 1) stack.push(p + W);
  }
  // Soft edge: a background pixel next to the subject keeps alpha from its distance to white (un-premultiplied), so
  // anti-aliased edges and soft shadows survive instead of leaving a white halo.
  const out = Buffer.from(data);
  let removed = 0;
  for (let p = 0; p < W * H; p++) {
    if (!bg[p]) continue;
    removed++;
    const d = dist(p);
    const a = d < floor ? 0 : Math.min(1, (d - floor) / (tol - floor)) * 0.9;
    out[p * 4 + 3] = Math.round(a * 255 * (data[p * 4 + 3] / 255));
    if (a > 0.02) for (let c = 0; c < 3; c++) out[p * 4 + c] = Math.max(0, Math.min(255, Math.round((data[p * 4 + c] - 255 * (1 - a)) / a)));
  }
  return { ...trim({ width: W, height: H, data: out }, margin), removed: removed / (W * H) };
}

/** Crop to the visible pixels (alpha > 8) plus a margin. */
export function trim({ width: W, height: H, data }, margin = 8) {
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (data[(y * W + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 < 0) return { width: W, height: H, data };
  x0 = Math.max(0, x0 - margin); y0 = Math.max(0, y0 - margin);
  x1 = Math.min(W - 1, x1 + margin); y1 = Math.min(H - 1, y1 + margin);
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const res = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) Buffer.from(data.buffer, data.byteOffset, data.length).copy(res, y * w * 4, ((y + y0) * W + x0) * 4, ((y + y0) * W + x1 + 1) * 4);
  return { width: w, height: h, data: res };
}
