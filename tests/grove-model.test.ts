import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  buildTree,
  GROVE_TREES,
  INK,
  keepLeaf,
  LEAF_PALETTES,
  LEAF_SPARSE_SIZE,
  LEAF_THIN_SIZE,
  leafStep,
  layoutTrees,
  rng,
  seasonFor,
  type Branch,
  type Leaf,
} from '../src/lib/grove-model.ts'

// Date parts are local: the season follows the visitor's local date.
test('seasonFor maps months to seasons', () => {
  assert.equal(seasonFor(new Date(2026, 2, 1)), 'spring')
  assert.equal(seasonFor(new Date(2026, 7, 31)), 'summer')
  assert.equal(seasonFor(new Date(2026, 10, 15)), 'autumn')
  assert.equal(seasonFor(new Date(2026, 11, 1)), 'winter')
  assert.equal(seasonFor(new Date(2027, 1, 28)), 'winter')
})

test('rng gives the same sequence for the same seed, in [0, 1)', () => {
  const a = rng(7)
  const b = rng(7)
  const first = Array.from({ length: 10 }, () => a())
  const second = Array.from({ length: 10 }, () => b())
  assert.deepEqual(first, second)
  for (const value of first) {
    assert.ok(value >= 0 && value < 1, `${value} is outside [0, 1)`)
  }
})

// Fixed values from the mockup's mulberry32. They catch any change to the port.
test('rng matches the mockup sequence', () => {
  const next = rng(7)
  assert.deepEqual(
    [next(), next(), next()],
    [0.011704753153026104, 0.06195825757458806, 0.97690763277933],
  )
})

test('buildTree is deterministic and maxDepth follows maturity', () => {
  assert.deepEqual(buildTree(7, 0.85), buildTree(7, 0.85))
  assert.equal(buildTree(7, 0.85).maxDepth, 4 + Math.round(0.85 * 3))
  assert.ok(buildTree(7, 0.25).maxDepth < buildTree(7, 0.85).maxDepth)
})

function count(branch: Branch): { branches: number; leaves: number } {
  return branch.kids.reduce(
    (sum, kid) => {
      const inner = count(kid)
      return { branches: sum.branches + inner.branches, leaves: sum.leaves + inner.leaves }
    },
    { branches: 1, leaves: branch.leaves.length },
  )
}

// Fixed totals from the mockup's buildTree(7, 0.85).
test('buildTree matches the mockup tree for seed 7', () => {
  const tree = buildTree(7, 0.85)
  assert.deepEqual(count(tree.root), { branches: 460, leaves: 1746 })
})

test('buildTree gives each branch its depth and keeps leaf values in range', () => {
  const walk = (branch: Branch, depth: number): void => {
    assert.equal(branch.d, depth)
    for (const leaf of branch.leaves) {
      assert.ok(leaf.t >= 0.35 && leaf.t < 1)
      assert.ok(Number.isInteger(leaf.c) && leaf.c >= 0 && leaf.c < 4)
      assert.ok(leaf.fall >= 0 && leaf.fall < 1)
      assert.ok(leaf.mix >= 0 && leaf.mix < 1)
    }
    for (const kid of branch.kids) walk(kid, depth + 1)
  }
  for (const { seed, maturity } of GROVE_TREES) {
    const tree = buildTree(seed, maturity)
    assert.equal(tree.root.d, 0)
    walk(tree.root, 0)
  }
})

test('GROVE_TREES lists the five trees', () => {
  assert.deepEqual(
    GROVE_TREES.map((tree) => [tree.seed, tree.maturity, tree.kind]),
    [
      [7, 0.85, 0],
      [19, 0.55, 2],
      [33, 0.7, 1],
      [41, 0.4, 3],
      [58, 0.25, 1],
    ],
  )
})

test('layoutTrees(1440) puts 2 trees left and 3 right, clear of the text column', () => {
  const slots = layoutTrees(1440, 'flank')
  assert.equal(slots.length, 5)
  assert.equal(slots.filter((slot) => slot.x < 0.5).length, 2)
  for (const slot of slots) {
    assert.ok(
      Math.abs(slot.x - 0.5) * 1440 >= 384 + 40,
      `x=${slot.x} is too close to the text column`,
    )
  }
})

test('layoutTrees keeps trees clear of the text column at every flank width', () => {
  for (const width of [1280, 1366, 1440, 1920, 2560]) {
    const slots = layoutTrees(width, 'flank')
    assert.equal(slots.length, 5)
    assert.equal(slots.filter((slot) => slot.x < 0.5).length, 2, `width ${width}`)
    for (const slot of slots) {
      assert.ok(slot.x > 0 && slot.x < 1, `width ${width}: x=${slot.x} is off the canvas`)
      assert.ok(
        Math.abs(slot.x - 0.5) * width >= 384 + 40,
        `width ${width}: x=${slot.x} is too close to the text column`,
      )
    }
  }
})

