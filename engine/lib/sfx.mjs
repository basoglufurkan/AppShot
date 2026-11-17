// Sound effects for app previews and promo videos. Appshot ships no sounds: it reads a pack the user owns (a folder
// of category subfolders — whoosh/, click/, interface/, sparkle/, counter/, keyboard/, riser/, impact/,
// notification/ — any library laid out that way) and places each sound on the event it belongs to, because the
// storyboard already knows every tap, cut, number roll and end card to the frame.
//
// Mixing rules (from hand-mixed reference reels): whooshes only on the 3–4 biggest moves; every other transition gets
// a very low interface swish; a click on every tap; one single sparkle per video; every sound's PEAK on its frame
// (not its start); all of it low enough to sit under the music — if you notice them as "sounds", they are too loud.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { readJson, writeJson, exists, ensureDir } from './util.mjs';

const AUDIO = /\.(wav|mp3|m4a|aac|aif|aiff|flac|ogg|caf)$/i;
const CATEGORIES = ['whoosh', 'interface', 'click', 'sparkle', 'counter', 'keyboard', 'riser', 'impact', 'notification', 'money', 'scan', 'error'];

/** True when `dir` looks like a pack: at least three known category folders holding audio files. */
function isPack(dir) {
  if (!dir || !exists(dir) || !fs.statSync(dir).isDirectory()) return false;
  return CATEGORIES.filter((c) => exists(path.join(dir, c)) && fs.readdirSync(path.join(dir, c)).some((f) => AUDIO.test(f))).length >= 3;
}

/**
 * Where the pack is: an explicit path (plan.preview.sfx, --sfx <dir>), else $APPSHOT_SFX. Nothing else is searched:
 * the user says where their sounds are. Returns null when none is given.
 */
export function findSfxPack(spec, ws) {
  if (typeof spec === 'string' && spec !== 'auto') {
    const p = path.resolve(ws || process.cwd(), spec.replace(/^~(?=\/|$)/, os.homedir()));
    for (const c of [p, path.join(p, 'sfx')]) if (isPack(c)) return c;
    throw new Error(`No sound-effect pack at ${p} (expected folders such as whoosh/, click/, interface/, sparkle/)`);
  }
  const env = process.env.APPSHOT_SFX;
  if (env) for (const c of [env, path.join(env, 'sfx')]) if (isPack(c)) return c;
  return null;
}

/** The files of one category, sorted (deterministic picks). */
function files(pack, cat) {
  const d = path.join(pack, cat);
  return exists(d) ? fs.readdirSync(d).filter((f) => AUDIO.test(f)).sort().map((f) => path.join(d, f)) : [];
}

/** First file in `cat` whose name matches one of `prefer` (in order), else the k-th file. */
function pick(pack, cat, prefer = [], k = 0) {
  const all = files(pack, cat);
  if (!all.length) return null;
  for (const p of prefer) { const f = all.find((x) => path.basename(x).toLowerCase().includes(p)); if (f) return f; }
  return all[k % all.length];
}

/** Duration and peak time of a sound (cached): the peak is what lands on the event frame. */
export function soundInfo(file, cacheRoot) {
  const st = fs.statSync(file);
  const key = crypto.createHash('sha1').update([file, st.size, st.mtimeMs, 'sfx1'].join('|')).digest('hex').slice(0, 16);
  const cacheFile = cacheRoot && path.join(ensureDir(path.join(cacheRoot, 'sfx')), `${key}.json`);
  if (cacheFile && exists(cacheFile)) return readJson(cacheFile);
  const SR = 11025;
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(SR), '-f', 's16le', '-'], { maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error(`ffmpeg could not read ${file}`);
  const pcm = new Int16Array(r.stdout.buffer, r.stdout.byteOffset, Math.floor(r.stdout.length / 2));
  // Peak of a 10 ms envelope, so a single sample spike does not move the sound.
  const win = Math.round(SR * 0.01);
  let best = 0, at = 0, acc = 0;
  for (let i = 0; i < pcm.length; i++) {
    acc += Math.abs(pcm[i]);
    if (i >= win) acc -= Math.abs(pcm[i - win]);
    if (acc > best) { best = acc; at = i - win / 2; }
  }
  const out = { duration: pcm.length / SR, peak: Math.max(0, at / SR) };
  if (cacheFile) writeJson(cacheFile, out);
  return out;
}

