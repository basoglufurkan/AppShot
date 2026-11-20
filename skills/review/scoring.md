# How score.mjs works (and what it cannot see)

`node scripts/score.mjs [--draft]` scores each size × locale 0–100 from the plan, the render report and the real PNG
pixels. Shots 1–3 weigh 1.6× the rest.

| Part | Max | Measures |
| --- | --- | --- |
| Copy | 35 | lint errors (−12) / warnings (−4) from `engine/lib/copyrules.mjs`; 2–6 words; benefit signal (verb start, "you/sen", a number, Turkish verb ending); highlight present and on a content word; subhead length |
| Legibility | 25 | headline size at App Store search-thumbnail scale (≈120 pt wide): < 7 pt bad, ≥ 10.5 pt good; fit; 3-line headlines in shots 1–3 (unless set at poster size, ≥ 12 u); text shrunk below 82 % of its max |
| Contrast | 15 | p10/p90 luminance inside the headline box of the rendered PNG: < 2.2:1 bad, ≥ 4.5:1 full |
| Composition | 15 | placeholders (−12), caption over device, broken images, text-only frames in shots 2–3 |
| Story | 10 | layout variety, hook layout first, shot 1's promise the biggest type (≥ 1.12× the median of the others, except a full-bleed opener), ≥ 5 shots, set-level lint, keywords in shots 1–3, back-to-back layouts, a concrete number in shots 1–3 |

Verdicts: ≥ 85 ship · 70–84 iterate · < 70 rework. `Top fixes` are sorted by points recovered.

## Limits
The score measures mechanics. It cannot judge whether the hook is the *right* promise, whether the UI is impressive,
whether the theme suits the brand, or whether the set beats the competitors in the niche. Those come from the brief and
the visual critique. Use the score to catch regressions and to rank variants that you have already judged as viable.
