// Discover screens and rank them for marketing. Paywall/auth/settings are found but not shown.
import path from 'node:path';

const ROLE = [
  ['auth', /^(login|log-in|signin|sign-in|signup|sign-up|register|auth|otp|verify|forgot|password|reset)/i, -5],
  ['paywall', /(paywall|subscri|premium|upgrade|purchase|pricing|plans?view|pro(screen|view|page)?$)/i, -4],
  ['settings', /(settings|preferences|account|profile|about|legal|privacy|terms|help|support|faq|debug|dev|feedback)/i, -3],
  ['system', /(splash|launch|loading|error|notfound|not-found|\+not-found|empty|placeholder|webview|permission)/i, -5],
  ['onboarding', /(onboard|welcome|intro|walkthrough|tutorial|getstarted|get-started)/i, 0],
  ['core', /^(home|dashboard|today|main|feed|overview|index|summary|discover|explore|tabs?)($|[-_]?(screen|view|page))/i, 6],
  ['feature', /(detail|editor|edit|create|compose|player|camera|scan|chat|conversation|map|stats|statistics|progress|insight|analytics|report|history|calendar|schedule|library|collection|search|workout|meal|plan|budget|transaction|lesson|course|journal|entry|recipe|track|timer|session|result|preview|gallery|studio|generate|record|habit|goal|wallet|portfolio|card|cart|product|order|trip|booking)/i, 4],
];

export function run(ctx) {
  const { files, read, rel, profile } = ctx;
  const found = new Map();
  const add = (name, file, how) => {
    name = name.replace(/(Screen|View|Page|ViewController|Activity|Fragment|Route)$/,'') || name;
    if (!name || name.length < 2 || /^(Content|Root|App|Base|Main(Activity)?|Tab|Layout|Preview|Wrapper|Container|Modal|Sheet|Row|Cell)$/.test(name) && !/^(Main|Home)$/.test(name)) {
      if (!/^Main$/.test(name)) return;
    }
    const key = name.toLowerCase();
    if (found.has(key)) return;
    let role = 'other', score = 1;
    for (const [r, re, s] of ROLE) if (re.test(name) || re.test(path.basename(file).replace(/\.\w+$/, ''))) { role = r; score = s; break; }
    // Bigger files usually mean richer screens.
    const size = read(file).length;
    score += Math.min(3, size / 6000);
    found.set(key, { name, file: rel(file), how, role, score: Math.round(score * 10) / 10 });
  };
  for (const f of files) {
    const r = rel(f);
    if (/test|spec|preview|mock|stories|\.d\.ts/i.test(r)) continue;
    if (f.endsWith('.swift')) {
      const s = read(f);
      for (const m of s.matchAll(/struct\s+(\w+(?:Screen|View|Page))\s*:\s*View\b/g)) if (!/(Row|Cell|Button|Item|Label|Badge|Icon|Card|Chip|Header|Footer|Bar|Field|Modifier|Style|Shape|Background|Overlay|Preview|Component)View$/.test(m[1])) add(m[1], f, 'SwiftUI');
      for (const m of s.matchAll(/class\s+(\w+)ViewController\s*:/g)) add(m[1], f, 'UIKit');
    } else if (f.endsWith('.kt')) {
      const s = read(f);
      for (const m of s.matchAll(/@Composable\s+(?:internal\s+|private\s+)?fun\s+(\w+Screen)\s*\(/g)) add(m[1], f, 'Compose');
      for (const m of s.matchAll(/class\s+(\w+)(Activity|Fragment)\s*[:(]/g)) add(m[1], f, m[2]);
    } else if (f.endsWith('.dart')) {
      const s = read(f);
      for (const m of s.matchAll(/class\s+(\w+(?:Screen|Page|View))\s+extends\s+(?:Stateless|Stateful|Consumer|HookConsumer|Hook)?Widget/g)) add(m[1], f, 'Flutter');
    } else if (/\.(tsx|jsx|ts|js)$/.test(f)) {
      // expo-router: app/(tabs)/index.tsx → route
      const m = r.match(/^(?:src\/)?app\/(.+)\.(tsx|jsx|ts|js)$/);
      if (m && !/_layout|\+html|\+not-found|api\/|\.test/.test(m[1]) && profile.platform?.kinds?.includes('expo')) {
        const route = m[1].replace(/\([^)]+\)\//g, '').replace(/\/index$|^index$/, '') || 'home';
        const segs = route.split('/').filter((x) => !/^\[.*\]$/.test(x));
        add(segs.pop() || 'home', f, 'expo-router');
        continue;
      }
      if (/screens?\//i.test(r) && /Screen\.(tsx|jsx|ts|js)$/.test(f)) add(path.basename(f).replace(/\.\w+$/, ''), f, 'screens/');
      if (/(page|route)\.(tsx|jsx)$/.test(f) && /app\//.test(r) && profile.platform?.kinds?.includes('web')) add(path.dirname(r).split('/').pop() || 'home', f, 'next-app');
      const s = read(f);
      for (const mm of s.matchAll(/<(?:Stack|Tab|Drawer)\.Screen[^>]*name=["']([\w/-]+)["']/g)) add(mm[1], f, 'react-navigation');
    }
  }
  const list = [...found.values()].sort((a, b) => b.score - a.score);
  profile.screens = {
    total: list.length,
    marketing: list.filter((s) => !['auth', 'paywall', 'settings', 'system'].includes(s.role)).slice(0, 24),
    paywall: list.filter((s) => s.role === 'paywall').slice(0, 5),
    onboarding: list.filter((s) => s.role === 'onboarding').slice(0, 5),
    other: list.filter((s) => ['auth', 'settings', 'system'].includes(s.role)).slice(0, 10).map((s) => s.name),
  };
}
