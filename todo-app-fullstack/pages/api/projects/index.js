/**
 * Projects API - List and Create Projects
 * GET /api/projects - List user's projects
 * POST /api/projects - Create a new project
 */

import projectService from '../../../src/services/projectService.js';

export default async function handler(req, res) {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    // GET - List projects for user
    if (req.method === 'GET') {
      const projects = await projectService.getProjectsByUserId(userId);
      return res.status(200).json({ projects });
    }

    // POST - Create new project
    if (req.method === 'POST') {
      const { name, description, startDate, endDate } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Project name is required' });
      }

      const project = await projectService.createProject({
        name,
        description,
        ownerId: userId,
        startDate,
        endDate
      });

      return res.status(201).json({ project });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('Projects API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
