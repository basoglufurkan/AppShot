# Taste: what top-grossing screenshot sets have in common

The bar is a set that a Calm, Duolingo or Revolut growth team would ship. Those sets don't win on decoration. They win
because each frame can be read in under a second from a search thumbnail, and because the frames look like they belong to
one product. Every rule below maps to a `plan.json` field you can change. Ids refer to `engine/themes/*.json`
and `engine/templates/*.mjs`.

## 1. One idea per shot

- **Do:** one benefit, one screen, one highlighted word. If the caption needs "and", split it into two shots.
- **Do:** give each shot at most two supporting elements. That means headline + subhead, *or* headline + `cards`,
  *or* headline + `notifications`. Never all of them.
- **Don't:** use `eyebrow` as a second headline. It is a chip for a category tag ("Pro", "New in 2.0", "Offline").
- **Don't:** use `feature-list` before shot 4. A bullet list is several ideas at once and works only once the viewer is
  already interested.

## 2. The caption is the hero

- The headline must render big. The scorer converts the fitted size to points at search-thumbnail width
  (`fontSize × 120 / canvasWidth`) and wants ≥ 10.5 pt, which is ≥ 8.75 u on iPhone. Read `slots[].text[].fontSize` in
  `review/draft-report.json`. If it is below 0.82 × `max`, **cut words**. Don't lower `options.textSize`.
- Keep shots 1–3 to two lines. Put the `\n` where the meaning splits ("Home workouts\nthat **adapt to you**"),
  not where the text happens to wrap.
- A subhead renders at 0.42 × the headline size, which is about 5 pt in search, so it is unreadable there. Put nothing in
  a subhead that shot 1 depends on. Use subheads for product-page readers, and keep them to 12 words or fewer.
- **Don't** let text overlap the device. Templates keep the caption band clear. If `textOverDevice` > 0.08 in the
  report, the composition score drops 6.

## 3. Device big and real

- Use real captures from the submitted build, a 9:41 status bar and fictional demo data (`skills/core/capture.md`).
  A placeholder screen costs 12 composition points and fails `check.mjs`.
- `hero-device` at the default `deviceScale` (0.8) bleeds off the bottom and shows roughly the top 90% of the screen
  on iPhone and about 70% on the 9:16 Play canvas. Put the money UI in the **top two thirds** of the capture.
- If the screen's best part is at the bottom (CTA, tab bar, bottom sheet), use `device-top` rather than shrinking the
  phone. If the best part is small (a chart value, a widget, a form tip), use `zoom-callout` (`zoom.rect`) or `ui-pieces`.
  Never shrink the whole device to make room for words.
- `bleed: false` (hero-device only) shows the whole phone at a smaller size. Use it on a closer, never on shot 1.

## 4. Contrast that survives a thumbnail

- The scorer samples real pixels under the headline: below 3.2:1 loses most of the contrast points, and 4.5:1 or more
  gets full marks. Mesh, image and photo backgrounds are where this fails. See `color.md`.
- Your shots sit on white (light mode) or black (dark mode) store chrome. A near-white set (`clean-light` without tone,
  `mono`) dissolves into the light-mode page, and a pure-black set (`volt` `#0A0A0A`, `neon`) dissolves into the
  dark-mode page. Check both halves of `review/search-<locale>.png`. A set with a mid-tone or tinted background
  (`soft-gray`, `mint`, `sky`, `midnight`, `ocean`, `sunset`) reads as a distinct card in both.
- Use one accent. It goes on the `**highlight**` word and appears once in the captured UI. Don't add a second accent
  through decor colours.

## 5. Rhythm across the set

- Never use the same layout twice in a row (−2 story points). Use at least 4 different layouts in a 7-shot set
  (the scorer deducts 4 when unique layouts ÷ shots < 0.4).
- Alternate device-led and text-led frames, and tilt at most every other shot. A proven 7-shot rhythm (Pulse):
  `hero-device → zoom-callout → floating-cards → tilted-device → notification-stack → feature-list → text-hero`.
