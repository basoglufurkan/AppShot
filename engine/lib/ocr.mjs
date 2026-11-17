// Read the captions on screenshots (competitors' in the market scan) with Apple's Vision framework. macOS only:
// engine/native/ocr.swift is compiled once with swiftc into ~/.cache/appshot/ and reused; elsewhere ocr() returns
// null and callers skip the text analysis.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { ENGINE_DIR, exists, ensureDir } from './util.mjs';
import { STOP, stem } from './copyrules.mjs';

const SRC = path.join(ENGINE_DIR, 'native', 'ocr.swift');

function binary() {
  if (process.platform !== 'darwin' || !exists(SRC)) return null;
  const hash = crypto.createHash('sha1').update(fs.readFileSync(SRC)).digest('hex').slice(0, 10);
  const bin = path.join(ensureDir(path.join(os.homedir(), '.cache', 'appshot')), `ocr-${hash}`);
  if (exists(bin)) return bin;
  const r = spawnSync('swiftc', ['-O', SRC, '-o', bin], { encoding: 'utf8' });
  return r.status === 0 && exists(bin) ? bin : null;
}

/** Text lines per image: [{ file, lines: [{ text, x, y, w, h, confidence }] }], or null without Vision. */
export function ocr(files) {
  const bin = binary();
  if (!bin || !files.length) return null;
  const r = spawnSync(bin, files, { encoding: 'utf8', maxBuffer: 1 << 26 });
  if (r.status !== 0) return null;
  return r.stdout.split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

/**
 * The marketing caption of a screenshot: the biggest type in the top or bottom band, lines joined in reading order.
 * Status-bar times, tiny UI labels and numbers alone are skipped.
 */
export function captionOf(result) {
  // The status bar (carrier, clock, "No SIM") and tiny UI labels are not the caption.
  const STATUS = /^(carrier|no sim|wi-?fi|lte|5g|4g|am|pm|\d{1,2}[:.]\d{2}(\s?[ap]m)?)$/i;
  const lines = (result?.lines || []).map((l) => ({ ...l, text: l.text.replace(/\b(carrier|no sim)\b|\b\d{1,2}:\d{2}\s?(am|pm)?\b/gi, '').trim() }))
    .filter((l) => l.confidence > 0.4 && l.text.length > 1 && !STATUS.test(l.text) && /\p{L}{2}/u.test(l.text) && !(l.y < 0.04 && l.h < 0.03));
  if (!lines.length) return '';
  const band = (l) => (l.y < 0.32 ? 'top' : l.y + l.h > 0.72 ? 'bottom' : 'mid');
  const big = Math.max(...lines.map((l) => l.h));
  // Caption type is large: keep lines at least 45 % of the tallest line's height, in the band that holds the most.
  const cand = lines.filter((l) => l.h >= big * 0.45 && band(l) !== 'mid');
  if (!cand.length) return '';
  const top = cand.filter((l) => band(l) === 'top'), bottom = cand.filter((l) => band(l) === 'bottom');
  const pick = top.reduce((a, l) => a + l.h, 0) >= bottom.reduce((a, l) => a + l.h, 0) ? top : bottom;
  return pick.sort((a, b) => a.y - b.y || a.x - b.x).map((l) => l.text.trim()).join(' ').replace(/\s+/g, ' ').trim();
}

/** Words a set of captions leans on: [{ word, apps }] — how many different apps use each (stemmed, no stop words). */
export function captionWords(byApp, locale = 'en-US') {
  const count = new Map();
  for (const caps of byApp) {
    const seen = new Set();
    for (const c of caps) for (const w of c.toLocaleLowerCase(locale).split(/[^\p{L}\p{N}]+/u)) {
      if (w.length < 3 || STOP.has(w) || /^\d+$/.test(w)) continue;
      const s = stem(w, locale);
      if (seen.has(s)) continue;
      seen.add(s);
      const e = count.get(s) || { word: w, apps: 0 };
      e.apps++; count.set(s, e);
    }
  }
  return [...count.values()].sort((a, b) => b.apps - a.apps);
}
