# KASSANDRA – Vorbereitung der neuen Kasse

Stand: 6. September 2026. Die Kasse aus Szenenabnahme Schritt 7 ist das künftige
physische KASSANDRA-Terminal. Der Sprite ist noch nicht visuell abgenommen und
noch nicht in die Runtime übernommen. Diese Datei beschreibt den verbindlichen
Integrationsumfang; sie ist kein Nachweis einer fertigen Implementierung.

## Vorhandene Anknüpfungspunkte

- `src/ui/cafe/CafePlaceholder.tsx`: bisheriger Register-Sprite, ruhender/aktiver
  Zustand, separate Bildschirm- und Bon-Layer, situative KASSANDRA-Meldungen.
- `src/game/engine/reducer.ts`: bestehende Konsultationsaktion; benötigt Tag ≥ 6,
  `kassandraInstalled`, `unlocks.kassandra`, geöffnetes Café und Aktionskapazität.
- `src/game/engine/selectors.ts`: `getVisibleKassandraMessages` filtert Meldungen
  nach Installation und Spieltag.
- `src/ui/components/ActionPanel.tsx`: aktueller Einstieg zur Konsultation mit
  Bedingungen und Tageslimit.
- `src/ui/panels/DayProgressPanel.tsx`: aktuelle Meldungsanzeige.
- `src/ui/components/KassandraBootScreen.tsx`: bestehender Auftakt eines neuen
  Durchlaufs; nicht mit der funktionalen Freischaltung an Tag 6 verwechseln.

## Bei der Übernahme umzusetzen

1. Den freigegebenen Kassen-Sprite im gemeinsamen Prop-Mapping als KASSANDRA
   zuordnen. Auf dem vorderen Tresen verankern und mit ihm gemeinsam bewegen.
   Die Bedienseite bleibt zum Personalgang ausgerichtet.
2. Kasse als echten HTML-Button mit Namen „KASSANDRA – Kasse“ zugänglich machen:
   Maus, Touch, Enter/Leertaste und sichtbarer Tastaturfokus. Die Trefffläche an
   der sichtbaren Kasse ausrichten, nicht an ihren großen transparenten Rändern.
3. Der Button öffnet eine fokussierte KASSANDRA-Ansicht mit klarer Rückkehr ins
   Café und Fokus-Rückgabe. Das Öffnen verbraucht keinen Aktionspunkt. Erst die
   bestehende Konsultationsaktion löst die bisherigen Kosten und Regeln aus.
4. Tag 1–5 zeigt die Kasse ihren ruhigen Ausgangszustand. Ab Tag 6 werden die
   bestehenden Freischaltbedingungen und Meldungen verwendet. Bereits konsultiert,
   Café geschlossen und fehlende Aktionskapazität erhalten verständliche Gründe.
   Visuelle Aktivierung, Bedienbarkeit und Meldungen auf konsistente Bedingungen
   prüfen: aktuell verwenden die Darstellungsstellen teilweise unterschiedliche
   Kombinationen aus Spieltag, Installation und Unlock.
5. Gehäuse-Sprite, Statusanzeige, Texte und eventuelle Bon-Darstellung getrennt
   halten. Keine Texte oder Meldungen ins PNG einbrennen. Da die Kundenseite des
   Displays sichtbar ist, operative Texte in der Detailansicht zeigen. Zusätzliche
   Statuslichter oder Animationen benötigen eine eigene visuelle Abnahme.
6. Bestehende Seitenleisten erst ablösen, wenn sämtliche Meldungen, Bedingungen
   und Aktionen in der KASSANDRA-Ansicht erreichbar sind. Keine zweite parallele
   KASSANDRA-Zustandsverwaltung und keine neue Savegame-Wahrheit einführen.

## Inhaltliche Grenzen

KASSANDRA beginnt als scheinbar gewöhnliches Kassen-/Analyseupdate. Ton: ruhig,
analytisch, merkwürdig präzise und zunehmend unpassend. Verhalten bleibt durch
verfasste Inhalte und Spielregeln simuliert; keine externe KI-API. Neles fehlende
Klassifikation ist beabsichtigt und darf nicht repariert werden.

## Spätere Abnahme und Prüfung

Nach Sprite-Freigabe und Umsetzung: ruhige Tage 1–5, Freischaltung Tag 6,
Konsultationskosten/Tageslimit, geschlossenes Café, Tag 7/Bon, gespeicherte
Spielstände, Tastatur/Touch und Rückkehr-Fokus prüfen. Testsuites erst nach
ausdrücklicher Zustimmung ausführen. Bis dahin bleibt die v07-Runtime bestehen.

Referenzen: `docs/PROJECT_CANON.md`, `docs/DECISIONS.md`,
`docs/art/UI_STYLE_GUIDE.md`, `docs/cash-register-approval-prompt.md`.
