// Zero-dependency headless Chrome driver over the DevTools protocol.
// Uses the system Chrome/Chromium/Edge and Node's built-in WebSocket (Node >= 22).

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CANDIDATES = {
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/Applications/Arc.app/Contents/MacOS/Arc',
  ],
  linux: [
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium',
    '/usr/bin/chromium-browser', '/snap/bin/chromium', '/usr/bin/microsoft-edge',
  ],
  win32: [
    `${process.env['PROGRAMFILES'] || 'C:\\Program Files'}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)'}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env['LOCALAPPDATA'] || ''}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)'}\\Microsoft\\Edge\\Application\\msedge.exe`,
  ],
};

export function findChrome() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const home = os.homedir();
  const extra = [];
  // Playwright / Puppeteer caches, if the user has them.
  for (const dir of [path.join(home, 'Library/Caches/ms-playwright'), path.join(home, '.cache/ms-playwright'), path.join(home, '.cache/puppeteer')]) {
    if (!fs.existsSync(dir)) continue;
    for (const sub of fs.readdirSync(dir)) {
      for (const rel of [
        'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
        'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
        'chrome-linux/chrome',
        'chrome-linux64/chrome',
      ]) extra.push(path.join(dir, sub, rel));
    }
  }
  for (const p of [...(CANDIDATES[process.platform] || []), ...extra]) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

class CDPConnection {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Set();
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : Buffer.from(ev.data).toString());
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject, method } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(`${method}: ${msg.error.message}`));
        else resolve(msg.result);
      } else if (msg.method) {
        for (const fn of this.listeners) fn(msg);
      }
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.ws.send(JSON.stringify(payload));
    });
  }
  waitFor(method, sessionId, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => { this.listeners.delete(fn); reject(new Error(`Timed out waiting for ${method}`)); }, timeout);
      const fn = (msg) => {
        if (msg.method === method && (!sessionId || msg.sessionId === sessionId)) {
          clearTimeout(t);
          this.listeners.delete(fn);
          resolve(msg.params);
        }
      };
      this.listeners.add(fn);
    });
  }
  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
}

export class Page {
  constructor(conn, sessionId, targetId) {
    this.conn = conn;
    this.sessionId = sessionId;
    this.targetId = targetId;
    this.consoleErrors = [];
    conn.on((msg) => {
      if (msg.sessionId !== sessionId) return;
      if (msg.method === 'Runtime.exceptionThrown') this.consoleErrors.push(msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text);
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        this.consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
      }
    });
  }
  send(method, params) { return this.conn.send(method, params, this.sessionId); }

  async setViewport(width, height, deviceScaleFactor = 1, mobile = false) {
    await this.send('Emulation.setDeviceMetricsOverride', { width: Math.round(width), height: Math.round(height), deviceScaleFactor, mobile });
  }

  async goto(url, { timeout = 45000 } = {}) {
    const loaded = this.conn.waitFor('Page.loadEventFired', this.sessionId, timeout);
    const res = await this.send('Page.navigate', { url });
    if (res.errorText) throw new Error(`Navigation failed: ${res.errorText} (${url})`);
    await loaded;
  }

  async setContent(html, { timeout = 45000 } = {}) {
    const { frameTree } = await this.send('Page.getFrameTree');
    const loaded = this.conn.waitFor('Page.loadEventFired', this.sessionId, timeout);
    await this.send('Page.setDocumentContent', { frameId: frameTree.frame.id, html });
    await Promise.race([loaded, new Promise((r) => setTimeout(r, 1500))]);
  }

  async evaluate(expression, { awaitPromise = true, timeout = 30000 } = {}) {
    const res = await this.send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true, timeout });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
    }
    return res.result.value;
  }

  /** PNG buffer of the clip (CSS px). scale < 1 renders a smaller draft. */
  async screenshot({ x = 0, y = 0, width, height, scale = 1, format = 'png', quality } = {}) {
    const params = { format, captureBeyondViewport: true, fromSurface: true, clip: { x, y, width, height, scale } };
    if (format === 'jpeg') params.quality = quality ?? 92;
    const { data } = await this.send('Page.captureScreenshot', params);
    return Buffer.from(data, 'base64');
  }

  async close() {
    try { await this.conn.send('Target.closeTarget', { targetId: this.targetId }); } catch {}
  }
}

export class Browser {
  static async launch({ headless = true, args = [] } = {}) {
    if (typeof WebSocket === 'undefined') {
      throw new Error(`Node ${process.versions.node} has no global WebSocket. Use Node 22 or newer.`);
    }
    const exe = findChrome();
    if (!exe) throw new Error('No Chrome/Chromium/Edge found. Install Google Chrome or set CHROME_PATH.');
    const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'appshot-chrome-'));
    const flags = [
      headless ? '--headless=new' : '',
      '--remote-debugging-port=0',
      `--user-data-dir=${userDataDir}`,
      '--no-first-run', '--no-default-browser-check', '--disable-extensions',
      '--hide-scrollbars', '--mute-audio', '--force-color-profile=srgb',
      '--font-render-hinting=none', '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows',
      '--allow-file-access-from-files',
      ...args,
      ...(process.env.CHROME_FLAGS ? process.env.CHROME_FLAGS.split(/\s+/).filter(Boolean) : []),
      'about:blank',
    ].filter(Boolean);
    const proc = spawn(exe, flags, { stdio: ['ignore', 'ignore', 'pipe'] });
    const wsUrl = await new Promise((resolve, reject) => {
      let buf = '';
      const t = setTimeout(() => reject(new Error(`Chrome did not start in time.\n${buf.slice(-800)}`)), 20000);
      proc.stderr.on('data', (d) => {
        buf += d.toString();
        const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
        if (m) { clearTimeout(t); resolve(m[1]); }
      });
      proc.on('exit', (code) => { clearTimeout(t); reject(new Error(`Chrome exited (${code}).\n${buf.slice(-800)}`)); });
    });
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', () => reject(new Error('Could not connect to Chrome DevTools')), { once: true });
    });
    const b = new Browser();
    b.proc = proc;
    b.ws = ws;
    b.conn = new CDPConnection(ws);
    b.userDataDir = userDataDir;
    b.exe = exe;
    return b;
  }

  async newPage() {
    const { targetId } = await this.conn.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await this.conn.send('Target.attachToTarget', { targetId, flatten: true });
    const page = new Page(this.conn, sessionId, targetId);
    await page.send('Page.enable');
    await page.send('Runtime.enable');
    return page;
  }

  async close() {
    try { await this.conn.send('Browser.close'); } catch {}
    try { this.ws.close(); } catch {}
    await new Promise((r) => setTimeout(r, 150));
    try { this.proc.kill('SIGKILL'); } catch {}
    try { fs.rmSync(this.userDataDir, { recursive: true, force: true }); } catch {}
  }
}

/** Convenience: run fn(browser) and always close Chrome. */
export async function withBrowser(fn, opts) {
  const browser = await Browser.launch(opts);
  try {
    return await fn(browser);
  } finally {
    await browser.close();
  }
}
