import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import VoiceButton from '../voice/VoiceButton'

export default function ChatWindow({ userId, conversationId, onConversationCreated }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "👋 Hi! I'm your AI Todo assistant powered by Gemini. You can tell me things like:\n- \"Add a task to buy groceries\"\n- \"Show my pending tasks\"\n- \"Mark task 3 as done\"\n- \"Delete the meeting task\"\n\nWhat would you like to do?",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeConvId, setActiveConvId] = useState(conversationId || null)
  const bottomRef = useRef(null)

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return

    const userMsg = { id: Date.now(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${BACKEND_URL}/api/${userId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversation_id: activeConvId,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Chat request failed')
      }

      const data = await res.json()

      // Set conversation ID from first response
      if (!activeConvId && data.conversation_id) {
        setActiveConvId(data.conversation_id)
        onConversationCreated?.(data.conversation_id)
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.response,
          toolCalls: data.tool_calls,
        },
      ])
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: '⚠️ Sorry, I ran into an error. Please try again.',
          isError: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mb-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 px-4 py-3">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <ChatInput onSend={sendMessage} disabled={loading} />
          </div>
          <div className="mb-7">
            <VoiceButton onTranscript={sendMessage} disabled={loading} size="md" />
          </div>
        </div>
      </div>
    </div>
  )
}
