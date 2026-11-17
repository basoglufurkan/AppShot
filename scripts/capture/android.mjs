#!/usr/bin/env node
// Capture a connected Android emulator/device in System UI demo mode (clean 9:41 status bar).
//   node scripts/capture/android.mjs --name home [--url myapp://home] [--wait 2] [--serial emulator-5554]
//   node scripts/capture/android.mjs --demo off

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, findWorkspace, ensureDir, slug, log, die } from '../../engine/lib/util.mjs';
import { record } from './_manifest.mjs';

const args = parseArgs();
const ws = findWorkspace(args);
const base = args.serial ? ['-s', args.serial] : [];
const adb = (...a) => execFileSync('adb', [...base, ...a], { stdio: ['ignore', 'pipe', 'pipe'] });
const shell = (cmd) => adb('shell', cmd).toString();
const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));
try { adb('get-state'); } catch { die('No device: start an emulator (emulator -avd <name>) or plug in a phone with USB debugging.'); }

const demo = (cmd) => shell(`am broadcast -a com.android.systemui.demo -e command ${cmd}`);
if (args.demo === 'off') { demo('exit'); log.ok('Demo mode off'); process.exit(0); }

shell('settings put global sysui_demo_allowed 1');
demo('enter');
demo(`clock -e hhmm ${(args.time || '0941').replace(':', '')}`);
demo('battery -e level 100 -e plugged false');
demo('network -e wifi show -e level 4');
demo('network -e mobile show -e datatype none -e level 4');
demo('notifications -e visible false');
if (args.url) { shell(`am start -a android.intent.action.VIEW -d "${args.url}"`); await sleep(Number(args.wait ?? 2.5)); }
else if (args.wait) await sleep(Number(args.wait));

const name = slug(args.name || `screen-${Date.now()}`);
const rel = path.join('raw', `${name}.png`);
const out = path.join(ensureDir(path.join(ws, 'raw')), `${name}.png`);
fs.writeFileSync(out, adb('exec-out', 'screencap', '-p'));
const row = record(ws, { file: rel, name, source: 'android', device: args.serial || 'default', url: args.url });
log.ok(`${rel}  ${row.width}×${row.height}`);
