#!/usr/bin/env node
// Scaffold appshot/brief.md from profile.json + the niche guide. The agent completes it (and asks the
// user only what the code cannot answer). Every caption must trace back to a line in this brief.
//   node scripts/brief.mjs [--force]

import path from 'node:path';
import { parseArgs, findWorkspace, readJson, exists, die, log } from '../engine/lib/util.mjs';
import { loadNiche, nicheKeywords } from '../engine/lib/niches.mjs';
import fs from 'node:fs';

const args = parseArgs();
const ws = findWorkspace(args);
const out = path.join(ws, 'brief.md');
if (exists(out) && !args.force) die('brief.md exists (use --force to regenerate the scaffold).');
const p = readJson(path.join(ws, 'profile.json'), null) || die('Run node scripts/scan.mjs first.');
const nicheId = p.niche?.chosen;
const niche = nicheId ? loadNiche(nicheId) : null;
const kw = nicheId ? nicheKeywords(nicheId) : { en: [], tr: [] };
const feats = (p.features || []).filter((f) => f.confidence !== 'low');
const bullet = (arr, fmt = (x) => x) => (arr?.length ? arr.map((x) => `- ${fmt(x)}`).join('\n') : '- (none found)');

const md = `# Brief — ${p.app?.name || 'App'}

> Scaffolded by Appshot from the code on ${new Date().toISOString().slice(0, 10)}. Lines marked **TODO** are for the agent
> to complete from the code and, only where the code cannot tell, from the user. Captions must trace back to this file.

## Facts from the code

- Platform: ${p.platform?.primary} (${p.platform?.ui}) → stores: ${(p.platform?.stores || []).join(', ') || '?'}
- Bundle / package: ${p.app?.bundleId || '—'} / ${p.app?.packageName || '—'} · version ${p.app?.version || '?'} · category ${p.app?.category || '—'}
- Locales in the app: ${(p.strings?.locales || []).join(', ') || '—'}
- Brand colours: ${p.colors?.primary || '—'} / ${p.colors?.secondary || '—'} (UI is mostly ${p.colors?.appearance || '?'})
- Icon: ${p.icon ? p.icon.source : 'not found'}
- Existing store text: ${p.store?.title ? `"${p.store.title}" — "${p.store.subtitle || ''}"` : 'none in the repo'}
- Niche: **${nicheId || 'unknown'}** (${(p.niche?.top || []).slice(0, 3).map((n) => `${n.id} ${n.score}`).join(', ')}) → read \`skills/niches/${nicheId}.md\`

### Capabilities detected (evidence in profile.json)
${bullet(feats, (f) => `${f.label} — ${f.confidence}${f.benefitSeeds?.length ? ` · seeds: "${f.benefitSeeds.join('", "')}"` : ''}`)}

### Screens worth showing (ranked)
${bullet((p.screens?.marketing || []).slice(0, 12), (s) => `${s.name} (${s.role}, ${s.file})`)}

### Value props the team already wrote (paywall / onboarding copy)
${bullet([...(p.strings?.paywall || []).slice(0, 15), ...(p.strings?.onboarding || []).slice(0, 10)], (t) => `"${t}"`)}

### Permission texts (they describe real features)
${bullet((p.app?.permissions || []).slice(0, 8), (x) => `${x.key}: "${x.text}"`)}

## Positioning — TODO

- **One line**: For <who>, <app> <does what> so they <outcome>. TODO
- **Who searches** (from skills/niches/${nicheId}.md → "The searcher", adapted to this app): TODO
- **The moment / job**: TODO
- **Main objection to kill**: TODO
- **Differentiator** (what this app does that the category usually does not — must be visible in a real screen): TODO

## Benefits ranked — TODO

| # | Benefit (user words) | Proof in the app (screen / feature) | Shot |
|---|---|---|---|
| 1 | TODO | TODO | 1 |
| 2 | TODO | TODO | 2 |
| 3 | TODO | TODO | 3 |

## Proof we can honestly use — ASK THE USER

- App Store / Play rating and count (exact, with date): TODO or "none"
- Awards, press, featured placements (with link): TODO or "none"
- Real numbers (users, recipes, workouts…) with source: TODO or "none"
- Review quotes we may reuse (author handle, store, date): TODO or "none"

## Keywords — TODO (skills/aso/keywords.md)

Seeds from the niche (en): ${kw.en.slice(0, 20).join(', ') || '—'}
Seeds from the niche (tr): ${kw.tr.slice(0, 12).join(', ') || '—'}

- Primary (put in shots 1–3 captions naturally): TODO
- Secondary: TODO

## Voice — TODO (skills/copy/voice.md)

Tone inferred from the UI strings: TODO (playful / premium / clinical / friendly / bold)

## Visual direction — TODO (skills/design/taste.md)

- Niche suggests themes: ${(niche?.data?.themes || []).join(', ') || '—'}; layouts: ${(niche?.data?.layouts || []).join(', ') || '—'}
- Brand fit: TODO (brand colour as accent? dark or light UI → which background contrasts?)
- Panorama: TODO (yes when 5+ shots share one story)

## Open questions for the user (max 3, ask once)

1. Languages / markets to ship first? (default: ${(p.strings?.locales || []).slice(0, 3).join(', ') || 'en-US'})
2. Any real rating, award or numbers we may show?
3. Anything that must NOT be shown (beta features, private data, competitors)?
`;
fs.writeFileSync(out, md);
log.ok(`brief.md scaffolded → ${path.relative(process.cwd(), out)}`);
log.info('Complete every TODO before writing captions.');
