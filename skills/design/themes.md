# Theme catalogue

There are 24 themes in `engine/themes/*.json`. `themes.mjs list [--mood calm]` prints them, and
`themes.mjs board --themes a,b,c` renders your shot 1 in each. Any field can be patched with `themeOverrides`
(deep merge): `accent`, `accentText`, `secondary`, `text`, `subtext`, `bg`, `bgAlt`, `highlight`, `case`,
`fontDisplay`, `fontText`, `headlineWeight`, `tracking`, `leading`, `emStyle`, `device.{frame,color,shadow}`,
`card.{bg,text,border,shadow,radius,glass}`, `decor`, `positive` and `eyebrow` (chip variant).

## At a glance

| id | Mood | Display font | Highlight | Device (frame · finish · shadow) | Background | Cyr / VI |
|---|---|---|---|---|---|---|
| `aurora` | AI, creative, futuristic | Sora 800 | gradient | iphone · black · glow | dark mesh: violet, cyan, magenta | ✗ / ✗ |
| `brand` | your brand | Inter 800 | color | iphone · black · float | derived mesh | ✓ / ✓ |
| `brutal` | loud, Gen-Z | Archivo Black | pill | iphone · black · hard | flat yellow `#FFE14D` | ✗ / ✗ |
| `calm` | sleep, soothing | Manrope 700 | color | iphone · black · soft | indigo → lavender | ✓ / ✓ |
| `clean-light` | neutral, trustworthy | Inter 800 | color | iphone · black · float | white → `#F2F3F8` | ✓ / ✓ |
| `cream` | warm, homey | DM Serif Display | color | iphone · natural · soft | warm beige `#FBF6EE` | ✗ / ✗ |
| `editorial` | literary, premium | Instrument Serif | color | iphone · black · soft | paper `#F4EFE6` | ✗ / ✓ |
| `ember` | intense, sport | Anton (CAPS) | color | iphone · black · glow | black, orange radial | ✗ / ✓ |
| `finance-pro` | trust, money | Manrope 800 | color | iphone · black · soft | navy + faint grid | ✓ / ✓ |
| `forest` | natural, grounded | Fraunces 700 | color | iphone · natural · float | deep green | ✗ / ✓ |
| `glass` | modern, airy | Plus Jakarta Sans 800 | color | iphone · silver · float | light pastel mesh | ✗ / ✓ |
| `luxe` | luxury, classic | Playfair Display 700 | gradient | iphone · black · float | black, gold radial | ✓ / ✓ |
| `midnight` | premium tech | Inter 800 | color | iphone · black · glow | navy-black + bloom | ✓ / ✓ |
| `mint` | fresh, healthy | Manrope 800 | color | iphone · black · float | light mint | ✓ / ✓ |
| `mono` | minimal, sharp | Inter 900 | underline | outline · `#000` · none | pure white | ✓ / ✓ |
| `neon` | edgy, gaming | Space Grotesk 700 | color | iphone · black · glow | black + green grid | ✗ / ✓ |
| `ocean` | calm trust, travel | Plus Jakarta Sans 800 | color | iphone · black · float | deep blue → cyan + waves | ✗ / ✓ |
| `pastel` | gentle, friendly | Outfit 700 | color | iphone · white · soft | pink, lavender, sky mesh | ✗ / ✗ |
| `playful` | fun, kids | Baloo 2 800 | color | iphone · white · float | 5 rotating solids (`bgAlt`) | ✗ / ✓ |
| `rose` | beauty, self-care | Poppins 700 | color | iphone · white · soft | blush | ✗ / ✗ |
| `sky` | airy, optimistic | Sora 700 | pill (navy) | iphone · white · float | light blue + clouds | ✗ / ✗ |
| `soft-gray` | iOS-native | system (SF Pro) 700 | color | iphone · natural · soft | `#F2F2F7` | ✓ / ✓ |
| `sunset` | warm, social | Bricolage Grotesque 800 | color | iphone · black · float | coral → peach | ✗ / ✓ |
| `volt` | sport, sharp | Inter 900 | pill (lime) | iphone · black · soft | pure black + grid | ✓ / ✓ |

Cyr / VI is the display face's Cyrillic and Vietnamese coverage. Every theme covers Turkish. Workarounds for ✗ are in
`typography.md`.

## Notes per theme

