/**
 * Team Detail API - Get, Update, Delete Team
 * GET /api/teams/[teamId] - Get team details
 * PUT /api/teams/[teamId] - Update team
 * DELETE /api/teams/[teamId] - Delete team
 */

import teamService from '../../../../src/services/teamService.js';

export default async function handler(req, res) {
  const userId = req.headers['x-user-id'];
  const { teamId } = req.query;

  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  if (!teamId) {
    return res.status(400).json({ error: 'Team ID required' });
  }

  try {
    // Check access
    const access = await teamService.checkAccess(teamId, userId);
    if (!access.hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // GET - Get team details
    if (req.method === 'GET') {
      const team = await teamService.getTeamById(teamId);
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      return res.status(200).json({ team, userRole: access.role });
    }

    // PUT - Update team
    if (req.method === 'PUT') {
      const { name, description, avatarUrl } = req.body;

      const team = await teamService.updateTeam(
        teamId,
        { name, description, avatarUrl },
        userId
      );

      return res.status(200).json({ team });
    }

    // DELETE - Delete team
    if (req.method === 'DELETE') {
      await teamService.deleteTeam(teamId, userId);
      return res.status(204).end();
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('Team API error:', error);
    const statusCode = error.message.includes('permission') ? 403 : 500;
    return res.status(statusCode).json({ error: error.message || 'Internal server error' });
  }
}
