// Billboard — shot 1's scroll-stopper. The first frame has one job: stop the thumb and say the value in one look,
// so it must not read like a sibling of the shots after it (those show the app). A giant 2–4 word promise — the
// biggest type in the set — with a short kicker (the subhead, set in display type), one hero (the app's money
// moment lifted out of the device, and/or a cutout of the real-world thing the app is about) and real proof at the
// foot. Proof is iOS only: Google Play bans ratings, awards and rankings in images, so there the row disappears
// and the device takes its room (meta.dropsProofOn — the lint knows, no skipOn needed).
import { pad, isTablet } from './_shared.mjs';
import { rgba } from '../lib/color.mjs';
import { esc, style, round, markup } from '../lib/html.mjs';

export const meta = {
  id: 'billboard', name: 'Billboard', hook: true, firstOnly: true, dropsProofOn: ['android'],
  summary: 'Shot 1’s scroll-stopper: a giant 2–4 word promise with a kicker, one hero (the key UI popping out of the device, or a cutout image) and real proof at the foot (iOS).',
  bestFor: ['shot 1 in most niches', 'a promise that fits in 2–4 words', 'a screen with one money moment', 'real ratings, user counts or press (iOS)'],
  needs: { screens: 0 },
  options: {
    textSize: 'max headline size in u (15; Play phones 13 for the 20 % tagline cap; tablet 12.5) — the subhead becomes the kicker at 0.44×',
    deviceScale: 'device width / canvas width (0.74, or 0.64 above a proof row; tablet 0.54 / 0.46)',
    deviceX: 'device centre as a fraction of W (0.5); move it aside (0.4) to give a big hero object room',
    'pop.rect': '[x,y,w,h] of the screen to lift out of the device — the money moment',
    'pop.w': 'pop-out width / canvas width (0.86; tablet 0.68)', 'pop.y': 'its centre as a fraction of H (default: where it sits on the device)', 'pop.rotate': 'degrees (0)', 'pop.shape': 'rounded|circle',
    'hero.image': 'a cutout PNG you own (product, person, food, car…); per-locale object allowed', 'hero.x|y|w|h': 'centre (canvas fractions), width (of W), height (of the hero zone)', 'hero.shape': 'cutout|card (a photo cropped to hero.aspect, 1.25)', 'hero.rotate': 'degrees',
    'hero.layer': 'front (default with a device) | back: a big object behind the device, like a prop in a poster',
    'cards[]': 'up to 2 stat cards beside the hero {icon, value, title, pos: tl|tr|ml|mr|bl|br}',
    'stickers[]': 'up to 4 floating chips around the hero {text?, icon?, style: card|accent|dark|emoji, pos: tl|tr|ml|mr|bl|br or x, y (canvas fractions), rotate, size} — facts the screen shows, not proof',
    'rating | awards[]': 'proof at the foot, iOS only, real and sourced: laurels, or "style": "seal" for a badge',
    glow: 'accent light behind the hero (true)',
  },
};

const POS = { tl: ['l', 0.06], tr: ['r', 0.1], ml: ['l', 0.36], mr: ['r', 0.4], bl: ['l', 0.64], br: ['r', 0.68] };
const ORDER = ['tr', 'ml'];

