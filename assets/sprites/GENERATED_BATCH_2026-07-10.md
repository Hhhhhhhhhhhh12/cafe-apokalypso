# Sprite-Batch Inventar (Stand 2026-07-13)

Untracked Assets im Verzeichnis, erzeugt in einer Session vom 2026-07-10
(Branch `feat/session-2026-07-10`). Alle validiert (valide RGBA-PNGs,
bottom-center, Randspalten sauber). Noch **nicht** ins Diorama verdrahtet
(kein CafePlaceholder.tsx / global.css Wiring).

## Fertig ✓

### Kellner / Staff (Autonomie-Feature #73/#132)
- `guests/placeholder-staff-jana.png` — 96×96, statisch (Süd/Front)
- `guests/placeholder-staff-nino.png` — 96×96, statisch
- `guests/placeholder-staff-nele.png` — 96×96, statisch (aus Nele-Gast abgeleitet, mit Schürze)
- `guests/placeholder-staff-jana-walk-sheet.png` — 612×68, 9 Frames (Frame ~68px), Walk Ost
- `guests/placeholder-staff-nino-walk-sheet.png` — 612×68, 9 Frames
- `guests/placeholder-staff-nele-walk-sheet.png` — 612×68, 9 Frames

### Fantasy-Haustiere (Woche-1-Ton, cozy mit leichtem Twist)
- `guests/placeholder-pet-cat.png` — 96×96 (kleine getigerte Katze; Inhalt ~14×24px)
- `guests/placeholder-pet-cat-idle-sheet.png` — 416×52, 8 Frames (Frame ~52px)
- `guests/placeholder-pet-dragon.png` — 96×96 (winziger Drache)
- `guests/placeholder-pet-dragon-sleep-sheet.png` — 336×48, ~7 Frames (Schlaf-Loop)
- `guests/placeholder-pet-fluff.png` — 96×96 (kleines Flauschwesen)

## Offen / noch NICHT erzeugt ✗
(im ursprünglichen Batch angefragt, wegen Account-Session-Limits abgebrochen)

- Kaffeemaschine Upgrade-Tiers: `props/placeholder-cafe-coffee-machine-t2.png`, `-t3.png`
- Kaffeemaschine Brüh-Animation: `props/placeholder-cafe-coffee-machine-brew-sheet.png`
- Dampf-Overlay: `props/placeholder-steam-sheet.png` (Achtung: PIL-Cleanup löscht hellen Dampf — Sonderbehandlung nötig)
- Animierte Tür: `props/placeholder-cafe-door.png` + `-sheet.png`
- Stuhl-Varianten: `props/placeholder-cafe-chair.png` + `-pulled.png` (+ optional `-wobble-sheet.png`)
- Fluff Idle-Animation-Sheet (Haustier war zuletzt in Arbeit)

## Hinweise
- Haustiere sind sehr klein gerendert — vor dem Wiring prüfen, ob sie im Diorama groß genug lesbar sind, ggf. Skalierung/Neu-Render.
- Diese Datei ist ein Cross-Session-Merker, kein finaler Report (der Original-Agent kam nicht bis zum Report).
