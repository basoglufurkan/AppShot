// Shot 1's scroll-stopper (layout "billboard"): its proof row is iOS only, it is a shot-1 treatment, the director opens
// with it unless the niche clearly prefers another opener, and the scorer wants shot 1's promise to be the biggest type.
import test from 'node:test';
import assert from 'node:assert/strict';
import { lintPlan } from '../engine/lib/copyrules.mjs';
import { layouts } from '../engine/registry.mjs';
import { directions } from '../engine/lib/designer.mjs';
import { compose, resolveTheme, highlightContrast } from '../engine/compose.mjs';
import { laurel } from '../engine/components/laurel.mjs';
import { scoreSet } from '../scripts/score.mjs';
import { tmp } from './_helpers.mjs';

const meta = await layouts();
const hook = (extra = {}) => ({
  id: 'hook', layout: 'billboard', screen: 'raw/home.png', headline: { 'en-US': 'Identify **any car**' }, subhead: { 'en-US': 'in seconds' },
  pop: { rect: [0.05, 0.2, 0.9, 0.2] }, ...extra,
});
const plan = (shots) => ({ app: { name: 'Carry' }, locales: ['en-US'], defaultLocale: 'en-US', shots });
const codes = (p, store, k = 0) => lintPlan(p, { locale: 'en-US', store, layoutsMeta: meta }).shots[k].issues.map((i) => i.code);

test('billboard proof is iOS only: no skipOn needed, Play drops the row instead of failing', () => {
  const p = plan([hook({ rating: { value: '4.8', label: '12K ratings', source: 'App Store Connect, 2026-11-01' } })]);
  assert.ok(!codes(p, 'android').includes('play-social-proof'));
  assert.ok(codes(p, 'android').includes('proof-dropped'));
  assert.ok(!codes(p, 'ios').includes('proof-dropped'));
  // Other layouts still have to skip Play themselves.
  const sp = plan([{ ...hook(), layout: 'social-proof', rating: { value: '4.8', source: 'x' } }]);
  assert.ok(codes(sp, 'android').includes('play-social-proof'));
});

test('billboard proof text is linted: placeholders block, rankings warn', () => {
  const p = plan([hook({ awards: [{ title: '#1', sub: 'car identifier', style: 'seal', source: 'chart, 2026-10' }, { title: '{users}', sub: 'users', source: 'x' }] })]);
  const c = codes(p, 'ios');
  assert.ok(c.includes('ranking'));
  assert.ok(c.includes('placeholder'));
});

test('billboard is a shot-1 treatment and needs a short promise and a hero', () => {
  assert.ok(codes(plan([hook(), hook({ id: 'b', headline: { 'en-US': 'Second **one**' } })]), 'ios', 1).includes('first-only'));
  assert.ok(codes(plan([hook({ headline: { 'en-US': 'See where all of your **money goes**' } })]), 'ios').includes('billboard-long'));
  assert.ok(codes(plan([hook({ subhead: { 'en-US': 'Budget, bills and spending in one calm view' } })]), 'ios').includes('billboard-kicker'));
  assert.ok(codes(plan([hook({ screen: undefined })]), 'ios').includes('billboard-empty'));
  const noUi = codes(plan([hook({ screen: undefined, hero: { image: 'raw/car.png' } })]), 'ios');
  assert.ok(noUi.includes('billboard-no-ui') && !noUi.includes('billboard-empty'));
});

test('the director opens with a billboard, but not where the niche clearly opens otherwise', () => {
  const p = { app: { name: 'A' }, shots: [{ id: 'hook', layout: 'hero-device', screen: 'raw/a.png' }, { id: 'b', screen: 'raw/b.png' }] };
  const usual = directions({ plan: p, niche: { themes: ['calm', 'midnight'], layouts: ['hero-device', 'zoom-callout'] }, seed: 'com.a' }).directions;
  assert.equal(usual[0].opening, 'billboard');
  assert.ok(usual[0].reasons.some((r) => r.includes('stops the scroll')));
  assert.notEqual(usual[1].opening, 'billboard', 'B is a real alternative');
  const photo = directions({ plan: p, niche: { themes: ['calm', 'midnight'], layouts: ['full-bleed', 'before-after'] }, seed: 'com.a' }).directions;
  assert.equal(photo[0].opening, 'bleed');
});

