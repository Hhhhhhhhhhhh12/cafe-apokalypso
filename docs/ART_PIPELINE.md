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
