# Café Apokalypso

A cozy-absurd solo management web game about running a small pixel café that slowly becomes relevant to mythological bureaucracy, AI prophecy, and the postponement of minor apocalypses.

## Demo

Playable browser demo: _coming soon_

Target URL after GitHub Pages setup:

```text
https://hhhhhhhhhhhh12.github.io/cafe-apokalypso/
```

The MVP runs as a static browser app: no backend, no accounts, no real AI API, local save only.

## Current Status

Early concept / pre-production.

Current goal: a portfolio-ready seven-day vertical slice that communicates the core identity of the game without pretending to be the full long-term version.

## Core Idea

You start with a seemingly normal small café: orders, prices, ingredients, cleaning, supplies, daily offers, and first advertising choices.

Over time, the café becomes stranger. Normal regulars give way to mythological edge cases, KASSANDRA-like business anomalies, apocalyptic bureaucracy, and increasingly unreasonable management problems.

The game shifts from early micromanagement to later macromanagement: hiring staff, delegating tasks, stabilizing the economy, expanding operations, and delaying the end of the world.

## Design Pillars

- cozy café first, apocalypse later
- small full pixel café as the emotional anchor
- main view as a light 3/4 café diorama, not a side view
- gradual escalation from normal to absurd
- micro-management that grows into macro-management
- dry, warm, understated humor
- data-driven content and systems

## MVP Scope

The MVP covers the first seven in-game days.

Included:

- one café room in a 3/4 pixel-inspired view
- basic order flow, products, ingredients, supplies, money, reputation, cleanliness, stress, and hidden weirdness
- normal and subtly strange guests
- prices, daily offers, advertising, and temporary staff
- KASSANDRA cash-register update
- local browser save and achievements
- first explicit apocalyptic hook at the end of day 7

Out of scope:

- backend, accounts, payments, real AI APIs
- multiple locations
- full mythology roster
- advanced animations/pathfinding
- long-term balancing

## Week-One Arc

- Day 1: core order flow and first coffee-machine anomaly
- Day 2: guest behavior differences
- Day 3: prices, supplies, and daily offers
- Day 4: advertising and first appearance of Herr Grau
- Day 5: temporary staff and first delegation
- Day 6: KASSANDRA update
- Day 7: busier café day, Frau mit rotem Regenschirm, and official apocalyptic letter

Every day should unlock or reveal something meaningful.

## Technical Direction

Planned MVP stack:

- Vite
- React
- TypeScript
- localStorage
- Vitest
- static hosting via GitHub Pages, Netlify, Vercel, or IONOS

The code should clearly separate game engine logic, structured game data, and React UI.

## Local Development

Install dependencies:

```bash
npm install
```

Start the local browser app:

```bash
npm run dev
```

Run the required checks:

```bash
npm run typecheck
npm run test
npm run build
```

The current app is an early placeholder shell. It includes a day-one state, resource HUD, placeholder 3/4 café area, action panel, and defensive localStorage reset flow.

## Documentation

Detailed project docs live in `docs/`:

- `PROJECT_CANON.md` — **first source of truth**: all agents and contributors read this first
- `DECISIONS.md` — binding design and technical decisions
- `GAME_DESIGN.md` — gameplay systems and player experience
- `MVP_SCOPE.md` — first vertical slice scope
- `DEMO_SCOPE.md` — browser-playable demo scope and goals
- `CONTENT_GUIDE.md` — tone, writing style, and example lines
- `TECH_ARCHITECTURE.md` — technical structure and constraints
- `ART_STYLEGUIDE.md` / `ART_PIPELINE.md` — visual direction and asset workflow
- `docs/art/` — character, level/day, UI, asset, moodboard, and weirdness-escalation review sheets for visual approval
- `QUALITY_CHECKLIST.md` — accessibility, security, save safety, smoke test, and release checks (binding for implementation)
- `WORKFLOW.md` — AI-assisted development workflow and handoff rules
- `AGENT_ORCHESTRATION.md` — AI tool roles and orchestration
- `PROMPTS.md` — canonical source for reusable handoff prompts
- `ROADMAP.md` — phases and long-term direction

## Workflow

Preferred AI-assisted roles:

- ChatGPT: concept, prompts, design consolidation
- Claude Code: documentation, architecture review, consistency checks
- Codex: implementation, tests, bugfixes, UI components

Tasks should stay narrow, documented, and include acceptance criteria before coding starts.
