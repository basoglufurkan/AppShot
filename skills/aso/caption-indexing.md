---
id: aso-caption-indexing
title: Is screenshot text indexed for search?
last_verified: 2026-11-04
status: unconfirmed by Apple and Google
---

# Screenshot caption indexing: known, reported, unknown

Use this file to decide **how hard to push keywords into captions**. Short answer: write captions that
use the searcher's words because that converts. Treat any ranking benefit as a free bonus, not a
strategy.

## What Apple documents (as of Nov 2026)

- Search text relevance is "matches for your app's title, subtitle, keywords, and primary category",
  plus user behaviour ([App Store search](https://developer.apple.com/app-store/search/)).
  **Screenshots are not listed.**
- App tags (US only) are "generated using large language models (LLMs) based on the metadata you've
  provided". Tags are "based on the App Store metadata you provide in App Store Connect, artificial
  intelligence, and human curation" ([App tags](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-tags)).
  Apple does not say which metadata fields feed the model, or whether screenshots are among them.
- Apple's asset guidance stresses legibility: "Ensure all key elements are readable — especially any
  text" ([Asset best practices](https://developer.apple.com/app-store/asset-best-practices/)). That is
  framed as a conversion point, not a ranking one.
- Apple has published no statement, WWDC session or App Store Connect help page saying caption text is
  OCR'd or indexed for ranking.

## What third parties report (unconfirmed)

| Claim | Source | Evidence quality |
|---|---|---|
| Since the App Store algorithm update around 6 June 2025, Apple "is now extracting text from your app's screenshot captions and treating that text as part of your keyword metadata" | [Appfigures, June 2025 (updated 2026)](https://appfigures.com/resources/guides/app-store-algorithm-update-2025) | Observational. No published sample, methodology or before/after rank data. The author calls the "top/bottom placement" idea "speculation" and says a screenshot-only keyword "doesn't seem to be as strong of a signal alone". |
| No strong evidence of broad indexing. Of 64 screenshot phrases from 8 leading US apps, 36 didn't rank, 27 were explained by existing metadata, and 1 (Audible) was a grey area. | [ConsultMyApp + APPlyzer, June 2025](https://consultmyapp.squarespace.com/blog/-is-apple-now-indexing-screenshot-titles-on-the-app-store) | Small, but has a method and a control (atomic keyword checks) |
| "Apple OCR indexes captions" stated as fact, sometimes with weight estimates (for example "50–70% of keyword-field weight") | Many 2026 vendor blogs, mostly from screenshot-tool sellers | No methodology. Commercial incentive. **Do not cite these numbers.** |

**Working position for Appshot:** a weak or unproven discovery signal on Apple, possibly limited to
large, clear caption text in English-language storefronts. Never present it to the user as confirmed.

## Google Play

- Google documents no OCR of screenshots for ranking. Text signals are the title, short description
  and full description. Google also says unnecessary keywords "will not impact ranking"
  ([Add preview assets](https://support.google.com/googleplay/android-developer/answer/9866151)).
- Google asks for **alt text for every screenshot** (140 characters or less) for accessibility. It does
  not say alt text affects ranking. Write it well anyway: it's the only machine-readable description of
  the image that you control.
- Play's AI surfaces (Ask Play, Gemini app recommendations, "Highlights") summarise listings from
  metadata. Reports say they also draw on reviews and the developer's website
  ([AppTweak, I/O 2026](https://www.apptweak.com/en/aso-blog/google-i-o-2026-aso-updates)). How
  much they read the images themselves is undocumented. Assume a multimodal model *could* read your
  captions, so keep them accurate. That is the same rule as for humans.

## How to use it safely (no-regret rules)

These rules help conversion whether or not indexing exists.

1. **Use the searcher's words.** A searcher who typed "budget planner" and sees "Plan your **budget**"
   gets instant confirmation that this result matches. That is the main reason to echo keywords.
2. **One keyword per headline, one headline per keyword.** Use the primary keyword in frame 1 and one
   secondary keyword in each of frames 2–3. Repetition across frames adds no evidence of value.
3. **Readable to a machine means readable to a human.** Use horizontal, high-contrast (4.5:1 or
   better) solid text in a common sans-serif. No outline-only, warped, curved, rotated or
   gradient-filled letters, and no text over busy photos. Headline size is 100 px or more on a
   1320 px-wide canvas (`first-impression.md`).
4. **Keywords go in the headline**, not in tiny subheads, UI chrome or legal footers.
5. **Use natural grammar.** Inflections and natural word order are fine ("Track your sleep", "Sleep
   tracker for deep rest"). Never stack words: "SLEEP • TRACKER • ALARM • SOUNDS" is exactly what Play's
   metadata policy bans as "Word blocks and vertical/horizontal word lists"
   ([Metadata policy](https://support.google.com/googleplay/android-developer/answer/9898842)).
6. **No hidden or low-contrast text**, tiny repeated keywords, or text placed for machines only. It is
   deceptive under Apple 2.3 and Play's metadata policy, and gets rejected when spotted.
7. **No competitor or trademark terms in captions**, even if they would "rank". Apple 2.3.7 and 5.2,
   and Play IP policy, forbid them.
8. **Localize keywords per locale.** If indexing exists, it would use the localized caption. A
   translated keyword nobody searches for is wasted.
9. **Keep text as rendered type in Appshot's caption layer** (crisp vector to raster), not as
   screenshots of in-app text. Clean glyphs are easier for both people and OCR to read.

## Optional: test it for one app (honest measurement)

1. Pick a relevant, low-competition keyword that is **absent** from the name, subtitle, keyword field,
   category and developer name. Record its current rank (likely none).
2. Add it naturally to the frame 1–3 headline in one locale only. Change nothing else in that release.
3. Track the rank daily for 3–4 weeks. Compare against a second keyword you didn't add (the control).
4. Report the result as one app's observation, not proof. Rank movement also follows downloads and
   any release.

## What to tell the user

> "Apple doesn't officially index screenshot text for search. Some ASO firms report it has since mid-2025,
> but independent tests found little evidence. We put your top keywords in the captions anyway, because
> searchers convert better when they see the words they typed. Any ranking lift is a bonus."
