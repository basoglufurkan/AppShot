# Rewrite drills

Every caption, in every locale, goes through this procedure after the set is drafted and before anything is rendered. Drafts are cheap and first drafts are usually feature-speak; this is where they become copy.

## The procedure

Run the nine checks in order. Mark each **pass** or **fail**, rewrite the failures, and run the checks again. Stop after **three passes**: a caption still failing by then has the wrong formula or the wrong screen, so go back to `formulas.md` or swap the screenshot.

### 1. Clarity: "Would a stranger get it in two seconds, without the screenshot?"
- No internal feature names, jargon or ambiguous pronouns ("it", "this").
- One idea only.
- Read it aloud. If you'd have to explain it, it fails.

### 2. Benefit: "So what?"
- Climb the ladder: feature → what it does → what the user gets → how life is better.
- Stop at the highest rung that is still concrete: "Expenses categorised" → "See where your money goes" ✓ → "Feel in control" ✗ (too abstract).

### 3. Specificity: "Could a competitor paste this onto their app?"
- **Competitor swap test:** if it fits a rival unchanged, it fails.
- Replace adjectives with nouns, real numbers, moments and objects from the app's world.
- Hunt for: easy, smart, powerful, better, all, everything, solution, experience.

### 4. Keyword: "Is this shot's assigned keyword present in natural form, and only if assigned?"
- Check the keyword map (`sequence.md`). Inflection is fine (Turkish suffixes, German cases).
- The primary keyword appears in ≤ 2 headlines. No stuffing.

### 5. Length: "Within limits for this locale?"
- 2–6 headline words, ≤ 12 subhead words.
- Characters per line per script family (`length.md`).
- No orphans or split units in the rendered PNG.

### 6. Highlight: "Are 1–2 words accented, and are they the payoff?"
- The accent is the word you'd stress reading aloud: the outcome, the number or the differentiator.
- Never a pronoun, article or the brand.
- Whole words only, including suffixes in Turkish and other agglutinative languages.
- Never broken across lines. `**` markers balanced.

### 7. Translation-safety: "Does the idea survive every target locale?"
- **At the source:** no puns, idioms, sports or holiday references, gendered address, or structures that only work in English word order.
- **Accent choice:** pick a concept noun or verb that exists in every language, not a function word like "every" or "your".
- **Per locale:** run that locale file's Pitfalls list.

### 8. Truth: "Is every claim verifiable?"
- Numbers are placeholders with sources (`proof.md`).
- "Free", "no ads", "offline", "private" and "encrypted" are verified in the code and the business model.
- No medical, financial-return or "#1" claims.

### 9. Set fit: "Does it belong in this set, on this screen?"
- **Word ledger:** no repeated content words across headlines.
- **Voice:** consistent across the set, including sen/siz, du/Sie, tu/vous.
- **Neighbours:** answers a different question from the shots beside it.
- **Screen:** the claim is visible on the device below it.

### Record format

Keep this per caption in the copy plan:

```
shot 3 · tr
draft:  "Kolayca faturalarını takip edebilirsin"
fails:  benefit, specificity, length, highlight
pass 2: "Son ödeme gününü **kaçırma**"
result: pass (all 9)
```

## Ten worked examples

### 1. Feature-speak → outcome (EN, shot 2)
- **Draft:** "Advanced AI-powered expense categorization"
- **Fails:**
  - clarity (jargon)
  - benefit (mechanism only)
  - specificity
  - length (4 long words, 42 characters)
  - highlight (none)
- **Pass 1:** "Expenses sorted automatically". Benefit is still weak, and nothing is accented.
- **Pass 2:** "Every expense, **sorted** for you" · subhead: "Categories learn from your edits". **Pass.**

