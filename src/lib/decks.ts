// Seed decks for the /d/<lang>/<slug> pages and the /ig page.
// The data is a copy of the app's seed catalog — refresh it with
// `node scripts/sync-decks.mjs` (see that script).

import catalogJson from '../data/decks/catalog.json'

export interface Deck {
  /** Catalog id — the slug in /d/<lang>/<slug>. */
  id: string
  name: string
  description: string
  wordCount: number
  level: string
  kind?: 'words' | 'phrases'
  /** Shown on /ig. Absent = false. */
  ig?: boolean
  /** Target languages the deck is offered for. Absent = every target language. */
  languages?: string[]
  translations: Record<string, { name?: string; description?: string }>
}

// Catalog order is oldest first: new decks are appended.
const catalog = catalogJson as Deck[]

// Target languages a learner can pick in the app today (the app's
// Languages.canLearn). "pt" is still "soon": its page would send people to
// a course that does not exist. Add it here when it ships.
export const TARGET_LANGUAGES = ['en', 'de', 'fr', 'es'] as const
export type TargetLanguage = (typeof TARGET_LANGUAGES)[number]

// The page copy is Ukrainian, so the language is named in Ukrainian.
export const LANGUAGE_NAMES: Record<TargetLanguage, string> = {
  en: 'Англійська',
  de: 'Німецька',
  fr: 'Французька',
  es: 'Іспанська',
}

export const APP_STORE_URL = 'https://apps.apple.com/app/zenzu-ai-language-mastery/id6761502445'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.bblife.zenzu'

/** Google Play link. With a deck, it carries the install referrer the app reads on first launch. */
export function playStoreUrl(deck?: { lang: string; slug: string }): string {
  if (!deck) return PLAY_STORE_URL
  return `${PLAY_STORE_URL}&referrer=${encodeURIComponent(`deck=${deck.lang}/${deck.slug}`)}`
}

/** The deck's page on this site. */
export function deckPath(lang: string, slug: string): string {
  return `/d/${lang}/${slug}/`
}

/** The same deck in the web app. No trailing slash: it is the app's own route. */
export function webAppUrl(lang: string, slug: string): string {
  return `https://app.zenzu.app/d/${lang}/${slug}`
}

export function coverPath(deck: Deck): string {
  return `/d/covers/${deck.id}.webp`
}

export function deckLanguages(deck: Deck): TargetLanguage[] {
  return TARGET_LANGUAGES.filter((lang) => !deck.languages || deck.languages.includes(lang))
}

export function findDeck(lang: string, slug: string): Deck | undefined {
  const deck = catalog.find((d) => d.id === slug)
  return deck && (deckLanguages(deck) as string[]).includes(lang) ? deck : undefined
}

/** Every (language, deck) pair that has a page. */
export function deckPages(): { lang: TargetLanguage; deck: Deck }[] {
  return catalog.flatMap((deck) => deckLanguages(deck).map((lang) => ({ lang, deck })))
}

/** Decks for the link-in-bio page, newest first. */
export function igDecks(): Deck[] {
  return catalog.filter((deck) => deck.ig === true && deckLanguages(deck).length > 0).reverse()
}

export function deckName(deck: Deck): string {
  return deck.translations.uk?.name ?? deck.name
}

export function deckDescription(deck: Deck): string {
  return deck.translations.uk?.description ?? deck.description
}

const wordFiles = import.meta.glob<Record<string, string>[]>('../data/decks/words/*.json', {
  eager: true,
  import: 'default',
})

export interface DeckWord {
  /** The word or phrase in the target language. */
  term: string
  /** Its Ukrainian translation. */
  gloss: string
}

/** The first words of the deck: the target-language term and its Ukrainian gloss. */
export function deckWords(deck: Deck, lang: string): DeckWord[] {
  const words = wordFiles[`../data/decks/words/${deck.id}.json`] ?? []
  return words.flatMap((word) => (word[lang] ? [{ term: word[lang], gloss: word.uk ?? '' }] : []))
}

// Ukrainian plural: 1 слово, 2 слова, 5 слів.
function pluralUk(n: number, forms: [one: string, few: string, many: string]): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1]
  return forms[2]
}

/** "50 слів" or "30 фраз". */
export function sizeLabel(deck: Deck): string {
  const forms: [string, string, string] =
    deck.kind === 'phrases' ? ['фраза', 'фрази', 'фраз'] : ['слово', 'слова', 'слів']
  return `${deck.wordCount} ${pluralUk(deck.wordCount, forms)}`
}

/** "A1–A2" with a real en dash. */
export function levelLabel(deck: Deck): string {
  return deck.level.replace('-', '–')
}
