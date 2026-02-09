/**
 * Notifications API - List Notifications
 * GET /api/notifications - Get user's notifications
 */

import notificationService from '../../../src/services/notificationService.js';

export default async function handler(req, res) {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { unreadOnly, limit = 20, offset = 0, type } = req.query;

    const result = await notificationService.getNotifications(userId, {
      unreadOnly: unreadOnly === 'true',
      limit: parseInt(limit),
      offset: parseInt(offset),
      type
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Notifications API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
