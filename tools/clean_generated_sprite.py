#!/usr/bin/env python3
"""Convert generated prop art into cropped, genuinely transparent PNG sprites."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image

from build_cafe_redesign_layers import remove_connected_light_background


def remove_tiny_islands(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    width, height = rgba.size
    data = alpha.load()
    visited = bytearray(width * height)
    components: list[list[tuple[int, int]]] = []

    for y in range(height):
        for x in range(width):
            index = y * width + x
            if visited[index] or data[x, y] <= 20:
                continue
            queue = deque([(x, y)])
            visited[index] = 1
            component: list[tuple[int, int]] = []
            while queue:
                cx, cy = queue.popleft()
                component.append((cx, cy))
                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                    if not (0 <= nx < width and 0 <= ny < height):
                        continue
                    neighbour = ny * width + nx
                    if visited[neighbour] or data[nx, ny] <= 20:
                        continue
                    visited[neighbour] = 1
                    queue.append((nx, ny))
            components.append(component)

    if not components:
        raise ValueError("No opaque sprite pixels found")
    largest = max(len(component) for component in components)
    keep_at_least = max(48, round(largest * 0.012))
    keep = {point for component in components if len(component) >= keep_at_least for point in component}
    cleaned_alpha = Image.new("L", rgba.size, 0)
    cleaned_pixels = cleaned_alpha.load()
    for x, y in keep:
        cleaned_pixels[x, y] = data[x, y]
    rgba.putalpha(cleaned_alpha)
    return rgba


def remove_neutral_contact_shadow(image: Image.Image, start: float) -> Image.Image:
    rgba = image.copy()
    pixels = rgba.load()
    first_row = round(rgba.height * start)
    for y in range(first_row, rgba.height):
        for x in range(rgba.width):
            r, g, b, a = pixels[x, y]
            if a > 0 and min(r, g, b) > 105 and max(r, g, b) - min(r, g, b) < 26:
                pixels[x, y] = (r, g, b, 0)
    return rgba


def clean(
    source: Path,
    destination: Path,
    padding: int = 24,
    neutral_shadow_from: float | None = None,
) -> None:
    image = Image.open(source)
    if image.mode != "RGBA" or image.getchannel("A").getextrema() == (255, 255):
        image = remove_connected_light_background(image)
    else:
        image = image.convert("RGBA")
    image = remove_tiny_islands(image)
    box = image.getchannel("A").getbbox()
    if box is None:
        raise ValueError(f"No visible sprite in {source}")
    left = max(0, box[0] - padding)
    top = max(0, box[1] - padding)
    right = min(image.width, box[2] + padding)
    bottom = min(image.height, box[3] + padding)
    image = image.crop((left, top, right, bottom))
    if neutral_shadow_from is not None:
        image = remove_neutral_contact_shadow(image, neutral_shadow_from)
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--padding", type=int, default=24)
    parser.add_argument("--neutral-shadow-from", type=float)
    args = parser.parse_args()
    clean(args.source, args.destination, args.padding, args.neutral_shadow_from)


if __name__ == "__main__":
    main()
