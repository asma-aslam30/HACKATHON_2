# Quickstart: Todo App Intelligent Features

**Feature Branch**: `003-intelligent-features`
**Date**: 2025-12-27

## Prerequisites

- Node.js 18+ installed
- Existing Phase 1/2 todo app working (`phases/phase-1/`)

## Setup

1. **Navigate to project directory**
   ```bash
   cd phases/phase-1
   ```

2. **Install new dependencies**
   ```bash
   npm install luxon@^3.4.0 node-notifier@^10.0.0
   ```

3. **Run the app**
   ```bash
   npm start
   ```

## New Features Overview

### 1. Due Dates

Set a due date when creating or editing tasks:

```
? Enter task title: Finish report
? Enter description (optional): Q4 financial summary
? Select priority: High
? Select tags: work
? Set due date? Yes
? Enter due date (YYYY-MM-DD HH:MM): 2025-12-31 14:00
? Set recurrence? None
```

### 2. Overdue Highlighting

Tasks past their due date are highlighted in red with time elapsed:

```
📋 Your Tasks
─────────────
⚠️ 2 tasks are overdue!

● [HIGH] Finish report            2 days overdue  ⚠️
● [MED]  Call dentist             Due in 3h 45m
○ [LOW]  Buy groceries            Dec 31, 2:00 PM
```

### 3. Recurring Tasks

Set tasks to auto-reschedule when completed:

```
? Set recurrence? Weekly

# After marking complete:
✓ Task "Team meeting" completed!
🔁 New recurring task created for next week (Jan 6, 9:00 AM)
```

Recurrence options:
- **Daily**: Next due date = +1 day
- **Weekly**: Next due date = +7 days
- **Monthly**: Next due date = same day next month

### 4. Desktop Notifications

Enable reminders to receive desktop notifications:

```
? Enable reminder? Yes
? Remind me: 15 minutes before

# At reminder time, a desktop notification appears:
┌─────────────────────────────┐
│ Task Reminder               │
│ Finish report               │
│ Due in 15 minutes           │
└─────────────────────────────┘
```

### 5. Filter by Due Date

New filter options in the Filter menu:

```
? Filter tasks by:
  ❯ Due today
    Due this week
    Overdue
    No due date
    By status (pending/completed)
    By priority
    By tag
    Clear filter
```

### 6. Sort by Due Date

New sort option in the Sort menu:

```
? Sort tasks by:
  ❯ Due date (soonest first)
    Priority (high to low)
    Alphabetically
    Date created
    Status
    Manual order
```

### 7. Smart Suggestions

When creating a task with time-sensitive words, you'll get a suggestion:

```
? Enter task title: Submit report by Friday
✓ Task created successfully!

💡 This task mentions "Friday". Add a due date?
  ❯ Yes, set due date for Friday
    No, dismiss suggestion
```

## Menu Changes

The main menu remains the same, but options have expanded functionality:

```
📋 Todo App
────────────
1. Add Task        # Now includes due date, recurrence, reminder options
2. List Tasks      # Shows due dates and overdue highlighting
3. Toggle Complete # Creates new instance for recurring tasks
4. Delete Task
5. Update Task     # Can now modify due date, recurrence, reminder
6. Search Tasks
7. Filter Tasks    # New: Due today, Due this week, Overdue filters
8. Sort Tasks      # New: Sort by due date option
9. Reorder Tasks
10. Exit
```

## Data Migration

Existing tasks from Phase 1/2 continue to work. New fields are automatically added with defaults:

| Field | Default |
|-------|---------|
| dueDate | null |
| recurrencePattern | "none" |
| reminderOffset | 15 |
| reminderEnabled | true |
| suggestionDismissed | false |

## Troubleshooting

### Notifications not appearing

1. **Linux**: Ensure `notify-send` is installed:
   ```bash
   sudo apt install libnotify-bin
   ```

2. **macOS**: Allow notifications in System Preferences > Notifications

3. **Windows**: Notifications should work out of the box

### Date parsing issues

Use the format `YYYY-MM-DD HH:MM` for date input:
- `2025-12-31 14:00` ✓
- `12/31/2025` ✗
- `Dec 31, 2025` ✗

### Recurring task not creating new instance

- Ensure the task has a `dueDate` set (recurrence without due date is ignored)
- Ensure `recurrencePattern` is not "none"

## Testing the Features

### Test 1: Due Date + Overdue

1. Create a task with due date in the past
2. List tasks → should show red "X days overdue"
3. Create a task due in 30 minutes
4. List tasks → should show yellow "Due in 30m"

### Test 2: Recurring Task

1. Create a task with due date tomorrow, recurrence = daily
2. Mark task complete
3. List tasks → new task should exist with due date = day after tomorrow

### Test 3: Notification

1. Create a task due in 2 minutes, reminder = 1 minute before
2. Wait 1 minute
3. Desktop notification should appear

### Test 4: Smart Suggestion

1. Create task titled "Call mom tomorrow"
2. Suggestion should appear offering to set due date

### Test 5: Filter by Due Date

1. Create tasks with various due dates (today, this week, past, no date)
2. Use filter options to verify each filter works correctly
