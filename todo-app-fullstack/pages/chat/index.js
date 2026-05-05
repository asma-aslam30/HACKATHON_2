import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useApp } from '../../context/AppContext'
import ChatWindow from '../../components/chat/ChatWindow'
import ConversationSidebar from '../../components/chat/ConversationSidebar'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export default function ChatPage() {
  const router = useRouter()
  const { user, loading } = useApp()
  const [conversations, setConversations] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const [chatKey, setChatKey] = useState(0) // remount ChatWindow on new chat
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Auth guard
  useEffect(() => {
    if (!loading && !user) router.push('/auth')
  }, [user, loading, router])

  const userId = user?.id || 'demo-user'

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/${userId}/conversations`)
      if (res.ok) setConversations(await res.json())
    } catch {}
  }, [userId])

  useEffect(() => {
    if (user) loadConversations()
  }, [user, loadConversations])

  const handleNewChat = () => {
    setActiveConvId(null)
    setChatKey(k => k + 1)
  }

  const handleSelectConversation = (convId) => {
    setActiveConvId(convId)
    setChatKey(k => k + 1)
  }

  const handleConversationCreated = (convId) => {
    setActiveConvId(convId)
    loadConversations()
  }

  const handleDeleteConversation = async (convId) => {
    try {
      await fetch(`${BACKEND_URL}/api/${userId}/conversations/${convId}`, { method: 'DELETE' })
      setConversations(prev => prev.filter(c => c.id !== convId))
      if (activeConvId === convId) handleNewChat()
    } catch {}
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <Head>
        <title>AI Todo Assistant — Gemini 2.5 Flash</title>
      </Head>

      <div className="flex h-screen bg-gray-900 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 flex-shrink-0 border-r border-gray-700">
            <ConversationSidebar
              conversations={conversations}
              activeId={activeConvId}
              onSelect={handleSelectConversation}
              onNew={handleNewChat}
              onDelete={handleDeleteConversation}
            />
          </div>
        )}

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">✦</div>
              <div>
                <h1 className="font-semibold text-gray-900 text-sm leading-none">AI Todo Assistant</h1>
                <p className="text-xs text-gray-400 mt-0.5">Gemini 2.5 Flash · MCP Tools</p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <a href="/" className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Task Board
              </a>
              <span className="w-px h-4 bg-gray-200" />
              <span className="text-xs text-gray-400 bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                Phase III
              </span>
            </div>
          </header>

          {/* Chat window */}
          <div className="flex-1 overflow-hidden bg-white">
            <ChatWindow
              key={chatKey}
              userId={userId}
              conversationId={activeConvId}
              onConversationCreated={handleConversationCreated}
            />
          </div>
        </div>
      </div>
    </>
  )
}
