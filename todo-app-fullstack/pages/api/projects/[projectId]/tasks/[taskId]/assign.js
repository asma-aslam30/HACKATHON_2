/**
 * Task Assignment API - Assign members to task
 * POST /api/projects/[projectId]/tasks/[taskId]/assign - Assign users to task
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
    if (!hasPermission(userRole, 'task.assign')) {
      return res.status(403).json({ error: 'You do not have permission to assign tasks' });
    }

    // Verify task belongs to project
    const task = await prisma.todo.findFirst({
      where: { id: taskId, projectId },
      select: { id: true, title: true, assignedTo: true }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found in this project' });
    }

    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: 'userIds array is required' });
    }

    // Verify all users are project members
    const projectMembers = await projectService.getProjectMembers(projectId);
    const memberIds = projectMembers.map(m => m.userId);
    const invalidUsers = userIds.filter(id => !memberIds.includes(id));

    if (invalidUsers.length > 0) {
      return res.status(400).json({
        error: 'Some users are not project members',
        invalidUsers
      });
    }

    // Update task assignedTo array
    const updatedTask = await prisma.todo.update({
      where: { id: taskId },
      data: {
        assignedTo: userIds,
        version: { increment: 1 },
        lastModifiedBy: userId
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    // Create/update assignment records
    const newAssignees = userIds.filter(id => !task.assignedTo.includes(id));

    for (const assigneeId of newAssignees) {
      // Create assignment record
      await prisma.assignment.upsert({
        where: {
          todoId_userId: { todoId: taskId, userId: assigneeId }
        },
        create: {
          todoId: taskId,
          userId: assigneeId,
          assignedBy: userId,
          status: 'pending'
        },
        update: {
          assignedBy: userId,
          status: 'pending'
        }
      });

      // Send notification to new assignee
      await notificationService.notifyAssignment(assigneeId, {
        todoId: taskId,
        todoTitle: task.title,
        assignedBy: userId,
        projectId
      });
    }

    // Remove assignment records for unassigned users
    const removedAssignees = task.assignedTo.filter(id => !userIds.includes(id));
    if (removedAssignees.length > 0) {
      await prisma.assignment.deleteMany({
        where: {
          todoId: taskId,
          userId: { in: removedAssignees }
        }
      });
    }

    return res.status(200).json({
      task: updatedTask,
      newAssignees,
      removedAssignees
    });
  } catch (error) {
    console.error('Task assignment API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
