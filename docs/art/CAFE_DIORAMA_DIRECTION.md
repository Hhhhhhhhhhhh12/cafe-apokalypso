# Café Diorama Direction

Visual direction document for the main 3/4 café diorama view.
Implementation target: PROMPT-10C — First Visual Diorama Layout.

---

## ⚠ OPEN DECISION: Diorama Projection (Front-3/4 vs. Isometric)

**Status: OPEN — not resolved. The front-3/4 direction below remains canonical until the user decides otherwise.**

The integrated **Stage Base v03** background (`assets/backgrounds/placeholder-cafe-stage-base-v03.png`) is **corner-isometric (diamond-room)**, which does **not** match the front-angled 3/4 projection this document and `docs/ART_STYLEGUIDE.md` mandate. The repo currently renders a **provisional isometric background beneath front-3/4 CSS props**, accepted **experimentally** as a feel test only (see `PILOT_ASSET_INTAKE.md`, "Stage Base v03 — experimental/provisional integration"). Alignment is imperfect (painted vs. CSS counter can read as doubled).

Options — the user decides; none is pre-selected:

- **(A) Regenerate Stage Base v04 in front-3/4** (keep canonical front-3/4; replace v03).
- **(B) Re-canonize the main view to isometric** (would change this document + `ART_STYLEGUIDE.md`; needs explicit user approval as a main-view change).
- **(C) Keep the hybrid** (isometric base under front-3/4 props) for the slice as-is.

For Option A, v04 is a candidate for an **external pixel tool (e.g. PixelLab)**: **text-free, landscape, clean alpha, empty room**, per the `PILOT_ASSET_INTAKE.md` workflow.

The full canonical decision record is in [../DECISIONS.md](../DECISIONS.md) → "OPEN DECISION: Diorama Projection". The 3/4 description in this document stays canonical until A, B, or C is chosen.

---

## 1. Purpose

### Emotional goal

The diorama should make the player feel immediate ownership.
Day 1 should read as a cozy, slightly cramped small café — real enough to care about, simple enough that the player can understand the layout in one glance.

The visual anchor is the counter and coffee machine. These should always be the eye's first stop.

Cozy-absurd tone means warmth first, strangeness second.
The same space that hosts normal Monday regulars must be able to hold a guest whose hair casts the wrong shadow without the room changing category.

### Functional role

The diorama is **primarily visual and decorative in the MVP**. It communicates:

- what kind of place this is
- how busy or stressed the café currently feels
- where guests are sitting
- subtle visual changes as Days progress

It does **not** drive gameplay mechanics.
Orders, resources, actions, and management decisions remain in the UI panels.
The diorama does not need to be clickable in MVP.

### Relationship to the management loop

The management loop happens in the action panel and resource HUD.
The diorama provides spatial context and emotional grounding for those decisions.

A guest sprite appearing at a table reinforces that "serving" matters.
A messy café state reinforces that "cleaning" is needed.
These are visual confirmations, not primary interaction surfaces.

If the diorama were removed, the game would still be playable.
If the management panels were removed, the game would not be playable.

---

## 2. Camera and Layout

### 3/4 view description

The camera looks down and slightly forward at roughly 30–45 degrees from horizontal, angled from the front-left.

This gives the floor depth, makes furniture read clearly from above, and allows guest heads and upper body to be visible above countertops.

- Walls are visible (rear wall and one side wall).
- Floor tiles are visible in perspective.
- Counters, tables, and large props show both their top face and front face.
- Guests are taller than they are wide.

The view does not tilt far enough to become a pure top-down grid.
It does not flatten enough to become a side-view.

### Suggested café floor composition

The café interior is small and dense.
Every major element should be readable without zooming in.

Reading left-to-right, back-to-front in the 3/4 perspective:

```
  [Window / Street view]          [Menu board]
  
  [Counter + Coffee machine]       [Shelf / Storage]
       [KASSANDRA register]
  
  [Table A]       [Table B]        [Plant / Decor]
  
  [Queue area]                     [Door]
```

The exact pixel positions are for PROMPT-10C to define.
The above is a spatial relationship diagram, not pixel coordinates.

### Element placement notes

**Counter**
Runs along the rear-left portion of the floor.
The counter is the operational heart of the café.
It should be wide enough to place the coffee machine and register side by side.
The player's implicit position is behind or at the counter.

**Coffee machine**
Sits on the counter, rear-left or center.
First Day-1 anomaly (a brief impossible display) happens here.
Should be visually distinct from the register.

