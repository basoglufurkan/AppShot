// Find the largest app icon, copy it into the workspace and read its colours.
import fs from 'node:fs';
import path from 'node:path';
import { readPngInfo, decodePng } from '../../engine/lib/png.mjs';
import { dominantColors } from '../../engine/lib/palette.mjs';
import { safeJson } from './platform.mjs';

export function run(ctx) {
  const { files, read, rel, profile, ws } = ctx;
  const cands = [...(ctx.iconHints || [])];
  for (const f of files.filter((f) => /AppIcon[^/]*\.appiconset\/Contents\.json$/.test(f))) {
    const j = safeJson(read(f));
    const dir = path.dirname(f);
    for (const im of j?.images || []) if (im.filename) cands.push(path.join(dir, im.filename));
  }
  cands.push(...files.filter((f) => /(ic_launcher(-playstore)?|ic_launcher_foreground|playstore-icon)\.png$/.test(f) && /xxxhdpi|playstore|main/.test(rel(f))));
  cands.push(...files.filter((f) => /(^|\/)(icon|app-icon|appicon|logo)[-_]?(1024|512|ios|marketing)?\.png$/i.test(f) && !/node_modules|(^|\/)\.?appshot\//.test(rel(f))));
  let best = null;
  for (const c of [...new Set(cands)]) {
    if (!fs.existsSync(c) || !/\.png$/i.test(c)) continue;
    try {
      const i = readPngInfo(c);
      if (Math.abs(i.width - i.height) > 2) continue;
      if (!best || i.width > best.width) best = { file: c, width: i.width };
    } catch {}
  }
  if (!best) { profile.icon = null; return; }
  const dest = path.join(ws, 'raw', 'icon.png');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(best.file, dest);
  let colors = [];
  try { colors = dominantColors(decodePng(best.file), { max: 5 }); } catch {}
  profile.icon = { source: rel(best.file), size: best.width, copiedTo: 'raw/icon.png', colors };
  for (const c of colors) (ctx.colorHints ||= []).push({ hex: c.hex, name: 'icon', source: 'app icon', weight: 4 * c.share + c.saturation * 3 });
}
