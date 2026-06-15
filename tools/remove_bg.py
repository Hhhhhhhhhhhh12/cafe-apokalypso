#!/usr/bin/env python3
"""
Remove white/light backgrounds from pixel-art sprites.
Helle Pixel (r,g,b > 200) mit Sättigung (max−min)/max < 0.25 → alpha 0.
Usage: python3 tools/remove_bg.py input.png output.png [--top N] [--bottom N]
"""
import sys
from PIL import Image

def remove_bg(input_path: str, output_path: str, top_rows: int = 0, bottom_rows: int = 0) -> None:
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    w, h = img.size

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r > 200 and g > 200 and b > 200:
                sat = (max(r, g, b) - min(r, g, b)) / max(r, g, b) if max(r, g, b) > 0 else 0
                if sat < 0.25:
                    pixels[x, y] = (r, g, b, 0)

    # Additional mask for specified row ranges (e.g. stand disk below feet)
    if top_rows > 0:
        for y in range(top_rows):
            for x in range(w):
                pixels[x, y] = (0, 0, 0, 0)
    if bottom_rows > 0:
        for y in range(h - bottom_rows, h):
            for x in range(w):
                pixels[x, y] = (0, 0, 0, 0)

    img.save(output_path)
    # Artifact check: count edge columns/rows with alpha > 40
    arr = list(img.getdata())
    def col_alpha(cx):
        return sum(1 for i in range(h) if arr[i * w + cx][3] > 40)
    def row_alpha(ry):
        return sum(1 for i in range(w) if arr[ry * w + i][3] > 40)
    edges = {
        "left_col": col_alpha(0), "right_col": col_alpha(w - 1),
        "top_row": row_alpha(0), "bottom_row": row_alpha(h - 1)
    }
    print(f"Saved {output_path} ({w}×{h}). Edge pixel counts (alpha>40): {edges}")

if __name__ == "__main__":
    args = sys.argv[1:]
    top = int(args[args.index("--top") + 1]) if "--top" in args else 0
    bottom = int(args[args.index("--bottom") + 1]) if "--bottom" in args else 0
    paths = [a for a in args if not a.startswith("--") and not a.lstrip("-").isdigit()]
    remove_bg(paths[0], paths[1], top, bottom)
