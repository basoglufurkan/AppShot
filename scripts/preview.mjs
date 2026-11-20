#!/usr/bin/env node
// App Store app previews — the 15–30 s video that plays first, before the screenshots (and in search results).
//   node scripts/preview.mjs [--sizes preview-iphone,preview-ipad] [--locales en-US,de-DE] [--style store|framed]
//        [--orientation landscape] [--music track.m4a] [--camera auto|none] [--no-blur] [--draft] [--explain]
//   node scripts/preview.mjs --promo [--sizes promo-vertical,promo-landscape,promo-square]   (social / YouTube / Play promo)
//   node scripts/preview.mjs --variant b|c  (b: action first, c: payoff first — Product Page Optimization treatments → out/preview/<locale>/variants/<v>/)
//   node scripts/preview.mjs --sfx [pack dir]   sound effects from a pack you own (category folders: whoosh/, click/, interface/…),
//        placed on taps, cuts, number rolls and the end card; without a dir: $APPSHOT_SFX. --no-sfx turns off.
//   node scripts/preview.mjs record --name focus [--locale en-US] [--seconds 8] [--url myapp://focus] [--device booted]
//   node scripts/preview.mjs record --android --name focus [--seconds 8] [--serial emulator-5554]
//   node scripts/preview.mjs clip --from path/to/recording.mov --name focus [--start 1.2] [--end 6] [--locale en-US]
//        (reuse an existing screen recording — UI-test captures, QuickTime takes — as a preview clip)
//   node scripts/preview.mjs taps --name focus [--add "1.25,0.5,0.92;3,0.5,0.4"] [--swipe "t,x,y,x2,y2,dur"] [--clear]
//        (touch hotspots for a clip: time in clip seconds, position as fractions; snapped to the screen's reaction)
//   node scripts/preview.mjs tap --name focus --at 0.5,0.92 [--to 0.5,0.3]
//        (while `record` runs: log the tap you are about to make in the Simulator; times are taken from the clock)
// Output:  appshot/out/preview/<locale>/<iphone|ipad|…>.mp4 + <…>-poster.png   (--draft: appshot/drafts/preview/…)
// Review:  appshot/review/preview-<locale>.png — the storyboard: frames, timing, footage sources, warnings.
// The story follows the screenshot plan (hook first, same captions); plan.preview overrides it
// (see skills/aso/app-previews.md). Recordings live in raw/<locale>/clips/<screen>.mp4 and replace the stills.

import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync, spawnSync } from 'node:child_process';
import { parseArgs, findWorkspace, exists, list, ensureDir, readJson, writeJson, fileUrl, slug, L, die, log } from '../engine/lib/util.mjs';
import { loadPlan, renderHtml } from '../engine/render.mjs';
import { hasFfmpeg } from '../engine/video.mjs';
import { Browser } from '../engine/lib/cdp.mjs';
import { esc } from '../engine/lib/html.mjs';
import { storyboard, renderPreview, previewStills, probeMedia, LIMITS } from '../engine/preview.mjs';
import { analyzeMedia, snapTaps, readTaps } from '../engine/lib/footage.mjs';
import { sizeSpec } from '../engine/compose.mjs';
import { findSfxPack, cueSheet } from '../engine/lib/sfx.mjs';

const args = parseArgs();
const ws = findWorkspace(args);
const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));

if (args._[0] === 'record') { await record(); process.exit(0); }
if (args._[0] === 'clip') { cutClip(); process.exit(0); }
if (args._[0] === 'taps') { editTaps(); process.exit(0); }
if (args._[0] === 'tap') { liveTap(); process.exit(0); }

