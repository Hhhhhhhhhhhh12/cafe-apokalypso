#!/usr/bin/env python3
"""Build seven precomposited daily café stages from one room master."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter


CANVAS = (1672, 941)
TOP_SAFE_MARGIN = 4
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
    master_destination = output_dir / "placeholder-cafe-master-v06-redesign.png"
    if master_path.resolve() != master_destination.resolve():
        master.save(master_destination, optimize=True)

    # Each day is exported as one finished stage. Walls and floor therefore
    # share one alpha map and can never drift apart during browser scaling.
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

    edge_color = (91, 47, 29, 255)
    for day, tip in enumerate(DAY_TIPS, start=1):
        shoulder_y = tip - 5.0
        polygon = [
            *FLOOR_BACK,
            (FLOOR_SHOULDERS_X[1], shoulder_y),
            (50.0, tip),
            (FLOOR_SHOULDERS_X[0], shoulder_y),
        ]
        floor_mask = antialiased_polygon(polygon)
        stage_mask = ImageChops.lighter(shell_mask, floor_mask)
        stage_alpha = ImageChops.multiply(master.getchannel("A"), stage_mask)
        stage = master.copy()
        stage.putalpha(stage_alpha)

        # Pixel-art trim belongs to each daily layer, so the visible edge is
        # intentional and never a browser clip-path or a leftover white fringe.
        trim = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
        trim_draw = ImageDraw.Draw(trim)
        trim_draw.line(
            [pct_point(point) for point in polygon[2:]] + [pct_point(polygon[0])],
            fill=edge_color,
            width=3,
            joint="curve",
        )
        stage = Image.alpha_composite(stage, trim)

        # Keep even the roof tip off the file edge. Four source pixels become
        # roughly two CSS pixels in the landscape viewport: enough to avoid a
        # clipped silhouette without visibly shifting the room geometry.
        framed_stage = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
        framed_stage.alpha_composite(stage, dest=(0, TOP_SAFE_MARGIN))
        framed_stage.save(output_dir / f"placeholder-cafe-stage-v07-day-{day}.png", optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("master", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()
    build(args.master, args.output_dir)


if __name__ == "__main__":
    main()
