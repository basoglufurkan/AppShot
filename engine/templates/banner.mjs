import { esc } from '../lib/html.mjs';

// Landscape banner for wide canvases: Play feature graphic (1024×500) and App Store creative assets (21:9, 3:2, 16:9).
// Text block on the left, one to three tilted devices on the right.

export const meta = {
  id: 'banner', name: 'Landscape banner', landscape: true,
  summary: 'Icon + name + one-line promise on the left, devices on the right. For wide promo graphics, not screenshots.',
  bestFor: ['Play feature graphic', 'App Store header / search / universal creative assets'], needs: { screens: 1 },
  options: { showName: 'true/false (true)', devices: '1–3 (2)' },
};

export function render(ctx) {
  const { W, H, opt, theme } = ctx;
  const h = H / 100;
  const pad = W * 0.06;
  const textW = W * 0.46;
  let html = '';
  let y = H * 0.2;
  if (ctx.appIcon && opt('showIcon', true)) {
    const s = h * 22;
    html += ctx.at(pad, y, `<img src="${esc(ctx.appIcon)}" style="width:${s}px;height:${s}px;border-radius:${s * 0.225}px;box-shadow:0 ${s * 0.08}px ${s * 0.25}px rgba(0,0,0,.25);display:block">`, { z: 5 });
    if (opt('showName', true) && ctx.appName) html += ctx.at(pad + s + h * 4, y + s / 2 - h * 4.5, `<div style="font-family:var(--font-display);font-weight:800;font-size:${h * 8.4}px;color:${theme.text};letter-spacing:-0.02em;white-space:nowrap">${esc(ctx.appName)}</div>`, { z: 5 });
    y += s + h * 6;
  }
  // Text units in this template scale with height (u = H/100) instead of width.
  const u = ctx.u;
  html += ctx.text({ x: pad, y, w: textW, h: H - y - H * 0.12, align: 'left', valign: 'top', max: (h * 13) / u, min: (h * 6) / u, lines: 3, eyebrow: '', subhead: '' });
  const n = Math.min(3, Math.max(1, opt('devices', Math.min(2, ctx.screens.length))));
  const devH = H * 1.05;
  for (let i = 0; i < n; i++) {
    const width = ctx.fitDevice({ maxW: W * 0.3, maxH: devH, screen: i });
    const cx = W * (n === 1 ? 0.76 : 0.66 + i * (0.24 / Math.max(1, n - 1)));
    const top = H * (0.16 + (i % 2) * 0.1);
    html += ctx.placeDevice({ width, cx, top, screen: i, rotate: n === 1 ? -6 : -10 + i * 10, z: 3 + i }).html;
  }
  return html;
}
