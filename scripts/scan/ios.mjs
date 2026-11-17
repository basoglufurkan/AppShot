// iOS: Info.plist, pbxproj build settings, entitlements, usage descriptions, category.
import path from 'node:path';

const CATEGORY = {
  'public.app-category.healthcare-fitness': 'Health & Fitness', 'public.app-category.medical': 'Medical',
  'public.app-category.productivity': 'Productivity', 'public.app-category.finance': 'Finance',
  'public.app-category.education': 'Education', 'public.app-category.lifestyle': 'Lifestyle',
  'public.app-category.photography': 'Photo & Video', 'public.app-category.video': 'Photo & Video',
  'public.app-category.social-networking': 'Social Networking', 'public.app-category.utilities': 'Utilities',
  'public.app-category.travel': 'Travel', 'public.app-category.navigation': 'Navigation',
  'public.app-category.music': 'Music', 'public.app-category.news': 'News', 'public.app-category.weather': 'Weather',
  'public.app-category.food-and-drink': 'Food & Drink', 'public.app-category.shopping': 'Shopping',
  'public.app-category.business': 'Business', 'public.app-category.entertainment': 'Entertainment',
  'public.app-category.sports': 'Sports', 'public.app-category.books': 'Books', 'public.app-category.reference': 'Reference',
  'public.app-category.graphics-design': 'Graphics & Design', 'public.app-category.developer-tools': 'Developer Tools',
  'public.app-category.kids-games': 'Games', 'public.app-category.games': 'Games', 'public.app-category.puzzle-games': 'Games',
};

export function plistValue(xml, key) {
  const m = xml.match(new RegExp(`<key>${key}</key>\\s*<(string|true|false)\\s*/?>([^<]*)`, 'i'));
  if (!m) return undefined;
  return m[1] === 'string' ? m[2].trim() : m[1] === 'true';
}

export function run(ctx) {
  const { files, read, rel, profile } = ctx;
  const app = profile.app;
  const plists = files.filter((f) => f.endsWith('Info.plist') && !/Pods|Tests|Watch|Widget|Extension|Intents|Notification/i.test(rel(f)));
  const perms = [];
  for (const f of plists) {
    const x = read(f);
    const name = plistValue(x, 'CFBundleDisplayName') || plistValue(x, 'CFBundleName');
    if (name && !name.includes('$(')) app.displayName ||= name;
    const cat = plistValue(x, 'LSApplicationCategoryType');
    if (cat && CATEGORY[cat]) app.category ||= CATEGORY[cat];
    for (const m of x.matchAll(/<key>(NS\w+UsageDescription)<\/key>\s*<string>([^<]+)<\/string>/g)) perms.push({ key: m[1], text: m[2].trim(), file: rel(f) });
    for (const m of x.matchAll(/<key>CFBundleURLSchemes<\/key>\s*<array>([\s\S]*?)<\/array>/g)) {
      for (const s of m[1].matchAll(/<string>([^<]+)<\/string>/g)) (app.urlSchemes ||= []).push(s[1]);
    }
  }
  const pbx = files.filter((f) => f.endsWith('project.pbxproj'));
  for (const f of pbx) {
    const x = read(f);
    const bid = [...x.matchAll(/PRODUCT_BUNDLE_IDENTIFIER = "?([\w.-]+)"?;/g)].map((m) => m[1]).filter((b) => !/Tests|Widget|Extension|Watch|Intent|Notification|Clip/i.test(b));
    if (bid.length) app.bundleId ||= bid.sort((a, b) => a.length - b.length)[0];
    const ver = x.match(/MARKETING_VERSION = "?([\d.]+)"?;/);
    if (ver) app.version ||= ver[1];
    const dn = x.match(/INFOPLIST_KEY_CFBundleDisplayName = "?([^";]+)"?;/);
    if (dn) app.displayName ||= dn[1];
    const cat = x.match(/INFOPLIST_KEY_LSApplicationCategoryType = "?([\w.-]+)"?;/);
    if (cat && CATEGORY[cat[1]]) app.category ||= CATEGORY[cat[1]];
    for (const m of x.matchAll(/INFOPLIST_KEY_(NS\w+UsageDescription) = "([^"]+)";/g)) perms.push({ key: m[1], text: m[2], file: rel(f) });
    const target = x.match(/IPHONEOS_DEPLOYMENT_TARGET = ([\d.]+);/);
    if (target) app.minIOS ||= target[1];
    if (/TARGETED_DEVICE_FAMILY = "?1,2"?;/.test(x)) app.supportsIPad = true;
    if (/WidgetKit|\.appex/.test(x) && /Widget/.test(x)) (ctx.signals ||= []).push('widgets');
    if (/watchOS|WATCHOS_DEPLOYMENT_TARGET/.test(x)) (ctx.signals ||= []).push('watch');
  }
  for (const f of files.filter((f) => f.endsWith('.entitlements'))) {
    const x = read(f);
    const ent = [];
    if (/healthkit/.test(x)) ent.push('healthkit');
    if (/icloud-container|ubiquity/.test(x)) ent.push('icloud');
    if (/aps-environment/.test(x)) ent.push('push');
    if (/applesignin/.test(x)) ent.push('sign-in-with-apple');
    if (/application-groups/.test(x)) ent.push('app-groups');
    if (/family-controls/.test(x)) ent.push('screen-time');
    if (/homekit/.test(x)) ent.push('homekit');
    if (/siri/.test(x)) ent.push('siri');
    (app.entitlements ||= []).push(...ent.filter((e) => !(app.entitlements || []).includes(e)));
  }
  if (perms.length) app.permissions = dedupe([...(app.permissions || []), ...perms], (p) => p.key);
}

const dedupe = (arr, key) => [...new Map(arr.map((x) => [key(x), x])).values()];
export const _path = path;
