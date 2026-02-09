/**
 * Comment Service - Comment management functionality
 * Implements T028: Create comment management service
 * Implements T029: Add comment functionality to task model
 * Implements T034: Add comment validation and sanitization
 * Implements T042: Add @mention handling in comments and task descriptions
 */

import { CommentModel } from '../models/commentModel.js'

export class CommentService {
  constructor(supabase) {
    this.supabase = supabase
    this.commentModel = new CommentModel(supabase)
  }

  /**
   * Create a new comment with mention parsing and validation
   * @param {Object} params - Comment parameters
   * @returns {Promise<Object>} The created comment
   */
  async createComment({ todoId, userId, content, listId }) {
    // Validate content
    const validatedContent = this.validateContent(content)

    // Parse mentions from content
    const mentionedUsernames = this.parseMentions(validatedContent)

    // Resolve mentions to user IDs if we have a list context
    let mentionUserIds = []
    if (listId && mentionedUsernames.length > 0) {
      const resolvedMentions = await this.resolveMentions(mentionedUsernames, listId)
      mentionUserIds = resolvedMentions
        .filter(m => m.valid)
        .map(m => m.userId)
    }

    // Create the comment
    const comment = await this.commentModel.create({
      todoId,
      userId,
      content: validatedContent,
      mentions: mentionUserIds
    })

    return comment
  }

  /**
   * Get all comments for a task
   * @param {string} todoId - The task ID
   * @returns {Promise<Array>} Array of comments
   */
  async getComments(todoId) {
    return this.commentModel.getByTodoId(todoId)
  }

  /**
   * Get comment by ID
   * @param {string} commentId - The comment ID
   * @returns {Promise<Object|null>} The comment or null
   */
  async getCommentById(commentId) {
    return this.commentModel.getById(commentId)
  }

  /**
   * Update a comment
   * @param {string} commentId - The comment ID
   * @param {string} content - New content
   * @param {string} userId - User making the update
   * @param {string} listId - Optional list ID for mention resolution
   * @returns {Promise<Object>} Updated comment
   */
  async updateComment(commentId, content, userId, listId = null) {
    // Verify ownership
    const comment = await this.commentModel.getById(commentId)
    if (!comment) {
      throw new Error('Comment not found')
    }
    if (comment.userId !== userId) {
      throw new Error('You can only edit your own comments')
    }

    // Validate and parse
    const validatedContent = this.validateContent(content)
    const mentionedUsernames = this.parseMentions(validatedContent)

    let mentionUserIds = []
    if (listId && mentionedUsernames.length > 0) {
      const resolvedMentions = await this.resolveMentions(mentionedUsernames, listId)
      mentionUserIds = resolvedMentions
        .filter(m => m.valid)
        .map(m => m.userId)
    }

    return this.commentModel.update(commentId, {
      content: validatedContent,
      mentions: mentionUserIds
    })
  }

  /**
   * Delete a comment
   * @param {string} commentId - The comment ID
   * @param {string} userId - User requesting deletion
   * @returns {Promise<void>}
   */
  async deleteComment(commentId, userId) {
    const comment = await this.commentModel.getById(commentId)
    if (!comment) {
      throw new Error('Comment not found')
    }
    if (comment.userId !== userId) {
      throw new Error('You can only delete your own comments')
    }

    await this.commentModel.delete(commentId)
  }

  /**
   * Resolve/unresolve a comment
   * @param {string} commentId - The comment ID
   * @param {boolean} resolved - Resolved status
   * @returns {Promise<Object>} Updated comment
   */
  async setResolved(commentId, resolved) {
    if (resolved) {
      return this.commentModel.resolve(commentId)
    }
    return this.commentModel.unresolve(commentId)
  }

  /**
   * Get comments where user was mentioned
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Array of comments
   */
  async getMentions(userId) {
    return this.commentModel.getByMentionedUser(userId)
  }

