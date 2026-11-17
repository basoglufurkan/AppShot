#!/usr/bin/env node
// Create, validate and inspect plan.json.
//   node scripts/plan.mjs init [--theme midnight | --no-director] [--count 7] [--locales en-US,tr] [--sizes iphone-6.9,android-phone] [--panorama] [--force]
//   node scripts/plan.mjs validate
//   node scripts/plan.mjs show
// init drafts the STRUCTURE (story order, layouts, screens, sizes, locales, keywords) from profile.json + the niche;
// captions are left empty on purpose — the agent writes them (skills/copy/*), then copy-check enforces quality.

import path from 'node:path';
import fs from 'node:fs';
import { parseArgs, findWorkspace, readJson, writeJson, exists, list, slug, ENGINE_DIR, die, log, L } from '../engine/lib/util.mjs';
import { loadNiche, nicheStory, nicheKeywords } from '../engine/lib/niches.mjs';
import { validatePlan } from '../engine/schema.mjs';
import { contrast } from '../engine/lib/color.mjs';
import { loadTheme } from '../engine/compose.mjs';

const args = parseArgs();
const cmd = args._[0] || 'show';
const ws = findWorkspace(args);
const planFile = args.plan ? path.resolve(args.plan) : path.join(ws, 'plan.json');
const SIZES = readJson(path.join(ENGINE_DIR, 'sizes.json'));
const LOCALES = readJson(path.join(ENGINE_DIR, 'locales.json')).locales;

const DEFAULT_STORY = [
  { title: 'Hook', layout: 'hero-device' }, { title: 'Core value', layout: 'floating-cards' }, { title: 'Key feature', layout: 'zoom-callout' },
  { title: 'Second feature', layout: 'tilted-device' }, { title: 'Differentiator', layout: 'duo-devices' }, { title: 'Habit / reminder', layout: 'notification-stack' },
  { title: 'Everything else', layout: 'feature-list' }, { title: 'Close', layout: 'text-hero' },
];

function mapLocale(l) {
  if (LOCALES[l]) return l;
  const base = l.split(/[-_]/)[0];
  const exact = Object.keys(LOCALES).find((k) => k.toLowerCase() === l.toLowerCase().replace('_', '-'));
  if (exact) return exact;
  return { en: 'en-US', de: 'de-DE', fr: 'fr-FR', es: 'es-ES', pt: 'pt-BR', nl: 'nl-NL', zh: 'zh-Hans', ar: 'ar-SA', iw: 'he' }[base] || (LOCALES[base] ? base : null);
}

