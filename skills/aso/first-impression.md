---
id: aso-first-impression
title: The first three screenshots
last_verified: 2026-11-04
---

# The first three screenshots

## Why frames 1–3 decide most conversions

- **App Store search** shows "up to three screenshots or app previews… depending on the platform and
  image orientation" ([App Store search](https://developer.apple.com/app-store/search/)). Searchers
  who haven't installed the app judge it from this strip alone, next to competitors. Apple: "the first
  one to three images will appear in search results… make sure these highlight the essence of your app"
  ([Product page](https://developer.apple.com/app-store/product-page/)).
- **Product page:** above the fold on iPhone, roughly the first 1.5–2.5 portrait frames are visible
  (this depends on the device and on whether a header asset is shown). Most visitors never swipe the
  whole gallery, so frames 4+ are reached by people who are already interested.
- **Google Play** tells you to "prioritize UI in the first three screenshots", and its large-format
  rows use the first screenshots ([Preview assets](https://support.google.com/googleplay/android-developer/answer/9866151)).
- **iOS 27 caveat:** a 3:2 *search results creative asset*, if set, replaces the screenshot strip in
  search. Without one, "your In-App Events, app previews, and screenshots will appear"
  ([Asset best practices](https://developer.apple.com/app-store/asset-best-practices/)).

## The glance test (1–2 seconds per frame)

Each of frames 1–3 must answer one question at a glance:

| Frame | Question it answers | Content |
|---|---|---|
| 1 | "Is this the thing I searched for?" | Primary keyword plus the main outcome, over the core screen in its best state |
| 2 | "Why this one and not the others?" | The differentiator: the feature competitors lack, or do worse |
| 3 | "Can I trust it / is there more?" | Second key job, breadth, or real proof (Apple only for ratings and press) |

Pass criteria. Show a stranger the strip for 2 seconds and hide it. They can say:
(a) what the app does, (b) one reason it's better, and (c) the app's name or colour.
If they can't, simplify: fewer words, one focal UI element, more contrast.

## Thumbnail legibility (must read at about 25% scale)

The search strip shows each portrait shot about 110–120 pt wide on a 6.1–6.3″ iPhone. That is
roughly 330–360 physical pixels, or **about 25–28% of a 1290–1320 px master**.

| Element | Size on a 1320 px-wide canvas | At 26% it appears as |
|---|---|---|
| Headline (2–6 words, weight 700 or more) | **100–130 px** font size (em), 2–3 lines maximum, about 18 characters per line or fewer | about 9–11 pt. Readable. |
| Subhead (12 words or fewer) | 52–64 px | about 5 pt. **Not readable in search**, so never put the key message there. |
| Key UI element (number, chart, card) | 300 px or more tall in the frame | still identifiable |
| Margins | 72 px or more on each side; keep text out of the top 4% (corner rounding) | — |

For Play phone frames (1080 px wide), scale by 0.82: headline 85–105 px. Google also caps taglines at
20% of the image.

**Automated check (Appshot render step):** downscale each frame to 25% and evaluate it at 1:1:
- Headline x-height is 10 px or more.
- Headline-to-background contrast is 4.5:1 or better. Use the large-text 3:1 threshold only for
  headlines of 140 px or more.
- The caption doesn't overlap busy UI.
- No more than 2 accent words.

## Portrait or landscape first?

- **Portrait (default).** You get three frames in the search strip, three chances. Use it for any app
  used in portrait.
- **Landscape.** Search shows about 1 frame instead of 3. Use it only for landscape-native apps (most
  console-style games, video editors, TV and drawing apps). Then frame 1 must carry everything.
- Don't mix orientations in the first three. Mixed galleries look broken and waste search slots.
- **Play:** apps use 9:16 portrait. Landscape-native games use 16:9 landscape, which is eligible for
  game large formats.
- **iPad:** often landscape. Design that set separately; don't stretch the iPhone set.

## Hero (frame 1) strategies, by situation

| Situation | Strategy | Layout |
|---|---|---|
| Clear category, crowded search | Outcome headline with the keyword, and the core screen in a filled, successful state | `hero-device`, `device-top` |
| The app's value is one number (savings, streak, speed) | A real number from the app or data. Never invented. `{placeholder}` until verified. | `big-number` |
| Visual product (photo, design, maps) | Full-bleed result, minimal chrome | `full-bleed`, `before-after` |
| Several distinct jobs | Show two or three UI pieces that add up to one promise | `floating-cards`, `ui-pieces` |
| Established brand with a strong rating (Apple only) | Rating or press proof, but **still with UI visible** (2.3.3) | `social-proof`, `review-quote` |
| Story across frames | A panorama joining frames 1–3, but **each frame must stand alone**, because search crops at frame boundaries | `bridge`, `split-diagonal` |

Avoid in frame 1:
- Logo-only or text-only frames (2.3.3 risk).
- Onboarding, login, paywall or empty states.
- Settings screens.
- "Welcome to…".
- More than one message.

## Video preview interplay

- **Apple:** previews always appear before screenshots. In search they take a slot and autoplay muted.
  The **poster frame** shows whenever video doesn't play, so design it like frame 1
  ([Preview specs](https://developer.apple.com/help/app-store-connect/reference/app-information/app-preview-specifications)).
  Length is 15–30 s; open with the payoff in the first 3 s. Apple's own PPO case study found the page
  **without** a preview outperformed the one with it
  ([PPO](https://developer.apple.com/app-store/product-page-optimization/)). Test before assuming
  video wins.
- If a preview uses a different aspect ratio from the screenshots, it moves to "A Closer Look" and
  stops occupying the first slot.
- **Play:** one YouTube video, shown first, with the feature graphic as its cover. Show real
  experience "within the first 10 seconds". It autoplays muted for up to 30 s, so captions must work
  without sound.
- When a preview leads, screenshot 1 becomes the *second* thing people see. Make it complement the
  video, not repeat its opening.

## iOS 27 creative assets and the first impression

- **Header (21:9) and search asset (3:2)** can show brand or seasonal art beyond the in-use UI
  (Guideline 2.3.14). Apple's advice for the search asset: "State the obvious" and "Showcase the
  firsthand experience".
- For apps that aren't yet a known brand, the screenshot strip (real UI) usually explains more than
  brand art. Test it: PPO treatments now include a "Header and Search Results" tab.

## Checklist for frames 1–3

- [ ] Frame 1 headline contains the primary keyword and an outcome. 2–6 words. 100 px or more on a 1320 px canvas.
- [ ] One idea per frame. Each frame stands alone if cropped at its edges.
- [ ] Real UI in a successful, filled state. No onboarding, login, paywall or empty screens.
- [ ] The 25% downscale passes: headline legible, contrast 4.5:1 or better, UI focal point identifiable.
- [ ] Orientation is consistent. Portrait unless the app is landscape-native.
- [ ] The three frames visually belong together and carry the icon's colour.
- [ ] If there's a preview, its poster frame follows the frame 1 rules and its first 3 s show the payoff.
- [ ] Apple and Play versions differ where the rules differ (proof, frames, aspect ratio).
