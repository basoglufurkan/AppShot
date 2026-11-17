// Custom fonts bundled with the app (match the screenshots' type to the product when it is distinctive).
import path from 'node:path';

export function run(ctx) {
  const { files, read, rel, profile } = ctx;
  const bundled = files.filter((f) => /\.(ttf|otf)$/i.test(f) && !/node_modules|Pods/.test(f)).map((f) => ({ file: rel(f), family: path.basename(f).replace(/[-_](Regular|Bold|Medium|SemiBold|Black|Light|Heavy|ExtraBold|Thin|Italic|VariableFont.*)?\.(ttf|otf)$/i, '') }));
  const used = new Map();
  for (const f of files.filter((f) => /\.(swift|kt|dart|tsx?|jsx?|css)$/.test(f)).slice(0, 2500)) {
    const s = read(f);
    for (const m of s.matchAll(/(?:\.custom\(|fontFamily\s*[:=]\s*|font-family:\s*|FontFamily\()["'`]?([A-Z][\w -]{2,30})/g)) {
      const fam = m[1].trim().replace(/["'`].*$/, '');
      if (!/^(System|Roboto|Helvetica|Arial|sans-serif|serif|monospace|inherit|var)$/i.test(fam)) used.set(fam, (used.get(fam) || 0) + 1);
    }
  }
  profile.fonts = {
    bundled: [...new Map(bundled.map((b) => [b.family, b])).values()].slice(0, 10),
    used: [...used.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([family, count]) => ({ family, count })),
  };
}
