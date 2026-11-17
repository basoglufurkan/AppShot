// One giant number tells the story ("3×", "10K+ recipes", "-40%"). Real figures only.
import { deviceWidth, pad } from './_shared.mjs';

export const meta = {
  id: 'big-number', name: 'Big number', hook: true,
  summary: 'Huge stat on top, short label, device below. Specific numbers beat adjectives.',
  bestFor: ['content volume', 'speed', 'savings', 'results with a real source'], needs: { screens: 1, fields: ['stat.value'] },
  options: { 'stat.value': 'the number (real)', 'stat.source': 'where it comes from', statSize: 'number size in u (30)' },
};

export function render(ctx) {
  const { W, H, u, shot, L, theme, opt } = ctx;
  const p = pad(ctx);
  const value = L(shot.stat?.value) || '';
  const top = H * 0.05;
  const numH = H * (ctx.kind === 'tablet' ? 0.15 : 0.13);
  const num = ctx.text({ x: p, y: top, w: W - p * 2, h: numH, headline: value, subhead: '', eyebrow: '', max: opt('statSize', 30), min: 12, lines: 1, color: theme.accent, valign: 'bottom' });
  const label = ctx.text({ x: p, y: top + numH + H * 0.01, w: W - p * 2, h: H * 0.12, max: 7.4, min: 4.6, lines: 2, eyebrow: '', valign: 'top' });
  const d = ctx.placeDevice({ width: deviceWidth(ctx, ctx.kind === 'tablet' ? 0.64 : 0.76), cx: W / 2, top: top + numH + H * 0.15 });
  return num + label + d.html;
}
