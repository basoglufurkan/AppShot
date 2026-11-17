---
id: aso-google-play-rules
title: Google Play store listing rules and specs
last_verified: 2026-11-04
sources:
  - https://support.google.com/googleplay/android-developer/answer/9866151   # Add preview assets
  - https://support.google.com/googleplay/android-developer/answer/9898842   # Metadata policy
  - https://support.google.com/googleplay/android-developer/answer/13393723  # Store listing best practices
---

# Google Play: rules and specs

Google splits its guidance into two levels:
- **Requirements.** "failure to meet requirements may result in removal or suspension from Google Play".
- **Highly recommended.** Ignoring these doesn't remove the listing, but "may result in changes to how
  your preview assets appear on Google Play or limit promotional opportunities".

Source: [Add preview assets](https://support.google.com/googleplay/android-developer/answer/9866151).
**Appshot treats both levels as hard rules**, because promotion eligibility is where installs come from.

## Specs

| Asset | Requirement | Recommended / eligibility |
|---|---|---|
| Phone screenshots | JPEG or 24-bit PNG (no alpha). Each side 320–3840 px. The long side can't be more than 2× the short side. Up to 8 per device type. At least 2 across device types to publish. | For large-format recommendation rows, **apps** need at least 4 screenshots at 1080 px or more: 9:16 portrait (1080×1920 minimum) or 16:9 landscape (1920×1080 minimum). **Games** need at least 3. |
| Tablet (7″, 10″) and Chromebook | Upload "between 1,080 and 7,680px". 16:9 landscape or 9:16 portrait. Add at least 4. | "Exclude additional text that is not part of your core app experience" because it "can get cut off on Play homepages" |
| Wear OS | At least 1. 1:1 aspect, 384×384 px minimum. UI only. **No device frames, extra text, graphics or backgrounds.** No transparency. | Show Tiles if the app has them |
| Android TV | At least 1 TV screenshot plus a TV banner. Shown only on TV. | — |
| Android Automotive | 2 portrait at 800×1280 and 2 landscape at 1024×768. Generic system UI only. | — |
| Android XR | 4–8 screenshots, 8:5, 8 MB each | 3840×2400 (1920×1200 minimum) |
| Feature graphic | **Required.** 1024×500, JPEG or 24-bit PNG, no alpha. | Keep the focal point centred and out of cut-off zones. Avoid pure white, black or dark grey backgrounds. Don't repeat the icon branding. |
| App icon | 512×512, 32-bit PNG with alpha, 1024 KB maximum | No badges or text that suggest rank, price or category |
| Preview video | One YouTube URL. Public or unlisted. Ads off. Not age-restricted. Embeddable. | Real experience within the first 10 s. At least 80% real UX. Autoplays muted for up to 30 s. |
| Alt text | One per graphic | 140 characters or less. Describe the screen ("The transaction complete screen."). Don't start with "image of". |

Play Console's upload dialog also shows an 8 MB limit for each phone screenshot. That figure comes from
third-party reports of the dialog; the help page doesn't state it.

**Critical for Appshot:** iPhone renders are about 9:19.5. 2868/1320 is 2.17, which breaks Play's 2:1
limit and isn't 9:16. **Never upload iOS renders to Play.** Render phone sets at 1080×1920 or
1440×2560, and tablet sets at 2560×1440 (landscape) or 1440×2560 (portrait).

## What is banned or discouraged in graphics

From the [Metadata policy](https://support.google.com/googleplay/android-developer/answer/9898842).
These apply to all translations:
- "misleading, improperly formatted, non-descriptive, irrelevant, excessive, or inappropriate metadata,
  including… screenshots, and promotional images"
- Text or images that "indicate store performance or ranking, such as 'App of the year,' '#1,'
  'Best of Play 20XX,' 'Popular,' award icons". Price or promotion: "'10% off,' '$50 cash back,'
  'free for limited time only'". Google Play programs: "'Editor's choice,' 'New'".
- "Unattributed or anonymous user testimonials", "Data comparison of apps or brands", and "Word blocks
  and vertical/horizontal word lists"
- Sexual content, profanity, graphic violence, illicit drugs. Celebrity names or brand logos without permission.

From the screenshot guidelines on the [Add preview assets](https://support.google.com/googleplay/android-developer/answer/9866151) page:
- Don't use words like "Best," "#1," "Top," "New," "Discount," "Sale," or "Million Downloads". Add
  **"Free"** to that list for the feature graphic. No "accolades or awards, user testimonials, or price
  and promotional information". Google Play's own "Best Of" awards are allowed only in video copy.
- No CTAs: "Download now," "Install now," "Play now," "Try now".
- "Taglines should not take up more than **20%** of the image." No small text, and no backgrounds that
  compete with the text.
- "Screenshots must demonstrate the actual in-app or in-game experience". "prioritize UI in the first
  three screenshots" even when the design spans several images.
- No people or fingers interacting with the device, unless the app is used off-device.
- Status bar: "Do not show service providers or notifications. The battery, WiFi, and cell service
  logos should be full."
- Avoid "Device imagery (as this can become obsolete quickly or alienate some users)". Also avoid
  "Google Play or any other store's badge or icon" and third-party trademarked characters or logos.
- Avoid time-sensitive taglines. Holiday content "should be swapped in and out in a timely manner".
- No blurry, stretched, rotated or upside-down images. "Localize your graphic and branding text".

**What changes versus Apple:** social-proof frames (ratings, review quotes, press awards) and
`comparison` frames that name brands are **not allowed on Play**. Prefer frameless or minimal generic
device silhouettes (`full-bleed`, `ui-pieces`, `floating-cards`, `device-top` with a neutral frame).
Never use an iPhone frame on Play.

## Text fields (for alignment with the screenshots)

- Title: 30 characters or less. No emojis, no ALL CAPS unless it's the brand, no "Free", "No Ads",
  "#1" or "Best" ([Metadata policy](https://support.google.com/googleplay/android-developer/answer/9898842),
  [Best practices](https://support.google.com/googleplay/android-developer/answer/13393723)).
- Short description: 80 characters or less. No CTAs, rank or price words, emojis, repeated
  punctuation, ★ symbols or capitals for emphasis. "Unnecessary keywords… will not impact ranking".
  "Avoid duplication… across your short description, screenshots, feature graphics".
- Full description: 4,000 characters or less. "Use SEO best practices"
  ([Get discovered](https://support.google.com/googleplay/android-developer/answer/4448378)). No
  repetitive keyword lists and no unattributed testimonials.

## Promotion eligibility summary

To qualify for screenshot-based large formats you need: 4 or more phone screenshots (apps) or 3 or more
(games), at 1080 px or more, in an exact 9:16 or 16:9 aspect. Real UI in frames 1–3. Taglines at 20% or
less of the image. None of the banned words. You also need a compliant feature graphic and, for games,
a preview video. "Your game requires a preview video to be shown in certain parts of Google Play."

## Checking a set against these rules

```bash
node scripts/play.mjs check [--draft]
```

It measures, from the render report's text boxes, how much of each image the tagline covers (warns above 20 %), blocks
text-only layouts in the first three screenshots (real UI first), counts the phone screenshots (4+ for large-format
promotion), runs the Play caption rules, asks for flat frames instead of device imagery, and checks the feature graphic.
Competitors on Play have no public search API: save their screenshots into a folder per app and run
`node scripts/market.mjs import <folder> --store play`; `design.mjs directions --store play` then weighs that market.
`metadata.mjs init` adds the Play title, short and full description when the plan has Play sizes.

## Pre-upload checklist (per language, per device type)

- [ ] Phone set is 9:16, exactly 1080×1920 or 1440×2560. 4–8 images. JPEG or 24-bit PNG, no alpha, 8 MB or less each.
- [ ] Tablet set (if supported): 4 or more, 16:9 or 9:16, 1080–7680 px. Only text that survives cropping.
- [ ] Frames 1–3 are dominated by real UI. Caption block covers 20% of the canvas or less (measure it).
- [ ] None of: best, #1, top, new, popular, free, discount, sale, % off, prices, "million downloads", award icons.
- [ ] No CTAs (download/install/play/try now). No store badges. No Apple devices or iOS UI.
- [ ] No ratings, star rows, review quotes or user counts in images. No competitor comparisons.
- [ ] Clean status bar: no carrier, no notifications, full battery, Wi-Fi and signal (Android demo mode).
- [ ] No fingers or hands unless usage is off-device. No device frames on Wear OS.
- [ ] Feature graphic: 1024×500, centred focal point, not on a pure white or black background, no repeated icon.
- [ ] Alt text written for every screenshot and the feature graphic (140 characters or less, unique each).
- [ ] Text localized per language. Seasonal frames have a removal date.
- [ ] Short description and frame 1 caption say related things in different words.
