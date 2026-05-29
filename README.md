# Café Apokalypso

A cozy-absurd solo management web game about building a small pixel café that slowly becomes relevant to mythological bureaucracy, AI prophecy, and the postponement of minor apocalypses.

## Play the Demo

Playable browser demo: _coming soon_

The MVP is intended to run directly in the browser with no login, no installation, no backend, and local browser save only.

Demo link target once GitHub Pages is enabled:

```text
https://hhhhhhhhhhhh12.github.io/cafe-apokalypso/
```

Demo screenshot or short gameplay GIF will be added here once the first playable build exists.

## Status

Early concept / pre-production.

The current goal is a portfolio-ready smoke-front MVP: a playable seven-day vertical slice that shows the core identity of the game without pretending to be the full long-term experience.

## Pitch

You start with a seemingly normal small café.

At first, the game is about direct café work: taking orders, preparing coffee, cleaning tables, managing supplies, adjusting prices, choosing small advertising actions, and trying not to lose money.

Then the café begins to behave strangely.

A customer pays with a coin that does not fit any accounting category. The cash register recommends offers for people with “long shadow histories.” A business analytics update called KASSANDRA classifies part of the customer base as “not clearly mortal.” Eventually, an official letter informs you that your café has been mistakenly registered as apocalyptically relevant caffeine infrastructure.

Café Apokalypso evolves from cozy micromanagement into absurd macromanagement: hiring staff, delegating tasks, managing advertising, stabilizing the economy, expanding operations, and delaying increasingly unreasonable end-of-world scenarios.

## Design Pillars

- cozy café first, apocalypse later
- small full pixel café as the main emotional anchor
- gradual escalation from normal guests to mythological/apocalyptic weirdness
- micro-management that grows into macro-management
- dry, warm, understated humor
- no real AI API in the MVP; KASSANDRA is a simulated in-game system
- data-driven content for guests, products, staff, events, upgrades, and achievements

## Main View

The main gameplay view is a small, full pixel café shown as a light 3/4 diorama.

It should feel like a concrete place the player owns and grows over time, not like a pure dashboard or spreadsheet. The starting café includes an entrance, queue area, counter, coffee machine, cash register, two tables, storage shelf, menu board, simple decor, and a window or street detail.

Side-view scenes are not the default gameplay camera. They may be used later for special missions, event scenes, basement encounters, backdoor deliveries, or rare apocalyptic incidents.

## MVP Scope

The MVP covers the first seven in-game days.

The MVP is distributed as a browser-playable static WebApp. The GitHub repository should make the playable demo easy to discover through a prominent README link, the repository website field, and a screenshot or short gameplay preview once available.

Included:

- one café room in a 3/4 pixel-inspired view
- seven playable in-game days
- basic order flow
- simple products and ingredients
- normal guests with different behavior
- subtly strange guests
- money, reputation, supplies, cleanliness, stress, and hidden weirdness
- prices, supplies, and daily offers
- advertising
- temporary staff
- KASSANDRA cash-register update
- local browser save
- achievements
- first explicit apocalyptic hook at the end of day 7

Out of scope for the MVP:

- real AI APIs
- backend
- accounts
- payments
- multiple locations
- full mythology roster
- advanced animations
- complex pathfinding
- full long-term balancing

## What You Can Try in the Demo

The playable demo should let visitors:

- serve guests across the first seven in-game days
- manage coffee, milk, pastries, money, cleanliness, stress, and hidden weirdness
- adjust prices, supplies, daily offers, and small advertising choices
- use temporary staff and experience the first step toward delegation
- notice the first strange hints beneath the normal café surface
- encounter the KASSANDRA cash-register update
- reach the first explicit apocalyptic hook at the end of day 7

## Week-One Arc

- Day 1: core order flow and first coffee-machine anomaly
- Day 2: guest behavior differences
- Day 3: prices, supplies, and daily offers
- Day 4: advertising and the first appearance of Herr Grau
- Day 5: temporary staff and first delegation
- Day 6: KASSANDRA update
- Day 7: busier café day, Frau mit rotem Regenschirm, and official apocalyptic letter

The first week should not feel slow. Every day introduces at least one meaningful mechanic, guest behavior, management option, upgrade, staff option, advertising option, or narrative anomaly.

## Technical Direction

Planned MVP stack:

- Vite
- React
- TypeScript
- localStorage
- Vitest for core game-system tests
- static hosting
- GitHub Pages, Netlify, Vercel, or IONOS for the public demo link

The architecture should separate:

- game engine logic
- structured game data
- React presentation/UI

The game should be playable without a backend. KASSANDRA and all AI-like behavior are simulated through authored text, deterministic rules, and controlled randomization.

## Documentation

Project documentation lives in `docs/`:

- `docs/DECISIONS.md` — binding design and technical decisions
- `docs/GAME_DESIGN.md` — gameplay systems and player experience
- `docs/MVP_SCOPE.md` — first vertical slice scope
- `docs/CONTENT_GUIDE.md` — tone, writing style, and example lines
- `docs/TECH_ARCHITECTURE.md` — technical structure and constraints
- `docs/WORKFLOW.md` — agent workflow and handoff rules
- `docs/ROADMAP.md` — development phases and long-term direction

## Development Workflow

The project is planned for an AI-assisted workflow.

Preferred roles:

- ChatGPT: concept development, prompt preparation, design consolidation
- Claude Code: documentation, architecture review, consistency checks
- Codex: focused implementation tasks, tests, bugfixes, UI components

Implementation tasks should be narrow, documented, and include acceptance criteria before coding starts.

The README, repository description, and repository website field should all point clearly to the playable demo once deployment is available. The demo should be discoverable within a few seconds of opening the repository.

## Long-Term Vision

The long-term arc is:

1. normal café
2. strange regulars
3. KASSANDRA and business anomalies
4. apocalyptic bureaucracy
5. mythological customers
6. delegation and expansion
7. macro-management of increasingly impossible café operations

Café Apokalypso should remain cozy, readable, and management-driven even as the world becomes increasingly unreasonable.
