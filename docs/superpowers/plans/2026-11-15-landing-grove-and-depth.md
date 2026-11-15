# Landing Grove and Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a living grove to the hero of zenzu.app, quiet reveal motion, an expandable detail for each feature, a full MCP block, and a `/mcp` page in 6 locales.

**Architecture:** Static Astro site. The grove is a canvas 2D scene ported from an existing JS mockup: pure logic in one module (tested), drawing in a second module, mounted by one Astro component. Reveal motion is CSS plus one `IntersectionObserver`. All new text lives in the 6 i18n JSON files; MCP names live in one data file that a test compares with the app repo.

**Tech Stack:** Astro 6, Tailwind 4, TypeScript, `node --test` (Node ≥ 22.18 runs `.ts` directly), Cloudflare Pages (`wrangler`).

**Spec:** `docs/superpowers/specs/2026-11-15-landing-grove-and-depth-design.md`

## Global Constraints

- No new runtime dependency. No Rive, Lottie, GSAP.
- 6 locales: `en, uk, de, fr, es, pt`. Each new key exists in all 6. English is written first.
- `DESIGN.md`: flat, no shadows, no gradients, no glow, no dark theme. Warm hues only inside the grove canvas.
- No mention of Plus, quotas or prices in any new text.
- Each product claim traces to the app repo (`~/Repositories/zenzu`) or to current site copy. A claim with no source is omitted.
- Tool names, prompt names and config snippets are not translated.
- The hero text does not animate. `<details>` panels open with no animation.
- `prefers-reduced-motion` and forced-colours fallbacks continue to work.
- Commits: English, no AI references, no co-author lines.
- One branch `landing-grove` in worktree `~/.worktrees/zenzu-landing/landing-grove`. It goes to production only through `loom enqueue` after Nick approves the preview (Task 9). Never run the `--branch=main` deploy by hand.
- Before each commit: `npm test && npm run build` pass.

## Review Focus

1. **Canvas resize and rotation**: width crosses 1280 px while the page is open → the grove changes layout and redraws; no stretched or blank canvas. (Task 3)
2. **Tab hidden / canvas off screen**: no `requestAnimationFrame` runs. Returning to the tab shows no time jump: trees do not regrow, leaves do not burst. (Task 3)
3. **A locale file misses a new key**: `t()` types come from `en.json`, so a missing key in `de.json` builds and renders `undefined`. The parity test must fail. (Task 1)
4. **Open feature detail in the 3-column grid**: an open row does not stretch its neighbours; long German text does not overflow at 360 px. (Task 6)
5. **A tool is renamed or added in the app repo**: the page then shows a wrong name. The sync test must fail when the app repo is present. (Task 7)

## File Structure

| File | Responsibility |
|---|---|
| `tests/i18n.test.ts` | Key parity across locales; banned phrases |
| `src/lib/grove-model.ts` | Pure: seasons, RNG, tree build, layout, palettes |
| `tests/grove-model.test.ts` | Tests of the model |
| `src/lib/grove-canvas.ts` | Drawing and the frame loop |
| `src/components/ui/Grove.astro` | Canvas element + mount script |
| `src/data/mcp.ts` | Server URL, tool groups, prompts, scenarios |
| `tests/mcp-data.test.ts` | Names agree with the app repo |
| `src/components/layout/McpPage.astro` | The `/mcp` page body |
| `src/pages/mcp.astro`, `src/pages/[lang]/mcp.astro` | Routes |

---

### Task 0: Worktree and documents

- [ ] **Step 1:** `cd ~/Repositories/zenzu-landing && git worktree add ~/.worktrees/zenzu-landing/landing-grove -b landing-grove main`
- [ ] **Step 2:** Move `docs/superpowers/` (spec and this plan, untracked in the main checkout) into the worktree. Run `npm ci` in the worktree.
- [ ] **Step 3:** Commit: `docs: add design and plan for the grove and detail update`.

