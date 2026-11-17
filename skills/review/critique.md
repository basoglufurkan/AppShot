# Visual critique — look like a top-grossing app's marketing lead

Run this on `review/search-<locale>.png` first, then `review/contact-<size>-<locale>.png`, **before** reading the score.
Open the images with the Read tool. Write down findings as "shot N: problem → fix in plan.json".

## 1 · The search test (search-<locale>.png, light and dark)

Squint. You are a stranger scrolling search results in one second.
- Do the three frames say what the app does and why it is better, without reading the subheads?
- Is there one clear focal point per frame (headline → device), or visual noise?
- Does the set pop against the white **and** black store UI, and against the grey competitor placeholders?
- Does it look like one family with the icon (colour, mood)?
- Is the first headline readable at this size? If you have to zoom, it is too long.

## 2 · Each shot (contact sheet)

| Check | Fails when | Typical fix |
| --- | --- | --- |
| One idea | headline needs "and" / two benefits | split the shot or cut one benefit |
| Benefit, not feature | "Dashboard with charts" | "See where your money goes" |
| Highlight | on a filler word or on 3+ words | move `**…**` to the word that carries the promise |
| Headline size | small vs canvas, 3+ lines | shorten; 2 lines max for shots 1–3 |
| Device | small, cropped awkwardly, empty UI, empty state | `deviceScale`, a better capture, `zoom-callout` |
| Real, lived-in UI | test data, lorem, debug banners, 0 values | re-capture with demo data |
| UI legibility | key element too small to read | `zoom-callout` / `ui-pieces` / `floating-cards` with the real value |
| Contrast | text on busy/mid-tone background | theme change, `options.scrim`, darker `background` |
| Overlap | caption touches the device / notch | smaller subhead, `deviceScale`, `device-top` |
| Decor | glows/confetti compete with the UI | remove `decor`, keep grain/glow subtle |
| Honesty | claims not provable by a screen | rewrite to what the screen shows |

## 3 · The set

- Story: hook → value → depth → differentiator → objection → habit → close. Is any shot redundant? Cut it.
- Rhythm: layouts vary; tilt not more than every other shot; text-led and device-led frames alternate.
- Repetition: the same word in three headlines; the same screen three times with no new angle.
- Consistency: one theme family, same device finish, same type scale, highlights in the same style.
- Locale: line breaks look natural, no orphan single word, highlight on the right word in that language,
  Turkish characters correct (İ, ı, ş, ğ, ç, ö, ü), RTL mirrored where it matters.
- Store: Android set has no ratings/awards/testimonials/"free"/prices; iOS set never says Android/Google Play.

## 4 · Verdict

Ship only when you would put this set next to the top three apps of the niche and it wins the glance.
Otherwise list the three highest-impact fixes, apply them, re-render, and look again.
