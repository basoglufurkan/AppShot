# Visual anti-patterns

These are the mistakes that make a set look amateur or get it penalised by a store. Each one names the symptom you'll
see in `review/contact-*.png`, `review/search-*.png` or the render report, and the fix in `plan.json` terms.
(Caption-writing mistakes are in `skills/copy/anti-patterns.md`.)

## Type

1. **Shrunken headline.** In the report, `fontSize` is near `min` (about 71 px on 6.9″). The fit loop shrank long
   copy and it reads at about 6 pt in search. **Fix:** cut to 2–6 words. Don't lower `textSize`.
2. **Three lines in shots 1–3.** This scores −3 and is slower to read. **Fix:** shorter copy and a deliberate `\n`.
3. **The subhead carries the point.** It renders at 0.42× the headline (about 5 pt in search). **Fix:** move the
   benefit into the headline, and use `"subhead": ""` (or none) on shots 1–3.
4. **ALL CAPS typed in the source.** Breaks German ß, and lint warns. **Fix:** write sentence case and
   let `case: "upper"` (ember) or `themeOverrides.case` do it.
5. **Faux italics.** `_word_` on a sans theme gives a synthetic slant. **Fix:** remove it, or use `editorial` or
   `cream`, or `"themeOverrides": { "emStyle": "normal" }`.
6. **Mixed glyphs in one word.** A Cyrillic or Vietnamese headline on a Latin-only face (`aurora`, `sky`, `pastel`,
   `rose`, `brutal`, `cream`). **Fix:** a covered theme, or `"css": ":lang(ru) .hd{font-family:Inter,sans-serif}"`
   (`typography.md`).
7. **Hyphenated hero word.** In `de-DE`, `nl-NL` and `sv` the fit loop hyphenates long words as a last resort when the
   headline won't fit even at `min` (the report shows `hyphenated: true`). **Fix:** rewrite with shorter words.
   Don't accept the hyphen.

## Highlight and colour

8. **Highlighted filler.** "**Your** workouts" scores −3, and the eye lands on nothing. **Fix:** highlight the outcome
   or the number.
9. **Three highlights.** Lint warns, and the eye gets no single landing point. **Fix:** one per headline.
10. **Marker on a dark theme.** White text on a lime or cyan band is unreadable. **Fix:**
    `themeOverrides.highlight: "pill"`.
11. **Gradient on a light background.** The light stop vanishes. **Fix:** `color` or `pill` on light themes.
12. **Outline highlight in search shots.** The stroke is about 0.4 px at thumbnail size. **Fix:** use it only on a
    `text-hero` closer.
13. **Theme hopping.** A per-shot `"theme": "<id>"` swaps fonts, case and highlight too, so three typefaces in one
    set read as three apps. **Fix:** one plan theme. For a chapter change, patch only the background
    (`"theme": { "bg": {…}, "text": "#FFFFFF" }`).
14. **Set colour unrelated to the icon.** **Fix:** run `palette.mjs --apply`, then `themeOverrides.accent`, or
    `"theme": "brand"`.
15. **Caption on a bright mesh blob.** `measuredContrast` < 3.2. **Fix:** explicit `bg.blobs` with low `y`, a
    `pill` highlight, or a solid or linear background.
16. **Bottom caption on a gradient that lightens downward** (`device-top` on `sunset`, `ocean` or `calm`). White
    text on the pale end. **Fix:** a top-caption layout, or a per-shot `"background"` that is darker at the bottom.
17. **Dark per-shot background with dark text.** A per-shot `background` doesn't change the text colour. **Fix:**
    add `"theme": { "text": "#FFFFFF", "subtext": "rgba(255,255,255,.8)" }` on that shot.
18. **Mode mismatch.** A dark-mode capture on a light theme (or the reverse) looks pasted in. **Fix:** change the
    theme or re-capture in the matching appearance.

## Devices and screens

19. **Placeholder or empty screens.** Costs −12 composition points and fails `check.mjs`. **Fix:** capture with seeded,
    fictional demo data and a 9:41 status bar.
20. **Benefit cut off by bleed.** The key element sits in the bottom 30% of the capture (lost on Play 9:16). **Fix:**
    `device-top`, `zoom-callout` on that rect, or re-capture scrolled.
