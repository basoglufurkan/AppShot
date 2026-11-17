// HTML helpers shared by templates, frames, decor and components.

export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/**
 * Caption markup → HTML.
 *  **word**  → <span class="hl">word</span> (accent highlight)
 *  _word_    → <em> (secondary emphasis)
 *  \n        → line break
 *  {name}    → left as-is (unfilled placeholder — the checker flags it)
 */
export function markup(text) {
  let s = esc(text);
  s = s.replace(/\*\*(.+?)\*\*/g, '<span class="hl">$1</span>');
  s = s.replace(/(^|[\s(])_(.+?)_(?=[\s.,!?)]|$)/g, '$1<em>$2</em>');
  s = s.replace(/\\n|\n/g, '<br>');
  return s;
}

/** Strip markup for word counts, OCR keyword checks, etc. */
export const plain = (text) => String(text ?? '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\\n|\n/g, ' ').replace(/(^|\s)_(.+?)_/g, '$1$2').replace(/\s+/g, ' ').trim();

/** Inline style string from an object; numbers become px except unitless keys. */
const UNITLESS = new Set(['opacity', 'zIndex', 'fontWeight', 'lineHeight', 'flex', 'flexGrow', 'flexShrink', 'order', 'scale']);
export function style(obj) {
  // Output always lands inside style="…", so quotes and ampersands are attribute-escaped.
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => `${k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}:${typeof v === 'number' && !UNITLESS.has(k) ? `${round(v)}px` : v}`)
    .join(';')
    .replace(/&(?!(amp|quot|#39|lt|gt);)/g, '&amp;')
    .replace(/"/g, '&quot;');
}

/** CSS url() for a src (raw, unescaped — style() escapes it). */
export const cssUrl = (src) => `url("${String(src).replace(/"/g, '%22')}")`;

export const round = (n) => Math.round(n * 100) / 100;

/** Absolutely positioned box. */
export const abs = (x, y, w, h, extra = {}) => style({ position: 'absolute', left: x, top: y, width: w, height: h, ...extra });

/** Emoji or image icon. */
export function icon(v, size) {
  if (!v) return '';
  if (/^(https?:|file:|data:|\/)/.test(v) || /\.(png|jpe?g|svg|webp)$/i.test(v)) {
    return `<img src="${esc(v)}" style="${style({ width: size, height: size, objectFit: 'contain', borderRadius: size * 0.22 })}">`;
  }
  return `<span style="${style({ fontSize: size * 0.86, lineHeight: 1, display: 'inline-block' })}">${esc(v)}</span>`;
}
