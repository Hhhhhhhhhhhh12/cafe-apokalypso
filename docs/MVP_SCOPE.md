## docs/MVP_SCOPE.md

### MVP: Seven-Day Vertical Slice

- one café room in a light 3/4 pixel-inspired view
- a limited set of curated pixel-art pilot assets for the vertical slice
- seven playable in-game days forming the first café week / first soft-roguelite run
- 6 normal guests
- 3 subtly strange guests
- 5 basic products
- basic resources: money, coffee, milk, pastries, reputation, cleanliness, stress, hidden weirdness
- basic order flow
- basic table cleaning
- basic daily summary
- price and inventory management
- daily offers
- advertising
- temporary staff
- KASSANDRA cash register update
- first visible weirdness unlock and soft-roguelite crisis-loop hint after day 7
- local save
- achievements
- deterministic game-state logic
- tests for economy, guest flow, staff effects, advertising effects, and event triggers

Out of scope for MVP:
- real AI APIs
- backend
- accounts
- payments
- multiple locations
- usable bedrooms or upper floors
- healing / inn-room mechanics
- overnight guest management
- full mythology roster
- full final art pass
- full 8-direction character sprite sets
- complete animation system
- complete Day 1–7 art layering
- committing raw AI Studio / Gemini / Nano Banana image batches as production assets
- complex staff scheduling
- real-time pathfinding
- advanced animations

### MVP Art Scope

The MVP may include first curated pixel-art pilot assets, but only as a limited vertical-slice proof of direction.

In scope:

- one approved Day-1 café background or background slice
- 4–6 approved normal guest sprites
- one approved barista/staff sprite
- 6–10 approved café props
- 1–2 approved weirdness overlay props, such as a clock anomaly, tiny portal cup, endless receipt, form stack, or AI-oracle object
- a small internal/local art review workflow if it helps select, annotate, and export review notes for guest and prop candidates

Out of scope:

- complete final production art
- all character sprites
- all guest variants
- full 8-direction turnarounds for all characters
- full walking/idle/sitting animation sets for all characters
- complete art layers for every day from Day 1 to Day 7
- generated UI text baked into image assets
- raw AI Studio / Gemini / Nano Banana image sheets committed into the repository as assets

Rules:

- Raw AI-generated sheets remain outside the repository.
- Only cropped, curated, explicitly approved pilot assets may enter the repository.
- UI text must remain real HTML/CSS/React text, not baked into generated images.
- CSS or structured placeholders must remain available as fallback if pilot assets are missing or replaced.
- Pilot assets are provisional unless later marked as final in the art pipeline documentation.


### MVP Implementation Work Order

Recommended implementation order for the current MVP issues:

1. Create the reusable GitHub issue template.
2. Finalize the management tradeoff design document.
3. Create the playable Vite + React + TypeScript app shell.
4. Add the typed MVP data model for guests, products, resources, and days.
5. Refine the deterministic game-state engine.
6. Implement the first seven-day MVP loop as data-driven progression.
7. Build the first café dashboard with the 3/4 diorama placeholder.
8. Implement local save/load.
9. Add regression tests for economy, guest flow, staff effects, advertising effects, and event triggers.
10. Add the accessibility and keyboard baseline.
11. Add CI verification for lint, typecheck, test, and build.
12. Improve demo discovery, README guidance, and GitHub Pages readiness.

This order is not a strict dependency chain. It is intended to reduce rework: first clarify reusable project structure and design constraints, then build shell/data/engine, then UI and persistence, then quality gates and public demo presentation.

### MVP Goal

The MVP should feel like a small but complete vertical slice and the first playable café week / first soft-roguelite run, not like a static mockup.

The player should be able to:

- open the café
- serve guests across seven in-game days
- make simple economic decisions
- notice that guests behave differently
- unlock advertising
- hire temporary help
- install KASSANDRA
- receive the first explicit apocalyptic hook and crisis-loop hint
- notice light hints that the café may later expand into an inn-like space upstairs
- want to continue into week 2

The MVP is successful if the first seven days already create the feeling of a cozy café management soft-roguelite that is beginning to become strange, while still remaining fully playable as a grounded first café week.

### Week 1 Data Scope

