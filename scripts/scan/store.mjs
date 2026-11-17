// Existing store metadata (fastlane deliver/supply folders, metadata/*.txt) and old screenshots.
import fs from 'node:fs';
import path from 'node:path';
import { readPngInfo } from '../../engine/lib/png.mjs';

export function run(ctx) {
  const { root, files, read, rel, profile } = ctx;
  const store = { ios: {}, android: {}, locales: [], screenshots: [] };
  const txt = (p) => { try { return fs.readFileSync(p, 'utf8').trim(); } catch { return undefined; } };
  for (const base of ['fastlane/metadata', 'metadata', 'ios/fastlane/metadata', 'android/fastlane/metadata']) {
    const dir = path.join(root, base);
    if (!fs.existsSync(dir)) continue;
    for (const loc of fs.readdirSync(dir)) {
      const ld = path.join(dir, loc);
      if (!fs.statSync(ld).isDirectory()) continue;
      if (loc === 'android') {
        for (const al of fs.readdirSync(ld)) {
          const ad = path.join(ld, al);
          if (!fs.statSync(ad).isDirectory()) continue;
          store.android[al] = { title: txt(path.join(ad, 'title.txt')), short: txt(path.join(ad, 'short_description.txt')), full: txt(path.join(ad, 'full_description.txt'))?.slice(0, 1500) };
        }
        continue;
      }
      const entry = { name: txt(path.join(ld, 'name.txt')), subtitle: txt(path.join(ld, 'subtitle.txt')), keywords: txt(path.join(ld, 'keywords.txt')), promo: txt(path.join(ld, 'promotional_text.txt')), description: txt(path.join(ld, 'description.txt'))?.slice(0, 1500) };
      if (Object.values(entry).some(Boolean)) { store.ios[loc] = entry; store.locales.push(loc); }
    }
  }
  const shotFiles = files.filter((f) => /\.(png|jpe?g)$/i.test(f) && /(screenshots?|store|appstore|playstore|marketing)\//i.test(rel(f)) && !/(^|\/)\.?appshot\//.test(rel(f)));
  for (const f of shotFiles.slice(0, 60)) {
    try { const i = readPngInfo(f); if (i.height > 1000) store.screenshots.push({ file: rel(f), width: i.width, height: i.height }); } catch {}
  }
  const first = Object.values(store.ios)[0] || {};
  const firstA = Object.values(store.android)[0] || {};
  profile.store = {
    title: first.name || firstA.title, subtitle: first.subtitle, keywords: first.keywords, promo: first.promo,
    description: first.description || firstA.full, shortDescription: firstA.short,
    locales: store.locales, androidLocales: Object.keys(store.android), byLocale: store.ios, android: store.android,
    existingScreenshots: store.screenshots,
  };
}
