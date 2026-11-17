// Creative director: decides the App Store header / search results / universal assets from the app itself.
// Reads the scanned profile (niche, description, features), the screenshot plan (screens, hook, cards, theme)
// and the scene library (engine/scenes/*.mjs meta), and returns a plan.creative block plus the reasons.
// Explicit plan.creative settings always win over these decisions (see scripts/creative.mjs).

import { listIds, loadScene } from '../compose.mjs';
import { L } from './util.mjs';

const CALM = ['budget-expense', 'banking-payments', 'investing-crypto', 'meditation-mindfulness', 'mental-health-therapy', 'sleep-tracker', 'health-vitals',
  'medication-reminder', 'password-manager', 'vpn-security', 'bible-prayer', 'islamic-prayer', 'pregnancy-baby', 'period-fertility', 'mood-journal', 'yoga-pilates', 'business-invoice', 'quit-addiction'];
const LIVELY = ['casual-games', 'kids-learning', 'social-community', 'dating', 'music-streaming', 'video-editor', 'collage-story-maker', 'sports-scores', 'fashion-outfit', 'ai-video-generator', 'ai-music-voice'];
// Apps whose content is the product: in search a sliding strip of real screens says more than one device.
const CONTENT = ['recipes-meal-plan', 'travel-planner', 'photo-editor', 'ai-photo-editor', 'camera-filters', 'books-audiobooks', 'music-streaming', 'shopping-marketplace',
  'social-community', 'video-editor', 'collage-story-maker', 'casual-games', 'fashion-outfit', 'customization-widgets', 'podcast-stories', 'ai-avatar-headshot', 'ai-video-generator'];
const GAMES = ['casual-games'];
const VARIANTS = { 'language-learning': ['book', 'letters'], translator: ['book', 'letters'], 'podcast-stories': ['sound', 'voice'], 'ai-music-voice': ['sound', 'voice'], dating: ['chat', 'dating'], 'astrology-tarot': ['night-sky', 'constellation'] };

const words = (s) => String(s || '').replace(/\*\*|_/g, '').trim().split(/\s+/).filter(Boolean).length;

export async function sceneLibrary() {
  const out = {};
  for (const id of listIds('scenes')) out[id] = (await loadScene(id)).meta;
  return out;
}

/** Text the app says about itself — what the scene keywords are matched against. */
function corpus(plan, profile) {
  const bits = [profile?.app?.description, profile?.app?.name, profile?.app?.category, profile?.readme?.excerpt?.slice(0, 1500)];
  for (const f of profile?.features || []) bits.push(typeof f === 'string' ? f : `${f.label || f.id || ''} ${(f.benefitSeeds || []).join(' ')}`);
  for (const k of Object.values(plan.keywords || {})) bits.push(...k);
  for (const s of plan.shots || []) bits.push(L(s.headline, 'en-US'), L(s.subhead, 'en-US'));
  bits.push(L(plan.app?.subtitle, 'en-US'));
  return bits.filter(Boolean).join(' \n ').toLowerCase();
}

/** Rank scenes for this app: niche match first, then keywords found in the app's own words. */
export function rankScenes(lib, { niches, text }) {
  return Object.entries(lib).map(([id, m]) => {
    let score = 0;
    const why = [];
    niches.forEach((n, k) => {
      const pos = (m.niches || []).indexOf(n.id);
      if (pos < 0) return;
      const pts = (k === 0 ? 10 : 5) * (n.confidence ?? 1) * (1 - pos * 0.06);
      score += pts;
      why.push(`niche ${n.id}${k ? ' (runner-up)' : ''}`);
    });
    const hits = (m.keywords || []).filter((kw) => new RegExp(`(^|[^a-z])${kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}([^a-z]|$)`).test(text));
    if (hits.length) { score += Math.min(6, hits.length) * 0.9; why.push(`words: ${hits.slice(0, 5).join(', ')}`); }
    return { id, score: Math.round(score * 10) / 10, why };
  }).sort((a, b) => b.score - a.score);
}

/**
 * @returns {{ creative: object, scene: string, ranking: object[], reasons: string[] }}
 */
