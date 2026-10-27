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
- Main view: pixel-art 3/4 café diorama. `src/ui/cafe/CafeScene.tsx` and
  `src/ui/cafe/scene.ts` own scene composition/position data, not the removed
  `CafePlaceholder.tsx`.
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
