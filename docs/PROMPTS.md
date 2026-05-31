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


## Prompt C1: ChatGPT Concept Card

Use this inside ChatGPT after a creative discussion, before creating GitHub Issues or handing work to Claude Code/Codex.

```txt
You are helping shape a new idea for Café Apokalypso.

Task:
Condense the discussion into a Concept Card.

Do not write repository patches.
Do not assume implementation approval.
Do not broaden the idea beyond what was discussed.

Output:
1. Idea title
2. One-paragraph summary
3. Why it matters
4. Intended player experience
5. MVP impact
6. Likely affected documents
7. Likely affected code areas
8. Open questions
9. Explicit out-of-scope items
10. Recommendation: park, explore more, canon-check, or create issue
```

## Prompt C2: Claude Code Canon Check for Concept Card

Use this after a Concept Card exists and before any files are edited.

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Read docs/PROJECT_CANON.md first.

Then read the Concept Card provided by the user.

Then read the relevant repository documentation, at minimum:
- README.md
- docs/DECISIONS.md
- docs/WORKFLOW.md
- docs/GAME_DESIGN.md
- docs/MVP_SCOPE.md
- docs/DEMO_SCOPE.md if it exists
- docs/TECH_ARCHITECTURE.md
- docs/ROADMAP.md
- docs/CONTENT_GUIDE.md
- docs/QUALITY_CHECKLIST.md
- docs/AGENT_ORCHESTRATION.md if it exists

Do not edit files.
Do not create commits.
Do not create branches.

Task:
Compare the Concept Card against the current project canon.

Check for:
- compatible areas
- contradictions or context drift
- MVP scope impact
- architecture or data-model implications
- art-direction implications
- content/tone implications
- quality, accessibility, save-safety, security, responsive-layout, or demo-release risks
- files that would need updates if the idea is approved
- implementation tasks that should be separate from documentation updates
- decisions that require human approval before implementation

Output:
1. Short verdict: compatible, compatible with caveats, or conflicting.
2. Canon alignment summary.
3. Context drift / contradictions.
4. Affected files and why.
5. MVP impact.
6. Implementation risks.
7. Human decision questions, phrased as clear options.
8. Recommendation.
9. Suggested next handoff: GitHub Issue, docs-only PR, Codex implementation prompt, or park.
10. ClickUp handoff tracking recommendation with prompt ID, tool, related issue/task, status, and result link placeholder.
```

## Prompt C3: ChatGPT Human Decision Gate

Use this after a Canon Check finds conflicts, ambiguity, or scope tradeoffs.

```txt
You are helping the user decide how to proceed with a Café Apokalypso concept change.

Input:
- Concept Card
- Canon Check result
- any relevant user preferences or constraints

Task:
Create a short decision brief for the user.

Do not write repository patches.
Do not create a final handoff yet unless the user asks.

For each open decision:
- state the conflict in plain language
- give 2–3 options
- list tradeoffs
- recommend one option
- explain what happens if no decision is made

Output:
1. Executive summary
2. Decisions needed now
3. Decisions that can wait
4. Recommended path
5. Suggested next artifact: GitHub Issue, ADR/Decision Record, Claude prompt, Codex prompt, or no action
```

## Prompt C4: ChatGPT Approved Issue Draft

Use this after the user approves a direction and wants a GitHub Issue or RFC-style proposal.

```txt
Create a GitHub Issue draft for Café Apokalypso.

The issue should be based only on the approved direction below.
Do not add new scope.
Do not turn optional ideas into requirements.

Include:
- Title
- Labels
- Summary
- Context
- Approved direction
- Alternatives considered, if known
- MVP impact
- Affected docs
- Affected code areas
- Out of scope
- Open questions
- Acceptance criteria
- Suggested implementation sequence
- Stop conditions
- Review notes for the user

