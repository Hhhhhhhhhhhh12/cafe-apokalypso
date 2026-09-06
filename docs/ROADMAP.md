# Roadmap

Planning review: **2026-09-06**. Immediate target: the browser-playable seven-day demo, aiming for a 15–20-minute session and a compelling Day-8 hook. See [Project Canon](PROJECT_CANON.md) and [Demo Scope](DEMO_SCOPE.md).

This roadmap distinguishes code that exists, isolated work awaiting integration, explicit visual approval, and release verification. None of those states implies the others. Future phases are retained below as direction, not implementation orders.

**UI direction added 2026-09-06:** the user wants no persistent text at the edges of the gameplay screen. Information and actions should live in the café or in focused interaction stages belonging to its objects. U1–U3 below translate that direction into incremental work; the [UI Sheet](art/UI_STYLE_GUIDE.md) records the proposed functional mapping. This is a target, not a claim that today's side panels have been removed.

## Current evidence and first-wave results

The review used source inspection, local Git history and the existing task records. This coordinating task ran no tests, simulations, builds or browser QA; no live deployment or GitHub issue status was rechecked. The follow-up below records separately executed checks from the implementation task and does not imply verification of the shared graphics checkout.

### Confirmed implementation follow-up — 2026-09-06

The user confirmed the two-lane plan. Both tasks now have real, committed results in separate clean worktrees; their earlier setup-only status is superseded. No duplicate task is needed. The app's general task list omitted them during this check, but their actual task records and Git results were recovered and inspected.

| Package / task | Delivered evidence | Verification and next gate |
|---|---|---|
| P0/P1 — Café Integration und Speichersicherheit | Task `01a076f6-34ca-7cd1-a675-0a3112d439e2`; worktree `bdca`; branch `codex/p0-p1-save-resilience`, tip `0edcdfb`. D1/D2 were reused as `9bae62f` → `d7dfdeb` → `3835bf0` → `94f40d5`, followed by the storage fix. Base `565d40e` was confirmed by fetch in that task. | The task records user-approved installation, 4 focused files / **57 passing tests** and a passing typecheck at `0edcdfb`. This is not a combined U1/graphics result. Full-suite/build/browser release evidence is not established by this coordination review. |
| U1 — Café Bedienbausteine für Gast und Lager | Task `01a076f6-15f9-7d11-a880-92d0020640d3`; worktree `e0dc`; branch `codex/u1-live-controls`, tip `58e6a82`, base `565d40e`. Both extracted controls are imported and used by `ActionPanel`; no graphics or engine changes. | Read-only review found no static blockers. Seven focused component tests were authored. **User deferred tests/typecheck with “später” in that task**; do not restart them from this roadmap confirmation. |

Both result tips are still absent from the inspected shared graphics HEAD `5af1d3b`. The tasks' changed file sets do not overlap. Preserve their commits; the next delivery gate is deliberate integration and approved verification, followed by the U2 interaction slice. The outside panels remain in the current UI.

The save task reported dependency-audit warnings (1 moderate, 3 high) during its approved installation. These are not failing focused tests, but require separate dependency triage before release; do not run an automatic dependency upgrade or modify the parallel package changes from this coordination task.

Git snapshot at the start of the review:

- Graphics checkout: `feat/cafe-pets-scene` at `f54c544`; 39 commits ahead of and 16 behind the locally stored `origin/main` (`565d40e`). The remote was not fetched for this review; refresh it before implementation/integration.
- This checkout renders v07 through `CafePlaceholder.tsx`. The stored `origin/main` uses `CafeScene.tsx` and `scene.ts`. The architecture difference must be handled explicitly during the later graphics port.
- Existing `package.json` / `package-lock.json` edits belong to parallel work. They are outside the roadmap and first-wave integration scope.

