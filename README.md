# Café Apokalypso

A cozy-absurd café management soft-roguelite about running a small pixel café that slowly becomes relevant to mythological bureaucracy, AI prophecy, reality resets, and the postponement of minor apocalypses.

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

The long-term structure is soft-roguelite: café weeks act as repeatable runs, with KASSANDRA preserving fragments of memory, knowledge, and unlocks between unstable reality resets.

## Design Pillars

- cozy café first, apocalypse later
- small full pixel café as the emotional anchor
- main view as a light 3/4 café diorama, not a side view
- gradual escalation from normal to absurd
- micro-management that grows into macro-management
- dry, warm, understated humor
- data-driven content and systems

## MVP Scope

The MVP covers the first seven in-game days as the first playable café week / first soft-roguelite run.

Included:

- one café room in a 3/4 pixel-inspired view
- basic order flow, products, ingredients, supplies, money, reputation, cleanliness, stress, and hidden weirdness
- normal and subtly strange guests
- prices, daily offers, advertising, and temporary staff
- deterministic day modifiers, learned guest preferences, and KASSANDRA run fragments
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
- Day 3: prices, supplies, daily offers, and optional temporary help
- Day 4: advertising and first appearance of Herr Grau
- Day 5: stronger delegation pressure and first staff-flavored narrative beats
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
- `docs/art/` — visual review and approval sheets:
  - [`art/README.md`](docs/art/README.md) — overview of the art review system
  - [`art/CAFE_DIORAMA_DIRECTION.md`](docs/art/CAFE_DIORAMA_DIRECTION.md) — main 3/4 diorama visual direction
  - [`art/PILOT_ASSET_INTAKE.md`](docs/art/PILOT_ASSET_INTAKE.md) — pilot-asset intake/extraction plan and logs
  - [`art/VISUAL_STYLE_GUIDE.md`](docs/art/VISUAL_STYLE_GUIDE.md) — visual style guide
  - [`art/UI_STYLE_GUIDE.md`](docs/art/UI_STYLE_GUIDE.md) — UI style guide
  - [`art/CHARACTER_SHEETS.md`](docs/art/CHARACTER_SHEETS.md) — character sheets
  - [`art/LEVEL_SHEETS.md`](docs/art/LEVEL_SHEETS.md) — level/day sheets
  - [`art/ASSET_CATALOG.md`](docs/art/ASSET_CATALOG.md) — asset catalog and source notes
  - [`art/WEIRDNESS_ESCALATION_GUIDE.md`](docs/art/WEIRDNESS_ESCALATION_GUIDE.md) — weirdness escalation guide
  - [`art/ART_REVIEW_LOG.md`](docs/art/ART_REVIEW_LOG.md) — art review and approval log
- `QUALITY_CHECKLIST.md` — accessibility, security, save safety, smoke test, and release checks (binding for implementation)
- `WORKFLOW.md` — AI-assisted development workflow and handoff rules
- `AGENT_ORCHESTRATION.md` — AI tool roles and orchestration
- `PROMPTS.md` — canonical source for reusable handoff prompts
- `MANAGEMENT_TRADEOFF_DESIGN.md` — approved Week-1 management loop design (binding for implementation)
- `ROADMAP.md` — phases and long-term direction

## Workflow

Preferred AI-assisted roles:

- ChatGPT: concept, prompts, design consolidation
- Claude Code: documentation, architecture review, consistency checks
- Codex: implementation, tests, bugfixes, UI components

Tasks should stay narrow, documented, and include acceptance criteria before coding starts.
