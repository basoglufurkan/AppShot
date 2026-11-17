// Read structured bits out of skills/niches/<id>.md (frontmatter + Story + Keyword clusters + Headline bank).
import path from 'node:path';
import { SKILLS_DIR, readText, parseFrontmatter } from './util.mjs';

const LAYOUTS = ['hero-device', 'device-top', 'tilted-device', 'duo-devices', 'trio-fan', 'zoom-callout', 'floating-cards', 'feature-list',
  'social-proof', 'big-number', 'before-after', 'full-bleed', 'text-hero', 'review-quote', 'split-diagonal', 'bridge', 'screen-grid', 'ui-pieces',
  'notification-stack', 'chat-bubbles', 'comparison'];

export function loadNiche(id) {
  const file = path.join(SKILLS_DIR, 'niches', `${id}.md`);
  const src = readText(file);
  if (!src) return null;
  const { data, body } = parseFrontmatter(src);
  const sections = {};
  for (const chunk of body.split(/^## /m).slice(1)) {
    const [head, ...rest] = chunk.split('\n');
    sections[head.trim().toLowerCase()] = rest.join('\n');
  }
  return { id, file, data, sections };
}

/** Numbered story steps → [{ n, title, text, layout }] */
export function nicheStory(id) {
  const n = loadNiche(id);
  const sec = n && Object.entries(n.sections).find(([k]) => k.startsWith('story'))?.[1];
  if (!sec) return [];
  return [...sec.matchAll(/^\s*(\d+)\.\s+(.+)$/gm)].map((m) => {
    const line = m[2];
    const title = (line.match(/\*\*([^*]+)\*\*/) || [])[1] || line.split(/—|-|:/)[0].trim();
    const layout = LAYOUTS.find((l) => new RegExp(`\\b${l}\\b`).test(line)) || 'hero-device';
    const screen = (line.match(/show:?\s*([^—]+)/i) || [])[1]?.trim();
    return { n: Number(m[1]), title: title.trim(), text: line.replace(/\*\*/g, '').trim(), layout, screen };
  });
}

/** Phrases from "## Keyword clusters" → { en: [], tr: [] } */
export function nicheKeywords(id) {
  const n = loadNiche(id);
  const sec = n && Object.entries(n.sections).find(([k]) => k.startsWith('keyword'))?.[1];
  const out = { en: [], tr: [] };
  if (!sec) return out;
  const lines = [];
  for (const raw of sec.split('\n')) {
    // One-line clusters ("EN: … — TR: …") are split so each half lands in its language.
    const m = raw.match(/^(.*?)(?:—|-|\|)?\s*\b(TR|Türkçe|Turkish)\b\s*[:：]\s*(.+)$/i);
    if (m && m[1].replace(/[\s*|-]/g, '').length > 3) { lines.push(m[1]); lines.push(`TR: ${m[3]}`); }
    else lines.push(raw);
  }
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const isTr = /türkçe|turkish|\(tr\)|\btr:/i.test(line);
    const items = [...line.matchAll(/`([^`]+)`|"([^"]+)"/g)].map((m) => m[1] || m[2]);
    // Drop a leading cluster label ("- **Plans** — …", "EN: …") before splitting.
    const body = line.replace(/^[\s|-]*\*\*[^*]+\*\*\s*[:—–-]?\s*/, '').replace(/^[\s*|-]+/, '').replace(/^(EN|English)\s*[:：]\s*/i, '');
    const bare = items.length ? items : body.split(/[,;·|]/);
    for (let k of bare) {
      k = k.replace(/\(.*?\)|\*\*|→|—|TR:|EN:/gi, '').trim().toLowerCase();
      if (k.length < 3 || k.length > 40 || /cluster|keyword|turkish|english|türkçe/.test(k)) continue;
      (isTr || /[çğıöşü]/.test(k) ? out.tr : out.en).push(k);
    }
  }
  return { en: [...new Set(out.en)], tr: [...new Set(out.tr)] };
}

/** Headline bank lines by language → { en: [], tr: [] } */
export function nicheHeadlines(id) {
  const n = loadNiche(id);
  const sec = n && Object.entries(n.sections).find(([k]) => k.startsWith('headline'))?.[1];
  const out = { en: [], tr: [] };
  if (!sec) return out;
  let lang = 'en';
  for (const line of sec.split('\n')) {
    if (/^###\s*(türkçe|turkish)/i.test(line)) lang = 'tr';
    else if (/^###\s*english/i.test(line)) lang = 'en';
    const m = line.match(/^\s*[-*]\s+(.+)$/);
    if (m) out[lang].push(m[1].trim());
  }
  return out;
}

export { LAYOUTS };
