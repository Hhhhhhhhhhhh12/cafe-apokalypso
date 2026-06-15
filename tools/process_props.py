#!/usr/bin/env python3
"""Download and clean up Pixellab-generated prop sprites.
Usage: python3 tools/process_props.py
"""
import urllib.request
import os
import sys
import numpy as np
from PIL import Image

PROPS_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'sprites', 'props')


def remove_bg(path: str) -> tuple[int, int]:
    img = Image.open(path).convert('RGBA')
    data = np.array(img, dtype=float)
    r, g, b, a = data[..., 0], data[..., 1], data[..., 2], data[..., 3]
    mx = np.maximum.reduce([r, g, b])
    mn = np.minimum.reduce([r, g, b])
    sat = np.where(mx > 0, (mx - mn) / mx, 0)
    mask = (r > 200) & (g > 200) & (b > 200) & (sat < 0.25)
    data[..., 3] = np.where(mask, 0, a)
    result = data.astype(np.uint8)
    Image.fromarray(result).save(path)
    return result.shape[1], result.shape[0]  # width, height


def check_edges(path: str) -> dict:
    img = Image.open(path).convert('RGBA')
    data = np.array(img)
    a = data[..., 3]
    h, w = a.shape
    return {
        'left_col': int((a[:, 0] > 40).sum()),
        'right_col': int((a[:, -1] > 40).sum()),
        'top_row': int((a[0, :] > 40).sum()),
        'bottom_row': int((a[-1, :] > 40).sum()),
    }


def download_and_clean(url: str, dest_filename: str) -> tuple[int, int]:
    dest = os.path.join(PROPS_DIR, dest_filename)
    print(f"  Downloading {dest_filename} ...")
    urllib.request.urlretrieve(url, dest)
    w, h = remove_bg(dest)
    edges = check_edges(dest)
    print(f"  Saved {dest} ({w}x{h}px)")
    print(f"  Edge artefact counts: {edges}")
    # Warn if significant edge artefacts
    for side, count in edges.items():
        if count > 3:
            print(f"  WARNING: {side} has {count} non-transparent pixels — may have artefacts")
    return w, h


# Mapping: (character_id, south_url) -> filename
# Fill these in after get_character returns completed status
JOBS = [
    # (character_id, filename) — URLs fetched at runtime
]


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 tools/process_props.py <url> <filename>")
        print("  e.g.: python3 tools/process_props.py https://... placeholder-cafe-clock.png")
        sys.exit(1)
    url = sys.argv[1]
    filename = sys.argv[2]
    w, h = download_and_clean(url, filename)
    print(f"Done: {filename} {w}x{h}px")
