// Record real store-test results and learn from them. App Store Connect → Product Page Optimization (or Play Console
// → Store listing experiments) reports, per treatment, the conversion lift against the original and a confidence.
// Each result is stored with the design traits of both sides; `learn` folds them into ~/.appshot/learning.json, which
// the design director (engine/lib/designer.mjs) reads for every app in the same niche.
//   node scripts/results.mjs add --treatment dir-c --lift 12.4 --confidence 90 [--baseline main] [--name "PPO Dec 2026"]
//        [--store ios|android] [--locale en-US] [--impressions 18000] [--lift-range "3.1,21.7"]
//        (baseline and treatment: "main" = plan.json, or a variants/<name> plan; --lift-range alone is fine: its middle
//        is the lift, and a range that excludes 0 counts as 90 % confidence)
//   node scripts/results.mjs list
//   node scripts/results.mjs learn           fold this workspace's results into the shared learning file
//   node scripts/results.mjs show [--niche focus-timer]   what the learning says, per niche
// Results: appshot/results.json. Learning: ~/.appshot/learning.json ($APPSHOT_LEARNING to move it). Nothing is sent anywhere.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { parseArgs, findWorkspace, readJson, writeJson, exists, list, die, log } from '../engine/lib/util.mjs';
import { setTraits } from '../engine/lib/visual.mjs';
import { planTraits, loadLearning, saveLearning, learn, LEARNING_FILE } from '../engine/lib/learning.mjs';

const args = parseArgs();
const cmd = args._[0] || 'list';

if (cmd === 'show') {
  const store = loadLearning();
  const niches = args.niche ? [args.niche] : Object.keys(store.niches);
  if (!niches.length) { log.info(`No learning yet (${LEARNING_FILE}). Record results with: node scripts/results.mjs add …, then learn.`); process.exit(0); }
  for (const n of niches) {
    const e = store.niches[n];
    if (!e) { console.log(`${n}: no tests yet`); continue; }
    console.log(`\n${n} · ${e.tests} test(s)`);
    for (const [k, f] of Object.entries(e.features).sort((a, b) => b[1].score - a[1].score)) console.log(`  ${k.padEnd(28)} ${f.score >= 0 ? '+' : ''}${f.score.toFixed(2)}  (${f.wins}/${f.tests} won)`);
  }
  process.exit(0);
}

const ws = findWorkspace(args);
const file = path.join(ws, 'results.json');
const data = readJson(file, { results: [] });
const plan = readJson(path.join(ws, 'plan.json'), {});
const profile = readJson(path.join(ws, 'profile.json'), {});
const niche = plan.niche || profile.niche?.chosen || 'unknown';

/** The plan behind a side of the test and the traits of its first three rendered shots (when renders exist). */
function side(name) {
  const p = name === 'main' ? plan : readJson(path.join(ws, 'variants', `${name}.json`), null);
  if (!p) die(`No plan "${name}" (main or variants/<name>.json)`);
  const loc = args.locale || plan.defaultLocale || 'en-US';
  const dirs = name === 'main' ? [path.join(ws, 'out', 'iphone-6.9', loc), path.join(ws, 'drafts', 'iphone-6.9', loc)] : [path.join(ws, 'drafts', 'variants', name, 'iphone-6.9', loc)];
  const d = dirs.find((x) => exists(x));
  let st = null;
  if (d) { const f = fs.readdirSync(d).filter((x) => x.endsWith('.png')).sort().slice(0, 3).map((x) => path.join(d, x)); if (f.length) { try { st = setTraits(f); } catch {} } }
  return { name, traits: planTraits(p, st), set: st ? { tone: st.tone, accentHue: st.accentHue, background: st.background, panorama: st.panorama } : null };
}

if (cmd === 'add') {
  const treatment = args.treatment || die('--treatment <variant name> (the one Apple/Google tested against the original)');
  let lift = args.lift !== undefined ? Number(args.lift) : null, confidence = args.confidence !== undefined ? Number(args.confidence) : null;
  if (args.liftRange) {
    const [lo, hi] = list(args.liftRange).map(Number);
    if (lift === null) lift = Math.round(((lo + hi) / 2) * 10) / 10;
    if (confidence === null && (lo > 0 || hi < 0)) confidence = 90;
  }
  if (lift === null || Number.isNaN(lift)) die('--lift <percent> (negative when the treatment lost) or --lift-range "lo,hi"');
  const r = {
    id: crypto.randomUUID().slice(0, 8), name: args.name || `${treatment} vs ${args.baseline || 'main'}`, store: args.store || 'ios', locale: args.locale || plan.defaultLocale || 'en-US',
    niche, app: plan.app?.name, lift, confidence, impressions: args.impressions ? Number(args.impressions) : null, recordedAt: new Date().toISOString(),
    baseline: side(args.baseline || 'main'), treatment: side(treatment),
  };
  data.results.push(r);
  writeJson(file, data);
  log.ok(`results.json ← ${r.name}: ${lift >= 0 ? '+' : ''}${lift} %${confidence ? ` at ${confidence} % confidence` : ''}`);
  const diff = Object.keys({ ...r.baseline.traits, ...r.treatment.traits }).filter((k) => r.baseline.traits[k] !== r.treatment.traits[k]);
  log.info(diff.length ? `Differences that get the credit: ${diff.map((k) => `${k} ${r.treatment.traits[k]} vs ${r.baseline.traits[k]}`).join(', ')}` : 'The two sides share every design trait: the result is about copy or screens, not the look — nothing to learn for the director.');
  log.info('Fold it into the shared learning: node scripts/results.mjs learn');
  process.exit(0);
}

if (cmd === 'list') {
  if (!data.results.length) { log.info('No results yet: node scripts/results.mjs add --treatment <variant> --lift <percent> --confidence <percent>'); process.exit(0); }
  for (const r of data.results) console.log(`${r.recordedAt.slice(0, 10)}  ${r.store.padEnd(7)} ${r.name.padEnd(30)} ${(r.lift >= 0 ? '+' : '') + r.lift} %${r.confidence ? ` (${r.confidence} %)` : ''}  ${r.treatment.name}: ${JSON.stringify(r.treatment.traits)}`);
  process.exit(0);
}

if (cmd === 'learn') {
  const store = loadLearning();
  let n = 0;
  for (const r of data.results) if (learn(store, r)) n++;
  saveLearning(store);
  log.ok(`${n} new result(s) learned (${data.results.length - n} already known) → ${LEARNING_FILE}`);
  log.info(`See it: node scripts/results.mjs show --niche ${niche}. The design director uses it for every app in ${niche}.`);
  process.exit(0);
}

die(`Unknown command ${cmd} (add | list | learn | show)`);
