---
name: Zenzu
description: Ink & Paper, brush theme. The marketing site wears the app's own design language.
colors:
  paper: "#FDFCFA"
  paper-2: "#F5F3EC"
  hairline: "#E9E5DC"
  rule: "#CEC7B9"
  ink: "#1C1B18"
  ink-lead: "#45413A"
  ink-2: "#5F5A50"
  ink-3: "#746F63"
  ink-4: "#948D82"
  moss: "#5B7052"
  moss-dark: "#2D3D2A"
  moss-wash: "#EFF2EB"
  swash: "#D6DFCB"
  swash-cancel: "#E6E1D6"
  pill-ground: "#E4E9DB"
  pill-texture: "#CBD3C0"
  pill-edge: "#B8C0AE"
  pill-cancel-ground: "#EEEAE3"
  pill-cancel-texture: "#DAD5CB"
  pill-cancel-edge: "#C6C1B8"
typography:
  display:
    fontFamily: "Lora, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(2.25rem, 6vw, 3.75rem)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Lora, Georgia, 'Times New Roman', serif"
    fontSize: "2.25rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Lora, Georgia, 'Times New Roman', serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "'Golos Text', system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  lead:
    fontFamily: "'Golos Text', system-ui, -apple-system, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  article:
    fontFamily: "'Golos Text', system-ui, -apple-system, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "'Golos Text', system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.18em"
rounded:
  menu: "10px"
  card: "16px"
  pill: "9999px"
spacing:
  section: "96px"
  gutter: "24px"
  row: "32px"
components:
  button-primary:
    backgroundColor: "{colors.pill-ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.pill-cancel-ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
    height: "48px"
  button-small:
    backgroundColor: "{colors.pill-ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "7px 18px"
    height: "36px"
  menu:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.menu}"
    padding: "8px 0"
---

# Design System: Zenzu

## Overview

**Creative North Star: "Ink on paper, a brush in a quiet garden"**

The site is a calm page of warm paper with ink type and a single moss accent. It copies the Flutter app's theme (AppTheme and ZTokens in the app repository), so a visitor who opens the app sees the same world. The source of truth for every token is the app; when the app changes, the site follows it.

Colour is sparing. Moss marks an action or a selection; ink carries everything else. Selection and emphasis are drawn with brush marks (a swash under a label, a short stroke above a heading), not with fills, borders or glows. Density is low: wide section padding, narrow text columns, one idea per section.

**Key Characteristics:**
- One paper, one ink, one accent.
- Serif (Lora) for content and headings, sans (Golos Text) for UI and body.
- Brush textures from `public/brush/` carry selection, buttons and heading marks.
- No shadows, no gradients, no dark mode.

## Colors

A warm, near-monochrome palette: paper and ink tones with one muted green.

### Primary
- **Moss** (moss): the only accent. Heading strokes, glyphs, list bullets, link underlines. Never a large fill.
- **Moss Dark** and **Moss Wash** (moss-dark, moss-wash): rare tonal partners of moss, for a dark mark or a very light wash.

### Neutral
- **Paper** (paper): the page ground.
- **Paper 2** (paper-2): the only secondary surface; alternating sections sit on it.
- **Hairline** (hairline): the seam between rows (border-top on list rows, FAQ items, quotes).
- **Rule** (rule): structure lines, menu and badge borders.
- **Ink** (ink): headings and primary text. **Ink Lead** (ink-lead): lead text and quotes. **Ink 2** (ink-2): secondary text. **Ink 3** (ink-3): the lightest tone that may carry text. **Ink 4** (ink-4): large marks only, never text.
- **Swash** and **Swash Cancel** (swash, swash-cancel): brush colours under a selected label and the alternative half of a button pair; also text selection.

### Named Rules
**The One Accent Rule.** Moss is the only hue. No second accent, no warm sand, no gold, no blue.
**The Colour Never Carries the Control Rule.** A button label is always ink. A selected item is also bold; the swash is never the only signal.

### Illustration layer
The grove canvas in the hero is decorative illustration, not chrome. It has one exception to the colour rules above.

- Leaf colour follows the season, as in the app. Spring has blossom pink and light green. Summer has greens. Autumn has reds, oranges and golds. Winter has bare branches and snow.
- Warm hues are allowed on the canvas. They break The One Accent Rule on purpose.
- The exception covers the grove canvas only. No other element takes a leaf colour.
- The leaf colours stay literals in `src/lib/grove-model.ts`. They never become tokens and never colour chrome.
- Lines stay ink: branches in ink, the ground line in rule. The canvas draws no gradient, no shadow and no glow.
- The canvas is decorative and `aria-hidden`. Under forced colours it is not recoloured. The page loses no content, so this is an accepted limit.

## Typography

**Display Font:** Lora (with Georgia, Times New Roman)
**Body Font:** Golos Text (with system-ui)

**Character:** A literary serif for what the learner reads, a clean grotesque for what the learner operates, the same pairing as the app.

### Hierarchy
- **Display** (500, 36px to 60px, 1.12): the hero headline only.
- **Headline** (500, 30px to 36px, 1.2): section headings.
- **Title** (500, 20px): step and card titles.
- **Body** (400, 16px, 1.625): default text, columns at most 42rem.
- **Article** (400, 18px): blog body in a 40rem column, about 60 characters per line. Italics are the studied language and are set in Lora.
- **Label** (500, 12px, 0.18em, uppercase): the section label. Minimum 11px for any text.

### Named Rules
**The Weight 500 Rule.** Every serif role is weight 500, as in the app.
**The 11px Floor Rule.** No text below 11px, including badge captions and step numerals.

