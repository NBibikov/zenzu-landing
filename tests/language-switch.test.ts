import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { languageSwitchPath } from '../src/lib/language-switch.ts'

// The language switch keeps the reader on a page that exists in every
// locale. Any other page sends the reader to the home page of that locale.

test('languageSwitchPath keeps the reader on the blog, contact and MCP pages', () => {
  assert.equal(languageSwitchPath('/blog/'), '/blog/')
  assert.equal(languageSwitchPath('/uk/blog/some-post/'), '/blog/')
  assert.equal(languageSwitchPath('/contact/'), '/contact/')
  assert.equal(languageSwitchPath('/de/contact/'), '/contact/')
  assert.equal(languageSwitchPath('/mcp/'), '/mcp/')
  assert.equal(languageSwitchPath('/uk/mcp/'), '/mcp/')
  assert.equal(languageSwitchPath('/pt/mcp/'), '/mcp/')
})

test('languageSwitchPath sends every other page to the home page', () => {
  assert.equal(languageSwitchPath('/'), '/')
  assert.equal(languageSwitchPath('/fr/'), '/')
  assert.equal(languageSwitchPath('/privacy/'), '/')
  assert.equal(languageSwitchPath('/compare/anki/'), '/')
})

test('the header builds the locale links with languageSwitchPath', () => {
  const header = readFileSync(new URL('../src/components/layout/Header.astro', import.meta.url), 'utf8')
  assert.match(header, /languageSwitchPath\(Astro\.url\.pathname\)/)
  assert.match(header, /localePath\(switchTarget, loc\)/)
})

test('the footer builds the locale links with languageSwitchPath, like the header', () => {
  const footer = readFileSync(new URL('../src/components/layout/Footer.astro', import.meta.url), 'utf8')
  assert.match(footer, /import \{ languageSwitchPath \} from '\.\.\/\.\.\/lib\/language-switch'/)
  assert.match(footer, /languageSwitchPath\(Astro\.url\.pathname\)/)
  assert.match(footer, /localePath\(switchTarget, loc\)/)
  assert.doesNotMatch(footer, /localePath\('\/', loc\)/)
  // The target logic lives in one place: neither layout repeats the regex.
  for (const file of ['Header.astro', 'Footer.astro']) {
    const src = readFileSync(new URL(`../src/components/layout/${file}`, import.meta.url), 'utf8')
    assert.doesNotMatch(src, /mcp\\\//, `${file} repeats the MCP path regex`)
    assert.doesNotMatch(src, /contact\\\/\$/, `${file} repeats the contact path regex`)
  }
})
