/**
 * Project Tasks API - List and Create Tasks
 * GET /api/projects/[projectId]/tasks - List project tasks
 * POST /api/projects/[projectId]/tasks - Create task in project
 */

import prisma from '../../../../../lib/db.js';
import projectService from '../../../../../src/services/projectService.js';
import { hasPermission } from '../../../../../src/models/rolePermissions.js';

export default async function handler(req, res) {
  const userId = req.headers['x-user-id'];
  const { projectId } = req.query;

  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  try {
    // Check access and get role
    const userRole = await projectService.resolveUserRole(projectId, userId);
    if (!userRole) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // GET - List tasks with filters
    if (req.method === 'GET') {
      const { status, priority, assignedTo, search } = req.query;

      const tasks = await projectService.getProjectTasks(projectId, {
        status,
        priority,
        assignedTo,
        search
      });

      const progress = await projectService.getProjectProgress(projectId);

      return res.status(200).json({ tasks, progress, userRole });
    }

    // POST - Create task in project
    if (req.method === 'POST') {
      if (!hasPermission(userRole, 'task.create')) {
        return res.status(403).json({ error: 'You do not have permission to create tasks' });
      }

      const { title, description, priority, dueDate, assignedTo = [] } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Task title is required' });
      }

      const task = await prisma.todo.create({
        data: {
          title,
          description,
          priority: priority || 'medium',
          dueDate: dueDate ? new Date(dueDate) : null,
          userId,
          projectId,
          assignedTo,
          progress: 0
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true }
          },
          assignments: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatarUrl: true }
              }
            }
          }
        }
      });

      return res.status(201).json({ task });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('Project tasks API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
