---
id: fr-FR
name: French
appStore: fr-FR     # App Store Connect / fastlane deliver code
play: fr-FR         # Google Play / fastlane supply code
dir: ltr            # rtl for ar-SA and he
---

# French (France)

French readers expect correct typography and elegant, economical phrasing. Translated English sticks out through punctuation spacing, anglicisms and gender agreement.

## Voice and register

- **"vous" is the safe default** in French store copy. It is not cold in French; it is normal, polite and friendly. Use it for finance, health, productivity, education and anything aimed at adults.
- **"tu" fits** youth-targeted social, gaming, dating and some fitness brands. Use it only if the app's French UI already says *tu*.
- **The French escape hatch: infinitive or noun headlines that need no pronoun at all.** "Suivre ses dépenses, simplement", "Vos finances, enfin claires", "Moins d'écran, plus de sommeil". They sidestep the tu/vous decision and read natively.
- **Tone:** tasteful, a little wit, never shouting. French copy prizes *la formule*, a well-turned phrase, over the American hard sell. Puns (*jeux de mots*) work well when written natively.
- Avoid "Nous" as the subject in headlines. Imperatives ("Découvrez", "Organisez") are acceptable but less elegant than nominal forms.

## Typography rules

- **Non-breaking space before ; : ! ?** and inside guillemets: « Bonjour », Prêt ? C'est parti !
  - Use U+202F (narrow) where the font supports it, otherwise U+00A0.
  - A line starting with "?" or "!" is the classic broken-French tell.
- **Quotes:** « … » with spaces inside; “ … ” only for nested quotes.
- **Accented capitals keep their accents:** "À", "É", "ÉTÉ", "ÇA" (Académie française). Avoid all-caps anyway.
- **Sentence case only.** Never Title Case French headlines.
- **Numbers:**
  - "4,99 €" with a non-breaking space before €; "10 000" with a narrow NBSP for thousands; "50 %" with an NBSP.
  - Times "21 h 30" (formal) or "21h30" (UI). Ordinals "1er", "2e".
- **Apostrophe:** use the curly ’ ("l’appli", "aujourd’hui"). Elision is mandatory: "l'application", "d'abord".
- **Line breaks:** don't end a line on a short function word (à, de, le, la, un, en); bind it to the next word with an NBSP. Never separate a number from its unit.

## Length

- Expect **+15–25% characters** versus English, mostly from articles and prepositions ("de la", "pour vos").
- Headline target ≤ 30 characters.
- Shorteners:
  - cut to a nominal headline ("Retrouvez toutes vos dépenses au même endroit" → "Vos dépenses, réunies")
  - prefer "appli" over "application" in casual brands
  - use "sans" constructions ("Sans pub", "Sans engagement")

## Store and search habits

- **Queries:** "suivi des dépenses", "budget", "compteur de calories", "jeûne intermittent", "musculation", "méditation", "recettes", "apprendre l'anglais", "liste de courses", "météo", "scanner pdf".
- **"gratuit" is a very common query modifier.** French users add it often, so "Gratuit" in a caption only works if it is true without a trial catch.
- **Contract language converts:** "Sans engagement" (no commitment) and "résiliable à tout moment" (cancel anytime) are culturally loaded with consumer trust, from telecom marketing. Use them if the subscription terms allow.
- **Origin and privacy:** "Conçu en France" or "Made in France" resonates when true. Mention RGPD (GDPR) compliance and EU data hosting for finance and health.
- **Local reference style:** French market leaders keep captions short and conversational, often in nominal form, with refined palettes rather than loud badges.

## Transcreation examples

| English | Français | Note |
|---|---|---|
| Track every expense | Chaque dépense, **suivie** | nominal + participle, no pronoun needed |
| Sleep better tonight | Mieux **dormir**, dès ce soir | infinitive headline |
| Get fit at home | La **forme**, sans quitter la maison | "être en forme" idiom |
| Your money, organized | Vos finances, enfin **claires** | "enfin" adds relief |
| Learn English, 10 min a day | L'anglais en {minutes} min par **jour** | keep the real duration in a placeholder |
| Never miss a bill | Plus aucune **facture** oubliée | — |
| Edit like a pro | Des retouches dignes d'un **pro** | "retouche" is the native photo term |
| Cancel anytime | **Sans engagement** | local contract phrase |
| Crush your goals | Atteignez vos **objectifs** | "écraser" would be absurd |
| Meal plans made easy | Les **menus** de la semaine, sans effort | "menus" is how French households plan |
| Ready? Let's go! | Prêt ? C'est **parti** ! | NBSP before ? and !; gendered "Prêt", so prefer "On y va ?" |
| Your pocket coach | Votre **coach** de poche | "coach" is accepted in French |

## Pitfalls

- **Missing NBSPs**, straight quotes, and English-style "Title Case" are instant tells.
- **False friends:**
  - *librairie* (bookshop), *location* (rental, not position: use "position" or "emplacement")
  - *actuellement* (currently), *éventuellement* (possibly), *sensible* (sensitive), *assister* (attend)
  - *achever* (finish), *réaliser* (achieve, not "realise"); "*customiser*" is an anglicism, so prefer "personnaliser"
- **Loi Toubon** requires French in commercial communication in France. English slogans need a French equivalent of equal prominence. Product names and trademarks are exempt; English taglines are not. Prefer "suivi" to "tracking", "astuces" to "tips", "partager" to "share".
- **Gender agreement** in "Prêt(e)", "Connecté(e)". Inclusive writing ("prêt·e") divides readers, so rephrase instead ("On y va ?", "Tout est prêt").
- **Over-formal MT style:** "Veuillez", "Il vous est possible de". Too long and bureaucratic.
- **Health claims** are regulated (ANSM/DGCCRF). Avoid "guérir" and guaranteed weight-loss claims.
