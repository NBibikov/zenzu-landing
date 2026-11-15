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

// Site-owner rule: the MCP page says nothing about plans, prices or quotas.
test('mcpPage never mentions Plus', () => {
  for (const locale of LOCALES) {
    const root = load(locale) as { mcpPage?: Json }
    assert.doesNotMatch(JSON.stringify(root.mcpPage ?? {}), /\bPlus\b/, locale)
  }
})
