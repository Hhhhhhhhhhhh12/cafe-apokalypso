## docs/GAME_DESIGN.md

### Week 1: The Almost Normal Café

Week 1 teaches the player the core café management loop while establishing the first signs of the larger absurd-apocalyptic premise.

Day 1 introduces direct café interactions: taking orders, preparing coffee, accepting payment, and cleaning tables.

Day 2 introduces guest behavior differences such as patience, spending power, seat time, and quality expectations.

Day 3 introduces basic economy: ingredient purchasing, price adjustment, and daily offers.

Day 4 introduces advertising as a way to influence guest types and demand.

Day 5 introduces temporary staff as the first delegation mechanic.

Day 6 introduces the KASSANDRA cash register update, adding basic demand prediction and the first simulated AI/oracle layer.

Day 7 acts as a small operational stress test and ends with the first explicit apocalyptic hook: an official letter from the Office for Extraordinary Operational Relevance.

### Core Concept

Café Apokalypso is a cozy-absurd café management soft-roguelite for the web.

The player starts with a seemingly normal small café. Early gameplay focuses on direct micromanagement: taking orders, preparing simple products, accepting payment, cleaning tables, managing basic ingredients, setting prices, and choosing small advertising actions.

The long-term structure is built around repeated café weeks. A week functions as a soft run: the player manages several in-game days, responds to guests and events, and reaches an end-of-week pressure point. If the week collapses or becomes unstable, reality may partially reset, while KASSANDRA preserves fragments of memory, guest knowledge, unlocks, forecasts, or start bonuses.

As the game progresses, guests, events, business systems, and the café itself become increasingly strange. Normal regulars gradually give way to mythological edge cases, AI-oracle behavior, apocalyptic bureaucracy, and world-ending incidents that are treated with dry business language.

The game should evolve from micromanagement into macromanagement:

- hire staff
- delegate tasks
- control advertising
- stabilize the economy
- expand the café and later locations
- manage strange customer groups
- delay increasingly absurd end-of-world scenarios

The roguelite layer should remain soft and cozy rather than punitive. There is no hard permadeath and no full reset of player progress. Failure states should be humorous, useful, and partially productive: a failed week still teaches KASSANDRA something and gives the player a reason to try the next café week with better information.

The café remains cozy and inviting even as the world around it becomes stranger.

### Narrative North Star: the café as a save point (long-term)

The long-term meta-premise — to be revealed slowly, **not** in the week-1 slice — is that
Café Apokalypso is a **save point and inn for characters from other (fictional / video-game)
worlds**. Between their own adventures, these characters drop in to **save their progress and
heal**, then return to their stories. The café is a quiet checkpoint at the seam between worlds.

This reframes systems that already exist as flavor:

