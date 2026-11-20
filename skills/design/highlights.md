# Highlights

`**word**` in a caption becomes `<span class="hl">` and is styled by the theme's `highlight` mode. It tells the eye
where to land in under a second, so it is the most valuable two words of styling in the set.

## The eight modes (engine/compose.mjs → highlightCss)

| Mode | What it draws | Themes that use it | Needs |
|---|---|---|---|
| `color` (default) | the word in the accent colour | clean-light, soft-gray, midnight, finance-pro, mint, ocean, pastel, glass, rose, sunset, calm, forest, cream, editorial, ember, neon, playful, brand | accent ≥ 3:1 against the background |
| `pill` | accent box behind the word, text in `accentText`, rounded `.18em` | volt, brutal, sky | `accentText` ≥ 4.5:1 on accent (automatic unless the theme fixes it) |
| `gradient` | text filled with a gradient from `accent` to `secondary` | aurora, luxe | both stops ≥ 3:1. Without `secondary` it is just a flat colour |
| `underline` | accent underline, `.09em` thick, offset `.12em` | mono | nothing; the text keeps its colour |
| `marker` | highlighter band (85% accent, from 58% to 92% of the line) behind the word | none (opt-in) | text colour must contrast with the band |
| `outline` | hollow letters: transparent fill, `.035em` stroke in the text colour | none (opt-in) | very large type only |
| `sticker` | die-cut sticker: accent letters inside a thick `.075em` ring (`stickerColor`, white by default) and a soft drop shadow | none (opt-in) | accent ≥ 3:1 against the ring; a mid-tone or tinted background so the ring shows |
| `none` | nothing | none (opt-in) | hierarchy from size or position |

Switch the mode for the whole set with `"themeOverrides": { "highlight": "pill" }`, or for one store with
`"storeOverrides": { "android": { "theme": { "highlight": "pill" } } }`. The highlight CSS is scoped per slot,
so a per-shot `"theme": { "highlight": "pill" }` also works, but one mode per set is the rule (see below) — the one
exception is a `sticker` promise on a billboard shot 1, which is meant to look unlike the rest.
`plan.mjs validate` warns when a theme's highlight contrast is below 3:1.

## Choosing a mode

- **`color`** is the calm, neutral default for most niches. It is weakest on busy backgrounds (mesh, photos)
  where the accent competes with the background colours.
- **`pill`** is loud, sporty and Gen-Z. It also has the **best legibility on busy or mid-tone backgrounds**,
  because it brings its own contrast. It suits fitness, productivity, games, and any `full-bleed` or mesh set
  where `color` measures low. A pill adds `.16em` side padding, so very long highlighted phrases can push the fit
  loop to shrink.
- **`gradient`** is for AI, creative and luxury, on dark backgrounds only. On light backgrounds the light end of the
  gradient disappears. Keep it to short words: a gradient across three words looks like WordArt.
- **`underline`** suits editorial, minimal and design-savvy audiences. It survives thumbnails because the stroke is
  thick. It pairs with serif themes (`themeOverrides.highlight: "underline"` on `editorial` and `cream` is a
  strong move).
- **`marker`** is hand-made: notes, study, journaling, kids. Use it on light backgrounds with a mid-saturation accent
  (yellow, coral, mint): `{"highlight": "marker", "accent": "#FFD84D"}` on `clean-light`, `editorial` or `cream`.
  **Don't** use it on dark themes with light accents, because white text over a lime or cyan band is unreadable.
- **`sticker`** is playful and social: saving, sharing, creators, shopping. It belongs on a billboard promise at
  poster size, on a tinted background (on pure white the ring disappears and only the accent remains). Set it on
  shot 1 alone with `"theme": { "highlight": "sticker" }` — the one case where one shot may differ, because shot 1
  is meant to look unlike the rest.
- **`outline`** is display type for a closer. The stroke is about 0.4 px at thumbnail size, so the word vanishes in
  search. Use it only in `text-hero` (13 u) from shot 4 onward, never in shots 1–3.
- **`none`** lets size carry the hierarchy (`mono`-like typographic sets). Keep the `**` markup anyway: it's harmless,
  and the scorer and linter expect one highlight per headline.

## Which word to highlight

1. **The outcome, not the mechanism.** "Sleep **deeper** tonight", not "**Sleep tracking** for you".
2. **The number when the number is the proof.** "Fit in **25 minutes**", "**400+** recipes". A number plus its unit
   is one highlight.
3. **The searched keyword when it is also the benefit.** "Track every **calorie**" helps the caption index and the
   eye at once (`skills/aso/caption-indexing.md`).
4. **The differentiator** when shot 2 or 3 answers "why this app": "Works **offline**", "Your data stays **on
   device**".
5. **Never a filler word.** If every highlighted word is a stop word or shorter than 3 letters ("**your**",
   "**the**", "**ve**"), the scorer deducts 3.
6. **One per headline, two at most.** Copy lint warns at 3. Across a set, vary where the highlight sits (start,
   middle, end). If every shot accents its last word, the set looks templated.
7. **1–3 words, whole words.** Never split a word (`**seri**ni`). In Turkish, highlight the inflected word as a
   whole: "**Serini** bozma", "Her tekrarda **doğru form**".
8. **Localise the highlight.** The key word moves when transcreated, so choose it again for each locale. Don't copy
   its position from English. In CJK, highlight a 2–4 character compound. In Arabic and Hebrew, `color` and `pill`
   work, while `underline` collides with descenders and marks.

## Where `.hl` also renders

The same styling applies to `**…**` in subheads, chips, bullets, stat cards, notifications, chat bubbles, quotes and
comparison items. Rules:

- Highlights belong in **headlines**. In bullets, a `pill` or `marker` looks heavy, and `color` is fine once.
- Never put `**` in `comparison`'s right column or in solid chips. Both are filled with the accent, so a
  `color`-mode highlight disappears.
- Don't highlight inside `full-bleed` captions with `color` unless the accent is light. The caption is white on a
  dark scrim, so a dark accent dies there. `pill` is safer.

## Secondary emphasis

`_word_` gives `<em>`, in the theme's `emStyle` (italic by default). It is a genuine italic only on `editorial` and
`cream`. Use it for a tonal word ("_finally_", "_actually_"), never together with `**` in the same short headline.
