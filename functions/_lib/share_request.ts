// Request handling for /s/<token>, apart from the Pages Function wrapper so
// that functions/_lib/share_request.test.ts can run it with a fake fetch.
// linkPreviewResponse is shared with /i/<token> (invite_request.ts).

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

export type Fetch = (input: string, init: RequestInit) => Promise<Response>

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

// The route parameter can still be percent-encoded ("<token>%E2%80%A6").
function decode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/** One token-link page: which RPC to call and how to render each outcome. */
export interface LinkPage<T> {
  /** URL prefix of the page, for the redirect of a mangled token: "/s". */
  path: string
  /** The preview RPC, called as POST /rest/v1/rpc/<rpc> with { p_token }. */
  rpc: string
  /** Cache-Control of a live page. */
  cacheOk: string
  render: (preview: T, token: string) => string
  notFound: () => string
  unavailable: () => string
}

export async function linkPreviewResponse<T>(
  pageSpec: LinkPage<T>,
  param: string,
  env: ShareEnv,
  fetcher: Fetch,
): Promise<Response> {
  const rawToken = decode(param)
  const mangled = MANGLED_TOKEN.exec(rawToken)
  if (mangled) {
    return new Response(null, {
      status: 301,
      headers: { Location: `${pageSpec.path}/${mangled[1]}`, 'Cache-Control': pageSpec.cacheOk },
    })
  }
  if (!TOKEN_PATTERN.test(rawToken)) return html(pageSpec.notFound(), 404, CACHE_MISS)

  const base = env.SUPABASE_URL?.replace(/\/+$/, '')
  const key = env.SUPABASE_ANON_KEY
  if (!base || !key) return html(pageSpec.unavailable(), 503, CACHE_ERROR)

  let preview: T | null
  try {
    const res = await fetcher(`${base}/rest/v1/rpc/${pageSpec.rpc}`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_token: rawToken }),
    })
    if (!res.ok) return html(pageSpec.unavailable(), 503, CACHE_ERROR)
    preview = (await res.json()) as T | null
  } catch {
    return html(pageSpec.unavailable(), 503, CACHE_ERROR)
  }

  if (!preview || typeof preview !== 'object') return html(pageSpec.notFound(), 404, CACHE_MISS)
  return html(pageSpec.render(preview, rawToken), 200, pageSpec.cacheOk)
}

const SHARE_PAGE: LinkPage<SharePreview> = {
  path: '/s',
  rpc: 'deck_share_preview',
  cacheOk: CACHE_OK,
  render: renderSharePage,
  notFound: () => renderNotFound(),
  unavailable: () => renderUnavailable(),
}

export async function shareResponse(param: string, env: ShareEnv, fetcher: Fetch): Promise<Response> {
  return linkPreviewResponse(SHARE_PAGE, param, env, fetcher)
}
