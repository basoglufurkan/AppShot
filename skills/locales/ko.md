---
id: ko
name: Korean
appStore: ko        # App Store Connect / fastlane deliver code
play: ko-KR         # Google Play / fastlane supply code
dir: ltr            # rtl for ar-SA and he
---

# Korean (한국어)

Highly digital, design-literate users raised on super-apps like Toss, Kakao and Naver. Clean, confident and friendly copy wins. Stiff translation and spacing errors lose trust immediately.

## Voice and register

- **Friendly polite 해요체 (-요)** is the modern default for consumer apps: "오늘 밤은 푹 자요", "지출을 한눈에 봐요". Toss popularised this warm, plain, conversational style.
- **Headlines can use a noun ending or a truncated declarative**: "모든 지출, 한눈에", "홈트, 이제 쉽게". This is short and very common.
- **합니다체 (formal)** suits banking, insurance, government and B2B, but it is too stiff for lifestyle. **반말 (casual)** is only for youth/social/gaming brands whose UI already uses it.
- **Never "당신"** in marketing: it sounds confrontational or like a romantic drama. Omit the subject, or use the **내 (my) perspective**, which is very Korean: "내 돈 관리", "내 일정", "나만의 루틴".
- **Mix of Korean and English loanwords** (홈트, 루틴, 챌린지, AI) is natural for younger audiences. Keep it to one or two per line.

## Typography rules

- **Spacing (띄어쓰기) matters.** Korean uses spaces between words, and wrong spacing ("한눈에보기", "할수있어요") is the clearest non-native/MT tell. Particles attach (지출을, 나만의); dependent nouns are spaced (할 수 있어요).
- **Line breaking:** set `word-break: keep-all` (or equivalent) so lines break at spaces, never mid-word (syllable-level breaking splits words like 가계/부).
- **Punctuation** is Western-style (. , ! ?). Headlines usually omit the final period. Quotes are “ ” or ‘ ’.
- **Numbers:**
  - Arabic digits; currency "4,900원" or "₩4,900".
  - Large counts with 만/억 ("{users}만 명").
  - Times "오후 9:30" in UI.
- **Fonts:** Pretendard, Apple SD Gothic Neo, Noto Sans KR. Set `lang="ko"`. Avoid Chinese/Japanese fonts with Hangul fallbacks. Hanja should be essentially absent from consumer copy.

## Length

- **Character count is ~60–80% of English**; Hangul blocks are full-width.
- Plan **8–14 syllables per line**, ≤ 2 lines, ≤ 18 characters total (the engine's `maxHeadline` for ko).
- Over-long Korean comes from literal grammar ("~할 수 있습니다", "~하는 것이 가능합니다"). Replace with a short verb + 요 or a noun ending.

## Store and search habits

- **Queries:**
  - money: "가계부", "용돈기록", "지출 관리"
  - health and fitness: "다이어트", "식단", "만보기", "홈트", "운동 기록", "명상", "수면"
  - learning and productivity: "영어 회화", "단어 암기", "일정 관리", "메모", "투두"
  - creative: "사진 편집", "보정", "AI"
- **Android-heavy market.** Samsung is dominant and the Play listing matters a lot. ONE store exists, but Play and the App Store are primary.
- **Login and ecosystem cues build trust if real:** "카카오 로그인", "카카오톡 공유", "네이버 로그인", "토스 결제".
- **Social proof and rankings are popular** on the App Store ("누적 다운로드 {downloads}", "앱스토어 {category} 1위"). They need a real, verifiable basis (see Pitfalls). Play images can't show them, so the ko-KR Play set needs product-fact trust instead.
- **Benefit framing:** Korean users respond to "0원" ("수수료 0원", "광고 0개"), "무료로 시작", and specific time savings, but only if true.
- **Local reference style:** Toss, Kakao and Baemin use bold sans-serif type, generous white space, short friendly headlines and witty but clean copy.

## Transcreation examples

| English | 한국어 | Note |
|---|---|---|
| Track every expense | 모든 지출, **한눈에** | noun-ending headline |
| Sleep better tonight | 오늘 밤은 **푹** 자요 | 해요체; "푹" = soundly |
| Get fit at home | 집에서 하는 **홈트** | 홈트 is the everyday loanword |
| Your money, organized | **내 돈** 관리, 알아서 척척 | "your" becomes "my" (내), the Korean ad convention |
| Learn English, 10 min a day | 하루 {minutes}분 **영어 회화** | — |
| Never miss a bill | 납부일, 이제 **놓치지** 마세요 | — |
| Edit like a pro | 전문가처럼 **보정**해요 | 보정 = retouch, the native photo term |
| Plan your week | 일주일 계획, **간편하게** | — |
| Split the bill | 더치페이도 **간편하게** | 더치페이 is the everyday term |
| Stay focused | **집중**이 쉬워져요 | — |
| Free to start | **무료로** 시작하세요 | polite imperative |
| Your own routine | **나만의** 루틴 만들기 | 나만의 (my very own) is a strong Korean hook |

## Pitfalls

- **당신**, wrong spacing, and mixed 합니다/해요 within one set.
- **Literal MT grammar:** "당신의 돈을 관리하세요", "~하는 것을 도와줍니다". Rewrite to 내/나만의 + short verb.
- **Konglish misuse.** Check the loanword is what Koreans say (헬스 = gym, 핸드폰 = phone; "health app" ≠ "헬스 앱", which suggests a gym app).
- **"1위", "최초", "최고"** and download claims need objective grounds under the 표시·광고의 공정화에 관한 법률 (Fair Labeling and Advertising Act, enforced by the KFTC). Health and food efficacy claims are restricted.
- **Chinese or Japanese fonts** rendering Hangul, and Hanja-heavy formal vocabulary in consumer copy.
