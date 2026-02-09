/**
 * Project Detail API - Get, Update, Delete Project
 * GET /api/projects/[projectId] - Get project details
 * PUT /api/projects/[projectId] - Update project
 * DELETE /api/projects/[projectId] - Delete project
 */

import projectService from '../../../../src/services/projectService.js';

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
    // Check access
    const access = await projectService.checkAccess(projectId, userId);
    if (!access.hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // GET - Get project details
    if (req.method === 'GET') {
      const project = await projectService.getProjectById(projectId, userId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      return res.status(200).json({ project });
    }

    // PUT - Update project
    if (req.method === 'PUT') {
      const { name, description, status, startDate, endDate, settings } = req.body;

      const project = await projectService.updateProject(
        projectId,
        { name, description, status, startDate, endDate, settings },
        userId
      );

      return res.status(200).json({ project });
    }

    // DELETE - Delete project
    if (req.method === 'DELETE') {
      await projectService.deleteProject(projectId, userId);
      return res.status(204).end();
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('Project API error:', error);
    const statusCode = error.message.includes('permission') ? 403 : 500;
    return res.status(statusCode).json({ error: error.message || 'Internal server error' });
  }
}
