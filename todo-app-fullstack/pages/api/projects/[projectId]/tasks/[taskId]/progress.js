/**
 * Task Progress API - Get History and Update Progress
 * GET /api/projects/[projectId]/tasks/[taskId]/progress - Get progress history
 * POST /api/projects/[projectId]/tasks/[taskId]/progress - Update progress
 */

import projectService from '../../../../../../src/services/projectService.js';
import progressService from '../../../../../../src/services/progressService.js';
import notificationService from '../../../../../../src/services/notificationService.js';
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

  try {
    // Check access
    const userRole = await projectService.resolveUserRole(projectId, userId);
    if (!userRole) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Verify task belongs to project
    const task = await prisma.todo.findFirst({
      where: { id: taskId, projectId },
      select: { id: true, title: true, assignedTo: true }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found in this project' });
    }

    // GET - Get progress history
    if (req.method === 'GET') {
      const { limit = 20, offset = 0 } = req.query;

      const history = await progressService.getProgressHistory(
        taskId,
        parseInt(limit),
        parseInt(offset)
      );

      return res.status(200).json(history);
    }

    // POST - Update progress
    if (req.method === 'POST') {
      const { percentage, note } = req.body;

      if (percentage === undefined) {
        return res.status(400).json({ error: 'Percentage is required' });
      }

      const result = await progressService.updateProgress(taskId, percentage, note, userId);

      // Notify managers/admins about progress update
      const managers = await prisma.projectMember.findMany({
        where: {
          projectId,
          role: { in: ['owner', 'admin', 'manager'] },
          userId: { not: userId }
        },
        select: { userId: true }
      });

      if (managers.length > 0) {
        await notificationService.notifyProgressUpdate({
          todoId: taskId,
          todoTitle: task.title,
          targetUserIds: managers.map(m => m.userId),
          updatedBy: userId,
          percentage,
          projectId
        });
      }

      return res.status(200).json(result);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('Task progress API error:', error);
    const statusCode = error.message.includes('permission') ? 403 :
                       error.message.includes('between 0 and 100') ? 400 : 500;
    return res.status(statusCode).json({ error: error.message || 'Internal server error' });
  }
}
