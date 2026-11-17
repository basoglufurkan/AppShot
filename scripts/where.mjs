#!/usr/bin/env node
// Print where everything lives (handy for agents: paste the paths into commands).
import path from 'node:path';
import { SKILL_DIR, findWorkspace, parseArgs, exists } from '../engine/lib/util.mjs';
const ws = findWorkspace(parseArgs());
const rows = {
  skill: SKILL_DIR,
  scripts: path.join(SKILL_DIR, 'scripts'),
  engine: path.join(SKILL_DIR, 'engine'),
  knowledge: path.join(SKILL_DIR, 'skills'),
  editor: path.join(SKILL_DIR, 'editor'),
  workspace: `${ws}${exists(ws) ? '' : '  (not created yet)'}`,
};
for (const [k, v] of Object.entries(rows)) console.log(`${k.padEnd(10)} ${v}`);
