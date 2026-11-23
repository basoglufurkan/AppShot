#!/usr/bin/env node
// Automatic capture for every language and device class: launches the app in the iOS Simulator (or on an Android
// device) in each locale, reaches each screen by deep link and/or launch arguments, takes the screenshot with a clean
// 9:41 status bar and, with --record, films a clip of it for the app preview. Missing pt-BR or iPad captures stop
// being a manual chore.
//   node scripts/capture/auto.mjs init                       plan.capture from the scan: bundle id, URL scheme, screens
//   node scripts/capture/auto.mjs plan [--locales …]         what exists, what is missing, how each would be reached
//   node scripts/capture/auto.mjs run [--locales pt-BR] [--only focus,universe] [--tablet] [--record] [--android] [--yes]
//        without --yes it prints every step and changes nothing (a dry run)
//
// plan.capture = {
//   ios: { bundleId, app?: "path/to/App.app" (installed first), device?: "iPhone 18 Pro Max", tablet?: "iPad Pro 13-inch (M5)",
//          launchArgs?: ["-demo-data"]  (the app's own debug flags: demo content, skip onboarding, an in-memory store) },
//   android: { package, serial? },
//   appearance?: "dark" | "light",
//   screens: { <name>: { url?: "myapp://focus", launchArgs?: [...], wait?: 2.5, record?: 6, manual?: "how to reach it" } }
// }
// Screens with neither url nor launchArgs are listed as manual. The locale reaches the app as -AppleLanguages /
// -AppleLocale launch arguments (iOS) or a per-app locale (Android 13+), so the simulator's own language never changes.
// Without ios.device / ios.tablet, or when this Mac lacks the named one, the simulator is picked by screen: the newest
// one with the store's canvas, 1320×2868 iPhone / 2064×2752 iPad (engine/lib/simulators.mjs). The dry run shows which.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { parseArgs, findWorkspace, readJson, writeJson, exists, ensureDir, list, slug, die, log } from '../../engine/lib/util.mjs';
import { loadImage } from '../../engine/lib/visual.mjs';
import { listSimulators, pickSimulator } from '../../engine/lib/simulators.mjs';

const args = parseArgs();
const cmd = args._[0] || 'plan';
const ws = findWorkspace(args);
const planFile = path.join(ws, 'plan.json');
const plan = readJson(planFile, null) || die('No plan.json yet: node scripts/plan.mjs init');
const profile = readJson(path.join(ws, 'profile.json'), {});
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));
const locales = list(args.locales || args.locale).length ? list(args.locales || args.locale) : plan.locales || [plan.defaultLocale || 'en-US'];
const cap = plan.capture || {};

