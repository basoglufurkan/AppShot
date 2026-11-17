// User-facing text: localisation files + UI literals. Paywall and onboarding copy is kept apart —
// it is where teams already wrote their value propositions.
import path from 'node:path';
import { safeJson } from './platform.mjs';

const UI_LITERAL = [
  /\bText\(\s*"([^"\\]{3,90})"/g,                 // SwiftUI / Compose
  /\bLabel\(\s*"([^"\\]{3,90})"/g,                // SwiftUI Label
  /\b(?:title|subtitle|headline|label|placeholder|description|message|caption|text|hint)\s*[:=]\s*["'`]([^"'`\\]{3,90})["'`]/gi,
  /\bText\(\s*'([^'\\]{3,90})'/g,                 // Flutter
  />\s*([A-Z][^<>{}\n]{3,80}?)\s*</g,              // JSX text nodes
  /NSLocalizedString\(\s*"[^"]*",\s*(?:comment:\s*)?"([^"]{3,90})"/g,
];
const CODEY = /^[\w.-]+$|[{}<>=;]|\b(true|false|null|undefined|px|rgba?)\b|^https?:|\.(png|svg|json)$|^[A-Z0-9_]+$|^\$|^#/;

export function run(ctx) {
  const { files, read, rel, profile } = ctx;
  const locales = new Set();
  const loc = new Map(); // key -> value (base language)
  // iOS .strings / .xcstrings
  for (const f of files.filter((f) => /\.lproj\/[^/]+\.strings$/.test(f))) {
    const lang = f.match(/([\w-]+)\.lproj/)[1];
    if (lang !== 'Base') locales.add(lang);
    if (!/^(en|Base)/.test(lang) && loc.size) continue;
    for (const m of read(f).matchAll(/"([^"]+)"\s*=\s*"([^"]*)";/g)) loc.set(m[1], m[2]);
  }
  for (const f of files.filter((f) => f.endsWith('.xcstrings'))) {
    const j = safeJson(read(f));
    if (!j?.strings) continue;
    if (j.sourceLanguage) locales.add(j.sourceLanguage);
    for (const [k, v] of Object.entries(j.strings)) {
      for (const l of Object.keys(v.localizations || {})) locales.add(l);
      const val = v.localizations?.[j.sourceLanguage || 'en']?.stringUnit?.value || k;
      loc.set(k, val);
    }
  }
  // Android
  for (const f of files.filter((f) => /res\/values(-[\w-]+)?\/strings\.xml$/.test(f))) {
    const q = f.match(/values-([\w-]+)\//)?.[1];
    if (q && /^[a-z]{2}(-r[A-Z]{2})?$/.test(q)) locales.add(q.replace('-r', '-'));
    if (q) continue;
    for (const m of read(f).matchAll(/<string name="([^"]+)"[^>]*>([^<]+)<\/string>/g)) loc.set(m[1], m[2].replace(/\\'/g, "'"));
  }
  // Flutter ARB + JS i18n JSON
  for (const f of files.filter((f) => /\.arb$/.test(f) || (/(locales?|i18n|translations?|lang|l10n)\//i.test(rel(f)) && f.endsWith('.json')))) {
    const base = path.basename(f).replace(/\.(arb|json)$/, '').replace(/^(app|intl|messages)_/, '');
    const code = base.match(/^[a-z]{2}([-_][A-Za-z]{2,4})?$/)?.[0] || path.basename(path.dirname(f)).match(/^[a-z]{2}([-_][A-Za-z]{2,4})?$/)?.[0];
    if (code) locales.add(code.replace('_', '-'));
    if (code && !/^en/.test(code) && loc.size) continue;
    flatten(safeJson(read(f)), '', loc);
  }
  // UI literals in source
  const literals = new Map();
  const special = { paywall: new Map(), onboarding: new Map() };
  const src = files.filter((f) => /\.(swift|kt|dart|tsx|jsx|ts|js)$/.test(f) && !/test|spec|mock|stories|\.d\.ts|config|node_modules/i.test(rel(f))).slice(0, 3000);
  for (const f of src) {
    const s = read(f);
    const bucket = /paywall|subscri|premium|upgrade|pro(View|Screen|Page)|purchase/i.test(f) ? special.paywall : /onboard|welcome|intro|walkthrough|tutorial/i.test(f) ? special.onboarding : null;
    for (const re of UI_LITERAL) {
      re.lastIndex = 0;
      for (const m of s.matchAll(re)) {
        const t = m[1].trim();
        if (!isHuman(t)) continue;
        literals.set(t, (literals.get(t) || 0) + 1);
        if (bucket) bucket.set(t, rel(f));
      }
    }
  }
  const values = [...new Set([...loc.values()].filter(isHuman))];
  const top = [...literals.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  profile.strings = {
    locales: [...locales].sort(),
    count: loc.size + literals.size,
    samples: [...new Set([...values, ...top])].slice(0, 220),
    paywall: [...special.paywall.keys()].slice(0, 60),
    onboarding: [...special.onboarding.keys()].slice(0, 60),
  };
  profile.app.locales = profile.strings.locales;
}

function flatten(obj, prefix, out) {
  if (!obj || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('@')) continue;
    if (typeof v === 'string') out.set(prefix + k, v);
    else flatten(v, `${prefix}${k}.`, out);
  }
}

function isHuman(t) {
  if (!t || t.length < 3 || t.length > 120) return false;
  if (CODEY.test(t)) return false;
  if (!/[\p{L}]{2}/u.test(t)) return false;
  if (/^[a-z]+([A-Z][a-z]+)+$/.test(t)) return false; // camelCase identifiers
  return /\s/.test(t) || /^[\p{Lu}]/u.test(t);
}
