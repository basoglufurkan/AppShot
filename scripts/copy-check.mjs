#!/usr/bin/env node
// Lint every caption in the plan against store policy and conversion rules, per locale and store.
//   node scripts/copy-check.mjs [--locale tr] [--store ios|android] [--strict]   (exit 1 on errors; --strict also on warnings)
//   node scripts/copy-check.mjs --text "Track **every** workout" --locale en-US   (lint one line)

import path from 'node:path';
import { parseArgs, findWorkspace, readJson, list, exists, die, log } from '../engine/lib/util.mjs';
import { lintCaption, lintPlan, coverage } from '../engine/lib/copyrules.mjs';
import { layouts } from '../engine/registry.mjs';

const args = parseArgs();
const icon = { error: '✗', warn: '!', info: '·' };

if (args.text) {
  const r = lintCaption(String(args.text), { locale: args.locale || 'en-US', store: args.store || 'ios', kind: args.kind || 'headline' });
  console.log(`${r.metrics.words} words · ${r.metrics.chars} chars`);
  for (const i of r.issues) console.log(`  ${icon[i.level]} ${i.code}: ${i.msg}`);
  if (!r.issues.length) log.ok('clean');
  process.exit(r.issues.some((i) => i.level === 'error') ? 1 : 0);
}

const ws = findWorkspace(args);
const planFile = args.plan ? path.resolve(args.plan) : path.join(ws, 'plan.json');
if (!exists(planFile)) die(`No plan at ${planFile}`);
const plan = readJson(planFile);
const profile = readJson(path.join(ws, 'profile.json'), {});
const meta = await layouts();
const locales = list(args.locale).length ? list(args.locale) : plan.locales || ['en-US'];
const stores = list(args.store).length ? list(args.store) : [...new Set((plan.sizes || ['iphone-6.9']).map((s) => (s.startsWith('android') ? 'android' : 'ios')))];

let errors = 0, warns = 0;
for (const store of stores) for (const locale of locales) {
  const r = lintPlan(plan, { locale, store, profile, layoutsMeta: meta });
  console.log(`\n${store} · ${locale}`);
  for (const s of r.shots) {
    const shown = s.issues.filter((i) => args.verbose || i.level !== 'info');
    const mark = s.issues.some((i) => i.level === 'error') ? '✗' : s.issues.some((i) => i.level === 'warn') ? '!' : '✓';
    console.log(`  ${mark} ${String(s.index + 1).padStart(2)} ${s.headline ? `"${s.headline}"` : '(no headline)'}`);
    for (const i of shown) console.log(`       ${icon[i.level]} ${i.field ? i.field + ' · ' : ''}${i.code}: ${i.msg}`);
    errors += s.issues.filter((i) => i.level === 'error').length;
    warns += s.issues.filter((i) => i.level === 'warn').length;
  }
  for (const i of r.set) { console.log(`  ${icon[i.level]} set · ${i.code}: ${i.msg}`); if (i.level === 'error') errors++; if (i.level === 'warn') warns++; }
  const kws = plan.keywords?.[locale] || (Array.isArray(plan.keywords) ? plan.keywords : null);
  if (kws?.length) {
    const cov = coverage(plan, kws, locale);
    const hit = cov.filter((c) => c.shots.length);
    console.log(`  · keywords in captions: ${hit.length}/${cov.length} (${cov.filter((c) => c.inFirst3).length} in shots 1–3)${cov.filter((c) => !c.shots.length).length ? ` · missing: ${cov.filter((c) => !c.shots.length).map((c) => c.keyword).join(', ')}` : ''}`);
  }
}
console.log(`\n${errors} error(s), ${warns} warning(s)${args.verbose ? '' : ' · --verbose shows taste notes'}`);
process.exit(errors || (args.strict && warns) ? 1 : 0);
