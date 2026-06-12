# Art / UI Optimization Backlog

Running overview of art/UI optimizations for Café Apokalypso. Maintained by the art
session. Newest decisions on top of each list. Status: ✅ done · 🔄 in progress · 📋 planned · ⏸ blocked/needs coordination.

> Source-of-truth for *mechanics* stays in `GAME_DESIGN.md` / `ROADMAP.md`. This file
> tracks the concrete visual/asset work and its state.

---

## ✅ Done (in `main`)

- **Diorama overlap cleanup** — hid ghost CSS furniture (tables, counter slab, props,
  mat, plant); dropped the coffee-machine onto the painted ledge; moved the waiting
  guest out of the corner.
- **Cem + Mira wired** as seated guests; distinct colors (Cem orange / Mira teal +
  orange hair) vs Paula (yellow). `:has()` hides the CSS blob backing.
- **Guest sprites enlarged** 64→108px for presence in the large room.
- **Pixellab prop pipeline validated** — style-referenced props match the warm house
  style. 10 props generated → `asset-inbox/candidates/`.
- **Tag convention** agreed: `gut` / `shabby` / `nice` / `special` (see asset-inbox `CANDIDATES.md`).
- **Worktree isolation** for parallel engine/art sessions (see `WORKFLOW.md`).

## 🔄 In progress

- **Shabby starter set** — 5 props tagged `shabby` in Pixellab (plant, clock, lamp,
  sack, cups). Pulling → curate → integrate as Day-1 tier-1 defaults.

## 📋 Planned (priority order)

1. **Wire shabby set as décor tier 1** ⏸ — needs coordination: engine owns
   `gameState.decor` tiers + wires `cafe-decor--tier-N` classes; art styles those
   classes (sprite per tier) in `global.css`. Keep the shared TSX edits minimal.
2. **Plant in the empty corner** — fill the bare floor; simplest first integration.
3. **3 missing normal guests** (Lukas grey / Christa camel+burgundy / Bohn navy) —
   AI Studio prompts ready in `asset-inbox/PROMPTS-guests-batch5.md`; needs owner's
   download step. Then extract + wire like Mira.
4. **Stage Base v04** (front-3/4 empty room) — the *root* fix for prop float; replaces
   the corner-isometric v03. Brief in `PILOT_ASSET_INTAKE.md`. Biggest single win.
5. **Pitch hero screenshot** — clean capture at a chosen day/state (e.g. Day 7, full
   café, weirdness visible) for the pitch deck.
6. **Nice tiers** (`nice`) for each prop slot — the upgrade targets of the décor shop.

## 📋 Post-MVP (tracked, not now)

- **Vegetation stages** for plants (time-driven wilt, cleaning waters; Phase 4) — see
  `GAME_DESIGN.md` "Living plants".
- **Kumquat** (`special`) asset + story: never wilts, the real save point, daily rustle.
- **Player identity** (disembodied keeper / Paula as first employee + side-view mission)
  — proposed, pending owner confirmation; affects whether a staff sprite is needed.

## ⚠️ Known issues / risks

- **v03 projection mismatch** — props are front-3/4 sprites over a corner-isometric
  painted room; perfect anchoring is fragile. Real fix = Stage Base v04. Current
  placements are "good enough", will be redone with v04.
- **"Seated" guests don't sit** — no tables in the painted floor, so seated guests are
  standing sprites placed on the floor. Acceptable for the slice.
- **Shared `CafePlaceholder.tsx`** — engine + art both edit it. Commit small + fast.
