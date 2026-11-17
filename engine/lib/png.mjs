// Minimal zero-dependency PNG codec.
// Decodes 8/16-bit grayscale, RGB, palette, gray+alpha and RGBA (non-interlaced)
// into an RGBA8 buffer, and encodes RGB8 (no alpha — what both stores want).

import zlib from 'node:zlib';
import fs from 'node:fs';

const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

/** Read only the header: { width, height, bitDepth, colorType, hasAlpha }. */
export function readPngInfo(input) {
  const buf = typeof input === 'string' ? fs.readFileSync(input) : input;
  if (!buf.subarray(0, 8).equals(SIG)) {
    const jpg = readJpegSize(buf);
    if (jpg) return { ...jpg, format: 'jpeg', hasAlpha: false };
    throw new Error('Not a PNG/JPEG file');
  }
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const bitDepth = buf[24];
  const colorType = buf[25];
  let hasTrns = false;
  let off = 8;
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    if (type === 'tRNS') hasTrns = true;
    if (type === 'IDAT') break;
    off += 12 + len;
  }
  return { width, height, bitDepth, colorType, format: 'png', hasAlpha: colorType === 4 || colorType === 6 || hasTrns };
}

function readJpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let off = 2;
  while (off < buf.length) {
    if (buf[off] !== 0xff) return null;
    const marker = buf[off + 1];
    const len = buf.readUInt16BE(off + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(off + 5), width: buf.readUInt16BE(off + 7) };
    }
    off += 2 + len;
  }
  return null;
}

/** Decode a PNG into { width, height, data: Uint8Array RGBA8 }. */
export function decodePng(input) {
  const buf = typeof input === 'string' ? fs.readFileSync(input) : input;
  if (!buf.subarray(0, 8).equals(SIG)) throw new Error('Not a PNG file');
  let off = 8;
  let width, height, bitDepth, colorType, interlace;
  let palette = null;
  let trns = null;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'PLTE') palette = data;
    else if (type === 'tRNS') trns = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (interlace) throw new Error('Interlaced PNGs are not supported — re-save without interlacing');
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  const bitsPP = channels * bitDepth;
  const bpp = Math.max(1, bitsPP >> 3);
  const stride = Math.ceil((width * bitsPP) / 8);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const px = Buffer.alloc(stride * height);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const ft = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const out = px.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      if (ft === 1) v += a;
      else if (ft === 2) v += b;
      else if (ft === 3) v += (a + b) >> 1;
      else if (ft === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[x] = v & 0xff;
    }
    prev = out;
  }
  const rgba = new Uint8Array(width * height * 4);
  const sample = (row, i) => {
    if (bitDepth === 8) return row[i];
    if (bitDepth === 16) return row[i * 2];
    const perByte = 8 / bitDepth;
    const byte = row[Math.floor(i / perByte)];
    const shift = (perByte - 1 - (i % perByte)) * bitDepth;
    return (byte >> shift) & ((1 << bitDepth) - 1);
  };
  const scale = bitDepth < 8 && colorType !== 3 ? 255 / ((1 << bitDepth) - 1) : 1;
  for (let y = 0; y < height; y++) {
    const row = px.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      if (colorType === 6) {
        rgba[o] = sample(row, x * 4); rgba[o + 1] = sample(row, x * 4 + 1);
        rgba[o + 2] = sample(row, x * 4 + 2); rgba[o + 3] = sample(row, x * 4 + 3);
      } else if (colorType === 2) {
        rgba[o] = sample(row, x * 3); rgba[o + 1] = sample(row, x * 3 + 1);
        rgba[o + 2] = sample(row, x * 3 + 2); rgba[o + 3] = 255;
      } else if (colorType === 0) {
        const g = sample(row, x) * scale;
        rgba[o] = rgba[o + 1] = rgba[o + 2] = g; rgba[o + 3] = 255;
      } else if (colorType === 4) {
        const g = sample(row, x * 2);
        rgba[o] = rgba[o + 1] = rgba[o + 2] = g; rgba[o + 3] = sample(row, x * 2 + 1);
      } else if (colorType === 3) {
        const idx = sample(row, x);
        rgba[o] = palette[idx * 3]; rgba[o + 1] = palette[idx * 3 + 1]; rgba[o + 2] = palette[idx * 3 + 2];
        rgba[o + 3] = trns && idx < trns.length ? trns[idx] : 255;
      }
    }
  }
  return { width, height, data: rgba };
}

