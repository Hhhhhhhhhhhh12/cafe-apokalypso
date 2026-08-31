# Café Apokalypso — Arbeitswissen für Claude

Cozy-Management-Spiel (React + Vite + TypeScript), 7 Tage, langsam kippende Stimmung.
KRITISCHE Regel: Immer auf gescheite Diversität der Figuren achten (Hauttöne, Körperformen, Hintergründe).

## Befehle

- Dev-Server: `preview_start` mit Name `cafe-apokalypso` (Port 5173, definiert in `.claude/launch.json`)
- Tests: `npx vitest run` (219 Tests, müssen grün bleiben)
- Für Preview-/Kalibrier-Arbeit: Skill `.claude/skills/cafe-preview/SKILL.md` lesen und befolgen

## Token-Arbeitsregeln

- `src/styles/global.css` (~2000 Zeilen) NIE komplett lesen → `grep -n` + Read mit offset/limit
- Positionen messen mit `preview_eval` + getBoundingClientRect (Diorama-relativ), NICHT per Screenshot-Iteration
- Max. 1 Beweis-Screenshot pro Verifikation
- Breite Codesuchen an den Explore-Subagent geben
- `docs/` (~5000 Zeilen) ist Referenz-Index — gezielt einzelne Dateien lesen, nie alle

## Diorama-Geometrie (nicht neu herleiten!)

**Aktueller Raum: warmes Pixel-Diorama v07** — `placeholder-cafe-master-v06-redesign.png` ist die gemeinsame Quelle für Raumhülle und Boden. `tools/build_cafe_redesign_layers.py` baut daraus sieben komplett vormontierte Tagesbilder `placeholder-cafe-stage-v07-day-{1..7}.png`. App und Kalibrator zeigen pro Tag exakt ein Hintergrund-PNG; Wand und Boden werden nie als getrennte Browser-Layer skaliert. Dadurch gibt es an ihren Alpha-Kanten keine Doppelränder oder Versätze. `.cafe-stage-base { display: block }`; nur der darin vormontierte Boden wächst. Sämtliche Möbel bleiben separate transparente Sprites.

**WICHTIG: NIEMALS `.cafe-back-wall` oder `.cafe-side-wall` sichtbar machen oder `.cafe-stage-base` auf `display:none` setzen** — das bricht das Diorama-Layout komplett. Diese sind Positionierungs-Container, nicht visuelle Layer.

