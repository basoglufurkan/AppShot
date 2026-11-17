#!/usr/bin/env node
// App Store creative assets (iOS 27+): product page header and search results — images and looping videos.
//   node scripts/creative.mjs [--assets header,search,universal] [--locales en-US,tr] [--video]
//        [--fps 30] [--duration 12] [--codec h264|hevc|prores] [--layout creative-stage] [--scene pond] [--draft]
//        [--explain]  print what the director decided and why, render nothing
//        [--manual]   ignore the director: only plan.creative and the old defaults
// Output:  appshot/out/creative/<locale>/header.png · header.mp4 · search.png · search.mp4 · universal.png
// Review:  appshot/review/creative-<locale>.png (posters with safe areas + motion filmstrips)
// The director (engine/lib/director.mjs) decides scene, layouts, motion, phrase and loop from the app; anything set in
// plan.creative wins (see skills/aso/creative-assets.md). Decisions + reasons: appshot/review/creative-direction.json.

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, findWorkspace, exists, list, ensureDir, readJson, writeJson, fileUrl, L, die, log } from '../engine/lib/util.mjs';
import { loadPlan, renderPlan, renderHtml } from '../engine/render.mjs';
import { renderLoopVideo, loopStills, hasFfmpeg, probe } from '../engine/video.mjs';
import { Browser } from '../engine/lib/cdp.mjs';
import { lintCaption } from '../engine/lib/copyrules.mjs';
import { sizeSpec } from '../engine/compose.mjs';
import { esc } from '../engine/lib/html.mjs';
import { direct } from '../engine/lib/director.mjs';

const ASSETS = {
  header: { size: 'appstore-header', layout: 'creative-split' },
  search: { size: 'appstore-search', layout: 'creative-split' },
  universal: { size: 'appstore-universal', layout: 'creative-split' },
};

const args = parseArgs();
const ws = findWorkspace(args);
const planFile = path.join(ws, 'plan.json');
if (!exists(planFile)) die('No plan.json yet — creative assets reuse the screenshot plan (screens, theme, captions).');
const plan = loadPlan(planFile);
const assets = list(args.assets).length ? list(args.assets) : Object.keys(ASSETS);
for (const a of assets) if (!ASSETS[a]) die(`Unknown asset "${a}". Use header, search, universal.`);
const locales = list(args.locales || args.locale).length ? list(args.locales || args.locale) : plan.locales || [plan.defaultLocale || 'en-US'];
const profile = readJson(path.join(ws, 'profile.json'), null);
if (args.scene) plan.creative = { ...(plan.creative || {}), scene: args.scene };
// Director first, then the plan on top (explicit settings win, per asset and per option).
const auto = args.manual || plan.creative?.auto === false ? null : await direct({ plan, profile, locales });
const cfg = mergeCreative(auto?.creative || {}, plan.creative || {});
function mergeCreative(a, b) {
  const out = { ...a, ...b };
  for (const k of Object.keys(ASSETS)) if (a[k] || b[k]) out[k] = { ...(a[k] || {}), ...(b[k] || {}), options: { ...(a[k]?.options || {}), ...(b[k]?.options || {}) } };
  if (a.headline || b.headline) out.headline = { ...(a.headline || {}), ...(typeof b.headline === 'string' ? { [plan.defaultLocale || 'en-US']: b.headline } : b.headline || {}) };
  return out;
}
if (auto) {
  log.step('Creative direction');
  for (const r of auto.reasons) log.info(r);
  if (plan.creative) log.info('Settings in plan.creative override these decisions.');
  writeJson(path.join(ensureDir(path.join(ws, 'review')), 'creative-direction.json'), { createdAt: new Date().toISOString(), scene: auto.scene, variant: auto.variant, ranking: auto.ranking, reasons: auto.reasons, decided: auto.creative, effective: cfg });
}
if (args.explain) {
  if (!auto) log.info('Director off (--manual or plan.creative.auto = false).');
  console.log(JSON.stringify({ header: cfg.header, search: cfg.search, universal: cfg.universal, motion: cfg.motion, duration: cfg.duration, scene: cfg.scene }, null, 2));
  process.exit(0);
}
const draft = !!args.draft;
const wantVideo = !!(args.video ?? cfg.video);
const fps = Number(args.fps || cfg.fps || 30);
const duration = Number(args.duration || cfg.duration || 12);
const codec = args.codec || cfg.codec || 'h264';
if (wantVideo && !hasFfmpeg()) die('Video needs ffmpeg (brew install ffmpeg). Images still work without --video.');
if (wantVideo && !draft && (![30, 60].includes(fps) || duration < 5 || duration > 30)) die('Apple accepts 30 or 60 fps and 5–30 seconds for header/search videos.');

