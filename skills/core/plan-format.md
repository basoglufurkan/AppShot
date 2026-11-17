# plan.json reference

Lives at `appshot/plan.json`. Paths are relative to `appshot/`. Any caption-like value can be a string (all locales)
or an object keyed by locale (`{"en-US": "…", "tr": "…"}`); lookup falls back to the same language, then
`defaultLocale`, then the first key.

## Top level

| Field | Type | Notes |
| --- | --- | --- |
| `app.name` | string/loc | used by text-hero, notifications, search preview |
| `app.icon` | path | `raw/icon.png` (the scanner copies it) |
| `app.subtitle` | loc | only for the search preview board |
| `niche` | id | from `skills/niches/` |
| `theme` | id or object | `engine/themes/<id>.json`; `"brand"` derives everything from `brand` |
| `themeOverrides` | object | deep-merged into the theme, e.g. `{ "accent": "#C6F432", "highlight": "pill", "device": { "color": "natural" } }` |
| `brand` | `{primary, secondary, bg?}` | used by `theme: "brand"` |
| `panorama` | bool | one continuous background; elements may cross slot edges (`bridge`) |
| `background` | `{ bg?, decor? }` | panorama-only strip background/decor override |
| `sizes` | ids | `engine/sizes.json` — default `iphone-6.9`, `iphone-6.3` (+ `ipad-13`, `android-phone`) |
| `locales` | ids | `engine/locales.json` codes |
| `defaultLocale` | id | caption fallback |
| `keywords` | `{locale: [..]}` | scorer and coverage check that shots 1–3 contain them |
| `storeOverrides` | `{ ios?, android? }` | `{ "theme": {...} }` merged for that store's sizes |
| `fonts.google` | [family spec] | extra Google Fonts, e.g. `"Rubik:wght@600;800"` |
| `fonts.local` | [{family, src, weight}] | files in `appshot/fonts/` |
| `css` | string | extra CSS appended to every page (last resort) |
| `offline` | bool | skip Google Fonts |

## Shot

| Field | Notes |
| --- | --- |
| `id` | short slug; output file `NN-<id>.png` |
| `layout` | one of `engine/templates/*` (`node scripts/layouts.mjs list`) |
| `screen` | path, `{phone, tablet}` object, or a `{locale}` pattern: `raw/{locale}/today.png` → `raw/tr/today.png`, falls back to `raw/today.png` |
| `screens` | array for multi-device layouts (duo-devices, trio-fan, before-after, screen-grid) |
| `headline` | loc · `**word**` highlight, `_word_` emphasis, `\n` forced break |
| `subhead` | loc · optional, ≤ 12 words |
| `eyebrow` | loc · small chip above the headline ("NEW", "AI") — use sparingly |
| `alternatives` | `{locale: [headline, …]}` → `variants.mjs make --hooks` |
| `theme` | id (replaces the plan theme for this shot) or object (patches it) |
| `background` | background spec for this slot (`{type: solid|linear|radial|mesh|split|image, …}`) |
| `decor` | extra decor for this slot: `[{type: glow|grain|grid|dots|rings|blobs|sparkles|confetti|waves|beams|shapes, …}]` |
| `options` | `deviceScale`, `rotate`, `perspective`, `textSize` (max headline in u), `align` (`center|left`), `frame`, `deviceColor`, `shadow`, `bleed`, layout-specific options |
| `skipOn` | `["android"]`, `["ios"]` or size ids — leave this shot out there |
| `storeOverrides` | `{ android: { …shot fields } }` merged for that store |
| `note` | free text for humans (ignored by the renderer) |

## Layout fields

| Layout | Fields |
| --- | --- |
| floating-cards | `cards: [{ icon, value, title, trend?, pos: tl|tr|ml|mr|bl|br, w?, rotate? }]` |
| feature-list | `bullets: {locale: [..]}` (≤ 4) |
| zoom-callout | `zoom: { rect: [x,y,w,h] (fractions of the screenshot), side, shape: rounded|circle, zoom: 1.6, dim }` |
| ui-pieces | `pieces: [{ rect, x?, y?, w?, rotate?, screen? }]` |
| notification-stack | `notifications: [{ title, body, time, app?, icon? }]` |
| chat-bubbles | `messages: [{ from: user|ai, text }]` |
| big-number | `stat: { value, source }` + headline as the label |
| social-proof | `rating: { value, label, source }`, `awards: [{ title, sub, source }]` — real only, `skipOn: ["android"]` |
| review-quote | `quotes: [{ text, author, rating, source }]` — real only, `skipOn: ["android"]` |
| comparison | `compare: { left: { title, items }, right: { title, items } }` — never name competitors |
| before-after | `screens: [before, after]`, `labels: { before, after }`, `options.split` |
| text-hero | `chips: [{ text, icon? }]`, `options.showIcon` |
| full-bleed | `options.scrim: top|bottom`, `options.focus` (object-position) |
| bridge | panorama only; device straddles into the next shot |
| banner | Play feature graphic only (`graphic.mjs`) |
| creative-scene / creative-split / creative-stage / creative-carousel | App Store header & search results (`creative.mjs`) — see below |
| preview-frame | internal: one segment of the app preview video (`preview.mjs`) — never use it in `shots` |

