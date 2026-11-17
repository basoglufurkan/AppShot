---
id: aso-apple-rules
title: App Store rules and specs for screenshots and metadata
last_verified: 2026-11-04
sources:
  - https://developer.apple.com/app-store/review/guidelines/   # "Last Updated: October 16, 2026"
  - https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications
  - https://developer.apple.com/app-store/asset-best-practices/
---

# App Store: rules and specs

All quotes come from the [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
(last updated 16 Oct 2026) unless another link is given. App Review applies these rules
to screenshots, previews and creative assets.

## Guidelines that bite screenshots

| Rule | What it means for Appshot |
|---|---|
| **2.1(a)** "placeholder text, empty websites, and other temporary content should be scrubbed" | No lorem ipsum, "Test User", empty states, debug banners or TODO strings in captured UI |
| **2.3** Metadata must "accurately reflect the app's core experience" and stay "up-to-date with new versions" | Only show features that exist in the submitted build. Retire shots of removed features. |
| **2.3.1(a)** No "promoting content or services that it does not actually offer" or "a false price" | Grounds for account termination, not just rejection. Never mock up features you don't have. |
| **2.3.2** Screenshots must "clearly indicate whether any featured items, levels, subscriptions, etc. require additional purchases" | Put a visible "Premium"/"Pro" tag on any frame that shows a paid-only feature |
| **2.3.3** "show the app in use, and not merely the title art, login page, or splash screen". Text and image overlays are allowed. | Every frame needs real UI. A text-only `text-hero` frame is risky as a screenshot. Brand art belongs in creative assets (2.3.14). |
| **2.3.4** Previews "may only use video screen captures of the app itself". Narration and text overlays are OK. | No live-action footage, renders or fake UI in app previews |
| **2.3.7** No "trademarked terms, popular app names, pricing information, or other irrelevant phrases". Screenshots "should not include prices, terms, or descriptions that are not specific to the metadata type." Subtitles must not "reference other apps, or make unverifiable product claims". | No prices, "$", "% off", trial terms, competitor names or "best/#1" claims you can't prove |
| **2.3.8** Assets must suit a **4+** rating "even if your app is rated higher". "For Kids"/"For Children" are reserved for the Kids category. | No gore, weapons pointed at people, or suggestive imagery. Don't write "for kids" unless the app is in the Kids category. |
| **2.3.9** You must hold rights to every asset, and "display fictional account information instead of data from a real person" | Seed demo data with fictional names, avatars, emails and balances. Never capture real user data. |
| **2.3.10** Don't "include names, icons, or imagery of other mobile platforms or alternative app marketplaces" | No Android robots, Pixel/Galaxy frames, Google Play badges or "Also on Android". Use Apple device frames only. |
| **2.3.12** Describe significant changes in What's New | Keep the release notes consistent with any new-feature screenshot |
| **2.3.14** Creative assets must relate to the app or brand. No "unverifiable product claims, or specific or discounted pricing". | Same rules for the 21:9 header and 3:2 search asset |
| **1.4.1** Health accuracy claims need disclosed data and methodology. Apps "that claim to take x-rays, measure blood pressure… using only the sensors on the device are not permitted." | No "clinically proven", "diagnose", "measures blood pressure" unless the claim is validated or the app is cleared. Declare Regulated Medical Device status in App Store Connect where it applies. |
| **4 Design / 4.1** Don't copy popular apps' "name or UI". You "cannot use another developer's icon, brand, or product name" without approval. | Don't clone a competitor's screenshot style, mascot or tagline |
| **5.2.1** No third-party trademarks or copyrighted works without permission | No celebrity faces, film stills, sports-league logos or stock photos without a licence |
| **5.2.4** Don't imply Apple endorsement. Apple applies the "Editor's Choice" badge itself. | Never draw Apple badges or "Featured by Apple" ribbons |
| **5.2.5** Don't look "confusingly similar to an existing Apple product, interface… or advertising theme". No Apple emoji in apps. No Activity-ring look-alikes. | Don't fake iOS system sheets in captions. Avoid Apple-ad lookalike compositions. |

Apple's [asset best practices](https://developer.apple.com/app-store/asset-best-practices/) add:
"Don't include specific pricing, discounts, website URLs, copyright symbols". "Avoid claims that can't
be verified, such as awards or recognition that your app or game hasn't actually received".
"Don't include logos or references to other platforms or marketplaces". Don't include Apple-designated
recognitions (Editor's Choice, App of the Day, Apple Design Award). Also: "avoid using the entire asset
to highlight general accolades or call-to-action statements."

**Device frames.** Apple's [marketing guidelines](https://developer.apple.com/app-store/marketing/guidelines/)
ask for official product bezels used "as is", which rules out tilting, cropping or reflections. That
rule governs marketing communications. App Review routinely accepts tilted or cropped frames inside
screenshots, but the strictest-safe default is an upright, unmodified, current-generation frame. Use
`tilted-device` as a deliberate choice, not as the default.

## Export specs (App Store Connect, verified 2026-11-04)

Source: [Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications).
Apple now names classes by display type, not inches. The common inch names are in brackets.

| Class (common name) | Portrait px (landscape = swapped) | Status |
|---|---|---|
| iPhone Duo, inner display | 2007×2853 | Optional now. "Starting in April 2027, screenshots will be required for any app using the iOS 27.1 SDK or later." Adds a "Made for iPhone Duo" badge. |
| iPhone Duo, outer display | 1398×2034 | Same as above |
| Dynamic Island, large ("6.9″"; Air 6.5″) | **1320×2868**, 1290×2796, 1260×2736 | Optional. If missing, scaled from Face ID large. |
| Face ID, large ("6.5″") | 1284×2778, 1242×2688 | Required if Dynamic Island large is not provided |
| Dynamic Island, medium ("6.3″"/"6.1″") | **1206×2622**, 1179×2556 | Apple's summary: "At least one screenshot for iPhone with Dynamic Island (medium display)" |
| Face ID, medium ("6.1″"/"5.8″"/"5.4″") | 1170×2532, 1125×2436, 1080×2340 | Optional, scaled from Dynamic Island medium |
| Home button, large ("5.5″") | 1242×2208 | Optional. 9:16 aspect, so render natively if supplied. |
| Home button, medium ("4.7″") | 750×1334 | Optional |
| iPad 13″ | **2064×2752**, 2048×2732 | Required if the app runs on iPad |
| iPad 12.9″ (2nd gen) | 2048×2732 | Optional, scaled from 13″ |
| iPad 11″ | 1668×2420, 1668×2388, 1640×2360, 1488×2266 | Optional, scaled from 13″ |
| Mac (16:10) | 1280×800, 1440×900, 2560×1600, 2880×1800 | Required for Mac apps |
| Apple TV | 1920×1080, 3840×2160 | Required for tvOS apps |
| Apple Vision Pro | 3840×2160 | Required for visionOS apps |
| Apple Watch | 422×514 (Ultra 3/4), 410×502, 416×496 (S10–12), 396×484, 368×448, 312×390 | Required for watchOS. Use the "same screenshot size… across all localizations". |

**Appshot default:** render 1320×2868 and 1206×2622 for every iPhone set. The two aspect ratios match
to within 0.1%, so one layout serves both. Add 2064×2752 when the project has an iPad target, and the
iPhone Duo sizes when the app adopts the iOS 27.1 SDK.

**Rules that apply to every class**
- 1–10 screenshots per device size and per localization. At least 1 is required.
- `.png`, `.jpg` or `.jpeg`. "Images can't include alpha channels or transparencies." Export flattened
  RGB (sRGB, or Display P3 when supported). Older Apple spec text asked for RGB; the current page only
  states the alpha rule.
- Exact pixel dimensions. Upload fails at 1319×2868.
- If the UI is consistent, Apple scales the largest set down for smaller classes. A new localization
  inherits the primary language's screenshots until you upload its own
  ([Localize app information](https://developer.apple.com/help/app-store-connect/manage-app-information/localize-app-information)).
- App previews: up to 3 per device size and locale, 15–30 s, 30 fps maximum, 500 MB maximum,
  H.264 or ProRes 422 HQ. They always appear before screenshots
  ([Preview specs](https://developer.apple.com/help/app-store-connect/reference/app-information/app-preview-specifications)).
- Creative assets (iOS 27+, optional). Header: 21:9 at 3840×1646. Search results: 3:2, from
  1920×1280 to 3840×2560. Universal: 16:9 at 5244×2950 PNG. No alpha. Video is 5–30 s, muted, looping
  ([Creative asset specs](https://developer.apple.com/help/app-store-connect/reference/app-information/creative-assets-specifications)).

## What gets rejected (most common screenshot causes)

1. Showing features, content or integrations the reviewed build doesn't have (2.3, 2.3.1).
2. Prices, discounts, "free trial" terms or currency symbols in images (2.3.7, best practices).
3. Other platforms: Android devices, Play badges, "Available on Android" (2.3.10).
4. Splash, login or title-art-only frames with no app in use (2.3.3).
5. Placeholder or debug content, or real people's personal data (2.1, 2.3.9).
6. Unverifiable superlatives, fake awards, Apple badges, fabricated reviews (2.3.7, 5.2.4).
7. Competitor names, trademarked terms, licensed characters without rights (2.3.7, 5.2.1, 4.1).
8. Paid features shown with no purchase disclosure (2.3.2).
9. Content not suitable for 4+ (2.3.8), or health claims without validation (1.4.1).
10. Wrong pixel size, alpha channel present, or screenshots that don't match the device class.

## Pre-upload checklist (run per locale, per device class)

- [ ] Every frame shows real UI captured from the submitted build. No mocked features.
- [ ] Every caption claim maps to a scanned feature. No invented numbers, ratings, awards or user counts.
- [ ] Any `{placeholder}` is filled with a verified real value, or the line is dropped.
- [ ] No prices, currency symbols, "% off", "free trial", URLs, ©, or "#1/best" claims.
- [ ] No other-platform names, icons or devices. Apple frames only, current generation.
- [ ] Premium-only features carry a visible "Premium"/"Pro" tag (2.3.2).
- [ ] Demo data is fictional and believable. No PII. Status bar is clean (9:41, full battery and signal).
- [ ] Content is 4+ safe. No "for kids" unless the app is in the Kids category. Health claims are validated or removed.
- [ ] No competitor brands, celebrities or licensed IP without written permission.
- [ ] Exact dimensions per class (1320×2868 and 1206×2622; 2064×2752 for iPad). PNG/JPEG, RGB, no alpha.
- [ ] 1–10 images, ordered by the story. Frames 1–3 pass the glance test (`first-impression.md`).
- [ ] Captions localized for every locale that has localized metadata. In-app UI language matches the locale.
- [ ] Screenshots match the subtitle and What's New text. Nothing contradicts other metadata.
