// README / docs: the human description of the product, stripped of badges and code.
export function run(ctx) {
  const { files, read, rel, profile } = ctx;
  const f = files.filter((x) => /^readme(\.[a-z]{2})?\.md$/i.test(rel(x).split('/').pop()) && rel(x).split('/').length <= 2)
    .sort((a, b) => rel(a).length - rel(b).length)[0];
  if (!f) return;
  let s = read(f)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/<img[^>]*>/g, '')
    .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, '')
    .replace(/\n{3,}/g, '\n\n');
  const headings = [...s.matchAll(/^#{1,3}\s+(.+)$/gm)].map((m) => m[1].trim()).slice(0, 30);
  const bullets = [...s.matchAll(/^\s*[-*]\s+(.{6,140})$/gm)].map((m) => m[1].replace(/\*\*/g, '').trim()).slice(0, 40);
  profile.readme = { file: rel(f), excerpt: s.trim().slice(0, 2500), headings, bullets };
}
