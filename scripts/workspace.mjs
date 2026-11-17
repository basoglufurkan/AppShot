#!/usr/bin/env node
// Create / inspect / clean the appshot/ workspace inside the target project.
//   node scripts/workspace.mjs init   [--project <app repo>]   creates appshot/ with folders + .gitignore
//                                                              (renames an older hidden .appshot/ to appshot/)
//   node scripts/workspace.mjs status [--project <app repo>]   what exists, what is next
//   node scripts/workspace.mjs clean  [--drafts] [--cache]

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, findWorkspace, workspaceFor, exists, ensureDir, readJson, log, die, WORKSPACE_DIR, LEGACY_WORKSPACE_DIR, WORKSPACE_MARKER } from '../engine/lib/util.mjs';

const args = parseArgs();
const cmd = args._[0] || 'status';
let ws = args.project ? workspaceFor(args.project) : findWorkspace(args);

const DIRS = ['raw', 'out', 'drafts', 'review', 'variants', 'fonts', 'export', '.cache'];

if (cmd === 'init') {
  // Move a hidden workspace from older versions into the visible folder.
  if (path.basename(ws) === LEGACY_WORKSPACE_DIR) {
    const visible = path.join(path.dirname(ws), WORKSPACE_DIR);
    if (!exists(visible)) { fs.renameSync(ws, visible); log.ok(`Moved ${LEGACY_WORKSPACE_DIR}/ → ${WORKSPACE_DIR}/ (now visible)`); ws = visible; }
    else log.warn(`Both ${LEGACY_WORKSPACE_DIR}/ and ${WORKSPACE_DIR}/ exist — using ${LEGACY_WORKSPACE_DIR}/; merge them by hand.`);
  }
  for (const d of DIRS) ensureDir(path.join(ws, d));
  if (!exists(path.join(ws, WORKSPACE_MARKER))) fs.writeFileSync(path.join(ws, WORKSPACE_MARKER), 'Appshot workspace\n');
  const gi = path.join(ws, '.gitignore');
  if (!exists(gi)) fs.writeFileSync(gi, '.cache/\ndrafts/\nreview/variants/\nmarket/shots/\n');
  const readme = path.join(ws, 'README.md');
  if (!exists(readme)) fs.writeFileSync(readme, `# appshot

Workspace created by Appshot. Safe to commit (except the ignored folders).

| Path | What |
| --- | --- |
| profile.json | What the scanner learned about the app |
| brief.md | Positioning, audience, benefits, keywords — the source of truth for copy |
| plan.json | The screenshot set: shots, layouts, captions per locale, theme, sizes |
| raw/ | Real app screens (simulator / emulator / your own PNGs) |
| variants/ | Alternative plans for A/B tests (Product Page Optimization, Play experiments) |
| drafts/ | Fast low-res renders for review |
| out/ | Store-size PNGs, per size and locale |
| review/ | Contact sheets, search-result previews, scores |
| export/ | fastlane-ready folders and zips |
`);
  log.ok(`Workspace ready: ${ws}`);
  process.exit(0);
}

if (cmd === 'clean') {
  const targets = [];
  if (args.drafts || !args.cache) targets.push('drafts');
  if (args.cache || !args.drafts) targets.push('.cache');
  for (const t of targets) fs.rmSync(path.join(ws, t), { recursive: true, force: true });
  log.ok(`Removed ${targets.join(', ')}`);
  process.exit(0);
}

if (cmd === 'status') {
  if (!exists(ws)) die(`No workspace at ${ws}. Run: node scripts/workspace.mjs init --project <app>`);
  const has = (p) => exists(path.join(ws, p));
  const count = (p) => { try { return fs.readdirSync(path.join(ws, p)).filter((f) => !f.startsWith('.')).length; } catch { return 0; } };
  const plan = readJson(path.join(ws, 'plan.json'), null);
  const rows = [
    ['profile.json', has('profile.json'), 'node scripts/scan.mjs <project>'],
    ['brief.md', has('brief.md'), 'node scripts/brief.mjs'],
    ['raw screens', count('raw') > 0, 'capture: node scripts/capture/ios-sim.mjs --name home'],
    ['plan.json', !!plan, 'node scripts/plan.mjs init'],
    ['drafts', count('drafts') > 0, 'node scripts/render.mjs --draft'],
    ['review', count('review') > 0, 'node scripts/sheet.mjs --draft && node scripts/score.mjs'],
    ['out', count('out') > 0, 'node scripts/render.mjs'],
    ['export', count('export') > 0, 'node scripts/export.mjs'],
  ];
  console.log(`\nWorkspace ${ws}\n`);
  let nextShown = false;
  for (const [name, ok, next] of rows) {
    console.log(`  ${ok ? '✓' : '·'} ${name.padEnd(14)}${!ok && !nextShown ? `  ← next: ${next}` : ''}`);
    if (!ok) nextShown = true;
  }
  if (plan) console.log(`\n  ${plan.shots?.length || 0} shots · theme ${typeof plan.theme === 'string' ? plan.theme : 'custom'} · ${(plan.locales || []).join(', ')} · ${(plan.sizes || []).join(', ')}`);
  console.log(`  raw: ${count('raw')} file(s) · variants: ${count('variants')}\n`);
  process.exit(0);
}

die(`Unknown command "${cmd}". Use init | status | clean`);
