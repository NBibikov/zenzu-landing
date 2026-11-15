import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

// The reveal is a contract between three files: each block marks its
// inner container with data-reveal, global.css hides it only under html.js,
// and BaseLayout sets html.js and adds is-in. These tests keep that
// contract when a block is rebuilt.

const read = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8')

const BLOCKS = readdirSync(new URL('../src/components/blocks/', import.meta.url))
  .filter((file) => file.endsWith('.astro'))
  .sort()

test('the blocks directory is found', () => {
  assert.ok(BLOCKS.includes('Hero.astro'), BLOCKS.join(', '))
  assert.ok(BLOCKS.length > 1)
})

test('every block except the hero has one data-reveal container', () => {
  for (const file of BLOCKS.filter((name) => name !== 'Hero.astro')) {
    const marks = read(`components/blocks/${file}`).match(/\bdata-reveal\b/g) ?? []
    assert.equal(marks.length, 1, `${file} has ${marks.length} data-reveal attributes`)
  }
})

test('the hero text never animates: no data-reveal in the hero', () => {
  assert.doesNotMatch(read('components/blocks/Hero.astro'), /data-reveal/)
})

test('the hidden start applies only under html.js', () => {
  const css = read('styles/global.css')
  const selectors = [...css.matchAll(/([^{}]*\[data-reveal\][^{}]*)\{/g)].map((match) => match[1])
  assert.ok(selectors.length >= 4, `found ${selectors.length} reveal selectors`)
  for (const group of selectors) {
    const withoutComments = group.replace(/\/\*[\s\S]*?\*\//g, '')
    for (const selector of withoutComments.split(',').map((part) => part.trim())) {
      assert.match(selector, /^html\.js /, `"${selector}" is not gated by html.js`)
    }
  }
})

test('print shows every block and stroke, scrolled into view or not', () => {
  const css = read('styles/global.css')
  const print = css.match(/@media print\s*\{([\s\S]*?)\n\}/)
  assert.ok(print, 'global.css has no @media print rule')
  const rule = print[1]
  assert.match(rule, /html\.js \[data-reveal\]\s*,/)
  assert.match(rule, /html\.js \[data-reveal\] \.zz-stroke\s*\{/)
  assert.match(rule, /opacity: 1;/)
  assert.match(rule, /transform: none;/)
})

test('under reduced motion no block is hidden and nothing transitions', () => {
  const css = read('styles/global.css')
  const motion = css.match(/@media \(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/)
  assert.ok(motion, 'global.css has no prefers-reduced-motion rule')
  const rule = motion[1].match(
    /html\.js \[data-reveal\]\s*,\s*html\.js \[data-reveal\] \.zz-stroke\s*\{([^}]*)\}/,
  )
  assert.ok(rule, 'the reduced-motion rule does not cover the blocks and the strokes')
  assert.match(rule[1], /opacity: 1;/)
  assert.match(rule[1], /transform: none;/)
  assert.match(rule[1], /transition: none;/)
  // The hidden start has the same specificity, so only a later rule wins.
  assert.ok(css.indexOf('html.js [data-reveal] {') < css.indexOf(motion[0]))
})

test('the layout sets html.js before any other script and reveals once', () => {
  const layout = read('layouts/BaseLayout.astro')
  const firstScript = layout.indexOf('<script')
  assert.ok(firstScript > 0)
  assert.match(layout.slice(firstScript), /^<script is:inline>document\.documentElement\.classList\.add\('js'\)<\/script>/)
  // A ratio threshold would never fire for a block taller than the
  // viewport divided by the ratio, so the trigger must not use one.
  assert.match(layout, /threshold: 0,/)
  assert.match(layout, /rootMargin: '0px 0px -10% 0px'/)
  assert.doesNotMatch(layout, /threshold: 0\.\d/)
  assert.match(layout, /!\('IntersectionObserver' in window\)/)
  assert.match(layout, /classList\.add\('is-in'\)/)
  assert.match(layout, /observer\.unobserve\(entry\.target\)/)
})

test('a failed reveal script shows every block', () => {
  const layout = read('layouts/BaseLayout.astro')
  const reveal = layout.slice(layout.indexOf('[data-reveal]'))
  assert.match(reveal, /try \{/)
  assert.match(reveal, /catch \{\s*document\.documentElement\.classList\.remove\('js'\)/)
})

test('a block above the viewport is revealed too', () => {
  // After a deep link or a restored scroll position, blocks above the
  // viewport never intersect it. They must not stay hidden.
  const layout = read('layouts/BaseLayout.astro')
  assert.match(layout, /entry\.isIntersecting \|\| entry\.boundingClientRect\.top < 0/)
})