- **Saving** is the "Memory Ledger / guestbook" ("Reality has been checked in.") — see *Save System Flavor* below.
- **Healing / recovery / memory-stabilization** become the later **inn-room services** (see `docs/ROADMAP.md`, Phase 4 and North Star #7).
- KASSANDRA's memory preservation across collapsed weeks fits the same seam-between-worlds logic.

**Vertical-slice rule:** week 1 may only *hint* at this (a guest who seems to be "between
adventures", a save framed as a ledger, an odd "checking in" line). No explicit cross-world
reveal in the MVP. Full mechanics are post-MVP.

Tracked in GitHub: **#55** (this meta-plot), **#56** (coffee varieties + per-guest appreciation →
reputation; seed already in `guests.ts` `behaviorTags` like `quality-expectations`), **#57**
(furniture/décor shop that places new graphics into the café). All three are **long-term**;
the slice only hints at them.

### Décor economy: shabby start → paid upgrades (refines #57)

The café **starts with the shabbiest possible furniture and props** (wobbly chairs, a
chipped pot, a bare bulb, a sack with a hole). As the player earns money they **buy
upgrades** that swap in nicer graphics — the same prop slot, a better tier. This turns
décor into a visible money sink and a felt progression curve, and it gives the Pixellab
prop pipeline a clear job: **generate each prop in tiers (shabby → standard → nice)**.

- Each prop slot (plant, lamp, chair/table, counter clutter, clock) has 2–3 visual tiers.
- Buying a tier is a management action with a cash cost; the swap is purely cosmetic at
  first, later optionally tied to small comfort/reputation bumps.
- Slot + fallback structure already exists in `CafePlaceholder.tsx`; an upgrade just
  changes which asset that slot renders. Provisional assets stay replaceable.
- Asset implication: when generating props, also keep a deliberately **shabby variant**
  (worn, mismatched, dim) as the day-1 default.

### Living plants: vegetation stages (post-MVP, Phase 4)

Separate axis from the purchase tiers above. Plants have **health/growth stages**
(e.g. welk → ok → frisch → üppig) that drift on their own:

- **Wilting is time-driven.** Plants slowly decline over days; the decline runs
  **faster while the café goes uncleaned**.
- **Cleaning waters them.** A cleaning action is also "watering" — it nudges nearby
  plants **up** a stage. So care visibly pays off.
- **Loosely coupled to cleanliness, with a time delay — deliberately NOT 1:1.** A strict
  cleanliness→plant mapping would feel linear and gamey. Instead cleanliness *biases the
  drift rate*, while time drives the actual change, with lag. Plants therefore drift
  semi-independently of the meters → realism and variety (one plant thrives while another
  sulks).
- Reuses the décor slot/asset-swap structure; "stage" just selects which sprite a plant
  slot renders. Needs per-plant stage sprites (welk/ok/frisch).
- **Kumquat is exempt** (it is `special`): it **never wilts** — "fruits that never run
  out." Its constancy while everything else drifts is its first subtle *tell*. Optional
  idle detail: a **light rustle once per day**, even when nothing touches it.

### Who is the player? (proposed — pending owner confirmation)

Proposed framing to resolve "there is no protagonist avatar in the room": the player is
**not a physical character**. The player is the café's **disembodied keeper** — the
"lyrical I" of the game, a non-physical presence that runs the place. This fits the
save-point-between-worlds north star (the café itself is a seam; its keeper need not be
a body) and KASSANDRA's habit of classifying everyone ("96% mortal, 4% unclear" — perhaps
the keeper is the unclear 4%).

Consequences if adopted:

- **Paula becomes the first employee/hand**, not just a guest — the keeper hires Paula so
  the café has a body on the floor. The slice could start with Paula already working.
- This is why guest/staff sprites carry the scene while no "player character" is drawn.
- **Paula's later mission**: she leaves the café on an errand into another world — a
  natural use of the canon's reserved **side-view special-mission camera**. A first hook
  for the post-slice arc.

Status: **proposed by owner, not yet binding.** Week-1 slice does not state any of this;
it only needs to not contradict it. Promote to canon once confirmed.

### Main Game View

The main gameplay view is a small, full pixel café shown as a light 3/4 diorama.

The main view should feel like a concrete place the player owns and grows over time. It is not a side view and not a pure management dashboard.

The starting café should visibly include:

- entrance
- small queue area
- counter
- coffee machine
- cash register
- two guest tables
- small storage shelf
- menu board
- plant or simple decor
- window, street, weather, or daylight detail

The café should remain the emotional anchor of the game throughout progression. Management panels, staff systems, advertising, economy, and expansion layers grow around this café view rather than replacing it.

Side-view scenes are reserved for special missions, event scenes, basement encounters, backdoor deliveries, or rare apocalyptic incidents. They are not the default gameplay camera.

### Tag-1 Screen

The first playable screen presents a small, normal-looking café. The goal is to make the player feel ownership and attachment before the absurd mythological/apocalyptic layer becomes explicit.

The HUD should be minimal at first:

- day and time
- money
- reputation
- small task list
- contextual action bar

Initial direct actions:

- take order
- prepare simple drink
- accept payment
- clean table
- buy basic ingredients
- choose a simple daily offer

