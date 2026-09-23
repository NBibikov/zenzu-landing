import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.string(),
    image: z.string(),
  }),
})

// Honest head-to-head pages ("Zenzu vs Anki"). English only: these answer
// comparison queries that search and answer engines field mostly in English.
const compare = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/compare' }),
  schema: z.object({
    competitor: z.string(),
    title: z.string(),
    description: z.string(),
    /** Date the competitor facts were last checked against their official pages. */
    updated: z.string(),
    /** One-paragraph direct answer, shown first — the part answer engines quote. */
    verdict: z.string(),
    rows: z.array(z.object({ feature: z.string(), zenzu: z.string(), other: z.string() })),
    /** Official pages the competitor facts were checked against. */
    sources: z.array(z.object({ label: z.string(), url: z.string().url() })),
  }),
})

export const collections = { blog, compare }
