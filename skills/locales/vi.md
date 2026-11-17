---
id: vi
name: Vietnamese
appStore: vi        # App Store Connect / fastlane deliver code
play: vi            # Google Play / fastlane supply code
dir: ltr            # rtl for ar-SA and he
---

# Vietnamese (Tiếng Việt)

A young, mobile-first, fast-growing market where Zalo, MoMo and Shopee set expectations. The two failure modes are typographic (diacritics) and relational (pronouns).

## Voice and register

- **Vietnamese pronouns encode relationship, age and gender.**
  - "bạn" is the neutral "you" that most apps use. Default to it.
  - "anh/chị" (older brother/sister) assumes the reader's age and gender; use it only if the brand persona already does.
  - "quý khách" (valued customer) is formal, for banks, airlines and hotels.
- **"Mình"** (we/I, casual) gives a friendly brand voice in subheads ("Mình nhắc bạn mỗi tối").
- **Omit the pronoun in headlines** where possible: "Thu chi gọn gàng", "Ngủ ngon hơn mỗi đêm".
- **Tone:** warm, positive, practical. Family, health and saving are strong emotional anchors. Light humour is fine; sarcasm isn't.
- Avoid heavy Sino-Vietnamese (Hán Việt) vocabulary in consumer copy ("tối ưu hóa trải nghiệm"). Prefer plain native words.

## Typography rules

- **Diacritics carry meaning.** Tone marks change words entirely (ma, má, mà, mã, mạ, mả). Never strip them, and make sure the display font supports full Vietnamese (ơ ư ă â ê ô đ plus stacked tones like ế, ở, ữ, ặ). Many decorative Latin fonts don't. Good choices: Be Vietnam Pro, Inter, Roboto, SF.
- **Line-height ≥ 1.25.** Stacked diacritics clip with tight leading. **Avoid all caps**, where tone marks collide with the line above.
- **Words are syllables separated by spaces**, and most concepts are two-syllable compounds ("tiết kiệm" = save, "chi tiêu" = spending). Don't break a line inside a compound; bind it with an NBSP.
- **Numbers:** decimal comma, thousands point. Currency "49.000 ₫" or "49.000đ" (match the app). Dates "4/11/2026" (day first); times "21:30".
- **Sentence case.** Quotes: “ ”.

## Length

- Expect **+10–30% characters** versus English (many short syllables).
- Headline target ≤ 30 characters, ≤ 2 lines; leave extra vertical room for diacritics.
- Shorten with:
  - dropping "một cách dễ dàng" (in an easy way)
  - "không + noun" ("không quảng cáo")
  - noun phrases

## Store and search habits

- **Users often search without diacritics** ("quan ly chi tieu", "hoc tieng anh"). Stores partly normalise this, but test both forms in keyword research. Captions always use full diacritics.
- **Queries:**
  - money: "quản lý chi tiêu", "sổ thu chi", "tiết kiệm"
  - health and fitness: "giảm cân", "đếm calo", "tập gym tại nhà", "thiền", "ngủ ngon"
  - learning, food and creative: "học tiếng Anh", "nấu ăn", "chỉnh ảnh", "AI"
- **Ecosystem:** Zalo is the dominant messenger, so "Chia sẻ qua Zalo" is natural if real. E-wallets (MoMo, ZaloPay, VNPay) and QR payments are everywhere.
- **Price-sensitive:** "miễn phí" and "không quảng cáo" convert when true. Trial wording ("dùng thử miễn phí") belongs on the paywall, not in screenshots.
- **Seasonality:** Tết (Lunar New Year) is the major season, with red and gold palettes and family themes, for custom product pages only.

## Transcreation examples

| English | Tiếng Việt | Note |
|---|---|---|
| Track every expense | Mọi khoản chi, **rõ ràng** | — |
| Sleep better tonight | Đêm nay ngủ **ngon** hơn | — |
| Get fit at home | Khỏe **đẹp** ngay tại nhà | "khỏe đẹp" (healthy and beautiful) is a common pairing |
| Your money, organized | Thu chi **gọn gàng** | idea compressed to "income and spending, tidy" |
| Learn English | Tiếng Anh **tự tin** mỗi ngày | confidence is the real goal |
| Never miss a bill | Không còn **quên** hóa đơn | — |
| Edit like a pro | Chỉnh ảnh **chuyên nghiệp** | — |
| Save more each month | **Tiết kiệm** hơn mỗi tháng | keep the compound together |
| Plan your week | Lên kế hoạch tuần trong **vài phút** | — |
| Cook at home | Bữa cơm **nhà** thêm ngon | "bữa cơm gia đình" carries family warmth |
| Start free | Bắt đầu **miễn phí** | — |
| Your data is safe | Dữ liệu của bạn **an toàn** | — |

## Pitfalls

- **Missing or wrong diacritics**, font fallbacks on stacked tones, and clipped marks from tight line-height.
- **Pronouns that assume age or gender** (anh/chị/em) in a neutral app.
- **Heavy Hán Việt MT phrasing** ("tối ưu hóa", "trải nghiệm người dùng") where plain words exist.
- **The Advertising Law** requires proof for "nhất", "số 1", "duy nhất", "tốt nhất". Health and food claims are regulated.
- **Maps are extremely sensitive.** Never show maps that conflict with Vietnam's claims (Hoàng Sa / Trường Sa, the "nine-dash line"). Avoid maps in screenshots unless essential.
