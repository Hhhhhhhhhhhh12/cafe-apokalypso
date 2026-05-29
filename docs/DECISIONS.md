# Decisions

## Core Concept

Café Apokalypso is a cozy-absurd solo management game for the web.

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


## Decision: Tooling and Project Orchestration Workflow

Café Apokalypso uses a split project workflow:

- ClickUp is the human-readable project cockpit.
- GitHub Issues / Projects are the technical task control layer.
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

A decision or idea that exists only in ClickUp is not canonical yet. It becomes binding only after it is documented in the relevant repository Markdown file, especially `docs/DECISIONS.md`, `docs/MVP_SCOPE.md`, `docs/CONTENT_BIBLE.md`, `docs/WORKFLOW.md`, or `docs/AI_HANDOFFS.md`.

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
