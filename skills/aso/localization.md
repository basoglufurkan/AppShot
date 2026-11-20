---
id: aso-localization
title: Localizing screenshots and metadata
last_verified: 2026-11-04
---

# Localization

## Which markets first

Decide from data in this order. Don't localize "because it's big".

1. **Your own demand.** Look at App Store Connect App Analytics and Play Console by territory:
   impressions, page views and conversion in markets you haven't localized yet. High impressions with
   low conversion signal a market that wants the app but can't read the page.
2. **Market value.** Third-party market-intelligence reports (Sensor Tower, AppMagic, data.ai and
   others) consistently rank the US, Japan, China, South Korea, Germany, the UK, France, Canada and
   Australia among the top consumer-spend markets. India, Brazil, Indonesia, the US and Mexico
   rank among the top download-volume markets. Treat these as directional; check the current
   year's reports before quoting numbers.
3. **Competition.** For the primary keyword translated by a native speaker, count how many top-10
   apps have localized screenshots. Markets where few competitors localize captions are cheap wins.
   This is common in Polish, Vietnamese, Thai, Indonesian, Dutch and the Nordic languages.
4. **Reuse.** One localization can cover several storefronts. Spanish (Mexico) serves Latin America
   and is an extra language in the US. Portuguese (Brazil) serves Brazil. French serves France,
   Belgium, Switzerland and many African storefronts. Arabic serves the MENA storefronts.

**Default waves for a consumer app** (adjust with data):
- **Wave 0:** English (U.S.) plus English (U.K.).
- **Wave 1:** Japanese, German, French, Spanish (Mexico), Portuguese (Brazil), Korean.
- **Wave 2:** Italian, Spanish (Spain), Indonesian, Dutch, Polish, Arabic, Chinese
  (Traditional), Vietnamese, Thai.
- **Chinese (Simplified)** only if you will distribute in China mainland. That needs extra compliance
  information in App Store Connect.

