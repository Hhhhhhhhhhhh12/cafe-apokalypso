# Café Apokalypso — Arbeitswissen für Claude

Cozy-Management-Spiel (React + Vite + TypeScript), 7 Tage, langsam kippende Stimmung.
KRITISCHE Regel: Immer auf gescheite Diversität der Figuren achten (Hauttöne, Körperformen, Hintergründe).

## Befehle

- Dev-Server: `preview_start` mit Name `cafe-apokalypso` (Port 5173, definiert in `.claude/launch.json`)
- Tests: `npx vitest run` (322 Tests, müssen grün bleiben)
- Für Preview-/Kalibrier-Arbeit: Skill `.claude/skills/cafe-preview/SKILL.md` lesen und befolgen

## Token-Arbeitsregeln

- `src/styles/global.css` (~2000 Zeilen) NIE komplett lesen → `grep -n` + Read mit offset/limit
- Positionen messen mit `preview_eval` + getBoundingClientRect (Diorama-relativ), NICHT per Screenshot-Iteration
- Max. 1 Beweis-Screenshot pro Verifikation
- Breite Codesuchen an den Explore-Subagent geben
- `docs/` (~5000 Zeilen) ist Referenz-Index — gezielt einzelne Dateien lesen, nie alle

## Diorama-Geometrie (nicht neu herleiten!)

