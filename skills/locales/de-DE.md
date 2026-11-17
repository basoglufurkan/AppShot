---
id: de-DE
name: German
appStore: de-DE     # App Store Connect / fastlane deliver code
play: de-DE         # Google Play / fastlane supply code
dir: ltr            # rtl for ar-SA and he
---

# German (Deutschland)

German readers reward precision and honesty and punish hype. The language also expands more than any other major locale, so this is where layouts break.

## Voice and register

- **"du" is the standard in consumer app marketing** (streaming, fintech, fashion, fitness, food delivery, games). Write it lowercase in ads ("dein Plan", "für dich"). The capitalised "Du" belongs to letters and looks dated or fussy in a headline.
- **Use "Sie"** for traditional banking, insurance, health and medical, legal/tax, B2B, and apps for older users. Check the in-app German strings: "Ihr Konto" means Sie.
- **Don't mix du and Sie.** Also avoid the generic-masculine "Nutzer" when addressing people; speak to the reader directly ("Für alle, die …", "Für dich").
- **Facts beat adjectives.** "Ausgaben automatisch kategorisiert" persuades; "Fantastisches Budgeting" does not. Germans read superlatives as a warning sign.
- **Nominal headlines are idiomatic and save the verb:** "Alle Ausgaben im Blick", "Training ohne Studio", "Datenschutz inklusive".
- **Privacy and control are emotional benefits here, not technical ones.** "Deine Daten bleiben auf deinem Gerät" can be a hook.

## Typography rules

- **Nouns are capitalised; everything else follows sentence case.** No English-style Title Case.
- **Quotes** are „…“ (low-high) in ads and UI. »…« appears in book typography. Never "…".
- **Gedankenstrich:** a spaced en dash ( – ), not an em dash.
- **Numbers and currency:** "4,99 €" (comma decimal, € after with a space), "1.000", percentages "50 %" (DIN 5008) or "50%" in tight display type, consistently. Dates "4. November" or "04.11."; times "21:30 Uhr".
- **ß stays ß** in de-DE: Spaß, groß, Straße (Swiss German uses ss; don't mix). In all-caps, "SS" is still the safest rendering; better to avoid all-caps.
- **Umlauts** must render as ä ö ü. "ae/oe/ue" is unacceptable in display text. Confirm font coverage.
- **Compound words:** never break with a visible hyphen in a headline. If wrapping is unavoidable, insert a soft hyphen (U+00AD) only at the compound seam ("Kalorien­zähler", "Haushalts­buch"), or restructure the phrase.

## Length

- Expect **+25–35% characters** versus English, more in UI-heavy phrases. One compound ("Ernährungstagebuch", 18 characters) can fill a line by itself.
- Keep the headline to **≤ 30 characters** where possible; two lines at hero size is the realistic maximum.
- Shrinking tactics:
  - drop the verb ("Behalte deine Ausgaben im Blick" → "Ausgaben im Blick")
  - use "im Griff", "auf einen Blick" and "ohne …" constructions
  - prefer a short Germanic word over a Latinate one ("klar" over "übersichtlich" when it fits)
  - move qualifiers to the subhead

## Store and search habits

- **Germans search with compounds:** "Haushaltsbuch", "Kalorienzähler", "Trainingsplan", "Vokabeltrainer", "Schrittzähler", "Intervallfasten", "Einkaufsliste", "Rezepte", "Fahrplan", "Wetter", "Meditation". English terms appear for newer categories ("Habit Tracker", "Budget App", "KI").
- Use the compound the searcher types at least once across the set, in natural form.
- **Business-model sensitivity is real.**
  - Phrases that convert in captions, only if true: "Einmalkauf", "ohne Abo", "werbefrei". Trial and cancellation terms ("kostenlos testen", "jederzeit kündbar") belong on the paywall, not in screenshots.
  - Subscription traps get called out in reviews.
  - Since 2022 German law requires an easy online cancellation button (Kündigungsbutton) for contracts made online, so users know they can cancel.
- **Privacy as conversion:** "DSGVO-konform", "Server in der EU" and "keine Weitergabe an Dritte" are strong trust-shot material, but only if technically accurate. Check the code (analytics SDKs, backend region) before claiming.
- **Local reference style:** German market leaders are clean and factual, with one claim per screen and frequent use of checkmark feature lists and privacy badges.

## Transcreation examples

| English | Deutsch | Note |
|---|---|---|
| Track every expense | Jede Ausgabe im **Blick** | nominal "im Blick" saves a verb |
| Sleep better tonight | Heute Nacht **besser** schlafen | infinitive headline is natural |
| Get fit at home | Fit werden – **zu Hause** | spaced en dash, not em dash |
| Your money, organized | Deine Finanzen, **aufgeräumt** | "aufgeräumt" = tidied, tangible |
| Crush your goals | Ziele **erreichen**, Schritt für Schritt | "crush" is too aggressive; steady progress |
| Never miss a bill | Keine **Rechnung** mehr vergessen | — |
| Edit like a pro | Bearbeiten wie die **Profis** | plural "die Profis" is idiomatic |
| Plan meals in minutes | Wochenplan fürs Essen in **Minuten** | "Essensplanung" is stiffer |
| Learn Spanish your way | Spanisch lernen, wie es **dir** passt | — |
| Focus without distractions | **Konzentriert** arbeiten, ohne Ablenkung | adjective + verb reads more natural |
| Your data stays yours | Deine Daten bleiben **deine** | strong as a hook in DE |
| Free forever | Dauerhaft **kostenlos** | only if literally true (UWG) |

## Pitfalls

- **False friends:**
  - *Gift* = poison (use *Geschenk*); *eventuell* = possibly; *aktuell* = current
  - *bekommen* = receive; *sensibel* = sensitive (emotional); *Chef* = boss
  - *Handy* = mobile phone, which is correct and expected
- **Denglisch overload** ("Tracke deine Workouts mit smarten Insights") sounds cheap outside youth fitness and gaming. One loanword per headline at most.
- **UWG (Gesetz gegen den unlauteren Wettbewerb):**
  - "Die beste App", "Nr. 1" or "Marktführer" are Alleinstellungsbehauptungen and need proof.
  - "Testsieger" requires a licensed test seal such as Stiftung Warentest.
  - "Kostenlos" must be fully true.
  - "Klimaneutral" claims are legally risky; avoid them.
- **Health claims** fall under the Heilmittelwerbegesetz (HWG). Fitness and diet apps must not promise to cure, treat or guarantee weight loss.
- **Gendering:** star or colon forms ("Nutzer*innen") divide readers. Avoid the issue by addressing "du" directly.
- **Literal word order** from MT ("Du kannst jetzt einfach planen deine Woche") and overuse of "einfach" in every line.
