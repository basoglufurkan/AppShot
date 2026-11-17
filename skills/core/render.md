# Rendering

`engine/compose.mjs` turns the plan into one HTML page per (size, locale): every shot is a W×H slot laid side by side.
`engine/render.mjs` opens it in headless Chrome (DevTools protocol, no npm packages), waits for fonts and images,
fits every headline in-browser, measures text/device overlap and then captures each slot at exact pixel size.

- `render.mjs --draft` → 40 % size into `drafts/` (seconds); final → `out/<size>/<locale>/NN-<id>.png`.
- Reports: `review/draft-report.json` / `render-report.json` — per shot: headline font size, lines, fit, text rect,
  device rects, overlap, missing screens, broken images, fonts loaded. `score.mjs` and `check.mjs` read them.
- Output PNGs are RGB without alpha (stores reject transparency).
- `--only 1,3` renders some shots; `--sizes`/`--locales` narrow the matrix; `--variant <name>` renders a variant.
- Same input → same pixels: decor randomness is seeded by app name + shot id.

Performance: ~0.5–1 s per screenshot at full resolution; three Chrome pages work in parallel.