const plan = loadPlan(path.join(ws, 'plan.json'));
plan.__workspace = ws;
const profile = readJson(path.join(ws, 'profile.json'), {});
const cfg = plan.preview || {};
const promoRun = !!args.promo || cfg.style === 'promo';
const variant = args.variant ? String(args.variant).toLowerCase() : null;
if (variant && !['b', 'c'].includes(variant)) die('--variant: "b" (action first) or "c" (payoff first) are built in; write other orders as plan.preview.segments');
if (args.style || args.camera || args.promo || variant) plan.preview = { ...cfg, ...(args.style ? { style: args.style } : {}), ...(args.camera ? { camera: args.camera } : {}), ...(args.promo ? { style: 'promo' } : {}), ...(variant ? { variant } : {}) };
const tabletCaptures = (plan.shots || []).some((s) => s.screen && typeof s.screen === 'object' && s.screen.tablet);
const sizes = list(args.sizes).length ? list(args.sizes)
  : promoRun ? cfg.promoSizes || ['promo-vertical', 'promo-landscape']
  : cfg.sizes || ['preview-iphone', ...((plan.sizes || []).some((s) => s.startsWith('ipad')) && tabletCaptures ? ['preview-ipad'] : [])];
for (const s of sizes) if (!sizeSpec(s).preview) die(`"${s}" is not an app preview size (preview-iphone, preview-iphone-home, preview-iphone-4.7, preview-ipad, preview-mac)`);
const locales = list(args.locales || args.locale).length ? list(args.locales || args.locale) : plan.locales || [plan.defaultLocale || 'en-US'];
const orientation = args.orientation || cfg.orientation;
const draft = !!args.draft;
const fps = draft ? 15 : Math.min(LIMITS.maxFps, Number(args.fps || cfg.fps || 30));
const music = args.music || cfg.music ? path.resolve(ws, args.music || cfg.music) : null;
if (music && !exists(music)) die(`Music file not found: ${music}`);
// Sound effects: --sfx [dir] or plan.preview.sfx (a folder path, or true to use $APPSHOT_SFX); --no-sfx wins.
const sfxSpec = args.noSfx || cfg.sfx === false ? null : args.sfx !== undefined ? (args.sfx === true ? 'auto' : args.sfx) : cfg.sfx === true ? 'auto' : cfg.sfx || null;
let sfx = null;
if (sfxSpec) {
  try { sfx = findSfxPack(sfxSpec, ws); } catch (e) { die(e.message); }
  if (!sfx) die('No sound-effect pack given. Pass --sfx <folder> (category subfolders such as whoosh/, click/, interface/, sparkle/), set APPSHOT_SFX, or put the folder in plan.preview.sfx.');
  log.info(`Sound effects from ${sfx}`);
}

if (args.explain) {
  for (const locale of locales) for (const sizeId of sizes) {
    const sb = storyboard({ plan, profile, ws, locale, sizeId, orientation, music });
    console.log(`\n${locale} · ${sizeId} ${sb.W}×${sb.H} · ${sb.style}`);
    for (const r of sb.reasons) console.log(`• ${r}`);
    for (const w of sb.warnings) console.log(`⚠ ${w}`);
    if (sfx) for (const c of cueSheet(sb, sfx, { cacheRoot: ensureDir(path.join(ws, '.cache', 'preview')) })) console.log(`♪ ${c.t.toFixed(2)} s  ${path.relative(sfx, c.file)}  ${c.db} dB  — ${c.why}`);
  }
  process.exit(0);
}
if (!hasFfmpeg()) die('ffmpeg is required for app previews: brew install ffmpeg');

