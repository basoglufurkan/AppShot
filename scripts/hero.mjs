#!/usr/bin/env node
// Hero art for the billboard (shot 1): if your agent can make images (Codex, ChatGPT, Figma AI…), it makes one.
//   node scripts/hero.mjs                         status: does shot 1 have hero art? what next
//   node scripts/hero.mjs prompt [--subject "a glowing flame"] [--style 3d|photo]
//        → the prompt for your image tool (also written to appshot/hero/prompt.md)
//   node scripts/hero.mjs cutout <image> [--out raw/hero-<name>.png] [--tol 38]
//        → removes a plain white background (skipped if the image is already transparent)
//   node scripts/hero.mjs use <raw/hero-x.png> [--layer back|front] [--note "how it was made"] [--force]
//        → sets hero.image on the billboard shot (layer back: big, behind the device)
// Then render the draft and LOOK: the object must read at thumbnail size and never cover the promise.

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, findWorkspace, readJson, writeJson, exists, ensureDir, slug, die, log, L } from '../engine/lib/util.mjs';
import { decodePng, encodeRgbaPng } from '../engine/lib/png.mjs';
import { cutout, transparentBorder, trim } from '../engine/lib/cutout.mjs';
import { SUBJECTS, heroPrompt, billboardShot } from '../engine/lib/heroart.mjs';
import { resolveTheme } from '../engine/compose.mjs';

const args = parseArgs();
const ws = findWorkspace(args);
const [cmd = 'status', arg] = args._;
const planFile = path.join(ws, 'plan.json');
const plan = readJson(planFile, null);
const profile = readJson(path.join(ws, 'profile.json'), {});
const shot = billboardShot(plan);
const niche = profile?.niche?.top?.[0]?.id || plan?.niche;
const plain = (s) => String(s || '').replace(/\*\*/g, '');

if (cmd === 'status') {
  if (!plan) die('No plan.json yet — run plan.mjs init first.');
  if (!shot) { log.info('No billboard in this plan — hero art is for the billboard opener (shot 1).'); process.exit(0); }
  const img = L(shot.hero?.image, plan.defaultLocale || 'en-US');
  if (img) log.ok(`Shot "${shot.id}" has hero art: ${img}${exists(path.join(ws, img)) ? '' : ' (file missing!)'}`);
  else {
    log.warn(`Shot "${shot.id}" has no hero art. If you can generate images (Codex, ChatGPT, Figma AI…), make one now:`);
    console.log(`  1. node ${path.relative(process.cwd(), process.argv[1])} prompt   → send the prompt to your image tool`);
    console.log('  2. save the result in appshot/raw/, then: hero.mjs cutout <file>   (if it has a white background)');
    console.log('  3. hero.mjs use raw/hero-<name>.png   → render --draft and look');
    console.log('  Cannot make images? Leave it: the money moment (pop.rect) carries the billboard alone.');
  }
} else if (cmd === 'prompt') {
  const subject = args.subject || SUBJECTS[niche]?.[0] || 'the one real-world object this app is about';
  const theme = plan ? resolveTheme(plan, shot || {}) : {};
  const prompt = heroPrompt({
    subject, app: plan?.app?.name, promise: shot ? plain(L(shot.headline, plan.defaultLocale || 'en-US')) : '',
    accent: theme.accent, dark: !!theme.dark, style: args.style,
  });
  const ideas = SUBJECTS[niche];
  const md = `# Hero art prompt${niche ? ` (${niche})` : ''}\n\n\`\`\`text\n${prompt}\n\`\`\`\n\n${ideas ? `Other subjects for this niche: ${ideas.join(' · ')}\n` : ''}`;
  fs.writeFileSync(path.join(ensureDir(path.join(ws, 'hero')), 'prompt.md'), md);
  console.log(prompt);
  if (!args.subject && !ideas) log.warn('No niche subject known — pass --subject "…" (one bold object, not a scene).');
  else if (ideas?.length > 1 && !args.subject) log.info(`Alternative subject: --subject "${ideas[1]}"`);
  log.ok(`Saved to ${path.relative(process.cwd(), path.join(ws, 'hero', 'prompt.md'))}`);
} else if (cmd === 'cutout') {
  if (!arg) die('Usage: hero.mjs cutout <image.png> [--out raw/hero-x.png]');
  const src = path.resolve(arg);
  if (!exists(src)) die(`No image at ${src}`);
  if (!/\.png$/i.test(src)) die('PNG only — ask your image tool for PNG output (or convert it first).');
  const img = decodePng(fs.readFileSync(src));
  const out = path.resolve(ws, args.out || path.join('raw', `hero-${slug(path.basename(src, '.png')).replace(/^hero-/, '')}.png`));
  ensureDir(path.dirname(out));
  if (transparentBorder(img) > 0.9) {
    fs.writeFileSync(out, encodeRgbaPng(trim(img)));
    log.ok(`Already transparent — trimmed to ${path.relative(process.cwd(), out)}`);
  } else {
    const r = cutout(img, { tol: Number(args.tol || 38) });
    if (r.removed < 0.05) log.warn('Hardly any background removed — is it a plain light background? Ask the tool for transparent or pure white.');
    fs.writeFileSync(out, encodeRgbaPng(r));
    log.ok(`${path.relative(process.cwd(), out)} ${r.width}×${r.height} (${Math.round(r.removed * 100)}% background removed)`);
  }
} else if (cmd === 'use') {
  if (!plan) die('No plan.json yet.');
  if (!shot) die('No billboard shot in plan.json — make shot 1 a billboard first.');
  if (!arg) die('Usage: hero.mjs use raw/hero-x.png');
  const rel = path.isAbsolute(arg) ? path.relative(ws, arg) : arg.replace(/^appshot\//, '');
  if (!exists(path.join(ws, rel))) die(`No image at ${path.join(ws, rel)} — the hero must live inside the workspace (appshot/raw/).`);
  if (shot.hero?.image && !args.force) die(`Shot "${shot.id}" already has hero.image (${L(shot.hero.image, 'en-US')}) — pass --force to replace it.`);
  const back = (args.layer || 'back') === 'back';
  shot.hero = { ...(shot.hero || {}), image: rel, ...(back ? { layer: 'back', x: 0.84, y: 0.55, w: 0.8, h: 0.72 } : {}) };
  if (back) shot.options = { deviceScale: 0.66, deviceX: 0.41, ...(shot.options || {}) };
  if (args.note || !shot.note) shot.note = args.note || 'Hero art: AI-generated by the agent’s image tool (no text, logos or people).';
  writeJson(planFile, plan);
  log.ok(`Shot "${shot.id}": hero.image = ${rel}${back ? ' (behind the device, device moved left)' : ''}. Now render --draft and look.`);
} else die(`Unknown command "${cmd}" — status | prompt | cutout | use`);
