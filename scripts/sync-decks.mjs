// Copies the app's seed decks into the landing, for the /d/<lang>/<slug>
// deck pages and the /ig page.
//
//   node scripts/sync-decks.mjs [path-to-zenzu-repo]   (default ~/Repositories/zenzu)
//
// Writes:
//   src/data/decks/catalog.json        verbatim copy of assets/seed_decks/catalog.json
//   src/data/decks/words/<id>.json     the first WORDS_PER_DECK words of the deck's
//                                      word file, reduced to the term per language
//   public/d/covers/<id>.webp          the deck cover
//
// The output is committed: the build must not depend on the app repo.
// Run it again whenever the app's catalog changes, then commit the result.

import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const WORDS_PER_DECK = 5

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const appRepo = resolve(process.argv[2] ?? join(homedir(), 'Repositories', 'zenzu'))
const seedDir = join(appRepo, 'assets', 'seed_decks')

const outData = join(root, 'src', 'data', 'decks')
const outWords = join(outData, 'words')
const outCovers = join(root, 'public', 'd', 'covers')

const catalogText = readFileSync(join(seedDir, 'catalog.json'), 'utf8')
const catalog = JSON.parse(catalogText)

// Start clean so a deck removed from the catalog does not linger.
rmSync(outWords, { recursive: true, force: true })
rmSync(outCovers, { recursive: true, force: true })
mkdirSync(outWords, { recursive: true })
mkdirSync(outCovers, { recursive: true })

writeFileSync(join(outData, 'catalog.json'), catalogText)

for (const deck of catalog) {
  const wordFile = JSON.parse(readFileSync(join(seedDir, deck.file), 'utf8'))
  const words = wordFile.concepts.slice(0, WORDS_PER_DECK).map((concept) => {
    const terms = {}
    for (const [lang, entry] of Object.entries(concept.translations)) {
      if (entry.term) terms[lang] = entry.term
    }
    return terms
  })
  writeFileSync(join(outWords, `${deck.id}.json`), JSON.stringify(words, null, 2) + '\n')
  copyFileSync(join(seedDir, deck.cover), join(outCovers, `${deck.id}.webp`))
}

console.log(`Synced ${catalog.length} decks from ${seedDir}`)