Use labels from this set when appropriate:
- design-decision
- docs-sync-needed
- mvp-scope
- architecture
- art-direction
- content
- needs-approval
- approved
- codex-ready
- claude-ready

Output the issue in Markdown, ready to paste into GitHub.
```

## Prompt C5: Claude Code Docs Sync from Approved Issue

Use this after a GitHub Issue or approved decision exists. This prompt allows documentation edits, but only inside the approved scope.

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Read docs/PROJECT_CANON.md first.
Read the approved GitHub Issue or approved decision text provided by the user.

Then read only the affected documentation files listed in the issue.
If the affected files are missing or unclear, stop and ask for clarification.

Task:
Synchronize the approved decision into the listed documentation files.

Allowed changes:
- documentation files explicitly listed in the issue

Forbidden changes:
- code changes
- asset changes
- dependency changes
- broad rewrites outside the approved issue
- new design decisions not present in the issue
- changing MVP scope unless the issue explicitly approves it

Rules:
- make the smallest coherent documentation changes
- preserve existing document structure where possible
- keep docs-only, code, and art-pipeline changes separate
- if a contradiction is found that is not resolved by the issue, stop and report it instead of silently choosing
- do not invent new features

Acceptance criteria:
- approved decision is reflected consistently in listed docs
- no unapproved scope expansion
- unresolved questions remain marked as open
- follow-up implementation tasks are listed separately if needed

Verification:
- no code commands required unless the repo has documentation checks
- report whether documentation-only checks were performed

After finishing:
- summarize changed files
- explain what changed in plain language
- list unresolved questions
- list follow-up issues/tasks
- provide a merge recommendation
- provide the ClickUp handoff status update: prompt ID, tool, related GitHub issue/task, status, and result link placeholder
```

## Prompt C6: Codex Implementation Handoff from Approved Issue

Use this after docs are aligned and the implementation scope is clear.

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Read docs/PROJECT_CANON.md first.
Read the approved GitHub Issue or implementation brief provided by the user.

Then read the listed context files only. If necessary context is missing, stop and ask for clarification before editing.

Task:
Implement the approved slice.

Allowed changes:
- files explicitly listed or clearly required by the approved implementation brief

Forbidden changes:
- unrelated refactors
- new dependencies unless explicitly approved
- backend, accounts, tracking, analytics, payments, or real AI API in the MVP
- final art assets or generated images
- broad documentation rewrites
- new gameplay systems beyond the approved slice
- changing main view or art direction without explicit approval

Rules:
- keep the change small and reviewable
- preserve existing tests and quality gates
- follow docs/QUALITY_CHECKLIST.md
- keep game logic separate from presentation where applicable
- stop if the implementation contradicts the docs or expands MVP scope

Acceptance criteria:
- all issue acceptance criteria are met
- tests cover the changed behavior where practical
- build/typecheck/test pass
- no critical information is conveyed only through color or image detail
- localStorage remains defensive and resettable if touched

Verification:
- npm run build
- npm run test
- npm run typecheck

After finishing:
- summarize changed files
- explain what changed in plain language
- list tests/checks run
- list checks that could not be run
- list risks and follow-up tasks
- provide a merge recommendation
- provide the ClickUp handoff status update: prompt ID, tool, related GitHub issue/task, status, and result link placeholder
```

## Prompt C7: Review Translation for User

Use this after Claude Code, Codex, or another tool produces a diff, PR, or implementation report.

```txt
You are helping the user review a Café Apokalypso change without requiring deep diff-reading knowledge.

Input:
- agent result summary
- changed files list
- diff or PR description if available
- related issue or prompt

Task:
Translate the result into a plain-language review.

Output:
1. What changed?
2. Why was it changed?
3. What does it mean for the game?
4. What does it mean technically?
5. What should the user manually check?
6. What automated checks passed or are missing?
7. Risks or possible regressions.
8. Whether this looks safe to merge.
9. Follow-up issues/tasks to create.
10. One-sentence recommendation: merge, request changes, test locally first, or park.
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

