/**
 * Enhanced Notification Service
 *
 * Handles in-app notifications, email queue management, and notification delivery.
 * Uses Prisma for database operations with Supabase fallback.
 */

import prisma from '../../lib/db.js';

export class NotificationService {
  constructor(supabase = null) {
    this.supabase = supabase;
  }

  // ============================================
  // IN-APP NOTIFICATIONS
  // ============================================

  /**
   * Create a notification
   * @param {Object} params - Notification parameters
   * @returns {Promise<Object>} The created notification
   */
  async create({ userId, type, title, message, data = {}, actionUrl = null }) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          data,
          actionUrl,
          read: false
        }
      });

      return this.transformNotification(notification);
    } catch (error) {
      console.error('Failed to create notification:', error);
      // Return a mock notification if DB fails
      return {
        id: `temp-${Date.now()}`,
        userId,
        type,
        title,
        message,
        data,
        actionUrl,
        read: false,
        createdAt: new Date().toISOString()
      };
    }
  }

  /**
   * Get notifications for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Notifications with pagination
   */
  async getNotifications(userId, { unreadOnly = false, limit = 20, offset = 0, type = null } = {}) {
    try {
      const where = {
        userId,
        ...(unreadOnly && { read: false }),
        ...(type && { type })
      };

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({ where: { userId, read: false } })
      ]);

      return {
        notifications: notifications.map(n => this.transformNotification(n)),
        total,
        unreadCount,
        hasMore: offset + notifications.length < total
      };
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return { notifications: [], total: 0, unreadCount: 0, hasMore: false };
    }
  }

  /**
   * Get unread notification count
   * @param {string} userId - User ID
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount(userId) {
    try {
      return await prisma.notification.count({
        where: { userId, read: false }
      });
    } catch {
      return 0;
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true, readAt: new Date() }
      });

      // Verify ownership
      if (notification.userId !== userId) {
        throw new Error('Notification not found');
      }

      return this.transformNotification(notification);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return { id: notificationId, read: true };
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number updated
   */
  async markAllAsRead(userId) {
    try {
      const result = await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true, readAt: new Date() }
      });
      return result.count;
    } catch {
      return 0;
    }
  }

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<boolean>} Success
   */
  async deleteNotification(notificationId, userId) {
    try {
      await prisma.notification.deleteMany({
        where: { id: notificationId, userId }
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean up old notifications
   * @param {number} daysOld - Delete notifications older than days
   * @returns {Promise<number>} Number deleted
   */
  async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          read: true // Only delete read notifications
        }
      });
      return result.count;
    } catch {
      return 0;
    }
  }

  // ============================================
  // NOTIFICATION TRIGGERS
  // ============================================

  /**
   * Notify users about a mention
   */
  async notifyMentions(mentionedUserIds, { todoId, todoTitle, commentId, mentionedBy, projectId = null }) {
    const notifications = [];
    const mentioner = await prisma.user.findUnique({
      where: { id: mentionedBy },
      select: { name: true }
    });

    for (const userId of mentionedUserIds) {
      if (userId === mentionedBy) continue;

      const notification = await this.create({
        userId,
        type: 'mention',
        title: 'You were mentioned',
        message: `${mentioner?.name || 'Someone'} mentioned you in a comment on "${todoTitle}"`,
        data: { todoId, commentId, mentionedBy, projectId },
        actionUrl: projectId ? `/projects/${projectId}/tasks?taskId=${todoId}` : `/todos?taskId=${todoId}`
      });

      notifications.push(notification);

      // Queue email notification
      await this.queueEmailNotification(userId, notification);
    }

    return notifications;
  }

  /**
   * Notify about task assignment
   */
  async notifyAssignment(userId, { todoId, todoTitle, assignedBy, projectId = null }) {
    const assigner = await prisma.user.findUnique({
      where: { id: assignedBy },
      select: { name: true }
    });

    const notification = await this.create({
      userId,
      type: 'task_assigned',
      title: 'Task Assigned',
      message: `${assigner?.name || 'Someone'} assigned you to "${todoTitle}"`,
      data: { todoId, assignedBy, projectId },
      actionUrl: projectId ? `/projects/${projectId}/tasks?taskId=${todoId}` : `/todos?taskId=${todoId}`
    });

    await this.queueEmailNotification(userId, notification);
    return notification;
  }

  /**
   * Notify about progress request
   */
  async notifyProgressRequest({ todoId, todoTitle, targetUserId, requestedBy, projectId = null, message = '' }) {
    const requester = await prisma.user.findUnique({
      where: { id: requestedBy },
      select: { name: true }
    });

    const notification = await this.create({
      userId: targetUserId,
      type: 'progress_request',
      title: 'Progress Update Requested',
      message: message || `${requester?.name || 'Someone'} is asking for a progress update on "${todoTitle}"`,
      data: { todoId, requestedBy, projectId },
      actionUrl: projectId ? `/projects/${projectId}/tasks?taskId=${todoId}` : `/todos?taskId=${todoId}`
    });

    await this.queueEmailNotification(targetUserId, notification);
    return notification;
  }

  /**
   * Notify about progress update
   */
  async notifyProgressUpdate({ todoId, todoTitle, targetUserIds, updatedBy, percentage, projectId = null }) {
    const updater = await prisma.user.findUnique({
      where: { id: updatedBy },
      select: { name: true }
    });

    const notifications = [];
    for (const userId of targetUserIds) {
      if (userId === updatedBy) continue;

      const notification = await this.create({
        userId,
        type: 'progress_update',
        title: 'Progress Updated',
        message: `${updater?.name || 'Someone'} updated progress to ${percentage}% on "${todoTitle}"`,
        data: { todoId, updatedBy, percentage, projectId },
        actionUrl: projectId ? `/projects/${projectId}/tasks?taskId=${todoId}` : `/todos?taskId=${todoId}`
      });

      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Notify about role change
   */
  async notifyRoleChange({ userId, projectId, projectName, oldRole, newRole, changedBy }) {
    const changer = await prisma.user.findUnique({
      where: { id: changedBy },
      select: { name: true }
    });

    const notification = await this.create({
      userId,
      type: 'role_changed',
      title: 'Role Updated',
      message: `Your role in "${projectName}" was changed from ${oldRole} to ${newRole} by ${changer?.name || 'an admin'}`,
      data: { projectId, oldRole, newRole, changedBy },
      actionUrl: `/projects/${projectId}`
    });

    await this.queueEmailNotification(userId, notification);
    return notification;
  }

  /**
   * Notify about member joining
   */
  async notifyMemberJoined({ projectId, projectName, newUserId, newUserName, existingMemberIds }) {
    const notifications = [];

    for (const userId of existingMemberIds) {
      if (userId === newUserId) continue;

      const notification = await this.create({
        userId,
        type: 'member_joined',
        title: 'New Team Member',
        message: `${newUserName} joined "${projectName}"`,
        data: { projectId, newUserId },
        actionUrl: `/projects/${projectId}/members`
      });

      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Notify about task completion
   */
  async notifyTaskCompleted({ todoId, todoTitle, completedBy, projectId = null, notifyUserIds = [] }) {
    const completer = await prisma.user.findUnique({
      where: { id: completedBy },
      select: { name: true }
    });

    const notifications = [];
    for (const userId of notifyUserIds) {
      if (userId === completedBy) continue;

      const notification = await this.create({
        userId,
        type: 'task_completed',
        title: 'Task Completed',
        message: `${completer?.name || 'Someone'} completed "${todoTitle}"`,
        data: { todoId, completedBy, projectId },
        actionUrl: projectId ? `/projects/${projectId}/tasks?taskId=${todoId}` : `/todos?taskId=${todoId}`
      });

      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Notify about approaching deadline
   */
  async notifyDeadlineApproaching({ todoId, todoTitle, userId, dueDate, daysRemaining, projectId = null }) {
    const notification = await this.create({
      userId,
      type: 'deadline_approaching',
      title: 'Deadline Approaching',
      message: `"${todoTitle}" is due in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`,
      data: { todoId, dueDate, daysRemaining, projectId },
      actionUrl: projectId ? `/projects/${projectId}/tasks?taskId=${todoId}` : `/todos?taskId=${todoId}`
    });

    await this.queueEmailNotification(userId, notification);
    return notification;
  }

  // ============================================
  // BULK NOTIFICATIONS
  // ============================================

  /**
   * Notify all project members
   */
  async notifyProjectMembers(projectId, notification, excludeUserId = null) {
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      select: { userId: true }
    });

    const notifications = [];
    for (const member of members) {
      if (member.userId === excludeUserId) continue;

      const created = await this.create({
        ...notification,
        userId: member.userId
      });
      notifications.push(created);
    }

    return notifications;
  }

  /**
   * Notify all team members
   */
  async notifyTeamMembers(teamId, notification, excludeUserId = null) {
    const members = await prisma.teamMember.findMany({
      where: { teamId },
      select: { userId: true }
    });

    const notifications = [];
    for (const member of members) {
      if (member.userId === excludeUserId) continue;

      const created = await this.create({
        ...notification,
        userId: member.userId
      });
      notifications.push(created);
    }

    return notifications;
  }

  // ============================================
  // EMAIL QUEUE MANAGEMENT
  // ============================================

  /**
   * Queue an email notification
   */
  async queueEmailNotification(userId, notification) {
    try {
      // Check user preferences (if they want email notifications)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: { select: { preferences: true } }
        }
      });

      // Skip if user has disabled email notifications
      const prefs = user?.profile?.preferences;
      if (prefs?.emailNotifications === false) return null;

      // Generate email content
      const { subject, body } = this.generateEmailContent(notification);

      const email = await prisma.emailQueue.create({
        data: {
          userId,
          templateId: notification.type,
          subject,
          body,
          metadata: {
            notificationId: notification.id,
            type: notification.type,
            data: notification.data
          },
          status: 'pending',
          scheduledAt: new Date()
        }
      });

      return email;
    } catch (error) {
      console.error('Failed to queue email:', error);
      return null;
    }
  }

  /**
   * Queue a custom email
   */
  async queueEmail({ userId, subject, body, templateId = 'custom', metadata = {}, scheduledAt = null }) {
    try {
      return await prisma.emailQueue.create({
        data: {
          userId,
          templateId,
          subject,
          body,
          metadata,
          status: 'pending',
          scheduledAt: scheduledAt || new Date()
        }
      });
    } catch (error) {
      console.error('Failed to queue email:', error);
      return null;
    }
  }

  /**
   * Process email queue (called by cron/worker)
   * @param {number} batchSize - Number of emails to process
   * @returns {Promise<Object>} Processing results
   */
  async processEmailQueue(batchSize = 10) {
    try {
      // Get pending emails
      const emails = await prisma.emailQueue.findMany({
        where: {
          status: 'pending',
          scheduledAt: { lte: new Date() },
          attempts: { lt: 3 }
        },
        take: batchSize,
        include: {
          user: { select: { email: true, name: true } }
        },
        orderBy: { scheduledAt: 'asc' }
      });

      const results = { sent: 0, failed: 0, errors: [] };

      for (const email of emails) {
        try {
          // Here you would integrate with your email provider
          // For now, we'll simulate sending
          const sent = await this.sendEmail(email);

          if (sent) {
            await prisma.emailQueue.update({
              where: { id: email.id },
              data: { status: 'sent', sentAt: new Date() }
            });
            results.sent++;
          } else {
            throw new Error('Email sending failed');
          }
        } catch (error) {
          await prisma.emailQueue.update({
            where: { id: email.id },
            data: {
              attempts: { increment: 1 },
              lastError: error.message,
              status: email.attempts >= 2 ? 'failed' : 'pending'
            }
          });
          results.failed++;
          results.errors.push({ emailId: email.id, error: error.message });
        }
      }

      return results;
    } catch (error) {
      console.error('Email queue processing failed:', error);
      return { sent: 0, failed: 0, errors: [error.message] };
    }
  }

  /**
   * Send an email (placeholder - integrate with email provider)
   */
  async sendEmail(email) {
    // TODO: Integrate with email provider (SendGrid, SES, etc.)
    console.log(`[EMAIL] To: ${email.user?.email}, Subject: ${email.subject}`);
    console.log(`[EMAIL] Body: ${email.body.substring(0, 100)}...`);

    // Simulate sending (replace with actual email service)
    return true;
  }

  /**
   * Get email queue status
   */
  async getEmailQueueStatus() {
    const [pending, sent, failed] = await Promise.all([
      prisma.emailQueue.count({ where: { status: 'pending' } }),
      prisma.emailQueue.count({ where: { status: 'sent' } }),
      prisma.emailQueue.count({ where: { status: 'failed' } })
    ]);

    return { pending, sent, failed, total: pending + sent + failed };
  }

  /**
   * Cancel a queued email
   */
  async cancelEmail(emailId) {
    try {
      await prisma.emailQueue.update({
        where: { id: emailId },
        data: { status: 'cancelled' }
      });
      return true;
    } catch {
      return false;
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Generate email content from notification
   */
  generateEmailContent(notification) {
    const templates = {
      mention: {
        subject: `You were mentioned: ${notification.title}`,
        body: `
          <h2>You were mentioned</h2>
          <p>${notification.message}</p>
          ${notification.actionUrl ? `<p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}${notification.actionUrl}">View Details</a></p>` : ''}
        `
      },
      task_assigned: {
        subject: `New Task Assigned: ${notification.data?.todoTitle || 'Task'}`,
        body: `
          <h2>New Task Assigned to You</h2>
          <p>${notification.message}</p>
          ${notification.actionUrl ? `<p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}${notification.actionUrl}">View Task</a></p>` : ''}
        `
      },
      progress_request: {
        subject: `Progress Update Requested`,
        body: `
          <h2>Progress Update Requested</h2>
          <p>${notification.message}</p>
          ${notification.actionUrl ? `<p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}${notification.actionUrl}">Update Progress</a></p>` : ''}
        `
      },
      deadline_approaching: {
        subject: `Deadline Approaching: ${notification.data?.todoTitle || 'Task'}`,
        body: `
          <h2>Deadline Reminder</h2>
          <p>${notification.message}</p>
          ${notification.actionUrl ? `<p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}${notification.actionUrl}">View Task</a></p>` : ''}
        `
      },
      default: {
        subject: notification.title,
        body: `
          <h2>${notification.title}</h2>
          <p>${notification.message}</p>
          ${notification.actionUrl ? `<p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}${notification.actionUrl}">View Details</a></p>` : ''}
        `
      }
    };

    const template = templates[notification.type] || templates.default;
    return {
      subject: template.subject,
      body: template.body
    };
  }

  /**
   * Transform notification from DB
   */
  transformNotification(notification) {
    if (!notification) return null;
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
      read: notification.read,
      readAt: notification.readAt,
      actionUrl: notification.actionUrl,
      createdAt: notification.createdAt
    };
  }
}

// Export singleton instance (without Supabase dependency)
const notificationService = new NotificationService();
export default notificationService;
