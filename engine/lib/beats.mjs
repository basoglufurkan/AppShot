// Beat tracking for preview music, zero dependencies: ffmpeg decodes the track to mono 11 025 Hz, a radix-2 FFT gives
// the spectral flux (onset strength), autocorrelation with a soft prior around 110 BPM gives the tempo, and the phase
// that collects the most onset energy places the beats. Good enough to cut on the beat for pop, electronic and most
// "corporate" production music; for free-tempo ambient tracks it reports low confidence and the cuts stay put.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { readJson, writeJson, exists, ensureDir } from './util.mjs';

const SR = 11025, N = 1024, HOP = 256;

function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
}

/**
 * @returns {{ bpm, period, beats: number[], downbeats: number[], confidence }} — times in seconds from `from`.
 */
export function detectBeats(file, { from = 0, seconds = 40, cacheRoot } = {}) {
  const st = fs.statSync(file);
  const key = crypto.createHash('sha1').update([file, st.size, st.mtimeMs, from, seconds, 'v2'].join('|')).digest('hex').slice(0, 16);
  const cacheFile = cacheRoot && path.join(ensureDir(path.join(cacheRoot, 'beats')), `${key}.json`);
  if (cacheFile && exists(cacheFile)) return readJson(cacheFile);
  const r = spawnSync('ffmpeg', ['-v', 'error', '-ss', String(from), '-t', String(seconds), '-i', file, '-ac', '1', '-ar', String(SR), '-f', 's16le', '-'], { maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`ffmpeg could not read ${file}: ${String(r.stderr).slice(-300)}`);
  const pcm = new Int16Array(r.stdout.buffer, r.stdout.byteOffset, Math.floor(r.stdout.length / 2));
  const frames = Math.max(0, Math.floor((pcm.length - N) / HOP));
  const win = Float64Array.from({ length: N }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N));
  let prev = new Float64Array(N / 2);
  const env = new Float64Array(frames);
  for (let f = 0; f < frames; f++) {
    const re = new Float64Array(N), im = new Float64Array(N);
    for (let i = 0; i < N; i++) re[i] = (pcm[f * HOP + i] / 32768) * win[i];
    fft(re, im);
    const mag = new Float64Array(N / 2);
    let flux = 0;
    for (let k = 1; k < N / 2; k++) { mag[k] = Math.log1p(100 * Math.hypot(re[k], im[k])); const d = mag[k] - prev[k]; if (d > 0) flux += d; }
    env[f] = flux; prev = mag;
  }
  // Remove the slow trend so only onsets remain.
  const fps = SR / HOP, w = Math.round(fps * 0.5), on = new Float64Array(frames);
  for (let f = 0; f < frames; f++) {
    let s = 0, c = 0;
    for (let k = Math.max(0, f - w); k <= Math.min(frames - 1, f + w); k++) { s += env[k]; c++; }
    on[f] = Math.max(0, env[f] - s / c);
  }
  // Tempo: autocorrelation over 60–180 BPM with a log-Gaussian prior centred on 110 BPM.
  let best = { score: -1, lag: 0 }, total = 0;
  const scores = [];
  for (let bpm = 60; bpm <= 180; bpm += 0.5) {
    const lag = (60 / bpm) * fps;
    let s = 0;
    for (let f = 0; f + lag < frames; f++) { const l = f + lag, a = Math.floor(l), t = l - a; s += on[f] * (on[a] * (1 - t) + (on[a + 1] || 0) * t); }
    const prior = Math.exp(-0.5 * (Math.log2(bpm / 110) / 0.9) ** 2);
    const score = s * prior;
    scores.push(score); total += score;
    if (score > best.score) best = { score, lag, bpm };
  }
  const mean = total / scores.length;
  const confidence = mean ? Math.min(1, (best.score / mean - 1) / 3) : 0;
  // Refine period and phase together: a beat grid over the whole excerpt is very sensitive to the period, so the
  // grid (±4 % around the autocorrelation peak) that collects the most onset energy wins.
  const peak = (t) => { const i = Math.round(t); return Math.max(on[i - 1] || 0, on[i] || 0, on[i + 1] || 0); };
  let P = best.lag, phase = 0, pBest = -1;
  for (let cand = best.lag * 0.96; cand <= best.lag * 1.04; cand += best.lag * 0.0005) {
    for (let o = 0; o < cand; o += 0.25) {
      let s = 0;
      for (let t = o; t < frames; t += cand) s += peak(t);
      if (s > pBest) { pBest = s; phase = o; P = cand; }
    }
  }
  best.bpm = (60 * fps) / P;
  const beats = [];
  // A frame's flux belongs to the middle of its analysis window, not its start.
  const lag = N / 2 / SR;
  for (let t = phase; t < frames; t += P) beats.push(Math.round((t / fps + lag) * 1000) / 1000);
  // Downbeats: of the four possible bar phases, the one whose beats are loudest.
  let bar = 0, barBest = -1;
  for (let b = 0; b < 4; b++) { let s = 0; for (let k = b; k < beats.length; k += 4) s += on[Math.round(beats[k] * fps)] || 0; if (s > barBest) { barBest = s; bar = b; } }
  const out = { bpm: Math.round(best.bpm * 10) / 10, period: Math.round((P / fps) * 10000) / 10000, beats, downbeats: beats.filter((_, k) => k % 4 === bar), confidence: Math.round(confidence * 100) / 100 };
  if (cacheFile) writeJson(cacheFile, out);
  return out;
}

/**
 * Move each cut onto a beat: the nearest beat to the planned cut that still leaves the previous scene `need` seconds.
 * scenes: [{ len, need }], xf: overlap. Returns new lengths (the cut is the middle of the transition).
 */
export function snapCuts(scenes, beats, xf, { maxShift = 0.45 } = {}) {
  const lens = scenes.map((s) => s.len);
  let start = 0;
  for (let k = 1; k < scenes.length; k++) {
    const minCut = start + scenes[k - 1].need - xf / 2;
    const planned = start + lens[k - 1] - xf / 2;
    const cands = beats.filter((b) => b >= minCut - 1e-6 && Math.abs(b - planned) <= maxShift + 0.6);
    if (cands.length) {
      const b = cands.reduce((a, c) => (Math.abs(c - planned) < Math.abs(a - planned) ? c : a));
      lens[k - 1] = Math.round((b + xf / 2 - start) * 1000) / 1000;
    }
    start += lens[k - 1] - xf;
  }
  return lens;
}
