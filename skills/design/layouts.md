# Layout catalogue

There are 22 layouts in `engine/templates/`. ★ means `meta.hook: true`: the scorer rewards a hook layout in
position 1 and lints others there. Positions follow `skills/core/story.md`. Run `layouts.mjs info <id>` for the live
meta, and `layouts.mjs board --shot N` to see every layout dressed with your shot.

**Fields every layout accepts:** `id`, `layout`, `screen` / `screens`, `headline`, `subhead`, `eyebrow`,
`alternatives`, `theme` (id or patch), `background`, `decor`, `skipOn`, `storeOverrides`, and `options.frame`,
`deviceColor` and `shadow`. Layouts with the top caption band also take `options.align` (`center`|`left`) and
`options.textSize` (max headline size in u, default 10).

**Screens:** `"screen": "raw/x.png"`, `"screens": [...]`, per-canvas `{ "phone": "...", "tablet": "..." }`, and
`{locale}` paths (`"raw/{locale}/x.png"`, which falls back to `raw/x.png`).

---

### hero-device ★
Headline band on top, one large device rising from the bottom edge. This is the workhorse and the safest opener.
- **Needs:** 1 screen. **Options:** `deviceScale` (0.8 / tablet 0.74), `bleed: false` (fit the whole device), `rotate`, `textSize`.
- **Good:** shot 1 in almost every niche, and any shot where the screen itself is the proof.
- **Bad:** dense dashboards (use `zoom-callout`), benefits in the bottom third of the capture (use `device-top`).
- **Positions:** 1 (best), 4–6 as a calm reset.
```json
{ "id": "hook", "layout": "hero-device", "screen": "raw/today.png", "headline": "Home workouts that **adapt to you**" }
```

### floating-cards ★
Device centred, with 2–4 stat or insight cards floating over its edges.
- **Needs:** 1 screen and `cards[]` = `{ icon, value, title, trend?, pos?, w? (44 u), size?, y?, rotate? }`. `pos` is
  `tl|tr|ml|mr|bl|br` (default order `tr, ml, br, tl`). The device is a fixed 0.72 W (`deviceScale` is ignored).
- **Good:** progress, results, finance insights, AI outputs. It works as a hook when the number *is* the promise.
- **Bad:** invented values (every number must exist on the screen or in the brief), four cards, long titles.
- **Positions:** 1 or 3.
```json
{ "layout": "floating-cards", "screen": "raw/progress.png", "headline": "Watch your **strength** grow",
  "cards": [ { "icon": "🏆", "value": "+5 kg", "title": "New squat record", "pos": "tr" },
             { "icon": "🔥", "value": "12 days", "title": "Workout streak", "pos": "ml" } ] }
```

### full-bleed ★
The capture fills the canvas edge to edge under a black gradient scrim, with a white caption.
- **Needs:** 1 screen. **Options:** `scrim` (`top`|`bottom`), `scrimStrength` (0.88), `blur` (blur of the UI under
  the caption band in u, 1.6, `0` = off), `focus` (CSS object-position, default `center top`), `textSize` (10.5).
- **Good:** photo, video, camera, maps, games, immersive content where the pixels sell. It also ends a panorama
  bridge chain well.
- **Bad:** form- or list-heavy UI (it looks like a raw screenshot with text on top), and light UIs where the scrim
  greys the app. The theme text colour is ignored: the caption is always white.
- **Positions:** 1 for content apps, 4–6 otherwise.
```json
{ "layout": "full-bleed", "screen": "raw/editor.png", "headline": "Your photos, **cinematic**", "options": { "scrim": "top" } }
```

### text-hero ★
App icon, a giant statement (13 u, up to 4 lines) and optional chips. No device.
- **Needs:** nothing. Optional `chips[]` = `{ text, icon?, variant? }` (`soft|solid|glass|outline`). **Options:**
  `textSize` (13), `showIcon` (true).
- **Good:** the closer (identity, invitation, a recap of three benefits in chips).
- **Bad:** positions 2–3 (the scorer deducts, and search should show UI). As a sole or opening frame it risks Apple
  2.3.3 ("show the app in use"). Avoid it right after a `bridge`.
