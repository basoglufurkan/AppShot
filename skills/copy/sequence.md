# Writing the set as a story

A screenshot set is a short argument, read left to right and usually abandoned after shot 3. Each shot answers the next question a sceptical viewer would ask. Write those questions first, then the captions.

## The arc

| # | Job | Viewer's question | Formulas (`formulas.md`) | Typical layout |
|---|---|---|---|---|
| 1 | **Hook** | "What is this, and what do I get?" | 1 Outcome, 3 Pain → relief, 4 X without Y, category + twist | `hero-device`, `text-hero`, `tilted-device` |
| 2 | **Core value** | "Show me it working." | 2 Verb + object + benefit, 12 Effort minimiser | `device-top`, `zoom-callout` |
| 3 | **Top differentiator / 2nd reason** | "Why this one?" | 4 X without Y, 6 Contrast, 23 Named feature | `before-after`, `floating-cards` |
| 4–5 | **Key features** | "What else does it do for me?" | 2, 7 Number-led, 11 Consolidation, 21 Proof of craft | `feature-list`, `ui-pieces`, `notification-stack` |
| 6 | **Differentiator vs alternatives** | "Why not the app I already have?" | 4, 5 Identity, 18 Analogy, 24 Local anchor | `comparison`, `split-diagonal` |
| 7 | **Trust** | "Can I trust it?" | 13 Social proof (App Store only), 20 Zero list, 21 Proof of craft | `social-proof`, `review-quote`, `big-number` |
| 8 | **Close** | "Okay, anything else?" | 22 Benefit pair, 16 Future self, 25 Habit, 11 Consolidation | `screen-grid`, `trio-fan` |

- **Shot count** comes from the niche file (`shots` in its frontmatter).
- **Compressing to 5 shots:** hook → core value → differentiator → key feature → trust + close.
- **Extending to 10:** add features between 4 and 6, never extra hooks.
- **Store limits:** Apple allows up to 10 screenshots per device size, and Google Play up to 8 per device type.
- **Front-load.** Shots 1–3 must hold the top three install reasons on their own, because most viewers never swipe further (`hooks.md`). Shots 4+ serve people who are already interested and are looking for a reason to say yes.

## One question per shot

Before drafting, write the question chain. Example for a budgeting app:

1. Is this a budgeting app that does the work for me?
2. How does it know my spending?
3. Will it stop me paying late fees?
4. Can I save for something specific?
5. Can my partner and I share it?
6. Is my bank data safe?
7. Will I actually feel better about money?

If two shots answer the same question, merge them and free a slot for an unanswered one.

## Avoiding repetition

Keep a **word ledger** for each locale: every content word (nouns, verbs, adjectives) in the set's headlines.

- **No content word appears in more than one headline.** Two exceptions: the primary keyword (max 2 headlines) and the brand (0–1).
- **No two consecutive headlines** start with the same word or use the same formula.
- **Highlighted words are all different** and vary in type: an outcome, a number, a verb, a differentiator.
- **Vary sentence shapes.** A 6+ shot set has at least one noun phrase, one imperative, and one other shape (contrast, question, benefit pair).
- **Compare roots, not inflections.** In Turkish, *bütçe / bütçeni / bütçenle* are the same word. Likewise German cases and Slavic declensions.
- **Subheads have their own ledger,** and should not repeat the headline's words either.

## Keyword distribution

**Background:** third parties have reported since 2025 that Apple reads caption text from screenshots and uses it in search. Neither Apple nor Google has confirmed screenshot-text indexing; the evidence and its limits are in `skills/aso/caption-indexing.md`.

**Appshot's policy:** on iOS, treat captions as searchable metadata; on every store, write for humans first. A keyword that makes a caption worse never goes in.

Process:
1. **Take the per-locale keyword set** from the ASO plan (`skills/aso/`): one primary keyword, 3–6 secondary keywords and some long-tail phrases. Keywords are researched per locale, never translated.
2. **Put the primary keyword in shot 1 or shot 2's headline,** once, in its natural inflected form.
3. **Give shots 2–6 one secondary keyword each,** in the headline or the subhead, only where it fits that shot's job.
4. **Prefer synonyms that didn't fit the title, subtitle or 100-character keyword field.** Captions extend coverage; repeating the title adds little.
5. **Long-tail phrases belong in subheads:** "Shared budget for couples", "Ortak bütçe, partnerinle".
6. **Make captions OCR-friendly:**
   - live text, not lettering baked into illustrations
   - high contrast, correct spelling
   - no broken words, no stylised letter swaps ("Bu$get")
