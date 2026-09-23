import type { APIRoute } from 'astro'
import { PRODUCT_SUMMARY, englishPosts, postUrl, textResponse } from '../lib/llms'

export const GET: APIRoute = async () => {
  const posts = await englishPosts()
  const articles = posts
    .map(p => `---

# ${p.data.title}

URL: ${postUrl(p)}
Published: ${p.data.date}

> ${p.data.excerpt}

${(p.body ?? '').trim()}
`)
    .join('\n')

  return textResponse(`${PRODUCT_SUMMARY}
# Blog articles

${articles}`)
}
