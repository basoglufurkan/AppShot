// App preview video: one scene of the timeline (scripts/preview.mjs). Internal — never a screenshot layout.
// "store" (default): the app's footage full-bleed, exactly as the device plays it (Apple has rejected previews with
// device frames and with "framing around the video screen capture"), a camera layer the timeline moves, and the
// caption as a kinetic overlay on a soft scrim, top or bottom, dark or light against the footage.
// "framed": legacy look (caption above a rounded screen on the theme) — for promo videos only, not the App Store.
// "promo": social / YouTube / Play promo — the footage inside a CSS device that floats in 3D over the brand background
// (and the app's animated key-art scene), big kinetic caption beside or above it, scenes pushing in sideways.
// options.pv = { kind: clip|still|end|bg, style, at: top|bottom, tone: dark|light, bg, scene, tagline, disclaimer, cta }.
import { esc } from '../lib/html.mjs';

export const meta = {
  id: 'preview-frame', name: 'App preview · scene', internal: true, preview: true,
  summary: 'One scene of an App Store app preview: full-bleed footage with a camera layer and a kinetic caption, or the end frame.',
  bestFor: ['app preview video (internal)'], needs: { screens: 1 },
  options: { pv: 'set by scripts/preview.mjs: { kind, style, at, tone, bg, tagline, disclaimer }' },
};

/** Where the footage sits for the legacy framed look. */
export function footageBox(W, H, { style = 'store', aspect = 0.46, kind = 'phone' } = {}) {
  if (style !== 'framed') return { x: 0, y: 0, w: W, h: H, r: 0 };
  if (W > H) {
    const area = { x: W * 0.36, y: H * 0.07, w: W * 0.6, h: H * 0.86 };
    let w = area.w, h = w / aspect;
    if (h > area.h) { h = area.h; w = h * aspect; }
    return { x: area.x + (area.w - w) / 2, y: area.y + (area.h - h) / 2, w, h, r: Math.min(w, h) * 0.06 };
  }
  const top = H * (kind === 'tablet' ? 0.2 : 0.225);
  let h = H - top - H * (kind === 'tablet' ? 0.04 : 0.032), w = h * aspect;
  const maxW = W * (kind === 'tablet' ? 0.86 : 0.84);
  if (w > maxW) { w = maxW; h = w / aspect; }
  return { x: (W - w) / 2, y: top, w, h, r: w * (aspect < 0.62 ? 0.1 : 0.035) };
}

/** Caption box: under the status bar / Dynamic Island, or above the home indicator; left third on landscape. */
export function captionBox(W, H, { at = 'top', kind = 'phone', style = 'store' } = {}) {
  if (W > H) return { x: W * 0.05, y: H * 0.1, w: W * 0.34, h: H * 0.8 };
  if (style === 'framed') return { x: W * 0.07, y: H * (kind === 'tablet' ? 0.035 : 0.045), w: W * 0.86, h: H * (kind === 'tablet' ? 0.15 : 0.165) };
  const h = H * (kind === 'tablet' ? 0.15 : 0.165);
  return { x: W * 0.07, y: at === 'bottom' ? H * (kind === 'tablet' ? 0.81 : 0.79) - h * 0.15 : H * (kind === 'tablet' ? 0.045 : 0.068), w: W * 0.86, h };
}

const INK = { dark: { text: '#ffffff', sub: 'rgba(255,255,255,.78)', scrim: '0,0,0' }, light: { text: '#0d0d12', sub: 'rgba(13,13,18,.7)', scrim: '255,255,255' } };

