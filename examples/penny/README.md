# Example: Penny (fictional, Flutter)

A Flutter-shaped project (pubspec, Dart screens, ARB files, Android manifest, iOS Info.plist) that exercises the
Flutter scanner path and a light, finance-style set. Mock screens stand in for captures. All names and numbers are invented.

```bash
node scripts/capture/web.mjs --url examples/penny/mock-screens/_icon.html --width 1024 --height 1024 --dpr 1 --out examples/penny/assets/icon.png
node scripts/scan.mjs examples/penny
node scripts/capture/web.mjs --dir examples/penny/mock-screens --outdir examples/penny/appshot/raw
node scripts/render.mjs --project examples/penny --draft && node scripts/sheet.mjs --project examples/penny --draft
```
