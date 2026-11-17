# Final render, checks and export

```bash
node $SKILL_DIR/scripts/render.mjs            # all sizes × locales, store resolution, RGB (no alpha)
node $SKILL_DIR/scripts/sheet.mjs             # final contact sheets — look at them one last time
node $SKILL_DIR/scripts/check.mjs             # exit 1 on anything a store would reject
node $SKILL_DIR/scripts/export.mjs --zip
node $SKILL_DIR/scripts/graphic.mjs --type play-feature   # if shipping on Google Play
```

## What check.mjs blocks

Wrong pixel size for the slot · alpha channel · Play file > 8 MB or ratio > 2:1 · too few/many shots per store ·
placeholder screens · broken images · overflowing headlines · copy errors (prices, other platforms, unfilled
`{placeholders}`, unsourced claims, Play-banned social proof). Warnings: Play captions over 20 % of the image,
iPad supported but no iPad set. App previews: wrong resolution, outside 15–30 s, over 30 fps, H.264 level above 4.0,
non-stereo audio, over 500 MB, more than 3 per locale (warnings: bitrate outside 10–12 Mbps, no audio track).

## Export layout

```
appshot/export/
  fastlane/screenshots/<appStoreLocale>/01_iphone-6.9.png …     → fastlane deliver
  fastlane/metadata/android/<playLocale>/images/phoneScreenshots/1_<loc>.png …  → fastlane supply
  upload/ios|android/<locale>/<size>/…                            → drag & drop
  upload/ios/<locale>/creative-assets/                            → header / search results (by hand)
  upload/ios/<locale>/app-previews/iphone.mp4, ipad.mp4           → app previews (by hand; set the poster frame)
  ios-screenshots.zip, android-screenshots.zip                    (--zip)
  README.md                                                       exact upload commands
```

Locale codes are mapped per store (`tr` → `tr` on App Store, `tr-TR` on Play) from `engine/locales.json`.

## Metadata to hand over

Suggest, do not upload: App Store title (30), subtitle (30), keyword field (100 bytes —
`keywords.mjs field --title "…" --subtitle "…"`), promotional text (170); Play title (30), short description (80).
Align them with shot 1's promise (`skills/aso/metadata.md`).

## After upload

App Store screenshots change with a new version (or as Product Page Optimization treatments / Custom Product Pages);
Google Play listings update after review. Plan the next test (`skills/aso/testing.md`) and a refresh date
(`skills/aso/seasonal.md`).
