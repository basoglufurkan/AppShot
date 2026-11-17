// In-App Events (App Store): the event card (16:9) and event details page (9:16) media, as images or seamless looping
// videos, plus the event's text checked against Apple's rules. Media follow Apple's guidance: no text or logos in the
// picture, no borders or gradients (the App Store adds its own), video loops — so the app's key-art scene carries it.
//   node scripts/event.mjs new <id> --badge "Special Event" --start 2026-12-20 --end 2026-12-31 [--scene night-sky]
//   node scripts/event.mjs check [id]           name 30 (title case), short 50, long 120, badge, dates, no prices / #1
//   node scripts/event.mjs render <id> [--video] [--draft] [--locales en-US,tr]
//   node scripts/event.mjs list
// Events live in appshot/events/<id>.json: { badge, start, end, scene?, variant?, locales: { "en-US": { name, short, long } } }.
// Output: appshot/out/events/<id>/<locale>/card.png|mp4, details.png|mp4; export.mjs copies them to upload/ios/<locale>/events/.

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, findWorkspace, readJson, writeJson, exists, ensureDir, list, slug, L, ENGINE_DIR, die, log } from '../engine/lib/util.mjs';
import { loadPlan, renderPlan } from '../engine/render.mjs';
import { renderLoopVideo, hasFfmpeg, probe } from '../engine/video.mjs';
import { Browser } from '../engine/lib/cdp.mjs';
import { sizeSpec } from '../engine/compose.mjs';
import { RX } from '../engine/lib/copyrules.mjs';
import { direct } from '../engine/lib/director.mjs';

const args = parseArgs();
const cmd = args._[0] || 'list';
const ws = findWorkspace(args);
const dir = ensureDir(path.join(ws, 'events'));
const LIM = readJson(path.join(ENGINE_DIR, 'sizes.json')).limits.event;
const plan = loadPlan(path.join(ws, 'plan.json'));
plan.__workspace = ws;
const profile = readJson(path.join(ws, 'profile.json'), {});
const file = (id) => path.join(dir, `${id}.json`);
const ids = () => fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));
const chars = (s) => [...(s || '')].length;

