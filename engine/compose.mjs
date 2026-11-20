// Compose a plan into one HTML "strip" page per (size, locale).
// Every shot is a slot of W×H laid side by side. Panorama plans share one continuous
// background and allow elements to cross slot edges; normal plans clip each slot.
// The page fits text in-browser and publishes window.__appshot = { ready, report, show(i) }.

import fs from 'node:fs';
import path from 'node:path';
import { ENGINE_DIR, readJson, exists, fileUrl, L, rng } from './lib/util.mjs';
import { esc, style, markup, plain, round } from './lib/html.mjs';
import { backgroundHtml } from './lib/background.mjs';
import { brandPalette, rgba, onColor, isDark, contrast } from './lib/color.mjs';
import { readPngInfo } from './lib/png.mjs';
import * as components from './components/index.mjs';

const SIZES = readJson(path.join(ENGINE_DIR, 'sizes.json'));
const LOCALES = readJson(path.join(ENGINE_DIR, 'locales.json')).locales;

export const sizeSpec = (id) => {
  const s = [...SIZES.sizes, ...SIZES.graphics, ...(SIZES.previews || [])].find((x) => x.id === id);
  if (!s) throw new Error(`Unknown size "${id}". Known: ${SIZES.sizes.map((x) => x.id).join(', ')}`);
  return s;
};
export const allSizes = () => SIZES.sizes;
export const localeSpec = (id) => LOCALES[id] || { name: id, appStore: id, play: id, dir: 'ltr', expansion: 1.2, maxHeadline: 34 };

// ---------- registries ----------

const cache = new Map();
async function load(kind, id) {
  const key = `${kind}/${id}`;
  if (cache.has(key)) return cache.get(key);
  const file = path.join(ENGINE_DIR, kind, `${id}.mjs`);
  if (!exists(file)) throw new Error(`Unknown ${kind.slice(0, -1)} "${id}" (${file})`);
  const mod = await import(fileUrl(file));
  cache.set(key, mod);
  return mod;
}
export const loadTemplate = (id) => load('templates', id);
export const loadFrame = (id) => load('frames', id);
export const loadScene = (id) => load('scenes', id);
export const loadDecor = (id) => load('decor', id);

export function listIds(kind) {
  return fs.readdirSync(path.join(ENGINE_DIR, kind))
    .filter((f) => f.endsWith(kind === 'themes' ? '.json' : '.mjs') && !f.startsWith('_') && f !== 'index.mjs')
    .map((f) => f.replace(/\.(json|mjs)$/, ''));
}

// ---------- themes ----------

const SYSTEM_STACK = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export function loadTheme(id) {
  const file = path.join(ENGINE_DIR, 'themes', `${id}.json`);
  if (!exists(file)) throw new Error(`Unknown theme "${id}". Run: node scripts/themes.mjs list`);
  return readJson(file);
}

/** Resolve plan-level theme + overrides + per-shot override into a complete theme object. */
export function resolveTheme(plan, shot = {}) {
  const base = typeof plan.theme === 'object' ? plan.theme : loadTheme(plan.theme || 'clean-light');
  let t = structuredClone(base);
  // A shot can switch to another theme by id (replaces the base) or patch it with an object.
  if (typeof shot.theme === 'string') t = structuredClone(loadTheme(shot.theme));
  else if (shot.theme?.id && shot.theme.id !== t.id) t = structuredClone(loadTheme(shot.theme.id));
  // "brand" is computed from plan.brand (primary/secondary/bg, optional dark).
  if (t.id === 'brand') {
    const b = brandPalette(plan.brand || {});
    t = {
      ...t, dark: b.dark, text: b.text, subtext: b.subtext, accent: b.accent, secondary: b.secondary,
      accentText: onColor(b.accent),
      bg: plan.brand?.bg || { type: 'mesh', base: b.bg, colors: [b.primary, b.secondary, b.bg2] },
    };
  }
  const themeAccentText = t.accentText;
  merge(t, plan.themeOverrides);
  if (shot.theme && typeof shot.theme === 'object') merge(t, shot.theme);
  // An overridden accent needs a matching text colour on pills/buttons unless one was given too.
  const ov = { ...(plan.themeOverrides || {}), ...(typeof shot.theme === 'object' ? shot.theme : {}) };
  if (ov.accent && !ov.accentText) t.accentText = contrast(themeAccentText || '#fff', t.accent) >= 4.5 ? themeAccentText : onColor(t.accent);
  t.dark = t.dark ?? isDark(typeof t.bg === 'string' ? t.bg : t.bg?.color || t.bg?.base || t.bg?.colors?.[0] || '#fff');
  t.text ||= t.dark ? '#FFFFFF' : '#0B0B12';
  t.subtext ||= rgba(t.text, 0.7);
  t.accent ||= '#5B5BF7';
  t.accentText ||= onColor(t.accent);
  t.fontDisplay = font(t.fontDisplay);
  t.fontText = font(t.fontText || t.fontDisplay);
  t.device ||= {};
  return t;
}

/** Base background colour of a theme (first stop / base) — what the caption sits on. */
export function themeBase(t) {
  const bg = t.bg;
  if (typeof bg === 'string') return bg;
  return bg?.color || bg?.base || bg?.colors?.[0] || '#ffffff';
}

/** Contrast of the highlight against what it sits on (pill modes are measured against the pill). */
export function highlightContrast(t) {
  const mode = t.highlight || 'color';
  if (mode === 'pill') return contrast(t.accentText || '#fff', t.accent);
  if (mode === 'sticker') return contrast(t.accent, t.stickerColor || '#FFFFFF');
  if (mode === 'none' || mode === 'outline' || mode === 'underline' || mode === 'marker') return contrast(t.text, themeBase(t));
  return contrast(t.accent, themeBase(t));
}

