# Kaffeemühle – Schritt 6

Erstellt mit dem eingebauten Imagegen-Werkzeug. Referenz:
`assets/backgrounds/placeholder-cafe-target-v06-isometric-day1-windows.png`.
Ziel: `assets/sprites/props/placeholder-cafe-coffee-grinder-v01-target-reference.png`.

## Generierungsprompt

Use case: background-extraction. Create ONE isolated transparent game sprite: only the small coffee grinder immediately right of the espresso machine in the reference image. Match that exact cozy warm pixel illustration style, soft daylight, charcoal gray base, brown coffee beans in a transparent amber hopper, black round lid, small front adjustment dial and dispenser. Isometric view identical to reference: front faces lower-left, right side visible, horizontal front edges slope down-right about 19 degrees. Full object with base and feet intact, centered with generous transparent margins. Genuinely transparent alpha background. No espresso machine, counter, floor, cups, furniture, text, cast shadow plate, checkerboard or extra objects. Keep restrained details and reference proportions. This single prop goes on the staff workbench beside the previously approved machine.

## Nachbearbeitung

`tools/prepare_espresso_approval.py` entfernt Alpha-Nebel bis einschließlich 40.
Die Mühle bleibt ein einzelner Abnahmekandidat außerhalb der Runtime.