## Prompt 10D: Pixel-Art Asset Pilot for Vertical Slice

Use after the café layout, week-one loop, and first art-review direction have been approved. This prompt is for a limited asset pilot, not a full art-production pass.

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Read docs/PROJECT_CANON.md first.

Then read:
- README.md
- docs/MVP_SCOPE.md
- docs/DEMO_SCOPE.md if it exists
- docs/GAME_DESIGN.md
- docs/TECH_ARCHITECTURE.md
- docs/ART_PIPELINE.md
- docs/ART_STYLEGUIDE.md
- docs/QUALITY_CHECKLIST.md
- docs/WORKFLOW.md
- docs/AGENT_ORCHESTRATION.md
- docs/art/MOODBOARD_CAFE_INTERIOR_001.md if it exists

Task:
Prepare and integrate a limited pixel-art asset pilot for the vertical slice.

Goal:
The vertical slice should not remain purely CSS-placeholder-based. It should contain a small number of reviewed, curated pixel-art pilot assets while keeping fallback placeholders and avoiding a full final-art commitment.

Scope:
- Add an asset structure for curated pilot assets.
- Add typed asset metadata for pilot assets.
- Integrate the first approved pixel-art pilot assets into the café view.
- Preserve the existing café layout and 3/4 diorama direction.
- Keep real UI text in HTML/CSS/React, not baked into images.
- Keep CSS placeholders as fallback if assets are missing.

Allowed pilot asset categories:
- one approved Day-1 café background or background slice
- 4–6 approved normal guest sprites
- one barista/staff sprite
- 6–10 café props
- 1–2 weirdness overlay props, such as clock anomaly, tiny portal cup, endless receipt, form stack, or AI-oracle object

Constraints:
- No full final art pass
- No 8-direction sprite system
- No full animation system
- No complete Day 1–7 art layering
- No backend
- No real AI API
- No accounts
- No tracking
- No external asset dependency
- Do not commit raw AI Studio / Gemini / Nano Banana image batches
- Do not use images that contain generated gibberish text as UI
- Do not introduce readable text inside art assets unless explicitly approved
- Do not change the main 3/4 café view
- Do not replace the current gameplay scope
- Do not invent new canonical characters without documented approval

Asset rules:
- Raw generated sheets remain outside the repository.
- Only cropped, curated, explicitly approved pilot assets may enter the repository.
- Use clear filenames.
- Keep source/reference notes in Markdown or metadata.
- Treat generated art as provisional pilot art unless the docs explicitly mark it as final.
- Keep the CSS placeholder fallback classes intact. Note: if you wire an asset
  via a static ESM import (as the current café stage does in
  src/ui/cafe/CafePlaceholder.tsx), Vite resolves it at dev/build time and a
  missing file breaks the build rather than falling back to CSS — so commit the
  asset, or reference it as a truly optional asset (runtime URL / guarded
  dynamic import) if the app must survive a missing file.

Acceptance criteria:
- First curated pixel-art pilot assets appear in the café view.
- Raw generated image sheets are not committed.
- Assets are organized in a predictable folder structure.
- Asset metadata is typed and easy to replace later.
- UI text remains actual HTML/CSS/React text, not baked into generated images.
- CSS placeholders/fallbacks still work.
- The app remains keyboard-accessible.
- No critical information is conveyed only through image detail.
- Build/test/typecheck pass.

Verification:
- npm run build
- npm run test
- npm run typecheck

