#!/usr/bin/env python3
"""Build deterministic room-shell and seven floor-growth layers from one master."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


CANVAS = (1672, 941)
FLOOR_BACK = ((8.0, 61.6), (50.0, 45.7), (92.0, 61.6))
DAY_TIPS = (77.0, 80.6, 84.2, 87.8, 91.4, 95.0, 98.6)
FLOOR_SHOULDERS_X = (22.0, 78.0)


def remove_connected_light_background(image: Image.Image) -> Image.Image:
    """Turn a baked light checkerboard outside the room into real transparency."""
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()
    outside = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def is_background(x: int, y: int) -> bool:
        r, g, b, _ = pixels[x, y]
        return min(r, g, b) >= 222 and max(r, g, b) - min(r, g, b) <= 18

    for x in range(width):
        queue.extend(((x, 0), (x, height - 1)))
    for y in range(height):
        queue.extend(((0, y), (width - 1, y)))

    while queue:
        x, y = queue.popleft()
        index = y * width + x
        if outside[index] or not is_background(x, y):
            continue
        outside[index] = 1
        if x:
            queue.append((x - 1, y))
        if x + 1 < width:
            queue.append((x + 1, y))
        if y:
            queue.append((x, y - 1))
        if y + 1 < height:
            queue.append((x, y + 1))

    alpha = Image.new("L", rgba.size, 255)
    alpha.putdata([0 if value else 255 for value in outside])
    rgba.putalpha(alpha)
    return rgba


def pct_point(point: tuple[float, float]) -> tuple[int, int]:
    return (round(point[0] / 100 * CANVAS[0]), round(point[1] / 100 * CANVAS[1]))


def antialiased_polygon(
    points: list[tuple[float, float]], *, blur_radius: float = 0.0
) -> Image.Image:
    scale = 4
    mask = Image.new("L", (CANVAS[0] * scale, CANVAS[1] * scale), 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon(
        [(round(x / 100 * CANVAS[0] * scale), round(y / 100 * CANVAS[1] * scale)) for x, y in points],
        fill=255,
    )
    mask = mask.resize(CANVAS, Image.Resampling.LANCZOS)
    return mask.filter(ImageFilter.GaussianBlur(blur_radius)) if blur_radius else mask


def build(master_path: Path, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    master = Image.open(master_path)
    if master.mode != "RGBA" or master.getchannel("A").getextrema() == (255, 255):
        master = remove_connected_light_background(master)
    master = master.resize(CANVAS, Image.Resampling.LANCZOS)
    master.save(output_dir / "placeholder-cafe-master-v06-redesign.png", optimize=True)

    # The wall shell and every daily floor are cut from this exact master. A
    # two-pixel overlap at the wall/floor seam prevents sampling gaps at any DPR.
    shell_region = [
        (0.0, 0.0),
        (100.0, 0.0),
        (100.0, 62.0),
        (92.0, 62.0),
        (50.0, 46.1),
        (8.0, 62.0),
        (0.0, 62.0),
    ]
    shell_mask = antialiased_polygon(shell_region)
    shell_alpha = Image.composite(master.getchannel("A"), Image.new("L", CANVAS, 0), shell_mask)
    shell = master.copy()
    shell.putalpha(shell_alpha)
    shell.save(output_dir / "placeholder-cafe-shell-v06-redesign.png", optimize=True)

    edge_color = (91, 47, 29, 255)
    for day, tip in enumerate(DAY_TIPS, start=1):
        shoulder_y = tip - 5.0
        polygon = [
            *FLOOR_BACK,
            (FLOOR_SHOULDERS_X[1], shoulder_y),
            (50.0, tip),
            (FLOOR_SHOULDERS_X[0], shoulder_y),
        ]
        mask = antialiased_polygon(polygon)
        alpha = Image.composite(master.getchannel("A"), Image.new("L", CANVAS, 0), mask)
        layer = master.copy()
        layer.putalpha(alpha)

        # Pixel-art trim belongs to each daily layer, so the visible edge is
        # intentional and never a browser clip-path or a leftover white fringe.
        trim = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
        trim_draw = ImageDraw.Draw(trim)
        trim_draw.line(
            [pct_point(point) for point in polygon[2:]] + [pct_point(polygon[0])],
            fill=edge_color,
            width=5,
            joint="curve",
        )
        trim.putalpha(Image.composite(trim.getchannel("A"), Image.new("L", CANVAS, 0), mask.filter(ImageFilter.MaxFilter(7))))
        layer = Image.alpha_composite(layer, trim)
        layer.save(output_dir / f"placeholder-cafe-floor-v06-day-{day}.png", optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("master", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()
    build(args.master, args.output_dir)


if __name__ == "__main__":
    main()
