/**
 * Comment Model - Handles comment operations for tasks
 * Implements T027: Create Comment model
 */

export class CommentModel {
  constructor(supabase) {
    this.supabase = supabase
    this.tableName = 'comments'
  }

  /**
   * Create a new comment on a todo
   * @param {Object} params - Comment parameters
   * @param {string} params.todoId - The todo ID
   * @param {string} params.userId - The user ID of the commenter
   * @param {string} params.content - The comment content
   * @param {string[]} params.mentions - Array of mentioned user IDs
   * @returns {Promise<Object>} The created comment
   */
  async create({ todoId, userId, content, mentions = [] }) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        todo_id: todoId,
        user_id: userId,
        content,
        mentions,
        resolved: false
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

    if (error) throw error
    return this.transformFromDb(data)
  }

  /**
   * Get a comment by ID
   * @param {string} id - The comment ID
   * @returns {Promise<Object|null>} The comment or null
   */
  async getById(id) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        users (
          id,
          email,
          name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return this.transformFromDb(data)
  }

  /**
   * Get all comments for a todo
   * @param {string} todoId - The todo ID
   * @returns {Promise<Array>} Array of comments
   */
  async getByTodoId(todoId) {
    const { data, error } = await this.supabase
      .from(this.tableName)
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

    if (error) throw error
    return data.map(comment => this.transformFromDb(comment))
  }

  /**
   * Get all comments by a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Array of comments
   */
  async getByUserId(userId) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        todos (
          id,
          title
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(comment => this.transformFromDb(comment))
  }

  /**
   * Get comments where a user is mentioned
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Array of comments
   */
  async getByMentionedUser(userId) {
    const { data, error } = await this.supabase
      .from(this.tableName)
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
          title
        )
      `)
      .contains('mentions', [userId])
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(comment => this.transformFromDb(comment))
  }

  /**
   * Update a comment
   * @param {string} id - The comment ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} The updated comment
   */
  async update(id, updates) {
    const updateData = {}
    if (updates.content !== undefined) updateData.content = updates.content
    if (updates.mentions !== undefined) updateData.mentions = updates.mentions
    if (updates.resolved !== undefined) updateData.resolved = updates.resolved

    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
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

    if (error) throw error
    return this.transformFromDb(data)
  }

  /**
   * Mark a comment as resolved
   * @param {string} id - The comment ID
   * @returns {Promise<Object>} The updated comment
   */
  async resolve(id) {
    return this.update(id, { resolved: true })
  }

  /**
   * Mark a comment as unresolved
   * @param {string} id - The comment ID
   * @returns {Promise<Object>} The updated comment
   */
  async unresolve(id) {
    return this.update(id, { resolved: false })
  }

  /**
   * Delete a comment
   * @param {string} id - The comment ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Get comment count for a todo
   * @param {string} todoId - The todo ID
   * @returns {Promise<number>} Comment count
   */
  async getCountByTodoId(todoId) {
    const { count, error } = await this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('todo_id', todoId)

    if (error) throw error
    return count || 0
  }

  /**
   * Parse @mentions from comment content
   * @param {string} content - The comment content
   * @returns {string[]} Array of mentioned usernames
   */
  static parseMentions(content) {
    const mentionRegex = /@(\w+)/g
    const mentions = []
    let match

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1])
    }

    return [...new Set(mentions)] // Remove duplicates
  }

  /**
   * Transform database record to model format
   * @param {Object} dbRecord - Database record
   * @returns {Object} Transformed record
   */
  transformFromDb(dbRecord) {
    if (!dbRecord) return null
    return {
      id: dbRecord.id,
      content: dbRecord.content,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      userId: dbRecord.user_id,
      todoId: dbRecord.todo_id,
      mentions: dbRecord.mentions || [],
      resolved: dbRecord.resolved,
      user: dbRecord.users ? {
        id: dbRecord.users.id,
        email: dbRecord.users.email,
        name: dbRecord.users.name,
        avatarUrl: dbRecord.users.avatar_url
      } : null,
      todo: dbRecord.todos ? {
        id: dbRecord.todos.id,
        title: dbRecord.todos.title
      } : null
    }
  }
}

export default CommentModel
