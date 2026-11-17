// Conversation bubbles over/around the device — AI assistants, coaching, messaging, support.
import { topText, deviceWidth } from './_shared.mjs';

export const meta = {
  id: 'chat-bubbles', name: 'Chat bubbles', hook: true,
  summary: 'Device with an oversized conversation floating over it (prompt → answer).',
  bestFor: ['AI chat', 'tutors & coaches', 'messaging', 'support'], needs: { screens: 1, fields: ['messages[]'] },
  options: { 'messages[]': '{from: user|ai, text}', avatar: 'icon for AI bubbles (app icon)' },
};

export function render(ctx) {
  const { W, H, u, shot, L, opt } = ctx;
  const t = topText(ctx);
  const d = ctx.placeDevice({ width: deviceWidth(ctx, ctx.kind === 'tablet' ? 0.62 : 0.74), cx: W / 2, top: t.bottom + H * 0.03, z: 1 });
  const msgs = (shot.messages || []).slice(0, 4);
  let y = d.y + d.h * 0.16;
  const html = msgs.map((m, i) => {
    const mine = m.from !== 'ai';
    const b = ctx.c.bubble({ text: L(m.text), from: mine ? 'user' : 'ai', w: ctx.kind === 'tablet' ? 52 : 66, avatar: mine ? null : (opt('avatar') ? ctx.asset(opt('avatar')) : ctx.appIcon) });
    const out = ctx.at(W * 0.05, y, b, { w: W * 0.9, z: 5 + i });
    y += u * (String(L(m.text)).length > 60 ? 24 : 17);
    return out;
  }).join('');
  return t.html + d.html + html;
}
