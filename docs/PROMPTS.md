# Prompts

Reusable prompts for Café Apokalypso handoffs.

These prompts are intentionally scoped. Do not ask an agent to “build the game” without clear context, allowed changes, forbidden changes, and acceptance criteria.

## Prompt 1: Claude Code Consistency Check Only

Use this first when we want Claude Code to inspect, not edit.

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Read docs/PROJECT_CANON.md first.

Then read all Markdown documentation:
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
- missing references to docs/QUALITY_CHECKLIST.md in implementation prompts
- places where the game direction may have become too broad
- anything that could cause Claude Code or Codex to overbuild
- accessibility, save-safety, security, smoke-test, responsive-layout, or demo-release gaps
- anything that could cause Codex to ignore documented quality gates
- whether docs/PROJECT_CANON.md is treated as the first source of truth in all handoff guidance
- whether docs/PROMPTS.md is treated as the canonical source for reusable handoff prompts
- whether ClickUp tracking is required for every prompt actually handed to Claude Code, Codex, or another tool
- whether Mira and Meda are consistently represented as separate characters
- whether Mira stays mostly normal and acts as an early tone anchor
- whether Meda carries the first clearer Medusa-like mythological hint
- whether image tools such as OpenAI ImageGen, Nano Banana / Gemini image tools, and Google AI Studio are clearly treated as art-direction tools, not coding agents
- whether Antigravity is treated only as a possible later coding/review tool, not as an art pipeline replacement

Important fixed decisions:
- Web app first
- browser-playable static demo first, not downloadable desktop app
- Vite + React + TypeScript
- no backend in MVP
- no accounts in MVP
- no real AI API in MVP
- localStorage save only
- main gameplay view is a small 3/4 pixel café diorama
- side view only for special scenes
- first MVP covers seven in-game days
- current target is a playable seven-day vertical slice demo for portfolio/application review, not the full game and not a final production MVP
- handoff prompts used in practice should come from docs/PROMPTS.md, not directly from chat
- actual prompt handoffs must be tracked in ClickUp
- Mira and Meda are separate characters
- Mira is mostly normal and works as an early recurring guest / tone anchor
- Meda visually evokes Medusa and carries the first clearer mythological hint

Verification:
- No code commands required.
- Report whether documentation-only checks were performed.

Output:
1. Summary of consistency status.
2. List of contradictions or risks.
3. Suggested doc edits, but do not apply them.
4. A short ClickUp handoff tracking recommendation for this prompt, including prompt ID, tool, related issue/task, status, and result link placeholder.
5. Suggested next implementation task for Codex.
```

## Prompt 2: Claude Code Documentation and Architecture Readiness Pass

Use this after Prompt 1 if we want Claude Code to apply documentation-readiness edits and optionally create implementation planning docs.

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Before making changes, read docs/PROJECT_CANON.md first.

Then read:
- README.md
- docs/DECISIONS.md
- docs/WORKFLOW.md
- docs/GAME_DESIGN.md
- docs/MVP_SCOPE.md
- docs/CONTENT_GUIDE.md
- docs/TECH_ARCHITECTURE.md
- docs/ROADMAP.md
- docs/ART_PIPELINE.md
- docs/ART_STYLEGUIDE.md
- docs/QUALITY_CHECKLIST.md

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
6. Treat `docs/ART_STYLEGUIDE.md` as binding for any visual or asset-related implementation planning.
7. Treat `docs/QUALITY_CHECKLIST.md` as binding for implementation planning and quality gates.
8. Do not implement the actual app yet unless explicitly required.
9. Do not add a backend, real AI API, auth, analytics, payments, or external asset dependencies.
10. Preserve docs/PROMPTS.md as the canonical source for reusable handoff prompts.
11. Preserve ClickUp tracking requirements for actual prompt handoffs.
12. Preserve the split between Mira and Meda.

Allowed changes:
- README.md
- docs/*.md
- optionally create docs/IMPLEMENTATION_PLAN.md
- optionally create docs/ISSUE_SEQUENCE.md
- optionally update docs/PROJECT_CANON.md only if a true canonical contradiction is found

Do not change:
- core game direction
- main camera/view decision
- MVP constraints
- no-backend/no-real-AI rule
- cozy-but-absurd tone
- repository/demo distribution decision: browser-playable static WebApp first, not downloadable desktop app
- art direction or main visual style without user approval
- docs/PROMPTS.md as canonical handoff-prompt source
- ClickUp prompt handoff tracking requirement
- Mira/Meda as separate characters

Acceptance criteria:
- Docs clearly explain what should be built first.
- There is a concise implementation plan.
- There is a recommended source folder structure.
- The first 5–10 implementation steps are listed in order.
- Risks and open questions are listed separately.
- Asset/styleguide risks are listed separately if visual implementation is not yet governed.
- Quality risks are checked against `docs/QUALITY_CHECKLIST.md`, especially accessibility, save safety, security, smoke tests, responsive layout, and demo release readiness.
- The repo remains build-code-free unless explicitly needed.
- Any proposed significant decision is clearly marked as needing user approval.

Verification:
- No code commands required.
- Report whether documentation-only checks were performed.

After changes:
- Show a concise summary of what changed.
- List files changed.
- List open questions.
- Suggest the next best Codex task.
- Provide the ClickUp handoff status update: prompt ID, tool, related task, status, and result link placeholder.
```

