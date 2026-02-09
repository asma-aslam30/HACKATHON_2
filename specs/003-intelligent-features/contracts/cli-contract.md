# CLI Service Contracts: Todo App Intelligent Features

**Feature Branch**: `003-intelligent-features`
**Date**: 2025-12-27

This document defines the internal service APIs for the intelligent features. Since this is a CLI application, these are JavaScript module interfaces, not HTTP APIs.

---

## dateService.js

### Module Purpose

Provides date/time utilities using Luxon for parsing, formatting, and relative time calculations.

### Exports

```javascript
/**
 * Parse a date string into a Luxon DateTime
 * @param {string} input - User input (various formats accepted)
 * @returns {DateTime|null} - Luxon DateTime or null if invalid
 */
export function parseDate(input: string): DateTime | null;

/**
 * Format a date for display
 * @param {string} isoDate - ISO-8601 date string
 * @param {string} format - 'short' | 'long' | 'relative'
 * @returns {string} - Formatted date string
 *
 * Examples:
 *   formatDate('2025-12-31T14:00:00Z', 'short')    → "Dec 31, 2:00 PM"
 *   formatDate('2025-12-31T14:00:00Z', 'long')     → "December 31, 2025 at 2:00 PM"
 *   formatDate('2025-12-31T14:00:00Z', 'relative') → "in 4 days"
 */
export function formatDate(isoDate: string, format: string): string;

/**
 * Get relative time description
 * @param {string} isoDate - ISO-8601 date string
 * @returns {object} - { text: string, isOverdue: boolean, isDueSoon: boolean }
 *
 * Examples:
 *   getRelativeTime(pastDate)   → { text: "2 days overdue", isOverdue: true, isDueSoon: false }
 *   getRelativeTime(soonDate)   → { text: "Due in 3h 45m", isOverdue: false, isDueSoon: true }
 *   getRelativeTime(futureDate) → { text: "Due in 5 days", isOverdue: false, isDueSoon: false }
 */
export function getRelativeTime(isoDate: string): RelativeTimeResult;

/**
 * Calculate next due date for recurring task
 * @param {string} currentDueDate - Current due date (ISO-8601)
 * @param {string} pattern - 'daily' | 'weekly' | 'monthly'
 * @returns {string} - Next due date (ISO-8601)
 */
export function calculateNextDueDate(currentDueDate: string, pattern: string): string;

/**
 * Check if date is today
 * @param {string} isoDate - ISO-8601 date string
 * @returns {boolean}
 */
export function isToday(isoDate: string): boolean;

/**
 * Check if date is within the next 7 days
 * @param {string} isoDate - ISO-8601 date string
 * @returns {boolean}
 */
export function isWithinWeek(isoDate: string): boolean;

/**
 * Check if date is in the past
 * @param {string} isoDate - ISO-8601 date string
 * @returns {boolean}
 */
export function isPast(isoDate: string): boolean;

/**
 * Check if date is within next 24 hours
 * @param {string} isoDate - ISO-8601 date string
 * @returns {boolean}
 */
export function isDueSoon(isoDate: string): boolean;

/**
 * Convert local date input to UTC ISO string
 * @param {Date} localDate - Local date from date picker
 * @returns {string} - UTC ISO-8601 string
 */
export function toUTCString(localDate: Date): string;
```

### Types

```typescript
interface RelativeTimeResult {
  text: string;        // Human-readable text (e.g., "2 days overdue")
  isOverdue: boolean;  // true if past due date
  isDueSoon: boolean;  // true if within 24 hours
}
```

---

## notificationService.js

### Module Purpose

Manages desktop notification scheduling and delivery using node-notifier.

### Exports

