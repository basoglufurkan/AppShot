// Finished-video checks: a frozen stretch is a dead hold; a moving picture is not; loudness reads silence as silence.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { motionQA, audioQA } from '../engine/lib/motionqa.mjs';
import { tmp, hasFfmpeg } from './_helpers.mjs';

const make = (file, filter) => spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', filter, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', '3', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-c:a', 'aac', '-shortest', file]);
const sb = { timeline: [{ id: 'a', kind: 'clip', start: 0, len: 3, fadeIn: 0 }] };

test('a frozen picture is a dead hold, a moving one is not', { skip: !hasFfmpeg && 'ffmpeg missing' }, () => {
  const d = tmp('qa');
  const frozen = path.join(d, 'frozen.mp4'), moving = path.join(d, 'moving.mp4');
  make(frozen, 'testsrc2=size=180x320:rate=30,trim=end_frame=1,loop=loop=-1:size=1:start=0');
  make(moving, 'testsrc2=size=180x320:rate=30');
  assert.ok(motionQA(frozen, sb).deadHolds.length >= 1);
  assert.equal(motionQA(moving, sb).deadHolds.length, 0);
  assert.equal(audioQA(moving).silent, true);
});
