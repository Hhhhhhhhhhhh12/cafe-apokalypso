---
name: Café Apokalypso
description: A cozy café management game where everything is in order, and something is quietly, impossibly wrong.
colors:
  brick-red: "#7f2f2c"
  brick-red-deep: "#6c2826"
  brick-red-border: "#4e2f2a"
  kassandra-teal: "#16606c"
  deep-espresso: "#211814"
  warm-parchment: "#f4eadf"
  ivory-panel: "#fff8ed"
  ivory-panel-warm: "#fff4e6"
  caramel-shadow: "#c8a98d"
  mahogany-border: "#5c4037"
  dark-coffee: "#4a3b34"
  muted-brown: "#6c5146"
  aged-border: "#d5bda5"
  terminal-night: "#0e1512"
  forest-moss: "#4a6a5a"
  mint-signal: "#8fd4a8"
  growth-green: "#1f8a4c"
  warning-terracotta: "#c2603a"
  warning-sienna: "#a33c1a"
  twilight-indigo: "#3a4a7a"
  portal-purple: "#6a4fb0"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(2.25rem, 4vw, 4.35rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 800
    letterSpacing: "0"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  base: "8px"
  lg: "10px"
  xl: "12px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.brick-red}"
    textColor: "{colors.ivory-panel}"
    rounded: "{rounded.base}"
    padding: "12px 16px"
  button-primary-hover:
    backgroundColor: "{colors.brick-red-deep}"
    textColor: "{colors.ivory-panel}"
    rounded: "{rounded.base}"
    padding: "12px 16px"
  button-secondary:
    backgroundColor: "{colors.ivory-panel}"
    textColor: "#3d2a23"
    rounded: "{rounded.base}"
    padding: "12px 16px"
  button-disabled:
    backgroundColor: "#d4c4b8"
    textColor: "#5f514a"
    rounded: "{rounded.base}"
    padding: "12px 16px"
  panel:
    backgroundColor: "{colors.ivory-panel}"
    rounded: "{rounded.base}"
    padding: "18px"
  resource-item:
    backgroundColor: "#fbeddc"
    rounded: "{rounded.base}"
    padding: "7px 9px"
---

# Design System: Café Apokalypso

## 1. Overview

**Creative North Star: "The Last Normal Shift"**

Everything is in order. The handwriting is neat. The schedule is posted on the corkboard. The coffee machine has been calibrated. The register is balanced. Every surface in this system is warm, precise, and professionally maintained — the kind of café where the owners clearly care. It's fine. (It's not fine.)

The visual system is built on a single tension: total composure on the surface, and an undertow that's been there the whole time. The design does not wink. It does not lean into the absurdity. It takes the café completely seriously, and this sincerity is what makes the strangeness land. New UI regions don't explain themselves; they appear in the same measured, professional register as everything else. KASSANDRA's terminal panel is not presented as a dramatic intrusion — it boots with the same matter-of-fact authority as a bread delivery receipt.

The palette moves with the game. Day 1 is all warm parchment and brick red — the color of a place that's been here a while and has its routines. By Day 7, something at the edges of the palette has changed. The escalation is not announced. It is discovered.

**Key Characteristics:**
- Warm and precise, not warm and casual
- Single sans-serif voice across all surfaces (Inter); character comes from weight and color, not font variety
- Crisp flat-offset shadows with a warm ambient layer underneath — objects have weight, not cinema
- Three distinct palette zones that correspond to the game's narrative arc: Café Mode, Terminal Mode, Escalation Mode
- Motion is functional and restrained: resource flashes, sprite animation, camera zoom — no decorative choreography
- `prefers-reduced-motion` respected everywhere

## 2. Colors: The Shifting Palette

The palette has three zones, introduced progressively. Zone 1 is the whole game on Day 1. Zone 2 appears when KASSANDRA surfaces. Zone 3 bleeds in at the end.

### Primary

- **Brick Red** (`#7f2f2c`): The authority color. Used on all primary action buttons. The color of a wood-fired espresso machine, not a warning sign. Appears only on interactive affordances, keeping its weight meaningful.
- **Brick Red Deep** (`#6c2826`): Hover state of the above. Darker, not brighter — confidence, not urgency.
- **Espresso Border** (`#4e2f2a`): The border that grounds every primary button. Dark enough to anchor without reading as pure black.

### Secondary

- **KASSANDRA Teal** (`#16606c`): The one cool note in a warm system. Used for focus rings, eyebrow labels ("TODAY", "DAILY OBJECTIVE"), resource values, and the prominent letter panel border. The color appears early and infrequently — by the time KASSANDRA's terminal uses teal as its accent, the eye has already been quietly calibrated to trust it.

