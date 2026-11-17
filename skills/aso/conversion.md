---
id: aso-conversion
title: Conversion psychology for store pages
last_verified: 2026-11-04
---

# Conversion psychology for store pages

The store visitor is scanning, comparing and deciding in seconds. Each caption has one job: make the
next swipe or the install feel obvious. The principles below are ordered by impact.

## 1. Outcome over feature

People install a result, not a feature list. Lead with what changes for the user, then show the
feature that delivers it.

| Feature-first (weak) | Outcome-first (strong) |
|---|---|
| AI-powered categorisation | Know where your **money** goes |
| Smart alarm with sleep phases | Wake up **without** grogginess |
| 500+ workout videos | Get **stronger** at home |
| Offline maps | Navigate with **no signal** |

The UI in the frame proves the outcome. The caption must not just describe what is already visible.
Apple: "use a short phrase that enhances your visual rather than describes it"
([Asset best practices](https://developer.apple.com/app-store/asset-best-practices/)).

## 2. Specificity beats superlatives

- Concrete nouns and verbs ("Split rent with roommates") beat adjectives ("Easy, powerful, smart").
- Real numbers convert, but **only real ones**. Get them from the app's content (recipe count, number
  of languages, workout count) or from user-supplied stats. Write `{recipes}` until the number is
  verified. Never round up, never say "millions".
- Superlatives ("best", "#1", "ultimate") are unverifiable on Apple (2.3.7) and banned on Play. They
  also convert worse than specifics, because readers discount them.

## 3. Handle objections before they become exits

Typical hesitation and the frame that answers it. Use only answers that are true in the code.

| Objection | Caption pattern (when true) |
|---|---|
| "Is my data safe?" | "Your data stays **on device**" / "No account needed" |
| "Will it work for me?" | Audience-specific frame: "Built for **beginners**" |
| "Is it complicated?" | "Set up in **one** tap" plus the actual setup screen |
| "Will it nag or spam me?" | "No ads" only if the app truly has none. Avoid it in the Play title, where Google treats "No Ads" as a deal. |
| "Hidden costs?" | Don't show prices in screenshots. Mark premium frames clearly (Apple 2.3.2), and put the terms in the description. |
| "Offline / travel?" | "Works **offline**" plus a UI cue (offline badge) |

Put objection frames at positions 4–7. Frames 1–3 sell. Later frames reassure.

## 4. Social proof: real, attributed, store-appropriate

- **Apple:** ratings, press quotes and third-party awards are allowed **only if verifiable and
  current**. Don't use Apple badges (Editor's Choice, App of the Day), because Apple shows those
  itself. Ratings differ by territory, so a "4.8★" frame can be false in some storefronts. Fill
  `{rating}` per locale or drop the frame.
- **Google Play:** no ratings, testimonials, awards, download counts or "popular". Remove every
  `social-proof` and `review-quote` frame from Play sets.
- Never fabricate review text. A quote must be real, attributed (publication, or store review with
  the username), and unedited in meaning.
- If you have no proof yet, use *product proof* instead: show real output (a generated plan, a scanned
  document, a finished photo).

## 5. Consistency with the icon and title

- The screenshot palette should pick up the icon's dominant colour, so the strip and icon read as one
  unit in search results. Apple also asks that metadata be "similar to avoid creating confusion" (2.3.8).
- Frame 1 should restate the subtitle (Apple) or short description (Play) in *different words*. The
  same promise, said twice, seen side by side.
- Name the product the same way everywhere (no "Pro" in screenshots if the title doesn't say Pro).

## 6. Contrast against the store UI (light and dark)

- The App Store and Play follow the system appearance. Your frames will sit on white **and** on
  near-black backgrounds.
- Avoid pure white (#FFFFFF) and pure black (#000000) frame backgrounds. They merge with the store
  chrome and lose the frame edge. Google says this explicitly for feature graphics ("avoid using pure
  white, black, or dark gray").
- Prefer saturated or tinted backgrounds, or a gradient with a clear edge. Check each theme on both a
  `#FFFFFF` and a `#000000` surround.
- Text contrast: headline 4.5:1 or better against its local background (measured at 25% scale).
  Don't place text over device glass reflections or busy photos.
- If the app supports Dark Mode, Apple suggests "at least one screenshot that showcases" it
  ([Product page](https://developer.apple.com/app-store/product-page/)). A dark frame at position 4–6
  also adds rhythm.

## 7. Category conventions vs standing out

1. **Learn the grammar.** Before choosing a theme, capture the frame-1 strip of the top 10 apps for
   the primary keyword. Note their background colours, layouts and the claims they repeat.
2. **Keep the cues people use to recognise the category**: finance means calm, trustworthy, data-forward;
   fitness means energy and bodies in motion; kids means bright and friendly. Breaking these makes you
   look irrelevant.
3. **Differentiate on one axis**: colour (if all competitors are blue, go green or orange), layout (if
   all show centred phones, use `floating-cards` or `full-bleed`), or message (if all say "easy", say
   "private" or "fast" if true).
4. **Never copy** a competitor's distinctive style, mascot or tagline (Apple 4.1, Play impersonation policy).

## 8. Copy mechanics

- 2–6 word headlines. Subhead of 12 words or fewer, optional. One idea per frame.
- Patterns: verb + object ("Track every **habit**"), outcome + qualifier ("Sleep **deeper** tonight"),
  "X without Y" ("Budget **without** spreadsheets"), "From A to B" ("From idea to **invoice**").
- Sentence case reads fastest. Use title case only if the brand's own UI does. No terminal period on headlines. Digits, not words,
  for numbers. No exclamation marks. No ALL CAPS unless that is the brand.
- Accent (`**word**`) on the single word that carries the benefit, 2 words at most.
- Second person ("your") and present tense. Avoid "we" and "our app".
- No CTAs ("Download now"), which are banned on Play and discouraged on Apple. No urgency ("Today
  only"), which is seasonal and dated.

## 9. Story order for frames 4–10

4. Third key job or the core loop in motion. 5. A differentiating detail (widget, Watch, sync).
6. An objection answer (privacy, offline). 7. Personalisation or breadth (themes, content library).
8. Platform integrations (true ones only). 9. Proof (Apple) or community. 10. A summary frame
(`feature-list`, `screen-grid`) as the last shot. Stop at 6–8 if you have no strong material.
A weak frame lowers the perceived quality of the whole set.

## Caption scoring rubric (score each caption 0–2 per line; ship 8 or more out of 10)

- **True:** maps to a scanned feature, with no invented data.
- **Clear:** understood in 2 s without the UI.
- **Specific:** concrete noun or verb, no empty adjectives.
- **Keyworded:** uses the assigned keyword naturally, or deliberately none.
- **Legible:** passes the 25% test with 4.5:1 contrast or better.
