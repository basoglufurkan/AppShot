// Market scan: what the top App Store apps for the same searches look like, so this app's set can fit the category
// (to be understood) and stand apart from it (to be tapped). Uses Apple's public iTunes Search API (no account, no
// key; nothing about the user is sent), downloads the first three iPhone screenshots of each app and measures them
// (engine/lib/visual.mjs).
//   node scripts/market.mjs scan [--terms "focus timer,pomodoro"] [--country us] [--limit 12] [--refresh] [--no-ocr]
//        (on macOS the competitors' captions are read with Vision OCR: the words the market leans on)
//   node scripts/market.mjs import <folder> --store play     competitors' saved Play screenshots (a folder per app)
//   node scripts/market.mjs show
// Output: appshot/market/market.json (apps, traits, summary), appshot/market/shots/<app>/1-3.jpg,
//         appshot/review/market.png (the board: every app's first three shots + the map + how to stand out).
// The design director (engine/lib/designer.mjs) reads market.json. Screenshots of other apps are for analysis only:
// never copy their layouts, mascots or wording (Apple 4.1) — the point is to look different.

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, findWorkspace, readJson, writeJson, exists, ensureDir, list, die, log, L } from '../engine/lib/util.mjs';
import { setTraits, describe, circularMean } from '../engine/lib/visual.mjs';
import { renderBoard, chip } from '../engine/lib/board.mjs';
import { esc } from '../engine/lib/html.mjs';
import { loadNiche } from '../engine/lib/niches.mjs';
import { ocr, captionOf, captionWords } from '../engine/lib/ocr.mjs';
import { plain } from '../engine/lib/html.mjs';

const args = parseArgs();
const cmd = args._[0] || 'scan';
const ws = findWorkspace(args);
const dir = ensureDir(path.join(ws, 'market'));
// App Store by default; --store play for competitors' Play screenshots brought in with `import` (no public Play API).
const store = ['play', 'android'].includes(args.store) ? 'play' : 'ios';
const file = path.join(dir, store === 'play' ? 'market-play.json' : 'market.json');
const plan = readJson(path.join(ws, 'plan.json'), {});
const profile = readJson(path.join(ws, 'profile.json'), {});

const COUNTRY = { 'en-US': 'us', 'en-GB': 'gb', 'pt-BR': 'br', 'es-MX': 'mx', 'es-ES': 'es', 'de-DE': 'de', 'fr-FR': 'fr', it: 'it', 'nl-NL': 'nl', ja: 'jp', ko: 'kr', 'zh-Hans': 'cn', 'zh-Hant': 'tw', 'ar-SA': 'sa', he: 'il', ru: 'ru', pl: 'pl', sv: 'se', id: 'id', hi: 'in', vi: 'vn', th: 'th' };

if (cmd === 'show') {
  if (!exists(file)) die('No market scan yet: node scripts/market.mjs scan');
  const m = readJson(file);
  console.log(`${m.apps.length} apps · ${m.country} · terms: ${m.terms.join(', ')} · ${m.scannedAt.slice(0, 10)}`);
  for (const line of m.summary.lines) console.log(`• ${line}`);
  process.exit(0);
}
if (!['scan', 'import'].includes(cmd)) die(`Unknown command ${cmd} (scan | import | show)`);

const locale = plan.defaultLocale || plan.locales?.[0] || 'en-US';
const country = String(args.country || COUNTRY[locale] || 'us').toLowerCase();
let terms = list(args.terms);
if (!terms.length) terms = (Array.isArray(plan.keywords) ? plan.keywords : L(plan.keywords, locale) || []).slice(0, 3);
if (!terms.length && profile.niche?.chosen) terms = (loadNiche(profile.niche.chosen)?.data?.keywords || []).slice(0, 3);
if (!terms.length && cmd === 'scan') die('No search terms: pass --terms "focus timer,pomodoro" (or put keywords in plan.json)');
const limit = Number(args.limit || 12);
const own = profile.app?.bundleId;
// Other apps' screenshots are for analysis only: keep them out of the app's repository.
{ const gi = path.join(ws, '.gitignore'), txt = exists(gi) ? fs.readFileSync(gi, 'utf8') : ''; if (!/^market\/shots\/?$/m.test(txt)) fs.writeFileSync(gi, `${txt}${txt && !txt.endsWith('\n') ? '\n' : ''}market/shots/\n`); }