### Tertiary

- **Twilight Indigo** (`#3a4a7a`): Appears only on the Day-7 demo-complete banner. The palette hasn't been purple before. That's the point.
- **Portal Purple** (`#6a4fb0`): The shadow cast by Twilight Indigo panels. Something shifted.

### Neutral

- **Deep Espresso** (`#211814`): Body text. Near-black with warmth — not a pure black, never cold.
- **Warm Parchment** (`#f4eadf`): Page background, sticky header background. Repeated as a 24px grid of faint warm lines — visible but silent.
- **Ivory Panel** (`#fff8ed`): Panel and card backgrounds. One step lighter and cooler than parchment; the contrast separates surfaces from the page without a visible border being needed.
- **Ivory Panel Warm** (`#fff4e6`): Variant used on the resource HUD and day-progress panel. Slightly warmer, distinguishing operational panels from informational ones.
- **Caramel Shadow** (`#c8a98d`): The drop shadow color for warm café panels. Used as the crisp offset layer of the dual-shadow system.
- **Mahogany Border** (`#5c4037`): Panel and card borders. Dark enough to read clearly, warm enough to stay in register.
- **Dark Coffee** (`#4a3b34`): Secondary body text (intro copy, panel body text). Slightly lighter than Deep Espresso — the distinction is there but not announced.
- **Muted Brown** (`#6c5146`): Tertiary text — card labels, disabled states, caption-level copy.
- **Aged Border** (`#d5bda5`): Light borders — resource item cells, the sticky header divider. The visual note that separates without interrupting.

### Named Rules

**The Progressive Revelation Rule.** Zone 1 (Café Warm) is the entire system on Day 1. Zone 2 (KASSANDRA Terminal — `#0e1512` / `#4a6a5a` / `#8fd4a8`) appears only when the register boots. Zone 3 (Twilight Indigo / Portal Purple) appears only on the Day-7 end state. Do not use Zone 2 or Zone 3 colors outside their narrative contexts. The color shift IS the escalation signal.

**The Teal Economy Rule.** KASSANDRA Teal (`#16606c`) appears on focus rings, eyebrow labels, and resource data values. It is the most-used non-neutral color below brick red. Its presence in the KASSANDRA terminal is therefore recognition, not introduction — the player has been seeing it all along.

## 3. Typography

**Body Font:** Inter (with `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI"` fallbacks)

**Mono Font:** `ui-monospace, SFMono-Regular, Menlo, Consolas` — used exclusively in the KASSANDRA boot log.

**Character:** One font, full stop. Inter at different weights and sizes carries the entire hierarchy — from the 4.35rem display heading down to the 0.72rem fine-print tag. There is no serif contrast, no decorative display face, no script accent. The restraint is deliberate: a café this normal-looking uses one clean sans-serif, the same way it has one handwritten specials board.

### Hierarchy

- **Display** (700, `clamp(2.25rem, 4vw, 4.35rem)`, line-height 1.1, max-width 12ch): The game's title. One instance, maximum 12 characters wide. `text-rendering: optimizeLegibility`.
- **Headline** (700, `1.4rem`, line-height 1.2): Day result headings, state banner titles. High-impact within their containers.
- **Title** (700, `1.2rem`, line-height 1.3): Panel section headings (`h2`). The voice of the shift manager.
- **Body** (400, `1rem`, line-height 1.5): Narrative text, guest dialogue, day story copy. Keep prose under 60ch for readability.
- **Label** (800, `0.78rem`, uppercase, letter-spacing 0): Eyebrow text — "TODAY", "DAILY OBJECTIVE", "ODER DIREKT SERVIEREN". Weight 800 (not 700) makes it punch at small size. No letter-spacing despite uppercase, which keeps it from feeling like stock UI chrome.
- **Data Value** (800, `0.98rem`, capitalize): Resource numbers and values in HUD cells. Weight matches Label but size is larger — data is read fast, not scanned.
- **Mono** (400, `0.85rem`, line-height 1.6): KASSANDRA boot log only. The only monospace context in the system.

### Named Rules

**The One Font Rule.** Inter across all contexts. Do not introduce a second typeface — not for the KASSANDRA terminal, not for the Day-7 escalation, not for any special narrative moment. Weight and color carry the variation; a second face would undercut the composed-normalcy the system is built on. The exception is the monospace family in the KASSANDRA log, which is a `font-family` override on a single element, not a second brand voice.

## 4. Elevation

