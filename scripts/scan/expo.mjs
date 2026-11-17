// Expo / React Native: app.json, app.config.*, package.json, plugins and usage strings.
import path from 'node:path';
import { safeJson } from './platform.mjs';

export function run(ctx) {
  const { files, read, rel, profile, deps } = ctx;
  const app = profile.app;
  const appJsonFile = files.find((f) => rel(f) === 'app.json');
  let cfg = appJsonFile ? safeJson(read(appJsonFile)) : null;
  cfg = cfg?.expo || cfg;
  const cfgFile = files.find((f) => /^app\.config\.(js|ts|mjs|cjs)$/.test(rel(f)));
  const cfgSrc = cfgFile ? read(cfgFile) : '';
  const grab = (key) => cfgSrc.match(new RegExp(`${key}\\s*:\\s*["'\`]([^"'\`]+)["'\`]`))?.[1];
  if (cfg || cfgSrc) {
    app.displayName ||= cfg?.name || grab('name');
    app.slug ||= cfg?.slug || grab('slug');
    app.bundleId ||= cfg?.ios?.bundleIdentifier || grab('bundleIdentifier');
    app.packageName ||= cfg?.android?.package || grab('package');
    app.version ||= cfg?.version || grab('version');
    app.description ||= cfg?.description;
    app.urlSchemes ||= cfg?.scheme ? [].concat(cfg.scheme) : undefined;
    if (cfg?.ios?.supportsTablet) app.supportsIPad = true;
    if (['dark', 'light'].includes(cfg?.userInterfaceStyle)) ctx.appearanceHint = cfg.userInterfaceStyle;
    const colors = [
      ['primaryColor', cfg?.primaryColor], ['splashBackground', cfg?.splash?.backgroundColor], ['adaptiveIcon', cfg?.android?.adaptiveIcon?.backgroundColor],
      ['backgroundColor', cfg?.backgroundColor], ['primaryColor', grab('primaryColor')],
    ];
    for (const [name, hex] of colors) if (hex && /^#[0-9a-f]{6}$/i.test(hex)) (ctx.colorHints ||= []).push({ hex, name, source: 'app.json', weight: name === 'primaryColor' ? 8 : 3 });
    const icon = cfg?.icon || grab('icon');
    if (icon) ctx.iconHints = [...(ctx.iconHints || []), path.resolve(ctx.root, icon)];
    const plist = cfg?.ios?.infoPlist || {};
    for (const [k, v] of Object.entries(plist)) if (/UsageDescription$/.test(k) && typeof v === 'string') (app.permissions ||= []).push({ key: k, text: v, file: 'app.json' });
    const plugins = (cfg?.plugins || []).map((p) => (Array.isArray(p) ? p[0] : p)).filter((p) => typeof p === 'string');
    if (plugins.length) app.expoPlugins = plugins;
  }
  const pkg = ctx.packageJson;
  if (pkg) {
    app.description ||= pkg.description;
    app.npmName ||= pkg.name;
    ctx.dependencyNames = Object.keys(deps || {});
  }
}
