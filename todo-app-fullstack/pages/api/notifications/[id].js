/**
 * Notification Detail API - Delete notification
 * DELETE /api/notifications/[id] - Delete a notification
 */

import notificationService from '../../../src/services/notificationService.js';

export default async function handler(req, res) {
  const userId = req.headers['x-user-id'];
  const { id } = req.query;

  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Notification ID required' });
  }

  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const success = await notificationService.deleteNotification(id, userId);

    if (success) {
      return res.status(204).end();
    } else {
      return res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Notification delete API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
