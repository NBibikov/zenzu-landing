// The hosted Zenzu MCP server, as the site describes it.
// Source of truth: supabase/functions/mcp/ in the app repo.
// tests/mcp-data.test.ts keeps these lists equal to the server code.

export const MCP_URL = 'https://vomksfxhelvowvtcfhoh.supabase.co/functions/v1/mcp'

export type McpGroupId = 'decks' | 'review' | 'progress' | 'courses' | 'workspace' | 'media'

export const MCP_TOOL_GROUPS: readonly { id: McpGroupId; tools: readonly string[] }[] = [
  {
    id: 'decks',
    tools: [
      'list_decks',
      'get_deck_cards',
      'search_my_cards',
      'create_deck',
      'update_deck',
      'delete_deck',
      'add_card',
      'add_cards',
      'update_card',
      'delete_card',
      'move_card',
      'list_inbox_items',
    ],
  },
  {
    id: 'review',
    tools: ['get_due_cards', 'review_card', 'get_review_history', 'get_interference_pairs'],
  },
  {
    id: 'progress',
    tools: ['get_progress', 'get_study_stats', 'get_cefr_level', 'get_assessment_results'],
  },
  {
    id: 'courses',
    tools: ['get_course_progress', 'get_lesson_content', 'get_reading_progress'],
  },
  {
    id: 'workspace',
    tools: [
      'list_workspace_entries',
      'get_workspace_entry',
      'get_workspace_attempts',
      'create_workspace_entry',
      'update_workspace_entry',
      'delete_workspace_entry',
    ],
  },
  {
    id: 'media',
    tools: ['search_media_decks', 'get_media_deck'],
  },
]

// Listed tools that need a token with the write scope ("Allow writes" in the
// app). The server refuses them for a read-only token.
export const MCP_WRITE_TOOLS: readonly string[] = [
  'create_deck',
  'update_deck',
  'delete_deck',
  'add_card',
  'add_cards',
  'update_card',
  'delete_card',
  'move_card',
  'review_card',
  'create_workspace_entry',
  'update_workspace_entry',
  'delete_workspace_entry',
]

export const MCP_PROMPTS = ['vocab_from_text', 'review_session', 'weekly_report'] as const

// Server tools the site does not list. get_plus_status reports the plan and
// its quotas; the site says nothing about plans.
export const MCP_OMITTED_TOOLS = ['get_plus_status'] as const

export type McpScenarioId = 'deck' | 'review' | 'confused' | 'report' | 'media' | 'level'

// `uses` names the tools and prompts behind a scenario. `write` is true when
// one of them needs a token that allows writes.
export const MCP_SCENARIOS: readonly { id: McpScenarioId; uses: readonly string[]; write: boolean }[] = [
  { id: 'deck', uses: ['vocab_from_text', 'create_deck', 'add_cards'], write: true },
  { id: 'review', uses: ['get_due_cards', 'review_card', 'review_session'], write: true },
  { id: 'confused', uses: ['get_interference_pairs', 'get_review_history'], write: false },
  { id: 'report', uses: ['weekly_report', 'get_study_stats', 'get_progress'], write: false },
  { id: 'media', uses: ['search_media_decks', 'get_media_deck'], write: false },
  { id: 'level', uses: ['get_cefr_level', 'get_course_progress'], write: false },
]