## Layout

Single column, centred containers: 3xl (48rem) for text sections, 5xl to 6xl (64rem to 72rem) for grids and the carousel. Sections are 96px tall in padding (py-24) with a 24px side gutter. Rows inside a section are separated by a hairline and 24px to 32px of padding. The home page alternates paper and paper-2 sections. The screen carousel swipes on phones and has arrow buttons on desktop.

## Elevation & Depth

Flat. There are no shadows. Depth comes from the paper / paper-2 alternation and from hairlines and rules.

## Shapes

Pills (fully rounded) for buttons; 16px corners for the store badges and blog covers; 10px for the language menu. Brush masks give buttons, swashes and strokes an organic edge; geometry elsewhere is plain.

## Components

### Buttons
- **Shape:** full pill (rounded.pill), minimum height 48px, 36px for the small variant.
- **Primary (ink pill):** pale moss ground, brush texture clipped inside, 1px edge a shade darker, ink label at weight 700.
- **Secondary (cancel pill):** grey ground, mirrored brush, label at weight 600.
- **Hover / Active:** an ink overlay at 6% and 10% opacity, 150ms. Focus: 2px ink outline with 3px offset.

### Navigation
- Header: sans 14px, ink-2, hover to ink. The current item wears the swash and is bold.
- Language menu: opens on hover and click, reports aria-expanded; 10px corners, rule border, paper ground; items 20px by 8px padding.
- On phones the footer language list is the only language switch.

### Section Label and Heading Stroke (signature)
- A section opens with either a short moss brush stroke (48px by 6px) or a caps label (label style, ink-3) above its heading. These come from the app (ZSwashStroke, ZSectionLabel) and are part of the brand, not decoration to remove.
- How it works numbers its three steps (01, 02, 03) in the label style. The numbers order a real sequence; keep them.

### Swash and Mark
- Swash: a brush stroke behind a selected label; it bleeds past the label and takes no layout space.
- Mark: the same brush under words inside running text; it follows the words when they wrap.

## Motion

The page is calm. It has one looping scene and one-time reveals. Hover and press states keep their 150ms transition (see Buttons). Nothing else moves.

### Named Rules
**The One Scene Rule.** The grove canvas is the only motion that loops. Everything else moves once.
**The Still Hero Text Rule.** The hero text never animates. It is the largest contentful paint (LCP) element.
**The Reduced Motion Rule.** Reduced motion gives a static, fully grown grove. It cuts every reveal transition to 0.01ms.

### Grove scene
- The scene is the grove canvas in the hero: five trees on one ground line.
- Each tree grows once. Growth starts when 25% of the canvas is visible. One tree takes 2600ms, and each tree starts 180ms after the one before.
- After all trees are grown, ambient pieces fall by season: 6 leaves in autumn, 3 petals in spring, 16 snowflakes in winter, none in summer. The season follows the visitor's local date: March to May spring, June to August summer, September to November autumn, December to February winter.
- The loop runs only while the canvas is on screen and the tab is visible. It is limited to 30 fps and to a device pixel ratio of 2.
- From xl (80rem) the canvas is 320px high and spans the bottom of the hero behind the text. Trees stand left and right of the text column, and nothing falls in front of it. Below xl the canvas is a 140px strip under the store badges with all five trees in one row.
- The canvas reads the same media query as the CSS xl breakpoint, `(min-width: 80rem)`, so CSS and script always agree on the layout. It measures the real width of the text column. No tree, leaves included, comes nearer than 16px to the column.
- The two hero text blocks carry `relative z-10`, so the canvas stays behind them. The text column itself is not positioned.
- Without JavaScript the canvas stays empty. It keeps its height, so the layout does not shift.
- With reduced motion the canvas draws one frame of the fully grown grove. It starts no loop and no falling pieces.

### Section reveals
- Every section block except the hero has one inner container marked `data-reveal`.
- A block starts at opacity 0, 12px lower. When it is revealed it fades in and rises over 400ms (ease-out). Its heading stroke (`.zz-stroke`) draws from the left, `scaleX` 0 to 1, over 600ms (ease-out) after a 150ms delay.
- One `IntersectionObserver` in `BaseLayout.astro` triggers the reveal. It uses `threshold: 0` and `rootMargin: '0px 0px -10% 0px'`. A block reveals the first time its top edge is 10% inside the viewport.
- The trigger does not depend on block height. A ratio threshold never fires for a block taller than the viewport divided by the ratio.
- Each block reveals once. The observer stops watching it after the first reveal, so scrolling up does not replay it.
- The hidden start applies only under `html.js`. An inline script in the head sets this class, so a page without scripts shows all content.
- Without `IntersectionObserver`, every block is revealed at once.
- Print shows every block and stroke in full (`@media print` in `global.css`).
- With reduced motion, the existing rule in `global.css` shortens each transition to 0.01ms.

## Do's and Don'ts

### Do:
- **Do** take every new token from the app's AppTheme and ZTokens first.
- **Do** keep moss below one small mark per component.
- **Do** keep text at 11px or more and on ink-3 or darker.
- **Do** keep forced-colours and reduced-motion fallbacks working for every brush element.

### Don't:
- **Don't** add shadows, gradients, glows or a dark theme.
- **Don't** add a second accent colour or any warm hue (orange, gold, amber) (except the grove canvas).
- **Don't** remove the section labels, heading strokes or step numerals because a generic linter calls them AI scaffolding; they are the app's components.
- **Don't** add mascots, confetti, streak counters or other game visuals.
- **Don't** draw a phone or device frame around app screenshots; the ink frame names no device.