### 2. Turkish modal verb and length (TR, shot 3)
- **Draft:** "Kolayca faturalarını takip edebilirsin"
- **Fails:**
  - benefit (tracking isn't the payoff)
  - specificity
  - length (36 characters, with the *-ebil-* modal)
  - highlight (none)
- **Pass 1:** "Son ödeme gününü **kaçırma**". Names the local concept (*son ödeme tarihi*) and the real pain. **Pass.**

### 3. Superlative → mechanism (EN, hook)
- **Draft:** "The best meditation app for everyone"
- **Fails:**
  - benefit
  - specificity
  - truth ("best" needs substantiation and is banned outright under CN advertising law, risky under TR and DE law)
- **Pass 1:** "Calm, one **breath** at a time" · subhead: "Guided sessions from {min_minutes} minutes" (only if a real minimum exists). **Pass.**

### 4. Pun hook (EN, recipe app, shot 1)
- **Draft:** "Lettuce turnip the beet"
- **Fails:**
  - clarity
  - translation-safety (dies in every locale)
  - keyword (no "recipe" or "dinner")
- **Pass 1:** "Dinner ideas in seconds". Specificity is weak ("in seconds" is everywhere).
- **Pass 2:** "Tonight's **dinner**, decided". **Pass.** The pun can live in the playful voice on shot 6, transcreated per locale or dropped.

### 5. Voice slip in a sen set (TR, shot 4)
- **Draft:** "Hedeflerinizi belirleyin"
- **Fails:**
  - set fit (siz in a sen set)
  - benefit (setting a goal is a task, not a payoff)
- **Pass 1:** "Hedefini **belirle**". Voice fixed; benefit still weak, and the highlight is on the task.
- **Pass 2:** "**Hedefine** adım adım ulaş". **Pass.** Payoff word accented, *adım adım* adds warmth, 4 words.

### 6. German expansion (DE, shot 2)
- **Source:** "Track every expense"
- **Literal draft:** "Verfolge jede einzelne Ausgabe"
- **Fails:**
  - length (30 characters before any accent)
  - tone ("verfolgen" sounds like stalking or prosecution)
  - highlight
- **Pass 1:** "Jede Ausgabe im **Blick**". The nominal "im Blick" is idiomatic. **Pass.**

### 7. Highlight that doesn't travel (EN → JA)
- **Source:** "Track **every** expense". The accent sits on "every", which has no clean Japanese token.
- **Literal draft:** "すべての支出を追跡"
- **Fails:**
  - translation-safety
  - highlight
  - tone (追跡 is "pursue/trace", too technical)
- **Pass 1:** "毎日の支出を、**かんたん**記録". The accent moves to the locale's own payoff word (easy). **Pass.**
- **Lesson:** choose the accent per locale; never carry its position over from English.

### 8. Unverified proof (EN, trust shot)
- **Draft:** "Join 1M+ happy users"
- **Fails:**
  - truth (no source)
  - specificity ("happy users" is generic)
- **Pass 1:** "Join **{users}** savers", with {users} from the owner's analytics, *plus* the fallback "No ads, no **data** selling" (verified: no ad SDK, privacy policy states it). **Pass.**

### 9. Subhead echo (EN, sleep app, shot 1)
- **Draft:** H "Sleep better" · S "Get better sleep every night with our app"
- **Fails:**
  - specificity
  - set fit (the subhead repeats the headline)
  - highlight
- **Pass 1:** H "Wake up **rested**" · S "Sleep sounds and an alarm that wakes you gently" (9 words). **Pass.** The headline carries the hook in search; the subhead pays off on the product page.

### 10. French MT tells (FR, photo editor, shot 3)
- **Draft:** "Éditez vos photos facilement!"
- **Fails:**
  - translation-safety ("éditer" is an anglicism for photo retouching)
  - typography (no NBSP before "!", and an exclamation mark)
  - specificity ("facilement")
  - highlight
- **Pass 1:** "Retouchez en **un geste**". Native verb, a concrete unit instead of "easily", no punctuation issue. **Pass.**

## Final gate (whole set, per locale)

Before rendering, confirm:
- [ ] every caption passed all nine checks, with its record in the plan
- [ ] the word ledger shows no repeats; accents are all different
- [ ] shots 1–3 alone convey the top three install reasons
- [ ] no unfilled `{placeholder}`, and every proof caption has a fallback
- [ ] the lint list in `anti-patterns.md` returns nothing
- [ ] for each non-English locale, a native-quality read-aloud of the whole set, checked against that locale file's Typography rules and Pitfalls
