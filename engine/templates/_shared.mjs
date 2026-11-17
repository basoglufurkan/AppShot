// Geometry shared by templates. All values derive from the canvas so one template
// serves 6.9" iPhone, 13" iPad and Play phone/tablet canvases alike.

export const isTablet = (ctx) => ctx.kind === 'tablet';

export function pad(ctx) {
  return ctx.W * (isTablet(ctx) ? 0.09 : 0.075);
}

/** Standard caption band at the top of the canvas. Returns { html, box, bottom }. */
export function topText(ctx, o = {}) {
  const { W, H } = ctx;
  const p = o.pad ?? pad(ctx);
  const y = H * (o.top ?? (isTablet(ctx) ? 0.05 : 0.058));
  const h = H * (o.h ?? (isTablet(ctx) ? 0.2 : 0.225));
  const x = o.x ?? p;
  const w = o.w ?? W - p * 2;
  const box = { x, y, w, h };
  return { box, bottom: y + h, html: ctx.text({ ...box, align: o.align ?? ctx.opt('align', 'center'), valign: o.valign ?? 'center', max: o.max ?? ctx.opt('textSize', 10), min: o.min, lines: o.lines ?? 3, ...o.text }) };
}

/** Caption band at the bottom. */
export function bottomText(ctx, o = {}) {
  const { W, H } = ctx;
  const p = o.pad ?? pad(ctx);
  const h = H * (o.h ?? (isTablet(ctx) ? 0.2 : 0.225));
  const y = H * (o.bottom ?? 0.955) - h;
  const box = { x: p, y, w: W - p * 2, h };
  return { box, top: y, html: ctx.text({ ...box, align: o.align ?? ctx.opt('align', 'center'), valign: 'center', max: o.max ?? ctx.opt('textSize', 10), lines: o.lines ?? 3 }) };
}

/** Default device width for the canvas. */
export function deviceWidth(ctx, scale) {
  // options.deviceScale always wins over the template's default.
  const s = ctx.opt('deviceScale', scale ?? (isTablet(ctx) ? 0.74 : 0.8));
  return ctx.W * s;
}

/** Mirror an x position for RTL locales when the layout is asymmetric. */
export const mx = (ctx, x, w = 0) => (ctx.rtl ? ctx.W - x - w : x);
