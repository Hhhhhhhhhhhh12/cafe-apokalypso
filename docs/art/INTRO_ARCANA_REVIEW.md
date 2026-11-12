# Mystisches Intro — Leitbild und Umsetzung

Aktueller Umsetzungskandidat: ruhigere, gegliederte Bewegungen vom 12. November 2026, siehe unten.
Die Grafikabnahme vom 27. Oktober bleibt erhalten; Bewegung und Timing sind offen.

## Abnahme am 10. Oktober 2026

Der Nutzer reagierte auf das gezeigte Bild mit **„OA GEIL“**. Dies hält die
visuelle Freigabe dieses konkreten Leitbilds und seiner Stimmung fest.

Bild: `assets/review/intro-arcana-20261010/intro-arcana-keyframe-v01.png`.
Generierung: eingebautes Imagegen-Werkzeug; Original unverändert erhalten.
Referenzen: v12-Tag-1-Raumhülle und v06-Endzustandsbild als Geometrie-/Möbelreferenz.
Die v06-Referenz wird dadurch nicht als neue Runtime-Quelle freigegeben.

## Verbindliche Richtung aus dem Nutzerauftrag

- Start im Dunkeln, Eingangstür geschlossen und von Schlingpflanzen blockiert.
- Tür zuerst freischneiden, anschließend mühsam **nach innen** aufdrücken.
- Erst der schmale Lichtstrahl aus der geöffneten Tür enthüllt das verlassene,
  überwucherte Café. Das Leitbild zeigt diesen Enthüllungsmoment, nicht den Start.
- Ranken an Boden, Wänden und Möbeln; einzelne Gruppen müssen entfernbar bleiben.
- Fenster kaputt, verrammelt, vernagelt und bewachsen.
- Ein kleines Tier verschwindet im letzten Moment durchs Fenster.
- Seltene exotische Blumen in Blau, Lila und Knallrot; sparsame magische Leuchtfarben.
- Eine kleine fleischfressende Pflanze fängt einen Zitronenfalter; weitere fliegen weg.
- Drei Glühwürmchen in ungewöhnlichen Farben.
- Kleine Bodenpfütze mit schwachem Lichtschimmer aus einem Dachloch.
- Mystischer Arcana-Dschungel mit Lost-Place-Stimmung, innerhalb des bestehenden
  Café-Raums. Kein unbegrenzt dichter Urwald, der nicht mehr freigeräumt werden kann.

## Stand des Leitbild-Abnahmeschritts (vor der Umsetzung)

**Abgenommen:** dieses statische Bild als visuelles Leitbild und Stimmung.
**Noch nicht erstellt/abgenommen:** dunkler Startzustand, Freischneiden, Türbewegung,
Tier-/Pflanzen-/Falter-/Glühwürmchenanimationen, genaue zeitliche Inszenierung.
**Nicht integriert:** das Bild wird von keiner Spielkomponente importiert.
Es ersetzt weder Raumhülle noch Prop-Sprites und ist kein Laufzeit-Layer.
Die bestehende Morgenlicht-Intro-Fassung 5990c0f bleibt eine separate frühere Fassung.
Die Freigabe des neuen Leitbilds ist keine rückwirkende Abnahme dieser Fassung.

Keine Tests, QA, Simulationen, Builds oder Laufzeitprüfungen in diesem Abnahmeschritt.
Die frühere Zustimmung zu Vorschau/Bediencheck bezog sich auf das damalige Intro.
Die gemeinsame Gameplay-Integration bleibt beim koordinierenden Chat; hier
wurde keine zweite Zusammenführung gestartet.

## Agent Run Protocol

Tool: Codex desktop / eingebautes Imagegen
Model (actual / requested): Hauptagent GPT-6, genaue Variante nicht verfügbar /
keine Variante angefordert; Imagegen-Modell vom Werkzeug verwaltet
Prompt ID: cafe-intro-arcana-20261010
Related issue / PR: keine
Start credits: not applicable
End credits: not applicable
Credit delta: not applicable
Branch: art/cafe-intro-arcana-20261010
Commit(s): siehe Git-Historie
Files changed: Leitbild-PNG und diese Abnahmenotiz
Tests/checks run: Quellen-/Statusprüfung; keine technischen Prüfungen
Result summary: visuell freigegebenes Leitbild unverändert gesichert
Open problems: Szenenfolge/Animationen, technische Umsetzung und deren Freigaben
Tool's suggested next step: Ablauf in wenigen festen Szenen festlegen, dann
isolierten Umsetzungskandidaten vorbereiten; GPT-6.1 Sol, Thinking medium
User/ChatGPT decision: Nutzerfreigabe „OA GEIL“ für das gezeigte Bild


## Animierter Umsetzungskandidat — 10. Oktober 2026

Der Nutzer beauftragte anschließend ausdrücklich die Umsetzung und animierte
Vorschau. Ergänzungen: Die fleischfressende Pflanze bemerkt die eintretende
Person und zieht sich selbst zurück. Die alten Geräte werden aussortiert;
KASSANDRA bleibt. Auf die Kauf-Rückfrage entschied der Nutzer:
**„Maschine, Mühle und Uhr jeweils separat kaufen“**.

