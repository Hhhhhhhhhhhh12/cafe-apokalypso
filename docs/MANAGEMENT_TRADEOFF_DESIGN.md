# Management Tradeoff Design — Week 1 MVP

**Status: Approved. Binding for PROMPT-6B implementation.**

This document is the canonical source for the Week-1 management loop mechanics.
Codex must read this file before implementing any tradeoff, resource, stress, or
helper system. Do not implement mechanics that are not documented here.

---

## Design Goal

The management loop should feel like running a small café that is slightly too
busy — not like solving a spreadsheet. Every tradeoff should be readable in one
glance, and the consequence of a bad choice should be flavorful, not punishing.
The player should always feel one decision away from things being fine again.

**Central tension:** serving more customers makes more money but wears the café
down (supplies, cleanliness, stress). Recovering the café costs time and
resources. Helpers shift this equation — but only in one direction at a time.

The cozy-absurd tone must be preserved throughout. Stress events are dry and
mundane in Days 1–6. No supernatural language appears before the Day-7 hook.

---

## Core Resources and Metrics

### Visible in the HUD (all days)

| Resource | Range | HUD label | Notes |
|---|---|---|---|
| Money | 0–∞ | `Kasse: €X` | Primary income/cost unit |
| Coffee | 0–20 | `Kaffee: X` | Consumed per espresso/cappuccino order |
| Milk | 0–20 | `Milch: X` | Consumed per cappuccino; 10% more efficient with Nino on barista |
| Pastries | 0–12 | `Gebäck: X` | Consumed per croissant/combo order |
| Cleanliness | 0–100 | Text state (see below) | Degrades per customer; restored by cleaning |
| Stress | 0–100 | Text state (see below) | Builds on busy days; partial overnight reset |
| Reputation | 0–100 | `Ruf: aufbauend` | Affects next-day customer count |

### Hidden resource (never shown in UI before Day-7 hook)

| Resource | Behavior |
|---|---|
| Weirdness | Ticks up internally on scripted events. The field `weirdnessVisible` must be `false` through Day 6. No UI element — label, bar, number, or class — may reference weirdness until after the Day-7 letter fires. |

---

## Supply System

### Supply caps (approved)

| Ingredient | Maximum units |
|---|---|
| Coffee | 20 |
| Milk | 20 |
| Pastries | 12 |

Attempting to purchase above the cap is either blocked or silently capped.
There is no minimum stock requirement; starting at zero is possible but
immediately limits what can be served.

### Consumption per product

| Product | Coffee | Milk | Pastries |
|---|---|---|---|
| Filterkaffee | 1 | 0 | 0 |
| Espresso | 1 | 0 | 0 |
| Cappuccino | 1 | 1 | 0 |
| Croissant | 0 | 0 | 1 |
| Kaffee + Croissant | 1 | 0 | 1 |

### Out-of-stock behavior

If a required ingredient is at 0 when an order is attempted:

- The product is marked unavailable for that order.
- The guest either leaves or selects a substitute product (if one exists with available ingredients).
- A flavor note appears: e.g., `"No milk. The cappuccino becomes an espresso. The guest accepts this."` or `"No pastries. The guest pauses, then orders nothing."` 
- Reputation is reduced by 1.
- This is never framed as a supernatural event.

### End-of-day supply purchase

- Shown as a per-ingredient quantity selector after the day summary.
- Each ingredient shows: current stock, units to buy, cost per unit, new total, and balance after purchase.
- Player cannot buy more than the cap allows for each ingredient.
- Player cannot spend more money than they have; the confirm button is disabled if the total exceeds balance.
- Purchases are applied at the start of the next day.

---

## Cleanliness System

### Mechanics

- Starting cleanliness: 80 (café opens reasonably clean).
- Each customer served: −2 cleanliness.
- Each manual cleaning action: +12 cleanliness.
- Jana on cleaning duty: cleanliness auto-maintained at or above 45 (no player action required).
- Maximum cleanliness: 100.
- Minimum cleanliness: 0 (does not cause game over).

