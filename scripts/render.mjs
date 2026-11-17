#!/usr/bin/env node
// Render the plan to PNGs.
//   node scripts/render.mjs [--plan appshot/plan.json] [--sizes iphone-6.9,ipad-13] [--locales en-US,tr]
//                          [--draft] [--scale 0.4] [--only 1,3] [--variant b]
// --draft renders at 40% into appshot/drafts (fast, for review). Without it: store-size PNGs in appshot/out.

import path from 'node:path';
import { parseArgs, list, findWorkspace, exists, die, log } from '../engine/lib/util.mjs';
import { loadPlan, renderPlan } from '../engine/render.mjs';

const args = parseArgs();
const ws = findWorkspace(args);
let planPath = args.plan ? path.resolve(args.plan) : path.join(ws, 'plan.json');
if (args.variant) planPath = path.join(ws, 'variants', `${args.variant}.json`);
if (!exists(planPath)) die(`No plan at ${planPath}. Create one with: node scripts/plan.mjs init`);

const plan = loadPlan(planPath);
const scale = args.scale ? Number(args.scale) : args.draft ? 0.4 : 1;
const only = list(args.only).map((x) => (/^\d+$/.test(x) ? Number(x) - 1 : x));
const outDir = args.out ? path.resolve(args.out) : args.variant ? path.join(ws, 'drafts', 'variants', args.variant) : undefined;

log.step(`Rendering ${path.relative(process.cwd(), planPath)} at ${Math.round(scale * 100)}%`);
const reportFile = args.variant ? path.join(ws, 'review', 'variants', args.variant, scale < 1 ? 'draft-report.json' : 'render-report.json') : undefined;
const report = await renderPlan({ plan, outDir, sizes: list(args.sizes), locales: list(args.locales), scale, only: only.length ? only : undefined, reportFile });

let issues = 0;
for (const job of report.jobs) {
  for (const s of job.slots) {
    for (const t of s.text) if (!t.ok) { issues++; log.warn(`${job.size}/${job.locale} #${s.index + 1} "${t.headline.slice(0, 40)}" does not fit (${t.lines} lines at ${t.fontSize}px) — shorten it`); }
    if (s.textOverDevice > 0.08) { issues++; log.warn(`${job.size}/${job.locale} #${s.index + 1} caption overlaps the device (${Math.round(s.textOverDevice * 100)}%)`); }
    if (s.missingScreens) log.warn(`${job.size}/${job.locale} #${s.index + 1} uses a PLACEHOLDER screen — capture the real one before export`);
    if (s.brokenImages.length) { issues++; log.warn(`#${s.index + 1} broken image: ${s.brokenImages[0]}`); }
  }
  for (const f of job.fonts || []) if (!f.loaded) log.warn(`Font "${f.family}" did not load (offline?) — a system fallback was used`);
  for (const e of job.consoleErrors) log.warn(`page error: ${e}`);
}
log.ok(`Done in ${(report.ms / 1000).toFixed(1)}s → ${path.relative(process.cwd(), report.outDir)}${issues ? ` · ${issues} issue(s)` : ''}`);
log.info('Next: node scripts/sheet.mjs' + (scale < 1 ? ' --draft' : ''));
