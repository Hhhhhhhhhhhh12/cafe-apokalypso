

# Prompts

Reusable prompts for Café Apokalypso handoffs.

These prompts are intentionally scoped. Do not ask an agent to “build the game” without clear context, allowed changes, forbidden changes, and acceptance criteria.

## Prompt 1: Claude Code Documentation and Architecture Readiness Pass

Use this first, before handing implementation to Codex.

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Before making changes, read:
- README.md
- docs/DECISIONS.md
- docs/WORKFLOW.md
- docs/GAME_DESIGN.md
- docs/MVP_SCOPE.md
- docs/CONTENT_GUIDE.md
- docs/TECH_ARCHITECTURE.md
- docs/ROADMAP.md
- docs/ART_PIPELINE.md if it exists

Project summary:
Café Apokalypso is a cozy-absurd solo management web game. The player starts with a seemingly normal small café. Early gameplay focuses on micromanagement: orders, prices, ingredients, cleaning, first ads. Over time, guests, events, and systems become increasingly absurd, mythological, AI-oracle-driven, and apocalyptic. The game shifts from early micromanagement to later macromanagement: hiring staff, delegating tasks, advertising, economy, expansion, and delaying world-ending incidents.

Main gameplay view:
A small full pixel café in a light 3/4 diorama perspective. No side view as main gameplay. Side view is reserved only for special missions or event scenes.

MVP:
The first 7 in-game days. The café starts normal, with subtle strange hints. No real AI API, no backend, no accounts, no tracking. Local browser save only.

Your task:
Perform a repository documentation and architecture readiness pass.

Goals:
1. Check the existing docs for consistency.
2. Identify missing or unclear decisions.
3. Improve docs only where needed.
4. Create a concrete implementation plan for the MVP.
5. Propose the future app structure for Vite + React + TypeScript.
6. Do not implement the actual app yet unless explicitly required.
7. Do not add a backend, real AI API, auth, analytics, payments, or external asset dependencies.

