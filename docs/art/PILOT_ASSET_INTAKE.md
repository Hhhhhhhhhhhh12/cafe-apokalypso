# Pilot Asset Intake Plan

Intake control document for the first curated pixel-art pilot assets.
Source context: PROMPT-10D (café stage dominance) and its Asset Request Report.

---

## 1. Purpose

This document controls **how the first curated pilot assets enter the project**.

It is the gatekeeping plan between art exploration (external moodboards, AI image
tools) and the repository. No pilot PNG should enter `assets/` or `src/assets/`
until it has passed the approval checklist defined here.

These pilot assets are **provisional vertical-slice assets, not final art**:

- They prove the 3/4 cozy café direction works at game scale.
- They are replaceable at any time without breaking the layout.
- They remain provisional unless later explicitly marked final in
  [../ART_PIPELINE.md](../ART_PIPELINE.md).
- Every pilot asset position keeps its CSS placeholder fallback (see
  [CAFE_DIORAMA_DIRECTION.md](CAFE_DIORAMA_DIRECTION.md) §6).

This plan is documentation only. It does not add assets, does not modify app code,
and does not declare any art final. It defines the order, specs, rules, and
hand-off needed before a future implementation prompt (10E-B) wires assets in.

Related canon:
[../MVP_SCOPE.md](../MVP_SCOPE.md) (MVP Art Scope),
[../ART_PIPELINE.md](../ART_PIPELINE.md) (Pilot-Asset-Regeln),
[../ART_STYLEGUIDE.md](../ART_STYLEGUIDE.md),
[../QUALITY_CHECKLIST.md](../QUALITY_CHECKLIST.md) (Art Review QA),
[CAFE_DIORAMA_DIRECTION.md](CAFE_DIORAMA_DIRECTION.md).

---

## 2. Asset priority order

Assets are produced and reviewed in batches. Prove the normal/cozy baseline first,
then add the second silhouette class and the first strange-but-coexisting design,
then defer everything that needs the normal style locked or an animation system.

### Batch 1 — prove the counter and the baseline guest

- Coffee machine prop
- KASSANDRA / register prop
- Paula guest sprite

### Batch 2 — second silhouette class and first flavor props

- Table / chair set
- Cem guest sprite
- Croissant display **or** menu board (one flavor prop, not both required)

### Later — only after the normal style is locked

- Meda (first clearer mythological design; do not attempt before the normal
  guest look is approved and locked)
- Full weirdness overlays (clock anomaly, endless receipt, form stack, portal cup)
- Full background / layered art (Day 1–7 background slices and layers)
- Animation / sprite sheets (walk / idle / sit cycles, 8-direction sets)

---

## 3. Asset specifications

Specifications for every asset in Batch 1 and Batch 2. All pilot assets:
**transparent PNG · pixel-readable at game scale · static only for MVP**.

The "existing CSS fallback" column names the placeholder element already present in
`src/ui/cafe/CafePlaceholder.tsx` that must keep rendering if the asset is missing.
"Working filename" uses the `placeholder-` prefix per
[../ART_STYLEGUIDE.md](../ART_STYLEGUIDE.md); a later final asset would be renamed
to the `sprite-*` convention in [CAFE_DIORAMA_DIRECTION.md](CAFE_DIORAMA_DIRECTION.md) §6.

### Batch 1

#### Coffee machine prop

- **Working filename:** `placeholder-cafe-coffee-machine.png`
- **Intended future repo path:** `assets/sprites/props/placeholder-cafe-coffee-machine.png`
- **Dimensions:** 48×48 or 64×48 px
- **Transparent background:** required
- **Static / animation:** static only (no steam/glow animation in MVP)
- **Visual purpose:** emotional anchor of the counter and the eye's first stop;
  the site of the Day-1 "Good morning. It is 14:07." anomaly. Must read clearly as
  a coffee machine, never confused with the shelf or the register.
- **Existing CSS fallback to keep:** `cafe-coffee-machine` (with
  `cafe-coffee-machine__screen`, `cafe-coffee-machine__steam`)
- **Insertion point:** counter rear-left/center inside the `cafe-counter` zone of
  the café stage layout.

#### KASSANDRA / register prop

