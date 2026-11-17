# Accessibility

Accessible screenshots are also the ones that convert: they can be read at thumbnail size, on a dim phone, by a
colour-blind viewer, and in a right-to-left language. Screenshots are images, so screen-reader users get none of the
caption text. Keep the same promises in the description, and on Google Play write the per-image alt text (140
characters or less, describe the screen; `skills/aso/google-play-rules.md`).

## Legibility at thumbnail size

- **Headline ≥ 10.5 pt at search size.** That means `fontSize ≥ 0.0875 × canvas width`, which is 8.75 u on iPhone
  (`typography.md`). The scorer deducts below 10.5 pt, deducts heavily below 9 pt, and costs most of the legibility
  score below 7 pt.
- **Weight.** Grotesk headlines at 700–900 (every grotesk theme already is). Serif themes (`editorial`, `cream`
  at 400) need shorter copy so they render at `max`. Never lower `headlineWeight` below 600 for shots 1–3.
- **Length.** 2–6 words and 2 lines. Every extra word shrinks every other word.
- **Subheads and in-app text are not readable in search.** Anything that must be read needs headline size or a
  magnified element (`zoom-callout`, `ui-pieces`, `floating-cards`).
- **Don't** use `outline` highlights, hairline decor behind text, or `grain` above 0.1 under captions.

## Contrast

| Element | Minimum | Target |
|---|---|---|
| Headline on its background (measured from pixels by the scorer) | 3:1 (large text) | ≥ 4.5:1 |
| Highlight word vs background (`color` mode) | 3:1 | 4.5:1, or use `pill` |
| Subhead, chips, card text | 4.5:1 | 7:1 |
| Pill text (`accentText`) on accent | 4.5:1 | automatic via `onColor` unless the theme fixes `accentText` |

- The `brand` theme pushes the accent to at least 3:1 automatically. Curated themes with an overridden `accent` don't,
  so check them yourself in the render (`review/draft-score.json` → `measuredContrast`).
- Weak spots: mesh blobs behind white text (`aurora`), the pale ends of vertical gradients (`sunset`, `ocean`,
  `calm`), every `playful` background, and photo backgrounds without an `overlay` (`color.md`).
- If the captured UI itself is low-contrast (grey-on-grey settings), don't present it as a hero. Zoom into a part
  that reads, or pick another screen.

## Motion-free by design

- The output is static PNGs, and nothing should depend on motion to make sense. Capture animated UI (breathing
  circles, progress rings, loaders) at the frame where its state is clear: "Inhale 4" with the ring expanded, a
  progress ring at a meaningful value.
- No speed lines, motion blur or "shaking" decor to fake energy. Use `tilted-device` (±6–9°) and a strong caption.
- If you also make an app preview video (outside this engine), keep it free of flashing, and lead with real UI.

## Colour-blind safe accents

- **Hue alone must not carry the meaning.** A `color` highlight is emphasis, which is fine, but it must never encode
  information ("green = included"). Check how far it differs from the body text in **lightness**:
  - **Hue-only (about 1.2–1.5:1 against white text):** `aurora`, `calm`, `forest`, `neon`, `ocean`, `playful`,
    `sunset` and `luxe`. In greyscale, or for many colour-blind viewers, the highlight disappears.
  - **Hue plus lightness (≥ 2.4:1):** `midnight`, `ember`, `glass`, `pastel`, `clean-light`, `editorial`, `cream`,
    `rose`, `mint`, `brand` and `soft-gray`.
- `pill`, `underline` and `marker` are shape-coded, so they are safe for every colour vision. Switch to them
  (`themeOverrides.highlight`) when the emphasis matters on a hue-only theme or the brand accent is red or green.
- Use **red vs green only with a second cue.** Stat-card trends use `theme.positive` (default `#22C55E`). Always keep
  the sign and direction in the text (`"trend": "▲ 18%"` or `"+18%"`). `comparison` already pairs colour with check
  and cross glyphs, so keep it that way.
- Avoid accent pairs that collapse for deuteranopes (red/green, green/brown) when you set `secondary` for `gradient`
  highlights or decor colours. Blue–orange and blue–yellow pairs survive.

## RTL locales (ar-SA, he)

What the engine mirrors automatically (the page has `dir="rtl"`):

- Caption alignment: `align: "left"` becomes right (`feature-list`, `bridge` and any `options.align`).
- Every flex row: chat bubbles (the user's bubble moves to the left, as in RTL messengers), checklist ticks, the
  notification icon, stat-card icons and chip icons.
- `zoom-callout`: the magnifier defaults to the left side.

What it does **not** mirror (choose these layouts carefully):

- `duo-devices` (back phone always left), `floating-cards` positions (`pos` is not localised), the rotation
  direction of `tilted-device` and `split-diagonal`, the `before-after` slider (before is always left), `banner`
  (text always left), and the `bridge`/panorama flow (always left to right).
- **Fixes:** prefer symmetric layouts for RTL-heavy sets (`hero-device`, `device-top`, `notification-stack`,
  `chat-bubbles`, `feature-list`, `trio-fan`, `text-hero`, `big-number`). For a mirrored two-step story, swap the
  capture contents per locale with `{locale}` paths (`"screens": ["raw/{locale}/step-1.png", "raw/{locale}/step-2.png"]`,
  saving the RTL captures in reversed order). Render RTL locales from a non-panorama variant plan (`panorama.md`).
- **Captures must be RTL too.** Run the app in Arabic or Hebrew so its UI mirrors, use the digits the app uses
  (Arabic-Indic or Western) consistently between captions and UI, and give Arabic headlines extra line height
  (`typography.md`).
