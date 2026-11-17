#!/usr/bin/env node
// Browse the animated key-art scenes used by App Store creative assets (engine/scenes).
//   node scripts/scenes.mjs list                       id, mood, niches
//   node scripts/scenes.mjs pick [--project .]         what the director would choose for this app, and why
//   node scripts/scenes.mjs board [--project .] [--size appstore-header] [--scenes a,b]
//        every scene in your theme at the poster moment → appshot/review/scenes.png

import path from 'node:path';
import fs from 'node:fs';
import { parseArgs, findWorkspace, exists, list, ensureDir, readJson, fileUrl, die, log, L } from '../engine/lib/util.mjs';
import { scenes as allScenes } from '../engine/registry.mjs';
import { loadPlan, renderPlan, renderHtml } from '../engine/render.mjs';
import { rankScenes, sceneLibrary } from '../engine/lib/director.mjs';
import { Browser } from '../engine/lib/cdp.mjs';
import { esc } from '../engine/lib/html.mjs';

const args = parseArgs();
const cmd = args._[0] || 'list';
const S = await allScenes();

if (cmd === 'list') {
  for (const m of Object.values(S)) console.log(`  ${m.id.padEnd(12)} ${m.mood.padEnd(9)} ${m.summary}\n  ${''.padEnd(22)}niches: ${(m.niches || []).join(', ') || '—'}${m.variants ? `  · variants: ${m.variants.join(', ')}` : ''}`);
  process.exit(0);
}

const ws = findWorkspace(args);
const planFile = path.join(ws, 'plan.json');
if (!exists(planFile)) die('No plan.json yet — scenes use the plan theme. Run plan.mjs init first.');
const plan = loadPlan(planFile);
const profile = readJson(path.join(ws, 'profile.json'), null);

if (cmd === 'pick') {
  const { direct } = await import('../engine/lib/director.mjs');
  const d = await direct({ plan, profile });
  for (const r of d.ranking) console.log(`  ${r.id.padEnd(12)} ${String(r.score).padStart(5)}  ${r.why.join('; ')}`);
  log.ok(`director → ${d.scene}${d.variant ? ` (${d.variant})` : ''}`);
  process.exit(0);
}

if (cmd === 'board') {
  const size = args.size || 'appstore-header';
  const ids = list(args.scenes).length ? list(args.scenes) : Object.keys(S);
  const tmp = path.join(ws, '.cache', 'scenes');
  const browser = await Browser.launch();
  const tiles = [];
  try {
    for (const id of ids) {
      if (!S[id]) die(`Unknown scene "${id}". Known: ${Object.keys(S).join(', ')}`);
      const shot = { id, layout: 'creative-scene', options: { scene: id } };
      const p = { ...plan, panorama: false, creative: { ...(plan.creative || {}), poster: S[id].poster ?? 0.42 }, shots: [shot] };
      const rep = await renderPlan({ plan: p, outDir: path.join(tmp, id), sizes: [size], locales: [plan.locales?.[0] || 'en-US'], scale: 0.25, browser, quiet: true, reportFile: path.join(tmp, `${id}.json`) });
      tiles.push({ id, file: rep.jobs[0].files[0] });
    }
    const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;width:1900px;background:#e8e8ec;font:500 18px -apple-system,Helvetica;color:#333;padding:24px;box-sizing:border-box}
      h1{font:700 28px -apple-system;margin:0 0 16px}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}figure{margin:0}img{width:100%;display:block;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.15)}
      figcaption{margin-top:6px}b{font-weight:700}span{color:#777;font-size:15px}</style>
      <h1>${esc(L(plan.app?.name, 'en-US') || 'App')} — scenes (${esc(size)}, poster moment)</h1><div class="g">${tiles.map((t) => `<figure><img src="${fileUrl(t.file)}"><figcaption><b>${esc(t.id)}</b> <span>${esc(S[t.id].summary)}</span></figcaption></figure>`).join('')}</div>`;
    const out = path.join(ensureDir(path.join(ws, 'review')), 'scenes.png');
    const tileH = (1900 - 48 - 32) / 3 * (size === 'appstore-header' ? 1646 / 3840 : size === 'appstore-search' ? 2560 / 3840 : 2950 / 5244);
    await renderHtml(html, { width: 1900, height: 90 + Math.ceil(tiles.length / 3) * (tileH + 70), out, browser });
    log.ok(path.relative(process.cwd(), out));
  } finally {
    await browser.close();
  }
  process.exit(0);
}
die(`Unknown command "${cmd}". Use list | pick | board.`);