The first day should feel like normal café management with one tiny anomaly at the end: the coffee machine briefly displays an impossible message after closing.

Example event text:

> The coffee machine briefly displays “Good morning.” It is 14:07.

### Save System Flavor

The technical save system should remain simple and local-first, using browser storage only.

In-world, saving may be presented as the café's guestbook or memory ledger rather than as a purely technical menu action.

Possible UI copy:

- Save in the Memory Ledger
- The guestbook remembers.
- Reality has been checked in.
- Autosave: the guestbook quietly updates itself.
- Previous guests successfully remembered.

The save flavor should support the later inn-room fantasy without requiring the room system to exist in the MVP.

### Early Progression and Pacing

Café Apokalypso should not develop too slowly. The first seven in-game days must each introduce at least one meaningful new element: a mechanic, guest behavior, management option, upgrade, staff option, advertising option, or narrative anomaly.

Week 1 remains grounded in normal café management, but it should provide a clear sense of escalation by the end of day 7. The first explicit apocalyptic hook appears at the end of week 1 through an official letter registering the café as apocalyptically relevant caffeine infrastructure.

Week 2 should escalate faster with visible weirdness, daily KASSANDRA forecasts, the first clearly strange guest interactions, the first small apocalyptic incident, and stronger delegation systems.

### Soft-Roguelite Structure

The game is structured around repeatable café weeks.

- A café week is a run.
- An in-game day is a management round inside that run.
- End-of-day summaries show operational results, guest reactions, and strange observations.
- End-of-week events test how stable the café, economy, guest base, and reality layer have become.
- KASSANDRA acts as the main meta-progression frame by preserving selected memory fragments between unstable weeks.

Soft-roguelite progression may later include:

- remembered guest files
- unlocked recipes
- staff options
- starting bonuses
- KASSANDRA forecast modules
- better audience predictions
- known omen patterns
- recurring bureaucratic exceptions

The first seven-day MVP represents the first playable café week / first soft-roguelite run. Day 7 reveals that the café is part of a larger repeating crisis structure, but full meta-progression does not need to be implemented in the MVP.

### Week 1 Day Structure

Day 1: New Opening

- basic order flow
- preparing coffee
- accepting payment
- cleaning tables
- first coffee-machine flicker after closing

Day 2: Regulars Begin to Form

- guest behavior differences
- patience, spending power, seat time, quality expectations
- first harmless memory hint through Herr Bohn

Day 3: Prices and Supplies

- ingredient purchasing
- price adjustment
- daily offers
- strange cash-register suggestion

Day 4: Advertising

- flyers in the neighborhood
- student discount
- social media post
- first appearance of Herr Grau

Day 5: First Temporary Help

- Jana, Nino, or Nele can help for one day
- first delegation mechanic
- strange wet-table event if Jana works
- first possible appearance of Meda

Day 6: KASSANDRA

- cash register update
- basic demand prediction
- automatic audience targeting
- first mortality analysis

Day 7: The Letter

- slightly busier café day
- Frau mit rotem Regenschirm
- official letter from the Office for Extraordinary Operational Relevance
- weirdness becomes visible
- apocalypse operations are foreshadowed
- first hint that the week may be part of a repeatable soft-roguelite crisis loop

### Week 1 Guests

Normal week-one guests:

- Pendlerin Paula: quick coffee customer, wants to survive Monday.
- Laptop-Lukas: spends little, sits for a long time, blocks tables.
- Lieferfahrer Cem: impatient, low spend, easy to serve quickly.
- Cappuccino-Christa: pays better, has high quality expectations.
- Herr Bohn: older regular with strange memories of the building.
- Freelancerin Nele: dry humor, sees the café as “authentic,” not necessarily as a compliment.

Subtly strange week-one guests:

