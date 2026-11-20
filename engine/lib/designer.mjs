// Screenshot design director: decides the look of THIS app's set instead of handing every app in a category the same
// theme and the same opening. It weighs, per candidate theme and opening:
//   - the niche playbook (what the category's buyers expect: themes and layouts ranked in skills/niches/<id>.md);
//   - the app itself (brand colour, light or dark UI, which screens and fields the plan has);
//   - the market (appshot/market/market.json from scripts/market.mjs: what the top apps for the same searches look
//     like) — fit in enough to be understood, stand out enough to be tapped: a set that looks like the nine around it
//     in search results disappears;
//   - a reference the user picked (appshot/references/<name>/study/traits.json from scripts/reference.mjs) — the
//     strongest signal when present: its tone, background, accent and structure;
//   - a per-app seed, so two apps with equal signals still get different sets.
// It returns three distinct directions (A best, B and C real alternatives for a tournament or a PPO test), each with
// the plan changes and the reasons in words.

import crypto from 'node:crypto';
import { listIds, loadTheme, themeBase } from '../compose.mjs';
import { toHsl, contrast, isDark } from './color.mjs';
import { hueDist } from './visual.mjs';
import { prior } from './learning.mjs';

/** Opening families: the first shot carries the hook, and is what search results show first. */
export const OPENINGS = {
  billboard: { layout: 'billboard', label: 'a billboard: the promise as the biggest type, the key UI lifted out, real proof' },
  device: { layout: 'hero-device', label: 'one big device, caption on top' },
  tilted: { layout: 'tilted-device', label: 'a tilted device, more energy' },
  top: { layout: 'device-top', label: 'device from the top, caption below' },
  bleed: { layout: 'full-bleed', label: 'the screen itself, full-bleed, caption over it' },
  duo: { layout: 'duo-devices', label: 'two screens side by side (input → result)', screens: 2 },
  number: { layout: 'big-number', label: 'a big real number first', field: (s) => s.stat?.value },
  cards: { layout: 'floating-cards', label: 'device with floating result cards', field: (s) => s.cards?.length },
  text: { layout: 'text-hero', label: 'a bold typographic promise, no device' },
};

const seeded = (seed, key) => parseInt(crypto.createHash('sha1').update(`${seed}|${key}`).digest('hex').slice(0, 8), 16) / 0xffffffff;
const accentHue = (t) => { if (!t.accent) return null; const c = toHsl(t.accent); return c.s < 0.15 ? null : c.h; }; // greys have no hue
const bgKind = (t) => (typeof t.bg === 'string' || t.bg?.type === 'solid' || !t.bg?.type ? 'flat' : t.bg.type === 'mesh' ? 'gradient' : 'gradient');
const r2 = (v) => Math.round(v * 100) / 100;

