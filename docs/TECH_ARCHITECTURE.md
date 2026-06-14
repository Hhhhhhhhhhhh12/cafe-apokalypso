

# Technical Architecture

## Technical Goal

Café Apokalypso is developed as a static web app first.

The MVP should be easy to run locally, easy to host on a static web server, and impressive as a GitHub repository. The technical foundation should support later growth without overengineering the first playable vertical slice.

## MVP Stack

The MVP uses:

- Vite
- React
- TypeScript
- CSS or lightweight component styling
- localStorage for save data
- Vitest for core game-system tests

The MVP does not require:

- backend server
- database
- user accounts
- authentication
- real AI API
- external tracking
- payment systems
- required network access after initial load

## Static Hosting

The MVP should be hostable as static files.

This means:

- all core gameplay runs in the browser
- save data is local to the browser
- no secrets or API keys are required
- deployment can work on a static host or simple webspace
- the app should not assume server-side routing

If the app uses client-side routing later, the build should be compatible with subfolder deployment and fallback routing.

## Architecture Layers

The project should separate game logic from presentation.

### Game Engine Layer

The game engine owns deterministic state transitions.

It should handle:

- current day
- resources
- guests
- products
- orders
- staff effects
- advertising effects
- upgrades
- events
- achievements
- hidden and visible weirdness
- KASSANDRA state
- local save/load serialization

The engine should not depend on React components.

### Data Layer

Game content should be data-driven wherever possible.

Data includes:

- guests
- products
- staff options
- advertising campaigns
- upgrades
- events
- achievements
- KASSANDRA messages
- scripted day beats

Adding a new guest, product, upgrade, or event should usually require editing structured data, not rewriting UI logic.

### Presentation Layer

The UI renders the current game state and dispatches player actions.

The main screen should show the small 3/4 pixel-inspired café diorama and surrounding management panels.

The presentation layer may include:

- café view
- guest cards or tooltips
- action bar
- resource HUD
- daily summary screen
- upgrade screen
- advertising panel
- staff panel
- KASSANDRA panel
- achievement notifications

The UI should not contain core balancing rules.

## Suggested Repository Structure

```txt
src/
  app/
    App.tsx
    routes.tsx
  game/
    engine/
      gameState.ts
      actions.ts
      reducer.ts
      selectors.ts
      save.ts
    data/
      guests.ts
      products.ts
      staff.ts
      ads.ts
      upgrades.ts
      events.ts
      achievements.ts
      kassandra.ts
    types/
      game.ts
  ui/
    components/
    cafe/
    panels/
  styles/
  i18n/
    README.md

tests/
  economy.test.ts
  guest-flow.test.ts
  staff.test.ts
  advertising.test.ts
  events.test.ts
```

This structure is a guideline. It can be adjusted during implementation if the separation between engine, data, and UI remains clear.

### Asset folder layout (as implemented)

Pilot art assets live at the **repository root** under `assets/`, not under `src/assets/`. Earlier docs proposed a `src/assets/...` location; the real repository layout takes precedence:

```txt
assets/
  sprites/
    props/       # café props (coffee machine, register, table/chair set, cup, etc.)
    guests/      # guest pilot sprites (e.g. Paula)
  backgrounds/   # café background / stage base (e.g. stage base v03)
```

These hold the integrated provisional pilot assets (see `docs/art/PILOT_ASSET_INTAKE.md` and `docs/ART_PIPELINE.md`). They remain provisional and are CSS-placeholder-backed, so the app still renders if an asset is missing.

## Game State

The MVP game state should be serializable.

The serialized state carries an explicit `version` field. **The current schema version is `11`** (`GameStateVersion = 11`), alongside a `contentCatalogVersion` (`"week-one-v1"`). On load, a save whose `version` or `contentCatalogVersion` does not match the current values is rejected or migrated where supported before validation (see Save System below).

Important state fields (as implemented; the shape is grouped, not flat):

- `version` — schema version, currently `11`
- `contentCatalogVersion` — content catalog version, currently `"week-one-v1"`
- `day`, `dayPhase`, `phaseLabel`
- `resources` — `{ money, reputation, cleanliness, stress, mood }`
- `supplies` — `{ coffee, milk, pastries }` (the three Week-1 ingredients live here as an object, not as flat top-level fields)
- `helperAssignment` — `{ helperId, taskId, locked, dailyCost, flavorLine }` or `null` when no helper is hired for the day
- `pendingSupplyPurchase` — per-ingredient quantities staged for the next day
- `dayManagement` — per-day counters (customers served, money earned/spent, stress sources applied, helper bonuses, etc.)
- `daySummary`, `objectiveResults`
- `run` — soft-run metadata: run number, deterministic week modifier IDs, and KASSANDRA memory fragments
- `guestMemory` — learned guest preference entries used by selectors and status copy to teach without a separate tutorial
- `stressEventLog` — list of stress-event flavor lines fired so far
- `hiddenWeirdness` — internal weirdness value, updated throughout Days 1–7
- `weirdnessVisible` — gate controlling whether weirdness may surface in the UI (`false` until the Day-7 letter)
- `kassandraInstalled`, `demoComplete`
- `unlocks` — `{ pricing, advertising, staff, kassandra, apocalypseOperations }`
- `guestHistory`, `eventHistory`, `unlockedAchievements`
- `statusMessage`

