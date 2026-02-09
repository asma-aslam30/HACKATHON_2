# Todo App CLI - Phase 1 MVP

A command-line todo application with essential CRUD operations, colored output, and file persistence. Now with organization and intelligent features!

## Features

### Core Features (Phase 1)
- Add tasks with title and description
- List all tasks with colored completion status
- Toggle task completion (done/pending)
- Delete tasks
- Update task title and description
- Persistent storage in JSON file

### Organization Features (Phase 2)
- **Priority Levels**: High (red), Medium (yellow), Low (blue), None
- **Tags**: Predefined (work/home/personal) + custom tags with colored chips
- **Search**: Case-insensitive keyword search in title and description
- **Filter**: By status (pending/completed), priority, or tag
- **Sort**: By priority, alphabetical, date created, or status
- **Manual Reorder**: Move tasks up/down or to specific position

### Intelligent Features (Phase 3)
- **Due Dates**: Set due date and time on any task
- **Recurring Tasks**: Daily, weekly, or monthly recurrence with auto-reschedule
- **Overdue Highlighting**: Red highlighting for overdue tasks with countdown display
- **Due Soon Alerts**: Yellow highlighting for tasks due within 24 hours
- **Date Filtering**: Filter by due today, due this week, overdue, or no due date
- **Date Sorting**: Sort tasks by due date (soonest first)
- **Desktop Notifications**: Get notified before tasks are due (configurable offset)
- **Smart Suggestions**: Automatic due date suggestions based on task title keywords

## Installation

```bash
cd phases/phase-1
npm install
```

## Usage

```bash
npm start
# or
node src/index.js
```

## Menu Options

```
1. Add Task         - Create a new task with priority, tags, and due date
2. List Tasks       - View all tasks with status, priority, tags, and due dates
3. Toggle Complete  - Mark task done/undone (recurring tasks auto-reschedule)
4. Delete Task      - Remove a task
5. Update Task      - Edit task details, priority, tags, or due date
6. Search Tasks     - Find tasks by keyword
7. Filter Tasks     - Show only matching tasks (including date filters)
8. Sort Tasks       - Change task order (including by due date)
9. Reorder Tasks    - Manually move tasks
10. Exit            - Close the application
```

## Smart Suggestions

When creating a task, the app detects time-sensitive keywords and suggests due dates:
- "Submit report by Friday" → Suggests next Friday
- "Call mom tomorrow" → Suggests tomorrow
- "ASAP urgent task" → Suggests today
- "Meeting next week" → Suggests next week

## Date Formats

When setting due dates, use these formats:
- `YYYY-MM-DD` - Date only (e.g., `2025-01-15`)
- `YYYY-MM-DD HH:MM` - Date and time (e.g., `2025-01-15 14:30`)
- `clear` - Remove due date

## Data Storage

Tasks are stored in `data/tasks.json` with the following structure:

```json
{
  "tasks": [
    {
      "id": "uuid-v4",
      "title": "Task title",
      "description": "Task description",
      "completed": false,
      "createdAt": "2025-12-26T10:00:00.000Z",
      "priority": "high",
      "tags": ["work", "urgent"],
      "sortOrder": 1735228800000,
      "dueDate": "2025-12-28T23:59:59.999Z",
      "recurrencePattern": "weekly",
      "reminderOffset": 15,
      "reminderEnabled": true,
      "suggestionDismissed": false
    }
  ],
  "customTags": [
    { "name": "urgent", "color": "yellow", "type": "custom" }
  ]
}
```

## Color Coding

### Task Status
- Green (`✓`): Completed tasks
- Yellow (`○`): Pending tasks

### Priority Indicators
- Red (`●`): High priority
- Yellow (`◐`): Medium priority
- Blue (`○`): Low priority
- (none): No priority

### Due Date Status
- Red: Overdue (e.g., "2 days overdue")
- Yellow: Due soon (within 24 hours)
- Gray: Future due date

### Tag Colors
- Cyan: `work`
- Magenta: `home`
- Green: `personal`
- Yellow: Custom tags

## Recurrence Patterns

When a recurring task is marked complete:
1. The original task is marked as completed
2. A new task is automatically created with the next due date
3. All settings (priority, tags, recurrence) are preserved

Supported patterns:
- **Daily**: Task repeats every day
- **Weekly**: Task repeats every 7 days
- **Monthly**: Task repeats same day next month (handles month-end edge cases)

## Desktop Notifications

Notifications are scheduled when tasks have:
- A due date set
- Reminders enabled (default: on)
- Reminder offset configured (default: 15 minutes before)

The app schedules notifications on startup for tasks due within 24 hours.

## Project Structure

```
phases/phase-1/
├── src/
│   ├── index.js              # Entry point + main menu
│   ├── taskService.js        # CRUD + organization operations
│   ├── dateService.js        # Date/time utilities (Luxon)
│   ├── notificationService.js # Desktop notification scheduling
│   ├── suggestionService.js  # Smart date suggestions
│   ├── display.js            # Colored terminal output
│   └── prompts.js            # Interactive prompts
├── data/
│   └── tasks.json            # Task storage (auto-created)
├── package.json
└── README.md
```

## Tech Stack

- Node.js 18+
- inquirer - Interactive CLI prompts
- chalk - Terminal colors
- uuid - Unique ID generation
- luxon - Date/time handling with timezone support
- node-notifier - Cross-platform desktop notifications

## Part of Evolution of Todo

This is Phase 1 of the Evolution of Todo project, demonstrating progressive software evolution from CLI to cloud-native application.
