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
    height: "44px"
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
- **Hairline** (hairline): the seam between rows (border-top on list rows, FAQ items).
- **Rule** (rule): structure lines and menu borders. The store badge border is ink-3: rule on paper is 1.64:1, and a control edge needs 3:1.
- **Ink** (ink): headings and primary text. **Ink Lead** (ink-lead): lead text and quotes. **Ink 2** (ink-2): secondary text. **Ink 3** (ink-3): the lightest tone that may carry text. **Ink 4** (ink-4): large marks only, never text.
- **Swash** and **Swash Cancel** (swash, swash-cancel): brush colours under a selected label and the alternative half of a button pair; also text selection.

### Named Rules
**The One Accent Rule.** Moss is the only hue. No second accent, no warm sand, no gold, no blue. The grove canvas is the one exception (see Illustration layer).
**The Colour Never Carries the Control Rule.** A button label is always ink. A selected item is also bold; the swash is never the only signal.

### Illustration layer
The grove canvas in the hero is decorative illustration, not chrome. It has one exception to the colour rules above.

- Leaf colour follows the season. The palettes come from the grove mockup. Spring has blossom pink and light green. Summer has greens. Autumn has reds, oranges and golds. Winter has bare branches and snow.
- Warm hues are allowed on the canvas. They break The One Accent Rule on purpose.
- The exception covers the grove canvas only. No other element takes a leaf colour.
- The leaf colours stay literals in `src/lib/grove-model.ts`. They never become tokens and never colour chrome.
- Branches are ink and the ground line is rule. Leaf outlines use the leaf colour. Snow is the literal grey `INK.snow`.
- The canvas draws no gradient, no shadow and no glow.
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

Single column, centred containers. Sections are 96px tall in padding (py-24) with a 24px side gutter. Rows inside a section are separated by a hairline and 24px to 32px of padding. The home page alternates paper and paper-2 sections.

- **One left axis.** On the home page every left-aligned section (Screens, How it works, Features, For whom, MCP, FAQ) uses a 5xl (64rem) container inside the 24px gutter, so the left edge does not move between sections. Text inside it stays in a column of at most 3xl (48rem). The centred sections (Hero, The name, CTA) keep their own narrow centred containers.
- **Carousel.** The screen carousel swipes on phones and has arrow buttons on desktop. A quiet position count ("3 / 8", ink-3, small text) shows the first frame in view; a polite live region says it in words once a move by the reader has settled.

## Elevation & Depth

Flat. There are no shadows. Depth comes from the paper / paper-2 alternation and from hairlines and rules.

### Known exceptions
- **Device frame (Screens.astro).** Each app screenshot sits in a plain ink bezel with a 36px (2.25rem) corner radius and a 6px border; the image inside has a 30px radius. The bezel has a low ink shadow (`0 1px 2px` at 8% and `0 18px 40px -18px` at 35%). This is the only shadow and the only large radius on the site. They make the frame read as a device without naming one. Do not copy them to any other element.

## Shapes

Pills (fully rounded) for buttons; 16px corners for the store badges and blog covers; 10px for the language menu and the skip link; 36px for the device frame (see Known exceptions). Brush masks give buttons, swashes and strokes an organic edge; geometry elsewhere is plain.

## Components

### Buttons
- **Shape:** full pill (rounded.pill), minimum height 48px, 44px for the small variant.
- **Primary (ink pill):** pale moss ground, brush texture clipped inside, 1px edge a shade darker, ink label at weight 700.
- **Secondary (cancel pill):** grey ground, mirrored brush, label at weight 600.
- **Hover / Active:** an ink overlay at 6% and 10% opacity, 150ms. Focus: 2px ink outline with 3px offset.

### Calls to action
- Every link to app.zenzu.app has the same label, `app.open` ("Open Zenzu"), in the header, hero, CTA, footer, blog close and 404.
- The hero has one pill. "How it works" under it is a quiet text link with an arrow.
- The store badges are one component (`StoreBadges.astro`), in the hero and under the CTA button. The store names stay in English; the captions are localised.

### Navigation
- Header: sans 14px, ink-2, hover to ink. The current item wears the swash and is bold.
- Language menu: opens on hover and click, reports aria-expanded; 10px corners, rule border, paper ground; items 20px by 8px padding.
- The header language menu shows on phones too, as a compact control with a 44px tap target. The footer also lists every language.
- **Tap targets:** on the home page every link and control is at least 44px high: header links and logo, language menu items, buttons, carousel arrows (44 by 44), footer links (one link per 44px row), FAQ rows. A link inside running text (the footer mail link) gets vertical padding, so its tap area grows and the lines do not move.
- **Skip link:** the first focusable element on the home page. It is hidden until it has focus, then shows at the top left over the fixed header, and moves focus to `<main id="main">`.
- A swash on a 44px link sits on an inner span, so the brush covers the word and not the whole tap area.

