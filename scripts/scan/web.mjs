// Web / PWA: manifest.json, <title>, theme-color, Next.js metadata.
import { safeJson } from './platform.mjs';

export function run(ctx) {
  const { files, read, rel, profile } = ctx;
  const app = profile.app;
  const mf = files.find((f) => /(^|\/)(manifest|site)\.(webmanifest|json)$/.test(rel(f)) && /public|static|app|src/.test(rel(f)));
  if (mf) {
    const m = safeJson(read(mf));
    if (m?.name || m?.short_name) {
      app.displayName ||= m.short_name || m.name;
      app.description ||= m.description;
      if (m.theme_color) (ctx.colorHints ||= []).push({ hex: m.theme_color, name: 'theme_color', source: rel(mf), weight: 6 });
      if (m.background_color) (ctx.colorHints ||= []).push({ hex: m.background_color, name: 'background_color', source: rel(mf), weight: 2 });
    }
  }
  const idx = files.find((f) => /(^|\/)index\.html$/.test(rel(f)) && !/node_modules|dist|build/.test(rel(f)));
  if (idx) {
    const h = read(idx);
    app.displayName ||= h.match(/<title>([^<]{2,60})<\/title>/)?.[1]?.trim();
    const tc = h.match(/name="theme-color" content="(#[0-9a-fA-F]{6})"/)?.[1];
    if (tc) (ctx.colorHints ||= []).push({ hex: tc, name: 'theme-color', source: rel(idx), weight: 5 });
  }
  const layout = files.find((f) => /app\/layout\.(t|j)sx?$/.test(rel(f)));
  if (layout) {
    const s = read(layout);
    app.displayName ||= s.match(/title:\s*["'`]([^"'`]{2,60})["'`]/)?.[1];
    app.description ||= s.match(/description:\s*["'`]([^"'`]{10,200})["'`]/)?.[1];
  }
  app.url ||= ctx.packageJson?.homepage;
}
