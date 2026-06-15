# Café Apokalypso — Arbeitswissen für Claude

Cozy-Management-Spiel (React + Vite + TypeScript), 7 Tage, langsam kippende Stimmung.
KRITISCHE Regel: Immer auf gescheite Diversität der Figuren achten (Hauttöne, Körperformen, Hintergründe).

## Befehle

- Dev-Server: `preview_start` mit Name `cafe-apokalypso` (Port 5173, definiert in `.claude/launch.json`)
- Tests: `npx vitest run` (107 Tests, müssen grün bleiben)
- Für Preview-/Kalibrier-Arbeit: Skill `.claude/skills/cafe-preview/SKILL.md` lesen und befolgen

## Token-Arbeitsregeln

- `src/styles/global.css` (~2000 Zeilen) NIE komplett lesen → `grep -n` + Read mit offset/limit
- Positionen messen mit `preview_eval` + getBoundingClientRect (Diorama-relativ), NICHT per Screenshot-Iteration
- Max. 1 Beweis-Screenshot pro Verifikation
- Breite Codesuchen an den Explore-Subagent geben
- `docs/` (~5000 Zeilen) ist Referenz-Index — gezielt einzelne Dateien lesen, nie alle

## Diorama-Geometrie (nicht neu herleiten!)

- Stage Base: `assets/backgrounds/placeholder-cafe-stage-base-v03.png`, gerendert mit `object-fit: fill` über das ganze Diorama (`.cafe-diorama`, ~987×619). Das PNG hat **transparente Ecken** außerhalb des Raums — alles, was dahinter liegt, scheint dort durch.
- CSS-Fallback-Wände (`.cafe-back-wall`, `.cafe-side-wall` inkl. Fenster/Tür/Menütafel/Regal) sind `display: none` — das gemalte Bild liefert den Raum. Nicht reaktivieren.
- `.cafe-floor` = Positionierungs-Container für Gäste: left 5 % / right 6 % / bottom 4 % / height 65 % des Dioramas. Umrechnung Diorama-% → Floor-%: `floorX = (dioX − 5) / 89 · 100`, `floorY = (dioY − 31) / 65 · 100`.
- `.cafe-counter` overlayt die **gemalte L-Theke** (Diorama x 58–97 %, y 66–88 %; in Floor-Koordinaten left 59.6 % / top 53.8 % / w 43.8 % / h 33.8 %). Kaffeemaschine + KASSANDRA-Kasse sind seine Kinder und stehen auf der Arbeitsplatte. Rahmen/Hintergrund transparent lassen.
- Décor-Props `.cafe-decor-clock/-lamp/-cups/-shelf` sind Kinder von `.cafe-world` (zoomen mit 1.35× mit), Prozent = `.cafe-world`-Box. **ACHTUNG:** CSS-Werte sind Inverse-Transform der visuellen Ankerpunkte (Transform-Origin center 58%). Gemalte Ankerpunkte (visuell) → CSS-Werte: Uhr rechte Wand über Regal (vis 78 %/24 %) → CSS `left 67.7 % / top 28.4 %`; Lampe Deckenpendel links (vis 35 %/17 %) → CSS `left 35.9 % / top 22.4 %`; Tassen oberes Wandregal rechts (vis 80 %/39 %) → CSS `left 70.0 % / top 40.9 %`; Regal-Items unteres Wandregal rechts (vis 80 %/50 %) → CSS `left 67.0 % / top 47.6 %`; Pflanze linke Ecke (vis 9 %/72 %) → CSS `left 15.2 % / top 62.4 %`. Neue Ankerpunkte berechnen: `css = (vis_px - ox)/S + ox`, ox=W/2=436.5, oy=0.58*H=362.5, S=1.35, W=873, H=625. Alle vier Slots haben echte Tier-1/2/3-Sprites.
- Tier-Wechsel (1–3) via Klasse `cafe-decor--tier-N`; Sprite-Austausch über `background-image`-Override in tier-spezifischen Regeln; tier-1 hat explizite Opacity-Overrides (0.90–0.95) gegen die generische 0.5-Dimmung.

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
