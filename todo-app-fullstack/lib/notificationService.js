/**
 * Browser notification service for task reminders.
 * Schedules notifications based on reminderOffset (minutes before dueDate).
 */

const scheduledNotifications = new Map() // taskId -> timeoutId

export function requestPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return Promise.resolve('unsupported')
  if (Notification.permission === 'granted') return Promise.resolve('granted')
  if (Notification.permission === 'denied') return Promise.resolve('denied')
  return Notification.requestPermission()
}

export function scheduleNotification(task) {
  if (typeof window === 'undefined' || !task.dueDate || !task.reminderEnabled || task.completed) return

  cancelNotification(task.id)

  const offset = (task.reminderOffset || 15) * 60 * 1000
  const fireAt = new Date(task.dueDate).getTime() - offset
  const delay = fireAt - Date.now()

  if (delay <= 0) return // already past reminder time

  const timeoutId = setTimeout(() => {
    if (Notification.permission === 'granted') {
      const n = new Notification(`⏰ Reminder: ${task.title}`, {
        body: `Due ${new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        icon: '/favicon.ico',
        tag: task.id,
      })
      n.onclick = () => { window.focus(); n.close() }
    }
    scheduledNotifications.delete(task.id)
  }, delay)

  scheduledNotifications.set(task.id, timeoutId)
}

export function cancelNotification(taskId) {
  const t = scheduledNotifications.get(taskId)
  if (t) { clearTimeout(t); scheduledNotifications.delete(taskId) }
}

export function initNotifications(tasks) {
  if (typeof window === 'undefined') return
  requestPermission().then(permission => {
    if (permission !== 'granted') return
    tasks.forEach(task => scheduleNotification(task))
  })
}

export function rescheduleNotification(task) {
  cancelNotification(task.id)
  if (task.reminderEnabled && task.dueDate && !task.completed) {
    scheduleNotification(task)
  }
}
