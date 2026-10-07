#!/usr/bin/env python3
"""Prepare iPhone screenshots for the home page gallery.

Usage:
    python3 scripts/app-screens.py <name>=<screenshot.png> [...]

Each screenshot is cropped and written to public/screens/<name>.webp
(660 px wide, 2x of the 330 px frame) and <name>-sm.webp (440 px).

The crop removes the iOS status bar (clock, signal, battery) and the
Dynamic Island band above the app's own header, and the empty home
indicator band under the tab bar. Without them the frame reads as the
app, not as one particular phone. The rows are measured on a 1320x2868
iPhone Pro Max capture: the status bar ends at y=125 and the app header
starts at y=240, the tab bar ends at y=2740. Other sizes are scaled.
"""
import os, sys
from PIL import Image

REF_W, REF_H = 1320, 2868
CROP_TOP, CROP_BOTTOM = 180, 2790
SIZES = {'': 660, '-sm': 440}
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'screens')


def prepare(name, path):
    im = Image.open(path).convert('RGB')
    w, h = im.size
    top = round(CROP_TOP * h / REF_H)
    bottom = round(CROP_BOTTOM * h / REF_H)
    im = im.crop((0, top, w, bottom))
    for suffix, width in SIZES.items():
        height = round(im.height * width / im.width)
        out = os.path.join(OUT, f'{name}{suffix}.webp')
        im.resize((width, height), Image.LANCZOS).save(out, 'WEBP', quality=82, method=6)
        print(out, f'{width}x{height}')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    os.makedirs(OUT, exist_ok=True)
    for arg in sys.argv[1:]:
        name, path = arg.split('=', 1)
        prepare(name, path)