- **Working filename:** `placeholder-kassandra-register.png`
- **Intended future repo path:** `assets/sprites/props/placeholder-kassandra-register.png`
- **Dimensions:** 32×32 or 48×32 px
- **Transparent background:** required
- **Static / animation:** static only (no glow/receipt animation in MVP)
- **Visual purpose:** point-of-sale device near the right of the counter;
  understated, slightly too modern for the rest of the café. Visually distinct from
  the coffee machine. **No baked-in screen text** — KASSANDRA messages stay in the
  React UI layer.
- **Existing CSS fallback to keep:** `cafe-register` + `placeholder-kassandra-ui`
  (with `cafe-register__screen`, `cafe-register__receipt`)
- **Insertion point:** counter right side inside the `cafe-counter` zone.

#### Paula guest sprite

- **Working filename:** `placeholder-guest-paula.png`
- **Intended future repo path:** `assets/sprites/guests/placeholder-guest-paula.png`
- **Dimensions:** 32×32 px
- **Transparent background:** required
- **Static / animation:** static only (one pose, one facing angle, no walk/idle/sit)
- **Visual purpose:** the baseline "normal guest" archetype — upright commuter
  posture, practical coat, quick to read. Sets the normal silhouette and palette the
  rest of the cast is measured against. Strong silhouette over facial detail.
- **Existing CSS fallback to keep:** `placeholder-guest-normal-01` (one of the
  `placeholder-guest` table/queue positions)
- **Insertion point:** a table or queue guest position in the café stage
  (`cafe-table--left` / `--right` seating area or the queue zone).

### Batch 2

#### Table / chair set

- **Working filename:** `placeholder-table-chair-set.png`
- **Intended future repo path:** `assets/sprites/props/placeholder-table-chair-set.png`
- **Dimensions:** 64×48 px
- **Transparent background:** required
- **Static / animation:** static only
- **Visual purpose:** a small café table with chair(s) in 3/4 view, giving guest
  sprites a believable place to sit and a surface for cleanliness cues (leftover
  cups). Perspective must match the 3/4 camera (top + front faces visible).
- **Existing CSS fallback to keep:** `cafe-table` (`cafe-table--left` /
  `cafe-table--right`, with `cafe-table__top`) and `cafe-chair`
  (`cafe-chair--front` / `cafe-chair--side`)
- **Insertion point:** the mid/right floor table zones of the café stage.

#### Cem guest sprite

- **Working filename:** `placeholder-guest-cem.png`
- **Intended future repo path:** `assets/sprites/guests/placeholder-guest-cem.png`
- **Dimensions:** 32×32 px
- **Transparent background:** required
- **Static / animation:** static only (one pose, one facing angle)
- **Visual purpose:** a second normal-guest type with a **different silhouette
  class** to Paula — slight forward lean, delivery jacket/bag silhouette. Proves the
  baseline look generalizes across body shapes before any strange guest is attempted.
- **Existing CSS fallback to keep:** `placeholder-guest-normal-02`
- **Insertion point:** a second table or queue guest position in the café stage.

#### Croissant display **or** menu board (one flavor prop)

- **Working filename:** `placeholder-croissant-display.png`
  (alternative: `placeholder-menu-board.png`)
- **Intended future repo path:**
  `assets/sprites/props/placeholder-croissant-display.png`
  (alternative: `assets/sprites/props/placeholder-menu-board.png`)
- **Dimensions:** 32×32 px (croissant display); menu board sized to its rear-wall frame
- **Transparent background:** required
- **Static / animation:** static only
- **Visual purpose:** counter/rear-wall flavor that warms the café. **No baked-in
  text** — if the menu board is chosen, product names and prices stay in HTML/CSS/React;
  the board is only a visual frame.
- **Existing CSS fallback to keep:** `cafe-menu-board` (menu board) or the
  `cafe-counter-props` area (croissant display)
- **Insertion point:** on the counter (`cafe-counter-props`) or the rear wall above
  the counter (`cafe-menu-board`).

---

## 4. External working folder rule

Raw AI Studio / Gemini / Nano Banana outputs **remain outside the repository**.

Suggested external working folder (iCloud workspace, not versioned):

```text
/Users/Heineken/Library/Mobile Documents/com~apple~CloudDocs/Claude/Moodboards Apokalypso
```

