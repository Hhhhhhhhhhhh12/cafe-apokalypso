#!/usr/bin/env python3
"""
Download Pixellab south-view URLs, apply PIL bg-removal, and save to assets/sprites/props/.
"""
import urllib.request, io, sys
from PIL import Image

SPRITES = [
    # (url, output_path, description)
    (
        "https://backblaze.pixellab.ai/file/pixellab-characters/eab24377-2e26-4399-ae37-e0d1e84bcd0f/4417ebf6-cd25-4cf2-b307-3bc5db2edfd5/rotations/south.png",
        "/Users/Heineken/Code/cafe-apokalypso/assets/sprites/props/placeholder-cafe-clock-t2.png",
        "clock-t2 (ornate grandfather clock)"
    ),
    (
        "https://backblaze.pixellab.ai/file/pixellab-characters/eab24377-2e26-4399-ae37-e0d1e84bcd0f/cd00de24-5fc6-435a-b0ad-c4c5936aaa48/rotations/south.png",
        "/Users/Heineken/Code/cafe-apokalypso/assets/sprites/props/placeholder-cafe-clock-t3.png",
        "clock-t3 (antique grandfather clock)"
    ),
    (
        "https://backblaze.pixellab.ai/file/pixellab-characters/eab24377-2e26-4399-ae37-e0d1e84bcd0f/c064fcc0-61c3-42c2-88bf-e8bfb7bd6b48/rotations/south.png",
        "/Users/Heineken/Code/cafe-apokalypso/assets/sprites/props/placeholder-cafe-lamp.png",
        "lamp-t1 (simple dark pendant)"
    ),
    (
        "https://backblaze.pixellab.ai/file/pixellab-characters/eab24377-2e26-4399-ae37-e0d1e84bcd0f/64f95d6b-8663-4bc0-8aa1-395a7a0c92f1/rotations/south.png",
        "/Users/Heineken/Code/cafe-apokalypso/assets/sprites/props/placeholder-cafe-lamp-t2.png",
        "lamp-t2 (amber pendant)"
    ),
    (
        "https://backblaze.pixellab.ai/file/pixellab-characters/eab24377-2e26-4399-ae37-e0d1e84bcd0f/ef38ffb2-74dc-45d1-b53d-f43341ebd664/rotations/south.png",
        "/Users/Heineken/Code/cafe-apokalypso/assets/sprites/props/placeholder-cafe-lamp-t3.png",
        "lamp-t3 (gold brass globe pendant)"
    ),
]

def remove_bg(img):
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
    return img

def edge_report(img):
    w, h = img.size
    import struct
    data = list(img.getdata())
    def col_alpha(cx):
        return sum(1 for i in range(h) if data[i * w + cx][3] > 40)
    def row_alpha(ry):
        return sum(1 for i in range(w) if data[ry * w + i][3] > 40)
    return {
        "left": col_alpha(0), "right": col_alpha(w - 1),
        "top": row_alpha(0), "bottom": row_alpha(h - 1)
    }

for url, out_path, desc in SPRITES:
    print(f"\nProcessing: {desc}")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as r:
            data = r.read()
        img = Image.open(io.BytesIO(data))
        print(f"  Raw: {img.size} {img.mode}")
        img = remove_bg(img)
        img.save(out_path)
        edges = edge_report(img)
        print(f"  Saved {out_path}. Edge alpha>40: {edges}")
    except Exception as e:
        print(f"  ERROR: {e}", file=sys.stderr)
