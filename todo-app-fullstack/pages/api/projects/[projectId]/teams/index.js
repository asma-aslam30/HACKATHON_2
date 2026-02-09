/**
 * Project Teams API - List and Add Teams
 * GET /api/projects/[projectId]/teams - List assigned teams
 * POST /api/projects/[projectId]/teams - Add a team to project
 */

import projectService from '../../../../../src/services/projectService.js';

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

    // GET - List assigned teams
    if (req.method === 'GET') {
      const teams = await projectService.getProjectTeams(projectId);
      return res.status(200).json({ teams });
    }

    // POST - Add team to project
    if (req.method === 'POST') {
      const { teamId, role = 'member' } = req.body;

      if (!teamId) {
        return res.status(400).json({ error: 'Team ID is required' });
      }

      const projectTeam = await projectService.addTeam(projectId, teamId, role, userId);
      return res.status(201).json({ projectTeam });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('Project teams API error:', error);
    const statusCode = error.message.includes('permission') ? 403 :
                       error.message.includes('already') ? 409 : 500;
    return res.status(statusCode).json({ error: error.message || 'Internal server error' });
  }
}
