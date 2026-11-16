# Codex Handoff

Migration decision: 2026-10-12. Last documentation reconciliation: 2026-10-27,
against `main` at `274133bd4bae61e4936f1cd10236181aafeb0a4b`.
This is a dated context summary, not a live issue tracker or a new test report.

## Migration decision and scope

The project owner chose **Codex as the primary workspace** for project
coordination, planning, documentation, reviews, and implementation. GitHub
Markdown and code are the durable shared context. Claude Code and other tools
may support focused tasks; the older mandatory role split is historical.

This handoff is a summary, **not a verbatim export of every chat**. The earlier
`codex-import-2026-10-12/` archive is not present on the checked `main` snapshot.
The operational handoff and a complete historical archive are separate things:
this documentation cleanup does not import the ZIP or certify archive completeness.
Do not overwrite current repository files with historical upload copies.

## Read order and authority

1. [AGENTS.md](../AGENTS.md) for execution rules and code/navigation pointers.
2. [PROJECT_CANON.md](PROJECT_CANON.md) for game identity and scope.
3. [DECISIONS.md](DECISIONS.md) for explicitly approved decisions.
4. Relevant code/tests for actual implemented behavior.
5. [QUALITY_CHECKLIST.md](QUALITY_CHECKLIST.md) and
   [ART_STYLEGUIDE.md](ART_STYLEGUIDE.md) for implementation gates.
6. [ROADMAP.md](ROADMAP.md) and task-specific documents for future work.

When documents disagree, **report the contradiction** rather than silently
changing canon. Code is evidence of current implementation, not automatic
authorization to redefine narrative canon. Read only the files needed for the
current task, not the whole documentation archive.

## Implemented baseline — verify before acting

- React + Vite + TypeScript, static browser demo, local save, no
  backend/accounts/real AI API.
- Week-one Day 1–7 core loop exists: day_start/open/day_end, action budget,
  queue, preferences, patience/walkouts, memory, resources, day-end
  ratings/overhead and décor upgrades. **Do not reinvent this loop.**
- Published demo: https://hhhhhhhhhhhh12.github.io/cafe-apokalypso/
- Main view: `App` mounts `src/ui/cafe/CafePlaceholder.tsx` and uses
  `src/ui/cafe/cafe-scene.css` for scene interactions. `CafeScene.tsx` and
  `scene.ts` still serve the lookbook.
- Day 5 staffing is shown at the assigned station in the live diorama.
  Hiring costs are visible before opening and at Day 4 restock. Shift work
  cues read the same counters as the closing recap.
- From Day 6, the register sprite opens KASSANDRA. The terminal previews
  action and patience costs, and the printed forecast stays with the shift save.
- On Day 7 the red umbrella guest is fourth in line. From that position onward
  new guests have one fewer patience step. Closing leaves a sealed letter on
  the counter. Opening it records the achievement and keeps the letter readable
  after reload, including on saves from before the envelope was interactive.
- Paula is the owner/player character. Nele's approved first appearance is
  Day 2, not Day 1; this timing is no longer an unresolved design question.
- Use `npm run test` to establish the current test count and result. Old test
  counts and old green CI runs are not proof that the current checkout passes.

## Completed migration work