### Ablauf

1. Vollständige Dunkelheit, geschlossene Tür.
2. Zwei Schnitte lösen die blockierenden Ranken.
3. Die Tür wird langsam und mit Widerstand nach innen gedrückt.
4. Der Lichtstrahl enthüllt den überwucherten Raum.
5. Ein kleines Tier flüchtet durchs rechte Fenster, Zitronenfalter fliegen auf.
6. Die fleischfressende Pflanze fängt einen Falter.
7. Der eintretende Schatten kündigt die eigene Präsenz an; die Pflanze zieht sich zurück.
8. Rätselhafte Steampunk-Maschine, Mühle und Uhr bleiben als alte Fundstücke sichtbar.
9. Der Schluss hält an. „Aussortieren & aufräumen“ blendet in den leeren Aufbauzustand.

Der automatische Ablauf dauert ungefähr 22 Sekunden. Pause/Fortsetzen,
Überspringen, Escape und Wiederholung sind vorhanden. Bei reduzierter Bewegung
wird der Ablauf mit „Weiter“ als Folge ruhiger Bilder bedient.

### Grafik und Zuständigkeit

Vier neue Raster-Dateien unter `assets/sprites/intro/` bilden Raum, Tür, Tier
und Pflanze. SVG-/CSS-Layer steuern Schnitte, Falter, genau drei ungewöhnlich
gefärbte Glühwürmchen, Tropfen, Pfützenring und Präsenzschatten.
Die tatsächlich verwendeten Generierungsprompts stehen in
`INTRO_ARCANA_PROMPTS.json`. Das freigegebene v01-Leitbild bleibt unverändert.
Die neue Raumgrafik enthält ausschließlich die alten Fundgeräte; die später
gekauften Tag-1-Geräte verwenden die bestehenden freigegebenen Prop-Sprites.
Deren Anker und die Spielfeldgeometrie wurden nicht geändert.

**Grafiken visuell abgenommen am 27. Oktober 2026:** v02-Raum und die gezeigten
separaten Intro-Sprites, siehe Abnahmenotiz unten. **Noch offen:** Animation,
Timing und Übergang zum Aufbau. Die Freigabe des v01-Leitbilds gilt
weiter nur für dieses konkrete Leitbild. Der Kandidat liegt isoliert auf
`codex/cafe-mystic-intro-20261010`; keine Zusammenführung oder Veröffentlichung.

### Separate Ersatzkäufe

- Maschine: bestehende 18 €.
- Mühle: Kandidatenpreis 8 €, eigener Equipment-Slot.
- Uhr: Kandidatenpreis 10 €, eigener Equipment-Slot; kein Öffnungserfordernis.
- Maschine und Mühle sind für die Öffnung erforderlich; Sitzplätze bleiben optional.
- KASSANDRA bleibt auf Register-Stufe 1. Der Software-Einstieg folgt weiterhin den bestehenden Freischaltungen.

Ein neuer Durchlauf beginnt ohne die drei Ersatzgeräte. An Tag 1 werden deren
Prop-Sprites erst nach dem jeweiligen Kauf sichtbar. Die vormontierten
Tag-2–7-Raumbilder wurden hier nicht neu gezeichnet. Bestehende Spielstände
behalten ihre bisher implizit vorhandene Mühle und Uhr durch additive Migration;
ausdrücklich ungekaufte Stufen 0 bleiben erhalten. Die vorhandenen Uhr-Décor-
Upgrades werden erst nach dem Ersatzkauf angeboten.

### Gezielte Prüfung und Vorschau

Freigegebener Umfang: animierte Browser-Vorschau und kurze Bedienprüfung.
Chrome 154, Desktop 1280×1400 und 1280×900, mobile Ansicht 390×844.
Bestätigt: Szenenreihenfolge, Türbewegung, verschwundenes Tier, zurückgezogene
Pflanze, vier geladene Raster-Dateien, genau drei Glühwürmchen, Pause/Fortsetzen,
Escape, Wiederholung, manuelle reduzierte Bewegung, getrennter Gerätekauf,
Öffnungsbedingungen und Besitz-gesteuerte Tag-1-Sprites. Keine Browser-Exceptions.
Die mobile Szene bleibt 16:9 und erzeugt keinen horizontalen Überlauf.
Quellenprüfung: `git diff --check`, gezielte Diff-/Statusprüfung.
Tests wurden an die neuen Equipment-Felder angepasst und um die Kaufgrenze und
Migration ergänzt, aber **nicht ausgeführt**. Keine Testsuite, kein Typecheck,
kein Lint, kein Build und kein vollständiger Wochen-Durchlauf.

Vorschau: `http://127.0.0.1:5188/cafe-apokalypso/?intro=arcana`.
Der Review-Parameter startet eine flüchtige frische Sitzung, erhält bestehende
Browser-Spielstände und zeigt das Intro bei jedem Neuladen.