**KASSANDRA register**
Sits on the counter, near the right side.
Visual design should feel like a normal point-of-sale device in Day 1.
Small, understated, slightly too modern for the rest of the café.
Later Days may add subtle visual notes (faint glow, receipt that does not end).

**Tables**
Two small guest tables in the middle and right floor area.
Enough space around them to place guest sprites.
Tables are the main place where guest sprites appear and cleanliness cues apply.

**Queue area**
Near the door, front-left.
A small standing zone where arriving guests wait.
Can show 1–2 guest sprites at most in MVP.

**Door**
Front-right or front-center.
Street or exterior visible beyond it (weather/daylight hint).
Provides visual depth and indicates opening/closing state.

**Window**
Rear-right wall or side wall.
Shows exterior light, weather, or street.
Important for cozy atmosphere.
Day-time progression can be shown as light change through the window.

**Shelf / Storage**
Rear-right area, smaller than the counter.
Simple shelves with cups, bags, or containers.
Visual shorthand for "supplies are stocked / running low."
Weirdness hint can appear here (a form stack, a key to Room 4).

**Menu board**
Rear wall, above the counter or near the counter.
Text on the board must NOT be baked into the image asset.
In MVP, the board is a visual prop; real product/price info stays in the UI panel.

**Plant or simple décor**
One small plant or decorative item.
Placed near the window or in a corner.
Adds warmth and contrast to the functional elements.
Day 7 version: plant may look slightly wrong.

**Weirdness hints**
Small, deniable details placed at low opacity or off to the side.
Examples: a clock face with an extra hand, a receipt curling off the counter, a shadow at the wrong angle.
These should not read as obvious Easter eggs in Day 1.
Weirdness hints increase in visual weight toward Day 7.

---

## 3. MVP Visual States

Visual states communicate the day and operational health of the café.
They do not replace numeric resource values; they reinforce them visually.

### Day 1 — Normal and cozy

Tone: warm morning café. Mostly empty. Clean. Ready.

- Warm lighting: soft yellows, cream walls, brown wood tones.
- One or two guests at tables or in queue.
- Counter clean and organized.
- Coffee machine clean and off, or on standby.
- Tables clear or with simple cups.
- No visible weirdness.
- Window shows morning or midday light.
- Small plant looks healthy.
- KASSANDRA register: off or dark screen.
- Post-Day-1 moment: coffee machine shows brief impossible text. This is the only weirdness note.

### Day 4 — Busier, early strain, Herr Grau possible

Tone: slightly busier. First cracks in organization. Herr Grau may appear at a table.

- Two tables occupied or recently cleared.
- Queue area has at least one waiting guest.
- Counter slightly less tidy: one cup out of place, small stain detail.
- Advertising poster now present (small, on the wall near the door).
- Herr Grau sprite at a corner table if he has appeared in the day's event script.
- Herr Grau visual note: slightly wrong shadow, coin not matching any category (no visual label needed — just the silhouette).
- Window light: afternoon tone.
- Plant unchanged.
- KASSANDRA register: screen on, faint glow, unremarkable.

### Day 7 — Crowded, slightly wrong, apocalyptic letter day

Tone: busiest day so far. Something is off. The letter has arrived.

- Both tables occupied, queue visible.
- Counter showing visible strain: multiple cups, small disorder.
- One cleanliness cue: maybe a damp rag left out, a stacked saucer, something not quite put away.
- Herr Grau has been here.
- Frau mit rotem Regenschirm may appear in queue or at a table (red umbrella visible, even though it is clearly not raining).
- KASSANDRA register: screen on, receipt visible but not-quite-normal length.
- One subtle weirdness prop visible: clock with extra marks, a small envelope on the counter, plant with one too-pale leaf.
- The apocalyptic letter itself is shown as a UI popup, not baked into the diorama image.
- Window: late afternoon or evening light, slightly more saturated or off-hue.

### Cleanliness and stress visual cues

These cues should be legible without reading any numbers.

**Clean café (high cleanliness):**
- Tables with no leftover cups.
- Counter with cups stacked neatly.
- Clear floor area.
- Warm, organized lighting.

**Moderate cleanliness (mid game, mid-week):**
- One or two cups left on a table.
- A cloth or cleaning item visible but unused.
- Slight visual disorder on the counter.

**Low cleanliness (stress event, end of busy day):**
- Cups on multiple tables.
- Counter visually cluttered.
- Ambient warmth slightly reduced (cooler color temperature suggestion).
- One chair slightly out of position.