These fields are consistent with `docs/MANAGEMENT_TRADEOFF_DESIGN.md` (Save and Reload Requirements), which is the canonical source for the Week-1 management fields (`cleanliness`, `stress`, `supplies.{coffee,milk,pastries}`, `helperAssignment`, `stressEventLog`, `weirdnessVisible`).

The exact shape can still evolve, but the state should remain easy to save and restore, and any breaking change must bump `GameStateVersion`.

## Deterministic Logic

Core game logic should be deterministic where practical.

Given the same state and action, the engine should produce the same next state. Randomness should be controlled through seeded or centralized helper functions where possible.

This makes the MVP easier to test, debug, and balance.

## Save System

The MVP uses localStorage.

### Versioning (as implemented)

- The serialized `GameState` carries `version` (currently `11`) and `contentCatalogVersion` (currently `"week-one-v1"`). Supported older saves are migrated before validation; otherwise the loader returns a fresh initial state instead of crashing.
- The localStorage **key** is currently `cafe-apokalypso.save.v4`. Earlier keys (`...v1`, `...v2`, `...v3`) are treated as legacy and cleared on reset. Note: the storage-key suffix and the in-state schema `version` are tracked separately and are not required to share the same number.
- A "Reset / New Game" control removes the current save and the legacy keys.

Requirements:

- save current game state locally
- load existing save on app start
- reject mismatched/outdated saves and fall back to a fresh initial state
- allow reset/new game
- handle missing or malformed save data gracefully (no crash)

Future versions may add export/import, cloud save, or accounts, but these are out of scope for the MVP.

## KASSANDRA and AI-Like Behavior

The MVP must not use a real AI API.

KASSANDRA is simulated through:

- authored messages
- deterministic rules
- controlled randomization
- day/event triggers
- resource and guest-state checks

No API keys should exist in the frontend. No user input should be sent to an external model in the MVP.

KASSANDRA should be implemented as a game system, not as a live chatbot.

## Localization / i18n

Multilingual support is planned later but is not part of the MVP.

The MVP may start with direct strings if this speeds up the vertical slice, but the architecture should not block later migration to text keys.

Planned future files:

- `src/i18n/de.json`
- `src/i18n/en.json`

Before localization work begins, user-facing strings should be moved into stable keys.

## Testing

The MVP should include tests for core game systems.

Recommended test areas:

- serving a guest changes resources and money correctly
- insufficient ingredients block or alter product preparation
- advertising modifies guest distribution
- staff effects modify service, cleanliness, or reputation
- KASSANDRA unlocks on the correct day or upgrade
- weirdness remains hidden until the week-1 hook
- day-7 letter unlocks visible weirdness and foreshadows apocalypse operations
- achievements trigger correctly

UI tests are optional for the MVP. Engine tests are more important.

## Known Fragilities

Migration and refactor traps observed in this repository. Keep these in mind before declaring a change "green".

- **`as const` on data arrays can silently break type predicates.** Adding `as const` to data arrays (e.g. in `src/game/data/*`) can change the inferred types so that type predicates / narrowing in `src/game/engine/selectors.ts` no longer hold — and this is **not** caught by `npm run test`, because Vitest runs through esbuild, which strips types without type-checking. A run can show all tests green while the build's type layer is broken. **Always run `npm run typecheck`** (not just tests) after touching data shapes or selectors.
- **Vitest only discovers `tests/**/*.test.ts`.** Test files placed anywhere outside the `tests/` tree (or not matching `*.test.ts`) are **silently not run** — no error, no warning, they simply don't execute. When adding tests, put them under `tests/` with the `.test.ts` suffix, and confirm the run count went up rather than assuming a new file was picked up.

## Visual Implementation Notes

The first version does not need advanced pixel-art animation.

Acceptable MVP approach:

- CSS-based pixel-inspired café diorama
- simple blocky shapes
- small animated details such as steam, blinking lights, or guest status icons
- clear layout over asset-heavy polish

Avoid delaying the MVP for full custom sprite production.

The main view should still feel like a café, not a spreadsheet.

## Accessibility and UX

The MVP should remain readable and usable.

Guidelines:

- clear buttons
- readable text
- sufficient contrast
- no essential information only by color
- tooltips for unfamiliar systems
- calm pacing without real-time pressure spikes

## Deployment Notes

The app should build to a standard static `dist/` directory.

The implementation should avoid assumptions that break subfolder deployment. This matters if the app is hosted under a path rather than at a domain root.

## Agent Workflow Notes

Claude Code and Codex should receive clear, bounded tasks.

Preferred split:

- Claude Code: documentation, architecture review, repo structure, planning, consistency checks
- Codex: implementation, tests, bugfixes, UI components, data-driven game systems

Do not hand off implementation until the MVP scope, content data, and core architecture are sufficiently specified.
