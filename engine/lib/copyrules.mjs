// Caption lint rules shared by copy-check, score and check.
// Levels: error = will be rejected or is broken; warn = likely to hurt review/conversion; info = taste.

import path from 'node:path';
import { plain } from './html.mjs';
import { readJson, ENGINE_DIR, L } from './util.mjs';

const LOCALES = readJson(path.join(ENGINE_DIR, 'locales.json')).locales;

const STOP = new Set(('a an the and or of to in on for with your you my our it is are be at by from as this that all any every more most').split(' '));

const RX = {
  placeholder: /\{[a-z_][\w.-]*\}/i,
  todo: /\b(lorem ipsum|todo|tbd|xxx|placeholder|headline here|caption here)\b/i,
  otherPlatformIos: /\b(android|google play|play store|galaxy|pixel phone)\b/i,
  otherPlatformAndroid: /\b(iphone|ipad|ios|app store|apple watch)\b/i,
  price: /([$€£₺¥₹]\s?\d)|(\d+([.,]\d{1,2})?\s?(usd|eur|gbp|tl|try|₺|\$|€|£))\b|\b\d+[.,]99\b/i,
  promo: /(\d+\s?%\s?off)|\b(sale|discount|limited[- ]time|black friday|promo code|coupon)\b/i,
  freeTrial: /\b(free trial|try (it )?free|gratis)\b/i,
  free: /\b(free)\b/i,
  ranking: /(#\s?1\b|\bno\.?\s?1\b|number one|\bbest\b|\btop[- ]rated\b|\btop \d+\b|\bleading\b|award[- ]winning|(app|game) of the (day|year)|editors'? choice|apple design award|best of play)/i,
  url: /(\bhttps?:\/\/\S+|\bwww\.\S+|\b[\w-]+\.(com|net|org|io|app|ai|co|me)\b)/i,
  copyright: /(©|\(c\)|\bcopyright\b|®|™)/i,
  cta: /(\b(download (it )?now|install (it )?now|get it now|tap to download|play now)\b)/i,
  medical: /\b(cure[sd]?|treat(s|ment)?|diagnos\w*|heal(s|ing)? (your|the)|prevent(s)? (disease|illness)|clinically proven|doctor[- ]approved|fda[- ]approved)\b/i,
  weasel: /\b(simply|easily|seamless(ly)?|revolutionary|ultimate|powerful|innovative|next[- ]gen|cutting[- ]edge|game[- ]changer|world[- ]class|amazing|awesome|incredible)\b/i,
  featureSpeak: /\b(functionality|module|feature set|interface|settings screen|dashboard screen)\b/i,
  emoji: /\p{Extended_Pictographic}/gu,
};

// Common trademarks that get flagged when used as comparison/keywords (Apple 2.3.7, 5.2; Play metadata policy).
export const BRANDS = ['chatgpt', 'openai', 'gemini', 'instagram', 'tiktok', 'snapchat', 'whatsapp', 'facebook', 'youtube', 'spotify', 'netflix',
  'duolingo', 'myfitnesspal', 'evernote', 'headspace', 'fitbit', 'peloton', 'capcut', 'lightroom', 'photoshop',
  'tinder', 'uber', 'airbnb', 'google', 'microsoft', 'todoist', 'things 3', 'revolut', 'paypal', 'venmo', 'cash app',
  'ynab', 'shazam', 'grammarly', 'telegram', 'pinterest', 'linkedin', 'twitter', 'x.com'];
export const COMMON_WORD_BRANDS = ['calm', 'mint', 'notion', 'threads', 'discord', 'amazon', 'excel', 'strava', 'bumble', 'hinge', 'canva'];

export const words = (t) => plain(t).split(/\s+/).filter(Boolean);

export function lintCaption(text, { locale = 'en-US', kind = 'headline', store = 'ios', appName = '', index = 0, hasSubscriptions = false, niche } = {}) {
  const issues = [];
  const add = (level, code, msg) => issues.push({ level, code, msg });
  const t = plain(text);
  const spec = LOCALES[locale] || { maxHeadline: 34, expansion: 1.2 };
  if (!t) {
    if (kind === 'headline') add(index < 3 ? 'error' : 'warn', 'empty', 'No headline — every shot needs one (the first three are seen in search).');
    return { issues, metrics: { words: 0, chars: 0 } };
  }
  const w = words(text);
  const chars = [...t].length;
  const lower = t.toLocaleLowerCase(locale);

  if (RX.placeholder.test(t)) add('error', 'placeholder', `Unfilled placeholder ${t.match(RX.placeholder)[0]} — replace with a real value or rewrite.`);
  if (RX.todo.test(t)) add('error', 'todo', 'Placeholder/TODO text.');

  if (kind === 'headline') {
    const cjk = spec.cjk;
    if (!cjk && w.length > 10) add('error', 'too-long', `${w.length} words — a headline must read in one glance (aim for 2–6).`);
    else if (!cjk && w.length > 7) add('warn', 'long', `${w.length} words — cut to 6 or fewer.`);
    if (chars > spec.maxHeadline * 1.6) add('error', 'too-many-chars', `${chars} chars (limit ≈${spec.maxHeadline} for ${locale}).`);
    else if (chars > spec.maxHeadline * 1.2) add('warn', 'many-chars', `${chars} chars (aim ≤${spec.maxHeadline} for ${locale}).`);
    if (w.length === 1 && chars < 8) add('info', 'too-short', 'One short word rarely says what the app does for me.');
    const hl = (String(text).match(/\*\*(.+?)\*\*/g) || []).length;
    if (hl > 2) add('warn', 'highlights', `${hl} highlights — use one (two at most) so the eye knows where to land.`);
    if (hl === 0) add('info', 'no-highlight', 'No **highlight** — accenting the key word helps scanning.');
    const letters = t.replace(/[^\p{L}]/gu, '');
    if (letters.length > 12 && letters === letters.toLocaleUpperCase(locale) && letters !== letters.toLocaleLowerCase(locale)) add('warn', 'all-caps', 'ALL CAPS in the source text — let the theme set the case.');
  }
  if (kind === 'subhead' && w.length > 14) add('warn', 'long-subhead', `Subhead has ${w.length} words — keep it under 12 or drop it.`);

  if ((t.match(/!/g) || []).length > 1) add('warn', 'exclaim', 'Multiple "!" read as shouting.');
  const emoji = (t.match(RX.emoji) || []).length;
  if (emoji > 1) add('warn', 'emoji', `${emoji} emoji in a caption — at most one, and not in the hook.`);

  if (store === 'ios' && RX.otherPlatformIos.test(t)) add('error', 'other-platform', 'Mentions Android/Google Play in iOS metadata (App Store Guideline 2.3.10).');
  if (store === 'android' && RX.otherPlatformAndroid.test(t)) add('warn', 'other-platform', 'Mentions Apple platforms in a Play listing — remove for Google Play.');
  if (RX.price.test(t)) add('error', 'price', 'Price in a screenshot (Apple 2.3.14 / Play promo rules) — prices vary by region and change.');
  if (RX.promo.test(t)) add(store === 'android' ? 'error' : 'warn', 'promo', 'Promotional/discount language — not allowed in Play graphics and ages badly on iOS.');
  if (RX.ranking.test(t)) add(store === 'android' ? 'error' : 'warn', 'ranking', `Ranking/superlative claim ("${t.match(RX.ranking)[0]}") — needs third-party proof on iOS; not allowed in Play graphics.`);
  if (RX.url.test(t)) add('error', 'url', `Website address ("${t.match(RX.url)[0]}") — Apple asset rules forbid URLs in screenshots and creative assets.`);
  if (RX.copyright.test(t)) add('warn', 'copyright', 'Copyright/trademark symbols are disallowed by Apple’s asset best practices.');
  if (RX.cta.test(t)) add(store === 'android' ? 'error' : 'info', 'cta', `Install CTA ("${t.match(RX.cta)[0]}") — banned in Play graphics; wasted words on iOS.`);
  if (RX.free.test(t)) {
    if (store === 'android') add('warn', 'free', '"Free" is restricted in Play graphics.');
    else if (hasSubscriptions) add('warn', 'free', '"Free" while the app has a paywall can be judged misleading (Apple 2.3.1/3.1).');
  }
  if (RX.freeTrial.test(t)) add('warn', 'trial', 'Trial/pricing terms belong on the paywall, not in screenshots.');
  if (RX.medical.test(t)) add('warn', 'medical', 'Medical/treatment claim — needs evidence and triggers Apple 1.4.1 scrutiny; reframe as wellbeing.');
  const own = (appName || '').toLowerCase();
  const brand = BRANDS.find((b) => b !== own && new RegExp(`(^|[^\\p{L}])${b.replace('.', '\\.')}([^\\p{L}]|$)`, 'iu').test(lower))
    // Brands that are also everyday words count only when written as a proper noun mid-sentence ("like Calm").
    || COMMON_WORD_BRANDS.find((b) => b !== own && new RegExp(`[^.!?\\s]\\s+${b[0].toUpperCase()}${b.slice(1)}([^\\p{L}]|$)`, 'u').test(t));
  if (brand) add('warn', 'trademark', `Mentions "${brand}" — third-party trademarks/competitors are a common rejection (Apple 2.3.7, 5.2.1).`);
  if (RX.weasel.test(t)) add('info', 'vague', `"${t.match(RX.weasel)[0]}" is filler — replace with the concrete benefit.`);
  if (RX.featureSpeak.test(t)) add('info', 'feature-speak', 'Feature-speak — say what the user gets, not what the screen is.');
  return { issues, metrics: { words: w.length, chars } };
}

/** Lint the whole plan for one locale + store. Returns { shots: [{index, id, issues}], set: issues[] } */
export function lintPlan(plan, { locale, store = 'ios', size, profile = {}, layoutsMeta = {} } = {}) {
  const fb = plan.defaultLocale || plan.locales?.[0];
  const appName = L(plan.app?.name, locale, fb) || '';
  const hasSubscriptions = !!profile.monetization?.subscriptions;
  const shots = (plan.shots || []).filter((s) => !(s.skipOn || []).includes(store) && !(size && (s.skipOn || []).includes(size))).map((s, index) => {
    const issues = [];
    const h = L(s.headline, locale, fb);
    const sub = L(s.subhead, locale, fb);
    const opts = { locale, store, appName, index, hasSubscriptions };
    const meta = layoutsMeta[s.layout || 'hero-device'];
    // Layouts that drop their proof row on a store (billboard on Google Play) are fine there without skipOn.
    const dropsProof = !!meta?.dropsProofOn?.includes(store);
    issues.push(...lintCaption(h, { ...opts, kind: 'headline' }).issues.map((i) => ({ ...i, field: 'headline' })));
    if (sub) issues.push(...lintCaption(sub, { ...opts, kind: 'subhead' }).issues.map((i) => ({ ...i, field: 'subhead' })));
    for (const [field, v] of [['cards', s.cards], ['bullets', s.bullets], ['notifications', s.notifications], ['messages', s.messages], ['chips', s.chips], ['stickers', s.stickers]]) {
      if (!v) continue;
      const blob = JSON.stringify(typeof v === 'object' && !Array.isArray(v) ? L(v, locale, fb) : v);
      if (RX.placeholder.test(blob)) issues.push({ level: 'error', code: 'placeholder', field, msg: `Unfilled {placeholder} in ${field}.` });
      if (RX.price.test(blob)) issues.push({ level: 'error', code: 'price', field, msg: `Price shown in ${field}.` });
    }
    if (s.rating || s.awards?.length || s.quotes?.length || s.stat) {
      if (store === 'android' && !dropsProof && (s.rating || s.awards?.length || s.quotes?.length)) issues.push({ level: 'error', code: 'play-social-proof', msg: 'Ratings, awards and testimonials are not allowed in Play images — add "skipOn": ["android"] to this shot.' });
      if (dropsProof && (s.rating || s.awards?.length)) issues.push({ level: 'info', code: 'proof-dropped', msg: `The proof row is not drawn on ${store === 'android' ? 'Google Play' : store} (store rules); the device takes its room.` });
      const src = s.rating?.source || s.stat?.source || s.awards?.every?.((a) => a.source) || s.quotes?.every?.((q) => q.source);
      if (!src) issues.push({ level: 'error', code: 'unsourced-claim', msg: 'Rating/award/quote/stat without a "source" field — only real, verifiable claims (record where it comes from).' });
      // The proof text itself ("#1 car identifier", "{users} users") is drawn in the image too.
      for (const t of [s.rating?.value, s.rating?.label, ...(s.awards || []).flatMap((a) => [a.title, a.sub])].map((v) => L(v, locale, fb)).filter(Boolean)) {
        if (RX.placeholder.test(t)) issues.push({ level: 'error', code: 'placeholder', field: 'proof', msg: `Unfilled placeholder in the proof ("${t}") — a real value or nothing.` });
        else if (RX.ranking.test(t) && !(store === 'android' && dropsProof)) issues.push({ level: 'warn', code: 'ranking', field: 'proof', msg: `"${t}" is a ranking claim — keep it only when its source is third-party (a chart, an award page).` });
      }
    }
    if (locale !== fb && h && h === L(s.headline, fb, fb) && typeof s.headline === 'object' && !s.headline[locale]) issues.push({ level: 'warn', code: 'untranslated', msg: `No ${locale} headline — falls back to ${fb}.` });
    if (index === 0 && meta && !meta.hook) issues.push({ level: 'info', code: 'weak-hook-layout', msg: `"${s.layout}" is rarely the best opener — consider billboard, hero-device, floating-cards or full-bleed.` });
    if (index > 0 && meta?.firstOnly) issues.push({ level: 'warn', code: 'first-only', msg: `"${s.layout}" is the shot-1 treatment (the scroll-stopper); from shot 2 on, show the app — hero-device, zoom-callout, floating-cards, ui-pieces…` });
    if ((s.layout || 'hero-device') === 'billboard') {
      const hw = words(h).length, kw = words(sub).length;
      if (hw > 5 && !LOCALES[locale]?.cjk) issues.push({ level: 'warn', code: 'billboard-long', field: 'headline', msg: `${hw} words — a billboard promise reads in one look at 2–4 words; move the rest into the kicker (subhead).` });
      if (kw > 6 && !LOCALES[locale]?.cjk) issues.push({ level: 'warn', code: 'billboard-kicker', field: 'subhead', msg: `On a billboard the subhead is the kicker, set in display type: 2–5 words that finish the promise ("& websites", "in seconds"), not a sentence (${kw} words).` });
      if (!s.screen && !s.screens && !s.hero?.image) issues.push({ level: 'error', code: 'billboard-empty', msg: 'A billboard needs a hero: a screen (with "pop" for the money moment) and/or "hero.image".' });
      else if (!s.screen && !s.screens) issues.push({ level: 'info', code: 'billboard-no-ui', msg: 'No app UI in this frame: Apple 2.3.3 wants the app in use — make sure shots 2–3 show the real screens.' });
      if (!s.hero?.image) issues.push({ level: 'info', code: 'billboard-no-art', msg: 'No hero art. If you can generate images (Codex, ChatGPT, Figma AI…), make the one object this app is about: `hero.mjs prompt` → your image tool → `hero.mjs cutout` → `hero.mjs use` (skills/design/hero-art.md).' });
    }
    return { index, id: s.id || String(index + 1), headline: h, issues };
  });
  const set = [];
  const n = shots.length;
  if (store === 'ios' && (n < 1 || n > 10)) set.push({ level: 'error', code: 'count', msg: `${n} shots — App Store allows 1–10.` });
  if (store === 'android' && (n < 2 || n > 8)) set.push({ level: 'error', code: 'count', msg: `${n} shots — Google Play allows 2–8 per device type.` });
  if (n < 5) set.push({ level: 'info', code: 'few', msg: `Only ${n} shots — most top apps use 6–10; every extra shot is another chance to answer an objection.` });
  const heads = shots.map((s) => plain(s.headline).toLocaleLowerCase(locale)).filter(Boolean);
  const dup = heads.find((h, i) => heads.indexOf(h) !== i);
  if (dup) set.push({ level: 'error', code: 'duplicate', msg: `Duplicate headline "${dup}".` });
  const freq = new Map();
  for (const h of heads) for (const w of new Set(h.split(/[^\p{L}\p{N}]+/u).filter((x) => x.length > 2 && !STOP.has(x)))) freq.set(w, (freq.get(w) || 0) + 1);
  for (const [w, c] of freq) if (c >= 3) set.push({ level: 'warn', code: 'repetition', msg: `"${w}" appears in ${c} headlines — vary the language.` });
  return { shots, set };
}

/** Rough stem so inflected forms still count (EN: workout ~ workouts; agglutinative languages: a shorter prefix). */
export function stem(w, locale) {
  w = w.toLocaleLowerCase(locale);
  if (/^(fi|hu|et)/.test(locale)) return w.length > 5 ? w.slice(0, Math.max(4, w.length - 2)) : w;
  // "focus" is not a plural: keep a final s after u or s (focus, glass), strip it elsewhere.
  if (/^en/.test(locale)) return w.replace(/ies$/, 'y').replace(/(ing|ed)$/, '').replace(/([^us])(es|s)$/, '$1') || w;
  return w.length > 6 ? w.slice(0, w.length - 2) : w;
}

/** Keyword coverage of captions (screenshot captions are treated as searchable text). */
export function coverage(plan, keywords, locale) {
  const fb = plan.defaultLocale || plan.locales?.[0];
  const caps = (plan.shots || []).map((s) => `${plain(L(s.headline, locale, fb))} ${plain(L(s.subhead, locale, fb))}`.toLocaleLowerCase(locale).split(/[^\p{L}\p{N}+]+/u));
  return keywords.map((k) => {
    const parts = k.toLocaleLowerCase(locale).split(/\s+/).filter(Boolean).map((p) => stem(p, locale));
    const at = caps.map((tokens, i) => (parts.every((p) => tokens.some((t) => t.startsWith(p))) ? i + 1 : 0)).filter(Boolean);
    return { keyword: k, shots: at, inFirst3: at.some((i) => i <= 3) };
  });
}

export { STOP, RX };
