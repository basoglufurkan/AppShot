#!/usr/bin/env node
// Run the mechanical stages of the pipeline in order and stop where judgement is needed.
//   node scripts/run.mjs setup  [--project .]   doctor → workspace → scan → niche → brief → keyword seed → plan draft
//   node scripts/run.mjs draft  [--project .]   validate → copy-check → draft render → boards → score
//   node scripts/run.mjs final  [--project .]   render → boards → Play graphic / App Store creative assets / app previews → check → export
// The agent still writes the brief and captions and LOOKS at the boards between stages (SKILL.md).

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, exists, readJson, log, die, workspaceFor } from '../engine/lib/util.mjs';

const args = parseArgs();
const stage = args._[0] || 'setup';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(args.project || process.cwd());
const ws = args.workspace ? path.resolve(args.workspace) : workspaceFor(project);
const wsArgs = ['--workspace', ws];

function step(label, script, extra = [], { optional = false } = {}) {
  log.step(label);
  const r = spawnSync(process.execPath, [path.join(HERE, script), ...extra], { stdio: 'inherit', cwd: project });
  if (r.status !== 0 && !optional) die(`${label} failed — fix the issue above, then rerun: node scripts/run.mjs ${stage}`);
  return r.status === 0;
}

if (stage === 'setup') {
  step('Doctor', 'doctor.mjs');
  step('Workspace', 'workspace.mjs', ['init', ...wsArgs]);
  step('Scan', 'scan.mjs', [project, ...wsArgs]);
  step('Niche', 'niche.mjs', ['--explain', ...wsArgs]);
  if (!exists(path.join(ws, 'brief.md'))) step('Brief scaffold', 'brief.mjs', wsArgs);
  step('Keyword seeds', 'keywords.mjs', ['seed', ...wsArgs]);
  if (!exists(path.join(ws, 'plan.json'))) step('Plan draft', 'plan.mjs', ['init', ...wsArgs]);
  const p = readJson(path.join(ws, 'profile.json'), {});
  console.log(`\nNext (agent): read skills/niches/${p.niche?.chosen || '<niche>'}.md, complete appshot/brief.md, capture real screens into appshot/raw,`);
  console.log('write captions in appshot/plan.json, then: node scripts/run.mjs draft');
  process.exit(0);
}

if (stage === 'draft') {
  if (!exists(path.join(ws, 'plan.json'))) die('No plan.json — run: node scripts/run.mjs setup');
  step('Validate plan', 'plan.mjs', ['validate', ...wsArgs]);
  const lintOk = step('Caption lint', 'copy-check.mjs', wsArgs, { optional: true });
  step('Draft render', 'render.mjs', ['--draft', ...wsArgs]);
  step('Review boards', 'sheet.mjs', ['--draft', ...wsArgs]);
  step('Score', 'score.mjs', ['--draft', ...wsArgs]);
  console.log(`\nNext (agent): Read ${path.join(ws, 'review')}/search-*.png and contact-*.png, critique (skills/review/critique.md),`);
  console.log(`fix${lintOk ? '' : ' the caption errors and'} the top issues, rerun draft. When every score is ≥ 85: variants.mjs tournament, then run.mjs final.`);
  process.exit(0);
}

if (stage === 'final') {
  step('Final render', 'render.mjs', wsArgs);
  step('Review boards', 'sheet.mjs', wsArgs);
  const plan = readJson(path.join(ws, 'plan.json'), {});
  if ((plan.sizes || []).some((s) => s.startsWith('android'))) step('Play feature graphic', 'graphic.mjs', ['--type', 'play-feature', ...wsArgs], { optional: true });
  // iOS sets get header / search creative assets (the director decides them); videos when plan.creative.video is set.
  const ios = (plan.sizes || []).some((s) => s.startsWith('iphone') || s.startsWith('ipad'));
  if (plan.creative || ios) step('App Store creative assets', 'creative.mjs', [...(plan.creative?.video ? ['--video'] : []), ...wsArgs], { optional: true });
  // App preview video (plays before the screenshots): opt-in with plan.preview — rendering takes a minute per locale.
  if (plan.preview && plan.preview.enabled !== false) step('App previews', 'preview.mjs', wsArgs, { optional: true });
  step('Store check', 'check.mjs', wsArgs);
  step('Export', 'export.mjs', ['--zip', '--no-check', ...wsArgs]);
  console.log(`\nDone. Upload instructions: ${path.join(ws, 'export', 'README.md')}`);
  process.exit(0);
}

die(`Unknown stage "${stage}". Use setup | draft | final`);