/** Composite RGBA over a solid background colour → RGB8 buffer. */
export function flattenToRgb(img, bg = [255, 255, 255]) {
  const { width, height, data } = img;
  const rgb = new Uint8Array(width * height * 3);
  for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
    const a = data[i + 3] / 255;
    rgb[j] = Math.round(data[i] * a + bg[0] * (1 - a));
    rgb[j + 1] = Math.round(data[i + 1] * a + bg[1] * (1 - a));
    rgb[j + 2] = Math.round(data[i + 2] * a + bg[2] * (1 - a));
  }
  return { width, height, rgb };
}

/** Encode RGB8 pixels as PNG with per-row adaptive filtering. */
export function encodeRgbPng({ width, height, rgb }, { level = 6 } = {}) {
  const bpp = 3;
  const stride = width * bpp;
  const out = Buffer.alloc((stride + 1) * height);
  const cand = [0, 1, 2, 3, 4].map(() => Buffer.alloc(stride));
  for (let y = 0; y < height; y++) {
    const cur = rgb.subarray(y * stride, (y + 1) * stride);
    const prev = y ? rgb.subarray((y - 1) * stride, y * stride) : null;
    let best = 0, bestCost = Infinity;
    for (let f = 0; f < 5; f++) {
      const dst = cand[f];
      let cost = 0;
      for (let x = 0; x < stride; x++) {
        const a = x >= bpp ? cur[x - bpp] : 0;
        const b = prev ? prev[x] : 0;
        const c = prev && x >= bpp ? prev[x - bpp] : 0;
        let p;
        if (f === 0) p = 0;
        else if (f === 1) p = a;
        else if (f === 2) p = b;
        else if (f === 3) p = (a + b) >> 1;
        else {
          const q = a + b - c;
          const pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c);
          p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        }
        const v = (cur[x] - p) & 0xff;
        dst[x] = v;
        cost += v < 128 ? v : 256 - v;
      }
      if (cost < bestCost) { bestCost = cost; best = f; }
    }
    out[y * (stride + 1)] = best;
    cand[best].copy(out, y * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    SIG,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(out, { level })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Re-encode any PNG buffer as opaque RGB (store-safe). */
export function toStorePng(buf, bg) {
  const img = decodePng(buf);
  return encodeRgbPng(flattenToRgb(img, bg));
}

/** Crop an RGBA image. */
export function crop(img, x, y, w, h) {
  const data = new Uint8Array(w * h * 4);
  for (let row = 0; row < h; row++) {
    const src = ((y + row) * img.width + x) * 4;
    data.set(img.data.subarray(src, src + w * 4), row * w * 4);
  }
  return { width: w, height: h, data };
}

/** Average colour and luminance stats of a region of an RGBA image. */
export function regionStats(img, x, y, w, h, step = 4) {
  x = Math.max(0, Math.floor(x)); y = Math.max(0, Math.floor(y));
  w = Math.min(img.width - x, Math.floor(w)); h = Math.min(img.height - y, Math.floor(h));
  let r = 0, g = 0, b = 0, n = 0;
  const lums = [];
  for (let yy = y; yy < y + h; yy += step) {
    for (let xx = x; xx < x + w; xx += step) {
      const o = (yy * img.width + xx) * 4;
      r += img.data[o]; g += img.data[o + 1]; b += img.data[o + 2]; n++;
      lums.push(0.2126 * img.data[o] + 0.7152 * img.data[o + 1] + 0.0722 * img.data[o + 2]);
    }
  }
  lums.sort((p, q) => p - q);
  return {
    mean: n ? [r / n, g / n, b / n] : [0, 0, 0],
    p10: lums[Math.floor(lums.length * 0.1)] ?? 0,
    p50: lums[Math.floor(lums.length * 0.5)] ?? 0,
    p90: lums[Math.floor(lums.length * 0.9)] ?? 0,
    samples: n,
  };
}
