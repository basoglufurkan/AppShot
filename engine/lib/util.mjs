// Shared helpers: paths, CLI args, JSON/frontmatter IO, logging, localisation lookup.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const ENGINE_DIR = path.join(SKILL_DIR, 'engine');
export const SKILLS_DIR = path.join(SKILL_DIR, 'skills');

/** Tiny argv parser: --key value, --flag, --key=value, positionals in _. */
export function parseArgs(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq > -1) { out[camel(a.slice(2, eq))] = a.slice(eq + 1); continue; }
      const key = camel(a.slice(2));
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[key] = true;
      else { out[key] = next; i++; }
    } else if (a.startsWith('-') && a.length === 2) {
      out[a.slice(1)] = true;
    } else out._.push(a);
  }
  return out;
}
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

export const list = (v) => (v === undefined || v === true ? [] : Array.isArray(v) ? v : String(v).split(',').map((s) => s.trim()).filter(Boolean));

export function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Cannot read JSON ${file}: ${e.message}`);
  }
}
export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}
export function readText(file, fallback = '') {
  try { return fs.readFileSync(file, 'utf8'); } catch { return fallback; }
}
export const exists = (p) => { try { fs.accessSync(p); return true; } catch { return false; } };
export const ensureDir = (p) => { fs.mkdirSync(p, { recursive: true }); return p; };
export const fileUrl = (p) => pathToFileURL(p).href;

/** Parse YAML-ish frontmatter: scalars, [inline, arrays], quoted strings, numbers, booleans. */
export function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: src };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*?)\s*(#.*)?$/);
    if (!mm) continue;
    data[mm[1]] = scalar(mm[2]);
  }
  return { data, body: m[2] };
}
function scalar(v) {
  if (v.startsWith('[') && v.endsWith(']')) {
    return v.slice(1, -1).split(',').map((s) => scalar(s.trim())).filter((s) => s !== '');
  }
  if (/^".*"$|^'.*'$/.test(v)) return v.slice(1, -1);
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v !== '' && !isNaN(Number(v))) return Number(v);
  return v;
}

/** Load every .md file in a skills subfolder with its frontmatter. */
export function loadMarkdownDir(dir) {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => {
      const file = path.join(dir, f);
      const { data, body } = parseFrontmatter(fs.readFileSync(file, 'utf8'));
      return { id: data.id || f.replace(/\.md$/, ''), file, data, body };
    });
}

/** Walk a directory tree, skipping heavy/irrelevant folders (and any absolute paths in `exclude`). */
const SKIP = new Set(['node_modules', '.git', 'Pods', 'build', 'Build', 'DerivedData', '.gradle', '.dart_tool',
  '.expo', '.next', 'dist', '.turbo', '.idea', '.vscode', 'vendor', '.appshot', 'coverage', '.build',
  'android/app/build', 'ios/build', '.cxx', 'xcuserdata', '.swiftpm', 'Carthage', '.fvm', '.pub-cache', '__pycache__']);
export function walk(root, { maxFiles = 20000, maxDepth = 12, filter, exclude = [] } = {}) {
  const skipPaths = new Set(exclude.map((p) => path.resolve(p).toLowerCase()));
  const out = [];
  const stack = [[root, 0]];
  while (stack.length && out.length < maxFiles) {
    const [dir, depth] = stack.pop();
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      if (e.name.startsWith('.') && e.name !== '.storybook' && !e.name.endsWith('.xcassets')) {
        if (e.isDirectory()) continue;
      }
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (SKIP.has(e.name) || depth >= maxDepth || skipPaths.has(full.toLowerCase())) continue;
        stack.push([full, depth + 1]);
      } else if (!filter || filter(full, e.name)) {
        out.push(full);
      }
    }
  }
  return out;
}

/** Localised value lookup: string | {locale: string}. Falls back to language, default, first. */
export function L(value, locale, fallbackLocale) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'object' || Array.isArray(value)) return value;
  if (value[locale] !== undefined) return value[locale];
  const lang = String(locale).split('-')[0];
  const sameLang = Object.keys(value).find((k) => k.split('-')[0] === lang);
  if (sameLang) return value[sameLang];
  if (fallbackLocale && value[fallbackLocale] !== undefined) return value[fallbackLocale];
  const first = Object.keys(value)[0];
  return first ? value[first] : '';
}

export const log = {
  info: (...a) => console.log('•', ...a),
  ok: (...a) => console.log('✓', ...a),
  warn: (...a) => console.warn('!', ...a),
  err: (...a) => console.error('✗', ...a),
  step: (...a) => console.log('\n▸', ...a),
};

export function die(msg, code = 1) {
  log.err(msg);
  process.exit(code);
}

// The workspace is a visible `appshot/` folder in the app project. Older versions used a hidden `.appshot/`;
// it is still found (and `workspace.mjs init` renames it).
export const WORKSPACE_DIR = 'appshot';
export const LEGACY_WORKSPACE_DIR = '.appshot';
export const WORKSPACE_MARKER = '.workspace';

const sameDir = (a, b) => {
  try { return fs.realpathSync.native(a).toLowerCase() === fs.realpathSync.native(b).toLowerCase(); } catch { return false; }
};

/** A folder is a workspace only if it carries our marker or files — not merely because of its name
 *  (macOS paths are case-insensitive, so ~/Desktop/appshot can be the Appshot skill folder itself). */
export const isWorkspace = (dir) => !sameDir(dir, SKILL_DIR) && [WORKSPACE_MARKER, 'plan.json', 'profile.json'].some((f) => exists(path.join(dir, f)));

/** Used when appshot/ already exists and belongs to something else. */
export const FALLBACK_WORKSPACE_DIR = 'appshot-workspace';

/** Can `dir` become (or is it already) a workspace? Never the skill folder, never someone else's folder. */
function usable(dir) {
  if (!exists(dir)) return true;
  if (sameDir(dir, SKILL_DIR)) return false;
  if (isWorkspace(dir)) return true;
  try { return fs.readdirSync(dir).length === 0; } catch { return false; }
}

/** Workspace path for a project: visible appshot/, a not-yet-migrated .appshot/, or appshot-workspace/ on a name clash. */
export function workspaceFor(projectDir) {
  const root = path.resolve(projectDir);
  const visible = path.join(root, WORKSPACE_DIR);
  const legacy = path.join(root, LEGACY_WORKSPACE_DIR);
  if (!isWorkspace(visible) && isWorkspace(legacy)) return legacy;
  if (usable(visible)) return visible;
  return path.join(root, FALLBACK_WORKSPACE_DIR);
}

/** Find the workspace: --workspace, --project, or appshot/ in the cwd or a parent. */
export function findWorkspace(args = {}) {
  if (args.workspace) return path.resolve(args.workspace);
  if (args.project) return workspaceFor(args.project);
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (isWorkspace(dir) && [WORKSPACE_DIR, FALLBACK_WORKSPACE_DIR, LEGACY_WORKSPACE_DIR].includes(path.basename(dir).toLowerCase())) return dir;
    for (const name of [WORKSPACE_DIR, FALLBACK_WORKSPACE_DIR, LEGACY_WORKSPACE_DIR]) {
      const cand = path.join(dir, name);
      if (isWorkspace(cand)) return cand;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return workspaceFor(process.cwd());
}

export const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const pad2 = (n) => String(n).padStart(2, '0');

/** Deterministic PRNG for decorative randomness (same plan → same picture). */
export function rng(seed = 1) {
  let s = typeof seed === 'string' ? [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) : seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
