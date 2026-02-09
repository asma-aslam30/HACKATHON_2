/**
 * SharedList Model - Handles shared list operations
 * Implements T012: Create SharedList model
 */

export class SharedListModel {
  constructor(supabase) {
    this.supabase = supabase
    this.tableName = 'shared_lists'
  }

  /**
   * Create a new shared list
   * @param {Object} params - List parameters
   * @param {string} params.name - The list name
   * @param {string} params.ownerId - User ID of the owner
   * @param {string} params.description - Optional description
   * @param {number} params.maxCollaborators - Maximum number of collaborators
   * @returns {Promise<Object>} The created shared list
   */
  async create({ name, ownerId, description = null, maxCollaborators = 10 }) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        name,
        owner_id: ownerId,
        description,
        max_collaborators: maxCollaborators,
        permissions: {}
      })
      .select(`
        *,
        users!shared_lists_owner_id_fkey (
          id,
          email,
          name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error

    // Automatically add owner as admin collaborator
    await this.addCollaborator(data.id, ownerId, 'admin')

    return this.transformFromDb(data)
  }

  /**
   * Get a shared list by ID
   * @param {string} id - The shared list ID
   * @returns {Promise<Object|null>} The shared list or null
   */
  async getById(id) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        users!shared_lists_owner_id_fkey (
          id,
          email,
          name,
          avatar_url
        ),
        collaborations (
          id,
          user_id,
          role,
          joined_at,
          notifications_enabled,
          users (
            id,
            email,
            name,
            avatar_url
          )
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
   * Get all shared lists owned by a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Array of shared lists
   */
  async getByOwnerId(userId) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        collaborations (
          id,
          role,
          users (
            id,
            email,
            name
          )
        )
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(list => this.transformFromDb(list))
  }

  /**
   * Get all shared lists a user has access to (owned + collaborating)
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Array of shared lists
   */
  async getAccessibleByUser(userId) {
    // Get lists owned by user
    const { data: ownedLists, error: ownedError } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        collaborations (
          id,
          role,
          user_id
        )
      `)
      .eq('owner_id', userId)

    if (ownedError) throw ownedError

    // Get lists user is collaborating on
    const { data: collaboratingLists, error: collabError } = await this.supabase
      .from('collaborations')
      .select(`
        role,
        shared_lists (
          *,
          collaborations (
            id,
            role,
            user_id
          )
        )
      `)
      .eq('user_id', userId)

    if (collabError) throw collabError

    // Combine and deduplicate
    const allLists = [
      ...ownedLists.map(list => ({ ...this.transformFromDb(list), userRole: 'owner' })),
      ...collaboratingLists
        .filter(c => c.shared_lists)
        .map(c => ({
          ...this.transformFromDb(c.shared_lists),
          userRole: c.role
        }))
    ]

    // Remove duplicates (owned lists might also have collaboration entries)
    const uniqueLists = allLists.reduce((acc, list) => {
      const existing = acc.find(l => l.id === list.id)
      if (!existing) {
        acc.push(list)
      } else if (list.userRole === 'owner') {
        // Replace with owner role if exists
        const index = acc.indexOf(existing)
        acc[index] = list
      }
      return acc
    }, [])

    return uniqueLists
  }

  /**
   * Update a shared list
   * @param {string} id - The shared list ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} The updated shared list
   */
  async update(id, updates) {
    const updateData = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.maxCollaborators !== undefined) updateData.max_collaborators = updates.maxCollaborators
    if (updates.permissions !== undefined) updateData.permissions = updates.permissions

    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.transformFromDb(data)
  }

  /**
   * Delete a shared list
   * @param {string} id - The shared list ID
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
   * Add a collaborator to a shared list
   * @param {string} listId - The shared list ID
   * @param {string} userId - The user ID to add
   * @param {string} role - The role: 'viewer', 'editor', or 'admin'
   * @returns {Promise<Object>} The collaboration record
   */
  async addCollaborator(listId, userId, role = 'viewer') {
    const { data, error } = await this.supabase
      .from('collaborations')
      .insert({
        list_id: listId,
        user_id: userId,
        role,
        notifications_enabled: true
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
    return {
      id: data.id,
      listId: data.list_id,
      userId: data.user_id,
      role: data.role,
      joinedAt: data.joined_at,
      notificationsEnabled: data.notifications_enabled,
      user: data.users ? {
        id: data.users.id,
        email: data.users.email,
        name: data.users.name,
        avatarUrl: data.users.avatar_url
      } : null
    }
  }

  /**
   * Remove a collaborator from a shared list
   * @param {string} listId - The shared list ID
   * @param {string} userId - The user ID to remove
   * @returns {Promise<void>}
   */
  async removeCollaborator(listId, userId) {
    const { error } = await this.supabase
      .from('collaborations')
      .delete()
      .match({ list_id: listId, user_id: userId })

    if (error) throw error
  }

  /**
   * Update a collaborator's role
   * @param {string} listId - The shared list ID
   * @param {string} userId - The user ID
   * @param {string} role - The new role
   * @returns {Promise<Object>} The updated collaboration
   */
  async updateCollaboratorRole(listId, userId, role) {
    const { data, error } = await this.supabase
      .from('collaborations')
      .update({ role })
      .match({ list_id: listId, user_id: userId })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get all collaborators for a shared list
   * @param {string} listId - The shared list ID
   * @returns {Promise<Array>} Array of collaborators
   */
  async getCollaborators(listId) {
    const { data, error } = await this.supabase
      .from('collaborations')
      .select(`
        *,
        users (
          id,
          email,
          name,
          avatar_url
        )
      `)
      .eq('list_id', listId)
      .order('joined_at', { ascending: true })

    if (error) throw error
    return data.map(collab => ({
      id: collab.id,
      listId: collab.list_id,
      userId: collab.user_id,
      role: collab.role,
      joinedAt: collab.joined_at,
      notificationsEnabled: collab.notifications_enabled,
      user: collab.users ? {
        id: collab.users.id,
        email: collab.users.email,
        name: collab.users.name,
        avatarUrl: collab.users.avatar_url
      } : null
    }))
  }

  /**
   * Check if a user has access to a shared list
   * @param {string} listId - The shared list ID
   * @param {string} userId - The user ID
   * @returns {Promise<{hasAccess: boolean, role: string|null}>}
   */
  async checkAccess(listId, userId) {
    // Check if user is owner
    const { data: list, error: listError } = await this.supabase
      .from(this.tableName)
      .select('owner_id')
      .eq('id', listId)
      .single()

    if (listError) {
      if (listError.code === 'PGRST116') return { hasAccess: false, role: null }
      throw listError
    }

    if (list.owner_id === userId) {
      return { hasAccess: true, role: 'owner' }
    }

    // Check collaboration
    const { data: collab, error: collabError } = await this.supabase
      .from('collaborations')
      .select('role')
      .match({ list_id: listId, user_id: userId })
      .single()

    if (collabError) {
      if (collabError.code === 'PGRST116') return { hasAccess: false, role: null }
      throw collabError
    }

    return { hasAccess: true, role: collab.role }
  }

  /**
   * Get member count for a shared list
   * @param {string} listId - The shared list ID
   * @returns {Promise<number>} Number of members
   */
  async getMemberCount(listId) {
    const { count, error } = await this.supabase
      .from('collaborations')
      .select('*', { count: 'exact', head: true })
      .eq('list_id', listId)

    if (error) throw error
    return count || 0
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
      name: dbRecord.name,
      description: dbRecord.description,
      ownerId: dbRecord.owner_id,
      permissions: dbRecord.permissions,
      maxCollaborators: dbRecord.max_collaborators,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      owner: dbRecord.users ? {
        id: dbRecord.users.id,
        email: dbRecord.users.email,
        name: dbRecord.users.name,
        avatarUrl: dbRecord.users.avatar_url
      } : null,
      collaborations: dbRecord.collaborations ? dbRecord.collaborations.map(c => ({
        id: c.id,
        userId: c.user_id,
        role: c.role,
        joinedAt: c.joined_at,
        notificationsEnabled: c.notifications_enabled,
        user: c.users ? {
          id: c.users.id,
          email: c.users.email,
          name: c.users.name,
          avatarUrl: c.users.avatar_url
        } : null
      })) : [],
      todos: dbRecord.todos ? dbRecord.todos.map(t => ({
        id: t.id,
        title: t.title,
        completed: t.completed,
        priority: t.priority,
        dueDate: t.due_date
      })) : []
    }
  }
}

export default SharedListModel