**aurora**: base `#07061A` with violet, cyan and magenta blobs (blur 0.18) and grain 0.06. White text, accent
`#7DF9FF`, secondary `#FF7AE6`. Glass cards. *Best for:* AI chat, generative image, video and music, creative tools,
and panoramas. *Watch:* a cyan blob behind the caption (contrast about 2.1:1), so pin the blobs low (`color.md`).
Override `secondary` with `accent`. *Pairs with:* `chat-bubbles`, `floating-cards`, `bridge`.

**brand**: built from `plan.brand` (`primary`, `secondary`, `background`, `dark`, `bg`). Inter, `color` highlight,
float shadow, grain 0.05. *Best for:* apps with a strong existing colour system. *Watch:* the accent is auto-pushed to at least 3:1, so a pale
brand colour comes out darker. Pin it with `brand.background` or `brand.dark`.

**brutal**: flat yellow, black type, black pill with yellow text, cards with a 5 px black border and a 10 px hard
offset shadow, three outlined decor shapes (pink, blue, white). The device has a `hard` shadow. *Best for:* Gen-Z
social, student productivity, creator tools, meme-able utilities. *Watch:* the `hard` shadow on every shot is the
look, so don't mix in soft themes. If you change the accent, the engine re-picks `accentText` when yellow-on-new-accent
falls below 4.5:1.

**calm**: indigo `#1E2754` → `#4B4F9A` → lavender `#9B8CCB`, a warm moonlight accent `#FFE1A8`, white sparkles in
the top 35% and a warm glow low down. Manrope 700. *Best for:* sleep, meditation, bedtime stories, night prayer,
relaxation. *Watch:* the pale bottom (3.0:1), so avoid `device-top`. The highlight is hue-only.

**clean-light**: white → `#F2F3F8`, near-black Inter 800, indigo accent `#4F46E5`, a faint accent glow behind the
device. *Best for:* productivity, utilities, education, B2B, trackers. It is the safe default. *Watch:* its edge
vanishes in store light mode, so tint `bg` slightly. Swap the accent for the brand colour.

**cream**: warm beige, espresso text, terracotta `#D9572E`, DM Serif Display 400 with a real italic, natural-titanium
device, multiply grain. *Best for:* recipes, meal plans, home, journaling, books, Quran and Bible reading. *Watch:*
Latin-only face. Highlight 3.6:1 (fine at headline size). `_em_` works here.

**editorial**: paper `#F4EFE6`, Instrument Serif 400 (condensed, with a real italic), rust accent `#C2410C`,
leading 0.98, grain 0.09. *Best for:* reading, writing, news, culture, premium lifestyle, journaling. *Try:*
`highlight: "underline"`, or the `outline` frame (`deviceColor: "#141414"`, `shadow: "none"`) for a magazine look.
The condensed face fits long Turkish and German words well.

**ember**: a black-red radial with an orange glow, Anton in uppercase (`case: "upper"`), accent `#FF6A2B`, glow
shadow. *Best for:* intense training, combat sports, running, motivation. *Watch:* never type caps (the theme
uppercases with correct Turkish İ). No Cyrillic.

**finance-pro**: navy gradient, emerald accent and `positive` `#34D399`, a faint grid plus an emerald glow, Manrope
800, glass cards. *Best for:* banking, budgeting, investing, invoicing, business. *Pairs with:* `floating-cards`,
`big-number`, `zoom-callout` (charts). No confetti, ever.

**forest**: deep green gradient, cream Fraunces 700, light-green accent `#B5E48C`, natural device, soft green blobs.
*Best for:* plants, gardening, outdoors, sustainability, meditation, Islamic apps. *Watch:* the highlight is hue-only.
No Cyrillic.

**glass**: a light mesh (periwinkle, pink, mint, lilac), frosted cards (`rgba(255,255,255,0.55)` plus blur), silver
device, Plus Jakarta Sans 800, no decor. *Best for:* light-mode AI assistants, calendars, productivity, wellness, and
panoramas. *Watch:* the indigo highlight can drop to 2.5:1 on the blue blob. No Cyrillic.

**luxe**: a black-brown radial, ivory Playfair Display 700, a gold-to-bronze gradient highlight, a gold glow and
grain. *Best for:* premium memberships, fashion, jewellery, astrology, private banking, Ramadan and Quran sets.
It covers Cyrillic and Vietnamese. *Watch:* gold on gold. Keep the decor to the glow.

**midnight**: a navy-black radial with an accent bloom behind the device, Inter 800, periwinkle `#8EA2FF`, glow
shadow, glass cards. *Best for:* premium tech, focus, AI, developer tools, VPN, finance. It is the safest dark theme.
*Watch:* in panorama the bloom becomes a single glow in the middle shot.

