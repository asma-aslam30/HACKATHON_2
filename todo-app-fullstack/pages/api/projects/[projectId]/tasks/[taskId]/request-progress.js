/**
 * Progress Request API - Request progress updates from task assignees
 * POST /api/projects/[projectId]/tasks/[taskId]/request-progress - Request progress update
 */

import projectService from '../../../../../../src/services/projectService.js';
import notificationService from '../../../../../../src/services/notificationService.js';
import { hasPermission } from '../../../../../../src/models/rolePermissions.js';
import prisma from '../../../../../../lib/db.js';

export default async function handler(req, res) {
  const userId = req.headers['x-user-id'];
  const { projectId, taskId } = req.query;

  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  if (!projectId || !taskId) {
    return res.status(400).json({ error: 'Project ID and Task ID required' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // Check permission
    const userRole = await projectService.resolveUserRole(projectId, userId);
    if (!hasPermission(userRole, 'task.requestProgress')) {
      return res.status(403).json({
        error: 'You do not have permission to request progress updates'
      });
    }

    // Verify task belongs to project
    const task = await prisma.todo.findFirst({
      where: { id: taskId, projectId },
      select: { id: true, title: true, assignedTo: true, user: { select: { name: true } } }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found in this project' });
    }

    const { message = '' } = req.body;

    // Get all assignees (users assigned to this task)
    const assigneeIds = task.assignedTo || [];

    if (assigneeIds.length === 0) {
      return res.status(400).json({
        error: 'No users are assigned to this task'
      });
    }

    // Send progress request notification to each assignee
    const notifications = [];
    for (const assigneeId of assigneeIds) {
      const notification = await notificationService.notifyProgressRequest({
        todoId: taskId,
        todoTitle: task.title,
        targetUserId: assigneeId,
        requestedBy: userId,
        projectId,
        message
      });
      notifications.push(notification);
    }

    return res.status(200).json({
      message: `Progress update requested from ${assigneeIds.length} assignee(s)`,
      assigneeCount: assigneeIds.length,
      notifications: notifications.map(n => ({
        id: n.id,
        userId: n.userId
      }))
    });
  } catch (error) {
    console.error('Progress request API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}