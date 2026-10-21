// Request handling for /i/<token>, apart from the Pages Function wrapper so
// that functions/_lib/invite_request.test.ts can run it with a fake fetch.

import { renderInviteNotFound, renderInvitePage, renderInviteUnavailable, type InvitePreview } from './invite_page.ts'
import { linkPreviewResponse, type Fetch, type LinkPage, type ShareEnv } from './share_request.ts'

const INVITE_PAGE: LinkPage<InvitePreview> = {
  path: '/i',
  rpc: 'friend_invite_preview',
  // Shorter than /s/: after "New link" the old link must die fast.
  cacheOk: 'public, max-age=60',
  render: renderInvitePage,
  notFound: renderInviteNotFound,
  unavailable: renderInviteUnavailable,
}

export async function inviteResponse(param: string, env: ShareEnv, fetcher: Fetch): Promise<Response> {
  return linkPreviewResponse(INVITE_PAGE, param, env, fetcher)
}