Lokale Nachweise unter
`/Users/Heineken/.codex/visualizations/2026/10/10/01a12654-8a34-75f2-bca5-d1e45a80ce2b/`:
`cafe-mystic-intro.webm`, `cafe-mystic-intro-review.png` und
`cafe-mystic-intro-checks.json`. Ein Beweis-Screenshot für diesen Prüfdurchlauf.

Run-Protokoll: Hauptagent GPT-6 (genaue Variante nicht verfügbar), Imagegen durch
das eingebaute Werkzeug verwaltet. Read-only Kaufregel-Recherche durch einen
Subagenten GPT-6 Luna, Thinking low; keine delegierte Schreibarbeit oder Tests.
Nächster Schritt: Nutzerabnahme dieser konkreten Animation. Bei gewünschten
Korrekturen passt GPT-6.1 Sol, Thinking medium; kleine Textkorrekturen direkt.
Offen vor Integration: visuelle Abnahme und ausdrücklich freigegebene technische
Prüfung des Kandidaten. Der gemeinsame Gameplay-Stand wird hier nicht verändert.


## Grafikabnahme — 27. Oktober 2026

Nutzerfeedback zur gezeigten Intro-Vorschau: **„Die Grafiken sind großartig“**.

Gegenstand und Geltungsbereich: visuelle Gestaltung der gezeigten Intro-Grafiken
des Umsetzungskandidaten `f21a1ca`, einschließlich v02-Raum, mystischer Altgeräte
und separater Tür-, Tier- und Pflanzen-Sprites. Status: **visuell abgenommen**.
Die gezeigte Gestaltung bleibt bei weiteren Korrekturen erhalten.

Animation, Timing und Übergang zum Aufbau bleiben zur Abnahme offen. Das Feedback
enthält keine neue technische Testfreigabe, keine Integrationsfreigabe und keine
Veröffentlichungsfreigabe. Die bereits entschiedenen separaten Ersatzkäufe und
der Verbleib von KASSANDRA gelten weiter; die vorgeschlagenen Preise wurden durch
dieses Grafikfeedback nicht zusätzlich bestätigt.

Dieser Folgeschritt dokumentiert ausschließlich die Abnahme. Keine Grafik- oder
Codeänderung und keine neuen Tests, Builds, Browser- oder Laufzeitprüfungen.


## Wortlose Inszenierung — 2. November 2026

Nutzerkorrektur: **„ohne Text. DIe Pflanze leicht animieren schon am Anfang.
Mehr Bewegung. Guter Start!“**

Geltungsbereich: gesamte Intro-Inszenierung einschließlich Schluss und Übergang.
Titel und sämtliche Erzählzeilen wurden entfernt. Pause/Fortsetzen, Weiter,
Wiederholen, Aufräumen und Überspringen verwenden ausschließlich SVG-Symbole mit
zugänglichen Namen und Hinweisen bei Mouseover. Der Ladefehler bleibt für
Screenreader erreichbar. Die größere Szene nutzt den frei gewordenen Textbereich.

Die Pflanze wiegt sich und atmet ab dem ersten Bild; zunächst bleibt sie durch
die vollständige Dunkelheit verdeckt. Ihre Bewegung ist bereits beim ersten
Lichteinfall sichtbar, vor Fang und Rückzug. Falter schweben vor der Flucht,
Ranken wiegen sich, drei Glühwürmchen folgen weiteren Flugbahnen; sechs dezente
Staubpartikel schweben im Türlicht. Zwei kleine SVG-Ranken ergänzen die Bewegung.
Die freigegebenen Raster-Grafiken bleiben bytegleich erhalten. Fang, Rückzug,
Geräteauswahl, KASSANDRA und die getrennten Ersatzkäufe bleiben erhalten.

Umsetzung: `d31ff72`; lokaler Screenreader-Stil: `159eaa4`.
Branch: `codex/cafe-intro-motion-20261102`.
Worktree: `/private/tmp/cafe-intro-motion-20261102`.
Vorschau: `http://127.0.0.1:5188/cafe-apokalypso/?intro=arcana`.
Der gemeinsame Checkout und seine fremden Paketänderungen wurden nicht verändert.

### Gezielte technische Prüfung

Dauerhafte Freigabe vom 2. November angewandt: maximal fünf Minuten je Lauf,
15 Minuten insgesamt; lokaler Abbruch bei Zeitüberschreitung, keine Hintergrund-QA.
Vor dem Start festgelegt: vier Intro-/Outro-Modultests, Lint nur für die beiden
betroffenen TSX-Dateien und ein lokaler Intro-Browserfall.

- `node node_modules/vitest/vitest.mjs run tests/intro-outro.test.tsx` auf
  `d31ff72`: **4/4 bestanden**, Prozessdauer 0,57 s.
- `node node_modules/eslint/bin/eslint.js src/ui/components/IntroSequence.tsx
  tests/intro-outro.test.tsx` auf `d31ff72`: **bestanden**, 1,37 s.
