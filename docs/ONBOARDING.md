# Onboarding — Café Apokalypso

Willkommen im Projekt, Scharon (GitHub: `eddijanus-lgtm`). 👋

Diese Seite ist der schnelle Einstieg: Was das Spiel ist, wie der Code aufgebaut
ist, wie du es lokal startest und wo du weiterliest. Ziel ist, dass du in ~15
Minuten spielbereit **und** entwicklungsbereit bist.

---

## 1. Was ist Café Apokalypso?

Ein **Cozy-Management-Spiel** im Browser (React + Vite + TypeScript). Du führst
ein kleines Pixel-Café — Bestellungen, Preise, Zutaten, Putzen, Werbung. Klingt
normal. Ist es auch. **Zuerst.**

Über sieben In-Game-Tage kippt die Stimmung: aus normalen Stammgästen werden
mythologische Randfälle, aus der Kasse wird das Orakel **KASSANDRA**, aus dem
Café-Alltag wird apokalyptische Bürokratie. Der Ton bleibt dabei durchgehend
**cozy, witzig, unheimlich** — nie Horror, nie Grimdark, nie zufälliger Quatsch.
Das Spiel meint seine eigene Absurdität vollkommen ernst.

**Das Ziel des Demos:** Die Spielerin soll am Ende von Tag 7 denken:
> „Ich will wissen, was an Tag 8 passiert.“

### Die drei Design-Säulen in einem Satz
1. **Erst das Café, dann die Seltsamkeit** — man muss das Normale mögen, bevor man das Abnormale bemerkt.
2. **Zurückhaltung verstärkt** — Seltsames erscheint in ganz normalen UI-Containern, im selben trockenen Ton wie eine Kaffeebestellung.
3. **Eskalation muss verdient sein** — Tag 7 fühlt sich wie ein anderer Ort an als Tag 1, aber erst im Rückblick.

---

## 2. Der 7-Tage-Bogen (Demo-Umfang)

| Tag | Was passiert |
|-----|--------------|
| 1 | Kern-Bestellfluss, erste Kaffeemaschinen-Anomalie, Paula-Intro |
| 2 | Gäste verhalten sich unterschiedlich |
| 3 | Preise, Nachschub, Tagesangebote, optionale Aushilfe |
| 4 | Werbung, erster Auftritt von Herr Grau |
| 5 | Mehr Delegationsdruck, erste Personal-Story-Beats |
| 6 | KASSANDRA-Update (die Kasse „erwacht“) |
| 7 | Voller Café-Tag, Frau mit rotem Regenschirm, offizieller apokalyptischer Brief |

Jeder Tag soll etwas Bedeutsames freischalten oder zeigen. Der **hidden
weirdness**-Wert steigt über die Woche, wird aber erst mit dem Tag-7-Brief in der
UI sichtbar (`weirdnessVisible`).

### Wichtige Figuren (nicht verwechseln!)
- **Paula** — Spielfigur & Café-Besitzerin. Bewusst ohne Backstory: Sie weiß genau so viel wie die Spielerin. Intro in `src/ui/components/IntroSequence.tsx`.
- **Nele** — wiederkehrender Gast, **save-persistent** über Runs hinweg (war schon in früheren Wochen/Kollapsen da). KASSANDRA erfasst sie nicht — das ist Absicht.
- **Meda** — früher, mythologischer Hinweis (Medusa-Anklänge: Sonnenbrille, kein Blickkontakt). **Nicht** Nele.
- **KASSANDRA** — orakelhaftes System-UI. Im Demo **kein echtes AI-System**, sondern skriptgesteuert. Keine externe AI-API erlaubt.

> Kanonische Details zu Figuren stehen in [`docs/PROJECT_CANON.md`](PROJECT_CANON.md) — bitte vor Story-Änderungen lesen.

---

## 3. Schnellstart (lokal)

Voraussetzung: Node.js (aktuelle LTS reicht).

```bash
npm install        # Abhängigkeiten
npm run dev        # Dev-Server → http://localhost:5173
```

Die Pflicht-Checks vor jedem Commit/PR:

```bash
npm run typecheck  # tsc --noEmit  ← WICHTIG, siehe Fallstrick unten
npm run test       # vitest run — 322 Tests, müssen grün bleiben
npm run build      # Produktions-Build
```

> **Fallstrick:** `npm run test` läuft über esbuild und prüft **keine Typen**.
> Ein Lauf kann „alles grün“ zeigen, während die Typebene kaputt ist (z. B.
> nach `as const` an Daten-Arrays). **Immer auch `npm run typecheck`** laufen
> lassen, wenn du Datenformen oder Selectors anfasst.

