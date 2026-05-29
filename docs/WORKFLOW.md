# Workflow

## Agent Roles

### ChatGPT

Used for concept development, task decomposition, prompt writing, review, and documentation updates.

### Claude Code

Used for:
- creating and maintaining repository structure
- turning design decisions into documentation
- architecture planning
- large refactoring passes
- reviewing consistency across docs and source files

Claude Code should not invent new core design directions unless explicitly asked.

### Codex

Used for:
- implementing focused issues
- writing and updating tests
- fixing bugs
- creating UI components
- improving TypeScript types
- performing small-to-medium refactors

Codex should work issue by issue and keep changes reviewable.

## GitHub

GitHub is the operational center for Café Apokalypso.

Markdown documentation remains the canonical source of truth for:
- game design
- MVP scope
- architecture
- art direction
- content tone
- workflow decisions

GitHub Issues are used for concrete, actionable work packages.
Use Projects for planning and status.
Use Pull Requests or commit groups to document reviewable repository changes.
Use GitHub Actions as soon as code exists.

GitHub is not the place for binding design canon unless the decision is also reflected in the relevant Markdown documentation.

### GitHub Issues

Use Issues for:
- implementation tasks
- bugs
- test coverage
- accessibility checks
- security checks
- art review tasks
- documentation updates
- Codex, Claude Code, Antigravity, or other tool handoffs

Broad placeholder issues should be closed once their baseline work is implemented. Follow-up work should be tracked as focused issues with clear acceptance criteria.

New issues should use clear, non-numbered titles and include:
- goal
- context
- acceptance criteria
- relevant docs
- verification steps
- out-of-scope items

Issues that are ready for implementation should be labelled `codex-ready` or `claude-ready`.
Issues with unresolved design, product, scope, or art decisions should be labelled `needs-decision`.

## Rule

Do not add a third coding AI agent during early MVP development. Prefer clearer issues, better acceptance criteria, and automated checks over more agents.

## Handoff Timing

Do not hand work to Claude Code or Codex too early.

Before implementation starts, the following should be documented clearly:

- MVP scope
- week-one gameplay structure
- core data lists
- main gameplay view
- technical architecture
- content tone
- acceptance criteria for the first vertical slice

Claude Code can be used earlier for documentation and repository structure. Codex should only start implementation once the task is narrow, testable, and tied to a specific issue or file set.

## Preferred Handoff Order

1. ChatGPT develops concept, scope, data lists, and prompts with the user.
2. Claude Code prepares or updates repository documentation and reviews consistency.
3. Codex implements focused slices from the agreed documentation.
4. Claude Code or ChatGPT reviews larger consistency questions.
5. Codex fixes concrete issues and tests.

## Task Format for Claude Code

Claude Code tasks should be framed as documentation, architecture, or consistency tasks.

Good Claude Code task examples:

- Create or update documentation files from the agreed design notes.
- Check whether `GAME_DESIGN.md`, `MVP_SCOPE.md`, and `DECISIONS.md` contradict each other.
- Propose a repository structure that supports the documented MVP.
- Review whether implementation files follow the documented architecture.

Avoid asking Claude Code to invent major new core mechanics unless explicitly requested.

## Task Format for Codex

Codex tasks should be focused implementation tasks with clear acceptance criteria.

Good Codex task examples:

- Implement the week-one data model from `MVP_SCOPE.md`.
- Add deterministic game-state transitions for serving a guest.
- Add localStorage save/load with tests.
- Build the first café screen using the documented 3/4 pixel-diorama layout.
- Add tests for advertising effects and staff effects.

Avoid giving Codex broad prompts such as “build the game” without a constrained scope.

## Documentation Rule

Any meaningful change to the game concept, architecture, MVP scope, pacing, content tone, or agent workflow must be reflected in the relevant Markdown documentation.

When a GitHub Issue leads to a meaningful design, architecture, MVP, art, content, or workflow decision, the related Markdown documentation must be updated before the issue is considered complete.

Recommended destinations:

- `docs/DECISIONS.md` for binding design or technical decisions
- `docs/GAME_DESIGN.md` for gameplay systems and player experience
- `docs/MVP_SCOPE.md` for what is included or excluded from the first vertical slice
- `docs/CONTENT_GUIDE.md` for tone, writing style, character voice, and text examples
- `docs/TECH_ARCHITECTURE.md` for implementation constraints and structure
- `docs/WORKFLOW.md` for agent use, handoff rules, and development process
- `docs/ROADMAP.md` for future phases beyond MVP
- `docs/ART_PIPELINE.md` and `docs/ART_STYLEGUIDE.md` for art process, visual direction, and approval rules
- `docs/art/` for Character Sheets, Level-/Day-Sheets, UI Sheets, Asset Sheets, Moodboard Sheets, review logs, and visual approval notes