### Text states

| Value | Label |
|---|---|
| 75–100 | Sauber |
| 50–74 | Ordentlich |
| 25–49 | Unordentlich |
| 0–24 | Chaotisch |

### Effects

| Cleanliness at day end | Effect |
|---|---|
| ≥ 70 | +1 reputation (cozy impression) |
| 40–69 | No effect |
| 25–39 | −1 reputation per day below 40 |
| < 25 | −2 reputation; one guest complaint flavor line appears in day summary |

### Stress interaction

If cleanliness drops below 40 during the day, stress gains an additional +5
on that day (the player is aware the café is a mess and it is affecting their
ability to work calmly).

---

## Stress System

### Philosophy

Stress is a cozy management friction, not a failure meter. It should read as
"the café is having a busy day." Language stays dry and bureaucratic. Stress
never causes game over.

### Comfortable capacity per day (approved)

| Day | Comfortable capacity |
|---|---|
| Day 1 | 5 customers |
| Day 2 | 5 customers |
| Day 3 | 6 customers |
| Day 4 | 6 customers |
| Day 5 | 7 customers |
| Day 6 | 7 customers |
| Day 7 | 8 customers |

Each customer served beyond the comfortable capacity adds +8 stress.
Customers within capacity add no stress.

### Additional stress sources

| Condition | Stress added |
|---|---|
| Cleanliness drops below 40 during the day | +5 (once per day) |
| Any supply reaches 0 during a serving attempt | +5 (once per ingredient per day) |
| No cleaning action taken and ≥ 4 customers served | +3 (once per day) |

### Stress reductions

| Condition | Stress reduction |
|---|---|
| Overnight rest (end of every day) | −20 (partial reset; never below 0) |
| Nino on counter duty | −8 during the day |
| Mira on counter support | −5 during the day |
| Manual cleaning action during a slow window | −5 (once per day, only if < comfortable capacity served at that point) |
| Slow day: fewer than 4 customers total | −10 bonus at day end |

### Text states

| Value | Label |
|---|---|
| 0–40 | Ruhig |
| 41–60 | Geschäftig |
| 61–80 | Angespannt |
| 81–100 | Überlastet |

### Threshold effects

| Stress level | Effect |
|---|---|
| 0–60 | No mechanical effect. Flavor line may appear in day summary at 41+ ("It is busy. You have forgotten what quiet felt like.") |
| 61–80 | One soft event during the day. A tip is slightly smaller, an order takes a moment longer, the machine makes an unusual sound. Mundane explanation only. |
| 81–100 | One guaranteed day-end mundane incident. Examples: machine needs reset (−€5), cup breaks (−€3), guest leaves before ordering (−1 reputation). |

### Stress event flavor text (placeholder — tone review required before final)

The following 6 lines are **clearly marked as placeholder content**.
Final tone review by the user or ChatGPT is required before production:

```
// PLACEHOLDER STRESS EVENT LINES — pending tone review
"The coffee machine made a sound it has not made before. You reset it. The manual did not cover this."
"A guest asked for the bill three times before you noticed. You apologised. They tipped anyway, but less."
"You dropped a cup. It was not your best moment. Nobody said anything, which was worse."
"The milk frother stopped mid-cappuccino. You finished it by hand. The guest left a note: 'Authentic.'"
"A queue formed. You managed it. You do not remember how."
"The cash register froze for eleven seconds. Then it continued. No explanation was offered."
```

These events must never reference weirdness, mythology, or the supernatural
in Days 1–6. The register freeze on Day 6 may be attributed to the KASSANDRA
installation, not to anything unexplained.

### Weirdness guard for stress events

Stress event text is selected from the mundane event list in Days 1–6.
The weirdness event list is locked and must not be drawn from until after
`weirdnessVisible` is `true`.

---

## Helper Assignment Model

