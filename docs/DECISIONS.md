# Decisions

## Core Concept

Café Apokalypso is a cozy-absurd solo management game for the web.

It is positioned as a cozy-absurd café management soft-roguelite.

The player starts with a seemingly normal small café. Early gameplay focuses on micromanagement: taking orders, preparing drinks, cleaning tables, buying ingredients, setting prices, and running small advertisements.

Over time, guests, events, and systems become increasingly absurd, mythological, AI-driven, and apocalyptic.

## Progression

The game shifts from early micromanagement to later macromanagement.

Early:
- direct café operations
- individual guests
- basic economy
- cleaning
- simple inventory
- first advertising

Later:
- hiring staff
- delegating tasks
- staff roles and shifts
- advertising strategy
- careful economy
- expansion
- apocalyptic incidents
- mythological guest segments

## Main View

The main gameplay view is a small, charming, full pixel café in a light 3/4 diorama perspective.

Rejected as main view:
- side view
- pure dashboard
- spreadsheet-like management UI

Side-view scenes may be used later for special missions, basement encounters, deliveries, or rare event sequences.

## MVP Direction

The MVP should cover the first seven in-game days.

The café should initially feel normal. The absurdity should enter gradually through small anomalies, strange guests, odd system messages, and eventually the first explicit apocalyptic hint.

No real AI API in the MVP.
No backend.
No accounts.
No tracking.
Local browser save only.


## Decision: Café Apokalypso as a Soft-Roguelite

Café Apokalypso is positioned as a cozy-absurd café management soft-roguelite.

The core structure is built around repeated café weeks. A week functions as a run: the player manages several in-game days, makes economic and operational decisions, responds to guests and events, and reaches an end-of-week apocalyptic pressure point.

Failure should be soft rather than punitive. A failed or unstable week should not erase all progress. Instead, reality may partially reset while KASSANDRA preserves selected memories, unlocks, guest knowledge, upgrades, or forecasts.

The first seven-day MVP remains valid and is treated as the first playable café week / first run. The Day 7 apocalyptic letter becomes the reveal that the café is part of a larger repeating crisis structure.

Design implications:

- no hard permadeath
- no full punitive reset
- repeated weeks with changing conditions
- persistent KASSANDRA memory as meta-progression
- unlockable recipes, staff options, guest knowledge, forecasts, and start bonuses
- humorous failure and reset states
- management remains the core, roguelite structure provides replayability and escalation


## Decision: Tooling and Project Orchestration Workflow

Café Apokalypso uses a split project workflow:

- GitHub is the operational center for concrete work packages, implementation tracking, review status, and technical task control.
- ClickUp may remain a human-readable overview layer, but it is not canonical.
- Repository Markdown files remain the canonical source of truth.
- GitHub Actions will be used as the quality gate once code exists.

ClickUp is used for:
- readable project overview
- roadmap and priorities
- task status
- review status
- ideas parking lot
- tool assignment
- pitch / application tasks

The repository remains canonical for:
- decisions
- MVP scope
- game design rules
- content bible
- technical workflow
- AI handoffs

A decision or idea that exists only in ClickUp, a GitHub Issue, a Pull Request discussion, or a chat is not canonical yet. It becomes binding only after it is documented in the relevant repository Markdown file, especially `docs/DECISIONS.md`, `docs/MVP_SCOPE.md`, `docs/CONTENT_GUIDE.md`, `docs/WORKFLOW.md`, or `docs/AGENT_ORCHESTRATION.md`.

### Decision: GitHub as Operational Center

GitHub is the operative center for Café Apokalypso.

GitHub Issues are used for actionable work packages, including implementation tasks, bugs, test coverage, accessibility checks, security checks, art review tasks, documentation updates, and AI tool handoffs.

GitHub Projects may be used for planning and status. Pull Requests or commit groups document concrete repository changes.

Broad placeholder issues should be closed once their baseline work is implemented. Follow-up work should be tracked as focused issues with clear acceptance criteria.

New GitHub Issues should use clear, non-numbered titles and include goal, context, acceptance criteria, relevant docs, verification steps, and out-of-scope items.

Issues that are ready for implementation should be labelled `codex-ready` or `claude-ready`. Issues with unresolved design, product, scope, or art decisions should be labelled `needs-decision`.

GitHub does not replace the Markdown documentation. If an issue leads to a meaningful design, architecture, MVP, art, content, or workflow decision, the related Markdown documentation must be updated before the issue is considered complete.

AI tool roles:

- ChatGPT acts as creative director, product owner, reviewer, and orchestration layer.
- Claude Code is used for repository structure, documentation, architecture, refactoring plans, and larger cross-file reasoning.
- Codex is used for concrete implementation tasks, feature work, tests, bug fixes, and focused pull-request-style changes.
- Google AI Studio is used as an ideas and content lab for guest concepts, dialogue variants, event ideas, tone experiments, and alternative content drafts.

Google AI Studio does not write directly to the repository and does not make canonical decisions. Its outputs must be reviewed and curated before being transferred into repository documentation or game data.

No additional coding AI agent will be added during the early MVP setup. Additional tools may be used later only for independent review, specialized asset work, or clearly isolated support tasks.

Current ClickUp structure:

