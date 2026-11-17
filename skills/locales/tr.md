---
id: tr
name: Turkish
appStore: tr        # App Store Connect / fastlane deliver code
play: tr-TR         # Google Play / fastlane supply code
dir: ltr            # rtl for ar-SA and he
---

# Turkish (Türkçe)

The owner's most important market. Write Turkish from scratch in Turkish: start from the benefit, not from the English sentence. A Turkish reader spots translated copy within one line, and it makes the app feel foreign and less trustworthy.

## Voice and register

- **Default to `sen`.** Consumer apps (delivery, e-commerce, social, games, fitness, productivity, education, wallets, lifestyle) speak to the user as *sen*. It reads warm and direct. *Siz* in a lifestyle app reads like a letter from the tax office.
- **Use `siz`** for retail banking, insurance, medical (appointments, lab results, telehealth), government, legal, B2B and apps for older users. Plural-polite imperatives: "Keşfedin", "Başlayın", "Hesabınızı yönetin".
- **Follow the UI.** The screenshot shows the app's own Turkish strings. If the UI says "Hesabınız" (siz), a caption saying "Paranı yönet" (sen) looks like it came from a different company. Read `tr.lproj/Localizable.strings`, `values-tr/strings.xml` or `tr.json` before choosing.
- **Never mix within a set or a sentence.** "Paranı kolayca yönetin" (sen possessive + siz imperative) is the single most common machine-translation giveaway.
- **Imperative is the natural headline.** "Harcamanı takip et", "Hedefine ulaş", "Planını yap". Turkish is verb-final, so the last word lands hardest: put the benefit there or right before the verb.
- **Nominal headlines are very Turkish and very short.** "Her kuruş kontrol altında", "Cebinde kişisel koç", "Reklamsız, sınırsız, Türkçe". Use them when a verb would add length without adding meaning.
- **"Your" is a suffix, not a word.** "Paran", "Bütçen", "Hedeflerin". Use "senin" only for contrast ("Senin verin, senin kuralların"). "Senin için" in every headline is translated copy.
- **Warmth, not hype.** Turkish copy can carry a little feeling ("aklın rahat", "keyifle", "içini ısıtan"). It cannot carry English superlatives ("inanılmaz", "muhteşem", "hayatını değiştir"). Avoid bureaucratic verbs: *gerçekleştir, sağla, mevcut, -mektedir, olanak tanır*.
- **Colloquial forms** ("Hadi", "bi' dene", "yok artık") work for youth, gaming and social brands. They date quickly and sound forced in finance or health. Use them only if the app's own UI talks that way.
- **We-voice** ("Senin için düşündük") is fine in a subhead. In a headline it wastes space; the user is the subject.

## Typography rules

- **Dotted and dotless I.** i ↔ İ, ı ↔ I. All-caps and lowercase transforms must run with Turkish casing (`lang="tr"`, `toLocaleUpperCase('tr-TR')`), so you get "KİŞİSEL", not "KISISEL". Never strip dots or cedillas from visible text.
- **Glyph coverage.** Check that the display font has İ ı Ğ ğ Ş ş Ç ç Ö ö Ü ü. Many decorative Latin fonts fall back to a system font for ğ/ş/İ, which puts a mismatched letter in the middle of the hero word. If the brand font fails, pick another font. Don't respell the word.
- **Sentence case by default**: "Paranı akıllıca yönet". Title Case ("Paranı Akıllıca Yönet") is an English habit, so use it only if the brand already does. Month and day names are capitalised in full dates ("4 Kasım", "Pazartesi").
- **Apostrophe before suffixes** on proper nouns, brands, abbreviations and numerals: "Instagram'da", "Spotify'dan", "PDF'e", "2026'da", "%50'ye". The suffix follows how the word is *said*: "Netflix'te", "iPhone'una" ("ayfon"), "Excel'e", "Apple Watch'a". Common nouns take no apostrophe ("uygulamada", "telefonunda").
- **When pronunciation is unclear** (AI: "ey-ay" or "a-ı"? an unfamiliar brand), avoid attaching a suffix. Use the postposition *ile* or restructure: "Yapay zekâ ile", "Apple Watch ile uyumlu", "Google Drive ile senkron".
- **Particles are separate words**, and spelling them wrong is the error natives notice most:
  - question particle: "Hazır mısın?", not "Hazırmısın?"
  - "de/da" meaning "also": "Sen de dene" (vs the locative suffix in "Evde dene")
  - conjunction "ki": "Öyle kolay ki"
