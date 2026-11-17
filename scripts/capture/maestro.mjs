#!/usr/bin/env node
// Generate a Maestro flow that captures every screen the plan needs — repeatable across locales,
// light/dark and devices. Edit the TODO steps (taps) once; re-run any time the UI changes.
//   node scripts/capture/maestro.mjs [--app-id com.example.app] > appshot/capture.yaml
//   maestro test appshot/capture.yaml   # screenshots land in appshot/raw

import path from 'node:path';
import { parseArgs, findWorkspace, readJson, exists, die } from '../../engine/lib/util.mjs';

const args = parseArgs();
const ws = findWorkspace(args);
const plan = readJson(path.join(ws, 'plan.json'), null) || die('No plan.json yet.');
const profile = readJson(path.join(ws, 'profile.json'), {});
const appId = args.appId || profile.app?.bundleId || profile.app?.packageName || 'com.example.app';
const scheme = profile.app?.urlSchemes?.[0];
const screens = new Set();
for (const s of plan.shots) for (const ref of [s.screen, ...(s.screens || [])]) {
  const p = typeof ref === 'object' && ref ? ref.phone || Object.values(ref)[0] : ref;
  if (p && !exists(path.resolve(ws, p))) screens.add(path.basename(p).replace(/\.\w+$/, ''));
}
const lines = [`appId: ${appId}`, '---', '- launchApp:', '    clearState: false'];
for (const name of screens) {
  lines.push(`# ${name}`);
  if (scheme) lines.push(`- openLink: ${scheme}://${name}   # TODO: confirm the deep link, or replace with taps`);
  else lines.push(`- tapOn: "TODO ${name}"   # TODO: navigate to the ${name} screen`);
  lines.push('- waitForAnimationToEnd', `- takeScreenshot: ${path.join(ws, 'raw', name)}`);
}
if (!screens.size) lines.push('# Every screen referenced by plan.json already exists in raw/.');
console.log(lines.join('\n'));
