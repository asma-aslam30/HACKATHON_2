/**
 * Notifications Read API - Mark notifications as read
 * POST /api/notifications/read - Mark single or all notifications as read
 */

import notificationService from '../../../src/services/notificationService.js';

export default async function handler(req, res) {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { notificationId, all = false } = req.body;

    // Mark all as read
    if (all) {
      const count = await notificationService.markAllAsRead(userId);
      return res.status(200).json({ success: true, count });
    }

    // Mark single notification as read
    if (notificationId) {
      const notification = await notificationService.markAsRead(notificationId, userId);
      return res.status(200).json({ notification });
    }

    return res.status(400).json({ error: 'Either notificationId or all=true is required' });
  } catch (error) {
    console.error('Notifications read API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
