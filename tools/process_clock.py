#!/usr/bin/env python3
"""Remove bright near-white background pixels from a prop sprite and check edges."""
import sys
from pathlib import Path
from PIL import Image

def process(src: Path, dst: Path):
    img = Image.open(src).convert("RGBA")
    pixels = img.load()
    w, h = img.size

    removed = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            # Bright near-white with low saturation -> transparent
            if r > 200 and g > 200 and b > 200:
                max_c = max(r, g, b)
                min_c = min(r, g, b)
                sat = (max_c - min_c) / max_c if max_c > 0 else 0
                if sat < 0.25:
                    pixels[x, y] = (r, g, b, 0)
                    removed += 1

    img.save(dst)
    print(f"Saved {dst} ({w}x{h}), removed {removed} bg pixels")

    # Edge artifact check
    for label, cols in [("left", range(3)), ("right", range(w-3, w))]:
        count = sum(1 for x in cols for y in range(h) if img.getpixel((x, y))[3] > 40)
        print(f"  {label} edge alpha>40 count: {count}")
    for label, rows in [("top", range(3)), ("bottom", range(h-3, h))]:
        count = sum(1 for y in rows for x in range(w) if img.getpixel((x, y))[3] > 40)
        print(f"  {label} edge alpha>40 count: {count}")

if __name__ == "__main__":
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    process(src, dst)
