/**
 * Progress Service
 *
 * Handles task progress updates, history tracking, and progress statistics.
 */

import prisma from '../../lib/db.js';
import { hasPermission } from '../models/rolePermissions.js';
import projectService from './projectService.js';

export class ProgressService {
  // ============================================
  // PROGRESS UPDATES
  // ============================================

  /**
   * Update task progress
   * @param {string} todoId - Task ID
   * @param {number} percentage - Progress percentage (0-100)
   * @param {string} note - Optional note about the update
   * @param {string} updatedBy - User making the update
   * @returns {Promise<object>} - Updated task with progress
   */
  async updateProgress(todoId, percentage, note, updatedBy) {
    // Validate percentage
    const validPercentage = this.validatePercentage(percentage);

    // Get the task to check project access
    const todo = await prisma.todo.findUnique({
      where: { id: todoId },
      select: { id: true, projectId: true, assignedTo: true, userId: true, progress: true }
    });

    if (!todo) {
      throw new Error('Task not found');
    }

    // Check permission
    if (todo.projectId) {
      const userRole = await projectService.resolveUserRole(todo.projectId, updatedBy);
      if (!hasPermission(userRole, 'task.updateProgress')) {
        throw new Error('You do not have permission to update progress');
      }
    } else {
      // For personal tasks, only owner can update
      if (todo.userId !== updatedBy) {
        throw new Error('You can only update progress on your own tasks');
      }
    }

    // Create progress update record and update task in transaction
    const [progressUpdate, updatedTodo] = await prisma.$transaction([
      prisma.progressUpdate.create({
        data: {
          todoId,
          percentage: validPercentage,
          note,
          updatedBy
        },
        include: {
          updater: {
            select: { id: true, name: true, email: true, avatarUrl: true }
          }
        }
      }),
      prisma.todo.update({
        where: { id: todoId },
        data: {
          progress: validPercentage,
          // Auto-complete if progress is 100%
          ...(validPercentage === 100 && { completed: true }),
          // Un-complete if progress goes below 100 (unless already completed)
          ...(validPercentage < 100 && todo.progress === 100 && { completed: false }),
          version: { increment: 1 },
          lastModifiedBy: updatedBy
        },
        include: {
          progressUpdates: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
              updater: {
                select: { id: true, name: true, email: true, avatarUrl: true }
              }
            }
          }
        }
      })
    ]);

    return {
      task: this.transformTask(updatedTodo),
      progressUpdate: this.transformProgressUpdate(progressUpdate)
    };
  }

  /**
   * Get progress history for a task
   * @param {string} todoId - Task ID
   * @param {number} limit - Max number of records
   * @param {number} offset - Offset for pagination
   * @returns {Promise<object>} - Progress history with pagination
   */
  async getProgressHistory(todoId, limit = 20, offset = 0) {
    const [updates, total] = await Promise.all([
      prisma.progressUpdate.findMany({
        where: { todoId },
        include: {
          updater: {
            select: { id: true, name: true, email: true, avatarUrl: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.progressUpdate.count({ where: { todoId } })
    ]);

    return {
      updates: updates.map(u => this.transformProgressUpdate(u)),
      total,
      hasMore: offset + updates.length < total
    };
  }

  /**
   * Get latest progress for a task
   * @param {string} todoId - Task ID
   * @returns {Promise<object|null>} - Latest progress update or null
   */
  async getLatestProgress(todoId) {
    const update = await prisma.progressUpdate.findFirst({
      where: { todoId },
      include: {
        updater: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return update ? this.transformProgressUpdate(update) : null;
  }

  // ============================================
  // AGGREGATIONS
  // ============================================

  /**
   * Get progress statistics for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<object>} - Project progress stats
   */
  async getProjectProgressStats(projectId) {
    const tasks = await prisma.todo.findMany({
      where: { projectId },
      select: {
        id: true,
        progress: true,
        completed: true,
        priority: true,
        assignedTo: true,
        dueDate: true
      }
    });

    const total = tasks.length;
    if (total === 0) {
      return {
        total: 0,
        avgProgress: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        byPriority: {},
        distribution: { 0: 0, 25: 0, 50: 0, 75: 0, 100: 0 }
      };
    }

    const now = new Date();
    const completed = tasks.filter(t => t.completed).length;
    const overdue = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < now).length;
    const avgProgress = Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / total);

    // Progress distribution (0%, 1-25%, 26-50%, 51-75%, 76-99%, 100%)
    const distribution = {
      0: tasks.filter(t => t.progress === 0).length,
      25: tasks.filter(t => t.progress > 0 && t.progress <= 25).length,
      50: tasks.filter(t => t.progress > 25 && t.progress <= 50).length,
      75: tasks.filter(t => t.progress > 50 && t.progress <= 75).length,
      99: tasks.filter(t => t.progress > 75 && t.progress < 100).length,
      100: tasks.filter(t => t.progress === 100).length
    };

    // By priority
    const byPriority = {};
    ['high', 'medium', 'low'].forEach(priority => {
      const priorityTasks = tasks.filter(t => t.priority === priority);
      byPriority[priority] = {
        total: priorityTasks.length,
        avgProgress: priorityTasks.length > 0
          ? Math.round(priorityTasks.reduce((sum, t) => sum + t.progress, 0) / priorityTasks.length)
          : 0,
        completed: priorityTasks.filter(t => t.completed).length
      };
    });

    return {
      total,
      avgProgress,
      completed,
      pending: total - completed,
      overdue,
      byPriority,
      distribution
    };
  }

  /**
   * Get progress statistics for a specific user in a project
   * @param {string} userId - User ID
   * @param {string} projectId - Project ID (optional)
   * @returns {Promise<object>} - User progress stats
   */
  async getUserProgressStats(userId, projectId = null) {
    const where = {
      assignedTo: { has: userId },
      ...(projectId && { projectId })
    };

    const tasks = await prisma.todo.findMany({
      where,
      select: {
        id: true,
        progress: true,
        completed: true,
        priority: true,
        dueDate: true
      }
    });

    const total = tasks.length;
    if (total === 0) {
      return {
        total: 0,
        avgProgress: 0,
        completed: 0,
        pending: 0,
        overdue: 0
      };
    }

    const now = new Date();
    const completed = tasks.filter(t => t.completed).length;
    const overdue = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < now).length;
    const avgProgress = Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / total);

    // Get recent progress updates by this user
    const recentUpdates = await prisma.progressUpdate.findMany({
      where: { updatedBy: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        todo: { select: { id: true, title: true } }
      }
    });

    return {
      total,
      avgProgress,
      completed,
      pending: total - completed,
      overdue,
      recentUpdates: recentUpdates.map(u => ({
        id: u.id,
        percentage: u.percentage,
        note: u.note,
        createdAt: u.createdAt,
        task: u.todo
      }))
    };
  }

  /**
   * Get progress statistics for a team in a project
   * @param {string} teamId - Team ID
   * @param {string} projectId - Project ID
   * @returns {Promise<object>} - Team progress stats
   */
  async getTeamProgressStats(teamId, projectId) {
    // Get team members
    const teamMembers = await prisma.teamMember.findMany({
      where: { teamId },
      select: { userId: true }
    });

    const memberIds = teamMembers.map(m => m.userId);

    // Get tasks assigned to team members in this project
    const tasks = await prisma.todo.findMany({
      where: {
        projectId,
        assignedTo: { hasSome: memberIds }
      },
      select: {
        id: true,
        progress: true,
        completed: true,
        assignedTo: true
      }
    });

    const total = tasks.length;
    if (total === 0) {
      return {
        total: 0,
        avgProgress: 0,
        completed: 0,
        pending: 0,
        byMember: {}
      };
    }

    const completed = tasks.filter(t => t.completed).length;
    const avgProgress = Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / total);

    // Per-member stats
    const byMember = {};
    for (const memberId of memberIds) {
      const memberTasks = tasks.filter(t => t.assignedTo.includes(memberId));
      if (memberTasks.length > 0) {
        byMember[memberId] = {
          total: memberTasks.length,
          avgProgress: Math.round(memberTasks.reduce((sum, t) => sum + t.progress, 0) / memberTasks.length),
          completed: memberTasks.filter(t => t.completed).length
        };
      }
    }

    return {
      total,
      avgProgress,
      completed,
      pending: total - completed,
      byMember
    };
  }

  // ============================================
  // PROGRESS REQUESTS (via @mentions)
  // ============================================

  /**
   * Request progress update from a user
   * This creates a notification asking for progress
   * @param {string} todoId - Task ID
   * @param {string} requestedFromUserId - User to request from
   * @param {string} requestedByUserId - User making the request
   * @param {string} message - Optional message
   * @returns {Promise<object>} - Created notification
   */
  async requestProgressUpdate(todoId, requestedFromUserId, requestedByUserId, message = '') {
    const todo = await prisma.todo.findUnique({
      where: { id: todoId },
      include: {
        project: { select: { id: true, name: true } }
      }
    });

    if (!todo) {
      throw new Error('Task not found');
    }

    // Check if requester has permission (must be manager+)
    if (todo.projectId) {
      const userRole = await projectService.resolveUserRole(todo.projectId, requestedByUserId);
      if (!hasPermission(userRole, 'task.requestProgress')) {
        throw new Error('You do not have permission to request progress updates');
      }
    }

    // Get requester info
    const requester = await prisma.user.findUnique({
      where: { id: requestedByUserId },
      select: { name: true, email: true }
    });

    // Create notification for the target user
    const notification = await prisma.notification.create({
      data: {
        userId: requestedFromUserId,
        type: 'progress_request',
        title: 'Progress Update Requested',
        message: message || `${requester?.name || 'Someone'} is asking for a progress update on "${todo.title}"`,
        data: {
          todoId: todo.id,
          todoTitle: todo.title,
          projectId: todo.projectId,
          projectName: todo.project?.name,
          requestedBy: requestedByUserId,
          requesterName: requester?.name
        },
        actionUrl: todo.projectId
          ? `/projects/${todo.projectId}/tasks?taskId=${todo.id}`
          : `/todos?taskId=${todo.id}`
      }
    });

    return notification;
  }

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  /**
   * Validate and normalize percentage value
   * @param {number} value - Percentage value
   * @returns {number} - Validated percentage (0-100)
   */
  validatePercentage(value) {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      throw new Error('Progress must be a number');
    }
    if (num < 0 || num > 100) {
      throw new Error('Progress must be between 0 and 100');
    }
    return num;
  }

  // ============================================
  // TRANSFORM HELPERS
  // ============================================

  transformProgressUpdate(update) {
    return {
      id: update.id,
      todoId: update.todoId,
      percentage: update.percentage,
      note: update.note,
      createdAt: update.createdAt,
      updatedBy: update.updatedBy,
      updater: update.updater
    };
  }

  transformTask(task) {
    return {
      id: task.id,
      title: task.title,
      progress: task.progress,
      completed: task.completed,
      version: task.version,
      lastModifiedBy: task.lastModifiedBy,
      progressUpdates: task.progressUpdates?.map(u => this.transformProgressUpdate(u)) || []
    };
  }
}

// Export singleton instance
const progressService = new ProgressService();
export default progressService;
