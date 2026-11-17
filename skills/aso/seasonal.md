---
id: aso-seasonal
title: Refreshing screenshots, seasonal sets and release mechanics
last_verified: 2026-11-04
---

# Refresh timing, seasonal sets and what needs a new version

## Triggers for a refresh (ranked)

1. **Accuracy break.** A feature was removed or changed, the pricing model changed, or the UI was
   redesigned. Apple requires metadata to stay "up-to-date with new versions" (Guideline 2.3), so this
   is mandatory.
2. **Conversion decay.** Conversion rate by source (App Store search, browse; Play search, explore)
   has fallen for 4+ weeks with no traffic-mix explanation.
3. **New top-3-worthy feature.** If it changes the answer to "why this app", it goes into frames 1–3.
   Otherwise it goes in frames 4–7 or a CPP or CSL.
4. **Platform visual shift.** A major iOS release (each September) or an Android design refresh.
   Screenshots with old system UI look dated. Apple: "Consider using the latest UI"
   ([Asset best practices](https://developer.apple.com/app-store/asset-best-practices/)). Use
   current-generation frames only ([Marketing guidelines](https://developer.apple.com/app-store/marketing/guidelines/)).
5. **New device classes.** iPhone Duo: "Starting in April 2027, screenshots will be required for any
   app using the iOS 27.1 SDK or later" (inner 2007×2853, outer 1398×2034)
   ([Screenshot specs](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications)).
   Plan the Duo set before moving to the 27.1 SDK.
6. **Seasonal or cultural moment** that is relevant to the category (calendar below).
7. **Competitive change.** The top competitors redesigned and your strip now blends in (`conversion.md`, section 7).
8. **New real proof** (a rating milestone, a press award). Apple only. Verify it first.

## What needs a new app version

**Apple** ([Manage assets](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-your-app-store-assets),
[Submit from Asset Library](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-assets-from-asset-library),
[Platform version info](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information)):

| Change | New version needed? |
|---|---|
| Default-page screenshots and app previews | **Yes.** They are uploaded to an editable version (Prepare for Submission, Rejected, and so on). Asset Library can pre-approve them standalone, but placing them on the default page goes with a version. |
| App name, subtitle, keywords, description, What's New | **Yes** |
| Promotional text (170) | **No.** Edit any time, no review. |
| Creative assets: product page header and search results (iOS 27+) | **No.** Get them approved in Asset Library, then swap them on the live version with "Browse Assets → Publish". |
| Custom Product Pages (screenshots, previews, promo text, keywords, deep link) | **No.** Each page is submitted for review on its own. |
| PPO treatments (screenshots, previews, header and search assets) | **No**, unless they use alternate icons, which must be in the live binary |
| In-App Events | **No.** Submitted on their own. Up to 15 approved and 10 published at a time. Each lasts up to 31 days and can be promoted up to 14 days early ([In-App Events](https://developer.apple.com/app-store/in-app-events/)). |
| App icon | **Yes** (the binary) |

**Google Play:** title, short and full description, screenshots, feature graphic, video, CSLs and
experiments all change **without an app release**. They go through review via Publishing overview.
Use managed publishing to control when changes go live. Seasonal assets "should be swapped in and out
in a timely manner" ([Preview assets](https://support.google.com/googleplay/android-developer/answer/9866151)).

## Seasonal strategy: keep the default set evergreen

- **Apple:** put seasonal creative in **CPPs** (with seasonal keywords and Apple Ads), **In-App
  Events**, **promotional text** and iOS 27 **header and search assets**. All of these change without
  a version. Touch the default screenshots only when the season *is* the product (a tax app in tax
  season, a gift-list app in December).
- **Play:** swap screenshots or the feature graphic directly for the season, or target a country with
  a CSL. Schedule the revert on the same day you schedule the launch.
- **Never** show prices, discounts or "Sale" in images on either store. Mention offers in promo text
  (Apple). On Play, use Play Console promotional content where your account is eligible.
- Avoid dated words such as "2026" or "this summer" in the default set, unless you will replace it on time.

## Seasonal calendar (prepare 3–4 weeks ahead, submit 1–2 weeks ahead)

| Window | Moment | Categories that benefit |
|---|---|---|
| Late Nov | Black Friday / Cyber Monday (27 and 30 Nov 2026), 11.11 in Asia | Shopping, finance (budgets), productivity |
| Dec | Holidays, year-in-review, gifting | Photo/video, social, shopping, music, games |
| Late Dec – Jan | New Year resolutions | Fitness, diet, habits, finance, language learning, meditation |
| Late Jan – Feb | Lunar New Year (6 Feb 2027) | Games, social, finance (red envelopes), travel in East and Southeast Asia |
| Feb | Valentine's Day (14 Feb) | Dating, photo, gifts, couples apps |
| about Feb–Mar 2027 | Ramadan, then Eid al-Fitr / Ramazan Bayramı (dates move about 11 days earlier each year; confirm locally) | Religion, food and recipes, fasting and health, finance, shopping in MENA, TR, ID, MY |
| Mar–May | Spring cleaning, Mother's Day (UK in March; US, TR and many others on the 2nd Sunday of May) | Home, organisation, photo, gifts |
| about May 2027 | Eid al-Adha / Kurban Bayramı (confirm locally) | Travel, family, finance |
| Jun | WWDC (iOS betas: start planning the September refresh), exam season (TR: YKS) | Education, productivity |
| Jun–Aug | Summer travel | Travel, maps, translation, photo, fitness (outdoor) |
| Aug–Sep | Back to school | Education, productivity, notes, calendar |
| Sep | New iPhones and the major iOS release | All apps on Apple: refresh frames and system UI |

App Review is busiest before holidays. In 2024 Apple warned of longer reviews around 20–26 December
([MacRumors](https://www.macrumors.com/2024/12/02/app-store-review-times-holidays/)). Submit
holiday assets by mid-December.

## Cadence

- **Monthly:** read conversion by source and territory. Note anomalies and their causes.
- **Quarterly:** review the default set against the checklist below. Run at least one PPO or Play
  experiment (`testing.md`).
- **Each major feature release:** decide frames 1–3 vs 4–7 vs CPP or CSL. Update in the same version
  if the default set changes.
- **Yearly (Oct–Nov):** full refresh after the September iOS release. New device frames, current
  system UI, re-captured screens, and re-check every claim and `{placeholder}` value.
- **Per season:** 2–4 category-relevant moments a year, using the venues above, each with a removal date.

## Staleness audit (fail any item and you need a refresh)

- [ ] Every frame shows the current UI of the live build (no removed screens, no old navigation).
- [ ] Device frames and status bar match the current generation (Dynamic Island, current OS look).
- [ ] Every number, rating and award is still true in every territory where it's shown.
- [ ] No expired seasonal copy, past years or finished events.
- [ ] Required sizes are present for every device class the app supports (incl. iPhone Duo after the 27.1 SDK).
- [ ] Captions still match the current keyword plan and the name, subtitle and short description.
- [ ] Localized sets are in sync with the primary set (same story, same features).
