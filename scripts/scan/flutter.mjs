// Flutter: pubspec (name, description, deps), launcher icons, l10n.
import path from 'node:path';

export function run(ctx) {
  const { files, read, rel, profile } = ctx;
  const f = files.find((x) => rel(x) === 'pubspec.yaml');
  if (!f) return;
  const y = read(f);
  const app = profile.app;
  const val = (k) => y.match(new RegExp(`^${k}:\\s*["']?([^\\n"']+)`, 'm'))?.[1]?.trim();
  app.npmName ||= val('name');
  app.description ||= val('description');
  app.version ||= val('version')?.split('+')[0];
  const depBlock = y.match(/^dependencies:\s*\n([\s\S]*?)(?=^\S)/m)?.[1] || '';
  ctx.dependencyNames = [...(ctx.dependencyNames || []), ...[...depBlock.matchAll(/^\s{2}([a-z0-9_]+):/gm)].map((m) => m[1])];
  const icon = y.match(/image_path:\s*["']?([^\s"']+)/)?.[1];
  if (icon) ctx.iconHints = [...(ctx.iconHints || []), path.resolve(ctx.root, icon)];
  if (!app.displayName && app.npmName) app.displayName = app.npmName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