Do not overwrite existing notes from other chats without review. Prefer additive updates and short summaries when merging.


## Visual Exploration Workflow

Visual exploration with Gemini, Google AI Studio, Nano Banana, image prompts, generated references, and moodboard Markdown files is handled separately from implementation work.

Rules:

- Visual exploration belongs on dedicated `art/*` branches whenever possible.
- Moodboard Markdown commits must not be mixed with gameplay, UI, engine, test, or build-system commits.
- Generated images, prompt notes, and tool comparisons are reference material, not canonical game assets.
- A visual decision becomes binding only when it is transferred into `docs/ART_STYLEGUIDE.md`, `docs/ART_PIPELINE.md`, or another relevant canonical document.
- Codex implementation prompts must treat moodboards as reference material only, not as direct implementation instructions.
- Claude Code may summarize moodboards and propose canonical art-rule updates, but must mark them as proposals until the user approves them.
- Codex must not convert Gemini, Google AI Studio, or Nano Banana outputs into final assets.

Recommended visual exploration branches:

- `art/moodboard-cafe-interior-001`
- `art/day1-day7-visual-progression`
- `art/google-ai-studio-gemini-references`

## Art Review and Approval Requirement

Final visual assets should not be produced or committed before the relevant review sheet exists and has been reviewed by the user.

This applies to:

- major character designs
- new café interior directions
- major UI screens or visual systems
- recurring props, icons, and object sets
- visible changes to the weirdness or apocalypse escalation
- moodboard-driven style decisions

Review material belongs in `docs/art/`. Binding art-process rules belong in `docs/ART_PIPELINE.md` and `docs/ART_STYLEGUIDE.md`.

Codex may implement placeholders, asset metadata, folder structure, and rendering components before final art exists. Codex should not introduce final artwork, a different main-view perspective, or canonical character designs without documented approval.

## Acceptance Criteria Requirement

Every implementation task should include acceptance criteria before Codex starts.

Acceptance criteria should cover:

- expected player-visible behavior
- affected data or state
- expected tests
- out-of-scope items
- whether documentation must be updated

Example:

```txt
Task: Implement temporary staff for week 1.

Acceptance criteria:
- Jana, Nino, and Mira exist as data entries.
- Staff can be hired for one day starting day 5.
- Staff cost is deducted at day start or hire time.
- Staff effects modify service, cleanliness, reputation, or guest flow.
- End-of-day flavor lines can appear.
- Tests cover staff cost and at least one staff effect.
- Permanent hiring and shift planning remain out of scope.
```

## Verification Rule

Whenever code exists, implementation changes should be verified before they are considered done.

Preferred checks:

- typecheck
- tests
- build
- lint, if configured

If a check cannot be run, the reason should be documented in the handoff or final summary.

## Git Hygiene

Work should stay reviewable.

Guidelines:

- small commits or clear commit groups
- one main concern per issue
- avoid mixing large concept changes with implementation changes
- avoid unrelated formatting churn
- keep generated files out of commits unless intentionally required
- keep `.DS_Store` and other local artifacts out of the repository

## Current Build Strategy

The first target is a playable seven-day vertical slice.

Do not attempt full long-term game systems before the week-one loop works.

Implementation priority:

1. deterministic game state
2. week-one data
3. core order/resource loop
4. day progression
5. simple café UI
6. advertising
7. temporary staff
8. KASSANDRA update
9. weirdness reveal and day-7 hook
10. tests and README polish

## Agent Prompt Storage

The canonical source for reusable handoff prompts is `docs/PROMPTS.md`.

Do not copy prompts directly from chat when handing them to Claude Code, Codex, or another tool. Use the prompts in `docs/PROMPTS.md` and update that file if a prompt needs to change.

Phase-level notes and context belong in `docs/ROADMAP.md`. Implementation-specific detail belongs in GitHub issue descriptions.

## ClickUp Tracking Requirement

Every actual prompt handoff to Claude Code, Codex, Antigravity, or another tool must be tracked in ClickUp.

Track:
- prompt ID (e.g. PROMPT-1, PROMPT-2)
- tool used
- related ClickUp task or GitHub issue
- status (in progress / complete / blocked)
- result link or placeholder

A handoff that is not tracked in ClickUp is not considered officially handed off. This keeps the project auditable and prevents duplicate or contradictory work across tools.
