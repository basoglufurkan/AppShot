// Workspace side of the design director: loads the market scan and the studied reference, runs the director and
// writes the directions (A into the plan, B and C as variants/dir-b.json, dir-c.json). Used by plan.mjs init and
// scripts/design.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { readJson, writeJson, exists, ensureDir, log } from './util.mjs';
import { directions, applyDirection } from './designer.mjs';
import { loadLearning } from './learning.mjs';

/** The studied reference to follow: plan.design.reference, else the most recently studied one. */
export function activeReference(ws, plan = {}) {
  const root = path.join(ws, 'references');
  if (!exists(root)) return null;
  const want = plan.design?.reference;
  const studied = fs.readdirSync(root).map((n) => ({ n, f: path.join(root, n, 'study', 'traits.json') })).filter((x) => exists(x.f));
  const pick = want ? studied.find((x) => x.n === want) : studied.sort((a, b) => fs.statSync(b.f).mtimeMs - fs.statSync(a.f).mtimeMs)[0];
  return pick ? { name: pick.n, traits: readJson(pick.f) } : null;
}

/** The App Store scan, or with store "play" the imported Play market (falling back to the App Store one). */
export function loadMarket(ws, store = 'ios') { return (store === 'play' && readJson(path.join(ws, 'market', 'market-play.json'), null)) || readJson(path.join(ws, 'market', 'market.json'), null); }

/** Run the director; returns the plan with direction A applied (and writes B, C as variants when `write`). */
export function pickDesign({ ws, plan, profile, niche, write = false, quiet = false, noReference = false }) {
  const market = loadMarket(ws);
  const ref = noReference ? null : activeReference(ws, plan);
  const res = directions({ plan, profile, niche, market, reference: ref?.traits, learning: loadLearning() });
  const [A, ...rest] = res.directions;
  const out = applyDirection(plan, A, { reference: ref?.traits });
  if (ref) out.design = { ...out.design, reference: ref.name };
  if (write) {
    const vdir = ensureDir(path.join(ws, 'variants'));
    for (const d of rest) {
      const v = applyDirection(plan, d, { reference: ref?.traits });
      writeJson(path.join(vdir, `dir-${d.key}.json`), { ...v, workspace: '..', variant: { name: `dir-${d.key}`, changes: [`direction ${d.key.toUpperCase()}: theme ${d.theme}, opening ${d.opening}${d.panorama ? ', panorama' : ''}`], from: 'plan.json', createdAt: new Date().toISOString() } });
    }
  }
  if (!quiet) {
    log.info(`Design director${market ? ` · market: ${market.apps.length} apps` : ' · no market scan (node scripts/market.mjs scan)'}${ref ? ` · reference: ${ref.name}` : ''}`);
    for (const d of res.directions) console.log(`  ${d.key.toUpperCase()}  theme ${d.theme.padEnd(12)} opening ${d.opening.padEnd(7)}${d.panorama ? ' panorama' : '         '}  ${d.reasons.slice(0, 3).join(' · ')}`);
    if (write) log.info('A is in plan.json; B and C are variants/dir-b.json, dir-c.json — compare: node scripts/variants.mjs tournament');
  }
  return out;
}
