#!/usr/bin/env node
// Score a rendered set 0–100 with a breakdown and the fixes that would raise it most.
// Reads plan.json + review/(draft-|render-)report.json and samples the actual PNG pixels for contrast.
//   node scripts/score.mjs [--draft] [--locale en-US] [--size iphone-6.9] [--json]
//   node scripts/score.mjs --plan appshot/variants/b.json --report appshot/review/variants/b/draft-report.json
// Importable: scoreSet({ plan, report, profile, locale, size }) → { total, parts, shots, fixes }

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, findWorkspace, readJson, writeJson, exists, L, die, log } from '../engine/lib/util.mjs';
import { lintPlan, words, STOP } from '../engine/lib/copyrules.mjs';
import { plain } from '../engine/lib/html.mjs';
import { decodePng, regionStats } from '../engine/lib/png.mjs';
import { layouts as loadLayouts } from '../engine/registry.mjs';
import { resolveTheme, highlightContrast } from '../engine/compose.mjs';

const BENEFIT = /\b(you|your|yours|sen|seni|senin|sana|kendin|without|in seconds|in minutes|every|never|always|finally|instantly|anywhere|together)\b|(\d)|(ın|in|un|ün)\b/i;
const VERB_START = /^(\*\*)?(get|make|turn|build|track|plan|save|learn|find|stay|keep|feel|sleep|lose|grow|start|stop|meet|see|know|cook|create|edit|scan|speak|write|focus|move|train|run|eat|breathe|pay|send|share|play|listen|read|watch|organize|organise|never|take|go|do|be|hit|reach|beat|own|spend|earn|invest|fix|clean|protect|explore|discover|try|connect|capture|transform|unlock|master|bul|yap|kazan|başla|öğren|takip|planla|izle|dinle|oku|yaz|uyu|koş|ye|harca|biriktir|yönet|keşfet|oluştur|düzenle|tara|çevir|konuş|paylaş|kontrol|kaydet|hisset|bırak|tamamla)\b/i;

const TR_VERB_END = /(izle|gör|bul|yap|başla|kazan|öğren|et|planla|yönet|keşfet|bozma|kaçırma|unutma|bırak|uyar|kal|olur|eder|yapar|başlıyor|hazır|anla|koru|biriktir|harca|tamamla|uyu|koş|dinle|oku|yaz|çevir|tara|paylaş|kaydet|hisset|ulaş|ver|al|seç|tut|getir|gel|git|çalış|düşün|başlat|aç|kapat|bitir|yakala|yükselt)(ır|ir|ur|ür|ar|er|in|ün|un|ın|sin|sun|abilirsin|ebilirsin|iyor|ıyor|uyor|üyor)?[.!]?$/i;
const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lumOfGray = (g) => lin(g);
const contrastFromLums = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