/** Every theme scored for this app; highest first, with the reasons that moved it. */
export function rankThemes({ plan, profile = {}, niche, market, reference, seed, learning, nicheId }) {
  const nicheThemes = niche?.themes || [];
  const brand = plan.brand?.primary || profile.colors?.primary;
  const brandHue = brand ? toHsl(brand).h : null;
  const appDark = (profile.colors?.appearance || '').toLowerCase() === 'dark' || (profile.colors?.background && isDark(profile.colors.background));
  const out = [];
  for (const id of listIds('themes')) {
    if (id === 'brand' && !plan.brand?.primary) continue;
    let t;
    try { t = loadTheme(id); } catch { continue; }
    const base = themeBase(t), dark = t.dark ?? isDark(base);
    const why = [];
    let s = 0;
    const i = nicheThemes.indexOf(id);
    if (i >= 0) { s += 1.2 - i * 0.18; why.push(`niche pick #${i + 1}`); } else s += 0.15;
    if (appDark !== undefined && profile.colors?.appearance) { if (dark === appDark) { s += 0.25; why.push(`${dark ? 'dark' : 'light'} like the app`); } }
    if (brandHue != null) {
      const ah = accentHue(t), d = hueDist(ah, brandHue);
      // The brand colour usually becomes the accent; a theme whose own accent family matches needs no surgery.
      if (ah != null && d < 35) { s += 0.35; why.push('accent close to the brand colour'); }
      if (contrast(brand, base) < 3) s -= 0.2;
    }
    if (market?.summary) {
      const m = market.summary;
      // Stand out: the tone most competitors use costs a little, the hue they share costs more.
      const sameTone = dark ? m.darkShare : 1 - m.darkShare;
      if (sameTone > 0.6) { s -= (sameTone - 0.5) * 0.9; why.push(`against: ${Math.round(sameTone * 100)} % of the market is ${dark ? 'dark' : 'light'}`); }
      else if (sameTone < 0.4) { s += 0.25; why.push(`stands out: only ${Math.round(sameTone * 100)} % of the market is ${dark ? 'dark' : 'light'}`); }
      const hue = brandHue ?? accentHue(t);
      if (m.accentHue != null && hue != null && hueDist(hue, m.accentHue) < 30) { s -= 0.25; why.push('against: accent hue the market already owns'); }
    }
    if (reference) {
      if (dark === (reference.tone === 'dark')) { s += 1.1; why.push(`${reference.tone} like the reference`); } else s -= 0.6;
      if (bgKind(t) === reference.background || (reference.background === 'photo' && bgKind(t) === 'gradient')) { s += 0.35; why.push(`${reference.background} background like the reference`); }
      if (reference.accentHue != null && accentHue(t) != null && hueDist(accentHue(t), reference.accentHue) < 40) { s += 0.3; why.push('accent family of the reference'); }
    }
    // What real store tests in this niche taught (results.mjs → ~/.appshot/learning.json).
    for (const pr of [prior(learning, nicheId, 'theme', id), prior(learning, nicheId, 'tone', dark ? 'dark' : 'light')]) if (pr) { s += pr.value; why.push(pr.why); }
    s += seeded(seed, id) * 0.18;
    out.push({ id, score: r2(s), dark, why });
  }
  return out.sort((a, b) => b.score - a.score);
}

/** Openings this plan can actually render (screens and fields present), scored for the niche and the app. */
export function rankOpenings({ plan, niche, market, reference, seed, learning, nicheId }) {
  const shots = plan.shots || [];
  const first = shots[0] || {};
  const screens = shots.filter((s) => s.screen || s.screens).length;
  const nicheLayouts = niche?.layouts || [];
  const out = [];
  for (const [id, o] of Object.entries(OPENINGS)) {
    if (o.screens && screens < o.screens) continue;
    if (o.field && !o.field(first) && !shots.some((s) => o.field(s))) continue;
    const why = [];
    let s = 0;
    let i = nicheLayouts.indexOf(o.layout);
    // A billboard is a treatment of the hero screen, not another story: where the niche says nothing about it, it
    // inherits the niche's rank for the classic hero device (so photo niches that open full-bleed keep doing so).
    const proxy = i < 0 && id === 'billboard';
    if (proxy) i = nicheLayouts.indexOf('hero-device');
    if (i >= 0) { s += 1 - i * 0.12; why.push(proxy ? `the niche ranks the hero screen #${i + 1}` : `the niche ranks ${o.layout} #${i + 1}`); } else s += 0.1;
    if (id === 'device') s += 0.15; // the safe default keeps a small edge
    // Shot 1 has one job — stop the scroll — and a set whose first frame looks like the rest does not.
    if (id === 'billboard') { s += 0.4; why.push('stops the scroll: the promise is the biggest type in the set, unlike the shots that show the app'); }
    if (market?.summary) {
      const m = market.summary;
      if (id === 'bleed' && m.fullBleedShare > 0.5) { s -= 0.3; why.push('against: most competitors open full-bleed'); }
      if (id === 'bleed' && m.fullBleedShare < 0.2) { s += 0.15; why.push('few competitors open full-bleed'); }
      if (['device', 'top', 'tilted'].includes(id) && m.fullBleedShare < 0.3 && m.multiDevice < 0.3) { s -= 0.15; why.push('against: the market mostly shows one device'); }
    }
    if (reference) {
      if (reference.fullBleedShare > 0.5 && id === 'bleed') { s += 0.9; why.push('the reference is full-bleed'); }
      if (reference.multiDevice > 0.4 && id === 'duo') { s += 0.7; why.push('the reference shows several devices'); }
      if (reference.captionAt === 'bottom' && id === 'top') { s += 0.6; why.push('the reference puts the caption below'); }
      if (reference.captionAt === 'top' && ['device', 'tilted', 'duo', 'billboard'].includes(id)) { s += 0.3; why.push('the reference puts the caption on top'); }
      if (reference.captionAt === 'none' && id === 'bleed') s += 0.3;
    }
    const pr = prior(learning, nicheId, 'opening', o.layout);
    if (pr) { s += pr.value; why.push(pr.why); }
    s += seeded(seed, `open:${id}`) * 0.2;
    out.push({ id, layout: o.layout, label: o.label, score: r2(s), why });
  }
  return out.sort((a, b) => b.score - a.score);
}

