#!/usr/bin/env node
// Classify the scanned app into niches from skills/niches/*.md (frontmatter keywords, IDF-weighted).
//   node scripts/niche.mjs [--workspace appshot] [--top 5] [--explain]
// Also importable: classify(profile) → [{ id, name, score, matched }]

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, findWorkspace, readJson, writeJson, loadMarkdownDir, SKILLS_DIR, exists, die, log } from '../engine/lib/util.mjs';

const fold = (s) => String(s || '').toLocaleLowerCase('en').normalize('NFKD').replace(/[̀-ͯ]/g, '');
const split = (s) => String(s || '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_\-/.]/g, ' ');

export function corpus(profile) {
  const parts = [];
  const add = (text, w) => text && parts.push({ text: fold(split(text)), w });
  const a = profile.app || {};
  add([a.displayName, a.description, a.category, a.slug, a.npmName, a.bundleId].join(' '), 3);
  const st = profile.store || {};
  add([st.title, st.subtitle, st.keywords, st.description, st.shortDescription].join(' '), 3);
  add([profile.readme?.excerpt, ...(profile.readme?.headings || [])].join(' '), 2);
  add([...(profile.screens?.marketing || []), ...(profile.screens?.paywall || []), ...(profile.screens?.onboarding || [])].map((s) => s.name).join(' '), 2.2);
  add([...(profile.strings?.samples || []), ...(profile.strings?.paywall || []), ...(profile.strings?.onboarding || [])].join(' '), 1.4);
  add((a.permissions || []).map((p) => p.text).join(' '), 1.5);
  add((profile.features || []).map((f) => `${f.id} ${f.label}`).join(' '), 1);
  add((profile.dependencies || []).join(' '), 0.8);
  return parts;
}

export function classify(profile, { top = 5 } = {}) {
  const niches = loadMarkdownDir(path.join(SKILLS_DIR, 'niches')).filter((n) => Array.isArray(n.data.keywords));
  if (!niches.length) return [];
  const df = new Map();
  const normKw = (k) => fold(split(k)).replace(/\s+/g, ' ').trim();
  for (const n of niches) for (const k of new Set(n.data.keywords.map(normKw))) df.set(k, (df.get(k) || 0) + 1);
  const parts = corpus(profile);
  const counters = new Map();
  const countIn = (kw) => {
    if (counters.has(kw)) return counters.get(kw);
    const re = new RegExp(`(^|[^a-z0-9])${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(s|es)?($|[^a-z0-9])`, 'g');
    let total = 0;
    for (const p of parts) { const m = p.text.match(re); if (m) total += Math.log2(1 + m.length) * p.w; }
    counters.set(kw, total);
    return total;
  };
  const cat = fold(profile.app?.category);
  const scored = niches.map((n) => {
    const matched = [];
    let score = 0;
    for (const raw of n.data.keywords) {
      const kw = normKw(raw);
      const c = countIn(kw);
      if (!c) continue;
      const idf = Math.log(1 + niches.length / (df.get(kw) || 1));
      const len = kw.includes(' ') ? 1.4 : 1;
      score += c * idf * len;
      matched.push(raw);
    }
    if (cat && fold(n.data.appStoreCategory) === cat) score *= 1.25;
    score /= Math.sqrt(n.data.keywords.length / 30);
    return { id: n.id, name: n.data.name, score: Math.round(score * 10) / 10, matched: matched.slice(0, 12), themes: n.data.themes, layouts: n.data.layouts, shots: n.data.shots, file: path.relative(process.cwd(), n.file) };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
  const best = scored[0]?.score || 1;
  return scored.slice(0, top).map((x) => ({ ...x, confidence: Math.round((x.score / best) * 100) / 100 }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs();
  const ws = findWorkspace(args);
  const file = path.join(ws, 'profile.json');
  if (!exists(file)) die('No profile.json yet. Run: node scripts/scan.mjs <project>');
  const profile = readJson(file);
  const res = classify(profile, { top: Number(args.top) || 5 });
  if (!res.length) die('No niche matched (or skills/niches is empty). Pick one manually from skills/niches/.');
  profile.niche = { top: res, chosen: args.set || profile.niche?.chosen || res[0].id };
  writeJson(file, profile);
  console.log('\nNiche ranking');
  for (const r of res) console.log(`  ${r.id === profile.niche.chosen ? '▸' : ' '} ${r.id.padEnd(26)} ${String(r.score).padStart(6)}  ${args.explain ? r.matched.join(', ') : ''}`);
  log.info(`Chosen: ${profile.niche.chosen} → read ${path.join('skills/niches', profile.niche.chosen + '.md')}`);
  log.info('Override with: node scripts/niche.mjs --set <id>');
}
