# Colour

Every colour decision is about two things: whether the headline is readable at thumbnail size, and whether the set looks
like the app's icon. This file explains how the engine resolves colour and which levers to use.

## Curated theme, brand theme, or override

| Situation | Do this |
|---|---|
| Brand has one strong colour (most apps) | Keep a curated theme and set `"themeOverrides": { "accent": "#HEX" }`. You keep its tuned fonts, background and decor. |
| Brand has a full system (2–3 colours, a signature background) and the UI is soaked in it | `"theme": "brand"` with `"brand": { "primary", "secondary" }` (from `palette.mjs --apply`) |
| Brand colour fights every curated background | `"theme": "brand"` plus `"brand": { "background": "#HEX" }` to pin the background |
| You need a specific background (photo, gradient) and the brand theme otherwise | `"brand": { "bg": { "type": "linear", "angle": 180, "colors": ["#..", "#.."] } }` |

**How `theme: "brand"` derives a palette** (`engine/lib/color.mjs` → `brandPalette`):

- **Background:** if the primary's lightness is below 0.45, a near-black at the primary's hue (l = 0.10). Otherwise a
  near-white tint (l = 0.96). Force either with `brand.dark: true|false`, or set `brand.background` directly.
- **Secondary:** if you don't give one, the primary rotated 38° in hue.
- **Accent:** the primary, lightened on dark backgrounds and pushed until it reaches **3:1** against the background.
  Text is black or white, whichever contrasts more.
- **Background type:** a mesh of primary, secondary and a mix, unless you set `brand.bg`.

**Engine facts that bite:**

- `plan.brand` is **ignored** unless `theme` is `"brand"` (`compose.mjs` `resolveTheme`). With a curated theme, use
  `themeOverrides.accent`.
- `accentText` is the text colour inside pills, solid chips and user bubbles. When you override `accent` without
  `accentText`, the engine keeps the theme's `accentText` only if it still reaches 4.5:1 on the new accent. Otherwise
  it switches to black or white. Set `accentText` yourself only when the brand wants a specific colour there.
- `aurora` and `luxe` use the `gradient` highlight from `accent` to `secondary`. When you override `accent`, override
  `secondary` too, or the gradient ends in the old brand colour.
- A per-shot `"theme": "<id>"` (or `{ "id": "<id>", …patch }`) restyles that slot completely: background, colours,
  cards, device, **and** the type and highlight rules (font, weight, tracking, case, `emStyle`, highlight mode and
  colour), which are scoped per slot. `plan.themeOverrides` is applied on top. `"theme": "brand"` on a shot derives
  the palette from `plan.brand`. Because the type changes too, a theme switch mid-set reads as a different app. Use a
  **patch object** (`{ "bg": …, "text": … }`) for a background chapter, and a full switch only for a deliberate
  closer.
- A per-shot `background` doesn't change text colour. A dark photo on a light theme needs a matching patch on the
  same shot: `"theme": { "text": "#FFFFFF", "subtext": "rgba(255,255,255,0.8)" }`.

## Contrast targets

The scorer samples the **rendered PNG**: it takes the 10th and 90th percentile luminance inside the headline box.
Points: below 2.2:1 → 3/15, below 3.2:1 → 9/15, below 4.5:1 → 12/15, 4.5:1 or more → 15/15.

| Element | Target | Notes |
|---|---|---|
| Headline vs background behind it | ≥ 4.5:1 | the real pixels, including mesh blobs and photos |
| Highlight word (`color` mode) vs background | ≥ 3:1 | it is large bold text; if it's lower, switch to `pill` |
| Pill text vs pill (`accentText` on `accent`) | ≥ 4.5:1 | kept at or above 4.5:1 automatically when you override `accent` |
| Subhead vs background | ≥ 4.5:1 | `subtext` is 70–72% alpha of `text` by default |

`plan.mjs validate` also computes the highlight contrast for every theme the plan uses (accent vs the theme's base
colour, or `accentText` vs accent for pills) and warns below 3:1. That check uses the base colour, not mesh blobs or
photos, so the rendered score is the real test.

Theme baselines (text vs the background colour behind the caption band):

- **Very safe (≥ 7:1 everywhere):** `clean-light`, `soft-gray`, `mono`, `midnight`, `volt`, `neon`, `brutal`,
  `editorial`, `cream`, `luxe`, `finance-pro`, `forest`, `ember`, `pastel`, `glass`, `rose`, `mint`, `sky`.
  On `mint`, `rose`, `cream` and `soft-gray` the `color` highlight is only 3.0–3.6:1, which is fine for bold
  headline words but too low for a small chip.