export function render(ctx) {
  const { W, H, u, shot, L, theme, opt } = ctx;
  const tab = isTablet(ctx);
  const p = pad(ctx);
  const hasScreen = !!(shot.screen || shot.screens);
  const hero = shot.hero || {};
  const imgRef = L(hero.image);
  const proof = meta.dropsProofOn.includes(ctx.size?.store) ? [] : proofItems(ctx);

  // 1 — the promise: giant headline, the kicker right under it in display type. Google Play caps taglines at 20 % of
  // the image (play.mjs check measures it), so on Play phones the promise runs at 13 u — still the biggest in the set.
  const top = H * (tab ? 0.05 : 0.055);
  const bandH = H * (tab ? 0.24 : 0.26);
  const play = ctx.size?.store === 'android';
  let html = ctx.text({
    x: p, y: top, w: W - p * 2, h: bandH, align: opt('align', 'center'), valign: 'center',
    max: opt('textSize', tab ? 12.5 : play ? 13 : 15), min: tab ? 7 : 8.4, lines: 3, subRatio: 0.44, gap: 2.1,
    subClass: 'kick', subColor: theme.text,
  });
  const heroTop = top + bandH + H * 0.012;

  // 2 — the foot: proof (iOS). The device dissolves above it, so the laurels sit on the real background.
  const footH = proof.length ? H * (tab ? 0.12 : 0.115) : 0;
  const footTop = H * 0.96 - footH;
  const zoneBottom = proof.length ? footTop : H;
  const zoneH = zoneBottom - heroTop;

  // 3 — the hero: the device (glow behind), the money moment lifted out of it, cards, a cutout.
  let back = '';
  if (opt('glow', true)) {
    const gw = W * 1.2, gh = zoneH * 0.95;
    back += `<div style="${style({ position: 'absolute', left: (W - gw) / 2, top: heroTop - zoneH * 0.06, width: gw, height: gh, borderRadius: '50%', background: `radial-gradient(closest-side, ${rgba(theme.accent, theme.dark ? 0.3 : 0.2)}, ${rgba(theme.accent, 0)})`, zIndex: 1 })}"></div>`;
  }
  let d = null;
  if (hasScreen) {
    const scale = proof.length ? (tab ? 0.46 : 0.64) : (tab ? 0.54 : 0.74);
    d = ctx.placeDevice({ width: W * opt('deviceScale', scale), cx: W * opt('deviceX', 0.5), top: heroTop + H * 0.012, z: 2 });
  }
  const behind = imgRef && d && hero.layer === 'back';
  if (behind) back += heroImage(ctx, { src: ctx.asset(imgRef), hero, d, heroTop, zoneBottom, zoneH, back: true });
  if (d) back += d.html;
  const fade = proof.length
    ? `linear-gradient(to bottom, #000 ${round(footTop - H * 0.08)}px, transparent ${round(footTop + H * 0.01)}px)` : '';
  if (back) html += `<div style="${style({ position: 'absolute', left: 0, top: 0, width: W, height: H, zIndex: 2, WebkitMaskImage: fade || undefined, maskImage: fade || undefined })}">${back}</div>`;

  if (d && shot.pop?.rect) {
    const pop = shot.pop;
    const sc = ctx.screens[pop.screen || 0] || ctx.screens[0];
    const [, ry, , rh] = pop.rect;
    const mw = W * (pop.w ?? (tab ? 0.68 : 0.86));
    const mag = ctx.c.magnifier({ src: sc.src, rect: pop.rect, w: mw, imgAspect: sc.aspect, shape: pop.shape || 'rounded' });
    // Lifted from where it sits on the device, kept inside the hero zone.
    const own = d.y + d.screen.y + (ry + rh / 2) * d.screen.h;
    const lo = heroTop + mag.height / 2 + H * 0.03, hi = Math.max(lo, zoneBottom - mag.height / 2 - H * 0.03);
    const cy = pop.y !== undefined ? pop.y * H : Math.min(Math.max(own, lo), hi);
    html += ctx.at((W - mw) / 2 + (pop.x ?? 0) * W, cy - mag.height / 2, mag.html, { w: mw, h: mag.height, rotate: pop.rotate ?? 0, z: 6 });
  }

  (shot.cards || []).slice(0, 2).forEach((c, i) => {
    const [side, fy] = POS[c.pos || ORDER[i]] || POS.tr;
    const cw = c.w ?? 42;
    const x = side === 'l' ? W * 0.035 : W - u * cw - W * 0.035;
    const card = ctx.c.statCard({ icon: c.icon, title: L(c.title), value: L(c.value), trend: L(c.trend), w: cw, size: c.size ?? 1 });
    html += ctx.at(x, heroTop + fy * zoneH, card, { rotate: c.rotate ?? (side === 'l' ? -3 : 3), z: 8 });
  });

  if (imgRef && !behind) html += heroImage(ctx, { src: ctx.asset(imgRef), hero, d, heroTop, zoneBottom, zoneH });

  // Stickers: small facts floating around the hero (a streak chip, "+330 ml", a big emoji prop), like a poster's props.
  const SPOTS = { tl: [0.06, 0.06], tr: [0.7, 0.1], ml: [0.03, 0.4], mr: [0.72, 0.44], bl: [0.05, 0.7], br: [0.68, 0.74] };
  (shot.stickers || []).slice(0, 4).forEach((st, i) => {
    const [fx, fy] = SPOTS[st.pos || ['tr', 'ml', 'br', 'tl'][i]] || SPOTS.tr;
    const x = st.x !== undefined ? st.x * W : fx * W, y = st.y !== undefined ? st.y * H : heroTop + fy * zoneH;
    html += ctx.at(x, y, sticker(ctx, st), { rotate: st.rotate ?? (i % 2 ? 5 : -5), z: 8 });
  });

  if (proof.length) {
    const n = proof.length;
    const size = n > 2 ? 0.7 : n === 2 ? 0.86 : 1;
    const sealSize = Math.min(n > 1 ? 0.72 : 0.85, (footH / (u * 30)) * 0.98);
    const items = proof.map((it) => {
      if (it.style === 'seal') return ctx.c.seal({ value: it.title, label: it.sub, size: sealSize });
      const lr = ctx.c.laurel({ title: it.title, sub: it.sub, size });
      return it.stars ? `<div style="${style({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u * 0.8 })}">${lr}${ctx.c.stars({ value: it.stars, size: 3.4 * size })}</div>` : lr;
    }).join('');
    html += `<div class="proof" style="${style({ position: 'absolute', left: 0, top: footTop, width: W, height: footH, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: u * (n > 2 ? 3 : 6), zIndex: 9, color: theme.text })}">${items}</div>`;
  }
  return html;
}

