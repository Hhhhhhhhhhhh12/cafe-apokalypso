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

## Platzhalter

Für frühes Prototyping dürfen Platzhalter verwendet werden.

Erlaubt sind:

- einfache selbstgebaute Pixelblöcke
- eigene Skizzen
- lizenzklare CC0-/Placeholder-Assets

Platzhalter sollen später ersetzt oder stilistisch vereinheitlicht werden.

## Export-Struktur

Empfohlene Struktur:

```text
assets/
  concepts/
  sprites/
    guests/
    cafe/
    ui/
    items/
  tiles/
  backgrounds/
  exports/
