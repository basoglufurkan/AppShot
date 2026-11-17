// Colour maths: parsing, WCAG contrast, mixing, and brand-palette derivation.

export function parseColor(c) {
  if (Array.isArray(c)) return { r: c[0], g: c[1], b: c[2], a: c[3] ?? 1 };
  if (!c) return { r: 0, g: 0, b: 0, a: 1 };
  c = String(c).trim();
  let m = c.match(/^#([0-9a-f]{3,8})$/i);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map((x) => x + x).join('');
    return {
      r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    };
  }
  m = c.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}

export const toHex = ({ r, g, b }) => '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');

export function luminance(c) {
  const { r, g, b } = parseColor(c);
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function mix(a, b, t) {
  const A = parseColor(a), B = parseColor(b);
  return toHex({ r: A.r + (B.r - A.r) * t, g: A.g + (B.g - A.g) * t, b: A.b + (B.b - A.b) * t });
}

export function rgba(c, alpha) {
  const { r, g, b } = parseColor(c);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function toHsl(c) {
  let { r, g, b } = parseColor(c);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return { h, s, l };
}

export function fromHsl({ h, s, l }) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return toHex({ r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 });
}

export const shift = (c, { h = 0, s = 0, l = 0 } = {}) => {
  const x = toHsl(c);
  return fromHsl({ h: x.h + h, s: Math.max(0, Math.min(1, x.s + s)), l: Math.max(0, Math.min(1, x.l + l)) });
};

export const isDark = (c) => luminance(c) < 0.25;

/** Best readable text colour on a background. */
export const onColor = (bg, light = '#FFFFFF', dark = '#0B0B12') => (contrast(bg, light) >= contrast(bg, dark) ? light : dark);

/** Ensure fg reaches `min` contrast on bg by pushing lightness. */
export function ensureContrast(fg, bg, min = 4.5) {
  let c = fg;
  const dir = isDark(bg) ? 0.04 : -0.04;
  for (let i = 0; i < 24 && contrast(c, bg) < min; i++) c = shift(c, { l: dir });
  return c;
}

/** Derive a full theme palette from 1–3 brand colours. */
export function brandPalette({ primary, secondary, background, dark } = {}) {
  primary = primary || '#4F46E5';
  const hsl = toHsl(primary);
  const useDark = dark ?? hsl.l < 0.45;
  const bg = background || (useDark ? fromHsl({ h: hsl.h, s: Math.min(0.55, hsl.s), l: 0.1 }) : fromHsl({ h: hsl.h, s: Math.min(0.5, hsl.s), l: 0.96 }));
  const second = secondary || shift(primary, { h: 38, l: useDark ? 0.08 : -0.02 });
  const text = onColor(bg);
  return {
    dark: isDark(bg),
    bg,
    bg2: mix(bg, primary, isDark(bg) ? 0.35 : 0.18),
    primary,
    secondary: second,
    accent: ensureContrast(isDark(bg) ? shift(primary, { l: 0.12 }) : primary, bg, 3),
    text,
    subtext: rgba(text, 0.72),
  };
}
