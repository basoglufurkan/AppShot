#!/usr/bin/env node
// Install Appshot as a skill for your agents (symlink, so updates apply instantly).
//   node scripts/install.mjs            Claude Code (~/.claude/skills/appshot) + Codex (~/.codex/skills/appshot)
//   node scripts/install.mjs --project /path/to/app   also add .claude/skills/appshot + .cursor/rules/appshot.mdc in that repo
//   node scripts/install.mjs --uninstall

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArgs, SKILL_DIR, log } from '../engine/lib/util.mjs';

const args = parseArgs();
const targets = [path.join(os.homedir(), '.claude', 'skills', 'appshot'), path.join(os.homedir(), '.codex', 'skills', 'appshot')];
if (args.project) targets.push(path.join(path.resolve(args.project), '.claude', 'skills', 'appshot'));

for (const t of targets) {
  try {
    const st = fs.lstatSync(t);
    if (st.isSymbolicLink() || args.uninstall) fs.rmSync(t, { recursive: true, force: true });
    else { log.warn(`${t} exists and is not a symlink — left untouched`); continue; }
  } catch {}
  if (args.uninstall) { log.ok(`removed ${t}`); continue; }
  fs.mkdirSync(path.dirname(t), { recursive: true });
  fs.symlinkSync(SKILL_DIR, t, 'dir');
  log.ok(`${t} → ${SKILL_DIR}`);
}
if (args.project && !args.uninstall) {
  const rule = path.join(path.resolve(args.project), '.cursor', 'rules', 'appshot.mdc');
  fs.mkdirSync(path.dirname(rule), { recursive: true });
  fs.writeFileSync(rule, `---\ndescription: Create App Store / Google Play screenshots with Appshot\nalwaysApply: false\n---\nWhen asked for store screenshots, follow ${path.join(SKILL_DIR, 'AGENTS.md')} and run the scripts in ${path.join(SKILL_DIR, 'scripts')}.\n`);
  log.ok(`${rule}`);
}
if (!args.uninstall) log.info('In Claude Code: type /appshot (or just ask for App Store screenshots) inside your app project.');
