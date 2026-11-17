// Render a plan to store-ready PNGs: one Chrome page per (size, locale), one capture per slot.

import fs from 'node:fs';
import path from 'node:path';
import { Browser } from './lib/cdp.mjs';
import { readPngInfo, toStorePng } from './lib/png.mjs';
import { readJson, writeJson, ensureDir, fileUrl, pad2, slug, log } from './lib/util.mjs';
import { compose, sizeSpec } from './compose.mjs';

export function loadPlan(planPath) {
  const plan = readJson(planPath);
  plan.__file = path.resolve(planPath);
  // Variant plans live in appshot/variants/ and point back with "workspace": "..".
  plan.__workspace = path.resolve(path.dirname(path.resolve(planPath)), plan.workspace || '.');
  return plan;
}

export function outName(shot, index) {
  return `${pad2(index + 1)}-${slug(shot.id || `shot-${index + 1}`) || 'shot'}.png`;
}

/**
 * @param {object} o
 * @param {object} o.plan       loaded plan (see loadPlan)
 * @param {string} o.outDir     where PNGs go (default <workspace>/out)
 * @param {string[]} o.sizes    size ids (default plan.sizes)
 * @param {string[]} o.locales  locale ids (default plan.locales)
 * @param {number} o.scale      1 = store size, <1 = fast draft
 * @param {Array} o.only        shot indexes/ids to render
 */
export async function renderPlan({ plan, outDir, sizes, locales, scale = 1, only, concurrency = 3, quiet = false, browser: shared, reportFile } = {}) {
  const ws = plan.__workspace;
  outDir = outDir || path.join(ws, scale < 1 ? 'drafts' : 'out');
  sizes = sizes?.length ? sizes : plan.sizes?.length ? plan.sizes : ['iphone-6.9'];
  locales = locales?.length ? locales : plan.locales?.length ? plan.locales : [plan.defaultLocale || 'en-US'];
  const cacheDir = ensureDir(path.join(ws, '.cache', 'html', plan.variant?.name || 'main'));
  const jobs = [];
  for (const sizeId of sizes) for (const locale of locales) jobs.push({ sizeId, locale });

  const browser = shared || await Browser.launch();
  const results = [];
  const started = Date.now();
  try {
    let next = 0;
    const worker = async () => {
      const page = await browser.newPage();
      try {
        while (next < jobs.length) {
          const job = jobs[next++];
          results.push(await renderJob({ page, plan, job, outDir, cacheDir, scale, only, quiet }));
        }
      } finally {
        await page.close();
      }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));
  } finally {
    if (!shared) await browser.close();
  }
  const report = {
    plan: plan.__file, renderedAt: new Date().toISOString(), scale, ms: Date.now() - started,
    outDir, jobs: results.sort((a, b) => (a.size + a.locale).localeCompare(b.size + b.locale)),
  };
  report.file = reportFile || path.join(ws, 'review', scale < 1 ? 'draft-report.json' : 'render-report.json');
  writeJson(report.file, report);
  return report;
}

async function renderJob({ page, plan, job, outDir, cacheDir, scale, only, quiet }) {
  const { sizeId, locale } = job;
  const size = sizeSpec(sizeId);
  const { html, W, H, slots } = await compose({ plan, workspace: plan.__workspace, sizeId, locale, only });
  const htmlFile = path.join(cacheDir, `${sizeId}.${locale}.html`);
  fs.writeFileSync(htmlFile, html);
  await page.setViewport(W, H, 1);
  page.consoleErrors = [];
  await page.goto(fileUrl(htmlFile));
  const report = await page.evaluate('window.__appshot.ready');
  const dir = ensureDir(path.join(outDir, sizeId, locale));
  const files = [];
  for (let k = 0; k < slots.length; k++) {
    await page.evaluate(`window.__appshot.show(${k}); new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))`);
    let buf = await page.screenshot({ width: W, height: H, scale });
    if (readPngInfo(buf).hasAlpha) buf = toStorePng(buf);
    const shot = plan.shots[slots[k].index];
    const file = path.join(dir, outName(shot, k));
    fs.writeFileSync(file, buf);
    files.push(file);
  }
  if (!quiet) log.ok(`${sizeId} · ${locale} → ${files.length} shots`);
  return {
    size: sizeId, store: size.store, canvas: { width: W, height: H }, locale, width: Math.round(W * scale), height: Math.round(H * scale),
    html: htmlFile, files, slots: report.slots, fonts: report.fonts, consoleErrors: page.consoleErrors.slice(0, 20),
  };
}

/** Render an arbitrary HTML string to a PNG (contact sheets, previews, feature graphics). */
export async function renderHtml(html, { width, height, out, scale = 1, browser: shared, waitFor } = {}) {
  const browser = shared || await Browser.launch();
  try {
    const page = await browser.newPage();
    await page.setViewport(width, height, 1);
    const tmp = path.join(path.dirname(out), `.${path.basename(out)}.html`);
    fs.writeFileSync(tmp, html);
    await page.goto(fileUrl(tmp));
    await page.evaluate(waitFor || 'Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 4000))]).then(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))))');
    let buf = await page.screenshot({ width, height, scale });
    if (readPngInfo(buf).hasAlpha) buf = toStorePng(buf);
    fs.writeFileSync(out, buf);
    fs.rmSync(tmp, { force: true });
    await page.close();
    return out;
  } finally {
    if (!shared) await browser.close();
  }
}