## Prompt 3: Codex Initial App Shell

Use only after Prompt 1 has been reviewed and any necessary Prompt 2 documentation-readiness work has been accepted.

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Read docs/PROJECT_CANON.md first.

Then read:
- README.md
- docs/DECISIONS.md
- docs/WORKFLOW.md
- docs/MVP_SCOPE.md
- docs/GAME_DESIGN.md
- docs/CONTENT_GUIDE.md
- docs/TECH_ARCHITECTURE.md
- docs/ROADMAP.md
- docs/IMPLEMENTATION_PLAN.md if it exists
- docs/ART_STYLEGUIDE.md
- docs/QUALITY_CHECKLIST.md

Task:
Create the initial Vite + React + TypeScript app shell for Café Apokalypso.

Constraints:
- No backend
- No real AI API
- No accounts
- No tracking
- Local-first web app
- Follow docs/QUALITY_CHECKLIST.md
- Preserve basic keyboard accessibility and visible focus states
- Do not use unsafe HTML rendering
- Keep localStorage save handling defensive and resettable
- Keep the game engine separate from the presentation layer
- Do not implement complex gameplay yet
- Keep the first version small and readable
- Do not add external image assets
- Do not create or commit final art assets
- CSS-based placeholders are allowed only if clearly marked as temporary
- Do not add SVG artwork unless it is purely structural, minimal, and explicitly temporary
- Do not invent a new visual style
- Follow docs/ART_STYLEGUIDE.md
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
7. Add a visible reset-save control if localStorage persistence is introduced.
8. Ensure the initial UI is usable with keyboard navigation.
9. Keep the README demo/discovery section intact and do not remove the GitHub Pages demo target.

Do not:
- implement the full 7-day loop yet
- add real AI integration
- add backend code
- add external image assets
- generate final graphics
- commit AI-generated images
- introduce a different art direction
- create side-view main gameplay assets
- add large decorative SVG illustrations as final art
- use `dangerouslySetInnerHTML` or other unsafe HTML injection patterns
- overbuild routing, auth, database, or deployment
- replace the browser-playable static WebApp target with a downloadable desktop-app target
- invent major new game mechanics

Acceptance criteria:
- `npm install` works
- `npm run build` works
- `npm run test` works
- `npm run typecheck` works
- the app starts locally with `npm run dev`
- the code structure keeps game state separate from React UI
- the café view is visually present, even if placeholder/CSS-based
- the UI has basic keyboard accessibility and visible focus states
- no critical information is conveyed only through color
- localStorage usage, if introduced, handles missing or invalid save data without crashing

Verification:
- npm run build
- npm run test
- npm run typecheck

After finishing:
- Summarize changed files.
- Explain how to run locally.
- Explain the next recommended issue.
- Note any checks that could not be run.
- Provide the ClickUp handoff status update: prompt ID, tool, related task, status, and result link placeholder.
```

## Prompt 4: Codex Week-One Data Model

Use after the app shell exists and passes checks.

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Read docs/PROJECT_CANON.md first.

Then read:
- docs/MVP_SCOPE.md
- docs/GAME_DESIGN.md
- docs/CONTENT_GUIDE.md
- docs/TECH_ARCHITECTURE.md
- docs/QUALITY_CHECKLIST.md
- existing `src/game/` files
- docs/ART_STYLEGUIDE.md

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
- follow docs/QUALITY_CHECKLIST.md
- no complex gameplay implementation yet beyond typed data and simple selectors/helpers if needed
- no real AI API
- no backend
- no external assets
- no final art generation
- no new canonical character designs without approval
- use placeholder asset references only when clearly marked as temporary
- no localization migration yet unless already approved

Acceptance criteria:
- data is typed
- invalid or incomplete data should fail validation or be handled safely
- data can be imported from predictable files under `src/game/data/`
- tests or validation cover at least basic data integrity
- no UI redesign is included
- no new game direction is invented

Verification:
- npm run build
- npm run test
- npm run typecheck

After finishing:
- Summarize changed files.
- Explain any assumptions.
- Suggest the next implementation task.
- Provide the ClickUp handoff status update: prompt ID, tool, related task, status, and result link placeholder.
```

