#!/usr/bin/env node
// Check this machine can run Appshot. Fixes are printed for anything missing.
//   node scripts/doctor.mjs [--render]   (--render also does a real test render)

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { findChrome, withBrowser } from '../engine/lib/cdp.mjs';
import { parseArgs, SKILL_DIR, log } from '../engine/lib/util.mjs';

const args = parseArgs();
const has = (cmd) => { try { execSync(`command -v ${cmd}`, { stdio: 'ignore', shell: '/bin/sh' }); return true; } catch { return false; } };
const out = (cmd) => { try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'], shell: '/bin/sh' }).toString().trim(); } catch { return ''; } };
let fail = 0;
const row = (ok, name, detail, fix) => {
  console.log(`${ok ? '✓' : ok === null ? '·' : '✗'} ${name.padEnd(26)} ${detail || ''}`);
  if (!ok && fix) console.log(`    → ${fix}`);
  if (ok === false) fail++;
};

console.log(`\nAppshot doctor — ${SKILL_DIR}\n`);
const major = Number(process.versions.node.split('.')[0]);
row(major >= 22, 'Node.js >= 22', `v${process.versions.node}`, 'Install Node 22+ (brew install node / nvm install 22)');
const chrome = findChrome();
row(!!chrome, 'Chrome / Chromium / Edge', chrome || 'not found', 'Install Google Chrome or set CHROME_PATH=/path/to/chrome');
row(typeof WebSocket !== 'undefined', 'WebSocket (built-in)', typeof WebSocket !== 'undefined' ? 'ok' : 'missing', 'Use Node 22+');

const isMac = os.platform() === 'darwin';
if (isMac) {
  const xcode = out('xcode-select -p');
  row(xcode ? true : null, 'Xcode (iOS capture)', xcode || 'not installed — optional', 'Install Xcode from the App Store, then: sudo xcode-select -s /Applications/Xcode.app');
  const booted = out('xcrun simctl list devices booted 2>/dev/null | grep -c Booted');
  row(booted && booted !== '0' ? true : null, 'Booted iOS Simulator', booted && booted !== '0' ? `${booted} booted` : 'none booted — optional', 'open -a Simulator (or boot one: xcrun simctl boot "iPhone 17 Pro Max")');
}
row(has('adb') ? true : null, 'adb (Android capture)', has('adb') ? out('adb version | head -1') : 'not found — optional', 'Install Android platform-tools');
row(has('maestro') ? true : null, 'Maestro (flow capture)', has('maestro') ? 'found' : 'not found — optional', 'curl -Ls "https://get.maestro.mobile.dev" | bash');
row(has('fastlane') ? true : null, 'fastlane (upload)', has('fastlane') ? 'found' : 'not found — optional', 'brew install fastlane');
row(has('ffmpeg') ? true : null, 'ffmpeg (creative videos)', has('ffmpeg') ? 'found' : 'not found — needed only for header/search videos', 'brew install ffmpeg');

let online = null;
try { const r = await fetch('https://fonts.googleapis.com/css2?family=Inter', { signal: AbortSignal.timeout(4000) }); online = r.ok; } catch { online = false; }
row(online ? true : null, 'Google Fonts reachable', online ? 'yes' : 'offline — system fonts will be used', 'Connect to the internet, or add local fonts in plan.fonts.local');

if (args.render && chrome) {
  const t0 = Date.now();
  try {
    await withBrowser(async (b) => {
      const p = await b.newPage();
      await p.setViewport(400, 400);
      await p.setContent('<body style="margin:0;background:#4F46E5"><h1 style="color:#fff;font:800 60px -apple-system">ok</h1></body>');
      const buf = await p.screenshot({ width: 400, height: 400 });
      fs.writeFileSync(path.join(os.tmpdir(), 'appshot-doctor.png'), buf);
    });
    row(true, 'Test render', `${Date.now() - t0} ms`);
  } catch (e) {
    row(false, 'Test render', e.message.split('\n')[0], 'See the error above; try CHROME_PATH or closing other Chrome instances');
  }
}

console.log(fail ? `\n${fail} required item(s) missing.\n` : '\nReady. Optional items only matter for automatic capture/upload.\n');
process.exit(fail ? 1 : 0);
