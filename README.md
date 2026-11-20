# Appshot

**One command. Store-ready screenshots, captions and animated App Store creatives — from your app's own code.**

Appshot is an agent skill for Claude Code, Codex and Cursor. Pointed at a mobile or web app repository, it:

1. scans the code (Expo / React Native, Flutter, SwiftUI / UIKit, Android / Compose, web);
2. works out the app's niche among 69 playbooks;
3. writes ASO-optimised, conversion-focused captions in every language you ship. Captions are transcreated, not
   translated;
4. designs the screenshot set and renders store-exact PNGs with headless Chrome;
5. makes the iOS 27 product page header and search results assets: animated key-art scenes it chooses for the app,
   as images and seamless looping videos;
6. scores variants to pick the best and exports fastlane-ready folders.

The skill is built like a small studio: about 400 files that work together. These are the knowledge base the agent
reads (niches, copy, ASO rules, design, locales, review), a zero-dependency rendering engine, the pipeline scripts and
a local editor.

```
/appshot
```

Or just say *"make my App Store screenshots"* inside the app folder.

---

## Contents

- [Quick start](#quick-start)
- [How-to guide](#how-to-guide)
- [What it does](#what-it-does)
- [The pipeline](#the-pipeline)
- [Modes](#modes)
- [The workspace](#the-workspace)
- [Scanning](#scanning)
- [Niches](#niches)
- [Copy, keywords and store rules](#copy-keywords-and-store-rules)
- [Capturing real screens](#capturing-real-screens)
- [Design system](#design-system)
- [Store sizes and locales](#store-sizes-and-locales)
- [Rendering](#rendering)
- [Review and scoring](#review-and-scoring)
- [Variants and A/B tests](#variants-and-ab-tests)
- [Localisation](#localisation)
- [App Store creative assets (header and search results)](#app-store-creative-assets-header-and-search-results)
- [App previews (the video before the screenshots)](#app-previews-the-video-before-the-screenshots)
- [Google Play feature graphic](#google-play-feature-graphic)
- [Check and export](#check-and-export)
- [Editor](#editor)
- [plan.json](#planjson)
- [Command reference](#command-reference)
- [Configuration](#configuration)
- [Examples](#examples)
- [Repository layout](#repository-layout)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Golden rules and limits](#golden-rules-and-limits)
- [Sources](#sources)
- [License](#license)

---

## Quick start

**Requirements:** Node.js 22 or newer and Google Chrome (Chromium or Edge also work). There is no `npm install`:
everything uses Node built-ins only. **ffmpeg** is optional and is needed only for creative-asset videos
(`brew install ffmpeg`).

```bash
node scripts/doctor.mjs --render      # check the machine and do a test render
node scripts/install.mjs              # link the skill into ~/.claude/skills/appshot and ~/.codex/skills/appshot
```

Then open your app's folder in Claude Code and type `/appshot`.

| Agent | How it finds Appshot |
| --- | --- |
| Claude Code | `~/.claude/skills/appshot` (symlink to this folder), entry point `SKILL.md` |
| Codex | `~/.codex/skills/appshot`, entry point `AGENTS.md` |
| Cursor | `node scripts/install.mjs --project /path/to/app` adds `.cursor/rules/appshot.mdc` (and `.claude/skills/appshot`) to that repo |

The links are symlinks, so edits to this folder apply instantly.

Uninstall:
```bash
node scripts/install.mjs --uninstall
```

Try it on the bundled demo without an app of your own:

```bash
npm run example          # draft render + contact sheet + score for examples/pulse
npm run editor:example   # open the editor on the example project
```

## How-to guide

Step-by-step recipes for every job Appshot does. Commands run from this folder with `--project /path/to/app`, or
from the app folder without it. In Claude Code you can also just say the sentence in *italics* and the agent runs the
same steps for you.

**In this guide**

- [Set up Appshot once](#set-up-appshot-once)
- [Make screenshots for an app with the agent](#make-screenshots-for-an-app-with-the-agent)
- [Run the whole pipeline by hand](#run-the-whole-pipeline-by-hand)
- [Capture every language automatically](#capture-every-language-automatically)
- [Capture real screens](#capture-real-screens)
- [Write or change the captions](#write-or-change-the-captions)
- [Give a reference: "make it look like this"](#give-a-reference-make-it-look-like-this)
- [Scan the market and stand out](#scan-the-market-and-stand-out)
- [Get three design directions for your app](#get-three-design-directions-for-your-app)
- [Change the theme, colours or layouts](#change-the-theme-colours-or-layouts)
- [Render only some sizes, languages or shots](#render-only-some-sizes-languages-or-shots)
- [Review the set and raise the score](#review-the-set-and-raise-the-score)
- [Find the best version with variants (A/B tests)](#find-the-best-version-with-variants-ab-tests)
- [Add a language](#add-a-language)
- [Make the App Store header and search results assets](#make-the-app-store-header-and-search-results-assets)
- [Make an App Store app preview video](#make-an-app-store-app-preview-video)
- [Add music to a preview](#add-music-to-a-preview)
- [Add sound effects to a preview or promo video](#add-sound-effects-to-a-preview-or-promo-video)
- [Make variant B and C previews for Product Page Optimization](#make-variant-b-and-c-previews-for-product-page-optimization)
- [Make promo videos for social media, YouTube and Google Play](#make-promo-videos-for-social-media-youtube-and-google-play)
- [Write the store text (metadata) for every language](#write-the-store-text-metadata-for-every-language)
- [Make the Google Play feature graphic](#make-the-google-play-feature-graphic)
- [Check a Google Play set and run Play experiments](#check-a-google-play-set-and-run-play-experiments)
- [Make In-App Event media and text](#make-in-app-event-media-and-text)
- [Record a store test result so Appshot learns](#record-a-store-test-result-so-appshot-learns)
- [Edit by hand in the editor](#edit-by-hand-in-the-editor)
- [Check, export and upload](#check-export-and-upload)
- [Refresh everything after the app changes](#refresh-everything-after-the-app-changes)
- [Clean up the workspace](#clean-up-the-workspace)
- [Extend Appshot: layouts, themes, scenes and niches](#extend-appshot-layouts-themes-scenes-and-niches)
- [Check that nothing broke after an engine change](#check-that-nothing-broke-after-an-engine-change)

### Set up Appshot once

1. Install Node.js 22 or newer and Google Chrome. For videos, also install ffmpeg: `brew install ffmpeg`.
2. Check the machine. This also does a test render:
   ```bash
   node scripts/doctor.mjs --render
   ```
3. Link the skill for Claude Code and Codex:
   ```bash
   node scripts/install.mjs
   ```
   For Cursor, add it to a single repository instead: `node scripts/install.mjs --project /path/to/app`.
4. Optional: try the demo with `npm run example`, then open `examples/pulse/appshot/review/`.

### Make screenshots for an app with the agent

*"Make my App Store screenshots."*

1. Open the app's folder in Claude Code and type `/appshot`.
2. The agent scans the code, picks the niche and writes `appshot/brief.md`. Read the brief and correct anything wrong:
   the audience, the main benefit, real numbers you can prove.
3. The agent captures the screens (simulator, emulator, web) or asks for your PNGs.
4. It writes the captions for every language, renders drafts and shows you the contact sheets in `appshot/review/`.
5. Ask for changes in plain words: *"make shot 2 about streaks"*, *"use a lighter theme"*, *"shorter German
   captions"*.
6. When you are happy, it renders the final set, the creative assets and the previews, runs the store check and
   exports `appshot/export/`.

Your app's code is never changed. Everything is written to the `appshot/` folder in the app's root.

### Run the whole pipeline by hand

`run.mjs` runs the mechanical steps in order and stops wherever judgement is needed.

1. Setup: doctor, workspace, scan, niche, brief, keyword seed and a plan draft.
   ```bash
   node scripts/run.mjs setup --project /path/to/app
   ```
2. Fill in `appshot/brief.md`, then write the captions in `appshot/plan.json` (see
   [Write or change the captions](#write-or-change-the-captions)).
3. Put real screens in `appshot/raw/` (see [Capture real screens](#capture-real-screens)).
4. Draft: validate, copy lint, a draft render, the review boards and the score.
   ```bash
   node scripts/run.mjs draft --project /path/to/app
   ```
5. Look at `appshot/review/`, fix, and repeat step 4 until the score is 95 or more.
6. Final: full-size render, boards, Play graphic, App Store creative assets, app previews, check and export.
   ```bash
   node scripts/run.mjs final --project /path/to/app
   ```

The same steps one by one:

```bash
node scripts/workspace.mjs init --project /path/to/app
node scripts/scan.mjs /path/to/app
node scripts/niche.mjs --explain
node scripts/brief.mjs
node scripts/keywords.mjs seed
node scripts/plan.mjs init --locales en-US,de-DE --sizes iphone-6.9,android-phone
node scripts/plan.mjs validate
node scripts/copy-check.mjs
node scripts/render.mjs --draft
node scripts/sheet.mjs --draft
node scripts/score.mjs --draft
node scripts/render.mjs
node scripts/check.mjs
node scripts/export.mjs --zip
```

### Capture every language automatically

*"Capture the Portuguese and iPad screens."*

Appshot can drive the iOS Simulator (or an Android device) for every language: it opens the app in that language,
reaches each screen, waits until the screen stops moving, takes the screenshot and, if you want, films a short clip
for the app preview.

1. Write the capture plan from the scan:
   ```bash
   node scripts/capture/auto.mjs init
   ```
   This adds `plan.capture` to `plan.json`: the bundle id, the simulator models and one entry per screen. Fill in
   how each screen is reached:
   - `url`: a deep link (`init` guesses `myapp://<screen>`; check the guesses against the app's real routes);
   - `launchArgs` or `launch: true`: launch arguments that open the screen, or the screen the app opens on;
   - `ios.launchArgs` for every launch: the app's own debug flags for demo content and, if it has one, an
     in-memory or test store, so your real data in the simulator is never touched.
2. See what exists, what is missing, and how each screen will be reached:
   ```bash
   node scripts/capture/auto.mjs plan --locales pt-BR,hi
   ```
3. Do a dry run (it prints every step and changes nothing), then run it for real:
   ```bash
   node scripts/capture/auto.mjs run --locales pt-BR --record
   node scripts/capture/auto.mjs run --locales pt-BR --record --yes
   ```
   Add `--tablet` for iPad screens and `--android` for an Android device (per-app language and deep links). The
   language reaches the app as launch arguments, so the simulator's own language never changes.
4. Screens that need taps (a finished session, a shared room) are listed as manual. Capture them with the app's own
   UI tests or by hand, and bring recordings in with `preview.mjs clip`.

### Capture real screens

Screenshots show real UI only. Each capture is saved as `appshot/raw/<name>.png`; a localized capture goes to
`appshot/raw/<locale>/<name>.png`. The `<name>` is what a shot's `screen` field points to.

| Source | Steps |
| --- | --- |
| iOS Simulator | Boot iPhone 17 Pro Max (for 1320 × 2868) or iPad Pro 13" (for 2064 × 2752), open the screen, then `node scripts/capture/ios-sim.mjs --name home`. Add `--url myapp://home --wait 2` to open a deep link first and `--appearance dark` for dark mode. |
| Android | Start an emulator, then `node scripts/capture/android.mjs --name home --serial emulator-5554`. Demo mode gives a clean status bar; `--demo off` turns it off. |
| Web app or PWA | `node scripts/capture/web.mjs --url http://localhost:3000/dashboard --name dashboard --device iphone --dark` |
| Your own files | `node scripts/capture/import.mjs ~/Desktop/shots/*.png` |
| Every locale and device, repeatably | `node scripts/capture/maestro.mjs --app-id com.example.app > appshot/capture.yaml`, then `maestro test appshot/capture.yaml` |

Tips:

- Fill the app with realistic demo data first. Empty screens sell nothing.
- Set the status bar to 9:41 for manual sessions: `node scripts/capture/statusbar.mjs on --time 9:41`.
- A missing screen renders as a labelled placeholder. The scorer and the store check block placeholders, so nothing
  unfinished can be shipped.

### Write or change the captions

Captions live in `appshot/plan.json`, one object per shot, keyed by locale:

```jsonc
{
  "id": "focus",
  "layout": "hero-device",
  "screen": "raw/focus.png",
  "headline": { "en-US": "A calm **Pomodoro timer**", "de-DE": "Ein ruhiger **Pomodoro-Timer**" },
  "subhead":  { "en-US": "Deep work in 15 to 60 minutes.", "de-DE": "Fokus von 15 bis 60 Minuten." }
}
```

1. Put the words to highlight between `**…**`.
2. Lead with the benefit, not the feature, in 2–6 words. Shots 1–3 matter most: most people never swipe further.
3. Lint the copy against Apple and Google Play rules:
   ```bash
   node scripts/copy-check.mjs                              # every caption
   node scripts/copy-check.mjs --locale de-DE --strict      # one language, warnings count as errors
   node scripts/copy-check.mjs --text "Track **every** workout" --locale en-US
   ```
4. Check that the captions say your keywords:
   ```bash
   node scripts/keywords.mjs coverage --locale en-US
   node scripts/keywords.mjs field --locale en-US --title "Nova: Focus Garden"   # the 100-byte keyword field
   ```
5. Render a draft to see them: `node scripts/render.mjs --draft`.

`alternatives` per shot (`"alternatives": { "en-US": ["…", "…"] }`) feed hook variants and the short captions used in
app previews.

### Give a reference: "make it look like this"

*"Here are screenshots I love: make mine feel like these."*

1. Add the reference. Anything works: images, a folder, a video, or an App Store link (its screenshots are fetched):
   ```bash
   node scripts/reference.mjs add ~/Desktop/liked/*.png --name calm-light
   node scripts/reference.mjs add "https://apps.apple.com/us/app/<app-name>/id<number>"
   node scripts/reference.mjs add ~/Movies/ad.mp4
   ```
   You can also drop files into `appshot/references/<name>/` by hand.
2. Study it. Appshot measures the tone, background, colours, device size and count, caption side and panorama, and
   draws a board:
   ```bash
   node scripts/reference.mjs study calm-light      # → appshot/review/reference-calm-light.png
   ```
3. Look at the board for what pixels cannot measure (typeface, highlight style, mood) and set those by hand.
4. Apply it as a variant, compare, and keep it if it wins:
   ```bash
   node scripts/reference.mjs apply calm-light      # → variants/ref-calm-light.json
   node scripts/variants.mjs tournament
   node scripts/variants.mjs adopt ref-calm-light
   ```
   Or put it straight into the plan with `--adopt`.

Only the style is taken. Logos, mascots, illustrations, wording and anything that identifies the other app stay out
(Apple guideline 4.1).

### Scan the market and stand out

*"What do the top apps in my category look like?"*

1. Scan the top App Store apps for your keywords. Appshot uses Apple's public search service (no account, nothing
   about you is sent) and measures each app's first three screenshots:
   ```bash
   node scripts/market.mjs scan                                   # terms from plan.keywords
   node scripts/market.mjs scan --terms "focus timer,pomodoro" --country de
   ```
2. Open `appshot/review/market.png`: every competitor's first three shots, plus a summary such as "75 % of the market
   is light — a dark set stands out in search".
3. On a Mac, the scan also reads the competitors' captions (Apple's built-in text recognition) and lists the words most
   of them use, plus the ones your first three captions share with them. Saying the same promise in the same words
   makes a set blend in.
4. From now on the design director and the tournament weigh the market.

### Get three design directions for your app

*"Don't give me the usual set. Show me options."*

1. See the three directions and why each was chosen:
   ```bash
   node scripts/design.mjs directions --write    # → variants/dir-a.json, dir-b.json, dir-c.json
   node scripts/design.mjs explain               # every theme and opening, scored
   ```
   - **A:** the best theme and opening for this app (your reference first, when there is one).
   - **B:** the best of the other tone (light ↔ dark), with another opening.
   - **C:** a bolder one: a big number, a typographic opening, a tilted device, full-bleed, two devices, often a
     panorama.
2. Render and rank them. Next to the usual score, each set gets **distinct** (how far its first three shots stand
   apart from the market) and **reference** (how close it is to your reference):
   ```bash
   node scripts/variants.mjs tournament
   ```
3. Look at the drafts, then keep the one you like: `node scripts/design.mjs apply b` (or `variants.mjs adopt dir-b`).
4. Keep the other two: they are ready Product Page Optimization treatments.

`plan.mjs init` already runs the director: direction A goes into the plan, B and C into `variants/`. Two apps in the
same category no longer get the same set: theme, opening and panorama follow the app's brand, its UI, the market,
your reference and a per-app seed. Nobody can know in advance which set gets the most taps, so ship the best guess
and test the alternatives in the stores.

### Change the theme, colours or layouts

- **See the options.**
  ```bash
  node scripts/themes.mjs board          # every theme on one board in appshot/review/
  node scripts/layouts.mjs board         # every layout rendered with your screens
  node scripts/layouts.mjs info hero-device
  ```
- **Theme for the whole set.** Set `"theme": "midnight"` in `plan.json`. A single shot can override it with its own
  `"theme"`.
- **Brand colours from the icon.**
  ```bash
  node scripts/palette.mjs                      # reads appshot/raw/icon.png
  node scripts/palette.mjs --apply              # writes plan.brand; then use "theme": "brand"
  node scripts/palette.mjs raw/home.png         # colours from a screenshot instead
  ```
- **Layout of a shot.** Set `"layout"` on the shot (`billboard` for shot 1, `hero-device`, `tilted-device`,
  `duo-devices`, `zoom-callout`, `floating-cards`, `big-number`, `full-bleed`…). Layout options go in `"options"`;
  `layouts.mjs info <id>` lists them.
- **One continuous background across the set.** Set `"panorama": true` and use `bridge` shots to carry a device
  across two screenshots.

Then run `node scripts/plan.mjs validate` and render a draft.

### Render only some sizes, languages or shots

```bash
node scripts/render.mjs --draft                                    # 40 % size, fast, into appshot/drafts/
node scripts/render.mjs --sizes iphone-6.9,ipad-13 --locales en-US # store size, some sizes and languages
node scripts/render.mjs --only 1,3                                 # shots 1 and 3 only
```

Size ids: `iphone-6.9`, `iphone-6.5`, `iphone-6.3`, `iphone-6.1`, `iphone-5.5`, `ipad-13`, `ipad-11`,
`android-phone`, `android-phone-tall`, `android-tablet-7`, `android-tablet-10`. Apple scales the largest iPhone and
iPad sizes down, so `iphone-6.9` and `ipad-13` are usually enough. Final PNGs land in
`appshot/out/<size>/<locale>/NN-id.png`.

### Review the set and raise the score

1. Make the boards and the score:
   ```bash
   node scripts/sheet.mjs --draft
   node scripts/score.mjs --draft
   ```
2. Open `appshot/review/`: the contact sheet per size and language, and the App Store search-result mock in light and
   dark mode, which shows how the first three shots look in search.
3. The score is 0–100. It lists the fixes that would raise it most, such as low contrast, a long caption or a missing
   keyword. Apply them and score again.
4. Aim for 95 or more before the final render.

### Find the best version with variants (A/B tests)

1. Make variants:
   ```bash
   node scripts/variants.mjs make --themes midnight,aurora,clean-light   # one per theme
   node scripts/variants.mjs make --hooks                                # one per caption alternative
   node scripts/variants.mjs make --layouts hero-device,floating-cards   # other opening layouts
   node scripts/variants.mjs make --auto 4                               # a mix picked for the niche
   ```
2. Render and rank them all:
   ```bash
   node scripts/variants.mjs tournament --size iphone-6.9 --locale en-US
   ```
3. Look at the ranking and the boards, then make the winner the main plan:
   ```bash
   node scripts/variants.mjs adopt theme-midnight
   ```
   Variant names are printed by `make` (`theme-midnight`, `hook-b`, `open-floating-cards`, `auto-a`…). The old
   plan is kept as `variants/_previous.json`.
4. To test in the stores, render the best two or three at store size with `node scripts/render.mjs --variant theme-midnight` (PNGs
   in `appshot/drafts/variants/theme-midnight/`). Upload them as
   Product Page Optimization treatments in App Store Connect, or as a store listing experiment in Google Play
   Console.

### Add a language

*"Add German and French."*

1. Add the locales to the plan:
   ```bash
   node scripts/localize.mjs add de-DE,fr-FR
   ```
2. Write a translation sheet with the English source and a length budget for every string:
   ```bash
   node scripts/localize.mjs sheet de-DE
   ```
3. Fill `appshot/i18n/de-DE.json`. Transcreate rather than translate: read `skills/locales/de-DE.md` first for tone,
   grammar and local store habits.
4. Merge it back and see what is still missing:
   ```bash
   node scripts/localize.mjs apply appshot/i18n/de-DE.json
   node scripts/localize.mjs status
   ```
5. If the app's UI is translated, capture localized screens into `appshot/raw/de-DE/`.
6. Lint and render: `node scripts/copy-check.mjs --locale de-DE` and `node scripts/render.mjs --draft --locales de-DE`.
   Repeat steps 2–6 for `fr-FR`.

22 locales are built in (`engine/locales.json`), right-to-left Arabic and Hebrew included.

### Make the App Store header and search results assets

*"Make the App Store header and search assets."*

1. See what the director chose for the app (scene, layouts, motion, phrase) and why:
   ```bash
   node scripts/creative.mjs --explain
   ```
2. Render drafts and open `appshot/review/creative-<locale>.png`. It shows the posters, moments of the loop, the
   safe areas and an "As shown" preview of what iPhone really displays.
   ```bash
   node scripts/creative.mjs --draft
   ```
3. Change anything you do not like in `plan.json` → `creative`, for example `"scene": "pond"` or
   `"motion": "calm"`, or on the command line:
   ```bash
   node scripts/creative.mjs --draft --scene pond --layout creative-stage
   node scripts/scenes.mjs board          # every scene, to choose one
   ```
4. Render the finals, images and looping videos, for every locale:
   ```bash
   node scripts/creative.mjs --video
   ```
5. Upload `appshot/export/upload/ios/<locale>/creative-assets/` in App Store Connect → your app → the product page
   → Header and Search results.

### Make an App Store app preview video

*"Make an app preview video."*

The preview follows the screenshot story: the same order and the same captions, with real footage.

1. **Get footage.** Pick one way per screen. The clip name matches the shot's screen name.
   - Record the booted simulator while you use the app:
     ```bash
     node scripts/preview.mjs record --name focus --seconds 8
     node scripts/preview.mjs record --name focus --url myapp://focus     # deep link first; Enter stops
     node scripts/preview.mjs record --android --name focus --seconds 8   # Android
     ```
   - Or reuse a recording the project already has (UI-test captures, QuickTime takes). The original is not touched:
     ```bash
     node scripts/preview.mjs clip --from ~/Movies/take.mov --name focus --start 1.2 --end 7
     ```
   - Screens without footage fall back to the still screenshot. Apple expects footage captured from the app
     (guideline 2.3.4), so record at least the key screens.
2. **Keep each clip to one clear action** (start a timer, scroll a list, tick a task), slow, 4–8 s. Start the first
   clip on a full screen, because its first frame is the autoplay start.
3. **Add touch hotspots** where you tapped (optional). Times are seconds into the clip, positions are fractions of the
   screen:
   ```bash
   node scripts/preview.mjs taps --name focus --add "1.2,0.5,0.92"
   node scripts/preview.mjs tap --name focus --at 0.5,0.92      # or live, while record runs, right before each tap
   ```
   To spotlight the tapped control, add `"preview": { "shots": { "focus": { "spotlight": "auto" } } }` to the plan.
4. **Check the storyboard, then render a draft.**
   ```bash
   node scripts/preview.mjs --explain
   node scripts/preview.mjs --draft
   ```
   Open `appshot/review/preview-<locale>.png`. It shows the timeline (green for a recording, orange for a still), a
   frame from every scene, the reasons and the warnings.
5. **Render the finals** for every locale:
   ```bash
   node scripts/preview.mjs                                         # iPhone and iPad from the plan
   node scripts/preview.mjs --sizes preview-iphone --locales en-US  # one size, one language
   ```
6. **Upload** `appshot/export/upload/ios/<locale>/app-previews/iphone.mp4` in App Store Connect → your version →
   Previews and Screenshots. Set the poster frame there; the board marks the best moment.

The end card shows the icon, the name and the subtitle in the video's language (or the hook caption where there is
no translation), plus a purchase disclosure when the app has subscriptions or in-app purchases. Change them with
`preview.tagline`, `preview.disclaimer` and `preview.end` in the plan. All settings are in
[App previews → plan.json](#planjson).

### Add music to a preview

1. Get a track you are licensed to use in every territory, ideally with a steady beat.
2. Render with it. Cuts and the end card snap to the beat and the track is faded and loudness-normalized:
   ```bash
   node scripts/preview.mjs --music assets/loop.m4a
   ```
   To keep it, set `"preview": { "music": "assets/loop.m4a", "musicStart": 12 }` in the plan. `musicStart` skips
   into the track.
3. Without music the video carries a silent stereo track, which Apple requires. Remember that previews autoplay
   muted, so the captions must tell the story on their own.

### Add sound effects to a preview or promo video

*"Add sound effects to the promo."*

1. Get a sound-effect pack you own: a folder with category subfolders such as `whoosh/`, `click/`, `interface/`,
   `sparkle/` and `counter/`. Appshot ships no sounds of its own.
2. See where every sound would go, without rendering:
   ```bash
   node scripts/preview.mjs --promo --sfx --explain
   ```
   Each line shows the time, the file, the level and the reason (a tap, a push, the end card…).
3. Render with them:
   ```bash
   node scripts/preview.mjs --promo --sfx ~/sounds/pack      # the folder of your pack
   node scripts/preview.mjs --promo --sfx                    # or the folder in $APPSHOT_SFX
   ```
   To keep it, set `"preview": { "sfx": true }` (or a folder path) in the plan. `"sfxLevel": -3` makes every sound
   quieter.
4. The sounds follow mixing rules: whooshes only on the biggest moves, a click on every tap, one sparkle per video,
   every peak on its frame, all low under the music. They work with `--music` too.

Never copy the pack into the app's repository: packs are licensed for use in videos, not for passing on.

### Make variant B and C previews for Product Page Optimization

1. Render the alternatives. The screenshot hook comes second in both:
   ```bash
   node scripts/preview.mjs --variant b --sizes preview-iphone   # action first: the scene with a tap and the most motion
   node scripts/preview.mjs --variant c --sizes preview-iphone   # payoff first: the fullest, most finished screen
   ```
2. The output is `out/preview/<locale>/variants/<b|c>/`, exported to
   `upload/ios/<locale>/app-previews/variant-<b|c>/`.
3. In App Store Connect → Product Page Optimization, create a treatment with each preview and test them against the
   original.

### Make promo videos for social media, YouTube and Google Play

1. Render them. The same story plays inside a floating 3D device over the app's animated key art, with big captions:
   ```bash
   node scripts/preview.mjs --promo                         # 1080×1920 vertical + 1920×1080 landscape
   node scripts/preview.mjs --promo --sizes promo-square    # 1080×1080
   node scripts/preview.mjs --promo --draft --locales en-US # quick look first
   ```
2. Optional: add a call to action to the end card with `"preview": { "cta": { "en-US": "Start your first journey" } }`.
3. Use `export/promo/<locale>/vertical.mp4` for Reels, TikTok and Shorts.
4. For Google Play, upload `landscape.mp4` to YouTube and paste the link as the promo video in Play Console → Main
   store listing.

Promo videos have device frames, which Apple does not allow in app previews, so never upload them to App Store
Connect. `check.mjs` skips them.

### Write the store text (metadata) for every language

*"Write the Spanish App Store metadata."*

The store text lives in one file per language, `appshot/metadata/<locale>.md`: name, subtitle, promotional text,
keywords, description and What's New for the App Store, plus the Google Play title and descriptions if you want them.
URLs, categories and the copyright go in `appshot/metadata/_shared.md`.

1. Bring in what the app already has, if anything. A document with one section per language works, and so does a
   fastlane `metadata` folder:
   ```bash
   node scripts/metadata.mjs import AppStore/metadata.md
   ```
2. Create a file for each new language:
   ```bash
   node scripts/metadata.mjs init --locales es-ES,de-DE
   ```
   Each file starts with notes: the limits, the source text, the plan's keywords, the paid tier and a glossary of
   the app's own translations of the terms the source uses (from `.xcstrings`, `.strings`, Android `strings.xml`
   or Flutter `.arb`). Fill in every `TODO`, natively, with `skills/locales/<locale>.md`.
3. Check every language:
   ```bash
   node scripts/metadata.mjs check
   ```
   It finds what the stores would refuse or punish:
   - a field over its limit (the keyword field in bytes, where letters such as é, ñ and ß count twice);
   - keyword-field words already in the name or subtitle (wasted bytes), duplicates and generic words;
   - prices, rankings or "free" in the name or subtitle, and other companies' trademarks;
   - a paid tier the description never mentions (Apple 2.3.2), or a subscription without a Terms of Use link (3.1.2);
   - Spanish without ¿ ¡, and Latin American words in a Spain listing.
4. Let Appshot pack the keyword field when it is too long or wasteful:
   ```bash
   node scripts/metadata.mjs keywords --locale de-DE         # suggestion
   node scripts/metadata.mjs keywords --locale de-DE --write # save it
   ```
5. `node scripts/metadata.mjs show` lists every language with its lengths. `export.mjs` writes the text to
   `export/fastlane/metadata/`, and `check.mjs` blocks on metadata errors. Upload it with:
   ```bash
   fastlane deliver --skip_binary_upload --skip_screenshots --metadata_path appshot/export/fastlane/metadata
   ```

### Make the Google Play feature graphic

```bash
node scripts/graphic.mjs --type play-feature --tagline "Home workouts that adapt" --locale en-US
```

The 1024 × 500 image lands in `appshot/out/graphics/play-feature.<locale>.png`, and export puts it in the fastlane
`supply` folder. Keep the tagline short (Google caps text at 20 % of the image) and leave out prices, rankings and
"free".

### Check a Google Play set and run Play experiments

*"Get the Play listing right and test it."*

1. Check the rendered Play screenshots against Google's rules:
   ```bash
   node scripts/play.mjs check
   ```
   It reports text covering more than 20 % of an image, text-only layouts in the first three screenshots, fewer
   than 4 phone screenshots, banned words, device frames (Google advises against device imagery) and a missing
   feature graphic.
2. Package the design variants as a store listing experiment:
   ```bash
   node scripts/play.mjs experiments --variants dir-b,dir-c
   ```
   Each variant is rendered at the Play sizes into `out/play-experiments/<variant>/<language>/`, with a README for
   Play Console; `export.mjs` copies it into `export/play-experiments/`.
3. Play has no public search API. To compare against Play competitors, save their screenshots into a folder per app
   and import them:
   ```bash
   node scripts/market.mjs import ~/Desktop/play-competitors --store play
   node scripts/design.mjs directions --store play
   ```

### Make In-App Event media and text

*"We have a winter challenge. Make the event card."*

1. Create the event:
   ```bash
   node scripts/event.mjs new winter-challenge --badge Challenge --start 2026-12-20 --end 2027-01-10
   ```
2. Write the text for every language in `appshot/events/winter-challenge.json`: a name of up to 30 characters in
   title case, a short description of up to 50 and a long one of up to 120. Then check it:
   ```bash
   node scripts/event.mjs check winter-challenge
   ```
   It flags lengths, prices, "#1" or "the best", all capitals, events longer than 31 days and an invalid badge.
3. Render the event card (1920 × 1080) and the details page (1080 × 1920), as images and seamless loops:
   ```bash
   node scripts/event.mjs render winter-challenge --video
   ```
   Following Apple's guidance, the media has no text, no logo and no border: the app's key-art scene carries it.
   `export.mjs` copies it to `upload/ios/<locale>/events/<id>/`.

### Record a store test result so Appshot learns

*"Variant C won the App Store test by 12 %."*

1. Record the result with the numbers App Store Connect (or Play Console) shows:
   ```bash
   node scripts/results.mjs add --treatment dir-c --lift 12.4 --confidence 90
   node scripts/results.mjs add --store android --treatment dir-b --lift-range "-2.1,6.8"
   ```
2. Fold it into the learning file:
   ```bash
   node scripts/results.mjs learn
   node scripts/results.mjs show --niche focus-timer
   ```
   The learning lives in `~/.appshot/learning.json`, on your machine only. Only the design traits that differed
   between the two sides get the credit (theme, light or dark, opening layout, panorama). From then on the design
   director adds what won or lost to its scores for every app in the same category, and says so in its reasons.

### Edit by hand in the editor

```bash
node editor/server.mjs --project /path/to/app
```

1. Open `http://localhost:4848`.
2. Pick a shot, size and language. Edit captions, layouts, themes and options; the copy lint runs as you type.
3. Press Render or Score. Changes are saved to the same `plan.json` the agent uses, so you and the agent can work on
   one plan at the same time.
4. Open the **Directions** tab to see the design director's three directions for the app, each with a live preview of
   its first three screenshots and the reasons behind it. "Use direction" puts one into the plan (press Save to keep
   it), "Run tournament" renders and ranks them all, and the tab also shows the market summary (with a button to scan
   the App Store) and your references.

### Check, export and upload

1. Run the store gate. It exits with code 1 if anything would be rejected:
   ```bash
   node scripts/check.mjs
   ```
2. Package everything:
   ```bash
   node scripts/export.mjs --zip
   ```
3. Upload, in one of three ways:
   - **By hand.** Drag the folders in `appshot/export/upload/` into App Store Connect and Google Play Console.
   - **fastlane, App Store:**
     ```bash
     fastlane deliver --skip_binary_upload --skip_metadata --overwrite_screenshots --screenshots_path appshot/export/fastlane/screenshots
     ```
   - **fastlane, Google Play:**
     ```bash
     fastlane supply --skip_upload_apk --skip_upload_aab --skip_upload_metadata --skip_upload_changelogs --metadata_path appshot/export/fastlane/metadata/android
     ```
4. Creative assets and app previews are uploaded by hand in App Store Connect. `appshot/export/README.md` lists the
   exact folders for your app.

### Refresh everything after the app changes

*"The app has a new design. Refresh the screenshots."*

1. Rescan, so new screens, colours and features are picked up: `node scripts/scan.mjs /path/to/app`.
2. Capture the changed screens again into `appshot/raw/` with the same names. Record new clips for the preview if
   those screens changed.
3. Update captions for new features in `plan.json`, then run `node scripts/copy-check.mjs`.
4. Run `node scripts/run.mjs draft`, look at the boards, then run `node scripts/run.mjs final`.

The plan, the brief and the captions stay as they are, so a refresh takes minutes.

### Clean up the workspace

```bash
node scripts/workspace.mjs status --project /path/to/app   # what exists, what is next
node scripts/workspace.mjs clean --drafts --cache          # delete drafts and render caches
```

`appshot/` has its own `.gitignore` for drafts and caches. Commit the rest so the set can be rebuilt later.

### Extend Appshot: layouts, themes, scenes and niches

- **A new screenshot layout.**
  1. Create `engine/templates/<id>.mjs` that exports `meta` (`id`, `name`, `summary`, `bestFor`, `needs`, `options`)
     and `render(ctx)`.
  2. Add it to the registries in `skills/niches/_template.md`, `engine/lib/niches.mjs` (`LAYOUTS`) and
     `skills/design/layouts.md`.
  3. Check it with `node scripts/layouts.mjs board --project examples/pulse`.
- **A new theme.**
  1. Create `engine/themes/<id>.json`; copy an existing theme as a start.
  2. List it in `skills/niches/_template.md` and `skills/design/themes.md`.
  3. Check it with `node scripts/themes.mjs board`.
- **A new animated scene** for the creative assets and promo backdrops.
  1. Create `engine/scenes/<id>.mjs` that exports `meta` (`id`, `name`, `mood`, `poster`, `summary`, `niches`,
     `keywords`) and `render(ctx, { hero, intensity, variant, box })`, built with `engine/scenes/_kit.mjs`.
  2. Keep the hero inside `ctx.safe` and make every motion periodic (whole `cycles`), so the video loops seamlessly.
  3. List it in `skills/design/motion.md`, then check it with `node scripts/scenes.mjs board --project examples/penny`.
- **A new niche.** Copy `skills/niches/_template.md` to `skills/niches/<id>.md`. Fill the frontmatter: 25–40
  specific keywords, themes and layouts from the registries, and a shot count. Then write the playbook body. Test it
  with `node scripts/niche.mjs --explain` on an app of that kind.
- **A new store size or locale.** Store specs live only in `engine/sizes.json` and `engine/locales.json`. Add a
  locale guide in `skills/locales/<locale>.md`.

Code rules: zero dependencies (Node 22+ built-ins only), ES modules, 2-space indent, single quotes, and a header
comment explaining each file's job.

### Check that nothing broke after an engine change

One command runs everything: the unit tests, both demo projects (render, score of 95 or more, every layout and
scene, creative assets, preview and promo drafts) and a comparison of the demo screenshots with stored golden images:

```bash
npm run regress           # everything (a few minutes)
npm run regress:quick     # unit tests, renders, scores and golden images (about 20 seconds)
npm test                  # unit tests only
```

When a change to the look is intended, look at the drafts, then accept them as the new golden images with
`node scripts/regress.mjs --update-golden`. The individual steps, if you want to run one by hand:

```bash
node scripts/doctor.mjs --render
node scripts/scan.mjs examples/pulse --quiet
node scripts/render.mjs --project examples/pulse --draft
node scripts/sheet.mjs --project examples/pulse --draft
node scripts/score.mjs --project examples/pulse --draft
node scripts/layouts.mjs board --project examples/pulse
node scripts/creative.mjs --project examples/pulse --draft --video
node scripts/scenes.mjs board --project examples/penny
node scripts/preview.mjs --project examples/pulse --draft --locales en-US
node scripts/preview.mjs --project examples/pulse --promo --draft --locales en-US --sizes promo-vertical
node scripts/scan.mjs examples/penny --quiet && node scripts/render.mjs --project examples/penny --draft && node scripts/score.mjs --project examples/penny --draft
```

The Pulse score should stay at 95 or more, every layout and scene should render, and the boards in
`examples/*/appshot/review/` should look right.

---

## What it does

| Stage | What happens |
| --- | --- |
| Scan | Reads the project without touching it. It collects: app name, bundle id / package name, icon, brand colours, fonts, locales, screens and routes, paywall and onboarding copy, permission strings, features (HealthKit, widgets, AI, subscriptions, camera…) and existing store metadata. |
| Niche | Picks the best of 69 niche playbooks (fitness, nutrition, sleep, finance, AI chat, photo, prayer, language learning…). |
| Brief | Positioning, the searcher, the objection to beat, ranked benefits, real proof, keywords. |
| Capture | iOS Simulator (clean 9:41 status bar, deep links, dark mode), Android emulator (demo mode), web / PWA, Maestro flows, or your own PNGs. |
| Copy | Three candidates per shot, picked with rewrite drills. Every caption is linted against Apple 2.3.x and Google Play policy: prices, "#1" / "best", competitor brands, health claims, other platforms, placeholders, URLs, ©, length. |
| Design | 24 themes, 22 screenshot layouts (a billboard opener built to stop the scroll, then layouts that show the app), CSS-drawn iPhone / iPad / Android frames, panorama backgrounds, floating cards, magnifiers, notification stacks, chat bubbles. |
| Direction | A design director picks this app's own look instead of the category default: it weighs the niche, the brand colour, the app's UI, a scan of the top competing apps (stand out in search) and any reference the user shares (images, a video or an App Store link), then offers three directions to compare. |
| Review | Contact sheets, an App Store search-result mock (light and dark), and a 0–100 score that measures real pixel contrast. |
| Find the best | Hook / theme / layout variants: render them all, score them, rank them. They are ready as Product Page Optimization treatments and Play store listing experiments. |
| Creative assets | iOS 27 product page header (21:9) and search results (3:2), as images and looping videos (5–30 s, 30/60 fps, muted), plus the 16:9 universal PNG. A director picks one of 19 animated scenes for the app and chooses layouts, motion and phrase. Safe areas follow the measured iPhone crop. |
| App previews | The 15–30 s video that plays first, before the screenshots. Its story follows the screenshot plan, hook first and with the same captions. Each segment shows real footage, either a simulator recording or the capture, and the video ends on a card with the purchase disclosure Apple asks for. Encoded to Apple's spec: 886 × 1920, H.264 High at Level 4.0, 10 Mbps, 30 fps, stereo AAC. |
| Export | Store check (size, alpha channel, count, ratio, policy), then fastlane `deliver` / `supply` folders, zips, upload instructions and the Play feature graphic. |
| Editor | Live-preview editor on `localhost:4848`. The agent keeps working on the same plan while you edit. |

---

## The pipeline

The agent follows `SKILL.md`. Mechanical steps are scripts; judgement steps stay with the agent: understanding the
app, writing copy, choosing the design and **looking at every board**.

| # | Step | Command | Knowledge it reads |
| --- | --- | --- | --- |
| 0 | Check the machine | `doctor.mjs` | `skills/core/troubleshooting.md` |
| 1 | Workspace + scan | `workspace.mjs init` · `scan.mjs .` | — |
| 2 | Understand the app | read `appshot/profile.json`, top screens, paywall / onboarding copy, README | `skills/core/method.md` |
| 3 | Niche | `niche.mjs --explain` (override with `--set <id>`) | `skills/niches/<id>.md` |
| 4 | Ask (at most 3 questions) | markets / languages, real proof, things to hide | `skills/core/interview.md` |
| 5 | Brief | `brief.mjs`, then complete every TODO in `appshot/brief.md` | `skills/core/brief.md`, `skills/copy/voice.md` |
| 6 | Keywords | `keywords.mjs seed`, then choose 5–8 per locale into `plan.keywords` | `skills/aso/keywords.md`, `skills/aso/caption-indexing.md` |
| 7 | Real screens | `capture/ios-sim.mjs` · `capture/android.mjs` · `capture/web.mjs` · `capture/import.mjs` | `skills/core/capture.md` |
| 8 | Structure | `plan.mjs init`, then edit order, layouts, screens, fields | `skills/core/story.md`, `skills/design/layouts.md` |
| 9 | Captions | 3 candidates per shot; keep the losers in `shot.alternatives`; run `copy-check.mjs` | `skills/copy/*` |
| 10 | Design | `themes.mjs board` · `layouts.mjs board` · `plan.mjs validate` | `skills/design/taste.md`, `themes.md`, `color.md` |
| 11 | Draft, look, score, fix | `render.mjs --draft` · `sheet.mjs --draft` · **read the PNGs** · `score.mjs --draft` | `skills/review/critique.md`, `skills/review/scoring.md` |
| 12 | Find the best | `variants.mjs make` · `variants.mjs tournament` · `variants.mjs adopt <name>` | `skills/aso/testing.md` |
| 13 | Localise | `localize.mjs add` · `localize.mjs sheet` · `localize.mjs apply` · `copy-check.mjs --locale <id>` | `skills/locales/<id>.md`, `skills/aso/localization.md` |
| 14 | Final + export | `render.mjs` · `sheet.mjs` · `creative.mjs --video` · `graphic.mjs` · `check.mjs` · `export.mjs --zip` | `skills/core/export.md`, `skills/aso/apple-rules.md`, `google-play-rules.md` |
| 15 | Hand-off | summary, scores, paths, metadata suggestions (`keywords.mjs field`), next test | `skills/aso/metadata.md` |

Steps 9 → 11 loop until every size and locale scores at least 85. `copy-check` must report no errors, and the visual
critique must find nothing a top-grossing app would not ship. That typically takes 2–4 iterations.

Shortcuts for the mechanical parts:

```bash
node scripts/run.mjs setup  --project .   # doctor → workspace → scan → niche → brief → keyword seed → plan draft
node scripts/run.mjs draft  --project .   # validate → copy-check → draft render → boards → score
node scripts/run.mjs final  --project .   # render → boards → Play graphic / App Store creative assets → check → export
```

---

## Modes

| Mode | When | What runs |
| --- | --- | --- |
| `full` (default) | "make my screenshots" | the whole pipeline |
| `copy` | captions or metadata only | steps 1–6 and 9, plus `keywords.mjs field`; no rendering |
| `refresh` | the UI changed and a plan exists | re-capture, draft, final |
| `localize <codes>` | new languages | step 13, then draft and final |
| `variants` / `ab` | A/B test, Product Page Optimization, "which is better" | step 12 |
| `audit` | critique existing store screenshots | `skills/core/modes.md` |
| `creative` | App Store header and search results images and videos (iOS 27+) | `creative.mjs --draft` → look → `creative.mjs --video` |
| `preview` | App Store app preview video (plays before the screenshots) | `preview.mjs --explain` → `preview.mjs record --name <screen>` → `preview.mjs --draft` → look → `preview.mjs` |
| `graphic` | Google Play feature graphic | `graphic.mjs` |
| `editor` | tweak by hand | `node editor/server.mjs` |

---

## The workspace

Everything Appshot writes lives in a **visible `appshot/` folder** at the root of the app project. The app's own code
is never modified.

```
appshot/
  .workspace        marker that identifies the folder as an Appshot workspace
  README.md         what each file is
  profile.json      what the scanner learned about the app
  brief.md          positioning, audience, benefits, keywords: the source of truth for copy
  plan.json         the screenshot set: shots, layouts, captions per locale, theme, sizes, creative settings
  raw/              real app screens (simulator, emulator or your own PNGs), the icon, and screen recordings
                    in raw/<locale>/clips/ for app previews
  fonts/            optional local fonts referenced by the plan
  i18n/             translation sheets (localize.mjs)
  drafts/           fast low-resolution renders for review (git-ignored)
  out/              store-size PNGs: out/<size>/<locale>/NN-id.png, out/creative/<locale>/, out/preview/<locale>/,
                    out/graphics/
  review/           contact sheets, search previews, boards, reports, scores, creative direction
  variants/         alternative plans for A/B tests
  export/           fastlane-ready folders, upload folders and zips
  .cache/           temporary render files (git-ignored)
```

- `workspace.mjs init` creates the folder, a `.gitignore` and the marker. If an older hidden `.appshot/` exists, it
  is renamed to `appshot/`.
- If `appshot/` already exists and is not an Appshot workspace, `appshot-workspace/` is used instead.
- Scripts find the workspace automatically from the current directory, or take `--project <app>` or
  `--workspace <dir>`.

```bash
node scripts/workspace.mjs status --project /path/to/app    # what exists, what is next
node scripts/workspace.mjs clean --drafts --cache            # free space
```

---

## Scanning

`scan.mjs` is read-only on the project and writes `appshot/profile.json`.

| Detector (`scripts/scan/`) | Finds |
| --- | --- |
| `platform.mjs` | framework: Expo / React Native, Flutter, native iOS, native Android, web |
| `expo.mjs`, `flutter.mjs`, `ios.mjs`, `android.mjs`, `web.mjs` | name, bundle id / package, version, URL schemes, permissions, plugins, locales |
| `screens.mjs` | routes and screens (Expo Router, Flutter routes, SwiftUI views, Compose destinations, web pages) |
| `strings.mjs` | user-facing copy, especially paywall and onboarding text, where teams already wrote their value propositions |
| `features.mjs` | capabilities (HealthKit / Health Connect, camera, widgets, AI, subscriptions, notifications, maps…) with benefit seeds |
| `colors.mjs` | brand palette from theme files, with a strict test so dark backgrounds are not mistaken for the brand colour |
| `fonts.mjs` | custom fonts |
| `icon.mjs` | the app icon |
| `store.mjs` | existing store metadata (fastlane, Play listings) |
| `readme.mjs` | the README excerpt |

The niche is classified right after the scan (`niche.mjs`). It uses IDF-weighted keyword matching against the
frontmatter of every `skills/niches/*.md` file, and the category is inferred from the niche when the project does not
declare one.

---

## Niches

69 playbooks in `skills/niches/`. Each has: who searches, what wins the install, a shot-by-shot story, headline
banks, visuals, keyword clusters and policy pitfalls. The frontmatter (keywords, themes, layouts, shot count) drives
classification and plan drafting.

AI Avatar & Headshot · AI Chat Assistant · AI Music & Voice · AI Photo Editor · AI Video Generator · Astrology &
Tarot · Banking & Payments · Bible & Christian Prayer · Books & Audiobooks · Budget & Expense Tracker · Business &
Invoicing · Calendar & Planner · Camera & Filters · Casual Games · Collage & Story Maker · Widgets, Themes &
Customization · Dating · Fashion & Outfit Planner · Gym & Strength Training · Focus Timer & App Blocker · Food
Delivery · Grocery & Shopping List · Habit Tracker · Health Vitals Log · Home Workout · Homework Solver · Intermittent
Fasting · Investing & Crypto · Islamic Prayer & Quran · Kids Learning · Language Learning · Medication Reminder ·
Meditation & Mindfulness · Mental Health & Therapy · Mood Tracker & Journal · Music Streaming & Players · Navigation,
EV Charging & Parking · Notes & Writing · Nutrition & Calorie Counter · Object Identifier · Family Safety & Parental
Control · Password Manager · PDF & Document Scanner · Period & Fertility Tracker · Pet Care · Phone & Storage Cleaner
· Photo Editor · Plant Identifier & Care · Podcasts & Audio Stories · Pregnancy & Baby Tracker · Quit & Recovery ·
Recipes & Meal Planning · Running & Cycling · Shopping & Marketplace · Skincare & Beauty · Sleep Tracker · Smart Home
& TV Remote · Social & Community · Sports Scores & Live Results · Step Counter · Study & Flashcards · To-Do & Tasks ·
Translator · Travel Planner · Video Editor · VPN & Security · Water Tracker · Weather · Yoga & Pilates

```bash
node scripts/niche.mjs --explain        # top matches with the keywords that matched
node scripts/niche.mjs --set sleep-tracker
```

---

## Copy, keywords and store rules

**Captions** are 2–6 words, benefit-first, with one `**highlight**`, and every one traces back to a line in
`brief.md`. The copy knowledge base in `skills/copy/` covers:

- hooks, formulas, voice and power words;
- proof, length and sequence across the set;
- rewrite drills, anti-patterns and a headline bank.

**Copy lint** (`engine/lib/copyrules.mjs`, run by `copy-check.mjs`, `score.mjs`, `check.mjs` and the editor) flags:

- prices, discounts and "free" (Play), rankings ("#1", "best", "top-rated"), Apple awards and recognitions;
- other platforms and competitor trademarks (common-word brands only when written as proper nouns);
- medical or unverifiable claims, URLs, ©, unfilled `{placeholders}`;
- ratings, awards and testimonials without a `source`, and social proof on Google Play;
- calls to action on Play, duplicate headlines, repeated words, shot counts outside store limits;
- untranslated captions.

```bash
node scripts/copy-check.mjs [--locale de-DE] [--store ios|android] [--strict]
node scripts/copy-check.mjs --text "Track **every** workout" --locale en-US
```

**Keywords:**

```bash
node scripts/keywords.mjs seed                          # candidates from the profile and the niche
node scripts/keywords.mjs coverage --locale en-US       # which plan keywords the captions actually say (shots 1–3 matter most)
node scripts/keywords.mjs field --locale en-US --title "Pulse: Home Workouts" --subtitle "AI plans that adapt"
                                                        # App Store keyword field: 100 bytes, comma-separated; words already in the title / subtitle are dropped
```

Store rules are in `skills/aso/apple-rules.md` and `skills/aso/google-play-rules.md`. Metadata advice (title,
subtitle, keyword field) is in `skills/aso/metadata.md`.

---

## Capturing real screens

Screenshots show real UI only. Captures go to `appshot/raw/`.

```bash
# iOS Simulator: clean 9:41 status bar, deep link, appearance
node scripts/capture/ios-sim.mjs --name home --url myapp://home --wait 2 --appearance dark
node scripts/capture/ios-sim.mjs --list

# Android emulator or device in System UI demo mode
node scripts/capture/android.mjs --name home --url myapp://home --serial emulator-5554
node scripts/capture/android.mjs --demo off

# Web app, PWA or local HTML prototype with mobile emulation
node scripts/capture/web.mjs --url http://localhost:3000/dashboard --name dashboard --device iphone --dark

# Your own PNG / JPEG files
node scripts/capture/import.mjs ~/Desktop/shots/*.png

# Repeatable capture across locales and devices
node scripts/capture/maestro.mjs --app-id com.example.app > appshot/capture.yaml
maestro test appshot/capture.yaml

# Status bar on / off for manual sessions
node scripts/capture/statusbar.mjs on --time 9:41
```

Boot the simulator that matches the target canvas: iPhone 17 Pro Max for 1320×2868, iPad Pro 13" for 2064×2752.
Missing screens render as labelled placeholders; the scorer and the store check block them.

---

## Design system

### Themes (24, `engine/themes/*.json`)

| Theme | Look | Good for |
| --- | --- | --- |
| aurora | dark mesh of violet, cyan and magenta | AI and creative tools; spectacular as a panorama |
| brand | generated from the app's own colours (`plan.brand` or the scanned palette) | strong brands |
| brutal | flat yellow, black outlines, heavy type, hard shadows | Gen-Z, productivity, creators |
| calm | dusky indigo-to-lavender with tiny stars | sleep, meditation, bedtime stories |
| clean-light | bright, neutral, brand colour only on highlights | trustworthy default; lets real UI carry the page |
| cream | warm beige, terracotta, serif headlines | recipes, home, journaling, books |
| editorial | warm paper, big serif headlines with italic accents | reading, writing, culture, premium lifestyle |
| ember | black with a fire-orange glow, condensed caps | intense fitness, sports, motivation |
| finance-pro | navy with emerald accents and a faint grid | money, banking, investing, business |
| forest | deep green with cream serif type | nature, plants, outdoors, sustainability |
| glass | light colourful blur with frosted cards | AI, productivity, wellness |
| luxe | black and gold with a classic serif | premium memberships, fashion, astrology |
| midnight | deep navy-black with a soft accent bloom | premium, focused, tech |
| mint | fresh light mint with deep green type | health, nutrition, money-saving, eco |
| mono | pure black on white, giant type, outline device | minimal tools, writing, design-savvy audiences |
| neon | black with electric green grid and glow | gaming, crypto, VPN, nightlife |
| ocean | deep blue to cyan | travel, weather, finance, health |
| pastel | soft pink, lavender and sky mesh | journaling, period tracking, kids, wellbeing |
| playful | bright rotating colours, rounded heavy type, confetti | kids, games, learning, habit streaks |
| rose | blush pink with deep berry type | beauty, skincare, period and pregnancy |
| sky | light airy blue with navy type and white clouds | weather, travel, kids |
| soft-gray | system grey and SF Pro, like Apple's own marketing | utilities and pro tools |
| sunset | warm coral-to-peach gradient | dating, social, travel, food |
| volt | pure black, electric lime pills, tight heavy type | fitness, running, sports tech |

`plan.themeOverrides` patches any theme (accent, fonts, background, device…). A shot can switch theme with
`shot.theme`. Highlight contrast is checked and recomputed when the accent changes.

```bash
node scripts/themes.mjs list --mood calm
node scripts/themes.mjs board --shot 1 --themes midnight,aurora,clean-light   # → review/themes.png
node scripts/palette.mjs appshot/raw/icon.png --apply                          # brand colours from the icon → plan.brand
```

### Screenshot layouts (22, `engine/templates/*.mjs`)

Shot 1 has one job: stop the scroll and say the value in one look. So it is built unlike the rest (`billboard`), and
from shot 2 on the layouts show much more of the actual app.

| Layout | What it is |
| --- | --- |
| billboard | shot 1 only: a giant 2–4 word promise with a kicker, the screen's money moment lifted out of the device (or a cutout image), real proof at the foot (iOS only, dropped on Play by itself) |
| hero-device | headline band on top, one large device rising from the bottom edge (the classic opener when a billboard doesn't fit) |
| device-top | device enters from the top edge, caption at the bottom; a rhythm-breaker |
| tilted-device | caption on top, device rotated in 2D or 3D perspective |
| duo-devices | back device offset left, front device offset right; a two-step story |
| trio-fan | centre device in front, two angled devices behind; variety and depth |
| zoom-callout | device on one side, a big magnified detail overlapping it (zoom ≥ 1.6×) |
| floating-cards | device centred, 2–4 stat / insight cards floating over its edges |
| feature-list | left-aligned headline, checklist of benefits, device rising from the bottom |
| social-proof | laurel with a real rating or accolade, optional award row, device peeking |
| big-number | huge stat, short label, device below |
| before-after | split-screen slider inside one device (editors, cleaners, scanners, translators) |
| full-bleed | screenshot fills the canvas under a gradient scrim with the caption |
| text-hero | app icon, giant statement, optional chips or rating; no device |
| review-quote | headline and 1–3 genuine review cards |
| split-diagonal | accent diagonal panel behind a tilted device |
| bridge | panorama only: the device straddles into the next screenshot |
| screen-grid | 2–4 frameless screens in a staggered grid |
| ui-pieces | device in the background, 1–3 magnified UI crops floating in front |
| notification-stack | device with 1–3 realistic notification banners |
| chat-bubbles | device with an oversized conversation floating over it |
| comparison | the old way (crosses) versus your app (checks); never names competitors |

There are also `banner` (Play feature graphic) and four creative-asset layouts (see
[creative assets](#app-store-creative-assets-header-and-search-results)).

```bash
node scripts/layouts.mjs list
node scripts/layouts.mjs info zoom-callout
node scripts/layouts.mjs board --shot 1          # every layout dressed with your shot → review/layouts.png
```

### Devices, decor and components

- **Frames** (`engine/frames/`, pure CSS, no images): `iphone` (Dynamic Island), `iphone-notch`, `iphone-classic`,
  `ipad`, `android`, `android-tablet`, `flat`, `clay`, `outline`. Finishes, colours and shadows are configurable. A
  phone capture on a tablet canvas keeps the matching frame.
- **Decor** (`engine/decor/`): beams, blobs, confetti, dots, glow, grain, grid, rings, shapes, sparkles, waves.
- **Components** (`engine/components/`): app icon, arrow, chat bubble, checklist, chip, laurel, magnifier,
  notification, quote, stars, stat card.
- **Panorama:** `plan.panorama: true` paints one background across the whole strip, and `bridge` devices cross
  frame borders.
- **Typography:** captions fit in the browser: they shrink first and hyphenate only as a last resort. Sizes use a
  canvas-independent unit, so phones, tablets and Android render consistently. Locale fonts fill scripts the theme
  font lacks (CJK, Arabic, Hebrew, Devanagari, Thai, Vietnamese stacked diacritics).

Design knowledge lives in `skills/design/`:

- taste, composition and anti-patterns;
- typography, colour and highlights;
- devices, panorama and tablet;
- accessibility, motion, and the layout and theme catalogues.

---

## Store sizes and locales

All store specs live only in `engine/sizes.json` and `engine/locales.json`.

| Size id | Pixels | Store | Notes |
| --- | --- | --- | --- |
| iphone-6.9 | 1320 × 2868 | App Store | 16/17 Pro Max, Air |
| iphone-6.5 | 1284 × 2778 | App Store | required only if 6.9" is missing |
| iphone-6.3 | 1206 × 2622 | App Store | **required class** |
| iphone-6.1 | 1170 × 2532 | App Store | |
| iphone-5.5 | 1242 × 2208 | App Store | legacy |
| iphone-duo-inner | 2007 × 2853 | App Store | iPhone Duo inner display (required from April 2027 with the iOS 27.1 SDK) |
| iphone-duo-outer | 1398 × 2034 | App Store | iPhone Duo outer display |
| ipad-13 | 2064 × 2752 | App Store | **required** for iPad apps |
| ipad-11 | 1668 × 2420 | App Store | |
| android-phone | 1080 × 1920 | Google Play | **required**, 9:16 |
| android-phone-tall | 1080 × 2160 | Google Play | 1:2, the maximum ratio |
| android-tablet-7 | 1200 × 1920 | Google Play | |
| android-tablet-10 | 1600 × 2560 | Google Play | |

| Graphic id | Pixels | Use |
| --- | --- | --- |
| play-feature | 1024 × 500 | Google Play feature graphic |
| appstore-header | 3840 × 1646 | App Store product page header, 21:9 image or looping video |
| appstore-search | 3840 × 2560 (1920 × 1280 also accepted) | App Store search results, 3:2 image or looping video |
| appstore-universal | 5244 × 2950 | 16:9 PNG used for both header and search results |

Default sizes are `iphone-6.9` and `iphone-6.3`. Google Play images keep the long side at most twice the short side,
and captions under 20 % of the image.

**Locales (22):** English (US), English (UK), German, French, Spanish (Spain), Spanish (Mexico), Portuguese
(Brazil), Italian, Dutch, Japanese, Korean, Simplified Chinese, Traditional Chinese, Arabic (RTL), Hebrew (RTL),
Russian, Polish, Swedish, Indonesian, Hindi, Vietnamese, Thai.

Each locale has a playbook in `skills/locales/<id>.md` covering register, typography, length, search habits,
transcreation examples and pitfalls. `engine/locales.json` maps every locale to App Store and Play codes, fonts and
script rules.

---

## Rendering

```bash
node scripts/render.mjs --draft                         # 40 % scale into appshot/drafts: fast, for review
node scripts/render.mjs                                 # store-size PNGs into appshot/out/<size>/<locale>/NN-id.png
node scripts/render.mjs --sizes iphone-6.9,ipad-13 --locales en-US,de-DE --only 1,3 --variant b
```

- One HTML strip page is composed per size and locale (`engine/compose.mjs`); each shot is one W×H slot.
  `engine/render.mjs` drives headless Chrome over the DevTools protocol with no Puppeteer, and captures each slot.
- PNGs are flattened to RGB with no alpha channel, as Apple requires.
- A render report is written to `review/draft-report.json` or `review/render-report.json`. It records fit, lines,
  text boxes, overlap with devices, missing screens and broken images, and the scorer and checker read it.
- Per-store overrides: `plan.storeOverrides.android = { theme: {...} }`. Per shot, `"skipOn": ["android"]` or a size id.
- Localised captures: screen paths may contain `{locale}` (`raw/{locale}/home.png`).

---

## Review and scoring

Boards to **look at** (the agent reads them as images before shipping):

```bash
node scripts/sheet.mjs --draft      # review/contact-<size>-<locale>.png and review/search-<locale>.png (light + dark)
```

`score.mjs` scores each size × locale from 0 to 100, from the plan, the render report and real PNG pixels. Shots 1–3
weigh 1.6× the rest.

| Part | Max | Measures |
| --- | --- | --- |
| Copy | 35 | lint errors and warnings, 2–6 words, benefit signals (verb start, "you", a number), highlight on a content word, subhead length |
| Legibility | 25 | headline size at search-thumbnail scale, fit, three-line headlines in shots 1–3, text shrunk below 82 % |
| Contrast | 15 | p10/p90 luminance inside the headline box of the rendered PNG, plus highlight contrast |
| Composition | 15 | placeholders, caption over device, broken images, text-only frames in shots 2–3 |
| Story | 10 | layout variety, hook layout first, shot 1's promise the biggest type in the set, at least 5 shots, keywords in shots 1–3, back-to-back layouts, a concrete number early |

Verdicts: **≥ 85 ship**, 70–84 iterate, < 70 rework. Each result lists the top fixes, sorted by the points they
would recover.

```bash
node scripts/score.mjs --draft [--locale en-US] [--size iphone-6.9] [--json]
```

The score measures mechanics. It cannot judge whether the hook is the right promise or whether the set beats the
niche's competitors. Those come from the brief and the visual critique in `skills/review/critique.md` and
`skills/review/checklist.md`.

---

## Variants and A/B tests

```bash
node scripts/variants.mjs make --themes midnight,aurora,clean-light   # one variant per theme
node scripts/variants.mjs make --hooks                                # one per shots[i].alternatives entry
node scripts/variants.mjs make --layouts hero-device,floating-cards   # alternative openers
node scripts/variants.mjs make --auto 4                               # niche themes × hook alternatives
node scripts/variants.mjs tournament --size iphone-6.9 --locale en-US # render + score base and all variants, rank them
node scripts/variants.mjs adopt b                                     # make a variant the main plan (old one kept)
node scripts/variants.mjs list | clear
```

Variants double as App Store Product Page Optimization treatments (up to 3) and Google Play store listing
experiments (`skills/aso/testing.md`).

---

## Localisation

Captions live in `plan.json` as `{ "<locale>": "text" }` objects. **Transcreate, do not translate:** the agent reads
`skills/locales/<locale>.md` before writing any non-English line.

```bash
node scripts/localize.mjs add de-DE,ja                 # add locales to the plan
node scripts/localize.mjs status                       # what is missing per locale
node scripts/localize.mjs sheet de-DE                  # appshot/i18n/de-DE.json: every string, its English source, a length budget
node scripts/localize.mjs apply appshot/i18n/de-DE.json
node scripts/copy-check.mjs --locale de-DE
```

Right-to-left locales (Arabic, Hebrew) render with `dir="rtl"`. Full mirroring of every layout is not complete yet.

---

## App Store creative assets (header and search results)

iOS 27 adds two optional, per-locale placements in App Store Connect under Product Page Information → **Header and
Search Results**. Each takes an image **or** a muted, looping video. The search results asset *replaces* the
screenshot strip in search, so it acts as your hook.

### Specs (Apple, checked 2026-11-05)

| Placement | Ratio | Pixels | Image | Video |
| --- | --- | --- | --- | --- |
| Product page header | 21:9 | 3840 × 1646 | .png .jpg .jpeg | .mp4 .mov .m4v, 30 or 60 fps, 5–30 s |
| Product page header | 16:9 | 5244 × 2950 | .png only | — |
| Search results | 3:2 | 1920 × 1280 to 3840 × 2560 | .png .jpg .jpeg | .mp4 .mov .m4v, 30 or 60 fps, 5–30 s |
| Search results | 16:9 | 5244 × 2950 | .png only | — |

Further rules:

- No alpha channel.
- Videos are always muted in search and muted by default on the product page, and both loop continuously.
- One 16:9 universal PNG can serve both placements.
- The usual metadata rules apply: no prices or discounts, URLs, ©, unverifiable claims, other platforms or Apple
  recognitions.

### Usage

```bash
node scripts/creative.mjs --draft          # the director decides; quarter-size images + 15 fps preview videos + review board
node scripts/creative.mjs --video          # final images and videos for every locale in the plan
node scripts/creative.mjs --explain        # print the decisions and reasons, render nothing
node scripts/creative.mjs --assets header,search --locales en-US --scene pond --fps 60 --duration 15 --codec hevc
node scripts/creative.mjs --manual         # ignore the director, use plan.creative and the old defaults only
```

Output per locale:

- `appshot/out/creative/<locale>/` holds `header.png`, `header.mp4`, `search.png`, `search.mp4` and `universal.png`.
- `appshot/review/creative-<locale>.png` is the review board, with posters, six moments of the loop, the safe area
  in red, the crops in blue, a preview of what iPhone shows (header and search crops) and the director's reasons.
- `appshot/review/creative-direction.json` records the decisions.

Codecs:

- `h264` (default): `.mp4`, plays everywhere.
- `hevc`: `.mp4` tagged `hvc1`, smaller files.
- `prores`: a ProRes 422 HQ `.mov` master.

### The director: the app decides its own creative

`engine/lib/director.mjs` reads the scanned profile (niche, description, features), the plan (screens, hook,
alternatives, cards, theme) and the scene library. It then decides:

1. **Scene.** It ranks the 19 scenes by niche match, with the runner-up niche at half weight, and by scene keywords
   found in the app's own words (description, features, keywords, captions). If no scene scores at least 2, the app
   icon becomes the hero (`icon-glow`). Some niches get a variant:
   - language learning and translators → book `letters`;
   - podcasts and AI voice → sound `voice`;
   - dating → chat `dating`;
   - astrology → night-sky `constellation`.
2. **Header** → `creative-scene`. The asset carries one idea, centres the hero for the iPhone crop and has no text,
   because the app name and subtitle sit right below. For games with 3+ captures it uses `creative-stage` instead,
   since gameplay is the idea.
3. **Search results** → `creative-split`: the phrase and real UI over the scene's ambience, so the app's purpose is
   clear at a glance. Content-led niches with 4+ captures use `creative-carousel`. With no captures it falls back to
   key art with the phrase.
4. **Universal** → `creative-stage` over the scene, which reads in both the 21:9 and the 3:2 crop.
5. **Motion:**
   - `calm` (14 s loop) for trust-first niches: money, health, sleep, security, faith;
   - `lively` (10 s) for games, kids, social and music;
   - `gentle` (12 s) for everything else.
6. **Phrase.** It uses the screenshot hook if it has 6 words or fewer, otherwise the hook's shortest alternative.

Anything set in `plan.creative` wins, key by key.

```bash
node scripts/scenes.mjs pick      # the scene ranking for this app, with the reasons
```

### Scenes (19, `engine/scenes/*.mjs`)

Animated, illustrated key art in the style of the best iOS 27 headers. Each scene has:

- ambient life across the full width, because iPad and Mac show the whole 21:9;
- one hero object centred in the safe area;
- colours from the theme plus a few natural colours (red heart, gold coins, green leaves).

| Scene | Hero and motion | Default niches |
| --- | --- | --- |
| heartbeat | heart beating once a second, pulse rings, ECG line with a running highlight, sparks | fitness, home workout, health vitals, step counter |
| growth | glass chart: bars grow one by one, trend line draws, coins drift up | budget, banking, investing, invoicing |
| pond | lotus breathing, two koi circling, ripples, lily pads drifting | meditation, therapy, mood journal, yoga, quitting |
| night-sky | crescent moon with halo, twinkling stars, shooting stars, low clouds (variant `constellation`) | sleep, prayer, astrology, fasting |
| orbit | glowing planet / orb with a tilted ring, moons orbiting in depth | AI assistants, homework, object identifiers |
| bowl | bowl with steam curling, toppings dropping in, herbs drifting | recipes, food delivery, nutrition, grocery |
| book | open book glowing, rays turning, sparkles rising (variant `letters`) | books, study, language, notes, bible, translator |
| bloom | flower opens petal by petal and closes before the loop ends, butterflies, fireflies | plants, habits, period, pregnancy, skincare, pets |
| flight | paper plane flying a figure-eight through dawn clouds, dashed route | travel |
| route | city map: route draws between two pins, a dot follows, destination pulses | navigation / EV, running and cycling, family safety |
| sound | spinning record, sound rings, notes, equaliser (variant `voice`) | music, podcasts, AI voice |
| chat | bubbles pop in, typing dots, hearts rising, friends drifting (variant `dating`) | social, dating |
| tasks | checkmarks tick off, progress ring closes, confetti | to-do, calendar, focus, medication, scanners |
| lens | aperture blades turning, light leaks, photo cards floating | photo and video editors, camera, AI photo / avatar, collage, fashion |
| shield | shield with lock breathing, scan rings, orbiting particles, hex grid glints | VPN, passwords, cleaners |
| water | glass with a rolling water surface, bubbles, drops falling in | water tracking |
| sky | sun with turning rays behind a cloud, rain from a second cloud | weather |
| playground | glossy shapes bobbing and turning around a big star, confetti | casual games, kids |
| icon-glow | the app icon as a glowing tile with a light sweep and orbiting brand particles | fallback for any app |

Every one of the 69 niches maps to a scene.

```bash
node scripts/scenes.mjs list
node scripts/scenes.mjs board --size appstore-header     # every scene in your theme → appshot/review/scenes.png
```

### Creative layouts

| Layout | What it is | Options |
| --- | --- | --- |
| creative-scene | a scene fills the canvas; optional short phrase | `scene`, `variant`, `phrase`, `phraseAt`, `intensity` |
| creative-split | phrase on one side, 1–3 floating devices on the other; the front screen cycles through captures and stat cards pop in | `devices`, `textSide`, `textShare`, `bleed`, `backdrop` |
| creative-stage | 3 or 5 devices fanned around a centre hero on a glowing stage; optional phrase | `devices`, `backdrop` |
| creative-carousel | a strip of real screens sliding one set per loop; the phrase sits beside it on the wide search band, above it otherwise | `phraseAt`, `textShare`, `gap`, `backdrop` |

`backdrop: <scene>` plays the scene's world, without its hero object, behind the devices.

### Motion

Videos are not edited timelines. Every element moves with a periodic function of the loop, and each motion runs an
integer number of cycles, so the last frame joins the first without a jump. Measured on the examples, the step from
the last frame to the first equals an ordinary frame-to-frame step (PSNR 35.6 vs 35.7 dB, 46.4 vs 46.9 dB).

Motion primitives (`ctx.motion(inner, spec)`):

- `float`, `zoom`, `pulse` (heartbeat or breathe), `spin`;
- `osc` (any property between two values);
- `orbit` (with depth and front/back passes), `path` (follows an SVG path);
- `travel` (A to B with wobble, fade, scale, rotation and an optional time window);
- `ripple`, `dash` (stroke draw or flow), `grow`, `slide`;
- `pop` (stat cards), `screens` (cross-fading captures), `carousel`.

The still image is the same scene at its **poster** moment (`poster`, 0–1), for example the chart fully grown or the
flower open. Frames are captured in Chrome and piped to ffmpeg with no intermediate files. A 12 s 3840×1646 header at
30 fps takes one to two minutes on an Apple-silicon Mac (about 10–20 MB as H.264). Details: `skills/design/motion.md`.

### Safe areas and crops

Apple publishes no safe-area numbers. A developer measured the display with a calibration grid in App Store Connect
Preview and on live pages (iPhone 15, iOS 27.0.1). On iPhone the header box is about **1.51:1**: the 21:9 asset fills
it, about **17.6 % of the width is cut on each side** and the full height shows. iPad and Mac show more.

Search results on iPhone show only the **top of the asset**. Measured in App Store Connect Preview: the search card
is about **2.46:1**, it shows the full width and only the **top ≈61 %** of the 3:2 asset. The lower ≈39 % is cut, so
a strip of screens under a phrase loses the bottom half of every screen. The search safe area is therefore a wide top
band, and on it `creative-carousel` and `creative-scene` place the phrase beside the screens or the hero.

| Asset | Safe area (key elements) | Crops drawn on the board |
| --- | --- | --- |
| Header 21:9 | x 20 %, y 8 %, w 60 %, h 80 % | iPhone centre crop (x 17.6 %, w 64.8 %) |
| Search 3:2 | x 4 %, y 4 %, w 92 %, h 53 % | iPhone search (top 61 %, full width) |
| Universal 16:9 | x 19 %, y 14 %, w 62 %, h 43 % | 21:9 band, 3:2 band, iPhone header crop, iPhone search crop |

The review board shows, next to each poster, exactly what the iPhone header and search crops display.

These are assumptions built on that measurement. Another report says an iPhone 17 looked different from Preview, so
check App Store Connect Preview and a real device before shipping.

### Uploading

`export.mjs` copies the assets to `export/upload/ios/<locale>/creative-assets/`. Upload them by hand in App Store
Connect, because fastlane does not support creative assets yet:

- `header.png` or `header.mp4` goes to Header;
- `search.png` or `search.mp4` goes to Search Results;
- `universal.png` works for both.

Assets can be swapped on a live version through the Asset Library. Each Custom Product Page can have its own header
(one per ad campaign), and Product Page Optimization can test them, for example key art versus devices, or image
versus video.

---

## App previews (the video before the screenshots)

An app preview is a 15–30 s video that sits **first** in the screenshot row on iPhone, iPad, Mac and Apple TV, and
autoplays muted on the product page and in search results. In portrait search results it takes the first of the
three slots. `preview.mjs` builds it from the screenshot plan.

### Specs (Apple, checked 2026-11-06)

| | |
| --- | --- |
| Length | 15–30 s |
| Frame rate | up to 30 fps |
| Video | H.264 progressive, up to High Profile Level 4.0, target 10–12 Mbps, or ProRes 422 HQ |
| Audio | stereo 256 kbps AAC, 44.1 or 48 kHz |
| Files | .mov, .m4v or .mp4, up to 500 MB, up to 3 per device size and language |
| Poster frame | chosen in App Store Connect; the default is 5 s |

| Size id | Portrait | Landscape | Covers |
| --- | --- | --- | --- |
| `preview-iphone` | 886 × 1920 | 1920 × 886 | every Face ID / Dynamic Island iPhone; upload once at the largest size and it scales down |
| `preview-iphone-home` | 1080 × 1920 | 1920 × 1080 | Home-button iPhones (5.5", 4") |
| `preview-iphone-4.7` | 750 × 1334 | 1334 × 750 | 4.7" |
| `preview-ipad` | 1200 × 1600 | 1600 × 1200 | iPad 13", 12.9", 11", 10.5" |
| `preview-mac` | — | 1920 × 1080 | Mac |

Apple's content rules:

- previews use only screen captures of the app itself (guideline 2.3.4); narration and text overlays are allowed;
- no device frames and no framing around the capture: Apple has rejected both;
- no hands or people holding devices;
- dissolves and fades, and no transition that implies a feature the app does not have;
- short, legible copy, with no prices and no dates;
- in-app purchases, subscriptions or a required login must be disclosed, in the footage or in the end frame.

### Usage

```bash
node scripts/preview.mjs --explain                                   # the storyboard and its warnings
node scripts/preview.mjs record --name focus --seconds 8             # record the booted iOS Simulator
node scripts/preview.mjs record --name focus --url myapp://focus     # open a deep link first, stop with Enter
node scripts/preview.mjs record --android --name focus --seconds 8   # Android emulator or device
node scripts/preview.mjs --draft                                     # half size, 15 fps, plus the board
node scripts/preview.mjs                                             # final, every locale
node scripts/preview.mjs --sizes preview-iphone,preview-ipad --music assets/loop.m4a --camera none --no-blur
```

Output per locale:

- `appshot/out/preview/<locale>/iphone.mp4` (and `ipad.mp4`…), plus `iphone-poster.png`, the frame at the poster
  time;
- `appshot/review/preview-<locale>.png`, the storyboard board. It shows a timeline bar (green for a recording, orange
  for a still, blue for the end card, red for the poster time), a frame from every segment and the warnings;
- `appshot/review/preview-report.json`.

With a `preview` block in `plan.json`, `run.mjs final` renders the previews too.

### How the preview is built

The default `store` mode follows Apple's rules and what the best previews do. The research behind it (2026-11)
found three things:

- few top apps have a preview at all, about 12 % of the top US apps;
- the first frame and the first 2–3 s matter most;
- top previews (Structured, Todoist, Things 3) show the app full screen, with no frame, and move with eased motion.

1. **Story.** The scenes are the first 3–5 shots that show an app screen, in order and hook first. Text-only layouts
   and repeated screens are skipped. Each scene keeps the screenshot's caption. A caption over 7 words falls back to
   the shortest alternative of 6 words or fewer.
2. **Footage analysis.** A recording in `raw/<locale>/clips/<screen>.mp4` (or `raw/clips/`) is used for every shot
   that shows that screen. `engine/lib/footage.mjs` samples it at 10 frames per second and measures:
   - how much changes;
   - where the densest change is, so twinkling backgrounds do not count;
   - how full the screen is;
   - how bright the caption bands are.

   Each scene plays the liveliest window of its recording, starting on a full frame, never a loading state. Without
   a recording, the capture is used and a warning says so, because Apple wants footage captured on the device.
3. **Full-bleed, no frame.** The footage fills the canvas exactly as the device plays it. Apple has rejected
   previews with device frames, and also with "framing around the video screen capture".
4. **Camera.** The camera handles three cases:
   - **Localised action** (a timer ring, a toggle, a list growing): it eases in up to 1.3× on a critically damped
     spring. It looks 0.6 s ahead and holds each target at least 0.8 s.
   - **Calm footage:** a slow 4.5 % push.
   - **Every new scene:** settles in from 4.5 % closer.

   Recordings are 1320 px wide on an 886 px canvas, so 1.3× still shows native pixels.
5. **Captions.**
   - Every word rises out of its own mask and leaves upwards, accelerating, before the cut.
   - A number in the caption rolls into place digit by digit (odometer). `effect: "decode"` makes a Latin-script
     caption scramble and lock letter by letter instead.
   - An iOS-style progressive blur scrim softens the app's own header under the type.
   - The caption sits on the side away from the action, in dark or light against the footage.
   - The hook's caption is on screen from the first frame.
6. **Timing.**
   - The hook runs about 3.2 s and the other scenes about 2.8 s. Each scene is stretched until its caption can be
     read: 0.5 s plus the character count ÷ 17.
   - Scenes are joined by 10-frame dissolves, with a 2.2 s end frame; the total stays between 15.4 and 29.6 s.
   - Apple's default poster frame (5 s) always lands on a finished caption. The board also marks the strongest
     poster pick.
7. **End frame.**
   - The last scene blurs behind the app icon, name and subtitle.
   - The subtitle is shown only in the viewer's language. A locale without one restates its hook caption instead, so
     an English line never closes a Hindi preview.
   - If the scan found subscriptions or in-app purchases, a localised disclosure is added, in 22 languages.
   - `end: "disclosure"` keeps only the disclosure; `end: "none"` drops the end frame.
8. **Touches and spotlight.**
   - Taps saved next to a clip become touch hotspots, the graphic Apple allows. A dot appears just before the press,
     presses in, and releases into a fading ring; swipes glide along their path.
   - Each tap is snapped to the screen's reaction, so rough times are enough.
   - Taps also steer the preview: the chosen window keeps a beat before each tap and the result after it, and the
     camera leans in on the tapped spot.
   - A spotlight (a rect, or `"auto"`) dims the rest of the screen for up to 1.6 s before the finger lands.
9. **Motion laws.** Movement follows values measured frame by frame on hand-animated reference videos, not
   values tuned by eye:
   - an entrance keeps 0.81 of its remaining distance every frame at 60 fps: no bounce, 90 % there in about 0.19 s;
   - an exit grows ×1.45 a frame, so it accelerates out;
   - blur is held for a moment and released after the move has landed, which makes an entrance feel heavy;
   - siblings never arrive together: words are 4 frames apart;
   - icons, badges and the call-to-action pill pop with a small overshoot.
10. **Motion blur.** Frames where the camera or the type moves are rendered as 6 samples across a 180° shutter, then
   averaged. The footage frame stays fixed, so the UI never ghosts.
11. **Encoding.** H.264 High at Level 4.0, constant 10 Mbps, 30 fps, bt709. A silent stereo 256 kbps AAC track at 48
   kHz is added; with `--music`, that track is replaced by the music, faded in and out and loudness-normalised.
   `--sfx` mixes sound effects on top.
12. **Motion QA.** Every finished video is checked frame by frame for three defects: a dead hold (more than 1 s with
   nothing moving), bare frames in a cut (reads as a dropped frame) and a static opening (frame 0 empty, or nothing
   moving in the first second). The warnings appear on the board, in the report and in `check.mjs`.

The first frame is the autoplay start and the thumbnail, so it must be full and already moving. When the hook's
recording idles for its first second, Appshot starts it just before the first change.

`style: "framed"` keeps the older look: the caption above a rounded screen on the theme background. Apple has
rejected exactly that framing, so use it only for promo videos.

### Recording real footage

`record` drives `xcrun simctl io recordVideo`, or `adb shell screenrecord` with `--android`.

- The status bar is set to 9:41 with full bars, like the screenshots.
- `--url` opens a deep link first.
- `--locale de-DE` writes to `raw/de-DE/clips/`.
- Without `--seconds`, recording stops when you press Enter.

Use the app while it records: you, a Maestro flow or the agent through the iOS Simulator tool. Keep it to one clear
action per clip (scroll a list, start a timer, tick a task), slow and deliberate, 4–8 s. Recordings are converted to
a constant 30 fps, with the last frame held when the screen stops changing. A long recording can be trimmed per
segment with `preview.segments[].start` and `end`.

Start the hook clip on a full, finished screen, because its first frame is the autoplay start and the thumbnail.

Touch hotspots come from taps, in three ways:

```bash
node scripts/preview.mjs taps --name focus --add "1.2,0.5,0.92"     # by hand: seconds,x,y (fractions); lists snapped times
node scripts/preview.mjs tap --name focus --at 0.5,0.92             # live, while `record` runs, right before each tap
```

Taps can also go inline in the plan, under `preview.shots.<id>.taps`. They are stored in
`raw/[<locale>/]clips/<name>.taps.json`, and UI-test pipelines can write that file from their own tap logs.

Recordings the project already has (UI-test captures, QuickTime takes, marketing clips) can be reused. `clip` trims
one into the workspace, converts it to 30 fps and notes the source in `clips/sources.json`. The original file is not
touched:

```bash
node scripts/preview.mjs clip --from ../Marketing/Captures/en/26-universe.mp4 --name universe --start 1.2
```

Footage always matches the screenshots that follow it:

- unlocalised clips in `raw/clips/` serve every locale whose captures are unlocalised;
- a locale with its own captures (for example `raw/pt-BR/`) needs its own clips;
- a phone recording never replaces an iPad capture.

### plan.json

```json
"preview": {
  "sizes": ["preview-iphone"],
  "style": "store",
  "count": 5, "hook": 3.2, "segment": 2.8, "crossfade": 0.33, "end": "brand", "poster": 5,
  "camera": "auto", "maxZoom": 1.3, "captionAt": "auto", "blur": true,
  "tagline": { "en-US": "AI home workout plans" },
  "disclaimer": { "en-US": "Some features require a subscription." },
  "segments": [
    { "shot": "today" },
    { "shot": "workout", "clip": "raw/{locale}/clips/session.mp4", "start": 2.5, "end": 8 }
  ]
}
```

Every key is optional.

- `disclaimer: false`, `captions: false` and `end: "none"` remove those parts.
- `segments[].start` and `end` limit the window the preview may pick from.
- `segments[].focus` (`[x, y, w, h]` fractions) aims the camera by hand.
- `segments[].spotlight` is a rect or `"auto"`; `spotlight: "auto"` turns spotlights on for every scene.
- `shots.<id>` takes the same keys for the automatic story without replacing it, for example
  `"shots": { "focus": { "spotlight": "auto" } }`.
- `touches: false` hides the touch hotspots.
- `--camera none` and `--no-blur` turn those layers off.

### Uploading

`export.mjs` copies the videos to `export/upload/ios/<locale>/app-previews/`. Upload them in App Store Connect → your
version → Previews and Screenshots, under the largest iPhone display (`ipad.mp4` goes under iPad 13"), and set the
poster frame there. Processing can take up to 24 hours. fastlane does not upload app previews.

### Music, variants and promo videos

**Music on the beat.** With `--music track.m4a` (or `preview.music`, plus `musicStart` to start later in the track),
`engine/lib/beats.mjs` finds the tempo and the beats and moves every cut and the end frame onto the nearest beat. Each
caption still keeps its reading time. The track is faded and loudness-normalised. Free-tempo music keeps the normal
timing, and the music must be licensed for every territory.

**Sound effects.** With `--sfx` (or `preview.sfx`), sounds from a pack you own are placed on the events the
storyboard already knows: a whoosh when the promo device rises in and on the first three pushes, a very low swish on
every other cut, a click on every tap, a ticker under a rolling number, typing under a decoding caption, one sparkle
when the icon lands on the end card and a pop for the call to action. The peak of each sound lands on its frame. The
pack is the folder you give (`--sfx <folder>` or `preview.sfx`), or the one in `$APPSHOT_SFX`. Appshot ships no sounds, and a pack must never be copied into a repository.

**Variants B and C.** `--variant b` renders an action-first alternative that opens on the scene with a tap and the
most motion. `--variant c` opens on the fullest, most finished screen: the result the app gives you. They go to
`out/preview/<locale>/variants/<b|c>/` and are exported to `app-previews/variant-<b|c>/`. Use them as Product Page
Optimization treatments against the original, because a weak preview can lose to screenshots.

**Promo videos.**

```bash
node scripts/preview.mjs --promo                         # 1080×1920 vertical + 1920×1080 landscape
node scripts/preview.mjs --promo --sizes promo-square    # 1080×1080
```

The same story, made for social media, YouTube and the Google Play promo video:

- the footage inside a CSS device that rises in and floats in 3D;
- the brand background with the app's animated key-art scene behind it;
- big kinetic captions, with rolling numbers;
- scenes pushing in sideways;
- touch hotspots and spotlights inside the device screen, with a beam of light running around the spotlit control;
- an end card with an optional `preview.cta`, which pops in with a beam running around it.

Output goes to `out/promo/<locale>/` and is exported to `export/promo/`. Promo videos have device frames, so they are
not App Store previews, and `check.mjs` skips them. For Google Play, upload `landscape.mp4` to YouTube and paste the
link as the promo video.

---

## Google Play feature graphic

```bash
node scripts/graphic.mjs --type play-feature --tagline "Home workouts that adapt" --locale en-US
```

Renders the required 1024 × 500 feature graphic (`banner` layout: icon, name, one-line promise, devices) from the
same theme and screens. The output is `appshot/out/graphics/play-feature.<locale>.png`, which export puts in the
fastlane `supply` folder. The App Store types in `graphic.mjs` redirect to `creative.mjs`.

---

## Check and export

```bash
node scripts/check.mjs [--strict]     # final gate; exit code 1 if anything would be rejected
node scripts/export.mjs --zip         # package for upload
```

`check.mjs` validates:

- every PNG: exact store sizes, no alpha, shot counts, Play aspect ratio;
- policy: it re-runs the copy lint and blocks placeholders;
- creative assets: sizes, formats, alpha, video fps and duration, and no video in the 16:9 universal slot;
- app previews: accepted resolution, 15–30 s, at most 30 fps, H.264 level 4.0 or lower, 10–12 Mbps, stereo audio at
  44.1 or 48 kHz, 500 MB at most, three per locale at most.

`export.mjs` writes:

```
export/
  fastlane/screenshots/<appStoreLocale>/<NN>_<size>.png              → fastlane deliver
  fastlane/metadata/android/<playLocale>/images/<type>/<N>.png        → fastlane supply (+ featureGraphic.png)
  upload/<store>/<locale>/<size>/...                                  → manual drag and drop
  upload/ios/<locale>/creative-assets/                                → App Store header and search results
  upload/ios/<locale>/app-previews/                                   → App Store app preview videos (+ variant-b/)
  promo/<locale>/                                                     → promo videos (social, YouTube, Play)
  README.md                                                           → exact upload commands
  *.zip                                                               → with --zip
```

```bash
fastlane deliver --skip_binary_upload --skip_metadata --overwrite_screenshots --screenshots_path export/fastlane/screenshots
fastlane supply --skip_upload_apk --skip_upload_aab --skip_upload_metadata --skip_upload_changelogs --metadata_path export/fastlane/metadata/android
```

---

## Editor

```bash
node editor/server.mjs --project /path/to/app [--port 4848]
```

A local editor on `http://localhost:4848`:

- live preview of every shot, size and locale;
- caption, layout, theme and option editing, with copy lint as you type;
- render and score buttons.

It writes the same `plan.json` the agent uses, and changes stream to open tabs over server-sent events, so you and
the agent can work on one plan at the same time.

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/state` | GET | plan, profile, registries (layouts, themes, sizes, locales) |
| `/api/compose` | POST | composed HTML for a size / locale / shot |
| `/api/plan` | PUT | save plan.json |
| `/api/lint` | POST | copy lint for the plan or one caption |
| `/api/render` | POST | draft or final render |
| `/api/score` | POST | score the current render |
| `/api/events` | GET (SSE) | live updates when plan.json changes on disk |

---

## plan.json

`plan.mjs init` drafts the structure from the profile and the niche: story order, layouts, screens, sizes, locales
and keywords. Captions are left empty on purpose so the agent writes them.

```json
{
  "app": { "name": "Pulse", "icon": "raw/icon.png", "subtitle": { "en-US": "AI Home Workout Plans" } },
  "theme": "volt", "themeOverrides": { "accent": "#C6F432" }, "panorama": false,
  "sizes": ["iphone-6.9", "iphone-6.3", "android-phone"], "locales": ["en-US", "de-DE"],
  "keywords": { "en-US": ["home workouts", "ai coach"] },
  "storeOverrides": { "android": { "theme": { "device": { "frame": "flat" } } } },
  "shots": [
    { "id": "hook", "layout": "billboard", "screen": "raw/today.png",
      "headline": { "en-US": "Home workouts that **adapt**" },
      "subhead": { "en-US": "25 minutes. Zero equipment." },
      "pop": { "rect": [0.043, 0.409, 0.914, 0.155] },
      "alternatives": { "en-US": ["Get fit at home in **25 minutes**"] } },
    { "id": "form", "layout": "zoom-callout", "screen": "raw/workout.png", "zoom": { "rect": [0.045, 0.57, 0.91, 0.105] },
      "headline": { "en-US": "Perfect form, **every rep**" } }
  ],
  "creative": {
    "headline": { "en-US": "Your **pocket** trainer" },
    "video": true,
    "scene": "heartbeat",
    "search": { "layout": "creative-carousel" }
  }
}
```

Caption markup:

- `**highlight**` marks the one highlighted phrase;
- `_emphasis_` sets italic emphasis;
- `\n` forces a line break.

Validate with `node scripts/plan.mjs validate`. The full reference, with every field, every layout's fields,
`{locale}` paths, per-store overrides and the `creative` block, is `skills/core/plan-format.md`.

---

## Command reference

All commands are `node scripts/<name>.mjs …`, run from the app project root or with `--project <app>`.

| Script | Purpose |
| --- | --- |
| `doctor.mjs [--render]` | check Node, Chrome, Xcode / simulator, adb, Maestro, fastlane, ffmpeg and Google Fonts access; `--render` does a test render |
| `install.mjs [--project <app>] [--uninstall]` | link the skill for Claude Code, Codex and Cursor |
| `where.mjs` | print where everything lives |
| `workspace.mjs init \| status \| clean` | create, inspect or clean `appshot/` |
| `scan.mjs [dir] [--quiet]` | scan the project, write `profile.json` |
| `niche.mjs [--explain] [--set <id>] [--top 5]` | classify the niche |
| `brief.mjs [--force]` | scaffold `brief.md` |
| `keywords.mjs seed \| field \| coverage` | keyword candidates, App Store keyword field, caption coverage |
| `plan.mjs init \| validate \| show` | draft, validate or print the plan |
| `copy-check.mjs [--locale] [--store] [--strict] [--text]` | lint captions |
| `themes.mjs list \| board` | browse themes |
| `layouts.mjs list \| info \| board` | browse layouts |
| `palette.mjs [image] [--apply]` | colours from the icon or a screenshot, brand theme |
| `render.mjs [--draft] [--sizes] [--locales] [--only] [--variant] [--scale]` | render PNGs |
| `sheet.mjs [--draft]` | contact sheets and the search-result mock |
| `score.mjs [--draft] [--json]` | score 0–100 with fixes |
| `variants.mjs make \| tournament \| adopt \| list \| clear` | variants and A/B tests (the tournament also measures distinctiveness and reference match) |
| `reference.mjs add \| study \| apply \| list` | references the user likes: images, a folder, a video or an App Store link → measured style → a variant |
| `market.mjs scan \| show [--terms] [--country] [--limit]` | the top App Store apps for the same searches, measured; `review/market.png` |
| `design.mjs directions [--write] \| apply a\|b\|c \| explain` | three design directions for this app from niche, brand, market and reference |
| `localize.mjs status \| add \| sheet \| apply` | localisation workflow |
| `creative.mjs [--draft] [--video] [--explain] [--manual] …` | App Store header and search results images and videos |
| `scenes.mjs list \| pick \| board` | browse scenes, see the director's ranking |
| `preview.mjs [--draft] [--explain] [--sizes] [--style] [--orientation] [--music] [--sfx [dir]] [--no-sfx] [--camera] [--no-blur] [--variant b\|c] [--promo]` | App Store app preview videos, PPO variants B and C, promo videos, sound effects |
| `preview.mjs record --name <screen> [--seconds] [--url] [--locale] [--android]` | record real footage for the preview |
| `preview.mjs clip --from <recording> --name <screen> [--start] [--end] [--locale]` | reuse an existing recording as a preview clip |
| `preview.mjs taps --name <clip> [--add] [--swipe] [--clear]` · `preview.mjs tap --name <clip> --at x,y` | touch hotspots for a clip (by hand, or live while recording) |
| `metadata.mjs import \| init \| check \| keywords \| show \| export` | store text per locale: import, write with the app's own glossary, check limits and rules, pack the keyword field, fastlane export |
| `graphic.mjs --type play-feature` | Google Play feature graphic |
| `check.mjs [--strict]` | final store gate |
| `export.mjs [--zip] [--no-check]` | fastlane and upload folders |
| `run.mjs setup \| draft \| final` | mechanical stages in order |
| `capture/auto.mjs init \| plan \| run [--locales] [--only] [--tablet] [--record] [--android] [--yes]` | capture every language and device automatically (dry run without `--yes`) |
| `capture/ios-sim.mjs`, `capture/android.mjs`, `capture/web.mjs`, `capture/import.mjs`, `capture/maestro.mjs`, `capture/statusbar.mjs` | capture real screens |
| `play.mjs check \| experiments [--variants]` | Google Play rules check and store listing experiment packages |
| `event.mjs new \| check \| render [--video] \| list` | App Store In-App Event media and text |
| `results.mjs add \| list \| learn \| show` | record store test results; the design director learns from them |
| `market.mjs import <folder> --store play` | measure competitors' saved Play screenshots |
| `regress.mjs [--quick] [--update-golden]` | the whole regression in one command (`npm run regress`) |

`package.json` scripts: `npm run doctor`, `npm run example`, `npm run editor:example`, `npm run install-skill`.

---

## Configuration

| Variable | Effect |
| --- | --- |
| `CHROME_PATH` | path to the Chrome / Chromium / Edge binary when it is not found automatically |
| `CHROME_FLAGS` | extra flags passed to headless Chrome (space-separated) |

Chrome runs as `--headless=new` with a private temporary profile; your own Chrome is never touched.

---

## Examples

Two finished demo projects double as regression fixtures:

| Example | Stack | Set | Creative assets |
| --- | --- | --- | --- |
| `examples/pulse/` | Expo / React Native | dark fitness (theme `volt`), 7 shots, English | director picks `heartbeat` key art for the header, phrase + devices for search |
| `examples/penny/` | Flutter | light finance (theme `mint`), 6 shots, English | director picks `growth` key art, calm motion, 14 s loops |

Each has an `appshot/` workspace with `profile.json`, `brief.md`, `plan.json`, captures in `raw/`, and boards in
`review/`. The boards include contact sheets, search previews, theme and layout boards, creative boards and the scene
board. The screenshot sets score 99–100, and the creative assets pass `check.mjs`.

---

## Repository layout

```
SKILL.md          agent entry point for Claude Code (pipeline, modes, golden rules, knowledge map)
AGENTS.md         short instructions for Codex / Cursor
CLAUDE.md         notes for developing Appshot itself
skills/           knowledge the agent reads during a job
  core/           method, interview, brief, story, capture, plan format, render, export, modes, troubleshooting
  niches/         69 niche playbooks + _template.md
  copy/           hooks, formulas, voice, power words, proof, anti-patterns, length, sequence, rewrite drills, headline bank
  aso/            Apple / Google rules, creative assets, app previews, keywords, caption indexing, first impression, conversion,
                  testing, metadata, localisation, seasonal refresh
  design/         taste, layouts, themes, typography, colour, devices, composition, panorama, highlights, motion,
                  tablet, accessibility, anti-patterns
  locales/        22 locale playbooks
  review/         critique rubric, pre-ship checklist, how scoring works
engine/           renderer
  compose.mjs     plan → HTML strip (themes, layouts, frames, text fitting, motion timeline)
  render.mjs      Chrome → PNG, render reports
  video.mjs       looping videos (Chrome frames → ffmpeg)
  preview.mjs     app preview videos: storyboard, recorded clips, Chrome frames → ffmpeg at Apple's spec
  schema.mjs      plan validation
  registry.mjs    lists layouts, themes, frames, decor, scenes, sizes, locales
  sizes.json      every store size, creative-asset and app-preview spec
  locales.json    store locale codes, fonts, script rules
  templates/      21 screenshot layouts, banner, 4 creative layouts, the app-preview segment (+ shared helpers)
  scenes/         19 animated key-art scenes + _kit.mjs
  frames/         9 CSS device frames
  themes/         24 themes
  decor/          11 decor generators
  components/     11 UI components
  lib/            DevTools driver, PNG codec, colour, HTML helpers, copy rules, niches, director, footage
                  analysis, beat tracking, disclaimers, palette, util
scripts/          pipeline steps (scan/ detectors, capture/ tools)
editor/           local editor (server.mjs, index.html, app.js, style.css)
examples/         pulse (Expo), penny (Flutter), _kit (mock-screen styles)
```

---

## Development

Conventions:

- **Zero dependencies.** Use Node 22+ built-ins only: the global `WebSocket` for the DevTools protocol and `zlib`
  for PNG.
- **Code style.** ES modules, 2-space indent, single quotes. Keep files small and focused, each with a header
  comment that explains its job.
- **New layout.** Add `engine/templates/<id>.mjs` exporting `meta` (`id`, `name`, `summary`, `bestFor`, `needs`,
  `options`, optional `hook`) and `render(ctx)`. Register it in `skills/niches/_template.md`, in `LAYOUTS` in
  `engine/lib/niches.mjs` and in `skills/design/layouts.md`.
- **New theme.** Add `engine/themes/<id>.json` and list it in `skills/niches/_template.md` and
  `skills/design/themes.md`.
- **New scene.** Add `engine/scenes/<id>.mjs` exporting `meta` (`id`, `name`, `mood`, `poster`, `summary`, `niches`,
  `keywords`, optional `variants`) and `render(ctx, { hero, intensity, variant, box })`, built with
  `engine/scenes/_kit.mjs`. List it in `skills/design/motion.md`. Rules for scenes:
  - keep the hero inside `ctx.safe`;
  - spread the ambience over the full width;
  - make every motion periodic, with integer `cycles`;
  - `hero: false` renders the scene as a backdrop for other layouts;
  - use 2D transforms only. Do not force GPU layers: dozens of composited layers on 4K-class canvases run Chrome out
    of tile memory and leave black areas.
- **Store specs** live only in `engine/sizes.json` and `engine/locales.json`.

Regression check after engine changes:

```bash
node scripts/doctor.mjs --render
node scripts/scan.mjs examples/pulse --quiet
node scripts/render.mjs --project examples/pulse --draft
node scripts/sheet.mjs --project examples/pulse --draft      # then look at examples/pulse/appshot/review/
node scripts/score.mjs --project examples/pulse --draft      # should stay ≥ 95
node scripts/layouts.mjs board --project examples/pulse      # every layout renders
node scripts/creative.mjs --project examples/pulse --draft --video   # director + header/search/universal + looping videos
node scripts/scenes.mjs board --project examples/penny       # every scene renders (light theme)
node scripts/preview.mjs --project examples/pulse --draft --locales en-US   # app preview storyboard + draft video
node scripts/preview.mjs --project examples/pulse --promo --draft --locales en-US --sizes promo-vertical   # promo: device, 3D, push
node scripts/scan.mjs examples/penny --quiet && node scripts/render.mjs --project examples/penny --draft && node scripts/score.mjs --project examples/penny --draft
```

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `No Chrome/Chromium/Edge found` | install Google Chrome or set `CHROME_PATH` |
| test render hangs or fails | close other headless Chrome instances, or pass `CHROME_FLAGS` (e.g. `--disable-gpu`) |
| `Video needs ffmpeg` | `brew install ffmpeg`; images still work without `--video` |
| fonts look wrong | run with network access the first time (Google Fonts), or put the font files in `appshot/fonts/` |
| a caption shrinks or wraps to three lines | shorten it; the scorer flags shrunk text and three-line headlines in shots 1–3 |
| placeholder screens in the render | capture the missing screens into `appshot/raw/` (`capture/*.mjs`) |
| `check.mjs` fails | read the listed issue (size, alpha, count, ratio, policy) and fix the plan or the capture |
| parts of a large creative frame come out black | a scene forces too many GPU layers; use 2D transforms and no `will-change` (see Development) |
| an app preview segment shows a still instead of the recording | `preview.mjs --explain` says why: the clip is missing, is for another device class, or the capture is localised and the clip is not |
| the preview's first frame looks empty | the hook clip starts on a loading state; re-cut it with `preview.mjs clip --start` |

More: `skills/core/troubleshooting.md`.

---

## Golden rules and limits

- **Truth only.** Real UI and real features. Never invented ratings, awards, user counts, reviews, press or results.
  Unknown numbers stay `{placeholders}` until a real value with a `source` is given, and the checker blocks them.
- **Shots 1–3 decide.** They are what search results show, and shot 1 sells the outcome.
- **Captions are 2–6 words**, benefit-first, with one highlight.
- **Look before you ship.** A score is not a substitute for looking at the boards.
- **Transcreate, never translate.**
- **Store rules are hard constraints.** `copy-check` and `check` must pass. On Google Play, shots with ratings,
  awards, testimonials, prices, "free", "#1" or calls to action get `"skipOn": ["android"]`.
- **The app's code is never modified.** Everything is written inside `appshot/`.
- **Ask little, once.** At most three questions, only for what the code cannot tell.

Known limits:

- right-to-left mirroring is incomplete;
- creative-asset safe areas are assumptions until Apple publishes numbers;
- fastlane does not upload creative assets or app previews;
- an app preview built from still captures is a fallback: Apple wants footage captured on the device, so record
  clips;
- scenes are illustrations, so they never stand in for real UI or real numbers.

---

## Sources

- [Apple — Creative assets specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/creative-assets-specifications)
- [Apple — App Store asset best practices](https://developer.apple.com/app-store/asset-best-practices/)
- [Apple Developer Forums — header crop measurement (thread 850418)](https://developer.apple.com/forums/thread/850418)
- [aso.dev — Product Page Header and Search Results](https://aso.dev/app-store-connect/placements/)
- [Apple — App preview specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/app-preview-specifications)
- [Apple — App previews](https://developer.apple.com/app-store/app-previews/)
- [Apple — App Review Guidelines (2.3.4 previews)](https://developer.apple.com/app-store/review/guidelines/)

---

## License

Appshot is commercial software, licensed under the [Appshot End-User License Agreement](LICENSE.md). In short: you
may use it, on as many seats as you bought, for your own and your clients' apps, and you own everything it produces.
You may not share, resell or redistribute Appshot itself, offer it as a service, or sell modified versions or packs
built from it. The full terms in [LICENSE.md](LICENSE.md) apply.
