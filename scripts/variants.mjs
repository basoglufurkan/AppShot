#!/usr/bin/env node
// Explore alternatives and let the numbers + your eyes pick the winner.
//   node scripts/variants.mjs make --themes midnight,aurora,clean-light    one variant per theme
//   node scripts/variants.mjs make --hooks                                 one variant per shots[i].alternatives entry
//   node scripts/variants.mjs make --layouts hero-device,floating-cards    alternative opening layouts
//   node scripts/variants.mjs make --auto 4                                mix niche themes × hook alternatives
//   node scripts/variants.mjs tournament [--size iphone-6.9] [--locale en-US]   draft-render + score base and all variants, rank them
//   node scripts/variants.mjs adopt <name>                                 make a variant the main plan (old one kept as variants/_previous.json)
//   node scripts/variants.mjs list | clear
// Variants double as Apple Product Page Optimization treatments (up to 3) and Play store listing experiments.

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, findWorkspace, readJson, writeJson, exists, list, ensureDir, L, die, log } from '../engine/lib/util.mjs';
import { loadPlan, renderPlan } from '../engine/render.mjs';
import { Browser } from '../engine/lib/cdp.mjs';
import { scoreSet } from './score.mjs';
import { loadNiche } from '../engine/lib/niches.mjs';
import { setTraits } from '../engine/lib/visual.mjs';
import { distinctiveness, referenceMatch } from '../engine/lib/designer.mjs';
import { activeReference } from '../engine/lib/designer-io.mjs';

const args = parseArgs();
const cmd = args._[0] || 'list';
const ws = findWorkspace(args);
const vdir = ensureDir(path.join(ws, 'variants'));
const planFile = path.join(ws, 'plan.json');
if (!exists(planFile)) die('No plan.json yet.');
const base = readJson(planFile);
const clone = (x) => JSON.parse(JSON.stringify(x));
const market = readJson(path.join(ws, 'market', 'market.json'), null);
const save = (name, plan, changes) => {
  const v = { ...clone(plan), workspace: '..', variant: { name, changes, from: 'plan.json', createdAt: new Date().toISOString() } };
  writeJson(path.join(vdir, `${name}.json`), v);
  log.ok(`variants/${name}.json — ${changes.join('; ')}`);
};

if (cmd === 'make') {
  let made = 0;
  for (const t of list(args.themes)) { const p = clone(base); p.theme = t; p.themeOverrides = base.themeOverrides?.accent && !args.keepAccent ? { ...base.themeOverrides, accent: undefined } : base.themeOverrides; save(`theme-${t}`, p, [`theme → ${t}`]); made++; }
  if (args.hooks) {
    const maxAlt = Math.max(0, ...base.shots.map((s) => Math.max(0, ...Object.values(s.alternatives || {}).map((a) => (Array.isArray(a) ? a.length : 0)))));
    if (!maxAlt) log.warn('No shots[].alternatives found. Add e.g. "alternatives": { "en-US": ["Hook B", "Hook C"] } to shot 1.');
    for (let i = 0; i < maxAlt; i++) {
      const p = clone(base); const changes = [];
      p.shots.forEach((s, k) => {
        if (!s.alternatives) return;
        for (const [loc, alts] of Object.entries(s.alternatives)) if (alts[i]) { s.headline = typeof s.headline === 'object' ? { ...s.headline, [loc]: alts[i] } : { [loc]: alts[i] }; changes.push(`#${k + 1} ${loc}: "${alts[i]}"`); }
      });
      save(`hook-${String.fromCharCode(98 + i)}`, p, changes); made++;
    }
  }
  for (const l of list(args.layouts)) { const p = clone(base); p.shots[0].layout = l; save(`open-${l}`, p, [`shot 1 layout → ${l}`]); made++; }
  if (args.auto) {
    const n = Number(args.auto) || 3;
    const niche = base.niche ? loadNiche(base.niche) : null;
    const themes = [...new Set([...(niche?.data?.themes || []), 'midnight', 'clean-light', 'aurora'])].filter((t) => t !== base.theme);
    for (let i = 0; i < n; i++) {
      const p = clone(base); const changes = [];
      if (themes[i]) { p.theme = themes[i]; if (p.themeOverrides) delete p.themeOverrides.accent; changes.push(`theme → ${themes[i]}`); }
      p.shots.forEach((s, k) => { for (const [loc, alts] of Object.entries(s.alternatives || {})) if (alts[i]) { s.headline = { ...(typeof s.headline === 'object' ? s.headline : {}), [loc]: alts[i] }; changes.push(`#${k + 1} ${loc} hook ${i + 2}`); } });
      if (i === n - 1 && !base.panorama && p.shots.length >= 5) { p.panorama = true; changes.push('panorama on'); }
      save(`auto-${String.fromCharCode(97 + i)}`, p, changes); made++;
    }
  }
  if (!made) die('Nothing to make. Pass --themes, --hooks, --layouts or --auto N.');
  log.info('Next: node scripts/variants.mjs tournament');
  process.exit(0);
}

