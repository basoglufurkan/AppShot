# Composition

Every template divides the canvas the same way, so you can predict where things land before rendering. Numbers are
fractions of canvas width (W) or height (H), taken from `engine/templates/_shared.mjs`.

## The zones (portrait)

| Zone | Phone | Tablet | Notes |
|---|---|---|---|
| Side padding | 7.5% W | 9% W | caption box width = W − 2 × pad |
| Top caption band (`topText`) | 5.8%–28.3% H | 5%–25% H | headline + subhead + eyebrow, vertically centred in the band |
| Device top edge | ≈ 30.5% H | ≈ 27% H | band bottom + 2.2% H (`hero-device`) |
| Bottom caption band (`device-top`) | 73%–95.5% H | 75.5%–95.5% H | the device hangs from the top edge (it may start above the canvas) |
| `full-bleed` caption | 5%–29% H, or 71%–95% H with `scrim: "bottom"` | same | white text on a black scrim (`scrimStrength` 0.88), with the UI under the caption blurred (`blur` 1.6 u) |
| `text-hero` block | icon, then a 30% H statement block, then chips, centred slightly above the middle | same | no device |

Everything below the band belongs to the device. Floating elements (cards, notifications, bubbles, magnifiers) overlap
the device on purpose and carry their own surfaces.

## What the search thumbnail does to your shot

- App Store search shows the **first three portrait screenshots** side by side under the app name. Each is about
  120 pt wide, roughly 9% of its pixels. A landscape screenshot takes the whole row. An app preview video appears with
  the first two screenshots. On iOS 27+, a 3:2 `appstore-search` creative asset (`graphic.mjs --type appstore-search`)
  replaces the screenshot strip in search when it's set.
- At that scale **anything under about 4 u becomes texture**. That includes the app's own body text, list rows, small
  chart labels and subheads (0.42 × the headline). What survives is the headline, big numbers, large shapes (rings,
  bars, cards), colour and faces.
- So a shot communicates through three things: the headline, one big number or shape, and the overall colour. If the
  benefit lives in small UI, enlarge it with `zoom-callout`, `ui-pieces` or `floating-cards` (stat values render at
  5.2 u). Never rely on the capture's own 14-pt text.
- Look at `review/search-<locale>.png` every iteration, and judge shots 1–3 at that size, not at full size.

## Device bleed

| Canvas | `hero-device` screen visible | Implication |
|---|---|---|
| iPhone 6.9″/6.3″ | ≈ 90% | the tab bar is just cut off |
| Play 9:16 (1080×1920) | ≈ 70% | the lower third of the capture is gone |
| iPad 13″ with a phone capture | ≈ 60% (phone kept at 0.74 W) | shrink it (`deviceScale` 0.5–0.56), see `tablet.md` |

- Bottom bleed is the default and looks premium. Top bleed (`device-top`) is a deliberate rhythm breaker for
  bottom-anchored UI.
- Don't bleed the sides on the hook. `tilted-device` and `bridge` crop corners, which is fine later in the set.
- If the key UI sits low in the capture, use `device-top`, `zoom-callout` (with `zoom.rect` on that area), or
  re-capture with the content scrolled up. Don't use `bleed: false` on shot 1.

## Text and device rules

- The report's `textOverDevice` is the share of the headline box covered by a device screen. Above 0.08 the scorer
  deducts 6 and `render.mjs` warns. Templates keep the band clear. Overlap only happens when you force it with
  `options.rotate` on hero layouts, or with a huge `deviceScale` on `tilted-device`.
- Overlays are allowed when they are UI-like objects with a surface: `cards`, `notifications`, `messages`, magnifier
  crops and chips. Plain caption text on top of a screenshot is not, except in `full-bleed`, where the scrim exists
  for that purpose.
- One caption block per shot. Don't fake a second headline with a giant chip or card.
- Alignment: centred is the default. `"options": { "align": "left" }` gives an editorial, magazine feel (`feature-list`
  and `bridge` are always left-aligned). Keep one alignment through shots 1–3. RTL locales flip left to right
  automatically.

## Making small UI legible

### zoom-callout

```json
{ "layout": "zoom-callout", "screen": "raw/workout.png",
  "zoom": { "rect": [0.045, 0.57, 0.91, 0.105], "side": "right", "zoom": 1.6 } }
```

- `rect` = `[x, y, w, h]` as **fractions of the capture**. Read the PNG, find the card, and estimate its fractions.
  Pulse's form-tip card is `[0.045, 0.57, 0.91, 0.105]`. An accent ring outlines the source on the device.
- Choose **one** self-contained element: a card, a chart *with* its number, a CTA, a single row. Wide regions
  (w/h ≥ 3) produce a short, readable magnifier. A tall region (h > 0.2) produces a magnifier that covers the device.
- The magnifier is at least 0.6 W wide (circles are 0.5 W). Above 0.8 W it is centred. Vertically it follows the
  source, staying below the caption. `zoom.scale` forces its width, `shape: "circle"` suits faces and dials, and
  `zoom.dim: 0.35` darkens the device and background around the ring (not the caption or magnifier), which looks heavy on light themes.
- `side` defaults to `right`, and to `left` in RTL locales.

### ui-pieces

```json
{ "layout": "ui-pieces", "screen": "raw/today.png", "options": { "dim": 0.35 },
  "pieces": [ { "rect": [0.05, 0.18, 0.9, 0.2] }, { "rect": [0.05, 0.62, 0.9, 0.12], "w": 0.7, "x": 0.22 } ] }
```

- Use 1–3 crops floating over a dimmed device. `w` is a fraction of the canvas (default 0.82). `x` and `y` are canvas
  fractions (by default they stack at caption bottom + 10%, 28% and 46% of H, centred). `rotate` defaults to ±2°.
- It is the "exploded widget" look for dashboards, widgets and cards. Each piece must be readable on its own, so pick
  wide crops. Three pieces is the maximum, and two is usually better.

### floating-cards

Use it to restate the screen's key numbers at 5.2 u: `cards: [{ icon, value, title, trend, pos }]`. `pos` is
`tl|tr|ml|mr|bl|br` (default order `tr, ml, br, tl`). Cards are 44 u wide (`w`) and lean ±2.5°. Use 2–3 cards, and
take every value from the captured screen or a real source.

## Google Play: the 20% caption rule

`check.mjs` adds up the text-block rectangles and warns when they exceed 20% of the canvas. On `android-phone`, a
2-line headline with a 2-line subhead is about 13%, and the headline alone is about 9%. `text-hero`, `big-number`
(two blocks) and `comparison` columns can go over. Drop the subhead on Play with a shot override:
`"storeOverrides": { "android": { "subhead": "" } }`. Play also asks for real UI to dominate frames 1–3, so keep
`text-hero`, `review-quote` and `comparison` out of positions 1–3 there.

## Whitespace and balance

- Leave the band breathing: a 2-line headline fills about 60% of it. Three lines plus a subhead plus an eyebrow
  fills 100% and looks cramped.
- Fill each slot with one device, or one device plus at most three overlays. The empty gradient around the phone does
  real work.
- Optical centre: `text-hero` sits its block slightly above the middle on purpose. Don't push content down with
  `\n\n`.
