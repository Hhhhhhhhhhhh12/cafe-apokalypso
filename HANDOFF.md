# Handoff — Café Apokalypso

Kurzer Einstieg für neue Mitarbeitende (Menschen wie **Scharon**) und Agenten
(**Codex**, **Claude Code**). Dokumentation abgeglichen am 2026-10-27.

**Aktuelle Übergabe:** [`docs/CODEX_HANDOFF.md`](docs/CODEX_HANDOFF.md) enthält
Lesereihenfolge, abgeschlossene Migrationsschritte, offene Grenzen und Arbeitsweise.
Codex ist der primäre Arbeitsbereich; dieses Dokument ist der kurze technische
Einstieg und keine zweite Aufgabenliste.

## Was ist das?

Cozy-absurdes Café-Management-Spiel als statische Browser-App (React + Vite +
TypeScript, kein Backend, lokaler Save). Ziel ist ein portfoliofähiger
7-Tage-Vertical-Slice. Der Day-1–7-Core-Loop existiert bereits und soll validiert,
nicht neu gebaut werden. Vollständige Vision: [`README.md`](README.md) und
[`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md).

**Wie es aussieht:** [`docs/screenshots/`](docs/screenshots/) — volle Spiel-UI
und das Diorama über die Woche (Tag 1 / 4 / 7), ohne selbst starten zu müssen.
Die Bilder sind Referenzaufnahmen, kein Nachweis für den aktuellen Build.

## Lokaler Einstieg und Prüfungen

```bash
npm ci
npm run dev          # Vite auf http://localhost:5173/cafe-apokalypso/
```

Prüfungen in einem zweiten Terminal:

```bash
npm run test         # Vollständige Suite; aktuelle Testzahl aus diesem Lauf
npm run typecheck
npm run build
npm run lint
```

Ergebnisse und Warnungen mit dem geprüften Commit dokumentieren. Hier wird kein
aktueller grüner Test- oder Build-Status behauptet.

## Wo liegt was?

| Bereich | Ort |
| --- | --- |
| Aktuelle Projektübergabe | [`docs/CODEX_HANDOFF.md`](docs/CODEX_HANDOFF.md) |
| Agent-Arbeitswissen | [`AGENTS.md`](AGENTS.md) (Codex), [`CLAUDE.md`](CLAUDE.md) (Claude); gemeinsames Projektwissen, teils werkzeugspezifische Befehle |
| Spiel-Engine (rein, testbar) | `src/game/engine/` (Reducer, Selektoren, Save) |
| Typen & Content-Daten | `src/game/types/`, `src/game/data/` |
| Café-Darstellung | `src/ui/cafe/CafeScene.tsx` (Render) + `src/ui/cafe/scene.ts` (Positionen als Daten) |
| Styles | `src/styles/global.css`; gezielt relevante Abschnitte lesen |
| Design-/Canon-Docs | `docs/` und `docs/art/`; Einstieg über `PROJECT_CANON.md`, `DECISIONS.md`, `ROADMAP.md` |
| Assets | `assets/backgrounds/`, `assets/sprites/{guests,props}/` |

## Architektur-Kernprinzip (nicht neu herleiten)

**Positionen sind Daten, kein Magic-Number-CSS.** Alle Szenen-Anker liegen in
`src/ui/cafe/scene.ts` in EINEM Koordinatensystem („Stage-%"). Kalibrieren =
Zahl dort ändern; im Dev-Modus loggt ein Klick in die Szene die Koordinate.
CSS macht das Aussehen (Sprite-Größen, Tier-Varianten, Animationen).
Details: Abschnitt „Diorama-Geometrie" in `AGENTS.md`/`CLAUDE.md`.

## Nächste Aufgabe auswählen

Aktuelle Arbeit steht in den
[GitHub-Issues](https://github.com/Hhhhhhhhhhhh12/cafe-apokalypso/issues) und
[Pull Requests](https://github.com/Hhhhhhhhhhhh12/cafe-apokalypso/pulls).
Vor einem neuen Auftrag Status, Überschneidungen und Abnahmekriterien prüfen.

Die frühere Liste #169/#170/#171 stammt aus der Übergabe vom 2026-07-18 und ist
keine aktuelle Priorisierung. Auch alte Angaben zu Kalibrierung und grünen Tests
müssen am aktuellen Code beziehungsweise Prüflauf verifiziert werden.

Längerfristige Richtung: [`docs/ROADMAP.md`](docs/ROADMAP.md) und
[`docs/MVP_SCOPE.md`](docs/MVP_SCOPE.md). Verbindliche Spielentscheidungen stehen
in [`docs/PROJECT_CANON.md`](docs/PROJECT_CANON.md) und
[`docs/DECISIONS.md`](docs/DECISIONS.md).

## Arbeitsweise / Konventionen

- Branch pro Aufgabe, PR gegen `main`, vollständige Prüfungen vor Freigabe.
  Prozess: [`docs/WORKFLOW.md`](docs/WORKFLOW.md), aktuelle Rollen und
  Übergabe: [`docs/CODEX_HANDOFF.md`](docs/CODEX_HANDOFF.md).
- **Nicht mehrere Agenten-Sessions parallel im selben Working Directory** an
  denselben Dateien (v. a. `scene.ts` / `CafeScene.tsx` / `global.css`).
  Getrennte Arbeitskopien verwenden; keine fremden Änderungen überschreiben.
- Figuren-Diversität ist eine harte Projektregel (Hauttöne, Körperformen).
- Historische ZIPs oder Chatnotizen nicht ungeprüft über bestehende Dateien
  kopieren. Der Stand der Archivübernahme ist im Codex-Handoff abgegrenzt.
