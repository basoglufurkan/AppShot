# Example: Pulse (fictional)

A tiny Expo-shaped project used to demo and test Appshot end to end. It is not a runnable app:
the files exist so `scripts/scan.mjs` has something realistic to read, and `mock-screens/` stands in
for simulator captures (rendered with `scripts/capture/web.mjs`).

```bash
# from the Appshot folder
node scripts/capture/web.mjs --url examples/pulse/mock-screens/_icon.html --width 1024 --height 1024 --dpr 1 --out examples/pulse/assets/icon.png
node scripts/scan.mjs examples/pulse
node scripts/capture/web.mjs --dir examples/pulse/mock-screens --outdir examples/pulse/appshot/raw
node scripts/render.mjs --project examples/pulse --draft
node scripts/sheet.mjs --project examples/pulse --draft
node scripts/score.mjs --project examples/pulse --draft
```

The finished plan, brief and review boards live in `examples/pulse/appshot/`.
All names, numbers and reviews in this example are invented for the demo.