The MVP data set includes:

- 6 normal guests
- 3 subtly strange guests
- 5 basic products
- 4 advertising campaigns
- 3 temporary staff options
- 7 early upgrades
- 9 scripted week-one events
- 7 achievements

The game should be built so these entries can later be expanded through structured data instead of hard-coded UI logic.

### Week 1 Guests

Normal guests:

- Pendlerin Paula
- Laptop-Lukas
- Lieferfahrer Cem
- Cappuccino-Christa
- Herr Bohn
- Freelancerin Nele

Subtly strange guests:

- Herr Grau
- Frau mit rotem Regenschirm
- Meda

### Week 1 Products

The MVP products are:

- Filterkaffee
- Espresso
- Cappuccino
- Croissant
- Kaffee + Croissant

Later products such as Cold Brew, Flat White, Ambrosia Macchiato, Schattenmilch Cortado, Apokalypse Americano, and entkoffeinierter Unterweltkaffee are out of scope for the MVP.

### Week 1 Advertising

Advertising begins as a grounded management system and later becomes a bridge into stranger guest acquisition.

MVP advertising options:

- Flyer in der Nachbarschaft
- Studentenrabatt
- Social-Media-Post
- Automatische Zielgruppenoptimierung, unlocked through KASSANDRA

Advertising should affect both guest count and guest type, not only revenue.

### Week 1 Temporary Staff

The MVP includes only temporary day helpers, not permanent employment or shift scheduling.

Temporary staff options:

- Jana: service / cleaning
- Nino: barista
- Nele: marketing / counter

Nele is the same character as Freelancerin Nele (normal recurring guest). She is a freelancer-style regular who can also be hired as a day helper starting Day 5. This dual role is intentional and should be reflected in both the guest data entry and the staff data entry.

Each staff option should have a clear gameplay effect, a daily cost, and at least one flavor line.

### MVP Progression Requirements

The MVP must not feel too slow.

Each of the seven in-game days should introduce at least one meaningful new element:

- Day 1: core order flow
- Day 2: guest behavior differences
- Day 3: prices, supplies, and daily offers
- Day 4: advertising and Herr Grau
- Day 5: temporary staff
- Day 6: KASSANDRA update and subtle upstairs-room foreshadowing
- Day 7: operational stress test, Frau mit rotem Regenschirm, and official apocalyptic letter

### MVP Technical Constraints

The MVP is a static web app.

Required:

- Vite
- React
- TypeScript
- localStorage save
- deterministic game-state logic
- data-driven content
- unit tests for core game systems

Not allowed in the MVP:

- real AI API calls
- backend server
- user accounts
- external tracking
- payment systems
- required network access after loading

KASSANDRA and all AI-like behavior must be simulated through authored content, deterministic rules, and controlled randomization.

### Localization Scope

German and other languages are planned later, but localization is not part of the MVP implementation.

The MVP may use direct strings initially, but the architecture should not block later migration to i18n files such as:

- `src/i18n/de.json`
- `src/i18n/en.json`

Before translation work begins, user-facing content should be migrated into stable text keys.

### First Demo Ending

The MVP ends after day 7 with the official apocalyptic letter and the first hint that this café week may be part of a repeatable soft-roguelite crisis loop.

After the letter:

- hidden weirdness becomes visible
- apocalypse operations are foreshadowed
- later upstairs rooms / inn-style healing remain teased but locked
- the full apocalypse system remains locked for later development
- week 2 / the next café run is teased as the next expansion point

The end of the MVP should create a clear “I want to start the next café week / run” moment.

### Locked Future Systems Mentioned in MVP

The MVP may show or mention locked future systems as flavor, provided they are clearly not playable in the first seven days.

Allowed locked-system teasers:

- an inaccessible upper floor
- a room key labelled "Room 4"
- guest questions about rooms upstairs
- KASSANDRA suggesting pillows without explanation
- save-system copy framed as a guestbook or memory ledger

Not allowed in MVP implementation:

- room construction or room upgrades
- healing mechanics
- overnight guests
- rentable beds
- upper-floor navigation
- any playable inn-management loop

These teasers exist only to hint at the later RPG-inn-inspired expansion described in `docs/GAME_DESIGN.md`.
