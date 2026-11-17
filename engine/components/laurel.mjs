// Award laurel: wreath halves around a short line ("Editors' Choice", "4.8 rating").
// Only use for real, verifiable accolades.
import { style, markup } from '../lib/html.mjs';

function branch(flip, color) {
  const leaves = [];
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const a = -70 + t * 140;
    const r = 40;
    const cx = 50 + Math.cos(((a - 90) * Math.PI) / 180) * r * 0.2 - 22;
    const cy = 92 - t * 82;
    leaves.push(`<ellipse cx="${(cx + 20).toFixed(1)}" cy="${cy.toFixed(1)}" rx="5.2" ry="11" transform="rotate(${(-38 + t * 12).toFixed(1)} ${(cx + 20).toFixed(1)} ${cy.toFixed(1)})" fill="${color}"/>`);
    leaves.push(`<ellipse cx="${(cx + 33).toFixed(1)}" cy="${(cy + 4).toFixed(1)}" rx="4.6" ry="10" transform="rotate(${(40 - t * 10).toFixed(1)} ${(cx + 33).toFixed(1)} ${(cy + 4).toFixed(1)})" fill="${color}"/>`);
  }
  return `<svg viewBox="0 0 60 104" style="transform:${flip ? 'scaleX(-1)' : 'none'};display:block;height:100%"><path d="M30 100 C 18 70, 18 35, 32 4" stroke="${color}" stroke-width="2.4" fill="none" stroke-linecap="round"/>${leaves.join('')}</svg>`;
}

export function laurel({ title, sub, size = 1, color }, { theme, u }) {
  const c = color || theme.text;
  const h = u * 17 * size;
  return `<div class="laurel" style="${style({ display: 'inline-flex', alignItems: 'center', gap: u * 1.4 * size, height: h, color: c })}">`
    + `<div style="height:100%">${branch(false, c)}</div>`
    + `<div style="${style({ textAlign: 'center', fontFamily: 'var(--font-display)' })}">`
    + `<div style="${style({ fontWeight: 800, fontSize: u * 5.4 * size, lineHeight: 1, letterSpacing: '-0.02em' })}">${markup(title)}</div>`
    + (sub ? `<div style="${style({ fontFamily: 'var(--font-text)', fontWeight: 600, fontSize: u * 2.6 * size, opacity: 0.75, marginTop: u * 0.8, letterSpacing: '0.04em', textTransform: 'uppercase' })}">${markup(sub)}</div>` : '')
    + `</div>`
    + `<div style="height:100%">${branch(true, c)}</div></div>`;
}
