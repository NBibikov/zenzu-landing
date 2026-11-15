// Canvas 2D renderer of the hero grove. The data (seasons, trees, layout) is
// in grove-model.ts. The drawing is a port of the grove mockup without the
// dark theme, time of day, sky, bird, labels and controls. The site is flat:
// no gradient, no shadow, no glow.

import {
  buildTree,
  GROVE_TREES,
  INK,
  keepLeaf,
  layoutTrees,
  leafStep,
  LEAF_PALETTES,
  seasonFor,
  TEXT_HALF_WIDTH,
  type GroveLayout,
  type Leaf,
  type Season,
  type Tree,
  type TreeSlot,
} from './grove-model.ts'

export const GROW_MS = 2600 // growth time of one tree
export const STAGGER_MS = 180 // delay between the start of two trees
const FRAME_MS = 1000 / 30 // 30 fps limit
const MAX_DELTA_MS = 50 // a longer gap (pause, slow frame) counts as 50 ms
const MAX_DPR = 2
const VISIBLE_RATIO = 0.25 // growth starts when this part of the canvas is visible
// Frame cost guard: when the grown grove takes longer than FRAME_BUDGET_MS
// to draw, on average over FRAME_SAMPLES frames, the loop stops and the
// grove stays still.
export const FRAME_BUDGET_MS = 12
export const FRAME_SAMPLES = 10
// Flank or strip: the same breakpoint as Tailwind `xl` in Hero.astro, which
// moves the canvas behind the text. One source, so CSS and JS always agree.
const FLANK_QUERY = '(min-width: 80rem)'

// Ambient falling leaves, petals or snowflakes per season.
export const AMBIENT_FALLERS: Record<Season, number> = {
  autumn: 6,
  spring: 3,
  winter: 16,
  summer: 0,
}

const MAX_SIZE = 200 // largest tree size in px (size 1 in tree units)
const TOP_MARGIN = 6 // free space above the tallest tree, px
const COLUMN_GAP = 16 // free space between a canopy and the text column, px
const LEAF_MIN_SIZE = 110 // small trees draw leaves as if they had this size
// Longest leaf (leaf.s = 1.3) in leaf units. A leaf can stick out of the
// extent by this length times leafScale(size).
const LEAF_MAX_LENGTH = 2.4 * (3.2 + 2.2 * 1.3)
const ROW_BACK_ALPHA = 0.55
const ROW_BACK_LIFT = 4 // back row trees stand this many px higher
const LEAF_FILL_ALPHA = 0.85

export const clamp = (v: number, lo = 0, hi = 1): number => Math.max(lo, Math.min(hi, v))
const easeOut = (x: number): number => 1 - Math.pow(1 - x, 3)

// Growth 0..1 of tree `index` at scene time `time`. Before the start of
// growth (growStart null) every tree has growth 0.
export function treeGrowth(time: number, growStart: number | null, index: number): number {
  if (growStart === null) return 0
  return easeOut(clamp((time - growStart - index * STAGGER_MS) / GROW_MS))
}

// The time after which every tree is fully grown.
export function groveGrownAt(growStart: number): number {
  return growStart + (GROVE_TREES.length - 1) * STAGGER_MS + GROW_MS
}

// Returns a function that takes the draw time of one frame and tells if the
// average of the last `samples` frames is above `budget` ms. Until it has
// `samples` frames, it says no.
export function createFrameCostGuard(
  budget: number = FRAME_BUDGET_MS,
  samples: number = FRAME_SAMPLES,
): (frameMs: number) => boolean {
  const costs: number[] = []
  let total = 0
  return (frameMs) => {
    costs.push(frameMs)
    total += frameMs
    if (costs.length > samples) total -= costs.shift()!
    return costs.length === samples && total / samples > budget
  }
}

// Colour of one leaf. Some leaves (low `mix`) borrow a colour from another
// palette, as in the mockup. Winter has no leaves: the result is null.
export function leafColor(season: Season, kind: number, leaf: Leaf): string | null {
  const palettes = LEAF_PALETTES[season]
  if (!palettes) return null
  const k = leaf.mix < 0.22 ? (kind + 1 + (Math.floor(leaf.mix * 10) % 3)) % 4 : kind
  return palettes[k][leaf.c]
}

export interface Segment {
  x1: number
  y1: number
  x2: number
  y2: number
  depth: number
}

export interface LeafSpot {
  x: number
  y: number
  angle: number // direction of the branch that carries the leaf
  leaf: Leaf
}

