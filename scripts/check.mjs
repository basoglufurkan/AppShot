#!/usr/bin/env node
// Final gate before upload: validates every PNG in appshot/out against the store specs,
// re-runs copy lint and blocks placeholders. Exit 1 when anything would be rejected.
//   node scripts/check.mjs [--strict]

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, findWorkspace, readJson, exists, ENGINE_DIR, die, log } from '../engine/lib/util.mjs';
import { readPngInfo } from '../engine/lib/png.mjs';
import { lintPlan } from '../engine/lib/copyrules.mjs';
import { layouts } from '../engine/registry.mjs';

const args = parseArgs();
const ws = findWorkspace(args);
const out = path.join(ws, 'out');
if (!exists(out)) die('Nothing in appshot/out — run node scripts/render.mjs first.');
const SZ = readJson(path.join(ENGINE_DIR, 'sizes.json'));
const plan = readJson(path.join(ws, 'plan.json'));
const profile = readJson(path.join(ws, 'profile.json'), {});
const report = readJson(path.join(ws, 'review', 'render-report.json'), { jobs: [] });
const meta = await layouts();
let errors = 0, warns = 0;
const E = (m) => { errors++; log.err(m); };
const W = (m) => { warns++; log.warn(m); };

// Creative assets (header / search results / universal): exact sizes, formats, alpha, video length and fps.
const creativeDir = path.join(out, 'creative');
if (exists(creativeDir)) {
  const { probe } = await import('../engine/video.mjs');
  const spec = (id) => SZ.graphics.find((g) => g.id === id);
  const MAP = { header: spec('appstore-header'), search: spec('appstore-search'), universal: spec('appstore-universal') };
  for (const locale of fs.readdirSync(creativeDir).filter((d) => fs.statSync(path.join(creativeDir, d)).isDirectory())) {
    for (const f of fs.readdirSync(path.join(creativeDir, locale))) {
      const [asset, ext] = [f.replace(/\.\w+$/, ''), f.split('.').pop().toLowerCase()];
      const g = MAP[asset];
      if (!g) continue;
      const file = path.join(creativeDir, locale, f);
      const tag = `creative/${locale}/${f}`;
      if (['png', 'jpg', 'jpeg'].includes(ext)) {
        const info = readPngInfo(file);
        const ok = [[g.width, g.height], ...(g.alt || [])].some(([w, h]) => w === info.width && h === info.height);
        if (!ok) E(`${tag}: ${info.width}×${info.height} — expected ${g.width}×${g.height}`);
        if (!g.formats.includes(ext)) E(`${tag}: ${ext} not accepted (${g.formats.join(', ')})`);
        if (info.hasAlpha) E(`${tag}: alpha channel — not allowed`);
      } else if (['mp4', 'mov', 'm4v'].includes(ext)) {
        if (!g.video) { E(`${tag}: video is not accepted for the ${asset} asset`); continue; }
        const p = probe(file);
        if (!p) { W(`${tag}: ffprobe missing — video not verified`); continue; }
        if (p.width !== g.width || p.height !== g.height) {
          const inRange = g.range && p.width >= g.range.min[0] && p.width <= g.range.max[0] && Math.abs(p.width / p.height - 1.5) < 0.01;
          if (!inRange) E(`${tag}: ${p.width}×${p.height} — expected ${g.width}×${g.height}`);
        }
        if (!g.video.fps.some((r) => Math.abs(p.fps - r) < 0.5)) E(`${tag}: ${p.fps.toFixed(2)} fps — Apple accepts ${g.video.fps.join(' or ')}`);
        if (p.duration < g.video.minSec || p.duration > g.video.maxSec + 0.05) E(`${tag}: ${p.duration.toFixed(1)} s — must be ${g.video.minSec}–${g.video.maxSec} s`);
      }
    }
  }
}

