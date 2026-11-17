// Magnified crop of the screenshot (zoom-callout, ui-pieces).
// rect = [x, y, w, h] as fractions of the screenshot image.
import { style, cssUrl } from '../lib/html.mjs';

export function magnifier({ src, rect = [0.1, 0.3, 0.8, 0.2], w, shape = 'rounded', border, imgAspect }, { theme, u }) {
  const [rx, ry, rw, rh] = rect;
  // rh is a fraction of image height; convert to box height using the image aspect (w/h).
  const aspect = imgAspect || 1320 / 2868;
  const boxW = w;
  const boxH = shape === 'circle' ? w : (w * (rh / rw)) / aspect;
  const bgW = boxW / rw;
  const bgH = bgW / aspect;
  const radius = shape === 'circle' ? '50%' : `${u * 3.6}px`;
  const b = border ?? `${Math.max(2, u * 0.7)}px solid ${theme.dark ? 'rgba(255,255,255,0.9)' : '#fff'}`;
  const offX = -rx * bgW - (shape === 'circle' ? (bgW * rw - boxW) / 2 : 0);
  const offY = -ry * bgH - (shape === 'circle' ? (bgH * rh - boxH) / 2 : 0);
  return {
    width: boxW, height: boxH,
    html: `<div class="magnifier" style="${style({
      width: boxW, height: boxH, borderRadius: radius, border: b, overflow: 'hidden',
      backgroundImage: cssUrl(src), backgroundSize: `${bgW}px ${bgH}px`, backgroundPosition: `${offX}px ${offY}px`, backgroundRepeat: 'no-repeat',
      boxShadow: `0 ${u * 3}px ${u * 8}px rgba(0,0,0,0.32)`, backgroundColor: '#000',
    })}"></div>`,
  };
}
