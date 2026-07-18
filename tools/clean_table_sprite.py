#!/usr/bin/env python3
"""Remove the flat grey floor diamond baked into the table sprite."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SPRITE = ROOT / "assets/sprites/props/placeholder-table-chair-set-v2.png"


def main() -> None:
    image = Image.open(SPRITE).convert("RGBA")
    pixels = image.load()
    removed = 0

    for y in range(100, image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            brightest = max(red, green, blue)
            darkest = min(red, green, blue)
            saturation = (brightest - darkest) / brightest if brightest else 0
            if alpha > 40 and 145 <= brightest <= 195 and saturation < 0.10:
                pixels[x, y] = (red, green, blue, 0)
                removed += 1

    image.save(SPRITE)
    print(f"Removed {removed} grey floor pixels from {SPRITE.name}")


if __name__ == "__main__":
    main()
