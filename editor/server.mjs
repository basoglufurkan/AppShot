#!/usr/bin/env node
// Local editor: live preview of plan.json, edit captions/layouts/themes by hand, render from the browser.
// The agent and the human share the same plan.json — edits on disk reload in the editor and vice versa.
//   node editor/server.mjs [--project <app repo> | --workspace <appshot>] [--port 4848]

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs, findWorkspace, readJson, writeJson, exists, SKILL_DIR, log } from '../engine/lib/util.mjs';
import { compose } from '../engine/compose.mjs';
import * as reg from '../engine/registry.mjs';
import { validatePlan } from '../engine/schema.mjs';
import { lintPlan } from '../engine/lib/copyrules.mjs';
import { directions, applyDirection } from '../engine/lib/designer.mjs';
import { activeReference, loadMarket } from '../engine/lib/designer-io.mjs';
import { loadLearning } from '../engine/lib/learning.mjs';
import { loadNiche } from '../engine/lib/niches.mjs';

const args = parseArgs();
const ws = findWorkspace(args);
const planFile = path.join(ws, 'plan.json');
if (!exists(planFile)) { log.err(`No plan.json in ${ws}. Create one first: node scripts/plan.mjs init`); process.exit(1); }
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(args.port) || 4848;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff2': 'font/woff2' };

// Workspace files are served under /ws/, anything else the plan references (inside the skill) under /skill/.
const assetUrl = (abs) => {
  const rel = path.relative(ws, abs);
  if (!rel.startsWith('..')) return '/ws/' + rel.split(path.sep).map(encodeURIComponent).join('/');
  const rs = path.relative(SKILL_DIR, abs);
  if (!rs.startsWith('..')) return '/skill/' + rs.split(path.sep).map(encodeURIComponent).join('/');
  return '/missing';
};