This system uses a two-layer shadow: a crisp flat offset (pixel-adjacent, object-has-weight) plus a subtle warm ambient diffusion beneath it. The flat layer is the precise, professional surface; the ambient layer is the warmth that hums underneath. Together they read as "objects sitting on a real surface under soft overhead light" — not "CSS boxes floating in a viewport."

Blur is never applied to the element itself (no `backdrop-filter`, no `filter: blur()` on panels). The blur lives only in the ambient shadow layer and stays low opacity. This is not glassmorphism. Glass is decorative; these are café surfaces.

### Shadow Vocabulary

- **Warm Panel** (`0 6px 0 #c8a98d, 0 10px 20px rgba(140, 88, 48, 0.13)`): Standard panels, day cards. The caramel offset anchors; the amber ambient breathes. Used on `.day-card`, `.panel`, and all general UI containers.
- **Resource Panel** (`0 4px 0 #c8a98d, 0 8px 16px rgba(140, 88, 48, 0.10)`): HUD resource strip — slightly shallower than standard panels since it sits at the top of the workspace.
- **Café Stage Panel** (`0 10px 0 #b98e6a, 0 14px 28px rgba(130, 80, 40, 0.12)`): The large café diorama panel. Deeper offset because the panel is larger.
- **Warning Banner** (`0 4px 0 #b06a4f, 0 8px 18px rgba(122, 46, 26, 0.15)`): Closed-café state. Same structure; the offset is brick-warm, not caramel, matching the banner's urgency register.
- **KASSANDRA Terminal** (`0 8px 0 #1a2a22, 0 0 0 4px rgba(74, 106, 90, 0.25), 0 16px 40px rgba(8, 18, 12, 0.35)`): Three layers. Crisp dark offset, a faint forest-moss halo ring, and a deep atmospheric diffusion. The glow ring is the only use of a spreading shadow in the system — KASSANDRA is the only object that halos.
- **Escalation Banner** (`0 4px 0 #6a4fb0, 0 8px 20px rgba(58, 36, 106, 0.18)`): Day-7 panel. The purple ambient glow is the tell: something has changed at the root of the system.
- **Letter Panel Accent** (`0 6px 0 #b8d4d6, 0 10px 20px rgba(22, 96, 108, 0.13)`): Prominent letter panels (teal-bordered). Teal ambient matches the border color — the surface and shadow are in register.

### Named Rules

**The Flat Offset Rule.** Every panel shadow leads with a zero-blur flat offset. The offset is the structural layer; it shows how far the object is pushed down. The ambient layer never replaces it — always added on top (as a second value in `box-shadow`). If you remove one, remove the ambient. Never use blur-only shadows on UI panels.

**The No-Glow Rule (except KASSANDRA).** The KASSANDRA terminal is the only element that uses a spreading box-shadow as a halo (`0 0 0 4px ...`). No other element halos. Its uniqueness is the signal.

## 5. Components

### Buttons

Tactile and decisive — the whole shift fits inside a button.

- **Shape:** Gently curved (8px radius). Not pill, not square.
- **Primary** (`#7f2f2c` background, `#fff8ed` text, `#4e2f2a` 2px border, `0.75rem 1rem` padding): The directive button. Used for all primary actions — "Take next order", "Close day". All buttons are at least `44px` tall.
- **Hover:** `#6c2826` — two stops darker, same hue. No color shift, no brightness pop.
- **Focus:** 4px solid `#16606c` outline, 3px offset. Teal, consistent with the eyebrow and resource system.
- **Disabled:** `#d4c4b8` background, `#5f514a` text, `#9d8b83` border. The café is closed; nothing happens here.
- **Secondary:** `#fff8ed` background, `#3d2a23` text — an ivory label on the same surface. Used for "Close day" (blocked) and navigation choices that don't initiate action. Hover becomes `#f1dec9`.
- **KASSANDRA Button:** Separate register — `#4a6a5a` background, `#f0fff6` text, no border, 8px radius. Focus ring uses `#8fd4a8` (mint). Exists only inside the KASSANDRA boot panel.

### Cards / Containers

- **Panel** (`#fff8ed` or `#fff4e6` bg, `2px solid #5c4037` border, `8px` radius, Warm Panel shadow): The default container for all game UI content. No nesting — panels are leaves, not wrappers of panels.
- **Resource Item** (`#fbeddc` bg, `1px solid #d5bda5` border, `8px` radius, `7px 9px` padding): The smallest repeating container. Holds one resource label + value. Low-state variant shifts to `#fbe3d5` / `#c2603a` border when a resource is critically low.
- **Day-Result Card** (gradient `#fff8ed → #fbeddc`, `#5c4037` border, Warm Panel shadow): End-of-day summary card.
- **Closed Banner** (gradient `#f6d9cb → #ecc0ad`, `#7a2e1a` 3px border, Warning shadow): The "café is closed" state. Gradient warms it; this is a transitional surface, not a permanent home.
- **Demo-Complete Banner** (gradient `#e6ddf6 → #cdbfe9`, `#3a4a7a` 3px border, Escalation shadow): Zone 3. Appears exactly once. The purple gradient is jarring by design.