- **Numbers:** the percent sign comes first ("%30"). Decimal comma, thousands dot: "1.250,90 TL". Currency is "149,99 TL" or "₺149,99", matching the UI. Time is "21.30" (TDK) or "21:30" (UI convention). Units take no period ("5 dk", "30 sn", "2 sa"). Keep number and unit together with a non-breaking space.
- **Quotes** are “…” with ‘…’ nested. No guillemets.
- **Circumflex**: be consistent with "zekâ" or "zeka". For finance, write *kâr* (profit). *Kar* means snow.
- **Exclamation marks**: at most one in the entire set. Turkish retail overuses "!" and it reads cheap. Never "?!".
- **Line breaks.** Never hyphenate a headline word. Turkish words are long ("kişiselleştirilmiş"), so rewrite instead of breaking. Keep *mi/mı* with its word and *ile/için/gibi* with the noun before them. Don't start a line with *ve, ile, için, de/da*.

## Length

- Turkish runs roughly 10–25% longer than English in characters, but often uses *fewer* words because suffixes absorb them: "in your pocket" becomes "cebinde". Layouts usually fail on one long word, not on word count: "kişiselleştirilmiş" (18), "düzenleyebilirsin" (17), "bildirimlerini" (14).
- Targets: headline ≤ 28 characters, ideally two lines of ≤ 14 (the tooling ceiling is `maxHeadline` 36). Subhead ≤ 60 characters.
- Shorteners that keep the meaning:
  - "kişiselleştirilmiş" → "sana özel"
  - "gerçek zamanlı" → "anlık", "canlı"
  - "Kolayca düzenleyebilirsin" → "Kolayca düzenle" (drop the *-ebil-* "can")
  - "hızlı bir şekilde" → "hızla"; "kolay bir şekilde" → "kolayca"
  - "… uygulaması" → delete it (the reader knows it is an app)
  - "… ile ilgili her şey" → "… hakkında her şey", or cut the phrase
  - "Tüm ihtiyaçların tek bir yerde" → "Hepsi tek yerde"

## Store and search habits

- **Real query shapes:** "harcama takibi", "gelir gider", "bütçe planlama", "kalori hesaplama", "evde spor", "adım sayar", "İngilizce öğren", "kelime ezberleme", "not defteri", "ajanda", "alışveriş listesi", "fotoğraf düzenleme", "yapay zeka", "namaz vakti", "kıble", "burç", "kahve falı", "YKS", "LGS", "KPSS", "kargo takip", "döviz", "altın fiyatları", "borsa". Loanwords people actually type: fitness, pilates, vpn, pdf, wallpaper.
- **Users often type without Turkish letters** ("ingilizce ogren", "harcama takibi"). Test both spellings in store search when you plan keywords, but captions always use correct Turkish.
- **Platform.** Android dominates, so the Google Play listing deserves the same care as the App Store, often more. iPhone owners skew higher-income, which makes iOS the place to test premium positioning.
- **Inflation shapes buying.** Prices in TRY and store price tiers change often. Users are very price- and subscription-sensitive.
  - Strong, honest levers: "ücretsiz", "reklamsız", "abonelik yok" / "tek seferlik ödeme" (only if true).
  - Use them on the App Store set. Google Play graphics restrict "ücretsiz/free" and promo wording, so the tr-TR Play set says it through the product ("Üyelik gerekmez", "İnternetsiz çalışır").
  - Cancellation terms ("istediğin an iptal") go on the paywall.
  - Never print a price in a screenshot. It will be wrong within months.
- **Money habits are local.** Saving in gold and foreign currency is mainstream. Budget and wallet apps that track "altın" and "döviz" should say so in a caption, because it is a real search and a real differentiator.
- **Trust signals:**
  - For foreign apps: "Tamamen Türkçe", "Türkçe destek".
  - Privacy: KVKK, "Verilerin cihazında kalır".
  - Integrations with Turkish banks or services, if real.
- **Local reference style.** Big Turkish consumer apps (Getir, Trendyol, Yemeksepeti, Papara, Hepsiburada) use short sen-imperatives, saturated colour and campaign words ("fırsat", "kampanya", "indirim", "kazan"). Subscription apps should borrow the brevity, not the discount-mall vocabulary.
- **Seasonal hooks:**
  - Ramazan: iftar and sahur features for food, health and religious apps.
  - Bayram, okula dönüş, and exam seasons such as YKS in June.
  - Retail says "Efsane Cuma" or "Kasım indirimleri", not "Kara Cuma".
  - Seasonal captions go in custom product pages or a short-lived update, never in the evergreen set.

