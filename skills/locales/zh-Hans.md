---
id: zh-Hans
name: Chinese (Simplified)
appStore: zh-Hans   # App Store Connect / fastlane deliver code
play: zh-CN         # Google Play / fastlane supply code
dir: ltr            # rtl for ar-SA and he
---

# Chinese (Simplified, 简体中文)

App Store zh-Hans serves mainland China, which is a large, iPhone-rich storefront, plus Simplified readers elsewhere. **Google Play is not available in mainland China**, so Play zh-CN mainly reaches Singapore, Malaysia and the overseas diaspora. Android in China runs through local stores (Huawei AppGallery, Xiaomi, OPPO, vivo, Tencent), which are out of scope.

## Voice and register

- **Pronoun choice:** "你" is friendly and standard for consumer apps; "您" fits finance, healthcare, government and premium service. Headlines usually omit the pronoun entirely.
- **Rhythm matters.** Chinese ad copy loves balanced, parallel phrases and four-character expressions (四字词语): 轻松记账, 一目了然, 随时随地, 井井有条. Two short clauses split by a comma (今晚，睡个好觉) is the classic headline shape.
- **Tone:** confident, practical and benefit-dense. Internet slang (神器, 打卡, 种草, 干货) works for young consumer apps, but dates quickly. One slang word per set at most, and none in finance or health.
- **Be concrete:** name the scenario (通勤路上, 睡前, 周末) and the result.

## Typography rules

- **Full-width punctuation:** ，。！？：；、 and quotes “ ” (Simplified uses curly double quotes; 「」 is Traditional style). Headlines usually omit the final 。.
- **No spaces between Chinese characters.** Modern tech style adds a space between Chinese and Latin letters or digits ("支持 iCloud 同步", "每天 10 分钟"). Choose one convention and apply it across the set.
- **Line breaking:**
  - No line may start with ，。、！？：；）」.
  - Don't split a four-character phrase or a word (记/账).
  - Prefer an explicit break at the comma.
- **Fonts:** PingFang SC, Noto Sans SC / Source Han Sans SC. Set `lang="zh-Hans"` so glyphs use mainland forms. Never mix in Traditional characters or Japanese kanji forms.
- **Numbers:**
  - Arabic digits.
  - Large counts in 万/亿 ("{users}万用户", "{downloads}万次下载").
  - Currency "¥12" or "12元".

## Length

- **Character count is ~50–60% of English**, but glyphs are wide.
- Plan **6–10 characters per line**, ≤ 2 lines, ≤ 14 characters total for the headline (the engine's `maxHeadline`). Subheads ≤ 24 characters.
- Over-long Chinese comes from translating function words (的, 您的, 可以, 进行). Cut them: "可以轻松地进行记账" → "轻松记账".

## Store and search habits

- **Queries:**
  - money: "记账", "存钱", "预算"
  - health and fitness: "健身", "减肥", "热量", "计步", "睡眠", "冥想"
  - learning and productivity: "背单词", "英语", "待办", "日历", "笔记"
  - creative and other: "修图", "相机", "AI"
  - Short two- to four-character terms dominate.
- **Super-app context:** WeChat and Alipay mini-programs compete with standalone apps. Say why the app is worth installing (offline, widgets, privacy, depth).
- **Payments and ecosystem:** "微信登录", "支付宝" and "Apple 登录" are natural trust lines if real.
- **Mainland App Store distribution requires an ICP filing** (备案). Make sure the project has one before targeting the China storefront.
- **Screenshots are information-rich:** bold headline plus callouts and feature tags is normal. Red and gold read as festive and lucky; green and teal as health and finance.

## Transcreation examples

| English | 简体中文 | Note |
|---|---|---|
| Track every expense | 每一笔支出，**轻松**记录 | comma-split rhythm |
| Sleep better tonight | 今晚，**睡个好觉** | colloquial and warm |
| Get fit at home | 在家也能**练出好身材** | — |
| Your money, organized | 收支明细，**一目了然** | four-character idiom |
| Learn English, 10 min a day | 每天{minutes}分钟，**英语**看得见进步 | — |
| Never miss a bill | 账单到期，**准时提醒** | — |
| Edit like a pro | 一键修出**大片感** | 大片感 = cinematic look |
| Best budget app | 好用的**记账**神器 | "最好" is banned by the Advertising Law; 神器 is slang, so youth brands only |
| Plan your week | 一周计划，**井井有条** | — |
| Focus mode | 专注每一**分钟** | — |
| Sync everywhere | 多端**同步**，随时随地 | — |
| Private and secure | 数据**安全**，隐私无忧 | claim only what the code supports |

## Pitfalls

- **Advertising Law of the PRC** bans absolute terms: 最, 第一, 最佳, 顶级, 国家级, 极致, 100%. "全网第一" or "最好用的" can get the listing rejected and the developer fined. Rewrite as concrete benefits.
- **Traditional characters or Taiwanese vocabulary** leaking in: 軟體 vs 软件, 影片 vs 视频, 網路 vs 网络, 資訊 vs 信息, 帳號 vs 账号.
- **Japanese glyph shapes** from the wrong font.
- **MT tells:** 你的/您的 everywhere, "进行" + verb, long 的-chains, English word order.
- **Political sensitivity:** maps must follow mainland rules (borders, Taiwan, South China Sea). Avoid any political imagery or symbols.
- **Health claims** (治疗, 减肥保证) and financial return promises are regulated. Use habit and tracking language.
