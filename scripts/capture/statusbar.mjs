#!/usr/bin/env node
// Toggle clean status bars for capture sessions.
//   node scripts/capture/statusbar.mjs on|off [--android] [--time 9:41]
import { execFileSync } from 'node:child_process';
import { parseArgs, log } from '../../engine/lib/util.mjs';

const args = parseArgs();
const on = (args._[0] || 'on') !== 'off';
if (args.android) {
  const sh = (c) => execFileSync('adb', ['shell', c]);
  sh('settings put global sysui_demo_allowed 1');
  if (on) {
    for (const c of [`enter`, `clock -e hhmm ${(args.time || '0941').replace(':', '')}`, 'battery -e level 100 -e plugged false', 'network -e wifi show -e level 4', 'notifications -e visible false']) sh(`am broadcast -a com.android.systemui.demo -e command ${c}`);
  } else sh('am broadcast -a com.android.systemui.demo -e command exit');
} else {
  const a = on
    ? ['simctl', 'status_bar', 'booted', 'override', '--time', args.time || '9:41', '--batteryState', 'charged', '--batteryLevel', '100', '--wifiBars', '3', '--cellularBars', '4', '--dataNetwork', 'wifi', '--operatorName', '']
    : ['simctl', 'status_bar', 'booted', 'clear'];
  execFileSync('xcrun', a);
}
log.ok(`Status bar ${on ? 'clean (9:41, full battery)' : 'restored'}${args.android ? ' on Android' : ' on iOS Simulator'}`);
