#!/usr/bin/env python3
"""Remove an image-generator's connected near-black canvas from a café target."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image


def remove_connected_dark_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    exterior = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def is_background(x: int, y: int) -> bool:
        red, green, blue, _ = pixels[x, y]
        return max(red, green, blue) < 48 and max(red, green, blue) - min(red, green, blue) < 18

    def add(x: int, y: int) -> None:
        offset = y * width + x
        if exterior[offset] or not is_background(x, y):
            return
        exterior[offset] = 1
        queue.append((x, y))

    for x in range(width):
        add(x, 0)
        add(x, height - 1)
    for y in range(height):
        add(0, y)
        add(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for next_x, next_y in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= next_x < width and 0 <= next_y < height:
                add(next_x, next_y)

    for y in range(height):
        for x in range(width):
            if exterior[y * width + x]:
                red, green, blue, _ = pixels[x, y]
                pixels[x, y] = (red, green, blue, 0)
    return rgba


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()

    target = remove_connected_dark_background(Image.open(args.source))
    args.destination.parent.mkdir(parents=True, exist_ok=True)
    target.save(args.destination, optimize=True)


if __name__ == "__main__":
    main()
