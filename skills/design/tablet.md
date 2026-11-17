# Tablet sets (iPad and Play tablets)

## Do you need one?

| Store | Canvas ids | When it is needed |
|---|---|---|
| App Store | `ipad-13` (2064×2752, required class), `ipad-11` (scaled from 13″ if missing) | the app runs natively on iPad (universal target). iPhone-only apps need none. `check.mjs` warns when `profile.app.supportsIPad` is true and there is no iPad set. |
| Google Play | `android-tablet-7` (1200×1920), `android-tablet-10` (1600×2560) | optional, but tablet surfaces and large-screen promotion want at least 4. Play notes that extra text "can get cut off on Play homepages", so keep tablet captions short. |

Add the ids to `plan.sizes`. Every layout adapts automatically.

## What the engine changes on tablet canvases (`kind: "tablet"`)

- Side padding 9% of W (phone 7.5%). The caption band runs 5%–25% of H, and the device starts at about 27% of H.
- u is height-limited: 12.7 px on `ipad-13`, 11.8 on `android-tablet-10` and 8.86 on `android-tablet-7`. Headlines
  are relatively narrower than on a phone and often fit one line. Use `\n` if you want the 2-line rhythm of the
  phone set.
- Default device widths are smaller: `hero-device` 0.74 W, `tilted-device` 0.72, `duo-devices` 0.55, `trio-fan`
  0.46, `zoom-callout` 0.62, `floating-cards` 0.6, `chat-bubbles` 0.62, `feature-list` 0.62, `big-number` 0.64,
  `social-proof` 0.56. Bubbles (52 u), notifications (64 u) and quote cards (70 u) narrow to match.
- Frames: the theme's frame becomes `ipad` (iOS) or `android-tablet` (Play). `flat`, `clay` and `outline` stay as
  they are.

## Phone captures on a tablet canvas

The engine **keeps a phone frame when the capture is phone-shaped** (aspect < 0.62). On iPad you get an `iphone`,
and on Play tablets an `android`. That is honest about what the pixels are, but at the tablet default (0.74 W) the
phone is huge: about 60% of its screen shows, and it reads as a zoomed-in phone.

- Use it **only as a fallback**: the iPad UI is the same single column as the phone, or you have no tablet capture
  yet. If the app has a real iPad layout (sidebar, split view, multi-column, Pencil, keyboard), Apple expects the
  screenshots to show it (2.3: "accurately reflect the app's core experience").
- If you must, size the phone down: `"options": { "deviceScale": 0.52 }` on `hero-device`, `device-top` or
  `notification-stack`. Better still, use layouts that fill a wide canvas with phones: `duo-devices` (two phones
  side by side read well at 3:4), `trio-fan` (the natural tablet layout for phone captures), and `screen-grid`.
- `zoom-callout`, `floating-cards`, `feature-list` and `chat-bubbles` ignore `deviceScale`, and their fixed widths
  (0.6–0.62 W) still give a big phone. Avoid them for phone captures on tablets.

## Capturing real tablet UI (preferred)

- Give each screen both variants and let the canvas pick:

```json
"screen": { "phone": "raw/today.png", "tablet": "raw/ipad/today.png" }
```

  The engine takes `screen[kind]` (`phone` or `tablet`), then `phone`, then `tablet`. `{locale}` paths work inside
  it as well (`"tablet": "raw/{locale}/ipad/today.png"`).
- Capture **portrait** on the iPad Pro 13″ simulator (2064×2752) or a Pixel Tablet/Tab emulator in portrait.
  All tablet canvases are portrait, so a landscape capture would sit as a short slab in a tall canvas.
- Use the same demo data as the phone set, so the stories match across devices.

## Layouts for 3:4 canvases

| Works well | Why |
|---|---|
| `hero-device` with an iPad capture | the iPad at 0.74 W bleeds slightly, the strongest hook |
| `zoom-callout` | the wide canvas leaves room for a large magnifier, good for dense iPad dashboards |
| `ui-pieces` | widgets and cards float well on a big canvas |
| `device-top` | a sidebar plus content looks great hanging from the top |
| `trio-fan` / `duo-devices` with phone captures | fills the width without a giant single phone |
| `feature-list` | bullets plus a tablet below, good for productivity tablets |
| `text-hero` (closer) | big statement, lots of air |

| Use with care | Why |
|---|---|
| `tilted-device` with an iPad | a big rotated slab looks heavy. Use ≤ 5° or keep it upright. |
| `floating-cards` | 44 u cards look small next to an iPad. `"w": 52, "size": 1.2` per card helps, but it also enlarges them on phones. `zoom-callout` is often better. |
| `split-diagonal`, `bridge` | built around phone proportions |
| `full-bleed` | fine for content apps (photos, maps, video), but the 3:4 crop cuts the sides of a phone capture |

## One plan or two?

`storeOverrides` keys are `ios` and `android`, so the iPad shares every override with the iPhone, and per-size
overrides don't exist (only `skipOn` accepts size ids). In practice:

- **One plan** (recommended) with `{phone, tablet}` screens. The built-in tablet geometry handles the rest.
- **Separate tablet plan** only when the tablet story differs (different hero, different order):
  `appshot/variants/ipad.json` with `"workspace": ".."` and `"sizes": ["ipad-13"]`, rendered with
  `render.mjs --plan appshot/variants/ipad.json`. Remove `ipad-13` from the main plan and render the main plan
  **last**, so `review/render-report.json` covers the phone sizes. `check.mjs` then warns, but doesn't fail, for the
  tablet folder.
