# Brand voice

Captions should sound like the app the user is about to open. A playful set over a sober banking UI, or a clinical set over a cartoon UI, feels like a bait-and-switch. Derive the voice from evidence in the project, then write every locale in that voice.

## Step 1: collect evidence from the project

Score what you find during the scan; don't guess from the category alone.

| Signal | Where to look | What it suggests |
|---|---|---|
| UI strings | `Localizable.strings` / `.xcstrings`, `values/strings.xml`, `*.arb`, `en.json` / `tr.json`, i18n folders | Read 30–50 strings: tone, pronouns, contractions |
| Exclamation and emoji density | the same files | Many "!" or emoji → playful/friendly; none → premium/clinical |
| CTA labels | buttons in onboarding and paywall | "Let's go!" → playful/friendly · "Continue" → neutral · "Begin" → premium · "Proceed" / "Submit" → clinical/enterprise |
| Errors and empty states | error strings, empty-state views | Jokes ("Oops, the hamster fell asleep") → playful · plain instructions → clinical |
| Who speaks | strings with "we" / "I" / "you" | Brand-as-we → friendly · impersonal → clinical |
| Typography | theme files, font assets | Rounded (SF Rounded, Nunito, Quicksand) → playful/friendly · display serif (New York, Playfair, Canela) → premium · neutral grotesk/mono (Inter, IBM Plex) → clinical · heavy condensed (Anton, Bebas) → bold |
| Palette | theme/colour tokens | Saturated multi-colour → playful · muted neutrals + one accent → premium · white + blue/teal → clinical · black + neon/volt → bold · warm pastels → friendly |
| Imagery | assets, Lottie files, illustrations | Mascots/animations → playful · line icons → clinical · photography → premium |
| Price and audience | paywall config, product IDs, README | High-priced pro tool → premium/clinical · kids/casual → playful · medical/financial → clinical first |
| Existing marketing | store description, website, README tagline | Keep continuity unless it is clearly weak |
| Category default | `skills/niches/<niche>.md` | Tie-breaker only |

Give each voice 0–3 points per signal. The top score is the **primary voice**; the runner-up (if within 2 points) is the **accent**, e.g. "friendly with a bold accent". Record the evidence, so later locales and later runs make the same choice.

## Step 2: set the dials

Every voice is a position on five dials (1 = low, 5 = high). Use the dials to brief translators and to check a draft.

| Voice | Formality | Energy | Humour | Technicality | Warmth |
|---|---|---|---|---|---|
| Playful | 1 | 4 | 5 | 1 | 4 |
| Premium | 4 | 2 | 1 | 2 | 2 |
| Clinical | 4 | 1 | 1 | 4 | 2 |
| Friendly | 2 | 3 | 2 | 1 | 5 |
| Bold | 2 | 5 | 2 | 2 | 2 |

## Step 3: write in the voice

### Playful
- **Feels like:** a witty friend who's good at something. Game-like learning apps, social and casual tools.
- **Sentence shape:** short and rhythmic, with a surprising concrete detail. Wordplay only from shot 4 on, and only if it is transcreated per locale.
- **Highlight:** the fun or vivid word.
- **Do:**
  - personify lightly ("Your plants say thanks")
  - use sensory verbs (snap, zap, stick)
  - use onomatopoeia in JA/KO/TH, where it is native
- **Don't:**
  - puns in shots 1–3
  - sarcasm, or jokes about the user's failures
  - slang that dates in a season
  - more than one "!" in the set
  - emoji unless the UI uses them (never inside the highlight)
- **Examples:** "Vocab that **sticks**" / "Kelimeler **akılda** kalsın" · "Meal prep, minus the **mess**" / "Hazırlık tamam, **dağınıklık** yok" · "Your plants say **thanks**" / "Bitkilerin sana **teşekkür** ediyor"

