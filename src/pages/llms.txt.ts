import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { PRODUCT_SUMMARY, SITE, englishPosts, postUrl, textResponse } from '../lib/llms'

export const GET: APIRoute = async () => {
  const posts = await englishPosts()
  const blog = posts
    .map(p => `- [${p.data.title}](${postUrl(p)}): ${p.data.excerpt}`)
    .join('\n')

  const comparisons = (await getCollection('compare'))
    .map(c => `- [${c.data.title}](${SITE}/compare/${c.id}/): ${c.data.description}`)
    .join('\n')

  return textResponse(`${PRODUCT_SUMMARY}
## Comparisons

${comparisons}

## Blog

${blog}

## Optional

- [Full text of all English blog posts](${SITE}/llms-full.txt)
`)
}
