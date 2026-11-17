// References: screenshots (or a video) the user likes, studied and turned into this app's direction — the way a
// designer is briefed with "make it feel like this". Only the style is taken (tone, background, colour, structure,
// caption placement); another app's logo, mascot, illustrations or wording never are (Apple 4.1).
//   node scripts/reference.mjs add <images | folder | video | App Store URL> [--name calm-light]
//   node scripts/reference.mjs study [name]          traits + board review/reference-<name>.png
//   node scripts/reference.mjs apply <name> [--adopt] [--keep-theme]
//        → variants/ref-<name>.json (compare with variants.mjs tournament), or straight into plan.json with --adopt
//   node scripts/reference.mjs list
// Files land in appshot/references/<name>/ (images 01.png…, source.json, study/traits.json). Drop files into
// appshot/references/<name>/ by hand and run `study` — that works too.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs, findWorkspace, readJson, writeJson, exists, ensureDir, slug, die, log } from '../engine/lib/util.mjs';
import { setTraits, describe } from '../engine/lib/visual.mjs';
import { renderBoard, chip } from '../engine/lib/board.mjs';
import { directions, applyDirection } from '../engine/lib/designer.mjs';
import { loadNiche } from '../engine/lib/niches.mjs';
import { loadLearning } from '../engine/lib/learning.mjs';
import { esc } from '../engine/lib/html.mjs';

const args = parseArgs();
const cmd = args._[0] || 'list';
const ws = findWorkspace(args);
const root = ensureDir(path.join(ws, 'references'));
const IMG = /\.(png|jpe?g|webp|heic|gif)$/i, VID = /\.(mp4|mov|m4v|webm)$/i;
const refDir = (name) => path.join(root, name);
const images = (d) => (exists(d) ? fs.readdirSync(d).filter((f) => IMG.test(f)).sort().map((f) => path.join(d, f)) : []);
const names = () => fs.readdirSync(root).filter((n) => fs.statSync(path.join(root, n)).isDirectory());

if (cmd === 'list') {
  const ns = names();
  if (!ns.length) { log.info('No references yet: node scripts/reference.mjs add <images | folder | video | App Store URL>'); process.exit(0); }
  for (const n of ns) {
    const t = readJson(path.join(refDir(n), 'study', 'traits.json'), null);
    console.log(`${n.padEnd(22)} ${images(refDir(n)).length} image(s)  ${t ? describe(t) : '(not studied: reference.mjs study ' + n + ')'}`);
  }
  process.exit(0);
}

if (cmd === 'add') {
  const inputs = args._.slice(1);
  if (!inputs.length) die('What should I add? Images, a folder, a video or an App Store link.');
  let name = args.name ? slug(args.name) : null;
  const queue = [];
  let source = { added: new Date().toISOString(), inputs };
  for (const inp of inputs) {
    if (/^https?:\/\//.test(inp)) {
      const id = (inp.match(/\/id(\d+)/) || [])[1];
      if (/apps\.apple\.com/.test(inp) && id) {
        const country = (inp.match(/apps\.apple\.com\/([a-z]{2})\//) || [])[1] || 'us';
        const res = await (await fetch(`https://itunes.apple.com/lookup?id=${id}&country=${country}`)).json();
        const app = res.results?.[0];
        if (!app) die(`No App Store app with id ${id}`);
        name ||= slug(app.trackName).slice(0, 30);
        source = { ...source, app: app.trackName, seller: app.sellerName, url: app.trackViewUrl };
        for (const u of (app.screenshotUrls || []).slice(0, 6)) queue.push({ url: u.replace(/\/\d+x\d+bb\.(jpg|png)$/, '/600x0w.$1') });
      } else if (/play\.google\.com/.test(inp)) {
        die('Google Play has no public screenshot API: save the screenshots you like and add the files.');
      } else if (IMG.test(inp.split('?')[0])) queue.push({ url: inp });
      else die(`Not an image or App Store link: ${inp}`);
    } else {
      const p = path.resolve(inp);
      if (!exists(p)) die(`Not found: ${inp}`);
      if (fs.statSync(p).isDirectory()) for (const f of images(p)) queue.push({ file: f });
      else if (IMG.test(p)) queue.push({ file: p });
      else if (VID.test(p)) queue.push({ video: p });
      else die(`Unsupported file: ${inp}`);
      name ||= slug(path.basename(p).replace(/\.\w+$/, '')).slice(0, 30);
    }
  }
  name ||= `ref-${names().length + 1}`;
  const d = ensureDir(refDir(name));
  let k = images(d).length;
  for (const q of queue) {
    if (q.video) {
      // Six moments of the video as stills (the reference look, not its motion).
      const pr = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', q.video], { encoding: 'utf8' });
      const dur = Number(pr.stdout.trim()) || 6;
      for (let i = 0; i < 6; i++) {
        const f = path.join(d, `${String(++k).padStart(2, '0')}.png`);
        spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(((i + 0.5) / 6) * dur), '-i', q.video, '-frames:v', '1', f]);
      }
      continue;
    }
    const ext = q.file ? path.extname(q.file).toLowerCase() : `.${(q.url.split('?')[0].match(/\.(png|jpe?g|webp)$/i) || [, 'jpg'])[1].toLowerCase()}`;
    const f = path.join(d, `${String(++k).padStart(2, '0')}${ext}`);
    if (q.file) fs.copyFileSync(q.file, f);
    else {
      const r = await fetch(q.url);
      if (!r.ok) { log.warn(`skipped ${q.url} (${r.status})`); k--; continue; }
      fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
    }
  }
  writeJson(path.join(d, 'source.json'), source);
  log.ok(`references/${name}/ — ${images(d).length} image(s)${source.app ? ` from "${source.app}"` : ''}`);
  log.info(`Next: node scripts/reference.mjs study ${name}`);
  process.exit(0);
}

