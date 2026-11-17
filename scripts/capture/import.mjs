#!/usr/bin/env node
// Bring your own screenshots: copy PNG/JPEG files into appshot/raw with clean names and check them.
//   node scripts/capture/import.mjs ~/Desktop/shots/*.png [--prefix ios-]
//   node scripts/capture/import.mjs --from ~/Desktop/shots

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, findWorkspace, ensureDir, slug, log, die } from '../../engine/lib/util.mjs';
import { readPngInfo } from '../../engine/lib/png.mjs';
import { record } from './_manifest.mjs';

const args = parseArgs();
const ws = findWorkspace(args);
let files = args._.map((f) => path.resolve(f));
if (args.from) files = fs.readdirSync(path.resolve(args.from)).filter((f) => /\.(png|jpe?g)$/i.test(f)).map((f) => path.resolve(args.from, f));
if (!files.length) die('Pass image files or --from <folder>');
const dest = ensureDir(path.join(ws, 'raw'));
const KNOWN = { 1320: 'iPhone 6.9"', 1290: 'iPhone 6.7/6.9"', 1206: 'iPhone 6.3"', 1179: 'iPhone 6.1/6.3"', 1284: 'iPhone 6.5"', 1242: 'iPhone 6.5"/5.5"', 1170: 'iPhone 6.1"', 2064: 'iPad 13"', 2048: 'iPad 12.9"', 1668: 'iPad 11"', 1080: 'Android phone' };
for (const f of files) {
  let info;
  try { info = readPngInfo(f); } catch (e) { log.warn(`${path.basename(f)}: ${e.message}`); continue; }
  const name = slug((args.prefix || '') + path.basename(f).replace(/\.\w+$/, ''));
  const ext = info.format === 'jpeg' ? '.jpg' : '.png';
  const out = path.join(dest, name + ext);
  fs.copyFileSync(f, out);
  record(ws, { file: path.relative(ws, out), name, source: 'import', from: f });
  const ratio = (info.height / info.width).toFixed(3);
  const hint = KNOWN[info.width] || (info.height / info.width > 1.9 ? 'tall phone' : info.height / info.width > 1.5 ? 'phone/tablet' : 'tablet');
  log.ok(`${name}${ext}  ${info.width}×${info.height}  (${hint}, h/w ${ratio})${info.width < 1000 ? '  ⚠ low resolution — re-capture at device scale for crisp output' : ''}`);
}
