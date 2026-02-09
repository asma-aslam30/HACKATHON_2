/**
 * Teams API - List and Create Teams
 * GET /api/teams - List user's teams
 * POST /api/teams - Create a new team
 */

import teamService from '../../../src/services/teamService.js';

export default async function handler(req, res) {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    // GET - List teams for user
    if (req.method === 'GET') {
      const teams = await teamService.getTeamsByUserId(userId);
      return res.status(200).json({ teams });
    }

    // POST - Create new team
    if (req.method === 'POST') {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Team name is required' });
      }

      const team = await teamService.createTeam({
        name,
        description,
        createdBy: userId
      });

      return res.status(201).json({ team });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('Teams API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