test('compose: kicker in display type, proof row on iOS only', async () => {
  const p = plan([hook({ awards: [{ title: '90K+', sub: 'active users', source: 'analytics, 2026-11' }] }), { id: 'two', layout: 'hero-device', headline: 'Two' }]);
  const ios = (await compose({ plan: p, workspace: tmp('bb'), sizeId: 'iphone-6.9', locale: 'en-US' })).html;
  const play = (await compose({ plan: p, workspace: tmp('bb'), sizeId: 'android-phone', locale: 'en-US' })).html;
  assert.match(ios, /class="sh kick"/);
  assert.match(ios, /\.sh\.kick\{font-family:var\(--font-display\)/);
  assert.match(ios, /class="proof"/);
  assert.match(ios, /class="magnifier"/, 'the money moment pops out');
  assert.doesNotMatch(play, /class="proof"/);
  // Poster size on iOS (15 u = 198 px on 6.9"); on Play phones 13 u, because Play caps taglines at 20 % of the image
  // (at 15 u the Pulse promise covered 21 %).
  assert.match(ios, /data-max="198"/);
  assert.match(play, /data-max="115\.19"/);
});

test('sticker highlight: accent inside a white ring, judged against the ring', () => {
  const t = resolveTheme({ theme: 'clean-light', themeOverrides: { highlight: 'sticker', accent: '#3D5AFE' } });
  assert.ok(highlightContrast(t) > 4.5);
  assert.ok(highlightContrast({ ...t, accent: '#D7FF3A' }) < 2, 'a pale accent on the white ring is flagged');
});

test('laurel leaves stay inside their viewBox (they used to be clipped flat)', () => {
  const svg = laurel({ title: '4.8', sub: 'ratings' }, { theme: { text: '#111' }, u: 10 });
  const ells = [...svg.matchAll(/<ellipse cx="([\d.-]+)" cy="([\d.-]+)" rx="([\d.-]+)" ry="([\d.-]+)" transform="rotate\(([\d.-]+)/g)].map((m) => m.slice(1).map(Number));
  assert.ok(ells.length >= 20);
  for (const [cx, cy, rx, ry, deg] of ells) {
    const a = (deg * Math.PI) / 180;
    const hw = Math.hypot(rx * Math.cos(a), ry * Math.sin(a)), hh = Math.hypot(rx * Math.sin(a), ry * Math.cos(a));
    assert.ok(cx - hw >= 0 && cx + hw <= 60 && cy - hh >= 0 && cy + hh <= 112, `leaf at ${cx},${cy} leaves the 60×112 box`);
  }
});

test('score: shot 1 that reads like the rest loses story points; a billboard-sized promise does not', async () => {
  const shots = [hook(), { id: 'b', layout: 'zoom-callout', headline: { 'en-US': 'Spot the **model**' } }, { id: 'c', layout: 'floating-cards', headline: { 'en-US': 'Every **detail**' } }];
  const job = (first) => ({
    locale: 'en-US', size: 'iphone-6.9', store: 'ios', width: 1320, height: 2868,
    slots: [first, 132, 130].map((fontSize, index) => ({ index, text: [{ fontSize, max: 198, min: 110, lines: 2, ok: true }], devices: [], textOverDevice: 0, brokenImages: [], missingScreens: 0 })),
  });
  const msg = (r) => r.fixes.find((f) => f.msg.includes('Shot 1 reads like the rest'));
  const flat = await scoreSet({ plan: plan(shots), report: { jobs: [job(132)] } });
  const poster = await scoreSet({ plan: plan(shots), report: { jobs: [job(190)] } });
  assert.ok(msg(flat));
  assert.ok(!msg(poster));
  assert.ok(poster.parts.story > flat.parts.story);
});
