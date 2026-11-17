// Capability signals from code, dependencies, permissions and entitlements.
// Each feature carries benefit seeds the copywriter can start from (never final copy).

export const FEATURES = [
  { id: 'ai', label: 'AI / LLM', re: /\b(openai|anthropic|gemini|generativeai|google-genai|gpt-4|gpt-5|gpt-4o|claude-|mistral|llama|ChatCompletion|chat\.completions|replicate|stability|elevenlabs|whisper|langchain|vercel\/ai|@ai-sdk|perplexity|groq|deepseek)\b/i, benefit: ['AI does the heavy lifting', 'Answers in seconds', 'Personalised by AI'] },
  { id: 'on-device-ml', label: 'On-device ML', re: /\b(CoreML|MLModel|VNCoreMLRequest|tflite|TensorFlowLite|mediapipe|MLKit|onnxruntime|FoundationModels|LanguageModelSession)\b/, benefit: ['Private, on-device intelligence', 'Works without the cloud'] },
  { id: 'healthkit', label: 'Apple Health / Health Connect', re: /\b(HealthKit|HKHealthStore|HKQuantityType|react-native-health|expo-health|health_connect|androidx\.health|HealthConnectClient|package:health)\b/, perm: ['NSHealthShareUsageDescription', 'NSHealthUpdateUsageDescription'], ent: 'healthkit', benefit: ['Syncs with Apple Health', 'All your health data in one place'] },
  { id: 'widgets', label: 'Home-screen widgets', re: /\b(WidgetKit|TimelineProvider|WidgetConfiguration|AppWidgetProvider|GlanceAppWidget|home_widget|react-native-widget-extension|expo-widgets)\b/, benefit: ['Glanceable widgets', 'Right on your Home Screen'] },
  { id: 'live-activities', label: 'Live Activities', re: /\b(ActivityKit|ActivityAttributes|LiveActivit)/, benefit: ['Live on your Lock Screen', 'Follow progress without opening the app'] },
  { id: 'watch', label: 'Apple Watch / Wear OS', re: /\b(WatchKit|WKApplication|WKInterfaceController|watchOS|WatchConnectivity|wear\.compose|androidx\.wear)\b/, benefit: ['On your wrist', 'Apple Watch app included'] },
  { id: 'siri', label: 'Siri & Shortcuts', re: /\b(AppIntent|AppShortcutsProvider|INIntent|SiriKit|INInteraction)\b/, ent: 'siri', benefit: ['Just ask Siri', 'Works with Shortcuts'] },
  { id: 'notifications', label: 'Reminders / push', re: /\b(UNUserNotificationCenter|UNNotificationRequest|expo-notifications|firebase_messaging|FirebaseMessaging|NotificationCompat|notifee|OneSignal|flutter_local_notifications)\b/, ent: 'push', benefit: ['Smart reminders that keep you on track', 'Never miss a beat'] },
  { id: 'camera', label: 'Camera', re: /\b(AVCaptureSession|AVCapturePhotoOutput|expo-camera|react-native-vision-camera|CameraX|camera: \^|package:camera|UIImagePickerController)\b/, perm: ['NSCameraUsageDescription'], benefit: ['Snap it, done', 'Point your camera and go'] },
  { id: 'scanner', label: 'Scan / OCR', re: /\b(VNRecognizeTextRequest|VNDocumentCameraViewController|VisionKit|DataScannerViewController|text-recognition|TextRecognizer|DocumentScanner|google_mlkit_text)\b/, benefit: ['Scan anything in seconds', 'Text recognised instantly'] },
  { id: 'barcode', label: 'Barcode / QR', re: /\b(AVMetadataObjectTypeQR|AVMetadataObject\.ObjectType\.(ean|qr)|mobile_scanner|BarcodeScanning|expo-barcode-scanner|barcode)\b/i, benefit: ['Scan a barcode, get everything'] },
  { id: 'maps', label: 'Maps & location', re: /\b(MapKit|MKMapView|CLLocationManager|react-native-maps|google_maps_flutter|expo-location|FusedLocationProvider|mapbox|maplibre)\b/i, perm: ['NSLocationWhenInUseUsageDescription', 'NSLocationAlwaysAndWhenInUseUsageDescription'], benefit: ['Everything on one map', 'Find it near you'] },
  { id: 'charts', label: 'Charts & insights', re: /\b(import Charts|Chart\s*\{|BarMark|LineMark|SectorMark|recharts|victory-native|fl_chart|MPAndroidChart|react-native-chart-kit|react-native-gifted-charts|syncfusion_flutter_charts|vico)\b/, benefit: ['See your progress at a glance', 'Insights that make sense'] },
  { id: 'sync', label: 'Cloud sync', re: /\b(CloudKit|NSPersistentCloudKitContainer|NSUbiquitousKeyValueStore|Firestore|FirebaseFirestore|cloud_firestore|supabase|Amplify|Realm\.Sync|PowerSync|convex)\b/i, ent: 'icloud', benefit: ['Synced across all your devices', 'Safe in iCloud'] },
  { id: 'offline', label: 'Local-first storage', re: /\b(SwiftData|@Model|NSPersistentContainer|CoreData|RoomDatabase|sqflite|drift|WatermelonDB|expo-sqlite|op-sqlite|isar|hive_flutter|MMKV)\b/, benefit: ['Works offline', 'Your data stays on your device'] },
  { id: 'privacy-lock', label: 'Face ID / biometric lock', re: /\b(LocalAuthentication|LAContext|BiometricPrompt|local_auth|expo-local-authentication|react-native-biometrics)\b/, perm: ['NSFaceIDUsageDescription'], benefit: ['Locked with Face ID', 'Private by design'] },
  { id: 'apple-sign-in', label: 'Sign in with Apple', re: /\b(ASAuthorizationAppleIDProvider|SignInWithAppleButton|expo-apple-authentication|sign_in_with_apple)\b/, ent: 'sign-in-with-apple', benefit: ['Start in one tap'] },
  { id: 'subscriptions', label: 'Subscriptions / IAP', re: /\b(RevenueCat|Purchases\.(shared|configure)|react-native-purchases|purchases_flutter|StoreKit|SKProductsRequest|Product\.products|react-native-iap|in_app_purchase|BillingClient|Superwall|Adapty|Qonversion|Glassfy|Apphud)\b/, benefit: [] },
  { id: 'share', label: 'Sharing / export', re: /\b(UIActivityViewController|ShareLink|share_plus|expo-sharing|Share\.share|Intent\.ACTION_SEND|UIDocumentPickerViewController|PDFKit|exportPDF)\b/, benefit: ['Share or export in one tap'] },
  { id: 'audio', label: 'Audio playback', re: /\b(AVAudioPlayer|AVPlayer|ExoPlayer|Media3|just_audio|audioplayers|expo-av|expo-audio|react-native-track-player|MPNowPlayingInfoCenter)\b/, benefit: ['Listen anywhere', 'Background playback'] },
  { id: 'voice', label: 'Speech / voice', re: /\b(SFSpeechRecognizer|AVSpeechSynthesizer|speech_to_text|flutter_tts|expo-speech|@react-native-voice|whisper|TextToSpeech|SpeechRecognizer)\b/, perm: ['NSSpeechRecognitionUsageDescription', 'NSMicrophoneUsageDescription'], benefit: ['Just say it', 'Hands-free with your voice'] },
  { id: 'video-edit', label: 'Video editing', re: /\b(AVMutableComposition|AVAssetExportSession|AVVideoComposition|ffmpeg_kit|ffmpeg-kit|VideoEditor|Transformer\b|CMTimeRange)\b/, benefit: ['Pro edits in a few taps'] },
  { id: 'photo-edit', label: 'Photo editing / filters', re: /\b(CIFilter|CIContext|CoreImage|GPUImage|MTKView|photo_editor|image_editor|react-native-image-filter|PHPickerViewController)\b/, perm: ['NSPhotoLibraryUsageDescription'], benefit: ['Studio-quality edits', 'One-tap filters'] },
  { id: 'ar', label: 'AR', re: /\b(ARKit|ARSCNView|RealityKit|ARView|ARCore|ViroReact|ar_flutter_plugin)\b/, benefit: ['See it in your space'] },
  { id: 'calendar', label: 'Calendar integration', re: /\b(EventKit|EKEventStore|CalendarContract|device_calendar|expo-calendar)\b/, perm: ['NSCalendarsUsageDescription', 'NSCalendarsFullAccessUsageDescription'], benefit: ['Works with your calendar'] },
  { id: 'payments', label: 'Payments', re: /\b(Stripe|PKPaymentRequest|ApplePayButton|GooglePay|Braintree|Adyen|PayPal|iyzico|Paddle)\b/, benefit: ['Pay in a tap'] },
  { id: 'banking', label: 'Bank connections', re: /\b(Plaid|PlaidLink|TrueLayer|Tink|Yodlee|Finicity|Salt\s?Edge|GoCardless)\b/, benefit: ['All your accounts in one place', 'Connect your bank securely'] },
  { id: 'crypto', label: 'Crypto / Web3', re: /\b(web3|ethers|viem|wagmi|walletconnect|@solana|bitcoinjs|WalletConnect)\b/i, benefit: [] },
  { id: 'chat', label: 'Messaging', re: /\b(StreamChat|stream-chat|Sendbird|socket\.io|SocketIO|GiftedChat|MessageKit|ExyteChat|ChatView|PubNub)\b/, benefit: ['Chat in real time'] },
  { id: 'video-call', label: 'Video calls / live', re: /\b(WebRTC|Agora|TwilioVideo|LiveKit|Daily\.co|ZoomVideoSDK|100ms)\b/i, benefit: ['Face to face, anywhere'] },
  { id: 'gamification', label: 'Streaks & achievements', re: /\b(streak|achievement|leaderboard|GameKit|GKLeaderboard|badgeUnlocked|xpPoints|levelUp)\b/i, benefit: ['Build a streak you will not break', 'Earn rewards as you go'] },
  { id: 'social', label: 'Social / community', re: /\b(followers|following|likeCount|commentCount|feedItem|friendRequest|leaderboard|community)\b/i, benefit: ['Do it together', 'Join the community'] },
  { id: 'translation', label: 'Translation', re: /\b(Translation\b|TranslationSession|MLKitTranslate|google_mlkit_translation|DeepL|translateText)\b/, benefit: ['Understand any language'] },
  { id: 'music-gen', label: 'Audio / music generation', re: /\b(suno|udio|musicgen|AudioKit|AVAudioEngine|AVAudioUnit)\b/i, benefit: [] },
  { id: 'smart-home', label: 'Smart home / IoT', re: /\b(HomeKit|HMHomeManager|Matter|CoreBluetooth|CBCentralManager|flutter_blue|react-native-ble|BluetoothGatt)\b/, perm: ['NSBluetoothAlwaysUsageDescription', 'NSHomeKitUsageDescription'], benefit: ['Control everything from one app'] },
  { id: 'screen-time', label: 'Screen Time / focus', re: /\b(FamilyControls|ManagedSettings|DeviceActivity|UsageStatsManager)\b/, ent: 'screen-time', benefit: ['Take back your time'] },
  { id: 'dark-mode', label: 'Dark mode', re: /\b(preferredColorScheme|colorScheme\s*==\s*\.dark|useColorScheme|isSystemInDarkTheme|ThemeMode\.dark|Appearance\.getColorScheme)\b/, benefit: ['Beautiful in light and dark'] },
  { id: 'onboarding-quiz', label: 'Personalisation quiz', re: /\b(quiz|questionnaire|goalSelection|personali[sz]ation|onboardingStep)\b/i, benefit: ['Built around your goals'] },
];

export function run(ctx) {
  const { files, read, rel, profile } = ctx;
  const src = files.filter((f) => /\.(swift|kt|kts|java|dart|tsx?|jsx?|m|mm|gradle|plist|json|yaml|yml|xml|entitlements|pbxproj)$/.test(f) && !/package-lock|yarn\.lock|pnpm-lock|Podfile\.lock|\.min\./.test(f)).slice(0, 6000);
  const hits = new Map();
  for (const f of src) {
    const s = read(f);
    if (!s) continue;
    for (const feat of FEATURES) {
      if (feat.re.test(s)) {
        const h = hits.get(feat.id) || { files: [], count: 0 };
        h.count++;
        if (h.files.length < 4) h.files.push(rel(f));
        hits.set(feat.id, h);
      }
    }
  }
  const deps = (ctx.dependencyNames || []).join(' ');
  const perms = new Set((profile.app.permissions || []).map((p) => p.key));
  const ents = new Set(profile.app.entitlements || []);
  const signals = new Set(ctx.signals || []);
  const out = [];
  for (const feat of FEATURES) {
    const h = hits.get(feat.id);
    let score = h ? Math.min(6, 1 + Math.log2(1 + h.count) * 1.5) : 0;
    const why = h ? [`${h.count} file(s): ${h.files.join(', ')}`] : [];
    if (feat.re.test(deps)) { score += 3; why.push('dependency'); }
    for (const p of feat.perm || []) if (perms.has(p)) { score += 3; why.push(`permission ${p}`); }
    if (feat.ent && ents.has(feat.ent)) { score += 3; why.push(`entitlement ${feat.ent}`); }
    if (signals.has(feat.id)) { score += 2; why.push('project setting'); }
    if (score > 0) out.push({ id: feat.id, label: feat.label, score: Math.round(score * 10) / 10, confidence: score >= 5 ? 'high' : score >= 2.5 ? 'medium' : 'low', benefitSeeds: feat.benefit, evidence: why });
  }
  out.sort((a, b) => b.score - a.score);
  profile.features = out;
  profile.monetization = {
    subscriptions: out.some((f) => f.id === 'subscriptions'),
    paywallScreens: (profile.screens?.paywall || []).map((s) => s.name),
    sdk: (ctx.dependencyNames || []).filter((d) => /revenuecat|purchases|superwall|adapty|qonversion|iap|billing|apphud/i.test(d)),
  };
}
