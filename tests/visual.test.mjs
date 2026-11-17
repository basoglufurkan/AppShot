// Pixel traits of a screenshot: tone, background, the device block and the caption band.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { traits, setTraits, hueDist, circularMean } from '../engine/lib/visual.mjs';
import { png, tmp } from './_helpers.mjs';

// A dark canvas, white "caption" stripes on top, a detailed "device" block below.
function shot(file, bg = [12, 12, 20]) {
  return png(file, 300, 650, (x, y) => {
    if (y > 40 && y < 120 && x > 40 && x < 260 && (Math.floor(x / 6) % 2 === 0) && y % 20 < 12) return [255, 255, 255];
    if (y > 180 && y < 640 && x > 60 && x < 240) return ((x ^ y) & 8) ? [90, 110, 220] : [230, 230, 240];
    return bg;
  });
}

test('a dark set with a device below a caption', () => {
  const d = tmp('vis');
  const t = traits(shot(path.join(d, 'a.png')));
  assert.equal(t.tone, 'dark');
  assert.equal(t.background, 'flat');
  assert.ok(t.uiShare > 0.2, `uiShare ${t.uiShare}`);
  assert.equal(t.captionAt, 'top');
  const light = traits(shot(path.join(d, 'b.png'), [240, 240, 245]));
  assert.equal(light.tone, 'light');
  assert.equal(setTraits([path.join(d, 'a.png'), path.join(d, 'b.png')]).count, 2);
});

test('hue helpers wrap around the circle', () => {
  assert.equal(hueDist(350, 10), 20);
  assert.equal(hueDist(null, 10), 90);
  assert.ok([359, 0, 1].includes(circularMean([350, 10])) || circularMean([350, 10]) === 360);
});
