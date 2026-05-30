# Roadmap

## Phase 0: Smoke-front MVP

Goal: create a portfolio-ready first prototype that demonstrates the identity of Café Apokalypso without pretending to be the full game.

Scope:

- static web app
- local browser save
- first 7 in-game days
- one small 3/4 pixel-inspired café view
- placeholder or CSS-based pixel-style art
- basic guest flow
- basic products
- money, reputation, supplies, cleanliness, stress, hidden weirdness
- simple day progression
- first advertising options
- temporary staff options: Jana (service/cleaning), Nino (barista), Mira (marketing/counter)
- KASSANDRA update
- first explicit apocalyptic hook at the end of day 7
- light foreshadowing of an inaccessible upper floor / future inn-room system
- save-system flavor framed as a guestbook or memory ledger

Success criteria:

- the player can complete the first week
- the café feels cozy and readable
- the game does not feel like a pure dashboard
- each day introduces something meaningful
- the ending makes the player want to continue into week 2

Out of scope:

- real AI API
- backend
- accounts
- multiple locations
- usable bedrooms or upper floors
- healing / inn-room mechanics
- overnight guest management
- full mythology roster
- advanced animations
- complex pathfinding
- full balancing

## Phase 1: Real Vertical Slice

Goal: turn the smoke-front into a stronger playable vertical slice with better game feel, clearer systems, and more replay value.

Focus:

- improve week-one pacing
- refine core order/resource loop
- make guest differences more visible
- improve daily summary and upgrade choices
- add stronger feedback for staff, advertising, and pricing
- polish KASSANDRA’s early behavior
- improve café layout and visual clarity
- introduce a limited set of curated pixel-art pilot assets
- add more satisfying achievements
- add basic balancing tests

Likely additions:

- better café UI states
- clearer guest status indicators
- richer tooltips
- better event presentation
- more week-one flavor lines
- first week-two teaser screen
- first approved pixel-art pilot assets in the café view
- simple art review flow for selecting/refining guest and prop candidates
- improved README with screenshots or GIFs

Success criteria:

- the first 7 days are fun enough to replay
- the management loop is understandable without long explanations
- the weirdness escalation is noticeable but not too early
- the café view includes first curated pixel-art pilot assets without losing CSS/placeholder fallbacks
- raw generated AI image sheets are not committed as production assets
- UI text remains real HTML/CSS/React text, not baked into generated images
- the repository looks intentional and well-structured

Art pilot boundaries:

- in scope: first curated Day-1 café background or background slice, 4–6 approved normal guest sprites, one barista/staff sprite, 6–10 café props, and 1–2 weirdness overlay props
- in scope: local/internal art review tooling if it helps select, annotate, and export review notes for guest and prop candidates
- out of scope: full final art pass, full 8-direction character sets, complete animation system, all guest sprites, complete Day 1–7 art layering, or committing raw AI Studio / Gemini / Nano Banana image batches

## Phase 1.5: Week 2 Expansion

Goal: make the game open up after the first apocalyptic hook.

Week 2 should escalate faster than week 1.

Focus:

- visible weirdness value
- daily KASSANDRA forecasts
- first clearly strange guest interaction
- first small apocalyptic incident
- stronger delegation or first permanent staff option
- first visible café alteration caused by weirdness or KASSANDRA
- first early apocalypse-operations panel, still limited
- clearer hints that the café may eventually function like an absurd RPG inn

Possible systems:

- weirdness thresholds
- KASSANDRA forecast accuracy
- small crisis events
- staff tolerance for weirdness
- basic customer-group targeting
- first “official notice” chain from the apocalyptic bureaucracy

Success criteria:

- the player feels the game has moved beyond normal café management
- the first week’s hook pays off quickly
- new systems still remain readable and cozy

## Phase 2: Macro-management Layer

Goal: shift the game from direct micromanagement into broader café management.

Focus:

- permanent staff
- staff roles
- task delegation
- schedule or shift-lite system
- more meaningful advertising
- stronger supply management
- pricing strategy
- economic pressure without harsh failure states
- café upgrades and layout growth

Possible systems:

- staff traits
- staff weirdness tolerance
- role assignments
- customer segment targeting
- supplier choices
- maintenance and cleanliness automation
- café reputation categories
- recurring events

Success criteria:

- the player performs fewer repetitive manual actions
- decisions become more strategic
- the café still remains visually central
- management panels support the café rather than replacing it

## Phase 3: Apocalypse Systems

Goal: formalize the apocalyptic layer as a recurring long-term pressure system.

Focus:

- apocalyptic bureaucracy
- world-ending incidents
- mythological guests
- KASSANDRA as oracle-like system
- weirdness as a visible strategic factor
- crisis mitigation through café operations
- absurd but readable escalation

Possible systems:

- apocalypse calendar
- incident severity
- mitigation actions
- official notices and forms
- mythological guest factions
- prophecy accuracy
- reality-thinning events
- special side-view missions for rare events

Success criteria:

- apocalypse systems feel funny, threatening, and manageable
- crisis events create interesting choices without destroying the cozy tone
- KASSANDRA becomes a central identity feature

## Phase 4: Expansion and Long-Term Progression

Goal: support longer-term play and broader café operations.

Focus:

- new café areas
- unlockable upper floor with strange guest rooms
- possible second location
- specialized stations
- expanded staff structure
- advanced marketing
- richer guest collection
- more products and strange recipes
- long-term achievements
- repeatable but varied weeks

Possible systems:

- café rooms or zones
- RPG-inn-inspired guest rooms
- absurd healing, recovery, and memory-stabilization services
- overnight guest requests and room upgrades
- branch/location management
- supply chains
- franchise-like absurd expansion
- guest collection book
- recipe collection
- décor with mechanical effects
- major recurring mythological arcs

Success criteria:

- the player has meaningful long-term goals
- the game supports repeated sessions
- macro-management remains cozy and understandable

## Phase 5: Polish, Localization, and Packaging

Goal: prepare the game for wider sharing beyond the initial GitHub prototype.

Focus:

- localization/i18n
- visual polish
- audio/music direction
- accessibility improvements
- performance
- better onboarding
- mobile/responsive layout
- deployment polish
- optional app packaging exploration (post-demo only; does not change the primary browser-playable static demo target)

Possible additions:

- German and English language files
- improved pixel-art assets
- sound effects
- ambient café audio
- visual transitions
- export/import save
- better README and release notes
- demo page or hosted build

Success criteria:

- the game is understandable and attractive to new players
- the repository remains clean
- the build can be shared easily
- future localization is realistic

## Long-Term Design North Star

Café Apokalypso should remain a cozy, absurd management game, not a pure idle spreadsheet and not a chaotic joke generator.

The long-term arc is:

1. normal café
2. strange regulars
3. KASSANDRA and business anomalies
4. apocalyptic bureaucracy
5. mythological customers
6. delegation and expansion
7. upper-floor inn services and absurd recovery requests
8. macro-management of increasingly impossible café operations

Every major feature should support at least one of these goals:

- make the café feel more alive
- deepen management decisions
- escalate weirdness in a controlled way
- strengthen KASSANDRA as an identity feature
- preserve cozy readability
- make the player want to continue for one more in-game day