const outRoot = path.join(ws, draft ? 'drafts' : 'out', promoRun ? 'promo' : 'preview');
const report = { createdAt: new Date().toISOString(), draft, previews: [] };
const browser = await Browser.launch();
try {
  const page = await browser.newPage();
  for (const locale of locales) {
    const rows = [];
    for (const sizeId of sizes) {
      const short = sizeSpec(sizeId).short || sizeId;
      const out = path.join(ensureDir(path.join(outRoot, locale, ...(variant ? ['variants', variant] : []))), `${short}${orientation === 'landscape' ? '-landscape' : ''}.mp4`);
      const res = await renderPreview({ plan, profile, ws, locale, sizeId, orientation, page, out, fps, scale: draft ? 0.5 : 1, music, sfx, blur: !draft && !args.noBlur && cfg.blur !== false,
        onProgress: (f, n) => process.stdout.write(`\r  ${short} · ${locale} ${Math.round((f / n) * 100)}%   `) });
      process.stdout.write('\n');
      const pr = probeMedia(res.file);
      const issues = [...res.sb.warnings, ...(res.qa?.warnings || [])];
      if (pr && !draft) {
        if (pr.duration < LIMITS.minSec || pr.duration > LIMITS.maxSec + 0.05) issues.push(`duration ${pr.duration.toFixed(1)} s (${LIMITS.minSec}–${LIMITS.maxSec} s)`);
        if (pr.bytes > LIMITS.maxBytes) issues.push(`file is ${(pr.bytes / 1e6).toFixed(0)} MB (max 500 MB)`);
      }
      const { stills } = await previewStills({ plan, profile, ws, locale, sizeId, orientation, page, sb: res.sb, scale: Math.min(0.25, 470 / res.H) });
      const files = stills.map((s, i) => { const f = path.join(ensureDir(path.join(ws, '.cache', 'preview', 'board')), `${short}.${locale}.${i}.jpg`); fs.writeFileSync(f, s.buf); return { t: s.t, file: f }; });
      rows.push({ sizeId, short, res, pr, issues, files });
      report.previews.push({ locale, size: sizeId, file: res.file, poster: res.poster, width: pr?.width, height: pr?.height, duration: pr?.duration, mb: pr ? Math.round(pr.bytes / 1e5) / 10 : null, style: res.sb.style, sfx: res.cues?.map((c) => ({ t: c.t, file: path.relative(sfx || '', c.file), db: c.db, why: c.why })), qa: res.qa ? { deadHolds: res.qa.deadHolds, bare: res.qa.bare, opening: res.qa.opening, audio: res.qa.audio } : null, timeline: res.sb.timeline.map((s) => ({ id: s.id, kind: s.kind, start: s.start, len: s.len, fadeIn: s.fadeIn, caption: s.caption, source: s.clip || s.still || null })), reasons: res.sb.reasons, issues });
      log.ok(`${locale} · ${short} ${pr ? `${pr.width}×${pr.height} ${pr.duration.toFixed(1)}s ${(pr.bytes / 1e6).toFixed(1)} MB` : ''}${res.blurred ? ` · motion blur on ${res.blurred} frames` : ''}${res.cues?.length ? ` · ${res.cues.length} sound effects` : ''}${res.qa?.audio && !res.qa.audio.silent ? ` · ${res.qa.audio.lufs.toFixed(1)} LUFS, peak ${res.qa.audio.peak.toFixed(1)} dBTP` : ''}${issues.length ? `  ⚠ ${issues.join(' | ')}` : ''}`);
    }
    await board(locale, rows);
  }
} finally {
  await browser.close();
}
writeJson(path.join(ensureDir(path.join(ws, 'review')), `${promoRun ? 'promo' : 'preview'}-report${draft ? '-draft' : ''}.json`), report);
log.info('LOOK at review/preview-<locale>.png: the first second sells (it autoplays muted), every caption readable, footage real.');
log.info('Upload: App Store Connect → your version → Previews and Screenshots → App Previews (largest iPhone size; it scales down). Set the poster frame there.');

