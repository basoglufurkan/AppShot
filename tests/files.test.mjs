// Pipeline robustness: export with Finder litter, plan validation of the examples, the app-term glossary.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { validatePlan } from '../engine/schema.mjs';
import { glossary } from '../engine/lib/glossary.mjs';
import { readJson } from '../engine/lib/util.mjs';
import { workspace, png, run, tmp, ROOT } from './_helpers.mjs';

test('export ignores .DS_Store files Finder leaves behind', () => {
  const ws = workspace();
  const d = path.join(ws, 'out', 'iphone-6.9', 'en-US');
  fs.mkdirSync(d, { recursive: true });
  png(path.join(d, '01-hook.png'), 20, 40, () => [0, 0, 0]);
  fs.writeFileSync(path.join(ws, 'out', 'iphone-6.9', '.DS_Store'), '');
  fs.writeFileSync(path.join(ws, 'out', '.DS_Store'), '');
  const r = run('export.mjs', ['--workspace', ws, '--no-check']);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(fs.existsSync(path.join(ws, 'export', 'upload', 'ios', 'en-US', 'iphone-6.9', '01-hook.png')));
});

for (const ex of ['pulse', 'penny']) {
  test(`examples/${ex} plan validates`, async () => {
    const ws = path.join(ROOT, 'examples', ex, 'appshot');
    const res = await validatePlan(readJson(path.join(ws, 'plan.json')), { workspace: ws });
    assert.deepEqual(res.errors, []);
  });
}

test('the glossary reads the app\'s own String Catalog', () => {
  const root = tmp('gl');
  fs.writeFileSync(path.join(root, 'Localizable.xcstrings'), JSON.stringify({ sourceLanguage: 'en', strings: { Garden: { localizations: { es: { stringUnit: { value: 'Jardín' } } } }, Settings: { localizations: { es: { stringUnit: { value: 'Ajustes' } } } } } }));
  const g = glossary(root, 'Grow your Garden.', 'es-ES');
  assert.deepEqual(g.map((x) => [x.term, x.translation]), [['Garden', 'Jardín']]);
});

test('auto capture writes a phone screen to the phone path even when an iPad-only shot shares its name', { skip: spawnSync('xcrun', ['simctl', 'help']).status !== 0 && 'no simctl' }, () => {
  const ws = workspace({ locales: ['en-US'], shots: [
    { id: 'a', layout: 'hero-device', screens: ['raw/{locale}/garden.png', 'raw/{locale}/stats.png'] },
    { id: 'b', layout: 'hero-device', screen: 'raw/ipad/{locale}/garden.png' },
  ], capture: { ios: { bundleId: 'com.example.app', device: 'iPhone 17 Pro Max' }, screens: { garden: { url: 'x://garden' } } } });
  const r = run('capture/auto.mjs', ['run', '--workspace', ws, '--only', 'garden']);
  assert.match(r.stdout, /→ raw\/en-US\/garden\.png/);
  assert.doesNotMatch(r.stdout, /phone.*raw\/ipad/);
});
