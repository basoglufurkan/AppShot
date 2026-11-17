// Google Play parity: the checks Play applies to screenshots, and store listing experiments from the design variants.
//   node scripts/play.mjs check [--draft]        tagline area ≤ 20 % of the image (from the render report's measured
//                                                 text boxes), ≥ 4 phone screenshots per language (large-format
//                                                 promotion), 9:16, device imagery, Play-banned words, the feature graphic
//   node scripts/play.mjs experiments [--variants dir-b,dir-c] [--locales en-US,tr]
//        render each variant's Play phone set and package it as out/play-experiments/<variant>/<playLocale>/ (→ export/)
//        with a README for Play Console → Store listing experiments (record the result: results.mjs add --store android)
// Competitors on Play: there is no public Play search API — save their screenshots into folders (one per app) and run
//   node scripts/market.mjs import <folder> --store play

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs, findWorkspace, readJson, exists, ensureDir, list, L, ENGINE_DIR, die, log } from '../engine/lib/util.mjs';
import { lintCaption } from '../engine/lib/copyrules.mjs';

const args = parseArgs();
const cmd = args._[0] || 'check';
const ws = findWorkspace(args);
const plan = readJson(path.join(ws, 'plan.json'), {});
const SZ = readJson(path.join(ENGINE_DIR, 'sizes.json'));
const LOC = readJson(path.join(ENGINE_DIR, 'locales.json')).locales;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const androidSizes = (plan.sizes || []).filter((s) => SZ.sizes.find((x) => x.id === s)?.store === 'android');

if (cmd === 'check') {
  const report = readJson(path.join(ws, 'review', args.draft ? 'draft-report.json' : 'render-report.json'), null);
  if (!report) die(`No ${args.draft ? 'draft' : 'render'} report — render first (node scripts/render.mjs${args.draft ? ' --draft' : ''}).`);
  let errors = 0, warns = 0;
  const E = (m) => { errors++; log.err(m); }, W = (m) => { warns++; log.warn(m); };
  const jobs = report.jobs.filter((j) => j.store === 'android');
  if (!jobs.length) W('No Play sizes rendered — add android-phone to plan.sizes.');
  for (const j of jobs) {
    const area = j.width * j.height;
    // Text boxes are in canvas px of a full-size render; drafts are scaled, the share is not.
    j.slots.forEach((s, i) => {
      const t = (s.text || []).reduce((a, x) => a + (x.rect ? x.rect.w * x.rect.h : 0), 0);
      const scale = j.canvas?.width ? j.canvas.width / j.width : 1;
      const share = t / (area * scale * scale);
      if (share > 0.2) W(`${j.size} · ${j.locale} · #${i + 1} ${s.shot}: text covers ${Math.round(share * 100)} % — Play: "taglines should not take up more than 20% of the image"`);
      if (i < 3 && ['text-hero', 'review-quote', 'social-proof', 'comparison'].includes(s.layout)) E(`${j.size} · ${j.locale} · #${i + 1}: ${s.layout} — Play wants real UI in the first three screenshots`);
      for (const tx of s.text || []) for (const iss of lintCaption(tx.headline || '', { locale: j.locale, store: 'android' }).issues) if (iss.level === 'error') E(`${j.size} · ${j.locale} · #${i + 1}: ${iss.msg}`);
    });
    if (j.size === 'android-phone' && j.slots.length < 4) W(`${j.locale}: ${j.slots.length} phone screenshots — Play's large-format promotion needs 4 or more`);
  }
  const frame = plan.storeOverrides?.android?.theme?.device?.frame;
  if (jobs.length && !['flat', 'none', 'android'].includes(frame)) W('Device frames on Play: Google advises against device imagery — set storeOverrides.android.theme.device.frame to "flat" (or use full-bleed).');
  const fg = path.join(ws, 'out', 'graphics');
  if (jobs.length && !(exists(fg) && fs.readdirSync(fg).some((f) => f.startsWith('play-feature')))) W('No feature graphic (1024×500) — node scripts/graphic.mjs --type play-feature');
  console.log(`\n${errors} error(s), ${warns} warning(s)`);
  process.exit(errors ? 1 : 0);
}

if (cmd === 'experiments') {
  const vdir = path.join(ws, 'variants');
  const variants = list(args.variants).length ? list(args.variants) : (exists(vdir) ? fs.readdirSync(vdir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).map((f) => f.replace(/\.json$/, '')) : []);
  if (!variants.length) die('No variants — make some (design.mjs directions --write, variants.mjs make …).');
  if (variants.length > 3) log.warn(`${variants.length} variants — Play runs up to 3 variants per experiment; package the best three (--variants a,b,c).`);
  const sizes = androidSizes.length ? androidSizes : ['android-phone'];
  const locales = list(args.locales).length ? list(args.locales) : plan.locales || ['en-US'];
  // out/ survives export.mjs (which rebuilds export/ and copies this folder into it).
  const out = path.join(ws, 'out', 'play-experiments');
  let n = 0;
  for (const v of variants) {
    const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'render.mjs'), '--workspace', ws, '--variant', v, '--sizes', sizes.join(','), '--locales', locales.join(',')], { encoding: 'utf8' });
    if (r.status !== 0) { log.err(`${v}: render failed — ${r.stderr.slice(-300)}`); continue; }
    for (const size of sizes) for (const loc of locales) {
      const src = path.join(ws, 'drafts', 'variants', v, size, loc);
      if (!exists(src)) continue;
      const type = SZ.sizes.find((s) => s.id === size)?.fastlane || 'phoneScreenshots';
      const dst = ensureDir(path.join(out, v, LOC[loc]?.play || loc, type));
      fs.readdirSync(src).filter((f) => f.endsWith('.png')).sort().forEach((f, i) => { fs.copyFileSync(path.join(src, f), path.join(dst, `${i + 1}_${f}`)); n++; });
    }
    log.ok(`${v}: ${sizes.join(', ')} × ${locales.join(', ')}`);
  }
  fs.writeFileSync(path.join(out, 'README.md'), `# Google Play store listing experiments

Generated by Appshot ${new Date().toISOString().slice(0, 10)} — ${variants.length} variant(s): ${variants.join(', ')}.

1. Play Console → Grow users → Store presence → Store listing experiments → Create experiment.
2. **Default graphics** experiment (all languages, one set of graphics) or **localized** experiment (up to 5 languages,
   one at a time per language). Choose "Screenshots" as the attribute to test.
3. Add up to 3 variants and upload each folder here: \`<variant>/<language>/phoneScreenshots/\`.
4. Audience: 50 % to the variants is common; run at least 7 days (a full weekly cycle) and until Play reports a result.
5. Read the result as Play shows it (better / worse / draw, with a range), then record it so the design director learns:
   \`node scripts/results.mjs add --store android --treatment <variant> --lift-range "<low>,<high>"\` → \`results.mjs learn\`.

Variants differ in theme, opening layout and panorama (see each variant's \`variant.changes\` in appshot/variants/).
`);
  log.ok(`${n} screenshots → out/play-experiments/ (README inside; export.mjs copies it to export/play-experiments/)`);
  process.exit(0);
}

die(`Unknown command ${cmd} (check | experiments)`);
