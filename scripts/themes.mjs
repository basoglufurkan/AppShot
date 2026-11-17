#!/usr/bin/env node
// Browse themes.
//   node scripts/themes.mjs list [--mood calm]
//   node scripts/themes.mjs board [--shot 1] [--themes a,b,c] [--locale en-US]   renders shot N in every theme → review/themes.png

import path from 'node:path';
import fs from 'node:fs';
import { parseArgs, findWorkspace, list, exists, die, log } from '../engine/lib/util.mjs';
import { themes as allThemes } from '../engine/registry.mjs';
import { loadPlan, renderPlan, renderHtml } from '../engine/render.mjs';
import { fileUrl } from '../engine/lib/util.mjs';
import { Browser } from '../engine/lib/cdp.mjs';

const args = parseArgs();
const cmd = args._[0] || 'list';
const T = allThemes();

if (cmd === 'list') {
  for (const t of Object.values(T)) {
    if (args.mood && !(t.mood || []).includes(args.mood)) continue;
    console.log(`  ${t.id.padEnd(13)} ${(t.dark ? 'dark ' : 'light').padEnd(6)} ${t.fontDisplay?.family?.padEnd(20) || ''} ${(t.mood || []).join(', ')}\n  ${''.padEnd(13)} ${t.description}`);
  }
  process.exit(0);
}

if (cmd === 'board') {
  const ws = findWorkspace(args);
  const planFile = path.join(ws, 'plan.json');
  if (!exists(planFile)) die('No plan.json — board needs a shot to dress.');
  const plan = loadPlan(planFile);
  const n = Math.max(1, Number(args.shot) || 1) - 1;
  const ids = list(args.themes).length ? list(args.themes) : Object.keys(T).filter((id) => id !== 'brand' || plan.brand);
  const base = plan.shots[n] || die(`No shot ${n + 1}`);
  // Keep the plan's accent only on themes where it stays readable; elsewhere show the theme's own accent.
  const { resolveTheme, highlightContrast } = await import('../engine/compose.mjs');
  const accent = plan.themeOverrides?.accent;
  const shots = ids.map((id) => {
    const withAccent = { ...plan, theme: id };
    const ok = accent && highlightContrast(resolveTheme(withAccent)) >= 3;
    return { ...base, id, theme: ok ? { id, accent } : { id, accent: T[id].accent, accentText: T[id].accentText || undefined }, decor: base.decor };
  });
  const board = { ...plan, panorama: false, shots };
  const locale = args.locale || plan.defaultLocale || plan.locales?.[0];
  const size = args.size || plan.sizes?.[0] || 'iphone-6.9';
  const tmp = path.join(ws, '.cache', 'themes-board');
  const browser = await Browser.launch();
  try {
    const rep = await renderPlan({ plan: board, outDir: tmp, sizes: [size], locales: [locale], scale: 0.25, browser, quiet: true, reportFile: path.join(tmp, 'report.json') });
    const files = rep.jobs[0].files;
    const cols = Math.min(8, files.length);
    const tw = Math.round(rep.jobs[0].width), th = Math.round(rep.jobs[0].height);
    const W = cols * (tw + 30) + 60, rows = Math.ceil(files.length / cols), H = rows * (th + 70) + 60;
    const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#ddd;width:${W}px;height:${H}px;font:600 22px -apple-system;display:flex;flex-wrap:wrap;gap:30px;padding:30px;box-sizing:border-box">`
      + files.map((f, i) => `<figure style="margin:0"><img src="${fileUrl(f)}" style="width:${tw}px;height:${th}px;border-radius:12px;display:block;box-shadow:0 6px 20px rgba(0,0,0,.2)"><figcaption style="margin-top:8px;color:#333">${ids[i]}</figcaption></figure>`).join('');
    const out = path.join(ws, 'review', 'themes.png');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await renderHtml(html, { width: W, height: H, out, browser });
    log.ok(`${path.relative(process.cwd(), out)} — ${ids.length} themes on shot ${n + 1}`);
  } finally { await browser.close(); }
  process.exit(0);
}
die(`Unknown command ${cmd}`);