| ID / existing task | Evidence and status | Remaining work |
|---|---|---|
| D1 — Café README und Demo-Status | Original `54e566a` updates README; `36cd492` updates `index.html` metadata. Both are now reused in the isolated P0/P1 branch as `9bae62f` / `d7dfdeb`, not yet in the shared graphics checkout. | Integrate the delivered branch deliberately; refresh public claims before publishing. Screenshots/GIFs wait for approved graphics. |
| D2 — Café Day-7 Replay-Klarheit | Original `45a0543` → `88e8e1a` is now reused in P0/P1 as `3835bf0` → `94f40d5`. Original tip is preserved on `codex/day7-outro-preserved`; former `41cc` worktree remains gone. The original task recorded 4 passing focused tests on 2026-09-01; newer P0/P1 evidence is above. | Preserve the complete delivered branch during integration. Historical or isolated tests do not establish a passing combined graphics/U1 branch. |
| A1 — Café Accessibility-Audit | **Audit delivered; implementation deferred by the user on 2026-09-01**: “später. Am Spiel wird sich nch sehr viel ändern”. Read-only audit, no implementation commit. | Revisit after gameplay and layout stabilize. Preserve existing accessibility contracts meanwhile. |

Task record IDs, for retrieval without creating duplicate tasks:

- D1: `01a059e0-270f-7552-a799-19ba6ee4397b`.
- D2: `01a059e0-2713-7ab2-9187-5e26e0673911`.
- A1: `01a059e0-270e-7fa3-a91f-f592d370216d`.

The first wave is no longer waiting for task setup. The old README wording and misleading “Start the next café week” CTA in this checkout are integration gaps, not new implementation tasks. D2 already supplies the compact “7 of 7 days served” / “Replay week one” result screen; Week 2 remains unbuilt.

## Phase 0: Foundations present in code

Status: **implemented foundations; whole-demo acceptance remains open**. Do not rebuild these systems because the older roadmap listed them as additions.

| Area | Existing implementation / evidence | Limit of the evidence |
|---|---|---|
| Seven-day progression and persistence | [`gameState.ts`](../src/game/engine/gameState.ts), [`reducer.ts`](../src/game/engine/reducer.ts), [`save.ts`](../src/game/engine/save.ts); local save/load and migrations, setup/day-end flow. | Save failure handling still needs P1 below. No current full-playthrough proof. |
| Management decisions | Offer-board bonus, supplies, advertising, temporary helpers, helper autonomy/XP, upgrades and décor effects in [`management.ts`](../src/game/engine/management.ts) and the reducer. | “Pricing” currently means an offer-board bonus, not free price selection; strategic pricing and permanent staff are later systems. |
| Guest identity and feedback | Preferences/appreciation, patience/walkouts, coach hints, achievements and daily/helper recaps in [`selectors.ts`](../src/game/engine/selectors.ts), [`DayProgressPanel.tsx`](../src/ui/panels/DayProgressPanel.tsx) and `src/game/data/`. | Canon and causal-feedback gaps remain in P2/P3. |
| Narrative and replay hook | Authored [`events.ts`](../src/game/data/events.ts), [`kassandra.ts`](../src/game/data/kassandra.ts), Day-7 letter, weirdness progression and Week-2 teaser. | Teasing a system does not implement Week 2 or cross-run character persistence. |
| Test and release tooling | [`balancing.test.ts`](../tests/balancing.test.ts), [`week-one-balance.test.ts`](../tests/week-one-balance.test.ts), other regression files, CI and [`deploy.yml`](../.github/workflows/deploy.yml). | Test files and a deploy workflow are not proof of current passing checks or a released graphics branch. |
| Art tooling and runtime | [`ArtReviewBoard.tsx`](../src/artreview/ArtReviewBoard.tsx), lookbook, [`scene-approval.html`](../tools/scene-approval.html), v07 runtime backgrounds in this checkout. | The isolated new scene is an approval surface, not the runtime. Per-prop approval stays in `AGENTS.md` / `CLAUDE.md` and the active graphics task. |

## Phase 1: Current demo work

Status: **active planning and integration backlog**. Work-package status below is not permission to run tests or start every implementation at once.

### P0 — Integrate existing results

**Delivered in the isolated P0/P1 branch; shared-branch integration remains open.** Graphics-independent, one integration owner.

