# The method

How a senior ASO team would make the set, step by step, with the decisions that matter.
Commands are relative to `$SKILL_DIR`; run them from the app project root.

## 0 · Check the machine

`node scripts/doctor.mjs` — Node ≥ 22 and Chrome are required; Xcode/adb/Maestro only matter for automatic capture.
If Google Fonts are unreachable the render falls back to system fonts: say so, or add local fonts (`plan.fonts.local`).

## 1 · Scan

```bash
node scripts/workspace.mjs init
node scripts/scan.mjs .
```

The scanner reads, never writes, the project. `profile.json` holds: platform and stores, bundle/package ids, display
name, category, icon (copied to `raw/icon.png`) and its colours, brand palette, fonts, locales, screens ranked for
marketing, paywall and onboarding copy, permission texts, detected capabilities with evidence, existing store metadata
and old screenshots, and a niche ranking.

## 2 · Understand (do not skip)

The scanner is a starting point, not understanding. Spend real effort here — it is where great sets come from.

1. Open the top 5–8 marketing screens' source files. What does the user *do* there, what do they *get*?
2. Read the paywall and onboarding strings in `profile.strings.paywall/onboarding`: the team already wrote its value
   propositions there. Note the three they lead with.
3. Read `profile.app.permissions` texts — each one describes a real feature in user words.
4. Read the README and any existing store text (`profile.store`). If old screenshots exist, look at them: what will
   you keep, what is weak?
5. Name the one thing this app does that the category usually does not (the differentiator). It must be visible in a
   real screen, or it does not go in the screenshots.

Write these findings straight into `brief.md` (step 5).

## 3 · Niche

`node scripts/niche.mjs --explain`. Read `skills/niches/<chosen>.md` completely. If the runner-up is within ~25 %,
read it too and decide which searcher this app really serves (e.g. home-workout vs fitness-workout). Override with
`--set <id>`. The niche file gives you the searcher, what wins the install, a shot-by-shot story, headline banks in
English and Turkish, supporting elements, visual direction, keyword clusters and policy traps. Adapt it — never paste it.

## 4 · Ask (one round, ≤ 3 questions)

See `interview.md`. Typical: which languages/markets first; any real rating/award/number we may show; anything to
avoid showing. If the user already said it, do not ask. If they do not answer, use the defaults and say so.

## 5 · Brief

`node scripts/brief.mjs` scaffolds `brief.md` with the facts; you complete every TODO (`brief.md` guide).
The brief is the contract: positioning line, searcher and moment, the objection to kill, ranked benefits each with
the screen that proves it, honest proof, keywords, voice, visual direction.

## 6 · Keywords

`node scripts/keywords.mjs seed` lists candidates from the niche, features, screens and existing store text.
Pick 5–8 per locale by intent and relevance (`skills/aso/keywords.md`) and store them in `plan.keywords`.
The top 2–3 must appear *naturally* in shots 1–3 captions (`keywords.mjs coverage` checks).

## 7 · Real screens

`capture.md` has recipes per stack. Order of preference: the iOS Simulator tool in this app (tap through, screenshot) →
`capture/ios-sim.mjs` with deep links → Maestro flow (`capture/maestro.mjs`) → `capture/android.mjs` → `capture/web.mjs`
for web/PWA → the user's own PNGs via `capture/import.mjs`. Use demo data that looks lived-in (realistic names,
numbers, streaks), clean status bar (9:41, full battery), the right appearance (dark/light), and the app's UI language
per locale (`raw/{locale}/home.png`). Placeholders render as grey mock screens and are blocked at export.

## 8 · Structure

`node scripts/plan.mjs init` drafts order, layouts and screen mapping from the niche story. Then edit `plan.json` with
`story.md`: one idea per shot, shots 1–3 carry the three strongest benefits, rhythm varies (no two identical layouts in
a row), Android-only differences go into `storeOverrides` / `skipOn`. Fill layout fields (cards, bullets, zoom rect…)
from real UI values. `layouts.mjs info <id>` prints what each layout needs.

## 9 · Captions

For each shot write three candidates using different formulas (`skills/copy/formulas.md`), run the drills in
`rewrite-drills.md`, keep the winner in `headline` and the others in `alternatives` (they become A/B variants).
Shot 1: `hooks.md`. The set as a story: `sequence.md`. Then `node scripts/copy-check.mjs` and fix every error and warning.

## 10 · Design

Pick the theme from the niche suggestions, the app's own look and the competition (stand out in the category's search
results — if every competitor is white, a dark set wins attention). `themes.mjs board` renders shot 1 in every theme;
`layouts.mjs board` shows every layout with your screen. Brand colour as accent when it contrasts (`color.md`).
`node scripts/plan.mjs validate`.

## 11 · Draft → look → score → fix

```bash
node scripts/render.mjs --draft
node scripts/sheet.mjs --draft
node scripts/score.mjs --draft
```

Open `review/search-<locale>.png` and `review/contact-<size>-<locale>.png` with the Read tool. Critique with
`skills/review/critique.md` *before* reading the score. Fix the biggest problem first, re-render, look again.
Stop when every combination is ≥ 85, there are no errors, and the critique is clean.

## 12 · Find the best

```bash
node scripts/variants.mjs make --hooks --themes <alt1>,<alt2>
node scripts/variants.mjs tournament
node scripts/sheet.mjs --draft --variant <top>
```

The tournament renders every variant and ranks them on mechanics; you judge taste from the boards. Adopt the winner
(`variants.mjs adopt <name>`); keep up to two runners-up as Product Page Optimization treatments (`skills/aso/testing.md`).

## 13 · Localise

Read `skills/locales/<id>.md` first. `localize.mjs add` → `localize.mjs sheet <id>` (strings with length budgets) →
write native captions → `localize.mjs apply` → `copy-check --locale <id>` → draft render → look. Keep the highlight on
the word that carries the benefit in that language, not on the literal translation of the English word.

## 14 · Final + export

```bash
node scripts/render.mjs          # every size × locale at store resolution
node scripts/sheet.mjs
node scripts/check.mjs           # blocks wrong sizes, alpha, placeholders, policy errors
node scripts/export.mjs --zip    # fastlane deliver/supply folders + upload folders + README
node scripts/graphic.mjs         # Play feature graphic (and --type appstore-search etc.)
```

## 15 · Hand-off

In the user's language: the set in one line per shot and why this order; scores; what was not verified; paths;
suggested title / subtitle / keyword field (`keywords.mjs field --title … --subtitle …`, 100 bytes); how to upload
(`export/README.md`); the next test to run. Offer `node editor/server.mjs` for manual touch-ups.
