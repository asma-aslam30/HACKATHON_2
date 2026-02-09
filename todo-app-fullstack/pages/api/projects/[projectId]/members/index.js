/**
 * Project Members API - List and Add Members
 * GET /api/projects/[projectId]/members - List all project members (direct + team-based)
 * POST /api/projects/[projectId]/members - Add a direct member
 */

import projectService from '../../../../../src/services/projectService.js';
import notificationService from '../../../../../src/services/notificationService.js';

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

    // GET - List all members (with resolved roles)
    if (req.method === 'GET') {
      const members = await projectService.getProjectMembers(projectId);
      return res.status(200).json({ members });
    }

    // POST - Add direct member
    if (req.method === 'POST') {
      const { userId: newMemberId, role = 'member' } = req.body;

      if (!newMemberId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const member = await projectService.addMember(projectId, newMemberId, role, userId);

      // Get project info for notification
      const project = await projectService.getProjectById(projectId, userId);
      const existingMembers = await projectService.getProjectMembers(projectId);

      // Notify existing members
      await notificationService.notifyMemberJoined({
        projectId,
        projectName: project.name,
        newUserId: newMemberId,
        newUserName: member.user?.name || 'New member',
        existingMemberIds: existingMembers.map(m => m.userId)
      });

      return res.status(201).json({ member });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('Project members API error:', error);
    const statusCode = error.message.includes('permission') || error.message.includes('cannot') ? 403 :
                       error.message.includes('already') ? 409 : 500;
    return res.status(statusCode).json({ error: error.message || 'Internal server error' });
  }
}
