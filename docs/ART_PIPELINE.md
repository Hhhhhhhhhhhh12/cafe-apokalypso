# Art Pipeline

Café Apokalypso verwendet eine hybride Grafik-Pipeline: KI-generierte Konzeptgrafiken helfen bei Stilfindung, Moodboards und Varianten. Finale Spielgrafiken werden als konsistente Pixelassets manuell bereinigt, vereinheitlicht und exportiert.

## Grundprinzip

KI ist ein Konzept- und Beschleunigungswerkzeug, aber nicht die alleinige Quelle für finale Spielassets.

Die finale Spielgrafik soll konsistent, wiederverwendbar und technisch sauber sein:

- einheitliche Perspektive
- einheitliche Pixelgröße
- wiedererkennbare Farbpalette
- saubere Sprite-Sheets
- nachvollziehbare Asset-Struktur
- lizenzrechtlich dokumentierte Herkunft

## Stilrichtung

- Perspektive: 3/4-Diorama
- Hauptansicht: kleines volles Pixel-Café
- Keine Seitenansicht als Standard
- Seitenansicht nur für Spezialmissionen oder Event-Szenen
- Stimmung: cozy, warm, clever, absurd
- Anfang: scheinbar normales kleines Café
- Progression: zunehmende mythische, bürokratische und apokalyptische Störungen

## Explorative Moodboards und externe Arbeitsdateien

Explorative Moodboards, Google-AI-Studio-/Gemini-Tests, Prompt-Experimente und rohe Bildvarianten werden nicht direkt im Code-Repository versioniert.

Sie liegen außerhalb des Repos im lokalen/iCloud-Arbeitsbereich:

```text
/Users/Heineken/Library/Mobile Documents/com~apple~CloudDocs/Claude/Moodboards Apokalypso
```

Dieser Ordner ist ein Arbeits- und Experimentierraum, aber keine kanonische Quelle für Implementierung, Assets oder Codex-Aufgaben.

Für das Repository gilt:

- Rohbilder, Varianten, verworfene Richtungen und große generierte Bilddateien bleiben außerhalb des Repos.
- Externe Moodboards dürfen die Art Direction inspirieren, sind aber nicht automatisch verbindlich.
- Eine visuelle Entscheidung wird erst verbindlich, wenn sie als kurze, geprüfte Zusammenfassung in `docs/ART_STYLEGUIDE.md`, `docs/ART_PIPELINE.md` oder einer freigegebenen Datei unter `docs/art/` dokumentiert ist.
- Generierte Bilder werden nur committed, wenn sie ausdrücklich als freigegebene Referenz oder finales Produktionsasset bestätigt wurden.
- Codex, Claude Code und andere Coding-Tools dürfen externe Moodboard-Dateien nicht als finale Assets interpretieren.
- Für Implementierungsaufgaben sollen nur die kuratierten Repo-Dokumente als Quelle verwendet werden.

Zulässig im Repo sind kurze Entscheidungsdokumente, zum Beispiel:

- genehmigte Art-Direction-Zusammenfassungen
- finale Styleguide-Entscheidungen
- knappe Verweise auf externe Moodboard-Sammlungen
- Review-Logs zu akzeptierten oder abgelehnten visuellen Richtungen

Nicht im Repo versioniert werden sollen:

- rohe Google-AI-Studio-/Gemini-Exports
- große Bildserien
- ungeprüfte Prompt-Historien
- Variantenordner aus Experimenten
- generierte Bilder ohne explizite Freigabe


## Moodboards and external AI image tools

Gemini, Google AI Studio, Nano Banana and similar tools may be used for visual exploration, reference generation, style comparison, prompt testing and moodboard work.

Their outputs are not production assets by default.

Moodboard Markdown files may document:

- tested tools
- prompts
- reference images
- review notes
- preferred visual direction
- rejected visual directions
- next art tests

Moodboard Markdown files must not be treated as canonical implementation instructions. They become binding only when their conclusions are explicitly transferred into `docs/ART_STYLEGUIDE.md`, `docs/ART_PIPELINE.md`, or another canonical project document.

Commit discipline:

- Keep moodboard/reference commits separate from code commits.
- Keep generated-image references separate from gameplay implementation.
- Do not let Codex mix visual-reference Markdown changes with app-shell, engine, data-model, UI, test or build-system changes.
- If a visual reference affects implementation, first summarize the approved rule in the canonical docs, then implement it in a separate code commit.
- Store raw generated image batches, broad prompt histories and large visual experiments outside the code repository unless explicitly approved.

Codex and Claude Code rules:

- Claude Code may summarize moodboards and propose canonical art-rule updates.
- Codex may use approved canonical art rules for layout and placeholder implementation.
- Codex must not treat raw Gemini, Google AI Studio or Nano Banana outputs as final assets.
- Codex must not generate, import, or commit final art assets without explicit approval.

## Tool-Rollen

### KI-Tools

KI-Tools werden genutzt für:

- Moodboards
- Stilvarianten
- Key Visuals
- Figurenideen
- absurde Gäste
- Event-Szenen
- Marketinggrafiken
- UI-Stimmungsbilder

KI-Outputs werden nicht ungeprüft als finale Assets übernommen.

## Review Sheets und Freigabe

Vor der Produktion finaler Spielassets werden visuelle Review-Sheets erstellt und geprüft.

Review-Sheets dienen dazu, Stil, Tonalität, Perspektive, Lesbarkeit und Absurditätsgrad früh sichtbar zu machen. Sie sind keine finale Asset-Produktion, sondern ein Entscheidungswerkzeug.

Pflicht-Review-Sheets:

