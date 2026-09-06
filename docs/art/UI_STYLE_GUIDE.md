# Café-first UI — interaction sheet

Updated: 2026-09-06. **Direction approved by the user's request; station mapping and visual layout are proposals, not visually accepted screens.** No runtime migration or art acceptance is implied by this sheet.

## Target

The main gameplay view is the café, without persistent surrounding text rails, resource dashboard, action sidebar, story column, explanatory header or footer. Short, relevant information appears at its subject; detailed information is opened deliberately.

“Bühne” initially means a focused view of an interaction already belonging to the café: counter, storage, register/ledger or a story moment. It does not introduce a new room, free camera, navigation simulation or additional management system.

Only one interaction stage is current at a time. Opening a guest or object reveals its controls; a visible Back/Close action and Escape return to the café and restore focus to the source. If the source has disappeared, use the next sensible café control. Do not stack unrelated panels over the scene.

## Proposed information and action mapping

| Café entry point | Short information at the object | Detail stage / existing functions to retain |
|---|---|---|
| Active guest / counter | Order cue, patience and immediate serving result | Guest name, order, learned preference, product selection, price and unavailable-action reason. One selection calls `serve_product` once. |
| Table / floor | Visible dirty state and local cleaning cue | Individual `clean_table(tableId)` in the graphics checkout; preserve bulk `clean_tables` where the target renderer still uses it. Cleaning must remain reachable without bought tables. |
| Storage / shelf / pastry display | Low-stock cue | Exact stocks; existing `check_supplies` action; end-of-day purchase quantities, price, caps, affordability and continue-without-purchase action. |
| Register / KASSANDRA | Money and relevant change; message cue after unlock | Cash details, scripted messages and `consult_kassandra`; no real AI and no early exposure of hidden weirdness. |
| Menu board / entrance notice | Active offer or advertising cue | `adjust_offer`, flyer and social advertising, costs, bonuses, unlocks and daily limits. No new pricing or demand simulation. |
| Paula / staff plan | Capacity or stress warning, active helper | Exact action budget, stress, flow; helper selection, role, costs, tasks, XP and level. Do not reinterpret opening controls as paid actions. |
| Door / opening sign / calendar | Current day and open/closed state | `finish_setup`, `open_day`, `complete_day`; requirements and closure consequences visible before confirmation. |
| Machine / seat location / décor | Purchase or upgrade cue when available | Setup purchases, equipment and décor upgrades, current/next level, costs and limits. Unbought objects need a reachable placeholder entry point. |
| Guestbook / ledger | New-entry or reputation cue | Day goal, progress, unlocks, exact reputation, end-of-day result, helper recap, story/event text and currently available messages. A new persistent history system is not implied. |
| Letter / story subject | One short relevant moment | Readable story stage, Day-7 letter, honest Week-1 completion and replay; failure/closure recovery. Longer reading waits for deliberate opening or a clear story transition. |
| Always-reachable menu/book control | Recognizable control, label on focus as needed | Existing options and explicit Reset/New Game with confirmation; save-failure warning, readable regardless of active phase/stage. System warnings need not pretend to be fiction. |

## Smallest useful migration

1. **Reusable live controls (U1):** extract the existing guest/product and restocking controls from `ActionPanel` into narrow components which `ActionPanel` actually uses. Keep behavior, DOM semantics, copy and CSS classes. This is a functional preparation step, not yet an in-world screen.
2. **One playable café day (U2):** from a fresh run, buy the required machine at its location, finish setup at the door, open the guest/counter interaction, serve, clean, close the day, read the ledger and buy supplies or continue without purchase. Reuse existing selectors/actions and current approved runtime assets. Review this interaction layout before migrating the entire UI.
3. **Complete coverage (U3):** move remaining unlocks, management, narrative and system functions using the table above; only then remove the outer HUD/panels/header/footer from active gameplay. Keep intro and ending as deliberate stages, not edge copy.

U2 acceptance requires an approved interactive review; U3 requires the complete seven-day path, reload, end states and keyboard/reflow checks after approval. A screenshot or an isolated component does not establish a complete playable replacement.

## Behavioral and accessibility contracts

- Opening/closing a station uses local UI state, not a game action or a new save migration. A reload may return to the café overview but must preserve actual game progress.
- `take_order` and `prepare_drink` currently each perform complete default-product service. They are not separate order/brew/pay steps. Do not add extra paid steps while moving the UI.
- Preserve product eligibility, action-point accounting, helper bonus actions, prices, quantities, unlocks, limits and disabled reasons from existing selectors/reducer.
- Use semantic HTML buttons and readable labels; never bake text, numbers or menus into PNGs. Hotspots are independent of image filenames and use renderer-supplied anchors rather than a second coordinate system.
- Keep interactive controls outside decorative `role="img"` subtrees. Use one semantic interaction layer adjacent to artwork; do not extend the current nested-interactive-role issue.
- Essential state must not rely only on colour, tiny sprites, hover or transient effects. Provide visible focus, keyboard operation, at least 44×44px targets, readable contrast and reduced-motion behavior.
- Keep a stable screenreader status region and avoid duplicate announcements. Local feedback may be short, but the player can inspect the relevant current values afterward.
- Critical stock/action/closure warnings must be reachable before a consequential action. Exact money, stock, capacity and objectives remain available on demand.
- Every mandatory action remains reachable when its sprite is absent, not bought, obscured or off-screen. Placeholder controls are acceptable during migration; hidden controls are not.
- Settings and Reset/New Game stay available throughout play. On storage failure explain that session progress may not survive reload; do not claim a successful save/reset of browser data when it failed.
- Preserve the desktop/1024px reflow baseline and larger-text option. Moving text into the scene must not make it illegible or require scrolling a wide canvas to find essential actions.

## Graphics boundary and review

This sheet changes interaction direction, not camera, scene geometry, prop anchors or the asset approval pipeline. The existing graphics task owns those areas. The v07 runtime can support the prototype; new v12/v06 approval assets are not required and must not be mapped automatically.

No final UI artwork is approved by this document. Use existing classes for U1; U2 may use clearly named replaceable HTML/CSS placeholders pending visual review. In-world controls are not permission to recreate the old floating product grid over the room: a guest or object opens one coherent, focused interaction stage.

The separate accessibility-audit implementation remains deferred until layout stabilizes. Preserving basic accessibility in these new controls is part of their implementation, not a restart of that deferred audit.
