// Shared geometry for App Store creative assets (header 21:9, search results 3:2, universal 16:9).
// Sizes come from the canvas HEIGHT and the size's safe area, never from the portrait unit u.

/** Headline/subhead block sized from canvas height. `k` = max headline height as a fraction of H. */
export function phrase(ctx, box, { align = 'left', valign = 'center', k, lines = 3, subhead = ctx.subhead } = {}) {
  if (!ctx.headline) return '';
  const { H, u } = ctx;
  const kk = k ?? (ctx.creative === 'search' ? 0.085 : ctx.creative === 'universal' ? 0.075 : 0.105);
  return ctx.text({ ...box, align, valign, max: (H * kk) / u, min: (H * kk * 0.55) / u, lines, eyebrow: '', subhead, subRatio: 0.4 });
}

/** A device that floats (and cycles screens when it has several). */
export function floatingDevice(ctx, { cx, top, width, screens, rotate = 0, z = 2, phase = 0, amp = 0.011 }) {
  const { H } = ctx;
  const d = screens.length > 1 ? ctx.deviceCycle({ width, screens }) : ctx.device({ width, screen: screens[0] ?? 0 });
  const x = cx - d.width / 2;
  const html = ctx.at(x, top, ctx.motion(d.html, { type: 'float', y: H * amp, x: H * amp * 0.25, rot: 0.5, phase }), { w: d.width, h: d.height, rotate, z, className: 'dv-wrap' });
  return { html, x, y: top, w: d.width, h: d.height };
}

/** Split the capture indexes between n devices; the front device (index 0 of the result) cycles the extras. */
export function assignScreens(total, n) {
  const all = Array.from({ length: Math.max(1, total) }, (_, i) => i);
  if (all.length <= n) return Array.from({ length: n }, (_, i) => [all[i % all.length]]);
  const side = all.slice(1, n);
  const front = [all[0], ...all.slice(n)];
  return [front, ...side.map((i) => [i])];
}

/** Stat cards that pop in one after another and fade before the loop restarts. */
export function popCards(ctx, cards, anchors) {
  const { H, u, L } = ctx;
  const k = ctx.creative === 'search' ? 0.034 : 0.04;
  const size = (H * k) / (5.2 * u);
  return (cards || []).slice(0, anchors.length).map((c, i) => {
    const html = ctx.c.statCard({ icon: c.icon, title: L(c.title), value: L(c.value), trend: L(c.trend), w: 46, size });
    const a = anchors[i];
    const inner = ctx.motion(html, { type: 'pop', in: 0.1 + i * 0.16, out: 0.9, dy: H * 0.03 });
    return ctx.at(a.x, a.y, inner, { rotate: a.rotate ?? (i % 2 ? 2 : -2), z: 10 + i });
  }).join('');
}

/** Glow behind the hero devices that breathes slowly. */
export function stageGlow(ctx, { cx, cy, size }) {
  const c = ctx.theme.accent;
  const glow = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle, ${c}55 0%, ${c}00 68%);filter:blur(${Math.round(size * 0.05)}px)"></div>`;
  return ctx.at(cx - size / 2, cy - size / 2, ctx.motion(glow, { type: 'zoom', amp: 0.08 }), { w: size, h: size, z: 1 });
}

/** Ambient scene behind devices/phrase (options.backdrop = scene id): the niche's world without its hero object. */
export function backdrop(ctx) {
  const id = ctx.opt('backdrop', null);
  return id ? ctx.scene(id, { hero: false, intensity: ctx.opt('backdropIntensity', 0.75), variant: ctx.opt('variant', undefined) }) : '';
}