export function render(ctx) {
  const { W, H, u, theme, opt } = ctx;
  const pv = opt('pv', {});
  const style = pv.style === 'framed' ? 'framed' : pv.style === 'promo' ? 'promo' : 'store';
  const px = (v) => v / u;
  const landscape = W > H;
  const ink = INK[pv.tone === 'light' ? 'light' : 'dark'];

  if (pv.kind === 'bg') return pv.scene ? ctx.scene(pv.scene, { hero: false, intensity: pv.intensity ?? 0.85 }) : '';
  if (pv.kind === 'end') return endFrame(ctx, pv, style, px, landscape);
  if (style === 'promo') return promoScene(ctx, pv, px);

  const sc = ctx.screens[0];
  const box = footageBox(W, H, { style, aspect: sc.aspect || 0.46, kind: ctx.kind });
  const framed = style === 'framed';
  const shadow = framed ? `box-shadow:0 ${H * 0.012}px ${H * 0.04}px rgba(0,0,0,${theme.dark ? 0.5 : 0.16});` : '';
  let html = `<div data-pv="footage" style="position:absolute;left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${box.h}px;border-radius:${box.r}px;overflow:hidden;background:#000;${shadow}z-index:3">`
    + `<div class="pv-cam" style="position:absolute;left:0;top:0;width:${box.w}px;height:${box.h}px;transform-origin:0 0"><img data-pv-img src="${esc(sc.src)}" style="width:100%;height:100%;object-fit:cover;object-position:top center;display:block"></div></div>`;
  if (!ctx.headline) return html;

  const at = landscape ? 'top' : pv.at === 'bottom' ? 'bottom' : 'top';
  const cb = captionBox(W, H, { at, kind: ctx.kind, style });
  if (!framed) {
    // Soft scrim behind the caption so it reads over any footage; it fades with the caption.
    const sh = H * (landscape ? 1 : 0.36);
    const dir = landscape ? 'to right' : at === 'bottom' ? 'to top' : 'to bottom';
    const pos = landscape ? `left:0;top:0;width:${W * 0.5}px;height:${H}px` : at === 'bottom' ? `left:0;bottom:0;width:${W}px;height:${sh}px` : `left:0;top:0;width:${W}px;height:${sh}px`;
    // iOS-style progressive blur: the app's own header under the caption softens instead of fighting the type.
    const mask = `linear-gradient(${dir},#000 0,#000 56%,transparent 100%)`;
    html += `<div data-pv="scrim" style="position:absolute;${pos};backdrop-filter:blur(${Math.round(W * 0.022)}px) saturate(1.15);-webkit-backdrop-filter:blur(${Math.round(W * 0.022)}px) saturate(1.15);-webkit-mask-image:${mask};mask-image:${mask};background:linear-gradient(${dir},rgba(${ink.scrim},.74),rgba(${ink.scrim},.6) 56%,rgba(${ink.scrim},0));z-index:5;opacity:0"></div>`;
  }
  html += `<div data-pv="caption" style="position:absolute;inset:0;z-index:6;${framed ? '' : `text-shadow:0 ${Math.round(H * 0.002)}px ${Math.round(H * 0.012)}px rgba(${ink.scrim},.35)`}">`;
  html += ctx.text({ ...cb, align: landscape ? (ctx.rtl ? 'right' : 'left') : 'center', valign: 'center', max: px(H * (landscape ? 0.075 : ctx.kind === 'tablet' ? 0.044 : 0.054)), min: px(H * (landscape ? 0.045 : 0.028)), lines: landscape ? 4 : 2, eyebrow: '', subhead: '', ...(framed ? {} : { color: ink.text }) });
  return html + '</div>';
}

/** Promo layout: caption above (portrait, square) or beside (landscape) a device that the timeline moves in 3D. */
export function promoLayout(W, H) {
  if (W > H * 1.3) return { cap: { x: W * 0.06, y: H * 0.14, w: W * 0.37, h: H * 0.72 }, align: 'left', dev: { cx: W * 0.71, top: H * 0.06, maxH: H * 0.88, maxW: W * 0.46 } };
  // Portrait: a big device that runs a little off the bottom edge (the classic promo framing), caption above.
  if (H > W * 1.3) return { cap: { x: W * 0.06, y: H * 0.055, w: W * 0.88, h: H * 0.165 }, align: 'center', dev: { cx: W / 2, top: H * 0.235, maxH: H * 0.84, maxW: W * 0.86 } };
  return { cap: { x: W * 0.08, y: H * 0.045, w: W * 0.84, h: H * 0.17 }, align: 'center', dev: { cx: W / 2, top: H * 0.235, maxH: H * 0.73, maxW: W * 0.72 } };
}