This folder is an exploration and experiment space, **not** a canonical source for
implementation, assets, or Codex tasks.

- Raw generated sheets, variant batches, discarded directions, and large image files
  stay in the external folder.
- Only **cropped, curated, explicitly approved pilot PNGs** may enter the repository
  later — and only after passing the approval checklist in §5.
- Approval must be documented before an asset is treated as canonical:
  source note in [ASSET_CATALOG.md](ASSET_CATALOG.md), approval note in
  [ART_REVIEW_LOG.md](ART_REVIEW_LOG.md).

This mirrors the rule already stated in
[../ART_PIPELINE.md](../ART_PIPELINE.md) and
[CAFE_DIORAMA_DIRECTION.md](CAFE_DIORAMA_DIRECTION.md) §6.

---

## 5. Approval checklist

Before **any** pilot asset enters the repository, all of the following must be true:

- [ ] Transparent PNG.
- [ ] No baked-in UI text (no product names, prices, labels, KASSANDRA messages, or
      menu copy embedded in pixels).
- [ ] Correct dimensions per §3.
- [ ] Pixel-readable at game scale (recognizable from its silhouette without zooming).
- [ ] Visually consistent with the Day-1 normal/cozy baseline (warm café palette;
      no glossy AI render, no neon, no horror framing).
- [ ] Source / batch noted (which tool/approach produced it) in
      [ASSET_CATALOG.md](ASSET_CATALOG.md).
- [ ] Explicitly approved by the user.
- [ ] CSS placeholder fallback still works for that position (asset can be removed
      and the layout still renders).
- [ ] No raw sheets committed (only the single cropped, curated PNG enters the repo).

An asset failing any item stays in the external working folder.

---

## 6. Implementation contract for future PROMPT-10E-B

A future implementation prompt (PROMPT-10E-B) **may**:

- Create the asset folders `src/assets/sprites/props/` and
  `src/assets/sprites/guests/`.
- Add optional, typed asset references / a mapping from asset key → import (with a
  defined fallback when the asset is absent).
- Insert approved assets into the existing café stage layout in
  `src/ui/cafe/CafePlaceholder.tsx`, at the insertion points named in §3.
- Keep all CSS placeholder/fallback classes (listed in §3) intact as fallback.
- Add tests proving the app renders **both with and without** the assets present.

A future implementation prompt **may not**:

- Declare any asset as final art.
- Add an animation system (walk / idle / sit cycles).
- Add sprite sheets or 8-direction sets.
- Change the canonical 3/4 café main view.
- Bake UI text into images, or move UI text out of HTML/CSS/React.
- Commit raw AI-generated sheets.

This contract keeps 10E-B narrow: folder + optional references + insertion +
fallback + tests, nothing more.

---

## 7. Graphics-chat handoff

Compact brief for the graphics / image-generation chat.

```text
PILOT ASSET HANDOFF — Café Apokalypso (vertical-slice pilot, NOT final art)

First asset to generate:
  - placeholder-cafe-coffee-machine.png   (48×48 or 64×48)

Next 2–3 assets:
  - placeholder-kassandra-register.png    (32×32 or 48×32)
  - placeholder-guest-paula.png           (32×32)
  - placeholder-guest-cem.png             (32×32)

All assets:
  - transparent background PNG
  - pixel-art, readable at game scale (recognizable by silhouette)
  - static, single pose, single facing angle
  - 3/4 diorama perspective (top + front faces visible)
  - warm cozy café palette: creams, browns, muted reds, soft yellows
  - no glossy AI render, no neon, no high-saturation web colors
  - NO baked-in text (no labels, prices, screen text, menu copy)
  - strong silhouette over facial detail for guests

Not needed yet:
  - Meda or any strange guest (wait until normal look is locked)
  - weirdness overlays (clock, receipt, portal cup, form stack)
  - background / layered Day 1–7 art
  - animations / sprite sheets / 8-direction sets

Deliver as cropped single PNGs into the external Moodboards folder.
Only approved crops enter the repo later.
```

---

## 8. Out of scope

Explicitly out of scope for this intake plan and for the pilot it governs:

- Full background paintings.
- All guest sprites (the full 9-guest roster).
- Full sprite sheets.
- Walking / idle / sitting animations.
- Final Meda art before the normal style is locked.
- Raw AI batches in the repo.
- UI text baked into images.

---

## 9. PROMPT-10E-A2 extraction log

Batch 1 provisional pilot assets were extracted from the Google AI Studio pilot
sheet `asset-pilot-v0-1.png`. The raw sheet stays outside the repository in the
external Google AI Studio working folder and must not be committed.

- **Status:** provisional pilot assets only; not final art.
- **Transparency result:** source PNG was RGBA but fully opaque, so the
  checkerboard background was embedded in the pixels. The checkerboard was
  removed and the exported PNGs use real transparency.
- **Exported files:**
  - `assets/sprites/props/placeholder-cafe-coffee-machine.png` — 64×48 px
  - `assets/sprites/props/placeholder-kassandra-register.png` — 48×32 px
  - `assets/sprites/guests/placeholder-guest-paula.png` — 40×48 px
- **Known limitations:** Paula remains 40×48 px for this pilot to preserve the
  yellow-coat silhouette; do not force her down to 32×32 until the guest style is
  reviewed. The assets are single-pose static crops and may be replaced after
  art review.
- **Fallback reminder:** keep the existing CSS fallbacks intact, including
  `cafe-coffee-machine`, `cafe-register`, `placeholder-guest-*`, `cafe-table`,
  `cafe-chair`, `cafe-cup`, `cafe-counter-props`, and `cafe-service-mat`.

---

## 10. PROMPT-10E-A3 extraction log (Batch 2 café props)

Batch 2 provisional café **prop** assets were extracted from the Google AI Studio
raw sheet `ca-asset-batch-02-cafe-props-raw-v01.png` (1024×1024). The raw sheet
lives outside the repository (Google AI Studio working folder) and was **not**
committed. (The original CloudStorage copy was online-only/dataless and could not
be read; a local non-CloudStorage copy was used as input. No raw file enters the
repo.)

- **Status:** provisional pilot assets only; **not final art**. Not yet wired into
  React/CSS — extraction only.
- **Source / transparency result:** source PNG was RGBA but **fully opaque**
  (alpha uniformly 255), so it had **no real alpha** — the background was an
  **embedded checkerboard** (white `~255` + light gray `~232`, both neutral). The
  checkerboard was removed via an edge-connected flood fill over neutral+bright
  pixels, so light asset interiors (cup body, glass-case interior) were preserved.
  Exported PNGs now use **real transparency**. Resizing used premultiplied alpha to
  avoid edge halos.
- **Exported files (exact dimensions):**
  - `assets/sprites/props/placeholder-table-chair-set.png` — 64×48 px
  - `assets/sprites/props/placeholder-croissant-display.png` — 64×48 px
  - `assets/sprites/props/placeholder-cafe-cup.png` — 32×32 px
  - `assets/sprites/props/placeholder-service-mat.png` — 48×32 px
  - `assets/sprites/props/placeholder-counter-props.png` — 64×48 px
  - Each asset was fit (aspect-preserved) inside its target box and centered on a
    transparent canvas, so the visible art may be slightly narrower/shorter than the
    canvas — this avoids stretching.
- **Known caveats:**
  - **Café cup steam:** the steam was drawn as very faint, near-white wisps. Pure
    near-white wisp pixels were indistinguishable from the white checker and were
    removed; only the slightly tinted steam remains, so the steam reads but is
    **faint and somewhat fragmented**, especially at 32×32. Acceptable for a
    provisional asset; revisit if stronger steam is wanted.
  - **Croissant display:** strongest asset; the glass case panels are intentionally
    see-through (only the frame edges and the pastries inside remain opaque), which
    reads correctly as a glass display case.
  - **Table-chair-set:** remains readable and demo-usable at 64×48 (round table,
    two chairs, pedestal base all distinct); 72×56 was **not** required.
  - **Counter props / service mat:** clean; secondary assets kept simple.
  - No checkerboard remnants or visible halos observed on any asset.
- **Fallback reminder:** keep the existing CSS fallbacks intact (`cafe-table`,
  `cafe-chair`, `cafe-cup`, `cafe-counter-props`, `cafe-service-mat`); these assets
  are not yet integrated and the layout must still render without them.