- `.cafe-back-wall` = Positionierungs-Container, `display: none` (visuell durch Stage-PNG geliefert). Enthält: `.cafe-window` (display:none), `.cafe-menu-board` (display:none), `.cafe-storage` (rechts, sichtbar als Décor-Slot).
- `.cafe-side-wall` = Positionierungs-Container, `display: none` (visuell durch Stage-PNG geliefert).
- `.cafe-stage-base` = je Tag ein vollständiges v07-Raum-PNG. Feste Boden-Rückkante in Diorama-%: `[(8,61.6),(50,45.7),(92,61.6)]`. Die Schultern liegen bei x 22/78; ihre y-Position und die Mittelspitze wachsen über die sieben Tage von 72/77 % auf 93.6/98.6 %. Die sichtbare Außenkante wird im Build-Skript direkt in das jeweilige Tagesbild gezeichnet. `.cafe-floor-growth` bleibt ausgeblendet und darf nicht als zweite Bildschicht zurückkehren.
- `.cafe-floor` = ungeclippter Positionierungs-Container für Gäste und Möbel: left 5 % / right 6 % / bottom 4 % / height 65 % des Dioramas, `clip-path: none`, `background: transparent`. Umrechnung Diorama-% → Floor-%: `floorX = (dioX − 5) / 89 · 100`, `floorY = (dioY − 31) / 65 · 100`.
- `.cafe-counter` = `placeholder-cafe-counter-v07-redesign.png` (1181:769), Tag-1-sicher bei x 57 % / y 41 % / Breite 24 % im Diorama. Maschine, KASSANDRA-Kasse und Tassen sind seine Kinder und bewegen sich gekoppelt mit der Theke.
- Querformat-Möblierung: Tische liegen bei 25/54/11 %, 44/52/11 % und 34/63/9,5 % (x/y/Breite im Diorama). Alle nutzen das randlose `placeholder-cafe-table-v06-redesign.png`; Pflanze, Regal, Lampe, Uhr, Tassen, Maschine und Kasse sind eigene v06/v07-Redesign-Sprites im gleichen Pixelstil. Der Möbelkalibrator nutzt Store-Version v10, wechselt dieselben sieben vormontierten v07-Tagesbilder wie die App und zeigt alle losen Möbel.
- Einzelabnahme: `tools/scene-approval.html` zeigt links ausschließlich den freigegebenen Stand und rechts eine unveränderliche Endbild-Referenz. Der aktuelle Tag-1-Entwurf nutzt in klarer Isometrie links `placeholder-cafe-background-v12-isometric-day1-windows.png` und rechts `placeholder-cafe-target-v06-isometric-day1-windows.png`: heller kompakter Grundriss mit Eingang links, bereinigten Fenstern und vollständig gemalter Bildfläche; Maschine nur von der Personalzone hinter dem Tresen bedienbar; Uhr mit genau zwei Zeigern. Pro Abnahmerunde kommt links genau ein separates Prop hinzu. Schritt 1 zeigt ausschließlich den transparenten 1254×1254-Referenztisch `placeholder-cafe-table-round-v09-target-reference.png` zusätzlich zum unveränderten Hintergrund. Er wurde direkt aus dem mittleren Tisch des Endzustands rekonstruiert; seine Alpha-BBox hat Höhe/Breite 1,219 und enthält keine Boden- oder Schattenpixel. Er ist noch keine Runtime-Quelle. Die v12/v06-Bilder sind bis zur ausdrücklichen Abnahme keine Runtime-Quelle; die App bleibt auf v07. v10/v04 bleiben als größere isometrische Wachstumsreferenz erhalten, v09/v03 für eine spätere Draufsicht und v08/v02 für eine noch spätere erhöhte 3/4-Perspektive. `tools/prepare_cafe_target.py` entfernt bei älteren Generatorbildern nur den zusammenhängenden dunklen Hintergrund.
- Tag-/Nacht-Invariante: Innerhalb einer Raum- und Kamerastufe bleiben Geometrie, Bildmaße und Prop-Anker pixelgenau identisch. Tageslicht, Dämmerung und Nacht entstehen nur durch reproduzierbare Farb-/Lichtlayer; Möbel werden nicht eingebacken.
- Décor-Tier-Klassen (`cafe-decor--tier-N`) existieren im DOM und sind per CSS sichtbar (Sprites aktiv seit feat/pixel-props-pixellab).
- Serve-Menü (Produktliste) ist aus dem Diorama heraus in die ActionPanel-Sidebar verlagert (`.serve-menu`). Kein floating UI über dem Spielbereich mehr.
- Paula-Walk-Choreografie: Phasen-Maschine in CafePlaceholder.tsx (`at-door` → `walking` → `idle`), Tür-Startposition ist relativ zu `.cafe-queue` (left −118 % / bottom 130 %).

## Sprite-Pipeline

- Ablage: `assets/sprites/guests/` und `assets/sprites/props/`, Schema `placeholder-<name>[-t2|-t3].png`
- Hintergrund/Artefakt-Entfernung per PIL (bewährt): helle Pixel (`r,g,b > 200`) mit Sättigung `(max−min)/max < 0.25` → alpha 0. Bei Teilbereichen (z. B. Standscheibe unter Füßen) Maske auf Zeilenbereich begrenzen.
- Nach Generierung immer Randspalten/-zeilen auf Artefakte prüfen (`alpha > 40`-Zählung je Randspalte).
- Sitzende Gäste-Sprites rendern im v07-Raum 76 px hoch, stehende Gäste und Paula 108 px; `image-rendering: pixelated` bleibt für Figuren aktiv.

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
- Aktueller Abnahmetisch: `placeholder-cafe-table-round-v09-target-reference.png`, aus der Endzustand-Referenz rekonstruiert und per PIL freigestellt; Alpha-BBox `(272,203)–(981,1067)`, keine aktiven Randpixel. PixelLab-v08 bleibt nur als verworfene Zwischenstufe erhalten.
- Sprite-Sheets bauen: `python3 tools/assemble_sprite_sheet.py out.png frame1.png …` (cleant + bottom-center). Rendern als `background-image` + `steps(N)`-Loop über `background-position` in px (Frame = 108 px), hinter `prefers-reduced-motion: no-preference`; Frame 0 = Original-Sprite als statischer Fallback. Beispiele: `cafe-paula-idle`, `cafe-paula-walk` in global.css.
- Sitzende Gäste atmen per CSS (`cafe-guest-breathe`, diskreter 1px-Bob, gestaffelte negative delays) — bewusst kein Pixellab (Kosten/Identität).
- Paula-Walk-Choreografie: Phasen-Maschine in CafePlaceholder.tsx (`at-door` → `walking` → `idle`), Tür-Startposition ist relativ zu `.cafe-queue` (left −118 % / bottom 130 %).