/** Screen names the plan uses, with the path template of each device class (from shot.screen / screens). */
function screensOfPlan() {
  const out = new Map();
  const add = (ref, kind) => {
    if (typeof ref !== 'string') return;
    const name = path.basename(ref).replace(/\.\w+$/, '');
    const e = out.get(name) || { name };
    e[kind] = ref; out.set(name, e);
  };
  for (const s of plan.shots || []) for (const ref of [s.screen, ...(s.screens || [])]) {
    if (!ref) continue;
    // A plain path under an ipad/ or tablet/ folder is a tablet capture (an iPad-only shot), not the phone one.
    if (typeof ref === 'object') { add(ref.phone, 'phone'); add(ref.tablet, 'tablet'); } else add(ref, /(^|\/)(ipad|tablet)\//i.test(ref) ? 'tablet' : 'phone');
  }
  return [...out.values()];
}
/** Where a capture lands: the plan's own path with {locale} filled, or raw/<locale>/<name>.png. */
const target = (s, kind, locale) => {
  const t = s[kind] || (kind === 'tablet' ? `raw/ipad/{locale}/${s.name}.png` : `raw/{locale}/${s.name}.png`);
  return path.join(ws, t.includes('{locale}') ? t.replaceAll('{locale}', locale) : t.replace(/^raw\//, `raw/${locale}/`));
};
const appleArgs = (locale) => {
  const [lang, region] = locale.split('-');
  const R = { en: 'US', hi: 'IN', id: 'ID', ja: 'JP', ko: 'KR', vi: 'VN', th: 'TH', ru: 'RU', pl: 'PL', sv: 'SE', he: 'IL', it: 'IT' }[lang] || 'US';
  const reg = region && region.length === 2 ? region : R;
  const appleLang = locale.startsWith('zh') ? locale : region && region.length === 2 && ['pt', 'es', 'en', 'fr', 'zh'].includes(lang) ? `${lang}-${region}` : lang;
  return ['-AppleLanguages', `(${appleLang})`, '-AppleLocale', `${lang}_${reg}`];
};

if (cmd === 'init') {
  const scheme = profile.app?.urlSchemes?.[0];
  const screens = Object.fromEntries(screensOfPlan().map((s) => [s.name, scheme ? { url: `${scheme}://${s.name}`, guess: true, wait: 2.5 } : { manual: 'how to reach this screen' }]));
  plan.capture = { ios: { bundleId: profile.app?.bundleId || 'TODO', launchArgs: [] }, ...(profile.platform?.stores?.includes('android') ? { android: { package: profile.app?.packageName || 'TODO' } } : {}), screens, ...(plan.capture || {}) };
  writeJson(planFile, plan);
  log.ok(`plan.capture written — ${Object.keys(screens).length} screens. Fix every guessed url (the app's real routes), add the app's own debug launch arguments (demo data, skip onboarding, an in-memory store), then: node scripts/capture/auto.mjs plan`);
  process.exit(0);
}

const screens = screensOfPlan().filter((s) => !list(args.only).length || list(args.only).includes(s.name));
const how = (s) => { const c = cap.screens?.[s.name] || {}; return c.url ? `deep link ${c.url}${c.guess ? ' (guessed — check it)' : ''}` : c.launchArgs?.length ? `launch ${c.launchArgs.join(' ')}` : (cap.ios?.launchArgs?.length && c.launch) ? 'launch screen' : c.manual ? `manual: ${c.manual}` : 'manual (no url or launchArgs)'; };
const reachable = (s) => { const c = cap.screens?.[s.name] || {}; return !!(c.url || c.launchArgs?.length || c.launch); };

if (cmd === 'plan') {
  if (!plan.capture) log.warn('No plan.capture yet — node scripts/capture/auto.mjs init');
  const kinds = ['phone', ...(screensOfPlan().some((s) => s.tablet) ? ['tablet'] : [])];
  let missing = 0;
  for (const s of screens) {
    const row = locales.flatMap((l) => kinds.map((k) => { const f = target(s, k, l); const ok = exists(f); if (!ok) missing++; return `${ok ? '✓' : '·'} ${l}${k === 'tablet' ? '/iPad' : ''}`; }));
    const clips = [...locales.map((l) => (exists(path.join(ws, 'raw', l, 'clips', `${s.name}.mp4`)) ? `🎬 ${l}` : '')), exists(path.join(ws, 'raw', 'clips', `${s.name}.mp4`)) ? '🎬 shared (unlocalised captures only)' : ''].filter(Boolean);
    console.log(`${s.name.padEnd(16)} ${row.join('  ')}${clips.length ? `   ${clips.join(' ')}` : ''}\n${''.padEnd(17)}${how(s)}`);
  }
  log.info(`${missing} capture(s) missing. Run: node scripts/capture/auto.mjs run [--record] [--tablet] (dry run first; --yes to do it)`);
  process.exit(0);
}

if (cmd !== 'run') die(`Unknown command ${cmd} (init | plan | run)`);
const dry = !args.yes;
const steps = [];
const doStep = async (label, fn) => { steps.push(label); console.log(`${dry ? '·' : '▸'} ${label}`); if (!dry) await fn(); };

if (args.android) {
  const a = cap.android || die('plan.capture.android { package } is missing');
  const base = a.serial ? ['-s', a.serial] : [];
  const adb = (...x) => execFileSync('adb', [...base, ...x], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (!dry) { try { adb('get-state'); } catch { die('No Android device: start an emulator or connect a phone with USB debugging (adb).'); } }
  for (const locale of locales) {
    await doStep(`android · ${locale}: per-app locale ${locale}`, async () => { adb('shell', 'cmd', 'locale', 'set-app-locales', a.package, '--locales', locale); });
    for (const s of screens) {
      const c = cap.screens?.[s.name] || {};
      if (!c.url) { console.log(`  skip ${s.name}: needs a deep link on Android`); continue; }
      const out = target(s, 'phone', locale).replace(/\.png$/, '.android.png');
      await doStep(`android · ${locale} · ${s.name}: open ${c.url}, screenshot → ${path.relative(ws, out)}`, async () => {
        adb('shell', 'am', 'start', '-W', '-a', 'android.intent.action.VIEW', '-d', c.url, a.package);
        await sleep(c.wait ?? 2.5);
        ensureDir(path.dirname(out));
        fs.writeFileSync(out, execFileSync('adb', [...base, 'exec-out', 'screencap', '-p'], { maxBuffer: 1 << 26 }));
      });
    }
  }
  process.exit(0);
}

// ---- iOS Simulator ----
const ios = cap.ios || die('plan.capture.ios { bundleId } is missing — node scripts/capture/auto.mjs init');
if (!ios.bundleId || ios.bundleId === 'TODO') die('plan.capture.ios.bundleId is missing');
const sim = (...a) => execFileSync('xcrun', ['simctl', ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
// A dry run only prints the steps, so a Mac without Xcode or without the right simulator still gets to see them.
let sims = null;
try { sims = listSimulators(); } catch {
  const msg = 'xcrun simctl not available — install Xcode and run: sudo xcode-select -s /Applications/Xcode.app';
  if (!dry) die(msg);
  log.warn(`${msg} (dry run: the steps below show no simulator)`);
}
/** Screenshot once the screen has settled: launch animations, splash fades and scrolling must be over. */
async function settledShot(udid, out, { max = 8 } = {}) {
  const tmp = `${out}.tmp.png`;
  let prev = null;
  const t0 = Date.now();
  for (;;) {
    sim('io', udid, 'screenshot', '--type=png', '--mask=ignored', tmp);
    const img = loadImage(tmp, 60);
    if (prev) {
      let d = 0;
      for (let i = 0; i < img.data.length; i += 4) d += Math.abs(img.data[i] - prev[i]) + Math.abs(img.data[i + 1] - prev[i + 1]);
      // Below ~0.6 grey levels per pixel only the status bar clock or a twinkle changed.
      if (d / (img.data.length / 2) < 0.6 || (Date.now() - t0) / 1000 > max) break;
    }
    prev = img.data.slice();
    await sleep(0.6);
  }
  fs.renameSync(tmp, out);
}
const kinds = [['phone', ios.device], ...(args.tablet ? [['tablet', ios.tablet]] : [])];
for (const [kind, wanted] of kinds) {
  // The plan's simulator when this Mac has it, else the newest one with the same screen (or the store's canvas).
  const pick = sims ? pickSimulator(sims, kind, wanted) : {};
  if (pick.error) { if (!dry) die(pick.error); log.warn(pick.error); }
  if (pick.note) log.warn(pick.note);
  const d = pick.device;
  const name = d?.name || wanted || (kind === 'tablet' ? 'iPad' : 'iPhone');
  const udid = d?.udid;
  if (d && d.state !== 'Booted') await doStep(`boot ${name} (${d.runtime.split('.').pop()})`, async () => { sim('boot', udid); sim('bootstatus', udid, '-b'); });
  if (ios.app) await doStep(`${name}: install ${ios.app}`, async () => sim('install', udid, path.resolve(path.dirname(ws), ios.app)));
  await doStep(`${name}: status bar 9:41, full bars${cap.appearance ? `, ${cap.appearance} appearance` : ''}`, async () => {
    sim('status_bar', udid, 'override', '--time', '9:41', '--dataNetwork', 'wifi', '--wifiMode', 'active', '--wifiBars', '3', '--cellularMode', 'active', '--cellularBars', '4', '--operatorName', '', '--batteryState', 'charged', '--batteryLevel', '100');
    if (cap.appearance) sim('ui', udid, 'appearance', cap.appearance);
  });
  for (const locale of locales) for (const s of screens) {
    if (kind === 'tablet' && !s.tablet) continue;
    const c = cap.screens?.[s.name] || {};
    if (!reachable(s)) { console.log(`  skip ${s.name} (${locale}): ${how(s)}`); continue; }
    const launch = [...appleArgs(locale), ...(ios.launchArgs || []), ...(c.launchArgs || [])];
    const out = target(s, kind, locale);
    await doStep(`${name} · ${locale} · ${s.name}: launch ${ios.bundleId} ${launch.join(' ')}${c.url ? ` → open ${c.url}` : ''} → ${path.relative(ws, out)}`, async () => {
      sim('launch', '--terminate-running-process', udid, ios.bundleId, ...launch);
      await sleep(c.launchWait ?? 2.5);
      if (c.url) { sim('openurl', udid, c.url); }
      await sleep(c.wait ?? 2);
      ensureDir(path.dirname(out));
      await settledShot(udid, out);
    });
    if (args.record && kind === 'phone' && c.record !== 0) {
      const secs = Number(c.record || args.seconds || 6);
      await doStep(`${name} · ${locale} · ${s.name}: record ${secs} s → raw/${locale}/clips/${s.name}.mp4`, async () => {
        // Relaunch so the clip starts on the screen's first, finished frame, then film it with the preview recorder.
        sim('launch', '--terminate-running-process', udid, ios.bundleId, ...launch);
        await sleep(c.launchWait ?? 2.5);
        if (c.url) { sim('openurl', udid, c.url); await sleep(c.wait ?? 2); }
        // Start filming only once the screen has settled: the clip's first frame is the autoplay start.
        const probe = path.join(ensureDir(path.join(ws, '.cache')), `settle-${s.name}.png`);
        await settledShot(udid, probe); fs.rmSync(probe, { force: true });
        const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'preview.mjs'), 'record', '--workspace', ws, '--device', udid, '--name', s.name, '--locale', locale, '--seconds', String(secs)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
        if (r.status !== 0) log.warn(`${s.name} (${locale}): recording failed — ${(r.stderr || r.stdout).slice(-200)}`);
      });
    }
  }
}
console.log(dry ? `\nDry run: ${steps.length} step(s), nothing changed. Run again with --yes to capture.` : `\n✓ ${steps.length} step(s) done. LOOK at the captures, then: node scripts/render.mjs --draft`);
if (!dry) log.info('Each screenshot replaces the file at the same path — the plan picks them up as they are.');
