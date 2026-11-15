import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  AMBIENT_FALLERS,
  fitSize,
  GROW_MS,
  groveGrownAt,
  leafColor,
  shapeTree,
  STAGGER_MS,
  treeExtent,
  treeGrowth,
} from '../src/lib/grove-canvas.ts'
import {
  buildTree,
  GROVE_TREES,
  LEAF_PALETTES,
  layoutFor,
  layoutTrees,
  TEXT_HALF_WIDTH,
  type Branch,
  type Leaf,
} from '../src/lib/grove-model.ts'

const trees = GROVE_TREES.map((spec) => buildTree(spec.seed, spec.maturity))
const extents = trees.map(treeExtent)

function countBranches(branch: Branch): { branches: number; leaves: number } {
  let branches = 1
  let leaves = branch.leaves.length
  for (const kid of branch.kids) {
    const sub = countBranches(kid)
    branches += sub.branches
    leaves += sub.leaves
  }
  return { branches, leaves }
}

test('treeGrowth is 0 before growth starts and 1 after it ends', () => {
  assert.equal(treeGrowth(5000, null, 0), 0)
  assert.equal(treeGrowth(1000, 1000, 0), 0)
  assert.equal(treeGrowth(1000 + GROW_MS, 1000, 0), 1)
  const half = treeGrowth(1000 + GROW_MS / 2, 1000, 0)
  assert.ok(half > 0.5 && half < 1, `growth ${half}`)
})

test('treeGrowth starts each tree STAGGER_MS after the one before', () => {
  assert.equal(treeGrowth(STAGGER_MS * 2, 0, 2), 0)
  assert.ok(treeGrowth(STAGGER_MS * 2 + 10, 0, 2) > 0)
  assert.equal(treeGrowth(groveGrownAt(0), 0, GROVE_TREES.length - 1), 1)
})

test('AMBIENT_FALLERS has the count for each season', () => {
  assert.deepEqual(AMBIENT_FALLERS, { autumn: 6, spring: 3, winter: 16, summer: 0 })
})

test('leafColor uses the palette of the kind and borrows for a low mix', () => {
  const leaf: Leaf = { t: 0.5, side: 0, s: 1, c: 2, fall: 0.5, mix: 0.9 }
  assert.equal(leafColor('autumn', 1, leaf), LEAF_PALETTES.autumn![1][2])
  // mix 0.1: kind 1 + 1 + (1 % 3) = 3
  assert.equal(leafColor('autumn', 1, { ...leaf, mix: 0.1 }), LEAF_PALETTES.autumn![3][2])
  assert.equal(leafColor('winter', 1, leaf), null)
})

test('shapeTree draws nothing at growth 0 and every branch and leaf at growth 1', () => {
  const tree = trees[0]
  const empty = shapeTree(tree, 50, 100, 120, 0, 0)
  assert.equal(empty.segments.length, 0)
  assert.equal(empty.leaves.length, 0)

  const full = shapeTree(tree, 50, 100, 120, 1, 0)
  const counts = countBranches(tree.root)
  assert.equal(full.segments.length, counts.branches)
  assert.equal(full.leaves.length, counts.leaves)
  assert.deepEqual([full.segments[0].x1, full.segments[0].y1], [50, 100])
})

test('shapeTree grows the trunk before the crown', () => {
  const partial = shapeTree(trees[0], 0, 0, 100, 0.3, 0)
  const counts = countBranches(trees[0].root)
  assert.ok(partial.segments.length > 0 && partial.segments.length < counts.branches)
  assert.equal(partial.leaves.length, 0)
})

test('treeExtent contains the tree shape at any time', () => {
  for (const [i, tree] of trees.entries()) {
    const e = extents[i]
    assert.ok(e.top > 0.8 && e.left > 0.3 && e.right > 0.3, `tree ${i}: ${JSON.stringify(e)}`)
    for (const time of [123, 4567, 9999]) {
      const shape = shapeTree(tree, 0, 0, 1, 1, time)
      for (const s of shape.segments) {
        // The extent samples the sway; allow a small tolerance between samples.
        assert.ok(-s.y2 <= e.top * 1.03, `tree ${i} top at ${time}`)
        assert.ok(s.x2 <= e.right * 1.05 && -s.x2 <= e.left * 1.05, `tree ${i} side at ${time}`)
      }
    }
  }
})

// The canopy (extent plus a leaf) keeps clear of the text column and of the
// canvas edges.
function canopies(width: number, height: number) {
  const slots = layoutTrees(width)
  const size = fitSize(layoutFor(width), width, height - 1, slots, extents)
  return {
    size,
    boxes: slots.map((slot, i) => {
      const s = size * slot.scale
      const cx = slot.x * width
      // The longest leaf (leaf.s = 1.3) at the leaf scale of this tree.
      const leaf = (2.4 * (3.2 + 2.2 * 1.3) * Math.max(s, 110)) / 170
      return {
        x0: cx - extents[i].left * s - leaf,
        x1: cx + extents[i].right * s + leaf,
        top: height - 1 - extents[i].top * s - leaf,
      }
    }),
  }
}

test('fitSize keeps every canopy clear of the text column in the flank layout', () => {
  for (const width of [1280, 1366, 1440, 1920]) {
    const { size, boxes } = canopies(width, 320)
    assert.ok(size >= 75, `width ${width}: size ${size} is too small`)
    const left = width / 2 - TEXT_HALF_WIDTH
    const right = width / 2 + TEXT_HALF_WIDTH
    for (const box of boxes) {
      assert.ok(box.x1 <= left || box.x0 >= right, `width ${width}: canopy over the column`)
      assert.ok(box.x1 <= left - 16 + 1e-9 || box.x0 >= right + 16 - 1e-9, `width ${width}: gap`)
      assert.ok(box.x0 >= 0 && box.x1 <= width, `width ${width}: canopy off the canvas`)
      assert.ok(box.top >= 0, `width ${width}: canopy above the canvas`)
    }
  }
})

test('fitSize keeps the strip inside its canvas', () => {
  for (const width of [342, 768, 1200]) {
    const { size, boxes } = canopies(width, 140)
    assert.ok(size >= 55, `width ${width}: size ${size} is too small`)
    for (const box of boxes) {
      assert.ok(box.x0 >= 0 && box.x1 <= width, `width ${width}: canopy off the canvas`)
      assert.ok(box.top >= 0, `width ${width}: canopy above the canvas`)
    }
  }
})
