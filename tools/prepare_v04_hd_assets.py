#!/usr/bin/env python3
"""Prepare generated v04-style café art for the layered game scene."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
BACKGROUND_DIR = ROOT / "assets" / "backgrounds"
PROP_DIR = ROOT / "assets" / "sprites" / "props"
STAGE_SIZE = (1672, 941)
FLOOR_POLYGON = ((99, 676), (836, 493), (1573, 683), (836, 940))


def exterior_alpha(image: Image.Image) -> Image.Image:
    """Remove the neutral checkerboard connected to the canvas edge."""
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    exterior = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def is_backdrop(x: int, y: int) -> bool:
        red, green, blue, _ = pixels[x, y]
        return min(red, green, blue) >= 215 and max(red, green, blue) - min(red, green, blue) <= 14

    def add(x: int, y: int) -> None:
        offset = y * width + x
        if not exterior[offset] and is_backdrop(x, y):
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


def split_stage(source: Path) -> None:
    full = exterior_alpha(Image.open(source)).resize(STAGE_SIZE, Image.Resampling.LANCZOS)
    alpha = full.getchannel("A")

    scale = 4
    mask_large = Image.new("L", (STAGE_SIZE[0] * scale, STAGE_SIZE[1] * scale), 0)
    ImageDraw.Draw(mask_large).polygon(
        [(x * scale, y * scale) for x, y in FLOOR_POLYGON], fill=255
    )
    floor_mask = mask_large.resize(STAGE_SIZE, Image.Resampling.LANCZOS).filter(ImageFilter.MaxFilter(15))

    floor = full.copy()
    floor.putalpha(Image.composite(alpha, Image.new("L", STAGE_SIZE, 0), floor_mask))
    shell = full.copy()
    shell.putalpha(Image.composite(Image.new("L", STAGE_SIZE, 0), alpha, floor_mask))

    full.save(BACKGROUND_DIR / "placeholder-cafe-stage-base-v04-clean-hd.png", optimize=True)
    floor.save(BACKGROUND_DIR / "placeholder-cafe-floor-v04-clean-hd.png", optimize=True)
    shell.save(BACKGROUND_DIR / "placeholder-cafe-shell-v04-clean-hd.png", optimize=True)


def prepare_prop(source: Path, destination: Path, target_width: int) -> None:
    image = Image.open(source).convert("RGBA")
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        raise ValueError(f"No visible pixels in {source}")
    image = image.crop(bbox)
    pad = max(8, round(max(image.size) * 0.035))
    padded = Image.new("RGBA", (image.width + 2 * pad, image.height + 2 * pad), (0, 0, 0, 0))
    padded.alpha_composite(image, (pad, pad))
    target_height = round(padded.height * target_width / padded.width)
    padded.resize((target_width, target_height), Image.Resampling.LANCZOS).save(destination, optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("background", type=Path)
    parser.add_argument("counter", type=Path)
    parser.add_argument("shelf", type=Path)
    parser.add_argument("machine", type=Path)
    parser.add_argument("register", type=Path)
    args = parser.parse_args()

    split_stage(args.background)
    prepare_prop(args.counter, PROP_DIR / "placeholder-cafe-counter-v04-hd.png", 1024)
    prepare_prop(args.shelf, PROP_DIR / "placeholder-cafe-shelf-v04-hd.png", 1024)
    prepare_prop(args.machine, PROP_DIR / "placeholder-cafe-coffee-machine-v04-hd.png", 768)
    prepare_prop(args.register, PROP_DIR / "placeholder-kassandra-register-v04-hd.png", 640)


if __name__ == "__main__":
    main()