### Disclosure
- Every `<details>` list (Features, FAQ) uses one mark: `.zz-plus`, a 24px moss plus that turns 45° into a cross when the item opens. The whole `<summary>` row is the tap target.
- Features rows are exclusive (`name="feature"`). FAQ answers may stay open together: closing an answer above the one just opened makes the page jump, and readers compare answers.

### Section Label and Heading Stroke (signature)
- A section opens with either a short moss brush stroke (48px by 6px) or a caps label (label style, ink-3) above its heading. These come from the app (ZSwashStroke, ZSectionLabel) and are part of the brand, not decoration to remove.
- How it works numbers its three steps (01, 02, 03) in the label style. The numbers order a real sequence; keep them.

### Swash and Mark
- Swash: a brush stroke behind a selected label; it bleeds past the label and takes no layout space.
- Mark: the same brush under words inside running text; it follows the words when they wrap.

## Motion

The page is calm. It has one looping scene and one-time reveals. Nothing else loops. Other motion is short state feedback, smooth scrolling, and the reveals. Smooth scrolling (anchor links and the screen carousel) turns off with reduced motion.

### Named Rules
**The One Scene Rule.** The grove canvas is the only motion that loops. Other motion happens once or answers an action.
**The Still Hero Text Rule.** The hero text never animates. It must stay the largest contentful paint (LCP) element, and the canvas must not delay it.
**The Reduced Motion Rule.** Reduced motion gives a static, fully grown grove. It shortens the duration of every reveal transition to 0.01ms.

### Grove scene
- The scene is the grove canvas in the hero: five trees above one ground line. Two back-row trees are drawn at 55% opacity and stand 4px higher.
- Each tree grows once. Growth starts when 25% of the canvas is visible. One tree takes 2600ms, and each tree starts 180ms after the one before.
- Trees sway in every season, also after they are grown. This is why the loop runs in summer, when nothing falls.
- After all trees are grown, ambient pieces fall by season: 6 leaves in autumn, 3 petals in spring, 16 snowflakes in winter, none in summer.
- The season follows the visitor's local date, as in the app: March to May spring, June to August summer, September to November autumn, December to February winter.
- The loop runs only while the canvas is on screen and the tab is visible. It is limited to 30 fps and to a device pixel ratio of 2.
- From xl (80rem) the canvas is 320px high and spans the bottom of the hero behind the text. This is the flank layout. Trees stand left and right of the text column, and nothing falls in front of it.
- Below xl the canvas is a 140px strip under the store badges. This is the strip layout. The trees spread along one line.
- The canvas reads the same media query as the CSS xl breakpoint, `(min-width: 80rem)`, so CSS and script always agree on the layout.
- In the flank layout the canvas measures the real width of the text column. No tree, leaves included, comes nearer than 16px to it.
- The two hero text blocks carry `relative z-10`, so the canvas stays behind them. The text column itself is not positioned.
- Without JavaScript the canvas stays empty. It keeps its height, so the layout does not shift.
- With reduced motion the canvas draws one frame of the fully grown grove. It starts no loop and no falling pieces.

### Section reveals
- Every section block except the hero has one inner container marked `data-reveal`.
- A block starts at opacity 0, 12px lower. When it is revealed it fades in and rises over 400ms (ease-out). Its heading stroke (`.zz-stroke`) draws from the left, `scaleX` 0 to 1, over 600ms (ease-out) after a 150ms delay.
- One `IntersectionObserver` in `BaseLayout.astro` triggers the reveal. It uses `threshold: 0` and `rootMargin: '0px 0px -10% 0px'`. The observer ignores the bottom 10% of the viewport. A block reveals the first time any part of it is inside the rest of the viewport.
- The trigger does not depend on block height. A ratio threshold never fires for a block taller than the viewport divided by the ratio.
- Each block reveals once. The observer stops watching it after the first reveal, so scrolling up does not replay it.
- The hidden start applies only under `html.js`. An inline script in the head sets this class, so a page without scripts shows all content.
- Without `IntersectionObserver`, every block is revealed at once.
- Print shows every block and stroke in full (`@media print` in `global.css`).
- With reduced motion, the existing rule in `global.css` shortens every transition duration to 0.01ms. The stroke keeps its 150ms delay.

## Do's and Don'ts

### Do:
- **Do** take every new token from the app's AppTheme and ZTokens first.
- **Do** keep moss below one small mark per component.
- **Do** keep text at 11px or more and on ink-3 or darker.
- **Do** keep forced-colours and reduced-motion fallbacks working for every brush element.

### Don't:
- **Don't** add shadows, gradients, glows or a dark theme.
- **Don't** add a second accent colour or any warm hue (orange, gold, amber; except the grove canvas).
- **Don't** remove the section labels, heading strokes or step numerals because a generic linter calls them AI scaffolding; they are the app's components.
- **Don't** add mascots, confetti, streak counters or other game visuals.
- **Don't** draw a phone or device frame around app screenshots; the ink frame names no device.
