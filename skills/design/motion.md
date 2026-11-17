# Motion — looping creative-asset videos

Appshot videos are not edited timelines; every element moves with a periodic function of the loop
(`window.__appshot.setTime(t, loop)` in `engine/compose.mjs`). Each spec runs `cycles` (an integer) times per loop,
so frame *N* equals frame 0: the loop never jumps. The still image is the same scene at the **poster** moment
(`plan.creative.<asset>.poster` or `plan.creative.poster`; the director takes it from the scene, default 0.42).

## Two kinds of asset

1. **Key art** (`creative-scene`) — like the best iOS 27 headers: an illustrated, animated world for the app
   (a beating heart for fitness, growing chart and coins for money, a pond for calm, a glowing book for reading…),
   one hero object in the middle, ambient life across the full width, no device and no text.
2. **Interface** (`creative-split`, `creative-stage`, `creative-carousel`) — real screens floating, cycling or
   sliding; with `options.backdrop` the same scene plays behind them without its hero.

The director uses (1) for the header and (2) for search results ("state the obvious", firsthand experience).

## Scenes (engine/scenes, `node scripts/scenes.mjs list|pick|board`)

| Scene | Hero and motion | Niches (director default) |
| --- | --- | --- |
| heartbeat | heart beating once a second, pulse rings, ECG line with a running highlight, sparks | fitness, home workout, health vitals, step counter |
| growth | glass chart: bars grow one by one, trend line draws, coins drift up | budget, banking, investing, invoices |
| pond | lotus breathing, two koi circling, ripples, lily pads drifting | meditation, therapy, mood journal, yoga, quitting |
| night-sky | crescent moon with halo, twinkling stars, shooting stars, low clouds (variant `constellation`) | sleep, prayer, astrology, fasting |
| orbit | glowing planet/orb with a tilted ring, moons orbiting in depth | AI assistants, homework, object identifier |
| bowl | bowl with steam curling, toppings dropping in, herbs drifting | recipes, food delivery, nutrition, grocery |
| book | open book glowing, rays turning, sparkles rising (variant `letters`: many scripts) | books, study, language, notes, bible, translator |
| bloom | flower opens petal by petal and closes before the loop ends, butterflies, fireflies | plants, habits, period, pregnancy, skincare, pets |
| flight | paper plane flying a figure-eight through dawn clouds, dashed route | travel |
| route | map: route draws between two pins, a dot follows, destination pulses | navigation/EV, running & cycling, family safety |
| sound | spinning record, sound rings, notes, equaliser (variant `voice`: mic with radial levels) | music, podcasts, AI voice |
| chat | bubbles pop in, typing dots, hearts rising, friends drifting (variant `dating`) | social, dating |
| tasks | checkmarks tick off, progress ring closes, confetti | to-do, calendar, focus, medication, scanner |
| lens | aperture blades turning, light leaks, photo cards floating | photo/video editors, camera, AI photo/avatar, collage, fashion |
| shield | shield with lock breathing, scan rings, orbiting particles, hex grid glints | VPN, passwords, cleaner |
| water | glass with a rolling water surface, bubbles, drops falling in | water tracker |
| sky | sun with turning rays behind a cloud, rain from a second cloud | weather |
| playground | glossy shapes bobbing and turning around a big star, confetti | casual games, kids |
| icon-glow | the app icon as a glowing tile with a light sweep, orbiting brand particles | fallback for any app |

Scenes take their colours from the theme (accent, second accent, light/dark) plus a few natural colours
(red heart, gold coins, green leaves), so the asset matches the screenshots.

## Motion primitives (`ctx.motion(inner, spec)`)