/**
 * The cue sheet for one preview: [{ t (seconds, where the PEAK lands), file, db, why }]. Gains are relative to the
 * pack's common peak level; the whole bed is then kept under the music by `mixGain`.
 */
export function cueSheet(sb, pack, { cacheRoot, level = 0 } = {}) {
  const cues = [];
  const add = (t, cat, db, why, prefer, k) => {
    const file = pick(pack, cat, prefer, k);
    if (file && t >= 0 && t < sb.duration - 0.05) cues.push({ t: Math.round(t * 1000) / 1000, file, db: db + level, why });
  };
  const promo = sb.style === 'promo';
  const scenes = sb.timeline.filter((s) => s.kind !== 'end');
  const end = sb.timeline.find((s) => s.kind === 'end');
  // Cuts: whooshes on the biggest moves only (promo pushes, at most 3 + the device rising in); store dissolves and the
  // rest get a very low swish.
  if (promo) add(0.08, 'whoosh', -15, 'device rises in', ['medium', 'light']);
  scenes.forEach((s, k) => {
    if (!k) return;
    if (promo && k <= 3) add(s.start + 0.12, 'whoosh', -17, `push into scene ${k + 1}`, k % 2 ? ['light', 'short'] : ['medium', 'light']);
    else add(s.start + s.fadeIn / 2, 'interface', promo ? -24 : -27, `cut into scene ${k + 1}`, ['swish', 'flick'], k);
  });
  scenes.forEach((s, k) => {
    // A click on every tap (the press frame), a swish under every swipe.
    for (const tp of s.touches || []) {
      if (tp.kind === 'swipe') add(s.start + tp.t + 0.05, 'interface', -22, `swipe in scene ${k + 1}`, ['swish', 'flick']);
      else add(s.start + tp.t, 'click', -16, `tap in scene ${k + 1}`, ['click-0', 'click', 'mouse'], k);
    }
    // Rolling numbers run over a ticker; decoded captions over typing.
    if (s.numbers && s.capIn >= 0) add(s.start + s.capIn + 0.1, 'counter', -24, `number rolls in scene ${k + 1}`, ['ticker-fast', 'ticker-1s', 'ticker']);
    if (s.effect === 'decode' && s.capIn >= 0) add(s.start + s.capIn + 0.15, 'keyboard', -24, `caption decodes in scene ${k + 1}`, ['typing-short', 'typing']);
  });
  if (end) {
    // One single sparkle in the whole video: the icon landing. A soft pop for the call to action.
    add(end.start + 0.32, 'sparkle', -18, 'icon lands on the end card', ['chime', 'shimmer', 'glitter']);
    if (sb.cta) add(end.start + 0.75, 'interface', -22, 'call to action', ['pop-mid', 'pop', 'bubble']);
  }
  // Peaks on their frames: shift every sound so its loudest moment is the event, never before t = 0.
  for (const c of cues) { const info = soundInfo(c.file, cacheRoot); c.at = Math.max(0, c.t - info.peak); c.peak = info.peak; }
  return cues.sort((a, b) => a.t - b.t);
}

/**
 * ffmpeg pieces that mix the cues over the base track `[base]`: extra inputs and a filter that ends in `[a]`.
 * `firstInput` is the ffmpeg input index of the first cue file.
 */
export function mixFilter(cues, firstInput, { music = false } = {}) {
  const inputs = [], chains = [], labels = [];
  // Without music the effects are the only sound: a little louder; under music they sit lower still.
  const bed = music ? -3 : 4;
  cues.forEach((c, k) => {
    inputs.push('-i', c.file);
    const ms = Math.round(c.at * 1000);
    chains.push(`[${firstInput + k}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${(c.db + bed).toFixed(1)}dB,adelay=${ms}|${ms}[s${k}]`);
    labels.push(`[s${k}]`);
  });
  const filter = cues.length
    ? `${chains.join(';')};[base]${labels.join('')}amix=inputs=${cues.length + 1}:duration=first:dropout_transition=0:normalize=0,alimiter=limit=0.89:level=0[a]`
    : '[base]anull[a]';
  return { inputs, filter };
}
