/**
 * Team Members API - List and Add Members
 * GET /api/teams/[teamId]/members - List team members
 * POST /api/teams/[teamId]/members - Add a member
 */

import teamService from '../../../../../src/services/teamService.js';

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

    // GET - List members
    if (req.method === 'GET') {
      const members = await teamService.getMembersByTeamId(teamId);
      return res.status(200).json({ members });
    }

    // POST - Add member
    if (req.method === 'POST') {
      const { userId: newMemberId, role = 'member' } = req.body;

      if (!newMemberId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const member = await teamService.addMember(teamId, newMemberId, role, userId);
      return res.status(201).json({ member });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('Team members API error:', error);
    const statusCode = error.message.includes('permission') || error.message.includes('cannot') ? 403 :
                       error.message.includes('already') ? 409 : 500;
    return res.status(statusCode).json({ error: error.message || 'Internal server error' });
  }
}
