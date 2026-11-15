# zenzu.app: living grove, quiet motion, deeper explanations

Date: 2026-11-15. Status: draft, waits for approval.

## Intent

The landing page has no motion and its explanations are short. Nick wants:

1. More animation, with the trees of the app as the first candidate.
2. A way to expand a block and read a detailed, professional explanation:
   what Zenzu gives, why MCP matters, what each large block can do.

## Goals

- One living scene in the hero: the grove from the app, drawn on a canvas.
- Quiet, one-time motion when a section comes into view.
- Each of the 9 feature rows expands to a detailed explanation.
- The MCP block explains MCP in plain words, shows scenarios, setup and safety.
- A new page `/mcp` for technical readers, in all 6 locales.

## Non-goals

- No redesign of layout, type or colour outside the items below.
- No change to the blog, `/compare`, the header or the footer layout
  (the footer gets one new link).
- No Rive, Lottie, GSAP or other animation library.
- No detail page per feature. Feature detail is inline only.

## Anti-goals

- Motion in every block. The site stays calm: one scene plus one-time
  reveals, nothing that loops outside the hero.
- A claim in the new copy that the product does not support.
- A slower page. LCP and CLS must not get worse.

## Constraints

- Astro 6, static build, Cloudflare Pages. No client framework.
- 6 locales (`src/i18n/{en,uk,de,fr,es,pt}.json`). All new text exists in all 6.
- `DESIGN.md`: flat, no shadows, no gradients, no glow, no dark theme, one
  accent (moss), no warm hue.
- `prefers-reduced-motion` and forced-colours fallbacks must continue to work.
- Deploy is `wrangler pages deploy` only (a git push deploys nothing).

## Approaches

| | Approach | Trade-off |
|---|---|---|
| A | Living grove in the hero (canvas) | Strong brand tie to the app; a ready JS mockup exists. Needs a palette exception. |
| B | Quiet reveal motion (CSS + a small observer) | Cheap, calm. Small visual effect by itself. |
| C | Tree that grows with the scroll in "Three steps" | Attractive, but a second large animation next to A breaks the anti-goal. |

Nick selected **A + B**. C is rejected.

For the explanations, inline expansion (the `<details>` pattern of the FAQ)
was selected over a detail page per feature: Nick asked for "expand and read",
and 9 pages × 6 locales is a large SEO surface to keep correct. MCP is the
exception: it has two audiences, so it gets an inline block and a page.

## Design

### 1. Hero grove (A)

Source: `~/Agents/zenzu/.superpowers/brainstorm/44406-1792687165/content/grove-motion.html`
(374 lines, plain canvas 2D, no dependencies). The app painter
(`lib/src/features/grove/presentation/grove_painter.dart` in the app repo) is a
port of this file. Port the mockup to `src/lib/grove.ts`; do not port the Dart.

Keep from the mockup: `buildTree`, `drawTree` (growth and sway), `drawGround`,
`drawFallers` (falling leaves, petals, snow), the season palettes, the seeded
RNG. Remove: the dark theme, time of day, sun, fireflies, the bird, deck
labels, floats, scroll and gust controls, the control panel.

Behaviour:

- 5 trees of different maturity, fixed seeds, so every visit shows the same grove.
- The trees grow from the ground when the canvas first comes into view
  (about 2.6 s, as in the mockup). After that: slow sway and a few falling
  leaves.
- Season follows the visitor's local date, same rule as the app
  (`season.dart`): Mar–May spring, Jun–Aug summer, Sep–Nov autumn, Dec–Feb
  winter (bare branches, snow).
- The loop stops when the canvas is off screen or the tab is hidden.
- Frame rate limit 30 fps. Device pixel ratio limit 2.
- `prefers-reduced-motion`: draw one frame of the grown grove. No loop.
- No JavaScript: the canvas area stays empty; the height is reserved, so
  there is no layout shift.
- The canvas is decorative: `aria-hidden="true"`, no text inside.

