// Beat tracking and sound-effect placement.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { detectBeats, snapCuts } from '../engine/lib/beats.mjs';
import { cueSheet, findSfxPack } from '../engine/lib/sfx.mjs';
import { wav, tmp, hasFfmpeg } from './_helpers.mjs';

test('a 120 BPM click track reads as 120 BPM', { skip: !hasFfmpeg && 'ffmpeg missing' }, () => {
  const d = tmp('beat');
  const f = wav(path.join(d, 'click.wav'), 16, (t) => { const p = t % 0.5; return p < 0.02 ? Math.sin(2 * Math.PI * 1000 * t) * (1 - p / 0.02) : 0; });
  const b = detectBeats(f, { seconds: 16 });
  assert.ok(Math.abs(b.bpm - 120) < 1.5, `bpm ${b.bpm}`);
  const lens = snapCuts([{ len: 3.1, need: 2 }, { len: 3, need: 2 }, { len: 3, need: 2 }], b.beats, 0.33);
  assert.equal(lens.length, 3);
});

test('cues: whooshes on the biggest moves only, one sparkle, a click per tap, peaks on frames', { skip: !hasFfmpeg && 'ffmpeg missing' }, () => {
  const pack = tmp('pack');
  for (const c of ['whoosh', 'interface', 'click', 'sparkle', 'counter']) {
    fs.mkdirSync(path.join(pack, c));
    wav(path.join(pack, c, `${c}-01.wav`), 0.4, (t) => (t > 0.1 && t < 0.12 ? 0.8 : 0));
  }
  assert.equal(findSfxPack(pack), pack);
  const scene = (i, extra = {}) => ({ id: `s${i}`, kind: 'clip', start: i * 2.6, len: 3, fadeIn: i ? 0.6 : 0, capIn: 0.3, touches: [], ...extra });
  const sb = { style: 'promo', duration: 16, cta: 'Go', timeline: [scene(0), scene(1, { touches: [{ t: 1.2, x: 0.5, y: 0.5 }] }), scene(2), scene(3), scene(4, { numbers: true }), { id: 'end', kind: 'end', start: 13, len: 2.2, fadeIn: 0.6 }] };
  const cues = cueSheet(sb, pack);
  assert.ok(cues.filter((c) => c.why.includes('push') || c.why.includes('rises')).length <= 4);
  assert.equal(cues.filter((c) => c.file.includes('sparkle')).length, 1);
  assert.equal(cues.filter((c) => c.why.startsWith('tap')).length, 1);
  const tap = cues.find((c) => c.why.startsWith('tap'));
  assert.ok(Math.abs(tap.at + tap.peak - tap.t) < 0.02, 'the peak lands on the tap');
});