| Item | Verified outcome |
| --- | --- |
| [PR #192](https://github.com/Hhhhhhhhhhhh12/cafe-apokalypso/pull/192) | Codex-primary handoff and historical orchestration notice merged on 2026-10-13. |
| [PR #186](https://github.com/Hhhhhhhhhhhh12/cafe-apokalypso/pull/186) | Onboarding/workflow alignment merged on 2026-10-16. It is not an open overlap to resolve. |
| Nele timing | Approved on 2026-10-14 and reflected in the current project canon: first appearance on Day 2. |

Historical integration note: the migration review recorded PR #190's live-control
implementation on `main` in commit `9c60669`; the redundant PR was closed without
merging. Do not repeat that implementation from an old handoff prompt.

## Current work selection

### Approved room restored for the whole week (2026-11-16)

The user explicitly reconfirmed `outfit-selection-20261105.png` and instructed
its adoption on Days 1–7, preserving the approved figures and chair positions.
The authority is the Nov-5 six-person approval (`9d59d10` geometry/assets,
`448f8c6:docs/art/OUTFIT_SELECTION_20261105.md`), not the later v07 experiments.
`approved-cafe.css` now supplies the compact v12 room throughout the week.
`approvedSeats.ts` keeps Meda/Lukas left, Mira/Christa right, Nele/Fatou at the
front-right group (legacy ID `back`). Christa and Nele use their v04 outfits.
Runtime seating still requires actual service history and excludes queued guests.
The same fixed table is used for cleaning and recovery: Lukas's bonus now belongs
to his left table. Cleaning it after Kemal and Nele leaves the fourth action for
Lukas on Day 2. Old save data is preserved; no new save schema is introduced.
Earlier v07 visual findings below are historical and do not supersede this approval.

Verification on the working candidate based on `4e4f839`: 150 focused tests
(guest display, management, diorama, brew group, KASSANDRA, recovery and save
regressions), TypeScript and changed-file ESLint passed. Isolated 1024×768 browser:
full Day 1–7 route including goals, brew-group install, KASSANDRA, letter/reload
and empty-stock fallback passed in 90.9 s; Day-2 cleaning/recovery and reload
passed in 22.4 s with movement enabled and reduced-motion coverage. A separate
six-guest review fixture verified all six approved contact anchors within 0.02 px
and scale 1:1 in 1.2 s; it is a visual fixture, not an invented gameplay history.
Including failed checks and focused repeats, local checks took under 130 s total.
The moving queue uses centred animation and enters behind the fixed chairs.
No native build, installation or publication is included in this change.


Nele arrival correction (based on `0c5529b`): the confirmed Day-2 arrival in
PROJECT_CANON and DECISIONS is now playable as the second order. Kemal remains
first and Lukas third; Day 1, Day 3, action budgets, objectives and helper unlocks
are unchanged. Nele replaces the Day-2 commuter Paula slot and prefers espresso
(one bean, with the normal espresso price). Modern saves retain their recorded
guest identities, including earlier Day-2 Paula visits. Saves without identities
still use the existing conservative roster-prefix fallback.
Verification: 80 focused narrative, guest-display, save and week-one balance
tests, TypeScript and changed-file lint passed (1.8 seconds). An isolated
1024×768 touch-browser route from Day 1 reached Nele's Day-2 order, reloaded,
served her, then checked Lukas's recovery (23.5 seconds, no runtime errors).
The first full PR CI caught four stale Day-2 Paula assertions in the legacy
guest-transition tests. Only those identities were corrected; all six movement
cases then passed locally, including reduced motion and rapid serving.

Service preview follow-up (based on `4d48523`): missing recipes now show the
actual substitute, its income after the existing reputation penalty, and the
penalty before committing an action. A recipe with no substitute says “No sale”
and promises no income. Unavailable preferred recipes are no longer highlighted
as suggested. Existing substitution and failed-order rules remain unchanged.
Verification: 92 focused announcement, brew-group and management tests,
TypeScript and changed-file lint passed (2.0 seconds). An isolated iPad browser
compared the shown replacement price with the actual shift ledger and checked
no-sale money/customer/action changes (22.2 seconds). No runtime errors.

Recovery feedback follow-up (2026-11-16, based on `adc9147`): the counter
briefly shows the actual newly earned heart count, including combined service.
The header keeps the shift total without a reward animation or a plus sign.
Loading a save and changing days do not replay rewards. Reduced motion keeps
the badge readable without movement. Verification on this patch: 12 focused
guest/feedback tests, TypeScript and changed-file lint passed (2.4 seconds).
An isolated 1024×768 touch-browser run passed Day 1–2 service, clean-table
recovery, reload without reward replay and reduced-motion feedback (21.6
seconds). This is technical browser evidence, not native or visual acceptance.

Recovery seating follow-up (based on `b43e948`): the next recovering guest's
clean table carries a heart marker only when its bonus is actually available.
Lukas's existing seat follows his recorded successful service index, so earlier
walkouts do not assign him to the wrong table. Old saves without that record
retain the existing placement. No art assets or recovery rules changed.
Fourteen focused display/feedback tests, TypeScript and changed-file lint passed
(2.5 seconds). The isolated iPad browser verified clean/dirty-table cues and
Lukas's back-table placement after reload. Other characters still use their
existing seat anchors; full roster art consistency remains unfinished.
The two browser runs took 21.7 and 21.9 seconds. The settled frame exposes the
old Lukas sprite's baked-in laptop table; this remains an art defect, not a
successful visual acceptance. The table-free v02 pose in historical commit
`918b1a6` is approved only for the compact v12 room (see the review document in
`6764432`), explicitly not for v07. Do not silently transfer that approval.
The Day 2–3 waiting position now clears the occupied recovery table. A focused
23.2-second browser run measured an 11-pixel gap between the seated and waiting
sprite boxes at 1024×768; the order control also remained fully inside a
390-pixel viewport. Door, aisle and counter waypoints remain unchanged.

Use the live [pull requests](https://github.com/Hhhhhhhhhhhh12/cafe-apokalypso/pulls)
and [issues](https://github.com/Hhhhhhhhhhhh12/cafe-apokalypso/issues), not the
October 12 PR list or the July onboarding task list. Inspect the current branch,
existing work and acceptance criteria before taking a task. Do not merge or close
unrelated work as part of a documentation cleanup.

Prioritize **validation**, not reconstruction: onboarding and clarity, balance,
consequence visibility, UI readability, screenshot/demo flow, save resilience,
accessibility, and responsive behavior. Keep visual work consistent with existing
style and approval gates. No new mechanics or broad refactors without approval.

## Historical references and remaining boundaries

- [PILOT_ASSET_INTAKE.md](art/PILOT_ASSET_INTAKE.md) is historical pilot-era
  evidence. Its references to `CafePlaceholder.tsx`, old asset positions and
  early character descriptions are not current implementation instructions.
  A separate art-documentation cleanup may retain the extraction provenance while
  replacing outdated guidance and removing personal local paths. That file is
  not rewritten by this handoff cleanup; current art approval gates still apply.
- Older orchestration and prompt documents retain historical role splits and
  implementation examples. They are not a current task queue. Use this handoff
  for the workspace decision and current code/canon for the task context.
- Audio remains exploratory and paused. Follow
  [issue #200](https://github.com/Hhhhhhhhhhhh12/cafe-apokalypso/issues/200) and
  [PR #201](https://github.com/Hhhhhhhhhhhh12/cafe-apokalypso/pull/201) for the
  separately proposed audio reference; PR #201 was open at this reconciliation.
  Its Suno/GarageBand/DAW ideas are not an approved final pipeline or permission
  to produce or integrate audio. Recheck its live status before acting.

## Workflow and compact handoff

- Use a scoped branch/PR per change; do not commit directly to `main` for
  routine work. Keep parallel agent sessions in separate working directories.
- State purpose, allowed files, prohibited changes, acceptance checks, and
  assumptions. Keep documentation, code and art changes separate where possible.
- Report changed files, commands actually run/results, risks, and the next
  recommended step. Never infer a test result from an older document.
- End a substantial session with a short context summary: goal, branch/commit,
  confirmed decisions, completed work, checks, unresolved points and next step.
- Never auto-merge existing PRs or change game canon without explicit approval.
- Keep original chat logs, personal/local paths, raw generated asset sheets and
  secrets out of the public repository. Any future archive import requires its
  own review and must stay distinct from current instructions.
