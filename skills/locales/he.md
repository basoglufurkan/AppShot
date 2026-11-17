---
id: he
name: Hebrew
appStore: he        # App Store Connect / fastlane deliver code
play: iw-IL         # Google Play / fastlane supply code
dir: rtl            # rtl for ar-SA and he
---

# Hebrew (עברית)

A tech-savvy, direct, iPhone-heavy market. Israelis are fluent in English tech vocabulary and allergic to fluff. Short, frank, slightly cheeky copy works; corporate translation doesn't.

## Voice and register

- **Informal, direct second person** is the norm. There is no formal/informal split as in European languages; register comes from word choice.
- **Hebrew verbs are gendered** (נהל masculine imperative, נהלי feminine). Israeli marketing has moved away from masculine-only address. Gender-inclusive options, best first:
  1. **Plural imperative or present** (very common in modern Israeli ads): "נהלו", "מתחילים", "חוסכים". It reads as inclusive and energetic.
  2. **Noun phrases:** "כל הוצאה בשליטה".
  3. **Infinitive:** "לנהל את הכסף בקלות".
  4. **The unvocalised possessive** "שלך", which is written the same for both genders ("הכסף שלך").
  - Avoid slash forms ("הורד/י") in headlines; they clutter display text.
- **Tone:** frank, confident, a bit of chutzpah and humour. Avoid hype adjectives. Israelis respond to "straight talk": the benefit, no decoration.

## Typography rules

- **RTL layout:** right-aligned, mirrored composition (device position, arrows, sequences). Panoramic sets must be mirrored, because the store carousel starts at the right in RTL locales.
- **No capitals, no niqqud** (vowel points) in marketing. Never letter-space Hebrew.
- **Prefixes attach to words** (ב, ל, מ, ה, ו, ש, כ). Before digits, Latin words and acronyms, use a maqaf or hyphen: "ב־5 דקות", "ל־iPhone", "ב־2026". Never break a line between the prefix and its word.
- **Abbreviations** use geresh and gershayim: ש״ח, צה״ל, ג׳ים. Quotes are "…" or „…".
- **Numbers and Latin inside RTL** need direction isolation (U+2068/U+2069) so "%", "+" and punctuation don't jump. Currency "₪49" or "49 ₪"; match the app.
- **Fonts:** SF Hebrew, Heebo, Assistant, Rubik, Noto Sans Hebrew. Make sure the Latin fallback matches the weight.

## Length

- **Hebrew is often compact,** because vowels are unwritten and prepositions attach, so many lines come out shorter than English. It varies with vocabulary, and the engine budgets +10% to be safe.
- Use the space for a larger font, not more words. Headline ≤ 4 words per line, ≤ 2 lines.

## Store and search habits

- **Users search in both Hebrew and English.** Many type English app or category names, so keywords need both scripts.
- **Common queries:**
  - money: "ניהול תקציב", "הוצאות"
  - health and fitness: "דיאטה", "כושר", "אימון בבית", "מדיטציה"
  - learning and food: "לימוד אנגלית", "מתכונים", "רשימת קניות"
- **Payments:** Bit and PayBox are the everyday P2P apps (trademarks; mention only if integrated). Israelis are price-sensitive about subscriptions; "חינם", "בלי פרסומות" and "בלי התחייבות" convert if true.
- **Calendar and lifestyle:** Shabbat and holidays (Rosh Hashanah, Pesach) affect food, scheduling and retail apps. Kosher matters for recipe and food-delivery apps targeting religious audiences.
- **Local reference style:** Israeli market leaders use punchy two-to-four-word headlines, bold sans type and a direct, witty tone.

## Transcreation examples

| English | עברית | Note |
|---|---|---|
| Track every expense | כל הוצאה **בשליטה** | noun phrase, gender-neutral |
| Sleep better tonight | הלילה ישנים **טוב** יותר | plural present = inclusive |
| Get fit at home | **כושר** בבית, בלי תירוצים | "no excuses" fits Israeli directness |
| Your money, organized | הכסף שלך **מסודר** | "שלך" works for both genders |
| Learn English | אנגלית **בביטחון**, כל יום | — |
| Never miss a bill | אף **חשבון** לא נשכח | — |
| Edit like a pro | עריכה **מקצועית** בנגיעה | — |
| Plan your week | השבוע **מתוכנן** בדקות | — |
| Split the bill | **מתחלקים** בחשבון בלי חישובים | plural present; playful |
| Start free | מתחילים **בחינם** | inclusive plural |
| Your data stays private | המידע שלך **פרטי** | — |
| Stay focused | **ריכוז** מלא, בלי הסחות | — |

## Pitfalls

- **Masculine-only imperatives** for a mixed audience, or slash forms cluttering a headline.
- **Bidi bugs:** "%" or "?" on the wrong side, reversed numbers, a prefix separated from its digit across a line break.
- **Biblical or formal register from MT** (e.g., "הנך מוזמן"). Modern Hebrew marketing is casual.
- **Arabic or wrong fallback fonts**, and missing geresh/gershayim (using an apostrophe ' instead of ׳).
- **Politics, military and religious imagery.** Keep it out unless the app is about them.
