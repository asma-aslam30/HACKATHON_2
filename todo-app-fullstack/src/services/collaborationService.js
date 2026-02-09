/**
 * Collaboration Service - Core collaboration functionality
 * Implements T009: Create base collaboration service
 * Implements T013: Implement share link generation
 * Implements T014: Implement share link validation and access control
 * Implements T018: Add share link permission management
 * Implements T020: Implement optimistic update mechanism
 * Implements T022: Implement offline operation queue
 * Implements T036: Create user mention parsing
 * Implements T037: Implement task assignment functionality
 * Implements T041: Implement assignment status tracking
 * Implements T047: Add progress tracking for shared lists
 */

import { ShareLinkModel } from '../models/shareLinkModel.js'
import { SharedListModel } from '../models/sharedListModel.js'

export class CollaborationService {
  constructor(supabase) {
    this.supabase = supabase
    this.shareLinkModel = new ShareLinkModel(supabase)
    this.sharedListModel = new SharedListModel(supabase)
    this.offlineQueue = []
  }

  // ==================== Share Link Operations ====================

  /**
   * Generate a share link for a shared list
   * @param {Object} params - Parameters for link generation
   * @returns {Promise<Object>} The created share link with full URL
   */
  async generateShareLink({
    listId,
    createdBy,
    accessType = 'private',
    permissions = 'read',
    expiresAt = null,
    maxUses = null,
    baseUrl = ''
  }) {
    // Verify the user has permission to share
    const access = await this.sharedListModel.checkAccess(listId, createdBy)
    if (!access.hasAccess || (access.role !== 'owner' && access.role !== 'admin')) {
      throw new Error('Insufficient permissions to share this list')
    }

    // Check share link limit (max 5 per list)
    const existingLinks = await this.shareLinkModel.getByListId(listId)
    if (existingLinks.length >= 5) {
      throw new Error('Maximum share links reached for this list (5)')
    }

    const link = await this.shareLinkModel.create({
      listId,
      createdBy,
      accessType,
      permissions,
      expiresAt,
      maxUses
    })

    return {
      ...link,
      shareUrl: this.shareLinkModel.generateShareUrl(link.id, baseUrl)
    }
  }

  /**
   * Validate and use a share link to join a list
   * @param {string} linkId - The share link ID/token
   * @param {string} userId - The user ID trying to join
   * @returns {Promise<Object>} Result with list access info
   */
  async useShareLink(linkId, userId) {
    const validation = await this.shareLinkModel.validate(linkId)

    if (!validation.valid) {
      throw new Error(validation.reason)
    }

    const link = validation.link

    // Check if user is already a collaborator
    const existingAccess = await this.sharedListModel.checkAccess(link.listId, userId)
    if (existingAccess.hasAccess) {
      return {
        success: true,
        alreadyMember: true,
        listId: link.listId,
        role: existingAccess.role
      }
    }

    // Check collaborator limit
    const memberCount = await this.sharedListModel.getMemberCount(link.listId)
    const list = await this.sharedListModel.getById(link.listId)
    if (memberCount >= list.maxCollaborators) {
      throw new Error('This list has reached its maximum number of collaborators')
    }

    // Determine role based on link permissions
    const role = link.permissions === 'read_write' ? 'editor' : 'viewer'

    // Add user as collaborator
    await this.sharedListModel.addCollaborator(link.listId, userId, role)

    // Increment link usage
    await this.shareLinkModel.incrementUsage(linkId)

    return {
      success: true,
      alreadyMember: false,
      listId: link.listId,
      role,
      listName: link.sharedList?.name
    }
  }

  /**
   * Revoke a share link
   * @param {string} linkId - The share link ID
   * @param {string} userId - The user requesting revocation
   * @returns {Promise<void>}
   */
  async revokeShareLink(linkId, userId) {
    const link = await this.shareLinkModel.getById(linkId)
    if (!link) {
      throw new Error('Share link not found')
    }

    // Check permissions
    const access = await this.sharedListModel.checkAccess(link.listId, userId)
    if (!access.hasAccess || (access.role !== 'owner' && access.role !== 'admin')) {
      throw new Error('Insufficient permissions to revoke this link')
    }

    await this.shareLinkModel.delete(linkId)
  }

  /**
   * Get all share links for a list
   * @param {string} listId - The shared list ID
   * @param {string} userId - The requesting user ID
   * @returns {Promise<Array>} Array of share links
   */
  async getShareLinks(listId, userId) {
    const access = await this.sharedListModel.checkAccess(listId, userId)
    if (!access.hasAccess || (access.role !== 'owner' && access.role !== 'admin')) {
      throw new Error('Insufficient permissions to view share links')
    }

    return this.shareLinkModel.getByListId(listId)
  }

  // ==================== Shared List Operations ====================

