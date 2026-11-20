# Direction — references, the market and three directions per app

A set that looks like the nine around it in search results disappears; a set nobody in the category would make is
not understood. The design director (`engine/lib/designer.mjs`) aims between the two, **for this app**: it weighs the
niche playbook, the app's own brand and UI, the market scan, the user's reference and a per-app seed, and returns
three directions. Never ship the niche's first theme and `hero-device` opening unexamined — that is how two apps in one
category end up with the same screenshots.

## 1. Ask for a reference

In the interview (step 4) ask once: "Is there a set of screenshots, or an app, whose look you love?" Anything works:

```bash
node scripts/reference.mjs add ~/Desktop/liked/*.png --name calm-light   # images or a folder
node scripts/reference.mjs add "https://apps.apple.com/us/app/<app-name>/id<number>"   # an App Store link (its screenshots)
node scripts/reference.mjs add ~/Movies/ad.mp4                            # a video: six stills of its look
node scripts/reference.mjs study calm-light                               # traits + review/reference-calm-light.png
```

**Read the board.** `study` measures what pixels can say: tone (light / dark), background (flat / gradient / photo)
and its colour, accent family, how much of the canvas the UI fills (device size, full-bleed), device count, caption
side and size, panorama. Then **look** for what pixels cannot say — typeface character (serif, rounded, condensed),
highlight style (colour, pill, marker, underline), decoration, mood — and set those in the plan by hand (`theme`,
`themeOverrides.highlight`, `fontDisplay`).

```bash
node scripts/reference.mjs apply calm-light            # → variants/ref-calm-light.json (compare in the tournament)
node scripts/reference.mjs apply calm-light --adopt    # → straight into plan.json (previous kept)
```

`apply` keeps captions, screens and story; it changes theme, colours (the reference's background when it is one flat
colour, its accent when there is no brand colour), the opening layout and panorama.

**Take the style, never the identity.** Logos, mascots, illustrations, characters, wording, a signature layout trick —
anything that makes a viewer think of the other app — stays out (Apple 4.1 "Copycats", Play impersonation policy). A
competitor's set as a reference means "this tone and structure", not "this design".

## 2. Scan the market

```bash
node scripts/market.mjs scan                          # terms from plan.keywords; country from the default locale
node scripts/market.mjs scan --terms "focus timer,pomodoro" --country tr --limit 15
```

Apple's public iTunes Search API (no key, nothing about the user sent) returns the top apps for each search; the first
three iPhone screenshots of each are measured. **Read `review/market.png`**: every competitor's first three shots — what
a searcher sees around this app — and the summary: share of dark sets, full-bleed, several devices, panoramas, caption
side, background kinds, the accent hue the market owns. `market.json` feeds the director and the tournament.

## 3. Three directions

```bash
node scripts/design.mjs directions --write   # A, B, C with reasons → variants/dir-a.json, dir-b.json, dir-c.json
node scripts/design.mjs explain              # every theme and opening, scored, with reasons
node scripts/variants.mjs tournament         # render + score all, with distinctiveness and reference match
node scripts/design.mjs apply b              # or variants.mjs adopt dir-b
```

`plan.mjs init` already runs the director (A into the plan, B and C as variants) unless `--theme` or `--no-director`.

| Direction | What it is |
| --- | --- |
| **A** | the best theme and opening for this app (reference first when there is one) |
| **B** | the best theme of the **other tone** (light ↔ dark) with another opening — the real alternative |
| **C** | a bolder one: an opening neither A nor B uses (big number, typographic, tilted, full-bleed, two devices, cards), often a panorama |

What moves a theme: niche rank; light/dark like the app's UI; accent close to the brand colour; the market (a tone 60 %+
of competitors use costs, a tone few use earns, an accent hue the market owns costs); the reference (tone, background
kind, accent family); a small per-app seed. Openings: niche rank; what the plan can render (screens, `stat.value`,
`cards`); the market (a full-bleed or one-device market makes the other choice distinct); the reference (full-bleed,
several devices, caption side). The **billboard** opening (shot 1 as a scroll-stopper: the promise as the biggest
type, the money moment lifted out, real proof) inherits the niche's rank for the hero screen and gets a bonus for
stopping the scroll, so it is direction A for most niches, while niches that open full-bleed or typographic (photo,
video, games, recipes, travel, therapy) keep their opener. B then tests the classic device opener against it.

## 4. Pick with numbers and eyes

The tournament ranks by the mechanical score (copy, legibility, contrast, composition, story) **plus** two 0–10 measures
on the first three rendered shots:

- **distinct** — how far they stand apart from the market (tone, accent hue, panorama, full-bleed);
- **reference** — how close they are to the user's reference (when the variant follows one).

Scores rank mechanics, not taste: render the contact sheets (`sheet.mjs --draft --variant dir-b`) and LOOK before
adopting. Keep the two runners-up: they are ready Product Page Optimization treatments and Play store listing
experiments. Nobody can know in advance which set gets the most taps; the store test is the answer, so ship the best
guess and test the alternatives (`skills/aso/testing.md`).

## Competitor captions, the editor and what tests taught

- **Captions.** On macOS the market scan reads every competitor's screenshot captions with Apple's Vision OCR
  (`engine/native/ocr.swift`, compiled once into `~/.cache/appshot/`). The board shows them; the summary lists the
  words most of the market leans on ("stay (7), focus (7)…") and the ones your first three captions share with them.
  Same promise, other words — or lead with what only this app has.
- **Editor.** `node editor/server.mjs --project <app>` → the **Directions** tab: the three directions with a live
  preview of the first three shots at the current size and language, their reasons, "Use direction A/B/C" (into the
  unsaved plan), "Run tournament", the market summary with a scan button, and the references.
- **Learning.** Results recorded with `results.mjs` move the director's scores for every app in the same niche
  (`skills/aso/testing.md`).
