#!/usr/bin/env node
// Colours from the app icon or any screenshot, plus a derived "brand" theme preview.
//   node scripts/palette.mjs [image] [--apply]   (default image: appshot/raw/icon.png; --apply writes plan.brand)

import path from 'node:path';
import { parseArgs, findWorkspace, readJson, writeJson, exists, die, log } from '../engine/lib/util.mjs';
import { decodePng } from '../engine/lib/png.mjs';
import { dominantColors } from '../engine/lib/palette.mjs';
import { brandPalette, contrast } from '../engine/lib/color.mjs';

const args = parseArgs();
const ws = findWorkspace(args);
const img = path.resolve(args._[0] || path.join(ws, 'raw', 'icon.png'));
if (!exists(img)) die(`No image at ${img}`);
const colors = dominantColors(decodePng(img), { max: 6 });
console.log(`\n${path.basename(img)}`);
for (const c of colors) console.log(`  ${c.hex}  share ${String(Math.round(c.share * 100)).padStart(3)}%  sat ${c.saturation}  light ${c.lightness}`);
const vivid = colors.filter((c) => c.saturation > 0.25).sort((a, b) => b.share - a.share);
const brand = brandPalette({ primary: vivid[0]?.hex || colors[0]?.hex, secondary: vivid[1]?.hex });
console.log(`\nDerived brand palette: bg ${brand.bg} · accent ${brand.accent} (contrast ${contrast(brand.accent, brand.bg).toFixed(1)}:1) · text ${brand.text}`);
if (args.apply) {
  const pf = path.join(ws, 'plan.json');
  const plan = readJson(pf, null) || die('No plan.json to apply to.');
  plan.brand = { primary: brand.primary, secondary: brand.secondary };
  writeJson(pf, plan);
  log.ok('plan.brand updated — use "theme": "brand" to build the whole look from it, or keep your theme and set themeOverrides.accent.');
}