### Task 1: Test harness, locale parity, remove the animation statement

**Files:**
- Modify: `package.json` (script `test`)
- Create: `tests/i18n.test.ts`
- Modify: `src/i18n/{en,uk,de,fr,es,pt}.json` line 114, `PRODUCT.md` line 32

**Interfaces:**
- Produces: `npm test` runs `functions/**/*.test.ts` and `tests/**/*.test.ts`.

- [ ] **Step 1:** Set `"test": "node --test \"functions/**/*.test.ts\" \"tests/**/*.test.ts\""`.
- [ ] **Step 2: Write the failing tests** in `tests/i18n.test.ts`:
  - `every locale has the same key paths as en`: flatten each JSON to dotted paths (array index is part of the path); assert `deepEqual` of sorted path lists for each of `uk, de, fr, es, pt` against `en`.
  - `no locale has an empty string value`.
  - `no locale mentions endless animations`: none of the 6 files matches `/endless animations|безкінечних анімацій|endlosen Animationen|animations sans fin|animaciones infinitas|animações infinitas/i`.
- [ ] **Step 3:** Run `npm test`. Expected: the third test FAILS; the first passes (fix real parity gaps if it does not).
- [ ] **Step 4:** In each `forWhom.subtitle`, delete only the animation item and keep correct grammar. English result: `"…No cute mascots, no game to win. It's for people…"`. In `PRODUCT.md` line 32: `- A calm, serious tool, not a game: no mascots, no streak pressure.`
- [ ] **Step 5:** `npm test && npm run build` pass. Commit: `Remove the statement about animations; add locale parity tests`.

### Task 2: Grove model (pure logic)

**Files:**
- Create: `src/lib/grove-model.ts`, `tests/grove-model.test.ts`
- Source to port: `~/Agents/zenzu/.superpowers/brainstorm/44406-1792687165/content/grove-motion.html` lines 89–135

**Interfaces — Produces:**

```ts
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export function seasonFor(d: Date): Season            // Mar–May, Jun–Aug, Sep–Nov, else winter
export function rng(seed: number): () => number       // mulberry32, as in the mockup
export interface Leaf { t: number; side: number; s: number; c: number; fall: number; mix: number }
export interface Branch { ang: number; len: number; d: number; ph: number; kids: Branch[]; leaves: Leaf[] }
export interface Tree { root: Branch; maxDepth: number }
export function buildTree(seed: number, maturity: number): Tree
export const GROVE_TREES: readonly { seed: number; maturity: number; kind: 0|1|2|3 }[]
//   seeds 7,19,33,41,58 · maturity 0.85,0.55,0.7,0.4,0.25 · kind 0,2,1,3,1
export interface TreeSlot { x: number; scale: number; row: 0 | 1 }   // x is 0..1 of canvas width
export type GroveLayout = 'flank' | 'strip'
export function layoutFor(width: number): GroveLayout  // 'flank' when width >= 1280
export function layoutTrees(width: number): TreeSlot[] // always 5 slots, same order as GROVE_TREES
export const LEAF_PALETTES: Record<Season, string[][] | null> // copy of SEASONS; winter is null
export const INK = { ink: '#1C1B18', rule: '#CEC7B9', ink4: '#948D82', grey: '#B7B1A6', paper: '#FDFCFA', snow: '#A9A398' }
```

- [ ] **Step 1: Write the failing tests:**
  - `seasonFor`: 2026-03-01 → spring, 2026-08-31 → summer, 2026-11-15 → autumn, 2026-12-01 and 2027-02-28 → winter.
  - `rng(7)` twice gives equal sequences of 10 values; all in `[0, 1)`.
  - `buildTree(7, 0.85)` twice is `deepEqual`; `maxDepth === 4 + Math.round(0.85 * 3)`; `buildTree(7, 0.25).maxDepth < buildTree(7, 0.85).maxDepth`.
  - `layoutFor(1279) === 'strip'`, `layoutFor(1280) === 'flank'`.
  - `layoutTrees(1440)`: 5 slots; exactly 2 with `x < 0.5`; for each slot the tree centre is outside the text column: `Math.abs(x - 0.5) * 1440 >= 384 + 40`.
  - `layoutTrees(390)`: 5 slots, `x` strictly increasing, all in `[0.08, 0.92]`.
