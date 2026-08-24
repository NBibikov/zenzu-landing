# Zenzu Blog — Visual Style Guide

## Philosophy

Every blog image is a quiet moment in a Japanese garden. No clutter, no noise — a single clear metaphor rendered in the Zenzu Zen Bonsai aesthetic.

---

## Color Palette (locked)

| Token | Name | Hex |
|-------|------|-----|
| Primary | Moss Green | `#5B7052` |
| Background | Paper | `#FBFAF7` |
| Surface | Paper 2 | `#F5F3EC` |
| Hairline | Hairline | `#E9E5DC` |
| Stone | River Stone | `#8B8678` |
| Dark | Ink | `#1C1B18` |

These six values are the only colors that appear in blog images. No other hues.

**Moss is the only accent.** The palette used to carry a Warm Sand accent
(`#D4A373`) alongside a cream paper (`#FAF9F6`), which is why the first 50
covers came back with gold leaves and red book spines. Those are retoned by
`scripts/retone-images.py`; new images must not reintroduce a warm hue. In
particular there is **no orange, gold, amber or autumn** anywhere in a Zenzu
image — if a scene wants seasonal colour, it gets moss at a different value.

---

## Image Style — Fixed Suffix

Every generated image appends this suffix verbatim:

```
Soft watercolor vector hybrid illustration. No text, no people, no devices, no UI.
Color palette: moss green #5B7052, paper white #FBFAF7, pale sand #F5F3EC,
river stone grey #8B8678, ink #1C1B18. Background is near-white paper.
Absolutely no orange, gold, amber, ochre, autumn or warm-yellow tones anywhere.
Wabi-sabi Japanese zen aesthetic. Single dominant element, generous white space,
organic shapes, subtle rice-paper texture. 16:9 landscape blog cover.
Studio Ghibli warmth meets Headspace minimalism.
```

### Always run `scripts/paper-covers.py` on a new cover

The prompt above asks for a #FBFAF7 ground and the generator ignores it —
every one of the first fifty covers came back on pure #FFFFFF. On the page
(#FBFAF7) that reads as fifty cold white rectangles pasted onto warm paper,
which is what made the blog index look "colourful" even though the
illustrations measured an average saturation of 0.041 — all but greyscale.

So the retone is a required step, not a repair:

```bash
python3 scripts/paper-covers.py public/blog/<slug>/cover.jpg
```

It remaps the near-white ground onto the paper white point (proportionally,
so a light wash inside the drawing is nudged rather than flattened — a hard
threshold carved a visible edge where wash met ground) and pulls the
remaining saturation toward moss. It deliberately does NOT tint the frame
globally: that would also tint the near-black ink lines, which are correct.

Covers whose illustration runs to the edge of the frame (bamboo, foliage)
have no ground to remap and are left as they are.

---

## Scene Composition Rules

1. **One dominant element** — the scene has a clear focal point, not a collection
2. **Generous negative space** — at least 40% of the canvas is background (rice paper / raked sand)
3. **No symmetry** — off-centre placement, following Japanese asymmetry principle
4. **Ground line** — most scenes have a subtle horizon: raked sand below, open sky above
5. **Scale contrast** — one large element + one or two small accents (stone, leaf, droplet)

---

## Topic → Zen Element Mapping

Claude uses this mapping to choose the scene. Pick the closest match; combine only if natural.

| Topic category | Zen element | Why |
|----------------|-------------|-----|
| Memory / retention | Moss-covered stone | Slow accumulation, permanence, depth |
| Vocabulary / words | Green leaves drifting, each unique | Many distinct items, natural variety |
| Consistency / streak | Stepping stones across still water | Regular steps, a path forward |
| Motivation / mindset | Single bonsai in dawn mist | Growth, patience, morning freshness |
| Speaking / pronunciation | Bamboo wind chimes, concentric water rings | Sound made visible, resonance |
| Listening / audio | Water droplet mid-fall above a still pond | Sound before it arrives, anticipation |
| Reading / books | Unfurled rice paper scroll, ink brushed marks | Ancient learning, deliberate marks |
| Grammar / structure | Ikebana arrangement — deliberate, minimal | Structure through intentional placement |
| Methods / technique | Zen rake tracing deliberate arcs in sand | Technique made visible, focused practice |
| Immersion / environment | Bamboo grove, light filtering through | Surrounding, enveloping, atmosphere |
| Progress / growth | Bonsai at three stages side by side | Time, patience, visible change |
| Mistakes / failure | Kintsugi ceramic bowl, gold repairs glowing | Beauty in breakage, imperfection |
| Plateau / breakthrough | Stone lantern in fog, soft glow | Persistence through uncertainty |
| Goals / planning | Single stone being placed by unseen hand | Intentional action, deliberate choice |
| Habits / routine | Tea bowl with steam rising, morning light | Daily ritual, warmth of repetition |
| Efficiency / speed | Cherry blossom petals falling, brief beauty | Fleeting moments, doing less more deeply |

---

## What NOT to generate

- Characters, people, hands (except the "placing stone" metaphor — hand only, no face)
- Text, letters, kanji, numbers
- Devices (phones, laptops, headphones)
- Classroom or desk settings
- Generic flat-icon style (too sterile)
- Photorealistic renders
- Neon, saturated, or cool-blue tones
- More than 3 distinct elements in one scene

---

## Example Prompts

### "Why Spaced Repetition Works"
Scene: `A single moss-covered river stone resting on raked sand, concentric sand rings around it suggesting time and return.`
→ + fixed suffix

### "How to Build a Language Habit"
Scene: `A handmade ceramic tea bowl with gently rising steam, placed on raked sand at dawn, small bonsai out of focus in the background.`
→ + fixed suffix

### "Overcoming the Intermediate Plateau"
Scene: `A stone lantern glowing softly through morning fog, a stepping stone path disappearing into mist, a single fallen leaf mid-air.`
→ + fixed suffix

---

## Implementation

In `daily-blog.sh`, Claude outputs only the **scene** field (1-2 sentences, no style words).
The script appends the fixed suffix before sending to fal.ai.

See: `~/Scripts/zenzu/jobs/daily-blog.sh`