- Shots 1–3 should share the headline position (top band), device finish and shadow so the search triptych reads as
  one product. Save rhythm breakers (`device-top`, `split-diagonal`, and `full-bleed` unless the app is content-first) for shot 4
  onward.
- Colour rhythm: one theme per set. If you want colour change, use a theme with `bgAlt` (`playful` rotates five
  backgrounds) or a deliberate per-shot `background` that marks a chapter. Never pick backgrounds at random.

## 6. Restraint with decor

- Theme decor is already tuned (grain 0.05–0.09, a single glow). Add **at most one** shot-level `decor` in a whole set,
  and only where it carries meaning: `confetti` on the streak/goal shot, `sparkles` on the AI shot, `rings` behind a
  compass, scanner or radar, `beams` behind a single hero device.
- Decor always renders behind text and devices, but busy decor behind the caption band still lowers measured contrast.
  Keep `y` for glows and rings at 0.6 or more (behind the device), not behind the headline.
- **Don't:** use `confetti` or `shapes` in finance, health, faith or legal apps, a `glow`/neon look on a calm app, or
  `grain` above 0.1. To clear a theme's decor, set `"themeOverrides": { "decor": [] }`.

## 7. Consistency with icon and brand

- In search, shots 1–3 sit right next to the icon, so the set should look like the icon's family. Run
  `palette.mjs --apply` (writes `plan.brand`). Then either use `"theme": "brand"` or keep a curated theme and set
  `"themeOverrides": { "accent": "<icon colour>" }`. The second is usually better because you keep the curated
  fonts and decor.
- A dark icon on a dark set reads as one block. A light or colourful icon on a dark set pops. Both work. A purple set
  next to a green icon does not.
- Match the app's own UI mode. Dark UI goes with dark themes (`midnight`, `volt`, `aurora`) and light UI with light ones.
  Mismatched modes make the screenshots look pasted in.

## Picking a theme in 30 seconds

| App mood | First pick | Alternatives |
|---|---|---|
| Utility, productivity, pro tools | `soft-gray` | `clean-light`, `mono`, `glass` |
| Finance, banking, business | `finance-pro` | `midnight`, `clean-light` |
| AI, creative tools | `aurora` | `midnight`, `glass` |
| Intense fitness, sport | `volt` | `ember`, `neon` |
| Sleep, meditation, wellness | `calm` | `pastel`, `forest` |
| Food, home, journaling, books | `cream` | `editorial`, `sunset` |
| Beauty, self-care, cycle tracking | `rose` | `pastel`, `glass` |
| Kids, casual games, learning | `playful` | `sky`, `brutal` (Gen-Z) |
| Gaming, VPN, crypto | `neon` | `midnight`, `aurora` |
| Luxury, astrology, premium membership | `luxe` | `aurora`, `editorial` |
| Faith (Bible, Quran, prayer times) | `cream` | `luxe`, `forest`, `calm`, `soft-gray` |
| Nature, plants, outdoors | `forest` | `mint`, `sky` |
| Weather, travel | `sky` | `ocean`, `sunset` |
| Strong existing brand system | `brand` | curated theme + `themeOverrides.accent` |

Shortlist 2–3 themes, then run `themes.mjs board --themes a,b,c` and `variants.mjs make --themes a,b` with a
tournament. Let the eye and the score pick.

## Five tests before you call it done

1. **Squint.** View `review/contact-*.png` at 25%. Every headline in shots 1–3 must still be readable.
2. **Icon.** In `review/search-*.png`, does the trio look like the icon's family, in both light and dark mode?
3. **Swap.** Replace your app name with a competitor's. If every caption is still true, the set is generic. Add the
   differentiator or a real number.
4. **Remove.** Take one element off each shot (subhead, a card, a decor layer). If nothing is lost, leave it off.
5. **Store.** The Play set must have a flat frame, no rotation, no social proof and captions under 20% of the canvas
   (`devices.md`, `anti-patterns.md`).
