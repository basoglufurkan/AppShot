# Modes

## full (default)
The whole method (`method.md`).

## copy
Captions and metadata without rendering: steps 1–6 and 9 of the method, then `keywords.mjs field`. Deliver a table per
locale: shot → headline → subhead → why. Offer to render.

## refresh
The plan exists and the UI changed: re-capture the screens the plan references (`capture/maestro.mjs` lists them),
draft render, compare with the previous `out/` (look at both contact sheets), final render, check, export.

## localize <codes>
`localize.mjs add <codes>` → for each: read `skills/locales/<id>.md`, `localize.mjs sheet <id>`, write, `apply`,
`copy-check --locale <id>`, capture localised UI if possible (`raw/{locale}/…`), draft render, look, final render.

## variants / ab
Generate 2–3 meaningful treatments — one variable each (hook, theme, opening layout) so a test result means something.
`variants.mjs make …` → `tournament` → look → adopt or keep as PPO treatments. Explain what each treatment tests.

## audit
Critique existing screenshots without making new ones:
1. Get them: `profile.store.existingScreenshots`, the user's files (`capture/import.mjs` into `raw/old-*`), or a
   public listing the user points to (view only).
2. Build a contact sheet: put them in a temporary plan with `layout: full-bleed`, empty headlines, `render --draft`,
   `sheet --draft` — or simply Read the images.
3. Score against `skills/review/critique.md` and `skills/aso/first-impression.md`: first-three test, caption length,
   benefit vs feature, legibility at thumbnail size, contrast, consistency, policy risks.
4. Deliver: a ranked list of the five changes with the biggest expected impact, then offer `full` mode.

## creative
App Store product page header (21:9) and search results (3:2) creative assets, plus the 16:9 universal PNG:
`creative.mjs --draft` → look at `review/creative-<locale>.png` (safe area + six moments of the loop) →
`creative.mjs --video` for finals. Layouts: `creative-split`, `creative-stage`, `creative-carousel`.
Rules and specs: `skills/aso/creative-assets.md`; motion: `skills/design/motion.md`.

## graphic
`graphic.mjs --type play-feature` (1024×500) for Google Play: same theme and screens, minimal text, no rankings,
prices, "free" or CTAs. App Store creative assets are made by `creative.mjs` (see above).

## editor
`node $SKILL_DIR/editor/server.mjs` → http://localhost:4848. The user edits; you keep working on the same
`plan.json` (the editor reloads on disk changes).
