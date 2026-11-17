// Store text metadata, one Markdown file per locale in appshot/metadata/ (format: engine/lib/metadata.mjs):
// App Store name, subtitle, promotional text, keywords, description, What's New; Google Play title, short and full
// description; shared URLs, categories and copyright in metadata/_shared.md.
//   node scripts/metadata.mjs import <metadata.md | fastlane/metadata> [--force]   bring in what the app already has
//   node scripts/metadata.mjs init [--locales es-ES,de-DE] [--force]   a file per locale to write in, with the context:
//                                                    limits, the source text, plan keywords, the paid tier, and the
//                                                    app's own translations of the terms the source text uses
//   node scripts/metadata.mjs check [--locale es-ES] [--strict]       limits (bytes for keywords), Apple / Play rules,
//                                                    keyword hygiene, purchase disclosure, Terms of Use, typography
//   node scripts/metadata.mjs keywords --locale es-ES [--extra "a,b"] [--write]   pack the 100-byte keyword field
//   node scripts/metadata.mjs show                    every locale × field with its length
//   node scripts/metadata.mjs export                  → export/fastlane/metadata (deliver + supply); export.mjs does it too
// Write the text with skills/aso/metadata.md and skills/locales/<locale>.md: transcreate, never translate word by word.

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, findWorkspace, readJson, exists, ensureDir, list, L, die, log } from '../engine/lib/util.mjs';
import { LIMITS, LOCALES, FIELDS, parseFields, parseDocument, parseShared, readFastlane, toMarkdown, checkLocale, packKeywords, writeFastlane, loadAll, paidTierName } from '../engine/lib/metadata.mjs';
import { glossary } from '../engine/lib/glossary.mjs';
import { nicheKeywords } from '../engine/lib/niches.mjs';

const args = parseArgs();
const cmd = args._[0] || 'check';
const ws = findWorkspace(args);
const plan = readJson(path.join(ws, 'plan.json'), {});
const profile = readJson(path.join(ws, 'profile.json'), {});
const dir = ensureDir(path.join(ws, 'metadata'));
const appName = L(plan.app?.name, plan.defaultLocale) || profile.app?.name || 'App';
const paidName = paidTierName(profile);
const fileOf = (loc) => path.join(dir, `${loc}.md`);
const chars = (s) => [...(s || '')].length;
const bytes = (s) => Buffer.byteLength(s || '', 'utf8');