```javascript
/**
 * Initialize notification service
 * Called on app startup to schedule notifications for all tasks
 * @param {Array<Task>} tasks - All tasks from storage
 * @returns {void}
 */
export function initNotifications(tasks: Task[]): void;

/**
 * Schedule a notification for a task
 * @param {Task} task - Task with dueDate and reminderOffset
 * @returns {string|null} - Notification ID or null if not scheduled
 */
export function scheduleNotification(task: Task): string | null;

/**
 * Cancel a scheduled notification
 * @param {string} taskId - Task ID whose notification to cancel
 * @returns {boolean} - true if cancelled, false if not found
 */
export function cancelNotification(taskId: string): boolean;

/**
 * Reschedule notification after task update
 * @param {Task} task - Updated task
 * @returns {string|null} - New notification ID or null
 */
export function rescheduleNotification(task: Task): string | null;

/**
 * Check if notifications are available on this system
 * @returns {Promise<boolean>}
 */
export async function checkNotificationSupport(): Promise<boolean>;

/**
 * Send an immediate notification (for testing)
 * @param {string} title - Notification title
 * @param {string} message - Notification body
 * @returns {Promise<boolean>} - true if sent successfully
 */
export async function sendNotification(title: string, message: string): Promise<boolean>;

/**
 * Get all pending notification IDs
 * @returns {Array<string>} - Array of task IDs with pending notifications
 */
export function getPendingNotifications(): string[];
```

### Notification Payload

```javascript
{
  title: "Task Reminder",
  message: "<task title>",
  subtitle: "Due in 15 minutes",  // or "Due now"
  sound: true,
  wait: false
}
```

### Scheduling Logic

1. On `initNotifications(tasks)`:
   - Filter tasks where `dueDate` is set, `reminderEnabled` is true, not completed
   - For each, calculate `notifyAt = dueDate - reminderOffset minutes`
   - If `notifyAt` is in the future, schedule with `setTimeout`
   - Store timeout IDs in internal Map keyed by task ID

2. On `scheduleNotification(task)`:
   - Cancel any existing notification for task
   - Calculate new `notifyAt`
   - Schedule if in future

3. On notification trigger:
   - Send desktop notification via node-notifier
   - Remove from pending Map
   - Log to console if notification fails

---

## suggestionService.js

### Module Purpose

Detects time-sensitive keywords in task titles and suggests adding due dates.

### Exports

```javascript
/**
 * Analyze task title for time-sensitive keywords
 * @param {string} title - Task title
 * @returns {SuggestionResult|null} - Suggestion or null if no match
 */
export function analyzeTitleForDateSuggestion(title: string): SuggestionResult | null;

/**
 * Get suggested date from matched keyword
 * @param {string} keyword - Matched keyword (e.g., "tomorrow", "Friday")
 * @returns {string|null} - Suggested ISO date or null
 */
export function getSuggestedDate(keyword: string): string | null;
```

### Types

```typescript
interface SuggestionResult {
  type: 'add_due_date';
  keyword: string;          // The matched keyword (e.g., "Friday", "tomorrow")
  suggestedDate: string | null;  // ISO date if parseable, null if ambiguous
  message: string;          // User-facing message
}
```

### Keyword Patterns

```javascript
const patterns = [
  // Exact day references
  { regex: /\b(today|tonight)\b/i, days: 0 },
  { regex: /\b(tomorrow)\b/i, days: 1 },

  // Day of week
  { regex: /\b(monday)\b/i, dayOfWeek: 1 },
  { regex: /\b(tuesday)\b/i, dayOfWeek: 2 },
  { regex: /\b(wednesday)\b/i, dayOfWeek: 3 },
  { regex: /\b(thursday)\b/i, dayOfWeek: 4 },
  { regex: /\b(friday)\b/i, dayOfWeek: 5 },
  { regex: /\b(saturday)\b/i, dayOfWeek: 6 },
  { regex: /\b(sunday)\b/i, dayOfWeek: 7 },

  // Relative time
  { regex: /\bnext\s+week\b/i, weeks: 1 },
  { regex: /\bnext\s+month\b/i, months: 1 },

  // Deadline keywords (no specific date, just suggest)
  { regex: /\b(by|due|deadline|before|until)\s+/i, generic: true }
];
```

### Example Usage

