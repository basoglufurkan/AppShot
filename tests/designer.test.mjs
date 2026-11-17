// The design director: three distinct directions, deterministic per app, moved by the market and a reference.
import test from 'node:test';
import assert from 'node:assert/strict';
import { directions, applyDirection, distinctiveness, referenceMatch } from '../engine/lib/designer.mjs';

const plan = { app: { name: 'A' }, brand: { primary: '#8B7CFF' }, shots: [{ id: 'hook', layout: 'hero-device', screen: 'raw/a.png' }, { id: 'b', screen: 'raw/b.png' }] };
const niche = { themes: ['calm', 'midnight', 'aurora', 'mint'], layouts: ['hero-device', 'full-bleed', 'duo-devices'] };

test('three directions with three different themes and openings', () => {
  const { directions: d } = directions({ plan, niche, seed: 'com.a' });
  assert.equal(d.length, 3);
  assert.equal(new Set(d.map((x) => x.theme)).size, 3);
  assert.equal(new Set(d.map((x) => x.opening)).size, 3);
  assert.notEqual(d[0].dark, d[1].dark, 'B takes the other tone');
});

test('same app, same answer; the seed only breaks ties', () => {
  const a = directions({ plan, niche, seed: 'com.a' }).directions.map((x) => x.theme);
  assert.deepEqual(a, directions({ plan, niche, seed: 'com.a' }).directions.map((x) => x.theme));
});

test('a reference pulls direction A to its tone', () => {
  const ref = { tone: 'light', background: 'flat', accentHue: 200, captionAt: 'top', uiShare: 0.4, fullBleedShare: 0, multiDevice: 0 };
  assert.equal(directions({ plan, niche, reference: ref, seed: 'x' }).directions[0].dark, false);
});

test('applying a direction keeps captions and swaps theme and opening', () => {
  const d = directions({ plan, niche, seed: 'com.a' }).directions[2];
  const p = applyDirection({ ...plan, shots: plan.shots.map((s) => ({ ...s, headline: { 'en-US': 'Hi' } })) }, d);
  assert.equal(p.theme, d.theme);
  assert.equal(p.shots[0].layout, d.layout);
  assert.equal(p.shots[0].headline['en-US'], 'Hi');
});

test('distinctiveness and reference match stay on 0–10', () => {
  const market = { summary: { darkShare: 0.75, accentHue: 270, fullBleedShare: 0.1, panoramaShare: 0.2 } };
  const lightSet = { tone: 'light', accentHue: 120, panorama: true, fullBleedShare: 0 };
  const darkSet = { tone: 'dark', accentHue: 265, panorama: false, fullBleedShare: 0 };
  assert.ok(distinctiveness(lightSet, market) > distinctiveness(darkSet, market));
  assert.ok(referenceMatch(lightSet, { ...lightSet, background: 'flat', captionAt: 'top' }) <= 10);
});

test('a learned win moves the director', async () => {
  const { learn } = await import('../engine/lib/learning.mjs');
  const store = { results: {}, niches: {} };
  const base = { traits: { theme: 'calm', tone: 'dark', opening: 'hero-device', panorama: 'no' } };
  for (let i = 0; i < 3; i++) learn(store, { id: `r${i}`, niche: 'n1', lift: 20, confidence: 95, baseline: base, treatment: { traits: { theme: 'mint', tone: 'light', opening: 'full-bleed', panorama: 'no' } } });
  const without = directions({ plan, niche, seed: 'com.a', nicheId: 'n1' }).directions[0];
  const withL = directions({ plan, niche, seed: 'com.a', nicheId: 'n1', learning: store }).directions[0];
  assert.equal(without.dark, true);
  assert.equal(withL.dark, false, 'three light wins flip direction A to light');
  assert.ok(withL.reasons.some((r) => r.includes('learned')));
});