function merge(target, src) {
  if (!src) return target;
  for (const [k, v] of Object.entries(src)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object' && !Array.isArray(target[k])) merge(target[k], v);
    else target[k] = structuredClone(v);
  }
  return target;
}

function font(f) {
  if (!f) return { family: SYSTEM_STACK, stack: SYSTEM_STACK };
  if (typeof f === 'string') f = { family: f };
  const fam = f.family || 'system';
  const isSystem = /^(system|-apple-system|sf pro)/i.test(fam);
  return { ...f, stack: isSystem ? SYSTEM_STACK : `"${fam}", ${f.fallback || SYSTEM_STACK}`, family: fam, system: isSystem };
}

function googleFontsLink(themes, plan) {
  const fams = new Set();
  for (const t of themes) for (const f of [t.fontDisplay, t.fontText]) if (f?.google) fams.add(f.google);
  for (const g of plan.fonts?.google || []) fams.add(g);
  if (!fams.size || plan.offline) return '';
  const q = [...fams].map((g) => `family=${g.replace(/ /g, '+')}`).join('&');
  return `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?${q}&display=block">`;
}

function localFontFaces(plan, workspace, assetUrl) {
  return (plan.fonts?.local || []).map((f) => {
    const abs = path.resolve(workspace, f.src);
    return `@font-face{font-family:"${f.family}";src:url("${assetUrl(abs)}");font-weight:${f.weight || '100 900'};font-style:${f.style || 'normal'};font-display:block}`;
  }).join('\n');
}

// ---------- screens ----------