- D2 is secured on `codex/day7-outro-preserved`; full tip `88e8e1a1386400a1882ce95dfa9e2150de98a53b`. The implementation task fetched and confirmed `origin/main` at `565d40e` before its isolated integration.
- D1 and D2 were integrated in their original order; see the exact picked commits above. Reuse that delivered work rather than repeating the cherry-picks or copy edits. Coordinate further `App.tsx` edits with P1/U2.
- Acceptance: the selected integration branch contains the reviewed README/metadata and honest Week-1 replay copy, preserves reset/focus behavior, and records focused verification for that branch after approval. Publishing remains a later step.

### P1 — Reliable save and reset

**Implemented and focused-checked at `0edcdfb` in the isolated P0/P1 task; not yet in the shared graphics checkout.** The fix returns explicit storage-mutation results, handles write/remove failures, attempts all legacy keys and preserves in-memory reset with an honest storage warning. The original unhandled calls remain in the shared checkout until integration.

- Scope: `src/game/engine/save.ts`, relevant `App.tsx` call sites and focused save tests. Start App changes after D2 integration.
- Acceptance: a denied/full store does not stop the active session; unsuccessful persistence is communicated honestly; explicit reset still starts a fresh session even if storage removal fails. Preserve the save key, migration chain and normal reload behavior.
- Keep the storage-result contract independent of its display location. A small accessible warning can later move into U2/U3; do not add a permanent sidebar for it.
- Keep cross-run progression and export/import outside this fix. One owner handles storage and any necessary state-contract changes.

### P2 — Week-one character canon

**Analysis ready; entry-day decision required before data changes.** [`PROJECT_CANON.md`](PROJECT_CANON.md) says Nele arrives later, but `guests.ts` declares `firstDay: 1`, `days.ts` includes her on Day 1 and the visibility selector lacks a day gate. Existing tests also retain the old cast. Paula has already been replaced by Kemal in guest data; do not repeat that replacement.

- First deliverable: a short day-by-day cast/beat matrix and a proposed first day for Nele. Distinguish her recurring story identity from actual saved progress between runs; `reset_game` currently creates fresh guest memory and run fragments.
- After the entry day is settled, one content owner aligns `guests.ts`, `days.ts`, the relevant visibility selector and affected content tests. Keep Paula, Nele and Meda distinct and maintain diversity of skin tones, body types and backgrounds.
- Acceptance: roster, metadata, visible appearance and story beats agree; Nele does not appear on Day 1. Any mechanical cross-run persistence needs its own product decision and scope.
- Reconcile stale Paula/guest-count claims in `MVP_SCOPE.md`, `QUALITY_CHECKLIST.md` and `COLLAB_ONBOARDING.md` as part of that bounded content package.

### P3 — Clear consequences for management actions

**Ready for a focused specification; implementation pending.** Improve the existing loop described by the original Phase-1 goals: guest differences, daily summary, helper/advertising/offer feedback and early KASSANDRA behavior.

- Compare each action's displayed cost and promised outcome with the reducer. The current offer-board action gives later sales a 10% bonus; advertising copy mentioning more foot traffic or longer stays is not evidence of a demand/seat-time mechanic.
- Scope: relevant action/status copy in `ActionPanel.tsx`, `management.ts`, `selectors.ts`, the reducer and specific content files. Reserve exact files with P2 before writing.
- Acceptance: the player can understand a choice before acting and recognize its actual consequence afterward; status and recap match state changes. Keep text compact, real HTML and accessible through existing controls.
- No unplanned changes to the economy, no new tutorial system, no free-pricing or new advertising simulation hidden inside a copy task.
- Coordinate with U1–U3: improve reusable action text once, then show it at the relevant café station. Do not build a second, text-heavy side-panel presentation that the in-world migration immediately replaces.

### P4 — Week-one pacing

**Static analysis can run in parallel; balancing waits for a stable content/feedback baseline.** Use existing seven-day strategies and tests rather than creating another simulation framework.

- Produce one matrix: day → new decision → action/reading load → expected payoff → observed evidence gap. A 15–20-minute target requires a real player session; action counts alone do not establish session duration or enjoyment.
- After P2/P3 stabilize and QA is approved, evaluate one complete week. Adjust only the evidenced pacing issue with a small, explicit change to action budgets, unlock timing or economy.
- Acceptance: each day introduces something meaningful, consequences are understandable, weirdness escalates on time and the Day-7 hook lands. Record the played build and results; do not claim these outcomes from test-file existence.

