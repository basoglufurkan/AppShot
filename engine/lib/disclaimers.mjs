// Default disclosure lines for app previews. Apple: "If you display features that are only available through
// in-app purchase, or if your app uses a subscription model or requires login, you must disclose this" — in the
// footage or the end frame. Used only when plan.preview.disclaimer is not set; the developer should confirm the text.

const SUBSCRIPTION = {
  en: 'Some features require a subscription.',
  de: 'Einige Funktionen erfordern ein Abonnement.',
  fr: 'Certaines fonctionnalités nécessitent un abonnement.',
  es: 'Algunas funciones requieren una suscripción.',
  pt: 'Alguns recursos exigem uma assinatura.',
  it: 'Alcune funzioni richiedono un abbonamento.',
  nl: 'Voor sommige functies is een abonnement vereist.',
  ja: '一部の機能はサブスクリプションが必要です。',
  ko: '일부 기능은 구독이 필요합니다.',
  'zh-Hans': '部分功能需要订阅。',
  'zh-Hant': '部分功能需要訂閱。',
  ar: 'تتطلب بعض الميزات اشتراكًا.',
  he: 'חלק מהתכונות דורשות מינוי.',
  ru: 'Для некоторых функций нужна подписка.',
  pl: 'Niektóre funkcje wymagają subskrypcji.',
  sv: 'Vissa funktioner kräver en prenumeration.',
  id: 'Beberapa fitur memerlukan langganan.',
  hi: 'कुछ सुविधाओं के लिए सदस्यता आवश्यक है।',
  vi: 'Một số tính năng yêu cầu gói đăng ký.',
  th: 'ฟีเจอร์บางอย่างต้องสมัครสมาชิก',
};

const PURCHASES = {
  en: 'Offers in-app purchases.',
  de: 'Bietet In-App-Käufe.',
  fr: 'Propose des achats intégrés.',
  es: 'Ofrece compras dentro de la app.',
  pt: 'Oferece compras no app.',
  it: 'Offre acquisti in-app.',
  nl: 'Biedt in-app-aankopen.',
  ja: 'アプリ内課金があります。',
  ko: '앱 내 구입을 제공합니다.',
  'zh-Hans': '提供 App 内购买项目。',
  'zh-Hant': '提供 App 內購買項目。',
  ar: 'يتضمن عمليات شراء داخل التطبيق.',
  he: 'כולל רכישות בתוך היישום.',
  ru: 'Есть встроенные покупки.',
  pl: 'Oferuje zakupy w aplikacji.',
  sv: 'Erbjuder köp inuti appen.',
  id: 'Menawarkan pembelian dalam aplikasi.',
  hi: 'इन-ऐप खरीदारी उपलब्ध है।',
  vi: 'Có mua hàng trong ứng dụng.',
  th: 'มีการซื้อภายในแอป',
};

const pick = (table, locale) => table[locale] || table[String(locale).split('-')[0]] || table.en;

/** The disclosure the scanned app needs, or '' when nothing is sold. */
export function defaultDisclaimer(profile, locale) {
  const m = profile?.monetization || {};
  if (m.subscriptions) return pick(SUBSCRIPTION, locale);
  if ((m.sdk || []).length || (m.paywallScreens || []).length) return pick(PURCHASES, locale);
  return '';
}
