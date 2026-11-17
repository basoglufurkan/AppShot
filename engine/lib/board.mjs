// Review boards (market map, reference study): an HTML page rendered to one PNG whose height follows the content.
import fs from 'node:fs';
import path from 'node:path';
import { Browser } from './cdp.mjs';
import { fileUrl, ensureDir } from './util.mjs';
import { esc } from './html.mjs';

export const BOARD_CSS = `body{margin:0;width:1900px;background:#e8e8ec;font:500 18px -apple-system,Helvetica;color:#333;padding:30px;box-sizing:border-box}
h1{font:700 30px -apple-system;margin:0 0 6px}h2{font:700 22px -apple-system;margin:26px 0 10px}.sub{color:#666;margin:0 0 16px}
.box{background:#fff;border-radius:12px;padding:14px 18px;margin:0 0 14px;font-size:16px;line-height:1.5;color:#444}.box li{margin:2px 0}
.row{display:flex;gap:10px;align-items:flex-start;margin:0 0 18px}.row img{height:300px;border-radius:10px;box-shadow:0 3px 12px rgba(0,0,0,.18);display:block}
.meta{width:420px;font-size:15px;line-height:1.45;color:#555}.meta b{color:#222;font-size:17px}.chip{display:inline-block;width:18px;height:18px;border-radius:5px;vertical-align:-3px;margin-right:4px;box-shadow:0 0 0 1px rgba(0,0,0,.15)}
.grid{display:flex;flex-wrap:wrap;gap:22px}.cell{width:900px}`;

export const chip = (hex) => `<span class="chip" style="background:${esc(hex)}"></span>`;

/** Render `body` (HTML) with the board style to `out`; returns the file. */
export async function renderBoard(title, body, out) {
  const html = `<!doctype html><meta charset="utf-8"><style>${BOARD_CSS}</style><h1>${esc(title)}</h1>${body}`;
  ensureDir(path.dirname(out));
  const tmp = path.join(path.dirname(out), `.${path.basename(out)}.html`);
  fs.writeFileSync(tmp, html);
  const browser = await Browser.launch();
  try {
    const page = await browser.newPage();
    await page.setViewport(1900, 1200, 1);
    await page.goto(fileUrl(tmp));
    await page.evaluate('Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })))');
    const height = Math.min(16000, Math.ceil(await page.evaluate('document.documentElement.scrollHeight')));
    await page.setViewport(1900, height, 1);
    fs.writeFileSync(out, await page.screenshot({ width: 1900, height, scale: 1 }));
  } finally {
    await browser.close();
    fs.rmSync(tmp, { force: true });
  }
  return out;
}
