// phases/phase-1/src/models/shareLinkModel.js
import { v4 as uuidv4 } from 'uuid';
import databaseService from '../../database/service.js';

class ShareLink {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.listId = data.listId;
    this.accessType = data.accessType || 'private'; // 'public', 'private', 'team'
    this.permissions = data.permissions || 'read'; // 'read', 'read_write'
    this.createdAt = data.createdAt || new Date().toISOString();
    this.expiresAt = data.expiresAt || null;
    this.createdBy = data.createdBy;
    this.usageCount = data.usageCount || 0;
    this.maxUses = data.maxUses || null;
  }

  // Validate the share link data
  validate() {
    const validAccessTypes = ['public', 'private', 'team'];
    const validPermissions = ['read', 'read_write'];

    if (!validAccessTypes.includes(this.accessType)) {
      throw new Error(`Invalid access type: ${this.accessType}. Must be one of: ${validAccessTypes.join(', ')}`);
    }

    if (!validPermissions.includes(this.permissions)) {
      throw new Error(`Invalid permissions: ${this.permissions}. Must be one of: ${validPermissions.join(', ')}`);
    }

    if (this.expiresAt && new Date(this.expiresAt) < new Date()) {
      throw new Error('Expiration date must be in the future');
    }

    if (this.maxUses && this.maxUses <= 0) {
      throw new Error('Max uses must be a positive number');
    }

    if (!this.listId || typeof this.listId !== 'string') {
      throw new Error('List ID is required and must be a string');
    }

    if (!this.createdBy || typeof this.createdBy !== 'string') {
      throw new Error('Created by user ID is required and must be a string');
    }

    return true;
  }

  // Save the share link to the database
  async save() {
    this.validate();

    // If this is a new share link, create it
    if (!this.id) {
      this.id = uuidv4();
      const result = databaseService.createShareLink({
        id: this.id,
        listId: this.listId,
        accessType: this.accessType,
        permissions: this.permissions,
        expiresAt: this.expiresAt,
        createdBy: this.createdBy,
        maxUses: this.maxUses
      });
      return result;
    } else {
      // If updating, just return the current instance since we're using the database service directly
      return this;
    }
  }

  // Create a share link from database data
  static fromDatabase(dbData) {
    return new ShareLink({
      id: dbData.id,
      listId: dbData.list_id || dbData.listId,
      accessType: dbData.access_type || dbData.accessType,
      permissions: dbData.permissions,
      createdAt: dbData.created_at || dbData.createdAt,
      expiresAt: dbData.expires_at || dbData.expiresAt,
      createdBy: dbData.created_by || dbData.createdBy,
      usageCount: dbData.usage_count || dbData.usageCount || 0,
      maxUses: dbData.max_uses || dbData.maxUses
    });
  }

  // Check if the share link is valid (not expired and not over usage limit)
  isValid() {
    if (this.expiresAt && new Date(this.expiresAt) < new Date()) {
      return false;
    }

    if (this.maxUses && this.usageCount >= this.maxUses) {
      return false;
    }

    return true;
  }

  // Increment usage count
  incrementUsage() {
    this.usageCount += 1;
    // Update in database
    databaseService.incrementShareLinkUsage(this.id);
  }

  // Generate a shareable URL
  getShareableUrl(basePath = 'http://localhost:3000') {
    return `${basePath}/join/${this.id}`;
  }
}

export default ShareLink;