- [ ] **Step 2:** `npm test` → FAIL (module not found).
- [ ] **Step 3:** Implement. Port `rng`, `buildTree`, `leaf` and `SEASONS` from the mockup without behaviour changes. `layoutTrees` is new: the mockup has no flank layout.
- [ ] **Step 4:** `npm test` → PASS. Commit: `Add the grove model`.

### Task 3: Grove canvas, component, hero

**Files:**
- Create: `src/lib/grove-canvas.ts`, `src/components/ui/Grove.astro`
- Modify: `src/components/blocks/Hero.astro`
- Source to port: mockup lines 141–255 (`resize`, `leafPath`, `drawTree`, `drawGround`, `spawn`, `drawFallers`)

**Interfaces:**
- Consumes: everything Task 2 produces.
- Produces: `export function mountGrove(canvas: HTMLCanvasElement, opts?: { date?: Date }): () => void` — starts the scene, returns a dispose function.

- [ ] **Step 1:** Implement `mountGrove`. Decisions the port must keep:
  - Do not port: dark theme, time of day, `drawSky`, fireflies, bird, labels, floats, `S.scroll`, `S.gust`, the control panel.
  - Growth starts the first time the canvas is ≥ 25 % visible (`IntersectionObserver`), lasts 2600 ms per tree, trees start 180 ms apart.
  - The loop runs only while the canvas intersects the viewport and `document.visibilityState === 'visible'`. Scene time is accumulated from frame deltas, each delta clamped to 50 ms, so a pause causes no jump.
  - 30 fps limit. `devicePixelRatio` limit 2.
  - `ResizeObserver` on the canvas: recompute size and `layoutTrees(width)`; do not restart growth.
  - `matchMedia('(prefers-reduced-motion: reduce)')`: draw one frame with growth = 1 and no fallers; start no loop.
  - Ground: one 1 px line in `INK.rule` across the full width. No gradient (the mockup has one; remove it).
  - Ambient fallers per season: autumn 6, spring 3, winter 16, summer 0.
- [ ] **Step 2:** `Grove.astro`: `<canvas class="zz-grove" aria-hidden="true">` and a `<script>` that imports `mountGrove` and mounts every `.zz-grove`. Style: `display:block; width:100%; pointer-events:none`.
- [ ] **Step 3:** `Hero.astro`: make the section `relative overflow-hidden`. Add one `<Grove />` element, positioned by CSS — below `xl`: static block, height 140 px, after the store badges, before the "supported" line; from `xl` (1280 px): `absolute inset-x-0 bottom-0`, height 320 px, behind the text (`z-0`; the text container gets `relative z-10`). The hero bottom padding does not change.
- [ ] **Step 4: Verify** with `npm run dev`:
  - 1440 px: trees left and right, no tree under the text column; trees grow once.
  - 390 px: strip under the badges, 5 trees.
  - Resize across 1280 px: layout changes, no blank canvas.
  - DevTools → Rendering → emulate reduced motion: static grown grove.
  - JavaScript disabled: no layout shift, page complete.
  - DevTools Performance, tab in background 10 s: no frames recorded.
- [ ] **Step 5:** `npm test && npm run build`. Commit: `Add the living grove to the hero`.

### Task 4: Reveal motion

**Files:**
- Modify: `src/layouts/BaseLayout.astro`, `src/styles/global.css`, every block in `src/components/blocks/` except `Hero.astro`