After finishing:
- Summarize changed files.
- List which assets were integrated and where they came from.
- Confirm that raw generated sheets were not committed.
- Explain how to replace pilot assets later.
- Note any checks that could not be run.
- Provide the ClickUp handoff status update: prompt ID, tool, related GitHub issue/task, status, and result link placeholder.
```

---

# Recurring Pattern Prompts

The prompts below generalize patterns that were originally executed ad hoc from chat
(Prompts 7, 8A, 8B, 9A, 10V, 10C, 10D, 10E-A/A2/A3, S1–S4). They are reusable
templates — fill in the specifics each time. Record each handoff in Git history / the
PR description (ClickUp optional) and note the **actual model that ran**.

## Prompt R-UXV: UX / Visual Review Pass

Use when the app runs but needs a structured usability/visual review before more features.

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Read docs/PROJECT_CANON.md first, then docs/QUALITY_CHECKLIST.md, docs/art/CAFE_DIORAMA_DIRECTION.md, and the relevant UI components.

Task:
Review the current UI/UX of <screen or flow> against the cozy-absurd direction and the quality checklist. Inspect first; propose before editing.

Check for:
- readability, hierarchy, contrast, and "no info by color alone"
- keyboard accessibility and visible focus states
- layout robustness at the documented target size
- alignment with the 3/4 diorama direction and tone

Allowed changes (only if explicitly authorized): small CSS/markup polish in the named components. No new mechanics, no scope change, no art-direction change.

After finishing:
- list findings ranked by severity
- list any edits made (or proposed if review-only)
- note checks run (typecheck/test/build) and what could not be run
- merge recommendation
```

## Prompt R-CONTENT: Content / Copy Pass

Use to add or refine authored game text (guest lines, events, KASSANDRA, day summaries).

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Read docs/PROJECT_CANON.md first, then docs/CONTENT_GUIDE.md, docs/MANAGEMENT_TRADEOFF_DESIGN.md, and the relevant data files under src/game/data/.

Task:
Add/refine authored content for <scope: guests / events / KASSANDRA / day summaries / stress events>.

Constraints:
- keep the dry, warm, cozy-absurd tone; no horror, no random nonsense
- no supernatural/weirdness language before the Day-7 hook
- content is data-driven: edit structured data, not UI logic
- placeholder lines must stay marked as placeholder until tone-reviewed
- no new mechanics, no scope change

Verification: npm run typecheck && npm run test (and build if data shapes changed — see Known Fragilities in TECH_ARCHITECTURE.md).

After finishing: summarize what text changed, confirm tone rules held, list checks run, merge recommendation.
```

## Prompt R-NARR: Narrative-Voice UI Wiring

Use to route authored narrative text into the UI (status lines, summaries, letter screen).

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Read docs/PROJECT_CANON.md first, then docs/CONTENT_GUIDE.md and the relevant engine + UI files.

Task:
Wire authored narrative voice into <UI surface>, keeping engine and presentation separate. Text stays real HTML/CSS/React text — never baked into images.

Constraints:
- keep the weirdness-visibility gate intact (no weirdness UI before weirdnessVisible is true)
- no new mechanics; presentation-only wiring plus any minimal selector needed
- preserve accessibility (focus, contrast, no color-only meaning)

Verification: npm run typecheck && npm run test && npm run build.

After finishing: summarize the wiring, confirm the weirdness gate still holds, list checks run, merge recommendation.
```

## Prompt R-ARTDOC: Art-Direction Document

Use to capture or update an approved visual direction as a doc (no asset production).

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Read docs/PROJECT_CANON.md first, then docs/ART_STYLEGUIDE.md, docs/ART_PIPELINE.md, and existing docs/art/ sheets.

Task:
Produce/update an art-direction document for <topic> under docs/art/, consistent with the canonical 3/4 diorama main view and the cozy-absurd tone.

Rules:
- documentation only; do not generate or commit assets
- do not change the main-view direction or tone without explicit user approval
- mark anything not yet approved as a candidate/open decision; keep open questions open

