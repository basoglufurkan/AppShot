# App Store creative assets — product page header and search results (iOS 27+)

App Store Connect → your app → Product Page Information → **Header and Search Results**. Optional, per locale,
image **or** muted looping video. Generated with `node scripts/creative.mjs` (images) and `--video` (videos).

## Specs (developer.apple.com — Creative assets specifications, checked 2026-11-05)

| Placement | Ratio | Size (px) | Image | Video |
| --- | --- | --- | --- | --- |
| Product page header | 21:9 | 3840 × 1646 | .png .jpg .jpeg | .mp4 .mov .m4v, 30 or 60 fps, 5–30 s |
| Product page header | 16:9 | 5244 × 2950 | .png only | — |
| Search results | 3:2 | 1920 × 1280 … 3840 × 2560 | .png .jpg .jpeg | .mp4 .mov .m4v, 30 or 60 fps, 5–30 s |
| Search results | 16:9 | 5244 × 2950 | .png only | — |

- Images: no alpha channel or transparency.
- Videos are **muted** in search (cannot be unmuted) and muted by default on the product page; both **loop continuously**.
- One 16:9 **universal** PNG can serve header *and* search results ("use a universal creative asset for your header
  and search results asset").
- If no search results asset is set, In-App Events, app previews and screenshots show instead — so this asset
  *replaces* your first three screenshots in search. Treat it as the hook.
- Same review rules as other metadata (Guideline 2.3.14): must relate to the app or brand; no unverifiable claims,
  no specific or discounted pricing.

Appshot ids: `appstore-header` (3840×1646), `appstore-search` (3840×2560; 1920×1280 also accepted),
`appstore-universal` (5244×2950) in `engine/sizes.json`.

## Apple's guidance (asset best practices)

- **Header**: "Focus on a single, clear idea." Design for a first-time visitor.
- **Search results**: "State the obvious" — the app's purpose must be clear at a glance; "showcase the firsthand
  experience" (interface, content, gameplay).
- **Text**: optional; "a short phrase that enhances your visual rather than describes it", localised for every language.
- **Safe area**: keep key elements inside the safe area of Apple's templates (Figma/Photoshop/Pixelmator/Sketch);
  keep the focal point centred "to prevent any unwanted clipping". Check with the Preview tool in App Store Connect.
- **Video**: a poster-worthy frame, lead with the value, "avoid quick cuts and fast-moving visuals", must work silently,
  "loops smoothly without visible jumps or breaks".
- **Don't**: prices, discounts, website URLs, copyright symbols, unverifiable claims or awards, other platforms or
  marketplaces, Apple recognitions (Editor's Choice, App of the Day, Game of the Day, Apple Design Award), content
  above a 4+ rating.

## How it is displayed (measured, not published)

Apple publishes no safe-area numbers. One developer measured it with a calibration grid (Apple Developer Forums
thread 850418, Oct 2026): in App Store Connect Preview and on live pages (iPhone 15, iOS 27.0.1) the **iPhone header
box is about 1.51:1** — the 21:9 asset is scaled to fill it, **≈17.6 % of the width is cut on each side**, the full
height shows. iPad and Mac show more of the width. Another report says an iPhone 17 looked different from Preview, so
always check Preview and a real device before shipping.

**Search results on iPhone show only the top of the asset.** Measured in App Store Connect Preview (2026-11-05,
on a live app): the search card is about **2.46:1**, shows the **full width** and only the **top ≈61 %** of the 3:2 asset
(top-aligned); the lower ≈39 % is cut. A strip of screens under a phrase therefore loses the bottom half of every
screen. Keep the phrase and whole screens in the top band; the lower part carries only ambience. iPad may show more.

| Asset | Safe area used (key elements) | Crops drawn on the board |
| --- | --- | --- |
| Header 21:9 | x 20 %, y 8 %, w 60 %, h 80 % | iPhone centre crop x 17.6 %, w 64.8 % |
| Search 3:2 | x 4 %, y 4 %, w 92 %, h 53 % | iPhone search: top 61 %, full width |
| Universal 16:9 | x 19 %, y 14 %, w 62 %, h 43 % | 21:9 band, 3:2 band, iPhone header (x 17.6 %, y 11.9 %, w 64.7 %, h 76.2 %), iPhone search (x 7.8 %, y 0, w 84.4 %, h 61 %) |

The search safe band is wider than 2.2:1, so the layouts switch to side-by-side there: `creative-carousel` and
`creative-scene` put the phrase beside the screens or the hero instead of above them.

The review board (`appshot/review/creative-<locale>.png`) draws the safe area in red and the crops in blue, shows
**what iPhone displays** (header and search crops) next to each poster, and lists the director's decisions at the top.
Always look at those iPhone previews: nothing that matters may be cut there.

## The director — the app decides its own creative

`creative.mjs` runs `engine/lib/director.mjs` first (skip with `--manual` or `plan.creative.auto: false`):

1. **Scene** — ranks the 19 scenes (`engine/scenes`) by the niche (`profile.niche`, runner-up at half weight) and by
   scene keywords found in the app's own words (description, features, plan keywords, captions). Below a score of 2,
   the app icon is the hero (`icon-glow`). Niche variants: language/translator → book `letters`, podcast/voice →
   sound `voice`, dating → chat `dating`, astrology → night-sky `constellation`.
2. **Header** → `creative-scene`: one idea, hero centred for the iPhone crop, no text (the name and subtitle are right
   under it). Games with 3+ captures → `creative-stage` (gameplay is the idea).
3. **Search** → `creative-split` (phrase + real UI over the scene's ambience); content-led niches with 4+ captures →
   `creative-carousel`; no captures → `creative-scene` with the phrase.
4. **Universal** → `creative-stage` over the scene (reads in both crops), or the header key art without captures.
5. **Motion** — calm for trust-first niches (money, health, sleep, security, faith), lively for games, kids, social,
   music; loop 14 / 12 / 10 s.
6. **Phrase** — the screenshot hook if ≤ 6 words, else its shortest alternative; `plan.creative.headline` wins.

Decisions and reasons: `appshot/review/creative-direction.json`; `creative.mjs --explain` prints them without
rendering; `scenes.mjs pick` shows the scene ranking; `scenes.mjs board` renders every scene in the app's theme.
Anything in `plan.creative` overrides the director key by key.

## Workflow

1. Screenshots first — creative assets reuse the plan's theme, screens, hook and cards.
2. `node scripts/creative.mjs --draft` → the director decides; **look at the board** (poster, six moments of the
   loop, safe area, crops, reasons). Disagree? Set only what you want in `plan.creative` (e.g. `"scene": "pond"`,
   `"search": { "layout": "creative-carousel" }`) and draft again. `scenes.mjs board` helps choose a scene.
3. Phrase: ≤ 6 words, may differ from the screenshot hook (it does not have to describe the visual). Localise it
   (`plan.creative.headline` per locale). `copy-check` rules apply (no price, URL, ©, awards, platforms).
4. `node scripts/creative.mjs --video` → final images and videos (H.264 .mp4 by default; `--codec hevc` smaller,
   `--codec prores` .mov master; `--fps 60` for silkier motion; `--duration 5…30`).
5. `node scripts/check.mjs` validates sizes, formats, alpha, fps and duration; `export.mjs` puts them in
   `export/upload/ios/<locale>/creative-assets/`. Upload by hand (fastlane does not support creative assets yet).

## Testing and refresh

Creative assets can be swapped on the live version (approve in Asset Library, then Browse Assets) and tested with
Product Page Optimization — see `testing.md` and `seasonal.md`. Good first tests: key art (`creative-scene`) vs
devices (`creative-stage`) for the header, `creative-split` vs `creative-carousel` for search, image vs video. One
header per Custom Product Page lets each ad campaign get its own.

## In-App Events (event card and details page)

```bash
node scripts/event.mjs new winter-challenge --badge Challenge --start 2026-12-20 --end 2027-01-10 [--scene night-sky]
node scripts/event.mjs check winter-challenge          # name 30 (title case), short 50, long 120, badge, dates, no prices
node scripts/event.mjs render winter-challenge --video  # card 1920×1080 + details 1080×1920, images and loops
```

Apple's media guidance (developer.apple.com/app-store/in-app-events/): "avoid using text or logos in your media", "don't
add borders or gradients" (the App Store applies its own crops and gradients), videos "autoplay and repeat" (seamless
loops), and keep the card and the details page visually continuous. So the media is the app's key-art scene alone
(the director's pick, or `scene` in the event file), its hero in the upper band the App Store leaves clear. Text rules:
event name up to 30 characters in title case (the event itself, not "event", not a call to action), short description
50, long 120, sentence case, no prices ("will lead to rejection"), no "the best" / "#1", no all caps. Badges: Challenge,
Competition, Live Event, Major Update, New Season, Premiere, Special Event. An event lasts up to 31 days and can be
promoted 14 days before it starts. Good events bring something new and time-boxed; daily rewards, plain price
promotions and general awareness are not events. `export.mjs` copies the media to `upload/ios/<locale>/events/<id>/`.
