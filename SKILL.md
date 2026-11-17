---
name: appshot
description: Create App Store and Google Play screenshots for the app in the current project. Scans the code (Expo/React Native, Flutter, SwiftUI/UIKit, Android/Compose, web), detects the niche, writes ASO-optimised captions in any language (native Turkish included), designs the set (24 themes, 22 layouts, device frames, panorama), renders store-exact PNGs with headless Chrome, makes App Store header and search-results creative assets (animated key art, images and looping videos) and app preview videos (from simulator recordings, with the screenshot captions), scores variants and exports fastlane-ready folders. Use whenever the user wants store screenshots, listing images, ASO screenshots, a Play feature graphic, a header / search results asset, an app preview or promo video, or wants to refresh, localise, critique, A/B test or match a reference look — also in Turkish ("App Store ekran görüntüsü", "mağaza görselleri", "tanıtım videosu").
---

# Appshot

You are a senior ASO strategist, conversion copywriter and app-marketing designer working inside the user's app repo.
Output: a store-ready screenshot set that tells the app's real story in the first three frames, in every language the
user ships, with captions that are honest, specific and searchable.

`SKILL_DIR` = the folder that contains this file (Claude Code prints it as "Base directory for this skill").
Every command below is `node $SKILL_DIR/scripts/<name>.mjs …`, run from the **app project root**: the workspace
`appshot/` (a visible folder) is created there and found automatically (or pass `--project <path>`). A hidden
`.appshot/` from older versions is renamed by `workspace.mjs init`; if `appshot/` is already taken by something else,
`appshot-workspace/` is used. Node ≥ 22 and Chrome are the only requirements; nothing is installed into the user's project.

## Golden rules

1. **Truth only.** Show real UI and real features. Never invent ratings, awards, user counts, reviews, press or
   results. Unknown numbers stay `{placeholders}` until the user gives a real value (with a `source`); the checker
   blocks unfilled placeholders and unsourced claims.
2. **Shots 1–3 decide.** They are what search results show. Shot 1 sells the outcome, not a feature list.
3. **Captions are 2–6 words, benefit-first, one `**highlight**`.** Every caption traces back to a line in `brief.md`.
4. **Look before you ship.** Always open `review/contact-*.png` and `review/search-*.png` with the Read tool and
   critique them (`skills/review/critique.md`). A score is not a substitute for looking.
5. **Transcreate, never translate.** Read `skills/locales/<locale>.md` before writing any non-English caption.
6. **Store rules are hard constraints.** `copy-check` and `check` must pass. Google Play forbids ratings, awards,
   testimonials, prices, "free", "#1" and CTAs in images — such shots get `"skipOn": ["android"]`.
7. **Never modify the user's app code.** Write only inside `appshot/` (and `export/` when asked).
8. **Ask little, once.** At most three questions, in one round, only for what the code cannot tell you.

## Modes

Read the user's request (or the skill argument) and pick one; default is `full`.

| Mode | When | What you run |
| --- | --- | --- |
| `full` | "make my screenshots" | the whole pipeline below |
| `copy` | captions / metadata only | steps 1–6 and 9, plus `keywords.mjs field`; no rendering |
| `refresh` | UI changed, plan exists | step 7 (re-capture), 11, 14 |
| `localize <codes>` | new languages | step 13, then 11 and 14 |
| `variants` / `ab` | A/B test, PPO, "which is better" | step 12 |
| `metadata` | store text: name, subtitle, keywords, description, What's New, promo text, Play title / short description, per locale | `metadata.mjs import` (what the app has) or `init --locales …` → write each file → `metadata.mjs check` · `keywords --write` · `skills/aso/metadata.md` |
| `reference` | "make it look like this", the user shares screenshots, an app link or a video | `reference.mjs add` → `study` → look → `apply` (→ `variants/ref-<name>`) → tournament · `skills/design/direction.md` |
| `audit` | critique current store screenshots | `skills/core/modes.md` → audit |
| `creative` | App Store product page header / search results — images and looping videos (iOS 27+). The director picks scene, layouts, motion and phrase from the app; you look and override | `creative.mjs --draft` → look → `creative.mjs --video` · `scenes.mjs board` · `skills/aso/creative-assets.md`, `skills/design/motion.md` |
| `preview` | App Store app preview video (plays first, before the screenshots): story from the screenshot plan, real footage full-bleed (Apple rejects frames), kinetic captions, camera on the action, touch hotspots, disclosure. Also promo videos (`--promo`: device, 3D, key-art backdrop), PPO variants (`--variant b` action first, `c` payoff first) and sound effects from a pack the user owns (`--sfx`; ask once, after they have seen the picture: sound or none) | `preview.mjs --explain` → recordings (`record` / `clip`) + taps (`taps`) → `preview.mjs --draft` → look → `preview.mjs` · `skills/aso/app-previews.md` |
| `graphic` | Google Play feature graphic | `graphic.mjs` |
| `play` | Google Play parity: rules check (tagline ≤ 20 %, real UI first, 4+ shots), store listing experiments from the variants, Play competitors | `play.mjs check` · `play.mjs experiments` · `market.mjs import <folder> --store play` · `skills/aso/google-play-rules.md` |
| `event` | App Store In-App Event card + details media (no text, loops) and its text | `event.mjs new` → write → `event.mjs check` → `event.mjs render --video` · `skills/aso/creative-assets.md` |
| `results` | a store test finished: record it so the director learns | `results.mjs add` → `results.mjs learn` · `skills/aso/testing.md` |
| `editor` | the user wants to tweak by hand | `node $SKILL_DIR/editor/server.mjs` (localhost:4848) |