- **Positions:** last. Use it first only if the brand itself is the product.
```json
{ "layout": "text-hero", "headline": "Your **strongest** year starts today",
  "chips": [ { "text": "No equipment", "icon": "🏠" }, { "text": "AI coach", "icon": "✨" } ] }
```

### big-number ★
A huge stat in the accent colour (30 u, one line), the headline as a 2-line label below it, then the device.
- **Needs:** 1 screen and `stat: { value, source }` (the source is required by the checker). **Options:** `statSize`
  (30). The device is fixed at 0.76 W.
- **Good:** content volume ("400+"), speed ("3 s"), savings or results with a real source.
- **Bad:** any number you can't source, values longer than about 6 characters (the single line shrinks them), and
  vague numbers ("1000s").
- **Positions:** 1–3.
```json
{ "layout": "big-number", "screen": "raw/plans.png", "stat": { "value": "400+", "source": "catalog count in app/plans.tsx" },
  "headline": "workouts, **zero equipment**" }
```

### chat-bubbles ★
Device with an oversized conversation (up to 4 messages) floating over it.
- **Needs:** 1 screen and `messages[]` = `{ from: "user"|"ai", text }`. **Options:** `avatar` (image for AI bubbles,
  default the app icon). The device is fixed at 0.74 W.
- **Good:** AI assistants, tutors, coaches, support and messaging. It is the hook for AI chat apps.
- **Bad:** answers the product can't actually produce, messages over about 60 characters (they take extra height),
  and more than 3 messages.
- **Positions:** 1–3.
```json
{ "layout": "chat-bubbles", "screen": "raw/chat.png", "headline": "Answers in **seconds**",
  "messages": [ { "from": "user", "text": "Plan a 3-day trip to Rome" }, { "from": "ai", "text": "Day 1: Colosseum at 8am, before the crowds…" } ] }
```

### tilted-device ★
Caption on top and the device rotated (2D) or in 3D perspective, for movement.
- **Needs:** 1 screen. **Options:** `rotate` (default −9 on even and +8 on odd shot indexes), `perspective: true`
  (about 14° X, 20° Y), `deviceScale` (0.84 / tablet 0.72).
- **Good:** energetic niches (fitness, games, creative), and rhythm in the middle of the set.
- **Bad:** the hook in utilities, two tilts in a row, text-dense UI with `perspective`, and Google Play (rotation is
  discouraged there): use `"storeOverrides": { "android": { "layout": "hero-device" } }`.
- **Positions:** 2–5.
```json
{ "layout": "tilted-device", "screen": "raw/plans.png", "headline": "400+ workouts, **zero equipment**", "options": { "rotate": 7 } }
```

### zoom-callout
Device on one side, with a big magnified crop of one detail and an accent ring on the source.
- **Needs:** 1 screen and `zoom.rect` = `[x, y, w, h]` as fractions of the capture. **Zoom fields:** `side` (`right`,
  or `left` in RTL), `shape` (`rounded`|`circle`), `zoom` (1.6), `scale` (forced width / W), `dim` (0–1). The device
  is fixed at 0.7 W.
- **Good:** small key UI (form tips, chart values, AI suggestions, a single card). This is shot 2's classic job.
- **Bad:** tall regions (h > 0.2), regions with two ideas, and screens where the whole screen is the point.
- **Positions:** 2–3, plus any later shot with small proof.
```json
{ "layout": "zoom-callout", "screen": "raw/workout.png", "headline": "Perfect form, **every rep**",
  "zoom": { "rect": [0.045, 0.57, 0.91, 0.105], "side": "right" } }
```

### ui-pieces
The "exploded UI" look: a dimmed device, with 1–3 magnified crops floating in front of it.
- **Needs:** 1 screen and `pieces[]` = `{ rect: [x,y,w,h], x?, y?, w? (0.82 W), rotate? (±2), screen? }`.
  **Options:** `dim` (0.35). The device is fixed at 0.72 W.
