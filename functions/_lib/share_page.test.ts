import assert from 'node:assert/strict'
import { test } from 'node:test'

import { renderNotFound, renderSharePage, shareDescription, type SharePreview } from './share_page.ts'

const TOKEN = 'Ab3dEf6hIj9lMn2pQr5tUv'

function preview(overrides: Partial<SharePreview> = {}): SharePreview {
  return {
    deck_id: 7,
    name: 'Kitchen words',
    description: 'Things you cook with.',
    language_target: 'en',
    language_native: 'uk',
    cefr_level: 'A2',
    card_count: 24,
    thumbnail_url: 'https://cdn.example.com/cover.webp',
    author_display_name: '@olena',
    is_owner: false,
    samples: [
      { front: 'pan', back: 'сковорідка' },
      { front: 'knife', back: 'ніж' },
    ],
    ...overrides,
  }
}

test('og:title is the deck name', () => {
  assert.match(renderSharePage(preview(), TOKEN), /<meta property="og:title" content="Kitchen words">/)
})

test('og:description is "<n> words · <Language> · by <author>"', () => {
  const html = renderSharePage(preview(), TOKEN)
  assert.match(html, /<meta property="og:description" content="24 words · English · by @olena">/)
})

test('author falls back to "a Zenzu learner"', () => {
  assert.equal(shareDescription(preview({ author_display_name: null })), '24 words · English · by a Zenzu learner')
  assert.equal(shareDescription(preview({ author_display_name: '  ' })), '24 words · English · by a Zenzu learner')
})

test('one card is "1 word"', () => {
  assert.equal(shareDescription(preview({ card_count: 1 })), '1 word · English · by @olena')
})

test('og:image is the thumbnail, or the site image without one', () => {
  assert.match(renderSharePage(preview(), TOKEN), /<meta property="og:image" content="https:\/\/cdn\.example\.com\/cover\.webp">/)
  assert.match(
    renderSharePage(preview({ thumbnail_url: null }), TOKEN),
    /<meta property="og:image" content="https:\/\/zenzu\.app\/og-default\.png">/,
  )
  // Not an absolute https URL: not used.
  assert.match(
    renderSharePage(preview({ thumbnail_url: 'javascript:alert(1)' }), TOKEN),
    /<meta property="og:image" content="https:\/\/zenzu\.app\/og-default\.png">/,
  )
})

test('deck name, author and samples are HTML-escaped', () => {
  const html = renderSharePage(
    preview({
      name: '<script>alert(1)</script>',
      author_display_name: '"><img src=x>',
      samples: [{ front: '<b>bold</b>', back: 'a & b' }],
    }),
    TOKEN,
  )
  assert.ok(!html.includes('<script>alert(1)</script>'))
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'))
  assert.ok(!html.includes('"><img src=x>'))
  assert.ok(html.includes('&lt;b&gt;bold&lt;/b&gt;'))
  assert.ok(html.includes('a &amp; b'))
})

test('sample words are shown, at most five', () => {
  const samples = Array.from({ length: 7 }, (_, i) => ({ front: `front${i}`, back: `back${i}` }))
  const html = renderSharePage(preview({ samples }), TOKEN)
  assert.ok(html.includes('front4'))
  assert.ok(!html.includes('front5'))
})

test('Google Play link carries the share referrer', () => {
  assert.ok(renderSharePage(preview(), TOKEN).includes(`referrer=share%3D${TOKEN}`))
})

test('web link opens the same token in the web app', () => {
  assert.ok(renderSharePage(preview(), TOKEN).includes(`href="https://app.zenzu.app/s/${TOKEN}"`))
})

test('app link and App Store link are present', () => {
  const html = renderSharePage(preview(), TOKEN)
  assert.ok(html.includes(`href="zenzu://s/${TOKEN}"`))
  assert.ok(html.includes('https://apps.apple.com/app/'))
})

test('iOS hint is present', () => {
  assert.ok(renderSharePage(preview(), TOKEN).includes('after you install the app, tap the link again'))
})

test('report link is present', () => {
  assert.ok(renderSharePage(preview(), TOKEN).includes(`mailto:hello@zenzu.app?subject=Report%20shared%20deck%20${TOKEN}`))
})

test('not-found page links to the app', () => {
  const html = renderNotFound()
  assert.ok(html.includes('href="https://app.zenzu.app"'))
  assert.match(html, /<meta name="robots" content="noindex">/)
})
