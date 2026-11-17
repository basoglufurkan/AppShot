// Caption rules and stemming.
import test from 'node:test';
import assert from 'node:assert/strict';
import { stem, lintCaption } from '../engine/lib/copyrules.mjs';

test('English stems keep -us words whole', () => {
  assert.equal(stem('focus', 'en-US'), stem('focused', 'en-US'));
  assert.equal(stem('workouts', 'en-US'), 'workout');
  assert.equal(stem('stories', 'en-US'), 'story');
});

test('captions: prices, rankings and other platforms are caught', () => {
  const codes = (t, o) => lintCaption(t, { locale: 'en-US', ...o }).issues.map((i) => i.code);
  assert.ok(codes('Only $4.99 a month').includes('price'));
  assert.ok(codes('The #1 focus app').includes('ranking'));
  assert.ok(codes('Also on Android').includes('other-platform'));
  assert.ok(!codes('Track every **workout**').some((c) => ['price', 'ranking', 'other-platform'].includes(c)));
});
