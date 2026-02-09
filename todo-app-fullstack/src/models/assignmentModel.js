/**
 * Assignment Model - Handles task assignment operations
 * Implements T035: Create Assignment model
 */

export class AssignmentModel {
  constructor(supabase) {
    this.supabase = supabase
    this.tableName = 'assignments'
  }

  /**
   * Create a new assignment
   * @param {Object} params - Assignment parameters
   * @param {string} params.todoId - The todo ID
   * @param {string} params.userId - The user ID being assigned
   * @param {string} params.assignedBy - The user ID who made the assignment
   * @returns {Promise<Object>} The created assignment
   */
  async create({ todoId, userId, assignedBy }) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        todo_id: todoId,
        user_id: userId,
        assigned_by: assignedBy,
        status: 'pending'
      })
      .select(`
        *,
        users!assignments_user_id_fkey (
          id,
          email,
          name,
          avatar_url
        ),
        todos (
          id,
          title,
          completed,
          priority,
          due_date
        )
      `)
      .single()

    if (error) throw error
    return this.transformFromDb(data)
  }

  /**
   * Get an assignment by ID
   * @param {string} id - The assignment ID
   * @returns {Promise<Object|null>} The assignment or null
   */
  async getById(id) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        users!assignments_user_id_fkey (
          id,
          email,
          name,
          avatar_url
        ),
        todos (
          id,
          title,
          completed,
          priority,
          due_date
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
   * Get all assignments for a todo
   * @param {string} todoId - The todo ID
   * @returns {Promise<Array>} Array of assignments
   */
  async getByTodoId(todoId) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        users!assignments_user_id_fkey (
          id,
          email,
          name,
          avatar_url
        )
      `)
      .eq('todo_id', todoId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data.map(assignment => this.transformFromDb(assignment))
  }

  /**
   * Get all assignments for a user (tasks assigned to them)
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Array of assignments
   */
  async getByUserId(userId) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        todos (
          id,
          title,
          completed,
          priority,
          due_date,
          shared_list_id
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(assignment => this.transformFromDb(assignment))
  }

  /**
   * Get all assignments created by a user
   * @param {string} userId - The user ID who created the assignments
   * @returns {Promise<Array>} Array of assignments
   */
  async getByAssigner(userId) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        users!assignments_user_id_fkey (
          id,
          email,
          name,
          avatar_url
        ),
        todos (
          id,
          title,
          completed
        )
      `)
      .eq('assigned_by', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(assignment => this.transformFromDb(assignment))
  }

  /**
   * Update an assignment's status
   * @param {string} id - The assignment ID
   * @param {string} status - The new status: 'pending', 'in_progress', 'completed', 'declined'
   * @returns {Promise<Object>} The updated assignment
   */
  async updateStatus(id, status) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        users!assignments_user_id_fkey (
          id,
          email,
          name,
          avatar_url
        ),
        todos (
          id,
          title,
          completed
        )
      `)
      .single()

    if (error) throw error
    return this.transformFromDb(data)
  }

  /**
   * Accept an assignment
   * @param {string} id - The assignment ID
   * @returns {Promise<Object>} The updated assignment
   */
  async accept(id) {
    return this.updateStatus(id, 'in_progress')
  }

  /**
   * Complete an assignment
   * @param {string} id - The assignment ID
   * @returns {Promise<Object>} The updated assignment
   */
  async complete(id) {
    return this.updateStatus(id, 'completed')
  }

  /**
   * Decline an assignment
   * @param {string} id - The assignment ID
   * @returns {Promise<Object>} The updated assignment
   */
  async decline(id) {
    return this.updateStatus(id, 'declined')
  }

  /**
   * Delete an assignment
   * @param {string} id - The assignment ID
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
   * Delete all assignments for a todo
   * @param {string} todoId - The todo ID
   * @returns {Promise<void>}
   */
  async deleteByTodoId(todoId) {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('todo_id', todoId)

    if (error) throw error
  }

  /**
   * Check if a user is assigned to a todo
   * @param {string} todoId - The todo ID
   * @param {string} userId - The user ID
   * @returns {Promise<boolean>}
   */
  async isAssigned(todoId, userId) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('id')
      .match({ todo_id: todoId, user_id: userId })
      .single()

    if (error) {
      if (error.code === 'PGRST116') return false
      throw error
    }
    return !!data
  }

  /**
   * Get assignment statistics for a shared list
   * @param {string} listId - The shared list ID
   * @returns {Promise<Object>} Statistics object
   */
  async getStatsByListId(listId) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        status,
        user_id,
        todos!inner (
          shared_list_id
        )
      `)
      .eq('todos.shared_list_id', listId)

    if (error) throw error

    const stats = {
      total: data.length,
      byStatus: {
        pending: 0,
        in_progress: 0,
        completed: 0,
        declined: 0
      },
      byUser: {}
    }

    data.forEach(assignment => {
      // Count by status
      if (stats.byStatus[assignment.status] !== undefined) {
        stats.byStatus[assignment.status]++
      }

      // Count by user
      if (!stats.byUser[assignment.user_id]) {
        stats.byUser[assignment.user_id] = {
          total: 0,
          completed: 0
        }
      }
      stats.byUser[assignment.user_id].total++
      if (assignment.status === 'completed') {
        stats.byUser[assignment.user_id].completed++
      }
    })

    return stats
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
      todoId: dbRecord.todo_id,
      userId: dbRecord.user_id,
      assignedBy: dbRecord.assigned_by,
      status: dbRecord.status,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      user: dbRecord.users ? {
        id: dbRecord.users.id,
        email: dbRecord.users.email,
        name: dbRecord.users.name,
        avatarUrl: dbRecord.users.avatar_url
      } : null,
      todo: dbRecord.todos ? {
        id: dbRecord.todos.id,
        title: dbRecord.todos.title,
        completed: dbRecord.todos.completed,
        priority: dbRecord.todos.priority,
        dueDate: dbRecord.todos.due_date,
        sharedListId: dbRecord.todos.shared_list_id
      } : null
    }
  }
}

export default AssignmentModel
