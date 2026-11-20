# Proof: numbers and social proof, honestly

Proof is the most persuasive and the most dangerous caption type. A real number beats any adjective. An invented one can get the build rejected, the listing pulled, the developer fined, and the reviews filled with "liar".

**The rule:** never write a rating, count, award, press mention, testimonial or performance figure that the agent cannot trace to a source. Write a `{placeholder}`, fill it only from a verified source, and always write a no-claim fallback caption beside it.

## What counts as a real claim

| Claim | Valid source | How the agent gets it | Re-check |
|---|---|---|---|
| Store rating | App Store Connect / Play Console, or the public store page *for that storefront* | The owner supplies it, or it is read from the public listing | Before every export |
| Ratings count | Same as rating | Same | Before every export |
| Downloads / installs | App Store Connect (first-time downloads), Play Console (acquisitions) | The owner supplies it | Monthly |
| Users / active users | Product analytics (MAU, WAU) | The owner supplies it, with the metric named | Monthly |
| Awards and featuring | The award body's official notice (Apple Design Awards, App Store "App of the Day", Google Play "Editors' Choice", "Best of {year}") | The owner supplies a link or email | Once per year; drop stale years |
| Press | A published article with the exact quote | The owner supplies the URL | When the quote is reused |
| Testimonials | Public store reviews, or quotes with written permission | The owner supplies them, or the agent copies a public review verbatim | Keep a link |
| **Product facts** | **The repository itself:** seed data, content JSON, locale folders, feature flags, dependencies | **The agent verifies them directly** | On every build |
| Performance ("2× faster", "99% accurate") | A documented benchmark with its method | The owner supplies the report | Avoid unless documented |
| Scientific / medical ("clinically proven") | A peer-reviewed study *of this product* | Almost never available | Don't write it |

Product facts are the safest proof, and the agent can verify them itself:
- count workouts in `workouts.json` → `{workouts}`
- count locale folders → `{languages}`
- confirm the core flow makes no network calls → "Works **offline**"
- find no sign-up gate → "No account **needed**"

Record the file path you counted from in the copy plan.

## Placeholder vocabulary

Use these names so the agent and the owner fill them the same way: `{rating}` `{ratings_count}` `{downloads}` `{users}` `{reviews}` `{award}` `{award_year}` `{press_outlet}` `{press_quote}` `{countries}` `{languages}` `{years}` `{recipes}` `{workouts}` `{templates}` `{rank}` `{rank_source}`.

There are deliberately no price or trial placeholders. Prices, currency symbols and trial terms never go in screenshots; they belong on the paywall (Apple 2.3.7; `copy-check` errors on prices).

- **Never render an unfilled placeholder.** At export, every proof caption either has verified values or is replaced by its fallback. `copy-check` errors on any `{…}` left in a caption, and on any rating, award, quote or stat in the plan without a `source` field.
- **Round down to a meaningful threshold:** 12,480 becomes 12K+ / 1万人以上 / 1,2 Mio.+ (written per locale format; see the locale files).
- **Ratings:** use the value the store displays for that storefront, never higher. Don't put an App Store rating on Play, or a US rating on the German listing.
- **Match the noun to the metric.** Downloads ≠ users ≠ active users ≠ accounts. "{downloads}+ downloads" is not "{downloads}+ users".

## Wording by proof type

### Ratings
- **Show a rating only if** it is ≥ 4.5 *and* the count is substantial (hundreds or more) in the storefront being localised. "5.0 from 14 ratings" reads as fake.
- Good EN: "Rated **{rating}** by {ratings_count} people" · "**{rating}★** on the App Store"
- Don't:
  - stars with no number
  - laurel wreaths that imply an award
  - "5-star app"
  - review counts summed across stores or countries without saying so

### Users and downloads
- Good EN: "Join **{users}** home cooks" · "**{downloads}+** downloads"
- Don't: "Millions of users" without data, "fastest-growing", "everyone's favourite".

