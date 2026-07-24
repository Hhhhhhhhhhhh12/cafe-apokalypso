# Collaboration & Handoff — Café Apokalypso

Onboarding für neue Mitarbeitende (Menschen + Agents wie Codex). Dieses Dokument
bündelt Arbeitswissen, das bisher nur in lokalen Agent-Notizen lag, damit alle vom
selben Stand ausgehen. Für die harten Geometrie-/Pipeline-Regeln siehe
`CLAUDE.md` bzw. die Spiegelung `AGENTS.md` — hier steht der Prozess-Kontext.

Stand dieses Dokuments: 2026-07-18.

## 1. Schnelleinstieg

```bash
npm install
npm run dev            # Port 5173, öffnet /cafe-apokalypso/
npx vitest run         # Testsuite, muss grün bleiben (aktuell 335 Tests)
```

- Stack: React + Vite + TypeScript. Cozy-Management-Spiel über 7 Tage, langsam
  kippende Stimmung.
- **Kritische inhaltliche Regel:** immer auf echte Diversität der Figuren achten
  (Hauttöne, Körperformen, Hintergründe).
- Story-Canon steht in `docs/PROJECT_CANON.md`, Design in `docs/GAME_DESIGN.md`,
  Scope in `docs/MVP_SCOPE.md` / `docs/DEMO_SCOPE.md`, Roadmap in `docs/ROADMAP.md`.

## 2. Render-Architektur — WICHTIG vor jeder UI-Arbeit

`main` benutzt seit PR #151 eine **datengetriebene Render-Schicht**:

- `src/ui/cafe/scene.ts` — alle Positionen als Daten in Stage-Prozent.
- `src/ui/cafe/CafeScene.tsx` — flache Sprite-Liste, rendert aus `scene.ts`.
- **`CafePlaceholder.tsx` existiert auf `main` nicht mehr** (ersatzlos abgelöst).
- Kalibrieren = Zahl in `scene.ts` ändern; ein Dev-Klick loggt die Stage-%.
- Hintergrund ist seit PR #150 ein Pixellab-Pixel-Art-Stage-PNG (kein v04-Patch mehr).

> Feature-Branches, die noch `CafePlaceholder.tsx` + Magic-Number-CSS in
> `global.css` anfassen, sind auf der **alten** Architektur. Beim Merge muss die
> Verdrahtung auf `scene.ts`/`CafeScene.tsx` portiert werden. Binär-Assets (PNGs)
> bleiben gültig und wiederverwendbar; nur der Positions-/Wiring-Code muss neu.

## 3. Branch- & Merge-Workflow

- Default-Branch: `main`. PRs dagegen.
- Vor Beginn eines Backlog-Issues immer synchronisieren, um Doppelarbeit zu vermeiden:
  1. `git fetch origin main && git log origin/main --oneline -5`
  2. `gh issue view <n> --json state`
  3. offene Remote-Branches prüfen: `git ls-remote --heads origin`
  4. Issue per Kommentar „claimen", bevor man loslegt.
- **Commit-Hygiene:** `git add <exakte Pfade>` → `git diff --cached` lesen →
  `git branch --show-current` prüfen → committen. Nie pauschales `git add` ohne
  Cached-Diff-Review.
- Assets vs. Verdrahtung getrennt committen: neue PNGs zuerst, die kleine
  Code-Verdrahtung (scene.ts/CafeScene) unmittelbar danach als eigener Mini-Commit.
- Save-Migrationen (gameState-Version) sind **Single-Owner** — nie zwei Stränge
  parallel an derselben Migration.
- **Worktree zuerst, sobald mehr als eine Session/Person aktiv ist.** Nie im
  geteilten Haupt-Verzeichnis arbeiten — dort wechselt die andere Session Branches
  unter einem weg (in dieser Codebase real passiert: mehrfach verlorene Edits, ein
  versehentlich mitcommitteter Fremd-Diff). Setup:
  `git worktree add ../cafe-apokalypso-<thema> -b <branch> origin/main`.
  Siehe auch `docs/WORKFLOW.md` → „Parallel sessions: worktree isolation".
- Warum dieser Abschnitt so streng ist: Ohne Sync-Schritt entstanden bereits
  Duplikat-PRs (#145 war eine unabhängige Zweitimplementierung von #142 und
  musste geschlossen werden). Die 4 Schritte oben kosten 30 Sekunden.

## 4. Sprite-Pipeline (Kurzfassung)

Details in `AGENTS.md` / `CLAUDE.md` und `docs/ART_PIPELINE.md`.

- Ablage: `assets/sprites/guests/` bzw. `assets/sprites/props/`,
  Schema `placeholder-<name>[-t2|-t3].png`.
- Hintergrund-Cleanup per PIL: helle Pixel (`r,g,b > 200`) mit geringer Sättigung
  → alpha 0; danach Randspalten/-zeilen auf Artefakte prüfen.
- Sprite-Sheets: `python3 tools/assemble_sprite_sheet.py out.png frame1.png …`,
  Rendern als `background-image` + `steps(N)`-Loop, hinter
  `prefers-reduced-motion: no-preference`.
- Stage-/Hintergrund-Assets: Pixellab `create_map_object` cappt bei 400 px Breite.
  Für Qualität: Canvas-Seitenverhältnis an Render-Box (Diorama ≈ 1,4 → 400×286)
  für quadratische Pixel, `high detail` + `detailed shading`, 4–6 Kandidaten
  generieren und hart aussieben (keine eingebackenen Möbel, leerer Tresen für Props).
- Pixellab: Base64-Inline-Parameter sind unzuverlässig (Transkription korrumpiert
  ab ~800 Zeichen) → vorhandene Objekte animieren oder CSS-Animation nehmen.

## 5. Story-Canon-Merker

- **Paula ist die Spielfigur / Café-Besitzerin**, kein Gast. Sie „bekam" das Café
  ohne Vergangenheit, weiß so viel wie die Spielerin, will einfach aufmachen.
- Paulas Blankheit und Neles Run-Persistenz sind **zwei getrennte Mysterien** —
  nicht zusammenführen.
- Nele kommt **später** dazu (nicht mehr Day-1-Anker).
- Offene Canon-Folgearbeit: Paula aus den Gäste-Rostern in `src/game/data/days.ts`
  + `QUEUE_ROTATION` entfernen, Ersatzfigur für den freien Pendler-Slot
  (Sprite-Pipeline + Diversitäts-Regel), `docs/PROJECT_CANON.md` aktualisieren
  (sagt noch „Nele ab Day 1").

## 6. Effizienz-Regeln (für Agents besonders)

- `src/styles/global.css` (~4000 Zeilen) nie komplett lesen → `grep -n` + gezielt.
- Positionen via `getBoundingClientRect` messen, nicht per Screenshot-Iteration.
- Max. 1 Beweis-Screenshot pro Verifikation.
- `docs/` (~5000 Zeilen) ist Referenz-Index — gezielt einzelne Dateien lesen.

## 7. Offene Baustellen

Siehe die GitHub-Issues im Milestone **„Handoff / Codex + Scharon"** sowie das
Sprite-Batch-Inventar in `assets/sprites/GENERATED_BATCH_2026-07-10.md`
(fertige und noch nicht generierte Assets).
