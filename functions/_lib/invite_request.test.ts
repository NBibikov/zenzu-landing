import assert from 'node:assert/strict'
import { test } from 'node:test'

import { inviteResponse } from './invite_request.ts'

const TOKEN = 'Ab3dEf6hIj9lMn2pQr5tUv'
const ENV = { SUPABASE_URL: 'https://proj.supabase.co/', SUPABASE_ANON_KEY: 'anon-key' }

const PREVIEW = {
  display_name: 'Anna',
  avatar_url: null,
  target_languages: ['de'],
  is_owner: false,
}

interface Call {
  url: string
  init: RequestInit
}

function fakeFetch(respond: () => Response | Promise<Response>) {
  const calls: Call[] = []
  const fetcher = async (url: string, init: RequestInit) => {
    calls.push({ url, init })
    return respond()
  }
  return { calls, fetcher }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

test('good token: 200 HTML with OG tags, cached for 60 seconds', async () => {
  const { calls, fetcher } = fakeFetch(() => json(PREVIEW))
  const res = await inviteResponse(TOKEN, ENV, fetcher)

  assert.equal(res.status, 200)
  assert.equal(res.headers.get('Content-Type'), 'text/html; charset=utf-8')
  assert.equal(res.headers.get('Cache-Control'), 'public, max-age=60')
  const html = await res.text()
  assert.match(html, /<meta property="og:title" content="Anna invites you to Zenzu">/)
  assert.match(html, /<meta property="og:description" content="Learn German together">/)

  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'https://proj.supabase.co/rest/v1/rpc/friend_invite_preview')
  assert.equal(calls[0].init.method, 'POST')
  assert.deepEqual(JSON.parse(calls[0].init.body as string), { p_token: TOKEN })
  const headers = calls[0].init.headers as Record<string, string>
  assert.equal(headers.apikey, 'anon-key')
  assert.equal(headers.Authorization, 'Bearer anon-key')
})

test('unknown, revoked or rotated token: invite 404 page', async () => {
  const { fetcher } = fakeFetch(() => json(null))
  const res = await inviteResponse(TOKEN, ENV, fetcher)
  assert.equal(res.status, 404)
  assert.equal(res.headers.get('Cache-Control'), 'public, max-age=60')
  const html = await res.text()
  assert.ok(html.includes('This invite is not available'))
  assert.ok(html.includes('href="https://app.zenzu.app"'))
})

test('bad token: 404 without a Supabase call', async () => {
  for (const token of ['abc', `${TOKEN}A`, 'Ab3dEf6hIj9lMn2pQr5tU_', '']) {
    const { calls, fetcher } = fakeFetch(() => json(PREVIEW))
    const res = await inviteResponse(token, ENV, fetcher)
    assert.equal(res.status, 404, token)
    assert.equal(calls.length, 0, token)
  }
})

test('token with punctuation glued on by a messenger: redirect to the clean /i/ link', async () => {
  for (const token of [`${TOKEN}).`, `${TOKEN},`, `${TOKEN}…`, `${TOKEN}%E2%80%A6`]) {
    const { calls, fetcher } = fakeFetch(() => json(PREVIEW))
    const res = await inviteResponse(token, ENV, fetcher)
    assert.equal(res.status, 301, token)
    assert.equal(res.headers.get('Location'), `/i/${TOKEN}`)
    assert.equal(calls.length, 0)
  }
})

test('Supabase error or network failure: 503 invite page, not cached', async () => {
  for (const respond of [() => json({ message: 'boom' }, 500), () => Promise.reject(new Error('offline'))]) {
    const { fetcher } = fakeFetch(respond)
    const res = await inviteResponse(TOKEN, ENV, fetcher)
    assert.equal(res.status, 503)
    assert.equal(res.headers.get('Cache-Control'), 'no-store')
    assert.ok((await res.text()).includes('The invite did not load'))
  }
})

test('missing secrets: 503 without a call', async () => {
  const { calls, fetcher } = fakeFetch(() => json(PREVIEW))
  const res = await inviteResponse(TOKEN, {}, fetcher)
  assert.equal(res.status, 503)
  assert.equal(calls.length, 0)
})