21. **Unreadable dense UI.** A dashboard shown whole at thumbnail scale. **Fix:** `zoom-callout` (`zoom.rect`),
    `ui-pieces`, or `floating-cards` restating the number.
22. **Shrinking the phone to fit more words.** `deviceScale` 0.6 on a hook. **Fix:** default size, fewer words.
23. **Tilted hook / tilt on every shot.** Reads as a template and pushes against Apple's "unmodified" preference.
    **Fix:** an upright shot 1, and `tilted-device` at most every other shot, with ±6–9°.
24. **Mixed finishes** (black, then silver, then clay) across the set. **Fix:** one `theme.device.color`. Use
    `deviceColor` only for a deliberate clay brand colour on every shot.
25. **Dated hardware.** `iphone-notch` on a current app. **Fix:** `iphone` (Dynamic Island). `iphone-classic` belongs
    only on `iphone-5.5`, where it is automatic.
26. **Invisible outline frame.** The `outline` stroke defaults to `#111111`, which disappears on dark themes. **Fix:**
    `"deviceColor": "#FFFFFF"` and `"shadow": "none"`.
27. **Giant cropped phone on iPad.** A phone capture at the tablet default of 0.74 W. **Fix:** capture iPad UI
    (`screen: { "phone": "...", "tablet": "..." }`), or `"deviceScale": 0.52` (`tablet.md`).

## Set structure

28. **One layout everywhere.** Variety < 0.4 costs −4, and back-to-back repeats cost −2. **Fix:** follow the rhythm in
    `taste.md`.
29. **A text-only frame in positions 2–3** (`text-hero`, `comparison`, `review-quote`). This costs points, and Apple
    2.3.3 wants the app in use. **Fix:** move it to the closer.
30. **Multi-device hook** (`trio-fan`, `screen-grid`, `duo-devices` as shot 1). The phones are small and nothing is
    legible. **Fix:** `hero-device` or `floating-cards` first, and breadth later.
31. **Decor soup.** Confetti plus sparkles plus a glow plus grain. **Fix:** theme decor plus at most one meaningful
    shot `decor` for the whole set, or `"themeOverrides": { "decor": [] }`.
32. **Party decor in a serious niche.** `confetti` or `shapes` on finance, health, faith or legal. **Fix:** remove it.
    Use `glow` or `rings` if anything.

## Panorama

33. **Bridge into a centred layout.** The incoming half-phone covers the next shot's lower-left (a `text-hero`
    statement, a device, cards). **Fix:** chain `bridge → bridge`, or end on `full-bleed` with `scrim: "top"`,
    `feature-list` or `big-number`. Never `text-hero` or `comparison` there (`panorama.md`).
34. **Bridge on shot 1.** The hook thumbnail shows half a phone. **Fix:** three standalone shots first.
35. **Bridge into nothing on one store.** The next shot is `skipOn` there. **Fix:** a shot-level
    `"storeOverrides": { "android": { "layout": "hero-device" } }`.
36. **Panorama in RTL locales.** The carousel order is reversed. **Fix:** a non-panorama variant plan for `ar-SA` and
    `he`.

## Store-specific

37. **An iPhone on Google Play.** A shot-level `options.frame` is used on every store, and `adaptFrame` is bypassed.
    **Fix:** set frames at theme level, or scope them with `storeOverrides.ios.options.frame`. For Play:
    `"storeOverrides": { "android": { "theme": { "device": { "frame": "flat" } } } }`.
38. **Rotated images on Play.** Play guidance discourages rotated images. **Fix:**
    `"storeOverrides": { "android": { "layout": "hero-device" } }` on tilted, split and fan shots.
39. **Social proof on Play** (`social-proof`, `review-quote`, stars). Not allowed there. **Fix:** `"skipOn": ["android"]`.
40. **Caption above 20% on Play.** `check.mjs` warns. **Fix:** `"storeOverrides": { "android": { "subhead": "" } }`.
41. **Image background renders black.** A relative `background.src` is not resolved against `appshot/`. **Fix:** an
    https or absolute `file://` URL, plus an `overlay`.
42. **Before/after with no chips.** `labels: { "before": "…", "after": "…" }` written without locale keys is read
    as a localised string, and no chips appear. **Fix:** key the labels by locale:
    `"labels": { "en-US": { "before": "Before", "after": "After" }, "de-DE": { "before": "Vorher", "after": "Nachher" } }`.