  /**
   * Create a new shared list
   * @param {Object} params - List parameters
   * @returns {Promise<Object>} The created list
   */
  async createSharedList({ name, ownerId, description = null, maxCollaborators = 10 }) {
    return this.sharedListModel.create({ name, ownerId, description, maxCollaborators })
  }

  /**
   * Get a shared list with access check
   * @param {string} listId - The list ID
   * @param {string} userId - The requesting user ID
   * @returns {Promise<Object>} The shared list
   */
  async getSharedList(listId, userId) {
    const access = await this.sharedListModel.checkAccess(listId, userId)
    if (!access.hasAccess) {
      throw new Error('Access denied')
    }

    const list = await this.sharedListModel.getById(listId)
    return { ...list, userRole: access.role }
  }

  /**
   * Get all lists accessible by a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Array of accessible lists
   */
  async getAccessibleLists(userId) {
    return this.sharedListModel.getAccessibleByUser(userId)
  }

  /**
   * Update collaborator permissions
   * @param {string} listId - The list ID
   * @param {string} targetUserId - The user to update
   * @param {string} newRole - The new role
   * @param {string} requestingUserId - The user making the request
   * @returns {Promise<Object>} Updated collaboration
   */
  async updateCollaboratorRole(listId, targetUserId, newRole, requestingUserId) {
    const access = await this.sharedListModel.checkAccess(listId, requestingUserId)
    if (!access.hasAccess || (access.role !== 'owner' && access.role !== 'admin')) {
      throw new Error('Insufficient permissions to modify collaborator roles')
    }

    // Prevent removing owner role
    const list = await this.sharedListModel.getById(listId)
    if (list.ownerId === targetUserId && newRole !== 'admin') {
      throw new Error('Cannot demote the list owner')
    }

    return this.sharedListModel.updateCollaboratorRole(listId, targetUserId, newRole)
  }

  /**
   * Remove a collaborator from a list
   * @param {string} listId - The list ID
   * @param {string} targetUserId - The user to remove
   * @param {string} requestingUserId - The user making the request
   * @returns {Promise<void>}
   */
  async removeCollaborator(listId, targetUserId, requestingUserId) {
    // Users can remove themselves
    if (targetUserId === requestingUserId) {
      const list = await this.sharedListModel.getById(listId)
      if (list.ownerId === targetUserId) {
        throw new Error('Owner cannot leave the list. Transfer ownership first.')
      }
      await this.sharedListModel.removeCollaborator(listId, targetUserId)
      return
    }

    // Others need admin/owner permissions
    const access = await this.sharedListModel.checkAccess(listId, requestingUserId)
    if (!access.hasAccess || (access.role !== 'owner' && access.role !== 'admin')) {
      throw new Error('Insufficient permissions to remove collaborators')
    }

    await this.sharedListModel.removeCollaborator(listId, targetUserId)
  }

  // ==================== User Mention Operations ====================

