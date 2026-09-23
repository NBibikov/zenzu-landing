import type { APIRoute } from 'astro'
import { PRODUCT_SUMMARY, SITE, englishPosts, postUrl, textResponse } from '../lib/llms'

export const GET: APIRoute = async () => {
  const posts = await englishPosts()
  const blog = posts
    .map(p => `- [${p.data.title}](${postUrl(p)}): ${p.data.excerpt}`)
    .join('\n')

  return textResponse(`${PRODUCT_SUMMARY}
## Blog

${blog}

## Optional

- [Full text of all English blog posts](${SITE}/llms-full.txt)
`)
}
