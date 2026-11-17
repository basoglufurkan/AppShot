#!/usr/bin/env node
// Review boards for the agent (and the human) to LOOK at:
//   review/contact-<size>-<locale>.png   every shot side by side
//   review/search-<locale>.png           App Store search-result mock (icon, title, first 3 shots) in light + dark
//   node scripts/sheet.mjs [--draft] [--size iphone-6.9] [--locale en-US] [--title "Pulse"] [--subtitle "Home workouts"]

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, findWorkspace, exists, readJson, ensureDir, fileUrl, die, log, L } from '../engine/lib/util.mjs';
import { readPngInfo } from '../engine/lib/png.mjs';
import { esc } from '../engine/lib/html.mjs';
import { renderHtml } from '../engine/render.mjs';
import { Browser } from '../engine/lib/cdp.mjs';

const args = parseArgs();
const ws = findWorkspace(args);
const root = path.join(ws, args.draft ? 'drafts' : 'out', ...(args.variant ? ['variants', args.variant] : []));
if (!exists(root)) die(`Nothing rendered in ${root}. Run node scripts/render.mjs${args.draft ? ' --draft' : ''} first.`);
const plan = readJson(path.join(ws, 'plan.json'), {});
const profile = readJson(path.join(ws, 'profile.json'), {});
const reviewDir = ensureDir(path.join(ws, 'review', ...(args.variant ? ['variants', args.variant] : [])));

const sizes = fs.readdirSync(root).filter((d) => fs.statSync(path.join(root, d)).isDirectory() && d !== 'variants')
  .sort((a, b) => (b.startsWith('iphone') - a.startsWith('iphone')) || b.localeCompare(a));
const browser = await Browser.launch();
const outputs = [];
try {
  for (const size of args.size ? [args.size] : sizes) {
    const sizeDir = path.join(root, size);
    if (!exists(sizeDir)) continue;
    for (const locale of args.locale ? [args.locale] : fs.readdirSync(sizeDir)) {
      const dir = path.join(sizeDir, locale);
      if (!fs.statSync(dir).isDirectory()) continue;
      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort();
      if (!files.length) continue;
      outputs.push(await contact({ dir, files, size, locale }));
      if (/^iphone/.test(size) && !outputs.some((o) => o.includes(`search-${locale}`))) {
        outputs.push(await search({ dir, files, locale, size }));
      }
    }
  }
} finally {
  await browser.close();
}
for (const o of outputs) log.ok(path.relative(process.cwd(), o));
log.info('Open these PNGs and critique them with skills/review/critique.md');

async function contact({ dir, files, size, locale }) {
  const thumbH = 900, gap = 36, padX = 60, head = 110;
  const first = path.join(dir, files[0]);
  const info = readPngInfo(first);
  const tw = Math.round((info.width / info.height) * thumbH);
  const W = padX * 2 + files.length * tw + (files.length - 1) * gap;
  const H = head + thumbH + 120;
  const imgs = files.map((f, i) => `<figure><img src="${fileUrl(path.join(dir, f))}" style="width:${tw}px;height:${thumbH}px"><figcaption>${i + 1} · ${esc(f.replace(/^\d+-|\.png$/g, ''))}${i < 3 ? ' · <b>search</b>' : ''}</figcaption></figure>`).join('');
  const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;width:${W}px;height:${H}px;background:#e9e9ee;font:500 26px -apple-system,Helvetica;color:#333}
h1{font:700 34px -apple-system;margin:0;padding:40px ${padX}px 0}
.row{display:flex;gap:${gap}px;padding:34px ${padX}px}
figure{margin:0}img{display:block;border-radius:18px;box-shadow:0 8px 30px rgba(0,0,0,.18)}
figcaption{margin-top:14px;color:#666;font-size:24px}b{color:#2f6bff}
</style><h1>${esc(plan.app?.name || 'App')} — ${esc(size)} · ${esc(locale)} · ${files.length} screenshots</h1><div class="row">${imgs}</div>`;
  const out = path.join(reviewDir, `contact-${size}-${locale}.png`);
  return renderHtml(html, { width: W, height: H, out, browser });
}

async function search({ dir, files, locale, size }) {
  const name = args.title || L(plan.app?.name, locale) || profile.app?.displayName || 'App';
  const subtitle = args.subtitle || L(plan.app?.subtitle, locale) || profile.store?.subtitle || '';
  const icon = plan.app?.icon ? fileUrl(path.resolve(ws, plan.app.icon)) : null;
  const shots = files.slice(0, 3).map((f) => fileUrl(path.join(dir, f)));
  const card = (dark) => `<div class="phone ${dark ? 'dark' : ''}"><div class="bar"><span>9:41</span></div>
    <div class="search"><span>⌕</span> ${esc(args.query || (Array.isArray(plan.keywords) ? plan.keywords[0] : plan.keywords?.[locale]?.[0]) || name)}</div>
    <div class="res"><div class="top">${icon ? `<img class="ic" src="${icon}">` : '<div class="ic ph"></div>'}<div class="meta"><div class="nm">${esc(name)}</div><div class="st">${esc(subtitle)}</div><div class="stars">★★★★★ <span>—</span></div></div><div class="get">Get</div></div>
    <div class="shots">${shots.map((s) => `<img src="${s}">`).join('')}</div></div>
    <div class="res ghost"><div class="top"><div class="ic ph"></div><div class="meta"><div class="nm">Competitor app</div><div class="st">Subtitle</div></div><div class="get">Get</div></div><div class="shots"><i></i><i></i><i></i></div></div></div>`;
  const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;width:1280px;height:1400px;background:#d9d9de;display:flex;gap:60px;justify-content:center;align-items:center;font-family:-apple-system,Helvetica}
.phone{width:560px;height:1220px;border-radius:70px;background:#fff;box-shadow:0 0 0 14px #111,0 30px 80px rgba(0,0,0,.3);overflow:hidden;padding:0 28px;box-sizing:border-box}
.dark{background:#000;color:#fff}.bar{height:70px;display:flex;align-items:flex-end;padding-left:30px;font-weight:600;font-size:22px}
.search{margin:26px 0 22px;background:rgba(118,118,128,.12);border-radius:16px;padding:16px 18px;font-size:22px;color:#8a8a8e}
.res{padding:8px 0 30px;border-bottom:1px solid rgba(128,128,128,.2)}.top{display:flex;align-items:center;gap:18px}
.ic{width:96px;height:96px;border-radius:22px;box-shadow:0 0 0 1px rgba(0,0,0,.08)}.ph{background:linear-gradient(135deg,#bbb,#888)}
.meta{flex:1;min-width:0}.nm{font-weight:600;font-size:24px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.st{color:#8a8a8e;font-size:20px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.stars{color:#8a8a8e;font-size:16px;margin-top:6px}.get{background:rgba(0,122,255,.12);color:#007aff;font-weight:700;border-radius:30px;padding:10px 30px;font-size:22px}
.dark .get{background:#2c2c2e;color:#0a84ff}
.shots{display:flex;gap:12px;margin-top:22px}.shots img,.shots i{width:160px;height:347px;border-radius:16px;object-fit:cover;display:block;box-shadow:0 0 0 1px rgba(128,128,128,.25)}
.shots i{background:rgba(128,128,128,.18)}.ghost{opacity:.55}
</style>${card(false)}${card(true)}`;
  const out = path.join(reviewDir, `search-${locale}.png`);
  return renderHtml(html, { width: 1280, height: 1400, out, browser });
}