### Premium
- **Feels like:** a calm expert with nothing to prove. Restraint is the signal.
- **Sentence shape:** short declaratives and noun phrases. A full stop at the end of every headline can work as a set-wide style ("Money, quietly handled.").
- **Highlight:** sparing. Fewer accented shots, or accent by weight instead of colour.
- **Do:**
  - one idea per shot, with generous whitespace
  - proof of craft (`formulas.md` #21)
  - precise, unhurried verbs
- **Don't:**
  - discount or "free" language
  - "!", emoji, hype adjectives
  - badges crowding the frame
  - three features in one caption
- **Examples:** "Money, **quietly** handled." / "Paran, **sessizce** yönetilir." · "Every detail, **considered**." / "Her ayrıntı **düşünüldü**." · "Just **focus**." / "Sadece **odak**."

### Clinical
- **Feels like:** a trustworthy professional (health, finance, security, B2B).
- **Sentence shape:** plain statements of what it does, plus the evidence.
- **Highlight:** the measurable thing or the safeguard.
- **Do:**
  - be exact (units, standards, data flows)
  - show real data screens
  - name certifications only when held (HIPAA, ISO 27001, KVKK compliance, SOC 2)
- **Don't:**
  - jokes, emoji or fear-mongering
  - "diagnose/cure/treat" language for non-medical apps
  - "doctor-approved" without a named, real basis (see `proof.md`)
- **Examples:** "Blood pressure, **tracked** daily" / "Tansiyonunuz her gün **kayıt** altında" · "Share reports with your **doctor**" / "Raporlarınızı **doktorunuzla** paylaşın" · "Encrypted **end to end**" / "Uçtan uca **şifreli**"
- **Turkish note:** clinical apps usually take *siz*, as in the examples above.

### Friendly
- **Feels like:** a helpful neighbour: warm, encouraging, never patronising.
- **Sentence shape:** second person, simple verbs, small wins.
- **Highlight:** the emotional payoff.
- **Do:**
  - reassure beginners
  - celebrate progress
  - use inclusive "together" framing
  - put the brand-as-we in subheads ("We'll remind you")
- **Don't:**
  - baby talk
  - "Don't worry, it's easy!" (patronising)
  - promising feelings the product can't deliver
- **Examples:** "Small steps, **real** progress" / "Küçük adımlar, **gerçek** ilerleme" · "Dinner, **together**, without the stress" / "Akşam yemeği **birlikte**, stres olmadan" · "We remind, you **relax**" / "Biz hatırlatırız, sen **rahat** ol"

### Bold
- **Feels like:** a coach or challenger brand: momentum and confidence.
- **Sentence shape:** imperatives, punchy fragments, strong verbs, true contrasts and numbers.
- **Highlight:** the verb or the number.
- **Do:**
  - lead with the result
  - keep energy rising shot to shot
  - use two-beat fragments ("Stop guessing. Start lifting.")
- **Don't:**
  - violent verbs that translate badly (crush, kill, destroy, dominate)
  - shaming the reader
  - ALL CAPS sentences
  - unsubstantiated "#1"
- **Examples:** "**Stronger** every week" / "Her hafta daha **güçlü**" · "Stop guessing. **Start** lifting." / "Tahmini bırak, **kaldırmaya** başla" · "Your pace, only **faster**" / "Senin tempon, daha **hızlı**"

## When voice and niche collide

| Combination | Resolution |
|---|---|
| Playful + finance or health | Keep the playfulness in visuals and shots 4+. Hook and trust shots go friendly-clinical. Never joke about losing money, illness or body image. |
| Premium + free/ad-supported | Keep the restraint; replace exclusivity with craft. Don't promise "exclusive" or "elite" to everyone. |
| Clinical + consumer wellness | Warm it to friendly-clinical: the same facts, said like a person. |
| Bold + mental health, grief, fertility | Never. Switch to friendly. |
| Kids' apps (any voice) | Talk to the parent: benefit to the child, reassurance to the adult. No dark patterns. |

## Voice across locales

The voice survives translation through **register choices**, not word-for-word tone. Use this map, and check each locale file's "Voice and register" section for the details.

| Voice | tr | de-DE | fr-FR | es-ES / es-MX | ja | ko | ru | zh |
|---|---|---|---|---|---|---|---|---|
| Playful | sen, colloquial OK | du, light | tu if UI uses it, else nominal | tú | casual + onomatopoeia | 해요체, 반말 only if UI | ты if UI | 你, slang sparingly |
| Friendly | sen | du | vous or nominal | tú | です/ます subheads | 해요체 | вы or nominal | 你 |
| Bold | sen, imperative | du, imperative | vous or nominal | tú | plain, short | noun endings | вы, imperative | 你, short |
| Premium | sen (siz for luxury/finance) | du (Sie for private banking) | vous | tú (usted for private banking) | taigen-dome | noun endings | вы | 您 or none |
| Clinical | siz | Sie | vous | usted where the UI uses it | です/ます | 합니다체 or 해요체 | вы | 您 |

Humour also changes shape across locales:
- **DE, NL, SV:** dry.
- **JA, KO, TH:** cute or onomatopoeic.
- **AR, HE:** warmth and directness.
- **ES, PT-BR, IT:** warm colloquial colour.
- If a joke needs explaining in a locale, drop it there and keep the benefit.

## Record the decision

Write the voice into the copy plan before drafting, so every shot and locale uses the same brief:

```
voice:
  primary: friendly
  accent: bold
  evidence: ["Let's go!" CTA, SF Rounded, mascot in onboarding, no "!" in errors]
  dials: {formality: 2, energy: 3, humour: 2, technicality: 1, warmth: 5}
  say: ["small steps", "together", "on your schedule"]
  avoid: ["crush", "ultimate", "!"]
  tr: sen
```

Check every final caption against the `say`/`avoid` lists and the dials. A caption that would need a different voice to sound right belongs to a different shot, or to no shot at all.
