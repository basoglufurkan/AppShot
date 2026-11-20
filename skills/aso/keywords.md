---
id: aso-keywords
title: Keyword research for screenshots and metadata
last_verified: 2026-11-04
---

# Keyword research for screenshots

Goal: produce a **keyword plan** before writing any caption. The plan assigns each target keyword to
its fields: Apple name, subtitle and keyword field; Play title, short description and full
description; and caption slots.

## 1. Build the seed list from the project (no guessing)

Scan these sources and extract the nouns, verbs and noun phrases a user would recognise:

| Source in the repo | What it gives |
|---|---|
| Display name, bundle ID, `Info.plist` `CFBundleDisplayName`, `applicationId` | Brand terms. They are already indexed on both stores, so don't repeat them in the keyword field. |
| `Localizable.strings` / `.xcstrings`, `strings.xml`, i18n JSON, Flutter ARB | Screen titles, button labels, empty-state copy. This is the app's own user language. |
| Route, screen and tab names (`HomeView`, `BudgetScreen`, `/habits`) | Feature map, and the core loop ranked by tab order |
| Permission strings (`NSCameraUsageDescription`, `NSHealthShareUsageDescription`, `ACCESS_FINE_LOCATION`) | Hard capabilities (scan, step count, nearby) and the vocabulary for them |
| IAP and subscription product IDs, paywall copy | Premium features. These need the 2.3.2 disclosure tag in screenshots. |
| Integrations (HealthKit, Widgets, Live Activities, Apple Watch, CarPlay, Siri/App Intents, Wear OS) | Platform keywords and differentiators. Use them only on the matching store. |
| README, fastlane `metadata/`, existing store listing, release notes | The current positioning, and terms that already rank |
| Model and DB names (`Expense`, `Recipe`, `Workout`) | Category nouns |

Translate developer words into searcher words: `OCR` → "scan documents", `streak` → "habit tracker",
`ledger` → "expense tracker", `TTS` → "read aloud". Keep both forms until research says which one
people actually search.

## 2. Expand and bucket by search intent

| Bucket | Example (budgeting app) | Use for |
|---|---|---|
| Category head term | budget, budget planner | Title or subtitle if the app can compete. Otherwise the long-tail versions. |
| Functional ("does X") | expense tracker, bill reminder, split bills | Subtitle, keyword field, captions in frames 1–3 |
| Problem / outcome | save money, stop overspending, pay off debt | Captions (outcome framing), Play short description |
| Audience / context | for couples, for students, offline, family | Modifiers in the keyword field; CPP or CSL themes |
| Feature-specific long tail | receipt scanner, monthly budget template | Keyword field, frames 4–10, CPP keywords |
| Competitor / brand | other apps' names | **Research only.** Never in metadata or captions (Apple 2.3.7, Play metadata policy). |

Expansion sources: store search autocomplete on both stores (type the seed, record the suggestions);
Apple Ads keyword suggestions and search popularity; competitor titles, subtitles and caption copy;
your own and competitors' reviews (mine the phrasing users use to describe the job); Play Console's
search terms in acquisition reports; third-party ASO tools for volume and difficulty.

## 3. Score and choose

Score every candidate 1–5 on each of these:
- **Relevance.** Is it true for this app? Anything under 4 is dropped. This is a hard gate.
- **Volume / popularity.**
- **Difficulty.** Invert it, so 5 means easy.
- **Intent fit.** Does the searcher want exactly this app?

