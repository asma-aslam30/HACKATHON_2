import { DateTime } from 'luxon';

/**
 * Suggestion Service - Smart suggestion pattern matching
 * Phase 8 US6: Smart Suggestions
 * Detects time-sensitive keywords in task titles and suggests adding due dates
 */

/**
 * T049: Keyword patterns for detecting time-sensitive content
 */
const patterns = [
  // Exact day references
  { regex: /\b(today|tonight)\b/i, days: 0, keyword: 'today' },
  { regex: /\b(tomorrow)\b/i, days: 1, keyword: 'tomorrow' },

  // Day of week
  { regex: /\b(monday)\b/i, dayOfWeek: 1, keyword: 'Monday' },
  { regex: /\b(tuesday)\b/i, dayOfWeek: 2, keyword: 'Tuesday' },
  { regex: /\b(wednesday)\b/i, dayOfWeek: 3, keyword: 'Wednesday' },
  { regex: /\b(thursday)\b/i, dayOfWeek: 4, keyword: 'Thursday' },
  { regex: /\b(friday)\b/i, dayOfWeek: 5, keyword: 'Friday' },
  { regex: /\b(saturday)\b/i, dayOfWeek: 6, keyword: 'Saturday' },
  { regex: /\b(sunday)\b/i, dayOfWeek: 7, keyword: 'Sunday' },

  // Relative time
  { regex: /\bnext\s+week\b/i, weeks: 1, keyword: 'next week' },
  { regex: /\bnext\s+month\b/i, months: 1, keyword: 'next month' },
  { regex: /\bthis\s+weekend\b/i, weekend: true, keyword: 'this weekend' },
  { regex: /\bend\s+of\s+(the\s+)?week\b/i, endOfWeek: true, keyword: 'end of week' },
  { regex: /\bend\s+of\s+(the\s+)?month\b/i, endOfMonth: true, keyword: 'end of month' },

  // Urgency keywords (suggest but no specific date)
  { regex: /\b(asap|urgent|immediately|right\s+away)\b/i, urgent: true, keyword: 'ASAP' },

  // Deadline keywords (generic suggestion)
  { regex: /\b(by|due|deadline|before|until)\s+\w+/i, generic: true, keyword: 'deadline' }
];

/**
 * T051: Get suggested date from pattern match
 * @param {Object} pattern - Matched pattern object
 * @returns {string|null} - Suggested ISO date or null
 */
export function getSuggestedDate(pattern) {
  const now = DateTime.local();

  // Handle exact day offsets
  if (pattern.days !== undefined) {
    return now.plus({ days: pattern.days }).endOf('day').toISO();
  }

  // Handle day of week (next occurrence)
  if (pattern.dayOfWeek !== undefined) {
    let target = now.set({ weekday: pattern.dayOfWeek });
    // If the day has already passed this week, get next week
    if (target <= now) {
      target = target.plus({ weeks: 1 });
    }
    return target.endOf('day').toISO();
  }

  // Handle relative weeks
  if (pattern.weeks !== undefined) {
    return now.plus({ weeks: pattern.weeks }).endOf('day').toISO();
  }

  // Handle relative months
  if (pattern.months !== undefined) {
    return now.plus({ months: pattern.months }).endOf('day').toISO();
  }

  // Handle this weekend (Saturday)
  if (pattern.weekend) {
    let saturday = now.set({ weekday: 6 });
    if (saturday <= now) {
      saturday = saturday.plus({ weeks: 1 });
    }
    return saturday.endOf('day').toISO();
  }

  // Handle end of week (Friday)
  if (pattern.endOfWeek) {
    let friday = now.set({ weekday: 5 });
    if (friday <= now) {
      friday = friday.plus({ weeks: 1 });
    }
    return friday.endOf('day').toISO();
  }

  // Handle end of month
  if (pattern.endOfMonth) {
    return now.endOf('month').toISO();
  }

  // Handle urgent (suggest today)
  if (pattern.urgent) {
    return now.endOf('day').toISO();
  }

  // Generic or unknown - return null (user chooses date)
  return null;
}

/**
 * T050: Analyze task title for time-sensitive keywords
 * @param {string} title - Task title
 * @returns {{type: string, keyword: string, suggestedDate: string|null, message: string}|null}
 */
export function analyzeTitleForDateSuggestion(title) {
  if (!title || typeof title !== 'string') {
    return null;
  }

  for (const pattern of patterns) {
    const match = title.match(pattern.regex);
    if (match) {
      const suggestedDate = getSuggestedDate(pattern);
      const keyword = pattern.keyword || match[1];

      let message;
      let type;

      if (pattern.urgent) {
        type = 'urgent';
        message = `This task seems urgent. Would you like to set it due today?`;
      } else if (pattern.generic) {
        type = 'generic';
        message = `This task mentions a deadline. Would you like to set a due date?`;
      } else if (suggestedDate) {
        type = 'specific';
        const formatted = DateTime.fromISO(suggestedDate).toLocaleString(DateTime.DATE_MED);
        message = `I noticed "${keyword}" in your task. Set due date to ${formatted}?`;
      } else {
        type = 'generic';
        message = `This task mentions "${keyword}". Would you like to set a due date?`;
      }

      return {
        type,
        keyword,
        suggestedDate,
        message
      };
    }
  }

  return null;
}

/**
 * Check if a task should show suggestions
 * @param {Object} task - Task object
 * @returns {boolean}
 */
export function shouldShowSuggestion(task) {
  // Don't show if task already has a due date
  if (task.dueDate) {
    return false;
  }

  // Don't show if suggestion was dismissed
  if (task.suggestionDismissed) {
    return false;
  }

  // Check if title has suggestible keywords
  const suggestion = analyzeTitleForDateSuggestion(task.title);
  return suggestion !== null;
}

export { patterns };
