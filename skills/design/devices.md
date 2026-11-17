# Devices

All frames are drawn in CSS (`engine/frames/*.mjs` on top of `engine/lib/device.mjs`). They scale to any canvas,
carry no licence baggage, and are **not Apple or Google artwork**. Still, follow the spirit of both stores: an upright,
current-looking device on iOS, and little or no device on Google Play.

## Frames

| Frame | Kind | Looks like | Finishes (`deviceColor`) | Use it for |
|---|---|---|---|---|
| `iphone` | phone | Dynamic Island, thin bezel | black, natural, white, desert, silver, blue, graphite | iOS default |
| `iphone-notch` | phone | notch (X–14) | black, silver, white, gold, blue, pink | only if the app targets old devices; looks dated |
| `iphone-classic` | phone | Home button | white, black, silver, gold | chosen automatically for `iphone-5.5` |
| `ipad` | tablet | thin uniform bezel | graphite, silver, black, blue | iPad canvases with iPad captures |
| `android` | phone | punch-hole | black, silver, white, blue, pink, natural | Play phone when you want a device at all |
| `android-tablet` | tablet | Tab/Pixel Tablet | graphite, silver, black, natural | Play tablets with tablet captures |
| `flat` | any | rounded screen card, no hardware | none | **Google Play default**, screen grids, minimal brands |
| `clay` | phone | matte single-colour body | any CSS colour (default `#E9E6E1`) | playful, pastel and brand-led sets |
| `outline` | phone | thin stroke, no metal | stroke colour (default `#111111`) | `mono`, `editorial` and sketchy minimal brands |

Any CSS colour passed as `deviceColor` to a metal frame gives a clay-style single-colour body. Example:
`"options": { "deviceColor": "#E8436E" }` on `iphone` makes a brand-pink phone. A named finish passed to `clay`
falls back to its default `#E9E6E1`, so give clay a hex colour.

## How the frame is chosen

1. `shot.options.frame` wins and is used **as is on every store**. A shot-level `"frame": "iphone"` will put an
   iPhone on the Play canvas, so scope it: `"storeOverrides": { "ios": { "options": { "frame": "clay" } } }`.
2. Otherwise `theme.device.frame` (or `themeOverrides.device.frame`) is adapted to the canvas. `flat`, `clay` and
   `outline` stay as they are. Any other frame becomes `ipad` or `android-tablet` on tablets, `android` on Play phones,
   `iphone-classic` on `iphone-5.5`, and the iPhone family elsewhere.
3. Then the **capture decides**. If a phone-shaped capture (aspect < 0.62) lands in a tablet frame, the phone frame
   is used instead (`iphone` or `android`). If a tablet-shaped capture lands in a phone frame, `ipad` or
   `android-tablet` is used. `flat` never swaps. `clay` and `outline` swap to a tablet frame when the capture is
   tablet-shaped.
4. The screen opening always takes the capture's real aspect ratio, so a 9:20 Android capture gets a taller phone.
   No stretching ever happens.

**Google Play:** the Play guidance discourages device imagery and rotated images. Set this once:

```json
"storeOverrides": { "android": { "theme": { "device": { "frame": "flat" } } } }
```

Use `android` (punch-hole) only when the device itself matters to the story (for example widgets or a lock screen),
and never put an Apple frame on Play.

## Shadows

`theme.device.shadow` or `options.shadow`. All shadows scale with device width.

| Preset | Effect | Best with |
|---|---|---|
| `soft` (default) | two-layer neutral drop shadow | everything light |
| `float` | deeper, lifted | `clean-light`, `glass`, `sky`, `forest`, `luxe`, `clay` frames |
| `glow` | accent-coloured halo plus a dark drop | dark themes: `midnight`, `aurora`, `ember`, `neon` |
| `hard` | solid offset black, no blur | `brutal` only |
| `none` | flat | `mono`/`outline`, `flat` frames on busy backgrounds |

