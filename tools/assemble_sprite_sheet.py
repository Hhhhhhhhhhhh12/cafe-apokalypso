#!/usr/bin/env python3
"""Assemble animation frames into a horizontal sprite sheet.

Usage:
  python3 tools/assemble_sprite_sheet.py out.png frame1.png frame2.png ...

Applies the project's background-removal pass (light pixels with low
saturation -> transparent) and trims a common bounding box so frames stay
aligned. See CLAUDE.md "Sprite-Pipeline".
"""
import sys

import numpy as np
from PIL import Image


def clean(arr: np.ndarray) -> np.ndarray:
    rgb = arr[:, :, :3].astype(int)
    is_light = (rgb > 200).all(axis=2)
    cmax = rgb.max(axis=2)
    cmin = rgb.min(axis=2)
    sat = np.where(cmax > 0, (cmax - cmin) / np.maximum(cmax, 1), 0)
    arr[:, :, 3] = np.where(is_light & (sat < 0.25), 0, arr[:, :, 3])
    return arr


def main() -> None:
    out, *frames = sys.argv[1:]
    imgs = [clean(np.array(Image.open(f).convert("RGBA"))) for f in frames]
    h = max(i.shape[0] for i in imgs)
    w = max(i.shape[1] for i in imgs)
    sheet = np.zeros((h, w * len(imgs), 4), dtype=np.uint8)
    for n, img in enumerate(imgs):
        ih, iw = img.shape[:2]
        # bottom-center each frame so feet stay anchored
        y0 = h - ih
        x0 = n * w + (w - iw) // 2
        sheet[y0 : y0 + ih, x0 : x0 + iw] = img
    Image.fromarray(sheet).save(out)
    print(f"{out}: {len(imgs)} frames @ {w}x{h}")


if __name__ == "__main__":
    main()