/**
 * Three distinct directions. A = the best theme and opening; B = the best of the other tone (light ↔ dark) with
 * another opening; C = a bolder one (panorama, or a theme and opening neither A nor B uses).
 */
export function directions({ plan, profile = {}, niche, market, reference, seed, learning, nicheId }) {
  seed = seed || profile.app?.bundleId || plan.app?.name || 'app';
  nicheId = nicheId || plan.niche || profile.niche?.chosen;
  const themes = rankThemes({ plan, profile, niche, market, reference, seed, learning, nicheId });
  const opens = rankOpenings({ plan, niche, market, reference, seed, learning, nicheId });
  const pano = prior(learning, nicheId, 'panorama', 'yes');
  const used = new Set(), usedOpen = new Set();
  const pickTheme = (pred) => themes.find((t) => !used.has(t.id) && pred(t)) || themes.find((t) => !used.has(t.id));
  const pickOpen = (pred = () => true) => opens.find((o) => !usedOpen.has(o.id) && pred(o)) || opens.find((o) => !usedOpen.has(o.id)) || opens[0];
  const make = (key, theme, open, extra = {}) => {
    used.add(theme.id); usedOpen.add(open.id);
    return { key, theme: theme.id, dark: theme.dark, opening: open.id, layout: open.layout, label: open.label, panorama: !!extra.panorama, reasons: [...theme.why.map((w) => `theme ${theme.id}: ${w}`), ...open.why.map((w) => `opening ${open.id}: ${w}`), ...(extra.why || [])], score: r2(theme.score + open.score) };
  };
  const A = make('a', themes[0], opens[0], reference?.panorama ? { panorama: true, why: ['panorama: the reference flows across shots'] } : pano && pano.value > 0.15 ? { panorama: true, why: [`panorama: ${pano.why}`] } : {});
  const B = make('b', pickTheme((t) => t.dark !== A.dark), pickOpen());
  const panoramaFits = !(pano && pano.value < -0.15) && ((niche?.layouts || []).includes('bridge') || reference?.panorama || (market?.summary && !market.summary.panoramaShare));
  const C = make('c', pickTheme(() => true), pickOpen((o) => ['number', 'text', 'tilted', 'bleed', 'duo', 'cards'].includes(o.id)),
    panoramaFits && !A.panorama ? { panorama: true, why: ['panorama: one continuous background makes the set read as one story and stands out in search'] } : {});
  return { directions: [A, B, C], themes: themes.slice(0, 8), openings: opens };
}

