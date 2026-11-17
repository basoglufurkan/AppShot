---
id: example-niche
name: Example Niche
appStoreCategory: Health & Fitness
playCategory: Health & Fitness
keywords: [workout, gym, exercise, training, reps, sets, muscle, strength, hiit, cardio]
themes: [volt, ember, midnight]
layouts: [hero-device, big-number, floating-cards, feature-list, social-proof]
shots: 7
---

# Example Niche

<!--
HOW THIS FILE IS USED
- scripts/niche.mjs parses ONLY the frontmatter. `keywords` are lowercase signals that
  appear in a project's code identifiers, UI strings, README or store text (25–40 of them,
  single words or short phrases, most specific first). They decide which niche a scanned
  app belongs to, so avoid generic words ("app", "user", "data", "list").
- `themes` must come from the theme registry and `layouts` from the layout registry below,
  best fit first. `shots` is the recommended screenshot count for this niche (5–10).
- The agent reads the body when planning the story, writing captions and choosing visuals.

THEME REGISTRY (engine/themes/*.json)
clean-light, soft-gray, midnight, aurora, sunset, ocean, mint, pastel, neon, editorial,
luxe, brutal, glass, forest, calm, playful, ember, volt, finance-pro, cream, rose, sky,
mono, brand

LAYOUT REGISTRY (engine/templates/*.mjs)
hero-device, device-top, tilted-device, duo-devices, trio-fan, zoom-callout,
floating-cards, feature-list, social-proof, big-number, before-after, full-bleed,
text-hero, review-quote, split-diagonal, bridge, screen-grid, ui-pieces,
notification-stack, chat-bubbles, comparison

CAPTION MARKUP
**word** = highlighted in the accent colour (use on 1–2 words max).
Never invent numbers, ratings, awards or user counts: write {placeholders}
like {rating}, {users}, {recipes} that the agent fills only with real values.
-->

## The searcher

Who types the search, in what moment, and what they want to feel after installing. 3–5 bullets.

## What wins the install

Ranked angles that convert in this niche, each with a one-line reason.

## Story (shot by shot)

1. **Hook** — outcome promise — show: main screen — layout: hero-device — angle: …
2. …

## Headline bank

### English

- Build **muscle** at home
- …(15+ lines, 2–6 words each)

### Türkçe

- Evde **kas** yap
- …(15+ lines, written natively, not translated word for word)

## Supporting elements

Cards, stats, notifications, chat bubbles, comparison rows that fit this niche,
with {placeholders} for real numbers.

## Visual direction

Palette, typography, device treatment, imagery and what the top apps in this niche do.

## Keyword clusters

3–5 clusters of real search phrases (EN), each with Turkish equivalents.

## Avoid

Store-policy and conversion pitfalls specific to this niche.