**Why English (U.K.) belongs in wave 0 on Apple.** English (U.K.) is the *default* metadata language
in a long list of non-English storefronts, including Saudi Arabia, the UAE, India, Indonesia,
Poland, Norway, Israel, Thailand and Vietnam
([App Store localizations](https://developer.apple.com/help/app-store-connect/reference/app-information/app-store-localizations)).
A deliberate en-GB listing (British spelling, its own keyword field) reaches users in all of them.

## How Apple picks the language shown (fallbacks)

From [Localize app information](https://developer.apple.com/help/app-store-connect/manage-app-information/localize-app-information):
- With only a primary language, that metadata appears in every storefront.
- A French localization shows to users whose language setting is French. It also shows in storefronts
  that support French but not English, and "Users can search for your app using localized keywords
  in all countries or regions where the App Store supports French."
- "If no localization matches a user's language setting, the next most relevant localization is used".
  Otherwise the primary language is used.
- A new language inherits the primary language's **screenshots** until you upload localized ones.
  Description and keywords are not inherited.
- Storefront examples from Apple's table:
  - **USA:** English (US) plus Arabic, Chinese (S/T), French, Korean, Portuguese (BR), Russian,
    Spanish (MX) and Vietnamese.
  - **Canada:** English (Canada) plus French (Canada).
  - **Switzerland:** German plus English (U.K.), French and Italian.
  - **India:** English (U.K.) plus 11 Indic languages.

**Additional-language keyword slots.** Because each storefront indexes all of its supported languages,
practitioners add keywords in, for example, the Spanish (Mexico) field to reach more US searches.
Keep the *visible* fields (name, subtitle, screenshots) in real Spanish for Spanish readers. Filling a
locale's visible metadata with another language's keywords breaks 2.3 accuracy and hurts those users.

## Google Play language handling

- Play shows the listing in the user's language when you provide it. Otherwise "Google provides
  automated machine translations of store listings that you don't explicitly define". Professional
  translation "can lead to better search results"
  ([Get discovered](https://support.google.com/googleplay/android-developer/answer/4448378)).
- **Machine translation pitfalls:**
  - **Screenshot text is never translated.** Users read a machine-translated description next to
    English captions.
  - Keyword phrasing becomes word-for-word ("budget planner" may come out as a phrase nobody searches).
  - Brand and feature names get translated.
  - The register is wrong (formal or informal).
  - Policy still applies to translations. Write the top markets yourself.
- **Custom store listings are not auto-translated.** Users see the CSL's default language unless you
  add translations ([CSL](https://support.google.com/googleplay/android-developer/answer/9867158)).
- Localized graphics remove that language from *default* graphics experiments. Test it with a
  localized experiment instead (`testing.md`).
- Use precise codes: `de-DE`, `es-419` (Latin America), `es-ES`, `pt-BR`, `en-GB`, `zh-TW`.

## Localization vs transcreation

| Layer | Approach |
|---|---|
| Keywords | **Research natively.** Never translate. Local autocomplete and competitor terms decide. |
| Captions | **Transcreate.** Keep the promise, the keyword slot and the `**accent**` on the benefit word, and rewrite idiomatically. Back-translate to check the meaning. |
| In-app UI in captures | Capture the app *running in that locale*. Apple: "Be sure to localize for all languages your app supports" ([Asset best practices](https://developer.apple.com/app-store/asset-best-practices/)). |
| Demo data | Local names, currency, date and number formats, units (km/mi, kg/lb), addresses, local content (recipes, teams, holidays) |
| Imagery | Check gestures, clothing, food, alcohol, religious symbols, maps and borders. Keep it 4+ safe everywhere. |
| Colours | Rarely need changing. Check market-specific meanings for finance up/down (red means "up" in mainland China, Taiwan and South Korea stock UIs). |

## English screenshots in other locales

- **Acceptable:** a Wave-2 or long-tail locale where the app UI itself isn't translated yet. Localized
  metadata with English screenshots is better than nothing for search.
- **Not acceptable:** localized captions over UI the app doesn't offer in that language, or captions
  implying local features that don't exist (2.3 accuracy).
- **Middle path:** localize only the caption layer over English UI when the app is mostly visual and
  language-neutral (photo, maps, games). Google: "In-game UI does not need to be localized per market,
  but any additional taglines or text overlays should be localized."

## RTL (Arabic, Hebrew, Urdu)

Apple's App Store localizations include Arabic, Hebrew and Urdu (Persian is not offered); Play
supports more RTL languages.
- **Mirror the composition, not the pixels.** Right-align captions, place the device or UI focus on
  the opposite side, and reverse the order of panoramas. The store UI is mirrored in RTL, so the
  gallery starts at the right. Re-render bridge layouts; don't flip them. Verify on a device set to Arabic.
- Capture the UI in RTL mode. Never horizontally flip a screenshot: text, logos, clocks, media
  play/forward icons, charts with time axes and phone hardware must not be mirrored.
- Use fonts with proper Arabic or Hebrew shaping (for example Noto Sans Arabic, IBM Plex Sans Arabic,
  Noto Sans Hebrew). **No letter-spacing** on Arabic (it breaks joining). Use larger line height. There
  is no uppercase or italics.
- Numerals: match what the app UI shows in that locale (Western or Eastern Arabic digits) and keep
  captions consistent with it.

## Other script and length notes

- German, Finnish and Dutch run 20–35% longer. Allow 3-line headlines or shorter wording, and
  never go below the legibility floor. Use soft hyphenation only for German compounds.
- CJK: fewer characters but wider glyphs. Use about 8–12 characters per line, and kinsoku-safe line
  breaks (no line starting with 。、）). No faux italics or bold. Use fonts that cover the full set
  (Noto Sans CJK, Hiragino, PingFang).
- Thai and Indic scripts need taller line boxes for marks above and below the line. Test clipping.

## Checklist per new locale

- [ ] Native keyword research done. Name, subtitle and keyword bytes checked.
- [ ] Captions transcreated and native-reviewed. Accent still on the benefit word.
- [ ] Captures taken with the app running in that locale, with local demo data.
- [ ] Lengths fit without shrinking fonts. 25% legibility test re-run.
- [ ] RTL: composition mirrored, captures in RTL, nothing flipped, correct numerals.
- [ ] Play: listing written by a human for top markets. No reliance on machine translation for screenshots.
- [ ] Apple: en-GB and secondary storefront languages handled deliberately.
