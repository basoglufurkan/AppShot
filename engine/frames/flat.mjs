// No device: the screenshot as a rounded card. Clean, modern, works for any platform.
import { bare } from '../lib/device.mjs';

export const meta = { id: 'flat', kind: 'any', label: 'Flat rounded screen (no frame)', screenAspect: 1320 / 2868, finishes: [] };

export function render({ width, src, shadow, accent, screenAspect = meta.screenAspect, fit, position, radius }) {
  return bare({ width, src, screenAspect, shadow, accent, fit, position, radius: radius ?? 0.085 });
}
