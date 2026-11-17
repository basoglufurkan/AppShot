# Working on Appshot itself

This folder **is** the Appshot skill (entry point: `SKILL.md`). When the user opens it in Claude Code they either
want to develop the skill, or to use it on an app — in that case ask for the app's path and follow `SKILL.md`,
running the scripts with `--project <app path>`.

## Layout

| Path | What |
| --- | --- |
| `SKILL.md`, `AGENTS.md` | agent entry points (skill / other agents) |
| `skills/` | knowledge the agent reads during a job (Markdown; niche frontmatter is parsed by `scripts/niche.mjs`) |
| `engine/` | renderer: `compose.mjs` (plan → HTML strip), `render.mjs` (Chrome → PNG), `templates/` (layouts), `frames/` (devices), `themes/`, `decor/`, `components/`, `lib/` (CDP driver, PNG codec, colour, copy rules) |
| `scripts/` | CLI steps of the pipeline; `scan/` detectors, `capture/` simulator/emulator/web capture |
| `editor/` | local editor (`node editor/server.mjs --project <app>`) |
| `examples/pulse/`, `examples/penny/` | demo projects (Expo, Flutter) + finished `appshot/` used as regression fixtures |

## Conventions

- Zero dependencies: Node ≥ 22 built-ins only (global `WebSocket` for the DevTools protocol, `zlib` for PNG).
- ES modules, 2-space indent, single quotes, small focused files with a header comment explaining the file's job.
- A new layout = `engine/templates/<id>.mjs` exporting `meta` (id, name, summary, bestFor, needs, options, hook?) and
  `render(ctx)`; add it to the registries in `skills/niches/_template.md`, `engine/lib/niches.mjs` (LAYOUTS) and
  `skills/design/layouts.md`.
- A new theme = `engine/themes/<id>.json`; add it to `skills/niches/_template.md` and `skills/design/themes.md`.
- A new scene (animated key art for creative assets) = `engine/scenes/<id>.mjs` exporting `meta` (id, name, mood,
  poster, summary, niches, keywords, variants?) and `render(ctx, { hero, intensity, variant, box })`, built with
  `engine/scenes/_kit.mjs`; list it in `skills/design/motion.md`. Hero inside `ctx.safe` (iPhone crops the header),
  ambience over the full width, every motion periodic (integer `cycles`). `hero: false` = backdrop for other layouts.
- The screenshot design director lives in `engine/lib/designer.mjs` (niche + brand + market + reference + seed → three
  directions), with `engine/lib/visual.mjs` (pixel traits of any screenshot), `scripts/reference.mjs`, `scripts/market.mjs`
  (iTunes Search API) and `scripts/design.mjs`. References give style only, never another app's identity (Apple 4.1).
- The creative director lives in `engine/lib/director.mjs` (niche → scene, placement → layout, motion, phrase).
- App previews: `engine/preview.mjs` (storyboard from the plan, timing, page script with springs / kinetic type /
  camera, motion-blurred Chrome → ffmpeg render at Apple's H.264/AAC limits), `engine/lib/footage.mjs` (clip analysis:
  activity, focus cluster, liveliest window, camera path, caption side), scene template
  `engine/templates/preview-frame.mjs` (`meta.internal` — hidden from layout lists), sizes in `engine/sizes.json` →
  `previews` and `limits.preview`. Store mode stays full-bleed: Apple rejects frames around the capture. Promo mode
  (`--promo`, out/promo) adds device frames, 3D float, key-art backdrop and push transitions; `engine/lib/beats.mjs`
  snaps cuts to music; `--variant b` renders the action-first PPO treatment, `--variant c` the payoff-first one. Motion laws (measured
  entrance/exit/blur curves) live in the page script; `engine/lib/sfx.mjs` places sounds from a user-owned pack (never
  ship or copy a pack); `engine/lib/motionqa.mjs` checks finished videos (dead holds, bare frames, frame 0).
- Store text: `engine/lib/metadata.mjs` (Markdown per locale in `appshot/metadata/`, checks, fastlane export),
  `engine/lib/glossary.mjs` (the app's own translations), `scripts/metadata.mjs`. Limits in `engine/sizes.json` →
  `limits.metadata`.
- Store specs live only in `engine/sizes.json` and `engine/locales.json`.

- Capture: `scripts/capture/auto.mjs` (per-locale launch arguments, deep links, settled screenshots, preview clips).
  Learning: `engine/lib/learning.mjs` + `scripts/results.mjs` (~/.appshot/learning.json, read by the director).
  Play: `scripts/play.mjs`. In-App Events: `scripts/event.mjs` (sizes `event-card` / `event-details`, `limits.event`).
  Caption OCR: `engine/native/ocr.swift` (macOS Vision, compiled once) via `engine/lib/ocr.mjs`. Audio QA: `audioQA` in
  `engine/lib/motionqa.mjs`. Editor Directions tab: `/api/design*` in `editor/server.mjs`.
- Tests: `tests/*.test.mjs` (node:test, zero dependencies). Add a test with every fix of a real-world bug.

## Regression check after engine changes

```bash
npm test                     # unit tests (tests/*.test.mjs)
npm run regress              # everything below in one command, plus golden-image comparison (tests/golden/)
npm run regress:quick        # unit tests + example renders + scores + golden images
```

The steps it runs, one by one:

```bash
node scripts/doctor.mjs --render
node scripts/scan.mjs examples/pulse --quiet
node scripts/render.mjs --project examples/pulse --draft
node scripts/sheet.mjs --project examples/pulse --draft      # then look at examples/pulse/appshot/review/
node scripts/score.mjs --project examples/pulse --draft      # should stay ≥ 95
node scripts/layouts.mjs board --project examples/pulse      # every layout renders
node scripts/creative.mjs --project examples/pulse --draft --video   # director + header/search/universal + looping videos
node scripts/scenes.mjs board --project examples/penny               # every scene renders (light theme)
node scripts/preview.mjs --project examples/pulse --draft --locales en-US   # app preview: storyboard board + draft video
node scripts/preview.mjs --project examples/pulse --promo --draft --locales en-US --sizes promo-vertical   # promo: device, 3D, push
node scripts/scan.mjs examples/penny --quiet && node scripts/render.mjs --project examples/penny --draft && node scripts/score.mjs --project examples/penny --draft
```