/** Replace (or append) one field's value in a locale file, keeping the rest of the file as written. */
function setField(text, key, value) {
  const labels = FIELDS.find(([k]) => k === key)[1];
  const lines = text.split('\n');
  const i = lines.findIndex((l) => { const m = l.match(/^\*\*([^*]+)\*\*/); return m && labels.some((x) => x.toLowerCase() === m[1].toLowerCase().replace(/\s*\(.*\)$/, '')); });
  const label = `**${labels[0]}**${key === 'keywords' ? ` (${bytes(value)}/100 bytes)` : ''}`;
  if (i < 0) return `${text.trimEnd()}\n\n${label}\n${value}\n`;
  let j = i + 1;
  while (j < lines.length && !/^\*\*[^*]+\*\*/.test(lines[j]) && !/^---\s*$/.test(lines[j]) && !/^#{1,3} /.test(lines[j])) j++;
  return [...lines.slice(0, i), label, value, '', ...lines.slice(j)].join('\n');
}

function mergeShared(found) {
  const f = path.join(dir, '_shared.md');
  const cur = exists(f) ? parseShared(fs.readFileSync(f, 'utf8')) : {};
  const next = { ...found, ...cur };
  const rows = [['Support URL', next.supportUrl], ['Privacy Policy URL', next.privacyUrl], ['Marketing URL', next.marketingUrl], ['Terms of Use', next.termsUrl],
    ['Primary category', next.primaryCategory], ['Secondary category', next.secondaryCategory], ['Copyright', next.copyright]];
  fs.writeFileSync(f, `# ${appName}: shared store fields\n\nThe same in every locale. "Terms of Use": the EULA link (Apple's standard EULA is\nhttps://www.apple.com/legal/internet-services/itunes/dev/stdeula/), needed for auto-renewable subscriptions.\n\n| Field | Value |\n| --- | --- |\n${rows.map(([k, v]) => `| ${k} | ${v || ''} |`).join('\n')}\n`);
}

if (cmd === 'import') {
  const src = args._[1] ? path.resolve(args._[1]) : null;
  if (!src || !exists(src)) die('import <metadata.md | fastlane/metadata folder>');
  let locales = {}, shared = {};
  if (fs.statSync(src).isDirectory()) locales = readFastlane(src);
  else ({ locales, shared } = parseDocument(fs.readFileSync(src, 'utf8')));
  if (locales._) { const loc = args.locale || plan.defaultLocale || 'en-US'; locales[loc] = locales._; delete locales._; }
  if (!Object.keys(locales).length) die(`No metadata found in ${src}`);
  for (const [loc, f] of Object.entries(locales)) {
    if (exists(fileOf(loc)) && !args.force) { log.warn(`metadata/${loc}.md exists — kept (--force to replace)`); continue; }
    fs.writeFileSync(fileOf(loc), toMarkdown(loc, f, { appName, intro: `Imported from ${path.relative(path.dirname(ws), src)}.` }));
    log.ok(`metadata/${loc}.md — ${Object.keys(f).join(', ')}`);
  }
  mergeShared(shared);
  log.info('Next: node scripts/metadata.mjs check');
  process.exit(0);
}

if (cmd === 'init') {
  const { all } = loadAll(ws);
  const want = list(args.locales).length ? list(args.locales) : plan.locales || [plan.defaultLocale || 'en-US'];
  const source = all[plan.defaultLocale] || all['en-US'] || Object.values(all)[0] || {};
  // The scanned project root; a relative or moved one (a copied workspace) falls back to the workspace's parent.
  const root = profile.root && path.isAbsolute(profile.root) && exists(profile.root) ? profile.root : path.dirname(ws);
  const fromScan = profile.store?.byLocale || {};
  for (const loc of want) {
    if (!LOCALES[loc]) log.warn(`${loc} is not in engine/locales.json — store codes may not map on export`);
    if (exists(fileOf(loc)) && !args.force) { log.info(`metadata/${loc}.md exists — kept`); continue; }
    const scanned = fromScan[LOCALES[loc]?.appStore || loc] || {};
    const f = { name: scanned.name || 'TODO', subtitle: scanned.subtitle || 'TODO', promo: scanned.promo || 'TODO', keywords: scanned.keywords || 'TODO', description: scanned.description || 'TODO', whatsNew: 'TODO' };
    // Google Play text when the plan ships Play screenshots: title 30, short description 80, full description 4000.
    if ((plan.sizes || []).some((x) => x.startsWith('android'))) {
      const pa = profile.store?.android?.[LOCALES[loc]?.play || loc] || {};
      Object.assign(f, { playTitle: pa.title || 'TODO', playShort: pa.short || 'TODO', playFull: pa.full || 'TODO' });
    }
    const kw = (Array.isArray(plan.keywords) ? plan.keywords : plan.keywords?.[loc]) || [];
    const terms = source.description && loc !== plan.defaultLocale ? glossary(root, [source.name, source.subtitle, source.promo, source.description].join('\n'), loc) : [];
    const intro = [
      `Write natively for this storefront (skills/locales/${loc}.md, skills/aso/metadata.md): transcreate, never word for word.`,
      `Limits: name ${LIMITS.ios.name}, subtitle ${LIMITS.ios.subtitle}, promotional text ${LIMITS.ios.promo}, keywords ${LIMITS.ios.keywords.bytes} BYTES, description ${LIMITS.ios.description}. Check with: node scripts/metadata.mjs check --locale ${loc}`,
      source.name ? `Source (${plan.defaultLocale || 'en-US'}): ${source.name} — ${source.subtitle || ''}` : '',
      kw.length ? `Plan keywords for ${loc}: ${kw.join(', ')} — the strongest go in the name and subtitle, the rest in the keyword field.` : '',
      profile.monetization?.subscriptions || profile.monetization?.iap ? `Paid tier: ${paidName || 'yes'} — say in the description what needs paying for (Apple 2.3.2)${profile.monetization.subscriptions ? ', and end it with the subscription terms and the Terms of Use (EULA) link (Apple 3.1.2)' : ''}.` : '',
      terms.length ? `The app's own ${loc} words for terms in the source text — use them:\n\n| Term | In the app (${loc}) |\n| --- | --- |\n${terms.map((t) => `| ${t.term} | ${t.translation} |`).join('\n')}` : '',
      'Everything above the first **Label** is notes; the store fields follow.',
    ].filter(Boolean).join('\n\n');
    fs.writeFileSync(fileOf(loc), toMarkdown(loc, f, { appName, intro }));
    log.ok(`metadata/${loc}.md${terms.length ? ` — ${terms.length} app terms in the glossary` : ''}${scanned.name ? ' — prefilled from the project\'s fastlane metadata' : ''}`);
  }
  if (!exists(path.join(dir, '_shared.md'))) mergeShared({ primaryCategory: profile.app?.category });
  log.info('Write every TODO, then: node scripts/metadata.mjs check');
  process.exit(0);
}

const { all, shared } = loadAll(ws);
const locales = list(args.locales || args.locale).length ? list(args.locales || args.locale) : Object.keys(all).sort();
if (!locales.length) die('No metadata yet: node scripts/metadata.mjs import <file> or metadata.mjs init');

if (cmd === 'show') {
  const cols = [['name', 30], ['subtitle', 30], ['promo', 170], ['keywords', 100], ['description', 4000], ['whatsNew', 4000], ['playShort', 80]];
  console.log(`${'locale'.padEnd(8)} ${cols.map(([k]) => k.padStart(12)).join('')}`);
  for (const loc of locales) {
    const f = all[loc] || {};
    console.log(`${loc.padEnd(8)} ${cols.map(([k, max]) => { const n = k === 'keywords' ? bytes(f[k]) : chars(f[k]); return (f[k] ? `${n}/${max}${n > max ? '!' : ''}` : '—').padStart(12); }).join('')}`);
    if (f.name) console.log(`${''.padEnd(9)}${f.name}${f.subtitle ? ` — ${f.subtitle}` : ''}`);
  }
  process.exit(0);
}

if (cmd === 'check') {
  let errors = 0, warns = 0;
  for (const loc of locales) {
    const f = all[loc];
    if (!f) { log.warn(`${loc}: no metadata/${loc}.md`); warns++; continue; }
    const issues = checkLocale(f, { locale: loc, profile, plan, shared, paidName });
    const e = issues.filter((i) => i.level === 'error'), w = issues.filter((i) => i.level === 'warn'), info = issues.filter((i) => i.level === 'info');
    errors += e.length; warns += w.length;
    const head = `${loc.padEnd(7)} name ${chars(f.name)}/30 · subtitle ${chars(f.subtitle)}/30 · promo ${chars(f.promo)}/170 · keywords ${bytes(f.keywords)}/100 B · description ${chars(f.description)}/4000`;
    (e.length ? log.err : w.length ? log.warn : log.ok)(head);
    for (const i of [...e, ...w, ...info]) console.log(`   ${i.level === 'error' ? '✗' : i.level === 'warn' ? '!' : '·'} ${i.field}: ${i.msg}`);
  }
  for (const loc of plan.locales || []) if (!all[loc]) { log.warn(`${loc} is in the plan but has no metadata — node scripts/metadata.mjs init --locales ${loc}`); warns++; }
  console.log(`\n${errors} error(s), ${warns} warning(s)`);
  process.exit(errors || (args.strict && warns) ? 1 : 0);
}

if (cmd === 'keywords') {
  const loc = args.locale || locales[0];
  const f = all[loc] || die(`No metadata/${loc}.md`);
  const lang = loc.split('-')[0];
  const nk = profile.niche?.chosen ? nicheKeywords(profile.niche.chosen) : {};
  const pool = [...list(args.extra), ...(f.keywords && !/todo/i.test(f.keywords) ? f.keywords.split(',') : []), ...((Array.isArray(plan.keywords) ? plan.keywords : plan.keywords?.[loc]) || []), ...(nk[lang] || [])];
  const r = packKeywords(pool, { locale: loc, name: f.name, subtitle: f.subtitle });
  console.log(`Name      ${f.name || '—'}\nSubtitle  ${f.subtitle || '—'}\nKeywords  ${r.field}\n          ${r.bytes}/100 bytes`);
  if (r.dropped.length) console.log(`Dropped   ${r.dropped.join(', ')}`);
  if (args.write) { fs.writeFileSync(fileOf(loc), setField(fs.readFileSync(fileOf(loc), 'utf8'), 'keywords', r.field)); log.ok(`metadata/${loc}.md — keyword field updated`); }
  else log.info('Order the candidates by importance first (--extra "most,important,first"); --write saves the field.');
  process.exit(0);
}

if (cmd === 'export') {
  const root = ensureDir(path.join(ws, 'export', 'fastlane'));
  const n = writeFastlane(Object.fromEntries(locales.map((l) => [l, all[l]]).filter(([, f]) => f)), shared, root);
  log.ok(`${n} files → export/fastlane/metadata (fastlane deliver --metadata_path export/fastlane/metadata)`);
  process.exit(0);
}

die(`Unknown command ${cmd} (import | init | check | keywords | show | export)`);