export interface TreeShape {
  segments: Segment[]
  leaves: LeafSpot[] // only on branches that are fully grown
}

// Branch and leaf positions of a tree that stands at (x, y). A branch at depth
// d grows after the branches above it; `time` drives the sway.
export function shapeTree(
  tree: Tree,
  x: number,
  y: number,
  size: number,
  grow: number,
  time: number,
): TreeShape {
  const segments: Segment[] = []
  const leaves: LeafSpot[] = []
  const levels = tree.maxDepth + 1

  const visit = (branch: Tree['root'], bx: number, by: number, parentAngle: number) => {
    const d = branch.d
    const g = clamp(grow * levels - d)
    if (g <= 0) return
    const sway =
      Math.sin(time * 0.0009 + branch.ph + d * 0.5) * 0.018 * (d + 1) +
      Math.sin(time * 0.0023 + branch.ph) * 0.006 * d
    const angle = parentAngle + branch.ang + sway
    const length = branch.len * size * 0.32 * g
    const x2 = bx + Math.sin(angle) * length
    const y2 = by - Math.cos(angle) * length
    segments.push({ x1: bx, y1: by, x2, y2, depth: d })
    if (g >= 1) {
      for (const leaf of branch.leaves) {
        const offset = leaf.side * size * 0.04
        leaves.push({
          x: bx + (x2 - bx) * leaf.t + Math.cos(angle) * offset,
          y: by + (y2 - by) * leaf.t + Math.sin(angle) * offset,
          angle,
          leaf,
        })
      }
    }
    for (const kid of branch.kids) visit(kid, x2, y2, angle)
  }

  visit(tree.root, x, y, 0)
  return { segments, leaves }
}

// How far a grown tree reaches from its base, in tree units (multiply by the
// size in px). The values are the maximum over one sway period.
export interface Extent {
  left: number
  right: number
  top: number
}

export function treeExtent(tree: Tree): Extent {
  const extent: Extent = { left: 0, right: 0, top: 0 }
  for (let time = 0; time < 7000; time += 350) {
    const { segments, leaves } = shapeTree(tree, 0, 0, 1, 1, time)
    const points = [
      ...segments.map((s) => ({ x: s.x2, y: s.y2 })),
      ...leaves.map((l) => ({ x: l.x, y: l.y })),
    ]
    for (const p of points) {
      extent.left = Math.max(extent.left, -p.x)
      extent.right = Math.max(extent.right, p.x)
      extent.top = Math.max(extent.top, -p.y)
    }
  }
  return extent
}

// Tree size in px (size of a tree with scale 1). Every tree, leaves included,
// must fit under the top of the canvas and inside its width. In the flank
// layout no canopy may come nearer to the text column (half width
// `columnHalf`) than COLUMN_GAP.
export function fitSize(
  layout: GroveLayout,
  width: number,
  groundY: number,
  slots: readonly TreeSlot[],
  extents: readonly Extent[],
  columnHalf: number = TEXT_HALF_WIDTH,
): number {
  // A leaf adds at most padFixed + padPerPx * treeSize px to the extent,
  // because leafScale(treeSize) <= (LEAF_MIN_SIZE + treeSize) / 170.
  const padFixed = (LEAF_MAX_LENGTH * LEAF_MIN_SIZE) / 170
  const padPerPx = LEAF_MAX_LENGTH / 170
  // Largest tree size in px for free room `room` and extent `reach`.
  const fit = (room: number, reach: number) => (room - padFixed) / (reach + padPerPx)

  let size = MAX_SIZE
  const columnLeft = width / 2 - columnHalf - COLUMN_GAP
  const columnRight = width / 2 + columnHalf + COLUMN_GAP
  slots.forEach((slot, i) => {
    const e = extents[i]
    const cx = slot.x * width
    const base = groundY - (slot.row === 1 ? ROW_BACK_LIFT : 0)
    let leftLimit = 0
    let rightLimit = width
    if (layout === 'flank') {
      if (cx < width / 2) rightLimit = columnLeft
      else leftLimit = columnRight
    }
    const treeSize = Math.min(
      fit(base - TOP_MARGIN, e.top),
      fit(cx - leftLimit, e.left),
      fit(rightLimit - cx, e.right),
    )
    size = Math.min(size, treeSize / slot.scale)
  })
  return Math.max(0, size)
}

const leafScale = (size: number): number => Math.max(size, LEAF_MIN_SIZE) / 170

interface Faller {
  x: number
  y: number
  vx: number // px per 60 fps frame, as in the mockup
  vy: number
  dir: number // -1 drifts left, 1 drifts right
  ph: number
  s: number
  hex: string | null // null for a snowflake
}

