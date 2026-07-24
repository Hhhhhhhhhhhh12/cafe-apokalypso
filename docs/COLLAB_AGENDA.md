# Besprechungs-Agenda — Zusammenarbeit Heineken + Scharon

Diese Datei ist die **Entscheidungs-Agenda** für das Kick-off-Gespräch: alles, was
zwei Menschen miteinander klären müssen und was keine Doku beantworten kann.

Das **technische Onboarding** (Setup, Render-Architektur, Sprite-Pipeline,
Effizienz-Regeln) steht bereits in [`COLLAB_ONBOARDING.md`](COLLAB_ONBOARDING.md)
— hier nicht wiederholt. Prozessregeln stehen in [`WORKFLOW.md`](WORKFLOW.md).

Stand: 2026-07-24. Nach dem Gespräch: getroffene Entscheidungen nach
[`DECISIONS.md`](DECISIONS.md) überführen, diese Datei aufräumen oder löschen.

---

## 1. Rollen und Entscheidungshoheit

Der wichtigste Punkt — alles andere hängt davon ab.

`WORKFLOW.md` beschreibt ein „Human Decision Gate": bei Konflikten oder
Scope-Fragen **entscheidet „the user"**. Das war bisher eindeutig, weil es nur
eine Person gab. Mit zwei Menschen ist der Begriff mehrdeutig und muss aufgelöst
werden.

Zu klären:

- Ist Scharon **Umsetzer** (baut abgestimmte Issues), **Co-Designer**
  (entscheidet inhaltlich mit) oder **gleichberechtigter Miteigentümer**?
- Wer hat das letzte Wort bei Story-Canon, Ton und Scope? Bei Uneinigkeit —
  Veto, Münzwurf, Ressort-Trennung?
- Darf Scharon `PROJECT_CANON.md`, `GAME_DESIGN.md`, `DECISIONS.md` direkt
  ändern, oder nur per PR vorschlagen?

**Empfehlung:** Canon-Hoheit bleibt bei einer Person (Heineken), weil das Spiel
eine sehr spezifische Stimme hat und geteilte Autorschaft an Ton am schnellsten
verwässert. Handwerkliche Entscheidungen (Architektur, Tests, Pipeline) trifft,
wer das Ressort hat.

## 2. Arbeitsteilung und Reviergrenzen

Zu klären:

- Was kann und will Scharon: Code, Art, Story, Balancing?
- Aufteilung nach **Domäne** statt nach Tickets, damit ihr euch nicht in denselben
  Dateien trefft.

Die realen Konflikt-Hotspots dieser Codebase:

| Bereich | Dateien | Risiko |
| --- | --- | --- |
| Diorama/UI | `src/ui/cafe/scene.ts`, `CafeScene.tsx`, `src/styles/global.css` | hoch — fast jede visuelle Änderung fasst sie an |
| Engine/Gameplay | `src/game/engine/`, `src/game/data/days.ts` | mittel |
| Art/Sprites | `assets/sprites/**` | niedrig — additive PNGs |

- **Single-Owner-Regeln:** Save-Migrationen sind laut `COLLAB_ONBOARDING.md` §3
  bereits Single-Owner. Gilt dasselbe für `scene.ts` und `global.css`?
- Wer pflegt `CLAUDE.md` / `AGENTS.md` (müssen synchron bleiben)?

## 3. Agent-Setup bei Scharon

Das Projekt ist stark agent-getrieben — das muss auf beiden Seiten gleich laufen.

- Nutzt Scharon Claude Code, Codex, beides, oder gar keinen Agent?
- `WORKFLOW.md` sagt: **„Do not add a third coding AI agent during early MVP
  development."** Gilt die Regel projektweit oder pro Person? Wenn Scharon einen
  vierten Agent mitbringt, muss die Regel angepasst oder bestätigt werden.
- **Pixellab-Token:** eigener Account oder geteilter? Wer trägt die Credit-Kosten?
  Token nie ins Repo — direkt untereinander austauschen.
- Branch-Namen: Agent-Branches heißen bisher `claude/…`. Bei zwei Menschen mit
  Agents kollidieren die Namensräume. Vorschlag: Kürzel voranstellen
  (`hh/claude/...`, `sch/claude/...`).

## 4. PR- und Review-Kultur

