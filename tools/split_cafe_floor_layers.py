#!/usr/bin/env python3
"""Split the café background into a fixed shell and an independently scalable floor."""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/backgrounds/placeholder-cafe-stage-base-growth-v01.png"
SHELL = ROOT / "assets/backgrounds/placeholder-cafe-stage-shell-v01.png"
FLOOR = ROOT / "assets/backgrounds/placeholder-cafe-floor-growth-v01.png"

# The four painted floor corners in the 1672 x 941 source.  The wall-panel seam
# stays on the floor layer, so the floor and the shell meet cleanly at day seven.
FLOOR_POLYGON = [(76, 596), (758, 345), (1594, 645), (796, 905)]


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    mask = Image.new("L", source.size, 0)
    ImageDraw.Draw(mask).polygon(FLOOR_POLYGON, fill=255)

    floor = source.copy()
    floor.putalpha(mask)
    floor.save(FLOOR)

    shell = source.copy()
    alpha = shell.getchannel("A")
    alpha.paste(0, mask=mask)
    shell.putalpha(alpha)
    shell.save(SHELL)

    print(f"Wrote {SHELL.name} and {FLOOR.name}")


if __name__ == "__main__":
    main()