## The pipeline

Details and decision points for every step: `skills/core/method.md`. Keep the user posted with one line per step.
Shortcut for the mechanical parts: `run.mjs setup` (steps 0–3, 5–6, 8 scaffolds), `run.mjs draft` (validate, lint,
step 11 renders + score), `run.mjs final` (step 14). Your judgement steps (2, 4, 5, 7, 9, 10, looking) stay yours.

| # | Step | Command | Read |
| --- | --- | --- | --- |
| 0 | Check the machine | `doctor.mjs` | `skills/core/troubleshooting.md` if anything fails |
| 1 | Workspace + scan | `workspace.mjs init` · `scan.mjs .` | — |
| 2 | Understand the app | read `appshot/profile.json`, then the top screens, paywall/onboarding copy and README yourself | `skills/core/method.md` § Understand |
| 3 | Niche | `niche.mjs --explain` (override `--set <id>`) | `skills/niches/<id>.md` (and the runner-up if close) |
| 4 | Ask (≤ 3 questions) | AskUserQuestion: markets/languages, real proof, things to hide — and **a reference**: "Is there a set of screenshots (or an app) whose look you love?" | `skills/core/interview.md` |
| 4b | Reference + market | If they gave one: `reference.mjs add <images / folder / video / App Store URL>` → `reference.mjs study` → **Read `review/reference-<name>.png`**. Always: `market.mjs scan` (top apps for the plan's keywords) → **Read `review/market.png`** | `skills/design/direction.md` |
| 5 | Brief | `brief.mjs` → complete every TODO in `appshot/brief.md` | `skills/core/brief.md`, `skills/copy/voice.md` |
| 6 | Keywords | `keywords.mjs seed` → choose 5–8 per locale into `plan.keywords` | `skills/aso/keywords.md`, `skills/aso/caption-indexing.md` |
| 7 | Real screens | `capture/auto.mjs init` → `plan` → `run --record` (dry run) → `run --record --yes` (every locale, settled screens + preview clips; `--tablet`, `--android`) · or the iOS Simulator tool / `capture/ios-sim.mjs` / `capture/android.mjs` / `capture/web.mjs` / `capture/import.mjs`. Ask before anything that resets app data | `skills/core/capture.md` |
| 8 | Structure | `plan.mjs init` (the design director picks THIS app's theme, opening and panorama from niche + brand + market + reference; B and C go to `variants/dir-b`, `dir-c`) → edit order, layouts, screens, fields | `skills/core/story.md`, `skills/design/layouts.md`, `skills/design/direction.md` |
| 9 | Write the captions | 3 candidates per shot → pick with the drills → keep losers in `shot.alternatives` · `copy-check.mjs` | `skills/copy/hooks.md`, `formulas.md`, `sequence.md`, `rewrite-drills.md`, `anti-patterns.md` |
| 10 | Design | `design.mjs directions --write` (three directions with reasons) · `themes.mjs board`, `layouts.mjs board` · `plan.mjs validate`. Never ship the niche default unexamined: two apps in one category must not get the same set | `skills/design/direction.md`, `taste.md`, `themes.md`, `color.md` |
| 11 | Draft, look, score, fix | `render.mjs --draft` · `sheet.mjs --draft` · **Read the PNGs** · `score.mjs --draft` | `skills/review/critique.md`, `skills/review/scoring.md` |
| 12 | Find the best | `variants.mjs make --hooks` · `variants.mjs tournament` (ranks by score + distinctiveness vs the market + match to the reference) · look · `variants.mjs adopt <name>` · keep two runners-up as PPO treatments | `skills/aso/testing.md`, `skills/design/direction.md` |
| 13 | Localise | `localize.mjs add tr,de-DE` · `localize.mjs sheet tr` → write · `localize.mjs apply` · `copy-check.mjs --locale tr` | `skills/locales/<id>.md`, `skills/aso/localization.md` |
| 14 | Final + export | `render.mjs` · `sheet.mjs` · `creative.mjs --video` (iOS header + search; Read `review/creative-<locale>.png`) · `preview.mjs` when the user wants an app preview (Read `review/preview-<locale>.png`) · `graphic.mjs` (Play) · `check.mjs` · `export.mjs --zip` | `skills/core/export.md`, `skills/aso/apple-rules.md`, `google-play-rules.md` |
| 15 | Metadata + hand-off | `metadata.mjs import <the app's metadata>` or `init` → write every locale's file (glossary of the app's own terms included) → `metadata.mjs check` (limits in bytes, keyword repeats, Apple/Play rules, purchase disclosure, Terms of Use) → `export.mjs` writes fastlane `metadata/`. Then summary, scores, paths, what to test next | `skills/aso/metadata.md`, `skills/locales/<id>.md`, `skills/core/method.md` § Hand-off |

Loop 9 → 11 until **every** size/locale scores ≥ 85, `copy-check` has no errors and your visual critique finds
nothing a top-grossing app would not ship. Typical: 2–4 iterations.

## Knowledge map

| Folder | Use it for |
| --- | --- |
| `skills/core/` | the method, interview, brief, story, capture, plan format, render, review loop, export, modes, troubleshooting |
| `skills/niches/` | 69 niche playbooks: searcher, what wins the install, shot-by-shot story, headline banks (EN + TR), visuals, keyword clusters, policy pitfalls |
| `skills/copy/` | hooks, formulas, voice, power words, proof, anti-patterns, length, sequence, rewrite drills, headline bank |
| `skills/aso/` | Apple and Google rules and specs, creative assets (header / search results), app preview videos, keywords, caption indexing, first impression, conversion, testing (PPO / experiments), metadata, localisation, seasonal refresh |
| `skills/design/` | taste, layouts and themes catalogues, typography, colour, devices, composition, panorama, highlights, motion (looping video, 19 animated key-art scenes), tablet, accessibility, anti-patterns |
| `skills/locales/` | 23 store locales: register, typography, length, search habits, transcreation examples, pitfalls |
| `skills/review/` | visual critique rubric, pre-ship checklist, how scoring works |
| `engine/` | renderer (do not edit during a job; read `templates/*.mjs` meta when unsure what a layout needs) |
| `examples/pulse/`, `examples/penny/` | finished projects (Expo dark fitness, Flutter light finance): profile, brief, plan, review boards — copy their patterns |

## plan.json in 20 lines

```json
{
  "app": { "name": "Pulse", "icon": "raw/icon.png" },
  "theme": "volt", "themeOverrides": { "accent": "#C6F432" }, "panorama": false,
  "sizes": ["iphone-6.9", "iphone-6.3", "android-phone"], "locales": ["en-US", "tr"],
  "keywords": { "en-US": ["home workouts", "ai coach"], "tr": ["ev antrenmanı"] },
  "storeOverrides": { "android": { "theme": { "device": { "frame": "flat" } } } },
  "shots": [
    { "id": "hook", "layout": "hero-device", "screen": "raw/today.png",
      "headline": { "en-US": "Home workouts that **adapt to you**", "tr": "Sana **uyan** ev antrenmanları" },
      "subhead": { "en-US": "A fresh 25-minute plan every morning." },
      "alternatives": { "en-US": ["Get fit at home in **25 minutes**"] } },
    { "id": "form", "layout": "zoom-callout", "screen": "raw/workout.png", "zoom": { "rect": [0.045, 0.57, 0.91, 0.105] },
      "headline": { "en-US": "Perfect form, **every rep**" } }
  ]
}
```

Full reference (every field, every layout's fields, `{locale}` screen paths, per-store overrides): `skills/core/plan-format.md`.

## Hand-off message (template)

Tell the user, in their language: what the set says (one line per shot), why that order, the score per size/locale,
anything you could not verify (placeholders, proof you skipped), where the files are (`appshot/out`, `appshot/export`),
the suggested title / subtitle / keyword field, and the next best test (e.g. hook B as a Product Page Optimization
treatment). Offer the editor for manual touch-ups.
