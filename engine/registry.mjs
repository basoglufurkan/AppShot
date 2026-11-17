// Lists of everything the engine knows: layouts (with meta), themes, frames, decor, sizes, locales.
import path from 'node:path';
import { ENGINE_DIR, readJson } from './lib/util.mjs';
import { listIds, loadTemplate, loadFrame, loadTheme, allSizes, localeSpec } from './compose.mjs';

export async function layouts() {
  const out = {};
  for (const id of listIds('templates')) out[id] = (await loadTemplate(id)).meta;
  return out;
}
export function themes() {
  return Object.fromEntries(listIds('themes').map((id) => [id, loadTheme(id)]));
}
export async function frames() {
  const out = {};
  for (const id of listIds('frames')) out[id] = (await loadFrame(id)).meta;
  return out;
}
export const decor = () => listIds('decor');
export const sizes = () => allSizes();
export const graphics = () => readJson(path.join(ENGINE_DIR, 'sizes.json')).graphics;
export const previews = () => readJson(path.join(ENGINE_DIR, 'sizes.json')).previews || [];
export const locales = () => readJson(path.join(ENGINE_DIR, 'locales.json')).locales;
export { localeSpec };
export async function scenes() {
  const { loadScene } = await import('./compose.mjs');
  const out = {};
  for (const id of listIds('scenes')) out[id] = (await loadScene(id)).meta;
  return out;
}
