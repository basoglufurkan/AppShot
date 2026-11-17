#!/usr/bin/env node
// Package appshot/out for upload.
//   node scripts/export.mjs [--zip] [--no-check]
// Writes:
//   export/fastlane/screenshots/<appStoreLocale>/<NN>_<size>.png           → fastlane deliver
//   export/fastlane/metadata/android/<playLocale>/images/<type>/<N>.png     → fastlane supply
//   export/fastlane/metadata/<appStoreLocale>/name.txt, subtitle.txt, …      → fastlane deliver (from appshot/metadata/)
//   export/upload/<store>/<locale>/<size>/...                               → manual drag & drop
//   export/README.md (commands) and optional zips

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { parseArgs, findWorkspace, readJson, exists, ensureDir, ENGINE_DIR, die, log } from '../engine/lib/util.mjs';

const args = parseArgs();
const ws = findWorkspace(args);
const out = path.join(ws, 'out');
if (!exists(out)) die('Nothing rendered. Run node scripts/render.mjs');
if (!args.noCheck) {
  const r = spawnSync(process.execPath, [path.join(path.dirname(new URL(import.meta.url).pathname), 'check.mjs'), '--workspace', ws], { stdio: 'inherit' });
  if (r.status !== 0 && !args.force) die('check.mjs found blocking issues. Fix them (or pass --force to export anyway).');
}
const SZ = readJson(path.join(ENGINE_DIR, 'sizes.json'));
const LOC = readJson(path.join(ENGINE_DIR, 'locales.json')).locales;
const exp = path.join(ws, 'export');
fs.rmSync(exp, { recursive: true, force: true });
let count = 0;
// Finder drops .DS_Store files into folders it has shown: list only real sub-folders and visible files.
const dirs = (p) => fs.readdirSync(p).filter((d) => !d.startsWith('.') && fs.statSync(path.join(p, d)).isDirectory());
const files = (p) => fs.readdirSync(p).filter((f) => !f.startsWith('.') && fs.statSync(path.join(p, f)).isFile());
for (const size of dirs(out)) {
  const spec = SZ.sizes.find((s) => s.id === size);
  if (!spec) continue; // creative/ and graphics/ are handled below
  for (const locale of dirs(path.join(out, size))) {
    const dir = path.join(out, size, locale);
    const pngs = files(dir).filter((f) => f.endsWith('.png')).sort();
    const l = LOC[locale] || { appStore: locale, play: locale };
    pngs.forEach((f, i) => {
      const src = path.join(dir, f);
      const manual = ensureDir(path.join(exp, 'upload', spec.store, locale, size));
      fs.copyFileSync(src, path.join(manual, f));
      if (spec.store === 'ios') {
        const d = ensureDir(path.join(exp, 'fastlane', 'screenshots', l.appStore));
        fs.copyFileSync(src, path.join(d, `${String(i + 1).padStart(2, '0')}_${size}.png`));
      } else {
        const d = ensureDir(path.join(exp, 'fastlane', 'metadata', 'android', l.play, 'images', spec.fastlane));
        fs.copyFileSync(src, path.join(d, `${i + 1}_${l.play}.png`));
      }
      count++;
    });
  }
}
const cr = path.join(ws, 'out', 'creative');
if (exists(cr)) for (const locale of dirs(cr)) {
  const d = ensureDir(path.join(exp, 'upload', 'ios', locale, 'creative-assets'));
  for (const f of files(path.join(cr, locale))) { fs.copyFileSync(path.join(cr, locale, f), path.join(d, f)); count++; }
}
const pv = path.join(ws, 'out', 'preview');
if (exists(pv)) for (const locale of dirs(pv)) {
  const d = ensureDir(path.join(exp, 'upload', 'ios', locale, 'app-previews'));
  for (const f of fs.readdirSync(path.join(pv, locale)).filter((f) => !f.startsWith('.'))) {
    const src = path.join(pv, locale, f);
    if (fs.statSync(src).isFile()) { fs.copyFileSync(src, path.join(d, f)); count++; continue; }
    // variants/<name>/ → app-previews/variant-<name>/ (Product Page Optimization treatments)
    if (f === 'variants') for (const v of dirs(src)) {
      const vd = ensureDir(path.join(d, `variant-${v}`));
      for (const g of files(path.join(src, v))) { fs.copyFileSync(path.join(src, v, g), path.join(vd, g)); count++; }
    }
  }
}
const pr = path.join(ws, 'out', 'promo');
if (exists(pr)) for (const locale of dirs(pr)) {
  const d = ensureDir(path.join(exp, 'promo', locale));
  for (const f of files(path.join(pr, locale))) { fs.copyFileSync(path.join(pr, locale, f), path.join(d, f)); count++; }
}
// Play store listing experiments packaged by play.mjs.
const pe = path.join(ws, 'out', 'play-experiments');
if (exists(pe)) { fs.cpSync(pe, path.join(exp, 'play-experiments'), { recursive: true, filter: (src) => !path.basename(src).startsWith('.') }); count++; }
// In-App Events: out/events/<id>/<locale>/card|details → upload/ios/<locale>/events/<id>/.
const ev = path.join(ws, 'out', 'events');
if (exists(ev)) for (const id of dirs(ev)) for (const locale of dirs(path.join(ev, id))) {
  const d = ensureDir(path.join(exp, 'upload', 'ios', locale, 'events', id));
  for (const f of files(path.join(ev, id, locale))) { fs.copyFileSync(path.join(ev, id, locale, f), path.join(d, f)); count++; }
}
// Store text → fastlane deliver / supply metadata (next to the screenshots fastlane already gets).
{
  const { loadAll, writeFastlane } = await import('../engine/lib/metadata.mjs');
  const { all, shared } = loadAll(ws);
  if (Object.keys(all).length) count += writeFastlane(all, shared, path.join(exp, 'fastlane'));
}
const fg = path.join(ws, 'out', 'graphics');
if (exists(fg)) for (const f of fs.readdirSync(fg).filter((f) => f.startsWith('play-feature'))) {
  const loc = f.match(/play-feature\.(.+)\.png/)?.[1] || 'en-US';
  const d = ensureDir(path.join(exp, 'fastlane', 'metadata', 'android', (LOC[loc] || { play: loc }).play, 'images'));
  fs.copyFileSync(path.join(fg, f), path.join(d, 'featureGraphic.png'));
}
fs.writeFileSync(path.join(exp, 'README.md'), `# Upload

Generated by Appshot ${new Date().toISOString().slice(0, 10)} — ${count} screenshots.

## App Store (fastlane deliver)
\`\`\`bash
fastlane deliver --skip_binary_upload --skip_metadata --overwrite_screenshots --screenshots_path "${path.join(exp, 'fastlane', 'screenshots')}"
\`\`\`
deliver detects the device class from the pixel size. Or drag the files in \`upload/ios/<locale>/<size>/\` into App Store Connect → your version → Media Manager.

## Store text (fastlane deliver)
Written from \`appshot/metadata/<locale>.md\` when it exists (name, subtitle, promotional text, keywords, description,
What's New, URLs). Check it first: \`node scripts/metadata.mjs check\`.
\`\`\`bash
fastlane deliver --skip_binary_upload --skip_screenshots --metadata_path "${path.join(exp, 'fastlane', 'metadata')}"
\`\`\`
Or paste each field from \`appshot/metadata/<locale>.md\` into App Store Connect → your app → the version page and App Information.

## Google Play (fastlane supply)
\`\`\`bash
fastlane supply --skip_upload_apk --skip_upload_aab --skip_upload_metadata --skip_upload_changelogs --metadata_path "${path.join(exp, 'fastlane', 'metadata', 'android')}"
\`\`\`
Or upload \`upload/android/<locale>/<size>/\` in Play Console → Grow → Store presence → Main store listing.

## App Store creative assets (iOS 27+)
Upload \`upload/ios/<locale>/creative-assets/\` in App Store Connect → your app → Product Page → **Header and Search Results**
(header.png or header.mp4 → Header; search.png or search.mp4 → Search Results; universal.png works for both).
fastlane does not upload creative assets yet. They can be swapped on a live version and tested with Product Page Optimization.

## App previews (video before the screenshots)
Upload \`upload/ios/<locale>/app-previews/iphone.mp4\` in App Store Connect → your version → Previews and Screenshots →
the largest iPhone display (it scales down to the other Face ID iPhones), and \`ipad.mp4\` under iPad 13". Up to three
per size and language; processing can take up to 24 hours. Set the poster frame there (Appshot designs for Apple's
default, 5 s — \`*-poster.png\` shows it). fastlane does not upload app previews; Appshot does not either.

## In-App Events
Upload \`upload/ios/<locale>/events/<id>/card.*\` (event card, 16:9) and \`details.*\` (event details page, 9:16) in App Store
Connect → your app → In-App Events, with the text from \`appshot/events/<id>.json\` (\`node scripts/event.mjs check\`).

## Promo videos
\`promo/<locale>/vertical.mp4\` (Reels, TikTok, Shorts, ads), \`landscape.mp4\` (YouTube — paste the YouTube link as the
Google Play promo video) and \`square.mp4\`. They show device frames and brand motion, so they are not App Store previews.

Screenshots change only with a new app version on the App Store (except Product Page Optimization tests); on Play they update after review.
`);
if (args.zip) {
  for (const store of ['ios', 'android']) {
    const d = path.join(exp, 'upload', store);
    if (!exists(d)) continue;
    try { execFileSync('zip', ['-qr', path.join(exp, `${store}-screenshots.zip`), '.'], { cwd: d }); log.ok(`export/${store}-screenshots.zip`); } catch { log.warn('zip not available — skipped archives'); }
  }
}
log.ok(`${count} files → ${path.relative(process.cwd(), exp)} (see export/README.md)`);
