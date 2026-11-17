// One command for the whole regression after an engine change: unit tests, the example renders and their scores,
// every layout and scene, creative assets, preview and promo drafts, and a golden-image comparison of the example
// screenshots (tests/golden/: small grey thumbnails; a real change shows up as a mean difference above the threshold).
//   node scripts/regress.mjs [--quick] [--update-golden] [--threshold 6]
//     --quick          unit tests + example renders + scores + golden images (skips boards and videos)
//     --update-golden  accept the current renders as the new golden images (after you have LOOKED at them)
// Exit code 1 when anything fails.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs, ensureDir, exists, log } from '../engine/lib/util.mjs';
import { loadImage } from '../engine/lib/visual.mjs';

const args = parseArgs();
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const GOLD = ensureDir(path.join(ROOT, 'tests', 'golden'));
const threshold = Number(args.threshold || 6);
const results = [];
const node = (script, a, { quiet = true } = {}) => spawnSync(process.execPath, [path.join(ROOT, 'scripts', script), ...a], { encoding: 'utf8', cwd: ROOT, stdio: quiet ? 'pipe' : 'inherit', maxBuffer: 1 << 26 });

function step(name, fn) {
  const t0 = Date.now();
  let ok = false, note = '';
  try { const r = fn(); ok = r === true || r?.ok === true; note = r?.note || ''; } catch (e) { note = e.message; }
  results.push({ name, ok, note, s: ((Date.now() - t0) / 1000).toFixed(1) });
  (ok ? log.ok : log.err)(`${name}${note ? ` — ${note}` : ''} (${results.at(-1).s} s)`);
}
const exit0 = (r) => ({ ok: r.status === 0, note: r.status === 0 ? '' : (r.stderr || r.stdout || '').trim().split('\n').slice(-3).join(' | ') });

step('unit tests', () => {
  const r = spawnSync(process.execPath, ['--test', 'tests/*.test.mjs'], { cwd: ROOT, encoding: 'utf8' });
  const pass = (r.stdout.match(/(?:# |ℹ )pass (\d+)/) || [])[1], fail = (r.stdout.match(/(?:# |ℹ )fail (\d+)/) || [])[1];
  return { ok: r.status === 0, note: `${pass ?? '?'} passed${fail && fail !== '0' ? `, ${fail} failed` : ''}` };
});
if (!args.quick) step('doctor + test render', () => exit0(node('doctor.mjs', ['--render'])));

for (const ex of ['pulse', 'penny']) {
  const proj = path.join('examples', ex);
  step(`${ex}: scan`, () => exit0(node('scan.mjs', [proj, '--quiet'])));
  step(`${ex}: draft render`, () => exit0(node('render.mjs', ['--project', proj, '--draft'])));
  step(`${ex}: score ≥ 95`, () => {
    const r = node('score.mjs', ['--project', proj, '--draft']);
    const scores = [...r.stdout.matchAll(/→\s+(\d+)\/100/g)].map((m) => Number(m[1]));
    return { ok: scores.length > 0 && Math.min(...scores) >= 95, note: scores.length ? `min ${Math.min(...scores)}, ${scores.length} sets` : 'no scores' };
  });
  // Golden images: the first three iPhone shots of each locale, as 120 px grey thumbnails.
  step(`${ex}: golden images`, () => {
    const dir = path.join(ROOT, proj, 'appshot', 'drafts', 'iphone-6.9');
    if (!exists(dir)) return { ok: false, note: 'no drafts' };
    const diffs = [];
    for (const loc of fs.readdirSync(dir).filter((d) => !d.startsWith('.'))) {
      for (const f of fs.readdirSync(path.join(dir, loc)).filter((x) => x.endsWith('.png')).sort().slice(0, 3)) {
        const cur = loadImage(path.join(dir, loc, f), 120);
        const gold = path.join(GOLD, `${ex}.${loc}.${f.replace(/\.png$/, '')}.json`);
        const grey = Array.from({ length: cur.width * cur.height }, (_, i) => Math.round(0.2126 * cur.data[i * 4] + 0.7152 * cur.data[i * 4 + 1] + 0.0722 * cur.data[i * 4 + 2]));
        if (args.updateGolden || !exists(gold)) { fs.writeFileSync(gold, JSON.stringify({ w: cur.width, h: cur.height, grey })); continue; }
        const g = JSON.parse(fs.readFileSync(gold, 'utf8'));
        if (g.w !== cur.width || g.h !== cur.height) { diffs.push({ f: `${loc}/${f}`, d: 255 }); continue; }
        let s = 0;
        for (let i = 0; i < grey.length; i++) s += Math.abs(grey[i] - g.grey[i]);
        diffs.push({ f: `${loc}/${f}`, d: Math.round((s / grey.length) * 10) / 10 });
      }
    }
    const bad = diffs.filter((x) => x.d > threshold);
    return { ok: !bad.length, note: diffs.length ? `${diffs.length} compared, max diff ${Math.max(...diffs.map((x) => x.d))}${bad.length ? ` — changed: ${bad.map((x) => `${x.f} (${x.d})`).join(', ')}; LOOK, then --update-golden if intended` : ''}` : 'golden images written' };
  });
}

if (!args.quick) {
  step('pulse: every layout renders', () => exit0(node('layouts.mjs', ['board', '--project', 'examples/pulse'])));
  step('penny: every scene renders', () => exit0(node('scenes.mjs', ['board', '--project', 'examples/penny'])));
  step('pulse: creative assets + videos', () => exit0(node('creative.mjs', ['--project', 'examples/pulse', '--draft', '--video'])));
  step('pulse: app preview draft', () => exit0(node('preview.mjs', ['--project', 'examples/pulse', '--draft', '--locales', 'en-US'])));
  step('pulse: promo draft', () => exit0(node('preview.mjs', ['--project', 'examples/pulse', '--promo', '--draft', '--locales', 'en-US', '--sizes', 'promo-vertical'])));
  step('plans validate', () => exit0(node('plan.mjs', ['validate', '--project', 'examples/pulse'])));
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} steps passed${failed.length ? ` — failed: ${failed.map((r) => r.name).join(', ')}` : ''}`);
if (!failed.length) log.info('Still LOOK at examples/*/appshot/review/ — numbers do not see taste.');
process.exit(failed.length ? 1 : 0);