Allowed changes:
- README.md
- docs/*.md
- optionally create docs/IMPLEMENTATION_PLAN.md
- optionally create docs/ISSUE_SEQUENCE.md

Do not change:
- core game direction
- main camera/view decision
- MVP constraints
- no-backend/no-real-AI rule
- cozy-but-absurd tone

Acceptance criteria:
- Docs clearly explain what should be built first.
- There is a concise implementation plan.
- There is a recommended source folder structure.
- The first 5–10 implementation steps are listed in order.
- Risks and open questions are listed separately.
- The repo remains build-code-free unless explicitly needed.
- Any proposed significant decision is clearly marked as needing user approval.

After changes:
- Show a concise summary of what changed.
- List files changed.
- List open questions.
- Suggest the next best Codex task.
```

## Prompt 2: Claude Code Consistency Check Only

Use this when we want Claude Code to inspect, not edit.

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Read all Markdown documentation first:
- README.md
- docs/*.md

Do not edit files.

Task:
Perform a consistency check across the documentation.

Check for:
- contradictions between README and docs
- contradictions between MVP scope and roadmap
- unclear or duplicated decisions
- missing acceptance criteria for the first implementation tasks
- places where the game direction may have become too broad
- anything that could cause Claude Code or Codex to overbuild

Important fixed decisions:
- Web app first
- Vite + React + TypeScript
- no backend in MVP
- no accounts in MVP
- no real AI API in MVP
- localStorage save only
- main gameplay view is a small 3/4 pixel café diorama
- side view only for special scenes
- first MVP covers seven in-game days
- early progression should not feel too slow

Output:
1. Summary of consistency status.
2. List of contradictions or risks.
3. Suggested doc edits, but do not apply them.
4. Suggested next implementation task for Codex.
```

## Prompt 3: Codex Initial App Shell

Use only after the documentation readiness pass is accepted.

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Read first:
- README.md
- docs/DECISIONS.md
- docs/WORKFLOW.md
- docs/MVP_SCOPE.md
- docs/GAME_DESIGN.md
- docs/CONTENT_GUIDE.md
- docs/TECH_ARCHITECTURE.md
- docs/ROADMAP.md
- docs/IMPLEMENTATION_PLAN.md if it exists

Task:
Create the initial Vite + React + TypeScript app shell for Café Apokalypso.

Constraints:
- No backend
- No real AI API
- No accounts
- No tracking
- Local-first web app
- Keep the game engine separate from the presentation layer
- Do not implement complex gameplay yet
- Keep the first version small and readable
- Do not add external image assets
- Do not add Tailwind, shadcn/ui, routing, auth, database, analytics, or deployment complexity unless already approved

Required:
1. Add Vite + React + TypeScript setup.
2. Add npm scripts:
   - dev
   - build
   - test
   - typecheck
   - lint, if linting is configured
3. Create a minimal app layout showing:
   - Café Apokalypso title
   - day/status header
   - placeholder 3/4 pixel-inspired café diorama area
   - resource/status panel
   - action panel
4. Add a basic deterministic game state placeholder in `src/game/`.
5. Add at least one small test for initial game state.
6. Ensure GitHub Actions can run build/test/typecheck without failing.

Do not:
- implement the full 7-day loop yet
- add real AI integration
- add backend code
- add external image assets
- overbuild routing, auth, database, or deployment
- invent major new game mechanics

Acceptance criteria:
- `npm install` works
- `npm run build` works
- `npm run test` works
- `npm run typecheck` works
- the app starts locally with `npm run dev`
- the code structure keeps game state separate from React UI
- the café view is visually present, even if placeholder/CSS-based

After finishing:
- Summarize changed files.
- Explain how to run locally.
- Explain the next recommended issue.
- Note any checks that could not be run.
```

## Prompt 4: Codex Week-One Data Model

Use after the app shell exists and passes checks.

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Read first:
- docs/MVP_SCOPE.md
- docs/GAME_DESIGN.md
- docs/CONTENT_GUIDE.md
- docs/TECH_ARCHITECTURE.md
- existing `src/game/` files

Task:
Implement the structured week-one data model.

Required data:
- 6 normal guests
- 2 subtly strange guests
- 5 basic products
- 4 advertising campaigns
- 3 temporary staff options
- 7 early upgrades
- 9 scripted week-one events
- 7 achievements

Constraints:
- data-driven content
- no complex gameplay implementation yet beyond typed data and simple selectors/helpers if needed
- no real AI API
- no backend
- no external assets
- no localization migration yet unless already approved

Acceptance criteria:
- data is typed
- data can be imported from predictable files under `src/game/data/`
- tests or validation cover at least basic data integrity
- no UI redesign is included
- no new game direction is invented

After finishing:
- Summarize changed files.
- Explain any assumptions.
- Suggest the next implementation task.
```

## Prompt 5: Codex Deterministic Day Loop

Use after the app shell and data model exist.

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Read first:
- docs/MVP_SCOPE.md
- docs/GAME_DESIGN.md
- docs/TECH_ARCHITECTURE.md
- existing `src/game/` files
- existing tests

Task:
Implement a small deterministic day loop for the week-one MVP.

Required:
- initialize game state
- advance through days 1–7
- apply scripted day unlocks
- track resources, reputation, cleanliness, stress, hidden weirdness, visible weirdness state
- unlock advertising, temporary staff, pricing, and KASSANDRA at the documented points
- trigger the day-7 official apocalyptic letter
- keep full apocalypse operations locked after the MVP ending

Constraints:
- no real-time pathfinding
- no advanced animations
- no backend
- no real AI API
- no large UI rewrite unless necessary
- no new mechanics beyond MVP documentation

Acceptance criteria:
- tests cover day progression
- tests cover weirdness remaining hidden until the day-7 hook
- tests cover KASSANDRA unlock behavior
- tests cover the day-7 letter state change
- build/typecheck/test pass

After finishing:
- Summarize changed files.
- Explain how the day loop works.
- Suggest the next implementation task.
```

## Prompt 6: ClickUp Task Creation Outline

Use only if project-management tracking is desired. ClickUp is optional and should not be introduced before it clearly helps.

```txt
Create a ClickUp task list for Café Apokalypso MVP development.

Use the following groups:
1. Documentation and Planning
2. App Shell
3. Game Engine
4. Week-One Data
5. Café UI
6. Save System
7. Tests and CI
8. Demo/README/Distribution

For each task include:
- title
- short description
- acceptance criteria
- suggested assignee/tool: ChatGPT, Claude Code, Codex, or User
- status: Todo

Do not add tasks for full mythology roster, backend, real AI API, accounts, payments, or multi-location expansion. Those are out of MVP scope.
```

## Local Pre-Handoff Checklist

Before starting Claude Code or Codex, run locally:

```bash
git status
git log --oneline --max-count=5
```

Before Codex implementation starts, also verify whether CI is green on GitHub.

## Decision Gate Rule

Before using Claude Code, Codex, or ClickUp for broad changes, ask for approval when any of the following is involved:

- major architecture change
- new gameplay system
- change to MVP scope
- change to main view or art direction
- change to tone or character voice
- large rewrite of documentation
- broad code generation task
- new tool or dependency
- anything likely to require rollback if wrong
```
