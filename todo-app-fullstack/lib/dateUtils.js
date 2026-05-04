/**
 * Date utilities for 003-intelligent-features
 * Handles overdue detection, countdowns, recurrence, and smart suggestions
 */

/**
 * Returns rich status info about a due date relative to now.
 * @param {string|Date|null} dueDate
 * @returns {{ isOverdue: boolean, isDueSoon: boolean, label: string, color: string } | null}
 */
export function getDueDateStatus(dueDate) {
  if (!dueDate) return null

  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due - now
  const diffMins = diffMs / 60000
  const diffHours = diffMs / 3600000
  const diffDays = diffMs / 86400000

  if (diffMs < 0) {
    // Overdue
    const elapsed = Math.abs(diffMs)
    const elapsedMins = elapsed / 60000
    const elapsedHours = elapsed / 3600000
    const elapsedDays = elapsed / 86400000

    let label
    if (elapsedMins < 60) {
      label = `${Math.floor(elapsedMins)}m overdue`
    } else if (elapsedHours < 24) {
      label = `${Math.floor(elapsedHours)}h overdue`
    } else if (elapsedDays < 7) {
      label = `${Math.floor(elapsedDays)}d overdue`
    } else {
      label = `${Math.floor(elapsedDays / 7)}w overdue`
    }

    return { isOverdue: true, isDueSoon: false, label, color: 'red' }
  }

  if (diffHours <= 24) {
    // Due soon
    let label
    if (diffMins < 60) {
      label = `Due in ${Math.floor(diffMins)}m`
    } else {
      label = `Due in ${Math.floor(diffHours)}h`
    }
    return { isOverdue: false, isDueSoon: true, label, color: 'orange' }
  }

  if (diffDays <= 3) {
    return {
      isOverdue: false,
      isDueSoon: false,
      label: `Due in ${Math.floor(diffDays)}d`,
      color: 'yellow',
    }
  }

  return {
    isOverdue: false,
    isDueSoon: false,
    label: new Date(dueDate).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric',
      year: new Date(dueDate).getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    }),
    color: 'gray',
  }
}

/**
 * Returns true if a due date is today (local time)
 */
export function isDueToday(dueDate) {
  if (!dueDate) return false
  const d = new Date(dueDate)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

/**
 * Returns true if a due date is within the current calendar week (Mon–Sun)
 */
export function isDueThisWeek(dueDate) {
  if (!dueDate) return false
  const d = new Date(dueDate)
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)
  return d >= startOfWeek && d < endOfWeek
}

/**
 * Calculates the next due date for a recurring task.
 * Handles month-end edge cases (e.g., Jan 31 → Feb 28/29).
 * @param {string|Date} currentDueDate
 * @param {'daily'|'weekly'|'monthly'} pattern
 * @returns {Date}
 */
export function calculateNextDueDate(currentDueDate, pattern) {
  const d = new Date(currentDueDate)
  switch (pattern) {
    case 'daily':
      d.setDate(d.getDate() + 1)
      break
    case 'weekly':
      d.setDate(d.getDate() + 7)
      break
    case 'monthly': {
      const originalDay = d.getDate()
      d.setMonth(d.getMonth() + 1)
      // If month rolled over (e.g., Jan 31 → Mar 2), clamp to last day of target month
      if (d.getDate() !== originalDay) {
        d.setDate(0) // last day of previous month
      }
      break
    }
    default:
      break
  }
  return d
}

/**
 * Analyzes task title for time-sensitive keywords and returns a suggestion.
 * @param {string} title
 * @returns {{ type: 'add_due_date', hint: string } | null}
 */
const URGENT_PATTERNS = [
  { re: /\btoday\b/i, hint: 'Today' },
  { re: /\btomorrow\b/i, hint: 'Tomorrow' },
  { re: /\bby\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, hint: 'This week' },
  { re: /\bdeadline\b/i, hint: 'Set a deadline' },
  { re: /\basap\b/i, hint: 'ASAP' },
  { re: /\burgent\b/i, hint: 'Urgent' },
  { re: /\bby\s+\w+\s+\d+/i, hint: 'Upcoming date mentioned' },
  { re: /\bdue\b/i, hint: 'Due date detected' },
  { re: /\bthis\s+week\b/i, hint: 'This week' },
]

export function analyzeTitleForSuggestion(title) {
  if (!title) return null
  for (const { re, hint } of URGENT_PATTERNS) {
    if (re.test(title)) {
      return { type: 'add_due_date', hint }
    }
  }
  return null
}

/**
 * Format milliseconds as "Xh Ym" or "Xm" for time tracking display
 */
export function formatDuration(ms) {
  if (!ms || ms <= 0) return '0m'
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