After finishing: summarize the doc, list any open decisions, merge recommendation.
```

## Prompt R-INTAKE: Pilot-Asset Intake Plan

Use to plan how curated pilot assets will enter the repo (gatekeeping, no integration yet).

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Read docs/PROJECT_CANON.md first, then docs/ART_PIPELINE.md, docs/art/PILOT_ASSET_INTAKE.md, docs/art/CAFE_DIORAMA_DIRECTION.md, and docs/QUALITY_CHECKLIST.md.

Task:
Define/extend the intake plan for the next pilot-asset batch: priority order, per-asset specs (dimensions, transparent PNG, no baked-in text), insertion points, CSS fallback to keep, and the approval checklist.

Rules:
- documentation only; no assets enter the repo in this step
- raw generated sheets stay in the external asset inbox (see ART_PIPELINE.md for the current path)
- assets are provisional, replaceable, CSS-fallback-backed; no main-view change

After finishing: summarize the plan/specs, list what a future extraction/integration prompt may and may not do, merge recommendation.
```

## Prompt R-EXTRACT: Pilot-Asset Extraction

Use to crop/clean approved pilot assets out of a raw sheet into the repo asset folders.

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Read docs/PROJECT_CANON.md first, then docs/ART_PIPELINE.md and docs/art/PILOT_ASSET_INTAKE.md (asset specs + approval checklist).

Task:
Extract approved pilot assets from the raw sheet <name> in the external asset inbox into the repo under assets/sprites/props/, assets/sprites/guests/, or assets/backgrounds/ per the intake specs.

Rules:
- only cropped, curated, approved single PNGs enter the repo; the raw sheet is NOT committed
- ensure real transparency (raw sheets may be fully opaque with an embedded checkerboard — flood-fill neutral/bright background, use premultiplied alpha on resize to avoid halos)
- if the source lives on Google Drive CloudStorage and is online-only/dataless, use a local non-CloudStorage copy as input
- record exact exported filenames + dimensions in PILOT_ASSET_INTAKE.md and source/approval notes in ASSET_CATALOG.md / ART_REVIEW_LOG.md
- assets stay provisional; keep all CSS fallbacks intact

After finishing: list exported files + dimensions, confirm no raw sheet was committed, note any quality caveats, merge recommendation.
```

## Prompt R-STAGE: Stage-Base Assessment / Integration

Use to assess and (optionally, experimentally) integrate a richer room-background asset.

```txt
You are working in the GitHub repository `cafe-apokalypso`.

Read docs/PROJECT_CANON.md first, then docs/art/CAFE_DIORAMA_DIRECTION.md, docs/ART_STYLEGUIDE.md, docs/art/PILOT_ASSET_INTAKE.md, and the café stage component.

Task:
Assess whether a candidate stage-base background improves the café demo, and if approved, integrate it experimentally as a low-z-index layer beneath the existing CSS props — keeping all fallback classes.

Critical check — projection:
- the canonical main view is FRONT-3/4. If the candidate is corner-isometric (or otherwise mismatched), this is an OPEN art-direction decision: document it (see DECISIONS.md "OPEN DECISION: Diorama Projection") and do NOT silently re-canonize the main view.
- mark any integrated mismatched base as experimental/provisional, not final art.

Rules:
- no main-view direction change without explicit user approval
- keep the CSS placeholder fallback classes intact (visual layering and states)
- note: the café stage wires its PNGs via static ESM imports (see
  src/ui/cafe/CafePlaceholder.tsx), so Vite resolves each imported asset at
  dev/build time. A statically-imported file that is absent breaks the build —
  the CSS fallback does NOT rescue it. So either commit the stage-base asset
  (so the import resolves) or reference it as a truly optional asset (runtime
  URL or guarded dynamic import that degrades to the CSS fallback when the file
  is missing) before relying on absent-asset resilience
- raw render stays in the external asset inbox; only the cleaned crop enters the repo

Verification: npm run typecheck && npm run test && npm run build.

After finishing: summarize the integration, list visual caveats (alignment/letterboxing), flag any open projection decision, merge recommendation.
```

---

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
