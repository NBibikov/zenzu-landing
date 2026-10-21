// Request handling for /s/<token>, apart from the Pages Function wrapper so
// that functions/_lib/share_request.test.ts can run it with a fake fetch.

import {
  TOKEN_PATTERN,
  renderNotFound,
  renderSharePage,
  renderUnavailable,
  type SharePreview,
} from './share_page.ts'

export interface ShareEnv {
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
}

type Fetch = (input: string, init: RequestInit) => Promise<Response>

// A messenger can glue punctuation to the end of a link: "…/s/<token>)." or
// "…/s/<token>,". The 22 characters before it are still the token.
const MANGLED_TOKEN = /^([A-Za-z0-9]{22})[^A-Za-z0-9]+$/

const CACHE_OK = 'public, max-age=300'
// A link can be created a second after someone opened it: do not cache a
// miss for long.
const CACHE_MISS = 'public, max-age=60'
const CACHE_ERROR = 'no-store'

function html(body: string, status: number, cache: string): Response {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': cache },
  })
}

export async function shareResponse(rawToken: string, env: ShareEnv, fetcher: Fetch): Promise<Response> {
  const mangled = MANGLED_TOKEN.exec(rawToken)
  if (mangled) {
    return new Response(null, {
      status: 301,
      headers: { Location: `/s/${mangled[1]}`, 'Cache-Control': CACHE_OK },
    })
  }
  if (!TOKEN_PATTERN.test(rawToken)) return html(renderNotFound(), 404, CACHE_MISS)

  const base = env.SUPABASE_URL?.replace(/\/+$/, '')
  const key = env.SUPABASE_ANON_KEY
  if (!base || !key) return html(renderUnavailable(), 503, CACHE_ERROR)

  let preview: SharePreview | null
  try {
    const res = await fetcher(`${base}/rest/v1/rpc/deck_share_preview`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_token: rawToken }),
    })
    if (!res.ok) return html(renderUnavailable(), 503, CACHE_ERROR)
    preview = (await res.json()) as SharePreview | null
  } catch {
    return html(renderUnavailable(), 503, CACHE_ERROR)
  }

  if (!preview || typeof preview !== 'object') return html(renderNotFound(), 404, CACHE_MISS)
  return html(renderSharePage(preview, rawToken), 200, CACHE_OK)
}
