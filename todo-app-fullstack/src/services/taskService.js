/**
 * Task Service - Extended task operations with collaboration fields
 * Implements T008: Extend existing Task model with collaboration fields
 * Implements T024: Update task operations to sync with Supabase
 */

export class TaskService {
  constructor(supabase) {
    this.supabase = supabase
    this.tableName = 'todos'
  }

  /**
   * Create a new task
   * @param {Object} params - Task parameters
   * @returns {Promise<Object>} The created task
   */
  async create({
    title,
    description = null,
    userId,
    priority = 'medium',
    dueDate = null,
    tags = [],
    sharedListId = null,
    assignedTo = []
  }) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        title,
        description,
        user_id: userId,
        priority,
        due_date: dueDate,
        tags,
        shared_list_id: sharedListId,
        assigned_to: assignedTo,
        completed: false,
        version: 1,
        last_modified_by: userId
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
   * Get a task by ID
   * @param {string} id - The task ID
   * @returns {Promise<Object|null>} The task or null
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
        ),
        comments (
          id,
          content,
          created_at,
          user_id
        ),
        assignments (
          id,
          user_id,
          status
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
   * Get all tasks for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Array of tasks
   */
  async getByUserId(userId) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        comments (id)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(task => this.transformFromDb(task))
  }

  /**
   * Get all tasks in a shared list
   * @param {string} listId - The shared list ID
   * @returns {Promise<Array>} Array of tasks
   */
  async getBySharedListId(listId) {
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
        comments (id),
        assignments (
          id,
          user_id,
          status,
          users!assignments_user_id_fkey (
            id,
            email,
            name
          )
        )
      `)
      .eq('shared_list_id', listId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(task => this.transformFromDb(task))
  }

  /**
   * Get tasks assigned to a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Array of tasks
   */
  async getAssignedToUser(userId) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        shared_lists (
          id,
          name
        )
      `)
      .contains('assigned_to', [userId])
      .order('due_date', { ascending: true, nullsFirst: false })

    if (error) throw error
    return data.map(task => this.transformFromDb(task))
  }

  /**
   * Update a task with version tracking for conflict resolution
   * Implements T025: Implement conflict detection and resolution with version tracking
   * @param {string} id - The task ID
   * @param {Object} updates - Fields to update
   * @param {string} modifiedBy - User ID making the update
   * @param {number} expectedVersion - Expected version for optimistic locking
   * @returns {Promise<{success: boolean, task?: Object, conflict?: boolean}>}
   */
  async update(id, updates, modifiedBy, expectedVersion = null) {
    // First check current version if expectedVersion is provided
    if (expectedVersion !== null) {
      const { data: current, error: checkError } = await this.supabase
        .from(this.tableName)
        .select('version')
        .eq('id', id)
        .single()

      if (checkError) throw checkError

      if (current.version !== expectedVersion) {
        return {
          success: false,
          conflict: true,
          currentVersion: current.version
        }
      }
    }

    const updateData = {
      last_modified_by: modifiedBy
    }

    // Map updates to database columns
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.completed !== undefined) updateData.completed = updates.completed
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.sharedListId !== undefined) updateData.shared_list_id = updates.sharedListId
    if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo

    // Increment version
    const { data: currentTask } = await this.supabase
      .from(this.tableName)
      .select('version')
      .eq('id', id)
      .single()

    updateData.version = (currentTask?.version || 0) + 1

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
    return { success: true, task: this.transformFromDb(data) }
  }

  /**
   * Toggle task completion
   * @param {string} id - The task ID
   * @param {string} modifiedBy - User ID making the change
   * @returns {Promise<Object>} The updated task
   */
  async toggleComplete(id, modifiedBy) {
    const task = await this.getById(id)
    if (!task) throw new Error('Task not found')

    const result = await this.update(id, { completed: !task.completed }, modifiedBy)
    return result.task
  }

  /**
   * Delete a task
   * @param {string} id - The task ID
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
   * Move task to a shared list
   * @param {string} taskId - The task ID
   * @param {string} listId - The shared list ID
   * @param {string} modifiedBy - User ID making the change
   * @returns {Promise<Object>} The updated task
   */
  async moveToSharedList(taskId, listId, modifiedBy) {
    const result = await this.update(taskId, { sharedListId: listId }, modifiedBy)
    return result.task
  }

  /**
   * Remove task from shared list
   * @param {string} taskId - The task ID
   * @param {string} modifiedBy - User ID making the change
   * @returns {Promise<Object>} The updated task
   */
  async removeFromSharedList(taskId, modifiedBy) {
    const result = await this.update(taskId, { sharedListId: null }, modifiedBy)
    return result.task
  }

  /**
   * Assign users to a task
   * @param {string} taskId - The task ID
   * @param {string[]} userIds - Array of user IDs to assign
   * @param {string} modifiedBy - User ID making the change
   * @returns {Promise<Object>} The updated task
   */
  async assignUsers(taskId, userIds, modifiedBy) {
    const result = await this.update(taskId, { assignedTo: userIds }, modifiedBy)
    return result.task
  }

  /**
   * Get task statistics for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Statistics object
   */
  async getStatsByUserId(userId) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('completed, priority')
      .eq('user_id', userId)

    if (error) throw error

    const stats = {
      total: data.length,
      completed: data.filter(t => t.completed).length,
      pending: data.filter(t => !t.completed).length,
      byPriority: {
        high: data.filter(t => t.priority === 'high').length,
        medium: data.filter(t => t.priority === 'medium').length,
        low: data.filter(t => t.priority === 'low').length
      }
    }

    stats.completionRate = stats.total > 0
      ? Math.round((stats.completed / stats.total) * 100)
      : 0

    return stats
  }

  /**
   * Get task statistics for a shared list
   * @param {string} listId - The shared list ID
   * @returns {Promise<Object>} Statistics object
   */
  async getStatsByListId(listId) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('completed, priority, assigned_to, user_id')
      .eq('shared_list_id', listId)

    if (error) throw error

    const stats = {
      total: data.length,
      completed: data.filter(t => t.completed).length,
      pending: data.filter(t => !t.completed).length,
      byPriority: {
        high: data.filter(t => t.priority === 'high').length,
        medium: data.filter(t => t.priority === 'medium').length,
        low: data.filter(t => t.priority === 'low').length
      },
      byAssignee: {}
    }

    // Count tasks by assignee
    data.forEach(task => {
      (task.assigned_to || []).forEach(userId => {
        if (!stats.byAssignee[userId]) {
          stats.byAssignee[userId] = { total: 0, completed: 0 }
        }
        stats.byAssignee[userId].total++
        if (task.completed) {
          stats.byAssignee[userId].completed++
        }
      })
    })

    stats.completionRate = stats.total > 0
      ? Math.round((stats.completed / stats.total) * 100)
      : 0

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
      title: dbRecord.title,
      description: dbRecord.description,
      completed: dbRecord.completed,
      priority: dbRecord.priority,
      dueDate: dbRecord.due_date,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      userId: dbRecord.user_id,
      tags: dbRecord.tags || [],
      sharedListId: dbRecord.shared_list_id,
      assignedTo: dbRecord.assigned_to || [],
      version: dbRecord.version,
      lastModifiedBy: dbRecord.last_modified_by,
      user: dbRecord.users ? {
        id: dbRecord.users.id,
        email: dbRecord.users.email,
        name: dbRecord.users.name,
        avatarUrl: dbRecord.users.avatar_url
      } : null,
      commentCount: dbRecord.comments ? dbRecord.comments.length : 0,
      comments: dbRecord.comments || [],
      assignments: dbRecord.assignments ? dbRecord.assignments.map(a => ({
        id: a.id,
        userId: a.user_id,
        status: a.status,
        user: a.users ? {
          id: a.users.id,
          email: a.users.email,
          name: a.users.name
        } : null
      })) : [],
      sharedList: dbRecord.shared_lists ? {
        id: dbRecord.shared_lists.id,
        name: dbRecord.shared_lists.name
      } : null
    }
  }
}

export default TaskService