export function mountGrove(canvas: HTMLCanvasElement, opts: { date?: Date } = {}): () => void {
  const context = canvas.getContext('2d')
  if (!context) return () => {}
  const ctx: CanvasRenderingContext2D = context

  const season = seasonFor(opts.date ?? new Date())
  const trees = GROVE_TREES.map((spec) => buildTree(spec.seed, spec.maturity))
  const extents = trees.map(treeExtent)
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  const flankQuery = matchMedia(FLANK_QUERY)

  let width = 0
  let height = 0
  let groundY = 0
  let dpr = 1
  let layout: GroveLayout = 'strip'
  let columnHalf = TEXT_HALF_WIDTH
  let slots: TreeSlot[] = []
  let size = 0

  let sceneTime = 0
  let growStart: number | null = null
  let fallers: Faller[] = []
  let inView = false
  let raf = 0
  let lastFrame: number | null = null
  let still = false // set by the frame cost guard: the loop does not run again
  const overBudget = createFrameCostGuard()

  function leafPath(s: number) {
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.quadraticCurveTo(s, -s * 1.2, 0, -s * 2.4)
    ctx.quadraticCurveTo(-s, -s * 1.2, 0, 0)
  }

  function drawLeafShape(hex: string, s: number) {
    leafPath(s)
    ctx.fillStyle = hex
    ctx.globalAlpha *= LEAF_FILL_ALPHA
    ctx.fill()
    ctx.globalAlpha /= LEAF_FILL_ALPHA
    ctx.strokeStyle = hex
    ctx.lineWidth = 1.1
    ctx.stroke()
  }

  function drawTree(i: number) {
    const slot = slots[i]
    const treeSize = size * slot.scale
    const grow = reducedMotion ? 1 : treeGrowth(sceneTime, growStart, i)
    const baseY = groundY - (slot.row === 1 ? ROW_BACK_LIFT : 0)
    const shape = shapeTree(trees[i], slot.x * width, baseY, treeSize, grow, sceneTime)

    ctx.strokeStyle = INK.ink
    ctx.lineCap = 'round'
    for (const s of shape.segments) {
      ctx.lineWidth = s.depth < 2 ? 1.8 : 1.2
      ctx.beginPath()
      ctx.moveTo(s.x1, s.y1)
      ctx.lineTo(s.x2, s.y2)
      ctx.stroke()
    }

    // Leaves open in the last 15 % of the growth.
    const open = clamp((grow - 0.85) / 0.15)
    if (open <= 0) return
    const kind = GROVE_TREES[i].kind
    const shrink = season === 'spring' ? 0.8 : 1
    const unit = leafScale(treeSize) * open * shrink
    const step = leafStep(treeSize, layout)
    for (const spot of shape.leaves) {
      if (!keepLeaf(spot.leaf, step)) continue
      const hex = leafColor(season, kind, spot.leaf)
      if (!hex) continue
      const s = (3.2 + spot.leaf.s * 2.2) * unit
      const angle =
        spot.angle + spot.leaf.side + Math.sin(sceneTime * 0.002 + spot.leaf.fall * 9) * 0.15
      ctx.save()
      ctx.translate(spot.x, spot.y)
      ctx.rotate(angle)
      drawLeafShape(hex, s)
      ctx.restore()
    }
  }

  function spawnFaller(): Faller {
    const i = Math.floor(Math.random() * slots.length)
    const slot = slots[i]
    const e = extents[i]
    const treeSize = size * slot.scale
    const cx = slot.x * width
    const winter = season === 'winter'
    const dir = layout === 'flank' && cx > width / 2 ? 1 : -1
    let hex: string | null = null
    const palettes = LEAF_PALETTES[season]
    if (palettes) {
      const palette = palettes[Math.floor(Math.random() * (season === 'spring' ? 1 : 3))]
      hex = palette[Math.floor(Math.random() * 4)]
    }
    return {
      x: cx + (Math.random() * (e.left + e.right) - e.left) * treeSize,
      // Snow comes from above the canvas; leaves come from the canopy.
      y: winter
        ? -6 - Math.random() * 40
        : groundY - e.top * treeSize * (0.4 + Math.random() * 0.6),
      vx: winter ? 0.05 + Math.random() * 0.1 : 0.1 + Math.random() * 0.25,
      vy: winter ? 0.25 + Math.random() * 0.25 : 0.22 + Math.random() * 0.3,
      dir,
      ph: Math.random() * 6.28,
      s: 0.7 + Math.random() * 0.6,
      hex,
    }
  }

  function fallerIsDone(f: Faller): boolean {
    if (f.y >= groundY || f.x < -10 || f.x > width + 10) return true
    // In the flank layout nothing falls in front of the text column.
    return layout === 'flank' && Math.abs(f.x - width / 2) < columnHalf
  }

  function stepFallers(dt: number) {
    if (growStart === null || sceneTime < groveGrownAt(growStart)) return
    const want = AMBIENT_FALLERS[season]
    while (fallers.length < want) fallers.push(spawnFaller())
    const k = dt / (1000 / 60)
    for (let n = 0; n < fallers.length; n++) {
      const f = fallers[n]
      f.y += f.vy * k
      f.x += (f.dir * f.vx + Math.sin(sceneTime * 0.002 + f.ph) * 0.45) * k
      if (fallerIsDone(f)) fallers[n] = spawnFaller()
    }
  }

  function drawFallers() {
    for (const f of fallers) {
      ctx.save()
      ctx.translate(f.x, f.y)
      if (f.hex === null) {
        ctx.fillStyle = INK.snow
        ctx.beginPath()
        ctx.arc(0, 0, 1.1 * f.s + 0.4, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.rotate(Math.sin(sceneTime * 0.003 + f.ph) * 1.2)
        drawLeafShape(f.hex, 3.2 * f.s * leafScale(size))
      }
      ctx.restore()
    }
  }

  function render() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    if (width === 0 || height === 0) return

    // Ground: one hairline across the full width.
    ctx.globalAlpha = 1
    ctx.strokeStyle = INK.rule
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, groundY + 0.5)
    ctx.lineTo(width, groundY + 0.5)
    ctx.stroke()

    // The back row first, lighter.
    const order = slots.map((_, i) => i).sort((a, b) => slots[b].row - slots[a].row)
    for (const i of order) {
      ctx.globalAlpha = slots[i].row === 1 ? ROW_BACK_ALPHA : 1
      drawTree(i)
    }
    ctx.globalAlpha = 1
    drawFallers()
  }

  function resize() {
    width = canvas.clientWidth
    height = canvas.clientHeight
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    groundY = height - 1
    // The breakpoint change also resizes the canvas, so this re-read runs.
    layout = flankQuery.matches ? 'flank' : 'strip'
    // The canvas sits inside the text column; its parent is the column.
    columnHalf = (canvas.parentElement?.clientWidth ?? 2 * TEXT_HALF_WIDTH) / 2
    slots = layoutTrees(width, layout, columnHalf)
    size = fitSize(layout, width, groundY, slots, extents, columnHalf)
    fallers = [] // they spawn again at the new tree positions
    render() // a resized canvas is blank until the next draw
  }

  function tick(now: number) {
    raf = requestAnimationFrame(tick)
    if (lastFrame === null) {
      lastFrame = now
      return
    }
    const elapsed = now - lastFrame
    if (elapsed < FRAME_MS - 1) return
    lastFrame = now
    const dt = Math.min(elapsed, MAX_DELTA_MS)
    sceneTime += dt
    stepFallers(dt)
    const grown = growStart !== null && sceneTime >= groveGrownAt(growStart)
    const start = performance.now()
    render()
    if (grown && overBudget(performance.now() - start)) stopForGood()
  }

  // The device cannot draw the grown grove in time. Draw it one last time
  // without fallers, so the canvas shows complete, fully grown trees, and
  // stop the loop.
  function stopForGood() {
    still = true
    fallers = []
    render()
    updateLoop()
  }

  function updateLoop() {
    const run = !reducedMotion && !still && inView && document.visibilityState === 'visible'
    if (run && raf === 0) {
      lastFrame = null // the first frame after a pause adds no time
      raf = requestAnimationFrame(tick)
    } else if (!run && raf !== 0) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  resize()

  if (reducedMotion) {
    // resize() draws the grown grove; no loop, no fallers.
    return () => resizeObserver.disconnect()
  }

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        inView = entry.isIntersecting
        if (growStart === null && entry.intersectionRatio >= VISIBLE_RATIO) {
          growStart = sceneTime
        }
      }
      updateLoop()
    },
    { threshold: [0, VISIBLE_RATIO] },
  )
  intersectionObserver.observe(canvas)
  document.addEventListener('visibilitychange', updateLoop)

  return () => {
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    document.removeEventListener('visibilitychange', updateLoop)
    if (raf !== 0) cancelAnimationFrame(raf)
    raf = 0
  }
}
