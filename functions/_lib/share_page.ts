// HTML for the shared-deck page, /s/<token>. The page is dynamic (one per
// share link), so it is rendered by the Pages Function in functions/s/,
// not by Astro. It cannot use the Astro layout or the built Tailwind CSS
// (their file names are hashed), so it carries its own small stylesheet
// with the tokens from src/styles/global.css. Keep the two in step.
//
// Pure functions only: functions/_lib/share_page.test.ts runs them with
// `node --test`.

import { APP_STORE_URL, PLAY_STORE_URL, WEB_APP_URL } from '../../src/lib/links.ts'

/** What deck_share_preview returns (supabase/migrations, zenzu repo). */
export interface SharePreview {
  deck_id: number
  name: string
  description: string | null
  language_target: string | null
  language_native: string | null
  cefr_level: string | null
  card_count: number
  thumbnail_url: string | null
  author_display_name: string | null
  is_owner: boolean
  samples: { front: string; back: string }[]
}

/** A share token: 22 characters from [A-Za-z0-9]. Same rule as the app. */
export const TOKEN_PATTERN = /^[A-Za-z0-9]{22}$/

export const SITE = 'https://zenzu.app'
export const DEFAULT_OG_IMAGE = `${SITE}/og-default.png`
const CONTACT_EMAIL = 'hello@zenzu.app'
const AUTHOR_FALLBACK = 'a Zenzu learner'

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Google Play link. The app reads `share=<token>` from the install referrer on first launch. */
export function playStoreUrl(token: string): string {
  return `${PLAY_STORE_URL}&referrer=${encodeURIComponent(`share=${token}`)}`
}

/** The same link in the web app. */
export function webAppUrl(token: string): string {
  return `${WEB_APP_URL}/s/${token}`
}

const LANGUAGE_NAMES = new Intl.DisplayNames(['en'], { type: 'language' })

/** "English" for "en". Falls back to the code when the runtime has no name for it. */
export function languageName(code: string | null): string | null {
  if (!code) return null
  try {
    const name = LANGUAGE_NAMES.of(code)
    if (name && name !== code) return name
  } catch {
    // An invalid language tag: show the code.
  }
  return code.toUpperCase()
}

/** "24 words" or "1 word". */
function wordCount(preview: SharePreview): string {
  return `${preview.card_count} ${preview.card_count === 1 ? 'word' : 'words'}`
}

function authorName(preview: SharePreview): string {
  return preview.author_display_name?.trim() || AUTHOR_FALLBACK
}

/** "24 words · English · by @name". */
export function shareDescription(preview: SharePreview): string {
  const language = languageName(preview.language_target)
  return [wordCount(preview), language, `by ${authorName(preview)}`].filter(Boolean).join(' · ')
}

// Only an absolute https image goes into og:image and <img>.
function imageUrl(preview: SharePreview): string | null {
  const url = preview.thumbnail_url?.trim()
  return url && url.startsWith('https://') ? url : null
}

export interface PageOptions {
  title: string
  description: string
  ogTitle: string
  ogImage: string
  url: string
  body: string
}

/** The page shell: head with OG tags, brand header, styles. `body` is raw HTML. */
export function page(o: PageOptions): string {
  const title = escapeHtml(o.title)
  const ogTitle = escapeHtml(o.ogTitle)
  const description = escapeHtml(o.description)
  const ogImage = escapeHtml(o.ogImage)
  const url = escapeHtml(o.url)
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="noindex">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${ogTitle}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${ogImage}">
<meta property="og:site_name" content="Zenzu">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${ogTitle}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${ogImage}">
<link rel="icon" type="image/png" href="/zenzu-icon.png">
<link rel="apple-touch-icon" href="/zenzu-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:wght@400..600&family=Golos+Text:wght@400..600&display=swap">
<style>${STYLES}</style>
</head>
<body>
<header class="top"><a href="/" class="brand"><img src="/zenzu-icon.png" width="28" height="28" alt="">Zenzu</a></header>
<main>${o.body}</main>
</body>
</html>
`
}

/** App Store, Google Play (with an install referrer) and web-app buttons. */
export function storeButtons(playUrl: string, webUrl: string): string {
  return `<div class="buttons">
<a href="${APP_STORE_URL}" class="btn" rel="noopener">App Store</a>
<a href="${escapeHtml(playUrl)}" class="btn" rel="noopener">Google Play</a>
<a href="${escapeHtml(webUrl)}" class="btn btn-cancel" rel="noopener">Open on the web</a>
</div>`
}

/** The preview page for a live share link. `token` must already match TOKEN_PATTERN. */
export function renderSharePage(preview: SharePreview, token: string): string {
  const name = preview.name?.trim() || 'Shared deck'
  const description = shareDescription(preview)
  const image = imageUrl(preview)
  const kicker = [languageName(preview.language_target), preview.cefr_level, wordCount(preview)].filter(Boolean).join(' · ')
  const author = authorName(preview)
  const samples = (preview.samples ?? []).slice(0, 5)
  const lang = preview.language_target ? ` lang="${escapeHtml(preview.language_target)}"` : ''
  const report = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Report shared deck ${token}`)}`

  const body = `<article>
