---
id: th
name: Thai
appStore: th        # App Store Connect / fastlane deliver code
play: th            # Google Play / fastlane supply code
dir: ltr            # rtl for ar-SA and he
---

# Thai (ภาษาไทย)

A playful, social, LINE-centric market where cute and friendly visuals convert. Thai script is the most technically demanding LTR locale for rendering: no spaces between words, plus stacked vowels and tone marks.

## Voice and register

- **Avoid gendered polite particles in headlines.** ครับ (male speaker) and ค่ะ (female speaker) mark the *brand's* gender. Brands use them in chatty subheads only if they have a defined persona.
- **"คุณ" (khun, you)** is polite and neutral, but often omitted. Benefit-first phrases need no pronoun: "หลับสบายทุกคืน".
- **Tone:** friendly, light, fun. Thai marketing uses playful slang for youth brands (ปัง = awesome, ฟิน = blissful, เป๊ะ = precise, จึ้ง = stunning). It dates quickly: one per set, and none in finance or health.
- **English loanwords are common in Thai script** (แอป, ฟรี, โปร, ฟิต, เช็ค). Use what people actually say.

## Typography rules

- **No spaces between words.** Spaces mark phrase or sentence boundaries ("เงินเข้าออก เป๊ะทุกบาท").
  - Line breaking needs dictionary-based word segmentation (ICU). A naive renderer breaks mid-word, which looks broken to every Thai reader.
  - Insert zero-width spaces (U+200B) at word boundaries if the engine can't segment, or use explicit line breaks.
- **Stacked marks:** vowels and tone marks sit above and below consonants (e.g., ปั้, ที่, ดู). Use **line-height ≥ 1.5** and check that nothing clips at the top or bottom of text boxes.
- **Highlight (accent) spans must start and end on word boundaries.** A span beginning with a combining vowel or tone mark breaks shaping: never split "ที่" from its marks.
- **Fonts:**
  - Loopless (modern, no "heads") faces like Kanit, Prompt, Noto Sans Thai and Sukhumvit Set are the Thai advertising norm for headlines.
  - Looped (traditional) faces like Sarabun, Noto Sans Thai Looped and IBM Plex Sans Thai Looped read better for subheads and small text.
  - Pick a Thai font whose Latin matches the headline weight.
- **Numerals:** Arabic digits (Thai digits ๑๒๓ are rare commercially). Currency "฿49" or "49 บาท".
- **Dates in mock UI:** Thailand uses the Buddhist Era for many dates (2026 CE = 2569 BE). Match the app's calendar setting.
- **No capitalisation.** Punctuation is minimal: no full stops in headlines; "?" and "!" are used sparingly.

## Length

- **Width is similar to English, up to +20%.** Vertical space is larger due to stacking.
- Plan ≤ 2 lines, ~10–16 characters per line at hero size.
- Shorten by dropping "ได้อย่างง่ายดาย" (easily, done in a formal way) and using noun phrases.

## Store and search habits

- **Queries:**
  - money: "รายรับรายจ่าย", "บัญชีรายรับรายจ่าย", "ออมเงิน"
  - health and fitness: "ลดน้ำหนัก", "นับแคลอรี่", "ออกกำลังกายที่บ้าน", "นับก้าว", "นอนหลับ"
  - learning, food and creative: "เรียนภาษาอังกฤษ", "สูตรอาหาร", "แต่งรูป"
  - astrology: "ดูดวง" (horoscope, a large category)
- **LINE is the dominant messenger and login** ("เข้าสู่ระบบด้วย LINE", "แชร์ผ่าน LINE"). PromptPay and TrueMoney Wallet are everyday payments.
- **Android dominant, price-sensitive.** "ฟรี", "ไม่มีโฆษณา" and "ใช้ฟรี" convert when true.
- **Style:** cute characters, pastel or vivid palettes, stickers and emoji-like decor are mainstream, even for some finance apps. Keep it tasteful.
- **Seasonality:** Songkran (April) and New Year. Use custom product pages.

## Transcreation examples

| English | ไทย | Note |
|---|---|---|
| Track every expense | รายจ่ายทุกบาท **รู้หมด** | casual, punchy |
| Sleep better tonight | คืนนี้**หลับสบาย** | highlight spans a whole word boundary |
| Get fit at home | ฟิตหุ่นได้ที่**บ้าน** | — |
| Your money, organized | เงินเข้าออก **เป๊ะ**ทุกบาท | slang "เป๊ะ" (precise); friendly brands |
| Learn English | พูด**อังกฤษ**มั่นใจขึ้น | speaking with confidence |
| Never miss a bill | ไม่ลืมจ่าย**บิล**อีกต่อไป | — |
| Edit like a pro | แต่งรูปสวย**ระดับโปร** | — |
| Save more each month | **เก็บเงิน**ได้จริงทุกเดือน | — |
| Plan your week | วางแผนทั้งสัปดาห์ใน**ไม่กี่นาที** | — |
| Easy daily recipes | เมนูง่าย **ทำได้ทุกวัน** | space separates phrases |
| Start free | เริ่มใช้**ฟรี** | — |
| Your data is safe | ข้อมูลของคุณ**ปลอดภัย** | — |

## Pitfalls

- **Mid-word line breaks**, clipped tone marks, and broken accent spans. Always inspect the rendered PNG at full size.
- **Gendered particles** (ครับ/ค่ะ) in headlines, or a mix of both across shots.
- **Over-formal MT Thai** ("ท่านสามารถ…ได้อย่างง่ายดาย"). Rewrite to short, casual phrases.
- **Royal family references or imagery** are never acceptable (lèse-majesté). Buddha images are not decoration. Avoid feet imagery near heads or sacred objects.
- **Health and beauty claims** are regulated by the Thai FDA and the Consumer Protection Board. No "whitening" or guaranteed weight-loss promises.
