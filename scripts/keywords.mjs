#!/usr/bin/env node
// Keyword helper for the screenshot set and the store metadata around it.
//   node scripts/keywords.mjs seed                      candidates from profile + niche (review, then put the best in plan.keywords)
//   node scripts/keywords.mjs field [--locale tr] [--title "Pulse: Home Workouts"] [--subtitle "..."]
//                                                       build the App Store keyword field (100 BYTES, comma-separated)
//   node scripts/keywords.mjs coverage [--locale en-US] which plan keywords the captions actually say (shots 1–3 matter most)

import path from 'node:path';
import { parseArgs, findWorkspace, readJson, writeJson, list, L, die, log } from '../engine/lib/util.mjs';
import { nicheKeywords } from '../engine/lib/niches.mjs';
import { coverage, STOP, BRANDS } from '../engine/lib/copyrules.mjs';

const args = parseArgs();
const cmd = args._[0] || 'seed';
const ws = findWorkspace(args);
const plan = readJson(path.join(ws, 'plan.json'), {});
const profile = readJson(path.join(ws, 'profile.json'), {});
const locale = args.locale || plan.defaultLocale || plan.locales?.[0] || 'en-US';

const bytes = (s) => Buffer.byteLength(s, 'utf8');
const norm = (w, loc) => {
  w = w.toLocaleLowerCase(loc).trim();
  if (loc.startsWith('en')) w = w.replace(/(ies)$/, 'y').replace(/([^s])s$/, '$1');
  if (loc === 'tr') w = w.replace(/(lar|ler|ları|leri)$/, '');
  return w;
};

if (cmd === 'seed') {
  const niche = profile.niche?.chosen;
  const nk = niche ? nicheKeywords(niche) : { en: [], tr: [] };
  const feats = (profile.features || []).filter((f) => f.confidence !== 'low').map((f) => f.label.toLowerCase());
  const screens = (profile.screens?.marketing || []).slice(0, 10).map((s) => s.name.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase());
  const store = [profile.store?.title, profile.store?.subtitle, profile.store?.keywords].filter(Boolean).join(',').toLowerCase().split(/[,|:–-]/).map((s) => s.trim()).filter((s) => s.length > 2);
  const seed = { niche, fromNiche: nk, fromFeatures: feats, fromScreens: screens, fromExistingStoreText: [...new Set(store)] };
  writeJson(path.join(ws, 'review', 'keyword-seed.json'), seed);
  console.log(`\nNiche: ${niche || '—'}`);
  console.log(`  niche phrases (en): ${nk.en.slice(0, 30).join(', ') || '—'}`);
  console.log(`  niche phrases (tr): ${nk.tr.slice(0, 20).join(', ') || '—'}`);
  console.log(`  features: ${feats.join(', ') || '—'}`);
  console.log(`  screens: ${screens.join(', ') || '—'}`);
  console.log(`  existing store text: ${seed.fromExistingStoreText.join(', ') || '—'}`);
  log.info('Pick 5–8 per locale by intent + relevance (skills/aso/keywords.md) and save them as plan.keywords = { "en-US": [...], "tr": [...] }');
  process.exit(0);
}

const kws = list(args.keywords).length ? list(args.keywords) : (Array.isArray(plan.keywords) ? plan.keywords : plan.keywords?.[locale]) || [];

if (cmd === 'coverage') {
  if (!kws.length) die(`No keywords for ${locale}. Add plan.keywords["${locale}"] or pass --keywords a,b,c`);
  const cov = coverage(plan, kws, locale);
  for (const c of cov) console.log(`  ${c.inFirst3 ? '✓' : c.shots.length ? '·' : '✗'} ${c.keyword.padEnd(28)} ${c.shots.length ? 'shots ' + c.shots.join(',') : 'not in any caption'}`);
  const first3 = cov.filter((c) => c.inFirst3).length;
  log.info(`${first3}/${cov.length} keywords appear in shots 1–3. Put the top 2–3 search terms there, naturally.`);
  process.exit(0);
}

if (cmd === 'field') {
  const title = args.title ?? L(plan.app?.title, locale) ?? profile.store?.title ?? '';
  const subtitle = args.subtitle ?? L(plan.app?.subtitle, locale) ?? profile.store?.subtitle ?? '';
  const pool = [...kws, ...list(args.extra)];
  if (!pool.length) die('No keywords to build from. Add plan.keywords or --keywords.');
  const used = new Set(`${title} ${subtitle}`.toLocaleLowerCase(locale).split(/[^\p{L}\p{N}]+/u).filter(Boolean).map((w) => norm(w, locale)));
  const brands = new Set(BRANDS);
  const seen = new Set();
  const dropped = [];
  const terms = [];
  // Apple matches single words and combines them, so split phrases into words, keep order of priority.
  for (const phrase of pool) {
    for (const raw of phrase.toLocaleLowerCase(locale).split(/[\s,]+/)) {
      const w = raw.trim();
      const n = norm(w, locale);
      if (!w || STOP.has(w)) { if (w) dropped.push(`${w} (stop word)`); continue; }
      if (used.has(n)) { dropped.push(`${w} (already in title/subtitle)`); continue; }
      if (brands.has(w)) { dropped.push(`${w} (trademark)`); continue; }
      if (seen.has(n)) continue;
      seen.add(n);
      terms.push(w);
    }
  }
  let field = '';
  for (const t of terms) {
    const next = field ? `${field},${t}` : t;
    if (bytes(next) > 100) { dropped.push(`${t} (no room)`); continue; }
    field = next;
  }
  console.log(`\nTitle     ${title || '—'}  (${[...title].length}/30)`);
  console.log(`Subtitle  ${subtitle || '—'}  (${[...subtitle].length}/30)`);
  console.log(`Keywords  ${field}`);
  console.log(`          ${bytes(field)}/100 bytes${bytes(field) !== [...field].length ? ` (${[...field].length} chars — non-ASCII letters count double)` : ''}`);
  if (dropped.length) console.log(`Dropped   ${dropped.join(', ')}`);
  log.info('No spaces after commas, no plurals of words you already have, no competitor names, no category name.');
  process.exit(0);
}

die(`Unknown command ${cmd}. Use seed | field | coverage`);