**Guest patience / stress:**
- Queue guest sprite with a waiting posture vs. irritated posture is a later-phase consideration.
- For MVP: number of guests in queue area is the primary visual indicator. No per-guest animation required.

---

## 4. Sprite Policy

### Base size

First pilot sprite size: **32×32 px**

This is the approved pilot size for guest sprites.
Prop sizes may vary (see Section 5).

### Approach

- Static only for MVP. No walking, idle, or sitting animation cycles.
- One pose per guest is sufficient for pilot.
- Sprites should be readable at 32×32 without zooming in.

### Silhouette priority

Strong silhouette over facial detail.

A guest sprite should be recognizable from shape alone:
- Paula: upright, commuter posture, practical coat.
- Cem: slight forward lean, delivery jacket or bag silhouette.
- Lukas: slouched, laptop silhouette in front.
- Meda: upright, sunglasses, wider hair silhouette suggesting something not quite normal.

Faces should be minimal. Eyes and expression at 32×32 are 2–4 px wide.
Do not try to paint Medusa's eyes at 32×32. Make the hair silhouette do the work.

### First pilot guests

Priority order for the first pilot round:

1. **Pendlerin Paula** — strong "normal guest" archetype, quick to read, sets the baseline.
2. **Lieferfahrer Cem** or **Laptop-Lukas** — second normal guest type, different silhouette class.
3. **Meda** — third, as the first difficult design test. Sunglasses, subtle snake-hair silhouette, calm pose.

Reason for this order: prove the normal look first, then prove the slightly-wrong look can coexist in the same sprite scale and palette.

### What pilot sprites are not

- Not final production art.
- Not the only guests that will ever appear.
- Not locked in place if the art direction changes.

Each pilot sprite must remain replaceable with a CSS placeholder without breaking the layout.

### No 8-direction sets in MVP

Sprites do not rotate. They appear at one facing angle in the diorama.
A guest at a table faces generally toward the counter.
A guest in queue faces generally toward the counter.
No directional variant sprites required.

### No full animation system in MVP

No walking cycles. No idle cycles. No sitting-down animation.
Sprites either appear at a position or do not appear.
Transition between states (seated / not present) is a React state change, not a sprite animation.

---

## 5. Prop Policy

### First prop candidates

Priority order for first pilot props:

1. **Coffee machine** — the emotional anchor of the counter. First anomaly site.
2. **KASSANDRA register** — visually distinct from the coffee machine. Needs to read as POS device.
3. **Small café table** — needed for guest sprites to sit at. Simple surface + legs in 3/4 view.
4. **Chair** — paired with tables. Simple, readable silhouette.
5. **Menu board or croissant display** — flavor prop on the counter or rear wall.

Additional candidates (secondary round):
- plant / pot
- shelf with cups
- advertising poster (Day 4+)
- weirdness overlay props (clock, receipt, form stack)

### Prop design rules

**Modular:** Each prop is a separate asset or CSS element.
Props do not form one merged background layer.
This allows state-specific props to be added or changed without replacing the whole background.

**Readable at scale:** Props must read clearly at the scale they appear in the diorama.
A chair at 3/4 angle must look like a chair. A coffee machine must not be confused for a shelf.

**No text baked into prop images.**
The menu board is a visual frame. Text on it stays in HTML/CSS/React.
The KASSANDRA screen is a visual frame. Its messages stay in the UI text system.
No product names, prices, labels, or UI copy may be embedded in image pixels.

**Perspective consistent with the 3/4 camera:**
Prop tops are visible.
Prop fronts are visible.
Prop sides are partially visible.
All props share the same vanishing point family.

**Palette consistent with the café color direction:**
Base: warm creams, browns, muted reds, soft yellows.
KASSANDRA and weirdness props may introduce cold accent notes (cyan, pale grey, sickly green).
No neon, no high-saturation web colors.

---

## 6. Asset Pipeline Rules

### Raw AI-generated sheets

Raw AI-generated image sheets (Google AI Studio, Gemini, Nano Banana, ImageGen outputs) **must not enter the repository**.

They live outside the repo in the designated moodboard workspace:
```
/Users/Heineken/Library/Mobile Documents/com~apple~CloudDocs/Claude/Moodboards Apokalypso
```

This folder is a working space, not a canonical source.

### What may enter the repo

Only **cropped, curated, explicitly approved pilot assets** may enter the repository.

"Approved" means the user has reviewed the asset, confirmed it is acceptable as a pilot, and the decision is documented.