### U1 — Reusable controls for café interactions

**Implemented at `58e6a82` in its isolated task; tests/typecheck explicitly deferred by the user.** Guest/order/product controls and supply-purchase controls now live under `src/ui/interactions/` and are actually used by that branch's `ActionPanel`. This is graphics-independent preparation, not a migrated gameplay screen. The shared checkout does not yet contain it.

- Preserve DOM semantics/order, existing classes, copy, costs, callbacks, disabled reasons and native keyboard behavior. No engine, geometry, renderer, `App.tsx`, dependency or global CSS changes.
- The current `ActionPanel.tsx` is identical on the inspected graphics checkout and stored `origin/main`; recheck that fact on the actual task baseline before editing.
- Acceptance: one implementation of each extracted control group remains in active use and can be hosted at a guest/counter or storage stage later. Author focused regressions, but run checks only after approval. This delivery is reusable live code, not the completed in-world layout.

### U2 — A complete Day-1 interaction route inside the café

**Next visible gameplay slice after U1 and the P0/P1 integration baseline.** Use the existing runtime and gameplay rules; no new graphics are required. One integrator owns `App.tsx`, the chosen renderer and narrowly scoped styles during this step.

- Fresh start → machine-location setup purchase → opening sign → guest/counter product selection → table cleaning → door closure → ledger result → storage purchase or continue without purchase.
- Guest/object selection opens one focused contextual stage; Back/Close and Escape return to the café. Keep text as real HTML, maintain focus and offer reachable entries for absent or unbought props. Opening a stage spends no game action.
- `take_order` / `prepare_drink` are currently complete default-product service aliases. Do not turn them into an extra three-step order/brew/pay mechanic.
- Acceptance: an approved user walkthrough can finish that route without relying on edge panels. Exact values and costs are inspectable, shortages and unavailable actions are understandable, and the correct table IDs survive renderer integration. Proposed station layout still needs visual review.

### U3 — Complete the café-first screen

**After the U2 interaction review, before calling the new UI complete.** Move the remaining seven-day functions according to the [UI Sheet coverage table](art/UI_STYLE_GUIDE.md): offer/advertising board, staff plan, equipment/décor, KASSANDRA, objectives/events, letter/ending, options/reset and error feedback.

- Replace persistent outside HUD, action/story columns and gameplay header/footer copy only after all their functions have accessible entry points. No silent removal of resources, conditions, story content or recovery controls.
- Short feedback stays near its cause; long text opens on its own stage. Do not simply move every old panel on top of the café image. Preserve existing story availability; a new persistent journal is a separate feature decision.
- Acceptance: the full week, fresh start, reload, day-end restocking, both closure reasons and Day-7 replay remain reachable without persistent edge text. Complete approved keyboard/reflow/visual checks on this final layout, in coordination with A1.
- U1 is immediate groundwork; U2/U3 are not permission to rewrite the screen or approve final UI artwork in advance. Freeze their release inclusion after the first interaction review; the user specified a long-term target, not a new demo deadline.

### G1 — Continue graphics approval, then port to runtime

**Active separate graphics track.** Continue the existing one-prop-at-a-time approval flow; preserve the approved composition. The live prop status belongs in `AGENTS.md` / `CLAUDE.md` and the graphics task, so this roadmap does not duplicate a moving approval checklist.

- The v12 background / v06 target remain the new isometric approval references; this checkout's runtime stays on the seven precomposed v07 backgrounds until the port is approved.
- Port only reviewed assets after the target render architecture is settled. Preserve behavior as well as positions: individual `clean_table` actions with table IDs, helper/save fixes, floor growth and pets exist on the graphics branch and must be accounted for explicitly.
- `CafePlaceholder` → `CafeScene` is not a component rename: the stored `origin/main` still exposes bulk `onCleanTables`, while the graphics checkout uses individual `onCleanTable`.
- Keep the existing pilot limits: one café background, 4–6 approved normal guest sprites, one barista/staff sprite, 6–10 café props and 1–2 weirdness overlays. Keep placeholders/fallbacks and real HTML text; raw generated image sheets are not production assets. Full final art, complete animation sets and a complete new Day-1–7 art pass are not demo prerequisites.
- Acceptance: approved assets are deliberately mapped into the chosen runtime, gameplay contracts survive, and visual/browser checks pass after approval. Camera and day/night invariants are retained below.

