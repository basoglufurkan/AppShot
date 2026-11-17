// Motion QA for a rendered preview or promo video: decodes the finished file at full frame rate (small, grey) and
// finds the defects that make an edit feel cheap, measured frame by frame rather than guessed from the plan:
//   - a dead hold: more than ~1 s where nothing on screen moves at all (a held picture should keep living);
//   - bare frames in a transition: the picture goes flat (one colour) for more than one frame, which reads as a
//     dropped frame;
//   - a static opening: frame 0 is the autoplay start and the thumbnail, so it must be full and already moving.
// The end card is allowed to settle and hold.

import { spawnSync } from 'node:child_process';

const W = 96;

/** Per-frame stats of a video: mean absolute change from the previous frame and the frame's own spread. */
function frameStats(file, fps) {
  const pr = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  const [vw, vh] = pr.stdout.trim().split(',').map(Number);
  if (!vw) throw new Error(`cannot read ${file}`);
  const h = Math.max(2, Math.round((W * vh) / vw / 2) * 2);
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `fps=${fps},scale=${W}:${h}:flags=area,format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`ffmpeg could not decode ${file}`);
  const size = W * h, n = Math.floor(r.stdout.length / size), out = [];
  let prev = null;
  for (let i = 0; i < n; i++) {
    const f = r.stdout.subarray(i * size, (i + 1) * size);
    let s = 0, q = 0, d = 0;
    for (let k = 0; k < size; k++) { const v = f[k]; s += v; q += v * v; if (prev) d += Math.abs(v - prev[k]); }
    const mean = s / size;
    out.push({ t: i / fps, change: prev ? d / size : 0, spread: Math.sqrt(Math.max(0, q / size - mean * mean)) });
    prev = f;
  }
  return out;
}

/** Integrated loudness (LUFS) and true peak (dBTP) of a file's audio, via ffmpeg's EBU R128 meter. */
export function loudness(file) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' });
  const tail = (r.stderr || '').split('Summary:').pop();
  const num = (re) => { const m = tail.match(re); return m ? (m[1] === '-inf' ? -Infinity : Number(m[1])) : null; };
  return { lufs: num(/I:\s+(-?[\d.]+|-inf) LUFS/), peak: num(/Peak:\s+(-?[\d.]+|-inf) dBFS/), lra: num(/LRA:\s+(-?[\d.]+) LU/) };
}

/**
 * The mix, measured: silence is fine (Apple asks only for a stereo track); otherwise warn when it would clip on a
 * phone speaker, when music sits too low or too hot for social feeds (they normalise to about -14 LUFS), and say
 * plainly when the track carries effects only.
 */
export function audioQA(file, { music = false, sfx = 0 } = {}) {
  const a = loudness(file);
  const warnings = [], notes = [];
  if (a.lufs === null || a.lufs < -60) return { ...a, silent: true, warnings, notes };
  if (a.peak !== null && a.peak > -1) warnings.push(`audio true peak ${a.peak.toFixed(1)} dBTP — above -1 dBTP it can clip after AAC encoding; lower the music or preview.sfxLevel`);
  if (a.lufs > -11) warnings.push(`audio at ${a.lufs.toFixed(1)} LUFS — louder than feeds play it (≈ -14 LUFS); it will be turned down and may sound squashed`);
  if (music && a.lufs < -22) warnings.push(`music mix at ${a.lufs.toFixed(1)} LUFS — quiet next to other videos (≈ -14 to -16 LUFS); raise the music`);
  if (!music && sfx) notes.push(`effects only, ${a.lufs.toFixed(1)} LUFS integrated (peaks ${a.peak.toFixed(1)} dBTP) — fine over silence; add music for social feeds`);
  return { ...a, silent: false, warnings, notes };
}

/**
 * @param file  the rendered video
 * @param sb    its storyboard (timeline with starts, fades and the end card)
 * @returns {{ deadHolds: [{from, to}], bare: [{at, frames}], opening: {spread, moving}, warnings: string[] }}
 */
export function motionQA(file, sb, { fps = 30, holdMax = 1.0, still = 0.02 } = {}) {
  const st = frameStats(file, fps);
  const warnings = [];
  const end = sb.timeline.find((s) => s.kind === 'end');
  const settle = end ? end.start + 1.0 : Infinity; // the end card may hold once its animation has landed
  // Dead holds: runs of frames whose mean change is below `still` (grey levels per pixel; x264 repeats a frozen
  // picture exactly, a slow push or living footage stays well above it).
  const deadHolds = [];
  let run = null;
  for (const f of st) {
    if (f.t >= settle) break;
    if (f.change < still && f.t > 0) { run = run || { from: f.t }; run.to = f.t + 1 / fps; }
    else { if (run && run.to - run.from > holdMax) deadHolds.push(run); run = null; }
  }
  if (run && run.to - run.from > holdMax) deadHolds.push(run);
  const fmt = (t) => t.toFixed(1);
  for (const d of deadHolds) {
    const scene = sb.timeline.find((s) => d.from >= s.start && d.from < s.start + s.len);
    warnings.push(`dead hold ${fmt(d.from)}–${fmt(d.to)} s (${(d.to - d.from).toFixed(1)} s with nothing moving${scene ? ` in "${scene.id}"` : ''}) — record livelier footage, or let the camera push (preview.camera "auto")`);
  }
  // Bare frames inside a transition: the picture goes flat (spread under 2 grey levels) for more than one frame.
  const bare = [];
  for (const s of sb.timeline) {
    if (!s.fadeIn) continue;
    const lo = Math.floor((s.start - 0.05) * fps), hi = Math.ceil((s.start + s.fadeIn + 0.05) * fps);
    let n = 0, worst = 0;
    for (let i = Math.max(0, lo); i < Math.min(st.length, hi); i++) { if (st[i].spread < 2) n++; else n = 0; worst = Math.max(worst, n); }
    if (worst > 1) { bare.push({ at: s.start, frames: worst }); warnings.push(`${worst} bare frames in the cut into "${s.id}" at ${fmt(s.start)} s — reads as a dropped frame`); }
  }
  // Frame 0: full (some detail on screen) and moving within the first second.
  const first = st.slice(0, fps);
  const opening = { spread: st[0]?.spread || 0, moving: first.some((f) => f.change >= still * 4) };
  if (opening.spread < 6) warnings.push('frame 0 is nearly empty — the first frame is the autoplay start and the thumbnail; open on a full screen');
  if (!opening.moving) warnings.push('nothing moves in the first second — open on action (the hook clip\'s liveliest moment)');
  return { deadHolds, bare, opening, warnings };
}
