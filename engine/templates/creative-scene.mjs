// Creative asset: animated key art — a niche scene (engine/scenes) fills the canvas, one hero object in the middle.
// No device, usually no text: the product page already shows the name and subtitle right under the header.
import { phrase } from './_creative.mjs';

export const meta = {
  id: 'creative-scene', name: 'Creative · scene', landscape: true, creative: true,
  summary: 'Animated illustration for the app\'s world (heartbeat, coins, pond, night sky, book, steam…): ambient life over the full width, one hero object centred where iPhone crops. Optional short phrase.',
  bestFor: ['header 21:9 (key art)', 'universal 16:9', 'emotional / lifestyle niches'], needs: { screens: 0 },
  options: { scene: 'scene id (see `node scripts/scenes.mjs list`); the director picks one from the niche', variant: 'scene variant (e.g. book: letters)', phrase: 'show the headline: header false, search true', phraseAt: 'left|right on the header and wide search band; top|bottom otherwise', intensity: 'ambient strength 0.4–1.2 (1)' },
};

export function render(ctx) {
  const { safe, opt, H } = ctx;
  const id = opt('scene', 'icon-glow');
  const showPhrase = ctx.headline && opt('phrase', ctx.creative === 'search');
  const intensity = opt('intensity', 1);
  const variant = opt('variant', undefined);
  if (!showPhrase) return ctx.scene(id, { hero: true, intensity, variant });
  let box, text;
  if (ctx.creative === 'header' || safe.w / safe.h > 2.2) {
    // Side by side inside the visible band (iPhone header middle, iPhone search top band): phrase on one side, hero on the other.
    const side = opt('phraseAt', ctx.rtl ? 'right' : 'left');
    const tw = safe.w * 0.46;
    text = { x: side === 'left' ? safe.x : safe.x + safe.w - tw, y: safe.y, w: tw, h: safe.h };
    box = { x: side === 'left' ? safe.x + tw : safe.x, y: safe.y, w: safe.w - tw, h: safe.h };
    return ctx.scene(id, { hero: true, intensity, variant, box }) + phrase(ctx, text, { align: side, k: ctx.creative === 'search' ? 0.08 : 0.1, lines: 3, subhead: ctx.creative === 'search' ? '' : undefined });
  }
  const at = opt('phraseAt', 'top');
  const band = safe.h * 0.24;
  text = { x: safe.x, y: at === 'top' ? safe.y : safe.y + safe.h - band, w: safe.w, h: band };
  box = { x: safe.x, y: at === 'top' ? safe.y + band : safe.y, w: safe.w, h: safe.h - band };
  return ctx.scene(id, { hero: true, intensity, variant, box }) + phrase(ctx, text, { align: 'center', k: ctx.creative === 'search' ? 0.08 : 0.07, lines: 2, subhead: '' });
}
