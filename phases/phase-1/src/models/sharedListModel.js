// phases/phase-1/src/models/sharedListModel.js
import { v4 as uuidv4 } from 'uuid';
import databaseService from '../../database/service.js';
import Task from '../taskService.js'; // Import existing task service to extend

class SharedList {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.ownerId = data.ownerId;
    this.permissions = data.permissions || {}; // { userId: 'read_only' | 'read_write' | 'admin' }
    this.tasks = data.tasks || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.description = data.description || '';
    this.maxCollaborators = data.maxCollaborators || 10; // Default max 10 collaborators
  }

  // Validate the shared list data
  validate() {
    if (!this.name || typeof this.name !== 'string' || this.name.length < 1 || this.name.length > 100) {
      throw new Error('Name is required and must be 1-100 characters');
    }

    if (!this.ownerId || typeof this.ownerId !== 'string') {
      throw new Error('Owner ID is required and must be a string');
    }

    if (this.permissions && typeof this.permissions !== 'object') {
      throw new Error('Permissions must be an object');
    }

    if (this.tasks && !Array.isArray(this.tasks)) {
      throw new Error('Tasks must be an array');
    }

    if (this.maxCollaborators && typeof this.maxCollaborators !== 'number') {
      throw new Error('Max collaborators must be a number');
    }

    return true;
  }

  // Save the shared list to the database
  async save() {
    this.validate();
    this.updatedAt = new Date().toISOString();

    // If this is a new shared list, create it
    if (!this.id) {
      this.id = uuidv4();
      const result = databaseService.createSharedList(this.name, this.ownerId, this.permissions);
      return SharedList.fromDatabase(result);
    } else {
      // Update the shared list
      const result = databaseService.updateSharedList(this.id, {
        name: this.name,
        permissions: this.permissions
      });
      return SharedList.fromDatabase(result);
    }
  }

  // Create a shared list from database data
  static fromDatabase(dbData) {
    return new SharedList({
      id: dbData.id,
      name: dbData.name,
      ownerId: dbData.owner_id || dbData.ownerId,
      permissions: dbData.permissions ? JSON.parse(dbData.permissions) : {},
      createdAt: dbData.created_at || dbData.createdAt,
      updatedAt: dbData.updated_at || dbData.updatedAt
    });
  }

  // Add a collaborator to the shared list
  addCollaborator(userId, role = 'read_write') {
    const validRoles = ['read_only', 'read_write', 'admin'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
    }

    // Check if we've reached the max collaborators limit
    const currentCollaborators = Object.keys(this.permissions).length;
    if (currentCollaborators >= this.maxCollaborators) {
      throw new Error(`Maximum number of collaborators (${this.maxCollaborators}) reached`);
    }

    this.permissions[userId] = role;
    this.updatedAt = new Date().toISOString();
  }

  // Remove a collaborator from the shared list
  removeCollaborator(userId) {
    if (this.permissions[userId]) {
      delete this.permissions[userId];
      this.updatedAt = new Date().toISOString();
    }
  }

  // Check if a user has permission to access the list
  hasPermission(userId, requiredPermission = 'read') {
    const userRole = this.permissions[userId];

    if (!userRole) {
      return false; // User is not a collaborator
    }

    if (userRole === 'admin') {
      return true; // Admins can do everything
    }

    if (requiredPermission === 'read') {
      return ['read_only', 'read_write', 'admin'].includes(userRole);
    }

    if (requiredPermission === 'write') {
      return ['read_write', 'admin'].includes(userRole);
    }

    return false;
  }

  // Get all tasks in the shared list
  async getTasks() {
    return databaseService.getTasksBySharedList(this.id);
  }

  // Add a task to the shared list
  async addTask(taskData) {
    const task = {
      ...taskData,
      sharedListId: this.id
    };
    return databaseService.createTask(task);
  }

  // Update a task in the shared list
  async updateTask(taskId, updates) {
    return databaseService.updateTask(taskId, updates);
  }

  // Get all collaborators for this list
  getCollaborators() {
    return Object.entries(this.permissions).map(([userId, role]) => ({ userId, role }));
  }

  // Transfer ownership to another user
  transferOwnership(newOwnerId) {
    // Remove the new owner's existing permission
    delete this.permissions[newOwnerId];

    // Set the new owner
    this.ownerId = newOwnerId;

    // The new owner gets admin role by default
    this.permissions[newOwnerId] = 'admin';

    this.updatedAt = new Date().toISOString();
  }

  // Check if a user is the owner
  isOwner(userId) {
    return this.ownerId === userId;
  }

  // Create a share link for this list
  createShareLink(accessType = 'private', permissions = 'read_write', createdBy) {
    // Implementation would go here, but we'll use the ShareLink model separately
    return {
      listId: this.id,
      accessType,
      permissions,
      createdBy
    };
  }
}

export default SharedList;