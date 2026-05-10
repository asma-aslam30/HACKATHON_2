/**
 * Voice command parser — maps speech to app actions
 * Works entirely client-side via Web Speech API
 */

export const COMMANDS = [
  // Task creation
  { patterns: [/^add (?:a )?task (.+)/i, /^create (?:a )?task (.+)/i, /^new task (.+)/i, /^remember to (.+)/i, /^remind me to (.+)/i],
    action: 'ADD_TASK', extract: m => ({ title: m[1] }) },

  // Listing
  { patterns: [/^show (?:all )?(?:my )?tasks/i, /^list (?:all )?(?:my )?tasks/i, /^what(?:'s| are) (?:my )?tasks/i],
    action: 'LIST_TASKS', extract: () => ({ filter: 'all' }) },
  { patterns: [/^show (?:my )?pending tasks/i, /^what(?:'s| are) pending/i, /^show incomplete/i],
    action: 'LIST_TASKS', extract: () => ({ filter: 'active' }) },
  { patterns: [/^show (?:my )?completed tasks/i, /^what (?:have I|did I) complete/i],
    action: 'LIST_TASKS', extract: () => ({ filter: 'completed' }) },
  { patterns: [/^show overdue/i, /^what(?:'s| is) overdue/i],
    action: 'LIST_TASKS', extract: () => ({ filter: 'overdue' }) },

  // Complete
  { patterns: [/^complete task (.+)/i, /^mark task (.+) (?:as )?done/i, /^finish task (.+)/i, /^done with task (.+)/i],
    action: 'COMPLETE_TASK', extract: m => ({ query: m[1] }) },

  // Delete
  { patterns: [/^delete task (.+)/i, /^remove task (.+)/i, /^cancel task (.+)/i],
    action: 'DELETE_TASK', extract: m => ({ query: m[1] }) },

  // Search
  { patterns: [/^search (?:for )?(.+)/i, /^find (?:tasks? (?:about|with|named)? ?)?(.+)/i],
    action: 'SEARCH', extract: m => ({ query: m[1] }) },

  // Filters
  { patterns: [/^show (?:tasks )?due today/i, /^what(?:'s| is) due today/i],
    action: 'LIST_TASKS', extract: () => ({ filter: 'due_today' }) },
  { patterns: [/^show (?:tasks )?due this week/i],
    action: 'LIST_TASKS', extract: () => ({ filter: 'due_this_week' }) },

  // Navigation
  { patterns: [/^open (?:ai )?chat/i, /^go to chat/i, /^open chatbot/i],
    action: 'NAVIGATE', extract: () => ({ path: '/chat' }) },
  { patterns: [/^go (?:to )?(?:the )?(?:home|tasks|board)/i, /^open tasks/i],
    action: 'NAVIGATE', extract: () => ({ path: '/' }) },

  // New task shortcut
  { patterns: [/^new task/i, /^add task/i, /^create task/i],
    action: 'OPEN_CREATE', extract: () => ({}) },

  // Priority commands
  { patterns: [/^(?:add|create) (?:urgent|high priority) (?:task )?(.+)/i],
    action: 'ADD_TASK', extract: m => ({ title: m[1], priority: 'high' }) },

  // Urdu commands
  { patterns: [/^نیا کام (.+)/i, /^کام شامل کریں (.+)/i],
    action: 'ADD_TASK', extract: m => ({ title: m[1] }) },
  { patterns: [/^کام دکھائیں/i, /^میرے کام/i],
    action: 'LIST_TASKS', extract: () => ({ filter: 'all' }) },
]

/**
 * Parse a voice transcript into a command object
 * @param {string} transcript
 * @returns {{ action: string, params: object } | null}
 */
export function parseCommand(transcript) {
  const text = transcript.trim().toLowerCase()
  for (const cmd of COMMANDS) {
    for (const pattern of cmd.patterns) {
      const m = transcript.match(pattern)
      if (m) {
        return { action: cmd.action, params: cmd.extract(m) }
      }
    }
  }
  // No command matched — send to AI chat as fallback
  return { action: 'AI_CHAT', params: { message: transcript } }
}

/**
 * Speak a response aloud using Web Speech API
 * @param {string} text
 */
export function speak(text, lang = 'en-US') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = lang
  utt.rate = 1.0
  utt.pitch = 1.0
  utt.volume = 1.0
  window.speechSynthesis.speak(utt)
}

/** Check if Urdu text is present to switch lang */
export function detectLang(text) {
  return /[\u0600-\u06FF]/.test(text) ? 'ur-PK' : 'en-US'
}