- [ ] **Step 1:** `BaseLayout.astro` `<head>`: inline script `document.documentElement.classList.add('js')` (first script in head, `is:inline`).
- [ ] **Step 2:** Add attribute `data-reveal` to the inner container (`max-w-*` div) of each block except Hero.
- [ ] **Step 3:** `global.css`:
  - `html.js [data-reveal] { opacity: 0; transform: translateY(12px); transition: opacity 400ms ease-out, transform 400ms ease-out; }`
  - `html.js [data-reveal].is-in { opacity: 1; transform: none; }`
  - `html.js [data-reveal] .zz-stroke { transform: scaleX(0); transform-origin: left; transition: transform 600ms ease-out 150ms; }` and `.is-in .zz-stroke { transform: scaleX(1); }`
  - The existing reduced-motion block already sets durations to 0.01 ms; do not change it.
- [ ] **Step 4:** One inline `<script>` at the end of `BaseLayout.astro` body: `IntersectionObserver` (`threshold: 0.15`), adds `is-in` once and unobserves. If `IntersectionObserver` is missing, add `is-in` to all at once.
- [ ] **Step 5: Verify:** each section reveals once; scrolling back up does not replay; with JavaScript disabled all content is visible; blog and legal pages (same layout) show no hidden content.
- [ ] **Step 6:** `npm test && npm run build`. Commit: `Add one-time reveal motion to sections`.

### Task 5: Design documents

**Files:** Modify `DESIGN.md`

- [ ] **Step 1:** Add section `## Motion`: one hero scene (the grove); one-time section reveals (values of Task 4); nothing else loops; hero text never animates; reduced motion gives a static grove.
- [ ] **Step 2:** Add `### Illustration layer` under Colors: the grove canvas may use the app's season leaf palettes, warm autumn hues included; the exception covers the canvas only. Amend the "Don't add … any warm hue" line with "(except the grove canvas)".
- [ ] **Step 3:** Commit: `Document the motion rules and the illustration layer`.

### Task 6: Feature detail

**Files:**
- Modify: `src/i18n/*.json` (`features`), `src/components/blocks/Features.astro`

**Interfaces — Produces (i18n keys):** `features.moreLabel` (string); `features.<key>.more.{what,how,note}` for the 9 keys `lisa, youtube, podcasts, starterDecks, interface, courses, srs, tts, import`.

- [ ] **Step 1:** Collect facts for each of the 9 features from the app repo (`PRODUCT.md`, `README.md`, feature code). Write a fact list with a source path per fact in the commit message body or the PR text, not in the repo.
- [ ] **Step 2:** Write English copy. `what`: 2–3 sentences, the result for the learner. `how`: 2–3 sentences, the mechanism. `note`: 1–2 sentences, limits (languages, levels, platforms). No Plus, quotas, prices. Site voice: calm, exact, no superlatives.
- [ ] **Step 3:** Write the 5 other locales. `npm test` → parity PASS.
- [ ] **Step 4:** `Features.astro`: grid gets `items-start`. Under each `desc` add `<details class="group mt-3">`; summary = `features.moreLabel` in the kicker/label style with the `+` mark of `Faq.astro` (`group-open:rotate-45`); body = three paragraphs, each led by a small label. Labels are 3 more keys: `features.labels.{what,how,note}`.
- [ ] **Step 5: Verify:** 360 px and 1440 px; open one row in a 3-column row — neighbours keep their height; German and Ukrainian do not overflow; keyboard: Tab reaches each summary, Enter toggles.
- [ ] **Step 6:** `npm test && npm run build`. Commit: `Add an expandable detail to each feature`.

### Task 7: MCP data and the MCP block

**Files:**
- Create: `src/data/mcp.ts`, `tests/mcp-data.test.ts`
- Modify: `src/components/blocks/Mcp.astro`, `src/i18n/*.json` (`mcp`), `src/lib/llms.ts` line 26

**Interfaces — Produces:**

