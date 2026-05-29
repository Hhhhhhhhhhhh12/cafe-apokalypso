# Agent Orchestration

## Purpose

This document defines how ChatGPT, Claude Code, Codex and later Claude Cowork should be used for Café Apokalypso.

Current coordination status:
- The project is already past Prompt 5.
- Credit tracking baseline after Prompt 4 was 487 remaining credits.
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
| Prompt 4 | Done | Credit baseline after this prompt: 487 remaining credits. |
| Prompt 5 | Done / awaiting logged review | Must be reviewed and logged before further work. |
| Prompt 6+ | Blocked | Requires Prompt 5 protocol and explicit approval. |

## Credit Ledger Rule

For all credit-consuming tools, maintain a short ledger.

Required format:

```md
| Run | Tool | Prompt | Start Credits | End Credits | Delta | Notes |
| --- | --- | --- | ---: | ---: | ---: | --- |
| 001 | Codex | Prompt 4 | unknown | 487 | unknown | Baseline recorded after Prompt 4. |
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

### Gemini / Google AI Studio / Nano Banana Workflow

Gemini, Google AI Studio, and Nano Banana may be used to reduce Codex credit usage for visual exploration.

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
2. Gemini / Google AI Studio / Nano Banana generates visual options.
3. The user selects or rejects directions.
4. Approved decisions are documented in `docs/art/` and, if binding, in `docs/ART_STYLEGUIDE.md`.
5. Codex only implements placeholders, metadata, rendering, or approved assets.

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
- continue beyond Prompt 5 without explicit review and approval
- spend credits without recording start/end credit state
    