/** The cutout (or photo card) hero: in front of the device's lower corner, alone in the zone, or big behind it. */
function heroImage(ctx, { src, hero, d, heroTop, zoneBottom, zoneH, back = false }) {
  const { W, H, u, theme } = ctx;
  const shape = hero.shape || 'cutout';
  const w = W * (hero.w ?? (back ? 1.05 : d ? 0.56 : 0.96));
  const cx = W * (hero.x ?? (back ? 0.5 : d ? 0.72 : 0.5));
  const cy = hero.y !== undefined ? H * hero.y : back ? heroTop + zoneH * 0.34 : d ? zoneBottom - zoneH * 0.24 : heroTop + zoneH * 0.5;
  const rot = hero.rotate ? ` rotate(${hero.rotate}deg)` : '';
  const z = back ? 1 : d ? 7 : 3;
  if (shape === 'card') {
    // A photo that is not a cutout: cropped to a fixed aspect (4:5), rounded, white-bordered, lifted — and kept
    // above the proof row.
    const h = w * (hero.aspect ?? 1.25);
    const y = Math.min(cy - h / 2, zoneBottom - h - H * 0.02);
    return `<img class="hero-img" src="${esc(src)}" style="${style({ position: 'absolute', left: cx - w / 2, top: Math.max(heroTop, y), width: w, height: h, objectFit: 'cover', display: 'block', transform: rot.trim() || undefined, borderRadius: u * 4.5, border: `${round(Math.max(3, u * 1.1))}px solid #fff`, boxShadow: `0 ${round(u * 2.4)}px ${round(u * 6)}px rgba(0,0,0,.28)`, zIndex: z })}">`;
  }
  // A cutout of any shape fits a box (contain), so tall people and wide cars both land well.
  const h = zoneH * (hero.h ?? (back ? 0.85 : d ? 0.5 : 0.92));
  return `<img class="hero-img" src="${esc(src)}" style="${style({ position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, objectFit: 'contain', objectPosition: hero.anchor || 'center', display: 'block', transform: rot.trim() || undefined, filter: `drop-shadow(0 ${round(u * 2.2)}px ${round(u * 3.6)}px rgba(0,0,0,${theme.dark ? 0.5 : 0.24}))`, zIndex: z })}">`;
}

/** One floating sticker. */
function sticker(ctx, st) {
  const { u, theme, L } = ctx;
  const k = st.size ?? 1;
  const text = L(st.text);
  if (st.style === 'emoji' || !text) {
    const s = u * 15 * k;
    return `<div style="${style({ fontSize: s, lineHeight: 1, filter: `drop-shadow(0 ${round(u * 1.4)}px ${round(u * 2.4)}px rgba(0,0,0,.25))` })}">${esc(st.icon || '✨')}</div>`;
  }
  const fs = u * 4.2 * k;
  const look = st.style === 'accent' ? { background: theme.accent, color: theme.accentText || '#fff' }
    : st.style === 'dark' ? { background: '#16151A', color: '#fff' }
    : { background: '#fff', color: '#16151A' };
  return `<div style="${style({ display: 'inline-flex', alignItems: 'center', gap: fs * 0.4, whiteSpace: 'nowrap', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: fs, lineHeight: 1, letterSpacing: '-0.01em', padding: `${round(fs * 0.62)}px ${round(fs * 0.9)}px`, borderRadius: fs * 2, boxShadow: `0 ${round(u * 1.4)}px ${round(u * 3.6)}px rgba(0,0,0,.2)`, ...look })}">${st.icon ? `<span style="font-size:${round(fs * 1.15)}px">${esc(st.icon)}</span>` : ''}<span>${markup(text)}</span></div>`;
}

/** Rating first, then awards; at most three (two read better on a phone). */
function proofItems(ctx) {
  const { shot, L } = ctx;
  const out = [];
  if (shot.rating) {
    const v = L(shot.rating.value);
    const n = Number(String(v).replace(',', '.'));
    out.push({ title: v, sub: L(shot.rating.label), stars: shot.rating.stars !== false && n > 0 && n <= 5 ? n : 0, style: shot.rating.style });
  }
  for (const a of shot.awards || []) out.push({ title: L(a.title), sub: L(a.sub), style: a.style });
  return out.filter((x) => x.title).slice(0, isTablet(ctx) ? 3 : 2);
}
