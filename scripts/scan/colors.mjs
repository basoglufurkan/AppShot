// Brand colours: asset catalogs, colors.xml, theme files, tailwind, hex frequency + hints from other detectors.
import path from 'node:path';
import { safeJson } from './platform.mjs';
import { toHex, toHsl, parseColor } from '../../engine/lib/color.mjs';

const NAMED = /(primary|accent|brand|tint|main|key|highlight|secondary)/i;
const THEME_FILE = /(color|colour|theme|palette|style|token|tailwind|design|brand)/i;

export function run(ctx) {
  const { files, read, rel, profile } = ctx;
  const found = [...(ctx.colorHints || [])];
  // iOS asset catalog colours
  for (const f of files.filter((f) => /\.colorset\/Contents\.json$/.test(f))) {
    const j = safeJson(read(f));
    const comp = j?.colors?.find((c) => !c.appearances)?.color?.components || j?.colors?.[0]?.color?.components;
    if (!comp) continue;
    const ch = (v) => { v = String(v); return v.startsWith('0x') ? parseInt(v, 16) : Number(v) <= 1 && v.includes('.') ? Number(v) * 255 : Number(v); };
    const hex = toHex({ r: ch(comp.red), g: ch(comp.green), b: ch(comp.blue) });
    const name = path.basename(path.dirname(f)).replace('.colorset', '');
    found.push({ hex, name, source: rel(f), weight: NAMED.test(name) ? 9 : 4 });
  }
  // Android colours
  for (const f of files.filter((f) => /res\/values\/(colors|themes)\.xml$/.test(f))) {
    for (const m of read(f).matchAll(/<color name="([^"]+)">#([0-9A-Fa-f]{6,8})<\/color>/g)) {
      const hex = '#' + m[2].slice(-6);
      found.push({ hex, name: m[1], source: rel(f), weight: NAMED.test(m[1]) ? 8 : 2 });
    }
  }
  // Theme-ish source files: named constants and frequency.
  const freq = new Map();
  for (const f of files.filter((f) => /\.(swift|kt|dart|ts|tsx|js|jsx|css|scss|json)$/.test(f) && THEME_FILE.test(path.basename(f)) && !/package(-lock)?\.json|tsconfig/.test(f)).slice(0, 120)) {
    const s = read(f);
    for (const m of s.matchAll(/([A-Za-z_][\w-]*)\s*[:=]\s*(?:Color\()?\s*["'`]?(?:#|0x[Ff]{2})([0-9A-Fa-f]{6})\b/g)) {
      found.push({ hex: '#' + m[2], name: m[1], source: rel(f), weight: NAMED.test(m[1]) ? 7 : 1.5 });
    }
    for (const m of s.matchAll(/#([0-9A-Fa-f]{6})\b/g)) freq.set('#' + m[1].toUpperCase(), (freq.get('#' + m[1].toUpperCase()) || 0) + 1);
    for (const m of s.matchAll(/Color\(red:\s*([\d.]+),\s*green:\s*([\d.]+),\s*blue:\s*([\d.]+)/g)) {
      found.push({ hex: toHex({ r: m[1] * 255, g: m[2] * 255, b: m[3] * 255 }), name: 'swift-rgb', source: rel(f), weight: 1.5 });
    }
  }
  for (const [hex, n] of freq) found.push({ hex, name: 'frequent', source: 'theme files', weight: Math.min(4, n * 0.5) });

  // Merge near-identical colours, separate neutrals.
  const merged = new Map();
  for (const c of found) {
    const hex = toHex(parseColor(c.hex)).toUpperCase();
    const e = merged.get(hex) || { hex, names: new Set(), sources: new Set(), score: 0 };
    e.names.add(c.name); e.sources.add(c.source); e.score += c.weight;
    merged.set(hex, e);
  }
  const all = [...merged.values()].map((e) => ({ ...e, names: [...e.names].slice(0, 4), sources: [...e.sources].slice(0, 3), hsl: toHsl(e.hex) }));
  const isNeutral = (e) => e.hsl.s < 0.12 || e.hsl.l > 0.94 || e.hsl.l < 0.11 || (e.hsl.s < 0.25 && (e.hsl.l < 0.2 || e.hsl.l > 0.88));
  const brand = all.filter((e) => !isNeutral(e)).sort((a, b) => b.score - a.score);
  const neutrals = all.filter(isNeutral).sort((a, b) => b.score - a.score);
  const strip = ({ hex, names, sources, score }) => ({ hex, names, sources, score: Math.round(score * 10) / 10 });
  const bgNamed = neutrals.find((n) => n.names.some((x) => /background|^bg|surface|canvas|splash|backgroundColor/i.test(x)));
  const bg = bgNamed || neutrals[0];
  const hint = ctx.appearanceHint;
  profile.colors = {
    primary: brand[0]?.hex || null,
    secondary: brand.find((b, i) => i > 0 && Math.abs(b.hsl.h - brand[0].hsl.h) > 25)?.hex || brand[1]?.hex || null,
    background: bg?.hex || null,
    appearance: hint || (bg ? (bg.hsl.l < 0.4 ? 'dark' : 'light') : 'light'),
    palette: brand.slice(0, 8).map(strip),
    neutrals: neutrals.slice(0, 5).map(strip),
  };
}
