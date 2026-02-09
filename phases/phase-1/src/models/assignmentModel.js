// phases/phase-1/src/models/assignmentModel.js
import { v4 as uuidv4 } from 'uuid';
import databaseService from '../../database/service.js';

class Assignment {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.taskId = data.taskId;
    this.assignedTo = Array.isArray(data.assignedTo) ? data.assignedTo : [data.assignedTo].filter(id => id);
    this.assignedBy = data.assignedBy;
    this.assignedAt = data.assignedAt || new Date().toISOString();
    this.status = data.status || 'pending'; // 'pending', 'accepted', 'in_progress', 'completed'
    this.dueDate = data.dueDate || null;
    this.priority = data.priority || null; // 'low', 'medium', 'high'
  }

  // Validate the assignment data
  validate() {
    if (!this.taskId || typeof this.taskId !== 'string') {
      throw new Error('Task ID is required and must be a string');
    }

    if (!this.assignedTo || !Array.isArray(this.assignedTo) || this.assignedTo.length === 0) {
      throw new Error('Assigned to must be a non-empty array of user IDs');
    }

    if (this.assignedTo.length > 5) {
      throw new Error('Maximum 5 assignees per task');
    }

    if (!this.assignedBy || typeof this.assignedBy !== 'string') {
      throw new Error('Assigned by user ID is required and must be a string');
    }

    const validStatuses = ['pending', 'accepted', 'in_progress', 'completed'];
    if (!validStatuses.includes(this.status)) {
      throw new Error(`Invalid status: ${this.status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    const validPriorities = ['low', 'medium', 'high'];
    if (this.priority && !validPriorities.includes(this.priority)) {
      throw new Error(`Invalid priority: ${this.priority}. Must be one of: ${validPriorities.join(', ')}`);
    }

    if (this.dueDate) {
      const dueDate = new Date(this.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new Error('Due date must be a valid date');
      }
    }

    return true;
  }

  // Save the assignment to the database
  async save() {
    this.validate();

    // If this is a new assignment, create it
    if (!this.id) {
      this.id = uuidv4();
      const result = databaseService.createAssignment({
        id: this.id,
        taskId: this.taskId,
        assignedTo: this.assignedTo[0], // For now, just store the first assignee since DB schema has single assigned_to field
        assignedBy: this.assignedBy,
        status: this.status,
        dueDate: this.dueDate,
        priority: this.priority
      });
      return Assignment.fromDatabase(result);
    } else {
      // Update the assignment
      const result = databaseService.updateAssignment(this.id, {
        status: this.status,
        dueDate: this.dueDate,
        priority: this.priority
      });
      return Assignment.fromDatabase(result);
    }
  }

  // Create an assignment from database data
  static fromDatabase(dbData) {
    return new Assignment({
      id: dbData.id,
      taskId: dbData.task_id || dbData.taskId,
      assignedTo: [dbData.assigned_to || dbData.assignedTo], // For now, single assignee from DB
      assignedBy: dbData.assigned_by || dbData.assignedBy,
      assignedAt: dbData.assigned_at || dbData.assignedAt,
      status: dbData.status,
      dueDate: dbData.due_date || dbData.dueDate,
      priority: dbData.priority
    });
  }

  // Update the assignment
  async update(updates) {
    const allowedUpdates = ['status', 'dueDate', 'priority'];
    const filteredUpdates = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = value;
      }
    }

    if (filteredUpdates.status) {
      const validStatuses = ['pending', 'accepted', 'in_progress', 'completed'];
      if (!validStatuses.includes(filteredUpdates.status)) {
        throw new Error(`Invalid status: ${filteredUpdates.status}. Must be one of: ${validStatuses.join(', ')}`);
      }
    }

    if (filteredUpdates.priority) {
      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(filteredUpdates.priority)) {
        throw new Error(`Invalid priority: ${filteredUpdates.priority}. Must be one of: ${validPriorities.join(', ')}`);
      }
    }

    if (filteredUpdates.dueDate) {
      const dueDate = new Date(filteredUpdates.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new Error('Due date must be a valid date');
      }
    }

    // Update the assignment
    Object.assign(this, filteredUpdates);

    // Save to database
    return this.save();
  }

  // Add an assignee to the assignment
  addAssignee(userId) {
    if (!this.assignedTo.includes(userId)) {
      if (this.assignedTo.length >= 5) {
        throw new Error('Maximum 5 assignees per task');
      }
      this.assignedTo.push(userId);
    }
  }

  // Remove an assignee from the assignment
  removeAssignee(userId) {
    this.assignedTo = this.assignedTo.filter(id => id !== userId);
  }

  // Check if a user is assigned to this task
  isAssignedTo(userId) {
    return this.assignedTo.includes(userId);
  }

  // Check if a user assigned this task
  isAssignedBy(userId) {
    return this.assignedBy === userId;
  }

  // Mark assignment as accepted
  accept(userId) {
    if (!this.isAssignedTo(userId)) {
      throw new Error('User is not assigned to this task');
    }
    this.status = 'accepted';
    return this.save();
  }

  // Mark assignment as in progress
  start(userId) {
    if (!this.isAssignedTo(userId)) {
      throw new Error('User is not assigned to this task');
    }
    this.status = 'in_progress';
    return this.save();
  }

  // Mark assignment as completed
  complete(userId) {
    if (!this.isAssignedTo(userId)) {
      throw new Error('User is not assigned to this task');
    }
    this.status = 'completed';
    return this.save();
  }

  // Mark assignment as pending again
  reset() {
    this.status = 'pending';
    return this.save();
  }

  // Check if assignment is overdue
  isOverdue() {
    if (!this.dueDate) {
      return false;
    }
    return new Date(this.dueDate) < new Date();
  }

  // Check if assignment is completed
  isCompleted() {
    return this.status === 'completed';
  }

  // Check if assignment is in progress
  isInProgress() {
    return this.status === 'in_progress';
  }

  // Format assignment for display
  formatForDisplay() {
    return {
      id: this.id,
      taskId: this.taskId,
      assignedTo: this.assignedTo,
      assignedBy: this.assignedBy,
      assignedAt: this.assignedAt,
      status: this.status,
      dueDate: this.dueDate,
      priority: this.priority,
      isOverdue: this.isOverdue(),
      isCompleted: this.isCompleted(),
      isInProgress: this.isInProgress()
    };
  }

  // Get all assignments for a specific task
  static async getByTask(taskId) {
    const dbAssignments = databaseService.getAssignmentsByTask(taskId);
    return dbAssignments.map(assignment => Assignment.fromDatabase(assignment));
  }

  // Get all assignments for a specific user
  static async getByUser(userId) {
    const dbAssignments = databaseService.getAssignmentsByUser(userId);
    return dbAssignments.map(assignment => Assignment.fromDatabase(assignment));
  }

  // Create multiple assignments for the same task
  static createMultiple(taskId, assignees, assignedBy, options = {}) {
    return assignees.map(userId =>
      new Assignment({
        taskId,
        assignedTo: [userId],
        assignedBy,
        ...options
      })
    );
  }
}

export default Assignment;