# Brief — Pulse

> Completed example brief: scaffolded by `brief.mjs` from the code on 2026-11-04, then filled in by the agent.
> Every caption in plan.json traces back to a line here.

## Facts from the code

- Platform: expo (react-native) → stores: ios, android
- Bundle / package: app.pulse.workouts / app.pulse.workouts · version 2.3.0 · category Health & Fitness
- Locales in the app: en
- Brand colours: #C6F432 / #8B7CFF (UI is mostly dark)
- Icon: assets/icon.png
- Existing store text: none in the repo
- Niche: **fitness-workout** (fitness-workout 64.7, home-workout 61.1, todo-tasks 23.6) → read `skills/niches/fitness-workout.md`

### Capabilities detected (evidence in profile.json)
- Apple Health / Health Connect — high · seeds: "Syncs with Apple Health", "All your health data in one place"
- Camera — high · seeds: "Snap it, done", "Point your camera and go"
- Reminders / push — high · seeds: "Smart reminders that keep you on track", "Never miss a beat"
- AI / LLM — high · seeds: "AI does the heavy lifting", "Answers in seconds", "Personalised by AI"
- Charts & insights — high · seeds: "See your progress at a glance", "Insights that make sense"
- Subscriptions / IAP — high
- Streaks & achievements — medium · seeds: "Build a streak you will not break", "Earn rewards as you go"

### Screens worth showing (ranked)
- home (core, app/(tabs)/index.tsx)
- workout (feature, app/workout/[id].tsx)
- plans (feature, app/(tabs)/plans.tsx)
- progress (feature, app/(tabs)/progress.tsx)
- onboarding (onboarding, app/onboarding.tsx)

### Value props the team already wrote (paywall / onboarding copy)
- "Unlock Pulse Pro"
- "Personal AI plan that adapts every day"
- "Real-time form tips from your AI coach"
- "Syncs with Apple Health"
- "Start my plan"
- "What is your main goal?"
- "Lose weight"
- "Build strength"
- "Move more every day"
- "How much time do you have?"

### Permission texts (they describe real features)
- NSHealthShareUsageDescription: "Pulse reads your workouts and heart rate to adapt your daily plan."
- NSHealthUpdateUsageDescription: "Pulse saves completed workouts and burned calories to Apple Health."
- NSCameraUsageDescription: "The AI coach checks your form with the camera. Video never leaves your phone."

## Positioning

- **One line**: For busy people who skip the gym, Pulse builds a 25-minute home workout every morning so they get
  stronger without equipment or planning.
- **Who searches**: 25–40, works long hours, has tried gym memberships and YouTube workouts, searches "home workout",
  "workout plan", "no equipment workout" in the evening or on Monday mornings.
- **The moment / job**: "I want to start again, but I don't want to think about what to do."
- **Main objection to kill**: "I'll do it wrong / get hurt / give up" → form feedback (shot 2) + streak nudges (shot 5).
- **Differentiator**: the AI coach checks form through the camera on-device (NSCameraUsageDescription, workout player).

## Benefits ranked

| # | Benefit (user words) | Proof in the app (screen / feature) | Shot |
|---|---|---|---|
| 1 | A plan that adapts to me, 25 minutes, no equipment | Today screen, "AI plan" card | 1 |
| 2 | I know I'm doing it right | Workout player, form tip card | 2 |
| 3 | I can see I'm getting stronger | Progress: strength score, PRs | 3 |
| 4 | Variety — I won't get bored | Plans: 400+ workouts, filters | 4 |
| 5 | I keep going | Reminders + streak (expo-notifications, streak hook) | 5 |
| 6 | Works for my level, syncs with Health | Onboarding levels, HealthKit / Health Connect | 6 |

## Proof we can honestly use

- Rating, awards, press, user counts: **none** (fictional demo app) → no social-proof or review shots.
- Numbers shown are product facts visible in the UI: 25-minute plans, 400+ workouts, 8–45 minute sessions.

## Keywords

- Primary (shots 1–3): EN home workouts, workout plan, ai coach
- Secondary: no equipment, strength, streak

## Voice

Friendly-bold: short imperatives, "you", one emoji at most in notifications, no hype words.

## Visual direction

- Theme **volt** (black + lime pill) mirrors the dark UI and the lime brand (#C6F432 as accent); ember/midnight as
  test variants. Panorama off (each shot must work alone in search). Android: flat frames, no Apple Health wording.

## Open questions (asked once — demo defaults used)

1. Languages: English.  2. Real proof: none.  3. Hide: nothing.
