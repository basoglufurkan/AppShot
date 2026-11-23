# Capturing real screens

Screenshots sell the real product. Capture at the device's native resolution so pixels stay crisp after framing.

| Target canvas | Simulator / device to capture on | Capture size |
| --- | --- | --- |
| iphone-6.9 / 6.3 | a 6.9" iPhone: iPhone 18, 17 or 16 Pro Max | 1320×2868 |
| ipad-13 | iPad Pro 13-inch (M4/M5) | 2064×2752 |
| android-phone | Pixel 9 / any 1080-wide emulator | 1080×2400 (framed into 9:16) |
| web / PWA | `capture/web.mjs --device iphone` | 1320×2868 |

One iPhone capture serves both iPhone canvases; the engine keeps the frame's aspect.

## Before capturing: make it look lived-in

- **Demo account / seed data**: realistic names (not "Test User"), believable numbers, a streak in progress, a
  populated history, no empty states, no "Lorem ipsum", no debug banners, no personal data of real people.
- **State**: hide onboarding tooltips and permission sheets; finish loading spinners; pick the best moment
  (a chart with a rising trend, a completed task, a filled cart).
- **Appearance**: match the theme — dark UI for dark themes looks native; light UI on light themes. Capture both if unsure.
- **Language**: capture the UI in every locale you ship (`raw/de-DE/today.png`, referenced as `raw/{locale}/today.png`).
  Falling back to English UI inside a German caption set is acceptable for a first release, not ideal.
- **Status bar**: 9:41, full battery, full signal (`capture/statusbar.mjs on` or automatic in the capture scripts).

## iOS Simulator

Preferred inside Claude Code: the **iOS Simulator tool** (open the live panel with `attach`, build/launch the app, tap
to the screen, `screenshot`). Save each capture into `appshot/raw/<name>.png` (copy the screenshot file or run the
script below once the screen is showing).

```bash
xcrun simctl boot "iPhone 18 Pro Max" && open -a Simulator     # once; any 6.9" iPhone this Mac has
node $SKILL_DIR/scripts/capture/ios-sim.mjs --name today                      # whatever is on screen
node $SKILL_DIR/scripts/capture/ios-sim.mjs --name workout --url pulse://workout/full-body-burn --wait 2
node $SKILL_DIR/scripts/capture/ios-sim.mjs --name today --appearance dark
node $SKILL_DIR/scripts/capture/ios-sim.mjs --statusbar clear                 # when done
```

Deep links come from `profile.app.urlSchemes`; expo-router routes map to `scheme://route`.

## Automatic capture for every language and device

`scripts/capture/auto.mjs` launches the app in each locale (as `-AppleLanguages` / `-AppleLocale` launch arguments,
so the simulator's own language never changes), reaches each screen, waits until the screen has **settled** (launch
animations and splash fades over), saves the screenshot where the plan expects it and, with `--record`, films the
clip for the app preview (the recording also starts on the settled screen).

```bash
node scripts/capture/auto.mjs init                     # plan.capture from the scan: bundle id, URL scheme, every screen
node scripts/capture/auto.mjs plan --locales pt-BR,hi  # what exists, what is missing, how each screen is reached
node scripts/capture/auto.mjs run --locales pt-BR --record          # a DRY RUN: prints every step, changes nothing
node scripts/capture/auto.mjs run --locales pt-BR --record --yes    # does it
node scripts/capture/auto.mjs run --tablet --yes                    # iPad captures too (raw/ipad/<locale>/)
node scripts/capture/auto.mjs run --android --yes                   # Android: per-app locale + deep links (adb)
```

`plan.capture`:
- `ios.bundleId`, `ios.app` (a built .app to install first);
- `ios.device` / `ios.tablet`: leave them out — the run picks the newest 6.9" iPhone (1320×2868) / 13" iPad
  (2064×2752) simulator on this Mac by screen size, and the dry run names it. A named simulator this Mac lacks (plans
  from an older Xcode say "iPhone 17 Pro Max") is swapped for one with the same screen, with a warning;
- `ios.launchArgs`: the app's own debug flags — demo content, skip onboarding, and **an in-memory or test store**, so
  the run never touches the user's real data in the simulator (for example `-demo-data 40 -skip-onboarding
  -in-memory-store`, whatever the app's own UI tests use);
- `screens.<name>`: `url` (a deep link), `launchArgs` (flags that open that screen), `launch: true` (the screen the
  app opens on), `wait`, `record` (seconds), or `manual` (how a person reaches it — listed, never guessed).

**LOOK at what a run produced before keeping it** (lessons from a first real run, pt-BR):
- Compare each new capture with the one it replaces (`auto.mjs` overwrites; back the folder up first). A deep link
  can open a *different state* of the same screen (`myapp://focus` opened the setup screen, the old capture showed
  the running timer), and demo flags decide how rich a screen looks (40 vs 120 demo sessions: 33 vs 98 stars). Give
  each screen its own `launchArgs` for the demo size the app's own UI tests use.
- An idle screen films as a still: measure a clip before using it. Use the app's own motion flags (a
  synthetic-tilt flag can drive gyro parallax on the simulator) or film screens behind taps with UI tests.
- Some simulators draw the Dynamic Island into screenshots and recordings; Appshot's device frames draw their own, so
  keep stills without it.
- Shut down a simulator the run booted, if it was off before.

`init` guesses `scheme://<screen>` URLs and marks them `guess: true`: read the app's URL handling and fix them before
running. Screens behind taps (a finished session, a friend's room) need a UI test or Maestro; keep the app's own UI
tests for those and import their recordings with `preview.mjs clip`. Ask before a run that resets app data.
## Android emulator / device

```bash
node $SKILL_DIR/scripts/capture/android.mjs --name today --url pulse://today
node $SKILL_DIR/scripts/capture/android.mjs --demo off
```

Demo mode gives a clean status bar (09:41, full battery, Wi-Fi). Without deep links, navigate by hand and run with `--name`.

## Repeatable capture with Maestro

`node $SKILL_DIR/scripts/capture/maestro.mjs > appshot/capture.yaml` writes a flow with one step per missing screen.
Replace the TODO taps once; rerun for every locale (`maestro test --env LANG=de-DE …`) and every release.

## Web apps, PWAs and HTML prototypes

```bash
node $SKILL_DIR/scripts/capture/web.mjs --url http://localhost:3000/dashboard --name dashboard [--dark] [--selector ".loaded"]
node $SKILL_DIR/scripts/capture/web.mjs --dir designs/screens --outdir appshot/raw        # every .html in a folder
```

## The user's own screenshots

```bash
node $SKILL_DIR/scripts/capture/import.mjs ~/Desktop/shots/*.png
```

The importer reports size and device class and warns about low resolution.

## When nothing can be captured yet

Plan and write anyway: missing screens render as grey "PLACEHOLDER" mocks so layout and copy can be reviewed.
`check.mjs` blocks export until every placeholder is replaced. Never ship mock UI as the product.

## Screen recordings for the app preview

The app preview video (`skills/aso/app-previews.md`) is best made of real footage. Record one short clip per screen,
named like its capture, while you (or the user, or a Maestro flow) use the app:

```bash
node $SKILL_DIR/scripts/preview.mjs record --name focus --seconds 8 [--url myapp://focus] [--locale de-DE]
node $SKILL_DIR/scripts/preview.mjs record --android --name focus --seconds 8
```

Clips land in `raw/<locale>/clips/<name>.mp4` (constant 30 fps, 9:41 status bar) and replace the still capture in
every preview segment that shows that screen. One clear action per clip, slow, 4–8 s, no personal data on screen.