```javascript
analyzeTitleForDateSuggestion("Submit report by Friday");
// Returns:
// {
//   type: 'add_due_date',
//   keyword: 'Friday',
//   suggestedDate: '2025-01-03T17:00:00.000Z',  // Next Friday at 5 PM
//   message: 'This task mentions "Friday". Add a due date?'
// }

analyzeTitleForDateSuggestion("Buy groceries");
// Returns: null (no time-sensitive keywords)
```

---

## taskService.js (Extended)

### New Methods

```javascript
/**
 * Set due date on a task
 * @param {string} taskId - Task ID
 * @param {string|null} dueDate - ISO-8601 date or null to clear
 * @param {string} recurrencePattern - 'none' | 'daily' | 'weekly' | 'monthly'
 * @returns {Task} - Updated task
 */
export function setDueDate(taskId, dueDate, recurrencePattern = 'none');

/**
 * Set reminder settings for a task
 * @param {string} taskId - Task ID
 * @param {number} reminderOffset - Minutes before due date
 * @param {boolean} reminderEnabled - Whether to enable reminders
 * @returns {Task} - Updated task
 */
export function setReminder(taskId, reminderOffset, reminderEnabled);

/**
 * Complete a task (extended for recurring tasks)
 * @param {string} taskId - Task ID
 * @returns {{ completedTask: Task, newTask: Task|null }}
 *   - completedTask: The task that was marked complete
 *   - newTask: New recurring instance or null if not recurring
 */
export function completeTask(taskId);

/**
 * Dismiss smart suggestion for a task
 * @param {string} taskId - Task ID
 * @returns {Task} - Updated task
 */
export function dismissSuggestion(taskId);

/**
 * Filter tasks by date criteria
 * @param {string} filter - 'due_today' | 'due_this_week' | 'overdue' | 'no_due_date'
 * @returns {Array<Task>} - Filtered tasks
 */
export function filterByDate(filter);

/**
 * Sort tasks by due date
 * @param {Array<Task>} tasks - Tasks to sort
 * @param {string} direction - 'asc' | 'desc'
 * @returns {Array<Task>} - Sorted tasks (null dates at end)
 */
export function sortByDueDate(tasks, direction = 'asc');
```

---

## prompts.js (Extended)

### New Prompts

```javascript
/**
 * Prompt for due date input
 * @returns {Promise<{ dueDate: string|null, recurrencePattern: string }>}
 */
export async function promptDueDate();

/**
 * Prompt for reminder configuration
 * @returns {Promise<{ reminderOffset: number, reminderEnabled: boolean }>}
 */
export async function promptReminder();

/**
 * Prompt for date filter selection
 * @returns {Promise<string>} - 'all' | 'due_today' | 'due_this_week' | 'overdue' | 'no_due_date'
 */
export async function promptDateFilter();

/**
 * Prompt for smart suggestion response
 * @param {SuggestionResult} suggestion - The suggestion to present
 * @returns {Promise<'accept' | 'dismiss'>}
 */
export async function promptSuggestionResponse(suggestion);
```

---

## display.js (Extended)

### New Display Functions

```javascript
/**
 * Format task with due date and urgency styling
 * @param {Task} task - Task to format
 * @returns {string} - Formatted task string with colors
 *
 * Examples:
 *   "● [HIGH] Buy groceries        Due in 3h 45m   🔁 weekly"
 *   "● [HIGH] Submit report        2 days overdue  ⚠️"
 *   "○ [NONE] Read book            Dec 31, 2:00 PM"
 */
export function formatTaskWithDueDate(task);

/**
 * Display overdue warning banner
 * @param {number} overdueCount - Number of overdue tasks
 */
export function showOverdueBanner(overdueCount);

/**
 * Display upcoming reminders summary
 * @param {Array<Task>} upcomingTasks - Tasks due within 24h
 */
export function showUpcomingReminders(upcomingTasks);
```

### Color Scheme

| State | Color | Symbol |
|-------|-------|--------|
| Overdue | `chalk.red.bold` | ⚠️ |
| Due within 1 hour | `chalk.red` | - |
| Due within 24 hours | `chalk.yellow` | - |
| Due later | `chalk.gray` | - |
| No due date | Normal | - |
| Recurring | `chalk.blue` | 🔁 |
