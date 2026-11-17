# App previews — the video before the screenshots

An app preview is a 15–30 s video that sits **first** in the screenshot row on iPhone, iPad, Mac and Apple TV and
**autoplays muted** on the product page and in search results. In portrait search results the first preview takes
the first of the three slots, so the screenshot hook moves to the second. Previews are optional, but if you have one,
its first frames are the first thing a searcher sees.

Script: `scripts/preview.mjs` · engine: `engine/preview.mjs` · segment template: `engine/templates/preview-frame.mjs`.

## Apple specs (App Store Connect Help, checked 2026-11-06)

| | |
| --- | --- |
| Length | 15–30 s |
| Frame rate | up to 30 fps |
| Video | H.264 progressive, up to High Profile Level 4.0, target 10–12 Mbps — or ProRes 422 (HQ only) |
| Audio | stereo, 256 kbps AAC, 44.1 or 48 kHz (all tracks enabled) |
| Files | .mov, .m4v, .mp4 (H.264); .mov (ProRes) · up to 500 MB |
| Count | up to 3 per device size and language |
| Poster frame | chosen in App Store Connect; default 5 s |
| Processing | up to 24 hours after upload |

Accepted resolutions — **use these, not the device resolution**:

| Size id | Portrait | Landscape | Covers |
| --- | --- | --- | --- |
| `preview-iphone` | 886 × 1920 | 1920 × 886 | every Face ID / Dynamic Island iPhone (6.9", 6.7", 6.5", 6.3", 6.1"); upload once at the largest size, it scales down |
| `preview-iphone-home` | 1080 × 1920 | 1920 × 1080 | Home-button iPhones (5.5", 4") |
| `preview-iphone-4.7` | 750 × 1334 | 1334 × 750 | 4.7" |
| `preview-ipad` | 1200 × 1600 | 1600 × 1200 | iPad 13", 12.9", 11", 10.5" (900 × 1200 also accepted) |
| `preview-mac` | — | 1920 × 1080 | Mac |

If the preview's aspect ratio differs from the screenshots, Apple shows it in "A Closer Look" instead of first in
the row — keep previews portrait when the screenshots are portrait.

## Apple's content rules

- **Footage from the app only** (guideline 2.3.4): "previews may only use video screen captures of the app itself".
  Narration and text overlays are allowed. No hands, no people holding devices.
- **No frames.** Apple has rejected previews with device frames and, after the frame was removed, again for
  "framing around the video screen capture of the app": the preview must look like the app playing full screen
  (developer forums threads 797679, 799983). One preview ending on the company name and logo was rejected as a
  self-promotional ad; enforcement is inconsistent, but keep the end frame about the app (icon, name, disclosure).
- **Zoom with care.** Apple recommends "capturing the native UI resolution rather than zooming in on the view".
  Recordings are 1320 px wide and the canvas 886 px, so up to ≈1.4× still shows native pixels — Appshot caps at 1.3×.
- **Dissolves and fades**; transitions must not imply features the app does not have. Touch hotspots are allowed.
- **Copy**: legible, short, on screen long enough to read; no prices, no dates or seasonal references.
- **Disclose** in-app purchases, subscriptions or a required login — in the footage or the end frame.
- 4+ content, rights to everything shown, fictional account data.
- **Poster frame**: shown when autoplay is off. Changing it on an approved preview needs a new preview submission.

## What the evidence says (research, 2026-11)

- Few top apps have a preview at all (12.2 % of the top US apps, Admiral, Sep 2026). A weak preview can lose to
  screenshots (Apple's own Simply Piano example), so test it with Product Page Optimization.
- The first frame and the first 2–3 s are the strongest lever: viewers watch about 5–7 s; poster-frame and
  cover-caption tests moved installs +66 % (Marvel) and about +75 % (Prequel).
- Experts: 3–6 scenes, one benefit each, cuts every ~1.5–3 s, value in the first frame, no logo intro.
- What top previews do (Structured, Todoist, Things 3, frame by frame): full-screen UI with no device frame, eased
  motion everywhere, one idea per beat, kinetic type, the UI itself carrying the story; Things 3 is one continuous,
  perfectly choreographed take.

## How Appshot builds it (store mode, the default)

1. **Story = the screenshot plan.** The first 3–5 shots that show an app screen (text-only layouts and repeated
   screens skipped), in order, hook first, with **the same captions** as the screenshots. Captions over 7 words fall
   back to the shortest alternative with 6 words or fewer.
2. **Footage.** A recording `raw/<locale>/clips/<screen>.mp4` (or `raw/clips/`) when there is one, else the capture.
   `engine/lib/footage.mjs` decodes it into tiny grey frames and measures, 10× a second, how much changed, where (the
   densest cluster of change, so twinkling backgrounds do not count), how full the screen is and how bright the
   caption bands are. Each scene plays the **liveliest window** of its recording, starting on a **full frame** (never
   a loading state or a fade-in).
3. **Full-bleed, no frame.** The footage fills the canvas exactly as the device plays it.
4. **Camera.** On localised action (a timer ring, a toggle, a list growing) the camera eases in up to 1.3× with a
   critically damped spring (≈0.9 s, no overshoot), looking 0.6 s ahead and holding at least 0.8 s, leaning only
   slightly sideways because phone UIs are centred. Calm footage gets a slow 4.5 % push; stills a 6 % push. Every new
   scene settles in from 4.5 % closer.
5. **Captions.** Kinetic type: every word rises out of its own mask on the measured entrance law (below), 4 frames
   (67 ms) apart, with its blur held a moment and released after it lands; highlights move onto the words so every
   theme style survives, and the words leave upwards, accelerating, before the cut. A number in the caption rolls
   into place digit by digit (odometer); `effect: "decode"` scrambles a Latin-script caption and locks it letter by
   letter instead. Behind them an iOS-style progressive blur scrim softens the app's own header. The caption goes to the side
   away from the action (bottom when the camera works high on the screen) and is dark or light against the footage.
   The hook's caption is on screen from the very first frame.
6. **Timing.** Hook ≈3.2 s, scenes ≈2.8 s, each stretched until its caption can be read (0.5 s + characters ÷ 17),
   10-frame dissolves, a 2.2 s end frame, total 15.4–29.6 s. Apple's default poster frame (5 s) is moved onto a
   finished caption; the board also marks the strongest pick (inside the hook).
7. **End frame.** The last scene blurs behind the app icon, name and subtitle, plus the localised purchase disclosure
   ("Some features require a subscription." in 23 languages) when the scan finds subscriptions or purchases.
   `end: "disclosure"` keeps only the disclosure (strictest reading of the rules), `"none"` removes the end frame.
8. **Touches and spotlight.** Taps saved next to a clip (`<clip>.taps.json`) become touch hotspots — the graphic
   Apple allows: a white dot with a thin dark rim appears 0.18 s before the press, presses to 85 %, and releases into
   a ring that grows to 1.8× and fades in 0.35 s; swipes glide along their path. Each tap is snapped to the screen's
   reaction (the first jump in change near the point, minus 0.15 s), so rough times are enough. Taps also steer the
   director: the window keeps a tap with ≥ 0.8 s before it and time to see the result, and the camera leans in on the
   tapped spot. A spotlight (a hand-set rect, or `"auto"`: the band around the tapped control, else the densest
   change) dims the rest of the screen by 50 % with a feathered edge for at most 1.6 s, ending as the finger lands.
9. **Motion laws.** Measured frame by frame on hand-animated reference reels (60 fps), not tuned by eye:
   - an entrance keeps 0.81 of its remaining distance every frame — no overshoot, 90 % there in about 0.19 s,
     whatever the duration (`arrive`);
   - an exit grows ×1.45 a frame, accelerating out at full opacity (`leave`, 12 frames for a word);
   - blur is its own timeline: held, then released after the move has landed (11 + 20 frames for objects, 8 + 12
     for type, which must read the moment it lands) — this is what makes an entrance feel heavy;
   - siblings never arrive together (one rhythm per group: 4, 6, 8 or 12 frames);
   - icons, badges and the call-to-action pill pop with a small overshoot; the promo device rises in on the
     entrance law.
10. **Motion blur.** Frames where the camera or the type moves are rendered as 6 samples across a 180° shutter and
   averaged (ffmpeg `tmix`); the footage frame stays fixed so the UI never ghosts. Static frames cost nothing extra.
11. **Encoding.** H.264 High at Level 4.0, constant 10 Mbps, 30 fps, bt709, plus a silent stereo 256 kbps AAC track
   at 48 kHz (or `--music`, faded and loudness-normalised, and `--sfx`, below). `check.mjs` verifies resolution,
   length, fps, level, bitrate, audio and size.
12. **Motion QA.** After every render `engine/lib/motionqa.mjs` decodes the finished file at full frame rate and
   warns about: a **dead hold** (more than 1 s where nothing on screen moves — a held picture should keep living),
   **bare frames** in a cut (the picture goes flat for more than one frame, which reads as a dropped frame) and a
   **static opening** (frame 0 nearly empty, or nothing moving in the first second). The end card may settle and
   hold. The warnings go to the board, the report and `check.mjs`.

### The first second, and what never to do

Frame 0 is the autoplay start and the thumbnail, and the preview plays muted: the first second must already say the
idea with the sound off. So frame 0 is a **full** screen (never a loading state, an empty background or a title
waiting) and something **moves** in it. When the hook's recording idles for its first second, Appshot starts it just
before the first change. Things that read as cheap or "AI-made" in a preview, and are never added:

- pills and badges with a dot, coloured status labels, step-number cards, a headline that repeats the caption;
- rows of coloured bars standing in for a real chart (show the real screen);
- frosted blur as content, dashed connector lines, four cards at once;
- fake screens when the real one exists — record it.

`style: "framed"` (caption above a rounded screen on the theme background) is kept for promo videos only — Apple
has rejected exactly that framing in App Store previews.

## Recording real footage

```bash
node scripts/preview.mjs record --name focus --seconds 8 --url myapp://focus     # iOS Simulator (booted)
node scripts/preview.mjs record --name focus --locale tr --seconds 8               # → raw/tr/clips/focus.mp4
node scripts/preview.mjs record --android --name focus --seconds 8                 # emulator or device
```

- `--name` is the capture it films: `--name focus` is used wherever a shot shows `raw/…/focus.png`.
- The status bar is set to 9:41 with full bars, like the screenshots. Without `--seconds` it records until Enter.
- While it records, use the app: you, the user, a Maestro flow, or the iOS Simulator tool. One clear action per clip
  (scroll a list, start a timer, tick a task), slow and deliberate, 4–8 s.
- Recordings are converted to constant 30 fps; the last frame is held when the screen stops changing.
- Trim a long recording per segment with `plan.preview.segments[].start` / `end` (seconds).
- **Start the hook on a full screen.** The first frame is the autoplay start and the thumbnail: skip loading states
  and fade-ins (cut with `--start`).

### Touches

A tap shows as a hotspot only where it really happened in the recording. Three ways to give Appshot the taps:

```bash
# 1. Mark them by hand (or as the agent, after looking at the clip's frames): seconds,x,y — fractions of the screen
node scripts/preview.mjs taps --name focus --add "1.2,0.5,0.92"
node scripts/preview.mjs taps --name feed --swipe "2.0,0.5,0.75,0.5,0.3,0.4"      # t,x,y,x2,y2,duration
node scripts/preview.mjs taps --name focus                                        # list them, snapped

# 2. Log them live while `record` runs (one call right before each tap you make in the Simulator)
node scripts/preview.mjs record --name focus --seconds 10 &
node scripts/preview.mjs tap --name focus --at 0.5,0.92

# 3. Inline in the plan: "preview": { "shots": { "focus": { "taps": [{ "t": 1.2, "x": 0.5, "y": 0.92 }] } } }
```

The file is `raw/[<locale>/]clips/<name>.taps.json` (`{ "taps": [{ "t", "x", "y", "kind": "tap" | "swipe", "x2", "y2",
"dur" }] }`, clip seconds). `preview.mjs taps` prints each tap's snapped time; "no reaction found nearby" means the
time or the position is off. UI-test pipelines can write the same file from their tap log (element frame centre ÷
screen size; 440 × 956 pt on a 6.9" iPhone).

### Reusing recordings the project already has

Many projects already film their UI (UI-test capture scripts, QuickTime takes, marketing clips). Look for them
(`Marketing/`, `fastlane/`, `*.mov` / `*.mp4` next to the UI tests) before recording, compare a frame with the current
capture (same UI, same data), and cut the matching moment into the workspace — the original stays untouched:

```bash
node scripts/preview.mjs clip --from ../Marketing/Captures/en/26-universe.mp4 --name universe --start 1.2
node scripts/preview.mjs clip --from ~/Movies/take3.mov --name focus --start 4 --end 9 --locale tr
```

`clip` writes `raw/[<locale>/]clips/<name>.mp4` (constant 30 fps H.264) and records the source and window in
`clips/sources.json`. Unlocalised clips (`raw/clips/`) are used for every locale whose capture is unlocalised; a locale
with its own captures (`raw/pt-BR/…`) needs its own clips, so the footage language always matches the screenshots.
A phone recording never replaces an iPad capture.

## Workflow

1. Shots and captions done (the preview reuses them).
2. `node scripts/preview.mjs --explain` → the storyboard and the warnings.
3. Record the hook first, then the rest: `preview.mjs record --name <screen>`.
4. `node scripts/preview.mjs --draft` → **Read `appshot/review/preview-<locale>-draft.png`**: the first frame sells?
   Every caption readable over its scrim? Footage real (green bars, not orange)? Zooms land on the action? End frame
   disclosure right? For motion, tile the draft video's frames (`ffmpeg -i drafts/preview/<locale>/iphone.mp4 -vf
   "fps=2.5,scale=150:-2,tile=13x3" -frames:v 1 sheet.jpg`) and look at the sequence.
5. `node scripts/preview.mjs` (final, every locale) → `check.mjs` → `export.mjs`.
6. Upload by hand: App Store Connect → version → Previews and Screenshots → the largest iPhone display. Set the
   poster frame there. fastlane does not upload app previews.

## plan.preview

```json
"preview": {
  "sizes": ["preview-iphone", "preview-ipad"],
  "style": "store",
  "count": 5,
  "hook": 3.2, "segment": 2.8, "crossfade": 0.33, "end": "brand", "endDuration": 2.2,
  "camera": "auto", "maxZoom": 1.3, "captionAt": "auto", "blur": true, "touches": true, "spotlight": "off",
  "shots": { "focus": { "spotlight": "auto", "start": 0.5, "taps": [{ "t": 1.2, "x": 0.5, "y": 0.92 }] } },
  "musicStart": 0, "promoSizes": ["promo-vertical", "promo-landscape"], "backdrop": "auto", "cta": { "en-US": "Start your first journey" },
  "poster": 5,
  "tagline": { "en-US": "Focus that grows a garden" },
  "sfx": true, "sfxLevel": 0, "effects": true, "beam": true, "effect": null, "variant": null,
  "disclaimer": { "en-US": "Some features require a subscription." },
  "music": "assets/loop.m4a",
  "segments": [
    { "shot": "home" },
    { "shot": "focus", "clip": "raw/{locale}/clips/tour.mp4", "start": 3.2, "end": 9, "focus": [0.1, 0.45, 0.8, 0.2] },
    { "screen": "raw/{locale}/stats.png", "caption": { "en-US": "See your week" } }
  ]
}
```

Everything is optional; with `plan.preview` present, `run.mjs final` renders the previews too. `disclaimer: false`
removes the disclosure, `captions: false` the captions, `end: "none"` the end frame. `segments[].start` / `end`
limit the window the director may pick from; `segments[].focus` ([x, y, w, h] fractions) sets the camera's target by
hand; `segments[].captionAt` pins the caption; `segments[].spotlight` is a rect or `"auto"`. `shots.<id>` takes the
same keys for the automatic story (by screenshot shot id) without replacing it. `spotlight: "auto"` turns spotlights
on for every scene; `touches: false` hides hotspots. `effects: false` stops numbers rolling; `effect: "decode"` (globally
or in `shots.<id>` / `segments[]`) decodes a caption, `"none"` keeps it plain; `beam: false` removes the light running
around the spotlight and the call to action. `sfx` is a folder, `true` (the folder in `$APPSHOT_SFX`) or `false`. `--camera none` and `--no-blur` turn those layers off.

## Music on the beat

```bash
node scripts/preview.mjs --music assets/loop.m4a          # or plan.preview.music (+ "musicStart": 12.5)
```

`engine/lib/beats.mjs` finds the tempo and the beats (spectral flux, autocorrelation with a prior around 110 BPM,
then a period/phase grid refined over the whole excerpt). Every cut and the end frame move to the nearest beat that
still leaves each caption its reading time; the track is faded in and out and loudness-normalised (−16 LUFS). Free-
tempo ambient music reports low confidence and the cuts keep their reading-time timing. Use music you are licensed to
use in every territory (Apple); one track for the whole preview.

## Sound effects

```bash
node scripts/preview.mjs --promo --sfx ~/sounds/pack         # a folder you own
node scripts/preview.mjs --promo --sfx                       # the folder in $APPSHOT_SFX
node scripts/preview.mjs --promo --sfx --explain             # print the cue sheet, render nothing
```

Appshot ships no sounds. It reads a pack the user owns: a folder of category subfolders (`whoosh/`, `interface/`,
`click/`, `sparkle/`, `counter/`, `keyboard/`, `riser/`, `impact/`, `notification/`…). Without a path it uses
`$APPSHOT_SFX`; nothing else on the machine is searched. Never copy a pack into the app's repository or into Appshot: packs are licensed for use in
videos, not for redistribution.

The storyboard already knows every event to the frame, so `engine/lib/sfx.mjs` places the sounds itself, with the
**peak** of each sound (not its start) on its frame:

| Event | Sound | Level |
| --- | --- | --- |
| promo: the device rising in, the first three pushes | `whoosh/` | −15 to −17 dB |
| every other cut | `interface/` swish | −24 dB (promo), −27 dB (store) |
| a tap / a swipe | `click/` / `interface/` swish | −16 / −22 dB |
| a number rolling / a caption decoding | `counter/` ticker / `keyboard/` typing | −24 dB |
| the icon landing on the end card | `sparkle/` — one single sparkle per video | −18 dB |
| the call to action | `interface/` pop | −22 dB |

Whooshes stay on the 3–4 biggest moves only; with music the whole bed drops 3 dB more, without it it rises 4 dB.
`preview.sfxLevel` (dB, −12 to 6) shifts every cue; a limiter keeps the mix from clipping. Ask the user once, after
they have seen the picture: sound or none. App previews autoplay muted, so sound is a bonus there; on social video
it carries more weight. The report lists every cue (`sfx`).

## Variants B and C for Product Page Optimization

A weak preview can lose to screenshots, so test it. Apple allows three treatments:

- `node scripts/preview.mjs --variant b` — **action first**: opens on the scene with a tap and the most motion;
- `node scripts/preview.mjs --variant c` — **payoff first**: opens on the fullest, most finished screen (the result the
  app gives you).

The screenshot hook follows in both. They go to `out/preview/<locale>/variants/<b|c>/` (export:
`app-previews/variant-<b|c>/`). Upload them as treatments in a Product Page Optimization test against the original.
Other orders: `plan.preview.segments`.

## Promo videos (social, YouTube, Google Play)

```bash
node scripts/preview.mjs --promo                         # promo-vertical 1080×1920 + promo-landscape 1920×1080
node scripts/preview.mjs --promo --sizes promo-square    # 1080×1080
```

The same story, made for places where frames and brand motion are welcome:

- the footage inside a CSS device that rises in on the first scene and then floats a few degrees in 3D;
- the brand background with the app's animated key-art scene behind it (the creative director's pick;
  `preview.backdrop` sets one, `"none"` turns it off);
- a big kinetic caption above the device (beside it on landscape);
- scenes pushing in sideways on a spring;
- camera, touch hotspots and spotlights (with a beam of light running around the spotlit control) inside the device
  screen;
- an end card with icon, name, tagline and an optional `preview.cta` (it pops in, with a beam running around it). The
  tagline is `preview.tagline`, else
  `app.subtitle`, but only in the video's own language; a locale with neither restates its hook caption rather than
  falling back to English.

Output goes to `out/promo/<locale>/vertical.mp4 · landscape.mp4 · square.mp4` and is exported to `export/promo/`.
These are **not** App Store previews (frames), so `check.mjs` leaves them alone. Google Play has no uploaded video: put
`landscape.mp4` on YouTube and paste the link as the Play promo video.

## Audio check

Every render measures its own mix (EBU R128 via ffmpeg) and reports integrated loudness and true peak on the board line
and in the report (`qa.audio`). A silent track passes. Warnings: true peak above -1 dBTP (it can clip after AAC
encoding), louder than -11 LUFS (feeds turn it down and it sounds squashed), music quieter than -22 LUFS. An
effects-only track is reported as a note (sparse effects are quiet by design; add music for social feeds).
