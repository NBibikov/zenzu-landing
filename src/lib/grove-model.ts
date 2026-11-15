// Data model of the hero grove: seasons, palettes, tree shapes and tree
// positions. No DOM and no canvas code here. The drawing code is in
// grove-canvas.ts. The tree algorithm is a port of the grove mockup and keeps
// its random number order, so the same seed grows the same tree.

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

// The season follows the visitor's local date (Northern Hemisphere).
export function seasonFor(d: Date): Season {
  const month = d.getMonth() // 0 = January
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

// mulberry32: a small seeded generator. It returns numbers in [0, 1).
export function rng(seed: number): () => number {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface Leaf {
  t: number // position along the branch, 0..1
  side: number // sideways offset and turn
  s: number // size factor
  c: number // colour index in a palette, 0..3
  fall: number // a leaf with a high value falls first when the tree wilts
  mix: number // a low value borrows the colour of another palette
}

export interface Branch {
  ang: number // angle to the parent, in radians
  len: number // length relative to the trunk
  d: number // depth, 0 for the trunk
  ph: number // sway phase
  kids: Branch[]
  leaves: Leaf[]
}

export interface Tree {
  root: Branch
  maxDepth: number
}

function makeLeaf(r: () => number): Leaf {
  return {
    t: 0.35 + r() * 0.65,
    side: (r() - 0.5) * 2.4,
    s: 0.7 + r() * 0.6,
    c: Math.floor(r() * 4),
    fall: r(),
    mix: r(),
  }
}

// maturity 0..1: a higher value grows more levels of branches.
export function buildTree(seed: number, maturity: number): Tree {
  const r = rng(seed)
  const maxDepth = 4 + Math.round(maturity * 3)

  function grow(ang: number, len: number, d: number): Branch {
    const branch: Branch = { ang, len, d, kids: [], leaves: [], ph: r() * 6.28 }
    if (d >= maxDepth - 1 || (d > 3 && r() < 0.12)) {
      const count = 3 + Math.floor(r() * 4)
      for (let i = 0; i < count; i++) branch.leaves.push(makeLeaf(r))
    }
    if (d < maxDepth) {
      const n = d === 0 ? 2 : r() < 0.55 ? 2 : 3
      const spread = 0.38 + r() * 0.28
      for (let i = 0; i < n; i++) {
        branch.kids.push(
          grow(
            (i - (n - 1) / 2) * spread + (r() - 0.5) * 0.35,
            len * (0.7 + r() * 0.12),
            d + 1,
          ),
        )
      }
    }
    return branch
  }

  return { root: grow((r() - 0.5) * 0.12, 1, 0), maxDepth }
}

// kind picks the leaf palette: LEAF_PALETTES[season][kind].
export interface GroveTreeSpec {
  seed: number
  maturity: number
  kind: 0 | 1 | 2 | 3
}

// The five trees of the grove, in drawing order.
export const GROVE_TREES: readonly GroveTreeSpec[] = [
  { seed: 7, maturity: 0.85, kind: 0 },
  { seed: 19, maturity: 0.55, kind: 2 },
  { seed: 33, maturity: 0.7, kind: 1 },
  { seed: 41, maturity: 0.4, kind: 3 },
  { seed: 58, maturity: 0.25, kind: 1 },
]

// Leaf colours per season: four palettes (one per kind) of four colours.
// Winter has bare branches, so it has no leaf colours.
export const LEAF_PALETTES: Record<Season, string[][] | null> = {
  spring: [
    ['#F1C3CC', '#E8A7B5', '#F6DCE1', '#E2B8C4'],
    ['#9DBF6E', '#B1CF80', '#C3DB93', '#8AB25D'],
    ['#F6E7EA', '#EFD0D6', '#A7C77A', '#E9B9C3'],
    ['#B5D18A', '#9DBF6E', '#C9DE9F', '#F1C3CC'],
  ],
  summer: [
    ['#2F5128', '#3E5F2E', '#4A6B35', '#57783B'],
    ['#4F6F34', '#5F7F3A', '#6F8F42', '#7E9A4A'],
    ['#3B5E45', '#4A6B4F', '#5A7A55', '#6C8A5A'],
    ['#5E7A34', '#6E8B3D', '#82A04A', '#93AE58'],
  ],
  autumn: [
    ['#8E2622', '#A8312A', '#B9402E', '#C9553A'],
    ['#B9502A', '#CC662E', '#DB7E34', '#E3953E'],
    ['#B88A1C', '#C99E25', '#D8B235', '#E2C24C'],
    ['#5F7F3A', '#8C963C', '#B49E33', '#C98F2E'],
  ],
  winter: null,
}

// Light theme colours of the scene (the site has no dark theme).
export const INK = {
  ink: '#1C1B18',
  rule: '#CEC7B9',
  ink4: '#948D82',
  grey: '#B7B1A6',
  paper: '#FDFCFA',
  snow: '#A9A398',
}

// ───────── layout ─────────

// x is a fraction (0..1) of the canvas width. scale 1 is the largest tree;
// the canvas code picks the pixel size. row 1 is the back row.
export interface TreeSlot {
  x: number
  scale: number
  row: 0 | 1
}

// flank: the grove stands left and right of the text column.
// strip: all trees stand in one row.
export type GroveLayout = 'flank' | 'strip'

const FLANK_MIN_WIDTH = 1280
export const TEXT_HALF_WIDTH = 384 // half of the text column (max-w-3xl, 768 px)

export function layoutFor(width: number): GroveLayout {
  return width >= FLANK_MIN_WIDTH ? 'flank' : 'strip'
}

interface SlotPlan {
  scale: number
  row: 0 | 1
  side: -1 | 1 // flank: left (-1) or right (1) of the text column
  edge: number // flank: 0 at the text column, 1 at the canvas edge
  stripX: number // strip: x as a fraction of the width
}

// Same order as GROVE_TREES. Two trees on the left, three on the right. At
// 1280 px a side is 256 px wide, so edge 0.28 is 72 px from the column: the
// tree centre keeps the 40 px minimum gap at every flank width.
const SLOT_PLANS: readonly SlotPlan[] = [
  { scale: 1, row: 0, side: -1, edge: 0.35, stripX: 0.16 },
  { scale: 0.75, row: 1, side: 1, edge: 0.28, stripX: 0.33 },
  { scale: 0.9, row: 0, side: 1, edge: 0.52, stripX: 0.5 },
  { scale: 0.7, row: 1, side: -1, edge: 0.72, stripX: 0.67 },
  { scale: 0.55, row: 0, side: 1, edge: 0.76, stripX: 0.84 },
]

export function layoutTrees(width: number): TreeSlot[] {
  if (layoutFor(width) === 'strip') {
    return SLOT_PLANS.map(({ scale, row, stripX }) => ({ x: stripX, scale, row }))
  }
  const sideWidth = width / 2 - TEXT_HALF_WIDTH
  return SLOT_PLANS.map(({ scale, row, side, edge }) => ({
    x: 0.5 + (side * (TEXT_HALF_WIDTH + edge * sideWidth)) / width,
    scale,
    row,
  }))
}