Der Branch-Schutz für `main` ist seit heute aktiv: **PR ist Pflicht, „Docs health"
und „App CI" müssen grün sein, 0 Approvals erforderlich.** Ihr könnt also beide
eigene PRs selbst mergen, sobald die CI grün ist — niemand blockiert den anderen.

Zu klären:

- Wollt ihr **gegenseitiges Review verpflichtend** machen (1 Approval)?
  Trade-off: mehr Qualität und geteiltes Wissen, aber jeder PR hängt an der
  Verfügbarkeit des anderen.
- Falls nicht verpflichtend: **wofür trotzdem immer Review**? Vorschlag —
  Canon-/Doc-Änderungen und Save-Migrationen ja, reine Sprite-Assets nein.
- Erwartete Reaktionszeit auf Review-Anfragen (damit „ich warte auf dich" nicht
  zum stillen Blocker wird).
- `enforce_admins` ist **aus**: Heineken kann als Owner weiterhin direkt auf `main`
  pushen, Scharon nicht. Bewusste Notfall-Luke oder symmetrisch machen?

**Empfehlung:** erst mal bei 0 Approvals bleiben und nach zwei Wochen prüfen. Zu
zweit ist eine Approval-Pflicht schnell der Grund, warum Arbeit liegen bleibt.

## 5. Doppelarbeit vermeiden

In diesem Repo ist das bereits **real passiert**: PR #145 war eine unabhängige
Zweitimplementierung von #142 und musste geschlossen werden.

- Verbindlich vereinbaren: Issue **selbst assignen + Kommentar**, bevor man
  anfängt (Ablauf steht in `COLLAB_ONBOARDING.md` §3).
- Wer legt Issues an, wer priorisiert?
- Nutzt ihr den Milestone **„Handoff / Codex + Scharon"** (4 offene Issues) als
  gemeinsame Startliste?

## 6. Kommunikation und Takt

- Wo läuft die Abstimmung? GitHub-Issues allein reichen für kreative Fragen
  erfahrungsgemäß nicht.
- Verfügbarkeit: Wie viel Zeit pro Woche bringt jeder ein? Zeitzonen?
- Fester Sync-Termin oder rein asynchron?

## 7. Rechtliches, Credits, Portfolio

**Aktueller Zustand: Das Repo ist öffentlich, hat aber keine `LICENSE`-Datei und
kein `license`-Feld in `package.json`.** Ohne Lizenz behält jeder Autor
automatisch alle Rechte an seinen eigenen Beiträgen — das ist bei einem
gemeinsamen Portfolio-Stück genau die Situation, die man später bereut.

Zu klären:

- Lizenz festlegen (oder bewusst „all rights reserved" mit interner Absprache)?
- Wem gehört das Ergebnis, wenn einer aussteigt? Darf der andere weitermachen?
- **Credits:** Wie wird Scharon genannt? Beide wollen das Projekt vermutlich als
  Portfolio zeigen — vorher klären, wer was wie darstellen darf.
- Pixellab-generierte Assets: Nutzungsbedingungen prüfen, falls das Spiel je
  kommerziell oder als Bewerbungsstück nach außen geht.

## 8. Gemeinsames Ziel

- `README.md` nennt als Ziel einen **portfolio-reifen 7-Tage-Vertical-Slice**.
  Ist das auch Scharons Ziel — oder erwartet er ein veröffentlichtes Spiel?
- Gibt es eine Deadline?
- Woran erkennt ihr, dass der Slice „fertig" ist?

## 9. Vor dem Start erledigen

- [ ] **Scharon nimmt die GitHub-Einladung an** (`eddijanus-lgtm`, Schreibrechte,
      seit 2026-07-24 offen) — bis dahin kann er nichts pushen.
- [ ] **Diversitäts-Regel explizit briefen:** immer auf echte Diversität der
      Figuren achten (Hauttöne, Körperformen, Hintergründe). Kritische
      Projektregel, steht in `CLAUDE.md` ganz oben.
- [ ] **Repo-Hygiene (Issue #171):** 37 Remote-Branches und 11 lokale Stashes
      auflösen, bevor Scharon einsteigt — sonst erbt er den Zustand ungefiltert.
- [ ] **Issue #163:** Branch `feat/session-2026-07-10` liegt noch auf der alten
      Render-Architektur (`CafePlaceholder.tsx`) und muss portiert werden.
- [ ] Optional: Node-Version festnageln (`.nvmrc` oder `engines` in
      `package.json`). CI nutzt Node 22, lokal läuft Node 24.
