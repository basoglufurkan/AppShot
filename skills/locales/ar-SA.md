---
id: ar-SA
name: Arabic
appStore: ar-SA     # App Store Connect / fastlane deliver code
play: ar            # Google Play / fastlane supply code
dir: rtl            # rtl for ar-SA and he
---

# Arabic (العربية)

App Store ar-SA reaches Saudi Arabia and the wider Arabic-speaking storefronts; Play "ar" covers every Arabic market. Write **clear Modern Standard Arabic (فصحى مبسطة)** with a light Gulf flavour at most. Saudi Arabia and the UAE are high-spending, iPhone-heavy, young markets.

## Voice and register

- **Simplified MSA is the safe default.** It reads correctly from Morocco to Oman.
  - Gulf colloquial (فلوسك, وش, تبي) suits Saudi-only consumer brands with a casual UI.
  - Egyptian colloquial reads as "not for us" in the Gulf.
- **Arabic verbs and pronouns are gendered.**
  - The imperative "نظّم" (organise) is masculine; "نظّمي" is feminine.
  - Masculine is the traditional generic, but women are a huge share of app users.
- **Prefer gender-neutral constructions:**
  - **Verbal nouns (مصدر):** "تنظيم مصاريفك بسهولة"
  - **Noun phrases:** "كل مصروف تحت السيطرة"
  - **The unvocalised possessive ـك**, which is written the same for both genders: "أموالك", "وقتك".
- **Women-focused apps** (cycle tracking, beauty, maternity) address the reader in the feminine throughout.
- **Tone:** warm, respectful, aspirational. Religious phrases (إن شاء الله, بإذن الله) do not belong in captions unless the app is religious. Hospitality and family are strong emotional frames.

## Typography rules

- **RTL everything.**
  - Text is right-aligned and the layout is mirrored: device position, arrows, progress indicators, "before → after" flows.
  - On the store, an Arabic-locale carousel runs right to left, so the first screenshot sits at the right. **Panoramic or bridged backgrounds must be mirrored** so the story still flows in reading order.
- **Shaping:** Arabic letters join. Text must render through a shaping engine; isolated letters (ا ل ع ر ب ي ة) mean broken rendering.
  - Never apply letter-spacing (it breaks the joins).
  - Don't colour or style *part* of a word: highlight whole words only.
- **Fonts:** SF Arabic, Noto Sans/Kufi Arabic, IBM Plex Sans Arabic, Tajawal, Cairo, Almarai. Increase line-height (~1.4+); Arabic needs vertical room. No faux italics, no all-caps equivalents, no kashida justification in headlines.
- **Punctuation:** Arabic comma ، question mark ؟ semicolon ؛. Quotes « » or “ ”.
- **Numerals:** choose Western digits (1 2 3) or Arabic-Indic digits (١ ٢ ٣) to **match the app UI**, and never mix them in one image. Most Saudi consumer apps use Western digits.
- **Bidi:** wrap Latin brand names, numbers and units in direction isolates (U+2068 FSI … U+2069 PDI) or add RLM marks, so punctuation and "%" don't jump to the wrong side.
- **Currency:** "49 ر.س" or "49 ريال". Prefer no prices.

## Length

- **Width is roughly equal to English, ±20%.** Arabic often uses fewer words but wider glyphs and needs more line height.
- Plan **≤ 4 words per line**, ≤ 2 lines.
- Avoid stacked prepositional chains ("من أجل إدارة أفضل لـ…"). Use a noun phrase plus a result.

## Store and search habits

- **Users search in Arabic and English.** Gulf users often type English category words, so the keyword strategy needs both.
- **Spelling variation is normal:** أ/ا/إ (hamza), ة/ه (taa marbuta), ى/ي. Users type inconsistently; cover common variants in keywords, but captions use correct spelling.
- **Common queries:**
  - money: "ميزانية", "مصاريف"
  - health and fitness: "رجيم" (colloquial diet) and "حمية", "تمارين منزلية", "عداد خطوات"
  - learning and food: "تعلم الانجليزي", "وصفات"
  - religious: "مواقيت الصلاة", "أذكار", "قرآن"
  - "تطبيق" + function is a common prefix.
- **Payments and trust:** Apple Pay, mada (Saudi debit network), STC Pay; BNPL (Tabby, Tamara) shapes e-commerce expectations. "بدون إعلانات", "مجاني" and "بياناتك بأمان" are strong if true.
- **Seasonality:**
  - Ramadan is the biggest season (usage patterns shift to the night; suhoor and iftar features).
  - Eid al-Fitr and Eid al-Adha.
  - Saudi National Day (23 September) and Founding Day (22 February).
  - Seasonal captions go in custom product pages.

## Transcreation examples

| English | العربية | Note |
|---|---|---|
| Track every expense | كل مصروف **تحت السيطرة** | noun phrase avoids gendered imperative |
| Sleep better tonight | نوم **أعمق** من الليلة | verbal noun, gender-neutral |
| Get fit at home | لياقتك **في البيت** | possessive ـك reads for both genders |
| Your money, organized | أموالك **مرتّبة** وبالك مرتاح | added peace of mind; "فلوسك" for Gulf-casual brands |
| Learn English | **الإنجليزية** بثقة، كل يوم | avoids "تعلّم/تعلّمي" |
| Never miss a bill | لا **فاتورة** تفوتك بعد اليوم | — |
| Edit like a pro | صور **احترافية** بلمسة واحدة | — |
| Plan your week | أسبوعك **منظّم** في دقائق | — |
| Your Ramadan routine | روتين **رمضان** بلا عناء | seasonal CPP variant |
| Prayer times, exact | مواقيت الصلاة **بدقة** | religious apps only |
| Free to start | البداية **مجانية** | avoids masculine "ابدأ" |
| Your data is safe | بياناتك **بأمان** | — |

## Pitfalls

- **Broken shaping**, LTR alignment, an unmirrored layout, or reversed word order from a non-bidi renderer. Always inspect the rendered PNG.
- **Mixed digit systems**, misplaced "%" or "+" because of bidi, and Latin punctuation (? ,) instead of ؟ ،.
- **Masculine-only address** in apps with large female audiences.
- **Stiff MT MSA:** "قم بـ…" (do the …) constructions and over-long genitive chains. Rewrite to direct noun phrases.
- **Cultural and legal constraints:**
  - Modest imagery (clothing, couples), and no alcohol, pork, gambling or dating cues for broad audiences.
  - Quranic verses and holy sites are never decoration.
  - Maps and borders are politically sensitive.
  - In Saudi Arabia, health claims are regulated by the SFDA and advertising by the media regulator (GAMR, formerly GCAM).
- **Western holiday or humour references** that don't travel. Puns rarely survive. Write the benefit plainly.
