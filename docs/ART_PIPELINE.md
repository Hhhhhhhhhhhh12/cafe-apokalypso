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