## Prompt 5: Codex Deterministic Day Loop

Use after the app shell and data model exist.

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Read docs/PROJECT_CANON.md first.

Then read:
- docs/MVP_SCOPE.md
- docs/GAME_DESIGN.md
- docs/TECH_ARCHITECTURE.md
- docs/QUALITY_CHECKLIST.md
- existing `src/game/` files
- existing tests
- docs/ART_STYLEGUIDE.md

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
- follow docs/QUALITY_CHECKLIST.md
- no new mechanics beyond MVP documentation
- no final art generation
- no visual style changes
- no external image assets

Acceptance criteria:
- tests cover day progression
- tests cover weirdness remaining hidden until the day-7 hook
- tests cover KASSANDRA unlock behavior
- tests cover the day-7 letter state change
- tests cover save-state compatibility or safe fallback if persistence is touched
- the app remains playable after browser reload if persistence is implemented
- build/typecheck/test pass

Verification:
- npm run build
- npm run test
- npm run typecheck

After finishing:
- Summarize changed files.
- Explain how the day loop works.
- Suggest the next implementation task.
- Provide the ClickUp handoff status update: prompt ID, tool, related task, status, and result link placeholder.
```

## Prompt 6: ClickUp Task Creation Outline

Use only if ClickUp setup or task-list creation is needed. ClickUp prompt handoff tracking is required for actual handoffs, but creating a full task list is optional and should only be introduced when it clearly helps.

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

## Asset and Art Safety Rule for Codex

Codex may implement layout, rendering components, CSS-based placeholders, asset folder structure, typed asset metadata, and references to temporary placeholders.

Codex must not:
- create or commit final art assets
- generate AI images
- add external image assets
- invent canonical character designs
- change the main art direction
- replace the 3/4 diorama main view with a side view
- introduce a glossy AI-render look, generic mobile-game look, or unrelated pixel style

Before Codex performs any task that touches visuals, `docs/ART_STYLEGUIDE.md` must be read and treated as binding.

## Quality Safety Rule for Codex

Codex must read `docs/QUALITY_CHECKLIST.md` before implementation tasks.

Codex must preserve:
- keyboard accessibility
- visible focus states
- safe localStorage handling
- no unsafe HTML injection
- no external scripts, tracking, backend, auth, or real AI API in the MVP
- readable responsive layouts
- smoke-testable Day 1 to Day 7 progression

If a task would violate the quality checklist, Codex must stop and explain the conflict instead of implementing the change.

## Recommended Prompt Order

Default order:

1. Prompt 1: Claude Code Consistency Check Only
2. User reviews Claude Code findings with ChatGPT
3. Prompt 2: Claude Code Documentation and Architecture Readiness Pass, only if edits or planning docs are approved
4. Prompt 3: Codex Initial App Shell
5. Prompt 4: Codex Week-One Data Model
6. Prompt 5: Codex Deterministic Day Loop

This order is intended to avoid wasting Claude/Codex tokens on reversible broad edits before the user has approved the direction.

## Local Pre-Handoff Checklist

Before handing any prompt to Claude Code, Codex or another tool:

- [ ] Confirm the prompt is copied from `docs/PROMPTS.md`, not directly from chat.
- [ ] Confirm the relevant ClickUp task exists.
- [ ] Add or update the ClickUp prompt handoff entry.
- [ ] Record prompt ID, target tool, related GitHub issue/task, status and result link placeholder.
- [ ] Check `git status` before handing off.
- [ ] Confirm whether the prompt is inspection-only or edit/implementation-authorized.
- [ ] Confirm broad rework decisions have user approval.

## Decision Gate Rule

Before using Claude Code, Codex, ClickUp, Antigravity, or another tool for broad changes, ask for user approval when any of the following is involved:

- major architecture change
- new gameplay system
- change to MVP scope
- change to main view or art direction
- change to tone or character voice
- change to deployment/distribution target
- large rewrite of documentation
- broad code generation task
- new tool or dependency
- anything likely to require rollback if wrong