### Inputs / Fields

Currently no standalone input fields in the system. Action choices are made through buttons. If inputs are added: follow the panel border language (`#5c4037` border, `8px` radius, `#fff8ed` background), focus via 3px solid `#16606c` ring at 2px offset.

### Resource HUD

A horizontal grid of Resource Items (`repeat(8, 1fr)`, `8px` gap). Sits at the top of the workspace in its own `resource-panel` container. The mini meter bars beneath each value use `4px` height, `999px` radius, tonal fills: `#1f8a4c` for positive metrics, `#c2603a` for negative.

### KASSANDRA Terminal (Signature Component)

A modal overlay (`rgba(12, 10, 24, 0.78)` backdrop, `2px` backdrop-filter blur — the only blur in the system at the page level). The panel itself: `#0e1512` background, `#4a6a5a` border, `12px` radius, triple-layer shadow. Its log area uses the monospace font on `#060b08` — the only panel background darker than the panel. Eyebrow label uses `0.18em` letter-spacing (the only departure from the zero-letter-spacing rule) because KASSANDRA earned it.

### Navigation / Eyebrows

Eyebrow labels ("TODAY", "DAILY OBJECTIVE") are `0.78rem`, weight 800, uppercase, `#16606c`. They sit at the top of cards and panels, anchoring context before the heading. They are NOT decorative chrome — each marks a genuine content type. The one letter-spacing exception: KASSANDRA's eyebrow uses `0.18em` to signal a different register.

## 6. Do's and Don'ts

### Do:

- **Do** lead with crisp flat offset in all box-shadows, then add the ambient layer as the second value (`0 6px 0 #c8a98d, 0 10px 20px rgba(...)`) — never blur-only.
- **Do** use Inter at weight 800 for labels and data values at small sizes. Weight 700 for headings. 400 for body copy. The same font carries three distinct personalities.
- **Do** use KASSANDRA Teal (`#16606c`) for focus rings, eyebrows, and resource values — and nowhere else in Zone 1. Its rarity is the reason it carries so much signal weight.
- **Do** keep the three palette zones strictly separate: Café Warm for all Day 1–6 UI, KASSANDRA Terminal only inside the register/boot contexts, Twilight Indigo only at game-end.
- **Do** respect `prefers-reduced-motion: reduce` on every animation. Every sprite animation, resource flash, and camera transition has a reduced-motion alternative.
- **Do** keep all button touch targets at or above `44px` height, even icon-only variants.
- **Do** use uppercase label text at exactly weight 800, zero letter-spacing — not tracked, not spaced out. The KASSANDRA eyebrow (`0.18em` spacing) is the only exception, and it is deliberate.

### Don't:

- **Don't** use Stardew Valley pastels, cheerful rounded-everything, or bouncy animations. This game is warmer in tone but more restrained in affect — warmth comes from dark wood tones and precise typography, not from color brightness.
- **Don't** use card-heavy generic UI, Bootstrap-ish grids, or neutral gray surfaces. Every container in this system has a reason to exist. Gray is not a neutral here — it would read as blandness, not restraint.
- **Don't** reach for horror/dark game aesthetics (Darkest Dungeon darkness, neon on black, skull iconography). The weirdness is quiet. The palette stays warm until it doesn't, and when it doesn't, it goes indigo — not black.
- **Don't** strip the system down to flat color blocks or Material Design flatness. The panel shadow system (crisp offset + ambient) is the tactile backbone. Remove it and the surfaces float; that's the wrong kind of uncanny.
- **Don't** introduce a second typeface. The One Font Rule is structural, not aesthetic.
- **Don't** use Zone 2 (terminal greens) or Zone 3 (indigo/purple) colors outside their narrative triggers. If a new UI element needs a color and you're reaching for `#0e1512` or `#3a4a7a`, stop: that color belongs to a story moment, not to utility.
- **Don't** use gradient text (`background-clip: text`). Don't use left-border stripe accents (use full borders, background tints, or color shifts instead). Don't nest panels inside panels.
- **Don't** add decorative shimmer, particle trails, or glow effects to any Zone 1 surface. The one exception is the KASSANDRA `box-shadow` halo (`0 0 0 4px rgba(74, 106, 90, 0.25)`). That halo is earned.