- Neuer Browserstand `159eaa4`: textfreie Szene und zugänglich benannte Symbole,
  Pflanzenanimation `arcana-plant-sway` bereits in Phase `opening`, Pause und
  Fortsetzen, Schlusszustand und Wiederholung bestätigt. Genau drei Glühwürmchen.
- Reduzierte Bewegung in diesem Schritt **quellengeprüft**: sämtliche neuen
  Animationen bleiben in `prefers-reduced-motion: no-preference`; der bestehende
  manuelle Ablauf bleibt vorhanden. Kein neuer Runtime-Nachweis dieser Einstellung.
- Ein Beweis-Screenshot: `cafe-intro-wordless-20261102.png`; vollständige Zeit- und
  Versionszuordnung: `cafe-intro-wordless-checks-20261102.json`, beide im bisherigen
  lokalen Visualisierungsordner.

Der alte Server war beendet; die alte Browserseite zeigte daher zunächst einen
Verbindungsfehler. Der eigene Server wurde aus dem neuen Worktree gestartet und
die neue Fassung in einem frischen Browser-Tab angezeigt. Die Browser-Hilfs-API
unterstützte das Auslesen der Animationsliste nicht; stattdessen wurden berechnete
Stile und echte Bedienelemente geprüft. Dies ist kein nachgewiesener Produktfehler.
Die aktive Browserprüfung im frischen Tab dauerte rund 113 Sekunden; Startversuche
und alle übrigen Prüfschritte sind zusätzlich im Paketzeitnachweis enthalten.
Der Vorschau-Server bleibt zur Nutzeransicht geöffnet; es läuft keine weitere QA.

Keine vollständige Testsuite, kein Build, keine Integration oder Veröffentlichung.
Die neuen Bewegungen und die wortlose Darstellung stehen zur visuellen Abnahme.


## Licht, Tiefe und späte Entdeckung — 5. November 2026

Die Nutzerkorrektur gilt für den wortlosen Arcana-Kandidaten. Die Szene beginnt
auch beim Wiederholen mit einer sofort deckenden schwarzen Blende. Die Pflanze
wiegt sich von Anfang an verborgen; nach der Tierflucht erscheint sie weiter
hinten zwischen den Bodenranken. Falterfang und Rückzug bleiben erhalten.

Die Tür hat eine Vorder- und Rückseite sowie eine sichtbare, mitdrehende
Holzkante. Die Perspektive sitzt am Scharnier; ein kurzer Rückstoß vermittelt
Widerstand. Ein Bodenschatten folgt der Bewegung. Alle drei Glühwürmchen sind
kurz nach der vollständigen Öffnung sichtbar und verschwinden vor der Tierflucht.
Das kühle Dachlicht rechts hat weiche Ränder und einen schwachen Reflex in der
Pfütze; ab Entdeckung der Pflanze verglimmt es über drei Sekunden.

Die vier bestehenden Rasterbilder bleiben unverändert. Mit eingebautem Imagegen
entstanden `placeholder-intro-ivy-tendril-v01.png` (RGBA, bewegte Wand- und
Türranken) und `placeholder-intro-roof-clean-plate-v01.png` (Hintergrund ohne die
starre helle Linie). Von letzterem wird nur ein weich begrenzter schmaler Streifen
über die freigegebene Raumgrafik gelegt. Die finalen Prompts stehen in
`INTRO_ARCANA_DEPTH_PROMPTS.json`. Randprüfung der Ranke: an allen vier Rändern
null Pixel mit Alpha über 40.

Stand `004b56e` plus Glühwürmchen-Timing `297b48a`, isolierter Branch
`codex/cafe-intro-depth-20261105`. Die neuen Ebenen und ihre Animation sind
visuell offen; keine Integration oder Veröffentlichung. Die frühere Freigabe
der Originalgrafiken bleibt bestehen.

Gezielte Prüfung mit 5 Minuten je Lauf, 15 Minuten je Paket:

- `vitest run tests/intro-outro.test.tsx`: 4/4, 0,73 s; gezielter ESLint-Lauf
  für `IntroSequence.tsx`: grün, 1,40 s. Beide auf `004b56e`.
- Lokaler Browserfall auf `004b56e`: schwarz bei Start, Pflanze erst nach der
  Tierflucht sichtbar, Tür in Perspektive mit sichtbarer Kante, Dachlicht von
  0,68 beim Enthüllen über 0,14 beim Schnappen bis 0 am Schluss; keine Schrift
  in der Steuerung. Erste Phasenabfrage endete zu früh; mit begrenztem Warten
  je Phase vollständig wiederholt (65,29 s einschließlich Anlauf).
- CSS-Nachkorrektur `297b48a` separat im Browser geprüft: drei leuchtende Punkte
  beim Eintritt in `reveal`, alle drei auf 0 in `fleeing` (11,50 s). Die
  übrigen Bilder und Phasen sind von dieser Korrektur unberührt.

