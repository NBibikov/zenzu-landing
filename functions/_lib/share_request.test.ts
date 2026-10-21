import assert from 'node:assert/strict'
import { test } from 'node:test'

import { shareResponse } from './share_request.ts'

const TOKEN = 'Ab3dEf6hIj9lMn2pQr5tUv'
const ENV = { SUPABASE_URL: 'https://proj.supabase.co/', SUPABASE_ANON_KEY: 'anon-key' }

const PREVIEW = {
  deck_id: 7,
  name: 'Kitchen words',
  description: null,
  language_target: 'de',
  language_native: 'uk',
  cefr_level: null,
  card_count: 3,
  thumbnail_url: null,
  author_display_name: 'Olena',
  is_owner: false,
  samples: [{ front: 'die Pfanne', back: 'сковорідка' }],
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

test('good token: 200 HTML with OG tags, cached for 5 minutes', async () => {
  const { calls, fetcher } = fakeFetch(() => json(PREVIEW))
  const res = await shareResponse(TOKEN, ENV, fetcher)

  assert.equal(res.status, 200)
  assert.equal(res.headers.get('Content-Type'), 'text/html; charset=utf-8')
  assert.equal(res.headers.get('Cache-Control'), 'public, max-age=300')
  const html = await res.text()
  assert.match(html, /<meta property="og:title" content="Kitchen words">/)
  assert.match(html, /<meta property="og:description" content="3 words · German · by Olena">/)

  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'https://proj.supabase.co/rest/v1/rpc/deck_share_preview')
  assert.equal(calls[0].init.method, 'POST')
  assert.deepEqual(JSON.parse(calls[0].init.body as string), { p_token: TOKEN })
  const headers = calls[0].init.headers as Record<string, string>
  assert.equal(headers.apikey, 'anon-key')
  assert.equal(headers.Authorization, 'Bearer anon-key')
})

test('unknown or revoked token: 404 page', async () => {
  const { fetcher } = fakeFetch(() => json(null))
  const res = await shareResponse(TOKEN, ENV, fetcher)
  assert.equal(res.status, 404)
  assert.ok((await res.text()).includes('href="https://app.zenzu.app"'))
})

test('bad token: 404 without a Supabase call', async () => {
  for (const token of ['abc', `${TOKEN}A`, 'Ab3dEf6hIj9lMn2pQr5tU_', '']) {
    const { calls, fetcher } = fakeFetch(() => json(PREVIEW))
    const res = await shareResponse(token, ENV, fetcher)
    assert.equal(res.status, 404, token)
    assert.equal(calls.length, 0, token)
  }
})

test('token with punctuation glued on by a messenger: redirect to the clean link', async () => {
  for (const token of [`${TOKEN}).`, `${TOKEN},`, `${TOKEN}/`]) {
    const { calls, fetcher } = fakeFetch(() => json(PREVIEW))
    const res = await shareResponse(token, ENV, fetcher)
    assert.equal(res.status, 301, token)
    assert.equal(res.headers.get('Location'), `/s/${TOKEN}`)
    assert.equal(calls.length, 0)
  }
})

test('Supabase error or network failure: 503, not cached', async () => {
  for (const respond of [() => json({ message: 'boom' }, 500), () => Promise.reject(new Error('offline'))]) {
    const { fetcher } = fakeFetch(respond)
    const res = await shareResponse(TOKEN, ENV, fetcher)
    assert.equal(res.status, 503)
    assert.equal(res.headers.get('Cache-Control'), 'no-store')
  }
})

test('missing secrets: 503 without a call', async () => {
  const { calls, fetcher } = fakeFetch(() => json(PREVIEW))
  const res = await shareResponse(TOKEN, {}, fetcher)
  assert.equal(res.status, 503)
  assert.equal(calls.length, 0)
})