export async function direct({ plan, profile, locales }) {
  const lib = await sceneLibrary();
  const niches = (profile?.niche?.top || (plan.niche ? [{ id: plan.niche, confidence: 1 }] : [])).slice(0, 2);
  const niche = niches[0]?.id;
  const text = corpus(plan, profile);
  const ranking = rankScenes(lib, { niches, text });
  const reasons = [];
  const forced = plan.creative?.scene;
  let scene = forced && lib[forced] ? forced : ranking[0]?.score >= 2 ? ranking[0].id : 'icon-glow';
  if (forced) reasons.push(`Scene "${scene}" is set in plan.creative.scene.`);
  else if (scene === 'icon-glow') reasons.push(`No scene fits the niche "${niche || 'unknown'}" clearly, so the app icon is the hero (icon-glow).`);
  else reasons.push(`Scene "${scene}" (${lib[scene].name}) — ${ranking[0].why.join('; ')}. Runner-up: ${ranking[1]?.id} (${ranking[1]?.score}).`);
  const [vScene, variant] = VARIANTS[niche] || [];
  const v = vScene === scene ? variant : undefined;
  if (v) reasons.push(`Variant "${v}" suits ${niche}.`);

  const motion = CALM.includes(niche) ? 'calm' : LIVELY.includes(niche) ? 'lively' : lib[scene].mood === 'calm' ? 'calm' : 'gentle';
  reasons.push(`Motion "${motion}" — ${CALM.includes(niche) ? 'trust-first category, slow and premium' : LIVELY.includes(niche) ? 'playful category, more energy' : 'default pace'}; Apple asks for no quick cuts.`);

  const screens = [...new Set((plan.shots || []).flatMap((s) => [s.screen, ...(s.screens || [])]).filter((x) => typeof x === 'string'))];
  const n = Math.min(5, screens.length);
  const isGame = GAMES.includes(niche);
  const opts = (o) => Object.fromEntries(Object.entries(o).filter(([, x]) => x !== undefined));

  // Header: one clear idea for a first-time visitor; name, icon and subtitle sit right under it,
  // and iPhone crops the sides — so key art with a centred hero and no text.
  const header = isGame && n >= 3
    ? { layout: 'creative-stage', options: opts({ backdrop: scene, variant: v }), poster: 0.42 }
    : { layout: 'creative-scene', options: opts({ scene, variant: v, phrase: false }), poster: lib[scene].poster ?? 0.42 };
  reasons.push(header.layout === 'creative-scene'
    ? 'Header → animated key art (creative-scene): one idea, hero centred for the iPhone crop, no text because the name and subtitle are shown right below.'
    : 'Header → gameplay devices on the scene (creative-stage): for games the play itself is the idea.');

  // Search results: "state the obvious" and show the firsthand experience — it replaces the first screenshots.
  let search;
  if (!n) search = { layout: 'creative-scene', options: opts({ scene, variant: v, phrase: true }), poster: lib[scene].poster ?? 0.42 };
  else if (n >= 4 && CONTENT.includes(niche)) search = { layout: 'creative-carousel', options: opts({ backdrop: scene, variant: v }), poster: 0.42 };
  else search = { layout: 'creative-split', options: opts({ backdrop: scene, variant: v }), poster: 0.42 };
  reasons.push(search.layout === 'creative-carousel'
    ? `Search → sliding strip of ${n} real screens (creative-carousel) over the ${scene} ambience: the content is the product.`
    : search.layout === 'creative-split'
      ? `Search → phrase + real UI (creative-split) over the ${scene} ambience: the app's purpose is clear at a glance and the screens are firsthand experience.`
      : 'Search → key art with the phrase (no captures yet — add screens for a UI-first asset).');

  // Universal 16:9 serves both placements: UI for search, centred for the header crops.
  const universal = n ? { layout: 'creative-stage', options: opts({ backdrop: scene, variant: v }), poster: 0.42 } : { ...header };
  reasons.push(universal.layout === 'creative-stage'
    ? 'Universal 16:9 → centred fan of real screens on the scene (creative-stage): reads in both the 21:9 and 3:2 crops.'
    : 'Universal 16:9 → the same key art as the header.');

  // Phrase for search (and any layout showing text): the hook if it is short, else its shortest alternative ≤ 6 words.
  const hook = (plan.shots || [])[0] || {};
  const headline = {};
  for (const loc of locales || plan.locales || ['en-US']) {
    const cands = [L(hook.headline, loc), ...((hook.alternatives?.[loc]) || [])].filter(Boolean);
    const short = cands.find((c) => words(c) <= 6) || cands.sort((a, b) => words(a) - words(b))[0];
    if (short) headline[loc] = short;
  }
  const plain = (x) => String(x).replace(/\*\*|_/g, '');
  if (plan.creative?.headline) reasons.push(`Phrase → "${plain(L(plan.creative.headline, (locales || plan.locales || ['en-US'])[0]))}" (written in plan.creative.headline).`);
  else if (Object.keys(headline).length) {
    const first = Object.keys(headline)[0];
    reasons.push(`Phrase → "${plain(headline[first])}" (≤ 6 words, from the screenshot hook${headline[first] !== L(hook.headline, first) ? ' alternatives' : ''}).`);
  }

  const duration = motion === 'lively' ? 10 : motion === 'calm' ? 14 : 12;
  reasons.push(`Loop ${duration} s at 30 fps: long enough to cycle ${Math.max(1, n)} screen(s) slowly, inside Apple's 5–30 s.`);

  return {
    scene, variant: v, ranking: ranking.slice(0, 5), reasons,
    creative: { scene, motion, duration, fps: 30, screens: screens.slice(0, 5), headline, header, search, universal },
  };
}