test('layoutTrees takes the layout and the column width from the caller', () => {
  // A 1280 px viewport with a 15 px scrollbar: CSS shows flank, the canvas is 1265 px.
  const scrollbar = layoutTrees(1265, 'flank', 384)
  assert.equal(scrollbar.filter((slot) => slot.x < 0.5).length, 2)
  // A 20 px root font: the column is 960 px, the canvas 1585 px.
  for (const [width, columnHalf] of [[1265, 384], [1585, 480], [1920, 480]]) {
    for (const slot of layoutTrees(width, 'flank', columnHalf)) {
      assert.ok(
        Math.abs(slot.x - 0.5) * width >= columnHalf + 40,
        `width ${width}, column ${columnHalf * 2}: x=${slot.x} is too close to the column`,
      )
    }
  }
  // The strip does not depend on the width.
  assert.deepEqual(layoutTrees(1440, 'strip'), layoutTrees(390, 'strip'))
})

test('layoutTrees(390) lines the trees up in a strip', () => {
  const slots = layoutTrees(390, 'strip')
  assert.equal(slots.length, 5)
  slots.forEach((slot, index) => {
    assert.ok(slot.x >= 0.08 && slot.x <= 0.92, `x=${slot.x} is outside [0.08, 0.92]`)
    if (index > 0) assert.ok(slot.x > slots[index - 1].x, 'x must increase')
  })
})

test('layoutTrees gives the same strip at every width and sets scale and row', () => {
  assert.deepEqual(layoutTrees(1279, 'strip'), layoutTrees(390, 'strip'))
  for (const [width, layout] of [[390, 'strip'], [1279, 'strip'], [1280, 'flank'], [1440, 'flank']] as const) {
    for (const slot of layoutTrees(width, layout)) {
      assert.ok(slot.scale > 0 && slot.scale <= 1, `scale ${slot.scale}`)
      assert.ok(slot.row === 0 || slot.row === 1, `row ${slot.row}`)
    }
  }
})

function allLeaves(branch: Branch): Leaf[] {
  return [...branch.leaves, ...branch.kids.flatMap(allLeaves)]
}

test('leafStep thins the leaves of small strip trees only', () => {
  assert.ok(LEAF_SPARSE_SIZE < LEAF_THIN_SIZE)
  assert.equal(leafStep(LEAF_THIN_SIZE, 'strip'), 1)
  assert.equal(leafStep(LEAF_THIN_SIZE - 1, 'strip'), 2)
  assert.equal(leafStep(LEAF_SPARSE_SIZE, 'strip'), 2)
  assert.equal(leafStep(LEAF_SPARSE_SIZE - 1, 'strip'), 3)
  // The flank layout is the desktop look: it always keeps every leaf.
  for (const size of [20, 42, 76, 200]) assert.equal(leafStep(size, 'flank'), 1)
})

test('keepLeaf keeps every leaf at step 1 and about one in step otherwise', () => {
  const leaves = GROVE_TREES.flatMap((spec) => allLeaves(buildTree(spec.seed, spec.maturity).root))
  assert.ok(leaves.length > 1000)
  assert.ok(leaves.every((leaf) => keepLeaf(leaf, 1)))
  for (const step of [2, 3]) {
    const share = leaves.filter((leaf) => keepLeaf(leaf, step)).length / leaves.length
    assert.ok(Math.abs(share - 1 / step) < 0.05, `step ${step}: share ${share}`)
  }
})

test('keepLeaf depends only on the leaf, so the choice never flickers', () => {
  const a = allLeaves(buildTree(7, 0.85).root)
  const b = allLeaves(buildTree(7, 0.85).root)
  // Same leaves in another order (as when branches finish growing in a
  // different order): the same leaves are kept.
  const kept = (leaves: Leaf[]) => leaves.filter((leaf) => keepLeaf(leaf, 3)).map((leaf) => leaf.fall).sort()
  assert.deepEqual(kept(a), kept([...b].reverse()))
})

test('LEAF_PALETTES has four palettes of four colours, except bare winter', () => {
  assert.equal(LEAF_PALETTES.winter, null)
  for (const season of ['spring', 'summer', 'autumn'] as const) {
    const palettes = LEAF_PALETTES[season]
    assert.ok(palettes)
    assert.equal(palettes.length, 4)
    for (const palette of palettes) {
      assert.equal(palette.length, 4)
      for (const hex of palette) assert.match(hex, /^#[0-9A-F]{6}$/)
    }
  }
})

test('INK holds the light theme colours', () => {
  assert.deepEqual(INK, {
    ink: '#1C1B18',
    rule: '#CEC7B9',
    ink4: '#948D82',
    grey: '#B7B1A6',
    paper: '#FDFCFA',
    snow: '#A9A398',
  })
})
