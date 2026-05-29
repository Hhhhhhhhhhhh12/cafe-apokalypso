

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

## Game State

The MVP game state should be serializable.

Important state fields include:

- day
- money
- reputation
- coffee
- milk
- pastries
- cleanliness
- stress
- weirdness
- weirdnessVisible
- kassandraInstalled
- apocalypseModeUnlocked
- staffUnlocked
- advertisingUnlocked
- pricingUnlocked
- purchasedUpgrades
- unlockedAchievements
- guest history
- event history

The exact shape can evolve, but the state should remain easy to save and restore.

## Deterministic Logic

Core game logic should be deterministic where practical.

Given the same state and action, the engine should produce the same next state. Randomness should be controlled through seeded or centralized helper functions where possible.

This makes the MVP easier to test, debug, and balance.

## Save System

The MVP uses localStorage.

Requirements:

- save current game state locally
- load existing save on app start
- allow reset/new game
- handle missing or outdated save data gracefully

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
