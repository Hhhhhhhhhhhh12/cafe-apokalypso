# Codex Handoff — 2026-10-12

## Migration decision
The project owner chose **Codex as the primary workspace** for project coordination, planning, documentation, reviews, and implementation. GitHub Markdown and code are the durable shared context; previous ChatGPT conversations are not automatically available to Codex. This handoff is a summary, not a verbatim export of every chat.

## Read order and authority
1. `AGENTS.md` for current execution rules and code/navigation pointers.
2. `docs/PROJECT_CANON.md` for game identity and scope.
3. `docs/DECISIONS.md` for explicitly approved decisions.
4. Relevant code/tests for actual implemented behavior.
5. `docs/QUALITY_CHECKLIST.md` and `docs/ART_STYLEGUIDE.md` for implementation gates.
6. `docs/ROADMAP.md` and task-specific docs for future work.

When documents disagree, **report the contradiction** rather than silently changing canon. Code is evidence of current implementation, not automatic authorization to redefine narrative canon.

## Current state (verify against main before acting)
- React + Vite + TypeScript, static browser demo, local save, no backend/accounts/real AI API.
- Week-one Day 1–7 core loop exists: day_start/open/day_end, action budget, queue, preferences, patience/walkouts, memory, resources, day-end ratings/overhead and décor upgrades. **Do not reinvent this loop.**
- Published demo: https://hhhhhhhhhhhh12.github.io/cafe-apokalypso/
- Main view: pixel-art 3/4 café diorama. `src/ui/cafe/CafeScene.tsx` and `src/ui/cafe/scene.ts` own current scene composition/position data, not old `CafePlaceholder.tsx`.
- `AGENTS.md` records a historical test count; run tests to establish the actual current count.
- PR #190 (`codex/u1-live-controls`) was listed as open by GitHub at migration review (`merged=false`). Its implementation is already on `main` in commit `9c60669` (`Extract reusable cafe interaction controls (#190)`); all five files changed by the PR have identical blob SHAs on `main` and its head branch. Treat the code and tests as integrated: do not reimplement them or attempt to merge #190. The redundant PR was closed without merging after this comparison.
- Other PRs listed as open at migration review included #186 (onboarding documentation), #180 (screenshots), #177 (sprites), #175 (v06 screenshot), and dependency PRs. Recheck before merging or starting work.

## What comes next
Prioritize **validation**, not reconstruction: onboarding and clarity, balance, consequence visibility, UI readability, screenshot/demo flow, save resilience, accessibility, and responsive behavior. Keep visual work consistent with existing style and approval gates. No new mechanics or broad refactors without approval.

## Open reconciliation items
- Nele timing (resolved 2026-10-14): her first appearance is Day 2. `PROJECT_CANON.md`, `DECISIONS.md`, and the game data are aligned.
- Older `docs/art/PILOT_ASSET_INTAKE.md` refers to removed `CafePlaceholder.tsx`; mark historical or update through a separate focused PR.
- Older agent orchestration and prompt docs contain historical role splits and old implementation tasks; do not treat them as a current task queue.
- Existing open documentation PR #186 may overlap this handoff. Resolve duplication during review.
- Soundtrack conversation remains exploratory: Suno for musical ideation and GarageBand/DAW for loop production were discussed, **not approved as a final pipeline**. No audio implementation requested yet.

## Workflow
- Inspect branch status, existing PRs, and tests before coding.
- Use a scoped branch/PR per change; do not commit directly to main for routine work.
- State purpose, allowed files, prohibited changes, acceptance checks, and assumptions.
- Report changed files, commands run/results, risks, and next recommended step.
- Never auto-merge existing PRs or change game canon without explicit approval.
- Keep original chat logs and personal/local paths out of public repo. Do not commit raw generated asset sheets or secrets.
