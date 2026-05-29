# Agent Orchestration

## Purpose

This document defines how ChatGPT, Claude Code, Codex and later Claude Cowork should be used for Café Apokalypso.

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

Every actual handoff to Claude Code, Codex or another tool should be tracked in ClickUp.

Track:
- prompt ID
- tool
- related task or issue
- status
- result link or placeholder

## Tool Constraints

### Antigravity

Antigravity may be evaluated later as a coding or code-review tool only.

Antigravity is not part of the art pipeline and does not replace image-generation tools.

It must not be used for art direction, asset generation, moodboards, or character design.

### Image and Art-Direction Tools

Image tools (OpenAI ImageGen, Nano Banana / Gemini image tools, Google AI Studio image experiments) are art-direction tools only.

They are used for moodboards, concept images, visual references, and style experiments.

They do not write directly to the repository and do not make canonical design decisions. Their outputs must be reviewed, curated, and approved before entering the repository or game data.

## Stop Conditions

Ask the user before proceeding if a task would:
- change MVP or demo scope
- change the main 3/4 café view
- add backend, auth, analytics or real AI API
- change art direction
- introduce a major dependency
- require broad rework if wrong
