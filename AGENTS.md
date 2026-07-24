# Café Apokalypso — Arbeitswissen für Codex

Cozy-Management-Spiel (React + Vite + TypeScript), 7 Tage, langsam kippende Stimmung.
KRITISCHE Regel: Immer auf gescheite Diversität der Figuren achten (Hauttöne, Körperformen, Hintergründe).

> Diese Datei spiegelt `CLAUDE.md` (gleiches Projektwissen, tool-neutral). Bei
> Widerspruch gilt der Code; danach `CLAUDE.md`/`AGENTS.md` synchron halten.

## Befehle

- Dev-Server: `npm run dev` (Vite, Port 5173). Für Preview-Setup siehe `.claude/launch.json`.
- Tests: `npx vitest run` (322 Tests, müssen grün bleiben)
- Typecheck: `npx tsc --noEmit`

## Token-Arbeitsregeln

- `src/styles/global.css` (~4000 Zeilen) NIE komplett lesen → `grep -n` + Read mit offset/limit
- Positionen messen mit getBoundingClientRect (relativ zur `.cafe-world`-Box), NICHT per Screenshot-Iteration
- `docs/` (~5000 Zeilen) ist Referenz-Index — gezielt einzelne Dateien lesen, nie alle

## Diorama-Geometrie (nicht neu herleiten!)

