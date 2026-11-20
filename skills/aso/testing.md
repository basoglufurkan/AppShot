---
id: aso-testing
title: Testing screenshots (PPO, CPP, Play experiments, custom store listings)
last_verified: 2026-11-04
---

# Testing screenshot variants

Appshot can render variants cheaply. The stores limit how many you can test and how fast. Use this
file to turn variants into valid experiments and to read the results correctly.

## Apple: Product Page Optimization (PPO)

Sources: [PPO overview](https://developer.apple.com/app-store/product-page-optimization/),
[ASC: configure treatments](https://developer.apple.com/help/app-store-connect/create-product-page-optimization-tests/configure-test-treatments),
[ASC: overview](https://developer.apple.com/help/app-store-connect/create-product-page-optimization-tests/overview-of-product-page-optimization).

- **Up to 3 treatments** against the original. **One test at a time.** A test runs **up to 90 days**
  or until you stop it, and **can't be changed once started**.
- What you can vary: app icon, screenshots, app previews, and (iOS 27) the **Header and Search
  Results** creative assets. You can't vary the name, subtitle, description or keywords.
- You choose the traffic proportion. Example: 40% to the test with 2 treatments gives each 20%. A user
  sees the same treatment for the whole test. Treatments show on iOS/iPadOS 15+, and "may appear in
  search results", including Today/Games/Apps.
- Treatment assets need App Review approval, but **don't need a new app version**. The exception is
  alternate icons, which must already be in the live binary. Reordering screenshots that are already
  live needs no review.
- Localize a treatment in all languages or only some. Fewer locales means a longer test.
- The duration estimator targets results with at least **90% confidence**. Apple recommends waiting
  until a treatment is declared better or worse "with at least 90% confidence" before applying it.
  Applying a treatment ends the test.
- PPO isn't available for Custom Product Pages, Apple Watch or iMessage pages. Releasing a version that
  changes the tested assets during a test can corrupt the results.

## Apple: Custom Product Pages (CPP)

Sources: [CPP](https://developer.apple.com/app-store/custom-product-pages/),
[ASC: configure CPPs](https://developer.apple.com/help/app-store-connect/create-custom-product-pages/configure-multiple-product-page-versions).

- **Up to 70 CPPs per app.** The limit was 35 in earlier years; Apple's current docs say 70. Each CPP
  has its own screenshots, previews, promotional text and **keywords**. Each has a unique URL (a
  `ppid` parameter) and is fully localizable.
- Keywords are chosen from the latest approved version's keyword list. The CPP then appears in
  search **instead of the default page** for those terms once approved and set visible. Give each
  page a unique keyword set.
- Optional **deep link** per CPP (iOS/iPadOS 18+) opens the matching screen on "Open".
- Submitted for review **without an app update**. Usable in Apple Ads, including search results ad
  variations, and in SKOverlay/SKStoreProductViewController ads.
- Metrics appear in App Analytics after 5 first-time downloads: impressions, conversion, retention,
  and proceeds per paying user. Apple reports that CPP referrals average +2.5 percentage points of
  conversion over a 1.6% average for default pages.
- CPPs are **not** an A/B test. Traffic differs by source, so compare a CPP against the default page
  only as a directional signal. Run PPO for causal answers about the default page.

## Google Play: store listing experiments

Source: [Run A/B tests on your store listing](https://support.google.com/googleplay/android-developer/answer/6227309).

- Per app, run **one default graphics experiment** or **up to five localized experiments** at a time.
  Experiments also run on custom store listings.
- Default graphics: icon, feature graphic, screenshots, in the default language. Users who see
  localized graphics in their language are excluded. Localized: icon, feature graphic, screenshots
  **and descriptions** (short and full), in up to 5 chosen languages.
- **Up to 2 variants** against the current listing (current docs). Audience % is split equally across
  the variants.
- Target metric: unique user **install clicks**, **open clicks** or **pre-registration clicks**.
  Settings include minimum detectable effect and confidence level. The console estimates the duration.
- Results: better, worse, **draw** (difference below the MDE) or "more data needed". Experiments stop
  automatically after **6 months**.
- Changes are reviewed through the Publishing overview. No app release is needed.

## Google Play: custom store listings (CSL)

Source: [Custom store listings](https://support.google.com/googleplay/android-developer/answer/9867158).

- **Up to 50 CSLs.** Each can change name, icon, descriptions and graphics.
- Targeting options: countries (each country in only one CSL), pre-registration users, **users who
  search specific terms**, churned or inactive (28-day) users, purchase-behaviour segments, custom
  audiences, Google Ads traffic, or a unique URL `…details?id=<pkg>&listing=<param>`.
- Ads-targeted CSLs currently show mainly on AdMob traffic, not Play search ads.
- CSLs are **not machine-translated**. Add translations for every language in the target countries.

## How Appshot variants map to the stores

Generate variants that differ on **one axis**. Name them `<axis>-<value>`, for example `angle-outcome`
or `hero-bignumber`.

| Axis | Example A vs B | Best venue |
|---|---|---|
| Message angle | outcome vs feature, privacy vs speed | PPO / Play default experiment |
| Hero layout | `billboard` vs `hero-device` (does stopping the scroll beat a plain hero?) vs `big-number` vs `full-bleed` | PPO / Play experiment |
| Theme / colour | brand colour vs high-contrast alternative | PPO / Play experiment |
| Order | differentiator in frame 2 vs frame 4 | PPO (reorder-only needs no review) |
| Caption keyword | "budget planner" vs "expense tracker" in frame 1 | CPP with keywords / Play CSL by search term |
| Audience | students vs families vs freelancers | CPP (ads, deep link) / Play CSL (URL, ads) |
| Season | evergreen vs holiday | CPP + In-App Event / Play CSL by country, or a time-boxed default swap |
| Market | local imagery vs global | Localized PPO / Play localized experiment |
| Video | with preview vs without | PPO |

Rules:
- Start with **2 variants**: control plus the boldest credible alternative. Small tweaks rarely reach
  significance.
- Change only frames 1–3 in early tests. That is where the variance is.
- Keep every variant compliant on both stores' rules. Play variants have no social proof and use 9:16.

## Running a valid test

1. **Hypothesis:** "Leading with the outcome ('Know where your money goes') will raise conversion vs
   the feature hero, because searchers in Finance want reassurance before features."
2. **Traffic check:** use Apple's estimator or Play's duration estimate. If the estimate goes past
   90 days (Apple) or months (Play), test a bigger change, use fewer treatments or allocate more traffic.
3. **Run at least 7 full days**, and preferably 14 or more, to cover weekly cycles. Don't start during
   a feature launch, a big Apple Ads or UA change, a holiday spike or a release that touches the
   tested assets.
4. **Don't peek and stop early.** Decide only when the store declares a result (Apple at 90%
   confidence or better; Play's better or worse beyond the MDE).
5. **Check downstream.** On Apple, check CPP retention and proceeds. On both stores, compare the
   variant cohort's day-1 to day-7 retention or trial starts in your analytics. A misleading hook can
   win installs and lose revenue.
6. **Apply, log and iterate.** Record the hypothesis, variants, dates, traffic, result, confidence and
   decision in `appshot/tests.md` (or the user's equivalent). Next test: the runner-up idea against
   the new control.

## Learning from results (results.mjs)

Every finished test is data for the next app in the same niche. Record it with the numbers the console shows:

```bash
node scripts/results.mjs add --treatment dir-c --lift 12.4 --confidence 90          # App Store PPO
node scripts/results.mjs add --store android --treatment dir-b --lift-range "-2.1,6.8"   # Play: the range it reports
node scripts/results.mjs learn          # → ~/.appshot/learning.json (per user, outside any repository)
node scripts/results.mjs show --niche focus-timer
```

Each result stores the design traits of both sides (theme, tone, opening layout, panorama). `learn` credits only the
traits that **differed** — the winner's get +, the loser's −, weighted by the lift (capped at 30 %) and the confidence
(90 %+ counts fully, unknown a third). The design director adds that prior to its scores and says so in its reasons
("learned: theme midnight lost 1 of 1 store test in this niche"). A result where both sides share every trait is about
copy or screens and teaches the director nothing — `add` says so.

## Play store listing experiments from the variants

```bash
node scripts/play.mjs experiments --variants dir-b,dir-c     # Play phone sets → out/play-experiments/ (+ README)
```

Each variant is rendered at the Play sizes and packaged per Play language (`<variant>/<language>/phoneScreenshots/`);
`export.mjs` copies the folder into `export/play-experiments/`. Play runs up to three variants per experiment.

## Reading results correctly

- Apple reports the conversion rate, % improvement and confidence per treatment versus the baseline.
  "Needs more data" means no decision yet.
- A **draw** (Play) or a low-confidence lift (Apple) means *no detectable difference*. Keep the
  simpler or more evergreen set and test something bolder.
- Several treatments raise the risk of false winners. Treat a winning result from a 3-treatment test
  as tentative, and re-test it against the control if the stakes are high.
- Winners can be local. A treatment that wins in the US may lose in Japan. Use localized tests for big
  markets.
- Novelty effects fade. Re-check the winner's conversion 4–6 weeks after applying it.
