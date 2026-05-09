import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

export const GET: APIRoute = async () => {
  const entries = await getCollection('blog')

  const bySlug: Record<string, {
    slug: string
    date: string
    image: string
    translations: Record<string, { title: string; excerpt: string }>
  }> = {}

  for (const entry of entries) {
    const [slug, locale] = entry.id.split('/')
    if (!bySlug[slug]) {
      bySlug[slug] = { slug, date: entry.data.date, image: entry.data.image, translations: {} }
    }
    bySlug[slug].translations[locale] = {
      title: entry.data.title,
      excerpt: entry.data.excerpt,
    }
  }

  const articles = Object.values(bySlug).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return new Response(JSON.stringify({ articles }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  })
}