### Rules (approved)

- Helpers are available from Day 5 onward. Before Day 5, the hire UI must not appear or must be disabled.
- Only one helper may be hired per day.
- The assignment choice is made at day start and is final for the day. No mid-day reassignment in Week 1.
- Hiring cost is deducted when the day opens (before the first customer).
- If the player cannot afford the helper, the option is disabled (label: "Nicht genug").

### Helper roster and task assignments

**Jana**

| Task | Mechanical effect | Flavor note |
|---|---|---|
| Cleaning duty | Cleanliness auto-maintained at or above 45; player does not need to take manual cleaning actions | "Jana cleaned everything. You are not sure when." |
| Service duty | One extra order slot handled without consuming a player action; one additional customer served | "Jana took three orders. She looks mildly confused about the menu but nobody complained." |

**Nino**

| Task | Mechanical effect | Flavor note |
|---|---|---|
| Barista | Cappuccino and espresso orders grant +1 reputation each (capped at 3 per day); milk consumed 10% more efficiently (round down) | "Nino made a latte art. It was a bird. Or possibly a bureaucratic stamp." |
| Counter service | Stress reduced by −8 during the day; one extra order slot | "Nino handled the counter. The queue moved. Stress dropped slightly." |

**Mira**

Mira is the same character as Freelancerin Mira (normal recurring guest). She
is a freelancer-style regular who can also be hired as a day helper starting
Day 5. Her dual role is intentional. Both the guest data entry and the staff
data entry should reference the same character identity. Mira is not Meda.

| Task | Mechanical effect | Flavor note |
|---|---|---|
| Marketing / counter | Unlocks one extra advertising action for the day; also handles one order | "Mira posted something. It got 14 likes and one comment in a language Google says does not exist." |
| Counter support | Stress reduced by −5 during the day; one extra order slot | "Mira called the café 'charmingly precarious.' She meant it as a compliment. Probably." |

### Day-start assignment UI

```
Before opening — Day 5, 6, 7:

[ Hire Jana ]   Cleaning  ○   Service  ○
[ Hire Nino ]   Barista   ○   Counter  ○
[ Hire Mira ]   Marketing ○   Counter  ○

[ Open without help ]
```

Only one helper row may be selected. Within the selected row, one task
radio button must be chosen. The confirm/open button fires once the selection
is valid.

---

## KASSANDRA Wrong-Recommendation Handling (Week 1)

When KASSANDRA's daily offer recommendation turns out to be wrong (tracked
internally), the consequence in Week 1 is **narrative-only**. No mechanical
penalty is applied. The day-end summary may include a dry line:

> KASSANDRA recommended the Cappuccino Special. Demand was lower than predicted.
> No further comment was offered.

No revenue modifier is applied in Week 1. Mechanical inaccuracy penalties
are a Phase 1+ concern.

---

## Weirdness Visibility Gate

The field `weirdnessVisible` controls whether the weirdness value surfaces
in any part of the UI.

| State | Condition |
|---|---|
| `weirdnessVisible: false` | Default from Day 1 through end of Day 6 |
| `weirdnessVisible: true` | Set when the Day-7 letter event fires |

Requirements:

- No React component may render a weirdness label, bar, numeric value, or
  CSS class derived from the weirdness value while `weirdnessVisible` is `false`.
- The weirdness value may be stored in game state and updated internally
  throughout Days 1–7. Only its visibility is gated.
- Stress events in Days 1–6 must draw only from the mundane event list.
- After `weirdnessVisible` becomes `true`, the weirdness value may be surfaced
  in the end-of-week summary, the Day-7 letter screen, or a dedicated panel.

---

## Save and Reload Requirements

All new state fields introduced by this design must persist correctly across
browser reloads.

Required behaviors:

- Game state saved to localStorage must include all new fields:
  `cleanliness`, `stress`, `supplies.coffee`, `supplies.milk`, `supplies.pastries`,
  `helperAssignment` (nullable), `stressEventLog`, `weirdnessVisible`.