- Folder: `Café Apokalypso`
- List: `MVP Smoke Demo`
- List: `Game Design & Content`
- List: `Art / Sound / Mood`
- List: `Tech / Repo / Deploy`
- List: `Backlog & Later`


### Decision: Week 1 Vertical Slice Structure

The first playable vertical slice covers the first seven in-game days of Café Apokalypso.

The first week starts as a nearly normal café management game. The player learns direct café operations first: taking orders, preparing simple products, cleaning tables, managing basic resources, adjusting prices, choosing a daily offer, running simple advertising, and hiring temporary help.

The mythological/apocalyptic layer is introduced gradually through subtle anomalies rather than explicit fantasy guests. The first week ends with an official letter stating that the café has been mistakenly registered as apocalyptically relevant caffeine infrastructure.


The weirdness value exists internally from the start but only becomes visible after the end-of-week hook.

### Decision: Early Pacing Must Not Feel Slow

Café Apokalypso should not spend too long as a completely normal café simulation.

The first week remains grounded, but every in-game day should introduce at least one meaningful new element:

- a new mechanic
- a new guest behavior
- a new management option
- a new upgrade
- a new advertising option
- a first delegation/staff option
- a narrative anomaly
- a visible change in how the café feels

The first explicit apocalyptic hook appears by the end of day 7. After week 1, escalation may become faster and more visible.

### Decision: Café View Remains the Emotional Anchor

The café itself should remain the central emotional and visual anchor throughout the game.

Later management systems must grow around the café view rather than replace it. Staff panels, advertising, financial planning, expansion, KASSANDRA forecasts, and apocalyptic systems should be layered onto or accessed from the café, not turn the game into a pure spreadsheet or dashboard.

### Decision: Side View Is Reserved for Special Scenes

Side-view presentation is not used as the default gameplay camera.

It may be used later for special missions, event scenes, basement encounters, backdoor deliveries, dream sequences, or rare apocalyptic incidents where a more staged presentation helps the moment.

### Decision: KASSANDRA Starts as a Cash Register Update

KASSANDRA begins as a seemingly normal cash register / business analytics update, not as an obvious oracle from the start.

Its early behavior should feel plausible enough to belong in a café management tool while being slightly too confident, oddly specific, and increasingly inappropriate.

Early KASSANDRA examples:

- demand prediction
- automatic offer analysis
- target group optimization
- customer classification
- dry mortality-related observations

KASSANDRA should become stranger over time, eventually connecting the café economy to prophecy, weirdness, and apocalyptic operations.

### Decision: No Real AI API in the MVP

The MVP must not use a real AI API.

All AI-like behavior, including KASSANDRA forecasts, strange classifications, and oracle-style messages, is simulated through authored content, deterministic rules, and controlled randomization.

This keeps the MVP stable, testable, inexpensive, privacy-friendly, and safe to host as a static web app.

### Decision: Data-Driven Content

Guests, products, events, upgrades, advertising campaigns, staff options, achievements, and scripted messages should be data-driven wherever possible.

The goal is to make content easy to extend without rewriting core game logic. Claude, Codex, or future contributors should be able to add a new guest, product, upgrade, or event by editing structured data rather than changing multiple UI components.

### Decision: Later Localization / i18n

Multilingual support is planned for later but is not part of the MVP.

The MVP may initially use direct German or English strings as needed, but the architecture should not block later localization. Before translation work begins, user-facing content should be migrated into i18n keys and language files.

Planned future structure:

- `src/i18n/de.json`
- `src/i18n/en.json`
- additional languages later

### Decision: Management Arc

The core management arc is micro to macro.

At the beginning, the player performs direct café work manually. Later, the player increasingly manages systems: staff, roles, shifts, advertising, supply chains, pricing, expansion, strange guest groups, and apocalyptic incidents.

The player should feel this transition through gameplay, not only through story text.

### Decision: Week 2 Escalates Faster

Week 2 should not simply repeat week 1 with more numbers.

After the first official apocalyptic hook, week 2 should introduce stronger signs that the café is changing:

- visible weirdness
- daily KASSANDRA forecasts
- at least one clearly strange guest interaction
- first small apocalyptic incident
- stronger delegation or staff progression
- first visible café alteration caused by weirdness or system upgrades


### Decision: Art Review Sheets Before Final Asset Production

Café Apokalypso uses visual review sheets before final asset production.

Final visual assets should not be produced directly from loose prompts. Major visual directions must first be documented, reviewed, and approved through the appropriate sheet type.

Required review sheets:

- Character Sheets for major guests, staff, mythological visitors, AI-oracle entities, and authorities
- Level-/Day-Sheets for the first seven MVP days and later major progression beats
- UI Sheets for main gameplay screens, panels, popups, and day-end views
- Asset Sheets for recurring café objects, resource icons, props, and event items
- Weirdness-Escalation Sheets showing how the café moves from normal to subtly impossible to visibly apocalyptic
- Moodboard Sheets comparing approved and rejected visual directions

Approved visual decisions are copied into `docs/ART_STYLEGUIDE.md`. Art process and production rules are maintained in `docs/ART_PIPELINE.md`. Review material and sheet drafts live in `docs/art/`.

Claude Code/Codex may implement placeholders, asset metadata, folder structure, and rendering components before final art exists. They must not introduce final artwork, canonical character designs, a different main-view perspective, or major visual direction changes without documented user approval.
