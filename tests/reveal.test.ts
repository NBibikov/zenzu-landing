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
  for (const selector of selectors) {
    const withoutComments = selector.replace(/\/\*[\s\S]*?\*\//g, '').trim()
    assert.match(withoutComments, /^html\.js /, `"${withoutComments}" is not gated by html.js`)
  }
})

test('the layout sets html.js before any other script and reveals once', () => {
  const layout = read('layouts/BaseLayout.astro')
  const firstScript = layout.indexOf('<script')
  assert.ok(firstScript > 0)
  assert.match(layout.slice(firstScript), /^<script is:inline>document\.documentElement\.classList\.add\('js'\)<\/script>/)
  assert.match(layout, /threshold: 0\.15/)
  assert.match(layout, /classList\.add\('is-in'\)/)
  assert.match(layout, /observer\.unobserve\(entry\.target\)/)
})