### Savegame zum Testen
- localStorage-Key: `cafe-apokalypso.save.v4`
- Reset über den „Neues Spiel“-Button in der App oder `localStorage.removeItem('cafe-apokalypso.save.v4')`.

---

## 4. Wie der Code aufgebaut ist

Klare Trennung: **Engine (Logik) ↔ Data (Inhalt) ↔ UI (Darstellung).**

```
src/
  game/
    engine/      ← deterministische Spiellogik, hängt NICHT an React
      reducer.ts       (Kern: alle State-Übergänge)
      gameState.ts     (Initialzustand, State-Aufbau)
      selectors.ts     (abgeleitete Werte für die UI)
      management.ts     (Week-1 Management-Loop)
      save.ts          (localStorage load/save, Versionierung)
      objectives.ts
    data/        ← Spielinhalt als DATEN (hier meistens neue Gäste/Produkte/Events)
      guests.ts, products.ts, events.ts, days.ts, ads.ts,
      staff.ts, upgrades.ts, decor.ts, achievements.ts, kassandra.ts, ...
    types/       ← game.ts, content.ts (TypeScript-Typen)
  ui/
    cafe/        ← das Diorama: CafeScene.tsx + scene.ts (Positionen als Daten!)
    components/  ← IntroSequence, ActionPanel, KassandraBootScreen, ...
    panels/      ← ResourceHud, DayProgressPanel
  styles/global.css   (~4000 Zeilen — nie komplett lesen, grep + Read mit offset)
assets/
  sprites/guests|props/   ← Pixel-Sprites (Schema placeholder-<name>.png)
  backgrounds/            ← Café-Hintergrund (Stage-Base-PNG)
tests/                    ← Vitest (nur tests/**/*.test.ts wird gefunden!)
```

**Faustregel:** Einen neuen Gast, ein Produkt, ein Upgrade oder ein Event
hinzuzufügen sollte meist nur **Daten** in `src/game/data/*` ändern — nicht die
UI-Logik.

### Zwei Dinge zur Diorama-Szene
- **Positionen sind Daten**, kein Magic-Number-CSS: alle Anker liegen in [`src/ui/cafe/scene.ts`](../src/ui/cafe/scene.ts), gerendert von `CafeScene.tsx`. Kalibrieren = Zahl in `scene.ts` ändern (im Dev-Modus loggt ein Klick die Stage-%-Koordinate).
- **CSS macht nur das Aussehen** (Größen, Animationen, Filter), nicht den Ort.
- Für Preview-/Kalibrier-Arbeit gibt es das Skill `.claude/skills/cafe-preview/SKILL.md`.

---

## 5. Tech-Stack & Constraints

- **Vite + React 19 + TypeScript**, statische Browser-App
- **localStorage** als einziger Speicher — kein Backend, keine Accounts, kein Tracking
- **Kein echtes AI-API** (KASSANDRA ist skriptgesteuert)
- **Deterministische Logik** — gleicher State + gleiche Action → gleicher nächster State (macht Tests/Balancing einfach)
- **Tests:** Vitest, aktuell **322 Tests** — müssen grün bleiben
- **Barrierefreiheit:** WCAG 2.1 AA (Kontrast ≥ 4.5:1, Touch-Targets ≥ 44px, Tastaturnavigation, `prefers-reduced-motion`)
- **Diversität der Figuren** (Hauttöne, Körperformen, Hintergründe) ist eine harte Projekt-Vorgabe

---

## 6. Beitragen — der Workflow

- **GitHub ist die operative Zentrale.** Konkrete Arbeit läuft über Issues mit klaren Akzeptanzkriterien; reviewbare Änderungen über Pull Requests.
- **Markdown-Doku ist die verbindliche „Source of Truth“** für Design/Scope/Architektur — nicht der Chat. Bei Konflikten gewinnt [`docs/PROJECT_CANON.md`](PROJECT_CANON.md).
- **Änderungen mit großem Rework-Risiko** (Scope, Blickrichtung, Tech-Stack, Kern-Loops) **vorher mit dem Team abstimmen.**
- Vor dem Committen: `npm run typecheck && npm run test && npm run build` grün.
- PRs klein und reviewbar halten; Ziel, Kontext und Akzeptanzkriterien mitliefern.

### KI-Rollen (falls du mit den Tools arbeitest)
- **ChatGPT** — Konzept, Prompts, Design-Konsolidierung
- **Claude Code** — Doku, Architektur-Review, Konsistenz-Checks, Planung
- **Codex** — fokussierte Implementierung, Tests, Bugfixes, UI-Komponenten (Credits sind begrenzt, keine „bau das ganze Spiel“-Prompts)

---

## 7. ClickUp — der Projektüberblick (optional)

ClickUp ist die **menschenlesbare Überblicks-Ebene** für Roadmap, Prioritäten
und Status. Wichtig zum Einordnen:

> **ClickUp ist nicht kanonisch.** Verbindliche Design-/Tech-/Scope-Entscheidungen
> gelten erst, wenn sie in den Repo-Markdown-Dateien stehen (v. a.
> [`docs/DECISIONS.md`](DECISIONS.md)). Ein Handoff „zählt" erst, wenn er eine
> Spur in der Git-Historie hinterlässt (Branch/Commit/PR). ClickUp ist Cockpit,
> **kein Gate** — GitHub + Markdown bleiben die Source of Truth.

Wofür ClickUp genutzt wird: lesbarer Projektüberblick, Roadmap & Prioritäten,
Task-/Review-Status, Ideen-Parkplatz, Tool-Zuweisung, Pitch-/Bewerbungs-Tasks.

**Wo das Projekt liegt:** Space **Team-Space** → Ordner **Café Apokalypso**, mit
diesen Listen:

| Liste | Wofür |
|-------|-------|
| **MVP Smoke Demo** | Die spielbare 7-Tage-Slice — konkrete Umsetzungs-Tasks |
| **Game Design & Content** | Gameplay-Systeme, Gäste, Events, Story-Beats |
| **Art / Sound / Mood** | Sprites, Hintergründe, Stimmung, Art-Review |
| **Tech / Repo / Deploy** | Architektur, Build, Hosting, Repo-Aufgaben |
| **Backlog & Later** | Alles, was bewusst noch nicht dran ist |
| **Oneliner / Figurenstimmen** | Dialog-Schnipsel & Ton-Experimente je Figur |

**So arbeiten Git & ClickUp zusammen:** Ein Task in ClickUp → als GitHub-Issue mit
Akzeptanzkriterien ausformuliert → Umsetzung im PR → bei bindender Entscheidung
die passende `docs/`-Datei aktualisieren. ClickUp-Status darf man mitpflegen, aber
er ersetzt keinen dieser Schritte.

> **Zugang:** Falls du (Scharon) noch keinen ClickUp-Zugang zum *Team-Space* hast,
> frag im Team nach einer Einladung — die Repo-Arbeit selbst geht auch komplett
> ohne ClickUp, es ist reiner Überblick.

---

## 8. Wo du weiterliest (nach Bedarf, nicht alles auf einmal)

`docs/` ist ein Referenz-Index (~5000 Zeilen) — gezielt einzelne Dateien lesen.

| Wenn du … willst | lies |
|---|---|
| **Den Kanon verstehen** (zuerst!) | [`docs/PROJECT_CANON.md`](PROJECT_CANON.md) |
| Bindende Design-/Tech-Entscheidungen | [`docs/DECISIONS.md`](DECISIONS.md) |
| Gameplay-Systeme & Spielerfahrung | [`docs/GAME_DESIGN.md`](GAME_DESIGN.md) |
| Den Management-Loop von Woche 1 | [`docs/MANAGEMENT_TRADEOFF_DESIGN.md`](MANAGEMENT_TRADEOFF_DESIGN.md) |
| Umfang der ersten Slice / Demo | [`docs/MVP_SCOPE.md`](MVP_SCOPE.md), [`docs/DEMO_SCOPE.md`](DEMO_SCOPE.md) |
| Ton & Schreibstil (mit Beispielen) | [`docs/CONTENT_GUIDE.md`](CONTENT_GUIDE.md) |
| Technische Struktur & Constraints | [`docs/TECH_ARCHITECTURE.md`](TECH_ARCHITECTURE.md) |
| Art-Richtung & Asset-Pipeline | [`docs/ART_STYLEGUIDE.md`](ART_STYLEGUIDE.md), [`docs/ART_PIPELINE.md`](ART_PIPELINE.md) |
| Qualitäts-Checkliste (bindend) | [`docs/QUALITY_CHECKLIST.md`](QUALITY_CHECKLIST.md) |
| Den KI-/Handoff-Workflow | [`docs/WORKFLOW.md`](WORKFLOW.md), [`docs/AGENT_ORCHESTRATION.md`](AGENT_ORCHESTRATION.md) |
| Roadmap & Langfrist-Richtung | [`docs/ROADMAP.md`](ROADMAP.md) |

Und im Repo-Root: [`README.md`](../README.md), [`PRODUCT.md`](../PRODUCT.md),
[`DESIGN.md`](../DESIGN.md), sowie [`CLAUDE.md`](../CLAUDE.md) /
[`AGENTS.md`](../AGENTS.md) für das Arbeitswissen der KI-Agenten.

---

Viel Spaß — und wenn etwas beim Setup hakt, ist das fast immer ein fehlendes
`npm install` oder ein Node-Versionsthema. Willkommen an Bord. ☕
</content>
</invoke>