```ts
export const MCP_URL = 'https://vomksfxhelvowvtcfhoh.supabase.co/functions/v1/mcp'
export const MCP_TOOL_GROUPS: readonly { id: 'decks'|'review'|'progress'|'courses'|'workspace'|'media'; tools: readonly string[] }[]
export const MCP_PROMPTS = ['vocab_from_text', 'review_session', 'weekly_report'] as const
export const MCP_OMITTED_TOOLS = ['get_plus_status'] as const   // not shown: no Plus on the site
export const MCP_SCENARIOS: readonly { id: 'deck'|'review'|'confused'|'report'|'media'|'level'; uses: readonly string[]; write: boolean }[]
```

Scenario `uses` (from the spec): deck → `vocab_from_text, create_deck, add_cards` (write); review → `get_due_cards, review_card, review_session` (write); confused → `get_interference_pairs, get_review_history`; report → `weekly_report, get_study_stats, get_progress`; media → `search_media_decks, get_media_deck`; level → `get_cefr_level, get_course_progress`.

i18n keys under `mcp`: keep `kicker, title, badge`; replace `body` with `intro`; add `scenariosTitle`, `scenarios.<id>`, `writeMark`, `stepsTitle`, `steps` (array of 3), `safetyTitle`, `safety` (array of 5: personal token per assistant; read-only or read-and-write; revoke at any time; up to 10 live tokens; an assistant sees only your account), `detailsLink`.

- [ ] **Step 1: Write the failing test** `tests/mcp-data.test.ts`. Locate the app repo at `process.env.ZENZU_APP_REPO ?? ~/Repositories/zenzu`; when `supabase/functions/mcp/tools.ts` is absent, `t.skip`. Read `tools.ts` and `prompts.ts` as text and extract the declared tool and prompt names (read both files first; match the way they declare `name`). Assert:
  - the set of all `MCP_TOOL_GROUPS` tools plus `MCP_OMITTED_TOOLS` equals the set of tool names in `tools.ts`;
  - `MCP_PROMPTS` equals the prompt names in `prompts.ts`;
  - each name in each scenario `uses` is a tool or a prompt;
  - a scenario has `write: true` exactly when one of its tools is a write tool (read how `tools.ts` / `server.ts` marks write tools);
  - `MCP_URL` occurs in `lib/src/features/settings/presentation/mcp_access_screen.dart`.
- [ ] **Step 2:** `npm test` → FAIL. Fill `MCP_TOOL_GROUPS` until it passes. Starting groups: decks (decks, cards, search, inbox), review (due cards, review, history, interference pairs), progress (progress, stats, CEFR level, assessments), courses (course progress, lesson content, reading progress), workspace (the `*_workspace_*` tools), media (media decks).
- [ ] **Step 3:** Write the `mcp` copy in English, then 5 locales. `intro`: MCP in plain words for a reader who does not know it. Scenarios say "text or article", never "PDF". The exact Settings path and the name of the write option come from `mcp_access_screen.dart` and the app's l10n files for each locale.
- [ ] **Step 4:** Rebuild `Mcp.astro`: kicker, title, intro; scenarios as a hairline list (write scenarios show `writeMark` in the label style); 3 numbered steps in the style of `HowItWorks.astro`; safety list; badge; link to `localePath('/mcp/', locale)`. The component gets a `locale` prop; pass it from `HomePage.astro`. Container width `max-w-3xl`, left-aligned text (the list does not read centred).
- [ ] **Step 5:** `src/lib/llms.ts` line 26: add the `/mcp/` URL to the MCP line.
- [ ] **Step 6:** `npm test && npm run build`; check the block at 360 px and 1440 px. Commit: `Explain MCP on the home page: scenarios, setup, safety`.

### Task 8: Page `/mcp`

**Files:**
- Create: `src/components/layout/McpPage.astro`, `src/pages/mcp.astro`, `src/pages/[lang]/mcp.astro`
- Modify: `src/i18n/*.json` (new top-level `mcpPage`, `footer.mcp`), `src/components/layout/Footer.astro`, `src/lib/llms.ts`

