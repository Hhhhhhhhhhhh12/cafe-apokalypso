# Café Apokalypso auf dem iPad

Das Xcode-Projekt verpackt das Spiel aus demselben Checkout als eigenständige
iPad-App. Die App lädt ihre Spieldateien aus dem eigenen Bundle. Sie benötigt
keinen Vorschau-Server. Der bisherige Safari-Spielstand wird nicht importiert.

1. Im Repository mit `npm ci` die Abhängigkeiten installieren und mit
   `node tools/pack-ipad.mjs` die Spieldateien für das iPad erstellen.
2. `ios/CafeApokalypso.xcodeproj` in Xcode öffnen. Für einen Gerätebuild unter
   Signing & Capabilities ein Entwicklungsteam wählen.
3. Vor jedem neuen Gerätebuild nach Spieländerungen den Paketbefehl erneut
   ausführen. `ios/Web/` enthält generierte Dateien und wird nicht eingecheckt.

Das Projekt setzt mindestens iPadOS 17 voraus. Der Bundle-Identifier
`com.cafeapokalypso.ipadtest` und die lokale WebKit-Adresse entsprechen dem
bisherigen iPad-Testbuild. Das App-Symbol ist die abgenommene Variante B
mit einem türkisfarbenen Riss und schmalem Schimmer.

Der bisher installierte Testbuild basierte auf `5ad10df`. Build, Signatur,
Installation und Gerätetest dieses Repository-Stands sind separat zu prüfen.
