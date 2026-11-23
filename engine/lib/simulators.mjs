// Which iOS Simulator a capture runs on. Simulator names change with every Xcode (iPhone 17 Pro Max → iPhone 18 Pro
// Max) while the store canvases stay put, so a simulator is chosen by its screen: the plan's own device when this Mac
// has it, else the newest model with that model's screen, else the newest model with the store's largest canvas
// (engine/sizes.json iphone-6.9 for phones, ipad-13 for iPads). pickSimulator is pure, so it is tested without Xcode;
// listSimulators reads the real list through xcrun simctl and each model's screen from its device-type bundle.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { readJson, ENGINE_DIR } from './util.mjs';

const SIZE = { phone: 'iphone-6.9', tablet: 'ipad-13' };
const FAMILY = { phone: 'iPhone', tablet: 'iPad' };
/** Only for a model whose screen cannot be read: the names of the big-canvas models. */
const BIG = { phone: /Pro Max/, tablet: /iPad Pro.*\b(13|12\.9)-inch/ };

/** The canvas a device class is captured for, with the other sizes the store accepts for it. */
export function canvas(kind) {
  const s = readJson(path.join(ENGINE_DIR, 'sizes.json')).sizes.find((x) => x.id === SIZE[kind]);
  return { width: s.width, height: s.height, alt: s.alt || [] };
}

const find = (o, key) => {
  if (!o || typeof o !== 'object') return undefined;
  if (key in o) return o[key];
  for (const v of Object.values(o)) { const r = find(v, key); if (r !== undefined) return r; }
  return undefined;
};

/** A model's screen in pixels, portrait [width, height], from its device-type bundle; null when it cannot be read. */
function screenOf(bundlePath) {
  const file = bundlePath && path.join(bundlePath, 'Contents', 'Resources', 'capabilities.plist');
  if (!file || !fs.existsSync(file)) return null;
  try {
    const caps = JSON.parse(execFileSync('plutil', ['-convert', 'json', '-o', '-', file], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
    const w = find(caps, 'main-screen-width'), h = find(caps, 'main-screen-height');
    return w > 0 && h > 0 ? [Math.min(w, h), Math.max(w, h)] : null;
  } catch { return null; }
}

/**
 * Every available iPhone and iPad simulator — { name, udid, state, runtime, family, model, screen } — plus
 * modelScreen(name) for a model that has no simulator here. `model` orders models by age (the first iOS version the
 * model runs). Throws when xcrun simctl is missing.
 */
export function listSimulators() {
  const simctl = (...a) => JSON.parse(execFileSync('xcrun', ['simctl', 'list', ...a, '-j'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26 }));
  const types = simctl('devicetypes').devicetypes || [];
  const byId = new Map(types.map((t) => [t.identifier, t]));
  const screens = new Map();
  const screen = (t) => {
    if (!t) return null;
    if (!screens.has(t.identifier)) screens.set(t.identifier, screenOf(t.bundlePath));
    return screens.get(t.identifier);
  };
  const devices = Object.entries(simctl('devices', 'available').devices || {}).flatMap(([runtime, ds]) => ds.flatMap((d) => {
    const t = byId.get(d.deviceTypeIdentifier);
    const family = t?.productFamily || (/^iPad/.test(d.name) ? 'iPad' : /^iPhone/.test(d.name) ? 'iPhone' : '');
    if (family !== 'iPhone' && family !== 'iPad') return [];
    return [{ name: d.name, udid: d.udid, state: d.state, runtime, family, model: t?.minRuntimeVersion || 0, screen: screen(t) }];
  }));
  return { devices, modelScreen: (name) => screen(types.find((t) => t.name === name)) };
}

/**
 * The simulator a device class ('phone' | 'tablet') captures on. `wanted` = the plan's ios.device / ios.tablet (a
 * name or a udid). Returns { device } — with a `note` when the wanted one is not on this Mac and another stands in —
 * or { error } when this Mac has no simulator of that class.
 */
export function pickSimulator({ devices = [], modelScreen = () => null } = {}, kind = 'phone', wanted) {
  const booted = (d) => (d.state === 'Booted' ? 1 : 0);
  const newest = (a, b) => (b.model || 0) - (a.model || 0) || b.runtime.localeCompare(a.runtime, undefined, { numeric: true });
  if (wanted) {
    const named = devices.filter((d) => d.udid === wanted || d.name === wanted).sort((a, b) => booted(b) - booted(a) || newest(a, b));
    if (named.length) return { device: named[0] };
  }
  const c = canvas(kind);
  const own = wanted ? modelScreen(wanted) : null;
  const target = own || [c.width, c.height];
  const same = (s, [w, h]) => !!s && s[0] === w && s[1] === h;
  // 3 = the exact screen, 2 = a size the store also accepts, 1 = screen unknown but a big-canvas model by name.
  const fit = (d) => (same(d.screen, target) ? 3 : !own && c.alt.some((a) => same(d.screen, a)) ? 2 : !d.screen && BIG[kind].test(d.name) ? 1 : 0);
  const area = (d) => (d.screen ? d.screen[0] * d.screen[1] : 0);
  // Among equal screens a booted simulator wins: the user is running it, and the app is most likely installed there.
  const pool = devices.filter((d) => d.family === FAMILY[kind])
    .sort((a, b) => fit(b) - fit(a) || (fit(a) ? 0 : area(b) - area(a)) || booted(b) - booted(a) || newest(a, b));
  const field = kind === 'tablet' ? 'tablet' : 'device';
  const device = pool[0];
  if (!device) return { error: `No ${FAMILY[kind]} simulator on this Mac — add the iOS platform in Xcode → Settings → Components${wanted ? ` (plan.capture.ios.${field} is "${wanted}")` : ''}` };
  if (!wanted) return { device };
  const size = device.screen ? ` (${device.screen.join('×')}${own && same(device.screen, own) ? ', the same screen' : ''})` : '';
  return { device, note: `No "${wanted}" simulator on this Mac — using ${device.name}${size}. To choose another, set plan.capture.ios.${field} (xcrun simctl list devices).` };
}
