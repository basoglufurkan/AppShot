#!/usr/bin/env node
// Browse layouts.
//   node scripts/layouts.mjs list
//   node scripts/layouts.mjs info zoom-callout
//   node scripts/layouts.mjs board [--shot 1]      every layout dressed with your shot + sample data → review/layouts.png

import path from 'node:path';
import fs from 'node:fs';
import { parseArgs, findWorkspace, exists, fileUrl, die, log } from '../engine/lib/util.mjs';
import { layouts as allLayouts } from '../engine/registry.mjs';
import { loadPlan, renderPlan, renderHtml } from '../engine/render.mjs';
import { Browser } from '../engine/lib/cdp.mjs';

const args = parseArgs();
const cmd = args._[0] || 'list';
const M = await allLayouts();

if (cmd === 'list') {
  for (const m of Object.values(M).filter((x) => !x.internal)) console.log(`  ${m.id.padEnd(19)} ${m.hook ? 'hook ' : '     '} ${m.summary}`);
  process.exit(0);
}
if (cmd === 'info') {
  const m = M[args._[1]] || die(`Unknown layout ${args._[1]}`);
  console.log(JSON.stringify(m, null, 2));
  process.exit(0);
}

// Demo content so every layout renders something meaningful on the board.
const SAMPLE = {
  cards: [{ icon: '🔥', value: '12', title: 'day streak' }, { icon: '📈', value: '+18%', title: 'this month' }, { icon: '⏱️', value: '25 min', title: 'per day' }],
  bullets: ['Personal plan in minutes', 'Works offline', 'Private by design'],
  notifications: [{ title: 'Time for today’s session', body: 'You are 2 days from a new record', time: 'now' }, { title: 'Weekly recap is ready', body: 'See what changed', time: '9:41' }],
  messages: [{ from: 'user', text: 'Plan my week around 3 workouts' }, { from: 'ai', text: 'Done — Mon, Wed, Fri at 7:30. Want reminders?' }],
  zoom: { rect: [0.05, 0.14, 0.9, 0.18] },
  pop: { rect: [0.05, 0.14, 0.9, 0.18] },
  stat: { value: '3×', label: 'faster', source: 'sample' },
  rating: { value: '4.8', label: 'sample rating', source: 'sample' },
  quotes: [{ text: 'Finally an app I actually open every day.', author: 'sample review', rating: 5, source: 'sample' }],
  compare: { left: { title: 'Before', items: ['Scattered notes', 'Forgotten goals'] }, right: { title: 'With the app', items: ['One clear plan', 'Daily nudges'] } },
  chips: ['Offline', 'No ads', 'Private'],
  labels: { before: 'Before', after: 'After' },
  pieces: [{ rect: [0.05, 0.14, 0.9, 0.16], y: 0.42 }, { rect: [0.05, 0.42, 0.9, 0.14], y: 0.62 }],
};

if (cmd === 'board') {
  const ws = findWorkspace(args);
  if (!exists(path.join(ws, 'plan.json'))) die('No plan.json — board needs a shot to dress.');
  const plan = loadPlan(path.join(ws, 'plan.json'));
  const base = plan.shots[(Number(args.shot) || 1) - 1];
  const allScreens = plan.shots.flatMap((s) => s.screens || [s.screen]).filter(Boolean);
  const ids = Object.keys(M).filter((id) => !M[id].landscape && !M[id].internal);
  const shots = ids.map((id) => ({ ...SAMPLE, ...base, id, layout: id, screens: allScreens.length ? [base.screen || allScreens[0], ...allScreens.filter((s) => s !== base.screen)].slice(0, 4) : undefined }));
  const board = { ...plan, panorama: false, shots };
  const locale = plan.defaultLocale || plan.locales?.[0];
  const size = args.size || plan.sizes?.[0] || 'iphone-6.9';
  const tmp = path.join(ws, '.cache', 'layouts-board');
  const browser = await Browser.launch();
  try {
    const rep = await renderPlan({ plan: board, outDir: tmp, sizes: [size], locales: [locale], scale: 0.22, browser, quiet: true, reportFile: path.join(tmp, 'report.json') });
    const files = rep.jobs[0].files;
    const tw = rep.jobs[0].width, th = rep.jobs[0].height;
    const cols = 7, W = cols * (tw + 24) + 48, H = Math.ceil(files.length / cols) * (th + 64) + 48;
    const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#ddd;width:${W}px;height:${H}px;font:600 20px -apple-system;display:flex;flex-wrap:wrap;gap:24px;padding:24px;box-sizing:border-box">`
      + files.map((f, i) => `<figure style="margin:0"><img src="${fileUrl(f)}" style="width:${tw}px;height:${th}px;border-radius:10px;display:block"><figcaption style="margin-top:6px;color:#333">${ids[i]}${M[ids[i]].hook ? ' ★' : ''}</figcaption></figure>`).join('');
    const out = path.join(ws, 'review', 'layouts.png');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await renderHtml(html, { width: W, height: H, out, browser });
    log.ok(`${path.relative(process.cwd(), out)} — ${ids.length} layouts (★ = good opener)`);
  } finally { await browser.close(); }
  process.exit(0);
}
die(`Unknown command ${cmd}`);
