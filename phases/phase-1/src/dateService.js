import { DateTime } from 'luxon';

/**
 * Date Service - Date/time utilities using Luxon
 * Provides parsing, formatting, relative time, and recurrence calculations
 */

/**
 * T005: Parse a date string into a Luxon DateTime
 * Accepts formats: YYYY-MM-DD, YYYY-MM-DD HH:MM, ISO-8601
 * @param {string} input - User input date string
 * @returns {DateTime|null} - Luxon DateTime or null if invalid
 */
export function parseDate(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();

  // Try ISO format first
  let dt = DateTime.fromISO(trimmed);
  if (dt.isValid) {
    return dt;
  }

  // Try YYYY-MM-DD HH:MM format
  dt = DateTime.fromFormat(trimmed, 'yyyy-MM-dd HH:mm');
  if (dt.isValid) {
    return dt;
  }

  // Try YYYY-MM-DD format (set time to noon local)
  dt = DateTime.fromFormat(trimmed, 'yyyy-MM-dd');
  if (dt.isValid) {
    return dt.set({ hour: 12, minute: 0 });
  }

  return null;
}

/**
 * T006: Format a date for display
 * @param {string} isoDate - ISO-8601 date string
 * @param {string} format - 'short' | 'long' | 'relative'
 * @returns {string} - Formatted date string
 */
export function formatDate(isoDate, format = 'short') {
  if (!isoDate) {
    return '';
  }

  const dt = DateTime.fromISO(isoDate);
  if (!dt.isValid) {
    return '';
  }

  // Convert to local time for display
  const local = dt.toLocal();

  switch (format) {
    case 'short':
      // "Dec 31, 2:00 PM"
      return local.toFormat('LLL d, h:mm a');
    case 'long':
      // "December 31, 2025 at 2:00 PM"
      return local.toFormat("LLLL d, yyyy 'at' h:mm a");
    case 'relative':
      // "in 4 days" or "3 hours ago"
      return local.toRelative() || '';
    default:
      return local.toFormat('LLL d, h:mm a');
  }
}

/**
 * T007: Get relative time description
 * @param {string} isoDate - ISO-8601 date string
 * @returns {{text: string, isOverdue: boolean, isDueSoon: boolean}}
 */
export function getRelativeTime(isoDate) {
  if (!isoDate) {
    return { text: '', isOverdue: false, isDueSoon: false };
  }

  const dt = DateTime.fromISO(isoDate);
  if (!dt.isValid) {
    return { text: '', isOverdue: false, isDueSoon: false };
  }

  const now = DateTime.now();
  const diff = dt.diff(now, ['days', 'hours', 'minutes']);
  const totalMinutes = diff.as('minutes');
  const totalHours = diff.as('hours');
  const totalDays = diff.as('days');

  const isOverdue = totalMinutes < 0;
  const isDueSoon = !isOverdue && totalHours <= 24;

  let text = '';

  if (isOverdue) {
    // Overdue
    const absDays = Math.abs(totalDays);
    const absHours = Math.abs(totalHours);
    const absMinutes = Math.abs(totalMinutes);

    if (absDays >= 1) {
      const days = Math.floor(absDays);
      text = `${days} day${days !== 1 ? 's' : ''} overdue`;
    } else if (absHours >= 1) {
      const hours = Math.floor(absHours);
      text = `${hours}h overdue`;
    } else {
      const minutes = Math.floor(absMinutes);
      text = `${minutes}m overdue`;
    }
  } else if (isDueSoon) {
    // Due within 24 hours
    if (totalHours < 1) {
      const minutes = Math.floor(totalMinutes);
      text = `Due in ${minutes}m`;
    } else {
      const hours = Math.floor(totalHours);
      const remainingMinutes = Math.floor(totalMinutes % 60);
      if (remainingMinutes > 0) {
        text = `Due in ${hours}h ${remainingMinutes}m`;
      } else {
        text = `Due in ${hours}h`;
      }
    }
  } else {
    // Due later
    if (totalDays < 7) {
      const days = Math.floor(totalDays);
      text = `Due in ${days} day${days !== 1 ? 's' : ''}`;
    } else {
      // Just show the formatted date for longer timeframes
      text = formatDate(isoDate, 'short');
    }
  }

  return { text, isOverdue, isDueSoon };
}

/**
 * T031/T036: Calculate next due date for recurring task
 * Handles monthly edge case (31st rolling to shorter month)
 * @param {string} currentDueDate - Current due date (ISO-8601)
 * @param {string} pattern - 'daily' | 'weekly' | 'monthly'
 * @returns {string|null} - Next due date (ISO-8601) or null
 */
export function calculateNextDueDate(currentDueDate, pattern) {
  if (!currentDueDate || !pattern || pattern === 'none') {
    return null;
  }

  const dt = DateTime.fromISO(currentDueDate, { zone: 'utc' });
  if (!dt.isValid) {
    return null;
  }

  let nextDt;

  switch (pattern) {
    case 'daily':
      nextDt = dt.plus({ days: 1 });
      break;
    case 'weekly':
      nextDt = dt.plus({ weeks: 1 });
      break;
    case 'monthly':
      // Luxon handles month-end automatically
      // Jan 31 + 1 month = Feb 28/29
      nextDt = dt.plus({ months: 1 });
      break;
    default:
      return null;
  }

  return nextDt.toISO();
}

/**
 * T008: Check if date is today
 * @param {string} isoDate - ISO-8601 date string
 * @returns {boolean}
 */
export function isToday(isoDate) {
  if (!isoDate) {
    return false;
  }

  const dt = DateTime.fromISO(isoDate);
  if (!dt.isValid) {
    return false;
  }

  const now = DateTime.now();
  return dt.hasSame(now, 'day');
}

/**
 * T008: Check if date is within the next 7 days
 * @param {string} isoDate - ISO-8601 date string
 * @returns {boolean}
 */
export function isWithinWeek(isoDate) {
  if (!isoDate) {
    return false;
  }

  const dt = DateTime.fromISO(isoDate);
  if (!dt.isValid) {
    return false;
  }

  const now = DateTime.now();
  const diff = dt.diff(now, 'days').days;

  // Within 7 days from now (future only)
  return diff >= 0 && diff <= 7;
}

/**
 * T008: Check if date is in the past
 * @param {string} isoDate - ISO-8601 date string
 * @returns {boolean}
 */
export function isPast(isoDate) {
  if (!isoDate) {
    return false;
  }

  const dt = DateTime.fromISO(isoDate);
  if (!dt.isValid) {
    return false;
  }

  return dt < DateTime.now();
}

/**
 * T008: Check if date is within next 24 hours
 * @param {string} isoDate - ISO-8601 date string
 * @returns {boolean}
 */
export function isDueSoon(isoDate) {
  if (!isoDate) {
    return false;
  }

  const dt = DateTime.fromISO(isoDate);
  if (!dt.isValid) {
    return false;
  }

  const now = DateTime.now();
  const diff = dt.diff(now, 'hours').hours;

  // Within 24 hours and not past
  return diff >= 0 && diff <= 24;
}

/**
 * T009: Convert local date input to UTC ISO string
 * @param {Date|string} localDate - Local date from date picker or string
 * @returns {string} - UTC ISO-8601 string
 */
export function toUTCString(localDate) {
  if (!localDate) {
    return '';
  }

  let dt;

  if (localDate instanceof Date) {
    dt = DateTime.fromJSDate(localDate);
  } else if (typeof localDate === 'string') {
    dt = parseDate(localDate);
  } else {
    return '';
  }

  if (!dt || !dt.isValid) {
    return '';
  }

  return dt.toUTC().toISO();
}