### Awards and featuring
- **Use the exact name, giver, level and year.** Winner ≠ finalist ≠ nominee, and "App of the Day" ≠ "Featured".
- Good EN: "**{award}** {award_year}" (e.g. "Apple Design Award Finalist 2025") · "Featured as **App of the Day**" · "**Editors' Choice** on Google Play" (only while it holds)
- **Artwork:** only official badge artwork, used under the award body's guidelines. Never recreate badges, and never use the Apple or Google Play logos as decoration.

### Press
- **"As seen in {press_outlet}"** requires real coverage. Quotes are verbatim and attributed. Outlet logos are trademarks: get permission or set the name in text.
- **Translating a press quote** for another locale is a translation, not a quote. Keep the original language, or label the translation in the subhead. Never "improve" the quote.

### Testimonials
- Real, verbatim (trimming is OK if the meaning doesn't change), and attributed by first name and initial or username.
- Taken from public reviews, or used with permission.
- Staff, friends and incentivised reviewers must be disclosed or excluded.
- Use the `review-quote` layout.
- Never write a "Sarah, 34" quote.

### Product facts
- Good EN: "**{recipes}** recipes, all under 30 min" (verify the duration field) · "Works **offline**" · "No account **needed**" · "**{languages}** languages"
- **Specificity is itself proof:** "Encrypted on your device" persuades where "Secure" doesn't.

## Store rules

The full rule text with sources is in `skills/aso/apple-rules.md` and `skills/aso/google-play-rules.md`. What it means for proof captions:

### Apple: proof is allowed when true
- **2.3.3:** every shot shows the app in use. A proof shot is a caption over real UI, or a `social-proof`/`review-quote` layout with the device present, never a bare text slide.
- **2.3.7:** no unverifiable claims, prices, trial terms or competitor names.
- **2.3.10:** no Android, Play badges or "Also on Android".
- **No Apple logos** or recreated Apple badges; no implied endorsement.

### Google Play: no social proof in images at all
- Play's graphic-asset rules exclude these from screenshots and the feature graphic:
  - ratings and star rows
  - review quotes and testimonials
  - user or download counts
  - accolades and awards
  - "#1/best/top" claims
  - price, promotion or "free" text
  - install CTAs
- Appshot enforces this: mark ratings, awards and testimonial shots `"skipOn": ["android"]`, and give the Play set a **product-fact trust shot** instead ("Works **offline**", "No account **needed**", "**{recipes}** tarif", where counts are verified product facts, not popularity).
- Proof can still live in the Play description, within the metadata policy.

### Law (summary; locale specifics are in each locale file's Pitfalls)
- **US:** the FTC Act (deceptive claims), the Endorsement Guides, and the 2024 FTC rule banning fake reviews and testimonials, with civil penalties.
- **EU:** the Unfair Commercial Practices Directive, as amended by the Omnibus Directive. Fake reviews are banned, and you must disclose whether and how displayed reviews are verified.
- **UK:** the DMCC Act 2024 bans fake reviews; the ASA/CAP Code governs claims.
- **Superlative claims by market:**
  - **DE:** UWG.
  - **JP:** 景品表示法 No.1 claims.
  - **KR:** KFTC.
  - **CN:** Advertising Law bans absolute terms.

## Decision flow

1. **Does this shot need proof?** The trust shot does. Any other shot only if a claim appears in it.
2. **Is there a verified source?** If yes, fill the placeholder and record `source` + `checked_on` in the plan. If no, go to 3.
3. **Can a product fact do the job?** (content counts, offline, no account, on-device data, made by credentialed experts who appear in the app.) If yes, use it.
4. **Otherwise, drop the proof** and write a benefit caption. Never fall back to "Join thousands" or "Loved by users".

Example pair, written together:
```
shot 6 · en   proof:    "Rated **{rating}** in {ratings_count} reviews"
              fallback: "No ads. No **data** selling."   (verified: no ad SDK, privacy policy)
```

## Freshness

- Ratings, counts and rankings decay. Re-verify at every export. A count that drops below its threshold removes the shot.
- Year-stamped awards ("Best of 2023") look stale after about 12 months. Move them to the subhead or retire them.
- Seasonal or ranking claims ("#1 in Health this week") never belong in the evergreen set.