const name = args._[1] || (cmd === 'study' && names().length === 1 ? names()[0] : null);
if (!name) die(`Which reference? ${names().join(', ') || '(none yet — reference.mjs add …)'}`);
const d = refDir(name);
if (!exists(d)) die(`No reference "${name}" (reference.mjs list)`);

if (cmd === 'study') {
  const files = images(d);
  if (!files.length) die(`references/${name}/ has no images`);
  const t = setTraits(files);
  writeJson(path.join(ensureDir(path.join(d, 'study')), 'traits.json'), t);
  const src = readJson(path.join(d, 'source.json'), {});
  const lines = [
    `In one line: ${describe(t)}.`,
    `Tone ${t.tone} (${Math.round(t.darkShare * 100)} % of shots dark) · background ${t.background}${t.sameBackground ? ', the same on every shot' : ''} · caption ${t.captionAt} (≈${Math.round(t.captionShare * 100)} % of the height).`,
    `UI fills ≈${Math.round(t.uiShare * 100)} % of the canvas${t.fullBleedShare > 0.5 ? ' (full-bleed screens)' : ''}${t.multiDevice > 0.4 ? ', often several devices' : ''}${t.panorama ? ' · one panorama across shots' : ''}.`,
    'What Appshot takes: tone, background kind and colour, accent family, caption side, device size and count, panorama.',
    'What it never takes: logos, mascots, illustrations, wording, or any element that identifies the other app (Apple 4.1).',
    'What to LOOK at yourself (pixels cannot say): typeface character, highlight style (colour, pill, marker), decoration, mood — set those in the plan by hand.',
  ];
  const shots = t.shots.map((s, i) => `<div style="display:inline-block;margin:0 12px 12px 0;vertical-align:top"><img src="file://${esc(files[i])}" style="height:420px;border-radius:12px;box-shadow:0 3px 12px rgba(0,0,0,.18)"><div class="meta" style="width:200px">${esc(s.tone)} · ${esc(s.background)} · caption ${esc(s.captionAt)}<br>UI ${Math.round(s.uiShare * 100)} %${s.devices > 1 ? ` · ${s.devices} devices` : ''}<br>${chip(s.bgColor)}${s.accent ? chip(s.accent) : ''}</div></div>`).join('');
  const out = await renderBoard(`Reference — ${name}${src.app ? ` (${src.app})` : ''}`, `<ul class="box">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul><p>${t.bgColors.map(chip).join('')} ${t.accents.map(chip).join('')}</p>${shots}`, path.join(ws, 'review', `reference-${name}.png`));
  for (const l of lines.slice(0, 3)) console.log(`• ${l}`);
  log.ok(path.relative(process.cwd(), out));
  log.info(`LOOK at it, then: node scripts/reference.mjs apply ${name}`);
  process.exit(0);
}

if (cmd === 'apply') {
  const t = readJson(path.join(d, 'study', 'traits.json'), null);
  if (!t) die(`Study it first: node scripts/reference.mjs study ${name}`);
  const planFile = path.join(ws, 'plan.json');
  const plan = readJson(planFile, null);
  if (!plan) die('No plan.json yet: node scripts/plan.mjs init');
  const profile = readJson(path.join(ws, 'profile.json'), {});
  const niche = profile.niche?.chosen ? loadNiche(profile.niche.chosen)?.data : null;
  const market = readJson(path.join(ws, 'market', 'market.json'), null);
  const { directions: dirs } = directions({ plan, profile, niche, market, reference: t, learning: loadLearning() });
  const dir = args.keepTheme ? { ...dirs[0], theme: typeof plan.theme === 'string' ? plan.theme : dirs[0].theme } : dirs[0];
  const next = applyDirection(plan, dir, { reference: t });
  next.design = { ...next.design, reference: name };
  for (const r of dir.reasons) console.log(`• ${r}`);
  if (args.adopt) {
    writeJson(path.join(ensureDir(path.join(ws, 'variants')), '_previous.json'), plan);
    writeJson(planFile, next);
    log.ok(`plan.json now follows references/${name} (theme ${dir.theme}, opening ${dir.opening}${dir.panorama ? ', panorama' : ''}; previous plan: variants/_previous.json)`);
  } else {
    const v = { ...next, workspace: '..', variant: { name: `ref-${name}`, changes: [`reference ${name}: theme ${dir.theme}, opening ${dir.opening}${dir.panorama ? ', panorama' : ''}`], from: 'plan.json', createdAt: new Date().toISOString() } };
    writeJson(path.join(ensureDir(path.join(ws, 'variants')), `ref-${name}.json`), v);
    log.ok(`variants/ref-${name}.json — compare: node scripts/variants.mjs tournament · keep it: node scripts/variants.mjs adopt ref-${name}`);
  }
  process.exit(0);
}

die(`Unknown command ${cmd} (add | study | apply | list)`);
