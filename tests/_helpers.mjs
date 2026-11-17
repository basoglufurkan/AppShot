// Shared helpers for the unit tests: temporary folders, synthetic PNGs and WAVs, an ffmpeg guard.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { encodeRgbPng } from '../engine/lib/png.mjs';

export const tmp = (name) => fs.mkdtempSync(path.join(os.tmpdir(), `appshot-${name}-`));
export const hasFfmpeg = spawnSync('ffmpeg', ['-version']).status === 0;
export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

/** A PNG drawn by `paint(x, y) → [r, g, b]`. */
export function png(file, width, height, paint) {
  const rgb = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) { const c = paint(x, y); const o = (y * width + x) * 3; rgb[o] = c[0]; rgb[o + 1] = c[1]; rgb[o + 2] = c[2]; }
  fs.writeFileSync(file, encodeRgbPng({ width, height, rgb }));
  return file;
}

/** A mono 16-bit WAV from `sample(t) → -1…1`. */
export function wav(file, seconds, sample, rate = 22050) {
  const n = Math.round(seconds * rate), data = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) data.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(sample(i / rate) * 32767))), i * 2);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, data]));
  return file;
}

/** A minimal workspace folder that findWorkspace accepts. */
export function workspace(plan = {}, profile = {}) {
  const ws = tmp('ws');
  fs.writeFileSync(path.join(ws, '.workspace'), '');
  fs.writeFileSync(path.join(ws, 'plan.json'), JSON.stringify({ app: { name: 'Testy' }, locales: ['en-US'], defaultLocale: 'en-US', shots: [{ id: 'hook', layout: 'hero-device', headline: { 'en-US': 'Track every **workout**' } }], ...plan }));
  fs.writeFileSync(path.join(ws, 'profile.json'), JSON.stringify(profile));
  return ws;
}

export const run = (script, args) => spawnSync(process.execPath, [path.join(ROOT, 'scripts', script), ...args], { encoding: 'utf8' });
