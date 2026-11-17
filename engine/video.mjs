// Loop-perfect video from a composed page: pose every frame with window.__appshot.setTime(t, loop),
// capture it in Chrome and pipe JPEG frames straight into ffmpeg. No intermediate files.

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileUrl, ensureDir } from './lib/util.mjs';
import { compose } from './compose.mjs';

export function hasFfmpeg() {
  return spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
}

const CODECS = {
  // H.264 High, yuv420p — plays everywhere; x264 picks the level for 4K-class frames.
  h264: { ext: '.mp4', args: ['-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-tag:v', 'avc1', '-movflags', '+faststart'] },
  // HEVC tagged hvc1 so QuickTime/iOS recognise it; smaller files at the same quality.
  hevc: { ext: '.mp4', args: ['-c:v', 'libx265', '-crf', '18', '-pix_fmt', 'yuv420p', '-tag:v', 'hvc1', '-movflags', '+faststart', '-x265-params', 'log-level=error'] },
  // ProRes 422 HQ master — large, lossless-looking, always accepted by Apple pipelines.
  prores: { ext: '.mov', args: ['-c:v', 'prores_ks', '-profile:v', '3', '-pix_fmt', 'yuv422p10le', '-vendor', 'apl0'] },
};

/**
 * Render a looping video of one composed shot.
 * @returns {Promise<{file, frames, width, height, fps, duration}>}
 */
export async function renderLoopVideo({ plan, sizeId, locale, out, page, fps = 30, duration = 12, scale = 1, codec = 'h264', onProgress }) {
  const c = CODECS[codec] || CODECS.h264;
  const file = out.replace(/\.\w+$/, '') + c.ext;
  ensureDir(path.dirname(file));
  const { html, W, H } = await compose({ plan, workspace: plan.__workspace, sizeId, locale });
  const htmlFile = path.join(ensureDir(path.join(plan.__workspace, '.cache', 'video')), `${sizeId}.${locale}.html`);
  fs.writeFileSync(htmlFile, html);
  await page.setViewport(W, H, 1);
  await page.goto(fileUrl(htmlFile));
  await page.evaluate('window.__appshot.ready');

  const frames = Math.round(fps * duration);
  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-r', String(fps), '-an', ...c.args, file,
  ], { stdio: ['pipe', 'ignore', 'pipe'] });
  let err = '';
  ff.stderr.on('data', (d) => { err += d; });
  const done = new Promise((resolve, reject) => ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg failed (${code}): ${err.slice(-600)}`)))));
  for (let f = 0; f < frames; f++) {
    await page.evaluate(`window.__appshot.setTime(${f / fps}, ${duration}); new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))`);
    const buf = await page.screenshot({ width: W, height: H, scale, format: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (onProgress && (f % fps === 0 || f === frames - 1)) onProgress(f + 1, frames);
  }
  ff.stdin.end();
  await done;
  return { file, frames, width: Math.round((W * scale) / 2) * 2, height: Math.round((H * scale) / 2) * 2, fps, duration };
}

/** Still frames across the loop (for review boards): returns PNG buffers at loop fractions. */
export async function loopStills({ plan, sizeId, locale, page, at = [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6], scale = 0.25 }) {
  const { html, W, H } = await compose({ plan, workspace: plan.__workspace, sizeId, locale });
  const htmlFile = path.join(ensureDir(path.join(plan.__workspace, '.cache', 'video')), `${sizeId}.${locale}.stills.html`);
  fs.writeFileSync(htmlFile, html);
  await page.setViewport(W, H, 1);
  await page.goto(fileUrl(htmlFile));
  await page.evaluate('window.__appshot.ready');
  const out = [];
  for (const p of at) {
    await page.evaluate(`window.__appshot.setTime(${p}, 1); new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))`);
    out.push(await page.screenshot({ width: W, height: H, scale, format: 'jpeg', quality: 85 }));
  }
  return { stills: out, W, H };
}

/** Duration / fps / size of a rendered video (ffprobe), or null when ffprobe is missing. */
export function probe(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate,codec_name:format=duration,size', '-of', 'json', file], { encoding: 'utf8' });
  if (r.status !== 0) return null;
  const j = JSON.parse(r.stdout);
  const s = j.streams?.[0] || {};
  const [n, d] = String(s.r_frame_rate || '0/1').split('/').map(Number);
  return { width: s.width, height: s.height, fps: d ? n / d : 0, codec: s.codec_name, duration: Number(j.format?.duration || 0), bytes: Number(j.format?.size || 0) };
}
