"""Remove only near-transparent generator haze from the approval sprite."""
import sys
from PIL import Image

source, destination = sys.argv[1:]
image = Image.open(source).convert("RGBA")
alpha = image.getchannel("A")
image.putalpha(alpha.point(lambda value: 0 if value <= 40 else value))
image.save(destination)
print(image.size, image.getchannel("A").getbbox())
