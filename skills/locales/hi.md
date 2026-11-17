---
id: hi
name: Hindi
appStore: hi        # App Store Connect / fastlane deliver code
play: hi-IN         # Google Play / fastlane supply code
dir: ltr            # rtl for ar-SA and he
---

# Hindi (हिन्दी)

The Hindi listing targets India's largest language group: an enormous, Android-dominant, extremely price-sensitive and fast-growing audience, many of them first-generation smartphone users. **Write the Hindi people speak, not textbook Hindi.** Everyday Hindi is full of English words, and "pure" Sanskritised Hindi reads like a government circular.

## Voice and register

- **"आप" (aap, respectful you)** is the standard in marketing.
  - "तुम" (tum) fits only youth, gaming or social brands with matching UI.
  - "तू" never.
- **Imperatives in the आप-form are gender-neutral and polite:** "बचत करें", "शुरू करें", "सीखें", "जानें". Use them freely.
- **Use the English loanwords everyday speakers use**, written in Devanagari: ऐप, मोबाइल, ऑनलाइन, रिचार्ज, बिल, फ़ोटो, एडिट, प्लान, बजट, डाइट, जिम, वर्कआउट, ऑफ़र.
  - Formal equivalents (दूरभाष, अनुप्रयोग, संपादन) sound bureaucratic.
  - *Hinglish* (Hindi with English words) is the mainstream ad voice in India.
- **Tone:** warm, aspirational, family-oriented, practical about money. "पैसे बचाएँ", "घर बैठे" and "आसानी से" resonate. Respect and trust words (भरोसा, सुरक्षित) matter.

## Typography rules

- **Devanagari needs proper shaping** (conjuncts like क्ष, त्र, श्र; vowel signs like ि that display *before* the consonant). Broken shaping shows detached matras or dotted circles (◌). Always inspect the rendered image.
- **Fonts:** Noto Sans Devanagari, Mukta, Hind, Poppins (Devanagari), Tiro Devanagari. Increase line-height (≥ 1.4) for matras above and below.
  - Don't letter-space.
  - Don't let an underline or highlight cut through the *shirorekha* (the top bar).
  - Highlight whole words only.
- **Punctuation:** the full stop is "।" (purna viram), usually omitted in headlines; ? and ! are Latin.
- **Nukta consistency:** ज़, फ़, ख़, ग़ (e.g., "ज़रूरत", "फ़ोन"). Use or omit them consistently across the set.
- **Numerals:** use Western digits (1 2 3), as in commerce. Indian digits (१ २ ३) are rare in apps. Use the Indian numbering system: "1 लाख", "10 करोड़" (lakh = 100,000; crore = 10 million). Currency "₹99".
- **No capitalisation** exists, so emphasis comes from weight, colour and size.

## Length

- Expect **+10–30% width** versus English. Postpositions (का, के लिए, में) add words.
- Headline target ≤ 4 words per line, ≤ 2 lines.
- Shorten by:
  - dropping "के माध्यम से" / "की सहायता से"
  - using the loanword when shorter (प्लान vs योजना)
  - preferring noun phrases ("हर ख़र्च का हिसाब")

## Store and search habits

- **Users search in English, in Romanised Hindi and in Devanagari** ("paise bachane wala app", "english bolna sikhe", "hindi me"). Keywords need all three forms; captions stay in clean Devanagari.
- **Common intents:**
  - money: पैसे बचाना, ख़र्च हिसाब
  - learning: English speaking, exam prep (sarkari naukri, UPSC, SSC)
  - health and fitness: diet plan, yoga
  - religious and astrology: horoscope (राशिफल), devotional apps
  - creative: photo/video editing, status videos
- **Android has roughly 95% share**, low-cost devices are common and data is precious: "कम डेटा", "हल्का ऐप", "ऑफ़लाइन भी चले".
- **UPI is ubiquitous** (PhonePe, Google Pay, Paytm). "UPI से पेमेंट" is a natural trust line if supported.
- **Extreme price sensitivity:** "मुफ़्त"/"फ्री", "₹1 में ट्रायल" style offers, and low regional pricing. Never show prices that will change.
- **Regional diversity:** Hindi does not reach Tamil, Telugu, Bengali or Marathi speakers, who often prefer English. Don't treat Hindi as "Indian".

## Transcreation examples

| English | हिन्दी | Note |
|---|---|---|
| Track every expense | हर ख़र्च का **हिसाब** | *हिसाब* (reckoning) is the everyday concept |
| Sleep better tonight | आज रात **सुकून** की नींद | *सुकून* = peace, emotional |
| Get fit at home | घर बैठे **फ़िट** रहें | idiom *घर बैठे* (from home) |
| Your money, organized | पैसों का **पूरा** हिसाब, एक जगह | literal "व्यवस्थित" is too formal |
| Learn English | **इंग्लिश** बोलें, बेझिझक | speaking is the real aspiration |
| Never miss a bill | बिल भरना अब **कभी** न भूलें | — |
| Edit like a pro | प्रो जैसी **एडिटिंग** | Hinglish is natural here |
| Save money every month | हर महीने **ज़्यादा** बचत | — |
| Works offline | बिना इंटरनेट भी **चले** | data-cost benefit |
| Plan your week | पूरे हफ़्ते की **प्लानिंग** मिनटों में | — |
| Start free | **मुफ़्त** में शुरू करें | — |
| Your data is safe | आपका डेटा **सुरक्षित** | — |

## Pitfalls

- **Sanskritised MT Hindi** (अनुप्रयोग, संपादित करें, उपयोगकर्ता) where people say ऐप, एडिट करें, यूज़र.
- **Broken Devanagari rendering** and inconsistent nukta.
- **Gendered verb forms aimed at the reader** ("करते हो/करती हो"). The आप imperative ("करें") avoids them.
- **ASCI (Advertising Standards Council of India)** requires substantiation for "No.1", "best" and comparative claims, plus disclosure on endorsements. Health claims are restricted (Drugs and Magic Remedies Act; AYUSH claims).
- **Real-money gaming promotion is banned** under the Online Gaming Act 2025. Fantasy and betting-style visuals are off-limits.
- **Religious imagery and cricket clichés** used decoratively. Use them only if central to the app.
