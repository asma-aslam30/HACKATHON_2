# Data Model: Todo App Intelligent Features

**Feature Branch**: `003-intelligent-features`
**Date**: 2025-12-27
**Storage**: JSON file (`phases/phase-1/data/tasks.json`)

## Entity Definitions

### Task (Extended)

The existing Task entity is extended with new fields for intelligent features. All new fields have sensible defaults for backward compatibility.

```javascript
{
  // ══════════════════════════════════════════════════════════════════════════
  // EXISTING FIELDS (Phase 1 & 2)
  // ══════════════════════════════════════════════════════════════════════════

  id: String,               // UUID v4, auto-generated
                            // Example: "550e8400-e29b-41d4-a716-446655440000"

  title: String,            // Required, 1-200 characters
                            // Example: "Buy groceries"

  description: String,      // Optional, 0-1000 characters
                            // Example: "Milk, eggs, bread"

  completed: Boolean,       // Default: false
                            // Example: false

  createdAt: String,        // ISO-8601 UTC timestamp, auto-generated
                            // Example: "2025-12-27T10:30:00.000Z"

  priority: String,         // Enum: "high" | "medium" | "low" | "none"
                            // Default: "none"

  tags: Array<String>,      // Array of tag names (predefined or custom)
                            // Example: ["work", "urgent"]

  sortOrder: Number,        // Timestamp-based ordering value
                            // Example: 1735298600000

  // ══════════════════════════════════════════════════════════════════════════
  // NEW FIELDS (Phase 3 - Intelligent Features)
  // ══════════════════════════════════════════════════════════════════════════

  dueDate: String | null,   // ISO-8601 UTC timestamp or null if not set
                            // Example: "2025-12-31T14:00:00.000Z"
                            // Default: null

  recurrencePattern: String, // Enum: "none" | "daily" | "weekly" | "monthly"
                             // Default: "none"
                             // Only meaningful when dueDate is set

  reminderOffset: Number,   // Minutes before dueDate to send notification
                            // Default: 15
                            // Range: 0-10080 (0 to 1 week)
                            // 0 = reminder at exact due time

  reminderEnabled: Boolean, // Whether reminders are enabled for this task
                            // Default: true (when dueDate is set)

  suggestionDismissed: Boolean // Whether smart suggestion was dismissed
                               // Default: false
                               // Set to true when user dismisses "Add due date?" prompt
}
```

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| title | Required, 1-200 chars | "Title is required (1-200 characters)" |
| description | Optional, max 1000 chars | "Description too long (max 1000 characters)" |
| dueDate | Valid ISO-8601 or null | "Invalid date format" |
| recurrencePattern | Must be valid enum | "Invalid recurrence pattern" |
| reminderOffset | Integer 0-10080 | "Reminder must be 0-10080 minutes" |

### State Transitions

```
Task Creation:
  [New] → completed=false, dueDate=null, recurrencePattern="none"

Setting Due Date:
  [Any] → dueDate=<ISO-8601>, reminderEnabled=true (if previously null)

Completing Regular Task:
  completed=false → completed=true

Completing Recurring Task:
  completed=false → {
    1. Mark current task: completed=true
    2. Create new task:
       - Copy all fields except: id, completed, createdAt, sortOrder
       - dueDate = calculateNextDueDate(original.dueDate, original.recurrencePattern)
       - completed = false
       - createdAt = now()
       - sortOrder = now()
       - id = new UUID
  }

Dismissing Suggestion:
  suggestionDismissed=false → suggestionDismissed=true
```

### Tag (Unchanged)

```javascript
{
  name: String,        // Tag name, lowercase, 1-30 chars
  color: String,       // Terminal color name (chalk colors)
  type: String         // "predefined" | "custom"
}
```

### Predefined Tags (Unchanged)

```javascript
[
  { name: "work", color: "cyan", type: "predefined" },
  { name: "home", color: "magenta", type: "predefined" },
  { name: "personal", color: "green", type: "predefined" }
]
```

## Storage Schema

### tasks.json Structure

```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Weekly team meeting",
      "description": "Discuss sprint progress",
      "completed": false,
      "createdAt": "2025-12-27T10:30:00.000Z",
      "priority": "high",
      "tags": ["work"],
      "sortOrder": 1735298600000,
      "dueDate": "2025-12-30T09:00:00.000Z",
      "recurrencePattern": "weekly",
      "reminderOffset": 15,
      "reminderEnabled": true,
      "suggestionDismissed": false
    }
  ],
  "customTags": [
    { "name": "urgent", "color": "red", "type": "custom" }
  ]
}
```

## Migration Strategy

### Backward Compatibility

Tasks created in Phase 1/2 will be automatically upgraded on load:

```javascript
function migrateTask(task) {
  return {
    ...task,
    dueDate: task.dueDate ?? null,
    recurrencePattern: task.recurrencePattern ?? "none",
    reminderOffset: task.reminderOffset ?? 15,
    reminderEnabled: task.reminderEnabled ?? (task.dueDate !== null),
    suggestionDismissed: task.suggestionDismissed ?? false
  };
}
```

### No Schema Version Field

Given the additive nature of changes and automatic defaulting, no explicit schema version is needed. Future migrations can detect legacy tasks by checking for missing fields.

## Recurrence Calculations

### Next Due Date Logic

```javascript
import { DateTime } from 'luxon';

function calculateNextDueDate(currentDueDate, pattern) {
  const dt = DateTime.fromISO(currentDueDate, { zone: 'utc' });

  switch (pattern) {
    case 'daily':
      return dt.plus({ days: 1 }).toISO();

    case 'weekly':
      return dt.plus({ weeks: 1 }).toISO();

    case 'monthly':
      // Luxon handles month-end automatically
      // Jan 31 + 1 month = Feb 28/29
      return dt.plus({ months: 1 }).toISO();

    default:
      return null;
  }
}
```

### Edge Case: Monthly on 31st

| Original Date | Next Date | Explanation |
|---------------|-----------|-------------|
| Jan 31 | Feb 28 (or 29) | Feb has no 31st, uses last day |
| Mar 31 | Apr 30 | April has no 31st, uses last day |
| May 31 | Jun 30 | June has no 31st, uses last day |
| Jul 31 | Aug 31 | Normal case |

## Indexes and Queries

### Common Query Patterns

Since data is stored in a JSON file and loaded into memory, no database indexes are needed. The following patterns should be efficient with in-memory array operations:

| Query | Implementation |
|-------|----------------|
| Tasks due today | `tasks.filter(t => isToday(t.dueDate))` |
| Overdue tasks | `tasks.filter(t => t.dueDate && isPast(t.dueDate) && !t.completed)` |
| Tasks due this week | `tasks.filter(t => isWithinWeek(t.dueDate))` |
| Sort by due date | `tasks.sort((a, b) => compareDates(a.dueDate, b.dueDate))` |
| Tasks needing reminder | `tasks.filter(t => shouldNotify(t))` |

### Performance Considerations

- With 1000+ tasks, filter/sort operations remain O(n)
- Date comparisons use ISO string comparison (lexicographic ordering works for UTC dates)
- Reminder checks run on app startup and after task mutations
