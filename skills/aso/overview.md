---
id: aso-overview
title: How screenshots fit into ASO
last_verified: 2026-11-04
read_first: true
---

# How screenshots fit into ASO

This is the entry point to `skills/aso/`. Read it before planning a screenshot set, then load the
specialist files listed at the bottom. Facts marked **[Apple]** or **[Google]** come from official
documentation (link inline). Facts marked **[reported]** come from third parties and are unconfirmed.

## Two jobs, unequal weight

1. **Conversion (primary, certain).** Screenshots decide whether an impression becomes a page view
   and a page view becomes an install. Every store treats them as conversion assets.
2. **Discovery (secondary, uncertain).** Apple documents its search text relevance as matches on
   "title, subtitle, keywords, and primary category" plus user behaviour (downloads, ratings,
   reviews) **[Apple]** ([App Store search](https://developer.apple.com/app-store/search/)).
   Screenshots are not on that list. Third parties claim that caption text has been read for search
   since the June 2025 algorithm update **[reported]**. See `caption-indexing.md`.
3. **The indirect effect is real either way.** Better conversion means more downloads, and Apple
   lists downloads as a ranking input. So a stronger screenshot set improves ranking even if
   caption text is never indexed.

**Rule for Appshot:** optimise for the human first. Put keywords in captions only where they also make
the caption clearer to the searcher. Never trade clarity for a keyword.

## What the App Store shows, and where (iOS/iPadOS 27 era)

| Surface | What appears | Source |
|---|---|---|
| Search results (users who haven't downloaded the app) | Icon, name, subtitle, rating, and up to 3 screenshots or app previews "depending on the platform and image orientation". Portrait shows 3; landscape typically shows 1 (Apple only says "depending on orientation"). Previews always come before screenshots. | [Apple search](https://developer.apple.com/app-store/search/), [Product page](https://developer.apple.com/app-store/product-page/) |
| Search results with a creative asset (iOS 27+) | An optional 3:2 "search results" image or video replaces the strip. "If you choose to not use a search result creative asset, your In-App Events, app previews, and screenshots will appear." | [Asset best practices](https://developer.apple.com/app-store/asset-best-practices/), [Creative asset specs](https://developer.apple.com/help/app-store-connect/reference/app-information/creative-assets-specifications) |
| Search results (users who have downloaded before) | An active In-App Event card can show instead of screenshots | [Apple search](https://developer.apple.com/app-store/search/) |
| Search results via keywords | A Custom Product Page with assigned keywords can show instead of the default page | [CPP](https://developer.apple.com/app-store/custom-product-pages/) |
| Product page header (iOS 27+) | An optional 21:9 creative asset (image or muted looping video) | [Manage assets](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-your-app-store-assets) |
| Product page gallery | Up to 3 previews, then up to 10 screenshots per device size and locale. A preview with a different aspect ratio moves to "A Closer Look". | [Preview specs](https://developer.apple.com/help/app-store-connect/reference/app-information/app-preview-specifications) |
| Today / Games / Apps tabs | Screenshots, previews and PPO treatments may appear | [PPO](https://developer.apple.com/app-store/product-page-optimization/) |
| App tags (US only) | Short terms generated "using large language models (LLMs) based on the metadata you've provided" | [App tags](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-tags) |

Apple's own summary: "the first one to three images will appear in search results when no app preview
is available, so make sure these highlight the essence of your app" **[Apple]**.

## What Google Play shows, and where

| Surface | What appears | Source |
|---|---|---|
| Search and home | Screenshots "may be displayed throughout Google Play, for instance in search or on the homepage". The preview video can autoplay muted for up to 30 s. | [Preview assets](https://support.google.com/googleplay/android-developer/answer/9866151) |
| Large-format recommendation rows | Apps need at least 4 screenshots at 1080 px or more, in 9:16 or 16:9. Games need at least 3. | same |
| Store listing | The video comes first (the feature graphic is its cover), then "the screenshots best suited for the device the user is browsing on". The short description is "the first text users see". | same |
| Feature graphic | Used as the video cover and in large-format collections, including ads | same |
| AI surfaces (Ask Play, Gemini) | Answer users from listing metadata. One report says they also use the developer's website **[reported]**. | [AppTweak on I/O 2026](https://www.apptweak.com/en/aso-blog/google-i-o-2026-aso-updates) |

Play also cuts screenshots differently by surface. Tablet and Chromebook rows can crop extra text
"on Play homepages", and Google warns that the short description, screenshots and feature graphic
"may be shown side by side". Never repeat the same sentence across them.

## Funnel model the agent should reason with

```
impressions ──(icon, name, subtitle, first 3 shots / search asset)──▶ page views or direct installs
page views  ──(header, gallery order, captions, preview, ratings)────▶ installs
installs    ──(downloads, ratings, retention)────────────────────────▶ ranking (feedback loop)
```

The first 3 frames work at both of the first two stages, so they get most of the effort
(`first-impression.md`). Frames 4–10 only reach people who are already interested. Use them for depth,
objections and breadth (`conversion.md`).

## Order of priorities for Appshot

When two goals conflict, the higher one wins.

1. **Compliance.** Never produce an asset that breaks Apple 2.3 / 2.3.7 / 2.3.10 or the Google Play
   Metadata policy (`apple-rules.md`, `google-play-rules.md`). A rejection costs days.
2. **Truth.** Every caption must map to a feature found in the scanned code or confirmed by the user.
   Never invent numbers, ratings, awards, user counts, testimonials or press quotes. Use
   `{placeholders}` and fill them only with real values.
3. **First-three glance test.** Frames 1–3 each carry one idea, readable at about 25% scale in under
   2 s (`first-impression.md`).
4. **Keyword echo.** The top 3–5 target keywords appear naturally across the captions, mostly in
   frames 1–3 (`keywords.md`).
5. **Store-specific output.** Apple and Google allow different things. Social proof, awards, aspect
   ratios and device frames all differ, so render separate sets and never reuse one store's set as-is.
6. **Story and metadata alignment.** Screenshots, title, subtitle or short description, and
   description tell one story without repeating each other word for word (`metadata.md`).
7. **Localization.** Adapt the copy for each market rather than translating it literally
   (`localization.md`).
8. **Testability.** Produce named variants that differ on one axis, ready for PPO, CPP or Play
   experiments (`testing.md`).
9. **Aesthetics and brand.** Match the app's icon and palette, and stand out from the category
   (`conversion.md`).

## Default deliverable per store

- **Apple:** 6–10 portrait iPhone screenshots for each locale. Render at 1320×2868 and at 1206×2622
  (the class Apple names as required), plus 2064×2752 if the app supports iPad. Optional: iPhone Duo
  sizes, and a 3:2 search asset or 21:9 header for iOS 27+.
- **Google Play:** 4–8 phone screenshots at 9:16 (1080×1920 or 1440×2560). Add 4 or more tablet
  screenshots if the app supports tablets. Also a 1024×500 feature graphic, and alt text (140
  characters or less) for each image.

## File map

| File | Use it when |
|---|---|
| `apple-rules.md` | Validating any asset or caption for the App Store; picking export sizes |
| `google-play-rules.md` | Validating for Google Play; aspect ratios and banned words |
| `keywords.md` | Building the keyword plan from the codebase before writing captions |
| `caption-indexing.md` | Deciding how hard to push keywords into captions |
| `first-impression.md` | Designing frames 1–3, the thumbnail test, orientation, video |
| `conversion.md` | Writing captions and choosing proof, contrast and differentiation |
| `testing.md` | Producing variants and mapping them to PPO, CPP, Play experiments or CSLs |
| `metadata.md` | Writing the title, subtitle, descriptions and promo text in line with the shots |
| `localization.md` | Choosing markets, adapting copy, RTL, fallbacks |
| `seasonal.md` | Refresh timing, and what needs a new app version |
