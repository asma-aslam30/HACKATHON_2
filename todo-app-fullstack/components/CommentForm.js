/**
 * CommentForm Component - Create new comments with @mention support
 * Implements T032: Add comment creation interface
 */

import { useState, useRef, useEffect } from 'react'
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react'

export default function CommentForm({ todoId, listId, onCommentAdded }) {
  const supabase = useSupabaseClient()
  const session = useSession()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [collaborators, setCollaborators] = useState([])
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const textareaRef = useRef(null)

  useEffect(() => {
    if (listId) {
      loadCollaborators()
    }
  }, [listId])

  const loadCollaborators = async () => {
    const { data, error } = await supabase
      .from('collaborations')
      .select(`
        user_id,
        users (
          id,
          email,
          name
        )
      `)
      .eq('list_id', listId)

    if (!error && data) {
      setCollaborators(data.map(c => c.users).filter(Boolean))
    }
  }

  const handleChange = (e) => {
    const value = e.target.value
    setContent(value)

    // Check for @ mentions
    const cursorPos = e.target.selectionStart
    const textBeforeCursor = value.slice(0, cursorPos)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1].toLowerCase())
      setShowMentions(true)

      // Calculate dropdown position
      const textarea = textareaRef.current
      if (textarea) {
        // Simple positioning - show below textarea
        setMentionPosition({
          top: textarea.offsetHeight + 5,
          left: 0
        })
      }
    } else {
      setShowMentions(false)
    }
  }

  const insertMention = (user) => {
    const cursorPos = textareaRef.current?.selectionStart || content.length
    const textBeforeCursor = content.slice(0, cursorPos)
    const textAfterCursor = content.slice(cursorPos)

    // Find the @ symbol position
    const atIndex = textBeforeCursor.lastIndexOf('@')
    const newText = textBeforeCursor.slice(0, atIndex) +
      `@${user.name || user.email.split('@')[0]} ` +
      textAfterCursor

    setContent(newText)
    setShowMentions(false)
    textareaRef.current?.focus()
  }

  const filteredCollaborators = collaborators.filter(user => {
    if (!mentionQuery) return true
    const name = (user.name || user.email || '').toLowerCase()
    return name.includes(mentionQuery)
  })

  const parseMentions = (text) => {
    const mentionRegex = /@(\w+)/g
    const mentions = []
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      const username = match[1].toLowerCase()
      const user = collaborators.find(u =>
        (u.name || u.email.split('@')[0]).toLowerCase() === username
      )
      if (user) {
        mentions.push(user.id)
      }
    }

    return [...new Set(mentions)]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || !session?.user?.id) return

    setSubmitting(true)
    setError(null)

    try {
      const mentions = parseMentions(content)

      const { data, error: insertError } = await supabase
        .from('comments')
        .insert({
          todo_id: todoId,
          user_id: session.user.id,
          content: content.trim(),
          mentions
        })
        .select(`
          *,
          users (
            id,
            email,
            name,
            avatar_url
          )
        `)
        .single()

      if (insertError) throw insertError

      setContent('')
      if (onCommentAdded) {
        onCommentAdded(data)
      }
    } catch (err) {
      setError(err.message || 'Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e) => {
    // Submit on Ctrl/Cmd + Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e)
    }

    // Handle mention dropdown navigation
    if (showMentions) {
      if (e.key === 'Escape') {
        setShowMentions(false)
      }
    }
  }

  if (!session) {
    return (
      <div className="text-sm text-gray-500 text-center py-2">
        Sign in to add comments
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      {error && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment... Use @name to mention someone"
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
          rows={2}
          maxLength={1000}
        />

        {/* Mention dropdown */}
        {showMentions && filteredCollaborators.length > 0 && (
          <div
            className="absolute z-10 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto"
            style={{ top: mentionPosition.top, left: mentionPosition.left }}
          >
            {filteredCollaborators.slice(0, 5).map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => insertMention(user)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 text-xs font-medium">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <span>{user.name || user.email.split('@')[0]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {content.length}/1000
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">
            Ctrl+Enter to submit
          </span>
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  )
}
