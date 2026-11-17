#!/usr/bin/env node
// Capture the booted iOS Simulator with a clean status bar.
//   node scripts/capture/ios-sim.mjs --name home [--url myapp://home] [--wait 2] [--appearance dark]
//   node scripts/capture/ios-sim.mjs --list
//   node scripts/capture/ios-sim.mjs --statusbar clear
// Tip: boot the simulator that matches the target canvas (iPhone 17 Pro Max → 1320×2868; iPad Pro 13" → 2064×2752).

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { parseArgs, findWorkspace, ensureDir, slug, log, die } from '../../engine/lib/util.mjs';
import { record } from './_manifest.mjs';

const args = parseArgs();
const ws = findWorkspace(args);
const dev = args.device || 'booted';
const sim = (...a) => execFileSync('xcrun', ['simctl', ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));

try { sim('help'); } catch { die('xcrun simctl not available — install Xcode and run: sudo xcode-select -s /Applications/Xcode.app'); }

if (args.list) {
  const j = JSON.parse(sim('list', 'devices', 'booted', '-j'));
  const booted = Object.entries(j.devices).flatMap(([rt, ds]) => ds.map((d) => ({ ...d, runtime: rt.split('.').pop() })));
  if (!booted.length) die('No booted simulator. Boot one: xcrun simctl boot "iPhone 17 Pro Max" && open -a Simulator');
  for (const d of booted) console.log(`${d.udid}  ${d.name}  (${d.runtime})`);
  process.exit(0);
}

if (args.statusbar === 'clear') { sim('status_bar', dev, 'clear'); log.ok('Status bar restored'); process.exit(0); }

if (args.statusbar !== 'keep') {
  try {
    sim('status_bar', dev, 'override', '--time', args.time || '9:41', '--dataNetwork', 'wifi', '--wifiMode', 'active', '--wifiBars', '3',
      '--cellularMode', 'active', '--cellularBars', '4', '--operatorName', '', '--batteryState', 'charged', '--batteryLevel', '100');
  } catch (e) { log.warn(`Could not override status bar: ${e.message.split('\n')[0]}`); }
}
if (args.appearance) { try { sim('ui', dev, 'appearance', args.appearance); await sleep(1); } catch {} }
if (args.url) { sim('openurl', dev, args.url); await sleep(Number(args.wait ?? 2.5)); }
else if (args.wait) await sleep(Number(args.wait));

const name = slug(args.name || `screen-${Date.now()}`);
const rel = path.join('raw', `${name}.png`);
const out = path.join(ensureDir(path.join(ws, 'raw')), `${name}.png`);
sim('io', dev, 'screenshot', '--type=png', out);
const row = record(ws, { file: rel, name, source: 'ios-simulator', device: dev, url: args.url, appearance: args.appearance });
log.ok(`${rel}  ${row.width}×${row.height}`);