const clients = new Set();
const emit = (type, data = {}) => { for (const res of clients) res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`); };
let lastWrite = 0;
fs.watch(ws, (ev, name) => {
  if (name === 'plan.json' && Date.now() - lastWrite > 800) emit('plan-changed', { at: Date.now() });
  if (name && /review|out|drafts/.test(name)) emit('files-changed', { name });
});

const send = (res, code, body, type = 'application/json') => {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};
const readBody = (req) => new Promise((resolve, reject) => {
  let b = '';
  req.on('data', (c) => { b += c; if (b.length > 20e6) reject(new Error('too large')); });
  req.on('end', () => { try { resolve(b ? JSON.parse(b) : {}); } catch (e) { reject(e); } });
});
const serveFile = (res, file, root) => {
  const abs = path.resolve(root, file);
  if (!abs.startsWith(path.resolve(root)) || !exists(abs) || fs.statSync(abs).isDirectory()) return send(res, 404, 'not found', 'text/plain');
  res.writeHead(200, { 'Content-Type': MIME[path.extname(abs).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(abs).pipe(res);
};
const listRaw = () => {
  const dir = path.join(ws, 'raw');
  return exists(dir) ? fs.readdirSync(dir, { recursive: true }).map(String).filter((f) => /\.(png|jpe?g)$/i.test(f)).map((f) => `raw/${f.split(path.sep).join('/')}`).sort() : [];
};
const runScript = (script, extra = []) => new Promise((resolve) => {
  const p = spawn(process.execPath, [path.join(SKILL_DIR, 'scripts', script), '--workspace', ws, ...extra], { cwd: ws });
  let out = '';
  p.stdout.on('data', (d) => { out += d; emit('log', { line: String(d) }); });
  p.stderr.on('data', (d) => { out += d; emit('log', { line: String(d) }); });
  p.on('close', (code) => resolve({ code, out }));
});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = decodeURIComponent(url.pathname);
  try {
    if (req.method === 'GET' && (p === '/' || p === '/index.html')) return serveFile(res, 'index.html', HERE);
    if (req.method === 'GET' && ['/app.js', '/style.css'].includes(p)) return serveFile(res, p.slice(1), HERE);
    if (req.method === 'GET' && p.startsWith('/ws/')) return serveFile(res, p.slice(4), ws);
    if (req.method === 'GET' && p.startsWith('/skill/')) return serveFile(res, p.slice(7), SKILL_DIR);

    if (p === '/api/state' && req.method === 'GET') {
      const layouts = await reg.layouts();
      const themes = reg.themes();
      return send(res, 200, {
        workspace: ws, plan: readJson(planFile),
        meta: {
          layouts: Object.values(layouts).filter((m) => !m.landscape && !m.internal).map((m) => ({ id: m.id, name: m.name, hook: !!m.hook, summary: m.summary, needs: m.needs, options: m.options })),
          themes: Object.values(themes).map((t) => ({ id: t.id, name: t.name, dark: !!t.dark, accent: t.accent, description: t.description })),
          frames: Object.keys(await reg.frames()),
          sizes: reg.sizes().map((s) => ({ id: s.id, label: s.label, width: s.width, height: s.height, store: s.store })),
          locales: Object.entries(reg.locales()).map(([id, l]) => ({ id, name: l.name })),
        },
        raw: listRaw(),
      });
    }
    if (p === '/api/compose' && req.method === 'POST') {
      const body = await readBody(req);
      const plan = body.plan || readJson(planFile);
      const r = await compose({ plan, workspace: ws, sizeId: body.size, locale: body.locale, assetUrl, viewAll: !!body.viewAll });
      return send(res, 200, { html: r.html, W: r.W, H: r.H, slots: r.slots, panorama: r.panorama });
    }
    if (p === '/api/plan' && req.method === 'PUT') {
      const body = await readBody(req);
      const v = await validatePlan(body.plan, { workspace: ws });
      if (!v.ok && !body.force) return send(res, 422, v);
      lastWrite = Date.now();
      writeJson(planFile, body.plan);
      return send(res, 200, { ok: true, warnings: v.warnings });
    }
    if (p === '/api/lint' && req.method === 'POST') {
      const body = await readBody(req);
      const layoutsMeta = await reg.layouts();
      const profile = readJson(path.join(ws, 'profile.json'), {});
      return send(res, 200, lintPlan(body.plan, { locale: body.locale, store: body.store || 'ios', profile, layoutsMeta }));
    }
    if (p === '/api/render' && req.method === 'POST') {
      const body = await readBody(req);
      const extra = [];
      if (body.draft) extra.push('--draft');
      if (body.sizes?.length) extra.push('--sizes', body.sizes.join(','));
      if (body.locales?.length) extra.push('--locales', body.locales.join(','));
      const r = await runScript('render.mjs', extra);
      if (r.code === 0) await runScript('sheet.mjs', body.draft ? ['--draft'] : []);
      return send(res, 200, r);
    }
    if (p === '/api/score' && req.method === 'POST') {
      const body = await readBody(req);
      const r = await runScript('score.mjs', [...(body.draft !== false ? ['--draft'] : []), '--json']);
      let json = null;
      try { json = JSON.parse(r.out.slice(r.out.indexOf('['))); } catch {}
      return send(res, 200, { code: r.code, results: json, out: r.out });
    }
    // ---- design directions: the director's A/B/C for this app, the market, references, the tournament ----
    const design = (plan) => {
      const profile = readJson(path.join(ws, 'profile.json'), {});
      const nicheId = plan.niche || profile.niche?.chosen;
      const ref = activeReference(ws, plan);
      const out = directions({ plan, profile, niche: nicheId ? loadNiche(nicheId)?.data : null, market: loadMarket(ws), reference: ref?.traits, learning: loadLearning() });
      return { dirs: out.directions, ref };
    };
    if (p === '/api/design' && req.method === 'POST') {
      const body = await readBody(req);
      const plan = body.plan || readJson(planFile);
      const { dirs, ref } = design(plan);
      const market = loadMarket(ws);
      const refs = exists(path.join(ws, 'references')) ? fs.readdirSync(path.join(ws, 'references')).filter((n) => !n.startsWith('.')).map((n) => ({ name: n, board: exists(path.join(ws, 'review', `reference-${n}.png`)) ? `/ws/review/reference-${encodeURIComponent(n)}.png` : null, studied: exists(path.join(ws, 'references', n, 'study', 'traits.json')) })) : [];
      return send(res, 200, {
        directions: dirs, active: ref?.name || null, references: refs,
        market: market ? { apps: market.apps.length, terms: market.terms, lines: market.summary.lines, board: exists(path.join(ws, 'review', 'market.png')) ? '/ws/review/market.png' : null } : null,
        tournament: readJson(path.join(ws, 'review', 'tournament.json'), null),
      });
    }
    if (p === '/api/design/preview' && req.method === 'POST') {
      // The direction applied to the current (unsaved) plan, first three shots side by side.
      const body = await readBody(req);
      const { dirs } = design(body.plan);
      const dir = dirs.find((d) => d.key === body.key);
      if (!dir) return send(res, 404, { error: 'no such direction' });
      const plan = applyDirection(body.plan, dir);
      plan.shots = plan.shots.slice(0, 3);
      const r = await compose({ plan, workspace: ws, sizeId: body.size, locale: body.locale, assetUrl, viewAll: true });
      return send(res, 200, { html: r.html, W: r.W, H: r.H, n: r.slots.length });
    }
    if (p === '/api/design/apply' && req.method === 'POST') {
      const body = await readBody(req);
      const { dirs, ref } = design(body.plan);
      const dir = dirs.find((d) => d.key === body.key);
      if (!dir) return send(res, 404, { error: 'no such direction' });
      const plan = applyDirection(body.plan, dir, { reference: ref?.traits });
      if (ref) plan.design = { ...plan.design, reference: ref.name };
      return send(res, 200, { plan });
    }
    if (p === '/api/design/tournament' && req.method === 'POST') {
      const body = await readBody(req);
      const w = await runScript('design.mjs', ['directions', '--write']);
      if (w.code !== 0) return send(res, 200, w);
      const r = await runScript('variants.mjs', ['tournament', ...(body.size ? ['--size', body.size] : []), ...(body.locale ? ['--locale', body.locale] : [])]);
      return send(res, 200, { code: r.code, tournament: readJson(path.join(ws, 'review', 'tournament.json'), null) });
    }
    if (p === '/api/market/scan' && req.method === 'POST') {
      const r = await runScript('market.mjs', ['scan']);
      return send(res, 200, { code: r.code });
    }
    if (p === '/api/events') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
      res.write('event: hello\ndata: {}\n\n');
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }
    send(res, 404, { error: 'not found' });
  } catch (e) {
    send(res, 500, { error: e.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  log.ok(`Appshot editor → http://localhost:${PORT}`);
  log.info(`Workspace: ${ws}`);
});
