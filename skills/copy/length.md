# Length and readability

A caption that can't be read at thumbnail size doesn't exist. These are hard limits, not style preferences.

The per-locale character ceiling the tooling enforces is `maxHeadline` in `engine/locales.json`: `copy-check` warns above 1.2× and errors above 1.6×. The targets below sit under that ceiling. Aim for the target, and treat the ceiling as the point where the caption must be rewritten.

## Hard limits

| Element | Limit | Target |
|---|---|---|
| Headline words | 2–6 | 3–5 |
| Headline lines | ≤ 2 (a 3rd only on non-hook shots in long-word locales, as a last resort) | 2 |
| Accent words | 1–2 per headline, on one line | 1 |
| Subhead words | ≤ 12 | 6–9 |
| Subhead lines | ≤ 2 | 1 |
| Headline font size | ≥ 8% of canvas width (≈ 100 px on a 1290 px canvas) | 9–11% |
| Subhead font size | ≥ 4.5% of canvas width (≈ 58 px) | ~45% of the headline size |

## Why these numbers: the thumbnail math

- **In App Store search on iPhone,** three portrait screenshots share the screen width, so each displays roughly 110–125 pt wide. A 1290 px-wide canvas (6.9" class) shrinks to about 0.09 pt per canvas pixel.
- **The headline:** to read at a glance, it needs about 11 pt on screen, which is 11 ÷ 0.09 ≈ **120 px on the canvas**, or roughly 9% of its width.
- **The subhead:** at ~58 px it displays at ~5 pt in search, which is unreadable. **Subheads are for the product page,** where screenshots display several times larger, and never for the message shot 1 depends on.
- **Characters per line:** at a 120 px bold sans (~0.55 em average glyph width) with ~7% side margins, a line holds roughly **15–18 Latin characters**. The per-line limits below follow from this.

For other canvas sizes (iPad, Android phones and tablets), apply the same percentages to the canvas width, not the same pixel values.

## Characters per line by script family

| Family | Locales | Chars per headline line | Headline total | Notes |
|---|---|---|---|---|
| Latin (baseline) | en-US, en-GB | 12–18 | ≤ 28 | the source; leave slack for expansion |
| Latin, expanding | de-DE, fr-FR, es-ES, es-MX, pt-BR, it, nl-NL, sv, pl, tr, id | 12–18; no single word > 14 | ≤ 32 | cut words, don't shrink below the minimum font size |
| Latin + stacked diacritics | vi | 12–18 | ≤ 32 | line-height ≥ 1.25; no all caps |
| Cyrillic | ru | 11–16 | ≤ 30 | wider glyphs; long adjectives |
| Chinese / Japanese | zh-Hans, zh-Hant, ja | 6–10 | ≤ 14 (zh), ≤ 16 (ja) | full-width glyphs; break at phrase boundaries |
| Hangul | ko | 7–12 syllables | ≤ 18 | `keep-all` word breaking |
| Arabic | ar-SA | 10–16 | ≤ 28 | line-height ≥ 1.4; no letter-spacing |
| Hebrew | he | 12–18 | ≤ 28 | often compact; use any spare room for size, not words |
| Devanagari | hi | 10–16 | ≤ 28 | line-height ≥ 1.4; matras need room |
| Thai | th | 10–16 | ≤ 28 | word segmentation; line-height ≥ 1.5 |

**Typical expansion vs English** (characters): de +25–35%, es/pt/pl +20–30%, fr/it +15–25%, ru +15–30%, tr/id +10–25%, nl +10–25%, vi +10–30%, sv +5–20%, hi +10–30% (width), ar ±20%, th 0–20%, he −20% to +10% (varies), ko −20–40%, ja/zh −40–50% (but glyphs are double-width). The reasons and the native shortening tricks are in each locale file's "Length" section.

## Line breaks

- **Break by meaning.** Each line should be a phrase that reads on its own: "Know where every / **dollar** goes", not "Know where / every dollar goes".
- **Put the punch at the end.** In English and Romance languages the payoff usually closes the line. In Turkish (verb-final) it is the object or the final verb. In Japanese it is the noun ending. In German it is often a nominal phrase that closes.
- **Balance:** line 2 should be at least ~60% of line 1, *or* deliberately short for punch (one strong word). Never a lone 2–3 letter orphan.
- **Never split:**
  - number + unit ("5 min"), currency + amount
  - a proper noun + its suffix ("Instagram'da")
  - French NBSP punctuation (" ?", " !")
  - Turkish *mı/mi* particles from their word
  - compounds (de, nl, sv)
  - Vietnamese two-syllable words, Thai words, CJK words
  - a highlighted phrase
- **Explicit breaks:** where the caption format allows a manual line break, use one whenever the natural wrap lands wrong. Always set breaks by hand for CJK and Thai.
- **After rendering, read every image.** Widows, clipped diacritics and stranded punctuation only show up in the PNG.

## When to use a subhead

Use one when:
- **The headline is an outcome and the "how" makes it believable.** H "Wake up **rested**" · S "A smart alarm wakes you in light sleep".
- **A qualifier is required for honesty:** "on supported devices", "with Apple Watch", "App Store rating in Türkiye". Trial and price terms are never a subhead; they belong on the paywall.
- **A differentiator needs one concrete line.** H "Your data stays **yours**" · S "Stored on your iPhone, no account needed".

Skip it when:
- it's shot 1 and the subhead carries essential meaning (unreadable in search)
- it restates the headline, or the screen already shows the explanation
- a long locale needs the space to keep the headline at full size

Style:
- sentence case, no accent markup, ≤ 12 words, no closing full stop unless the set uses them
- keep the subhead position identical on every shot that has one

## Fitting procedure (when a caption overflows)

1. **Cut filler:** articles, "easily", "all your", "app", "now".
2. **Swap a long word for a shorter native one** (see the locale's "Length" section).
3. **Restructure verb → noun phrase:** "Keep track of every expense" → "Every expense, tracked".
4. **Move secondary detail into the subhead.**
5. **Reduce the font size,** but never below the minimums above.
6. **Allow a third line,** on non-hook shots in expanding locales only.
7. **Still failing:** rewrite with a different formula (`formulas.md`).

Never:
- tighten letter-spacing or synthesise a condensed font
- hyphenate a headline word
- truncate with "…"
- drop diacritics to save width

## Readability checklist

- **Contrast:** headline against background ≥ 4.5:1 (WCAG's 3:1 large-text minimum isn't enough at thumbnail size). The accent colour must also pass on its background.
- **Weight:** bold or heavy for headlines. No thin weights; no text over busy photos without a scrim.
- **Clear zone:** headlines never overlap device UI or decor.
- **Squint test:** blur your eyes at arm's length. If the headline shape disappears, increase size or contrast.