- **Good:** widgets, cards, settings that matter, dense dashboards.
- **Bad:** more than 3 pieces, tall crops, and pieces that repeat the same thing.
- **Positions:** 2–5.
```json
{ "layout": "ui-pieces", "screen": "raw/home.png", "headline": "Your day **at a glance**",
  "pieces": [ { "rect": [0.05, 0.16, 0.9, 0.18] }, { "rect": [0.05, 0.55, 0.9, 0.12], "w": 0.7 } ] }
```

### device-top
The device hangs from the top edge, with the caption at the bottom (73%–95.5% of H).
- **Needs:** 1 screen. **Options:** `deviceScale`. The meta lists `reveal`, but the engine doesn't read it.
  The device's bottom always sits just above the caption.
- **Good:** bottom-anchored UI (tab bars, CTAs, players, bottom sheets, keyboards), and as a rhythm breaker after
  hero shots.
- **Bad:** shot 1 (search expects top captions), and themes whose gradient lightens downward (`sunset`, `ocean`,
  `calm`), where white text lands on the pale end.
- **Positions:** 3–6.
```json
{ "layout": "device-top", "screen": "raw/player.png", "headline": "Play it **offline**, anywhere" }
```

### duo-devices
Two overlapping devices: back left (`screens[0]`, 0.94× size), front right (`screens[1]`).
- **Needs:** 2 screens. **Options:** `spread` (0.17), `rotate` (5, mirrored per device), `deviceScale` (0.64 /
  tablet 0.55).
- **Good:** step → result, input → output, two linked screens, and phone captures on tablets.
- **Bad:** the hook (small phones), RTL (not mirrored), and Play with rotation (`storeOverrides.android.options.rotate: 0`).
- **Positions:** 2–5.
```json
{ "layout": "duo-devices", "screens": ["raw/scan.png", "raw/result.png"], "headline": "Snap it. **Done.**" }
```

### trio-fan
The centre device in front (`screens[0]`), with two angled devices behind (`screens[1]`, `screens[2]`).
- **Needs:** 3 screens. **Options:** `angle` (11), `deviceScale` (0.56 / tablet 0.46).
- **Good:** variety (templates, themes, plans), the closer, and tablets with phone captures.
- **Bad:** the hook, near-identical screens, and Play (angled sides: set `angle: 0` or swap the layout there).
- **Positions:** 4 to last.
```json
{ "layout": "trio-fan", "screens": ["raw/t1.png", "raw/t2.png", "raw/t3.png"], "headline": "A look for **every** mood" }
```

### screen-grid
2–4 frameless (`flat`) screens in a staggered two-column grid.
- **Needs:** 2+ screens. **Options:** `gap` (4 u). Rows 3–4 bleed off the bottom, so put the best two first.
- **Good:** breadth ("everything in one app"), template galleries, and closers. It is Play-friendly (no hardware).
- **Bad:** the hook, and screens with small text (each is under half the width).
- **Positions:** 4 to last.
```json
{ "layout": "screen-grid", "screens": ["raw/a.png", "raw/b.png", "raw/c.png"], "headline": "Everything, **one app**" }
```

### before-after
One device whose screen is split by a slider: `screens[0]` (before) on the left, `screens[1]` (after) on the right.
- **Needs:** 2 screens and `labels` **keyed by locale**: `{ "en-US": { "before": "Before", "after": "After" } }`.
  A plain `{ before, after }` renders no chips (engine quirk). **Options:** `split` (0.5).
- **Good:** photo and video editing, AI enhancement, cleaners, scan → clean document, translation.
- **Bad:** subtle changes, two captures with different crops or zoom, and RTL (the slider is not mirrored).
- **Positions:** 2 for editors (the transformation *is* the product). It is not ★, so as shot 1 it costs story
  points: open with a `full-bleed` of the "after" image instead. 3–5 for other apps.
```json
{ "layout": "before-after", "screens": ["raw/raw-photo.png", "raw/enhanced.png"], "headline": "Blurry to **sharp** in one tap",
  "labels": { "en-US": { "before": "Before", "after": "After" }, "tr": { "before": "Önce", "after": "Sonra" } } }
```

### split-diagonal
A diagonal panel (the accent, darkened on dark themes) behind a −6° tilted device.
- **Needs:** 1 screen. **Options:** `panel` (CSS colour), `cut` (0.55), `rotate` (−6). The device is fixed at 0.78 W
  (`deviceScale` is ignored).
