---
id: ja
name: Japanese
appStore: ja        # App Store Connect / fastlane deliver code
play: ja-JP         # Google Play / fastlane supply code
dir: ltr            # rtl for ar-SA and he
---

# Japanese (日本語)

A high-value, iPhone-heavy market that expects polish, detail and reassurance. Japanese captions are short in characters but dense in meaning. A literal translation sounds robotic and cold.

## Voice and register

- **Omit "you".** あなた in a headline sounds distant or even confrontational. Japanese drops the subject; write the benefit directly: "毎日の支出を、かんたん記録".
- **Headline style:**
  - *taigen-dome* (体言止め, ending on a noun): "おうちで本格筋トレ"
  - a short plain phrase: "今夜から、ぐっすり"
  - *〜しよう* / *〜しませんか* for invitations
- **Subheads use です/ます** (polite, friendly). Don't mix plain and polite endings within the subheads of one set.
- **Tone:** gentle, reassuring, helpful. Japanese users want to know it is *安心* (safe, worry-free) and *かんたん* (easy).
- **Kawaii is legitimate.** Friendly characters, onomatopoeia (ぐっすり, さくさく, すっきり, ぱぱっと) and soft wording convert for consumer apps. Finance and business apps stay calm and trustworthy (信頼, 安心), with no cuteness overload.

## Typography rules

- **Set `lang="ja"`** so CJK fonts pick Japanese glyph shapes (Han unification: 直, 骨 and 今 differ between Japanese and Chinese fonts). Use Hiragino Sans, Noto Sans JP or another JP font; never a SC/TC font.
- **Full-width punctuation:** 、。！？「」『』（）. Headlines usually omit the final 。. 「」 is for quotes and UI labels, 『』 for titles.
- **Line breaking (kinsoku shori):**
  - No line may start with 、。」）ー ! ? or small kana (ゃゅょっァィ).
  - No line may end with 「（.
  - Break between phrases (文節), never inside a word. A bad break like "記/録" looks broken to every reader.
  - Use explicit breaks: "毎日の支出を、↵かんたん記録".
- **No spaces between Japanese words.** Latin words and numerals sit in the line; optional thin spacing around Latin is a typographic choice, so be consistent.
- **Numerals:**
  - Half-width Arabic digits ("3分", "1日5分").
  - Currency "480円" or "¥480".
  - Large counts use 万 ("{downloads}万ダウンロード").
- **Never use half-width katakana** (ﾊﾝｶｸ). Long vowel mark ー, wave dash 〜.
- **Script mix** (kanji for nouns, hiragana for softness, katakana for loanwords and emphasis) is a tone tool. Writing かんたん instead of 簡単 softens the line.

## Length

- **Character count is ~50–70% of English**, but each glyph is full-width, so visual width is similar.
- Plan **8–12 characters per line**, ≤ 2 lines, ≤ 16 characters total for the headline (the engine's `maxHeadline` for ja).
- Subheads: ≤ 30 characters.
- Over-long Japanese usually comes from translating every English word. Cut to the noun phrase that carries the benefit.

## Store and search habits

- **Queries mix kanji, katakana and hiragana:**
  - money: "家計簿" (household account book, a huge category), "節約", "ポイント"
  - health and fitness: "カロリー計算", "筋トレ", "ダイエット", "歩数計", "睡眠", "瞑想"
  - learning, food and everyday: "英会話", "レシピ", "献立", "天気", "日記"
  - Cover both kanji and kana variants in the keyword field; captions use the natural form.
- **Japanese screenshots are information-dense:** badges, callouts, small character mascots, and multiple feature points per shot are normal and expected. Minimalist Western sets can read as "not enough information". Keep one headline, but supporting callouts are welcome.
- **Social proof is powerful on the App Store:** "{downloads}万ダウンロード突破", "App Store {category}ランキング1位", "{award}受賞". These claims are heavily regulated (see Pitfalls), and Google Play images can't carry them at all, so the ja-JP Play set needs product-fact trust instead.
- **LINE is the dominant messenger.** "LINEで共有" and "LINE連携" are natural feature lines if real.
- **Payments and pricing:** carrier billing and paid apps are more accepted than in many markets. Users want transparent pricing: "基本無料" (free to start) and "広告なし" work in captions if accurate. Trial wording (無料体験) belongs on the paywall, not in screenshots.
- **Local reference style:** Zaim, Money Forward ME, Cookpad and Kurashiru use soft colours, rounded type, friendly illustration, several callouts per screen and clear 無料/安心 messaging.

## Transcreation examples

| English | 日本語 | Note |
|---|---|---|
| Track every expense | 毎日の支出を、**かんたん**記録 | かんたん in hiragana feels friendlier |
| Sleep better tonight | 今夜から、**ぐっすり** | onomatopoeia does the work |
| Get fit at home | おうちで**筋トレ** | おうち is a warm word for home |
| Your money, organized | お金の流れが**ひと目で** | idea shifted to "at a glance" |
| Learn English, 5 min a day | 1日{minutes}分で**英会話** | 英会話 (conversation) is the real desire |
| Never miss a bill | 支払い忘れを**ゼロに** | — |
| Edit like a pro | プロ級の**仕上がり** | "pro-level finish" |
| Plan your week | 1週間の献立を**自動**で | for food apps, 献立 (menu planning) is the core job |
| Lose weight fast | **無理なく**続く、健康習慣 | weight-loss promise replaced (薬機法 / 景表法 risk) |
| Stay close to friends | 友だちと、**もっと**近く | — |
| Free to start | **基本無料**ではじめる | standard, trusted wording |
| Your daily companion | 毎日の**相棒** | 相棒 = trusted partner |

## Pitfalls

- **Chinese glyph forms** from a wrong font or missing `lang="ja"`. Natives notice instantly.
- **MT stiffness:** あなたの〜 in every line, literal "あなたのお金を整理する", over-kanji'd text, mixed です/ます and plain endings.
- **No.1 claims** must have an objective basis and a visible source note (調査機関, 期間, 対象). The Consumer Affairs Agency actively enforces 景品表示法 against unfounded "No.1" displays. Use {rank} and {source} placeholders only with real data.
- **薬機法 (Pharmaceuticals and Medical Devices Act)** restricts efficacy claims for health and beauty: avoid "痩せる", "治る", "効く", "シミが消える". Fitness and beauty apps should talk about habits, tracking and routine.
- **Over-literal katakana** and wasei-eigo confusion. Check the term is what Japanese users actually say (スマホ not スマートフォン in casual copy).
- **Breaking words across lines.** Always check the rendered result.
