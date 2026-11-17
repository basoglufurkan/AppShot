// Scene: a glass task card where items tick off one by one, a progress ring closes, confetti bursts.
import { palette, stage, rand, uid, layer, at, box, mo, svg, canvasSvg, backdrop, glow, blobs, mix, rgba, r, dashPath } from './_kit.mjs';

export const meta = {
  id: 'tasks', name: 'Tasks', mood: 'calm', poster: 0.7,
  summary: 'Glass task card: checkmarks tick off one by one, a progress ring closes, confetti bursts, small cards drift around.',
  niches: ['todo-tasks', 'calendar-planner', 'focus-timer', 'habit-tracker', 'medication-reminder', 'pdf-scanner', 'phone-cleaner'],
  keywords: ['todo', 'to-do', 'task', 'tasks', 'checklist', 'planner', 'calendar', 'schedule', 'reminder', 'productivity', 'focus', 'pomodoro', 'routine', 'organize', 'scan', 'document'],
};

export function render(ctx, o = {}) {
  const { hero = true, intensity = 1 } = o;
  const g = stage(ctx, o.box), p = palette(ctx), R = rand(ctx, 'tasks');
  const { W, H, cx, cy, S } = g;
  let h = hero ? backdrop(ctx, p.dark
    ? `radial-gradient(ellipse 65% 85% at 50% 45%, ${mix(p.base, p.accent, 0.14)} 0%, ${mix(p.base, '#000', 0.3)} 80%)`
    : `radial-gradient(ellipse 65% 85% at 50% 45%, ${mix(p.base, '#fff', 0.7)} 0%, ${mix(p.base, p.accent, 0.08)} 85%)`) : '';
  h += layer(ctx, blobs(ctx, R, { colors: [p.accent, p.accent2], n: 4, a: (p.dark ? 0.2 : 0.16) * intensity }));
  const glass = p.dark ? 'linear-gradient(160deg, rgba(255,255,255,.15), rgba(255,255,255,.05))' : 'linear-gradient(160deg, rgba(255,255,255,.95), rgba(255,255,255,.75))';
  const edge = p.dark ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,1)';
  // Small cards drifting around.
  for (let i = 0; i < 9; i++) {
    const w = S * (0.16 + R() * 0.12), hh = w * 0.42;
    let x = W * (0.04 + R() * 0.92);
    if (hero && Math.abs(x - cx) < S * 0.6) x = cx + (x < cx ? -1 : 1) * (S * 0.6 + R() * S * 0.4);
    const c = i % 2 ? p.accent : p.accent2;
    const card = `<div style="position:absolute;inset:0;border-radius:${r(hh * 0.3)}px;background:${glass};border:2px solid ${edge}"><div style="position:absolute;left:10%;top:32%;width:${r(hh * 0.36)}px;height:${r(hh * 0.36)}px;border-radius:50%;background:${rgba(c, 0.85)}"></div><div style="position:absolute;left:34%;top:40%;width:52%;height:18%;border-radius:99px;background:${rgba(p.dark ? '#fff' : '#0B0B12', 0.18)}"></div></div>`;
    h += box(x - w / 2, H * (0.08 + R() * 0.8), w, hh, mo(ctx, card, { type: 'float', x: w * 0.05, y: hh * 0.3, rot: 3, phase: R() }), `opacity:${0.85 * intensity}`);
  }
  if (!hero) return h;
  const cw = S * 0.72, chh = S * 0.78, x0 = cx - cw / 2, y0 = cy - chh / 2;
  h += glow(cx, cy, S * 1.5, p.accent, p.dark ? 0.35 : 0.25);
  h += box(x0 + cw * 0.08, y0 - chh * 0.05, cw * 0.84, chh, `<div style="position:absolute;inset:0;border-radius:${r(S * 0.05)}px;background:${glass};opacity:.55;border:2px solid ${edge}"></div>`, 'z-index:1');
  h += box(x0, y0, cw, chh, `<div style="position:absolute;inset:0;border-radius:${r(S * 0.05)}px;background:${glass};border:${r(Math.max(2, S * 0.004))}px solid ${edge};box-shadow:0 ${r(S * 0.04)}px ${r(S * 0.1)}px rgba(0,0,0,${p.dark ? 0.45 : 0.12})"></div>`, 'z-index:2');
  // Header bar + progress ring.
  const ink = p.dark ? '#fff' : '#0B0B12';
  h += box(x0 + cw * 0.09, y0 + chh * 0.1, cw * 0.42, chh * 0.06, `<div style="position:absolute;inset:0;border-radius:99px;background:${rgba(ink, 0.75)}"></div>`, 'z-index:3');
  const rs = chh * 0.2, rx = x0 + cw * 0.8, ry = y0 + chh * 0.13;
  const rr = r(rs * 0.4);
  const ringD = `M${r(rx)} ${r(ry - rr)} A${rr} ${rr} 0 0 1 ${r(rx)} ${r(ry + rr)} A${rr} ${rr} 0 0 1 ${r(rx)} ${r(ry - rr)}`;
  h += box(0, 0, W, H, canvasSvg(ctx, `<circle cx="${r(rx)}" cy="${r(ry)}" r="${r(rs * 0.4)}" fill="none" stroke="${rgba(p.accent, 0.2)}" stroke-width="${r(rs * 0.14)}"/>`
    + dashPath(ctx, ringD, { stroke: p.accent, width: rs * 0.14, mode: 'draw', inT: 0.1, len: 0.5, out: 0.92 })), 'z-index:3');
  // Rows that tick off.
  for (let i = 0; i < 4; i++) {
    const ry2 = y0 + chh * (0.3 + i * 0.16), cs = chh * 0.09, cx2 = x0 + cw * 0.09 + cs / 2;
    const tin = 0.12 + i * 0.12;
    h += at(cx2, ry2, cs, cs, `<div style="position:absolute;inset:0;border-radius:50%;border:${r(cs * 0.1)}px solid ${rgba(ink, 0.25)}"></div>`, 'z-index:3');
    h += at(cx2, ry2, cs, cs, mo(ctx, `<div style="position:absolute;inset:0;border-radius:50%;background:${p.accent}"></div>`, { type: 'grow', in: tin, len: 0.05, out: 0.92, over: 0.2 }), 'z-index:4');
    h += box(cx2 - cs / 2, ry2 - cs / 2, cs, cs, svg(cs, cs, dashPath(ctx, 'M28 52 L44 66 L72 36', { stroke: p.dark && p.accent ? mix(p.accent, '#000', 0.75) : '#fff', width: 10, mode: 'draw', inT: tin + 0.03, len: 0.05, out: 0.92 })), 'z-index:5');
    h += box(x0 + cw * 0.26, ry2 - chh * 0.025, cw * (0.5 - (i % 2) * 0.12), chh * 0.05, mo(ctx, `<div style="position:absolute;inset:0;border-radius:99px;background:${rgba(ink, 0.22)}"></div>`, { type: 'osc', prop: 'opacity', lo: 1, hi: 1 }), 'z-index:3');
  }
  // Confetti burst when the list is done.
  const cols = [p.accent, p.accent2, '#FFC93C', '#FF6B6B', '#4FD1C5'];
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + R() * 0.3, dist = S * (0.45 + R() * 0.3), s = S * (0.018 + R() * 0.018);
    h += at(rx, ry, s, s * (i % 3 ? 0.5 : 1), mo(ctx, '', { type: 'travel', x0: 0, y0: 0, x1: Math.cos(a) * dist, y1: Math.sin(a) * dist + S * 0.12, r0: 0, r1: 360 * (R() > 0.5 ? 1 : -1), ease: 'out', win: [0.62, 0.88], fi: 0.05, fo: 0.4, o: 1 }, `background:${cols[i % cols.length]};border-radius:${i % 3 ? 2 : 99}px`), 'z-index:6');
  }
  return h;
}