- Load must handle a missing or malformed save without crashing — fall back to
  new-game defaults.
- A "Reset / New Game" control must remain accessible at all times.
- Reloading mid-day must restore the day's state correctly: helper assignment
  for the day, current cleanliness, current stress, current supplies.
- No circular references, class instances, or functions may be stored in the
  serialized state.

---

## UI Requirements

### HUD (top bar, one row)

```
💰 Kasse: €42   ☕ Kaffee: 8   🥛 Milch: 6   🥐 Gebäck: 4
✨ Ordentlich   😤 Geschäftig   ⭐ Ruf: aufbauend
```

- Cleanliness and Stress use text state labels, not only color bars.
- Color is a secondary indicator only — all states must be readable as text.
- Resource counts fall to red/amber at low levels but always carry a numeric value.

### Action panel

Normal day:
```
[ Take Order ]   [ Clean Table ]   [ Check Supplies ]   [ End Day ]
```

With helper assigned:
```
[ Jana: Cleaning ✓ ]   [ Take Order ]   [ Take Order ]   [ End Day ]
```

The helper's slot shows their task as filled. The remaining player action
slots are still available.

### End-of-day summary

Must include:
- Money earned, money spent
- Customers served
- Supplies remaining
- Cleanliness state at close
- Stress state at close and whether a stress event occurred
- Reputation change (+ or −)
- Helper assignment recap (if applicable)
- One flavor line for any stress event that fired
- Day-7 only: the official apocalyptic letter, then `weirdnessVisible: true`

### Supply purchase screen (shown after day summary)

```
Buy for tomorrow:

  Coffee beans:   X / 20 units   @ €0.80/unit    [ − ]  X  [ + ]
  Milk:           X / 20 units   @ €0.40/unit    [ − ]  X  [ + ]
  Pastries:       X / 12 units   @ €1.20/unit    [ − ]  X  [ + ]

  Total cost: €XX.XX     Balance after: €XX.XX

  [ Confirm Purchases ]
```

- Quantity selectors are capped at (max − current stock) per ingredient.
- Confirm button is disabled if total cost exceeds current balance.
- Balance-after preview updates in real time as quantities change.

---

## Recommended Implementation Tests

These tests must pass before PROMPT-6B is considered done.

### Supply tests

- Serving a cappuccino: `coffee −1`, `milk −1`, `money +price`.
- Serving a cappuccino with `milk = 0`: product blocked or substituted; `reputation −1`.
- End-of-day purchase correctly adds units up to cap; correctly deducts money.
- Purchasing above the cap is blocked or silently capped.
- Purchasing with insufficient funds is blocked.

### Cleanliness tests

- Each customer served decrements cleanliness by 2.
- Manual cleaning action increments cleanliness by 12.
- Cleanliness below 40 at day end reduces reputation by 1.
- Cleanliness at or above 70 at day end increases reputation by 1.
- Jana on cleaning duty keeps cleanliness at or above 45 without manual action.

### Stress tests

- Serving customers within comfortable capacity adds 0 stress.
- Each customer beyond comfortable capacity adds 8 stress.
- Cleanliness below 40 during the day adds 5 stress (once per day).
- Any supply reaching 0 during a serving attempt adds 5 stress (once per ingredient per day).
- Overnight rest reduces stress by 20, minimum 0.
- Nino on counter duty reduces stress by 8.
- Mira on counter support reduces stress by 5.
- Stress at 81+ triggers a guaranteed end-of-day event with non-empty flavor text.
- Stress event flavor text is drawn from the mundane list, not the weirdness list, in Days 1–6.

### Helper assignment tests

