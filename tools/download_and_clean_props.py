#!/usr/bin/env python3
"""
Download pixel-art prop sprites from Pixellab URLs and apply PIL bg-removal pipeline.
Usage: python3 tools/download_and_clean_props.py <url> <output_path>
"""
import sys
import urllib.request
from PIL import Image
import io

def remove_bg_and_save(img: Image.Image, output_path: str) -> None:
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r > 200 and g > 200 and b > 200:
                sat = (max(r, g, b) - min(r, g, b)) / max(r, g, b) if max(r, g, b) > 0 else 0
                if sat < 0.25:
                    pixels[x, y] = (r, g, b, 0)

    img.save(output_path)
    arr = list(img.getdata())
    def col_alpha(cx):
        return sum(1 for i in range(h) if arr[i * w + cx][3] > 40)
    def row_alpha(ry):
        return sum(1 for i in range(w) if arr[ry * w + i][3] > 40)
    edges = {
        "left": col_alpha(0), "right": col_alpha(w - 1),
        "top": row_alpha(0), "bottom": row_alpha(h - 1)
    }
    print(f"  Saved {output_path} ({w}x{h}). Edge alpha>40 counts: {edges}")

if __name__ == "__main__":
    url = sys.argv[1]
    output_path = sys.argv[2]
    # Use south direction URL (front-facing side view)
    print(f"  Downloading {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        data = resp.read()
    img = Image.open(io.BytesIO(data))
    print(f"  Raw image: {img.size}, mode={img.mode}")
    remove_bg_and_save(img, output_path)
