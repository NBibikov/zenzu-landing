import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { MCP_PROMPTS, MCP_TOOL_GROUPS } from '../src/data/mcp.ts'

const LOCALES = ['en', 'uk', 'de', 'fr', 'es', 'pt'] as const
const OTHER_LOCALES = LOCALES.filter((locale) => locale !== 'en')

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

function load(locale: string): Json {
  const url = new URL(`../src/i18n/${locale}.json`, import.meta.url)
  return JSON.parse(readFileSync(url, 'utf8')) as Json
}

// Flattens a JSON tree to [dotted path, leaf value] pairs.
// An array index is part of the path: "a.b.0".
function flatten(node: Json, path = ''): [string, Json][] {
  if (node === null || typeof node !== 'object') return [[path, node]]
  const entries = Array.isArray(node)
    ? node.map((value, index): [string, Json] => [String(index), value])
    : Object.entries(node)
  return entries.flatMap(([key, value]) => flatten(value, path ? `${path}.${key}` : key))
}

const flat = Object.fromEntries(LOCALES.map((locale) => [locale, flatten(load(locale))]))

function paths(locale: string): string[] {
  return flat[locale].map(([path]) => path).sort()
}

test('every locale has the same key paths as en', () => {
  for (const locale of OTHER_LOCALES) {
    assert.deepEqual(paths(locale), paths('en'), `${locale} has different key paths than en`)
  }
})

// Empty values that are correct by design. Each entry needs a reason.
// uk: the hero headline starts with the highlighted word ("Спокійно вчи мову
// щодня"), so the text before the highlight is empty.
const INTENTIONALLY_EMPTY = new Set(['uk: hero.headline1'])

test('no locale has an empty string value', () => {
  const empty = LOCALES.flatMap((locale) =>
    flat[locale]
      .filter(([, value]) => typeof value === 'string' && value.trim() === '')
      .map(([path]) => `${locale}: ${path}`),
  ).filter((entry) => !INTENTIONALLY_EMPTY.has(entry))
  assert.deepEqual(empty, [])
})

test('no locale mentions endless animations', () => {
  const pattern =
    /endless animations|безкінечних анімацій|endlosen Animationen|animations sans fin|animaciones infinitas|animações infinitas/i
  const hits = LOCALES.filter((locale) => pattern.test(readFileSync(new URL(`../src/i18n/${locale}.json`, import.meta.url), 'utf8')))
  assert.deepEqual(hits, [])
})

// The MCP page lists every tool and prompt of src/data/mcp.ts, one line each.
// A tool added to the data without a line, or a stale line, fails here.
function keysOf(locale: string, section: string): string[] {
  const root = load(locale) as { mcpPage?: Record<string, Json> }
  const node = root.mcpPage?.[section]
  assert.ok(node && typeof node === 'object' && !Array.isArray(node), `${locale}: mcpPage.${section} is missing`)
  return Object.keys(node).sort()
}

test('mcpPage.tools has exactly the tools of MCP_TOOL_GROUPS', () => {
  const tools = MCP_TOOL_GROUPS.flatMap((group) => group.tools).sort()
  for (const locale of LOCALES) assert.deepEqual(keysOf(locale, 'tools'), tools, locale)
})

test('mcpPage.groups has exactly the group ids of MCP_TOOL_GROUPS', () => {
  const ids = MCP_TOOL_GROUPS.map((group) => group.id).sort()
  for (const locale of LOCALES) assert.deepEqual(keysOf(locale, 'groups'), ids, locale)
})

test('mcpPage.prompts has exactly MCP_PROMPTS', () => {
  for (const locale of LOCALES) assert.deepEqual(keysOf(locale, 'prompts'), [...MCP_PROMPTS].sort(), locale)
})

// Site-owner rule: the MCP copy (home block and page) and the feature
// details say nothing about plans, prices or quotas of a plan. The match is
// case-sensitive on purpose: the plan name is "Plus", while French "plus"
// ("more") is an ordinary word. A price is a number next to a currency sign.
const PLAN_OR_PRICE = /\bPlus\b|\bPremium\b|[$€£₴]\s?\d|\d\s?[$€£₴]/

function planFreeSections(locale: string): [string, Json][] {
  const root = load(locale) as {
    mcp?: Json
    mcpPage?: Json
    features?: Record<string, Json>
  }
  assert.ok(root.mcp && root.mcpPage && root.features, `${locale}: a section is missing`)
  const more = Object.entries(root.features)
    .filter(([, value]) => value !== null && typeof value === 'object' && !Array.isArray(value) && 'more' in value)
    .map(([key, value]): [string, Json] => [`features.${key}.more`, (value as { more: Json }).more])
  assert.ok(more.length >= 9, `${locale}: found ${more.length} feature details`)
  return [['mcp', root.mcp], ['mcpPage', root.mcpPage], ...more]
}

test('MCP copy and feature details never mention plans or prices', () => {
  for (const locale of LOCALES) {
    for (const [section, node] of planFreeSections(locale)) {
      for (const [path, value] of flatten(node, section)) {
        if (typeof value !== 'string') continue
        assert.doesNotMatch(value, PLAN_OR_PRICE, `${locale}: ${path}`)
      }
    }
  }
})

test('the plan check catches a plan name and a price, not French "plus"', () => {
  assert.match('Available with Zenzu Plus.', PLAN_OR_PRICE)
  assert.match('Only $4.99 a month.', PLAN_OR_PRICE)
  assert.match('Nur 4,99 € im Monat.', PLAN_OR_PRICE)
  assert.doesNotMatch('Il pourra aussi ajouter plus de cartes.', PLAN_OR_PRICE)
})

// Search engines cut a description after about 160 characters.
test('the MCP page description fits 160 characters in every locale', () => {
  for (const locale of LOCALES) {
    const root = load(locale) as { mcpPage: { meta: { description: string } } }
    const length = [...root.mcpPage.meta.description].length
    assert.ok(length <= 160, `${locale}: ${length} characters`)
  }
})

// fr.json writes the apostrophe straight ('), as most of the file does.
test('the French MCP copy uses the straight apostrophe', () => {
  const root = load('fr') as { mcp: Json; mcpPage: Json }
  assert.doesNotMatch(JSON.stringify([root.mcp, root.mcpPage]), /’/)
})
