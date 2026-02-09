import notifier from 'node-notifier';

/**
 * Notification Service - Desktop notification scheduling using node-notifier
 * Phase 7 US5: Desktop Notifications
 */

// Internal map of scheduled notification timeouts keyed by task ID
const pendingNotifications = new Map();

// Track if notifications are supported (set during checkNotificationSupport)
let notificationsSupported = null;

/**
 * T037: Check if notifications are available on this system
 * @returns {Promise<boolean>}
 */
export async function checkNotificationSupport() {
  return new Promise((resolve) => {
    try {
      // node-notifier doesn't have a direct "isSupported" check,
      // but we can detect it by checking if the notifier exists
      // and sending a silent test notification
      if (!notifier || typeof notifier.notify !== 'function') {
        notificationsSupported = false;
        resolve(false);
        return;
      }

      // On most systems, node-notifier will work
      // We mark as supported optimistically
      notificationsSupported = true;
      resolve(true);
    } catch (error) {
      notificationsSupported = false;
      resolve(false);
    }
  });
}

/**
 * T038: Send an immediate notification
 * @param {string} title - Notification title
 * @param {string} message - Notification body
 * @returns {Promise<boolean>} - true if sent successfully
 */
export async function sendNotification(title, message) {
  return new Promise((resolve) => {
    try {
      // T048: Check support first
      if (notificationsSupported === false) {
        console.log(`[Reminder] ${title}: ${message}`);
        resolve(false);
        return;
      }

      notifier.notify(
        {
          title: title || 'Todo App Reminder',
          message: message || 'You have a task due soon!',
          sound: true,
          wait: false,
          timeout: 10
        },
        (err, response) => {
          if (err) {
            // T048: Graceful fallback - log to console
            console.log(`[Reminder] ${title}: ${message}`);
            resolve(false);
          } else {
            resolve(true);
          }
        }
      );
    } catch (error) {
      // T048: Graceful fallback
      console.log(`[Reminder] ${title}: ${message}`);
      resolve(false);
    }
  });
}

/**
 * T039: Schedule a notification for a task
 * Uses setTimeout to trigger notification at (dueDate - reminderOffset minutes)
 * @param {Object} task - Task with dueDate, reminderOffset, reminderEnabled
 * @returns {string|null} - Task ID if scheduled, null if not scheduled
 */
export function scheduleNotification(task) {
  // Don't schedule if:
  // - No due date
  // - Reminders disabled
  // - Task already completed
  // - Notification support not confirmed
  if (!task.dueDate || !task.reminderEnabled || task.completed) {
    return null;
  }

  // Cancel any existing notification for this task
  cancelNotification(task.id);

  // Calculate when to show notification
  const dueDate = new Date(task.dueDate);
  const reminderOffset = task.reminderOffset || 15; // Default 15 minutes
  const notifyAt = new Date(dueDate.getTime() - reminderOffset * 60 * 1000);
  const now = new Date();
  const delay = notifyAt.getTime() - now.getTime();

  // Don't schedule if the notification time has already passed
  if (delay <= 0) {
    // If due date is in the future but reminder time passed, we could still notify
    // But for simplicity, we skip notifications whose reminder time has passed
    return null;
  }

  // Don't schedule notifications more than 24 hours in advance
  // (to avoid memory buildup for far-future tasks)
  const MAX_SCHEDULE_MS = 24 * 60 * 60 * 1000;
  if (delay > MAX_SCHEDULE_MS) {
    return null;
  }

  // Schedule the notification
  const timeoutId = setTimeout(async () => {
    await sendNotification(
      '📋 Task Reminder',
      `"${task.title}" is due in ${reminderOffset} minutes!`
    );
    // Remove from pending after sending
    pendingNotifications.delete(task.id);
  }, delay);

  // Store the timeout reference
  pendingNotifications.set(task.id, {
    timeoutId,
    scheduledFor: notifyAt.toISOString(),
    taskTitle: task.title
  });

  return task.id;
}

/**
 * T040: Cancel a scheduled notification
 * @param {string} taskId - Task ID whose notification to cancel
 * @returns {boolean} - true if cancelled, false if not found
 */
export function cancelNotification(taskId) {
  const notification = pendingNotifications.get(taskId);

  if (!notification) {
    return false;
  }

  clearTimeout(notification.timeoutId);
  pendingNotifications.delete(taskId);
  return true;
}

/**
 * T041: Reschedule notification after task update
 * Cancels existing notification and schedules a new one if applicable
 * @param {Object} task - Updated task
 * @returns {string|null} - Task ID if rescheduled, null if not
 */
export function rescheduleNotification(task) {
  // Cancel existing
  cancelNotification(task.id);

  // Schedule new one if applicable
  return scheduleNotification(task);
}

/**
 * T042: Initialize notification service on app startup
 * Schedules notifications for all tasks with due dates within 24h
 * @param {Array} tasks - All tasks from storage
 * @returns {number} - Number of notifications scheduled
 */
export function initNotifications(tasks) {
  if (!tasks || !Array.isArray(tasks)) {
    return 0;
  }

  let scheduled = 0;

  for (const task of tasks) {
    // Only schedule for incomplete tasks with due dates and reminders enabled
    if (task.dueDate && task.reminderEnabled && !task.completed) {
      const result = scheduleNotification(task);
      if (result) {
        scheduled++;
      }
    }
  }

  return scheduled;
}

/**
 * T043: Get all pending notification IDs
 * @returns {Array<{taskId: string, scheduledFor: string, taskTitle: string}>}
 */
export function getPendingNotifications() {
  const pending = [];

  for (const [taskId, info] of pendingNotifications.entries()) {
    pending.push({
      taskId,
      scheduledFor: info.scheduledFor,
      taskTitle: info.taskTitle
    });
  }

  return pending;
}

/**
 * Cancel all pending notifications (cleanup)
 * Useful for graceful shutdown
 */
export function cancelAllNotifications() {
  for (const [taskId] of pendingNotifications.entries()) {
    cancelNotification(taskId);
  }
}