**Aktueller Raum: Stage-PNG-Diorama** — Hintergrund ist `assets/backgrounds/placeholder-cafe-stage-base-v05-pixellab.png`: echte Pixel-Art aus Pixellab (`create_map_object`, 400×316 roh, 2× nearest-neighbour auf 800×632, Flood-Fill-Freistellung von den Rändern; ersetzt seit PR #150 das gemalte/gepatchte v04). `.cafe-stage-base { display: block; image-rendering: pixelated }`. Décor-Sprites (clock/lamp/cups/shelf/plant) sind aktiv als CSS-Overlays. Clock/Lamp sind center-verankert (`left` + `translateX(-50%)`); Lamp steht per `bottom: 37%` auf der Boden-Linie. Décor-Positionen sind auf v05 verifiziert; die alten v04-Messwerte (Fensterglas 24,7–33,6 % und 65,4–74,4 % Bildbreite, Wand/Boden-Linie ≈ 63 % Höhe) sind nur noch Richtwerte — bei Neu-Kalibrierung am v05-PNG messen.

**WICHTIG: NIEMALS `.cafe-back-wall` oder `.cafe-side-wall` sichtbar machen oder `.cafe-stage-base` auf `display:none` setzen** — das bricht das Diorama-Layout komplett. Diese sind Positionierungs-Container, nicht visuelle Layer.

- `.cafe-back-wall` = Positionierungs-Container, `display: none` (visuell durch Stage-PNG geliefert). Enthält: `.cafe-window` (display:none), `.cafe-menu-board` (display:none), `.cafe-storage` (rechts, sichtbar als Décor-Slot).
- `.cafe-side-wall` = Positionierungs-Container, `display: none` (visuell durch Stage-PNG geliefert).
- `.cafe-floor` = Positionierungs-Container für Gäste: left 5 % / right 6 % / bottom 4 % / height 65 % des Dioramas, `clip-path: polygon(9% 1%, 100% 15%, 88% 100%, 0 84%)`, `background: transparent`. Umrechnung Diorama-% → Floor-%: `floorX = (dioX − 5) / 89 · 100`, `floorY = (dioY − 31) / 65 · 100`.
- `.cafe-counter` = Positionierungs-Container, `background: transparent` (visuell durch Stage-PNG geliefert). Kaffeemaschine + KASSANDRA-Kasse sind seine Kinder (Sprites).
- Décor-Tier-Klassen (`cafe-decor--tier-N`) existieren im DOM und sind per CSS sichtbar (Sprites aktiv seit feat/pixel-props-pixellab).
- Serve-Menü (Produktliste) ist aus dem Diorama heraus in die ActionPanel-Sidebar verlagert (`.serve-menu`). Kein floating UI über dem Spielbereich mehr.
- Paula-Walk-Choreografie: Phasen-Maschine in CafePlaceholder.tsx (`at-door` → `walking` → `idle`), Tür-Startposition ist relativ zu `.cafe-queue` (left −195 % / bottom 130 %).

## Sprite-Pipeline

- Ablage: `assets/sprites/guests/` und `assets/sprites/props/`, Schema `placeholder-<name>[-t2|-t3].png`
- Hintergrund/Artefakt-Entfernung per PIL (bewährt): helle Pixel (`r,g,b > 200`) mit Sättigung `(max−min)/max < 0.25` → alpha 0. Bei Teilbereichen (z. B. Standscheibe unter Füßen) Maske auf Zeilenbereich begrenzen.
- Nach Generierung immer Randspalten/-zeilen auf Artefakte prüfen (`alpha > 40`-Zählung je Randspalte).
- Gäste-Sprites rendern 108 px hoch (`.cafe-pilot-asset--guest`), `image-rendering: pixelated`.

## Savegame-Testing

- Key: `cafe-apokalypso.save.v4` (siehe `src/game/engine/save.ts`)
- Testzustand injizieren (preview_eval): Save lesen, Felder patchen (`day`, `dayPhase:'open'`, `decor:{clock:3,lamp:2,cups:2,plant:3,shelf:3}`, `dayManagement.customersServed`, `resources.cleanliness`), zurückschreiben, `location.reload()`. Danach mit `localStorage.removeItem(key)` aufräumen.
- Gast-Sichtbarkeit: Cem ≥1 served, Mira ≥2, Lukas ≥3, Christa Day ≥2 & ≥2 served, Bohn Day ≥3 & ≥1 served, Herr Grau (Strange) Day ≥4 & ≥3 served — Sprite `placeholder-guest-grau.png`.

## Pixellab

- MCP-Server in `.mcp.json` (HTTP, api.pixellab.ai/mcp); braucht Env-Var `PIXELLAB_API_TOKEN`.
- Tools: create_character, animate_character, create_tileset, create_isometric_tile. Doku: https://api.pixellab.ai/mcp/docs
- Generierte Assets immer durch die PIL-Pipeline (oben) und ins placeholder-Namensschema überführen.
- **Base64-Inline-Parameter sind unzuverlässig** (Transkription korrumpiert ab ~800 Zeichen, auch quantisiert). Funktioniert nur mit Glück. Stattdessen: vorhandene Objekte ohne Bilddaten animieren (`animate_object` auf object_id, v3 = 1 Gen/Richtung) oder CSS-Animation nehmen.
- Paula-Objekt: `4f722dd8-810d-488c-b398-9ef6f439d38f` (8 Richtungen, 68×68, aus exaktem Referenz-Sprite). Animationen: paula-idle (Süd, 5 Frames), paula-walk (Ost + Südost, je 7 Frames).
- Sprite-Sheets bauen: `python3 tools/assemble_sprite_sheet.py out.png frame1.png …` (cleant + bottom-center). Rendern als `background-image` + `steps(N)`-Loop über `background-position` in px (Frame = 108 px), hinter `prefers-reduced-motion: no-preference`; Frame 0 = Original-Sprite als statischer Fallback. Beispiele: `cafe-paula-idle`, `cafe-paula-walk` in global.css.
- Sitzende Gäste atmen per CSS (`cafe-guest-breathe`, diskreter 1px-Bob, gestaffelte negative delays) — bewusst kein Pixellab (Kosten/Identität).
- Paula-Walk-Choreografie: Phasen-Maschine in CafePlaceholder.tsx (`at-door` → `walking` → `idle`), Tür-Startposition ist relativ zu `.cafe-queue` (left −195 % / bottom 130 %).
