// raw/manifest.json keeps track of every captured/imported screen (source, device, size, time).
import path from 'node:path';
import { readJson, writeJson } from '../../engine/lib/util.mjs';
import { readPngInfo } from '../../engine/lib/png.mjs';

export function record(ws, entry) {
  const file = path.join(ws, 'raw', 'manifest.json');
  const m = readJson(file, { screens: [] });
  let info = {};
  try { info = readPngInfo(path.join(ws, entry.file)); } catch {}
  const row = { ...entry, width: info.width, height: info.height, capturedAt: new Date().toISOString() };
  m.screens = m.screens.filter((s) => s.file !== entry.file).concat(row);
  writeJson(file, m);
  return row;
}
