# Data Model: Todo App Power User Enhancements

**Feature**: 004-power-user-enhancements
**Date**: 2025-12-27
**Status**: Design Complete

---

## Overview

This document defines the extended data model for power user features: templates, subtasks, time tracking, Pomodoro timer, and keyboard shortcuts. All new entities are stored in the existing `tasks.json` file.

---

## Storage Schema

### Root Structure (tasks.json)

```javascript
{
  "tasks": Task[],
  "customTags": Tag[],
  "templates": Template[],      // NEW: Phase 4
  "pomodoroConfig": PomodoroConfig,  // NEW: Phase 4
  "activeTimerState": ActiveTimerState | null  // NEW: Phase 4
}
```

---

## Entity Definitions

### 1. Task (Extended)

Extends existing Task with subtasks and time tracking fields.

```typescript
interface Task {
  // Existing fields (Phases 1-3)
  id: string;                    // UUID v4
  title: string;                 // 1-200 characters
  description: string;           // Optional, max 1000 characters
  completed: boolean;
  createdAt: string;             // ISO-8601 UTC
  priority: 'high' | 'medium' | 'low' | 'none';
  tags: string[];                // Max 10 tags
  sortOrder: number;             // Timestamp for manual ordering
  dueDate: string | null;        // ISO-8601 UTC
  recurrencePattern: 'none' | 'daily' | 'weekly' | 'monthly';
  reminderOffset: number;        // Minutes before due date
  reminderEnabled: boolean;
  suggestionDismissed: boolean;

  // NEW: Phase 4 - Subtasks
  subtasks: Subtask[];           // Max 20 subtasks per task

  // NEW: Phase 4 - Time Tracking
  timeEntries: TimeEntry[];      // Completed time sessions
  totalTimeMs: number;           // Cached total (for quick display)
}
```

**Validation Rules**:
- `title`: Required, 1-200 characters, trimmed
- `subtasks`: Max 20 items
- `timeEntries`: No limit (consider archiving if >100)
- `totalTimeMs`: Recalculated from entries on load (integrity check)

**State Transitions**:
- When `completed` changes to `true`: All subtasks marked complete
- When task is deleted: All subtasks and time entries deleted

---

### 2. Subtask (NEW)

A child task belonging to a parent task.

```typescript
interface Subtask {
  id: string;           // UUID v4
  title: string;        // 1-100 characters
  completed: boolean;
  createdAt: string;    // ISO-8601 UTC
}
```

**Validation Rules**:
- `title`: Required, 1-100 characters, trimmed
- `id`: Auto-generated UUID v4
- `createdAt`: Auto-set on creation

**Business Rules**:
- Subtasks cannot have their own subtasks (single-level nesting)
- Subtasks do not inherit properties from parent (no priority, tags, etc.)
- Deleting a subtask updates parent's cached progress count
- Parent completion auto-completes all subtasks
- All subtasks completing does NOT auto-complete parent

---

### 3. TimeEntry (NEW)

A record of time tracked on a task.

```typescript
interface TimeEntry {
  id: string;           // UUID v4
  startTime: string;    // ISO-8601 UTC
  endTime: string;      // ISO-8601 UTC
  durationMs: number;   // Calculated: endTime - startTime
}
```

**Validation Rules**:
- `startTime`: Required, valid ISO-8601
- `endTime`: Required, must be >= startTime
- `durationMs`: Auto-calculated, always positive

**Business Rules**:
- Only one active timer at a time across all tasks
- Timer auto-stops on app exit (SIGINT/SIGTERM)
- Timer auto-stops when starting timer on different task
- Deleted tasks remove all time entries

---

### 4. Template (NEW)

A saved task configuration for quick task creation.

```typescript
interface Template {
  id: string;                    // UUID v4
  name: string;                  // 1-50 characters, unique
  createdAt: string;             // ISO-8601 UTC
  updatedAt: string;             // ISO-8601 UTC

  // Template fields (copied to new task)
  title: string;                 // Task title pattern
  description: string;           // Optional description
  priority: 'high' | 'medium' | 'low' | 'none';
  tags: string[];                // Tags to apply
  recurrencePattern: 'none' | 'daily' | 'weekly' | 'monthly';
  defaultSubtasks: string[];     // Subtask titles to auto-create
}
```

**Validation Rules**:
- `name`: Required, 1-50 characters, unique across templates
- `title`: Required, 1-200 characters
- `tags`: Max 10 items
- `defaultSubtasks`: Max 10 items, each 1-100 characters

**Business Rules**:
- Templates do NOT include: dueDate (time-specific, would be stale)
- Templates do NOT include: completed, createdAt, timeEntries (runtime data)
- Creating task from template copies all fields, then user can modify
- Deleting template does not affect tasks created from it
- Template names must be unique (prompt to rename on conflict)

---

### 5. PomodoroConfig (NEW)

User's Pomodoro timer settings and daily statistics.

```typescript
interface PomodoroConfig {
  workDurationMinutes: number;   // Default: 25
  breakDurationMinutes: number;  // Default: 5
  completedToday: number;        // Completed Pomodoro count
  lastResetDate: string;         // ISO-8601 date (YYYY-MM-DD)
}
```

