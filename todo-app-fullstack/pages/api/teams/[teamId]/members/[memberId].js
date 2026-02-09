/**
 * Team Member Detail API - Update Role, Remove Member
 * PUT /api/teams/[teamId]/members/[memberId] - Update member role
 * DELETE /api/teams/[teamId]/members/[memberId] - Remove member
 */

import teamService from '../../../../../src/services/teamService.js';

export default async function handler(req, res) {
  const userId = req.headers['x-user-id'];
  const { teamId, memberId } = req.query;

  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  if (!teamId || !memberId) {
    return res.status(400).json({ error: 'Team ID and Member ID required' });
  }

  try {
    // Check access
    const access = await teamService.checkAccess(teamId, userId);
    if (!access.hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // PUT - Update member role
    if (req.method === 'PUT') {
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({ error: 'Role is required' });
      }

      const member = await teamService.updateMemberRole(teamId, memberId, role, userId);
      return res.status(200).json({ member });
    }

    // DELETE - Remove member
    if (req.method === 'DELETE') {
      await teamService.removeMember(teamId, memberId, userId);
      return res.status(204).end();
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('Team member API error:', error);
    const statusCode = error.message.includes('permission') || error.message.includes('cannot') ? 403 : 500;
    return res.status(statusCode).json({ error: error.message || 'Internal server error' });
  }
}
