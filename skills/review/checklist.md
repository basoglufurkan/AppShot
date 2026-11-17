# Pre-ship checklist

Tick every line before `export.mjs`.

## Content
- [ ] Every caption traces to `brief.md`; the positioning line is visible in shot 1.
- [ ] Shots 1–3 carry the three top benefits and each stands alone.
- [ ] Headlines 2–6 words, one highlight, ≤ 2 lines in shots 1–3, in every locale.
- [ ] No `{placeholders}`, no invented numbers; every rating/award/quote/stat has a `source`.
- [ ] No prices, discounts, "free trial", competitor names, other platforms, medical cure claims.
- [ ] Top 2–3 keywords appear naturally in shots 1–3 (`keywords.mjs coverage`).

## Visuals
- [ ] Every screen is a real capture (no PLACEHOLDER), lived-in demo data, clean status bar.
- [ ] UI language matches the caption locale (or a conscious fallback noted in the hand-off).
- [ ] Contrast ≥ 4.5:1 measured (`score.mjs`), set readable in the search preview (light and dark).
- [ ] Layout rhythm varies; no caption/device overlap; nothing important under the Dynamic Island.

## Stores
- [ ] iOS: 6.3" class present (6.9" recommended too); iPad 13" if the app supports iPad; 1–10 per locale.
- [ ] Android: 1080×1920 (or ≤ 2:1), 2–8 per device type, no social proof/CTA/price, captions ≤ ~20 % of the image.
- [ ] `node scripts/check.mjs` exits 0.

## Hand-off
- [ ] Contact sheets and search previews looked at — final, not drafts.
- [ ] Scores ≥ 85 for every size × locale.
- [ ] Metadata suggestions (title, subtitle, keyword field ≤ 100 bytes) aligned with shot 1.
- [ ] Next test named (variant + what it tests).