const get = async (url) => {
  const r = await fetch(url, { headers: { 'User-Agent': 'Appshot market scan' } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r;
};

// Search every term, merge, rank by how many searches an app appears in, then by ratings.
const seen = new Map();
if (cmd === 'scan') for (const term of terms) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=software&country=${country}&limit=25`;
  let res;
  try { res = await (await get(url)).json(); } catch (e) { die(`App Store search failed (${e.message}). Check the connection, or use references instead.`); }
  res.results.forEach((a, rank) => {
    if (!a.screenshotUrls?.length || a.bundleId === own) return;
    const e = seen.get(a.trackId) || { id: a.trackId, name: a.trackName, bundleId: a.bundleId, seller: a.sellerName, genre: a.primaryGenreName, ratings: a.userRatingCount || 0, rating: a.averageUserRating || 0, url: a.trackViewUrl, shots: a.screenshotUrls.slice(0, 3), hits: 0, best: rank };
    e.hits++; e.best = Math.min(e.best, rank);
    seen.set(a.trackId, e);
  });
}
let apps = [...seen.values()].sort((a, b) => b.hits - a.hits || a.best - b.best || b.ratings - a.ratings).slice(0, limit);
if (cmd === 'import') {
  // Saved screenshots: a folder per app (its name is the app's name), or one folder of images for a single app.
  const src = path.resolve(args._[1] || die('import <folder of app folders> [--store play]'));
  if (!exists(src)) die(`Not found: ${src}`);
  const IMG = /\.(png|jpe?g|webp)$/i;
  const imgs = (d) => fs.readdirSync(d).filter((f) => IMG.test(f)).sort().slice(0, 3).map((f) => path.join(d, f));
  const subs = fs.readdirSync(src).filter((d) => !d.startsWith('.') && fs.statSync(path.join(src, d)).isDirectory());
  apps = (subs.length ? subs.map((d) => ({ name: d, files: imgs(path.join(src, d)) })) : [{ name: path.basename(src), files: imgs(src) }])
    .filter((a) => a.files.length).map((a, i) => ({ id: `import-${i + 1}`, name: a.name, genre: store === 'play' ? 'Google Play' : '', ratings: 0, rating: 0, files: a.files }));
  terms = terms.length ? terms : [path.basename(src)];
}
if (!apps.length) die(cmd === 'scan' ? 'No apps found for those terms.' : 'No screenshots in that folder.');
log.info(`${apps.length} apps ${cmd === 'scan' ? `for "${terms.join('", "')}" (${country}) — downloading first screenshots` : `imported (${store === 'play' ? 'Google Play' : 'App Store'})`}`);

for (const a of apps) {
  const d = ensureDir(path.join(dir, 'shots', String(a.id)));
  if (!a.shots) { try { a.traits = setTraits(a.files); } catch (e) { log.warn(`${a.name}: ${e.message}`); } continue; }
  a.files = [];
  for (const [k, u] of a.shots.entries()) {
    const f = path.join(d, `${k + 1}.jpg`);
    if (!exists(f) || args.refresh) {
      try { fs.writeFileSync(f, Buffer.from(await (await get(u)).arrayBuffer())); } catch (e) { log.warn(`${a.name}: ${e.message}`); continue; }
    }
    a.files.push(f);
  }
  try { a.traits = setTraits(a.files); } catch (e) { log.warn(`${a.name}: ${e.message}`); }
}
// Captions: what the competitors SAY (macOS Vision OCR, compiled once; skipped elsewhere or with --no-ocr).
let words = null;
if (!args.noOcr) {
  const files = apps.flatMap((a) => a.files || []);
  const res = files.length ? ocr(files) : null;
  if (res) {
    const byFile = new Map(res.map((r) => [r.file, captionOf(r)]));
    for (const a of apps) a.captions = (a.files || []).map((f) => byFile.get(f) || '');
    words = captionWords(apps.map((a) => a.captions || []), locale);
  } else log.info('Caption reading needs macOS (Vision via swiftc) — skipped.');
}
const measured = apps.filter((a) => a.traits);
const n = measured.length || 1;
const share = (pred) => Math.round((measured.filter(pred).length / n) * 100) / 100;
const hues = measured.map((a) => a.traits.accentHue).filter((h) => h !== null);
const summary = {
  darkShare: share((a) => a.traits.tone === 'dark'),
  fullBleedShare: share((a) => a.traits.fullBleedShare > 0.5),
  multiDevice: share((a) => a.traits.multiDevice > 0.4),
  panoramaShare: share((a) => a.traits.panorama),
  captionTop: share((a) => a.traits.captionAt === 'top'),
  backgrounds: Object.fromEntries(['flat', 'gradient', 'photo'].map((k) => [k, share((a) => a.traits.background === k)])),
  accentHue: hues.length ? circularMean(hues) : null,
  accents: measured.map((a) => a.traits.accents[0]).filter(Boolean),
};
const pct = (v) => `${Math.round(v * 100)} %`;
const hueName = (h) => (h == null ? '—' : ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'indigo', 'purple', 'pink', 'red'][Math.round(h / 40) % 9]);
summary.lines = [
  `${pct(summary.darkShare)} dark · ${pct(summary.fullBleedShare)} full-bleed · ${pct(summary.multiDevice)} several devices · ${pct(summary.panoramaShare)} panorama · ${pct(summary.captionTop)} caption on top`,
  `backgrounds: ${Object.entries(summary.backgrounds).map(([k, v]) => `${k} ${pct(v)}`).join(', ')} · accents lean ${hueName(summary.accentHue)}`,
  summary.darkShare >= 0.65 ? 'Most of the market is dark — a light set (or a bright brand colour) stands out in search.' : summary.darkShare <= 0.35 ? 'Most of the market is light — a dark set stands out in search.' : 'Light and dark are mixed — stand out by colour and structure instead.',
  summary.panoramaShare < 0.25 ? 'Few use a panorama — one continuous background across the first three shots reads as one story and is rare here.' : 'Panoramas are common here — a clean single-shot rhythm can stand out.',
  summary.fullBleedShare < 0.3 ? 'Few show the screen full-bleed — a full-bleed opening is a distinct choice when the UI is visual.' : 'Full-bleed is common — device framing or a big number opening differs.',
];
if (words) {
  summary.words = words.filter((w) => w.apps >= 2).slice(0, 15);
  const top = summary.words.slice(0, 8).map((w) => `${w.word} (${w.apps})`).join(', ');
  if (top) summary.lines.push(`Competitor captions lean on: ${top} — words every set uses stop telling yours apart.`);
  // Our own first three captions against them.
  const ours = (plan.shots || []).slice(0, 3).map((s) => plain(L(s.headline, locale) || '')).join(' ');
  const shared = summary.words.filter((w) => w.apps >= Math.max(2, Math.ceil(measured.length * 0.3)) && new RegExp(`(^|[^\\p{L}])${w.word.slice(0, Math.max(4, w.word.length - 2))}`, 'iu').test(ours));
  if (shared.length) summary.lines.push(`Your first three captions share ${shared.map((w) => `"${w.word}"`).join(', ')} with ${shared.map((w) => w.apps).join(' / ')} of ${measured.length} competitors — say the same promise in words they don't use, or lead with what only you have.`);
}
writeJson(file, { scannedAt: new Date().toISOString(), store, country, terms, apps: apps.map(({ files, ...a }) => ({ ...a, files: (files || []).map((f) => path.relative(ws, f)) })), summary });
log.ok(`market/${path.basename(file)} — ${measured.length} apps measured`);
for (const l of summary.lines) console.log(`• ${l}`);

const rows = measured.map((a) => `<div class="row">${a.files.map((f) => `<img src="file://${esc(f)}">`).join('')}<div class="meta"><b>${esc(a.name)}</b><br>${esc(a.genre || '')}${a.ratings ? ` · ★ ${a.rating.toFixed(1)} (${a.ratings.toLocaleString('en-US')})` : ''}<br>${esc(describe(a.traits))}${a.captions?.some(Boolean) ? `<br><i>“${a.captions.filter(Boolean).map(esc).join('” · “')}”</i>` : ''}<br>${a.traits.bgColors.slice(0, 3).map(chip).join('')} ${a.traits.accents.slice(0, 3).map(chip).join('')}</div></div>`).join('');
const out = await renderBoard(`Market — "${terms.join('", "')}" · ${store === 'play' ? 'Google Play' : `App Store ${country.toUpperCase()}`}`, `<p class="sub">First three screenshots of the top ${measured.length} apps for the same searches — what a searcher sees around this app.</p><ul class="box">${summary.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>${rows}`, path.join(ws, 'review', store === 'play' ? 'market-play.png' : 'market.png'));
log.ok(path.relative(process.cwd(), out));
log.info('Next: node scripts/design.mjs directions — the director now weighs the market.');
