import { db } from './config.js';
import { v4 as uuidv4 } from 'uuid';

class DatabaseService {
  constructor() {
    this.db = db;
  }

  // Shared Lists operations
  createSharedList(name, ownerId, permissions = {}) {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO shared_lists (id, name, owner_id, permissions)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, name, ownerId, JSON.stringify(permissions));
    return this.getSharedListById(id);
  }

  getSharedListById(id) {
    const stmt = this.db.prepare('SELECT * FROM shared_lists WHERE id = ?');
    return stmt.get(id);
  }

  updateSharedList(id, updates) {
    const allowedFields = ['name', 'permissions'];
    const updateFields = Object.keys(updates).filter(field => allowedFields.includes(field));

    if (updateFields.length === 0) return null;

    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field =>
      typeof updates[field] === 'object' ? JSON.stringify(updates[field]) : updates[field]
    );

    const stmt = this.db.prepare(`UPDATE shared_lists SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);

    return this.getSharedListById(id);
  }

  // Tasks operations
  createTask(taskData) {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO tasks (
        id, title, description, completed, priority, sort_order, due_date,
        recurrence_pattern, reminder_offset, reminder_enabled, suggestion_dismissed,
        shared_list_id, assigned_to, version, last_modified_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      taskData.title,
      taskData.description,
      taskData.completed || false,
      taskData.priority || 'none',
      taskData.sortOrder || 0,
      taskData.dueDate || null,
      taskData.recurrencePattern || 'none',
      taskData.reminderOffset || 0,
      taskData.reminderEnabled || false,
      taskData.suggestionDismissed || false,
      taskData.sharedListId || null,
      taskData.assignedTo ? JSON.stringify(taskData.assignedTo) : null,
      taskData.version || 1,
      taskData.lastModifiedBy || null
    );

    return this.getTaskById(id);
  }

  getTaskById(id) {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
    const task = stmt.get(id);
    if (task && task.assigned_to) {
      task.assignedTo = JSON.parse(task.assigned_to);
    }
    return task;
  }

  updateTask(id, updates) {
    const allowedFields = [
      'title', 'description', 'completed', 'priority', 'sort_order', 'due_date',
      'recurrence_pattern', 'reminder_offset', 'reminder_enabled', 'suggestion_dismissed',
      'shared_list_id', 'assigned_to', 'version', 'last_modified_by'
    ];

    const updateFields = Object.keys(updates).filter(field => allowedFields.includes(field));

    if (updateFields.length === 0) return null;

    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => {
      if (field === 'assigned_to' && typeof updates[field] === 'object') {
        return JSON.stringify(updates[field]);
      }
      return updates[field];
    });

    const stmt = this.db.prepare(`UPDATE tasks SET ${setClause} WHERE id = ?`);
    stmt.run(...values, id);

    return this.getTaskById(id);
  }

  getTasksBySharedList(listId) {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE shared_list_id = ? ORDER BY sort_order');
    const tasks = stmt.all(listId);
    return tasks.map(task => {
      if (task.assigned_to) {
        task.assignedTo = JSON.parse(task.assigned_to);
      }
      return task;
    });
  }

  // Comments operations
  createComment(commentData) {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO comments (id, task_id, author_id, content, mentions)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      commentData.taskId,
      commentData.authorId,
      commentData.content,
      commentData.mentions ? JSON.stringify(commentData.mentions) : null
    );

    return this.getCommentById(id);
  }

  getCommentsByTask(taskId) {
    const stmt = this.db.prepare('SELECT * FROM comments WHERE task_id = ? ORDER BY created_at ASC');
    const comments = stmt.all(taskId);
    return comments.map(comment => {
      if (comment.mentions) {
        comment.mentions = JSON.parse(comment.mentions);
      }
      return comment;
    });
  }

  getCommentById(id) {
    const stmt = this.db.prepare('SELECT * FROM comments WHERE id = ?');
    const comment = stmt.get(id);
    if (comment && comment.mentions) {
      comment.mentions = JSON.parse(comment.mentions);
    }
    return comment;
  }

  // Assignments operations
  createAssignment(assignmentData) {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO assignments (
        id, task_id, assigned_to, assigned_by, status, due_date, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      assignmentData.taskId,
      assignmentData.assignedTo,
      assignmentData.assignedBy,
      assignmentData.status || 'pending',
      assignmentData.dueDate || null,
      assignmentData.priority || null
    );

    return this.getAssignmentById(id);
  }

  getAssignmentsByTask(taskId) {
    const stmt = this.db.prepare('SELECT * FROM assignments WHERE task_id = ?');
    return stmt.all(taskId);
  }

  getAssignmentsByUser(userId) {
    const stmt = this.db.prepare('SELECT * FROM assignments WHERE assigned_to = ?');
    return stmt.all(userId);
  }

  updateAssignment(id, updates) {
    const allowedFields = ['status', 'due_date', 'priority'];
    const updateFields = Object.keys(updates).filter(field => allowedFields.includes(field));

    if (updateFields.length === 0) return null;

    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updates[field]);

    const stmt = this.db.prepare(`UPDATE assignments SET ${setClause} WHERE id = ?`);
    stmt.run(...values, id);

    return this.getAssignmentById(id);
  }

  getAssignmentById(id) {
    const stmt = this.db.prepare('SELECT * FROM assignments WHERE id = ?');
    return stmt.get(id);
  }

  // Share links operations
  createShareLink(linkData) {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO share_links (
        id, list_id, access_type, permissions, expires_at, created_by, max_uses
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      linkData.listId,
      linkData.accessType,
      linkData.permissions,
      linkData.expiresAt || null,
      linkData.createdBy,
      linkData.maxUses || null
    );

    return this.getShareLinkById(id);
  }

  getShareLinkById(id) {
    const stmt = this.db.prepare('SELECT * FROM share_links WHERE id = ?');
    return stmt.get(id);
  }

  validateShareLink(linkId) {
    const stmt = this.db.prepare(`
      SELECT * FROM share_links
      WHERE id = ?
      AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      AND (max_uses IS NULL OR usage_count < max_uses)
    `);
    return stmt.get(linkId);
  }

  incrementShareLinkUsage(linkId) {
    const stmt = this.db.prepare('UPDATE share_links SET usage_count = usage_count + 1 WHERE id = ?');
    stmt.run(linkId);
  }

  // Users operations
  createUser(userData) {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO users (id, display_name, email, avatar_url, preferences)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      userData.displayName,
      userData.email || null,
      userData.avatarUrl || null,
      userData.preferences ? JSON.stringify(userData.preferences) : null
    );

    return this.getUserById(id);
  }

  getUserById(id) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id);
    if (user && user.preferences) {
      user.preferences = JSON.parse(user.preferences);
    }
    return user;
  }

  updateUser(id, updates) {
    const allowedFields = ['display_name', 'email', 'avatar_url', 'preferences'];
    const updateFields = Object.keys(updates).filter(field => allowedFields.includes(field));

    if (updateFields.length === 0) return null;

    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => {
      if (field === 'preferences' && typeof updates[field] === 'object') {
        return JSON.stringify(updates[field]);
      }
      return updates[field];
    });

    const stmt = this.db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`);
    stmt.run(...values, id);

    return this.getUserById(id);
  }

  // Collaborations operations
  createCollaboration(listId, userId, role) {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO collaborations (id, list_id, user_id, role)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, listId, userId, role);
    return this.getCollaborationById(id);
  }

  getCollaborationsByList(listId) {
    const stmt = this.db.prepare('SELECT * FROM collaborations WHERE list_id = ?');
    return stmt.all(listId);
  }

  getCollaborationsByUser(userId) {
    const stmt = this.db.prepare('SELECT * FROM collaborations WHERE user_id = ?');
    return stmt.all(userId);
  }

  getCollaborationById(id) {
    const stmt = this.db.prepare('SELECT * FROM collaborations WHERE id = ?');
    return stmt.get(id);
  }

  updateCollaboration(id, updates) {
    const allowedFields = ['role', 'notifications_enabled'];
    const updateFields = Object.keys(updates).filter(field => allowedFields.includes(field));

    if (updateFields.length === 0) return null;

    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updates[field]);

    const stmt = this.db.prepare(`UPDATE collaborations SET ${setClause} WHERE id = ?`);
    stmt.run(...values, id);

    return this.getCollaborationById(id);
  }

  // Additional utility methods
  getSharedListsForUser(userId) {
    const stmt = this.db.prepare(`
      SELECT sl.*
      FROM shared_lists sl
      JOIN collaborations c ON sl.id = c.list_id
      WHERE c.user_id = ?
    `);
    return stmt.all(userId);
  }

  getUserTasks(userId) {
    const stmt = this.db.prepare(`
      SELECT t.*
      FROM tasks t
      JOIN assignments a ON t.id = a.task_id
      WHERE a.assigned_to = ?
    `);
    const tasks = stmt.all(userId);
    return tasks.map(task => {
      if (task.assigned_to) {
        task.assignedTo = JSON.parse(task.assigned_to);
      }
      return task;
    });
  }
}

// Export a singleton instance
const databaseService = new DatabaseService();
export default databaseService;