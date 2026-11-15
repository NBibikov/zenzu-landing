import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import {
  MCP_OMITTED_TOOLS,
  MCP_PROMPTS,
  MCP_SCENARIOS,
  MCP_TOOL_GROUPS,
  MCP_URL,
  MCP_WRITE_TOOLS,
} from '../src/data/mcp.ts'

// The site lists the tools of the hosted MCP server. These tests read the
// server source in the app repo and fail when the two drift apart. Without
// the app repo (CI, another machine) they skip.

const APP_REPO = process.env.ZENZU_APP_REPO ?? join(homedir(), 'Repositories', 'zenzu')
const MCP_DIR = join(APP_REPO, 'supabase', 'functions', 'mcp')
const TOOLS_FILE = join(MCP_DIR, 'tools.ts')
const PROMPTS_FILE = join(MCP_DIR, 'prompts.ts')
const SCREEN_FILE = join(APP_REPO, 'lib', 'src', 'features', 'settings', 'presentation', 'mcp_access_screen.dart')

const hasRepo = existsSync(TOOLS_FILE)
const skip = hasRepo ? false : `app repo not found at ${APP_REPO}`

// The text of one array literal: from `export const <name>` to the first
// line that closes it (`];` at column 0).
function arrayBody(source: string, name: string): string {
  const start = source.indexOf(`export const ${name}`)
  assert.ok(start >= 0, `${name} not found`)
  const end = source.indexOf('\n];', start)
  assert.ok(end > start, `end of ${name} not found`)
  return source.slice(start, end)
}

// Each definition object opens its own `name: "…"` at an indent of four
// spaces. Argument and schema names sit deeper, so they do not match.
const NAME_LINE = /^ {4}name: "([a-z_]+)",$/gm

interface Def { name: string; body: string }

function definitions(body: string): Def[] {
  const matches = [...body.matchAll(NAME_LINE)]
  return matches.map((match, index) => ({
    name: match[1],
    body: body.slice(match.index, matches[index + 1]?.index ?? body.length),
  }))
}

function serverTools(): Def[] {
  return definitions(arrayBody(readFileSync(TOOLS_FILE, 'utf8'), 'TOOL_DEFS'))
}

function serverPrompts(): string[] {
  return definitions(arrayBody(readFileSync(PROMPTS_FILE, 'utf8'), 'PROMPT_DEFS')).map((def) => def.name)
}

// tools.ts marks a mutating tool with `write: true` on the definition;
// WRITE_TOOL_NAMES is derived from that flag and drives the scope gate.
function serverWriteTools(): Set<string> {
  return new Set(serverTools().filter((def) => /^ {4}write: true,$/m.test(def.body)).map((def) => def.name))
}

const siteTools = MCP_TOOL_GROUPS.flatMap((group) => group.tools)

test('the server source parses', { skip }, () => {
  assert.ok(serverTools().length > 20, `found ${serverTools().length} tools`)
  assert.ok(serverWriteTools().size > 5, `found ${serverWriteTools().size} write tools`)
  assert.ok(serverPrompts().length > 0)
})

test('the site lists every server tool once, or omits it on purpose', { skip }, () => {
  const listed = [...siteTools, ...MCP_OMITTED_TOOLS]
  assert.equal(new Set(listed).size, listed.length, 'a tool is listed twice')
  assert.deepEqual([...listed].sort(), serverTools().map((def) => def.name).sort())
})

test('the site prompts equal the server prompts', { skip }, () => {
  assert.deepEqual([...MCP_PROMPTS].sort(), serverPrompts().sort())
})

test('every scenario uses only server tools and prompts', () => {
  const known = new Set<string>([...siteTools, ...MCP_PROMPTS])
  for (const scenario of MCP_SCENARIOS) {
    for (const name of scenario.uses) {
      assert.ok(known.has(name), `${scenario.id} uses unknown ${name}`)
    }
  }
})

test('the en copy has one scenario string per scenario id', () => {
  const en = JSON.parse(readFileSync(new URL('../src/i18n/en.json', import.meta.url), 'utf8'))
  assert.deepEqual(Object.keys(en.mcp.scenarios).sort(), MCP_SCENARIOS.map((scenario) => scenario.id).sort())
})

test('a scenario is marked write exactly when it uses a write tool', { skip }, () => {
  const writeTools = serverWriteTools()
  for (const scenario of MCP_SCENARIOS) {
    const writes = scenario.uses.some((name) => writeTools.has(name))
    assert.equal(scenario.write, writes, `${scenario.id}: write is ${scenario.write}, tools say ${writes}`)
  }
})

test('the app shows the same server URL', { skip }, () => {
  assert.ok(readFileSync(SCREEN_FILE, 'utf8').includes(`'${MCP_URL}'`), `${MCP_URL} not in mcp_access_screen.dart`)
})

test('every write tool is a listed tool', () => {
  for (const name of MCP_WRITE_TOOLS) assert.ok(siteTools.includes(name), `${name} is not listed`)
})

test('the site write tools equal the listed server write tools', { skip }, () => {
  const listedWrites = [...serverWriteTools()].filter((name) => siteTools.includes(name)).sort()
  assert.deepEqual([...MCP_WRITE_TOOLS].sort(), listedWrites)
})