Zeitprotokoll und ein Browserbild im lokalen Visualisierungsordner:
`cafe-intro-depth-checks-20261105.json`, `cafe-intro-depth-20261105.png`.
Vorschau: `http://127.0.0.1:5188/cafe-apokalypso/?intro=arcana`.
Keine vollständige Suite und kein Build. Der lokale Server dient der Nutzeransicht.


## Eigenartige Pflanze und Lichtkontakt — 5. November 2026

Der Nutzer bewertete die Licht- und Tiefenfassung positiv („Wunderbar“) und
bat um eine eigenartigere Pflanze, die beim Lichtstrahl verschwindet. Die
bisherige Fassung `4f05e59` bleibt als Vergleich erhalten.

Die Pflanze hat eine asymmetrische pflaumenfarbene Haube, Bernsteinfäden im
Schlund und geknickte Blätter. Die neue transparente Rastergrafik
`assets/sprites/intro/placeholder-intro-plant-v02-arcana.png` wurde mit
integriertem Imagegen erstellt; der vollständige Prompt mit Referenzen steht in
`INTRO_ARCANA_PLANT_PROMPT.json`. Die vier Bildränder haben je null Pixel mit
Alpha über 40. Der v01-Sprite bleibt erhalten.

Die Pflanze wiegt sich weiterhin schon im Verborgenen und ist erst nach der
Tierflucht sichtbar. Nach dem Falterfang streicht das bestehende warme Türlicht
weiter über den Boden (`light-reaches`). Wenn der Lichtfleck die Wurzeln
berührt (`retreat`), zuckt die Pflanze zurück, sinkt in die Ranken und ist nach
1,05 s vollständig unsichtbar. Bei reduzierter Bewegung werden Lichtkontakt
und Verschwinden in demselben manuellen Schritt dargestellt. Das frühere
Schattensignal entfällt; Dachlicht rechts und Türablauf bleiben erhalten.