Rank by relevance × (volume + difficulty + intent). Apple's own framing: popular terms "may drive a lot
of traffic, but are highly competitive… Less common terms drive lower traffic, but are less competitive"
([App Store search](https://developer.apple.com/app-store/search/)). A new or small app should target
mid-volume long tail first and move up as ratings and downloads build.

Pick:
- **1 primary keyword.** The phrase you would want in the title.
- **2–4 secondary keywords.** Subtitle and short description.
- **10–20 supporting keywords.** Keyword field and description.

**Competitor gaps:** list the top 10 apps for the primary keyword. Mark the keywords each one targets in
its visible metadata and captions. Good candidates are high-relevance terms that few competitors put in
title, subtitle or frames 1–3. They are cheaper to rank for and give your captions a clear angle.

## 4. Placement: Apple

| Field | Limit | Rules |
|---|---|---|
| App name | 30 characters | Strongest text signal. Brand plus primary keyword if it reads naturally ("Brand: Budget Planner"). |
| Subtitle | 30 characters | Indexed. Secondary keyword phrased as a benefit. No unverifiable claims or references to other apps (2.3.7). |
| Keyword field | 100 (see below) | Comma-separated with no spaces after commas. Spaces inside phrases are allowed ("real estate"). |
| Developer name, primary and secondary category | — | Indexed. Don't repeat them in the keyword field. |
| CPP keywords | Chosen from the latest approved version's keywords | The CPP then ranks instead of the default page for those terms ([CPP](https://developer.apple.com/app-store/custom-product-pages/)) |
| Promotional text, description | 170 / 4000 | **Not used for App Store search ranking**: "promotional text doesn't affect your app's search ranking" |

**Keyword field rules** ([search](https://developer.apple.com/app-store/search/), [product page](https://developer.apple.com/app-store/product-page/)):
- Don't repeat words already in the name, subtitle or category.
- No plurals of words you already have ("climbs" and "climb" are duplicates).
- No generic "app"/"game", no filler ("the", "to"), no `#`/`@`.
- No trademarks, celebrity names or competitor app names.

**Limit is in bytes.** App Store Connect counts "up to 100 bytes"
([platform version info](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information))
and needs "each greater than two characters". Accented Latin letters such as é, ü and ß each take 2 bytes in UTF-8,
as do most non-ASCII scripts (CJK takes 3). Count bytes, not characters.

**Extra locale slots.** Apple documents that a localization's keywords are searchable "in all countries or
regions where the App Store supports" that language
([Localize](https://developer.apple.com/help/app-store-connect/manage-app-information/localize-app-information)).
For example, the US storefront also supports Spanish (Mexico), Chinese, French, Korean and others, and
Switzerland supports German plus English (U.K.), French and Italian. Details are in `localization.md`.

**Combinations.** Third-party practitioners report that Apple combines words across name, subtitle and
keyword field into phrases. So single words in the keyword field ("tracker,budget,bills") can build
long-tail phrases. This is undocumented by Apple.

## 5. Placement: Google Play

There is no keyword field. The title (30), short description (80) and full description (4000) are the
text signals. Google says to use "SEO best practices in your Description"
([Get discovered](https://support.google.com/googleplay/android-developer/answer/4448378)).
- Title: brand plus primary keyword. No "free", "best", emojis or caps.
- Short description: primary or secondary keyword inside a real benefit sentence.
- Full description: weave each target keyword into natural sentences, in the first 2–3 lines and then
  under feature headings. Never list keywords. Google explicitly forbids repetitive lists, for example
  "Car racing, car driving, race cars…"
  ([Best practices](https://support.google.com/googleplay/android-developer/answer/13393723)).
- Play custom store listings can target "users who search for specific keywords", which gives you a
  dedicated listing per keyword cluster (`testing.md`).

## 6. Captions should echo the top 3–5 keywords

- Frame 1's headline uses the primary keyword, or its most natural inflection, once:
  "Plan your **budget** in minutes".
- Frames 2–3 each carry one secondary keyword. Frames 4–10 may use supporting keywords.
- Each keyword appears in **one** headline per set. Repeating it adds nothing for the reader and looks
  like stuffing.
- Use the searcher's exact phrase when it reads well ("Track **sleep** cycles" beats "Wake up
  refreshed" for both clarity and matching). If the exact phrase reads badly, use plain language.
- Keywords go in the **headline** (2–6 words), not only in the subhead. Subheads are illegible in
  search thumbnails.
- **Accent markup** (`**word**`) goes on the benefit word, which is often the keyword. Use it on 1–2
  words at most.
- Localize keywords per locale from that locale's research. Never translate them literally.

## Keyword plan output (the agent writes this before any caption)

```yaml
primary: budget planner
secondary: [expense tracker, save money, bill reminder]
supporting: [receipt scanner, split bills, monthly budget, debt payoff, savings goal]
apple:  { name: "Brand: Budget Planner", subtitle: "Expense tracker & bill alerts",   # 29 chars
          keywords: "spending,receipt,scanner,split,debt,savings,goal,monthly,family,couples" }
play:   { title: "Brand: Budget Planner", short: "Track expenses, plan bills and reach savings goals faster." }
captions: { 1: budget, 2: expense tracker, 3: bill reminder, 4: receipt scanner, 5: savings goal }
excluded: { competitor_terms: [...], reason: "trademark" }
```
