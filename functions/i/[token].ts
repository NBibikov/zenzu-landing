// GET /i/<token> — the page for a friend-invite link. The app opens the
// same URL through universal links / app links; this page is for people
// without the app and for messenger link previews.

import { inviteResponse } from '../_lib/invite_request.ts'
import type { ShareEnv } from '../_lib/share_request.ts'

interface Context {
  params: { token?: string }
  env: ShareEnv
}

export async function onRequestGet({ params, env }: Context): Promise<Response> {
  return inviteResponse(params.token ?? '', env, fetch)
}

// Link-preview crawlers can send HEAD first. Without this handler Pages
// serves the static 404 for it.
export async function onRequestHead(context: Context): Promise<Response> {
  const res = await onRequestGet(context)
  return new Response(null, { status: res.status, headers: res.headers })
}