if (cmd === 'init') {
  if (exists(planFile) && !args.force) die(`${planFile} exists. Use --force to overwrite (or edit it).`);
  const profile = readJson(path.join(ws, 'profile.json'), null) || die('Run node scripts/scan.mjs <project> first.');
  const nicheId = args.niche || profile.niche?.chosen;
  const niche = nicheId ? loadNiche(nicheId) : null;
  const story = (nicheId && nicheStory(nicheId).length ? nicheStory(nicheId) : DEFAULT_STORY);
  const count = Math.min(10, Number(args.count) || niche?.data?.shots || story.length || 7);
  const theme = args.theme || niche?.data?.themes?.[0] || (profile.colors?.appearance === 'dark' ? 'midnight' : 'clean-light');

  const stores = profile.platform?.stores?.length ? profile.platform.stores : ['ios'];
  const sizes = list(args.sizes).length ? list(args.sizes) : [
    ...(stores.includes('ios') ? SIZES.defaults.ios : []),
    ...(stores.includes('ios') && profile.app?.supportsIPad ? SIZES.defaults.ipad : []),
    ...(stores.includes('android') ? SIZES.defaults.android : []),
  ];
  const detected = (profile.strings?.locales || []).map(mapLocale).filter(Boolean);
  const locales = list(args.locales).length ? list(args.locales) : [...new Set(['en-US', ...detected])].slice(0, 4);

  // Match story steps to screens: captured images in raw/ first, otherwise the scanner's ranked screen names.
  const rawDir = path.join(ws, 'raw');
  const rawFiles = exists(rawDir) ? fs.readdirSync(rawDir).filter((f) => /\.(png|jpe?g)$/i.test(f) && !/^icon\./.test(f)) : [];
  const ranked = (profile.screens?.marketing || []).filter((s) => s.role !== 'onboarding');
  const pool = rawFiles.length
    ? rawFiles.map((f) => {
        const base = f.replace(/\.\w+$/, '');
        const match = ranked.find((s) => slug(s.name) === base || base.includes(slug(s.name)) || slug(s.name).includes(base));
        return { name: base, file: `raw/${f}`, score: match ? match.score + 1 : 1 };
      }).sort((a, b) => b.score - a.score)
    : ranked.map((s) => ({ name: s.name, file: `raw/${slug(s.name)}.png`, score: s.score }));
  const uses = new Map();
  const pick = (hint) => {
    if (!pool.length) return null;
    const words = [...new Set(String(hint || '').toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3))];
    let best = null, bestScore = -Infinity;
    for (const s of pool) {
      const n = s.name.toLowerCase();
      const sc = words.reduce((a, w) => a + (n.includes(w) || w.includes(n) ? 3 : 0), 0) + s.score * 0.1 - (uses.get(s.file) || 0) * 4;
      if (sc > bestScore) { best = s; bestScore = sc; }
    }
    uses.set(best.file, (uses.get(best.file) || 0) + 1);
    return best.file;
  };
  const empty = () => Object.fromEntries(locales.map((l) => [l, '']));
  const shots = story.slice(0, count).map((st, i) => {
    const needs2 = ['duo-devices', 'before-after', 'screen-grid'].includes(st.layout);
    const needs3 = st.layout === 'trio-fan';
    const shot = { id: slug(st.title) || `shot-${i + 1}`, layout: st.layout, note: st.text || st.title, headline: empty(), subhead: empty() };
    if (st.layout === 'text-hero' || st.layout === 'comparison' || st.layout === 'review-quote') { /* no screen needed */ }
    else if (needs2 || needs3) shot.screens = Array.from({ length: needs3 ? 3 : 2 }, () => pick(`${st.title} ${st.screen || ""} ${st.text || ""}`)).filter(Boolean);
    else shot.screen = pick(`${st.title} ${st.screen || ""} ${st.text || ""}`);
    if (!shot.screen && !shot.screens) delete shot.screen;
    if (['social-proof', 'review-quote'].includes(st.layout)) shot.skipOn = ['android'];
    return shot;
  });

  const kw = nicheId ? nicheKeywords(nicheId) : { en: [], tr: [] };
  const keywords = {};
  for (const l of locales) keywords[l] = (l === 'tr' ? kw.tr : l.startsWith('en') ? kw.en : []).slice(0, 8);

  const plan = {
    $schema: 'appshot/plan@1',
    app: { name: profile.app?.name || 'App', ...(exists(path.join(ws, 'raw', 'icon.png')) ? { icon: 'raw/icon.png' } : {}) },
    niche: nicheId || null,
    theme,
    themeOverrides: {},
    brand: profile.colors?.primary ? { primary: profile.colors.primary, secondary: profile.colors.secondary || undefined } : undefined,
    panorama: !!args.panorama,
    sizes, locales, defaultLocale: locales[0],
    keywords,
    storeOverrides: { android: { theme: { device: { frame: 'flat' } } } },
    shots,
  };
  // Use the brand colour as accent when it reads well on the theme background.
  try {
    const t = loadTheme(theme);
    const bg = typeof t.bg === 'string' ? t.bg : t.bg.color || t.bg.base || t.bg.colors?.[0];
    if (plan.brand?.primary && bg && contrast(plan.brand.primary, bg) >= 3 && !['brutal', 'mono', 'sky', 'volt'].includes(theme)) plan.themeOverrides.accent = plan.brand.primary;
  } catch {}
  // The design director picks THIS app's look (niche + brand + market + reference + a per-app seed) unless --theme
  // was given; directions B and C are saved as variants for the tournament / a PPO test.
  let final = plan;
  if (!args.theme && args.director !== false && !args.noDirector) {
    const { pickDesign } = await import('../engine/lib/designer-io.mjs');
    final = pickDesign({ ws, plan, profile, niche: niche?.data, write: true });
  }
  writeJson(planFile, final);
  log.ok(`plan.json drafted: ${shots.length} shots · theme ${final.theme}${final.panorama ? ' · panorama' : ''} · ${sizes.join(', ')} · ${locales.join(', ')}`);
  for (const s of final.shots) console.log(`  ${s.id.padEnd(20)} ${s.layout.padEnd(18)} ${s.screen || (s.screens || []).join(' + ') || '—'}`);
  log.info('Next: write the captions (skills/copy/hooks.md, formulas.md) into headline/subhead for every locale, then: node scripts/copy-check.mjs');
  process.exit(0);
}

if (!exists(planFile)) die(`No plan at ${planFile}. Run: node scripts/plan.mjs init`);
const plan = readJson(planFile);

if (cmd === 'validate') {
  const r = await validatePlan(plan, { workspace: path.dirname(planFile) });
  for (const e of r.errors) log.err(e);
  for (const w of r.warnings) log.warn(w);
  if (r.ok) log.ok(`plan.json is structurally valid (${plan.shots.length} shots, ${r.warnings.length} warning(s))`);
  process.exit(r.ok ? 0 : 1);
}

if (cmd === 'show') {
  const loc = args.locale || plan.defaultLocale || plan.locales?.[0];
  console.log(`\n${L(plan.app?.name, loc)} · theme ${typeof plan.theme === 'string' ? plan.theme : 'custom'}${plan.panorama ? ' · panorama' : ''} · ${(plan.sizes || []).join(', ')} · ${(plan.locales || []).join(', ')}\n`);
  plan.shots.forEach((s, i) => {
    const scr = s.screen ? (typeof s.screen === 'string' ? s.screen : Object.values(s.screen).join('|')) : (s.screens || []).join(' + ');
    const ok = scr && scr.split(/ \+ |\|/).every((p) => exists(path.resolve(ws, p)));
    console.log(`  ${String(i + 1).padStart(2)} ${(s.layout || 'hero-device').padEnd(18)} ${ok ? '✓' : '·'} ${(scr || '—').padEnd(28)} ${L(s.headline, loc) || '(no headline)'}`);
  });
  console.log('');
  process.exit(0);
}

die(`Unknown command ${cmd}. Use init | validate | show`);