**mint**: light mint gradient, deep-green Manrope 800, accent `#0E9F6E`, a fading dot grid. *Best for:* nutrition,
water, health, money-saving, eco, habits. Highlight 3.3:1, fine for bold headlines.

**mono**: pure white, black Inter 900 (tracking −0.05), a black underline highlight, an `outline` frame with no shadow,
black-bordered cards, no decor. *Best for:* minimal tools, writing, design and dev tools, typography-led brands.
*Watch:* white on white in store light mode. On dark overrides the outline stroke must turn white.

**neon**: near-black, electric green `#39FF14`, magenta secondary, a green grid plus glow, Space Grotesk. *Best for:*
gaming, crypto, VPN, nightlife, hacker utilities. *Watch:* the highlight is hue-only, and the set has no edge in
store dark mode. No Cyrillic.

**ocean**: deep blue → cyan with white waves at the bottom, ice accent `#9BF6FF`, Plus Jakarta Sans. *Best for:*
travel, weather, surf and swim, calm finance, health. *Watch:* the pale bottom (2.5:1), so no `device-top`.

**pastel**: a soft pink, lavender, sky and peach mesh, violet accent `#7C3AED`, white device, Outfit 700. *Best
for:* journaling, period and pregnancy, kids, teen social, wellbeing, and panoramas. *Watch:* Latin-only face.

**playful**: solid blue, with `bgAlt` rotating coral, green, purple and orange per shot, a yellow accent with dark
`accentText`, Baloo 2 plus Nunito, white device, confetti in the top 30%. *Best for:* kids, casual games, learning,
streaks, family. *Watch:* white-text contrast is 2.1–2.9:1 on most backgrounds. Deepen `bgAlt` or use
`highlight: "pill"`. `bgAlt` is ignored in panoramas.

**rose**: blush gradient, berry text `#3A0D1E`, pink accent `#E8436E`, Poppins 700, white device, pink sparkles.
*Best for:* beauty, skincare, cycle and pregnancy, self-care, soft dating. *Watch:* Latin-only face.

**sky**: a sky gradient with white cloud blobs, navy Sora with a navy pill (white text), white device. *Best for:*
weather, travel, flights, kids, gentle productivity. *Watch:* Latin-only face.

**soft-gray**: iOS system grey `#F2F2F7`, SF Pro (system stack) black, iOS blue `#007AFF`, natural device, no decor.
*Best for:* utilities, pro tools, health records, and settings-heavy apps that should feel native. *Watch:* it
renders SF Pro only on macOS (elsewhere Segoe UI, Roboto or Arial). It looks like Apple's own marketing, so keep your brand
visible (accent and icon in the UI) to stay clear of 5.2.5. For Play, consider
`storeOverrides.android.theme.fontDisplay = { "family": "Inter", "google": "Inter:wght@700;800" }`.

**sunset**: coral → orange → peach, white Bricolage Grotesque 800, a butter accent `#FFE58A`, grain. *Best for:*
dating, social, travel, food, events, music. *Watch:* the pale bottom (1.8:1) and a hue-only highlight. `pill`
improves both (dark text on butter is automatic).

**volt**: pure black, white Inter 900 (tracking −0.045), a lime pill with black text, dark cards `#1A1A1A`, a faint
grid. *Best for:* fitness, running, sports tech, productivity for power users, Gen-Z fintech. This is Pulse's theme
(with accent `#C6F432`). *Watch:* no edge in store dark mode. A darker override accent automatically gets white pill text.

## Variant pairings for A/B tests

Test two themes that differ in **one** dimension, so the result teaches you something:

| Niche | A | B | What you learn |
|---|---|---|---|
| Fitness | `volt` | `ember` | sharp tech vs intense heat |
| AI assistant | `aurora` | `glass` | dark spectacle vs light clarity |
| Finance | `finance-pro` | `clean-light` | serious dark vs open light |
| Meditation / sleep | `calm` | `pastel` | night vs day |
| Food / journaling | `cream` | `editorial` | warm serif vs literary serif |
| Utility | `soft-gray` | `midnight` | native light vs premium dark |
| Kids / games | `playful` | `sky` | loud colour vs calm air |

`variants.mjs make --themes a,b`, then `variants.mjs tournament`. Look at the boards before adopting (`skills/aso/testing.md`).