/** Apple's event text rules → [{ level, msg }]. */
function checkEvent(ev) {
  const out = [];
  const add = (level, msg) => out.push({ level, msg });
  if (!LIM.badges.includes(ev.badge)) add('error', `badge "${ev.badge}" — one of: ${LIM.badges.join(', ')}`);
  const start = ev.start ? new Date(ev.start) : null, end = ev.end ? new Date(ev.end) : null;
  if (!start || !end || Number.isNaN(+start) || Number.isNaN(+end)) add('error', 'start and end dates (YYYY-MM-DD) are needed');
  else {
    const days = (end - start) / 864e5;
    if (days <= 0) add('error', 'the event ends before it starts');
    if (days > LIM.maxDays) add('error', `${Math.round(days)} days — an event lasts at most ${LIM.maxDays} days`);
    if (start < new Date()) add('warn', 'the start date is in the past');
  }
  if (!ev.locales || !Object.keys(ev.locales).length) add('error', 'no text: locales.<locale> = { name, short, long }');
  for (const [loc, t] of Object.entries(ev.locales || {})) {
    const tag = (f) => `${loc} ${f}`;
    for (const [f, max] of [['name', LIM.name], ['short', LIM.short], ['long', LIM.long]]) {
      const v = t[f] || '';
      if (!v || /\b(TODO|TBD)\b/.test(v)) add('error', `${tag(f)}: missing`);
      else if (chars(v) > max) add('error', `${tag(f)}: ${chars(v)} characters (max ${max})`);
      if (RX.price.test(v)) add('error', `${tag(f)}: a price — Apple rejects events with prices ("pricing and currencies can vary across regions")`);
      if (RX.ranking.test(v)) add('warn', `${tag(f)}: "${v.match(RX.ranking)[0]}" — unverifiable claim ("the best", "#1")`);
      if ((v.match(/!/g) || []).length > 1) add('warn', `${tag(f)}: excessive punctuation`);
      const letters = v.replace(/[^\p{L}]/gu, '');
      if (letters.length > 6 && letters === letters.toLocaleUpperCase(loc) && letters !== letters.toLocaleLowerCase(loc)) add('warn', `${tag(f)}: all capitals`);
    }
    const name = t.name || '';
    // Title case for Latin scripts: every word but short function words starts upper-case.
    if (/^[\p{Script=Latin}\s\d'’:&-]+$/u.test(name) && name.split(/\s+/).some((w, i) => i > 0 && w.length > 3 && /^\p{Ll}/u.test(w))) add('warn', `${tag('name')}: Apple asks for title case ("${name}")`);
    if (/\b(event|game event|download|install|get it)\b/i.test(name)) add('warn', `${tag('name')}: the badge already says what kind of event it is — name the event itself, no call to action`);
    if (t.short && /^\p{Ll}/u.test(t.short)) add('info', `${tag('short')}: sentence case starts with a capital`);
    if (/\b(app|download|install|subscribe)\b/i.test(`${t.short} ${t.long}`)) add('warn', `${tag('short/long')}: "don't use the description to promote your app or services"`);
  }
  return out;
}

if (cmd === 'list') {
  if (!ids().length) { log.info('No events yet: node scripts/event.mjs new <id> --badge "Special Event" --start YYYY-MM-DD --end YYYY-MM-DD'); process.exit(0); }
  for (const id of ids()) { const ev = readJson(file(id)); console.log(`${id.padEnd(20)} ${ev.badge.padEnd(14)} ${ev.start} → ${ev.end}  ${Object.entries(ev.locales || {}).map(([l, t]) => `${l}: ${t.name}`).join(' · ')}`); }
  process.exit(0);
}

if (cmd === 'new') {
  const id = slug(args._[1] || '') || die('event.mjs new <id> --badge … --start … --end …');
  if (exists(file(id)) && !args.force) die(`events/${id}.json exists (--force to replace)`);
  const badge = args.badge || 'Special Event';
  const locales = Object.fromEntries((plan.locales || [plan.defaultLocale || 'en-US']).map((l) => [l, { name: 'TODO', short: 'TODO', long: 'TODO' }]));
  const ev = { badge, start: args.start || 'YYYY-MM-DD', end: args.end || 'YYYY-MM-DD', scene: args.scene || null, variant: args.variant || null, locales,
    _notes: `Name ≤ ${LIM.name} (title case, the event itself — not "event", not a call to action), short ≤ ${LIM.short} (card), long ≤ ${LIM.long} (details page), sentence case, no prices, no "#1". Good events bring something new and time-boxed: a challenge, a competition, a live moment, a major update, a new season, a premiere. Not: daily rewards, plain price promotions, general awareness.` };
  writeJson(file(id), ev);
  log.ok(`events/${id}.json — write the text for every locale, then: node scripts/event.mjs check ${id}`);
  process.exit(0);
}

if (cmd === 'check') {
  let errors = 0;
  for (const id of args._[1] ? [args._[1]] : ids()) {
    const issues = checkEvent(readJson(file(id)));
    const e = issues.filter((i) => i.level === 'error').length;
    errors += e;
    (e ? log.err : issues.length ? log.warn : log.ok)(`${id}: ${e} error(s), ${issues.length - e} note(s)`);
    for (const i of issues) console.log(`   ${i.level === 'error' ? '✗' : i.level === 'warn' ? '!' : '·'} ${i.msg}`);
  }
  process.exit(errors ? 1 : 0);
}

if (cmd === 'render') {
  const id = args._[1] || die('event.mjs render <id>');
  const ev = readJson(file(id), null) || die(`No events/${id}.json`);
  const locales = list(args.locales || args.locale).length ? list(args.locales || args.locale) : Object.keys(ev.locales || {});
  const draft = !!args.draft, wantVideo = !!args.video;
  if (wantVideo && !hasFfmpeg()) die('Video needs ffmpeg (brew install ffmpeg).');
  // The scene: the event's own, else the creative director's pick for the app (the same world as the header).
  let scene = ev.scene, variant = ev.variant;
  if (!scene) { try { const d = await direct({ plan, profile, locales }); scene = d.scene; variant = variant || d.variant; } catch {} }
  const browser = await Browser.launch();
  try {
    const page = await browser.newPage();
    for (const locale of locales) {
      const outDir = ensureDir(path.join(ws, draft ? 'drafts' : 'out', 'events', id, locale));
      for (const [name, sizeId] of [['card', 'event-card'], ['details', 'event-details']]) {
        const spec = sizeSpec(sizeId);
        // No text, no logo, no frame: the scene alone, its hero inside the band the App Store leaves clear.
        const shot = { id: name, layout: 'creative-scene', headline: '', options: { scene, ...(variant ? { variant } : {}), phrase: false } };
        const p = { ...plan, panorama: false, creative: { ...(plan.creative || {}), poster: 0.42 }, shots: [shot] };
        const tmp = path.join(ws, '.cache', 'events');
        const rep = await renderPlan({ plan: p, outDir: path.join(tmp, 'img'), sizes: [sizeId], locales: [locale], scale: draft ? 0.4 : 1, browser, quiet: true, reportFile: path.join(tmp, `${id}.${name}.${locale}.json`) });
        const img = path.join(outDir, `${name}.png`);
        fs.copyFileSync(rep.jobs[0].files[0], img);
        let msg = `${spec.width}×${spec.height}`;
        if (wantVideo) {
          const res = await renderLoopVideo({ plan: p, sizeId, locale, out: path.join(outDir, `${name}.mp4`), page, fps: draft ? 15 : 30, duration: Number(args.duration || 12), scale: draft ? 0.25 : 1,
            onProgress: (f, n) => process.stdout.write(`\r  ${id} · ${name} · ${locale} ${Math.round((f / n) * 100)}%   `) });
          process.stdout.write('\n');
          const pr = probe(res.file);
          msg += ` + video ${pr?.duration?.toFixed(1)} s`;
        }
        log.ok(`${locale} · ${name} ${msg}`);
      }
    }
  } finally { await browser.close(); }
  const issues = checkEvent(ev);
  for (const i of issues) console.log(`   ${i.level === 'error' ? '✗' : i.level === 'warn' ? '!' : '·'} ${i.msg}`);
  log.info(`Scene: ${scene}${variant ? ` (${variant})` : ''}. Upload in App Store Connect → In-App Events → ${id}: card media, details page media, then preview both there.`);
  process.exit(0);
}

die(`Unknown command ${cmd} (new | check | render | list)`);
