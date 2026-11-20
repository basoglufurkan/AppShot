# Hero art — make the billboard's object yourself

Shot 1 is a billboard ([layouts.md](layouts.md)): the promise, the money moment lifted out of the device, and — when
it lands — **one real-world object, larger than life**, that says what the app is about before a word is read: a flame
for a habit streak, a water drop for a water tracker, a kettlebell for a gym app. Top charts use this constantly.

**If your agent can generate images, it makes this object. Do not skip it.**

- **Codex**: built-in image generation (ask it to "generate an image" and save the PNG).
- **ChatGPT / OpenAI image API**, **Figma AI** (`generate_image` in the Figma MCP), **Gemini**, any other image tool.
- No image tool at all: skip it. The money moment (`pop.rect`) carries the billboard on its own. Never use stock art
  or art from another app.

## Steps (step 10b of the pipeline, after the layout is chosen)

```bash
node $A/scripts/hero.mjs                # status: does the billboard have hero art?
node $A/scripts/hero.mjs prompt         # the prompt (niche subject + the shot's accent colour); --subject "…" to change it
# → send the prompt to your image tool; save the PNG as appshot/raw/hero-src.png
node $A/scripts/hero.mjs cutout appshot/raw/hero-src.png --out raw/hero-flame.png   # removes a white background
node $A/scripts/hero.mjs use raw/hero-flame.png                                      # sets hero.image on the billboard
node $A/scripts/render.mjs --draft --only 1   # then LOOK at the PNG
```

`copy-check` lists `billboard-no-art` while the billboard has none, as a reminder.

## The subject

- **One object**, bold silhouette, readable at 120 px wide. Not a scene, not a person, not a phone.
- The **thing the app is about** or its reward: the flame of a streak, the drop of water, the coin saved, the leaf
  identified. `hero.mjs prompt` proposes two per niche (`engine/lib/heroart.mjs` → `SUBJECTS`).
- Colours from the shot: the accent (the prompt includes it), lit to glow on dark backgrounds.
- **Glossy 3D** by default (`--style photo` for food, fashion, plants and objects people buy).

## Hard rules

1. **No text, numbers, logos, brand names, UI or people in the image.** Text in art cannot be localised or checked;
   other brands are an Apple 4.1 / trademark problem; real-looking people raise likeness questions.
2. **It is decoration, not a claim.** It must not show a feature the app does not have or a result it cannot give.
3. **Real screens still lead.** The device with the real UI stays on shot 1 (or shots 2–3 at the latest) — art
   alone is an Apple 2.3.3 risk (`billboard-no-ui`).
4. **Transparent PNG.** Ask for a transparent background; if the tool can only do white, `hero.mjs cutout` removes it.
   Look at the edges in the render — a white halo means: raise `--tol` (e.g. 48) or ask for a cleaner background.
5. **Record how it was made** in the shot's `note` (tool and model), so the user knows it is generated art.

## Placing it

`hero.mjs use` puts it **behind the device** (`layer: "back"`, x 0.84, y 0.55, w 0.8) and moves the device left
(`deviceX 0.41`, `deviceScale 0.66`), the Dayloop/Tide look. Then tune:

| Field | Effect |
| --- | --- |
| `hero.x`, `hero.y` | centre on the canvas (0–1). Keep it clear of the promise; let it bleed off the right edge |
| `hero.w`, `hero.h` | width (of W) and height (of the hero zone) — the object fits inside (contain) |
| `hero.rotate` | a few degrees (4–8) feels alive |
| `hero.layer` | `back` (big, behind the device) or omit it (in front of the device's lower corner, smaller) |

Examples: `examples/dayloop/appshot/plan.json` (flame behind the device) and `examples/tide/appshot/plan.json`
(water drop). Check after render: the object reads in the search thumbnail (`review/search-*.png`), it does not fight
the money moment, and the promise stays the first thing the eye lands on.
