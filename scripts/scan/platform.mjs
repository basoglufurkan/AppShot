// Detect the project stack(s). A repo can be several (e.g. Expo + native folders, KMP).
import path from 'node:path';

export function run(ctx) {
  const { files, rel, read, profile } = ctx;
  const names = new Set(files.map((f) => path.basename(f)));
  const relPaths = files.map(rel);
  const ev = [];
  const kinds = new Set();
  const pkg = files.find((f) => rel(f) === 'package.json');
  const pkgJson = pkg ? safeJson(read(pkg)) : null;
  const deps = { ...(pkgJson?.dependencies || {}), ...(pkgJson?.devDependencies || {}) };
  ctx.packageJson = pkgJson;
  ctx.deps = deps;

  if (deps.expo || names.has('app.json') && /"expo"/.test(read(files.find((f) => rel(f) === 'app.json')) || '')) { kinds.add('expo'); ev.push('expo in package.json/app.json'); }
  if (deps['react-native'] && !kinds.has('expo')) { kinds.add('react-native'); ev.push('react-native dependency'); }
  if (names.has('pubspec.yaml')) { kinds.add('flutter'); ev.push('pubspec.yaml'); }
  if (relPaths.some((p) => p.endsWith('.xcodeproj/project.pbxproj')) || names.has('Package.swift') && relPaths.some((p) => p.endsWith('.swift'))) {
    if (!kinds.has('expo') && !kinds.has('react-native') && !kinds.has('flutter')) { kinds.add('ios-native'); ev.push('Xcode project'); }
    else ev.push('native ios/ folder');
  }
  if (relPaths.some((p) => /AndroidManifest\.xml$/.test(p)) && !kinds.has('expo') && !kinds.has('react-native') && !kinds.has('flutter')) {
    kinds.add(relPaths.some((p) => p.includes('commonMain')) ? 'kmp' : 'android-native'); ev.push('AndroidManifest.xml');
  }
  if (!kinds.size && (deps.next || deps.react || deps.vue || deps.svelte || deps['@angular/core'] || names.has('index.html'))) {
    kinds.add('web'); ev.push(deps.next ? 'Next.js' : 'web framework');
  }
  if (deps['@capacitor/core'] || deps['@ionic/react'] || names.has('capacitor.config.ts')) { kinds.add('capacitor'); ev.push('Capacitor'); }
  const swiftFiles = relPaths.filter((p) => p.endsWith('.swift')).length;
  const swiftUI = files.filter((f) => f.endsWith('.swift')).slice(0, 400).some((f) => /import SwiftUI/.test(read(f)));
  profile.platform = {
    kinds: [...kinds],
    primary: [...kinds][0] || 'unknown',
    ui: kinds.has('flutter') ? 'flutter' : kinds.has('expo') || kinds.has('react-native') ? 'react-native' : swiftUI ? 'swiftui' : swiftFiles ? 'uikit' : kinds.has('android-native') ? 'android' : kinds.has('web') ? 'web' : 'unknown',
    stores: [
      ...(kinds.has('ios-native') || kinds.has('expo') || kinds.has('react-native') || kinds.has('flutter') || kinds.has('capacitor') || kinds.has('kmp') ? ['ios'] : []),
      ...(kinds.has('android-native') || kinds.has('expo') || kinds.has('react-native') || kinds.has('flutter') || kinds.has('capacitor') || kinds.has('kmp') ? ['android'] : []),
    ],
    evidence: ev,
    fileCount: files.length,
  };
}

export function safeJson(s) { try { return JSON.parse(s); } catch { return null; } }