${image ? `<img src="${escapeHtml(image)}" alt="" class="cover" fetchpriority="high">` : ''}
<p class="kicker">${escapeHtml(kicker)}</p>
<h1>${escapeHtml(name)}</h1>
<span class="stroke" aria-hidden="true"></span>
<p class="lead">Shared by ${escapeHtml(author)}</p>
${preview.description?.trim() ? `<p class="text">${escapeHtml(preview.description.trim())}</p>` : ''}
${samples.length > 0 ? `<section aria-labelledby="first-words">
<h2 id="first-words" class="kicker label">First words</h2>
<ul class="words">
${samples.map((s) => `<li><span${lang} class="term">${escapeHtml(s.front ?? '')}</span><span class="gloss">${escapeHtml(s.back ?? '')}</span></li>`).join('\n')}
</ul>
</section>` : ''}
<div class="cta">
<p class="center ink-lead">Add this deck to Zenzu — the cards are ready to review.</p>
${storeButtons(playStoreUrl(token), webAppUrl(token))}
<p class="center hint">On iPhone: after you install the app, tap the link again.</p>
<p class="center small"><a href="zenzu://s/${token}">Already have Zenzu? Open in the app</a></p>
<p class="center small"><a href="${escapeHtml(report)}">Report this deck</a></p>
</div>
</article>`

  return page({
    title: `${name} — Zenzu deck`,
    ogTitle: name,
    description,
    ogImage: image ?? DEFAULT_OG_IMAGE,
    url: `${SITE}/s/${token}`,
    body,
  })
}

/** The texts of a not-found page. */
export interface NotFoundCopy {
  title: string
  ogTitle: string
  description: string
  heading: string
  lead: string
}

const DECK_NOT_FOUND: NotFoundCopy = {
  title: 'Deck not found — Zenzu',
  ogTitle: 'Deck not found',
  description: 'This link is no longer active. Zenzu has many other ready-made decks.',
  heading: 'This deck is not available',
  lead: 'The link was revoked or never existed. Zenzu has many other ready-made decks.',
}

/** An unknown, revoked or malformed link. The texts default to a shared deck. */
export function renderNotFound(copy: NotFoundCopy = DECK_NOT_FOUND): string {
  return page({
    title: copy.title,
    ogTitle: copy.ogTitle,
    description: copy.description,
    ogImage: DEFAULT_OG_IMAGE,
    url: `${SITE}/`,
    body: `<article class="center">
<p class="kicker">404</p>
<h1>${escapeHtml(copy.heading)}</h1>
<p class="lead">${escapeHtml(copy.lead)}</p>
<div class="buttons">
<a href="${APP_STORE_URL}" class="btn" rel="noopener">App Store</a>
<a href="${PLAY_STORE_URL}" class="btn" rel="noopener">Google Play</a>
<a href="${WEB_APP_URL}" class="btn btn-cancel" rel="noopener">Open Zenzu</a>
</div>
</article>`,
  })
}

/** The texts of a page that could not load. */
export interface UnavailableCopy {
  ogTitle: string
  description: string
  heading: string
}

const DECK_UNAVAILABLE: UnavailableCopy = {
  ogTitle: 'A shared Zenzu deck',
  description: 'A deck shared in Zenzu.',
  heading: 'The deck did not load',
}

/** The preview could not be loaded (Supabase down or not configured). The texts default to a shared deck. */
export function renderUnavailable(copy: UnavailableCopy = DECK_UNAVAILABLE): string {
  return page({
    title: 'Zenzu',
    ogTitle: copy.ogTitle,
    description: copy.description,
    ogImage: DEFAULT_OG_IMAGE,
    url: `${SITE}/`,
    body: `<article class="center">