- **Safe at the top, weak lower down:** vertical gradients that lighten downwards. On `sunset` white text sits at
  4.1:1 on the top colour but 1.8:1 at the bottom, `ocean` drops to 2.5:1 and `calm` to 3.0:1. Avoid bottom-caption
  layouts (`device-top`, and `full-bleed` with `scrim: "bottom"` only if you raise `scrimStrength`) on these themes.
- **Depends on the seed:** mesh backgrounds scatter blobs at the top *or* the bottom (the seed is app name + shot
  id). On `aurora` a bright cyan blob behind white text measures about 2.1:1. On `glass`, the text stays safe but the
  indigo highlight can drop to 2.5:1 on the blue blob. Brand meshes vary with your colours. Fix it with explicit
  blobs kept low:
  `"themeOverrides": { "bg": { "type": "mesh", "base": "#07061A", "colors": ["#5B3CFF","#00C2FF","#FF4FD8"],
  "blobs": [{ "color": "#5B3CFF", "x": 0.2, "y": 0.75, "r": 0.9 }, { "color": "#00C2FF", "x": 0.8, "y": 0.9, "r": 0.7 }] } }`.
- **Weak by design:** `playful`. White on `#4D96FF` is 2.9:1, and the `bgAlt` orange `#FF9F1C` is about 2.1:1.
  The heavy rounded type rescues it visually, but it still scores low. Either deepen the colours
  (`"themeOverrides": { "bgAlt": [{"type":"solid","color":"#2F6FE0"},{"type":"solid","color":"#D6404A"},{"type":"solid","color":"#12915A"},{"type":"solid","color":"#7B3FD1"}] }`)
  or switch to `highlight: "pill"` so the yellow carries dark text.

## Light vs dark, against the store

Store chrome is white in light mode and black in dark mode, and your three search thumbnails sit on it:

- A **white set** (`mono` `#FFFFFF`, the top of `clean-light`) loses its edge in light mode. A **black set** (`volt`
  `#0A0A0A`, `neon` `#050505`) loses its edge in dark mode. The device and headline still read, but the set looks
  borderless. Tinted or mid-tone backgrounds (`soft-gray`, `mint`, `sky`, `midnight`'s navy bloom, `ocean`, `sunset`,
  `finance-pro`) hold their edge in both modes.
- `review/search-<locale>.png` renders both modes side by side. Look at it. If the set vanishes in one of them, add
  tone (`themeOverrides.bg` with a slight tint, for example `#F4F5FA` instead of `#FFFFFF`) rather than adding a border.
- **Match the captured UI mode.** A dark-mode app on a light theme looks like a sticker, and the reverse looks like a
  hole. If the app has both modes, capture the one that matches the theme. Dark UI on a dark set is the premium default
  for AI, finance, fitness and media.

## Accent discipline

- Use **one accent hue** per set. It goes on the `**highlight**` word (one per headline, two at most), and the theme's
  glow, rings, sparkles, chips and stat-card icon tiles also default to it, which keeps the set coherent for free.
- Take the accent from the icon or the app's primary button, not from a mood board. Check `palette.mjs` output: if
  the dominant icon colour is a dark navy, the accent should be the icon's *bright* secondary.
- Don't recolour decor with extra hues (`decor[].colors`) unless the theme already does (`brutal`, `playful`). Three
  accents read as a template, not a brand.
- `.hl` styling applies wherever `**…**` appears: bullets, cards, chips, notification text and comparison columns.
  On `comparison`'s right column, which is filled with the accent, a `color`-mode highlight is **invisible**. Keep `**`
  out of that column, and out of solid chips.
- Trend values on stat cards use `theme.positive` (default `#22C55E`). On red-heavy themes (`ember`, `sunset`) green
  can feel off-brand, so set `"themeOverrides": { "positive": "#FFFFFF" }` and keep the `+` sign in the text.

## Backgrounds

- Per shot: `"background": { "type": "solid|linear|radial|split|mesh|image", … }`. In normal plans it replaces the
  theme background for that slot. Theme decor still draws on top.
- `image` backgrounds: `src` is **not** resolved against `appshot/`, so a relative path renders nothing. Use an https
  URL or an absolute `file://` path, and always add an `"overlay": "rgba(0,0,0,0.45)"` under white text.
- `split` (`colors: [a, b], at: 0.55, angle: 165`) gives a two-tone card look. Keep the caption on one colour.
- Avoid flat pure white, black or dark grey on the Play **feature graphic** (Play guidance). Use a tinted theme
  background there.
