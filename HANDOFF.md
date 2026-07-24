# Handoff — Café Apokalypso

Kurzer Einstieg für neue Mitarbeitende (Menschen wie **Scharon**) und Agenten
(**Codex**, **Claude Code**). Stand: 2026-07-18.

## Was ist das?

Cozy-absurdes Café-Management-Spiel als statische Browser-App (React + Vite +
TypeScript, kein Backend, lokaler Save). Ziel ist ein portfoliofähiger
7-Tage-Vertical-Slice. Vollständige Vision: [`README.md`](README.md) und
[`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md).

## Erste 10 Minuten

```bash
npm install
npm run dev          # Vite auf http://localhost:5173/cafe-apokalypso/
npx vitest run       # Testsuite — muss grün bleiben
npx tsc --noEmit     # Typecheck
```

## Wo liegt was?

| Bereich | Ort |
| --- | --- |
| Agent-Onboarding | [`CLAUDE.md`](CLAUDE.md) (Claude), [`AGENTS.md`](AGENTS.md) (Codex) — inhaltsgleich |
| Spiel-Engine (rein, testbar) | `src/game/engine/` (Reducer, Selektoren, Save) |
| Typen & Content-Daten | `src/game/types/`, `src/game/data/` |
| Café-Darstellung | `src/ui/cafe/CafeScene.tsx` (Render) + `src/ui/cafe/scene.ts` (Positionen als Daten) |
| Styles | `src/styles/global.css` (~4000 Zeilen — nur Aussehen, keine Positionen mehr) |
| Design-/Canon-Docs | `docs/` und `docs/art/` (27 Dateien; `PROJECT_CANON.md`, `ROADMAP.md`, `MVP_SCOPE.md`) |
| Assets | `assets/backgrounds/`, `assets/sprites/{guests,props}/` |

## Architektur-Kernprinzip (nicht neu herleiten)

**Positionen sind Daten, kein Magic-Number-CSS.** Alle Szenen-Anker liegen in
`src/ui/cafe/scene.ts` in EINEM Koordinatensystem („Stage-%"). Kalibrieren =
Zahl dort ändern; im Dev-Modus loggt ein Klick in die Szene die Koordinate.
CSS macht nur noch Aussehen (Sprite-Größen, Tier-Varianten, Animationen).
Details: Abschnitt „Diorama-Geometrie" in `AGENTS.md`/`CLAUDE.md`.

## Aktueller Stand

- Render-Schicht neu gebaut (data-driven `CafeScene`, altes Container-System
  gelöscht). Testsuite grün.
- Hintergrund: **v06**-Pixellab-Pixel-Art + separate hochauflösende
  Fenster/Tür-Kompositions-Schicht.
- Décor- und Detail-Spots sind auf v06 kalibriert; Gäste-/Tisch-/Theken-Spots
  noch nicht (siehe Issues).

## Nächste Schritte

Offene, umrissene Arbeit steht als GitHub-Issues; für Agenten vorbereitete
Tickets tragen das Label **`codex-ready`** bzw. **`claude-ready`**. Konkret zum
Zeitpunkt der Übergabe:

1. **#169** — Gäste-/Tisch-/Theken-Spots in `scene.ts` auf die v06-Stage
   nach-kalibrieren (`codex-ready`; klar umrissen, guter Einstieg).
2. **#170** — Sprite-Qualität: Cem zu dunkel, vier Gäste-Sprites zu niedrig
   aufgelöst.
3. **#171** — Repo-Hygiene: Stashes triagieren, verwaiste Alt-Branches auflösen.

Längerfristige Richtung: [`docs/ROADMAP.md`](docs/ROADMAP.md) und
[`docs/MVP_SCOPE.md`](docs/MVP_SCOPE.md); offene Design-Entscheidungen tragen
das Label `needs-decision`.

## Arbeitsweise / Konventionen

- Branch pro Aufgabe, PR gegen `main`, Tests müssen grün sein. Prozess:
  [`docs/WORKFLOW.md`](docs/WORKFLOW.md).
- **Nicht mehrere Agenten-Sessions parallel im selben Working Directory** an
  denselben Dateien (v. a. `scene.ts` / `CafeScene.tsx` / `global.css`) —
  sie überschreiben sich gegenseitig. Ein Branch, eine Session pro Datei-Bereich.
- Figuren-Diversität ist eine harte Projektregel (Hauttöne, Körperformen).
