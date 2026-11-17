# Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `No Chrome/Chromium/Edge found` | browser not in a standard path | install Chrome or `export CHROME_PATH=/path/to/chrome` |
| `has no global WebSocket` | Node < 22 | upgrade Node (`brew install node`, `nvm install 22`) |
| `Chrome did not start in time` | sandbox / locked profile | close other headless Chromes; retry; on Linux CI: `CHROME_FLAGS="--no-sandbox" node scripts/render.mjs` |
| Fonts look like system fonts | offline or Google Fonts blocked | render online, or add `plan.fonts.local` files; `doctor.mjs` shows reachability |
| Headline "does not fit" | too long for the box at min size | shorten (the right fix), or `options.textSize` lower, or a layout with a bigger text band |
| Caption overlaps the device | long subhead / tall text band | cut the subhead, lower `options.deviceScale`, or use `device-top` |
| PLACEHOLDER screen | path in plan does not exist | capture it (`capture.md`) or fix the path; `plan.mjs show` marks missing screens |
| Phone frame on iPad canvas | screen is phone-shaped | expected fallback; capture iPad UI for a native iPad set |
| Zoom shows the wrong area | `zoom.rect` fractions off | rect = [left/width, top/height, w/width, h/height] of the raw PNG |
| Upload rejected: dimensions | wrong slot | `check.mjs` lists accepted sizes; use the size ids from `engine/sizes.json` |
| Upload rejected: alpha | PNG with transparency | renders are flattened automatically; re-render rather than editing PNGs by hand |
| Play rejects 1320×2868 | ratio > 2:1 | Play needs its own size (`android-phone`, 1080×1920) |
| Niche looks wrong | weak signals in code | `niche.mjs --set <id>`; read two neighbouring niche files |
| Editor blank | plan.json invalid JSON | `plan.mjs validate`; the editor shows the error in its log |
| Preview segment shows a still, not the recording | no clip named like the capture, the clip is another device class, or the capture is localised and the clip is not | `preview.mjs --explain` says which; name it `raw/[<locale>/]clips/<screen>.mp4` (`preview.mjs clip` / `record`) |
| Recording is 0.1 s long | the Simulator only writes frames when the screen changes | Appshot holds the last frame to the real length; record while the app moves |
| `simctl recordVideo failed` | no booted Simulator | `xcrun simctl boot "iPhone 17 Pro Max" && open -a Simulator`, or `--device <udid>` |
| Preview first frame looks empty | the hook clip starts on a loading state | re-cut it later (`preview.mjs clip --start …`): the first frame is the thumbnail |
| App Store Connect rejects the preview | resolution, length, fps or audio | `check.mjs` lists the exact rule; previews need 15–30 s, ≤ 30 fps, 886×1920 for Face ID iPhones, stereo audio |

