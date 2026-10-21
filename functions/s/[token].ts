// GET /s/<token> — the preview page for a shared deck. The app opens the
// same URL through universal links / app links; this page is for people
// without the app and for messenger link previews.

import { shareResponse, type ShareEnv } from '../_lib/share_request.ts'

interface Context {
  params: { token?: string | string[] }
  env: ShareEnv
}

export async function onRequestGet({ params, env }: Context): Promise<Response> {
  const token = Array.isArray(params.token) ? params.token.join('/') : (params.token ?? '')
  return shareResponse(token, env, fetch)
}