// App previews: accepted resolution, 15–30 s, ≤ 30 fps, H.264 High ≤ level 4.0 (or ProRes), stereo AAC, ≤ 500 MB.
const previewDir = path.join(out, 'preview');
if (exists(previewDir)) {
  const { probeMedia } = await import('../engine/preview.mjs');
  const { motionQA } = await import('../engine/lib/motionqa.mjs');
  const qaRows = readJson(path.join(ws, 'review', 'preview-report.json'), { previews: [] }).previews || [];
  const LP = SZ.limits.preview;
  for (const locale of fs.readdirSync(previewDir).filter((d) => fs.statSync(path.join(previewDir, d)).isDirectory())) {
    const files = fs.readdirSync(path.join(previewDir, locale)).filter((f) => /\.(mp4|mov|m4v)$/i.test(f));
    if (files.length > LP.perLocale) E(`preview/${locale}: ${files.length} videos — Apple allows ${LP.perLocale} per device size and language`);
    for (const f of files) {
      const tag = `preview/${locale}/${f}`;
      const short = f.replace(/(-landscape)?\.\w+$/, '');
      const spec = SZ.previews.find((p) => p.short === short);
      const p = probeMedia(path.join(previewDir, locale, f));
      if (!p) { W(`${tag}: ffprobe missing — preview not verified`); continue; }
      const sizes = spec ? [[spec.width, spec.height], ...(spec.landscape ? [spec.landscape] : []), ...(spec.alt || []), ...(spec.alt || []).map(([w, h]) => [h, w])] : [];
      if (spec && !sizes.some(([w, h]) => w === p.width && h === p.height)) E(`${tag}: ${p.width}×${p.height} — accepted: ${sizes.map((x) => x.join('×')).join(', ')}`);
      if (p.duration < LP.minSec || p.duration > LP.maxSec + 0.05) E(`${tag}: ${p.duration.toFixed(1)} s — app previews must be ${LP.minSec}–${LP.maxSec} s`);
      if (p.fps > LP.maxFps + 0.01) E(`${tag}: ${p.fps.toFixed(2)} fps — max ${LP.maxFps}`);
      if (p.codec === 'h264') {
        if (p.level > LP.h264.maxLevel) E(`${tag}: H.264 level ${p.level / 10} — max ${LP.h264.maxLevel / 10}`);
        if (!/high|main|baseline/i.test(p.profile || '')) W(`${tag}: H.264 profile ${p.profile}`);
        if (p.videoKbps && (p.videoKbps < LP.h264.kbps[0] * 0.8 || p.videoKbps > LP.h264.kbps[1] * 1.05)) W(`${tag}: ${(p.videoKbps / 1000).toFixed(1)} Mbps — Apple targets 10–12 Mbps`);
      } else if (p.codec !== 'prores') E(`${tag}: codec ${p.codec} — use H.264 or ProRes 422 HQ`);
      if (!p.audio) W(`${tag}: no audio track — App Store Connect may reject it; Appshot adds a silent stereo AAC track`);
      else if (p.audio.channels !== 2 || !LP.audio.rates.includes(p.audio.rate)) E(`${tag}: audio ${p.audio.channels} ch ${p.audio.rate} Hz — stereo 44.1 or 48 kHz`);
      if (p.bytes > LP.maxBytes) E(`${tag}: ${(p.bytes / 1e6).toFixed(0)} MB — max 500 MB`);
      // Motion QA (dead holds, bare frames in cuts, a static opening), using the timeline the render recorded.
      const row = qaRows.find((r) => r.file && path.resolve(r.file) === path.resolve(previewDir, locale, f));
      if (row?.timeline) { try { for (const w of motionQA(path.join(previewDir, locale, f), { timeline: row.timeline }).warnings) W(`${tag}: ${w}`); } catch {} }
    }
  }
}

// Store text (appshot/metadata/*.md): limits, rules, keyword field, purchase disclosure.
{
  const { loadAll, checkLocale, paidTierName } = await import('../engine/lib/metadata.mjs');
  const { all, shared } = loadAll(ws);
  for (const [loc, f] of Object.entries(all)) {
    for (const i of checkLocale(f, { locale: loc, profile, plan: readJson(path.join(ws, 'plan.json'), {}), shared, paidName: paidTierName(profile) })) {
      if (i.level === 'error') E(`metadata/${loc}.md ${i.field}: ${i.msg}`);
      else if (i.level === 'warn') W(`metadata/${loc}.md ${i.field}: ${i.msg}`);
    }
  }
}

