// The app's own translations, so store text uses the words the app uses: if the app says "Racha" and "Sesión de
// enfoque" in Spanish, the listing should too. Reads Xcode String Catalogs (.xcstrings), legacy .strings in
// <lang>.lproj, Android res/values-<lang>/strings.xml and Flutter .arb files; returns the terms of a source text
// (the default-locale description, say) with their translation into the target locale.

import fs from 'node:fs';
import path from 'node:path';

const SKIP = /(^|\/)(node_modules|\.git|build|Build|DerivedData|Pods|appshot|\.claude|\.cache|dist|\.next|ios\/build|android\/build|worktrees)(\/|$)/;

function walk(root, max = 6000) {
  const out = [];
  const stack = [root];
  while (stack.length && out.length < max) {
    const d = stack.pop();
    let ents = [];
    try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { continue; }
    for (const e of ents) {
      const p = path.join(d, e.name);
      if (SKIP.test(path.relative(root, p))) continue;
      if (e.isDirectory()) stack.push(p);
      else if (/\.(xcstrings|strings|xml|arb)$/.test(e.name)) out.push(p);
    }
  }
  return out;
}

const langKeys = (locale) => { const [l, r] = locale.split('-'); return [locale, l, r && r.length === 2 ? `${l}-${r}` : null, r ? `${l}_${r}` : null].filter(Boolean); };
const unesc = (s) => s.replace(/\\"/g, '"').replace(/\\n/g, ' ').replace(/\\'/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/** { source → translation } pairs for one target locale, from every catalogue in the project. */
export function translations(root, locale) {
  const pairs = new Map();
  const want = langKeys(locale);
  const files = walk(root);
  for (const f of files) {
    try {
      if (f.endsWith('.xcstrings')) {
        const j = JSON.parse(fs.readFileSync(f, 'utf8'));
        if (!/^en/.test(j.sourceLanguage || 'en')) continue;
        for (const [key, v] of Object.entries(j.strings || {})) {
          const src = v.localizations?.[j.sourceLanguage]?.stringUnit?.value || key;
          const loc = want.map((k) => v.localizations?.[k]).find(Boolean);
          const t = loc?.stringUnit?.value || loc?.stringSet?.values?.[0];
          if (t && src && t !== src) pairs.set(src, t);
        }
      } else if (f.endsWith('.strings')) {
        const m = f.match(/\/([\w-]+)\.lproj\//);
        if (!m || !want.includes(m[1])) continue;
        const enFile = f.replace(`/${m[1]}.lproj/`, '/en.lproj/');
        const base = fs.existsSync(enFile) ? enFile : f.replace(`/${m[1]}.lproj/`, '/Base.lproj/');
        if (!fs.existsSync(base)) continue;
        const read = (p) => new Map([...fs.readFileSync(p, 'utf8').matchAll(/^"((?:[^"\\]|\\.)+)"\s*=\s*"((?:[^"\\]|\\.)*)";/gm)].map((x) => [unesc(x[1]), unesc(x[2])]));
        const en = read(base), tr = read(f);
        for (const [k, v] of tr) if (en.get(k) && v !== en.get(k)) pairs.set(en.get(k), v);
      } else if (f.endsWith('strings.xml')) {
        const m = f.match(/\/values-([\w+-]+)\/strings\.xml$/);
        if (!m) continue;
        const code = m[1].replace(/^b\+/, '').replace('-r', '-').replace('+', '-');
        if (!want.includes(code)) continue;
        const base = f.replace(`/values-${m[1]}/`, '/values/');
        if (!fs.existsSync(base)) continue;
        const read = (p) => new Map([...fs.readFileSync(p, 'utf8').matchAll(/<string name="([^"]+)"[^>]*>([\s\S]*?)<\/string>/g)].map((x) => [x[1], unesc(x[2].trim())]));
        const en = read(base), tr = read(f);
        for (const [k, v] of tr) if (en.get(k) && v !== en.get(k)) pairs.set(en.get(k), v);
      } else if (f.endsWith('.arb')) {
        const m = f.match(/_([a-zA-Z]{2,3}(?:[_-][A-Za-z]{2,4})?)\.arb$/);
        if (!m || !want.includes(m[1].replace('_', '-')) && !want.includes(m[1])) continue;
        const base = f.replace(/_[^_/]+\.arb$/, '_en.arb');
        if (!fs.existsSync(base)) continue;
        const en = JSON.parse(fs.readFileSync(base, 'utf8')), tr = JSON.parse(fs.readFileSync(f, 'utf8'));
        for (const [k, v] of Object.entries(tr)) if (!k.startsWith('@') && typeof v === 'string' && en[k] && v !== en[k]) pairs.set(en[k], v);
      }
    } catch {}
  }
  return pairs;
}

/** Short UI terms (1–4 words) that appear in `text`, with their translation; proper-looking terms first. */
export function glossary(root, text, locale, { max = 40 } = {}) {
  if (!root || !text) return [];
  const pairs = translations(root, locale);
  const low = text.toLowerCase();
  const out = [], seen = new Set();
  for (const [src, t] of pairs) {
    if (seen.has(src.toLowerCase())) continue;
    const words = src.trim().split(/\s+/);
    if (words.length > 4 || src.length > 32 || src.length < 3 || /[%@{}\\$]/.test(src) || /[%@{}$]/.test(t)) continue;
    const re = new RegExp(`(^|[^\\p{L}])${src.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}]|$)`, 'u');
    if (!re.test(low)) continue;
    seen.add(src.toLowerCase());
    out.push({ term: src, translation: t, proper: /^[A-Z]/.test(src) && !/^(The|A|An|Your|Every|Start|Pause|Resume|End)\b/.test(src) });
  }
  return out.sort((a, b) => b.proper - a.proper || b.term.length - a.term.length).slice(0, max);
}
