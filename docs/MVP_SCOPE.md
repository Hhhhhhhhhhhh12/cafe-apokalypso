## docs/MVP_SCOPE.md

### MVP: Seven-Day Vertical Slice

The MVP includes:
- one café room in a light 3/4 pixel-inspired view
- seven playable in-game days
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
- first visible weirdness unlock after day 7
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
- full mythology roster
- complex staff scheduling
- real-time pathfinding
- advanced animations

### MVP Goal

The MVP should feel like a small but complete vertical slice, not like a static mockup.

The player should be able to:

- open the café
- serve guests across seven in-game days
- make simple economic decisions
- notice that guests behave differently
- unlock advertising
- hire temporary help
- install KASSANDRA
- receive the first explicit apocalyptic hook
- want to continue into week 2

The MVP is successful if the first seven days already create the feeling of a cozy café management game that is beginning to become strange.

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
- Freelancerin Mira

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
- Mira: marketing / counter

Mira is the same character as Freelancerin Mira (normal recurring guest). She is a freelancer-style regular who can also be hired as a day helper starting Day 5. This dual role is intentional and should be reflected in both the guest data entry and the staff data entry.

Each staff option should have a clear gameplay effect, a daily cost, and at least one flavor line.

### MVP Progression Requirements

The MVP must not feel too slow.

Each of the seven in-game days should introduce at least one meaningful new element:

- Day 1: core order flow
- Day 2: guest behavior differences
- Day 3: prices, supplies, and daily offers
- Day 4: advertising and Herr Grau
- Day 5: temporary staff
- Day 6: KASSANDRA update
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

The MVP ends after day 7 with the official apocalyptic letter.

After the letter:

- hidden weirdness becomes visible
- apocalypse operations are foreshadowed
- the full apocalypse system remains locked for later development
- week 2 is teased as the next expansion point

The end of the MVP should create a clear “I want to keep playing” moment.
