# Typography

Headlines sell the shot, so this file covers how the engine sizes them, and which levers change the result.

## The u unit

Every text size in a template is in **u**:

```
u = min(W, H × 0.4615) / 100        (engine/compose.mjs, buildCtx)
```

So u is 1% of the canvas width on tall canvases, and it is limited by height on short ones. That makes the same
layout look the same on 6.9″ and 6.3″, but text is relatively smaller on squat canvases.

| Size id | Canvas | u (px) | 10 u headline | px needed for 10.5 pt in search* |
|---|---|---|---|---|
| iphone-6.9 | 1320×2868 | 13.2 | 132 | 116 (8.75 u) |
| iphone-6.3 | 1206×2622 | 12.06 | 121 | 106 (8.75 u) |
| iphone-5.5 | 1242×2208 | 10.19 | 102 | 109 (10.7 u) |
| android-phone | 1080×1920 | 8.86 | 89 | 95 (10.7 u) |
| android-phone-tall | 1080×2160 | 9.97 | 100 | 95 (9.5 u) |
| ipad-13 | 2064×2752 | 12.7 | 127 | 181 (14.2 u) |
| android-tablet-10 | 1600×2560 | 11.81 | 118 | 140 (11.9 u) |
| play-feature | 1024×500 | 2.31 | — | banner sizes by height |

\*The scorer (`scripts/score.mjs`) treats every canvas as a 120-pt-wide thumbnail. On `android-phone` the default
10 u maximum can't reach 10.5 pt, so every shot loses 3 legibility points. Recover them with a per-shot Play
override: `"storeOverrides": { "android": { "options": { "textSize": 11 } } }`, which only helps if the copy is
short enough to fit at that size. iPad shares the `ios` store key with iPhone, so it can't be overridden per size.
Short iPad headlines render at `max` anyway, so accept the small deduction there.

## How a headline is fitted

`ctx.text({max, min, lines})` creates a box and the in-page fit loop sizes the text:

1. Start the headline at `max` u. The subhead is `max(headline × 0.42, min × 0.5, 18 px)`.
2. Shrink by 4% per step while the block is taller than the box, a word is wider than the box, or the line count is
   above `lines`.
3. Stop at `min`. If it still doesn't fit, the slot reports `ok: false` and `check.mjs` blocks the export.

| Layout(s) | max | min | lines | Box (phone) |
|---|---|---|---|---|
| Most layouts (topText band) | `options.textSize` (10) | 5.4 | 3 | y 5.8%–28.3% of H, pad 7.5% of W |
| `feature-list` | 9 | 5.4 | 3 | shorter band (17% of H), left aligned |
| `full-bleed` | `textSize` (10.5) | 5.4 | 3 | 24% of H, top or bottom (`scrim`) |
| `text-hero` | `textSize` (13) | 7 | 4 | 30% of H, below the icon |
| `bridge` | 10.5 | 5.4 | 4 | left 62% of W |
| `big-number` | `statSize` (30) number, 7.4 label | 12 / 4.6 | 1 / 2 | number in accent, label below |
| `device-top` | `textSize` (10) | 5.4 | 3 | bottom band, ends at 95.5% of H |

Read the outcome in `review/draft-report.json` → `slots[i].text[0]` = `{fontSize, max, min, lines, ok}`. Rules:

- `fontSize` = `max` and `lines` ≤ 2 is ideal.
- `fontSize` < 0.82 × `max` costs 2 points. It means the copy is too long, so rewrite it.
- `fontSize` ≈ `min` is a failure even when `ok` is true, because the headline is about 6 pt in search.
- `lines` = 3 in shots 1–3 costs 3 points.
- Raise `options.textSize` (11–12) only for very short headlines ("Sleep **deeper**") that look lost at 10.

## Line breaks

- `\n` (a newline in the JSON string, or a literal `\\n`) forces a break. Otherwise `text-wrap: balance` evens out the lines.
- Break at meaning boundaries: subject | promise. Keep the highlighted phrase on one line. A pill that wraps across two
  lines works (`box-decoration-break: clone`) but looks broken.
- Long single words can't wrap: `overflow-wrap` is off for non-CJK, and the box shrinks the whole headline to make
  them fit. In Turkish, German and Finnish, rewrite instead ("kişiselleştirilmiş" → "sana özel").
- Headlines never hyphenate by default (`hyphens: manual`). For `de-DE`, `nl-NL` and `sv` (`hyphens` in
  `locales.json`) the fit loop hyphenates words of 11 or more characters **only** when the headline still fails at
  `min`. The report then shows `hyphenated: true`. Treat that as "rewrite": a hyphenated hero word looks careless.
- Never end a line on a lone article or preposition ("a", "for", "ile", "için"). Add a `\n` earlier.

## Case, weight, tracking

- Sentence case is the default and the safest choice. Only `ember` sets `case: "upper"` (Anton, a condensed face
  that stays narrow in caps). Forcing `"themeOverrides": { "case": "upper" }` on a wide grotesk shouts and shrinks.
- **Never type capitals in the source text.** Let the theme transform it. The page has `lang="<locale>"`, so CSS
  uppercasing is locale-correct: Turkish "kişisel" becomes "KİŞİSEL" and "ılık" becomes "ILIK", and German ß becomes SS.
  Copy lint flags all-caps source text.
- Grotesk headlines are already tight (`tracking` −0.035 to −0.05 em, `leading` 0.98–1.06, weight 800–900). Don't
  loosen them for Latin scripts. Loosen `leading` for scripts with tall marks (below).
