import { getCollection, type CollectionEntry } from 'astro:content'

export const SITE = 'https://zenzu.app'

/**
 * Plain-language product summary for LLM crawlers (llms.txt convention).
 * Keep every claim here in sync with the landing copy in src/i18n/en.json —
 * this is what answer engines will quote.
 */
export const PRODUCT_SUMMARY = `# Zenzu

> Zenzu is a language learning app for learning from real content — YouTube videos, podcasts, articles and photos of text. Any word or phrase you select becomes a flashcard with its sentence context and native pronunciation, scheduled with the FSRS-5 spaced repetition algorithm. An AI coach, Lisa, explains words and plans study in your own language.

## Key facts

- Platforms: iOS (App Store, iOS 15+) and web (https://app.zenzu.app).
- Price: free to download and start.
- Languages you can learn: English, German, French, Spanish. Portuguese is coming soon.
- Interface and AI coach languages: English, Ukrainian, German, French, Spanish, Portuguese — learners study from their native language, not through English.
- Spaced repetition: FSRS-5, the same modern scheduler family used by Anki.
- Content sources: YouTube with an interactive transcript, AI-transcribed podcasts, articles and pasted text, photos of text (OCR).
- Phrases are saved with automatic cloze deletion; single words keep the full source sentence.
- AI courses: grammar and vocabulary lessons for English, German, French and Spanish, CEFR A1 to C1.
- Starter decks: 18 curated decks from A1 to C1 (everyday, business, academic, science, idioms and more).
- Pronunciation: text-to-speech audio for every word and sentence.
- Data ownership: cards and progress stay portable; MCP access for your own AI agents is coming soon.
- Who it is for: serious, self-directed learners who want immersion in authentic content. It deliberately has no mascots, streak games or trophies.

## Links

- [Home](${SITE}/): product overview
- [Web app](https://app.zenzu.app): use Zenzu in the browser
- [App Store](https://apps.apple.com/app/zenzu-ai-language-mastery/id6761502445): iOS app
- [Blog](${SITE}/blog/): language learning guides, also available in Ukrainian, German, French, Spanish and Portuguese
- [Privacy policy](${SITE}/privacy/)
- [Terms of service](${SITE}/terms/)
- [Contact](${SITE}/contact/): hello@zenzu.app
`

/** English blog posts, newest first. Translations live at /<locale>/blog/<slug>/. */
export async function englishPosts(): Promise<CollectionEntry<'blog'>[]> {
  const entries = await getCollection('blog', e => e.id.endsWith('/en'))
  return entries.sort((a, b) => b.data.date.localeCompare(a.data.date))
}

export function postSlug(entry: CollectionEntry<'blog'>): string {
  return entry.id.split('/')[0]
}

export function postUrl(entry: CollectionEntry<'blog'>): string {
  return `${SITE}/blog/${postSlug(entry)}/`
}

export function textResponse(body: string): Response {
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
