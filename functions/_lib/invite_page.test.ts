import assert from 'node:assert/strict'
import { test } from 'node:test'

import { inviteDescription, renderInviteNotFound, renderInvitePage, type InvitePreview } from './invite_page.ts'

const TOKEN = 'Ab3dEf6hIj9lMn2pQr5tUv'

function preview(overrides: Partial<InvitePreview> = {}): InvitePreview {
  return {
    display_name: 'Anna',
    avatar_url: 'https://cdn.example.com/anna.webp',
    target_languages: ['de'],
    is_owner: false,
    ...overrides,
  }
}

test('og:title is "<name> invites you to Zenzu"', () => {
  assert.match(renderInvitePage(preview(), TOKEN), /<meta property="og:title" content="Anna invites you to Zenzu">/)
})

test('og:title falls back to "Join me on Zenzu" without a name', () => {
  for (const display_name of [null, '  ']) {
    assert.match(
      renderInvitePage(preview({ display_name }), TOKEN),
      /<meta property="og:title" content="Join me on Zenzu">/,
    )
  }
})

test('og:description is "Learn <languages> together"', () => {
  assert.match(renderInvitePage(preview(), TOKEN), /<meta property="og:description" content="Learn German together">/)
  assert.equal(inviteDescription(preview({ target_languages: ['de', 'fr'] })), 'Learn German and French together')
  assert.equal(
    inviteDescription(preview({ target_languages: ['de', 'fr', 'es'] })),
    'Learn German, French and Spanish together',
  )
  assert.equal(inviteDescription(preview({ target_languages: [] })), 'Learn languages together')
  assert.equal(inviteDescription(preview({ target_languages: null })), 'Learn languages together')
})

test('og:image is the site brand image', () => {
  assert.match(
    renderInvitePage(preview(), TOKEN),
    /<meta property="og:image" content="https:\/\/zenzu\.app\/og-default\.png">/,
  )
})

test('name is HTML-escaped', () => {
  const html = renderInvitePage(preview({ display_name: '<script>alert(1)</script>' }), TOKEN)
  assert.ok(!html.includes('<script>alert(1)</script>'))
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt; invites you to Zenzu'))
})

test('avatar is shown only for an https URL', () => {
  assert.ok(renderInvitePage(preview(), TOKEN).includes('src="https://cdn.example.com/anna.webp"'))
  assert.ok(!renderInvitePage(preview({ avatar_url: 'javascript:alert(1)' }), TOKEN).includes('class="avatar"'))
  assert.ok(!renderInvitePage(preview({ avatar_url: null }), TOKEN).includes('class="avatar"'))
})

test('Google Play link carries the invite referrer', () => {
  assert.ok(renderInvitePage(preview(), TOKEN).includes(`referrer=invite%3D${TOKEN}`))
})

test('web link opens the same token in the web app', () => {
  assert.ok(renderInvitePage(preview(), TOKEN).includes(`href="https://app.zenzu.app/i/${TOKEN}"`))
})

test('app link, App Store link and og:url are present', () => {
  const html = renderInvitePage(preview(), TOKEN)
  assert.ok(html.includes(`href="zenzu://i/${TOKEN}"`))
  assert.ok(html.includes('https://apps.apple.com/app/'))
  assert.match(html, new RegExp(`<meta property="og:url" content="https://zenzu\\.app/i/${TOKEN}">`))
})

test('iOS hint is present', () => {
  assert.ok(renderInvitePage(preview(), TOKEN).includes('after you install the app, tap the link again'))
})

test('not-found page is about an invite and links to the app', () => {
  const html = renderInviteNotFound()
  assert.ok(html.includes('This invite is not available'))
  assert.ok(!html.includes('deck'))
  assert.ok(html.includes('href="https://app.zenzu.app"'))
  assert.match(html, /<meta name="robots" content="noindex">/)
})
