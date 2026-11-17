// The screenshot design director, on demand: three directions for THIS app (theme, opening, panorama) from the niche,
// the brand, the market scan and the user's reference, so two apps in one category never get the same set.
//   node scripts/design.mjs directions [--write] [--no-reference]   print A, B, C with reasons; --write saves B and C
//                                                                   as variants/dir-b.json, dir-c.json (A as dir-a.json)
//   node scripts/design.mjs apply a|b|c [--no-reference]            put a direction into plan.json (captions kept;
//                                                                   previous plan → variants/_previous.json)
//   (--store play: weigh the imported Play market — market.mjs import <folder> --store play)
//   node scripts/design.mjs explain                                 the ranked themes and openings with their reasons
// Then: node scripts/variants.mjs tournament — renders and scores every direction, plus distinctiveness against the
// market and closeness to the reference.

import path from 'node:path';
import { parseArgs, findWorkspace, readJson, writeJson, ensureDir, die, log } from '../engine/lib/util.mjs';
import { loadNiche } from '../engine/lib/niches.mjs';
import { directions, applyDirection } from '../engine/lib/designer.mjs';
import { activeReference, loadMarket } from '../engine/lib/designer-io.mjs';
import { loadLearning } from '../engine/lib/learning.mjs';

const args = parseArgs();
const cmd = args._[0] || 'directions';
const ws = findWorkspace(args);
const planFile = path.join(ws, 'plan.json');
const plan = readJson(planFile, null) || die('No plan.json yet: node scripts/plan.mjs init');
const profile = readJson(path.join(ws, 'profile.json'), {});
const nicheId = plan.niche || profile.niche?.chosen;
const niche = nicheId ? loadNiche(nicheId)?.data : null;
const market = loadMarket(ws, ['play', 'android'].includes(args.store) ? 'play' : 'ios');
const ref = args.noReference ? null : activeReference(ws, plan);
// Directions start from the plan as it stands, minus a previous direction's opening swap.
const res = directions({ plan, profile, niche, market, reference: ref?.traits, learning: loadLearning() });

log.info(`${plan.app?.name || 'App'} · niche ${nicheId || '—'}${market ? ` · market ${market.apps.length} apps (${market.terms.join(', ')})` : ' · no market scan'}${ref ? ` · reference ${ref.name}` : ''}`);

if (cmd === 'explain') {
  console.log('\nThemes');
  for (const t of res.themes) console.log(`  ${t.id.padEnd(13)} ${String(t.score).padStart(5)}  ${t.why.join(' · ')}`);
  console.log('\nOpenings');
  for (const o of res.openings) console.log(`  ${o.id.padEnd(8)} ${o.layout.padEnd(15)} ${String(o.score).padStart(5)}  ${o.why.join(' · ')}`);
  process.exit(0);
}

if (cmd === 'directions') {
  for (const d of res.directions) {
    console.log(`\n${d.key.toUpperCase()}  theme ${d.theme} (${d.dark ? 'dark' : 'light'}) · opening ${d.opening}: ${d.label}${d.panorama ? ' · panorama' : ''}`);
    for (const r of d.reasons) console.log(`   • ${r}`);
  }
  if (args.write) {
    const vdir = ensureDir(path.join(ws, 'variants'));
    for (const d of res.directions) {
      const v = applyDirection(plan, d, { reference: ref?.traits });
      if (ref) v.design = { ...v.design, reference: ref.name };
      writeJson(path.join(vdir, `dir-${d.key}.json`), { ...v, workspace: '..', variant: { name: `dir-${d.key}`, changes: [`direction ${d.key.toUpperCase()}: theme ${d.theme}, opening ${d.opening}${d.panorama ? ', panorama' : ''}`], from: 'plan.json', createdAt: new Date().toISOString() } });
    }
    log.ok('variants/dir-a.json, dir-b.json, dir-c.json — compare: node scripts/variants.mjs tournament');
  } else log.info('Save them as variants: --write · put one into the plan: node scripts/design.mjs apply a');
  process.exit(0);
}

if (cmd === 'apply') {
  const key = String(args._[1] || 'a').toLowerCase();
  const d = res.directions.find((x) => x.key === key) || die('apply a | b | c');
  const next = applyDirection(plan, d, { reference: ref?.traits });
  if (ref) next.design = { ...next.design, reference: ref.name };
  writeJson(path.join(ensureDir(path.join(ws, 'variants')), '_previous.json'), plan);
  writeJson(planFile, next);
  log.ok(`plan.json ← direction ${key.toUpperCase()}: theme ${d.theme}, opening ${d.opening}${d.panorama ? ', panorama' : ''} (previous: variants/_previous.json)`);
  for (const r of d.reasons) console.log(`   • ${r}`);
  process.exit(0);
}

die(`Unknown command ${cmd} (directions | apply | explain)`);