7. **Never:**
   - keyword strings ("Budget app expense tracker money manager")
   - keywords unrelated to the shot
   - competitor brand names
   - the primary keyword in every shot

Keyword map template (fill one per locale in the plan):

| Shot | Job | Headline | Keyword placed | Where |
|---|---|---|---|---|
| 1 | Hook | … | primary | headline |
| 2 | Core | … | secondary 1 | headline |
| 3 | Differentiator | … | secondary 2 | subhead |

## Locale adjustments to the order

The arc is universal; the order of shots 3–7 is not. Read the locale's "Store and search habits" section, then adjust:

- **DE, NL, SV:** privacy, no subscription or no ads earlier (shot 3–4). Sceptical audiences need trust sooner.
- **JA, KO, ZH:** proof (rankings, downloads, awards) earlier and denser, with more callouts per shot.
- **IN, ID, BR, MX, TR:** free value, offline use and data-lightness earlier. Price sensitivity shapes the decision.
- **AR, HE:** the whole set reads right to left. Mirror layouts and panoramic bridges, so shot 1 still begins the story.
- **Seasonal moments** (Ramazan, Black Friday, Tết, back to school) go in custom product pages, not in the evergreen order.

## Continuous and panoramic sets

- **Visual bridges** (a device or shape spanning shots 1→2) invite the swipe. Keep caption positions aligned so the bridge isn't fighting the text.
- **Split sentences across shots** ("Plan the week… / …and actually stick to it") only when each half stands alone, and never across shots 1→2, because shot 1 must be complete in search and in ads.
- **RTL locales** reverse both the bridge direction and the reading order.

## Worked example: budgeting app, 7 shots

Voice: friendly with a bold accent. Primary keyword EN "budget", TR "bütçe".

| # | Job | EN headline | TR headline | Keyword (EN / TR) |
|---|---|---|---|---|
| 1 | Hook | Budgeting on **autopilot** | **Otomatik** bütçe, sıfır uğraş | budget / bütçe |
| 2 | Core value | Every expense, **sorted** for you | Harcamaların **kendiliğinden** sınıflanır | expense tracker / harcama takibi |
| 3 | Differentiator | Bills on time, no **late fees** | Faturalar zamanında, **gecikme faizi** yok | bill reminder / fatura hatırlatıcı |
| 4 | Feature | Save for what **matters** | Hayalin için **biriktir** | savings goals / birikim |
| 5 | Feature | Share costs with your **partner** | Ev giderlerini **birlikte** yönet | shared budget / ortak bütçe (subhead) |
| 6 | Trust | Your bank data, **encrypted** | Banka verilerin **şifreli** | — |
| 7 | Close | Spend less, **worry** less | Paran düzende, **aklın** rahat | — |

- **Ledger check (EN):** budgeting, autopilot · expense, sorted · bills, time, late fees · save, matters · share, costs, partner · bank, data, encrypted · spend, worry. No repeats. Shapes: noun phrase, noun + participle, contrast, imperative, imperative, noun phrase, benefit pair.
- **Shot 6** requires verification (encryption in transit and at rest in the code or backend docs). Otherwise use the fallback "No ads, no data **selling**" / "Reklam yok, **veri** satışı yok".
- **Turkish shot 5** avoids *eşinle* (assumes marriage) and *partnerinle* (a loanword) by shifting to "birlikte".

## Worked example: home workouts, 6 shots

Voice: bold. Primary keyword EN "home workout", TR "evde spor".

| # | Job | EN headline | TR headline |
|---|---|---|---|
| 1 | Hook | Get **strong** at home | Evde spor, gerçek **sonuç** |
| 2 | Core value | A plan that **adapts** to you | Seviyene göre **değişen** plan |
| 3 | Differentiator | No gym, no **equipment** | Salon yok, **ekipman** yok |
| 4 | Feature | **{workouts}** workouts, all under 30 min | **{workouts}** antrenman, hepsi 30 dakikadan kısa |
| 5 | Feature | Progress you can **see** | Gelişimini **haftalık** izle |
| 6 | Trust / close | Loved by **{users}** home athletes | **{users}** kişi evde antrenman yapıyor |

- **Shot 4:** {workouts} is counted from the workout library, and "under 30 min" is verified against the duration fields.
- **Shot 6** needs the owner's verified user count, and is `skipOn: ["android"]` because Play images can't show user counts. The Play set, and any listing without verified numbers, uses the fallback: "Coached by certified **trainers**" / "Sertifikalı **antrenörlerle** hazırlandı" (only if the trainers appear in the app).