  /**
   * Parse @mentions from text
   * @param {string} text - Text to parse
   * @returns {string[]} Array of mentioned usernames
   */
  parseMentions(text) {
    const mentionRegex = /@(\w+)/g
    const mentions = []
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1])
    }

    return [...new Set(mentions)]
  }

  /**
   * Resolve mention usernames to user IDs
   * @param {string[]} usernames - Array of usernames
   * @param {string} listId - The shared list ID (to verify collaborators)
   * @returns {Promise<Array>} Array of {username, userId, valid}
   */
  async resolveMentions(usernames, listId) {
    const collaborators = await this.sharedListModel.getCollaborators(listId)

    return usernames.map(username => {
      const collaborator = collaborators.find(c =>
        c.user?.name?.toLowerCase() === username.toLowerCase() ||
        c.user?.email?.split('@')[0].toLowerCase() === username.toLowerCase()
      )

      return {
        username,
        userId: collaborator?.userId || null,
        valid: !!collaborator,
        user: collaborator?.user || null
      }
    })
  }

  // ==================== Assignment Operations ====================

  /**
   * Assign a task to users
   * @param {string} todoId - The task ID
   * @param {string[]} userIds - Array of user IDs to assign
   * @param {string} assignedBy - User making the assignment
   * @param {string} listId - The shared list ID
   * @returns {Promise<Array>} Array of created assignments
   */
  async assignTask(todoId, userIds, assignedBy, listId) {
    // Verify assigner has permission
    const access = await this.sharedListModel.checkAccess(listId, assignedBy)
    if (!access.hasAccess || access.role === 'viewer') {
      throw new Error('Insufficient permissions to assign tasks')
    }

    // Verify all assignees are collaborators
    const collaborators = await this.sharedListModel.getCollaborators(listId)
    const collaboratorIds = collaborators.map(c => c.userId)

    const invalidUsers = userIds.filter(id => !collaboratorIds.includes(id))
    if (invalidUsers.length > 0) {
      throw new Error('Some users are not collaborators of this list')
    }

    // Create assignments
    const assignments = []
    for (const userId of userIds) {
      const { data, error } = await this.supabase
        .from('assignments')
        .upsert({
          todo_id: todoId,
          user_id: userId,
          assigned_by: assignedBy,
          status: 'pending'
        }, {
          onConflict: 'todo_id,user_id'
        })
        .select()
        .single()

      if (!error) {
        assignments.push(data)
      }
    }

    // Update task's assigned_to array
    await this.supabase
      .from('todos')
      .update({ assigned_to: userIds })
      .eq('id', todoId)

    return assignments
  }

  /**
   * Update assignment status
   * @param {string} assignmentId - The assignment ID
   * @param {string} status - New status
   * @param {string} userId - User updating the status
   * @returns {Promise<Object>} Updated assignment
   */
  async updateAssignmentStatus(assignmentId, status, userId) {
    const { data: assignment, error: fetchError } = await this.supabase
      .from('assignments')
      .select('user_id')
      .eq('id', assignmentId)
      .single()

    if (fetchError) throw fetchError

    // Only the assigned user can update their own assignment status
    if (assignment.user_id !== userId) {
      throw new Error('Only the assigned user can update this assignment')
    }

    const { data, error } = await this.supabase
      .from('assignments')
      .update({ status })
      .eq('id', assignmentId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ==================== Progress Tracking ====================

  /**
   * Get progress metrics for a shared list
   * @param {string} listId - The shared list ID
   * @returns {Promise<Object>} Progress metrics
   */
  async getListProgress(listId) {
    const { data: tasks, error } = await this.supabase
      .from('todos')
      .select(`
        id,
        completed,
        priority,
        assigned_to,
        user_id,
        created_at,
        updated_at
      `)
      .eq('shared_list_id', listId)

    if (error) throw error

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const progress = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.completed).length,
      pendingTasks: tasks.filter(t => !t.completed).length,
      completionRate: 0,
      byPriority: {
        high: { total: 0, completed: 0 },
        medium: { total: 0, completed: 0 },
        low: { total: 0, completed: 0 }
      },
      byContributor: {},
      recentActivity: {
        tasksCreated: tasks.filter(t => new Date(t.created_at) > weekAgo).length,
        tasksCompleted: tasks.filter(t =>
          t.completed && new Date(t.updated_at) > weekAgo
        ).length
      }
    }

    if (progress.totalTasks > 0) {
      progress.completionRate = Math.round(
        (progress.completedTasks / progress.totalTasks) * 100
      )
    }

    // Calculate by priority
    tasks.forEach(task => {
      const priority = task.priority || 'medium'
      if (progress.byPriority[priority]) {
        progress.byPriority[priority].total++
        if (task.completed) {
          progress.byPriority[priority].completed++
        }
      }

      // Calculate by contributor
      const contributors = task.assigned_to?.length > 0
        ? task.assigned_to
        : [task.user_id]

      contributors.forEach(userId => {
        if (!progress.byContributor[userId]) {
          progress.byContributor[userId] = { total: 0, completed: 0 }
        }
        progress.byContributor[userId].total++
        if (task.completed) {
          progress.byContributor[userId].completed++
        }
      })
    })

    return progress
  }

  // ==================== Optimistic Updates ====================

  /**
   * Queue an operation for optimistic update
   * @param {Object} operation - The operation to queue
   */
  queueOperation(operation) {
    this.offlineQueue.push({
      ...operation,
      timestamp: new Date().toISOString(),
      status: 'pending'
    })
  }

  /**
   * Process offline queue when connection is restored
   * @returns {Promise<Array>} Results of processed operations
   */
  async processOfflineQueue() {
    const results = []

    while (this.offlineQueue.length > 0) {
      const operation = this.offlineQueue.shift()

      try {
        let result
        switch (operation.type) {
          case 'CREATE_TASK':
            result = await this.supabase.from('todos').insert(operation.data)
            break
          case 'UPDATE_TASK':
            result = await this.supabase.from('todos').update(operation.data).eq('id', operation.id)
            break
          case 'DELETE_TASK':
            result = await this.supabase.from('todos').delete().eq('id', operation.id)
            break
          case 'CREATE_COMMENT':
            result = await this.supabase.from('comments').insert(operation.data)
            break
          default:
            result = { error: 'Unknown operation type' }
        }

        results.push({
          operation,
          success: !result.error,
          error: result.error
        })
      } catch (error) {
        results.push({
          operation,
          success: false,
          error: error.message
        })
      }
    }

    return results
  }

  /**
   * Get current offline queue size
   * @returns {number} Number of queued operations
   */
  getQueueSize() {
    return this.offlineQueue.length
  }

  /**
   * Clear the offline queue
   */
  clearQueue() {
    this.offlineQueue = []
  }
}

export default CollaborationService
