// Structural validation of plan.json against the registries. Copy quality lives in lib/copyrules.mjs.
import path from 'node:path';
import { exists, L } from './lib/util.mjs';
import * as reg from './registry.mjs';
import { resolveTheme, highlightContrast, listIds } from './compose.mjs';

export async function validatePlan(plan, { workspace } = {}) {
  const errors = [], warnings = [];
  // Screen paths may hold {locale}: check them against the plan's locales (the default first), as render resolves them.
  const locs = [plan.defaultLocale, ...(plan.locales || [])].filter(Boolean);
  const found = (x) => !x.includes('{locale}') ? exists(path.resolve(workspace, x)) : locs.some((l) => exists(path.resolve(workspace, x.replaceAll('{locale}', l))) || exists(path.resolve(workspace, x.replaceAll('{locale}/', '').replaceAll('/{locale}', ''))));
  const E = (m) => errors.push(m), W = (m) => warnings.push(m);
  const layouts = await reg.layouts();
  const themes = reg.themes();
  const sizes = new Set(reg.sizes().map((s) => s.id));
  const locales = reg.locales();
  const frames = await reg.frames();

  if (!plan.app?.name) W('app.name is missing (used by text-hero, notifications, search preview).');
  if (plan.app?.icon && workspace && !exists(path.resolve(workspace, plan.app.icon))) W(`app.icon not found: ${plan.app.icon}`);
  if (typeof plan.theme === 'string' && !themes[plan.theme]) E(`Unknown theme "${plan.theme}". Known: ${Object.keys(themes).join(', ')}`);
  for (const s of plan.sizes || []) if (!sizes.has(s)) E(`Unknown size "${s}". Known: ${[...sizes].join(', ')}`);
  for (const l of plan.locales || []) if (!locales[l]) W(`Locale "${l}" is not in engine/locales.json — store codes may not map on export.`);
  if (!Array.isArray(plan.shots) || !plan.shots.length) E('plan.shots is empty.');
  if (plan.creative) {
    const c = plan.creative;
    const scenes = listIds('scenes');
    if (c.motion && !['none', 'calm', 'gentle', 'lively'].includes(c.motion)) E(`creative.motion "${c.motion}" — use none | calm | gentle | lively`);
    if (c.fps && ![30, 60].includes(Number(c.fps))) E('creative.fps must be 30 or 60 (Apple).');
    if (c.duration && (c.duration < 5 || c.duration > 30)) E('creative.duration must be 5–30 seconds (Apple).');
    for (const a of ['header', 'search', 'universal']) {
      const l = c[a]?.layout || c.layout;
      if (l && !layouts[l]?.creative) E(`creative.${a}.layout "${l}" — use creative-scene | creative-split | creative-stage | creative-carousel`);
      const o = c[a]?.options || {};
      for (const k of ['scene', 'backdrop']) if (o[k] && !scenes.includes(o[k])) E(`creative.${a}.options.${k} "${o[k]}" — known scenes: ${scenes.join(', ')}`);
      if (c[a]?.poster !== undefined && !(c[a].poster >= 0 && c[a].poster <= 1)) E(`creative.${a}.poster must be 0–1 (a moment of the loop).`);
    }
    if (c.scene && !scenes.includes(c.scene)) E(`creative.scene "${c.scene}" — known scenes: ${scenes.join(', ')}`);
    for (const sref of c.screens || []) if (workspace && !found(sref)) W(`creative.screens: not found ${sref}`);
  }
  if (plan.preview) {
    const p = plan.preview;
    const previewSizes = new Set(reg.previews().map((s) => s.id));
    for (const s of p.sizes || []) if (!previewSizes.has(s)) E(`preview.sizes "${s}" — known: ${[...previewSizes].join(', ')}`);
    if (p.style && !['store', 'framed', 'full', 'promo'].includes(p.style)) E(`preview.style "${p.style}" — use store (App Store, full-bleed) | promo (device, social/YouTube) | framed (legacy)`);
    for (const s2 of p.promoSizes || []) if (!['promo-vertical', 'promo-landscape', 'promo-square'].includes(s2)) E(`preview.promoSizes "${s2}" — use promo-vertical | promo-landscape | promo-square`);
    if (p.backdrop && p.backdrop !== 'auto' && p.backdrop !== 'none' && !listIds('scenes').includes(p.backdrop)) E(`preview.backdrop "${p.backdrop}" — auto | none | a scene id`);
    if (p.style === 'framed') W('preview.style "framed" frames the footage — Apple has rejected app previews for that; keep it for promo videos.');
    if (p.camera && !['auto', 'none'].includes(p.camera)) E(`preview.camera "${p.camera}" — use auto | none`);
    if (p.captionAt && !['auto', 'top', 'bottom'].includes(p.captionAt)) E(`preview.captionAt "${p.captionAt}" — use auto | top | bottom`);
    if (p.end && !['brand', 'disclosure', 'none'].includes(p.end)) E(`preview.end "${p.end}" — use brand | disclosure | none`);
    if (p.spotlight && !['auto', 'off'].includes(p.spotlight)) E(`preview.spotlight "${p.spotlight}" — use auto | off (per scene: a rect or "auto")`);
    const ids0 = new Set((plan.shots || []).map((s) => s.id).filter(Boolean));
    for (const [id, o] of Object.entries(p.shots || {})) {
      if (!ids0.has(id)) W(`preview.shots.${id}: no shot with that id`);
      for (const t of o.taps || []) if (!(typeof t.t === 'number' && t.x >= 0 && t.x <= 1 && t.y >= 0 && t.y <= 1)) E(`preview.shots.${id}.taps: each tap needs t (seconds) and x, y (0–1)`);
      if (o.spotlight && o.spotlight !== 'auto' && !(Array.isArray(o.spotlight) && o.spotlight.length === 4)) E(`preview.shots.${id}.spotlight must be "auto" or [x, y, w, h]`);
    }
    if (p.variant && !['b', 'c'].includes(p.variant)) E(`preview.variant "${p.variant}" — use b (action first) | c (payoff first)`);
    if (p.sfx !== undefined && !(typeof p.sfx === 'boolean' || typeof p.sfx === 'string')) E('preview.sfx must be a folder path, true ($APPSHOT_SFX) or false');
    if (p.sfxLevel !== undefined && !(p.sfxLevel >= -12 && p.sfxLevel <= 6)) E('preview.sfxLevel is a dB offset for every sound effect (-12 to 6)');
    for (const k of ['effects', 'beam']) if (p[k] !== undefined && typeof p[k] !== 'boolean') E(`preview.${k} must be true or false`);
    const fx = (v, where) => { if (v !== undefined && v !== null && !['decode', 'none'].includes(v)) E(`${where} "${v}" — use decode | none (numbers roll on their own)`); };
    fx(p.effect, 'preview.effect');
    for (const [id, o] of Object.entries(p.shots || {})) fx(o.effect, `preview.shots.${id}.effect`);
    for (const [i, seg] of (p.segments || []).entries()) fx(seg.effect, `preview.segments[${i}].effect`);
    if (p.maxZoom !== undefined && !(p.maxZoom >= 1 && p.maxZoom <= 1.4)) E('preview.maxZoom must be 1–1.4 (Apple prefers native resolution; recordings hold ≈1.49× of the 886 px canvas).');
    if (p.orientation && !['portrait', 'landscape'].includes(p.orientation)) E(`preview.orientation "${p.orientation}" — use portrait | landscape`);
    if (p.fps && Number(p.fps) > 30) E('preview.fps: app previews are at most 30 fps (Apple).');
    if (p.maxDuration && (p.maxDuration < 15 || p.maxDuration > 30)) E('preview.maxDuration must be 15–30 seconds (Apple).');
    if (p.poster !== undefined && !(p.poster >= 0 && p.poster <= 30)) E('preview.poster is a time in seconds (0–30).');
    const ids = new Set((plan.shots || []).map((s) => s.id).filter(Boolean));
    for (const [i, seg] of (p.segments || []).entries()) {
      if (seg.shot !== undefined && typeof seg.shot === 'string' && !ids.has(seg.shot) && !(Number(seg.shot) >= 1)) E(`preview.segments[${i}].shot "${seg.shot}" — no shot with that id`);
      if (seg.shot === undefined && !seg.screen) E(`preview.segments[${i}] needs "shot" (id or index) or "screen"`);
      if (seg.focus && !(Array.isArray(seg.focus) && seg.focus.length === 4 && seg.focus.every((v) => v >= 0 && v <= 1))) E(`preview.segments[${i}].focus must be [x, y, w, h] fractions of the screen`);
    }
  }
  for (const [i, s] of (plan.shots || []).entries()) if (s.layout && layouts[s.layout]?.internal) E(`shot ${i + 1}: layout "${s.layout}" is internal (used by scripts/preview.mjs), not a screenshot layout`);
  try {
    const seen = new Set();
    for (const s of [{}, ...(plan.shots || [])]) {
      const th = resolveTheme(plan, s);
      const key = `${th.id}:${th.accent}:${th.highlight}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const c = highlightContrast(th);
      if (c < 3) W(`Highlight on theme "${th.id}" is hard to read (${c.toFixed(1)}:1, ${th.highlight || 'color'} mode, accent ${th.accent}) — darken the accent, or set themeOverrides.highlight to "pill" or "marker".`);
    }
  } catch {}
  const ids = new Set();
  (plan.shots || []).forEach((s, i) => {
    const tag = `shot ${i + 1}${s.id ? ` (${s.id})` : ''}`;
    if (s.id) { if (ids.has(s.id)) E(`${tag}: duplicate id`); ids.add(s.id); }
    const meta = layouts[s.layout || 'hero-device'];
    if (!meta) { E(`${tag}: unknown layout "${s.layout}". Known: ${Object.keys(layouts).join(', ')}`); return; }
    const need = meta.needs || {};
    const screens = s.screens || (s.screen ? [s.screen] : []);
    if ((need.screens || 0) > screens.length) (need.screens === 1 ? E : W)(`${tag}: layout ${s.layout} wants ${need.screens} screen(s), has ${screens.length}.`);
    for (const ref of screens) {
      const p = ref && typeof ref === 'object' ? Object.values(ref) : [ref];
      for (const x of p) if (x && workspace && !/^(https?:|data:)/.test(x) && !found(x)) W(`${tag}: screen not found yet: ${x} (placeholder will be drawn)`);
    }
    for (const f of need.fields || []) {
      const key = f.replace('[]', '').split('.')[0];
      if (s[key] === undefined) W(`${tag}: layout ${s.layout} expects "${f}".`);
    }
    if (need.panorama && !plan.panorama) W(`${tag}: "bridge" only bridges in panorama plans (set "panorama": true).`);
    const prev = plan.shots[i - 1];
    if (plan.panorama && prev?.layout === 'bridge' && !['bridge', 'full-bleed'].includes(s.layout || 'hero-device'))
      W(`${tag}: follows a bridge — the bridged device covers its left ~40 %. Chain another bridge, use full-bleed, or move the bridge so it is not followed by a device shot.`);
    if (s.pop && !(Array.isArray(s.pop.rect) && s.pop.rect.length === 4 && s.pop.rect.every((v) => v >= 0 && v <= 1))) E(`${tag}: pop.rect must be [x, y, w, h] fractions of the screen.`);
    if (s.hero?.image) {
      for (const x of typeof s.hero.image === 'object' ? Object.values(s.hero.image) : [s.hero.image]) {
        if (x && workspace && !/^(https?:|data:)/.test(x) && !found(x)) W(`${tag}: hero.image not found: ${x}`);
      }
    }
    if (s.theme && typeof s.theme === 'string' && !themes[s.theme]) E(`${tag}: unknown theme "${s.theme}".`);
    if (s.options?.frame && !frames[s.options.frame]) E(`${tag}: unknown frame "${s.options.frame}". Known: ${Object.keys(frames).join(', ')}`);
    for (const loc of plan.locales || []) {
      if (typeof s.headline === 'object' && s.headline && !s.headline[loc] && !(s.headline[loc.split('-')[0]])) W(`${tag}: no headline for ${loc}.`);
    }
    if (typeof s.headline !== 'object' && !L(s.headline, plan.locales?.[0]) && s.layout !== 'full-bleed') W(`${tag}: no headline.`);
  });
  return { ok: !errors.length, errors, warnings };
}