| type | What it does | Main keys |
| --- | --- | --- |
| `float` | slow drift with a hint of rotation (devices, background, clouds) | `x`, `y`, `rot` |
| `zoom` | breathing scale | `amp` |
| `pulse` | heartbeat (lub-dub) or `mode: 'breathe'`; `glow: true` also fades | `amp`, `cycles` |
| `spin` | full turns per loop | `cycles`, `dir`, `from` |
| `osc` | any one property between `lo` and `hi` (opacity, rotate, scaleX/Y, x, y) | `prop`, `lo`, `hi` |
| `orbit` | ellipse around a centre; `depth` scales, `zFront`/`zBack` pass in front/behind, `face` turns along | `rx`, `ry` |
| `path` | follows an SVG path (absolute px), `face` along the tangent; `win` = run only in part of the loop | `d`, `win`, `out` |
| `travel` | from A to B with wobble, fade in/out, scale and rotation; `win` for one-off events | `x0…y1`, `win`, `ease` |
| `ripple` | ring expanding and fading | `s0`, `s1`, `o` |
| `dash` | SVG stroke: `draw` (appears, holds, fades) or `flow` (a bright segment running) | `mode`, `in`, `len`, `out` |
| `grow` | scale (or scaleX/Y) up at `in`, hold, down at `out`, optional overshoot | `axis`, `from`, `over` |
| `slide` | moves exactly `distance` per cycle (seamless patterns: waves) | `distance`, `axis` |
| `pop` | stat cards appear one after another and fade before the loop restarts | `in`, `out`, `dy` |
| `screens` | the front device cross-fades through extra captures | `n`, `fade` |
| `carousel` | strip of screens slides one set width per loop | `distance` |

Only drift amplitudes (`float`, `zoom`, `pulse`, `pop`) scale with the motion amount; paths, orbits and timings stay
exact. `motion: none` freezes everything at the poster pose.

## Edited timelines (app previews and promo videos)

Previews are not loops: things arrive, hold and leave. They follow motion laws measured frame by frame on
hand-animated reference reels at 60 fps (`engine/preview.mjs`, page script):

- **Entrance** (`arrive`): keeps 0.81 of the remaining distance every frame. No overshoot, 90 % there in about 0.19 s.
- **Exit** (`leave`): grows ×1.45 a frame, accelerating out at full opacity.
- **Blur** is its own timeline: held, then released after the move lands (11 + 20 frames for objects, 8 + 12 for type).
- **Siblings never arrive together:** one rhythm per group, 4, 6, 8 or 12 frames.
- **Pop** (icons, badges, the CTA pill): a small overshoot.
- **Effects** serve a sentence, one or two per video: the odometer rolls a number in a caption, decode scrambles then
  locks a code or a prompt (Latin scripts), and a beam runs around the spotlit control and the CTA.

`engine/lib/motionqa.mjs` checks the result: no dead hold over 1 s, no bare frames in a cut, and a full, moving
frame 0.

## Amount — `plan.creative.motion`

`none` (static) · `calm` (0.6×, finance, health, sleep, security — the director's choice for trust-first niches) ·
`gentle` (default) · `lively` (1.7×, games, kids, social, music).

## Rules

1. **One idea, slow.** Apple: "avoid quick cuts and fast-moving visuals". 10–15 s loops (director: lively 10, gentle
   12, calm 14).
2. **Silent first.** Videos are muted; the scene, the phrase and the UI carry the message.
3. **Poster frame sells.** Check the poster on the review board — the scene at its fullest (chart grown, flower open,
   cards visible). Move it with `poster` (0–1) per asset.
4. **Hero in the middle.** iPhone shows only the centre of the header (≈1.51:1) and only the top ≈61 % of the
   search asset (≈2.46:1); everything key sits in the red safe area, the cut parts carry ambience only.
5. **Real UI only.** Motion never fakes interactions the app does not have (2.3.1). Cross-fading real captures is fine;
   scenes are illustration, never fake UI, numbers or prices.
6. **Text stays still.** The phrase does not animate — it must be readable at any frame.
7. **Loop length** 5–30 s (Apple). 30 fps by default; `--fps 60` doubles render time.

## Render cost

Each frame is a full-resolution Chrome capture piped to ffmpeg. Frames are repainted (no forced GPU layers — dozens of
4K-class composited layers run Chrome out of tile memory and leave black areas). A 12 s 3840×1646 header at 30 fps
takes one to two minutes on an Apple-silicon Mac (~10–20 MB H.264). `--draft` renders a quarter-size 15 fps preview.