**Positionen sind DATEN, kein Magic-Number-CSS mehr.** Seit dem Render-Neustart liegen alle Szenen-Anker in [`src/ui/cafe/scene.ts`](src/ui/cafe/scene.ts) — EIN Koordinatensystem („Stage-%": Prozent der `.cafe-world`-Box, x von links, y von unten). Die Render-Komponente ist [`src/ui/cafe/CafeScene.tsx`](src/ui/cafe/CafeScene.tsx) (flache Sprite-Liste, Positionen inline aus `scene.ts`). `CafePlaceholder.tsx` und das alte Floor-/Queue-/Wall-Container-System sind gelöscht.

- **Kalibrieren = Zahl in `scene.ts` ändern.** Kein CSS-Positionsblock mehr suchen. Im Dev-Modus loggt ein Klick in die Szene die Stage-%-Koordinate (`[scene] left: …%, bottom: …%`) → direkt übernehmen.
- **CSS macht nur noch Aussehen**, nicht Ort: Sprite-Größen, Tier-Varianten, Personality-Animationen (breathe/fidget/lean), Filter/Opacity bleiben in `global.css` (Klassen `cafe-decor-*`, `placeholder-guest-normal-NN`, `cafe-table--tier-N`).

**Hintergrund:** `assets/backgrounds/placeholder-cafe-stage-base-v06-pixellab.png` — echte Pixel-Art aus Pixellab (`create_map_object`, 400×284 roh mit 400 px = API-Maximum, 2× nearest-neighbour auf 800×568; Seitenverhältnis auf die Render-Box abgestimmt → quadratische Art-Pixel). `.cafe-stage-base { display: block; image-rendering: pixelated }` — **nie auf `display:none` setzen**, das PNG ist die einzige Raumdarstellung. **v06-Messwerte (Stage-%):** Tür 11–24, Fensterglas 31,5–44,5 und 50–61 Breite, Wand/Boden-Linie ≈ 68 %, Tresen x 63,5–100 mit Deckfläche y 54–63. **Zoom-Crop:** `--cafe-zoom: 1.35` zeigt nur x 12,7–87,3 / y 14,6–89,4 — Props rechts von x ≈ 87 sind unsichtbar.

**Detail-Kompositions-Schicht (`.cafe-stage-detail`, z 3, Spots `STAGE_DETAIL_SPOTS` in scene.ts):** Der Raum-PNG ist bei 400 Art-px Breite gecappt (~2,9 Screen-px/Pixel). Fokale Wandelemente sind daher als eigene, kleiner rendernde Sprites überlagert (~1 Screen-px/Pixel, sichtbar feiner): zwei Bogenfenster (`placeholder-cafe-window-arched.png`) und die Tür (`placeholder-cafe-door.png`). Sie überdecken die im PNG gemalten Pendants vollständig (`background-size: 100% 100%`). **Funktioniert nur bei flachen, frontalen Wandelementen** — der perspektivische Tresen ist KEIN Kompositions-Kandidat.

- `.cafe-counter` = Rahmen für Kaffeemaschine + KASSANDRA-Kasse (deren Offsets liegen weiter in CSS-Klassen); Position via `COUNTER_FRAME` in `scene.ts`.
- `.cafe-storage` = Regal-Slot, aktuell `display:none` (Stage-PNG malt Regale); DOM-Knoten bleibt für Tier-Klassen/Tests, bis ein echtes Sprite kommt.
- Serve-Menü (Produktliste) liegt in der ActionPanel-Sidebar (`.serve-menu`), nicht im Diorama.
- Paula-Walk-Choreografie: Phasen-Maschine in `CafeScene.tsx` (`at-door` → `walking` → `idle` → `walking-to-counter` → `exiting-east`), Wegpunkte als `PAULA_PATH` in `scene.ts`.

> **Achtung Kalibrierung:** `DECOR_SPOTS` und `STAGE_DETAIL_SPOTS` sind auf v06 gemessen. `GUEST_SPOTS`, `TABLE_SPOTS` und `COUNTER_FRAME` sind noch aus der v04-Ära via `floorX/floorY` umgerechnet und auf v06 nicht verifiziert — siehe offenes Kalibrierungs-Issue.

## Sprite-Pipeline

- Ablage: `assets/sprites/guests/` und `assets/sprites/props/`, Schema `placeholder-<name>[-t2|-t3].png`
- Hintergrund/Artefakt-Entfernung per PIL (bewährt): helle Pixel (`r,g,b > 200`) mit Sättigung `(max−min)/max < 0.25` → alpha 0. Bei Teilbereichen Maske auf Zeilenbereich begrenzen.
- Nach Generierung immer Randspalten/-zeilen auf Artefakte prüfen (`alpha > 40`-Zählung je Randspalte).
- Gäste-Sprites rendern 108 px hoch (`.cafe-pilot-asset--guest`), `image-rendering: pixelated`.

## Savegame-Testing

- Key: `cafe-apokalypso.save.v4` (siehe `src/game/engine/save.ts`)
- Testzustand injizieren: Save lesen, Felder patchen (`day`, `dayPhase:'open'`, `decor:{clock:3,lamp:2,cups:2,plant:3,shelf:3}`, `dayManagement.customersServed`, `resources.cleanliness`), zurückschreiben, `location.reload()`. Danach mit `localStorage.removeItem(key)` aufräumen.
- Gast-Sichtbarkeit: Cem ≥1 served, Mira ≥2, Lukas ≥3, Christa Day ≥2 & ≥2 served, Bohn Day ≥3 & ≥1 served, Herr Grau (Strange) Day ≥4 & ≥3 served.

## Pixellab

- MCP-Server in `.mcp.json` (HTTP, api.pixellab.ai/mcp); braucht Env-Var `PIXELLAB_API_TOKEN`.
- Tools: create_character, animate_character, create_map_object, create_tileset. Doku: https://api.pixellab.ai/mcp/docs
- Generierte Assets immer durch die PIL-Pipeline (oben) und ins placeholder-Namensschema überführen.
- **Base64-Inline-Parameter sind unzuverlässig** (Transkription korrumpiert ab ~800 Zeichen). Stattdessen: vorhandene Objekte ohne Bilddaten animieren (`animate_object` auf object_id) oder CSS-Animation nehmen.
- Paula-Objekt: `4f722dd8-810d-488c-b398-9ef6f439d38f` (8 Richtungen, 68×68). Animationen: paula-idle (Süd, 5 Frames), paula-walk (Ost + Südost, je 7 Frames).
- Sprite-Sheets bauen: `python3 tools/assemble_sprite_sheet.py out.png frame1.png …` (cleant + bottom-center). Rendern als `background-image` + `steps(N)`-Loop über `background-position` in px (Frame = 108 px), hinter `prefers-reduced-motion: no-preference`; Frame 0 = statischer Fallback.
- Sitzende Gäste atmen per CSS (`cafe-guest-breathe`, 1px-Bob, gestaffelte negative delays) — bewusst kein Pixellab (Kosten/Identität).
