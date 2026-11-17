---
id: es-MX
name: Spanish (Mexico / Latin America)
appStore: es-MX     # App Store Connect / fastlane deliver code
play: es-419        # Google Play / fastlane supply code
dir: ltr            # rtl for ar-SA and he
---

# Spanish (México / Latinoamérica)

On the App Store, es-MX is the Spanish shown across most Latin American storefronts. On Play, es-419 is Latin American Spanish as a whole. Write **neutral Latin American Spanish** with a Mexican lean, and avoid slang that only one country understands.

## Voice and register

- **"tú" is standard** for consumer apps (delivery, e-commerce, social, fitness, education, wallets).
- **"usted" is more common than in Spain**: traditional banks, insurance, government, healthcare and apps for older users. Follow the app's UI.
- **Never "vosotros".** The plural "you" is *ustedes*, but address one person.
- **Tone:** warm, optimistic, family- and community-oriented, with gentle humour.
- **Mexican-only slang** (chido, padre, neta, güey, ahorita) is only for apps built for Mexico alone. For the whole region, prefer neutral words ("genial", "fácil", "sin complicaciones").
- Imperatives ("Ahorra", "Aprende", "Descubre") and benefit noun phrases ("Tu dinero, bajo control") both work.

## Typography rules

- **Opening ¿ and ¡ are mandatory**, as in all Spanish.
- **Sentence case.** Keep accents on capitals.
- **Number format differs from Spain:** Mexico uses a **decimal point and thousands comma** ("1,250.50").
  - "$" is ambiguous across the region (MXN, COP, CLP, ARS all use it). Avoid prices; if unavoidable, write "$199 MXN".
- **Time and dates:** times are often 12-hour in Mexico ("9:30 p. m."), 24-hour in UI. Dates "4 de noviembre".
- **Quotes:** “ ”. Line breaks: don't strand *de, la, el, y, en* at a line end.

## Length

- **+20–30% characters** versus English, similar to Spain.
- Headline target ≤ 30 characters.
- Shorten with:
  - noun phrases
  - "sin + noun" ("sin internet", "sin comisiones")
  - dropping "de manera fácil y rápida" padding
- "Aplicación" is long; "app" is fully accepted in LatAm marketing.

## Store and search habits

- **Android dominates the region.** The Play listing (es-419) often matters more than the App Store.
- **Queries:**
  - money and fitness: "app para ahorrar", "control de gastos", "presupuesto", "contador de calorías", "ejercicio en casa", "rutina de gym"
  - learning and home: "aprender inglés" (one of the region's biggest education intents), "recetas fáciles", "lista del súper"
  - tools: "editor de fotos", "escáner"
- **Data cost and device constraints:**
  - "Funciona sin internet", "app ligera" and "ahorra datos" are real selling points if true.
  - Mock data should look realistic on mid-range Android phones.
- **Money culture:**
  - Cash and transfers are common: Mercado Pago, SPEI transfers, OXXO cash payments in Mexico.
  - "Meses sin intereses" shapes e-commerce expectations.
  - Price sensitivity is high. "Gratis" and "sin comisiones" convert; misleading "gratis" draws PROFECO complaints and angry reviews.
- **Local reference style:** regional leaders (Mercado Libre, Rappi, Nu México, DiDi) use bright colours, friendly *tú* imperatives and very short headlines.

## Transcreation examples

| English | Español (LatAm) | Note |
|---|---|---|
| Track every expense | Controla cada **gasto** | "cada peso" works for MX/CO/CL/AR but excludes Peru (sol), Guatemala (quetzal) and others |
| Get fit at home | Ponte en **forma** desde casa | "desde casa" is very LatAm |
| Never miss a bill | Paga tus **recibos** a tiempo | Mexicans say "recibo" (de luz, de agua) for bills |
| Your phone, your rules | Tu celular, tus **reglas** | "celular", never "móvil" |
| Sleep better tonight | Duerme **mejor** desde hoy | — |
| Learn English fast | Aprende inglés **rápido** | keep the language explicit, as it is the search term |
| Save on every purchase | **Ahorra** en cada compra | — |
| Works offline | Funciona **sin internet** | data-cost benefit |
| Plan your week | Organiza tu **semana** en minutos | — |
| Split the bill | Divide la **cuenta** sin complicaciones | "sin broncas" is Mexican-only colloquial |
| Find an apartment | Encuentra tu **departamento** | "piso" is Spain; "apartamento" is used in CO/VE |
| Ready to start? | **¿Empezamos?** | avoids gendered "¿Listo?" |

## Pitfalls

- **Spain-isms:**
  - *móvil, ordenador, coche, piso*
  - *vale, guay, vosotros, zumo, gafas*
  - *coger*, which is vulgar in much of LatAm: use *tomar*, *agarrar*
- **One country's slang** shipped to twenty storefronts.
- **Number formats copied from Spain** (comma decimals) in mock UI.
- **Gendered reader adjectives** ("Bienvenido", "¿Listo?"). Rephrase neutrally.
- **Unsubstantiated superlatives and health claims** fall under PROFECO (consumer protection) and COFEPRIS (health) in Mexico, and similar agencies regionally.
- **Assuming cards.** Many users don't have international credit cards. Don't build the hook on "start your free trial" if trials need a card the audience may not have; lead with what's usable for free.
