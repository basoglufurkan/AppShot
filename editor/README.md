# Appshot editor

A local page to touch up the screenshot set by hand while the agent works on the same `plan.json`.

```bash
node editor/server.mjs --project /path/to/your/app      # → http://localhost:4848
```

- **Strip** (top): every screenshot side by side, exactly as rendered (panorama backgrounds included). Click one to select it.
- **Stage** (centre): the selected screenshot, live — every keystroke recomposes it.
- **Shot tab**: layout, screens from `appshot/raw/`, headline/subhead per locale (`**word**` = highlight), theme override,
  device size, rotation, headline size, frame and colour, plus the raw shot JSON for layout-specific fields
  (cards, bullets, zoom rect, notifications, messages…).
- **Set tab**: app name, theme, accent colour, panorama, keywords, sizes and locales. **Score** renders drafts and shows the
  score with the fixes that would raise it most.
- **Issues tab**: live caption lint (store policy + conversion rules) for the current locale and store.
- **Save** writes `plan.json` (validated). **Render drafts / Render final** run the same scripts the agent uses.

When the agent edits `plan.json` on disk, the editor reloads (or asks first if you have unsaved changes).
The server only listens on 127.0.0.1.
