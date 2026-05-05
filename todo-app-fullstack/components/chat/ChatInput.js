import { useState, useRef } from 'react'

const SUGGESTIONS = [
  "Show all my tasks",
  "Add a task to buy groceries",
  "What's pending?",
  "Mark task 1 as done",
]

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const textareaRef = useRef(null)

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    setShowSuggestions(false)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="relative">
      {/* Suggestions */}
      {showSuggestions && value === '' && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <p className="px-3 py-2 text-xs text-gray-400 font-medium border-b border-gray-100">Suggestions</p>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => { setValue(s); setShowSuggestions(false); textareaRef.current?.focus() }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        {/* Suggestions toggle */}
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="flex-shrink-0 text-gray-400 hover:text-indigo-600 transition-colors mb-1"
          title="Show suggestions"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => { setValue(e.target.value); if (e.target.value !== '') setShowSuggestions(false) }}
          onKeyDown={handleKeyDown}
          onFocus={() => value === '' && setShowSuggestions(false)}
          placeholder="Ask me to manage your tasks... (Enter to send)"
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent outline-none resize-none text-sm text-gray-800 placeholder-gray-400 py-1 max-h-32 disabled:opacity-50"
          style={{ minHeight: '24px' }}
          onInput={e => {
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
          }}
        />

        <button
          onClick={submit}
          disabled={!value.trim() || disabled}
          className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-1 text-center">
        Shift+Enter for new line · Powered by Gemini 2.5 Flash
      </p>
    </div>
  )
}