if (cmd === 'list') {
  const files = fs.readdirSync(vdir).filter((f) => f.endsWith('.json') && !f.startsWith('_'));
  if (!files.length) log.info('No variants yet.');
  for (const f of files) { const v = readJson(path.join(vdir, f)); console.log(`  ${f.replace('.json', '').padEnd(24)} ${(v.variant?.changes || []).join('; ')}`); }
  process.exit(0);
}

if (cmd === 'clear') { for (const f of fs.readdirSync(vdir)) if (!f.startsWith('_')) fs.rmSync(path.join(vdir, f)); log.ok('Variants cleared'); process.exit(0); }

if (cmd === 'adopt') {
  const name = args._[1] || die('Which variant? node scripts/variants.mjs adopt <name>');
  const file = path.join(vdir, `${name}.json`);
  if (!exists(file)) die(`No variants/${name}.json`);
  writeJson(path.join(vdir, '_previous.json'), { ...base, workspace: '..' });
  const v = readJson(file);
  delete v.workspace; delete v.variant;
  writeJson(planFile, v);
  log.ok(`plan.json ← variants/${name}.json (previous plan saved as variants/_previous.json)`);
  process.exit(0);
}

if (cmd === 'tournament') {
  const size = args.size || base.sizes?.[0] || 'iphone-6.9';
  const locale = args.locale || base.defaultLocale || base.locales?.[0] || 'en-US';
  const profile = readJson(path.join(ws, 'profile.json'), {});
  const entries = [{ name: 'main', file: planFile }, ...fs.readdirSync(vdir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).map((f) => ({ name: f.replace('.json', ''), file: path.join(vdir, f) }))];
  const browser = await Browser.launch();
  const results = [];
  try {
    for (const e of entries) {
      const plan = loadPlan(e.file);
      const outDir = e.name === 'main' ? path.join(ws, 'drafts') : path.join(ws, 'drafts', 'variants', e.name);
      const reportFile = e.name === 'main' ? path.join(ws, 'review', 'draft-report.json') : path.join(ws, 'review', 'variants', e.name, 'draft-report.json');
      const report = await renderPlan({ plan, outDir, sizes: [size], locales: [locale], scale: 0.4, browser, reportFile, quiet: true });
      const sc = await scoreSet({ plan, report, profile, locale, size });
      // Beyond mechanics: how far the first three shots stand apart from the market (what a searcher sees around
      // them), and how close the set is to the user's reference. Both 0–10; they break near-ties in the ranking.
      let distinct = null, refMatch = null;
      try {
        const shotsDir = path.join(outDir, size, locale);
        const first3 = fs.readdirSync(shotsDir).filter((f) => f.endsWith('.png')).sort().slice(0, 3).map((f) => path.join(shotsDir, f));
        const ours = first3.length ? setTraits(first3) : null;
        distinct = distinctiveness(ours, market);
        const ref = activeReference(ws, plan);
        if (ref && (plan.design?.reference || e.name.startsWith('ref-'))) refMatch = referenceMatch(ours, ref.traits);
      } catch {}
      const rank = sc.total + (distinct ?? 0) * 0.6 + (refMatch ?? 0) * 0.6;
      results.push({ name: e.name, score: sc.total, distinct, refMatch, rank: Math.round(rank * 10) / 10, parts: sc.parts, verdict: sc.verdict, top: sc.fixes.slice(0, 3).map((f) => f.msg), dir: path.join(outDir, size, locale), theme: typeof plan.theme === 'string' ? plan.theme : 'custom', opening: plan.shots?.[0]?.layout });
      log.ok(`${e.name.padEnd(24)} ${sc.total}${distinct !== null ? ` · distinct ${distinct}` : ''}${refMatch !== null ? ` · reference ${refMatch}` : ''}`);
    }
  } finally {
    await browser.close();
  }
  results.sort((a, b) => b.rank - a.rank);
  writeJson(path.join(ws, 'review', 'tournament.json'), { size, locale, ranAt: new Date().toISOString(), results });
  console.log(`\nRanking (${size} · ${locale})`);
  results.forEach((r, i) => console.log(`  ${i + 1}. ${r.name.padEnd(24)} ${String(r.score).padStart(3)}${r.distinct !== null ? ` · distinct ${String(r.distinct).padStart(4)}` : ''}${r.refMatch !== null ? ` · ref ${r.refMatch}` : ''}  ${(r.theme || '').padEnd(12)} ${(r.opening || '').padEnd(15)} copy ${r.parts.copy} · legible ${r.parts.legibility} · contrast ${r.parts.contrast} · comp ${r.parts.composition} · story ${r.parts.story}`));
  if (!market) log.info('No market scan — distinctiveness not measured (node scripts/market.mjs scan).');
  log.info('Scores rank mechanics, not taste. Run node scripts/sheet.mjs --draft (and --variant <name>) and LOOK before adopting.');
  log.info(`Adopt the winner: node scripts/variants.mjs adopt ${results[0].name === 'main' ? '<name>' : results[0].name}`);
  process.exit(0);
}

die(`Unknown command ${cmd}`);
