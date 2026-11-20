// Store text metadata per locale: App Store (name, subtitle, promotional text, keywords, description, What's New,
// URLs) and Google Play (title, short and full description). One Markdown file per locale in appshot/metadata/ —
// easy for a person to read and edit, parsed here by its bold field labels:
//
//   **Name**                 → the value is every line until the next **Label**, a "---" line or the end
//   Nova: Focus Garden
//
// Shared app-level fields (URLs, categories, copyright) live in metadata/_shared.md (labels or "| Label | value |"
// table rows). This file parses, writes, checks (limits from engine/sizes.json → limits.metadata, Apple and Google
// rules, keyword-field hygiene, subscription disclosure, locale typography) and exports to fastlane folders.

import fs from 'node:fs';
import path from 'node:path';
import { readJson, ENGINE_DIR, exists, ensureDir } from './util.mjs';
import { RX, BRANDS, STOP, stem } from './copyrules.mjs';

const SIZES = readJson(path.join(ENGINE_DIR, 'sizes.json'));
export const LIMITS = SIZES.limits.metadata;
export const LOCALES = readJson(path.join(ENGINE_DIR, 'locales.json')).locales;

/** Field keys in file order, with their labels (first = the one written; others are accepted on read). */
export const FIELDS = [
  ['name', ['Name', 'App name', 'Title', 'Nombre', 'Nome', 'Nom']],
  ['subtitle', ['Subtitle', 'Subtítulo', 'Untertitel', 'Sous-titre']],
  ['promo', ['Promotional text', 'Promo text', 'Texto promocional', 'Werbetext', 'Texte promotionnel']],
  ['keywords', ['Keywords', 'Keyword field', 'Palabras clave', 'Palavras-chave', 'Schlüsselwörter', 'Mots-clés']],
  ['description', ['Description', 'Descripción', 'Descrição', 'Beschreibung']],
  ['whatsNew', ["What's New", 'What’s New', 'Release notes', 'Novedades', 'Novidades', 'Neuerungen', 'Nouveautés']],
  ['playTitle', ['Play title']],
  ['playShort', ['Play short description', 'Short description']],
  ['playFull', ['Play full description', 'Full description']],
  ['termsUrl', ['Terms of Use', 'Terms of Use URL', 'EULA']],
];
export const SHARED = [
  ['supportUrl', ['Support URL']], ['privacyUrl', ['Privacy Policy URL', 'Privacy URL']], ['marketingUrl', ['Marketing URL']],
  ['primaryCategory', ['Primary category']], ['secondaryCategory', ['Secondary category']], ['copyright', ['Copyright']],
  ['termsUrl', ['Terms of Use', 'Terms of Use URL', 'EULA']],
];
const norm = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/\s*\(.*\)\s*$/, '').trim();
const labelMap = (list) => new Map(list.flatMap(([k, labels]) => labels.map((l) => [norm(l), k])));
const FIELD_OF = labelMap(FIELDS), SHARED_OF = labelMap(SHARED);
// A table cell may hold `url` plus a remark; keep the URL, and treat "optional" / TODO as empty.
const clean = (v) => { const u = v.match(/https?:\/\/[^\s`|)]+/); if (u) return u[0]; const t = v.replace(/`/g, '').replace(/\s*←.*$/, '').trim(); return /^(optional|todo|tbd|—|-)$/i.test(t) || /todo/i.test(t) ? '' : t; };

/** Parse one locale's Markdown (or one section of a multi-locale document) into { field: value }. */
export function parseFields(text, map = FIELD_OF) {
  const out = {};
  let key = null, buf = [];
  const flush = () => { if (key) { const v = buf.join('\n').trim(); if (v) out[key] = v; } key = null; buf = []; };
  for (const line of String(text).split('\n')) {
    const lab = line.match(/^\*\*([^*]+)\*\*\s*(\([^)]*\))?\s*$/);
    if (lab) { flush(); key = map.get(norm(lab[1])) || null; continue; }
    const row = line.match(/^\|\s*([^|]+?)\s*\|\s*(.+?)\s*\|\s*$/);
    if (row && map.get(norm(row[1]))) { flush(); const v = clean(row[2]); if (v) out[map.get(norm(row[1]))] = v; continue; }
    if (/^---\s*$/.test(line) || /^#{1,3} /.test(line)) { flush(); continue; }
    if (key) buf.push(line);
  }
  flush();
  return out;
}
export const parseShared = (text) => parseFields(text, SHARED_OF);

/** Language heading ("English (U.S.)", "Deutsch (German)", "Español (España)") → locale id. */
const ENGLISH_NAMES = {
  'english (u.s.)': 'en-US', 'english (us)': 'en-US', 'english': 'en-US', 'english (u.k.)': 'en-GB', 'english (uk)': 'en-GB',
  german: 'de-DE', french: 'fr-FR', 'spanish (spain)': 'es-ES', spanish: 'es-ES', 'spanish (mexico)': 'es-MX',
  'portuguese (brazil)': 'pt-BR', italian: 'it', dutch: 'nl-NL', japanese: 'ja', korean: 'ko', 'chinese (simplified)': 'zh-Hans',
  'chinese (traditional)': 'zh-Hant', arabic: 'ar-SA', hebrew: 'he', russian: 'ru', polish: 'pl', swedish: 'sv', indonesian: 'id',
  hindi: 'hi', vietnamese: 'vi', thai: 'th',
};
export function localeFromHeading(h) {
  const t = h.trim().toLowerCase();
  if (LOCALES[h.trim()]) return h.trim();
  for (const [id, l] of Object.entries(LOCALES)) if (l.name.toLowerCase() === t || t.startsWith(l.name.toLowerCase())) return id;
  if (ENGLISH_NAMES[t]) return ENGLISH_NAMES[t];
  const inner = (t.match(/\(([^)]+)\)/) || [])[1];
  if (inner && ENGLISH_NAMES[inner]) return ENGLISH_NAMES[inner];
  const outer = t.replace(/\s*\(.*\)/, '');
  return ENGLISH_NAMES[outer] || Object.entries(LOCALES).find(([, l]) => l.name.toLowerCase().replace(/\s*\(.*\)/, '') === outer)?.[0] || null;
}

