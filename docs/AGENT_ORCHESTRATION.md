# Agent Orchestration

## Purpose

This document defines how ChatGPT, Claude Code, Codex and later Claude Cowork should be used for Café Apokalypso.

Current coordination status:
- The project has advanced well past the early prompts. Prompts through the S-series (S1–S4) plus the C6 pilot-asset integration are merged (PRs #10–#43). The app shell, Week-1 data model, deterministic 7-day loop, management tradeoff system, narrative-voice UI, and the first pixel-art pilot assets are all in `main`.
- Current frontier: documentation consolidation and reality sync (this pass). The next implementation frontier is art-direction follow-up — notably the Stage Base v04 projection decision (see [DECISIONS.md](DECISIONS.md) and [art/CAFE_DIORAMA_DIRECTION.md](art/CAFE_DIORAMA_DIRECTION.md)).
- Credit figures recorded in this document are stale/historical. They reflect early Codex usage and are no longer authoritative. Do not rely on them for planning.
- All further Claude Code / Codex work should still be logged with a run protocol (see Run Protocol below). The protocol can be expressed via Git history and PRs; ClickUp is optional.
- Results may be discussed in other chats, but this repository documentation (Git + Markdown) is the durable, canonical coordination layer. ClickUp, if used, is an optional human-readable overview only.

## Roles

### ChatGPT

Primary role:
- project canon
- scope control
- prioritisation
- decision review
- handoff preparation

ChatGPT keeps the project direction coherent.

### Claude Code

Primary role:
- documentation readiness
- architecture review
- broad repo analysis
- larger structural planning
- controlled file edits

Claude Code should be used before Codex when the task is broad, architectural or documentation-heavy.

### Codex

Primary role:
- focused implementation tasks
- tests
- bug fixes
- code review
- small refactors

Codex should not receive broad prompts such as “build the whole game”.

### Claude Cowork

Later role:
- guest ideas
- dialogue
- events
- narrative consistency
- flavour text
- weirdness curve brainstorming

Claude Cowork is not currently the primary coding or architecture tool.

## Default Handoff Order

1. ChatGPT: canon and scope check
2. Claude Code: documentation or architecture readiness
3. Codex: focused implementation
4. ChatGPT/User: review and next decision

## Codex Credit Rules

Codex credits are limited and should be used carefully.

Allowed:
- small implementation tickets
- focused review
- test/build fixes
- contained refactors

Avoid:
- build the whole game
- redesign the architecture
- refactor everything
- generate all content
- create final assets

## Handoff Tracking

Every actual handoff to Claude Code, Codex or another tool should be recorded. The canonical record is Git history (branches, commits, PRs) plus the Run Protocol below. ClickUp is an **optional** overview layer; it is no longer a mandatory gate.

Track (in the PR/commit description, run protocol, or — optionally — ClickUp):
- prompt ID
- tool
- actual model used (the specified model and the model that actually ran may differ; record what actually ran — see note below)
- related task, issue, or PR
- status
- result link (PR/commit) or placeholder
- start credits, if the tool consumes credits
- end credits, if the tool consumes credits
- credit delta
- files changed
- tests/checks run
- whether follow-up approval is required

GitHub + repository Markdown are the canonical source. ClickUp, if used, is a human-readable overview cockpit only; it is not the canonical source for rules or game decisions. Binding decisions must be documented in the repository Markdown files.

### Model-mismatch note

A run may execute on a different model than the prompt specifies. Observed example: prompts labelled for "Sonnet 4.6" actually ran on "Opus 4.8". The protocol should record the **actual** model that ran, not only the requested one, so the history stays honest.

## Run Protocol

Every Claude Code, Codex, or other agent run must produce a short protocol before another run is started.

Required protocol format:

```md
## Agent Run Protocol

Tool:
Model (actual / requested):
Prompt ID:
Related issue / PR (ClickUp task optional):
Start credits:
End credits:
Credit delta:
Branch:
Commit(s):
Files changed:
Tests/checks run:
Result summary:
Open problems:
Tool's suggested next step:
User/ChatGPT decision:
```

Rules:
- No new run may start if the previous run has no protocol.
- The protocol may be expressed via Git history and the PR description; ClickUp is optional.
- Record the model that actually ran (which may differ from the requested model).
- If work happens in another chat, its result must be copied into this protocol format or linked from the relevant PR/commit (or, optionally, ClickUp).
- If credits were not consumed, write `not applicable` instead of leaving the field blank.
- If tests were not run, explicitly write `not run` and explain why.

## Cross-Chat Coordination

Results can be analysed in another chat, but the durable project state must be mirrored in the repository:

- important run results go into Git history / the PR description (optionally mirrored to ClickUp)
- binding decisions go into `docs/DECISIONS.md`
- workflow changes go into `docs/WORKFLOW.md`
- prompt changes go into `docs/PROMPTS.md`
- art-direction decisions go into `docs/ART_STYLEGUIDE.md`
- production pipeline decisions go into `docs/ART_PIPELINE.md`
- quality/security/accessibility decisions go into `docs/QUALITY_CHECKLIST.md`

ChatGPT may help coordinate across chats, but repository documentation (Git + Markdown) is the reliable, canonical handoff layer; ClickUp, if used, is an optional overview. Do not rely on conversational memory alone.

## Prompt Progress Ledger

Reflects merged work through the S-series / PR #43. All rows below are merged into `main` unless noted.

| Prompt | Status | Notes |
| --- | --- | --- |
| Prompt 1 | Done or superseded | Initial documentation/consistency phase. |
| Prompt 2 | Done or superseded | Documentation readiness phase. |
| Prompt 3 | Done | Initial Vite + React + TypeScript app shell. |
| Prompt 4 | Done | Week-one data model. |
| Prompt 5 | Done | First deterministic 7-day progression loop. |
| Prompt 6A | Done | Management tradeoff design pass (Claude Code). |
| Prompt 6A.1 | Done | Approved tradeoff design saved to `docs/MANAGEMENT_TRADEOFF_DESIGN.md`. |
| Prompt 6B | Done | Week-1 management tradeoff system implemented (supplies, cleanliness, stress, helpers, weirdness gate). Save schema reached v5. |
| Prompt 7 | Done | UX / visual review pass. |
| Prompt 8A | Done | Content pass. |
| Prompt 8B | Done | Content pass (continuation). |
| Prompt 9A | Done | Narrative-voice UI wiring. |
| Prompt 10V | Done | Visual/diorama work. |
| Prompt 10C | Done | First visual diorama layout (`CafeDiorama` / café stage). |
| Prompt 10D | Done | Pixel-art asset pilot direction + intake. |
| Prompt 10E-A | Done | Pilot-asset intake / extraction. |
| Prompt 10E-A2 | Done | Batch 1 pilot asset extraction (see `docs/art/PILOT_ASSET_INTAKE.md` §9). |
| Prompt 10E-A3 | Done | Batch 2 café-prop extraction (see `docs/art/PILOT_ASSET_INTAKE.md` §10). |
| C6 | Done | Pilot-asset integration into the café view. |
| S1 | Done | Stage-base / polish series. |
| S2 | Done | Stage-base / polish series. |
| S3 | Done | Stage-base / polish series. |
| S4 | Done | Stage-base assessment + experimental Stage Base v03 integration (PR #43). **Current frontier.** |

**Current frontier:** documentation reality sync (this pass) and the open Stage Base v04 projection decision (front-3/4 vs. isometric vs. hybrid). See [DECISIONS.md](DECISIONS.md) and [art/CAFE_DIORAMA_DIRECTION.md](art/CAFE_DIORAMA_DIRECTION.md).

> Note: prompts 7 through S4 were executed from chat and may not all have individual reusable entries; recurring patterns are generalized in [PROMPTS.md](PROMPTS.md).

## Credit Ledger Rule

For all credit-consuming tools, maintain a short ledger.

> **The figures below are stale / historical.** They reflect early Codex usage only (around Prompts 4–5) and are no longer authoritative. Many later runs ran on Claude models and were not credit-tracked here. Treat this table as an archived example of the format, not as current credit state.

Required format (example, historical):

```md
| Run | Tool | Prompt | Start Credits | End Credits | Delta | Notes |
| --- | --- | --- | ---: | ---: | ---: | --- |
| 001 | Codex | Prompt 4 | unknown | 487 | unknown | Baseline recorded after Prompt 4 (historical). |
| 002 | Codex | Prompt 5 | 411 | 411 | 0 | Credit state reported after Prompt 5 review (historical). |
```

After each future credit-consuming run, append one row to the PR/commit description or a dedicated run log (optionally mirrored to ClickUp). Non-credit runs (e.g. Claude models without a credit meter) record `not applicable`.

## Tool Constraints

### Antigravity

Antigravity may be evaluated later as a coding or code-review tool only.

Antigravity is not part of the art pipeline and does not replace image-generation tools.

It must not be used for art direction, asset generation, moodboards, or character design.

### Image and Art-Direction Tools

Image tools (OpenAI ImageGen, Nano Banana / Gemini image tools, Google AI Studio image experiments) are art-direction tools only.

They are used for:

- moodboards
- concept images
- visual references
- style experiments
- character exploration
- café interior exploration
- UI look-and-feel exploration
- weirdness-escalation references

They do not write directly to the repository and do not make canonical design decisions. Their outputs must be reviewed, curated, and approved before entering the repository or game data.

### Art Documentation Branch Rule

Further repository changes related to art direction, moodboards, visual review sheets, art pipeline rules, or art styleguide updates should happen on a dedicated branch.

Recommended branch naming:

```text
art/<short-topic>
```

Examples:

```text
art/moodboard-cafe-interior
art/day1-day7-visual-progression
art/character-sheets
```

This applies to repository edits, not to raw image generation. Raw AI Studio / Gemini / Nano Banana image outputs may continue to be saved in the external moodboard working folder until they are reviewed and curated.

### Gemini / Google AI Studio / Nano Banana Workflow

Gemini, Google AI Studio, and Nano Banana may be used to reduce Codex credit usage for visual exploration.

Explorative Google-AI-Studio-/Gemini outputs and raw moodboards are stored outside the code repository. The current canonical external working location is the local asset inbox documented in [ART_PIPELINE.md](ART_PIPELINE.md):

```text
/Users/Heineken/Code/cafe-apokalypso-asset-inbox/
```

The older iCloud Moodboards path is historical. See `docs/ART_PIPELINE.md` for the authoritative external-path definition and the Google Drive CloudStorage online-only caveat. This external folder is a working area, not a canonical source for implementation. Only reviewed and curated decisions should be mirrored into repository documentation.

Use them for:

- quick moodboard batches
- rough character variants
- café atmosphere tests
- cozy-absurd lighting and color tests
- visual weirdness escalation from day 1 to day 7
- reference images for later production assets

Do not use them for:

- final repository assets without approval
- canonical character designs without a Character Sheet
- replacing `docs/ART_STYLEGUIDE.md` or `docs/ART_PIPELINE.md`
- implementation tasks that belong to Codex
- automated commits or direct file changes

Recommended flow:

1. ChatGPT creates the art brief, review sheet, and prompt variants.
2. Gemini / Google AI Studio / Nano Banana generates visual options outside the repo.
3. The user selects or rejects directions.
4. Raw image batches, prompt experiments, and rejected variants stay in the external moodboard folder.
5. Approved decisions are summarized in `docs/art/` and, if binding, in `docs/ART_STYLEGUIDE.md` or `docs/ART_PIPELINE.md`.
6. Codex only implements placeholders, metadata, rendering, or explicitly approved assets.


For now, Google image tools should be treated as moodboard and concept tools, not production tools.

## Visual Tool Coordination

Gemini, Google AI Studio, Nano Banana, and moodboard Markdown files are visual exploration inputs. They must not be treated as direct implementation instructions.

Rules:
- Claude Code may summarize moodboards and extract candidate art-direction decisions, but must mark them as candidates unless they are already reflected in `docs/ART_STYLEGUIDE.md` or `docs/ART_PIPELINE.md`.
- Codex must not convert Gemini, Google AI Studio, or Nano Banana outputs into final assets.
- Codex must not mix moodboard Markdown edits with gameplay, UI, engine, data-model, test, or build-system commits.
- Visual-reference branches should use the `art/*` prefix.
- Implementation branches should stay separate from visual exploration branches.
- If a visual decision should affect gameplay UI or implementation, ChatGPT/User must first approve it and the decision must be transferred into the canonical docs.
- Moodboards can guide placeholder layout and atmosphere only when the relevant rule is also documented in `docs/ART_STYLEGUIDE.md` or `docs/ART_PIPELINE.md`.



## Stop Conditions

Ask the user before proceeding if a task would:
- change MVP or demo scope
- change the main 3/4 café view
- add backend, auth, analytics or real AI API
- change art direction
- introduce a major dependency
- require broad rework if wrong
- start a new prompt/run while the previous run has no protocol
- spend credits without recording start/end credit state
