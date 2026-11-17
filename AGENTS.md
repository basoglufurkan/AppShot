# Appshot — instructions for any coding agent (Claude Code, Codex, Cursor)

Appshot makes App Store and Google Play screenshots for the app in the current repository.
The full skill is `SKILL.md` in this folder; read it first. This file is the short version for agents that do not load
skills automatically.

## Setup (once)

- Node ≥ 22 and Google Chrome (or Chromium/Edge). No npm install — every script is dependency-free.
- `node <appshot>/scripts/doctor.mjs` checks the machine.
- Optional: `node <appshot>/scripts/install.mjs [--project <app>]` links the skill into `~/.claude/skills`,
  `~/.codex/skills` and, with `--project`, a Cursor rule.

## Run it inside the app repo

```bash
A=<path to this folder>
node $A/scripts/workspace.mjs init && node $A/scripts/scan.mjs .
node $A/scripts/niche.mjs --explain            # then read $A/skills/niches/<id>.md
node $A/scripts/brief.mjs                      # complete appshot/brief.md
node $A/scripts/keywords.mjs seed
# capture real screens into appshot/raw (see $A/skills/core/capture.md)
node $A/scripts/plan.mjs init                  # then write captions into appshot/plan.json
node $A/scripts/copy-check.mjs
node $A/scripts/render.mjs --draft && node $A/scripts/sheet.mjs --draft && node $A/scripts/score.mjs --draft
# LOOK at appshot/review/*.png, fix, repeat until ≥ 85 and clean
node $A/scripts/variants.mjs make --hooks && node $A/scripts/variants.mjs tournament
node $A/scripts/render.mjs && node $A/scripts/check.mjs && node $A/scripts/export.mjs --zip
```

## Rules

1. Real UI and real claims only — no invented ratings, awards, reviews or numbers.
2. Shots 1–3 carry the three strongest benefits; captions 2–6 words, one `**highlight**`.
3. Read `skills/locales/<id>.md` before writing any non-English caption; transcreate.
4. `copy-check.mjs` and `check.mjs` must pass; Google Play images carry no social proof, prices, "free" or CTAs.
5. Look at the rendered PNGs before declaring done.
6. Never edit the user's app source; write only in `appshot/`.

Knowledge: `skills/core` (method), `skills/niches` (69 playbooks), `skills/copy`, `skills/aso`, `skills/design`,
`skills/locales` (23 locales), `skills/review`. Examples of finished jobs: `examples/pulse/appshot/` (Expo) and `examples/penny/appshot/` (Flutter).
