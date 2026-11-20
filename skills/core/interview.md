# Interview — ask little, once

The code answers most questions. Ask only what it cannot: one round, at most three questions, with sensible defaults
so the user can just accept. Use AskUserQuestion when available; otherwise one short message. Ask in the user's language.

## Decide what you already know

| Question | Usually answered by | Ask only if |
| --- | --- | --- |
| Which stores? | `profile.platform.stores` | the repo builds for both but the user mentioned one |
| Which languages? | `profile.strings.locales`, the user's language | the app ships more locales than you will do now |
| Who is it for? | README, onboarding quiz options, paywall copy | it is genuinely ambiguous (two very different audiences) |
| Real proof (rating, awards, numbers, reviews)? | never in code | always — it is the one thing you must not guess |
| Things to hide (beta features, competitors, private data)? | rarely in code | the app shows user data, dashboards or unreleased flags |
| Brand rules (colours, fonts, tone)? | theme files, icon | the scanned palette is weak or contradictory |

## The default three

1. **Markets** — "Which languages should the screenshots ship in first?" Options: the detected locales (recommended),
   English only, English + German, other.
2. **Proof** — "Do you have a real App Store/Play rating, award, press mention or usage number we may show?"
   Options: "No — skip social proof" (recommended when unsure), "Yes, I'll type it" (then capture value + source + date).
3. **Avoid** — "Anything that must not appear?" Options: "Nothing", "Hide beta/unfinished features", "Don't mention
   competitors or prices" (always true anyway), other.

## After the answers

- Proof given → record it in `brief.md` § Proof with source and date; use it in `social-proof` / `review-quote` /
  `big-number` with a `source` field. On Google Play these shots get `"skipOn": ["android"]`.
- No answer → proceed with defaults, state them in the hand-off.
- Never ask about things you can try: theme, layouts and copy are your job; show the result and let them react.