<h1>${escapeHtml(copy.heading)}</h1>
<p class="lead">Something went wrong on our side. Reload the page in a minute.</p>
<div class="buttons"><a href="${WEB_APP_URL}" class="btn btn-cancel" rel="noopener">Open Zenzu</a></div>
</article>`,
  })
}

// Tokens and components from src/styles/global.css (zz-btn, zz-kicker,
// zz-stroke) and the layout of src/pages/d/[lang]/[slug].astro.
const STYLES = `
:root{--paper:#FDFCFA;--hairline:#E9E5DC;--ink:#1C1B18;--ink-lead:#45413A;--ink-2:#5F5A50;--ink-3:#746F63;--moss:#5B7052;--serif:'Lora',Georgia,'Times New Roman',serif;--sans:'Golos Text',system-ui,-apple-system,sans-serif}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans);font-size:1rem;line-height:1.625;-webkit-font-smoothing:antialiased}
a{color:inherit}
:focus-visible{outline:2px solid var(--ink);outline-offset:3px}
.top{max-width:36rem;margin:0 auto;padding:1.5rem 1.5rem 0}
.brand{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--serif);font-size:1.25rem;font-weight:500;text-decoration:none}
.brand img{border-radius:6px}
main{padding:3rem 0 6rem}
article{max-width:36rem;margin:0 auto;padding:0 1.5rem}
h1,h2{font-family:var(--serif);font-weight:500;letter-spacing:-.01em}
h1{font-size:clamp(1.875rem,5vw,2.25rem);line-height:1.2;margin:0}
.cover{display:block;width:100%;height:auto;border-radius:16px;border:1px solid var(--hairline);margin-bottom:2rem}
.kicker{font-family:var(--sans);font-size:.75rem;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-3);margin:0 0 .75rem}
.label{color:var(--ink);margin-top:2.5rem}
.stroke{display:block;width:3rem;height:6px;margin-top:1rem;background-color:var(--moss);-webkit-mask:url('/brush/stroke.webp') center/100% 100% no-repeat;mask:url('/brush/stroke.webp') center/100% 100% no-repeat}
.center .stroke{margin-left:auto;margin-right:auto}
.lead{font-size:1.125rem;color:var(--ink-2);margin:1rem 0 0}
.text{color:var(--ink-2);margin:.75rem 0 0}
.words{list-style:none;margin:0;padding:0;border-top:1px solid var(--hairline)}
.words li{display:flex;flex-direction:column;gap:.25rem;padding:.75rem 0;border-bottom:1px solid var(--hairline)}
.term{font-family:var(--serif);font-size:1.125rem;color:var(--ink);overflow-wrap:anywhere}
.gloss{font-size:.875rem;color:var(--ink-2);overflow-wrap:anywhere}
@media (min-width:640px){.words li{flex-direction:row;align-items:baseline;justify-content:space-between;gap:1rem}.gloss{text-align:right}}
.cta{margin-top:3rem}
.center{text-align:center}
.ink-lead{color:var(--ink-lead);margin:0 0 1.25rem}
.hint{font-size:.875rem;color:var(--ink-3);margin:1.5rem 0 0}
.small{font-size:.875rem;color:var(--ink-3);margin:.75rem 0 0}
.small a{text-decoration:underline;text-decoration-color:var(--moss);text-underline-offset:.2em}
.buttons{display:flex;flex-direction:column;gap:.75rem;width:100%;max-width:20rem;margin:2rem auto 0}
.cta .buttons{margin-top:0}
.btn{--pill-ground:#E4E9DB;--pill-texture:#CBD3C0;--pill-edge:#B8C0AE;position:relative;isolation:isolate;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:.75rem 2rem;border:1px solid var(--pill-edge);border-radius:9999px;background-color:var(--pill-ground);color:var(--ink);font-family:var(--sans);font-size:1rem;font-weight:700;line-height:1.2;text-align:center;text-decoration:none;white-space:nowrap}
.btn::before,.btn::after{content:'';position:absolute;inset:0;z-index:-1;pointer-events:none}
.btn::before{background-color:var(--pill-texture);-webkit-mask:url('/brush/pill-texture.webp') center/100% 100% no-repeat;mask:url('/brush/pill-texture.webp') center/100% 100% no-repeat}
.btn::after{background-color:var(--ink);opacity:0;transition:opacity 150ms ease}
.btn:hover::after{opacity:.06}
.btn:active::after{opacity:.1}
.btn-cancel{--pill-ground:#EEEAE3;--pill-texture:#DAD5CB;--pill-edge:#C6C1B8;font-weight:600}
.btn-cancel::before{transform:scaleX(-1)}
`
