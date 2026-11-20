---
id: aso-metadata
title: Store text metadata aligned with the screenshot story
last_verified: 2026-11-04
---

# Metadata that tells the same story as the screenshots

Write the text fields **after** the keyword plan (`keywords.md`) and **with** the screenshot story.
Title and subtitle state the promise, frames 1–3 prove it, and the description expands it. Each says
the same thing in different words. Google warns these assets "may be shown side by side"
([Preview assets](https://support.google.com/googleplay/android-developer/answer/9866151)).

## The Appshot workflow

One Markdown file per locale in `appshot/metadata/<locale>.md`, fields under bold labels (`**Name**`, `**Subtitle**`,
`**Promotional text**`, `**Keywords**`, `**Description**`, `**What's New**`, optional `**Play title**`,
`**Play short description**`, `**Play full description**`, `**Terms of Use**`). Text above the first label and after a
`---` line is notes. App-wide fields (Support / Privacy / Marketing URL, Terms of Use, categories, copyright) live in
`metadata/_shared.md`. Localised labels are read too (`**Nom**`, `**Untertitel**`, `**Nombre**`, `**Palabras clave**`…).

```bash
node scripts/metadata.mjs import AppStore/metadata.md       # a multi-locale document ("## English (U.S.)" sections) or fastlane/metadata
node scripts/metadata.mjs init --locales es-ES,de-DE         # one file per locale to write in, with the context
node scripts/metadata.mjs check                               # every locale; exit 1 on errors (check.mjs blocks on them too)
node scripts/metadata.mjs keywords --locale de-DE --write     # pack the 100-byte field without name/subtitle words
node scripts/metadata.mjs show                                # lengths per locale and field
node scripts/metadata.mjs export                              # fastlane deliver / supply text (export.mjs does it too)
```

`init` puts the context at the top of each new file: the limits, the source locale's name and subtitle, the plan's
keywords for that locale, the paid tier and what Apple asks of its disclosure, and a **glossary of the app's own
translations** for the terms the source text uses (read from `.xcstrings`, `<lang>.lproj/*.strings`, Android
`values-<lang>/strings.xml`, Flutter `.arb`). Use those words: the listing and the app should say the same thing.

`check` reports, per locale:
- **errors** (the console or review would refuse): over a limit (the keyword field in **bytes**: é, ü, ß take 2),
  unfilled `TODO` / placeholders, prices or ranking words in a Play title, another company's trademark in the keyword
  field, Android in App Store text, a paid tier the description never mentions (Apple 2.3.2);
- **warnings**: keyword-field words already in the name or subtitle (wasted bytes), duplicates, spaces after commas,
  generic words ("app", "iPhone"), "free" or rankings in the name or subtitle, a subscription without a Terms of Use
  (EULA) link (Apple 3.1.2), Spanish without ¿ ¡, Latin American words in a Spain listing, keyword
  stuffing in a Play description;
- **info**: superlatives in context ("your best day" is a feature, "the best app" is a claim), the category name in the
  keyword field, plan keywords missing from the indexed fields, no privacy URL.

Every claim must be true in the build: before writing what is free and what is paid, read the paywall and the code
that gates features. One real listing described two ambient sounds as free while the code gated them behind the
subscription.

## Field reference

| Store | Field | Limit | Search-indexed? | Change without new version? |
|---|---|---|---|---|
| Apple | App name | 30 characters | Yes (strongest) | No |
| Apple | Subtitle | 30 characters | Yes | No |
| Apple | Keyword field | 100 bytes, comma-separated | Yes (hidden) | No |
| Apple | Promotional text | 170 characters | **No** | **Yes, any time** |
| Apple | Description | 4,000 characters, plain text | Not for App Store search; used for web search results | No |
| Apple | What's New | 4,000 characters | No | Per version |
| Apple | IAP display name / description | 35 / 55 characters | — | With the IAP |
| Apple | In-App Event name / short / long | 30 / 50 / 120 characters | Event surfaces | Yes (event review) |
| Play | Title | 30 characters | Yes | Yes (listing review) |
| Play | Short description | 80 characters | Yes | Yes |
| Play | Full description | 4,000 characters | Yes | Yes |

Sources: [Apple product page](https://developer.apple.com/app-store/product-page/),
[Apple platform version info](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information),
[Apple In-App Events](https://developer.apple.com/app-store/in-app-events/),
[Play best practices](https://support.google.com/googleplay/android-developer/answer/13393723).

## Alignment map

| Screenshot | Apple text | Play text |
|---|---|---|
| Frame 1 (primary keyword plus outcome) | App name (keyword) and subtitle (outcome, secondary keyword) | Title and short description |
| Frames 2–3 (differentiator, second job) | Description paragraph 1 | Full description lines 1–3 |
| Frames 4–10 (depth, objections) | Description feature list, in the same order as the frames | Full description sections |
| Seasonal or news frame | Promotional text (no review) and CPP | Short description (time-boxed) and CSL |

## Templates

**Apple app name (30):** `{Brand}: {Primary keyword}` or `{Brand} – {Primary keyword}`. Apple wants it
"simple, memorable… distinctive". No generic-only names, no prices, no competitor names (2.3.7).

**Apple subtitle (30):** `{Verb} {object} {qualifier}` or `{Secondary kw} & {secondary kw}`. Apple:
"Avoid generic descriptions such as 'world's best app.'" No unverifiable claims.

**Promotional text (170):** `{New/Now}: {timely news}. {Benefit sentence}.` It isn't indexed, so use it
for launches, seasons and offers. A sale can be mentioned here as text; images still can't show prices.

**Play title (30):** `{Brand}: {Primary keyword}`. No "Free", "No Ads", "#1", emojis or ALL CAPS
([Metadata policy](https://support.google.com/googleplay/android-developer/answer/9898842)).

**Play short description (80):** `{Verb} {object}, {verb} {object} and {outcome}.` Use one or two
keywords inside a real sentence. No CTA, no ★, no "best", no emoji. A single sentence needs no
terminal period ([Preview assets](https://support.google.com/googleplay/android-developer/answer/9866151)).

**Description (both stores, 4,000):**
```
{Hook: one sentence with the promise + primary keyword; this is the visible "fold"}
{Paragraph: who it's for and the core loop, 2–3 sentences, secondary keywords}

{FEATURE HEADING 1 — mirrors frame 2}
• {benefit-led bullet} …
{FEATURE HEADING 2 — mirrors frame 3} …
{Objections: privacy / offline / no account — only if true}
{Premium: what Premium unlocks; subscription terms; links to Terms of Use (EULA) and Privacy Policy}
{Optional closing: real, attributed accolade — Apple suggests accolades go at the end or in promo text}
```
For auto-renewable subscriptions, App Review commonly expects the terms plus a working Terms of Use
(EULA) link in the description or the custom EULA field (Guideline 3.1.2). Play forbids unattributed
testimonials and keyword lists in the description.

## English example: budgeting app "Pennio" (fictional)

- Apple name: `Pennio: Budget Planner` (22)
- Apple subtitle: `Expense tracker & bill alerts` (29)
- Apple keywords: `spending,money,receipt,scanner,split,debt,savings,goal,monthly,family,couples,shared`
  (84 bytes. No words repeated from the name, subtitle or category.)
- Promo text: `New: shared budgets for couples. Plan together, see every bill in one place and get a heads-up before payments are due.` (119)
- Play title: `Pennio: Budget Planner` (22)
- Play short: `Track expenses, plan bills and reach your savings goals with simple budgets.` (76)
- Description hook: `Pennio is the budget planner that shows where your money goes and warns you before bills are due.`
- Frame 1 caption: `Plan your **budget** in minutes`. Frame 2: `Every **expense**, sorted for you`.
  Frame 3: `Never miss a **bill**`.

Second pattern, habit tracker "Tikko" (fictional):
- EN: `Tikko: Habit Tracker` / `Build routines, keep streaks` / Play short
  `Build daily habits with reminders, streaks and clear weekly progress charts.` (76)

## Checklist

- [ ] Primary keyword in the Apple name and Play title. Secondary keywords in the subtitle and short description.
- [ ] No word repeated between the Apple name, subtitle and keyword field. Keyword field is 100 bytes or less.
- [ ] Frame 1 caption restates the subtitle or short description in different words.
- [ ] Description feature order matches the screenshot order. Every claim is true in the build.
- [ ] No prices in the name, subtitle or images. Promotions go only in promo text (Apple) or time-boxed copy (Play).
- [ ] Play text has no CTA, rank words, emojis, ★ or ALL CAPS. Short description is 80 characters or less.
- [ ] Subscription apps include terms and Terms of Use / Privacy links.
- [ ] Every locale is written natively, with lengths and bytes verified.