`outline` and `clay` have their own defaults (`none`, `float`), but the engine always passes a shadow (falling back to
`soft`). Set `"shadow": "none"` or `"float"` explicitly when you use those frames. On dark themes the `outline` stroke
default (`#111111`) is invisible, so pass `"deviceColor": "#FFFFFF"`.

## Size and bleed

- The default device width is 0.8 × canvas width on phones and 0.74 × on tablets (`hero-device`, `device-top`,
  `before-after`, `notification-stack`). Big is right: the screen is the proof.
- `options.deviceScale` works on `hero-device`, `device-top`, `tilted-device`, `duo-devices`, `trio-fan`, `bridge`,
  `before-after` and `notification-stack`. It is **ignored** by `feature-list` (despite its meta), `zoom-callout`,
  `floating-cards`, `split-diagonal`, `ui-pieces`, `chat-bubbles`, `social-proof`, `review-quote`, `comparison` and
  `big-number`, which use fixed widths tuned to their extra elements.
- Bleeding off the bottom is the premium default. On the 9:16 Play canvas the same phone shows about 70% of the screen
  (iPhone: about 90%), so make sure the benefit sits in the upper part of the capture.
- `"bleed": false` (hero-device) fits the whole device. That suits a closer or a small-UI app, but it looks timid on shot 1.

## Tilt limits

- Apple's marketing guidelines ask that official product images not be modified. These frames aren't Apple's, and App
  Review routinely accepts tilted frames, but upright is still the strictest-safe default. Keep the hook upright.
- 2D rotation (`options.rotate`): ±6–9° is energetic, more than 10° looks like a meme. `tilted-device` defaults to
  −9/+8 (alternating by shot index), `split-diagonal` to −6, `bridge` to 8, `duo-devices` to ±5 and `trio-fan`'s
  sides to ±11.
- 3D (`"perspective": true` on `tilted-device`) applies about 14° X and about 20° Y. Use it once per set at most, and
  never on text-dense UI, which gets hard to read.
- Tilt at most every other shot, and **never on Google Play**. Flip the layout for Android:
  `"storeOverrides": { "android": { "layout": "hero-device" } }` (shot-level overrides can replace any field,
  `layout` included).

## Multi-device layouts

| Layout | Devices | Story it tells | Rules |
|---|---|---|---|
| `duo-devices` | 2 (back left, front right) | step → result, input → output, two linked screens | `screens[0]` is the back (step 1), `screens[1]` the front (result). Keep both screens light or both dark. |
| `trio-fan` | 3 (centre front, sides behind) | variety: templates, themes, plans | `screens[0]` is the centre: put the best one there. The sides are 0.9× and partly hidden. |
| `screen-grid` | 2–4 flat cards | breadth ("everything in one place") | always `flat`; rows 3–4 bleed off the bottom, so the best two go first |
| `before-after` | 1 device, 2 screens | transformation | `screens[0]` = before (left of the slider), `screens[1]` = after |
| `banner` | 1–3 tilted | landscape promo graphics only | `graphic.mjs` builds it, so don't use it as a screenshot |

Multi-device frames are small, so they are poor hooks. Use them from shot 3 onward. If you show different apps or
platforms (watch, tablet) in one frame, the stores may read that as device imagery, so keep it to phones of one family.

## Finishes, in practice

- Match the finish to the background value: `black` or `graphite` on dark and saturated backgrounds, `silver` or
  `white` on pastels (`glass` uses silver, `pastel`, `rose` and `sky` use white), `natural` on warm paper (`cream`,
  `forest`, `soft-gray`).
- Use one finish for the whole set. Mixing finishes reads as stock mockups.
- `clay` with the brand colour (`"frame": "clay", "deviceColor": "<brand light tint>"`) is the modern alternative to
  real hardware. It pairs with `pastel`, `playful`, `sky` and the brand theme.