- Herr Grau: polite, quiet, pays with a coin that does not fit any accounting category.
- Frau mit rotem Regenschirm: appears with a red umbrella although it is not raining and asks not to be recognized.
- Meda: appears calm and still, always wears sunglasses indoors, subtle snake-like hair silhouette, avoids direct eye contact. Other guests nearby become slightly uneasy without knowing why. She is the first clearer mythological hint in the demo. Meda is not Nele. Do not merge them.

### KASSANDRA

KASSANDRA starts as a normal-looking cash register system update.

It should not immediately behave like a full oracle. Its early humor comes from dry confidence, strange classifications, and increasingly inappropriate business analytics.

Early KASSANDRA tone:

- calm
- analytical
- slightly wrong
- oddly specific
- not openly magical at first

Example line:

> Good morning. I have analyzed your customer base. Result: 96% mortal, 4% unclear.

KASSANDRA later unlocks forecasts, automatic offer analysis, audience targeting, and apocalyptic warnings.

### Management Progression

The game develops from direct micromanagement to broader macromanagement.

Early game:

- take orders manually
- prepare drinks manually
- clean tables
- buy supplies
- set prices
- run simple advertising

Mid game:

- temporary help
- permanent staff
- role assignment
- partial automation
- marketing control
- more stable economy

Late game:

- multiple areas or locations
- shift leads
- expansion
- supply chains
- factions
- apocalyptic incidents
- delaying world-ending scenarios

### Future Expansion: Rooms Above the Café

At a later stage, Café Apokalypso expands beyond food and beverages.

The upper floor eventually becomes accessible and introduces guest rooms, transforming the business into a strange mixture of café, inn, and reality-maintenance service.

Inspired by classic RPG inns, guests may arrive seeking recovery, rest, memory restoration, existential stabilization, or treatment for unusual conditions.

Example future guests:

- an adventurer suffering from sword-related overconfidence
- a bureaucrat wounded by excessive paperwork
- a prophet exhausted by spoilers from the future
- a skeleton requiring structural relaxation
- a minor deity suffering from temporary mortality

Rooms become an additional management layer involving comfort, reputation, room upgrades, specialized services, and unusual guest requests.

This system is intentionally not part of Week 1 or the MVP demo.

### Week 1 Foreshadowing: Upstairs Rooms

Week 1 may lightly hint at the later inn-room system without making it playable.

Possible foreshadowing details:

- a room key labelled "Room 4" occasionally appears behind the counter
- guests sometimes ask whether rooms are available upstairs
- KASSANDRA occasionally recommends purchasing pillows without explanation
- a staircase seems to continue further upward than the building should allow

These hints should remain optional flavor in the MVP and must not imply that rooms are unlocked during the first seven days.

### Tone

Café Apokalypso uses warm, dry, understated absurdity.

The early game should feel like a normal café with tiny cracks in reality. The humor should come from contrast: serious café management language applied to increasingly impossible situations.

Preferred tone:

- calm
- cozy
- slightly bureaucratic
- deadpan
- observant
- never random just for the sake of randomness

Avoid:

- loud meme language
- excessive darkness
- horror-first framing
- overexplaining the mystery too early
- making every line absurd from the beginning

Example tone lines:

> The café is authentic. I am not sure whether that is good.

> The light is good. Slightly existential, but good.

> Herr Grau gives a tip and a coin that smells faintly of cellar.

### Official Week-1 Hook

At the end of day 7, the player receives the first explicit apocalyptic hook:

> Office for Extraordinary Operational Relevance  
> Department: Caffeine, Threshold Sites, and Minor End Times  
>  
> Dear management,  
>  
> Your café has been mistakenly pre-registered as apocalyptically relevant caffeine infrastructure.  
>  
> Please ignore this letter if you are fully mortal.  
>  
> If you are not fully mortal, please refer to Appendix 7b:  
> “Minimum supplies during imminent reality thinning.”  
>  
> Kind regards,  
> on behalf of: illegible

After this letter, the hidden weirdness value becomes visible and apocalypse operations are foreshadowed, but the full apocalypse system is not yet active.