- Helper hire UI is absent or disabled before Day 5.
- Only one helper can be hired per day; a second selection replaces the first.
- Helper assignment is fixed at day start; the UI does not allow reassignment after the day opens.
- Jana cleaning: cleanliness auto-maintained at or above 45 without player cleaning action.
- Jana service: one extra order processed without consuming a player action.
- Nino barista: reputation bonus correctly applied per qualifying order (max +3/day).
- Nino counter: stress reduction of 8 applied during the day.
- Mira marketing: extra advertising slot available.
- Mira counter: stress reduction of 5 applied; one extra order slot.
- Hire cost deducted at day start; hire blocked if balance insufficient.

### Weirdness gate tests

- `weirdnessVisible` is `false` at the start of Days 1–6.
- No UI component renders a weirdness label, bar, number, or weirdness-derived CSS class when `weirdnessVisible` is `false`.
- `weirdnessVisible` becomes `true` after the Day-7 letter event fires.
- The weirdness value is still internally updated throughout Days 1–7.
- Stress events in Days 1–6 pull only from the mundane event list.

### Save / reload tests

- All new state fields persist correctly across a browser reload mid-day.
- A missing or malformed save falls back to new-game defaults without crashing.
- Helper assignment for the day is correctly restored after reload.
- Supply counts after a purchase are correctly restored after reload.

---

## Guest appreciation (light slice hint — implemented)

A light, slice-level hint of the long-term coffee-appreciation system (GitHub #56):

- Guest data may carry `appreciatedProductIds` plus a `delightLine` / `letdownLine`.
- Serving a guest a product they appreciate grants **+1 reputation**, capped at
  **2 bonuses per day** (`dayManagement.appreciationBonusesGiven`), and shows the delight line.
- Serving a picky guest something they don't value shows the letdown line — **no penalty**.
- Currently wired for Cappuccino-Christa (cappuccino) and Herr Bohn (filterkaffee).
- The full coffee-variety / quality-tier system and per-guest taste catalog remain **out of scope** (post-MVP, #56).

---

## Out of Scope for PROMPT-6B

Do not implement the following. They belong to later phases.

- Staff scheduling, shifts, or rosters
- More than one helper per day in Week 1
- Permanent employment or staff loyalty/morale
- Supply delivery timing or multiple supplier choices
- Real-time or tick-based stress (stress is day-granular only)
- Stress causing game over, save loss, or locked mechanics
- Weirdness label, bar, or number visible before Day-7 hook
- Customer pathfinding or animation
- Localization/i18n migration
- Mobile layout optimization
- Final production pixel-art assets
- KASSANDRA mechanical inaccuracy penalties (Week 1: narrative-only)
- Real AI API integration
- Backend, accounts, analytics, payments
- Multiple café locations
- Macro-management systems
- Full apocalypse operations layer
- Complex balancing passes

---

## Approved Decisions Reference

The following decisions were confirmed by the user before PROMPT-6B was authorized.
They are binding. Do not re-open them during implementation.

| Decision | Value |
|---|---|
| Comfortable capacity Day 1 | 5 |
| Comfortable capacity Day 2 | 5 |
| Comfortable capacity Day 3 | 6 |
| Comfortable capacity Day 4 | 6 |
| Comfortable capacity Day 5 | 7 |
| Comfortable capacity Day 6 | 7 |
| Comfortable capacity Day 7 | 8 |
| Coffee supply cap | 20 |
| Milk supply cap | 20 |
| Pastry supply cap | 12 |
| Helper availability | Day 5 onward |
| Helpers per day | 1 |
| Assignment timing | Day start; final for the day |
| Mid-day reassignment | Not allowed in Week 1 |
| Stress event tone | Placeholder lines provided; tone review required before production |
| KASSANDRA wrong-recommendation effect | Narrative-only in Week 1; no mechanical penalty |

---

## Binding Note for PROMPT-6B

This document is the implementation contract for the Week-1 management tradeoff
system. Codex must not add mechanics beyond what is described here. If a design
gap is discovered during implementation, Codex must stop and report the gap
rather than inventing a solution.

Any change to the approved decisions table requires explicit user approval
before it is implemented.