// Screens: plan.creative.screens, otherwise the distinct captures used by the screenshot shots (hook first).
const screens = cfg.screens || [...new Set(plan.shots.flatMap((s) => [s.screen, ...(s.screens || [])]).filter((x) => typeof x === 'string'))].slice(0, 5);
if (!screens.length) die('No screens to show. Capture some into appshot/raw first.');
const hook = plan.shots[0] || {};
const cardsShot = plan.shots.find((s) => s.cards?.length);

function shotFor(asset) {
  const a = { ...(cfg[asset] || {}) };
  const pick = (k, d) => (a[k] !== undefined ? a[k] : cfg[k] !== undefined ? cfg[k] : d);
  return {
    id: asset,
    layout: args.layout || pick('layout', ASSETS[asset].layout),
    screens: pick('screens', screens),
    headline: pick('headline', hook.headline),
    subhead: pick('subhead', undefined),
    cards: pick('cards', cardsShot?.cards),
    options: { ...(cfg.options || {}), ...(a.options || {}) },
    poster: pick('poster', 0.42),
  };
}

const outRoot = path.join(ws, draft ? 'drafts' : 'out', 'creative');
const tmp = path.join(ws, '.cache', 'creative');
const report = { createdAt: new Date().toISOString(), draft, video: wantVideo, fps, duration, codec, assets: [] };
const boards = [];
const browser = await Browser.launch();
try {
  const page = await browser.newPage();
  for (const locale of locales) {
    const board = { locale, items: [] };
    for (const asset of assets) {
      const spec = sizeSpec(ASSETS[asset].size);
      const shot = shotFor(asset);
      const p = { ...plan, panorama: false, creative: { ...cfg, poster: shot.poster }, shots: [shot] };
      const dir = ensureDir(path.join(outRoot, locale));
      // Image (poster pose).
      const rep = await renderPlan({ plan: p, outDir: path.join(tmp, 'img'), sizes: [spec.id], locales: [locale], scale: draft ? 0.4 : 1, browser, quiet: true, reportFile: path.join(tmp, `${asset}.${locale}.json`) });
      const job = rep.jobs[0];
      const ext = spec.formats.includes('png') ? '.png' : '.jpg';
      const image = path.join(dir, `${asset}${ext}`);
      fs.copyFileSync(job.files[0], image);
      const slot = job.slots[0];
      const issues = [];
      for (const t of slot.text) if (!t.ok) issues.push('phrase does not fit — shorten it');
      if (slot.missingScreens) issues.push('placeholder screen');
      const head = L(shot.headline, locale, plan.defaultLocale);
      for (const i of lintCaption(head, { locale, store: 'ios', kind: 'headline' }).issues) if (i.level !== 'info') issues.push(`${i.code}: ${i.msg}`);
      if (head && head.replace(/\*\*/g, '').split(/\s+/).length > 6) issues.push('creative phrase over 6 words — Apple asks for "a short phrase that enhances your visual"');
      const item = { asset, locale, size: `${spec.width}×${spec.height}`, image, layout: shot.layout, scene: shot.options.scene || shot.options.backdrop || null, issues };
      // Video.
      if (wantVideo && spec.video) {
        const vScale = draft ? 0.25 : 1;
        const res = await renderLoopVideo({ plan: p, sizeId: spec.id, locale, out: path.join(dir, `${asset}.mp4`), page, fps: draft ? 15 : fps, duration, scale: vScale, codec,
          onProgress: (f, n) => process.stdout.write(`\r  ${asset} · ${locale} video ${Math.round((f / n) * 100)}%   `) });
        process.stdout.write('\n');
        const pr = probe(res.file);
        item.video = { file: res.file, ...(pr || {}) };
        if (pr && !draft) {
          if (pr.width !== spec.width || pr.height !== spec.height) issues.push(`video is ${pr.width}×${pr.height}, expected ${spec.width}×${spec.height}`);
          if (Math.abs(pr.fps - fps) > 0.5) issues.push(`video fps ${pr.fps}`);
          if (pr.duration < 5 || pr.duration > 30.05) issues.push(`video duration ${pr.duration.toFixed(1)} s (5–30 s)`);
        }
      }
      // Filmstrip of the loop for the review board.
      const st = await loopStills({ plan: p, sizeId: spec.id, locale, page, scale: Math.min(0.2, 900 / spec.width) });
      item.stills = st.stills.map((b, i) => { const f = path.join(tmp, `${asset}.${locale}.${i}.jpg`); fs.writeFileSync(f, b); return f; });
      item.safe = spec.safe;
      item.crops = spec.crops || [];
      board.items.push(item);
      report.assets.push({ ...item, stills: undefined });
      log.ok(`${locale} · ${asset} ${item.size}${item.video ? ` + video ${item.video.duration?.toFixed?.(1) ?? duration}s` : ''}${issues.length ? `  ⚠ ${issues.join(' | ')}` : ''}`);
    }
    boards.push(board);
  }
  // Review boards: poster with the safe area drawn on it, what iPhone actually shows, plus six moments of the loop.
  const phonePreviews = (it) => {
    const spec = sizeSpec(ASSETS[it.asset].size);
    const pv = (it.crops || []).filter((c) => c.preview);
    if (!pv.length) return '';
    return `<aside>${pv.map((c) => {
      const w = 600, h = w / ((c.w * spec.width) / (c.h * spec.height)), iw = w / c.w;
      return `<figure><div class="phone" style="width:${w}px;height:${Math.round(h)}px"><img src="${fileUrl(it.image)}" style="width:${iw}px;margin-left:${-c.x * iw}px;margin-top:${-c.y * iw * (spec.height / spec.width)}px"></div><figcaption>As shown: ${esc(c.label)}</figcaption></figure>`;
    }).join('')}</aside>`;
  };
  for (const b of boards) {
    const rows = b.items.map((it) => {
      const s = it.safe;
      const crops = (it.crops || []).map((c) => `<i class="crop" style="left:${c.x * 100}%;top:${c.y * 100}%;width:${c.w * 100}%;height:${c.h * 100}%"><b>${esc(c.label)}</b></i>`).join('');
      return `<section><h2>${esc(it.asset)} · ${esc(it.size)} · ${esc(it.layout)}${it.scene ? ` · ${esc(it.scene)}` : ''}${it.video ? ' · video' : ''}</h2>
        <div class="row"><div class="poster"><img src="${fileUrl(it.image)}"><i class="safe" style="left:${s.x * 100}%;top:${s.y * 100}%;width:${s.w * 100}%;height:${s.h * 100}%"></i>${crops}</div>${phonePreviews(it)}</div>
        <div class="strip">${it.stills.map((f, i) => `<figure><img src="${fileUrl(f)}"><figcaption>${Math.round((i / 6) * duration * 10) / 10}s</figcaption></figure>`).join('')}</div>
        ${it.issues.length ? `<p class="warn">${it.issues.map(esc).join('<br>')}</p>` : ''}</section>`;
    }).join('');
    const html = `<!doctype html><meta charset="utf-8"><style>
      body{margin:0;width:1900px;background:#e8e8ec;font:500 20px -apple-system,Helvetica;color:#333;padding:30px;box-sizing:border-box}
      h1{font:700 30px -apple-system;margin:0 0 20px}h2{font:700 22px -apple-system;margin:26px 0 10px}
      .row{display:flex;gap:30px;align-items:flex-start}aside{display:flex;flex-direction:column;gap:18px}.phone{overflow:hidden;border-radius:26px;box-shadow:0 6px 24px rgba(0,0,0,.25);background:#000}.phone img{display:block}
      .poster{position:relative;width:1200px;flex:none}.poster img{width:100%;display:block;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.2)}
      .safe{position:absolute;border:3px dashed rgba(255,59,48,.9);border-radius:6px}.crop{position:absolute;border:2px solid rgba(0,122,255,.85)}.crop b{position:absolute;left:6px;top:4px;font:600 14px -apple-system;color:#fff;background:rgba(0,122,255,.85);padding:1px 6px;border-radius:4px}
      .dir{background:#fff;border-radius:12px;padding:14px 18px;margin:0 0 10px;font-size:17px;line-height:1.45;color:#444}.dir li{margin:2px 0}
      .strip{display:flex;gap:10px;margin-top:12px}.strip img{width:290px;display:block;border-radius:8px}figure{margin:0}figcaption{font-size:16px;color:#777}
      .warn{color:#c0392b}</style><h1>${esc(L(plan.app?.name, b.locale) || 'App')} — creative assets · ${esc(b.locale)} <span style="font-weight:500;font-size:20px;color:#777">red dashes = safe area (key elements), blue = crops (iPhone header and search, universal 21:9 / 3:2); right = what iPhone shows</span></h1>${auto ? `<ul class="dir">${auto.reasons.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}${rows}`;
    const out = path.join(ensureDir(path.join(ws, 'review')), `creative-${b.locale}${draft ? '-draft' : ''}.png`);
    const height = 110 + (auto ? 40 + auto.reasons.length * 26 : 0) + b.items.reduce((a, it) => { const s = sizeSpec(ASSETS[it.asset].size); return a + 1200 * (s.height / s.width) + 290 * (s.height / s.width) + 110 + (it.issues.length ? 30 * it.issues.length : 0); }, 0);
    await renderHtml(html, { width: 1900, height, out, browser });
    log.ok(path.relative(process.cwd(), out));
  }
} finally {
  await browser.close();
}
writeJson(path.join(ws, 'review', `creative-report${draft ? '-draft' : ''}.json`), report);
log.info('LOOK at the board: one clear idea, focal point inside the red safe area, phrase short and readable, loop smooth.');
if (!wantVideo) log.info('Add --video for looping header/search videos (needs ffmpeg).');