### A1 — Accessibility after flow/layout stabilization

**Deferred by user decision; do not launch an implementation wave now.** The existing static audit records intro modality/focus, focus on phase transitions, interactive controls inside `role="img"`, duplicate live announcements, reduced-motion scrolling and target-size/reflow concerns.

Recheck these findings on the selected integrated renderer before fixing them. Existing labels, focus and reduced-motion contracts remain requirements for intervening changes. Functional and visual accessibility acceptance belongs before the demo release under [Quality Checklist](QUALITY_CHECKLIST.md); later convenience features can stay in Phase 5. A static audit is not a completed keyboard, screenreader, contrast or zoom test.

## Subagent work and file ownership

This revision used read-only subagents for implementation evidence, Git/first-wave results, scope/parallelism and the new UI function mapping. The main agent owns this roadmap and interaction-sheet edit. Do not create more visible audit tasks; use the two bounded implementation handoffs below.

| Lane | Useful parallel subagent work | Write boundary / dependency |
|---|---|---|
| Integration / P0 | Review the two existing commit chains and their acceptance evidence independently. | One integration owner; `App.tsx` edits serialized with P1 and later A1. |
| Persistence / P1 | Review error paths and propose the storage-result contract. | Engine owner: `save.ts`, later App integration and focused tests. Save migrations/state types are single-owner. |
| Café controls / U1 | Independently review guest/product and restock control extraction. | `ActionPanel.tsx`, `src/ui/interactions/` and dedicated new tests only; serialize P3 edits to the same file. No App, renderer, engine or global CSS writes. |
| In-world integration / U2–U3 | Review functional coverage against the UI Sheet. | Starts after U1 and P0/P1; one App/renderer/style integrator coordinates with G1. Do not overlap graphics placement edits. |
| Content / P2–P4 | Draft the cast matrix and inspect action/copy evidence in parallel, read-only. | One writer per named content/selector file. Finish shared data changes before balancing against them. |
| Graphics / G1 | Continue the existing graphics task and explicit user approvals. | Graphics owner: assets, approval tools, café renderer, `global.css`, art docs and mirrored geometry/pipeline instructions. |

Independent implementation work uses separate worktrees from an agreed committed baseline. Read-only subagents may inspect the shared checkout. Hand off an ID, exact files/commits, acceptance criterion and unresolved decision; avoid repeated full-repo audits and duplicated tasks. Never let multiple writers change `App.tsx`, shared selectors, `global.css` or save migrations at once.

### Implementation handoffs and next gate

The following two tasks were dispatched and delivered from the same committed baseline `565d40e`; their actual task IDs and results are recorded above. Continue those tasks instead of launching replacements. Reconcile the shared graphics branch deliberately at integration, not by blindly merging it into either result.

1. **P0 + P1, integration and save safety:** reuse D1/D2, then implement resilient persistence/reset. Sole `App.tsx` owner. Canonical prompt: `R-CAFE-SAVE-20260906` in [Prompts](PROMPTS.md).
2. **U1, café interaction controls:** extract and wire the live guest/product and restock components. Canonical prompt: `R-CAFE-CONTROLS-20260906` in [Prompts](PROMPTS.md).

G1 continues in its existing graphics task. No duplicate README, replay or accessibility task. P2 can receive a short Nele-entry-day proposal via a read-only subagent; data changes still await that decision. P3/P4 follow on the selected UI/content baseline.

Recommended settings: `gpt-5.6-sol` / high thinking for P0/P1, medium for the mechanical U1 extraction. These are recommendations, not permission to override the user's configured task model. Reduce tokens by using these fixed file lists and handing off exact commits instead of repeating repository-wide audits.

## Demo acceptance and release sequence