### Source and approval notes

Every pilot asset file that enters the repo must have:

1. A clear filename following the naming convention (e.g., `sprite-guest-paula-01.png`).
2. A source note in [ASSET_CATALOG.md](ASSET_CATALOG.md): where the asset originated, what tool or approach produced it.
3. An approval note in [ART_REVIEW_LOG.md](ART_REVIEW_LOG.md): date, reviewer, decision, and any conditions.

Assets without documented approval may not be treated as canonical.

### CSS / structured placeholders as fallback

CSS or structured HTML/React placeholders must remain available as fallback for every sprite and prop position.

If a pilot asset is missing, rejected, or replaced, the layout must continue to render correctly with placeholders.

Placeholder naming follows the `placeholder-` prefix convention documented in [../ART_STYLEGUIDE.md](../ART_STYLEGUIDE.md):
- `placeholder-cafe-diorama`
- `placeholder-guest-normal-01`
- `placeholder-guest-strange-01`
- etc.

### Asset folder structure

Pilot assets follow the structure defined in [../ART_PIPELINE.md](../ART_PIPELINE.md):

```
assets/
  sprites/
    guests/          # guest pilot sprites
    props/           # café props
    overlays/        # weirdness overlay props
  backgrounds/       # café background or background slice
```

### Naming conventions

```
sprite-guest-[name]-[variant].png
sprite-prop-[name]-[variant].png
sprite-overlay-[name]-[variant].png
bg-cafe-day[N].png
```

Examples:
- `sprite-guest-paula-01.png`
- `sprite-guest-meda-01.png`
- `sprite-prop-coffee-machine-01.png`
- `sprite-prop-kassandra-register-01.png`
- `sprite-overlay-clock-anomaly-01.png`

---

## 7. First Implementation Target

### PROMPT-10C — First Visual Diorama Layout

PROMPT-10C should build a **React/CSS diorama structure** for the main café view.

**What it builds:**

- A React component (`CafeDiorama` or equivalent) that renders the café stage.
- CSS-based 3/4 perspective layout using absolute or relative positioning.
- Named zone areas matching this direction document: counter, tables, queue area, door, window, shelf, menu board, plant/decor.
- CSS placeholder blocks for each major prop and guest position, clearly named with the `placeholder-` prefix.
- Correct spatial relationships: counter rear, tables mid, queue front, door front-right, window rear-right.
- Warm placeholder color palette (creams, browns, muted reds) matching the Day 1 cozy direction.

**What it does not need:**

- Final pixel-art assets.
- Real guest sprites.
- Animations.
- Clickable interactions.
- New game mechanics.
- Any change to game-state logic or the action panel.

**Acceptance:**

- The main screen shows a visibly improved café stage compared to the previous flat placeholder panel.
- Named zone placeholders are in place and labeled.
- Guest sprite positions exist as empty zones that future sprites can drop into.
- The layout passes the existing typecheck and build.
- No new mechanics are introduced.

**Why now:**

The current app has a flat placeholder café area. PROMPT-10C converts it into a spatially structured stage.
This creates the scaffold that future pilot sprite assets can enter without further structural work.

---

## 8. Out of Scope

The following are explicitly out of scope for the diorama MVP and for PROMPT-10C.

| Out of scope | Reason |
|---|---|
| Real-time pathfinding or guest movement | No simulation layer in MVP. Guests appear at positions, not walk to them. |
| Full walking animation cycles | No animation system in MVP. Static only. |
| Complete Day 1–7 layered art | Day-specific visual states are progressive upgrades, not required for first diorama build. |
| Final production art | Pilot assets only. No full art pass in scope. |
| Generated image batches in repo | Raw AI sheets stay outside the repo. Always. |
| Clickable diorama interactions | Actions remain in the UI/action panel. Diorama is visual only in MVP. |
| Side-view as a standard layout | 3/4 diorama only. Side-view reserved for special scenes outside MVP. |
| 8-direction sprite sets | One facing angle per guest is sufficient. |
| Complete character sprite sets for all 9 guests | First pilot covers 3 guests. |
| Full animation system | No idle, walk, or sit animation in MVP scope. |
| Menu board with baked-in text | Text stays in the HTML/CSS/React layer. |
| KASSANDRA screen with baked-in messages | KASSANDRA UI text stays in the component layer. |
| Audio or ambient sound | Out of scope for this phase. |
| Mobile-first layout optimization | Desktop 1280×768 target only for MVP. |
