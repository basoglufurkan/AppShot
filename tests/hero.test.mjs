// Hero art: agents that can generate images (Codex, ChatGPT, Figma AI…) make the billboard's object themselves.
// The prompt recipe, the white-background cutout, the RGBA encoder, the copy-check reminder and hero.mjs end to end.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { decodePng, encodeRgbaPng } from '../engine/lib/png.mjs';
import { cutout, transparentBorder } from '../engine/lib/cutout.mjs';
import { SUBJECTS, heroPrompt } from '../engine/lib/heroart.mjs';
import { lintPlan } from '../engine/lib/copyrules.mjs';
import { layouts } from '../engine/registry.mjs';
import { tmp, png, ROOT } from './_helpers.mjs';

// A red disc with a white highlight inside, on white.
const disc = (x, y) => {
  const d = Math.hypot(x - 50, y - 50);
  if (d < 10 && x < 50) return [255, 255, 255];
  return d < 30 ? [220, 40, 40] : [255, 255, 255];
};

test('cutout removes a white background, keeps white inside the subject and trims', () => {
  const dir = tmp('hero');
  const img = decodePng(fs.readFileSync(png(path.join(dir, 'a.png'), 100, 100, disc)));
  assert.equal(transparentBorder(img), 0);
  const r = cutout(img, { margin: 2 });
  assert.ok(r.width <= 66 && r.height <= 66, `trimmed to the disc (${r.width}×${r.height})`);
  assert.ok(r.removed > 0.6);
  const at = (x, y) => r.data[(y * r.width + x) * 4 + 3];
  assert.equal(at(0, 0), 0, 'corner is transparent');
  const c = Math.round(r.width / 2);
  assert.equal(at(c - 5, c), 255, 'the white highlight inside the disc stays opaque');
  // RGBA round trip, and a transparent image is recognised as a cutout already.
  const back = decodePng(encodeRgbaPng(r));
  assert.equal(back.width, r.width);
  assert.equal(transparentBorder(back), 1);
});

test('every niche has hero subjects, and the prompt forbids text, logos, UI and people', () => {
  const niches = fs.readdirSync(path.join(ROOT, 'skills/niches')).filter((f) => f.endsWith('.md') && !f.startsWith('_')).map((f) => f.slice(0, -3));
  for (const n of niches) assert.ok(SUBJECTS[n]?.length, `no hero subject for ${n}`);
  const p = heroPrompt({ subject: 'a glowing flame', app: 'Dayloop', promise: 'Never break the chain', accent: '#FFC83D', dark: true });
  assert.match(p, /a glowing flame/);
  assert.match(p, /#FFC83D/);
  assert.match(p, /Transparent background/);
  assert.match(p, /No text.*no logos.*no UI.*no people/);
});

test('copy-check reminds a billboard without hero art', async () => {
  const meta = await layouts();
  const shot = { id: 'hook', layout: 'billboard', screen: 'raw/a.png', headline: { 'en-US': 'Drink more **water**' } };
  const codes = (s) => lintPlan({ app: { name: 'A' }, locales: ['en-US'], defaultLocale: 'en-US', shots: [s] }, { locale: 'en-US', store: 'ios', layoutsMeta: meta }).shots[0].issues;
  const no = codes(shot).find((i) => i.code === 'billboard-no-art');
  assert.equal(no?.level, 'info', 'a reminder, not a score penalty');
  assert.ok(!codes({ ...shot, hero: { image: 'raw/hero.png' } }).some((i) => i.code === 'billboard-no-art'));
});

test('hero.mjs: prompt → cutout → use writes the billboard hero', () => {
  const ws = path.join(tmp('herows'), 'appshot');
  fs.mkdirSync(path.join(ws, 'raw'), { recursive: true });
  fs.writeFileSync(path.join(ws, 'profile.json'), JSON.stringify({ niche: { top: [{ id: 'water-tracker' }] } }));
  fs.writeFileSync(path.join(ws, 'plan.json'), JSON.stringify({ app: { name: 'Tide' }, theme: 'sky', locales: ['en-US'], defaultLocale: 'en-US',
    shots: [{ id: 'hook', layout: 'billboard', screen: 'raw/a.png', headline: { 'en-US': 'Drink more **water**' } }] }));
  png(path.join(ws, 'raw', 'gen.png'), 100, 100, disc);
  const run = (...a) => spawnSync(process.execPath, [path.join(ROOT, 'scripts/hero.mjs'), ...a, '--workspace', ws], { encoding: 'utf8' });

  const status = run();
  assert.equal(status.status, 0);
  assert.match(status.stdout + status.stderr, /no hero art/);
  const prompt = run('prompt');
  assert.equal(prompt.status, 0, prompt.stderr);
  assert.match(prompt.stdout, /a water drop/);
  assert.match(prompt.stdout, /Drink more water/);
  assert.ok(fs.existsSync(path.join(ws, 'hero', 'prompt.md')));
  const cut = run('cutout', path.join(ws, 'raw', 'gen.png'), '--out', 'raw/hero-drop.png');
  assert.equal(cut.status, 0, cut.stderr);
  assert.equal(transparentBorder(decodePng(fs.readFileSync(path.join(ws, 'raw', 'hero-drop.png')))), 1);
  const use = run('use', 'raw/hero-drop.png');
  assert.equal(use.status, 0, use.stderr);
  const shot = JSON.parse(fs.readFileSync(path.join(ws, 'plan.json'), 'utf8')).shots[0];
  assert.equal(shot.hero.image, 'raw/hero-drop.png');
  assert.equal(shot.hero.layer, 'back');
  assert.match(shot.note, /AI-generated/);
  assert.notEqual(run('use', 'raw/hero-drop.png').status, 0, 'refuses to overwrite without --force');
});