- **Good:** bold brands, sports and finance mid-set, and a colour chapter change.
- **Bad:** light pastel accents on light themes (a weak panel), Play (rotation: `storeOverrides.android.options.rotate: 0`),
  and placing it next to another tilted shot.
- **Positions:** 3–6.
```json
{ "layout": "split-diagonal", "screen": "raw/stats.png", "headline": "Every match, **every stat**", "options": { "cut": 0.5 } }
```

### notification-stack
Device with 1–3 iOS-style notification banners over its upper half.
- **Needs:** 1 screen and `notifications[]` = `{ title, body, time?, app?, icon? }` (`app` defaults to the app name
  and `icon` to the app icon).
- **Good:** reminders, habit nudges, health prompts, finance alerts, delivery tracking, prayer and medication times.
- **Bad:** notifications the app doesn't send, bodies over one line, and 3 banners when 2 tell the story. On Play the
  banner style reads as iOS, so keep the text generic or swap the layout there.
- **Positions:** 4–6 (habit and retention).
```json
{ "layout": "notification-stack", "screen": "raw/today.png", "headline": "Keep your **streak** alive",
  "notifications": [ { "title": "Time to move 💪", "body": "Your 25-min plan is ready", "time": "8:00" } ] }
```

### feature-list
A left-aligned headline (9 u), up to 4 checklist bullets, and a device below (fixed at 0.74 W; `deviceScale` is
ignored despite the meta).
- **Needs:** 1 screen and `bullets[]` (a localised array: `{ "en-US": [...], "tr": [...] }`).
- **Good:** later shots, bundling minor features, Pro perks, integrations (use per-store wording via
  `storeOverrides`, e.g. Apple Health vs Health Connect).
- **Bad:** before shot 4, more than 4 bullets (extras are dropped), and bullets over about 5 words.
- **Positions:** 5 to last.
```json
{ "layout": "feature-list", "screen": "raw/progress.png", "headline": "Built for **your level**",
  "bullets": { "en-US": ["Beginner to advanced", "Sessions from 8 to 45 minutes", "Syncs with Apple Health"] } }
```

### comparison
Two columns: the old way (crosses, muted) vs your app (checks, accent-filled). A device below at 66% of H if a screen
is given.
- **Needs:** `compare: { left: { title, items[] }, right: { title, items[] } }` (5 items max; the right title defaults
  to the app name).
- **Good:** objection handling and switching from spreadsheets, paper or "doing it manually".
- **Bad:** naming competitors (trademarks: Apple 2.3.7, and Play bans app or brand comparisons), positions 1–3, and
  `**` inside the right column (invisible on the accent).
- **Positions:** 4–6.
```json
{ "layout": "comparison", "headline": "Ditch the **spreadsheet**",
  "compare": { "left": { "title": "Spreadsheet", "items": ["Manual entry", "No reminders"] },
               "right": { "items": ["Auto-import", "Bill alerts"] } } }
```

### social-proof
A laurel with a real rating, an optional award row, and a device peeking from the lower half.
- **Needs:** `rating: { value, label, source }` and/or `awards[]` = `{ title, sub, source }`. Real and sourced only.
  iOS only: add `"skipOn": ["android"]`. The device is fixed at 0.7 W.
