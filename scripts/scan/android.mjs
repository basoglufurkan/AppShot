// Android: manifest, gradle, strings.xml app name, permissions.
const PERM = {
  CAMERA: 'camera', ACCESS_FINE_LOCATION: 'location', ACCESS_COARSE_LOCATION: 'location', RECORD_AUDIO: 'microphone',
  ACTIVITY_RECOGNITION: 'activity', BODY_SENSORS: 'health', POST_NOTIFICATIONS: 'notifications', READ_CONTACTS: 'contacts',
  READ_CALENDAR: 'calendar', BLUETOOTH_CONNECT: 'bluetooth', USE_BIOMETRIC: 'biometrics', READ_MEDIA_IMAGES: 'photos',
};

export function run(ctx) {
  const { files, read, rel, profile } = ctx;
  const app = profile.app;
  for (const f of files.filter((f) => /AndroidManifest\.xml$/.test(f) && !/build\/|test/i.test(rel(f)))) {
    const x = read(f);
    const pkg = x.match(/package="([\w.]+)"/);
    if (pkg) app.packageName ||= pkg[1];
    for (const m of x.matchAll(/android\.permission\.(\w+)/g)) if (PERM[m[1]]) (app.androidPermissions ||= new Set()).add(PERM[m[1]]);
    if (/health\.READ|androidx\.health/.test(x)) (ctx.signals ||= []).push('healthkit');
  }
  for (const f of files.filter((f) => /build\.gradle(\.kts)?$/.test(f))) {
    const x = read(f);
    const id = x.match(/applicationId\s*=?\s*["']([\w.]+)["']/);
    if (id) app.packageName ||= id[1];
    const v = x.match(/versionName\s*=?\s*["']([\w.]+)["']/);
    if (v) app.version ||= v[1];
  }
  const strings = files.find((f) => /res\/values\/strings\.xml$/.test(f));
  if (strings) {
    const m = read(strings).match(/<string name="app_name"[^>]*>([^<]+)</);
    if (m) app.displayName ||= m[1].trim();
  }
  if (app.androidPermissions) app.androidPermissions = [...app.androidPermissions];
}
