/**
 * CommentSection Component - Display and manage task comments
 * Implements T030: Implement comment UI
 */

import { useState, useEffect } from 'react'
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react'
import CommentForm from './CommentForm'

export default function CommentSection({ todoId, listId, onCommentAdded }) {
  const supabase = useSupabaseClient()
  const session = useSession()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    if (todoId) {
      loadComments()
      subscribeToComments()
    }
  }, [todoId])

  const loadComments = async () => {
    setLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select(`
          *,
          users (
            id,
            email,
            name,
            avatar_url
          )
        `)
        .eq('todo_id', todoId)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      setComments(data || [])
    } catch (err) {
      setError('Failed to load comments')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToComments = () => {
    const channel = supabase
      .channel(`comments:${todoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `todo_id=eq.${todoId}`
        },
        async (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              // Fetch user data for the new comment
              const { data: userData } = await supabase
                .from('users')
                .select('id, email, name, avatar_url')
                .eq('id', payload.new.user_id)
                .single()

              setComments(current => [...current, { ...payload.new, users: userData }])
              break
            case 'UPDATE':
              setComments(current =>
                current.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c)
              )
              break
            case 'DELETE':
              setComments(current => current.filter(c => c.id !== payload.old.id))
              break
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleCommentAdded = (newComment) => {
    // Comment will be added via real-time subscription
    if (onCommentAdded) {
      onCommentAdded(newComment)
    }
  }

  const handleEdit = (comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return

    try {
      const { error: updateError } = await supabase
        .from('comments')
        .update({ content: editContent.trim() })
        .eq('id', editingId)

      if (updateError) throw updateError
      setEditingId(null)
      setEditContent('')
    } catch (err) {
      setError('Failed to update comment')
    }
  }

  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return

    try {
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (deleteError) throw deleteError
    } catch (err) {
      setError('Failed to delete comment')
    }
  }

  const handleResolve = async (comment) => {
    try {
      const { error: updateError } = await supabase
        .from('comments')
        .update({ resolved: !comment.resolved })
        .eq('id', comment.id)

      if (updateError) throw updateError
    } catch (err) {
      setError('Failed to update comment')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date

    // Less than 1 minute
    if (diff < 60000) return 'just now'
    // Less than 1 hour
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    // Less than 24 hours
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    // Otherwise show date
    return date.toLocaleDateString()
  }

  const getUserDisplayName = (user) => {
    if (user?.name) return user.name
    if (user?.email) return user.email.split('@')[0]
    return 'Unknown'
  }

  const getUserAvatar = (user) => {
    if (user?.avatar_url) {
      return (
        <img
          src={user.avatar_url}
          alt={getUserDisplayName(user)}
          className="w-8 h-8 rounded-full"
        />
      )
    }
    return (
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
        <span className="text-indigo-600 font-medium text-sm">
          {getUserDisplayName(user).charAt(0).toUpperCase()}
        </span>
      </div>
    )
  }

  const highlightMentions = (content) => {
    // Replace @mentions with styled spans
    const parts = content.split(/(@\w+)/g)
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-indigo-600 font-medium">
            {part}
          </span>
        )
      }
      return part
    })
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading comments...
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <h3 className="font-medium text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Comments list */}
      <div className="divide-y max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 ${comment.resolved ? 'bg-gray-50' : ''}`}
            >
              <div className="flex items-start space-x-3">
                {getUserAvatar(comment.users)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 text-sm">
                        {getUserDisplayName(comment.users)}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {formatDate(comment.created_at)}
                      </span>
                      {comment.resolved && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Resolved
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    {session?.user?.id === comment.user_id && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleResolve(comment)}
                          className="p-1 text-gray-400 hover:text-green-600"
                          title={comment.resolved ? 'Unresolve' : 'Resolve'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(comment)}
                          className="p-1 text-gray-400 hover:text-indigo-600"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  {editingId === comment.id ? (
                    <div className="mt-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        rows={2}
                      />
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={`mt-1 text-sm ${comment.resolved ? 'text-gray-500' : 'text-gray-700'}`}>
                      {highlightMentions(comment.content)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add comment form */}
      <div className="border-t p-4">
        <CommentForm
          todoId={todoId}
          listId={listId}
          onCommentAdded={handleCommentAdded}
        />
      </div>
    </div>
  )
}
