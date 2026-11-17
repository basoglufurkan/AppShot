// Shared card surface used by chips, stat cards, notifications, quotes.
import { style, round } from '../lib/html.mjs';

export function surface(theme, u, { radius = 3.2, pad = [2.2, 3], glass } = {}) {
  const c = theme.card || {};
  const isGlass = glass ?? c.glass;
  return {
    background: c.bg || (theme.dark ? 'rgba(255,255,255,0.1)' : '#FFFFFF'),
    color: c.text || theme.text,
    borderRadius: u * (c.radius ?? radius),
    padding: `${round(u * pad[0])}px ${round(u * pad[1])}px`,
    boxShadow: c.shadow || (theme.dark
      ? `0 ${round(u * 1.6)}px ${round(u * 4)}px rgba(0,0,0,0.35), inset 0 0 0 ${round(Math.max(1, u * 0.18))}px rgba(255,255,255,0.12)`
      : `0 ${round(u * 1.8)}px ${round(u * 5)}px rgba(20,20,40,0.14), 0 ${round(u * 0.3)}px ${round(u * 0.8)}px rgba(20,20,40,0.08)`),
    border: c.border,
    backdropFilter: isGlass ? `blur(${round(u * 3)}px) saturate(1.4)` : undefined,
    WebkitBackdropFilter: isGlass ? `blur(${round(u * 3)}px) saturate(1.4)` : undefined,
  };
}

export const css = style;
