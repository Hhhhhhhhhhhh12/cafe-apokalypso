# Agent Orchestration

## Purpose

This document defines how ChatGPT, Claude Code, Codex and later Claude Cowork should be used for Café Apokalypso.

Current coordination status:
- The project is past Prompt 5; Prompt 5 has been locally mini-tested and logged.
- Current known Codex credit state after Prompt 5 review: 411 remaining credits.
- Prompt 6A and Prompt 6A.1 are documentation/design handoffs; Prompt 6B is the next Codex implementation step after the working tree is clean.
- All further Claude Code / Codex work must be logged with a run protocol.
- Results may be discussed in other chats, but this repository documentation and ClickUp remain the durable coordination layer.

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

## ClickUp Tracking

Every actual handoff to Claude Code, Codex or another tool must be tracked in ClickUp.

Track:
- prompt ID
- tool
- related task or issue
- status
- result link or placeholder
- start credits, if the tool consumes credits
- end credits, if the tool consumes credits
- credit delta
- files changed
- tests/checks run
- whether follow-up approval is required

ClickUp is the human-readable coordination cockpit. It is not the canonical source for rules or game decisions. Binding decisions must still be documented in the repository Markdown files.

## Run Protocol

Every Claude Code, Codex, or other agent run must produce a short protocol before another run is started.

Required protocol format:

```md
## Agent Run Protocol

Tool:
Prompt ID:
Related ClickUp task:
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
- No Prompt 6 or later work may start until Prompt 5 results are reviewed and logged.
- No new run may start if the previous run has no protocol.
- If work happens in another chat, its result must be copied into this protocol format or linked from ClickUp.
- If credits were not consumed, write `not applicable` instead of leaving the field blank.
- If tests were not run, explicitly write `not run` and explain why.

## Cross-Chat Coordination

Results can be analysed in another chat, but the durable project state must be mirrored here:

- important run results go into ClickUp
- binding decisions go into `docs/DECISIONS.md`
- workflow changes go into `docs/WORKFLOW.md`
- prompt changes go into `docs/PROMPTS.md`
- art-direction decisions go into `docs/ART_STYLEGUIDE.md`
- production pipeline decisions go into `docs/ART_PIPELINE.md`
- quality/security/accessibility decisions go into `docs/QUALITY_CHECKLIST.md`

ChatGPT may help coordinate across chats, but repository documentation and ClickUp are the reliable handoff layer. Do not rely on conversational memory alone.

## Prompt Progress Ledger

Current known progress:

| Prompt | Status | Notes |
| --- | --- | --- |
| Prompt 1 | Done or superseded | Initial documentation/consistency phase complete enough to proceed. |
| Prompt 2 | Done or superseded | Documentation readiness phase complete enough to proceed. |
| Prompt 3 | Done | Initial app shell phase has been passed. |
| Prompt 4 | Done | Earlier credit baseline after this prompt: 487 remaining credits. |
| Prompt 5 | Done | First 7-day progression loop passed local mini-test and was logged in ClickUp. |
| Prompt 6A | Done | Management tradeoff design pass completed with Claude Code and logged in ClickUp. |
| Prompt 6A.1 | Done | Approved management tradeoff design saved to `docs/MANAGEMENT_TRADEOFF_DESIGN.md` and logged in ClickUp. |
| Prompt 6B | Next | Codex implementation may start after `main` is clean and current credits are confirmed. |

## Credit Ledger Rule

For all credit-consuming tools, maintain a short ledger.

Required format:

```md
| Run | Tool | Prompt | Start Credits | End Credits | Delta | Notes |
| --- | --- | --- | ---: | ---: | ---: | --- |
| 001 | Codex | Prompt 4 | unknown | 487 | unknown | Baseline recorded after Prompt 4. |
| 002 | Codex | Prompt 5 | 411 | 411 | 0 | Credit state reported after Prompt 5 review; exact run delta not recorded. |
```

After each future run, append one row in the relevant ClickUp task comment or project log. If the repository gains a dedicated run log later, mirror the same table there.

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

Explorative Google-AI-Studio-/Gemini outputs and raw moodboards are stored outside the code repository. Current external working location:

```text
/Users/Heineken/Library/Mobile Documents/com~apple~CloudDocs/Claude/Moodboards Apokalypso
```

This external folder is a working area, not a canonical source for implementation. Only reviewed and curated decisions should be mirrored into repository documentation.

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