async function board(locale, rows) {
  const sb0 = rows[0]?.res.sb;
  const sections = rows.map(({ short, res, pr, issues, files }) => {
    const sb = res.sb;
    const segAt = (t) => sb.timeline.filter((s) => s.start <= t + 1e-6).pop();
    const figs = files.map(({ t, file }) => {
      const s = segAt(t);
      const label = t === 0 ? 'first frame (autoplay start)' : s.kind === 'end' ? 'end frame' : `${s.kind === 'clip' ? 'recording' : 'still'}${s.cam?.maxZoom > 1.05 && !s.cam.push ? ` · zoom ${s.cam.maxZoom.toFixed(2)}×` : ''} · ${esc(String(s.caption).replace(/\*\*/g, ''))}`;
      return `<figure><img src="${fileUrl(file)}"><figcaption><b>${t.toFixed(1)} s</b> ${label}</figcaption></figure>`;
    }).join('');
    const bar = sb.timeline.map((s) => `<i class="seg ${s.kind}" style="left:${(s.start / sb.duration) * 100}%;width:${(s.len / sb.duration) * 100}%" title="${esc(s.id)}">${esc(s.kind === 'end' ? 'end' : s.id)}</i>`).join('')
      + (promoRun ? '' : `<i class="poster" style="left:${(sb.poster / sb.duration) * 100}%">default poster ${sb.poster}s</i><i class="poster best" style="left:${(sb.posterHint / sb.duration) * 100}%">best ${sb.posterHint}s</i>`);
    return `<section><h2>${esc(short)} · ${sb.W}×${sb.H} · ${esc(sb.style)} · ${sb.duration.toFixed(1)} s${pr ? ` · ${(pr.bytes / 1e6).toFixed(1)} MB` : ''}</h2>
      <div class="bar">${bar}</div><div class="strip">${figs}</div>${issues.length ? `<p class="warn">${issues.map(esc).join('<br>')}</p>` : ''}</section>`;
  }).join('');
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;width:1900px;background:#e8e8ec;font:500 18px -apple-system,Helvetica;color:#333;padding:30px;box-sizing:border-box}
    h1{font:700 30px -apple-system;margin:0 0 16px}h2{font:700 22px -apple-system;margin:22px 0 10px}
    .dir{background:#fff;border-radius:12px;padding:14px 18px;margin:0;font-size:16px;line-height:1.5;color:#444}.dir li{margin:1px 0}
    .bar{position:relative;height:34px;background:#fff;border-radius:8px;margin:6px 0 14px}
    .seg{position:absolute;top:4px;height:26px;border-radius:6px;font:600 13px -apple-system;color:#fff;padding:5px 8px;box-sizing:border-box;overflow:hidden;white-space:nowrap;opacity:.9}
    .seg.clip{background:#34a853}.seg.still{background:#f0a020}.seg.end{background:#5b6cff}
    .poster{position:absolute;top:-6px;height:46px;border-left:3px solid #e33;font:700 12px -apple-system;color:#e33;padding-left:4px;white-space:nowrap}.poster.best{border-color:#7a3cff;color:#7a3cff;top:-18px}
    .strip{display:flex;flex-wrap:wrap;gap:12px}.strip img{display:block;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.18);max-height:470px}
    figure{margin:0}figcaption{font-size:14px;color:#666;max-width:230px;margin-top:6px}.warn{color:#c0392b;font-size:16px}
    </style><h1>${esc(L(plan.app?.name, locale) || 'App')} — ${promoRun ? 'promo video' : 'app preview'}${variant ? ` · variant ${variant.toUpperCase()}` : ''} · ${esc(locale)} <span style="font-weight:500;font-size:18px;color:#777">green = screen recording, orange = still capture, blue = end card${promoRun ? '' : ', red = poster frame'}</span></h1>
    ${sb0 ? `<ul class="dir">${sb0.reasons.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}${sections}`;
  const out = path.join(ensureDir(path.join(ws, 'review')), `${promoRun ? 'promo' : 'preview'}-${locale}${variant ? `-${variant}` : ''}${draft ? '-draft' : ''}.png`);
  const height = 160 + (sb0 ? sb0.reasons.length * 25 : 0) + rows.reduce((a, r) => {
    const w = r.res.W * Math.min(0.25, 470 / r.res.H), h = r.res.H * Math.min(0.25, 470 / r.res.H);
    const perRow = Math.max(1, Math.floor(1840 / (w + 12)));
    return a + 120 + Math.ceil(r.files.length / perRow) * (h + 60) + r.issues.length * 24;
  }, 0);
  await renderHtml(html, { width: 1900, height: Math.round(height), out, browser });
  log.ok(path.relative(process.cwd(), out));
}

// ---------- clip: an existing recording, trimmed and normalised ----------

function cutClip() {
  if (!args.from || !args.name) die('Usage: preview.mjs clip --from <recording> --name <screen> [--start s] [--end s] [--locale code]');
  if (!hasFfmpeg()) die('ffmpeg is required: brew install ffmpeg');
  const from = path.resolve(String(args.from));
  if (!exists(from)) die(`Not found: ${from}`);
  const src = probeMedia(from);
  if (!src) die(`ffprobe cannot read ${from}`);
  const name = slug(String(args.name).replace(/\.\w+$/, ''));
  const locale = args.locale ? String(args.locale) : null;
  const dir = ensureDir(path.join(ws, 'raw', ...(locale ? [locale] : []), 'clips'));
  const file = path.join(dir, `${name}.mp4`);
  const start = Number(args.start || 0);
  const end = args.end !== undefined ? Number(args.end) : src.duration;
  if (!(end > start)) die(`--end (${end}) must be after --start (${start})`);
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(start), '-t', (end - start).toFixed(3), '-i', from, '-vf', 'fps=30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', file], { encoding: 'utf8' });
  if (r.status !== 0) die(`ffmpeg failed: ${r.stderr.slice(-300)}`);
  // Provenance next to the clips, so anyone can re-cut them.
  const metaFile = path.join(dir, 'sources.json');
  const meta = readJson(metaFile, { clips: [] });
  meta.clips = (meta.clips || []).filter((c) => c.clip !== `${name}.mp4`).concat({ clip: `${name}.mp4`, source: path.relative(path.dirname(ws), from).startsWith('..') ? from : path.relative(path.dirname(ws), from), from: start, to: end, cutAt: new Date().toISOString() });
  writeJson(metaFile, meta);
  const pr = probeMedia(file);
  log.ok(`${path.relative(process.cwd(), file)}  ${pr?.width}×${pr?.height} ${pr?.duration?.toFixed(1)} s  (from ${path.basename(from)} ${start}–${end.toFixed(2)} s)`);
  if (start === 0) log.info('The hook clip\'s first frame is the autoplay start and the thumbnail — start it on a full, finished screen (--start).');
}

// ---------- record: real footage from the iOS Simulator or an Android device ----------

async function record() {
  if (!args.name) die('--name <screen> is required — the capture it films, e.g. --name focus for raw/<locale>/focus.png');
  const name = slug(String(args.name).replace(/\.\w+$/, ''));
  const locale = args.locale ? String(args.locale) : null;
  const dir = ensureDir(path.join(ws, 'raw', ...(locale ? [locale] : []), 'clips'));
  const file = path.join(dir, `${name}.mp4`);
  const secs = args.seconds ? Number(args.seconds) : null;
  if (!hasFfmpeg()) die('ffmpeg is required: brew install ffmpeg');
  const tmp = path.join(dir, `.${name}.recording.${args.android ? 'mp4' : 'mov'}`);
  let recSecs = secs || 8;

  if (args.android) {
    const base = args.serial ? ['-s', String(args.serial)] : [];
    const adb = (...a) => execFileSync('adb', [...base, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    try { adb('get-state'); } catch { die('No Android device: start an emulator or connect a phone with USB debugging.'); }
    const demo = (c) => { try { adb('shell', `am broadcast -a com.android.systemui.demo -e command ${c}`); } catch {} };
    try { adb('shell', 'settings put global sysui_demo_allowed 1'); } catch {}
    demo('enter'); demo('clock -e hhmm 0941'); demo('battery -e level 100 -e plugged false'); demo('notifications -e visible false');
    if (args.url) { adb('shell', `am start -a android.intent.action.VIEW -d "${args.url}"`); await sleep(Number(args.wait ?? 2)); }
    const limit = Math.min(180, secs || 8);
    recSecs = limit;
    log.info(`Recording ${limit} s on Android — use the app now.`);
    adb('shell', 'screenrecord', '--time-limit', String(limit), '--bit-rate', '12000000', '/sdcard/appshot-clip.mp4');
    adb('pull', '/sdcard/appshot-clip.mp4', tmp);
    try { adb('shell', 'rm', '/sdcard/appshot-clip.mp4'); } catch {}
  } else {
    const dev = String(args.device || 'booted');
    const sim = (...a) => execFileSync('xcrun', ['simctl', ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    try { sim('help'); } catch { die('xcrun simctl not available — install Xcode and run: sudo xcode-select -s /Applications/Xcode.app'); }
    try {
      sim('status_bar', dev, 'override', '--time', String(args.time || '9:41'), '--dataNetwork', 'wifi', '--wifiMode', 'active', '--wifiBars', '3',
        '--cellularMode', 'active', '--cellularBars', '4', '--operatorName', '', '--batteryState', 'charged', '--batteryLevel', '100');
    } catch (e) { log.warn(`Status bar not overridden: ${String(e.message).split('\n')[0]}`); }
    if (args.url) { sim('openurl', dev, String(args.url)); await sleep(Number(args.wait ?? 2)); }
    const rec = spawn('xcrun', ['simctl', 'io', dev, 'recordVideo', '--codec=h264', '--mask=ignored', '--force', tmp], { stdio: ['ignore', 'pipe', 'pipe'] });
    let started = false, errText = '';
    const on = (d) => { errText += d; if (/recording started/i.test(String(d))) started = true; };
    rec.stdout.on('data', on); rec.stderr.on('data', on);
    const closed = new Promise((r) => rec.on('close', r));
    const t0 = Date.now();
    while (!started && Date.now() - t0 < 4000 && rec.exitCode === null) await sleep(0.1);
    if (rec.exitCode !== null) die(`simctl recordVideo failed: ${errText.trim() || 'no booted simulator?'}`);
    const recStart = Date.now();
    // `preview.mjs tap` calls during the take append to <name>.live-taps.jsonl; this marks the take's clock.
    writeJson(path.join(dir, `.${name}.session.json`), { startedAt: recStart });
    fs.rmSync(path.join(dir, `.${name}.live-taps.jsonl`), { force: true });
    if (secs || !process.stdin.isTTY) { log.info(`Recording ${secs || 8} s — use the app in the Simulator now.`); await sleep(secs || 8); }
    else { log.info('Recording — use the app in the Simulator, then press Enter to stop.'); await new Promise((r) => process.stdin.once('data', r)); }
    recSecs = (Date.now() - recStart) / 1000;
    rec.kill('SIGINT');
    await closed;
  }
  if (!exists(tmp)) die('No recording was written.');
  // --mask=ignored above: no black Dynamic Island / rounded corners burnt into the footage (a device recording has none).
  // Constant 30 fps H.264 without audio: what the preview renderer decodes frame by frame. Simulator and Android
  // recordings only write a frame when the screen changes, so the last frame is held to the real recording length.
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-vf', `tpad=stop_mode=clone:stop_duration=${recSecs.toFixed(2)},fps=30`, '-t', recSecs.toFixed(2), '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', file], { encoding: 'utf8' });
  fs.rmSync(tmp, { force: true });
  if (r.status !== 0) die(`ffmpeg could not convert the recording: ${r.stderr.slice(-300)}`);
  const pr = probeMedia(file);
  log.ok(`${path.relative(process.cwd(), file)}  ${pr?.width}×${pr?.height} ${pr?.duration?.toFixed(1)} s`);
  // Live-logged taps → <name>.taps.json in clip time.
  const live = path.join(dir, `.${name}.live-taps.jsonl`), sess = readJson(path.join(dir, `.${name}.session.json`), null);
  if (sess && exists(live)) {
    const taps = fs.readFileSync(live, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
      .map((t) => ({ ...t, t: Math.round(((t.at - sess.startedAt) / 1000) * 1000) / 1000, at: undefined })).filter((t) => t.t >= 0 && t.t <= (pr?.duration || 1e9));
    if (taps.length) { writeJson(file.replace(/\.mp4$/, '.taps.json'), { source: 'live', taps }); log.ok(`${taps.length} tap(s) → ${path.basename(file).replace(/\.mp4$/, '.taps.json')}`); }
    fs.rmSync(live, { force: true });
  }
  fs.rmSync(path.join(dir, `.${name}.session.json`), { force: true });
  log.info(`The preview uses it for every shot whose screen is "${name}". Trim with plan.preview.segments[].start / end.`);
}

// ---------- taps: touch hotspots for a clip ----------

function clipFile(name, locale) {
  const dir = path.join(ws, 'raw', ...(locale ? [locale] : []), 'clips');
  for (const ext of ['.mp4', '.mov', '.m4v']) { const f = path.join(dir, name + ext); if (exists(f)) return f; }
  return null;
}

function editTaps() {
  if (!args.name) die('Usage: preview.mjs taps --name <clip> [--add "t,x,y;…"] [--swipe "t,x,y,x2,y2[,dur]"] [--clear] [--locale code]');
  const name = slug(String(args.name).replace(/\.\w+$/, ''));
  const clip = clipFile(name, args.locale ? String(args.locale) : null) || die(`No clip "${name}" in raw/${args.locale ? `${args.locale}/` : ''}clips/`);
  const file = clip.replace(/\.\w+$/, '.taps.json');
  let taps = args.clear ? [] : readTaps(clip);
  const nums = (v) => String(v).split(',').map(Number);
  for (const part of String(args.add || '').split(';').filter(Boolean)) {
    const [t, x, y] = nums(part);
    if ([t, x, y].some((v) => Number.isNaN(v)) || x < 0 || x > 1 || y < 0 || y > 1) die(`Bad tap "${part}" — use seconds,x,y with x and y as 0–1 fractions`);
    taps.push({ t, x, y, kind: 'tap' });
  }
  for (const part of String(args.swipe || '').split(';').filter(Boolean)) {
    const [t, x, y, x2, y2, dur = 0.45] = nums(part);
    if ([t, x, y, x2, y2].some((v) => Number.isNaN(v))) die(`Bad swipe "${part}" — use seconds,x,y,x2,y2[,duration]`);
    taps.push({ t, x, y, x2, y2, dur, kind: 'swipe' });
  }
  taps.sort((a, b) => a.t - b.t);
  if (args.add || args.swipe || args.clear) writeJson(file, { source: 'manual', taps });
  const an = analyzeMedia(clip, ensureDir(path.join(ws, '.cache', 'preview')));
  const snapped = snapTaps(an, taps);
  if (!taps.length) log.info(`${path.relative(process.cwd(), file)}: no taps`);
  snapped.forEach((t, i) => console.log(`  ${t.kind === 'swipe' ? 'swipe' : 'tap  '} ${taps[i].t.toFixed(2)} s → ${t.t.toFixed(2)} s${t.snapped ? ' (snapped to the reaction)' : ' (no reaction found nearby — kept)'} at ${t.x.toFixed(2)},${t.y.toFixed(2)}${t.kind === 'swipe' ? ` → ${t.x2},${t.y2}` : ''}`));
}

function liveTap() {
  if (!args.name || !args.at) die('Usage: preview.mjs tap --name <clip being recorded> --at x,y [--to x2,y2] [--locale code]');
  const name = slug(String(args.name).replace(/\.\w+$/, ''));
  const dir = path.join(ws, 'raw', ...(args.locale ? [String(args.locale)] : []), 'clips');
  if (!exists(path.join(dir, `.${name}.session.json`))) die(`No recording of "${name}" is running — start: preview.mjs record --name ${name}`);
  const [x, y] = String(args.at).split(',').map(Number);
  const to = args.to ? String(args.to).split(',').map(Number) : null;
  fs.appendFileSync(path.join(dir, `.${name}.live-taps.jsonl`), JSON.stringify({ at: Date.now(), x, y, ...(to ? { x2: to[0], y2: to[1], dur: 0.45, kind: 'swipe' } : { kind: 'tap' }) }) + '\n');
  log.ok(`tap logged at ${x},${y}${to ? ` → ${to.join(',')}` : ''}`);
}