Kandidat `1f3f9b5`, Branch `codex/cafe-intro-strange-plant-20261105`.
[Neue Vorschau](http://127.0.0.1:5190/cafe-apokalypso/?intro=arcana),
[bisherige Fassung](http://127.0.0.1:5188/cafe-apokalypso/?intro=arcana).
Die neue Pflanze und ihre Lichtreaktion stehen zur visuellen Abnahme.

Gezielt auf `1f3f9b5` geprüft: vier Intro-/Outro-Tests bestanden (0,94 s),
ESLint für `IntroSequence.tsx` bestanden (0,94 s) sowie lokaler Browserfall
(24,62 s): bis zur Tierflucht verborgen, beim Fang sichtbar, Lichtkontakt in
der Rückzugsphase und Pflanzen-Deckkraft 0 in `relics` und `ready`.
Wortlose Steuerung bestätigt. Der erste vollständige Durchlauf genügte.
Grenzen: 5 Minuten je Lauf, 15 Minuten insgesamt. Keine Gesamtsuite, kein
Build, keine Integration. Ein Beweisbild und das Zeitprotokoll liegen im
bisherigen Visualisierungsordner als `cafe-intro-strange-plant-20261105.png`
und `cafe-intro-strange-plant-checks-20261105.json`.


## Türlicht und kurzer Pflanzenbiss — 5. November 2026

Nutzerkorrektur: Der Raum soll durch die sich öffnende Tür sichtbar werden.
Die Pflanze bewegt sich nur kurz, wenn sie den Schmetterling schnappt.

Kandidat `83cacfe` auf `codex/cafe-intro-door-light-20261105`. Die schwarzen
Startflächen gehen in lokal begrenztes Licht am Türspalt und am Boden über.
Ein gemeinsamer Öffnungswert bestimmt den Winkel, den sichtbaren Spalt, den
Lichtkegel und den schwächeren indirekten Lichtschein. Die frühere flächige
Abdunklung und der separate Dachstrahl entfallen. Beim letzten kleinen Schub
an der Tür erreicht ihr Licht die Pflanze; die Pfütze behält einen schwachen
Reflex. Die freigegebenen Grafiken und der neue Pflanzensprite bleiben erhalten.

Die Pflanze wird spät sichtbar und bleibt am selben Ort. Nur `snap` animiert
sie (0,65 s). Danach ist sie reglos; bei Lichtkontakt verschwindet sie in einer
kurzen reinen Deckkraftänderung. Das erhält die vorherige Anforderung, beim
Licht zu verschwinden, ohne die bisherige Rückzugsbewegung. Keine neue Schrift.

[Neue Vorschau](http://127.0.0.1:5192/cafe-apokalypso/?intro=arcana),
[vorherige Fassung](http://127.0.0.1:5190/cafe-apokalypso/?intro=arcana).
Visuelle Abnahme für Türlicht und Pflanzenbewegung offen.

Gezielt auf `83cacfe` geprüft (Grenzen: 5 Minuten je Lauf, 15 je Paket):

- Vier Intro-/Outro-Tests (0,60 s) und Lint der beiden TSX-Dateien (1,03 s) grün.
- Lokaler Browserfall: zu Beginn komplett transparente Lichtmaske vor schwarzem
  Hintergrund; Spalt, Maske und Türwinkel ändern sich beim Öffnen. Keine alte
  Blende oder separate rechte Lichtquelle. Animation ausschließlich in `snap`;
  danach kein Pflanzen-Transform, beim Ende Deckkraft 0. Wortlose Steuerung
  bestätigt. Die erste Phasenabfrage hatte ein zu kurzes Werkzeug-Zeitlimit;
  danach vollständig mit begrenzter Abfrage wiederholt (53,61 s inklusive Anlauf).
- Nachweise: `cafe-intro-door-light-20261105.png` und
  `cafe-intro-door-light-checks-20261105.json` im bisherigen Visualisierungsordner.
  Keine Gesamtsuite, kein Build, keine Integration oder Veröffentlichung.


## Gleichzeitiger Biss und Türschub — 5. November 2026

Nutzerkorrektur: die Momente enger zusammenlegen und die Tür im geöffneten
Zustand erneut ansehen. Die Fassung mit Türlicht bleibt Grundlage.

Kandidat `27e0675`, Branch `codex/cafe-intro-synced-bite-20261105`. Der letzte
Türschub, der weiterwandernde Lichtstrahl, der Falterflug und der Pflanzenbiss
liegen jetzt in einem gemeinsamen 850-ms-Abschnitt. Der Falter erreicht das Maul
auf dem Schließmoment. Kurz darauf trifft das Licht die Pflanze; ihre Position
bleibt fest, während sie ausgeblendet wird. Der separate Abschnitt `light-reaches`
entfällt. Bilder, Dunkelstart, späte Entdeckung und Türgeometrie bleiben erhalten.

Gezielte Prüfung auf `27e0675` (Grenzen: 5 Minuten je Lauf, 15 je Paket): vier
Intro-/Outro-Tests grün (0,48 s), Lint für `IntroSequence.tsx` grün (0,91 s),
lokaler Browserfall erfolgreich (22,95 s). In demselben Browser-Sample waren
Licht, Biss und Falterflug nachweislich in Bewegung. Danach kein Pflanzen-
Transform, am Schluss Deckkraft 0. Tür im vollständigen offenen Schlusszustand
visuell angesehen und relativ zur Szene vermessen: Durchgang frei, Holzkante
sichtbar, Blatt in der Perspektive am linken Scharnier und bis zum Boden geführt.
Bei 739 px Szenenbreite projiziert die Kante etwa 6 px; die Abdeckung des
Durchgangs ist vollständig weggeklappt. Keine weitere Geometrieänderung nötig.

[Neue Vorschau](http://127.0.0.1:5194/cafe-apokalypso/?intro=arcana).
Beweisbild `cafe-intro-open-door-20261105.png` und Zeitprotokoll
`cafe-intro-synced-bite-checks-20261105.json` im lokalen Visualisierungsordner.
Die Taktung bleibt zur visuellen Nutzerabnahme; keine Gesamtsuite, kein Build,
keine Integration oder Veröffentlichung.


## Leben beim ersten Türlicht — 5. November 2026

Nutzerkorrektur: Pflanze von Anfang an seitlich des Strahls; Falter,
Glühwürmchen und Tropfen schon beim Öffnen; kurzer Biss und danach Stillstand.
Die Pfütze soll beständig und weniger magisch sein, eine Bodenranke sehr
langsam nachgeben. Lichtstaub und die Maschinen auf dem Tresen wurden positiv
hervorgehoben und bleiben erhalten. Nur das Metall der Uhr soll anders wirken.

Kandidat `8a191a9`, Branch `codex/cafe-intro-room-life-20261105`. Die Pflanze
sitzt unverrückt bei 55,1 % / 59,9 % der Intro-Szene im Halbschatten rechts neben
der hellen Bodenspur. Sie erscheint mit dem Raumlicht und bleibt nach dem
Falterfang reglos und sichtbar. Der alte Lichtkontakt samt Ausblenden entfällt.
Drei Zitronenfalter haben von der Öffnung an eigene Flugbahnen; der Falter am
Maul setzt seinen Anflug in denselben 850 ms wie Biss und letzten Türschub fort.
Die übrigen beiden flattern weiter. Drei Glühwürmchen schwirren ab der Öffnung
und erlöschen weiterhin kurz danach. Die sechs Staubpartikel bleiben unverändert.

Rechts fällt alle 3,3 s ein Tropfen in die ruhig gemalte Pfütze und löst eine
kleine Welle aus. Wasserfläche und Zinnuhr kommen aus zwei lokal begrenzten
Ausschnitten von `placeholder-intro-room-details-v01.png` (integriertes Imagegen,
1672×941). Der freigegebene Raum samt Tresen und Maschinen bleibt die Basis.
Die Zusatzgrafik der Uhr beginnt bei 79,2 % der Breite und spart den Bereich
der Geräte aus; der Pfützenausschnitt liegt unterhalb des Tresens. Die Uhr
behält Position und Zifferblatt. Quelle und Prompt: `INTRO_ARCANA_ROOM_DETAIL_PROMPT.json`.
Ein einzelner zusätzlicher Efeutrieb liegt auf dem Boden und wiegt sich in
22 s je Richtung. Die freigegebene Spielraumgeometrie bleibt unverändert.

Gezielte Prüfung auf `8a191a9`: vier Intro-/Outro-Tests (1,81 s) und Lint für
`IntroSequence.tsx` (3,47 s) grün. Ein Verbindungsabbruch der Browsersteuerung
und die Zeitgrenze des ersten kombinierten Browserfalls lieferten keinen
Nachweis. Danach im verbundenen Vorschau-Tab getrennt geprüft: Pflanze und drei
aktive Flugbahnen in `opening`, Glühwürmchen in `reveal`, Biss in `snap`,
reglose sichtbare Pflanze am gleichen Anker in `settled` und `ready` (15,01 s).
Zwei sichtbare fallende Tropfen und eine Wasserwelle in `ready` gemessen (3,94 s;
beobachteter Abstand 3,38 s, eingestellte Periode 3,3 s). Die Pfützenfläche hat
keine eigene Animation; genau eine Bodenranke bewegt sich mit 22 s Dauer.
Ein Browserbild und das Zeitprotokoll liegen im bisherigen Visualisierungsordner
als `cafe-intro-room-life-20261105.png` und `cafe-intro-room-life-checks-20261105.json`.
Keine Gesamtsuite, kein Build, keine Integration oder Veröffentlichung.

[Neue Vorschau](http://127.0.0.1:5196/cafe-apokalypso/?intro=arcana).
Die neue Rauminszenierung steht zur visuellen Nutzerabnahme.


## Ruhigere Bewegungen bei gleicher Gestaltung — 12. November 2026

Nutzerfeedback: „Die Animationen sehen nicht schön aus, alles andere ist toll“.
Umfang der Überarbeitung: ausschließlich die Bewegung im Intro. Der offene
Browser zeigte noch die ältere Adresse auf Port 5194; das Feedback wird daher
keinem späteren Bildstand als neue formelle Abnahme zugeschrieben. Als Basis und
Vorher-Vergleich dient die zuletzt gelieferte Raumfassung `7282241`, einschließlich
Pflanze im Halbschatten, Zinnuhr, ruhiger Pfütze, Bodenranke und gebilligtem Lichtstaub.

Kandidat `f434011`, Branch `codex/cafe-intro-natural-motion-20261112`.
Zwei Falter fliegen auf stetigen, unterschiedlich schnellen Kurven; der dritte
geht ohne Richtungsstopps in seinen Anflug über. Ihre Flügel kippen statt sich
nur in der Breite zu stauchen. Beim kurzen Biss klappt nur die ausgeschnittene
Haube des bestehenden Pflanzensprites zu; Stiel, Blätter und Anker bleiben stehen.
Unmittelbar danach erscheint wieder exakt die statische Originalgrafik. Tür und
Licht beginnen träge und laufen sanft aus, bei gleichen Endankern; die Katze
springt aus dem Bild hinter die Fensterkante, statt stark zu schrumpfen. Glühwürmchen,
Ranken und der fallende Tropfen haben ruhigere Bewegungsverläufe. Der 3,3-s-Takt,
Bodenranke, Ablauf, Lichtstaub, sämtliche Rasterdateien und Spielregeln bleiben
erhalten. Die neue Version ist der Favorit für die Sichtprüfung, weil Bewegung
an Flügeln und Maul lokal statt an der ganzen Silhouette sichtbar wird.

[Vorher](http://127.0.0.1:5196/cafe-apokalypso/?intro=arcana) (`7282241`,
unveränderter Export) · [Neue Vorschau](http://127.0.0.1:5198/cafe-apokalypso/?intro=arcana).
Neue Bewegungen stehen zur visuellen Nutzerabnahme. Keine Integration oder Veröffentlichung.

Gezielte Prüfung auf `f434011` (5 Minuten je Lauf, 15 je Paket): vier Intro-/Outro-
Tests (0,53 s) und Lint der Komponente (1,06 s) bestanden. Browserfall (14,61 s):
drei aktive Flugbahnen, Fensterkante bei Tierflucht, Bewegung der Haube bei
stehendem Pflanzenkörper; im Schlusszustand Originalpflanze reglos sichtbar,
zwei verbleibende Falter, sechs Lichtpartikel und gleicher Tropfentakt. Die
Vorher-Vorschau wurde geladen. Beweisbild `cafe-intro-natural-motion-20261112.png`
und Zeitprotokoll `cafe-intro-natural-motion-checks-20261112.json` im lokalen
Visualisierungsordner. Keine Gesamtsuite und kein Build.

## Kompakter Schnitt mit lesbaren Bewegungen · 12. November 2026

Kandidat `ffd4ec3` auf `codex/cafe-intro-natural-motion-20261112`. Die Sequenz
dauert 8,95 statt 20,85 Sekunden. Beim Freischneiden bleibt der Raum schwarz.
Die sich öffnende Tür beleuchtet die fallenden Ranken und die drei bereits
fliegenden Falter zwischen Lichtfleck und Pflanzenbeet. Die Katze ist mit
größerer Silhouette vor dem Sprung an der rechten Fensterbank erkennbar.
Die Blume steht kompakter im selben Halbschatten und bleibt nach dem kurzen
Schnappen stehen. Der rechte Tropfen hat einen sichtbaren Reflex und fällt
alle 2,65 Sekunden in die schlichte Pfütze.

[Kompakte Vorschau](http://127.0.0.1:5200/cafe-apokalypso/?intro=arcana) ·
[Vorherige Fassung](http://127.0.0.1:5198/cafe-apokalypso/?intro=arcana)
(`55b9fe2`). Die kompakte Fassung steht zur Sichtabnahme. Sie zeigt die Katze
früh genug für den Sprung und konzentriert den Blick auf den Falterfang.

Gezielt geprüft auf `ffd4ec3`: vier Intro-/Outro-Tests (0,49 s), ESLint der
Komponente (0,86 s) und lokaler Browserfall (9,32 s). Die Lichtmaske war in
`dark` und `cutting` vollständig transparent. Drei Falter flogen beim Öffnen.
Fenstersprung, Tropfenfall mit anschließender Welle und kurzer Fang waren messbar.
Die Blume hatte bei Öffnung und Schluss denselben Anker. Der Schluss war nach
9,17 s ab dem Klick für die Wiederholung sichtbar. Vergleich im selben
Browserformat: Katze vor dem Sprung mit 75,38 statt 38,42 px Spritebreite.
Standbild und Zeitprotokoll `cafe-intro-compact-20261112.png` und
`cafe-intro-compact-20261112.json` liegen im lokalen Visualisierungsordner.
Integration und Veröffentlichung sind offen.

## Tür am rechten Scharnier und Biss bei Kontakt · 12. November 2026

Kandidat `0198070` auf `codex/cafe-intro-door-20261112`. Der bisherige
Türflügel klappte links zusammen und erhielt beim Fang einen zweiten Schub.
Der neue Flügel dreht sich um den rechten Pfosten mit den gemalten Beschlägen
bis auf 94 Grad in den Raum. Holzkante und Bodenschatten folgen dem Flügel.
Der Spalt wird mit der Drehung breiter und bestimmt, wie viel Licht auf den
Boden und in den Raum fällt. Beim Fang steht die Tür bereits still.

Die Blume bleibt auf ihrem Anker. Beim Kontakt mit dem Falter bewegt sich
221 ms lang nur das Maul. Davor und danach ist das statische Sprite sichtbar.
[Neue Vorschau](http://127.0.0.1:5202/cafe-apokalypso/?intro=arcana) ·
[Vorige Fassung](http://127.0.0.1:5200/cafe-apokalypso/?intro=arcana)
(`9ebf3ed`). Die neue Tür gibt die Schwelle frei und lässt das Holzblatt
auch ganz offen erkennen.

**Vorläufig visuell abgenommen am 12. November 2026.** „GUt, abgenommen
fürs erste“ gilt für die auf Port 5202 gezeigte Arcana-Fassung auf
`0198070` mit Türöffnung, Türlicht und Pflanzenbiss.

Gezielt geprüft auf `0198070`: vier Intro-/Outro-Tests (0,46 s), ESLint der
Komponente (0,93 s) und lokaler Browserfall (9,21 s, 138 Stichproben).
Schwarzstart und Schnittphase blieben schwarz. Der rechte Drehpunkt wich im
Vergleich zwischen geschlossenem und offenem Zustand um gerundet 0,001
Prozentpunkte der Szenenbreite ab. Beim Drehen an der Schmalseite blieb die
Holzkante sichtbar. Winkel und Lichtmaske blieben ab dem Ende der Öffnung
bis zum Schluss konstant. Das Maul bewegte sich im Fangfenster bei Kontakt.
Vor und nach diesem Fenster war das statische Sprite am gleichen Ort.
Das Standbild `cafe-intro-door-20261112.png` und das Messprotokoll
`cafe-intro-door-20261112.json` liegen im lokalen Visualisierungsordner.

## Lokale Integration · 12. November 2026

Die visuell abgenommene Arcana-Fassung ist in den lokalen Hauptbranch
übernommen. Die aufgeräumte Ansicht verwendet die aktuelle `CafeScene`.
Die Ersatzkäufe, der Speicherhinweis und die vorhandenen Änderungen an
der ersten Tasse und an den Ranken sind im Integrationsstand enthalten.

Auf `a8df7bb` bestanden 82 Tests in fünf gezielten Vitest-Dateien zu
Intro/Outro, Einrichtungskäufen, Spielständen, Speicherwarnungen und
ausstehenden Ereignissen (0,56 s Gesamtlaufzeit). Die visuelle Abnahme
bezieht sich auf die Arcana-Vorschau. Die angepasste aufgeräumte
Ansicht steht zur Sichtprüfung. Veröffentlichung ist offen.