## creative (App Store header and search results)

The whole block is optional. Without it the **director** (`engine/lib/director.mjs`) decides everything from the
app — scene, layouts, motion, phrase, loop — and writes its reasons to `review/creative-direction.json`
(`creative.mjs --explain` prints them). Whatever you set here wins over the director, key by key.

```json
"creative": {
  "screens": ["raw/today.png", "raw/workout.png", "raw/progress.png", "raw/plans.png"],
  "headline": { "en-US": "Your **pocket** trainer", "tr": "Cebindeki **antrenör**" },
  "cards": [{ "icon": "🔥", "value": "12 days", "title": "Workout streak" }],
  "scene": "heartbeat",          // force the scene (engine/scenes); otherwise picked from the niche
  "motion": "gentle",            // none | calm | gentle | lively
  "video": true, "fps": 30, "duration": 12, "codec": "h264",
  "header":    { "layout": "creative-scene", "options": { "scene": "heartbeat", "phrase": false }, "poster": 0.42 },
  "search":    { "layout": "creative-split", "options": { "backdrop": "heartbeat" }, "headline": { "en-US": "400+ home workouts" } },
  "universal": { "layout": "creative-stage", "options": { "backdrop": "heartbeat" } },
  "auto": true                   // false = no director, only these settings and the old defaults
}
```

Per-asset keys override the shared ones (`headline`, `screens`, `cards`, `poster`). `poster` is the moment of the
loop (0–1) used for the still image. `screens[0]` is the hero capture; the front device cycles through the extras.
Scene options: `scene`, `variant` (book `letters`, sound `voice`, chat `dating`, night-sky `constellation`),
`phrase`, `phraseAt`, `intensity`; on other creative layouts `backdrop` (+ `backdropIntensity`).

## preview (App Store app preview video)

Optional. Present → `run.mjs final` also renders the previews. Without `segments` the story is the first 3–5 shots
that show an app screen, in order, with their captions; a recording in `raw/<locale>/clips/<screen>.mp4` replaces the
still capture. Details and Apple's rules: `skills/aso/app-previews.md`.

```json
"preview": {
  "sizes": ["preview-iphone"],   // preview-iphone (886×1920) · preview-iphone-home · preview-iphone-4.7 · preview-ipad · preview-mac
  "style": "store",              // store (footage full-bleed, App Store-safe) | framed (promo videos only: Apple rejects framing)
  "orientation": "portrait",     // landscape for landscape apps and games
  "count": 5, "hook": 3.2, "segment": 2.8, "crossfade": 0.33, "end": "brand", "endDuration": 2.2, "poster": 5,
  "camera": "auto",              // auto (eases in on localised action, slow push on calm footage) | none
  "maxZoom": 1.3,                // ≤ 1.4 keeps native pixels (1320 px recordings on an 886 px canvas)
  "captionAt": "auto",           // auto (away from the action) | top | bottom
  "blur": true,                  // motion blur on camera and type moves (final renders)
  "touches": true,               // touch hotspots from <clip>.taps.json (preview.mjs taps / tap)
  "spotlight": "off",            // "auto" = spotlight in every scene; per scene: a rect or "auto"
  "shots": { "focus": { "spotlight": "auto", "taps": [{ "t": 1.2, "x": 0.5, "y": 0.92 }] } },   // per-shot overrides
  "tagline": { "en-US": "AI home workout plans" },               // end card line (default: app.subtitle in that locale, else the hook caption — never another language)
  "disclaimer": { "en-US": "Some features require a subscription." },   // false = none; default from the scan
  "music": "assets/loop.m4a",    // optional; cuts snap to its beat; otherwise a silent stereo track
  "musicStart": 0,               // seconds into the track
  "sfx": true,                   // sound effects from a pack the user owns: a folder path, true = the folder in $APPSHOT_SFX, or false
  "sfxLevel": 0,                 // dB offset for every sound effect (-12 to 6)
  "effects": true,               // numbers in captions roll in (odometer)
  "effect": null,                // "decode" (Latin captions scramble, then lock) | "none"; also per shots.<id> / segments[]
  "beam": true,                  // light running around the spotlight and the call-to-action pill
  "variant": null,               // "b" action first | "c" payoff first (usually set with --variant)
  "promoSizes": ["promo-vertical", "promo-landscape"],   // preview.mjs --promo (also promo-square)
  "backdrop": "auto",            // promo: the key-art scene behind the device (auto = creative director's pick, none)
  "cta": { "en-US": "Start your first journey" },        // promo end card button text
  "segments": [
    { "shot": "today" },
    { "shot": "workout", "clip": "raw/{locale}/clips/session.mp4", "start": 2.5, "end": 8, "focus": [0.1, 0.4, 0.8, 0.25] },
    { "screen": "raw/{locale}/stats.png", "caption": { "en-US": "Your week at a glance" } }
  ]
}
```

Finding a zoom rect: open the raw PNG, measure the region in pixels, divide by the image width/height.
