# Café Apokalypso – Project Canon

## Purpose

This document is the top-level canonical context for Café Apokalypso. Claude Code, Codex and future contributors should read this first.

## Current target

The immediate goal is a short playable vertical slice demo for portfolio/application review.

It should make visitors spend 15–20 minutes in the game and want to see Day 8.

This is not the full game and not a final production MVP.

## Game concept

Café Apokalypso is a cozy-absurd solo management web game.

The player starts with a seemingly normal small café. Early gameplay focuses on micromanagement: serving guests, prices, ingredients, cleaning and first advertising.

Over time, guests, events and systems become increasingly strange: mythological regulars, AI-oracle hints, bureaucratic apocalypse systems and reality glitches.

The long-term game shifts from micromanagement to macromanagement: staff, delegation, marketing, economy, expansion and delaying world-ending incidents.

## Tone

Cozy, witty, clever, lightly absurd.

Not horror.
Not grimdark.
Not random nonsense.

The weirdness should be carefully dosed but impossible to miss by Day 7.

## Demo scope

The demo covers the first 7 in-game days.

The player should be able to:
- serve guests
- manage simple resources
- adjust prices or offers
- buy basic ingredients
- clean the café
- run small ads
- experience scripted guest/event moments
- notice escalating weirdness
- reach a clear Day 7 cliffhanger

## Day 7 goal

By the end of Day 7, the player should understand:

Something is wrong with this café.

The ideal reaction is:

“I want to know what happens on Day 8.”

## Core characters/systems

### Mira

Mira is an early memorable recurring guest / freelancer-style regular and tone anchor.

She should feel mostly normal at first: witty, observant and slightly strange, but not obviously mythological. Mira helps establish the café's early everyday rhythm and dry humor.

### Meda

Meda is a separate early strange character who visually evokes Medusa.

She should be one of the first clearer mythological hints, but still carefully dosed for the demo. She may wear sunglasses, avoid direct eye contact, have subtle snake-like hair silhouettes or create small unsettling effects around other guests.

Meda is not Mira. Do not merge them.

### KASSANDRA

KASSANDRA is not a real AI system in the demo.

For now, KASSANDRA is a scripted oracle/system UI that teases future prediction and apocalypse-management mechanics.

No external AI API is allowed.

## View direction

The main gameplay view is a small, dense pixel-café in a 3/4 diorama perspective.

No side-view as the default gameplay view.

Side-view may only be used later for special missions or event scenes.

## Technical constraints

- Vite
- React
- TypeScript
- static web app
- no backend
- no accounts
- no tracking
- no real AI API
- localStorage save only
- deterministic game logic
- game engine/state should stay separate from UI components

## Repo and demo visibility

The repo should make the playable demo obvious.

README should include:
- “Play the demo” link near the top
- screenshot or GIF
- “What you can try” section
- local run instructions

The preferred hosted demo target is GitHub Pages:

https://hhhhhhhhhhhh12.github.io/cafe-apokalypso/

## Art and image tooling

Image tools may be used for art direction, moodboards, concept images, visual reference sheets and early UI experiments.

Allowed art-direction tools include:
- OpenAI ImageGen
- Nano Banana / Gemini image tools
- Google AI Studio for image experiments if useful
- Figma, Excalidraw, GoodNotes, Aseprite or similar non-coding visual tools

These tools are not coding agents and should not write directly to the repository.

Antigravity may be evaluated later as a coding/review tool, but it is not part of the art pipeline and does not replace image-generation tools.

Generated images are not final production assets by default. They must be reviewed, curated and documented before becoming part of the game or repository.

## Agent workflow

All agents must read this file first before making changes.

Handoff prompts should not be copied directly from chat when they are actually used.

The canonical source for reusable handoff prompts is `docs/PROMPTS.md`.

Every prompt that is actually handed to Claude Code, Codex or another tool must be tracked in ClickUp.

### Claude Code

Use Claude Code for:
- documentation consolidation
- architecture readiness
- broad structural planning
- first implementation planning

Claude Code should ask before broad edits.

### Codex

Use Codex carefully because credits are limited.

Use Codex for:
- focused implementation tasks
- code review
- simplification
- test/build fixes
- PR-style review

Do not give Codex broad “build the whole game” prompts.

## Decision Making

Any change that may cause significant rework must be approved by the user before implementation.

Examples:
- changing game scope
- changing view direction
- changing tech stack
- changing progression structure
- changing core gameplay loops

When in doubt, ask first.

## First implementation order

1. Documentation sanity check
2. Technical architecture
3. Vite React TypeScript app shell
4. Deterministic game-state skeleton
5. Data model for guests/resources/days/events
6. First 7-day loop
7. Café dashboard with 3/4-inspired placeholder
8. localStorage save/load
9. Basic tests
10. GitHub Pages/readme/demo polish

## Deliberately out of scope for now

- real AI
- backend
- accounts
- multiplayer
- final pixel art
- complex staff system
- complex economy simulation
- multiple locations
- full apocalypse-management layer
- deep balancing
- production asset pipeline

## Source of truth

This file is the first source of truth for the project.

Repository Markdown files are canonical. Historical chat exports, old prompt drafts and external notes are reference material only.


If historical notes conflict with `docs/PROJECT_CANON.md`, `docs/PROJECT_CANON.md` wins unless the user explicitly decides otherwise.

Downstream design documents must mirror this canon. In particular, `docs/GAME_DESIGN.md`, `docs/CONTENT_GUIDE.md` and `docs/MVP_SCOPE.md` should stay aligned with the current target, core characters, view direction, technical constraints and handoff workflow.

## Rule for future handoffs

Any agent prompt in `docs/PROMPTS.md` should include:
- goal
- context files
- allowed changes
- forbidden changes
- acceptance criteria
- verification commands
- ClickUp tracking note / prompt handoff status

ClickUp should show which prompt was handed over, to which tool, for which issue/task, and with what status.

If a decision would cause broad rework, ask the user first.
