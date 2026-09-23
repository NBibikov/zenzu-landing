import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { englishPosts, postSlug } from '../lib/llms'

export async function GET(context: APIContext) {
  const posts = await englishPosts()
  return rss({
    title: 'Zenzu Blog',
    description: 'Practical guides for learning languages from real content — YouTube, podcasts and articles.',
    site: context.site!,
    trailingSlash: true,
    items: posts.map(p => ({
      title: p.data.title,
      description: p.data.excerpt,
      pubDate: new Date(p.data.date),
      link: `/blog/${postSlug(p)}/`,
    })),
    customData: '<language>en</language>',
  })
}