Placement (builder's first deliverable is a preview for Nick, see Delivery):

- Width ≥ 1280 px: the canvas spans the full hero width behind the text
  column. Trees stand left and right of the column (2 left, 3 right), on one
  ground hairline at the bottom edge of the hero. Each side has 256 px or
  more; trees may be smaller than in the mockup and may use the mockup's two
  depth rows. The text column (`max-w-3xl`) stays clear and does not change.
- Width < 1280 px: a strip 140 px high below the store badges, all 5 trees
  in a row.

### 2. Quiet reveal motion (B)

- The heading stroke (`.zz-stroke`) draws from left to right
  (`transform: scaleX(0→1)`, origin left, 600 ms) when its section enters view.
- The section content fades in and moves up 12 px (400 ms), once.
- One `IntersectionObserver` in an inline script adds a class. The hidden
  start state applies only under `html.js`, so the page is complete without
  JavaScript.
- The existing reduced-motion rule in `global.css` already removes durations.
- The hero text does not animate (it is the LCP element).
- Expanded `<details>` panels open with no animation.

### 3. Feature detail (inline)

Each of the 9 rows in `Features.astro` gets a `<details>` below the short
description. Summary label: "More" / localized. Open content, 3 short parts:

1. **What you get** — the result for the learner, 2–3 sentences.
2. **How it works** — the mechanism, concrete (for example: FSRS-6 predicts
   the moment of forgetting per card; cards keep the source sentence).
3. **Good to know** — limits and conditions (languages, levels, platforms).
   No mention of Plus, quotas or prices.

New i18n keys: `features.<key>.more.{what,how,note}` and `features.moreLabel`.
The grid uses `align-items: start` so an open row does not stretch its
neighbours.

### 4. MCP block (inline)

`Mcp.astro` grows from one paragraph to four parts. The existing title and
kicker stay.

1. **Plain definition.** One paragraph for a reader who does not know MCP:
   a standard way for an AI assistant to work with your Zenzu account, with
   your permission.
2. **What you can ask your assistant** — 6 scenarios, each one line, each
   backed by a real tool (`tools.ts`) or a server prompt (`prompts.ts`:
   `vocab_from_text`, `review_session`, `weekly_report`). Scenarios that
   change data (the first two) carry a short mark "needs write access".
   The server takes text only: the copy says "from a text or an article",
   not "from a PDF".
   - Make a deck from this text or article (`vocab_from_text`, `create_deck`, `add_cards`).
   - Run today's review in the chat (`get_due_cards`, `review_card`, `review_session`).
   - Show the words I confuse most (`get_interference_pairs`, `get_review_history`).
   - Give me a weekly report (`weekly_report`, `get_study_stats`, `get_progress`).
   - Find a deck for this film or series (`search_media_decks`, `get_media_deck`).
   - Check my level and course progress (`get_cefr_level`, `get_course_progress`).
3. **Connect in 3 steps** — Settings → AI agents → Agent access → create a
   token and select read-only or "Allow writes" → paste it into the assistant.
4. **Your data stays yours** — facts from `supabase/functions/mcp` in the app
   repo: a personal token per assistant; read-only or read-and-write scope;
   revoke a token at any time; up to 10 live tokens; an assistant sees only
   your account. No mention of Plus (Nick, 2026-11-15: it is free to get now).

A link "Technical details" goes to `/mcp`.

### 5. Page `/mcp`

Routes: `/mcp` (en) and `/[lang]/mcp`, same pattern as the other localized
pages. Sections:

1. What the server is: hosted, Streamable HTTP, token auth. No mention of Plus.
2. Setup. The server accepts a static bearer token only (no OAuth). The
   app repo has no client snippets, so: write each snippet from the vendor
   documentation, then test it against the live server with a real token.
   Publish a snippet only for a client that passed the test. A generic
   entry ("server URL + `Authorization: Bearer zmcp_…` header") is always
   present. Clients: **Claude Code** (Nick confirmed it works) and
   **ChatGPT** (Nick asked for it; not tested). Cursor is a candidate.
   Risk: the ChatGPT connector form is documented with "No authentication"
   and OAuth; it is not confirmed that it accepts a static bearer token.
   If the live test fails, ChatGPT is not listed, and the builder reports
   it: OAuth support on the server is a separate project.
3. Tool reference, grouped: decks and cards; review; progress and stats;
   courses and reading; workspace; media decks. One line per tool. Source:
   `tools.ts` in the app repo. Then a **Prompts** section with the 3
   prompts from `prompts.ts`.
4. Scopes, limits (`limits.ts`), token rules.
5. Short FAQ (3–5 questions).

The page gets `hreflang` alternates, a sitemap entry, a line in `llms.txt` /
`llms-full.txt`, and a link in the footer Product column. Tool names and
config snippets are not translated; the prose is.

### 6. Design and product docs

- `DESIGN.md`: add a **Motion** section (rules of parts 1–2) and an
  **Illustration layer** exception: the grove canvas may use the season leaf
  palettes of the app, warm autumn hues included. The exception covers the
  canvas only. The app has the same exception (app `DESIGN.md` §10).
- Remove the statement about animations (Nick, 2026-11-15): delete
  "no endless animations" from `forWhom.subtitle` in all 6 locales and from
  `PRODUCT.md` line 32. The rest of each sentence stays.

## Copy rules

- English is written first, then the 5 other locales. Tone: the existing
  site voice, calm and exact, no marketing superlatives.
- Each product claim must trace to the app repo (`PRODUCT.md`, code) or to
  the current site copy. A claim that cannot be traced is omitted.
- Product facts already known: token prefix `zmcp_`; scopes `read` and
  `write`; 10 live tokens.

## Decisions made by the author (Nick: check these)

1. **Warm leaf colours on the site.** Today's date gives autumn, so the
   grove shows red and gold leaves. `DESIGN.md` forbids warm hues; the design
   adds a canvas-only exception, as the app did.
2. **Grove placement**: flanks the text on desktop, a strip below the badges
   on phones.
3. **Audience**: inline text is for learners in plain language; `/mcp` is for
   technical readers. (The question about the audience was not answered.)
4. **The grove has no labels** and no interaction.
5. **Winter is bare trees with snow**, as in the app.

6. **Flank layout starts at 1280 px**, not 1024 px: below that the sides are
   too narrow for trees.
7. **Preview first.** A Loom merge to `main` deploys production at once
   (`loom.toml`, repo `landing`). So the work is built on a branch outside
   the queue and deployed with
   `wrangler pages deploy dist --project-name=zenzu-landing --branch=preview`.
   It goes to `main` only after Nick approves the look.

## Answers from Nick (2026-11-15)

1. MCP copy does not name Plus.
2. The statement about animations is removed from the site.
3. Claude Code is confirmed. ChatGPT is added, subject to the live test.

## Left to the builder

- Exact tree positions, canvas height on desktop, timing fine-tune.
- Wording of all copy within the copy rules.
- File split inside `src/lib/` and component structure.
- The MCP endpoint URL and client config format: read them from the app
  repo (`supabase/functions/mcp/index.ts`, the Agent access settings screen).

## Delivery

All work is on one branch (`landing-grove`) in a worktree. The whole branch
is deployed to a Pages preview branch. After Nick approves the look, the
branch enters the Loom merge queue (`loom enqueue`), which merges, runs the
gate and deploys production. Plan:
`docs/superpowers/plans/2026-11-15-landing-grove-and-depth.md`.

## Verification

- `npm run build` passes; `astro check` has no new errors.
- Lighthouse mobile on the home page: performance and CLS not below the
  values measured before the change.
- Manual: reduced motion on, JavaScript off, forced colours on, 360 px and
  1440 px widths, all 6 locales render the new keys (no missing-key fallback).
- Each MCP scenario and each name on `/mcp` exists in `tools.ts` or
  `prompts.ts`.
- Each published setup snippet connected to the live server in a test.