- **Good:** shots 2–4 when the app has a strong, verifiable rating or press.
- **Bad:** Apple-designated badges (Editor's Choice, App of the Day), stale ratings, and anything on Play.
- **Positions:** 2–4 (iOS).
```json
{ "layout": "social-proof", "screen": "raw/home.png", "headline": "Loved by **runners**", "skipOn": ["android"],
  "rating": { "value": "4.8", "label": "12K ratings", "source": "App Store Connect, 2026-11-01" } }
```

### review-quote
A headline plus 1–3 genuine review cards, with an optional device at the bottom.
- **Needs:** `quotes[]` = `{ text, author, rating, source }`. Real reviews only, with permission where required. iOS
  only (`"skipOn": ["android"]`). **Options:** `showDevice` (true).
- **Good:** trust-sensitive niches (finance, health, kids), late in the set.
- **Bad:** fabricated or edited quotes, more than 2 long quotes, and positions 1–3.
- **Positions:** 5 to last (iOS).
```json
{ "layout": "review-quote", "screen": "raw/home.png", "headline": "Real people, **real results**", "skipOn": ["android"],
  "quotes": [ { "text": "Finally a plan I stick to.", "author": "maria_k", "rating": 5, "source": "App Store review, 2026-09-12" } ] }
```

### bridge
Panorama only. The caption sits top-left and the device straddles the seam into the next shot. In other plans, and
on the last shot, it renders as `hero-device`.
- **Needs:** 1 screen and `"panorama": true`. **Options:** `rotate` (8), `deviceScale` (0.86).
- **Good:** chains (`bridge → bridge`) and the step before a `full-bleed` with `scrim: "top"`.
- **Bad:** shot 1, and placing it before a centred layout (the incoming half-phone covers its lower-left). Rules in
  `panorama.md`.
- **Positions:** 4 and later.
```json
{ "layout": "bridge", "screen": "raw/workout.png", "headline": "Perfect form,\n**every rep**" }
```

### banner
A landscape promo graphic: icon and app name, a tagline on the left (scaled to height), and 1–3 tilted devices on the
right. It is not a screenshot layout.
- **Built by** `graphic.mjs --type play-feature|appstore-header|appstore-search|appstore-universal`. It uses shot 1's
  headline (or `--tagline`) and the first 3 screens. **Options:** `devices` (1–3), `showName`, `showIcon`.
  Eyebrow and subhead are suppressed.
- **Good:** the Play feature graphic (required) and App Store creative assets.
- **Bad:** long taglines (3 lines max at about 13% of the height), "free", rankings or CTAs (Play), and pure
  white or black backgrounds on Play.

## Creative-asset layouts (App Store header 21:9, search results 3:2, universal 16:9)

Used only by `scripts/creative.mjs`; they size everything from the canvas height and the size's safe area, and
move during videos (`skills/design/motion.md`). The director (`engine/lib/director.mjs`) picks them per placement;
`plan.creative.<asset>.layout` overrides. Every one except `creative-scene` takes `options.backdrop: <scene>` — the
niche's animated world (without its hero object) behind the devices.

### creative-scene
Animated key art (on the wide search band the phrase sits beside the hero): a scene from `engine/scenes/` (heartbeat, growth, pond, night-sky, orbit, bowl, book, bloom,
flight, route, sound, chat, tasks, lens, shield, water, sky, playground, icon-glow) fills the canvas — ambient life
over the full width, one hero object centred where iPhone crops the header. No device, no text by default (the name
and subtitle sit right under the header). Default for the header. Options: `scene`, `variant`, `phrase`
(header false, search true), `phraseAt`, `intensity`. Browse: `node scripts/scenes.mjs board`.

### creative-split
Short phrase on one side, 1–3 floating devices on the other; the front screen cycles through extra captures and
`cards` pop in. Default for search results. On the header the devices run off the bottom edge (`options.bleed`).
Options: `devices` (1–3), `textSide` (`left|right`), `textShare` (0.4), `backdrop`.

### creative-stage
Three (3:2, 16:9) or five (21:9) devices fanned around a centre hero on a glowing stage; optional phrase above.
Key art for the header: one clear idea, no clutter. Option: `devices` (3 or 5).

### creative-carousel
A strip of real screens sliding sideways one set per loop (seamless), with the phrase beside it on a wide safe band
(search results: iPhone shows only the top ≈61 %, so the screens must stay whole there) or above it on taller canvases.
In side mode the strip runs off the far edge and fades in behind the phrase. Best for search results — "showcase the
firsthand experience". Needs 2+ screens. Options: `phraseAt` (`side|top`), `textShare` (0.34), `gap`.


### preview-frame (internal)
One scene of the App Store app preview video, used only by `scripts/preview.mjs`: full-bleed footage on a camera
layer with a kinetic caption over a progressive-blur scrim (`store`, the default), the legacy rounded-screen look
(`framed`, promo only), or the end frame. Hidden from `layouts.mjs`, the editor and the plan validator. See
`skills/aso/app-previews.md`.