for (const size of fs.readdirSync(out).filter((d) => !['creative', 'graphics', 'preview', 'promo'].includes(d) && fs.statSync(path.join(out, d)).isDirectory())) {
  const spec = SZ.sizes.find((s) => s.id === size);
  if (!spec) { W(`${size}: unknown size folder`); continue; }
  const lim = SZ.limits[spec.store];
  const okDims = [[spec.width, spec.height], ...(spec.alt || [])];
  for (const locale of fs.readdirSync(path.join(out, size)).filter((d) => !d.startsWith('.') && fs.statSync(path.join(out, size, d)).isDirectory())) {
    const dir = path.join(out, size, locale);
    if (!fs.statSync(dir).isDirectory()) continue;
    const files = fs.readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort();
    const tag = `${size}/${locale}`;
    if (files.length < lim.min || files.length > lim.max) E(`${tag}: ${files.length} screenshots (${spec.store} allows ${lim.min}–${lim.max})`);
    for (const f of files) {
      const file = path.join(dir, f);
      const info = readPngInfo(file);
      const bytes = fs.statSync(file).size;
      if (!okDims.some(([w, h]) => w === info.width && h === info.height)) E(`${tag}/${f}: ${info.width}×${info.height} — expected ${okDims.map((d) => d.join('×')).join(' or ')}`);
      if (info.hasAlpha) E(`${tag}/${f}: has an alpha channel — stores reject transparency (re-render; Appshot flattens automatically)`);
      if (lim.maxBytes && bytes > lim.maxBytes) E(`${tag}/${f}: ${(bytes / 1048576).toFixed(1)} MB > ${lim.maxBytes / 1048576} MB`);
      if (lim.maxRatio && Math.max(info.width, info.height) / Math.min(info.width, info.height) > lim.maxRatio + 1e-6) E(`${tag}/${f}: aspect ratio over ${lim.maxRatio}:1 (Play)`);
    }
    const job = report.jobs.find((j) => j.size === size && j.locale === locale);
    if (!job) { W(`${tag}: no render report — re-render to enable layout checks`); continue; }
    for (const s of job.slots) {
      if (s.missingScreens) E(`${tag} #${s.index + 1}: PLACEHOLDER screen — capture the real one`);
      if (s.brokenImages?.length) E(`${tag} #${s.index + 1}: broken image`);
      for (const t of s.text) if (!t.ok) E(`${tag} #${s.index + 1}: headline overflows its box`);
      if (spec.store === 'android' && lim.captionAreaMax) {
        const area = s.text.reduce((a, t) => a + (t.rect.w * t.rect.h), 0) / (job.canvas.width * job.canvas.height);
        if (area > lim.captionAreaMax) W(`${tag} #${s.index + 1}: caption covers ${Math.round(area * 100)}% of the image (Play guidance: ≤ 20%)`);
      }
    }
    const lint = lintPlan(plan, { locale, store: spec.store, size, profile, layoutsMeta: meta });
    for (const s of lint.shots) for (const i of s.issues) { if (i.level === 'error') E(`${tag} #${s.index + 1}: ${i.msg}`); else if (i.level === 'warn' && args.strict) W(`${tag} #${s.index + 1}: ${i.msg}`); }
    for (const i of lint.set) if (i.level === 'error') E(`${tag}: ${i.msg}`);
  }
}
const stores = new Set(fs.readdirSync(out).filter((d) => !['creative', 'graphics', 'preview', 'promo'].includes(d)).map((d) => SZ.sizes.find((s) => s.id === d)?.store).filter(Boolean));
if (stores.has('ios') && !fs.readdirSync(out).some((d) => ['iphone-6.3', 'iphone-6.9', 'iphone-6.5'].includes(d))) E('No iPhone set rendered (need the 6.3" class, or 6.9"/6.5" for scaling).');
if (profile.app?.supportsIPad && stores.has('ios') && !fs.readdirSync(out).some((d) => d.startsWith('ipad'))) W('The app supports iPad but no iPad set was rendered (ipad-13).');
console.log(errors ? `\n✗ ${errors} blocking issue(s), ${warns} warning(s)` : `\n✓ Store-ready (${warns} warning(s))`);
process.exit(errors ? 1 : 0);