**Validation Rules**:
- `workDurationMinutes`: 1-120 minutes
- `breakDurationMinutes`: 1-60 minutes
- `completedToday`: Non-negative integer
- `lastResetDate`: Valid date string

**Business Rules**:
- `completedToday` resets to 0 when date changes (checked on app start and session complete)
- Only complete work sessions count toward `completedToday`
- Cancelled sessions do not increment count

---

### 6. ActiveTimerState (NEW)

Runtime state for active time tracking (persisted for recovery).

```typescript
interface ActiveTimerState {
  taskId: string;        // ID of task being timed
  startTime: string;     // ISO-8601 UTC when timer started
  type: 'task' | 'pomodoro_work' | 'pomodoro_break';
}
```

**Validation Rules**:
- `taskId`: Valid task ID (or null for Pomodoro not linked to task)
- `startTime`: Valid ISO-8601 timestamp
- `type`: One of the enum values

**Business Rules**:
- Only one active timer at a time
- On app startup, check for orphaned timer:
  - If found, calculate elapsed time and offer to save or discard
- On normal exit (SIGINT/SIGTERM), timer is stopped and saved
- Pomodoro can run independently of task timer

---

## Migration Strategy

### From Phase 3 to Phase 4

Add new fields with defaults during `migrateTask()`:

```javascript
function migrateTask(task) {
  return {
    ...task,
    // Phase 4 fields (Power User Enhancements)
    subtasks: task.subtasks ?? [],
    timeEntries: task.timeEntries ?? [],
    totalTimeMs: task.totalTimeMs ?? 0
  };
}
```

### Root-level additions

Initialize in `loadTasks()` if missing:

```javascript
if (!parsed.templates) parsed.templates = [];
if (!parsed.pomodoroConfig) {
  parsed.pomodoroConfig = {
    workDurationMinutes: 25,
    breakDurationMinutes: 5,
    completedToday: 0,
    lastResetDate: new Date().toISOString().split('T')[0]
  };
}
if (!parsed.activeTimerState) parsed.activeTimerState = null;
```

---

## Relationships Diagram

```
tasks.json
├── tasks[]
│   ├── Task
│   │   ├── subtasks[] → Subtask (embedded, max 20)
│   │   └── timeEntries[] → TimeEntry (embedded)
│   └── ...
├── customTags[] → Tag
├── templates[] → Template (independent)
├── pomodoroConfig → PomodoroConfig (singleton)
└── activeTimerState → ActiveTimerState | null (singleton)
```

---

## Index and Query Patterns

### By Template Name
```javascript
templates.find(t => t.name.toLowerCase() === name.toLowerCase())
```

### By Active Timer
```javascript
// Check if task has active timer
activeTimerState?.taskId === taskId
```

### Subtask Progress
```javascript
const completed = task.subtasks.filter(s => s.completed).length;
const total = task.subtasks.length;
// Display: "2/5 completed"
```

### Total Time
```javascript
// Prefer cached value, recalculate if needed
const totalMs = task.totalTimeMs ||
  task.timeEntries.reduce((sum, e) => sum + e.durationMs, 0);
```

---

## Sample Data

```json
{
  "tasks": [
    {
      "id": "abc123",
      "title": "Plan sprint",
      "description": "Weekly sprint planning",
      "completed": false,
      "createdAt": "2025-12-27T10:00:00.000Z",
      "priority": "high",
      "tags": ["work"],
      "sortOrder": 1735293600000,
      "dueDate": "2025-12-30T17:00:00.000Z",
      "recurrencePattern": "weekly",
      "reminderOffset": 60,
      "reminderEnabled": true,
      "suggestionDismissed": false,
      "subtasks": [
        { "id": "sub1", "title": "Review backlog", "completed": true, "createdAt": "2025-12-27T10:01:00.000Z" },
        { "id": "sub2", "title": "Assign stories", "completed": false, "createdAt": "2025-12-27T10:02:00.000Z" }
      ],
      "timeEntries": [
        { "id": "te1", "startTime": "2025-12-27T10:00:00.000Z", "endTime": "2025-12-27T10:30:00.000Z", "durationMs": 1800000 }
      ],
      "totalTimeMs": 1800000
    }
  ],
  "customTags": [],
  "templates": [
    {
      "id": "tpl1",
      "name": "Weekly Meeting",
      "createdAt": "2025-12-27T09:00:00.000Z",
      "updatedAt": "2025-12-27T09:00:00.000Z",
      "title": "Weekly Team Meeting",
      "description": "Discuss progress and blockers",
      "priority": "medium",
      "tags": ["work", "meeting"],
      "recurrencePattern": "weekly",
      "defaultSubtasks": ["Prepare agenda", "Send invites", "Take notes"]
    }
  ],
  "pomodoroConfig": {
    "workDurationMinutes": 25,
    "breakDurationMinutes": 5,
    "completedToday": 3,
    "lastResetDate": "2025-12-27"
  },
  "activeTimerState": null
}
```

---

## Backward Compatibility

- All new fields have defaults (empty arrays, null, or sensible values)
- Existing tasks work without modification
- Migration runs automatically on load
- No breaking changes to existing task operations