1. Review and integrate P0, select the next bounded gameplay package, then freeze the intended release scope and commit set.
2. After explicit approval, run focused regressions for the changed contracts on the integration branch. Historical D2 results are evidence to reuse, not permission or proof for a different branch.
3. After gameplay and the chosen graphics/layout stabilize, revisit A1 and run approved real seven-day system QA, save/reload/replay checks, keyboard/screenreader/zoom and responsive/visual acceptance. Keep the 1024px/desktop and 44px target baseline from `QUALITY_CHECKLIST.md`.
4. Run the approved full technical checks (lint, typecheck, tests, build). Record the commit, command, outcome and any unresolved failures. Do not treat known test counts as a passing baseline.
5. Finalize scoped commits, rebuild the release artifact, add the approved screenshot/GIF and release notes, publish the reviewed build and perform an approved deployment smoke check. Verify the demo link and asset loading on that build.
6. Reprioritize Phase 1.5 only after demo acceptance. Backend, accounts, tracking, real AI APIs, full staff/economy/apocalypse systems, overnight rooms and app packaging remain outside this demo.

## Phase 1.5: Week 2 Expansion

Status: **deferred until demo acceptance and a separate expansion decision**. Existing Week-1 forecasts, strange guests and weirdness hooks are seeds, not a playable Week 2.

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

Status: **later design backlog**. Temporary helpers, basic upgrades, advertising and offer bonuses already have demo implementations; the items below describe their strategic expansion.

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
- an unlockable true top-down management view once the café has visibly grown

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

Camera progression:

- The proposed opening café in the step-by-step approval flow uses the bright, compact, left-entrance isometric Day-1 view: `placeholder-cafe-background-v12-isometric-day1-windows.png` and `placeholder-cafe-target-v06-isometric-day1-windows.png`. These are not the current runtime background.
- The previous v10/v04 isometric room remains preserved as a visibly larger café-growth reference for a later day or expansion step.
- Phase 2 can unlock the preserved true top-down view as a strategic layout and macro-management perspective: `placeholder-cafe-background-v09-topdown.png` and `placeholder-cafe-target-v03-topdown.png`.
- All new camera concepts remain outside the runtime until explicit approval; the graphics checkout stays on v07 during the approval flow. See G1 for the separate target-branch integration.
- A future day-night lighting cycle stays independent of camera and room growth: each approved room stage keeps identical geometry and prop positions, while day, dusk, and night change only color grading, window light, practical lights, and shadows.

## Phase 3: Apocalypse Systems

Status: **later design backlog**, beyond the seven-day demo and its authored hook.

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

Status: **later design backlog**. Basic décor bonuses already exist; deeper vegetation, room and collection systems below are future expansion.

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
- an elevated 3/4 presentation as a major visual growth reveal

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
- living plants with vegetation stages (time-driven wilting; cleaning "waters" them;
  loosely coupled to cleanliness with delay, not 1:1 — see GAME_DESIGN "Living plants").
  Kumquat (`special`) is exempt: never wilts, optional daily rustle.
- major recurring mythological arcs
- staged camera transition using the preserved `placeholder-cafe-background-v08-fullfloor.png` and `placeholder-cafe-target-v02-fullfloor.png` references

Success criteria:

- the player has meaningful long-term goals
- the game supports repeated sessions
- macro-management remains cozy and understandable

## Phase 5: Polish, Localization, and Packaging

Status: **later expansion/polish backlog**. Demo discovery, replay clarity and baseline accessibility are covered by P0/A1 and the release sequence above, rather than postponed wholesale to this phase.

Goal: prepare the game for wider sharing beyond the initial GitHub prototype.

Focus:

- localization/i18n
- visual polish
- audio/music direction
- accessibility enhancements beyond the demo baseline, including optional palette/display refinements; complete the deferred A1 audit follow-up before demo release, once flow/layout stabilize
- performance
- better onboarding
- mobile-optimized layout beyond the demo's responsive baseline
- deployment polish
- optional app packaging exploration (post-demo only; does not change the primary browser-playable static demo target)

Possible additions:

- German and English language files
- improved pixel-art assets
- sound effects
- ambient café audio
- visual transitions
- export/import save
- expanded README, release notes and presentation for later releases (D1 already supplies the demo text changes)
- further hosting/distribution polish (static deployment tooling already exists)

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
