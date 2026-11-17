#!/usr/bin/env node
// Wide promo graphics from the same theme and screens as the screenshots.
//   node scripts/graphic.mjs [--type play-feature|appstore-header|appstore-search|appstore-universal] [--tagline "…"] [--locale en-US] [--screens raw/a.png,raw/b.png]
// Output: appshot/out/graphics/<type>.<locale>.png

import path from 'node:path';
import { parseArgs, findWorkspace, readJson, ensureDir, list, L, die, log } from '../engine/lib/util.mjs';
import { loadPlan, renderPlan } from '../engine/render.mjs';
import fs from 'node:fs';

const args = parseArgs();
const ws = findWorkspace(args);
const plan = loadPlan(path.join(ws, 'plan.json'));
const types = list(args.type).length ? list(args.type) : ['play-feature'];
if (types.some((t) => t.startsWith('appstore'))) die('App Store header / search results assets have their own generator with motion and video: node scripts/creative.mjs');
const locales = list(args.locale).length ? list(args.locale) : plan.locales || ['en-US'];
const screens = list(args.screens).length ? list(args.screens) : plan.shots.flatMap((s) => (s.screens || [s.screen]).filter(Boolean)).slice(0, 3);
if (!screens.length) die('No screens to show — capture some first.');
const first = plan.shots[0] || {};
const tagline = args.tagline ? { [locales[0]]: args.tagline } : first.headline;
const outDir = ensureDir(path.join(ws, 'out', 'graphics'));
for (const type of types) {
  const p = { ...plan, panorama: false, shots: [{ id: type, layout: 'banner', screens, headline: tagline, options: { devices: type === 'appstore-search' ? 3 : 2 } }] };
  const tmp = path.join(ws, '.cache', 'graphic');
  const report = await renderPlan({ plan: p, outDir: tmp, sizes: [type], locales, quiet: true, reportFile: path.join(tmp, 'report.json') });
  for (const job of report.jobs) {
    const dest = path.join(outDir, `${type}.${job.locale}.png`);
    fs.copyFileSync(job.files[0], dest);
    const t = job.slots[0]?.text?.[0];
    log.ok(`${path.relative(process.cwd(), dest)}${t && !t.ok ? '  ⚠ tagline too long' : ''}`);
  }
}
log.info('Play feature graphic: no rankings, prices, "free", or CTAs; keep text minimal (skills/aso/google-play-rules.md).');
