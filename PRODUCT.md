# Product

<!-- impeccable:product-schema 1 -->

<!-- Written 2026-10-13 from repository evidence, without an interview:
     site copy (src/i18n/en.json), commit history and STYLE_GUIDE.md.
     Lines marked (inferred) are not confirmed by the owner. -->

## Platform

web

This repository is the marketing site and blog for Zenzu (zenzu.app). The product itself is a Flutter app (iOS, Android in open testing, web at app.zenzu.app) in a separate repository. The site mirrors the app's design language; it does not define it.

## Users

- Adult language learners who take learning seriously and want to learn from authentic content: YouTube videos, podcasts, articles, books, news.
- They commit to daily review, have ambitious goals (read a novel, work or live in another language) and want to own their data.
- Many do not think in English. They want to learn from their native language, not through English. Interface languages: English, Ukrainian, German, Spanish, French, Portuguese.
- Explicitly not for: people who want a game with streaks and trophies, who need gamification to stay motivated, or who expect fluency after a few casual sessions.
- Secondary audience: people who use AI agents (Claude, Cursor, other MCP clients) and want their study data reachable from them.

## Product Purpose

Zenzu turns content the learner already enjoys into flashcards. The learner imports a video, podcast, article or photo of text, taps a word or selects a phrase, and Zenzu saves a card with its original sentence and native pronunciation. FSRS-6 schedules the reviews. Lisa, an AI coach, plans the day, explains words and grammar and replies in the learner's own language.

The site exists to explain this, send visitors to the App Store, Google Play testing or app.zenzu.app, and bring search traffic through the blog and comparison pages.

## Positioning

- Cards come from the learner's own content, with the source sentence and audio kept. In Anki, the learner builds cards by hand.
- A calm, serious tool, not a game: no mascots, no streak pressure, no endless animations.
- The learner's data stays theirs and is open to their own AI agents through MCP (in the app: Settings → AI agents → Agent access).
- Learn from the native language: the interface and the coach work in six languages.

## Operating Context

- Target languages: English, German, French, Spanish. Portuguese is coming soon.
- Devices: iPhone and iPad (iOS 15+), any modern browser at app.zenzu.app. Android is in open testing on Google Play (three join steps on the home page). JSON-LD lists only iOS and Web until the Play listing is public.
- The site is published in six locales: en, uk, de, es, fr, pt.
- The blog is written by an automated daily job (`~/Scripts/zenzu/jobs/daily-blog.sh`) with covers generated to STYLE_GUIDE.md. (inferred) New posts follow the job's prompt, not this file: a change to blog tone or style must also go into that prompt.

## Capabilities and Constraints

- Static Astro site, Tailwind 4, content collections for the blog. Deploy target is set outside this repo.
- Contact address on every page: hello@zenzu.app.
- Pricing is not shown anywhere on the site (decision of 2026-09-23). Do not add prices.
- MCP is presented as available now.
- Undecided: when Android leaves testing; when Portuguese as a target language ships.

## Brand Commitments

- Name: Zenzu, from Zen: calm, presence, inner quiet. The garden and forest metaphor (words take root like trees) is the brand story.
- Lisa is the coach's name.
- The visual system is the app's "Ink & Paper, brush theme"; the source of truth is the Flutter AppTheme and ZTokens in the app repository. See DESIGN.md.
- Blog imagery: STYLE_GUIDE.md is binding (six colours, moss is the only accent, no warm hues).

## Evidence on Hand

- Eight real iPhone app screenshots in `public/screens/`, used by the home carousel.
- About 60 blog articles per locale in `src/content/`, with covers in `public/blog/`.
- Sourced comparison pages: Anki, LingQ, Language Reactor, Migaku.
- Three public-domain quotes (Charlemagne, Wittgenstein, Frank Smith).
- There are no user testimonials, user counts, ratings, press mentions or case studies. Do not invent them.

## Product Principles

1. Real content first: every feature leads back to material the learner chose.
2. Calm over compulsion: no pressure mechanics, no gamified urgency.
3. The learner owns the data, and it is open to the learner's own tools.
4. Native-language first: never assume the visitor reads English.

## Accessibility & Inclusion

- Six locales with full translations; every new string needs all six.
- Text colour floor: ink-3 is the lightest tone that may carry text.
- Forced-colours and reduced-motion modes are supported in global.css; keep them working.
