#!/usr/bin/env node
// Capture a web app / PWA / local HTML prototype as a phone screenshot (mobile emulation).
//   node scripts/capture/web.mjs --url http://localhost:3000/dashboard --name dashboard
//        [--device iphone|android|ipad] [--dark] [--wait 1.5] [--selector ".ready"] [--out <file>]
//   node scripts/capture/web.mjs --dir examples/pulse/screens --outdir examples/pulse/appshot/raw   (batch HTML files)

import fs from 'node:fs';
import path from 'node:path';
import { Browser } from '../../engine/lib/cdp.mjs';
import { parseArgs, findWorkspace, ensureDir, slug, fileUrl, log, die } from '../../engine/lib/util.mjs';
import { record } from './_manifest.mjs';

const DEVICES = {
  iphone: { width: 440, height: 956, dpr: 3, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' },
  'iphone-6.3': { width: 402, height: 874, dpr: 3 },
  ipad: { width: 1032, height: 1376, dpr: 2 },
  android: { width: 360, height: 800, dpr: 3, ua: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36' },
};

const args = parseArgs();
const ws = findWorkspace(args);
const d = DEVICES[args.device || 'iphone'] || die(`Unknown device ${args.device}`);
const width = Number(args.width || d.width), height = Number(args.height || d.height), dpr = Number(args.dpr || d.dpr);

const jobs = [];
if (args.dir) {
  const dir = path.resolve(args.dir);
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.html') && !f.startsWith('_')).sort()) {
    jobs.push({ url: fileUrl(path.join(dir, f)), name: f.replace(/\.html$/, '') });
  }
} else if (args.url) {
  const u = /^(https?:|file:)/.test(args.url) ? args.url : fileUrl(path.resolve(args.url));
  jobs.push({ url: u, name: slug(args.name || new URL(u).pathname.split('/').filter(Boolean).pop() || 'home') });
} else die('Pass --url <url|file> or --dir <folder of .html>');

const outDir = args.outdir ? ensureDir(path.resolve(args.outdir)) : ensureDir(path.join(ws, 'raw'));
const browser = await Browser.launch();
try {
  const page = await browser.newPage();
  await page.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile: true });
  if (d.ua) await page.send('Emulation.setUserAgentOverride', { userAgent: d.ua });
  await page.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  if (args.dark) await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
  for (const job of jobs) {
    await page.goto(job.url);
    if (args.selector) await page.evaluate(`new Promise((r, j) => { const t = Date.now(); (function f(){ if (document.querySelector(${JSON.stringify(args.selector)})) r(); else if (Date.now() - t > 15000) j(new Error('selector timeout')); else setTimeout(f, 100); })(); })`);
    await page.evaluate(`Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 4000))])`);
    await new Promise((r) => setTimeout(r, Number(args.wait ?? 0.4) * 1000));
    const buf = await page.screenshot({ width, height, scale: dpr });
    const out = args.out && jobs.length === 1 ? path.resolve(args.out) : path.join(outDir, `${job.name}.png`);
    fs.writeFileSync(out, buf);
    if (out.startsWith(ws)) record(ws, { file: path.relative(ws, out), name: job.name, source: 'web', url: job.url });
    log.ok(`${path.relative(process.cwd(), out)}  ${width * dpr}×${height * dpr}`);
  }
} finally {
  await browser.close();
}
