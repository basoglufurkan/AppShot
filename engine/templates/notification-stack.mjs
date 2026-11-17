// Stack of notification banners over the device — reminders, alerts, streaks, deliveries, price drops.
import { topText, deviceWidth } from './_shared.mjs';

export const meta = {
  id: 'notification-stack', name: 'Notification stack',
  summary: 'Device with 1–3 realistic notification banners floating over its upper half.',
  bestFor: ['reminders', 'habit & health nudges', 'finance alerts', 'delivery & tracking'], needs: { screens: 1, fields: ['notifications[]'] },
  options: { 'notifications[]': '{title, body, time, app, icon}' },
};

export function render(ctx) {
  const { W, H, u, shot, L } = ctx;
  const t = topText(ctx);
  const d = ctx.placeDevice({ width: deviceWidth(ctx), cx: W / 2, top: t.bottom + H * 0.025, z: 1 });
  const list = (shot.notifications || []).slice(0, 3);
  const nw = ctx.kind === 'tablet' ? 64 : 86;
  let y = d.y + d.h * 0.12;
  const html = list.map((n, i) => {
    const el = ctx.c.notification({ app: L(n.app) || ctx.appName, icon: n.icon ? ctx.asset(n.icon) : ctx.appIcon, title: L(n.title), body: L(n.body), time: L(n.time) || 'now', w: nw - i * 2 });
    const out = ctx.at((W - u * (nw - i * 2)) / 2, y, el, { z: 6 - i, rotate: i === 0 ? -1 : 0 });
    y += u * 21;
    return out;
  }).join('');
  return t.html + d.html + html;
}