## Transcreation examples

| English | Türkçe | Note |
|---|---|---|
| Track every expense | Her **kuruşu** takip et | "every penny" becomes *kuruş*, the native idiom |
| Take control of your money | Paranın **kontrolü** sende | "Paranı kontrol et" would mean "check your money" |
| Sleep better tonight | Bu gece **deliksiz** uyu | *deliksiz uyku* = sound, unbroken sleep |
| Get fit at home | Evde **forma** gir | idiom *forma girmek* |
| Split bills with friends | Alman usulü hesap, **tek dokunuşla** | "going Dutch" is *Alman usulü* in Turkish |
| Never miss a bill | Son ödeme gününü **kaçırma** | Turkish bills are framed by the *son ödeme tarihi* |
| Your money, organized | Paran düzende, **aklın** rahat | "X, organized" is stiff; peace of mind added |
| Learn English for real | Artık İngilizce **konuş** | idea shifted from learn to *speak*: the local pain is "anlıyorum ama konuşamıyorum" |
| Study smarter, not harder | Ezberleme, **anla** | *ezber* (rote learning) is the national study pain |
| Cook tonight, skip takeout | Bu akşam sipariş değil, **ev yemeği** | *ev yemeği* carries warmth the English lacks |
| Meditation for busy people | Yoğun günlerine bir **nefes** | "yoğun insanlar" sounds odd; reframed to busy days |
| Stop doomscrolling | Telefonda kaybolan saatleri **geri al** | no Turkish word for doomscrolling; describe the loss |
| Edit like a pro | Fotoğraflarına **usta işi** dokunuş | *usta işi* (master's work) beats a literal "profesyonel gibi" |
| Join {users} people | {users} kişi **zaten** kullanıyor | format {users} Turkish-style: "1,2 milyon", "850 bin" |

## Pitfalls

- **Machine-translation tells:**
  - "Senin için" or "sizin için" in every line
  - stacked *-ebilirsiniz*
  - "bir şekilde" adverbs
  - "deneyim" everywhere ("harika bir deneyim")
  - "sorunsuz", "kullanıcı dostu", "gerçekleştirin"
  - long possessive chains ("uygulamanızın ayarlarının")
  - English word order ("Yönet paranı kolayca")
- **False friends and calques:**
  - *kontrol et* = check. "Take control" is "kontrolü ele al" or "kontrol sende".
  - *aktüel* ≠ actual; *realize etmek* is a calque.
  - "Free yourself" ≠ "ücretsiz": *ücretsiz* means no cost; freedom is *özgür* or *serbest*.
  - "Smart" as *akıllı* on every screen is filler.
  - "Track" is *takip et*, not *izle* (watch).
  - "Organize" is *düzenle* or *toparla*.
- **Price words:** *ücretsiz* is neutral. *Bedava* is colloquial and fits playful brands, but cheapens premium ones.
- **Advertising law:** the Ticari Reklam ve Haksız Ticari Uygulamalar Yönetmeliği (Reklam Kurulu, Ticaret Bakanlığı) requires documented proof for "en iyi", "lider", "1 numara" and "Türkiye'nin en çok indirilen".
- **Free trials:** "Ücretsiz" must mean free. If the app has a paywall, don't call it free; trial terms ("7 gün ücretsiz dene") belong on the paywall, never in a screenshot.
- **Health claims:** don't say "zayıflatır", "tedavi eder" or "iyileştirir" for non-medical apps. Use "sağlıklı alışkanlık", "hedefine destek", "kendini daha iyi hisset".
- **Protected imagery:** keep Atatürk imagery and the Turkish flag out of commercial creative. Both are legally protected, and misuse draws backlash.
- **Restricted categories:**
  - Alcohol: advertising rules are strict, so keep drinks out of food and social screenshots for this locale.
  - Betting: only state-licensed operators are legal.
  - Avoid politics and decorative religious imagery.
- **Glossary drift.** The caption must use the exact term the Turkish UI shows: if the tab says "Hedefler", don't caption "Amaçlar". Users read caption and screen together.
- **Gender.** Turkish has no grammatical gender, so don't add any. "Annelere özel" when the app is for all parents shrinks the market.
- **Puns.** Never port an English pun. A native Turkish pun can work ("Falına bak, keyfine bak"), but only for playful brands, and never on the hook shot.