- Character Sheets für wichtige Gäste, Personal, mythologische Figuren, KI-Orakel und Behördenkontakte
- Level-/Day-Sheets für die ersten 7 MVP-Tage
- UI-Sheets für Hauptansicht, Panels, Popups und Tagesabschluss
- Asset-Sheets für wiederkehrende Café-Objekte, Icons, Props und Event-Objekte
- Weirdness-Escalation-Sheets für die visuelle Entwicklung von normal zu cozy-absurd zu apokalyptisch
- Moodboard-Sheets mit akzeptierten und abgelehnten Stilrichtungen

Ablauf:

1. Textuelles Sheet erstellen.
2. Grobe visuelle Referenz, Moodboard oder Stilvariante erzeugen.
3. Review durch den User.
4. Freigegebene Entscheidungen in den passenden Styleguide übernehmen.
5. Erst danach finale Sprites, Icons oder UI-Grafiken produzieren.

Finale Assets sollen nicht direkt aus losen Einzelprompts entstehen. Jede größere visuelle Richtung braucht vorher eine dokumentierte Freigabe.

### Pixel-Tools

Für finale Pixelassets werden bevorzugt:

- Aseprite
- Pixelorama

Diese Tools dienen für:

- Figuren
- Möbel
- Café-Objekte
- Icons
- Animationen
- Sprite-Sheets
- UI-Pixelgrafiken

### Layout-/Map-Tools

Für spätere Ausbaustufen kann Tiled verwendet werden.

Tiled ist vorgesehen für:

- Café-Layouts
- Tilemaps
- Ausbauvarianten
- Objekt-Layer
- Interaktionspunkte
- Spawnpunkte
- Event-Zonen

Für den MVP reicht zunächst ein statisches Diorama mit klickbaren Objekten.

## MVP-Assetumfang

Für die erste spielbare Smoke Demo werden nur wenige, aber charakterstarke Assets benötigt:

- ein kleines Café-Diorama
- Basis-UI
- 4–6 Gästetypen
- einfache Bestell-Icons
- Zutaten-Icons
- Reinigungsicon
- Werbe-/Flyer-Icon
- erste subtile Omen-Assets

Für den Vertical Slice darf zusätzlich ein begrenzter Pixel-Art-Pilot integriert werden. Dieser Pilot dient als Beweis, dass die visuelle Richtung technisch und spielerisch funktioniert. Er ist kein vollständiger Final-Art-Pass.

Pilotumfang:

- ein freigegebener Day-1-Café-Hintergrund oder Hintergrund-Ausschnitt
- 4–6 freigegebene normale Gast-Sprites
- ein freigegebener Barista-/Staff-Sprite
- 6–10 freigegebene Café-Props
- 1–2 freigegebene Weirdness-Overlay-Props, zum Beispiel Uhr-Anomalie, Tiny-Portal-Cup, endloser Bon, Formularstapel oder KI-Orakel-Objekt

Nicht Teil des Pilots:

- vollständige finale Grafikproduktion
- rohe AI-Studio-/Gemini-/Nano-Banana-Bildbatches im Repo
- komplette 8-Richtungs-Character-Sets
- vollständige Walk-/Idle-/Sitz-Animationen für alle Figuren
- vollständige Day-1-bis-Day-7-Art-Layer
- gebackene KI-Schrift als UI oder Spieltext

## Pilot-Asset-Regeln

Der Pixel-Art-Pilot darf erste kuratierte Assets ins Spiel bringen, muss aber jederzeit ersetzbar bleiben.

Regeln:

- Roh generierte Sheets bleiben außerhalb des Repositories.
- Nur zugeschnittene, kuratierte und ausdrücklich freigegebene Einzelassets dürfen ins Repo.
- Jedes Pilotasset braucht einen klaren Dateinamen und eine nachvollziehbare Rolle.
- Pilotassets gelten als vorläufig, sofern sie nicht später explizit als final markiert werden.
- Falls ein Pilotasset fehlt oder ausgetauscht wird, muss die App weiterhin mit Platzhaltern rendern.
- UI-Text, Zahlen, Labels, Buttons und Menüs bleiben echte HTML/CSS/React-Texte.
- Generierte Bildschrift, Gibberish-Labels oder KI-Typografie werden nicht als UI oder Spieltext übernommen.
- Kritische Information darf nicht ausschließlich über Bilddetails vermittelt werden.
- Pilotassets dürfen nicht die kanonische 3/4-Café-Hauptansicht verändern.

Empfohlene Pilotkategorien:

- `backgrounds/` für Café-Hintergrund oder Hintergrundteile
- `sprites/guests/` für normale Gäste
- `sprites/staff/` für Barista/Personal
- `sprites/props/` für Café-Objekte
- `sprites/overlays/` für Weirdness- und Omen-Elemente

Vor der Integration:

1. Externes Moodboard oder Casting-Sheet prüfen.
2. Kandidaten auswählen und ablehnen/überarbeiten markieren.
3. Einzelassets zuschneiden oder neu exportieren.
4. Assetnamen und Rolle dokumentieren.
5. Erst dann technische Integration starten.

## Platzhalter

Für frühes Prototyping dürfen Platzhalter verwendet werden.

Erlaubt sind:

- einfache selbstgebaute Pixelblöcke
- eigene Skizzen
- lizenzklare CC0-/Placeholder-Assets

Platzhalter sollen später ersetzt oder stilistisch vereinheitlicht werden.

## Export-Struktur

```text
assets/
  concepts/
  backgrounds/
  sprites/
    guests/
    staff/
    cafe/
    props/
    overlays/
    ui/
    items/
  tiles/
  exports/
```
