#!/usr/bin/env python3
"""Sit the blog covers on paper instead of pure white.

The covers were generated on #FFFFFF. The page ground is #FBFAF7 and the
illustrations are near-greyscale already (measured avg saturation 0.041),
so what read as "colourful" was not the ink at all — it was fifty cold
white rectangles glowing against warm paper. Every card looked like a
foreign object pasted onto the page.

Two passes, both hue-preserving:

  1. Near-white pixels are remapped onto the paper white point. The mapping
     is proportional to how white the pixel already is, so a light grey wash
     inside the drawing is nudged, not flattened — a hard threshold would
     have carved a visible edge where the wash met the ground.

  2. Remaining saturation is pulled toward moss and damped. The greens in
     these illustrations are already quiet; they just aren't OUR green.

Deliberately NOT a global filter: a sepia/tint over the whole frame would
also tint the near-black ink lines, which are correct as they are.
"""
import glob, os, sys
from PIL import Image
import colorsys

PAPER = (0xFB, 0xFA, 0xF7)
MOSS_H = colorsys.rgb_to_hsv(0x5B / 255, 0x70 / 255, 0x52 / 255)[0]

WHITE_FLOOR = 0.86   # below this the pixel is drawing, not ground
SAT_CEIL = 0.10      # ground is unsaturated; a saturated light pixel is paint
HUE_PULL = 0.55      # how far a colour moves toward moss
SAT_DAMP = 0.72      # how much of its own saturation it keeps


def convert(path: str) -> tuple[float, float]:
    im = Image.open(path).convert("RGB")
    px = im.load()
    w, h = im.size
    moved = 0
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            hh, ss, vv = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)

            # 1 — ground: remap the white point toward paper.
            if vv >= WHITE_FLOOR and ss <= SAT_CEIL:
                # t is 0 at the floor and 1 at pure white, so the shift fades
                # out smoothly into the drawing instead of stepping.
                t = (vv - WHITE_FLOOR) / (1 - WHITE_FLOOR)
                px[x, y] = (
                    round(r + (PAPER[0] - 255) * t),
                    round(g + (PAPER[1] - 255) * t),
                    round(b + (PAPER[2] - 255) * t),
                )
                moved += 1
                continue

            # 2 — paint: steer the hue toward moss and quieten it.
            if ss > SAT_CEIL:
                d = MOSS_H - hh
                if d > 0.5:
                    d -= 1.0
                elif d < -0.5:
                    d += 1.0
                nh = (hh + d * HUE_PULL) % 1.0
                nr, ng, nb = colorsys.hsv_to_rgb(nh, ss * SAT_DAMP, vv)
                px[x, y] = (round(nr * 255), round(ng * 255), round(nb * 255))
                moved += 1
    im.save(path, "JPEG", quality=88, optimize=True)
    return moved / (w * h) * 100, os.path.getsize(path) / 1024


if __name__ == "__main__":
    files = sys.argv[1:] or sorted(glob.glob("public/blog/*/*"))
    for f in files:
        pct, kb = convert(f)
        print(f"{os.path.basename(os.path.dirname(f))[:44]:46} touched={pct:5.1f}%  {kb:6.1f}KB")
