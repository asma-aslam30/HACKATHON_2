import { useState, useEffect } from 'react'

// Service for handling collaboration features
class CollaborationService {
  constructor(supabase) {
    this.supabase = supabase
  }

  // Add a comment to a todo
  async addComment(todoId, userId, content) {
    const { data, error } = await this.supabase
      .from('comments')
      .insert([
        {
          todo_id: todoId,
          user_id: userId,
          content: content
        }
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get comments for a specific todo
  async getComments(todoId) {
    const { data, error } = await this.supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        users(email, user_metadata)
      `)
      .eq('todo_id', todoId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  }

  // Add a collaborator to a todo
  async addCollaborator(todoId, collaboratorId, role = 'viewer') {
    const { data, error } = await this.supabase
      .from('collaborations')
      .insert([
        {
          todo_id: todoId,
          collaborator_id: collaboratorId,
          role: role
        }
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Remove a collaborator from a todo
  async removeCollaborator(todoId, collaboratorId) {
    const { data, error } = await this.supabase
      .from('collaborations')
      .delete()
      .match({ todo_id: todoId, collaborator_id: collaboratorId })

    if (error) throw error
    return data
  }

  // Get collaborators for a specific todo
  async getCollaborators(todoId) {
    const { data, error } = await this.supabase
      .from('collaborations')
      .select(`
        id,
        role,
        collaborator_id,
        users(email, user_metadata)
      `)
      .eq('todo_id', todoId)

    if (error) throw error
    return data
  }

  // Update a todo's collaborators
  async updateCollaborators(todoId, collaborators) {
    // First, remove all existing collaborators
    await this.supabase
      .from('collaborations')
      .delete()
      .eq('todo_id', todoId)

    // Then add the new collaborators
    if (collaborators && collaborators.length > 0) {
      const { error } = await this.supabase
        .from('collaborations')
        .insert(
          collaborators.map(collab => ({
            todo_id: todoId,
            collaborator_id: collab.id,
            role: collab.role || 'viewer'
          }))
        )

      if (error) throw error
    }
  }
}

// React hook for using collaboration functionality
export function useCollaboration(supabase, todoId) {
  const [comments, setComments] = useState([])
  const [collaborators, setCollaborators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const collaborationService = new CollaborationService(supabase)

  useEffect(() => {
    if (!todoId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const [commentsData, collaboratorsData] = await Promise.all([
          collaborationService.getComments(todoId),
          collaborationService.getCollaborators(todoId)
        ])

        setComments(commentsData || [])
        setCollaborators(collaboratorsData || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up real-time subscriptions for comments
    const commentsChannel = supabase
      .channel(`comments:${todoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `todo_id=eq.${todoId}`
        },
        (payload) => {
          setComments(current => {
            switch (payload.eventType) {
              case 'INSERT':
                return [...current, payload.new]
              case 'UPDATE':
                return current.map(comment =>
                  comment.id === payload.new.id ? payload.new : comment
                )
              case 'DELETE':
                return current.filter(comment => comment.id !== payload.old.id)
              default:
                return current
            }
          })
        }
      )
      .subscribe()

    // Set up real-time subscriptions for collaborators
    const collaboratorsChannel = supabase
      .channel(`collaborators:${todoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaborations',
          filter: `todo_id=eq.${todoId}`
        },
        (payload) => {
          setCollaborators(current => {
            switch (payload.eventType) {
              case 'INSERT':
                return [...current, payload.new]
              case 'UPDATE':
                return current.map(collab =>
                  collab.id === payload.new.id ? payload.new : collab
                )
              case 'DELETE':
                return current.filter(collab => collab.id !== payload.old.id)
              default:
                return current
            }
          })
        }
      )
      .subscribe()

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(commentsChannel)
      supabase.removeChannel(collaboratorsChannel)
    }
  }, [supabase, todoId])

  return {
    comments,
    collaborators,
    loading,
    error,
    addComment: (userId, content) => collaborationService.addComment(todoId, userId, content),
    addCollaborator: (collaboratorId, role) => collaborationService.addCollaborator(todoId, collaboratorId, role),
    removeCollaborator: (collaboratorId) => collaborationService.removeCollaborator(todoId, collaboratorId),
    updateCollaborators: (collabs) => collaborationService.updateCollaborators(todoId, collabs)
  }
}