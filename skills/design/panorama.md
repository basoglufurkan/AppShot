# Panorama sets

In a panorama, the screenshots are cut from one continuous image. When people swipe the product page, the background
flows across the seams and a device can cross from one shot into the next. Done well it signals craft. Done badly it
breaks the first three search thumbnails.

## How the engine builds it

- `"panorama": true` (or `"background": { "mode": "panorama" }`) renders all shots as slots of one strip,
  `N × W` wide.
- **One background** is drawn across the whole strip: `plan.background.bg` if set, otherwise the theme `bg`.
  `bgAlt` is ignored.
- **Decor** is drawn once across the strip: theme `decor` plus `plan.background.decor`. A shot's own `decor` still
  renders in its slot and may spill over the edges. Remove theme decor with `"themeOverrides": { "decor": [] }`.
- **Slots don't clip.** Each slot is `overflow: visible`, and earlier slots stack **above** later ones (z-index
  N − k). Anything that pokes past the right edge lands on top of the next shot.
- A shot with its own `background` paints an opaque slot over the strip, which breaks continuity there. Avoid it,
  or use it only on a deliberate closer.

## When to use it

Use it when the set has 5 or more shots, the brand is premium, creative or AI-led, and the theme has a background that
can flow: `aurora`, `glass` and `pastel` (meshes), `brand` (mesh by default), or any theme with a horizontal gradient
override. It is especially good for AI, creative tools, meditation, travel, games and fashion.

Skip it when:

- The app is a utility where every shot must be a self-contained argument (finance, scanners, VPN).
- The set is mostly Play (Play asks that the first three images prioritise UI "even when the design spans
  several images", and many Play surfaces show single images out of order).
- The set has RTL locales. RTL storefronts lay the carousel out right to left, so a left-to-right flow reads
  backwards. Panorama is plan-wide, so render `ar-SA` and `he` from a variant plan
  (`appshot/variants/rtl.json` with `"workspace": ".."` and `"panorama": false`) via `render.mjs --variant rtl`.

## Backgrounds that flow

| Background | In strip mode | Verdict |
|---|---|---|
| `mesh` | blobs spread along the whole strip (about 2.2 per slot), seamless | best default |
| `linear` with `angle: 90` (to 120) | one gradient across the whole set, a colour journey from shot 1 to N | excellent: `{"type":"linear","angle":90,"colors":["#1E2754","#4B4F9A","#C86FA8","#FFB36B"]}` |
| `linear` with `angle: 180` | the same vertical gradient in every slot | seamless but static, so continuity must come from bridges |
| `radial` | one bloom centred on the **whole strip** (the middle shot) | move it with `at: "15% 30%"`, or use a mesh |
| `image` | one photo stretched across the strip (`cover`) | a real panoramic photo only (use an absolute or https `src`) |
| `solid` | seamless, no visible flow | only with bridges |

Explicit mesh blobs use **strip fractions**: `x: 0.5` is the middle of the set, not of a slot. To place blob or glow
k of N at the centre of shot k, use `x = (k + 0.5) / N`.

Point decor (`glow`, `beams`, `rings`) is also positioned in strip fractions, so a theme's `glow` at `x: 0.5`
becomes **one** glow behind the middle shot. To light each device, list per-slot glows in `plan.background.decor`
(`{"type":"glow","x":0.1,"y":0.72,"size":0.6}`, `x: 0.3`, `x: 0.5`, …), or add a `glow` to each shot's `decor`.
Pattern decor (grain, grid, dots, confetti, sparkles, shapes, blobs, waves) scales its count with the strip
automatically. Glows are also sized from the strip (0.75 × H instead of the slot width), so they come out about 1.6× larger
than in a normal set. Use `size` 0.5–0.6.

## The bridge layout

```json
{ "id": "form", "layout": "bridge", "screen": "raw/workout.png",
  "headline": { "en-US": "Perfect form,\n**every rep**" }, "options": { "rotate": 8, "deviceScale": 0.86 } }
```

- The caption sits top-left (box 62% of W, up to 4 lines at 10.5 u). The device is centred **on the right seam** at
  34% of H, rotated 8°, at 0.86 W, so its left half is in this shot and its right half in the next.
- On the last shot, and in non-panorama plans, `bridge` renders as `hero-device`.
- **Collision rule (verified by rendering):** the incoming half covers the next shot's lower-left, roughly
  x < 0.45 W and y > 0.34 H, and draws over it. What survives depends on where the follower puts its content:

  | Follower | Result |
  |---|---|
  | `bridge` | ✓ caption top-left is clear. Incoming half on the left, own half on the right: the classic two-phone chain. |
  | `full-bleed` (`scrim: "top"`) | ✓ the phone slides onto the scene, the caption stays clear. A clean chain end. |
  | `feature-list`, `big-number` | ✓ text (bullets, number) sits above 0.34 H and survives. Their own device is half-covered and reads like a duo. |
  | `hero-device`, `floating-cards` | ~ the left third of their screen is hidden. OK only if nothing important is there, with cards on the right (`pos: "tr" | "mr" | "br"`). |
  | `text-hero` | ✗ the centred statement starts at about 0.36 H, so its first words are covered ("Start today" rendered as "today"). |
  | `comparison`, `review-quote` | ✗ the left column and the quote cards are covered. |
  | `zoom-callout`, `duo-devices`, `chat-bubbles`, `notification-stack` | ✗ overlays and devices on the left collide. |

  `plan.mjs validate` currently warns on any follower except `text-hero`, `feature-list`, `comparison`,
  `review-quote` and `big-number`. That list doesn't match the renders, so treat the table above and your own look at
  `review/contact-*.png` as the rule. A `bridge → bridge` or `bridge → full-bleed` warning can be accepted.
- Shrink the incursion with `"deviceScale": 0.7` and `"rotate": 6` if the follower must stay mostly clear.
- **Known engine bug:** the "last shot" test uses the plan index, not the rendered index. If the final shot is
  dropped with `skipOn` (for example `["android"]` on a social-proof closer), the bridge before it still bridges into
  nothing on that store. Give that bridge its own override: `"storeOverrides": { "android": { "layout": "hero-device" } }`.

## The first three must still stand alone

Search shows shots 1–3 as separate thumbnails, and Play may show any shot on its own. So:

1. **Shot 1 is never a bridge.** It is a complete `hero-device`, `floating-cards` or `full-bleed` with its whole
   phone.
2. **Shots 2 and 3:** a bridge here leaves half a phone at the right edge of the thumbnail. Use it only if the visible
   left half of the screen carries the benefit and the caption stands on its own. The safest structure is three
   standalone shots, then the bridge chain from shot 4 or later.
3. Every slot needs its own caption. A headline must never run across a seam: the text box is clipped to its slot's
   width by design, so keep it that way.
4. Check `review/contact-*.png` (each slot cut separately) **and** `review/search-*.png`. If a thumbnail shows a
   phone fragment with no context, move the bridge later.

## A proven 7-shot panorama (aurora / glass / brand mesh)

| # | Layout | Role |
|---|---|---|
| 1 | `hero-device` | hook, complete on its own |
| 2 | `zoom-callout` | core value, complete |
| 3 | `floating-cards` | proof, complete |
| 4 | `bridge` | first crossing |
| 5 | `bridge` | chain: two half-phones |
| 6 | `full-bleed` (`scrim: "top"`) | receives the last crossing |
| 7 | `text-hero` or `trio-fan` | closer, complete |

The background is a mesh or a 90° linear gradient through 3–4 brand hues, plus one `glow` per slot in
`plan.background.decor` if the theme is dark.