/** Apply a direction to a plan (captions, screens and story stay; theme, opening layout and panorama change). */
export function applyDirection(plan, dir, { reference } = {}) {
  const p = structuredClone(plan);
  p.theme = dir.theme;
  p.themeOverrides = { ...(p.themeOverrides || {}) };
  delete p.themeOverrides.accent; delete p.themeOverrides.accentText; delete p.themeOverrides.bg;
  const t = loadTheme(dir.theme), base = themeBase(t);
  const brand = p.brand?.primary;
  // The brand colour becomes the accent when it reads on the new background (same rule as plan init).
  // Every colour stop of the background counts: a gradient that ends light can swallow a mid-tone accent.
  const stops = typeof t.bg === 'string' ? [t.bg] : [base, ...(t.bg?.colors || [])].filter(Boolean);
  const reads = (c) => stops.every((st) => contrast(c, st) >= 3);
  if (brand && reads(brand) && !['brutal', 'mono', 'sky', 'volt'].includes(dir.theme)) p.themeOverrides.accent = brand;
  if (reference) {
    // Take the reference's own colours where they are style, not identity: its background and its accent.
    const refAccent = reference.accents?.[0];
    if (refAccent && reads(refAccent) && contrast(refAccent, reference.bgColors?.[0] || base) >= 3 && !brand) p.themeOverrides.accent = refAccent;
    if (reference.background === 'flat' && reference.bgColors?.[0] && reference.sameBackground) p.themeOverrides.bg = reference.bgColors[0];
  }
  if (!Object.keys(p.themeOverrides).length) delete p.themeOverrides;
  const s0 = p.shots?.[0];
  if (s0 && dir.layout) {
    s0.layout = dir.layout;
    if (dir.layout === 'duo-devices' && !s0.screens) {
      const second = p.shots.slice(1).map((s) => s.screen || s.screens?.[0]).find((x) => x && x !== s0.screen);
      if (second && s0.screen) { s0.screens = [s0.screen, second]; delete s0.screen; }
    }
    if (dir.layout === 'big-number' && !s0.stat) { const src = p.shots.find((s) => s.stat?.value); if (src) s0.stat = src.stat; }
    if (dir.layout === 'floating-cards' && !s0.cards) { const src = p.shots.find((s) => s.cards?.length); if (src) s0.cards = src.cards; }
  }
  p.panorama = !!dir.panorama;
  p.design = { ...(p.design || {}), direction: dir.key, opening: dir.opening, reasons: dir.reasons };
  return p;
}

/** How far a rendered set stands apart from the market (0–10): tone, accent hue, structure. */
export function distinctiveness(ours, market) {
  if (!market?.summary || !ours) return null;
  const m = market.summary;
  let d = 0;
  const sameTone = ours.tone === 'dark' ? m.darkShare : 1 - m.darkShare;
  d += (1 - sameTone) * 4;
  d += Math.min(1, hueDist(ours.accentHue, m.accentHue) / 90) * 3;
  d += (ours.panorama && !(m.panoramaShare > 0.4) ? 1.5 : 0) + (ours.fullBleedShare > 0.5 !== m.fullBleedShare > 0.5 ? 1.5 : 0);
  return r2(Math.min(10, d));
}

/** How close a rendered set is to the reference the user picked (0–10). */
export function referenceMatch(ours, ref) {
  if (!ref || !ours) return null;
  let s = 0;
  s += ours.tone === ref.tone ? 3 : 0;
  s += ours.background === ref.background ? 1.5 : 0;
  s += (1 - Math.min(1, hueDist(ours.accentHue, ref.accentHue) / 90)) * 2;
  s += ours.captionAt === ref.captionAt ? 1.5 : 0;
  s += (1 - Math.min(1, Math.abs((ours.uiShare || 0) - (ref.uiShare || 0)) / 0.4)) * 1;
  s += ours.panorama === ref.panorama ? 1 : 0;
  return r2(s);
}