export async function scoreSet({ plan, report, profile = {}, locale, size, imagesDir }) {
  const layoutsMeta = await loadLayouts();
  const job = report.jobs.find((j) => j.locale === locale && j.size === size) || report.jobs[0];
  locale = job.locale; size = job.size;
  const store = job.store || (size.startsWith('android') ? 'android' : 'ios');
  const fb = plan.defaultLocale || plan.locales?.[0];
  const lint = lintPlan(plan, { locale, store, size, profile, layoutsMeta });
  const kwList = (Array.isArray(plan.keywords) ? plan.keywords : plan.keywords?.[locale]) || [];
  const canvasW = job.canvas?.width || job.width;
  const scale = job.width / canvasW;
  const shots = [];
  const fixes = [];
  const fix = (pts, msg) => fixes.push({ pts, msg });

  const visible = plan.shots.filter((s) => !(s.skipOn || []).includes(store) && !(s.skipOn || []).includes(size));
  for (let k = 0; k < job.slots.length; k++) {
    const slot = job.slots[k];
    const s = visible[k] || {};
    const head = L(s.headline, locale, fb);
    const sub = L(s.subhead, locale, fb);
    const w = words(head);
    const issues = lint.shots[k]?.issues || [];
    const n = k + 1;

    // Copy (0–35)
    let copy = 35;
    const errs = issues.filter((i) => i.level === 'error').length, warns = issues.filter((i) => i.level === 'warn').length;
    copy -= errs * 12 + warns * 4;
    if (w.length && (w.length < 2 || w.length > 7)) copy -= 5;
    const both = `${plain(head)} ${plain(sub)}`;
    const trVerb = locale === 'tr' && TR_VERB_END.test(plain(head).split(/\s+/).pop() || '');
    if (head && !BENEFIT.test(both) && !VERB_START.test(head.trim()) && !trVerb) { copy -= 4; if (k < 3) fix(4, `#${n}: make "${plain(head)}" a benefit (an action verb, "you/sen", or a concrete number).`); }
    if (head && !/\*\*/.test(head)) copy -= 2;
    const hl = [...String(head).matchAll(/\*\*(.+?)\*\*/g)].map((m) => m[1].toLocaleLowerCase(locale));
    if (hl.length && hl.every((h) => h.split(/\s+/).every((x) => STOP.has(x) || x.length < 3))) { copy -= 3; fix(3, `#${n}: the highlight sits on a filler word ("${hl[0]}") — accent the word that carries the benefit.`); }
    if (w.length === 7) copy -= 2; else if (w.length === 6) copy -= 1;
    if (sub && words(sub).length > 12) copy -= 2;
    copy = Math.max(0, copy);

    // Legibility at thumbnail size (0–25): App Store search shows each shot ≈120 pt wide.
    let legible = 25;
    const t = slot.text?.[0];
    if (t) {
      // Headline size in the engine's typographic unit u = min(W, H×0.4615)/100, so phone, Play and iPad
      // canvases are judged alike. On a 6.9" iPhone 1u ≈ 1.2 pt in the ~120 pt search thumbnail.
      const unit = Math.min(canvasW, (job.canvas?.height || job.height / scale) * 0.4615) / 100;
      const inU = t.fontSize / unit;
      const ptAtThumb = inU * 1.2;
      if (inU < 5.8) legible -= 15; else if (inU < 7.5) legible -= 8; else if (inU < 8.7) legible -= 3;
      if (!t.ok) { legible -= 10; fix(10, `#${n}: headline does not fit (${t.lines} lines at ${t.fontSize}px) — cut words.`); }
      if (t.lines > 3) legible -= 5;
      // Three short lines of poster-size type (a billboard's word-per-line promise) still read in one look.
      else if (t.lines === 3 && k < 3 && inU < 12) { legible -= 3; fix(3, `#${n}: headline wraps to 3 lines — 2 lines read faster in search results.`); }
      if (t.ok && t.fontSize < t.max * 0.82) { legible -= 2; fix(2, `#${n}: headline was shrunk to ${Math.round((t.fontSize / t.max) * 100)}% to fit — shorter copy renders bigger.`); }
      if (inU < 7.5 && k < 3) fix(8, `#${n}: headline renders small (≈${ptAtThumb.toFixed(1)} pt in a search thumbnail) — shorten it so it renders bigger.`);
    } else if (s.layout !== 'full-bleed') legible -= 10;

    // Contrast from real pixels under the headline (0–15).
    let contrastScore = 15, measured = null;
    if (t && slot.text?.[0]?.rect && job.files?.[k] && exists(job.files[k])) {
      try {
        const img = decodePng(job.files[k]);
        const r = t.rect;
        const st = regionStats(img, r.x * scale, r.y * scale, r.w * scale, r.h * scale, Math.max(1, Math.round(3 * scale)));
        measured = Math.round(contrastFromLums(lumOfGray(st.p10), lumOfGray(st.p90 > 250 ? 255 : st.p90)) * 10) / 10;
        // Text + background both sit inside the box: p10/p90 approximate the two.
        if (measured < 2.2) { contrastScore = 3; fix(10, `#${n}: caption contrast ≈${measured}:1 — change theme/background or text colour.`); }
        else if (measured < 3.2) { contrastScore = 9; fix(5, `#${n}: caption contrast ≈${measured}:1 — aim for 4.5:1.`); }
        else if (measured < 4.5) contrastScore = 12;
      } catch {}
    }

    // The accent highlight itself must be readable (pixel sampling above cannot isolate it).
    if (/\*\*/.test(head || '')) {
      try {
        const th = resolveTheme(plan, s);
        const hc = highlightContrast(th);
        if (hc < 2) { contrastScore = Math.max(0, contrastScore - 8); fix(8, `#${n}: highlighted words are ${hc.toFixed(1)}:1 on the background — darker accent or "highlight": "pill".`); }
        else if (hc < 3) { contrastScore = Math.max(0, contrastScore - 4); fix(4, `#${n}: highlight contrast ${hc.toFixed(1)}:1 — aim for 3:1+.`); }
      } catch {}
    }

    // Composition (0–15)
    let comp = 15;
    if (slot.missingScreens) { comp -= 12; fix(12, `#${n}: uses a PLACEHOLDER screen — capture the real screen.`); }
    if (slot.textOverDevice > 0.08) { comp -= 6; fix(6, `#${n}: caption overlaps the device.`); }
    if (slot.brokenImages?.length) { comp -= 10; fix(10, `#${n}: broken image.`); }
    if (k < 3 && ['text-hero', 'comparison', 'review-quote'].includes(s.layout) && k !== 0) comp -= 3;

    for (const i of issues.filter((x) => x.level !== 'info')) fix(i.level === 'error' ? 12 : 4, `#${n}: ${i.msg}`);
    const total = copy + legible + contrastScore + comp;
    shots.push({ n, id: s.id, layout: s.layout, headline: plain(head), copy, legible, contrast: contrastScore, measuredContrast: measured, composition: comp, total, weight: k < 3 ? 1.6 : 1 });
  }

  // Story (0–10 bonus/penalty on the whole set)
  let story = 10;
  const layoutsUsed = visible.map((s) => s.layout || 'hero-device');
  const variety = new Set(layoutsUsed).size / Math.max(1, layoutsUsed.length);
  if (variety < 0.4) { story -= 4; fix(5, 'Most shots share one layout — vary rhythm (zoom-callout, floating-cards, device-top…).'); }
  if (!layoutsMeta[layoutsUsed[0]]?.hook) { story -= 3; fix(4, `Shot 1 uses "${layoutsUsed[0]}" — open with a hook layout.`); }
  // Shot 1 has one job — stop the scroll — so it must not read like a sibling of the shots that show the app:
  // its promise is the biggest type in the set. (A full-bleed opener stops the scroll with its pixels instead.)
  const sizes = job.slots.map((sl) => sl.text?.[0]?.fontSize || 0);
  const others = sizes.slice(1).filter(Boolean).sort((a, b) => a - b);
  if (sizes[0] && others.length && layoutsUsed[0] !== 'full-bleed') {
    const ratio = sizes[0] / others[Math.floor(others.length / 2)];
    if (ratio < 1.12) { story -= 2; fix(3, `Shot 1 reads like the rest: its headline is ${Math.round(ratio * 100)} % the size of the others. Its one job is to stop the scroll — make the promise the biggest type in the set ("layout": "billboard": 2–4 words, a short kicker, the key UI popping out).`); }
  }
  if (visible.length < 5) { story -= 3; fix(3, 'Fewer than 5 shots — add shots that answer objections.'); }
  for (let i = 1; i < layoutsUsed.length; i++) if (layoutsUsed[i] === layoutsUsed[i - 1]) { story -= 2; fix(2, `Shots ${i} and ${i + 1} use the same layout back to back — break the rhythm.`); break; }
  const first3Text = visible.slice(0, 3).map((s) => `${plain(L(s.headline, locale, fb))} ${plain(L(s.subhead, locale, fb))} ${JSON.stringify(s.cards || s.stat || '')}`).join(' ');
  if (!/\d/.test(first3Text)) { story -= 2; fix(3, 'No concrete number in shots 1–3 (minutes, items, results) — specifics convert better than adjectives.'); }
  for (const i of lint.set) if (i.level !== 'info') { story -= i.level === 'error' ? 5 : 2; fix(i.level === 'error' ? 10 : 3, i.msg); }
  if (kwList.length) {
    const first3 = visible.slice(0, 3).map((s) => `${plain(L(s.headline, locale, fb))} ${plain(L(s.subhead, locale, fb))}`.toLocaleLowerCase(locale)).join(' ');
    const hit = kwList.filter((kw) => first3.includes(kw.toLocaleLowerCase(locale)));
    if (!hit.length) { story -= 3; fix(4, `None of the target keywords (${kwList.slice(0, 4).join(', ')}) appear in shots 1–3.`); }
  }
  story = Math.max(0, story);

  const wsum = shots.reduce((a, s) => a + s.weight, 0) || 1;
  const shotAvg = shots.reduce((a, s) => a + s.total * s.weight, 0) / wsum; // out of 90
  const total = Math.round(Math.max(0, Math.min(100, shotAvg + story)));
  const parts = {
    copy: avg(shots, 'copy'), legibility: avg(shots, 'legible'), contrast: avg(shots, 'contrast'), composition: avg(shots, 'composition'), story,
  };
  const uniq = [...new Map(fixes.sort((a, b) => b.pts - a.pts).map((f) => [f.msg, f])).values()].slice(0, 12);
  return { locale, size, store, total, parts, shots, fixes: uniq, verdict: total >= 85 ? 'ship' : total >= 70 ? 'iterate' : 'rework' };
}
const avg = (arr, k) => Math.round((arr.reduce((a, s) => a + s[k], 0) / Math.max(1, arr.length)) * 10) / 10;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs();
  const ws = findWorkspace(args);
  const plan = readJson(args.plan ? path.resolve(args.plan) : path.join(ws, 'plan.json'));
  const reportFile = args.report ? path.resolve(args.report) : path.join(ws, 'review', args.draft ? 'draft-report.json' : 'render-report.json');
  if (!exists(reportFile)) die(`No render report at ${reportFile}. Render first (node scripts/render.mjs${args.draft ? ' --draft' : ''}).`);
  const report = readJson(reportFile);
  const profile = readJson(path.join(ws, 'profile.json'), {});
  const combos = report.jobs.filter((j) => (!args.locale || j.locale === args.locale) && (!args.size || j.size === args.size));
  const results = [];
  for (const j of combos) results.push(await scoreSet({ plan, report, profile, locale: j.locale, size: j.size }));
  if (args.json) { console.log(JSON.stringify(results, null, 2)); process.exit(0); }
  for (const r of results) {
    console.log(`\n${r.size} · ${r.locale}  →  ${r.total}/100  (${r.verdict})`);
    console.log(`  copy ${r.parts.copy}/35 · legibility ${r.parts.legibility}/25 · contrast ${r.parts.contrast}/15 · composition ${r.parts.composition}/15 · story ${r.parts.story}/10`);
    for (const s of r.shots) console.log(`  ${String(s.n).padStart(2)} ${String(s.total).padStart(3)}  ${s.layout?.padEnd(18) || ''} ${s.headline}${s.measuredContrast ? `  (contrast ${s.measuredContrast}:1)` : ''}`);
    if (r.fixes.length) { console.log('  Top fixes:'); for (const f of r.fixes.slice(0, 8)) console.log(`   +${String(f.pts).padStart(2)}  ${f.msg}`); }
  }
  writeJson(path.join(path.dirname(reportFile), args.report ? 'score.json' : args.draft ? 'draft-score.json' : 'score.json'), results);
  log.info('Iterate until every combination scores ≥ 85 and has no errors; then LOOK at review/contact-*.png before shipping.');
}
