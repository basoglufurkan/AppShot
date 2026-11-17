# Story — ordering the set

A screenshot set is a 5–10 frame argument. Most visitors see only frames 1–3 (search) or swipe once on the product
page. Order by persuasion, not by app navigation.

## Roles

| Role | Job | Typical layouts |
| --- | --- | --- |
| Hook (1) | The outcome the searcher wants, with the hero screen | hero-device, floating-cards, full-bleed, chat-bubbles, text-hero |
| Core value (2) | The main way the app delivers it | zoom-callout, tilted-device, duo-devices, before-after |
| Proof of depth (3) | Second strongest benefit; ends the search-result triptych on a high | floating-cards, big-number, ui-pieces |
| Differentiator | What competitors don't do | duo-devices, comparison, zoom-callout |
| Objection killer | Time, effort, privacy, price fear (without prices) | feature-list, notification-stack, comparison |
| Habit / retention | Reminders, streaks, widgets, Watch | notification-stack, device-top, ui-pieces |
| Breadth | "And everything else" | feature-list, screen-grid, trio-fan |
| Trust | Real rating/press/reviews (iOS only) | social-proof, review-quote |
| Close | Identity or invitation | text-hero, trio-fan |

## Rules

1. **Shots 1–3 must each stand alone** and together cover the top three benefits. No logos-only or text-only frame in
   2–3; text-hero is fine as shot 1 only if the brand is the product (rare) — usually it is the closer.
2. **One idea per shot.** If you need "and", split it.
3. **Rhythm.** Never the same layout twice in a row; alternate device-heavy and text-led frames; tilt at most every
   other shot.
4. **Screens follow benefits**, not tabs. The same screen may appear twice with different crops (zoom-callout,
   ui-pieces) if it carries two benefits.
5. **Count.** 6–8 is the sweet spot; up to 10 on iOS, 8 on Google Play. Fewer than 5 leaves objections unanswered.
6. **Panorama** when the set is 5+ shots and the theme has a flowing background (aurora, glass, pastel, sunset, ocean,
   brand mesh) — `skills/design/panorama.md`. The first three must still read individually.
7. **Android differences**: no social proof, no price/"free", captions ≤ ~20 % of the image, device frames discouraged
   (`storeOverrides.android.theme.device.frame = "flat"`). Use `skipOn` and `storeOverrides` instead of a second plan.
8. **iPad**: if the app supports iPad, capture iPad UI and add `ipad-13`; phone captures on a tablet canvas are only a
   fallback (`skills/design/tablet.md`).

## Mapping benefits to shots (worked example: Pulse)

| # | Benefit | Screen | Layout |
| --- | --- | --- | --- |
| 1 | A plan that adapts, 25 min, no equipment | Today | hero-device |
| 2 | Form feedback (objection: "will I do it right?") | Workout player, form tip zoomed | zoom-callout |
| 3 | Visible progress | Progress + stat cards | floating-cards |
| 4 | Breadth: 400+ workouts | Plans | tilted-device |
| 5 | Habit: reminders & streak | Today + notifications | notification-stack |
| 6 | Fits any level, Health sync | Progress + bullets | feature-list |
| 7 | Identity close | — | text-hero |