function promoScene(ctx, pv, px) {
  const { W, H, theme } = ctx;
  const L = promoLayout(W, H);
  const width = ctx.fitDevice({ maxW: L.dev.maxW, maxH: L.dev.maxH });
  const d = ctx.device({ width });
  const dev = d.html.replace('<img class="dv-img"', '<img class="dv-img" data-pv-img');
  const landscape = W > H * 1.3;
  let html = `<div data-pv="stage" style="position:absolute;inset:0;z-index:3">`;
  html += `<div data-pv="device" style="position:absolute;left:${L.dev.cx - d.width / 2}px;top:${L.dev.top}px;width:${d.width}px;height:${d.height}px;transform-origin:50% 62%">${dev}</div>`;
  if (ctx.headline) {
    html += `<div data-pv="caption" style="position:absolute;inset:0;z-index:6">${ctx.text({ ...L.cap, align: landscape ? (ctx.rtl ? 'right' : 'left') : 'center', valign: 'center', max: px(H * (landscape ? 0.09 : W === H ? 0.078 : 0.06)), min: px(H * (landscape ? 0.05 : 0.03)), lines: landscape ? 4 : 2, eyebrow: '', subhead: '', color: theme.text })}</div>`;
  }
  return html + '</div>';
}

/** Last seconds: the final scene blurred behind icon, name and the disclosure — or the legacy brand card. */
function endFrame(ctx, pv, style, px, landscape) {
  const { W, H, theme } = ctx;
  const ink = INK[pv.tone === 'light' ? 'light' : 'dark'];
  let html = '';
  if (style === 'store' && pv.bg) {
    html += `<div style="position:absolute;inset:0;overflow:hidden;background:#000;z-index:1"><img src="${esc(pv.bg)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;filter:blur(${Math.round(W * 0.035)}px) saturate(1.15) brightness(${pv.tone === 'light' ? 1.05 : 0.78});transform:scale(1.12)"></div>`
      + `<div style="position:absolute;inset:0;background:radial-gradient(120% 70% at 50% 42%,rgba(${ink.scrim},.08),rgba(${ink.scrim},.45));z-index:2"></div>`;
  }
  if (pv.endMode === 'disclosure') {
    if (pv.disclaimer) html += `<p data-pv="end" style="position:absolute;left:${W * 0.1}px;width:${W * 0.8}px;top:${H * 0.44}px;margin:0;text-align:center;font:600 ${Math.round(H * (landscape ? 0.04 : 0.022))}px var(--font-text);color:${ink.text};z-index:6">${esc(pv.disclaimer)}</p>`;
    return html;
  }
  const s = Math.min(W, H) * (landscape ? 0.3 : 0.25);
  const iy = H * (landscape ? 0.17 : 0.3);
  if (ctx.appIcon) html += `<div data-pv="end" data-end="icon" style="position:absolute;left:${(W - s) / 2}px;top:${iy}px;width:${s}px;height:${s}px;z-index:6"><img src="${esc(ctx.appIcon)}" style="width:100%;height:100%;border-radius:22.4%;display:block;box-shadow:0 ${s * 0.07}px ${s * 0.25}px rgba(0,0,0,.35)"></div>`;
  const ty = ctx.appIcon ? iy + s + H * 0.032 : H * 0.38;
  html += `<div data-pv="end" data-end="name" style="position:absolute;inset:0;z-index:6">${ctx.text({ x: W * 0.08, y: ty, w: W * 0.84, h: H * (landscape ? 0.36 : 0.2), align: 'center', valign: 'top', max: px(H * (landscape ? 0.085 : 0.048)), min: px(H * 0.028), lines: 2, eyebrow: '', headline: ctx.appName, subhead: pv.tagline || '', subRatio: 0.46, color: style !== 'store' ? undefined : ink.text, subColor: style !== 'store' ? undefined : ink.sub })}</div>`;
  if (pv.cta) html += `<p data-pv="end" data-end="cta" style="position:absolute;left:${W * 0.15}px;width:${W * 0.7}px;top:${ty + H * (landscape ? 0.3 : 0.17)}px;margin:0;text-align:center;font:700 ${Math.round(H * (landscape ? 0.04 : 0.022))}px var(--font-text);color:${theme.accentText || '#fff'};z-index:6"><span style="display:inline-block;padding:.55em 1.3em;border-radius:999px;background:${theme.accent}">${esc(pv.cta)}</span></p>`;
  if (pv.disclaimer) html += `<p data-pv="end" data-end="note" style="position:absolute;left:${W * 0.08}px;width:${W * 0.84}px;bottom:${H * 0.065}px;margin:0;text-align:center;font:500 ${Math.round(H * (landscape ? 0.032 : 0.0165))}px var(--font-text);color:${style !== 'store' ? theme.subtext : ink.sub};z-index:6">${esc(pv.disclaimer)}</p>`;
  return html;
}
