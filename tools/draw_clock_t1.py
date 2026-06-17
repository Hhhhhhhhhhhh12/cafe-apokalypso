#!/usr/bin/env python3
"""
Hand-draw a simple pixel-art wall clock for cafe-clock-t1.
64x64 canvas, transparent background, warm brown/cream palette matching cafe aesthetic.
"""
from PIL import Image, ImageDraw
import math

W, H = 64, 64
img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# Colors
DARK_BROWN  = (80,  50,  25,  255)   # outer frame
MID_BROWN   = (120, 80,  40,  255)   # frame face
WARM_CREAM  = (245, 235, 210, 255)   # clock dial
DARK_HAND   = (40,  30,  20,  255)   # hands / numerals
BLACK_OUT   = (20,  15,  10,  255)   # outline

cx, cy = 32, 34   # center of clock face (shifted down slightly)
R_OUTER  = 18     # outer frame radius
R_FRAME  = 16     # inner frame edge
R_DIAL   = 14     # cream dial radius
R_TICK   = 12     # tick mark inner radius

# Draw outer frame (dark brown circle)
for y in range(cy - R_OUTER - 1, cy + R_OUTER + 2):
    for x in range(cx - R_OUTER - 1, cx + R_OUTER + 2):
        dist = math.sqrt((x - cx)**2 + (y - cy)**2)
        if dist <= R_OUTER + 0.5:
            img.putpixel((x, y), BLACK_OUT)

# Frame fill (mid brown)
for y in range(cy - R_OUTER, cy + R_OUTER + 1):
    for x in range(cx - R_OUTER, cx + R_OUTER + 1):
        dist = math.sqrt((x - cx)**2 + (y - cy)**2)
        if dist <= R_FRAME:
            img.putpixel((x, y), MID_BROWN)

# Dial fill (cream)
for y in range(cy - R_DIAL, cy + R_DIAL + 1):
    for x in range(cx - R_DIAL, cx + R_DIAL + 1):
        dist = math.sqrt((x - cx)**2 + (y - cy)**2)
        if dist <= R_DIAL:
            img.putpixel((x, y), WARM_CREAM)

# Hour tick marks at 12, 3, 6, 9
for angle_deg in [0, 90, 180, 270]:
    angle = math.radians(angle_deg - 90)
    x1 = int(cx + R_TICK * math.cos(angle))
    y1 = int(cy + R_TICK * math.sin(angle))
    x2 = int(cx + (R_DIAL - 1) * math.cos(angle))
    y2 = int(cy + (R_DIAL - 1) * math.sin(angle))
    d.line([(x1, y1), (x2, y2)], fill=DARK_HAND, width=1)

# Minute marks at remaining hours
for hour in range(12):
    if hour % 3 == 0:
        continue
    angle = math.radians(hour * 30 - 90)
    x1 = int(cx + (R_TICK + 1) * math.cos(angle))
    y1 = int(cy + (R_TICK + 1) * math.sin(angle))
    x2 = int(cx + (R_DIAL - 1) * math.cos(angle))
    y2 = int(cy + (R_DIAL - 1) * math.sin(angle))
    d.line([(x1, y1), (x2, y2)], fill=DARK_HAND, width=1)

# Hour hand (pointing to ~10 o'clock)
hour_angle = math.radians(10 * 30 - 90)
hx = int(cx + 6 * math.cos(hour_angle))
hy = int(cy + 6 * math.sin(hour_angle))
d.line([(cx, cy), (hx, hy)], fill=DARK_HAND, width=2)

# Minute hand (pointing to ~2 o'clock)
min_angle = math.radians(2 * 30 - 90)
mx = int(cx + 10 * math.cos(min_angle))
my = int(cy + 10 * math.sin(min_angle))
d.line([(cx, cy), (mx, my)], fill=DARK_HAND, width=1)

# Center dot
img.putpixel((cx, cy), DARK_HAND)
img.putpixel((cx+1, cy), DARK_HAND)
img.putpixel((cx, cy+1), DARK_HAND)

# Wall mounting bracket at top (small dark tab)
for px in range(cx - 2, cx + 3):
    for py in range(cy - R_OUTER - 4, cy - R_OUTER + 1):
        dist_from_top_center = abs(px - cx)
        if dist_from_top_center <= 2:
            img.putpixel((px, py), DARK_BROWN)

output = "/Users/Heineken/Code/cafe-apokalypso/assets/sprites/props/placeholder-cafe-clock.png"
img.save(output)

# Report edge artifacts
arr = list(img.getdata())
w, h = W, H
def col_alpha(cx2):
    return sum(1 for i in range(h) if arr[i * w + cx2][3] > 40)
def row_alpha(ry):
    return sum(1 for i in range(w) if arr[ry * w + i][3] > 40)
edges = {
    "left": col_alpha(0), "right": col_alpha(w - 1),
    "top": row_alpha(0), "bottom": row_alpha(h - 1)
}
print(f"Saved {output} (64x64). Edge alpha>40 counts: {edges}")
