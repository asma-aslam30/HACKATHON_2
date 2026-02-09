/**
 * ShareLink Model - Handles share link operations for shared lists
 * Implements T011: Create ShareLink model
 */

import { nanoid } from 'nanoid'

export class ShareLinkModel {
  constructor(supabase) {
    this.supabase = supabase
    this.tableName = 'share_links'
  }

  /**
   * Generate a unique share link token
   * @returns {string} A unique token for the share link
   */
  generateToken() {
    return nanoid(16)
  }

  /**
   * Create a new share link for a shared list
   * @param {Object} params - Share link parameters
   * @param {string} params.listId - The shared list ID
   * @param {string} params.createdBy - User ID of the creator
   * @param {string} params.accessType - Access type: 'public', 'private', or 'team'
   * @param {string} params.permissions - Permissions: 'read' or 'read_write'
   * @param {Date|null} params.expiresAt - Optional expiration date
   * @param {number|null} params.maxUses - Optional maximum uses
   * @returns {Promise<Object>} The created share link
   */
  async create({ listId, createdBy, accessType, permissions, expiresAt = null, maxUses = null }) {
    const token = this.generateToken()

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        id: token,
        list_id: listId,
        created_by: createdBy,
        access_type: accessType,
        permissions: permissions,
        expires_at: expiresAt,
        max_uses: maxUses,
        usage_count: 0
      })
      .select()
      .single()

    if (error) throw error
    return this.transformFromDb(data)
  }

  /**
   * Get a share link by its ID/token
   * @param {string} id - The share link ID/token
   * @returns {Promise<Object|null>} The share link or null if not found
   */
  async getById(id) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        shared_lists (
          id,
          name,
          description,
          owner_id
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
   * Get all share links for a specific list
   * @param {string} listId - The shared list ID
   * @returns {Promise<Array>} Array of share links
   */
  async getByListId(listId) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('list_id', listId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(link => this.transformFromDb(link))
  }

  /**
   * Validate a share link (check expiration and usage limits)
   * @param {string} id - The share link ID/token
   * @returns {Promise<{valid: boolean, reason?: string, link?: Object}>}
   */
  async validate(id) {
    const link = await this.getById(id)

    if (!link) {
      return { valid: false, reason: 'Link not found' }
    }

    // Check expiration
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return { valid: false, reason: 'Link has expired' }
    }

    // Check usage limit
    if (link.maxUses && link.usageCount >= link.maxUses) {
      return { valid: false, reason: 'Link usage limit reached' }
    }

    return { valid: true, link }
  }

  /**
   * Increment the usage count of a share link
   * @param {string} id - The share link ID/token
   * @returns {Promise<Object>} The updated share link
   */
  async incrementUsage(id) {
    const { data, error } = await this.supabase
      .rpc('increment_share_link_usage', { link_id: id })

    if (error) {
      // Fallback to manual update if RPC doesn't exist
      const link = await this.getById(id)
      if (!link) throw new Error('Link not found')

      const { data: updated, error: updateError } = await this.supabase
        .from(this.tableName)
        .update({ usage_count: (link.usageCount || 0) + 1 })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      return this.transformFromDb(updated)
    }

    return data
  }

  /**
   * Delete a share link
   * @param {string} id - The share link ID/token
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
   * Delete all share links for a list
   * @param {string} listId - The shared list ID
   * @returns {Promise<void>}
   */
  async deleteByListId(listId) {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('list_id', listId)

    if (error) throw error
  }

  /**
   * Generate a full share URL
   * @param {string} token - The share link token
   * @param {string} baseUrl - The base URL of the application
   * @returns {string} The full share URL
   */
  generateShareUrl(token, baseUrl = '') {
    return `${baseUrl}/join/${token}`
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
      listId: dbRecord.list_id,
      accessType: dbRecord.access_type,
      permissions: dbRecord.permissions,
      createdAt: dbRecord.created_at,
      expiresAt: dbRecord.expires_at,
      createdBy: dbRecord.created_by,
      usageCount: dbRecord.usage_count,
      maxUses: dbRecord.max_uses,
      sharedList: dbRecord.shared_lists ? {
        id: dbRecord.shared_lists.id,
        name: dbRecord.shared_lists.name,
        description: dbRecord.shared_lists.description,
        ownerId: dbRecord.shared_lists.owner_id
      } : null
    }
  }
}

export default ShareLinkModel