/** Split a multi-locale document ("## English (U.S.)" … "## Deutsch (German)") into { locale: fields } + shared. */
export function parseDocument(text) {
  const locales = {};
  const parts = String(text).split(/^## /m);
  const shared = parseShared(parts[0]);
  for (const part of parts.slice(1)) {
    const [head, ...rest] = part.split('\n');
    const loc = localeFromHeading(head);
    if (!loc) continue;
    const f = parseFields(rest.join('\n'));
    if (Object.keys(f).length) locales[loc] = f;
  }
  if (!Object.keys(locales).length) { const f = parseFields(text); if (Object.keys(f).length) locales._ = f; }
  return { locales, shared };
}

/** fastlane deliver / supply folder → { locale: fields } (App Store codes mapped back to Appshot locales). */
export function readFastlane(dir) {
  const out = {};
  const txt = (p) => (exists(p) ? fs.readFileSync(p, 'utf8').trim() : undefined);
  const fromStore = (code, kind) => Object.entries(LOCALES).find(([, l]) => l[kind] === code)?.[0] || code;
  for (const loc of exists(dir) ? fs.readdirSync(dir) : []) {
    const d = path.join(dir, loc);
    if (loc.startsWith('.') || !fs.statSync(d).isDirectory()) continue;
    if (loc === 'android') {
      for (const al of fs.readdirSync(d).filter((x) => !x.startsWith('.'))) {
        const ad = path.join(d, al);
        if (!fs.statSync(ad).isDirectory()) continue;
        const id = fromStore(al, 'play');
        out[id] = { ...(out[id] || {}), playTitle: txt(path.join(ad, 'title.txt')), playShort: txt(path.join(ad, 'short_description.txt')), playFull: txt(path.join(ad, 'full_description.txt')) };
      }
      continue;
    }
    const id = fromStore(loc, 'appStore');
    out[id] = { ...(out[id] || {}), name: txt(path.join(d, 'name.txt')), subtitle: txt(path.join(d, 'subtitle.txt')), promo: txt(path.join(d, 'promotional_text.txt')), keywords: txt(path.join(d, 'keywords.txt')), description: txt(path.join(d, 'description.txt')), whatsNew: txt(path.join(d, 'release_notes.txt')) };
  }
  for (const v of Object.values(out)) for (const k of Object.keys(v)) if (!v[k]) delete v[k];
  return out;
}

const chars = (s) => [...(s || '')].length;
const bytes = (s) => Buffer.byteLength(s || '', 'utf8');
const LABEL = Object.fromEntries([...FIELDS, ...SHARED].map(([k, l]) => [k, l[0]]));
const limitOf = (k) => LIMITS.ios[k] ?? LIMITS.android[k];

/** The Markdown for one locale (counts after each label are informative; the parser ignores them). */
export function toMarkdown(locale, f, { appName = 'App', intro = '' } = {}) {
  const l = LOCALES[locale] || { name: locale };
  let md = `# ${appName}: store metadata — ${l.name} · ${locale}\n\n${intro ? `${intro.trim()}\n\n` : ''}`;
  for (const [k] of FIELDS) {
    if (f[k] === undefined) continue;
    const lim = limitOf(k);
    const count = k === 'keywords' ? `${bytes(f[k])}/${lim.bytes} bytes` : lim ? `${chars(f[k])}/${lim}` : '';
    md += `**${LABEL[k]}**${count ? ` (${count})` : ''}\n${f[k]}\n\n`;
  }
  return md.trimEnd() + '\n';
}

/** Words of a text for keyword hygiene (lower-cased, stemmed). */
const wordsOf = (s, locale) => (s || '').toLocaleLowerCase(locale).split(/[^\p{L}\p{N}]+/u).filter(Boolean).map((w) => stem(w, locale));

const GENERIC = /^(app|apps|iphone|ipad|ios|free|application|aplicación|aplicativo|anwendung|appli)$/i;
const SUB_WORDS = /\b(subscri\w*|premium|pro|plus|in-app purchase\w*|auto-?renew\w*|suscrip\w*|assinatura\w*|abonnement\w*|abo\b|abonnier\w*|langganan|abbonament\w*|подписк\w*|サブスク\w*|定期購読|구독|订阅|訂閱|اشتراك|מנוי|सदस्यता|subskrypc\w*|prenumeration\w*|đăng ký|สมัครสมาชิก)/iu;
const LATAM_IN_ES = /\b(celular|computadora|carro|manejar|platicar|jugo|lentes|departamento|ustedes)\b/i;

/**
 * Check one locale. ctx: { locale, profile, plan, shared, paidName } → [{ level, field, code, msg }].
 * error = App Store Connect / Play Console would refuse it, or review is likely to; warn = hurts search or conversion.
 */
export function checkLocale(f, { locale, profile = {}, plan = {}, shared = {}, paidName = '' } = {}) {
  const out = [];
  const add = (level, field, code, msg) => out.push({ level, field, code, msg });
  const ios = true, android = !!(f.playTitle || f.playShort || f.playFull);
  // Limits.
  for (const [k] of FIELDS) {
    const v = f[k];
    if (v === undefined) continue;
    // Uppercase TODO only: "todo" is an everyday word in Spanish and Portuguese ("todo se gana").
    if (RX.placeholder.test(v) || /\b(TODO|TBD|XXX)\b|lorem ipsum/.test(v)) add('error', k, 'placeholder', 'unfilled placeholder / TODO');
    const lim = limitOf(k);
    if (!lim) continue;
    if (k === 'keywords') { if (bytes(v) > lim.bytes) add('error', k, 'too-long', `${bytes(v)} bytes (max ${lim.bytes}; letters like é, ü, ñ take 2)`); }
    else if (chars(v) > lim) add('error', k, 'too-long', `${chars(v)} characters (max ${lim})`);
  }
  if (!f.name) add('error', 'name', 'missing', 'no app name');
  if (!f.description) add('error', 'description', 'missing', 'no description');
  if (!f.subtitle) add('warn', 'subtitle', 'missing', 'no subtitle — the second-strongest search field');
  if (!f.keywords) add('warn', 'keywords', 'missing', 'no keyword field — 100 bytes of search terms left unused');
  // Name and subtitle (Apple 2.3.7): no prices, rankings or other apps' names; distinct from each other.
  for (const k of ['name', 'subtitle', 'playTitle', 'playShort']) {
    const v = f[k];
    if (!v) continue;
    if (RX.price.test(v)) add('error', k, 'price', 'price in the name or subtitle (Apple 2.3.7, Play metadata policy)');
    if (RX.ranking.test(v)) add(k.startsWith('play') ? 'error' : 'warn', k, 'ranking', `"${v.match(RX.ranking)[0]}" — ranking or superlative (Apple 2.3.7, Play metadata policy)`);
    if (RX.emoji.test(v)) add(k.startsWith('play') ? 'error' : 'warn', k, 'emoji', 'emoji (Play forbids them in title and short description)');
    RX.emoji.lastIndex = 0;
    if (/\b(free|gratis|gratuit|kostenlos|grátis|無料|免费|무료)\b/i.test(v)) add('warn', k, 'free', '"free" in the name or subtitle reads as a price claim (and is misleading with a paywall)');
    if (k.startsWith('play') && RX.cta.test(v)) add('error', k, 'cta', 'install call to action (Play metadata policy)');
    const caps = v.replace(/[^\p{L}]/gu, '');
    if (caps.length > 6 && caps === caps.toLocaleUpperCase(locale) && caps !== caps.toLocaleLowerCase(locale)) add('warn', k, 'caps', 'ALL CAPS');
  }
  if (f.name && f.subtitle && f.name.trim().toLowerCase() === f.subtitle.trim().toLowerCase()) add('warn', 'subtitle', 'repeat', 'subtitle repeats the name');
  // Keyword field hygiene: Apple combines words across name, subtitle and keywords, so repeats waste bytes.
  if (f.keywords) {
    const kw = f.keywords;
    if (/,\s/.test(kw)) add('warn', 'keywords', 'spaces', 'spaces after commas waste bytes — "a,b,c"');
    if (/[;|]/.test(kw)) add('warn', 'keywords', 'separator', 'separate keywords with commas only');
    const terms = kw.split(',').map((t) => t.trim()).filter(Boolean);
    const used = new Set(wordsOf(`${f.name || ''} ${f.subtitle || ''}`, locale));
    const seen = new Map();
    for (const t of terms) {
      const raw = t.toLocaleLowerCase(locale).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
      for (const r of raw) {
        const w = stem(r, locale);
        if (used.has(w)) add('warn', 'keywords', 'in-name', `"${r}" is already in the name or subtitle — those words are indexed; spend the bytes elsewhere`);
        if (seen.has(w) && seen.get(w) !== t) add('warn', 'keywords', 'duplicate', `"${r}" appears twice ("${seen.get(w)}", "${t}")`);
        seen.set(w, t);
      }
      if (STOP.has(t.toLowerCase())) add('info', 'keywords', 'stop-word', `"${t}" is a stop word`);
      if (BRANDS.includes(t.toLowerCase())) add('error', 'keywords', 'trademark', `"${t}" is another company's trademark (Apple 2.3.7)`);
      if (GENERIC.test(t)) add('warn', 'keywords', 'generic', `"${t}" is implied or ignored — wasted bytes`);
    }
    const appName = (f.name || '').split(/[:–—-]/)[0].trim().toLowerCase();
    if (appName && terms.some((t) => t.toLowerCase() === appName)) add('warn', 'keywords', 'app-name', 'the app name is already indexed');
    const cat = (shared.primaryCategory || profile.app?.category || '').toLowerCase();
    if (cat && terms.some((t) => t.toLowerCase() === cat)) add('info', 'keywords', 'category', `"${cat}" is the category name — already indexed`);
  }
  // Description: platform, rankings, subscriptions.
  if (f.description) {
    const d = f.description;
    if (RX.otherPlatformIos.test(d)) add('error', 'description', 'other-platform', `mentions "${d.match(RX.otherPlatformIos)[0]}" in App Store text (Apple 2.3.10)`);
    const hard = d.match(/(#\s?1\b|\bno\.?\s?1\b|number one|\bbest (app|apps|[\w-]+ app)\b|\btop[- ]rated\b|award[- ]winning|editors'? choice)/i);
    if (hard) add('warn', 'description', 'ranking', `"${hard[0]}" — a ranking or award claim needs third-party proof (Apple 2.3.7)`);
    else if (RX.ranking.test(d)) { const m = d.match(RX.ranking); const at = d.indexOf(m[0]); add('info', 'description', 'superlative', `"…${d.slice(Math.max(0, at - 20), at + m[0].length + 20).replace(/\s+/g, ' ')}…" — fine if it describes a feature, not a claim about the app`); }
    if (RX.medical.test(d)) add('warn', 'description', 'medical', 'medical or treatment claim (Apple 1.4.1)');
    if (/\b(lorem|ipsum)\b/i.test(d)) add('error', 'description', 'placeholder', 'placeholder text');
  }
  if (profile.monetization?.subscriptions || profile.monetization?.iap) {
    const all = `${f.description || ''}\n${f.promo || ''}`;
    const named = paidName && all.toLowerCase().includes(paidName.toLowerCase());
    if (f.description && !named && !SUB_WORDS.test(all)) add('error', 'description', 'paid-disclosure', `the app sells ${profile.monetization.subscriptions ? 'subscriptions' : 'in-app purchases'}${paidName ? ` (${paidName})` : ''} but the description never says what needs paying for (Apple 2.3.2)`);
    if (profile.monetization.subscriptions && !f.termsUrl && !shared.termsUrl && !/(terms of use|eula|terms of service|términos de uso|termos de uso|nutzungsbedingungen|conditions d'utilisation|apple\.com\/legal\/internet-services\/itunes\/dev\/stdeula)/i.test(f.description || ''))
      add('warn', 'description', 'terms', 'auto-renewable subscription: add a Terms of Use (EULA) link to the description, or set the EULA in App Store Connect and note it as **Terms of Use** in metadata/_shared.md (Apple 3.1.2)');
  }
  if (!shared.privacyUrl && !f.privacyUrl) add('info', 'privacyUrl', 'missing', 'no Privacy Policy URL in metadata/_shared.md (App Store Connect requires one)');
  // Locale typography.
  if (locale.startsWith('es')) {
    for (const [k] of FIELDS) {
      const v = f[k] || '';
      if (/\?/.test(v) && !/¿/.test(v)) add('warn', k, 'es-question', 'Spanish questions open with ¿');
      if (/!/.test(v) && !/¡/.test(v)) add('warn', k, 'es-exclaim', 'Spanish exclamations open with ¡');
    }
    if (locale === 'es-ES') for (const [k] of FIELDS) { const m = (f[k] || '').match(LATAM_IN_ES); if (m) add('warn', k, 'es-latam', `"${m[0]}" is Latin American Spanish — the Spain listing reads it as foreign (skills/locales/es-ES.md)`); }
  }
  // Play full description: keyword stuffing (Play metadata policy).
  if (f.playFull || (android && f.description)) {
    const text = f.playFull || f.description;
    const ws = wordsOf(text, locale).filter((w) => w.length > 3 && !STOP.has(w));
    const counts = new Map();
    for (const w of ws) counts.set(w, (counts.get(w) || 0) + 1);
    for (const [w, c] of counts) if (c >= 8 && c / ws.length > 0.03) add('warn', 'playFull', 'stuffing', `"${w}" ${c}× — Play treats repetition as keyword stuffing`);
  }
  // The screenshot plan's keywords should show up in the indexed fields.
  const planKw = (Array.isArray(plan.keywords) ? plan.keywords : plan.keywords?.[locale]) || [];
  if (planKw.length) {
    const indexed = new Set(wordsOf(`${f.name || ''} ${f.subtitle || ''} ${f.keywords || ''}`, locale));
    const missing = planKw.filter((k) => !wordsOf(k, locale).every((w) => indexed.has(w) || STOP.has(w)));
    if (missing.length) add('info', 'keywords', 'plan-keywords', `plan keywords not in name, subtitle or keyword field: ${missing.join(', ')}`);
  }
  return out;
}

/** Pack candidate terms into the 100-byte field: split phrases into words, drop name/subtitle words and repeats. */
export function packKeywords(candidates, { locale = 'en-US', name = '', subtitle = '', limit = 100 } = {}) {
  const used = new Set(wordsOf(`${name} ${subtitle}`, locale));
  const seen = new Set(), dropped = [], terms = [];
  for (const phrase of candidates) {
    for (const raw of String(phrase).toLocaleLowerCase(locale).split(/[\s,]+/)) {
      const w = raw.trim(), n = stem(w, locale);
      if (!w) continue;
      if (STOP.has(w)) { dropped.push(`${w} (stop word)`); continue; }
      if (used.has(n)) { dropped.push(`${w} (in name/subtitle)`); continue; }
      if (BRANDS.includes(w)) { dropped.push(`${w} (trademark)`); continue; }
      if (GENERIC.test(w)) { dropped.push(`${w} (generic)`); continue; }
      if (seen.has(n)) continue;
      seen.add(n); terms.push(w);
    }
  }
  let field = '';
  for (const t of terms) { const next = field ? `${field},${t}` : t; if (bytes(next) > limit) { dropped.push(`${t} (no room)`); continue; } field = next; }
  return { field, bytes: bytes(field), dropped: [...new Set(dropped)] };
}

/** Write fastlane deliver (+ supply when Play fields exist) folders under `root`. Returns the file count. */
export function writeFastlane(all, shared, root) {
  let n = 0;
  const w = (dir, file, v) => { if (v === undefined || v === null || v === '') return; fs.writeFileSync(path.join(ensureDir(dir), file), `${String(v).trim()}\n`); n++; };
  const ios = path.join(root, 'metadata');
  for (const [loc, f] of Object.entries(all)) {
    const code = LOCALES[loc]?.appStore || loc;
    const d = path.join(ios, code);
    w(d, 'name.txt', f.name); w(d, 'subtitle.txt', f.subtitle); w(d, 'promotional_text.txt', f.promo); w(d, 'keywords.txt', f.keywords);
    w(d, 'description.txt', f.description); w(d, 'release_notes.txt', f.whatsNew);
    w(d, 'privacy_url.txt', f.privacyUrl || shared.privacyUrl); w(d, 'support_url.txt', f.supportUrl || shared.supportUrl); w(d, 'marketing_url.txt', f.marketingUrl || shared.marketingUrl);
    const play = LOCALES[loc]?.play || loc;
    const title = f.playTitle, short = f.playShort, full = f.playFull;
    if (title || short || full) {
      const a = path.join(ios, 'android', play);
      w(a, 'title.txt', title); w(a, 'short_description.txt', short); w(a, 'full_description.txt', full);
    }
  }
  w(ios, 'copyright.txt', shared.copyright);
  const cat = (c) => (c ? c.toUpperCase().replace(/\s*&\s*/g, '_AND_').replace(/[^A-Z_]+/g, '_').replace(/_+$/, '') : undefined);
  w(ios, 'primary_category.txt', cat(shared.primaryCategory)); w(ios, 'secondary_category.txt', cat(shared.secondaryCategory?.replace(/\s*\(optional\)/i, '')));
  return n;
}

/** All locale files in a workspace: { locale: fields } plus shared. */
export function loadAll(ws) {
  const dir = path.join(ws, 'metadata');
  const all = {};
  let shared = {};
  if (!exists(dir)) return { all, shared, dir };
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    if (f === '_shared.md') { shared = parseShared(text); continue; }
    const loc = f.replace(/\.md$/, '');
    all[loc] = parseFields(text);
  }
  return { all, shared, dir };
}

/** Name of the paid tier as the app says it ("Nova Plus", "Pulse Pro"), from paywall strings. */
export function paidTierName(profile = {}) {
  const pw = (profile.strings?.paywall || []).join(' \n ');
  const m = pw.match(/\b([A-Z][\w]+(?:\+|\s(?:Pro|Plus|Premium|Gold|Unlimited)))(?=[\s,.!:]|$)/) || pw.match(/\b([A-Z][\w]+\+)/);
  return m ? m[1].trim() : '';
}
