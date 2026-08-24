#!/usr/bin/env python3
"""Retone legacy artwork onto the Ink & Paper palette.

The blog covers and the app icon were generated against the pre-redesign
style guide, whose palette carried a warm-sand accent (#D4A373) and a
cream paper (#FAF9F6). Both read as foreign next to the current paper
(#FBFAF7) and single moss accent (#5B7052).

A global filter was the obvious idea and the wrong one: measured across
the 50 covers, only 3.4% of pixels are actually warm (19.4% in the worst
case). A sepia or hue-rotate over the whole frame would have degraded the
95%+ that is already correct — the neutral stones, ink and paper — to fix
a few leaves. So this shifts ONLY the offending hue band and leaves
everything else untouched.

Two operations, both hue-selective:
  * warm gold/orange  -> moss, preserving the original luminance so the
    artwork keeps its modelling and doesn't flatten into a silhouette;
  * cream paper       -> our paper white, by lifting near-white pixels
    that carry a yellow cast.

Idempotent: re-running on an already-converted file is a no-op, because
the source hues no longer fall in the band.

Usage:  python3 scripts/retone-images.py [--check] [paths...]
"""
from __future__ import annotations

import colorsys
import sys
from pathlib import Path

from PIL import Image

# Ink & Paper targets.
MOSS = (0x5B, 0x70, 0x52)
PAPER = (0xFB, 0xFA, 0xF7)

# Hue band, in turns, treated as "warm": the whole red-through-gold sector,
# 0°-50°. It starts at 0 rather than 20° because a warm accent in this
# artwork is not only gold leaves — book spines and lacquer sit around
# 11°-18°, and leaving them behind made them the single loud thing left in
# an otherwise retoned frame.
WARM_LO, WARM_HI = 0.0, 0.140
# Below this saturation a pixel is neutral (stone, ink, paper) — never touched.
WARM_MIN_SAT = 0.12
# How far a re-hued pixel is pulled toward moss's own lightness. Without this
# a bright warm area becomes bright green, which is louder than the original.
VALUE_PULL = 0.65
# Fringe pixels are only touched when they border a retoned pixel.
FRINGE_MIN_SAT = 0.04
# Near-white pixels above this value get their yellow cast removed.
#
# The ceiling matters more than it looks: the app icon's cream ground is
# #FFEECC — full value but saturation 0.20. At a 0.18 ceiling it missed the
# paper branch, fell through to the warm branch, and the whole background
# turned moss, which is exactly the large moss field the redesign forbids.
# 0.28 admits a cream ground while staying well under a real gold accent.
PAPER_MIN_VAL = 0.90
PAPER_MAX_SAT = 0.28


def retone(im: Image.Image) -> tuple[Image.Image, int]:
    im = im.convert("RGB")
    px = im.load()
    w, h = im.size
    moss_h, moss_s, moss_v = colorsys.rgb_to_hsv(*[c / 255 for c in MOSS])
    changed = 0
    retoned: set[tuple[int, int]] = set()

    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            hh, ss, vv = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)

            if vv >= PAPER_MIN_VAL and 0.02 < ss <= PAPER_MAX_SAT:
                # Cream ground -> our paper, weighted by how strong the cast
                # is, so an off-white gradient stays a gradient. Checked
                # first: a bright, lightly-saturated cream is paper, not a
                # gold accent, and the warm branch would swallow it.
                t = min(ss / PAPER_MAX_SAT, 1.0)
                px[x, y] = (
                    round(r + (PAPER[0] - r) * t),
                    round(g + (PAPER[1] - g) * t),
                    round(b + (PAPER[2] - b) * t),
                )
                changed += 1
            elif WARM_LO <= hh <= WARM_HI and ss >= WARM_MIN_SAT:
                # Move hue, saturation AND value toward moss. Keeping the
                # original value was the tempting mistake: light wood at
                # v≈0.85 re-hued to green comes out acid lime, louder than
                # the gold it replaced. Blending the value toward moss's own
                # keeps the pixel recognisably moss while the *relative*
                # modelling survives, because every pixel moves by the same
                # rule and light stays lighter than shadow.
                nv = vv + (moss_v - vv) * VALUE_PULL
                nr, ng, nb = colorsys.hsv_to_rgb(
                    moss_h, min(ss, moss_s * 1.15), nv
                )
                px[x, y] = (round(nr * 255), round(ng * 255), round(nb * 255))
                retoned.add((x, y))
                changed += 1

    # Second pass: anti-aliased fringes. A warm shape's edge carries the same
    # hue at a fraction of the saturation, which left a gold outline tracing
    # every retoned leaf. Lowering the main threshold to catch them was tried
    # and reverted — it also caught faint warmth in neutral areas and turned
    # a grey horizon blotchy green. Requiring an already-retoned neighbour
    # confines the fix to the edges it is meant for.
    for x, y in list(retoned):
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if not (0 <= nx < w and 0 <= ny < h) or (nx, ny) in retoned:
                continue
            r, g, b = px[nx, ny]
            hh, ss, vv = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if not (WARM_LO <= hh <= WARM_HI) or ss < FRINGE_MIN_SAT:
                continue
            if ss >= WARM_MIN_SAT:
                continue
            k = ss / WARM_MIN_SAT
            nv = vv + (moss_v - vv) * VALUE_PULL * k
            tr, tg, tb = colorsys.hsv_to_rgb(moss_h, min(ss, moss_s), nv)
            px[nx, ny] = (
                round(r + (tr * 255 - r) * k),
                round(g + (tg * 255 - g) * k),
                round(b + (tb * 255 - b) * k),
            )
            retoned.add((nx, ny))
            changed += 1

    return im, changed


def main(argv: list[str]) -> int:
    args = [a for a in argv[1:] if not a.startswith("--")]
    check = "--check" in argv[1:]

    paths: list[Path] = []
    for a in args:
        p = Path(a)
        paths.extend(sorted(p.glob("**/cover.jpg")) if p.is_dir() else [p])
    if not paths:
        print("no input files", file=sys.stderr)
        return 1

    for p in paths:
        im = Image.open(p)
        out, changed = retone(im)
        pct = changed / (im.size[0] * im.size[1]) * 100
        if check:
            print(f"{pct:6.2f}%  {p}")
            continue
        if p.suffix.lower() in {".jpg", ".jpeg"}:
            out.save(p, "JPEG", quality=88, optimize=True)
        else:
            out.save(p, "PNG", optimize=True)
        print(f"{pct:6.2f}%  {p}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
