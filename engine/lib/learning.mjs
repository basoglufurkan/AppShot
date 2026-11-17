// What real store tests taught us. Every Product Page Optimization (App Store) or store listing experiment (Play)
// result recorded with scripts/results.mjs is turned into evidence for the design traits that DIFFERED between the
// winner and the loser (tone, theme, opening layout, panorama, highlight style), per niche. The design director adds
// that evidence to its scores, so the next app in the same category starts from what actually converted.
// Stored per user, outside any repository: ~/.appshot/learning.json (or $APPSHOT_LEARNING).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readJson, writeJson, ensureDir, exists } from './util.mjs';

export const LEARNING_FILE = process.env.APPSHOT_LEARNING || path.join(os.homedir(), '.appshot', 'learning.json');

export function loadLearning(file = LEARNING_FILE) {
  return exists(file) ? readJson(file, { results: {}, niches: {} }) : { results: {}, niches: {} };
}

/** The traits of a plan that a test can credit. */
export function planTraits(plan, setTraits = null) {
  const t = {};
  if (typeof plan.theme === 'string') t.theme = plan.theme;
  if (setTraits?.tone) t.tone = setTraits.tone;
  t.opening = plan.shots?.[0]?.layout || 'hero-device';
  t.panorama = plan.panorama ? 'yes' : 'no';
  if (plan.themeOverrides?.highlight) t.highlight = plan.themeOverrides.highlight;
  return t;
}

/** How much a result counts: lift (capped at 30 %) × confidence (90 %+ counts fully, unknown counts a third). */
export function weight({ lift, confidence }) {
  const c = confidence == null ? 0.33 : confidence >= 90 ? 1 : confidence >= 80 ? 0.6 : 0.3;
  return (Math.max(-30, Math.min(30, lift)) / 30) * c;
}

/**
 * Fold one result into the store: features that differ between treatment and baseline get +w (treatment's) and −w
 * (baseline's). Idempotent per result id.
 */
export function learn(store, r) {
  if (store.results[r.id]) return false;
  store.results[r.id] = { niche: r.niche, lift: r.lift, confidence: r.confidence, at: r.recordedAt };
  const n = (store.niches[r.niche] ||= { tests: 0, features: {} });
  n.tests++;
  const w = weight(r);
  for (const key of new Set([...Object.keys(r.treatment.traits || {}), ...Object.keys(r.baseline.traits || {})])) {
    const a = r.treatment.traits?.[key], b = r.baseline.traits?.[key];
    if (a === b) continue;
    for (const [val, s] of [[a, w], [b, -w]]) {
      if (val === undefined) continue;
      const f = (n.features[`${key}:${val}`] ||= { score: 0, tests: 0, wins: 0 });
      f.score = Math.round((f.score + s) * 1000) / 1000; f.tests++; if (s > 0) f.wins++;
    }
  }
  return true;
}

export function saveLearning(store, file = LEARNING_FILE) {
  ensureDir(path.dirname(file));
  writeJson(file, store);
}

/** Prior for one feature in one niche, −0.6…0.6, with a sentence for the director's reasons (or null). */
export function prior(store, niche, key, val) {
  const f = store?.niches?.[niche]?.features?.[`${key}:${val}`];
  if (!f || !f.tests) return null;
  const p = Math.max(-0.6, Math.min(0.6, f.score * 0.4));
  if (Math.abs(p) < 0.03) return null;
  return { value: Math.round(p * 100) / 100, why: `learned: ${key} ${val} ${p > 0 ? 'won' : 'lost'} ${p > 0 ? f.wins : f.tests - f.wins} of ${f.tests} store test${f.tests > 1 ? 's' : ''} in this niche` };
}