- Overrides: `themeOverrides.headlineWeight`, `.tracking` (`"-0.02em"`), `.leading` (`1.1`), `.subheadWeight`.

## Serif or grotesk

| Feel | Themes (display face) | Use for |
|---|---|---|
| Literary, crafted, warm | `editorial` (Instrument Serif 400), `cream` (DM Serif Display 400) | reading, writing, food, home, journaling |
| Premium, classic | `luxe` (Playfair 700), `forest` (Fraunces 700) | luxury, astrology, faith, nature |
| Neutral, product-led | `clean-light`, `midnight`, `volt`, `mono`, `brand` (Inter); `soft-gray` (SF Pro) | utilities, productivity, finance, fitness |
| Friendly, modern | `calm`, `mint`, `finance-pro` (Manrope); `glass`, `ocean` (Plus Jakarta Sans); `aurora`, `sky` (Sora); `pastel` (Outfit); `rose` (Poppins); `sunset` (Bricolage Grotesque) | wellness, AI, travel, social |
| Loud, techy | `neon` (Space Grotesk), `brutal` (Archivo Black), `ember` (Anton caps) | games, Gen-Z, intense sport |
| Rounded, kid-safe | `playful` (Baloo 2 + Nunito) | kids, learning, casual games |

- `_word_` renders as `<em>` in the theme's `emStyle`, which is italic by default. Only `editorial` and `cream` load
  a real italic. Every other theme synthesises a slanted roman, so avoid `_…_` there or set
  `"themeOverrides": { "emStyle": "normal" }`.
- Serif headlines need fewer words than grotesk ones because the 400 weight carries less mass at thumbnail size.

## Brand and custom fonts

```json
"fonts": { "local": [{ "family": "Brand Sans", "src": "fonts/BrandSans-Heavy.woff2", "weight": 800 }] },
"themeOverrides": { "fontDisplay": { "family": "Brand Sans" }, "headlineWeight": 800 }
```

`src` is relative to `appshot/`. For a Google family, add `"fonts": { "google": ["Rubik:wght@600;800"] }` and
override `fontDisplay.family`. The report's `fonts[].loaded: false` (or `"offline": true`) means the system fallback
was used. Re-render online before export.

## Script coverage per locale

Fonts that don't cover a script fall back **per glyph** to the system font, so a hero word gets letters in a second
typeface. These results come from rendering each theme face from Google Fonts:

| Display face | Themes | Turkish | Cyrillic | Vietnamese |
|---|---|---|---|---|
| Inter, Manrope, Playfair Display, Nunito, system | clean-light, midnight, mono, volt, brand, calm, mint, finance-pro, luxe, soft-gray | ✓ | ✓ | ✓ |
| Plus Jakarta Sans, Space Grotesk, Bricolage, Anton, Baloo 2, Instrument Serif, Fraunces | glass, ocean, neon, sunset, ember, playful, editorial, forest | ✓ | ✗ | ✓ |
| Sora, Outfit, Poppins, Archivo Black, DM Serif Display | aurora, sky, pastel, rose, brutal, cream | ✓ | ✗ | ✗ |

For `ru`, `uk` or `vi` with an ✗ theme, scope a face to that language. The page sets `lang`, so this works:
`"css": ":lang(ru) .hd,:lang(ru) .sh{font-family:Inter,-apple-system,sans-serif}"` (Inter is already loaded by
most themes; otherwise add it to `fonts.google`).

**Locale fonts in `engine/locales.json`** are put *first* in the stack for `ja`, `ko`, `zh-Hans`, `zh-Hant`,
`ar-SA`, `he`, `hi` and `th`. They contain Latin glyphs, so in those locales the theme face is fully replaced (numbers
and Latin words too), and a serif theme turns sans. To keep a serif mood, use:
`"css": ":lang(ja) .hd{font-family:'Hiragino Mincho ProN','Noto Serif JP',serif}"`.
These are system fonts. A Linux render without Noto shows tofu, so render on macOS or install Noto CJK.

## Script-specific rules

- **Turkish:** dotted and dotless I are handled by `lang="tr"`. Never write "ISTANBUL" by hand. Check ğ, ş, İ in any
  brand font. Keep *mi/mı* with its word. See `skills/locales/tr.md`.
- **CJK:** `line-break: strict` (all CJK) and `word-break: keep-all` (Korean) are set automatically. Budget 14–18
  characters (`maxHeadline`). Use `\n` to break at a phrase boundary, because the fit loop otherwise breaks wherever
  width runs out. Don't add Latin-style tracking. Don't rely on `**highlight**` as the only emphasis: colour works,
  `underline` and `outline` look odd on dense glyphs.
- **Arabic and Hebrew:** `dir="rtl"` is set and left-aligned layouts flip to right-aligned. Arabic needs taller lines,
  and theme `leading` ≈ 1.04 clips marks, so add `"css": ":lang(ar) .hd{line-height:1.3!important}"` (`:lang(ar)` matches `ar-SA`. `!important` is needed
  because each slot's own type rule is more specific). Never use `case`,
  `outline` or letter-spacing on Arabic. Mirroring limits: `accessibility.md`.
- **Devanagari and Thai:** stacked marks need `line-height` ≥ 1.25 (use the same `:lang(hi)` / `:lang(th)` rule with `!important`). Budget 28–32
  characters.
