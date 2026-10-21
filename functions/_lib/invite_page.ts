// HTML for the friend-invite page, /i/<token>. Rendered by the Pages
// Function in functions/i/ with the page shell and helpers of
// share_page.ts (same stylesheet, store buttons, not-found page).
//
// Pure functions only: functions/_lib/invite_page.test.ts runs them with
// `node --test`.

import { PLAY_STORE_URL, WEB_APP_URL } from '../../src/lib/links.ts'
import {
  DEFAULT_OG_IMAGE,
  SITE,
  escapeHtml,
  languageName,
  page,
  renderNotFound,
  renderUnavailable,
  storeButtons,
} from './share_page.ts'

/** What friend_invite_preview returns (supabase/migrations, zenzu repo). */
export interface InvitePreview {
  /** Already resolved: display_name, else "@username", else null. */
  display_name: string | null
  avatar_url: string | null
  target_languages: string[] | null
  is_owner: boolean
}

/** Google Play link. The app reads `invite=<token>` from the install referrer on first launch. */
export function invitePlayStoreUrl(token: string): string {
  return `${PLAY_STORE_URL}&referrer=${encodeURIComponent(`invite=${token}`)}`
}

/** The same link in the web app. */
export function inviteWebAppUrl(token: string): string {
  return `${WEB_APP_URL}/i/${token}`
}

function inviterName(preview: InvitePreview): string | null {
  return preview.display_name?.trim() || null
}

/** "Anna invites you to Zenzu", or "Join me on Zenzu" without a name. */
export function inviteTitle(preview: InvitePreview): string {
  const name = inviterName(preview)
  return name ? `${name} invites you to Zenzu` : 'Join me on Zenzu'
}

/** "Learn German together", "Learn German and French together", or "Learn languages together". */
export function inviteDescription(preview: InvitePreview): string {
  const names = [...new Set((preview.target_languages ?? []).map(languageName).filter((n): n is string => !!n))]
  if (names.length === 0) return 'Learn languages together'
  const languages = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
  return `Learn ${languages} together`
}

// Only an absolute https image goes into <img>.
function avatarUrl(preview: InvitePreview): string | null {
  const url = preview.avatar_url?.trim()
  return url && url.startsWith('https://') ? url : null
}

/** The page for a live invite link. `token` must already match TOKEN_PATTERN. */
export function renderInvitePage(preview: InvitePreview, token: string): string {
  const title = inviteTitle(preview)
  const description = inviteDescription(preview)
  const avatar = avatarUrl(preview)

  const body = `<article class="center">
${avatar ? `<img src="${escapeHtml(avatar)}" alt="" class="avatar" width="96" height="96">` : ''}
<p class="kicker">Friend invite</p>
<h1>${escapeHtml(title)}</h1>
<span class="stroke" aria-hidden="true"></span>
<p class="lead">${escapeHtml(description)}</p>
<div class="cta">
<p class="center ink-lead">Install Zenzu, then tap “Add friend” — you will see each other’s progress.</p>
${storeButtons(invitePlayStoreUrl(token), inviteWebAppUrl(token))}
<p class="center hint">On iPhone: after you install the app, tap the link again.</p>
<p class="center small"><a href="zenzu://i/${token}">Already have Zenzu? Open in the app</a></p>
</div>
</article>`

  return page({
    title: `${title} — Zenzu`,
    ogTitle: title,
    description,
    ogImage: DEFAULT_OG_IMAGE,
    url: `${SITE}/i/${token}`,
    body,
  })
}

/** An unknown, revoked or malformed invite link. */
export function renderInviteNotFound(): string {
  return renderNotFound({
    title: 'Invite not found — Zenzu',
    ogTitle: 'Invite not found',
    description: 'This invite link is no longer active. Ask your friend for a new one.',
    heading: 'This invite is not available',
    lead: 'The link was replaced or never existed. Ask your friend for a new one.',
  })
}

/** The invite could not be loaded (Supabase down or not configured). */
export function renderInviteUnavailable(): string {
  return renderUnavailable({
    ogTitle: 'Join me on Zenzu',
    description: 'An invite to learn languages together in Zenzu.',
    heading: 'The invite did not load',
  })
}
