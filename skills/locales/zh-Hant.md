---
id: zh-Hant
name: Chinese (Traditional)
appStore: zh-Hant   # App Store Connect / fastlane deliver code
play: zh-TW         # Google Play / fastlane supply code
dir: ltr            # rtl for ar-SA and he
---

# Chinese (Traditional, 繁體中文)

Primary market: **Taiwan**, with Hong Kong and Macau also reading Traditional. Write Taiwanese Traditional Chinese, not converted Simplified. Character conversion (OpenCC and the like) changes glyphs but not vocabulary, and Taiwanese readers notice mainland words immediately.

## Voice and register

- **"你" is standard** for consumer apps; **"您"** for finance, healthcare, government and premium service. Headlines usually drop the pronoun.
- **Tone:** warm, friendly, a bit cute and detail-oriented. Taiwanese copy uses soft particles in subheads for casual brands (喔, 囉, 吧, 啦) and loves 質感 (refined feel).
- **Parallel phrasing and four-character expressions** work as in Simplified (一目了然, 輕鬆上手), but with Taiwanese vocabulary.
- **Hong Kong nuance:** HK readers accept Taiwanese written Chinese, but some terms differ (軟件 HK vs 軟體 TW, 網絡 HK vs 網路 TW). For a Taiwan-first listing, use Taiwanese terms consistently.

## Typography rules

- **Quotes are 「」, with 『』 nested.** This is the distinctive Traditional convention; never use “ ” as in Simplified.
- **Full-width punctuation:** ，。！？：；、. In Taiwanese typography, punctuation sits centred in the character box, which the right font (PingFang TC, Noto Sans TC / Source Han Sans TC) handles. Set `lang="zh-Hant"` (or `zh-TW`). Never render with SC or JP fonts.
- **Spacing:** no spaces between Chinese characters. A space between Chinese and Latin letters or digits is a common modern convention ("支援 iCloud 同步"); be consistent.
- **Line breaking:** no line may start with closing punctuation 」，。、！？; don't split words or four-character phrases.
- **Numbers:**
  - Arabic digits; large counts in 萬/億 ("{users}萬位使用者").
  - Currency "NT$120" or "120元". HK uses "HK$".

## Length

- **~50–60% of English characters**, but glyphs are wide.
- Plan **6–10 characters per line**, ≤ 2 lines, ≤ 14 characters total (the engine's `maxHeadline`). Subheads ≤ 24 characters.
- Cut function words (的, 可以, 進行) as in Simplified.

## Store and search habits

- **Queries (Taiwanese terms):**
  - money: "記帳", "存錢", "預算"
  - health and fitness: "健身", "減肥", "計步", "睡眠", "冥想"
  - learning and productivity: "背單字", "英文", "行事曆", "待辦", "筆記"
  - creative: "修圖", "相機", "影片剪輯", "AI"
- **LINE is the dominant messenger in Taiwan** (not WeChat): "分享到 LINE", "LINE 登入". Payment ecosystems: LINE Pay, 街口支付, Apple Pay.
- **iPhone has a strong share** and users are willing to pay for quality. Detailed, information-rich screenshots with callouts are normal; cute mascots and pastel palettes are common in lifestyle apps.
- **Local holidays:** 農曆新年, 中秋, 雙11 shopping. Use them only for seasonal sets.

## Transcreation examples

| English | 繁體中文 | Note |
|---|---|---|
| Track every expense | 每筆花費，**輕鬆**記下 | 花費 sounds more Taiwanese than 支出 here |
| Sleep better tonight | 今晚**好好睡**一覺 | — |
| Get fit at home | 在家也能**練出好體態** | 體態 is a popular TW fitness word |
| Your money, organized | 收支狀況，**一目了然** | — |
| Learn English, 10 min a day | 每天{minutes}分鐘，**英文**越來越好 | 英文 (TW) vs 英语 (mainland) |
| Never miss a bill | 繳費期限，**準時提醒** | 繳費 is the TW term for paying bills |
| Edit like a pro | 修出**專業級**質感 | 質感 resonates in TW |
| Plan your week | 一週行程，**井井有條** | 一週 / 行程 are TW usage |
| Share with friends | 一鍵分享到 **LINE** | only if the integration exists |
| Video editor | 影片剪輯，**超簡單** | 影片 (TW) vs 视频 (mainland) |
| Free to start | **免費**開始使用 | — |
| Your data is safe | 資料**安全**，隱私有保障 | 資料 (TW) vs 数据 (mainland) |

## Pitfalls

- **Mainland vocabulary after conversion:**

  | Mainland term | Taiwanese term | Meaning |
  |---|---|---|
  | 視頻 | 影片 | video |
  | 軟件 | 軟體 | software |
  | 網絡 | 網路 | internet |
  | 信息 | 資訊/訊息 | information/message |
  | 質量 | 品質 | quality |
  | 屏幕 | 螢幕 | screen |
  | 默認 | 預設 | default |
  | 文件 | 檔案 | file |
  | 激活 | 啟用 | activate |
  | 用戶 | 使用者/用戶 | user (both acceptable, 使用者 more formal) |

- **Simplified quotes “ ”** or Simplified characters left in mock UI.
- **Political sensitivity:** avoid political symbols, flags and maps. Use neutral region naming, and follow the app's existing approach.
- **The Fair Trade Act (公平交易法)** and consumer protection rules target misleading superlatives and "免費" claims. Health-food efficacy claims are regulated.
- **Japanese kanji shapes** or SC fonts rendering Traditional text.
