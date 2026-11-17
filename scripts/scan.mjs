#!/usr/bin/env node
// Scan an app project and write appshot/profile.json — everything the screenshot plan is built from.
//   node scripts/scan.mjs [project-dir] [--workspace <dir>] [--quiet]
// Read-only on the project (it only writes inside appshot/).

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, walk, writeJson, ensureDir, log, exists, workspaceFor, WORKSPACE_MARKER } from '../engine/lib/util.mjs';
import { classify } from './niche.mjs';
import * as platform from './scan/platform.mjs';
import * as ios from './scan/ios.mjs';
import * as android from './scan/android.mjs';
import * as expo from './scan/expo.mjs';
import * as flutter from './scan/flutter.mjs';
import * as web from './scan/web.mjs';
import * as store from './scan/store.mjs';
import * as readme from './scan/readme.mjs';
import * as icon from './scan/icon.mjs';
import * as colors from './scan/colors.mjs';
import * as fonts from './scan/fonts.mjs';
import * as strings from './scan/strings.mjs';
import * as screens from './scan/screens.mjs';
import * as features from './scan/features.mjs';

const args = parseArgs();
const root = path.resolve(args._[0] || process.cwd());
if (!exists(root)) { log.err(`No such folder: ${root}`); process.exit(1); }
const ws = args.workspace ? path.resolve(args.workspace) : workspaceFor(root);
ensureDir(path.join(ws, 'raw'));
if (!exists(path.join(ws, WORKSPACE_MARKER))) fs.writeFileSync(path.join(ws, WORKSPACE_MARKER), 'Appshot workspace\n');

const EXT = /\.(swift|m|mm|h|kt|kts|java|dart|tsx?|jsx?|mjs|cjs|vue|svelte|json|plist|pbxproj|entitlements|xml|gradle|yaml|yml|strings|xcstrings|arb|md|html|css|scss|png|ttf|otf|webmanifest)$/i;
const t0 = Date.now();
const files = walk(root, { filter: (f, name) => EXT.test(name) || name === 'Podfile', exclude: [ws] });
const cache = new Map();
const ctx = {
  root, ws, files, profile: null,
  rel: (f) => path.relative(root, f),
  read: (f) => {
    if (cache.has(f)) return cache.get(f);
    let s = '';
    try { const st = fs.statSync(f); if (st.size < 600_000 && !/\.(png|ttf|otf)$/i.test(f)) s = fs.readFileSync(f, 'utf8'); } catch {}
    cache.set(f, s);
    return s;
  },
};
const profile = ctx.profile = { version: 1, root, scannedAt: new Date().toISOString(), app: {} };

for (const [name, mod] of Object.entries({ platform, ios, android, expo, flutter, web, store, readme, icon, colors, fonts, strings, screens, features })) {
  try { await mod.run(ctx); } catch (e) { (profile.warnings ||= []).push(`${name}: ${e.message}`); }
}
profile.dependencies = (ctx.dependencyNames || []).slice(0, 120);
profile.app.name = profile.app.displayName || profile.store?.title || profile.app.npmName || path.basename(root);
profile.niche = { top: classify(profile), chosen: null };
profile.niche.chosen = profile.niche.top[0]?.id || null;
if (!profile.app.category && profile.niche.chosen) {
  const top = (await import('../engine/lib/niches.mjs')).loadNiche(profile.niche.chosen);
  if (top?.data?.appStoreCategory) { profile.app.category = top.data.appStoreCategory; profile.app.categoryInferred = true; }
}
profile.scanMs = Date.now() - t0;
writeJson(path.join(ws, 'profile.json'), profile);

if (!args.quiet) {
  const p = profile;
  console.log(`\n${p.app.name}  ·  ${p.platform.primary} (${p.platform.ui})  ·  ${p.platform.stores.join(' + ') || 'store unknown'}`);
  console.log(`  bundle      ${p.app.bundleId || '—'}   package ${p.app.packageName || '—'}   v${p.app.version || '?'}`);
  console.log(`  category    ${p.app.category || '—'}`);
  console.log(`  icon        ${p.icon ? `${p.icon.source} (${p.icon.size}px)` : 'not found'}`);
  console.log(`  colours     ${p.colors?.primary || '—'} / ${p.colors?.secondary || '—'} on ${p.colors?.background || '—'} (${p.colors?.appearance})`);
  console.log(`  locales     ${(p.strings?.locales || []).join(', ') || '—'}`);
  console.log(`  screens     ${p.screens?.total || 0} found → top: ${(p.screens?.marketing || []).slice(0, 8).map((s) => s.name).join(', ')}`);
  console.log(`  features    ${(p.features || []).filter((f) => f.confidence !== 'low').map((f) => f.id).join(', ') || '—'}`);
  console.log(`  store text  ${p.store?.title ? `"${p.store.title}" / "${p.store.subtitle || ''}"` : 'none in repo'} · old screenshots: ${p.store?.existingScreenshots?.length || 0}`);
  console.log(`  niche       ${p.niche.top.slice(0, 3).map((n) => `${n.id} (${n.score})`).join(', ') || '—'}`);
  if (p.warnings?.length) for (const w of p.warnings) log.warn(w);
  log.ok(`profile.json written (${files.length} files, ${p.scanMs} ms) → ${path.relative(process.cwd(), path.join(ws, 'profile.json'))}`);
}
