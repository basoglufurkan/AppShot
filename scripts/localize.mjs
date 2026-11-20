#!/usr/bin/env node
// Locale workflow: captions live in plan.json as { "<locale>": "text" } objects.
//   node scripts/localize.mjs status                       what is missing per locale
//   node scripts/localize.mjs add de-DE,fr-FR              add locales to the plan (empty strings to fill)
//   node scripts/localize.mjs sheet de-DE                  write appshot/i18n/de-DE.json: every string with its English source + length budget
//   node scripts/localize.mjs apply appshot/i18n/de-DE.json  merge a filled sheet back into plan.json
// Transcreate, do not translate: read skills/locales/<locale>.md first.

import path from 'node:path';
import { parseArgs, findWorkspace, readJson, writeJson, exists, list, ENGINE_DIR, die, log } from '../engine/lib/util.mjs';
import { plain } from '../engine/lib/html.mjs';

const args = parseArgs();
const cmd = args._[0] || 'status';
const ws = findWorkspace(args);
const planFile = path.join(ws, 'plan.json');
if (!exists(planFile)) die('No plan.json yet.');
const plan = readJson(planFile);
const LOC = readJson(path.join(ENGINE_DIR, 'locales.json')).locales;
const src = plan.defaultLocale || plan.locales?.[0] || 'en-US';

// Every localisable path in a shot.
const FIELDS = ['headline', 'subhead', 'eyebrow', 'labels'];
function* strings(p) {
  for (const [i, s] of p.shots.entries()) {
    for (const f of FIELDS) if (s[f] !== undefined) yield { path: `shots.${i}.${f}`, value: s[f], shot: s.id };
    for (const key of ['cards', 'notifications', 'messages', 'quotes', 'awards', 'chips']) {
      for (const [j, it] of (s[key] || []).entries()) {
        if (!it || typeof it !== 'object') continue;
        for (const [k, v] of Object.entries(it)) if (['title', 'value', 'trend', 'body', 'text', 'sub', 'time', 'app'].includes(k)) yield { path: `shots.${i}.${key}.${j}.${k}`, value: v, shot: s.id };
      }
    }
    if (s.bullets) yield { path: `shots.${i}.bullets`, value: s.bullets, shot: s.id };
    if (s.stat?.label) yield { path: `shots.${i}.stat.label`, value: s.stat.label, shot: s.id };
    if (s.stat?.value) yield { path: `shots.${i}.stat.value`, value: s.stat.value, shot: s.id };
    if (s.rating?.label) yield { path: `shots.${i}.rating.label`, value: s.rating.label, shot: s.id };
    if (s.compare) for (const side of ['left', 'right']) for (const k of ['title', 'items']) if (s.compare[side]?.[k]) yield { path: `shots.${i}.compare.${side}.${k}`, value: s.compare[side][k], shot: s.id };
  }
}
const get = (o, p) => p.split('.').reduce((a, k) => a?.[k], o);
const set = (o, p, v) => { const ks = p.split('.'); const last = ks.pop(); const t = ks.reduce((a, k) => a[k], o); t[last] = v; };
const isLocalized = (v) => v && typeof v === 'object' && !Array.isArray(v);

if (cmd === 'status') {
  for (const loc of plan.locales || [src]) {
    let missing = 0, total = 0;
    // Plain strings are shared by every locale (numbers, times, emoji) — only localised objects can be missing.
    for (const s of strings(plan)) { if (!isLocalized(s.value)) continue; total++; const v = s.value[loc]; if (v === undefined || v === '' || (Array.isArray(v) && !v.length)) missing++; }
    console.log(`  ${missing ? '·' : '✓'} ${loc.padEnd(8)} ${total - missing}/${total} strings${LOC[loc] ? '' : '  (unknown locale code)'}`);
  }
  process.exit(0);
}

if (cmd === 'add') {
  const add = list(args._[1]);
  if (!add.length) die('Which locales? e.g. node scripts/localize.mjs add de-DE,fr-FR');
  plan.locales = [...new Set([...(plan.locales || [src]), ...add])];
  for (const s of strings(plan)) {
    // Only text that is already per-locale gets new slots; shared plain values ("+18%", "8:00") stay shared.
    if (!isLocalized(s.value)) { if (/headline|subhead/.test(s.path) && s.value) set(plan, s.path, { [src]: s.value, ...Object.fromEntries(add.map((l) => [l, ''])) }); continue; }
    for (const l of add) if (s.value[l] === undefined) s.value[l] = Array.isArray(s.value[src]) ? [] : '';
  }
  for (const l of add) if (plan.keywords && !Array.isArray(plan.keywords)) plan.keywords[l] ||= [];
  writeJson(planFile, plan);
  log.ok(`Added ${add.join(', ')}. Fill them (node scripts/localize.mjs sheet ${add[0]}) after reading skills/locales/${add[0]}.md`);
  process.exit(0);
}

if (cmd === 'sheet') {
  const loc = args._[1] || die('Which locale?');
  const spec = LOC[loc] || {};
  const rows = [];
  for (const s of strings(plan)) {
    if (!isLocalized(s.value)) continue;
    const source = s.value[src];
    if (source === undefined || source === '') continue;
    const current = s.value[loc];
    const budget = /headline/.test(s.path) ? spec.maxHeadline : Math.round(plain(Array.isArray(source) ? source.join(' ') : source).length * (spec.expansion || 1.2));
    rows.push({ path: s.path, shot: s.shot, source, [loc]: current ?? (Array.isArray(source) ? [] : ''), maxChars: budget });
  }
  const out = path.join(ws, 'i18n', `${loc}.json`);
  writeJson(out, { locale: loc, sourceLocale: src, guide: `skills/locales/${loc}.md`, note: 'Keep **highlight** marks on the equivalent key word. Transcreate: same benefit, native phrasing, within maxChars.', rows });
  log.ok(`${path.relative(process.cwd(), out)} — ${rows.length} strings to write`);
  process.exit(0);
}

if (cmd === 'apply') {
  const file = path.resolve(args._[1] || die('Which sheet?'));
  const sheet = readJson(file);
  const loc = sheet.locale;
  let n = 0;
  for (const r of sheet.rows) {
    const v = r[loc];
    if (v === undefined || v === '' || (Array.isArray(v) && !v.length)) continue;
    const cur = get(plan, r.path);
    set(plan, r.path, isLocalized(cur) ? { ...cur, [loc]: v } : { [src]: cur, [loc]: v });
    n++;
  }
  if (!(plan.locales || []).includes(loc)) plan.locales = [...(plan.locales || [src]), loc];
  writeJson(planFile, plan);
  log.ok(`Applied ${n} ${loc} strings. Check them: node scripts/copy-check.mjs --locale ${loc}`);
  process.exit(0);
}

die(`Unknown command ${cmd}`);
