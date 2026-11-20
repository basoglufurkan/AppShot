// Store text: parsing (English and localised labels, multi-locale documents), limits in bytes, keyword hygiene,
// the false positives real listings taught us, keyword packing and the fastlane export.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseFields, parseDocument, checkLocale, packKeywords, writeFastlane, localeFromHeading } from '../engine/lib/metadata.mjs';
import { tmp } from './_helpers.mjs';

const codes = (issues, level) => issues.filter((i) => !level || i.level === level).map((i) => i.code);

test('fields parse under English and localised labels, counts ignored, notes after --- dropped', () => {
  const f = parseFields('# x\nnotes\n\n**Name** (20/30)\nNova: Focus\n\n**Untertitel**\nFokus\n\n**Keywords**\na,b\n\n---\nNotes: TODO later');
  assert.deepEqual(f, { name: 'Nova: Focus', subtitle: 'Fokus', keywords: 'a,b' });
});

test('a multi-locale document splits by language headings', () => {
  const doc = parseDocument('| Privacy Policy URL | `https://x.test/p` |\n| Marketing URL | optional |\n\n## English (U.S.)\n\n**Name**\nA\n\n## Deutsch (German)\n\n**Name**\nB\n\n## Terms of Use footer\n\ntext');
  assert.deepEqual(Object.keys(doc.locales), ['en-US', 'de-DE']);
  assert.equal(doc.shared.privacyUrl, 'https://x.test/p');
  assert.equal(doc.shared.marketingUrl, undefined);
  assert.equal(localeFromHeading('Español (España)'), 'es-ES');
});

test('the keyword field is measured in bytes', () => {
  const kw = 'pomodoro,konzentration,zeitmesser,übung,prüfung,lösung,gewöhnung,größe,tägliche,fächer,ziele,lernen';
  assert.ok(kw.length <= 100 && Buffer.byteLength(kw) > 100, 'fits in characters, not in bytes');
  assert.ok(codes(checkLocale({ name: 'Nova', description: 'x', keywords: kw }, { locale: 'de-DE' }), 'error').includes('too-long'));
});

test('keyword words already in the name or subtitle are flagged', () => {
  const i = checkLocale({ name: 'Nova: Focus Garden', subtitle: 'Focus timer that grows plants', keywords: 'pomodoro,focus,timer', description: 'd' }, { locale: 'en-US' });
  assert.equal(i.filter((x) => x.code === 'in-name').length, 2);
});

test('real listings: no false alarms for Spanish "todo" or "your best day"', () => {
  const es = checkLocale({ name: 'Nova: pomodoro', description: 'Planifica tu semana: todo en un solo lugar.' }, { locale: 'es-ES' });
  assert.ok(!codes(es).includes('placeholder'));
  const en = checkLocale({ name: 'Nova', description: 'Weekly stats: total time, your best day and your longest streak.' }, { locale: 'en-US' });
  assert.ok(!codes(en, 'warn').includes('ranking'));
});

test('a paid tier the description never mentions is an error (Apple 2.3.2)', () => {
  const profile = { monetization: { subscriptions: true } };
  assert.ok(codes(checkLocale({ name: 'A', description: 'A calm timer.' }, { locale: 'en-US', profile }), 'error').includes('paid-disclosure'));
  assert.ok(!codes(checkLocale({ name: 'A', description: 'Nova Plus is an optional subscription. Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/' }, { locale: 'en-US', profile, paidName: 'Nova Plus' })).includes('paid-disclosure'));
});

test('Spanish punctuation and Spain vocabulary', () => {
  const c = codes(checkLocale({ name: 'A', description: 'Listo? Usa tu celular!' }, { locale: 'es-ES' }));
  for (const k of ['es-question', 'es-exclaim', 'es-latam']) assert.ok(c.includes(k), k);
});

test('keyword packing drops name words, generic words and stays within 100 bytes', () => {
  const r = packKeywords(['focus timer', 'pomodoro', 'app', 'study', 'übung'.repeat(30)], { locale: 'en-US', name: 'Nova: Focus', subtitle: 'Timer' });
  assert.equal(r.field, 'pomodoro,study');
  assert.ok(r.bytes <= 100);
});

test('fastlane export writes deliver files and categories', () => {
  const root = tmp('fl');
  const n = writeFastlane({ 'en-US': { name: 'A', keywords: 'b,c', description: 'd' }, 'de-DE': { name: 'E' } }, { primaryCategory: 'Health & Fitness', privacyUrl: 'https://x.test' }, root);
  assert.ok(n >= 5);
  assert.equal(fs.readFileSync(path.join(root, 'metadata', 'en-US', 'keywords.txt'), 'utf8'), 'b,c\n');
  assert.equal(fs.readFileSync(path.join(root, 'metadata', 'primary_category.txt'), 'utf8'), 'HEALTH_AND_FITNESS\n');
});