**Interfaces:**
- Consumes: `src/data/mcp.ts` (Task 7).
- Produces i18n `mcpPage`: `meta.{title,description}`, `title`, `lead`, `setupTitle`, `setup.{generic,claudeCode,chatgpt}` (prose only), `toolsTitle`, `groups.<id>`, `tools.<toolName>` (one line each), `promptsTitle`, `prompts.<name>`, `rulesTitle`, `rules` (array), `faqTitle`, `faq` (array of `{q,a}`, 3–5 items).

- [ ] **Step 1:** Routes: copy the pattern of `src/pages/contact.astro` and `src/pages/[lang]/contact.astro`. `McpPage.astro` takes `locale`, uses `BaseLayout` with `hreflang` alternates as `ContactPage.astro` does.
- [ ] **Step 2:** Extend `tests/i18n.test.ts`: `mcpPage.tools` has exactly the keys of all `MCP_TOOL_GROUPS` tools; `mcpPage.prompts` has exactly `MCP_PROMPTS`. Run → FAIL.
- [ ] **Step 3:** Write the copy (English, then 5 locales). Tool lines come from the tool descriptions in `tools.ts`, shortened to one line. Rules come from `limits.ts` and `index.ts` (token prefix `zmcp_`, scopes, 10 live tokens, rate limits as coded). Run → PASS.
- [ ] **Step 4:** Page sections in order: lead (hosted, Streamable HTTP, token auth) → setup → tool reference by group → prompts → rules → FAQ (`<details>`, as `Faq.astro`). Code snippets in `<pre>` with horizontal scroll; no syntax-highlight dependency.
- [ ] **Step 5: Setup snippets — live test, then publish.**
  - Generic: URL + `Authorization: Bearer zmcp_…`. Always shown.
  - Claude Code: take the current `claude mcp add` syntax for an HTTP server with a header from the Claude Code documentation. Test it with a real token (ask Nick for a read-only token; never write the token to the repo, the plan, a log or memory). Shown only after the test connects and lists tools.
  - ChatGPT: check the current OpenAI documentation for custom MCP connectors and whether the form accepts a static bearer token. Then test in Nick's ChatGPT account together with Nick. **If it does not connect, do not show ChatGPT**; remove `setup.chatgpt` from all locales and report to Nick (a reminder for OAuth on the server exists in the Zenzu list).
- [ ] **Step 6:** `Footer.astro`: add `<li>` with `localePath('/mcp/', locale)` and `t.footer.mcp` after the Compare link. `llms.ts`: add the page to the full listing. Confirm `dist/sitemap-0.xml` contains the 6 `/mcp/` URLs after a build.
- [ ] **Step 7:** `npm test && npm run build`; check `/mcp/` and `/uk/mcp/` at 360 px and 1440 px. Commit: `Add the MCP page`.

### Task 9: Preview, approval, release

- [ ] **Step 1:** Lighthouse mobile on production home page now; record performance, LCP, CLS.
- [ ] **Step 2:** `npm run build && npx wrangler pages deploy dist --project-name=zenzu-landing --branch=preview`. Run Lighthouse on the preview URL. Performance must not be lower by more than 3 points; CLS must not be higher; fix before the next step if it is.
- [ ] **Step 3:** Manual pass on the preview: 6 locales home + `/mcp`; reduced motion; forced colours; JavaScript off; 360 px and 1440 px.
- [ ] **Step 4:** Whole-branch code review (most capable model). Fix findings.
- [ ] **Step 5:** Send Nick the preview URL. **Stop. Wait for approval of the look.**
- [ ] **Step 6:** After approval: `git push -u origin landing-grove`, then `loom enqueue` for repo `landing` (read `loom enqueue --help` for the arguments). The queue merges, runs the gate and deploys.
- [ ] **Step 7:** After "zenzu.app задеплоєно": check https://zenzu.app/ and https://zenzu.app/mcp/ live. Remove the worktree and the local branch.