  /**
   * Validate comment content
   * @param {string} content - Raw content
   * @returns {string} Validated and sanitized content
   */
  validateContent(content) {
    if (!content || typeof content !== 'string') {
      throw new Error('Comment content is required')
    }

    // Trim and check length
    const trimmed = content.trim()
    if (trimmed.length === 0) {
      throw new Error('Comment cannot be empty')
    }
    if (trimmed.length > 1000) {
      throw new Error('Comment must be 1000 characters or less')
    }

    // Basic sanitization - remove potentially harmful HTML
    const sanitized = trimmed
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '') // Remove all HTML tags

    return sanitized
  }

  /**
   * Parse @mentions from content
   * @param {string} content - The content to parse
   * @returns {string[]} Array of mentioned usernames
   */
  parseMentions(content) {
    const mentionRegex = /@(\w+)/g
    const mentions = []
    let match

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1])
    }

    return [...new Set(mentions)]
  }

  /**
   * Resolve mention usernames to user IDs
   * @param {string[]} usernames - Array of usernames
   * @param {string} listId - The shared list ID
   * @returns {Promise<Array>} Array of {username, userId, valid}
   */
  async resolveMentions(usernames, listId) {
    // Get collaborators of the list
    const { data: collaborators, error } = await this.supabase
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

    if (error) throw error

    return usernames.map(username => {
      const collaborator = collaborators.find(c =>
        c.users?.name?.toLowerCase() === username.toLowerCase() ||
        c.users?.email?.split('@')[0].toLowerCase() === username.toLowerCase()
      )

      return {
        username,
        userId: collaborator?.user_id || null,
        valid: !!collaborator,
        user: collaborator?.users || null
      }
    })
  }

  /**
   * Get comment statistics for a task
   * @param {string} todoId - The task ID
   * @returns {Promise<Object>} Comment statistics
   */
  async getStats(todoId) {
    const comments = await this.commentModel.getByTodoId(todoId)

    const stats = {
      total: comments.length,
      resolved: comments.filter(c => c.resolved).length,
      unresolved: comments.filter(c => !c.resolved).length,
      byUser: {}
    }

    comments.forEach(comment => {
      if (!stats.byUser[comment.userId]) {
        stats.byUser[comment.userId] = 0
      }
      stats.byUser[comment.userId]++
    })

    return stats
  }

  /**
   * Get recent comments across all accessible tasks
   * @param {string} userId - The user ID
   * @param {number} limit - Maximum number of comments to return
   * @returns {Promise<Array>} Array of recent comments
   */
  async getRecentComments(userId, limit = 10) {
    // Get comments from user's tasks and shared lists they have access to
    const { data, error } = await this.supabase
      .from('comments')
      .select(`
        *,
        users (
          id,
          email,
          name,
          avatar_url
        ),
        todos (
          id,
          title,
          user_id,
          shared_list_id
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit * 2) // Fetch more to filter by access

    if (error) throw error

    // Filter to comments on tasks the user has access to
    const { data: userLists } = await this.supabase
      .from('collaborations')
      .select('list_id')
      .eq('user_id', userId)

    const accessibleListIds = userLists?.map(l => l.list_id) || []

    const filteredComments = data.filter(comment => {
      const todo = comment.todos
      if (!todo) return false

      // User owns the task
      if (todo.user_id === userId) return true

      // Task is in a list user has access to
      if (todo.shared_list_id && accessibleListIds.includes(todo.shared_list_id)) return true

      return false
    })

    return filteredComments.slice(0, limit).map(c => ({
      id: c.id,
      content: c.content,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      userId: c.user_id,
      todoId: c.todo_id,
      mentions: c.mentions || [],
      resolved: c.resolved,
      user: c.users ? {
        id: c.users.id,
        email: c.users.email,
        name: c.users.name,
        avatarUrl: c.users.avatar_url
      } : null,
      todo: c.todos ? {
        id: c.todos.id,
        title: c.todos.title
      } : null
    }))
  }
}

export default CommentService