function placeholderScreen(label, theme, aspect) {
  const w = 600, h = Math.round(600 / aspect);
  const bg = theme.dark ? '#1c1c22' : '#eef0f4';
  const fg = theme.dark ? '#8a8a99' : '#8a8fa0';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="${bg}"/>`
    + `<g fill="${fg}" opacity="0.35"><rect x="40" y="110" width="520" height="160" rx="28"/><rect x="40" y="300" width="250" height="250" rx="28"/><rect x="310" y="300" width="250" height="250" rx="28"/><rect x="40" y="580" width="520" height="70" rx="20"/><rect x="40" y="670" width="520" height="70" rx="20"/><rect x="40" y="760" width="520" height="70" rx="20"/></g>`
    + `<text x="50%" y="${h - 120}" text-anchor="middle" font-family="-apple-system,Helvetica" font-size="30" font-weight="700" fill="${fg}">PLACEHOLDER · ${esc(label)}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function resolveScreen(ref, { workspace, kind, assetUrl, theme, fallbackAspect, label, locale }) {
  let p = ref;
  if (p && typeof p === 'object') p = p[kind] || p.phone || p.tablet || Object.values(p)[0];
  // Localised captures: "raw/{locale}/today.png" → raw/tr/today.png, falling back to raw/today.png.
  if (typeof p === 'string' && p.includes('{locale}')) {
    const lang = String(locale).split('-')[0];
    const cands = [p.replace('{locale}', locale), p.replace('{locale}', lang), p.replace('/{locale}', '').replace('{locale}/', '')];
    p = cands.find((c) => exists(path.resolve(workspace, c))) || cands[0];
  }
  if (!p) return { src: placeholderScreen(label || 'screen', theme, fallbackAspect), aspect: fallbackAspect, missing: true, path: null };
  if (/^(https?:|data:)/.test(p)) return { src: p, aspect: fallbackAspect, missing: false, path: p };
  const abs = path.isAbsolute(p) ? p : path.resolve(workspace, p);
  if (!exists(abs)) return { src: placeholderScreen(path.basename(p), theme, fallbackAspect), aspect: fallbackAspect, missing: true, path: abs };
  let aspect = fallbackAspect;
  try { const info = readPngInfo(abs); aspect = info.width / info.height; } catch {}
  return { src: assetUrl(abs), aspect, missing: false, path: abs };
}

// ---------- per-shot context ----------

function buildCtx({ plan, shot, index, total, W, H, size, locale, theme, workspace, assetUrl, frameMods, sceneMods = {}, panorama, isLast }) {
  const loc = localeSpec(locale);
  const fallbackLocale = plan.defaultLocale || plan.locales?.[0];
  const Lx = (v) => L(v, locale, fallbackLocale);
  const u = Math.min(W, H * 0.4615) / 100;
  const kind = size.kind || 'phone';
  const opts = shot.options || {};
  const opt = (k, d) => (opts[k] !== undefined ? opts[k] : d);

  const frameId = opt('frame', theme.device?.frame && theme.device.frame !== 'auto' ? adaptFrame(theme.device.frame, kind, size) : size.frame || 'iphone');
  const frameMod = frameMods[frameId];
  const fallbackAspect = frameMod?.meta?.screenAspect || (kind === 'tablet' ? 0.75 : 0.46);

  const screenRefs = shot.screens || (shot.screen ? [shot.screen] : []);
  const screens = (screenRefs.length ? screenRefs : [null]).map((ref, i) =>
    resolveScreen(ref, { workspace, kind, assetUrl, theme, fallbackAspect, locale, label: `${shot.id || index + 1}${i ? `-${i + 1}` : ''}` }));

  const ctx = {
    W, H, u, kind, size, index, total, isLast, locale, loc, rtl: loc.dir === 'rtl', plan, shot, theme, panorama, opt, L: Lx,
    headline: Lx(shot.headline), subhead: Lx(shot.subhead), eyebrow: Lx(shot.eyebrow),
    appIcon: plan.app?.icon ? assetUrl(path.resolve(workspace, plan.app.icon)) : null,
    appName: Lx(plan.app?.name) || '',
    screens, seed: `${plan.app?.name || 'app'}:${shot.id || index}`,
    rng: rng(`${plan.app?.name || 'app'}:${shot.id || index}`),
    asset: (p) => (p ? (/^(https?:|data:)/.test(p) ? p : assetUrl(path.resolve(workspace, p))) : null),
  };

  /** Device html for screen i at a given width. */
  ctx.device = ({ width, screen = 0, frame, color, shadow, fit, position } = {}) => {
    let fm = frameMods[frame || frameId] || frameMod;
    const sc = screens[screen] || screens[0];
    // A phone screenshot on a tablet canvas (or the reverse) keeps the frame that matches the pixels.
    if (!sc.missing && fm.meta.kind === 'tablet' && sc.aspect < 0.62) fm = frameMods[size.store === 'android' ? 'android' : 'iphone'];
    else if (!sc.missing && fm.meta.kind === 'phone' && sc.aspect > 0.62) fm = frameMods[size.store === 'android' ? 'android-tablet' : 'ipad'];
    return fm.render({
      width, src: sc.src, screenAspect: sc.aspect || fallbackAspect,
      color: color || opt('deviceColor', theme.device?.color),
      shadow: shadow || opt('shadow', theme.device?.shadow),
      accent: theme.accent, fit, position,
    });
  };
  /** Height a device would have at `width` (for layout maths). */
  ctx.deviceHeight = (width, screen = 0, frame) => ctx.device({ width, screen, frame }).height;
  /** Largest width that fits inside maxW × maxH. */
  ctx.fitDevice = ({ maxW, maxH, screen = 0, frame }) => {
    const h1 = ctx.deviceHeight(1000, screen, frame) / 1000;
    return Math.min(maxW, maxH / h1);
  };

  /** Absolutely positioned element. Optional rotate (deg), 3D tilt, z-index. */
  ctx.at = (x, y, inner, { w, h, rotate, tilt, origin = 'center', z, opacity, className = '' } = {}) => {
    const tf = [];
    if (tilt) tf.push(`perspective(${round(W * 3)}px) rotateX(${tilt.x || 0}deg) rotateY(${tilt.y || 0}deg)`);
    if (rotate) tf.push(`rotate(${rotate}deg)`);
    return `<div class="${className}" style="${style({ position: 'absolute', left: x, top: y, width: w, height: h, transform: tf.join(' ') || undefined, transformOrigin: origin, zIndex: z, opacity })}">${inner}</div>`;
  };

  /** Place a device: centre-x / top, with optional rotation. Returns { html, x, y, w, h, screen }. */
  ctx.placeDevice = ({ width, cx = W / 2, top, cy, screen = 0, rotate, tilt, z = 2, frame, color, shadow }) => {
    const d = ctx.device({ width, screen, frame, color, shadow });
    const x = cx - d.width / 2;
    const y = top !== undefined ? top : cy - d.height / 2;
    return { ...d, x, y, w: d.width, h: d.height, html: ctx.at(x, y, d.html, { w: d.width, h: d.height, rotate, tilt, z, className: 'dv-wrap' }) };
  };

  /** Headline / subhead / eyebrow block that auto-fits its box. subClass "kick" sets the subhead in display type. */
  ctx.text = ({ x, y, w, h, align = 'center', valign = 'top', max = 10, min = 5.4, lines = 3, subRatio = 0.42, gap = 2, color, subColor, headline = ctx.headline, subhead = ctx.subhead, eyebrow = ctx.eyebrow, maxW, subClass = '' } = {}) => {
    const a = ctx.rtl && align === 'left' ? 'right' : align;
    const jc = { top: 'flex-start', center: 'center', bottom: 'flex-end' }[valign];
    const ai = { left: 'flex-start', center: 'center', right: 'flex-end' }[a];
    const eyebrowHtml = eyebrow ? `<div class="eyebrow" style="margin-bottom:${round(u * gap * 0.9)}px">${components.chip({ text: eyebrow, variant: opt('eyebrowStyle', theme.eyebrow || 'soft'), size: 3.1 }, ctx)}</div>` : '';
    return `<div class="tb" data-fit data-max="${round(u * max)}" data-min="${round(u * min)}" data-lines="${lines}" data-sub="${subRatio}"${loc.hyphens ? ' data-hyphens' : ''} style="${style({
      position: 'absolute', left: x, top: y, width: w, height: h, display: 'flex', flexDirection: 'column', justifyContent: jc, alignItems: ai, textAlign: a, zIndex: 5,
    })}"><div class="tb-in" style="${style({ maxWidth: maxW, display: 'flex', flexDirection: 'column', alignItems: ai })}">${eyebrowHtml}`
      + (headline ? `<h1 class="hd" style="${style({ color: color || theme.text })}">${markup(headline)}</h1>` : '')
      + (subhead ? `<p class="sh${subClass ? ` ${subClass}` : ''}" style="${style({ color: subColor || theme.subtext, marginTop: round(u * gap) })}">${markup(subhead)}</p>` : '')
      + `</div></div>`;
  };

  ctx.c = Object.fromEntries(Object.entries(components).map(([k, fn]) => [k, (spec = {}) => fn(spec, ctx)]));

  // ---- motion (creative assets; harmless elsewhere) ----
  // Every motion is periodic over one loop, so frame N joins frame 0 without a jump. Amplitudes are px.
  const MOTION_SCALE = { none: 0, calm: 0.6, gentle: 1, lively: 1.7 };
  ctx.motionScale = MOTION_SCALE[plan.creative?.motion ?? opt('motion', 'gentle')] ?? 1;
  ctx.motion = (inner, spec = {}) => {
    // motion "none": ambient drift disappears, everything else is frozen at the poster pose (body[data-frozen]).
    const tag = spec.tag || 'div';
    if (!ctx.motionScale && ['float', 'zoom'].includes(spec.type || 'float')) return spec.css ? `<${tag} style="${spec.css}">${inner}</${tag}>` : inner;
    const k = ctx.motionScale || 1;
    const m = { ...spec };
    // Only drift amplitudes scale with the motion amount; paths, orbits and timings stay exact.
    if (['float', 'zoom', 'pulse', 'pop'].includes(m.type)) for (const key of ['x', 'y', 'rot', 'amp', 'dy']) if (typeof m[key] === 'number') m[key] = Math.round(m[key] * k * 1000) / 1000;
    const cls = ['mo', spec.className].filter(Boolean).join(' ');
    delete m.tag; delete m.className; delete m.css;
    return `<${tag} class="${cls}" data-motion="${esc(JSON.stringify(m))}" ${spec.css ? ` style="${spec.css}"` : ''}>${inner}</${tag}>`;
  };
  /** Render a scene from engine/scenes (animated key art). opts: { hero, intensity, variant }. */
  ctx.scene = (id, opts = {}) => {
    const mod = sceneMods[id] || sceneMods['icon-glow'];
    return mod ? mod.render(ctx, opts) : '';
  };
  ctx.sceneIds = Object.keys(sceneMods);
  /** Device whose screen cross-fades through several captures during the loop. */
  ctx.deviceCycle = ({ width, screens: idx = [0], frame, color, shadow } = {}) => {
    const d = ctx.device({ width, screen: idx[0], frame, color, shadow });
    if (idx.length < 2 || !ctx.motionScale) return d;
    const imgs = idx.map((i, n) => `<img class="dv-img mo-frame" src="${esc((screens[i] || screens[0]).src)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;display:block;opacity:${n ? 0 : 1}">`).join('');
    const stack = `<div data-motion="${esc(JSON.stringify({ type: 'screens', n: idx.length, fade: 0.22 }))}" style="position:absolute;inset:0">${imgs}</div>`;
    return { ...d, html: d.html.replace(/<img class="dv-img"[^>]*>/, stack) };
  };
  const sf = size.safe || { x: 0.05, y: 0.05, w: 0.9, h: 0.9 };
  ctx.safe = { x: sf.x * W, y: sf.y * H, w: sf.w * W, h: sf.h * H };
  ctx.creative = size.creative || null;
  return ctx;
}

/** Map a theme's preferred frame to the right family for the canvas kind/store. */
function adaptFrame(frame, kind, size) {
  if (['flat', 'clay', 'outline'].includes(frame)) return frame;
  if (kind === 'tablet') return size.store === 'android' ? 'android-tablet' : 'ipad';
  if (size.store === 'android') return 'android';
  if (size.frame === 'iphone-classic') return 'iphone-classic';
  return frame.startsWith('iphone') ? frame : 'iphone';
}

// ---------- page ----------

export async function compose({ plan, workspace, sizeId, locale, assetUrl = fileUrl, only, viewAll = false, size: sizeOverride }) {
  // sizeOverride: a size object built by the caller (app preview in landscape swaps width and height).
  const size = sizeOverride || sizeSpec(sizeId);
  const W = size.width, H = size.height;
  // Store-specific overrides: plan.storeOverrides.android = { theme: {...}, ... }; shot.skipOn = ['android'].
  const storeOv = plan.storeOverrides?.[size.store] || {};
  plan = { ...plan, themeOverrides: merge(structuredClone(plan.themeOverrides || {}), storeOv.theme || {}) };
  const shots = (plan.shots || [])
    .map((s, i) => ({ s: s.storeOverrides?.[size.store] ? merge(structuredClone(s), s.storeOverrides[size.store]) : s, i }))
    .filter(({ s, i }) => !(s.skipOn || []).includes(size.store) && !(s.skipOn || []).includes(size.id))
    .filter(({ s, i }) => !only || only.includes(i) || only.includes(s.id));
  const panorama = !!(plan.panorama || plan.background?.mode === 'panorama');
  const N = shots.length;
  const stripW = W * N;

  const frameIds = new Set(listIds('frames'));
  const frameMods = {};
  for (const id of frameIds) frameMods[id] = await loadFrame(id);
  // Scenes (animated key art) are only needed on creative canvases.
  const sceneMods = {};
  if (size.creative || shots.some(({ s }) => s.options?.scene || s.options?.backdrop)) for (const id of listIds('scenes')) sceneMods[id] = await loadScene(id);

  const baseTheme = resolveTheme(plan);
  const themes = [];
  let slotsHtml = '';
  for (let k = 0; k < N; k++) {
    const { s: shot, i } = shots[k];
    const theme = resolveTheme(plan, shot);
    themes.push(theme);
    const tpl = await loadTemplate(shot.layout || 'hero-device');
    const ctx = buildCtx({ plan, shot, index: i, total: plan.shots.length, W, H, size, locale, theme, workspace, assetUrl, frameMods, sceneMods, panorama, isLast: k === N - 1 });
    let inner = '';
    // Non-panorama slots own their background; theme.bgAlt rotates backgrounds per shot.
    if (!panorama || shot.background) {
      let bg = shot.background || (theme.bgAlt?.length ? theme.bgAlt[i % theme.bgAlt.length] : theme.bg);
      if (bg?.type === 'image' && bg.src) bg = { ...bg, src: ctx.asset(bg.src) };
      const bgHtml = backgroundHtml(bg, { W, H, seed: ctx.seed });
      inner += size.creative && ctx.motionScale && shot.options?.bgMotion !== false
        ? `<div style="position:absolute;inset:0;overflow:hidden">${ctx.motion(`<div style="position:absolute;inset:0;transform:scale(1.08)">${bgHtml}</div>`, { type: 'float', x: W * 0.012, y: H * 0.015, phase: 0.1 })}</div>`
        : bgHtml;
      if (!panorama) inner += await decorHtml(theme.decor, { W, H, theme, seed: ctx.seed, slotW: W });
    }
    inner += await decorHtml(shot.decor, { W, H, theme, seed: ctx.seed + ':shot', slotW: W });
    inner += tpl.render(ctx);
    slotsHtml += `<section class="slot" data-index="${k}" data-shot="${esc(shot.id || i + 1)}" data-layout="${esc(shot.layout || 'hero-device')}" data-missing="${(shot.screens || shot.screen) ? ctx.screens.filter((x) => x.missing).length : 0}" style="${style({
      position: 'absolute', left: k * W, top: 0, width: W, height: H, overflow: panorama ? 'visible' : 'hidden', zIndex: panorama ? N - k : 1,
    })}">${inner}</section>`;
  }

  let stripBg = '';
  if (panorama) {
    let sbg = plan.background?.bg || baseTheme.bg;
    if (sbg?.type === 'image' && sbg.src && !/^(https?:|data:)/.test(sbg.src)) sbg = { ...sbg, src: assetUrl(path.resolve(workspace, sbg.src)) };
    stripBg = backgroundHtml(sbg, { W: stripW, H, slotW: W, seed: `${plan.app?.name}:strip` })
      + await decorHtml([...(baseTheme.decor || []), ...(plan.background?.decor || [])], { W: stripW, H, theme: baseTheme, seed: `${plan.app?.name}:strip`, slotW: W });
  }

  const loc = localeSpec(locale);
  const u = Math.min(W, H * 0.4615) / 100;
  const t = baseTheme;
  // Theme face first so Latin glyphs keep the look; the locale font fills its script.
  // Locales with preferLocaleFont (vi: stacked diacritics) use the locale font for everything.
  const stackFor = (f) => (loc.font ? (loc.preferLocaleFont ? `${loc.font}, ${f.stack}` : f.stack.replace(/,/, `, ${loc.font},`)) : f.stack);
  // Type and highlight rules are scoped per slot, so a shot can switch theme (and the theme board works).
  const typeCss = (th, sel) => `${sel}{--font-display:${stackFor(th.fontDisplay)};--font-text:${stackFor(th.fontText)};--accent:${th.accent};--text:${th.text}}
${sel} .hd{font-weight:${th.headlineWeight ?? 800};letter-spacing:${th.tracking ?? '-0.025em'};line-height:${th.leading ?? 1.06};${th.case === 'upper' ? 'text-transform:uppercase;' : 'text-transform:none;'}}
${sel} .sh{font-weight:${th.subheadWeight ?? 500}}
${sel} .sh.kick{font-family:var(--font-display);font-weight:${th.headlineWeight ?? 800};letter-spacing:${th.tracking ?? '-0.025em'};line-height:1.08;${th.case === 'upper' ? 'text-transform:uppercase;' : ''}}
${sel} .hd em{font-style:${th.emStyle || 'italic'}}
${highlightCss(th).replace(/^\.hl/, `${sel} .hl`)}`;
  const slotCss = themes.map((th, k) => typeCss(th, `.slot[data-index="${k}"]`)).join('\n');
  const css = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${viewAll ? stripW : W}px;height:${H}px;overflow:hidden;background:${typeof t.bg === 'string' ? t.bg : '#000'}}${viewAll ? `.slot{outline:${Math.max(2, Math.round(W / 300))}px solid rgba(128,128,128,.35);outline-offset:-1px}` : ''}
body{-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;font-family:var(--font-text);font-kerning:normal}
.strip{position:absolute;left:0;top:0;width:${stripW}px;height:${H}px;will-change:transform}
.hd{font-family:var(--font-display);text-wrap:balance;font-size:${round(u * 9)}px;hyphens:manual;${loc.keepAll ? 'word-break:keep-all;' : ''}${loc.cjk ? 'line-break:strict;' : 'overflow-wrap:normal;'}}
.sh{font-family:var(--font-text);line-height:1.3;letter-spacing:-0.005em;text-wrap:balance;font-size:${round(u * 3.8)}px}
.hd em{font-weight:inherit}
${typeCss(t, ':root')}
${slotCss}
${localFontFaces(plan, workspace, assetUrl)}
${plan.css || ''}`;

  const html = `<!doctype html><html lang="${esc(locale)}" dir="${loc.dir || 'ltr'}"><head><meta charset="utf-8">
<meta name="viewport" content="width=${viewAll ? stripW : W}">
${googleFontsLink(themes.concat(baseTheme), plan)}
<style>${css}</style></head><body data-poster="${Number(plan.creative?.poster ?? 0.42)}"${(plan.creative?.motion ?? '') === 'none' ? ' data-frozen="1"' : ''}>
<div class="strip" id="strip">${stripBg}${slotsHtml}</div>
<script>${FIT_SCRIPT}</script>
</body></html>`;

  return { html, W, H, size, slots: shots.map(({ s, i }) => ({ index: i, id: s.id || String(i + 1) })), panorama, fonts: [t.fontDisplay.family, t.fontText.family] };
}

async function decorHtml(list, ctx) {
  if (!list?.length) return '';
  let out = '';
  for (const spec of list) {
    if (!spec?.type) continue;
    const mod = await loadDecor(spec.type);
    out += mod.render(spec, ctx);
  }
  return out;
}

function highlightCss(t) {
  const a = t.accent, at = t.accentText;
  // Every mode starts from a reset so a slot's mode never inherits another theme's pill/underline.
  const R = 'background:none;padding:0;margin:0;border-radius:0;text-decoration:none;-webkit-text-stroke:0;-webkit-background-clip:border-box;background-clip:border-box;color:inherit;text-shadow:none;';
  return highlightRule(t, a, at).replace('.hl{', `.hl{${R}`);
}

/** Die-cut outline: two rings of hard text-shadows (the inner ring closes the gaps of the outer one). */
function stickerRing(color, r = 0.075) {
  const out = [];
  for (const [rad, n] of [[r, 24], [r * 0.55, 12]]) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      out.push(`${(Math.cos(a) * rad).toFixed(3)}em ${(Math.sin(a) * rad).toFixed(3)}em 0 ${color}`);
    }
  }
  return out.join(',');
}

function highlightRule(t, a, at) {
  switch (t.highlight || 'color') {
    case 'sticker': return `.hl{color:${a};text-shadow:${stickerRing(t.stickerColor || '#FFFFFF')},0 .1em .16em rgba(0,0,0,.18)}`;
    case 'pill': return `.hl{background:${a};color:${at};padding:0 .16em;margin:0 -.04em;border-radius:.18em;-webkit-box-decoration-break:clone;box-decoration-break:clone}`;
    case 'marker': return `.hl{background:linear-gradient(180deg,transparent 58%,${rgba(a, 0.85)} 58%,${rgba(a, 0.85)} 92%,transparent 92%);padding:0 .05em}`;
    case 'underline': return `.hl{text-decoration:underline;text-decoration-color:${a};text-decoration-thickness:.09em;text-underline-offset:.12em}`;
    case 'gradient': return `.hl{background:linear-gradient(90deg,${a},${t.secondary || a});-webkit-background-clip:text;background-clip:text;color:transparent}`;
    case 'outline': return `.hl{color:transparent;-webkit-text-stroke:.035em ${t.text}}`;
    case 'none': return `.hl{}`;
    case 'color':
    default: return `.hl{color:${a}}`;
  }
}

// In-page: wait for fonts, shrink headlines to fit, measure, expose report + slot switcher.
const FIT_SCRIPT = `
(function(){
  const strip = document.getElementById('strip');
  const W = parseInt(getComputedStyle(document.querySelector('.slot') || document.body).width, 10) || window.innerWidth;
  // Shrink first; hyphenate only long words, and only when shrinking alone cannot make it fit.
  function fitBlock(b){
    const r = fitOnce(b);
    const hd = b.querySelector('.hd');
    if (r.ok || !hd || !b.hasAttribute('data-hyphens')) return r;
    hd.style.hyphens = 'auto';
    hd.style.setProperty('hyphenate-limit-chars', '11 5 4');
    return { ...fitOnce(b), hyphenated: true };
  }
  function fitOnce(b){
    const hd = b.querySelector('.hd'), sh = b.querySelector('.sh'), inner = b.querySelector('.tb-in');
    const max = +b.dataset.max, min = +b.dataset.min, maxLines = +b.dataset.lines, ratio = +b.dataset.sub;
    let size = max, ok = false, lines = 0;
    for (let k = 0; k < 60; k++) {
      if (hd) hd.style.fontSize = size + 'px';
      if (sh) sh.style.fontSize = Math.max(size * ratio, min * 0.5, 18) + 'px';
      const lh = hd ? parseFloat(getComputedStyle(hd).lineHeight) || size * 1.1 : 1;
      lines = hd ? Math.round(hd.getBoundingClientRect().height / lh) : 0;
      const tooTall = inner.getBoundingClientRect().height > b.clientHeight + 1;
      // Overflow only matters against the text box (inline pill padding may poke past the h1 itself).
      const tooWide = hd && Math.max(hd.scrollWidth, inner.scrollWidth) > b.clientWidth + 2;
      if (!tooTall && !tooWide && lines <= maxLines) { ok = true; break; }
      if (size <= min) break;
      size = Math.max(min, size * 0.96);
    }
    return { fontSize: Math.round(size), max, min, lines, ok };
  }
  function rectIn(el, slot){
    const r = el.getBoundingClientRect(), s = slot.getBoundingClientRect();
    return { x: Math.round(r.left - s.left), y: Math.round(r.top - s.top), w: Math.round(r.width), h: Math.round(r.height) };
  }
  function overlap(a, b){
    const x = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
    const y = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    return x * y;
  }
  function measure(){
    const slots = [...document.querySelectorAll('.slot')];
    return slots.map((slot) => {
      const blocks = [...slot.querySelectorAll('[data-fit]')].map((b) => {
        const fit = fitBlock(b);
        const inner = b.querySelector('.tb-in');
        return { ...fit, rect: rectIn(inner, slot), headline: (b.querySelector('.hd')||{}).innerText || '' };
      });
      const devices = [...slot.querySelectorAll('.dv-screen')].map((d) => rectIn(d, slot));
      let textOverDevice = 0;
      for (const b of blocks) for (const d of devices) textOverDevice = Math.max(textOverDevice, overlap(b.rect, d) / Math.max(1, b.rect.w * b.rect.h));
      const imgs = [...slot.querySelectorAll('img')];
      return {
        index: +slot.dataset.index, shot: slot.dataset.shot, layout: slot.dataset.layout,
        missingScreens: +slot.dataset.missing, text: blocks, devices, textOverDevice: Math.round(textOverDevice * 100) / 100,
        brokenImages: imgs.filter((i) => !i.complete || !i.naturalWidth).map((i) => i.src.slice(0, 120)),
      };
    });
  }
  function show(i){ strip.style.transform = 'translateX(' + (-i * W) + 'px)'; }
  const ready = (async () => {
    const timeout = new Promise((r) => setTimeout(r, 6000));
    await Promise.race([document.fonts.ready, timeout]);
    const fams = [...new Set([...document.querySelectorAll('.hd,.sh')].map((e) => getComputedStyle(e).fontFamily.split(',')[0].replace(/["']/g,'').trim()))];
    await Promise.race([Promise.all(fams.map((f) => document.fonts.load('800 64px "' + f + '"').catch(() => null))), timeout]);
    await Promise.all([...document.images].map((im) => im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; })));
    const report = measure();
    const fontsLoaded = fams.map((f) => ({ family: f, loaded: document.fonts.check('800 64px "' + f + '"') }));
    window.__appshot.report = { slots: report, fonts: fontsLoaded };
    if (document.querySelector('[data-motion]')) setTime(Number(document.body.dataset.poster || 0.42), 1);
    const h = parseInt(location.hash.slice(1), 10);
    if (!isNaN(h)) show(h);
    return window.__appshot.report;
  })();
  // ---- motion timeline: setTime(seconds, loopSeconds) poses every [data-motion] element ----
  // 2D transforms only and no will-change: on 4K-class canvases dozens of composited layers exhaust Chrome's
  // tile memory and parts of the frame come out black. Every frame is repainted instead.
  // ph = loop fraction × cycles + phase (mod 1). Every type is periodic in ph, and cycles are integers,
  // so the last frame joins the first. Types: float zoom carousel pop screens spin osc pulse orbit path
  // travel ripple dash slide grow (see skills/design/motion.md).
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const TAU = Math.PI * 2;
  const dw = (x) => x - Math.round(x);
  const specs = new WeakMap();
  const paths = new Map();
  function pathOf(d) {
    if (paths.has(d)) return paths.get(d);
    let host = document.getElementById('__mpaths');
    if (!host) { host = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); host.id = '__mpaths'; host.setAttribute('width', '0'); host.setAttribute('height', '0'); host.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden'; document.body.appendChild(host); }
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path'); el.setAttribute('d', d); host.appendChild(el);
    const rec = { el, len: el.getTotalLength() }; paths.set(d, rec); return rec;
  }
  function setTime(sec, period) {
    let p = (((sec % period) + period) % period) / period;
    if (document.body.dataset.frozen) p = Number(document.body.dataset.poster || 0.42);
    for (const el of document.querySelectorAll('[data-motion]')) {
      let m = specs.get(el);
      if (!m) { m = JSON.parse(el.dataset.motion); specs.set(el, m); }
      const ph = (((p * (m.cycles || 1) + (m.phase || 0)) % 1) + 1) % 1;
      const s = Math.sin(TAU * ph), c = Math.cos(TAU * ph);
      const st = el.style;
      switch (m.type) {
        case 'float': st.transform = 'translate(' + (m.x || 0) * c + 'px,' + (m.y || 0) * s + 'px) rotate(' + (m.rot || 0) * s + 'deg)'; break;
        case 'zoom': st.transform = 'scale(' + (1 + (m.amp || 0.02) * (0.5 - 0.5 * c)) + ')'; break;
        case 'carousel': st.transform = 'translate(' + (-p * m.distance) + 'px,0)'; break;
        case 'slide': st.transform = m.axis === 'y' ? 'translate(0,' + (-ph * m.distance) + 'px)' : 'translate(' + (-ph * m.distance) + 'px,0)'; break;
        case 'spin': st.transform = 'rotate(' + ((m.from || 0) + 360 * (m.dir || 1) * ph) + 'deg)'; break;
        case 'osc': {
          const v = (m.lo ?? 0) + ((m.hi ?? 1) - (m.lo ?? 0)) * (0.5 - 0.5 * c);
          if (m.prop === 'opacity') st.opacity = v;
          else if (m.prop === 'rotate') st.transform = 'rotate(' + v + 'deg)';
          else if (m.prop === 'x') st.transform = 'translate(' + v + 'px,0)';
          else if (m.prop === 'y') st.transform = 'translate(0,' + v + 'px)';
          else st.transform = (m.prop || 'scale') + '(' + v + ')';
          break;
        }
        case 'pulse': {
          const b = m.mode === 'breathe' ? 0.5 - 0.5 * c : Math.exp(-((dw(ph) / 0.045) ** 2)) + 0.55 * Math.exp(-((dw(ph - 0.17) / 0.05) ** 2));
          st.transform = 'scale(' + (1 + (m.amp || 0.06) * b) + ')';
          if (m.glow) st.opacity = (m.lo ?? 0.55) + (1 - (m.lo ?? 0.55)) * Math.min(1, b);
          break;
        }
        case 'orbit': {
          const x = (m.rx || 0) * c, y = (m.ry || 0) * s;
          let tf = 'translate(' + x + 'px,' + y + 'px)';
          if (m.depth) tf += ' scale(' + (1 + m.depth * s) + ')';
          if (m.face) tf += ' rotate(' + (Math.atan2((m.ry || 0) * c, -(m.rx || 0) * s) * 180 / Math.PI + (m.faceOffset || 0)) + 'deg)';
          st.transform = tf;
          if (m.zFront !== undefined) st.zIndex = s > 0 ? m.zFront : m.zBack;
          if (m.dim) st.opacity = 1 - m.dim * (0.5 - 0.5 * s);
          break;
        }
        case 'path': {
          const P = pathOf(m.d);
          // win: [start, end] of the loop in which the sprite runs the path (eased like a dash "draw"), then waits for "out".
          const t = m.win ? sm(m.win[0], m.win[1], ph) : ph;
          const a = P.el.getPointAtLength(t * P.len), b = P.el.getPointAtLength(Math.min(P.len, t * P.len + 1)), b0 = P.el.getPointAtLength(Math.max(0, t * P.len - 1));
          let tf = 'translate(' + a.x + 'px,' + a.y + 'px)';
          if (m.face) tf += ' rotate(' + (Math.atan2(b.y - b0.y, b.x - b0.x) * 180 / Math.PI + (m.faceOffset || 0)) + 'deg)';
          if (m.scale) tf += ' scale(' + m.scale + ')';
          st.transform = tf;
          if (m.win) st.opacity = (m.o ?? 1) * sm(m.win[0], m.win[0] + 0.02, ph) * (1 - sm(m.out ?? 0.92, (m.out ?? 0.92) + 0.06, ph));
          else if (m.open) st.opacity = (m.o ?? 1) * sm(0, m.fade || 0.08, t) * (1 - sm(1 - (m.fade || 0.08), 1, t));
          break;
        }
        case 'travel': {
          // win: [start, end] — the trip happens only inside that part of the cycle (a shooting star, a falling slice).
          let t = ph;
          if (m.win) { t = (ph - m.win[0]) / (m.win[1] - m.win[0]); if (t < 0 || t > 1) { st.opacity = 0; break; } }
          if (m.ease === 'in') t = t * t; else if (m.ease === 'out') t = 1 - (1 - t) * (1 - t); else if (m.ease === 'sm') t = t * t * (3 - 2 * t);
          const x = (m.x0 || 0) + ((m.x1 || 0) - (m.x0 || 0)) * t + (m.wx || 0) * Math.sin(TAU * t * (m.wc || 1));
          const y = (m.y0 || 0) + ((m.y1 || 0) - (m.y0 || 0)) * t + (m.wy || 0) * Math.sin(TAU * t * (m.wc || 1) + 1.3);
          const sc = (m.s0 ?? 1) + ((m.s1 ?? 1) - (m.s0 ?? 1)) * t;
          const r = (m.r0 || 0) + ((m.r1 || 0) - (m.r0 || 0)) * t;
          st.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + r + 'deg) scale(' + sc + ')';
          st.opacity = (m.o ?? 1) * sm(0, m.fi ?? 0.15, t) * (1 - sm(1 - (m.fo ?? 0.25), 1, t));
          break;
        }
        case 'ripple': {
          const e = 1 - (1 - ph) ** 2;
          st.transform = 'scale(' + ((m.s0 ?? 0.2) + ((m.s1 ?? 1) - (m.s0 ?? 0.2)) * e) + ')';
          st.opacity = (m.o ?? 0.8) * (1 - ph) ** 1.4 * sm(0, 0.04, ph);
          break;
        }
        case 'dash': {
          if (m.mode === 'draw') {
            const d = sm(m.in ?? 0.05, (m.in ?? 0.05) + (m.len ?? 0.3), ph);
            st.strokeDashoffset = String(1 - d);
            st.opacity = String(1 - sm(m.out ?? 0.9, (m.out ?? 0.9) + 0.06, ph));
          } else st.strokeDashoffset = String(-ph * (m.dir || 1));
          break;
        }
        case 'grow': {
          const o = sm(m.in ?? 0.05, (m.in ?? 0.05) + (m.len ?? 0.12), ph) * (1 - sm(m.out ?? 0.9, (m.out ?? 0.9) + 0.06, ph));
          const v = (m.from ?? 0) + (1 - (m.from ?? 0)) * o + (m.over || 0) * Math.sin(Math.PI * Math.min(1, sm(m.in ?? 0.05, (m.in ?? 0.05) + (m.len ?? 0.12), ph)));
          st.transform = m.axis === 'y' ? 'scaleY(' + v + ')' : m.axis === 'x' ? 'scaleX(' + v + ')' : 'scale(' + v + ')';
          if (m.fade !== false) st.opacity = Math.min(1, o * 1.6);
          break;
        }
        case 'pop': {
          const o = sm(m.in, m.in + 0.06, p) * (1 - sm(m.out - 0.06, m.out, p));
          st.opacity = o;
          st.transform = 'translate(0,' + (1 - o) * (m.dy || 30) + 'px) scale(' + (0.92 + 0.08 * o) + ')';
          break;
        }
        case 'screens': {
          const imgs = el.querySelectorAll('img'), n = imgs.length;
          const pos = p * n, k = Math.floor(pos) % n, frac = pos - Math.floor(pos);
          imgs.forEach((im, i) => {
            if (i === k) { im.style.opacity = sm(0, m.fade || 0.2, frac); im.style.zIndex = 2; }
            else if (i === (k - 1 + n) % n) { im.style.opacity = 1; im.style.zIndex = 1; }
            else { im.style.opacity = 0; im.style.zIndex = 0; }
          });
          break;
        }
      }
    }
  }
  window.__appshot = { ready, show, setTime, report: null };
  window.addEventListener('hashchange', () => { const h = parseInt(location.hash.slice(1), 10); if (!isNaN(h)) show(h); });
})();`;

export { plain };
