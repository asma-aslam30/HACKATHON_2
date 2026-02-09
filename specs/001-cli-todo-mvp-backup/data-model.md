# Data Model: Todo App Core Essentials MVP - Phase 1 CLI

**Branch**: `001-cli-todo-mvp`
**Date**: 2025-12-26
**Source**: Feature specification entities + research decisions

## Entities

### Task

Primary entity representing a todo item.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | Yes | Unique identifier, auto-generated |
| `title` | string | Yes | Task title (1-500 characters) |
| `description` | string | No | Task description (0-2000 characters) |
| `completed` | boolean | Yes | Completion status (default: false) |
| `createdAt` | string (ISO 8601) | Yes | Creation timestamp |

**Validation Rules**:
- `id`: Valid UUID v4 format
- `title`: Non-empty, trimmed whitespace, max 500 chars
- `description`: Trimmed whitespace, max 2000 chars (empty string if not provided)
- `completed`: Boolean only (not truthy/falsy)
- `createdAt`: Valid ISO 8601 timestamp

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "createdAt": "2025-12-26T10:30:00.000Z"
}
```

---

### TaskList (tasks.json)

Collection of all tasks, persisted as JSON file.

**Schema**:
```json
{
  "tasks": [Task, Task, ...]
}
```

**File Location**: `./data/tasks.json` (relative to application root)

**Example**:
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "createdAt": "2025-12-26T10:30:00.000Z"
    },
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "title": "Call mom",
      "description": "",
      "completed": true,
      "createdAt": "2025-12-26T09:00:00.000Z"
    }
  ]
}
```

---

## State Transitions

### Task Lifecycle

```
┌─────────────┐
│   Created   │  (completed: false)
└──────┬──────┘
       │
       ▼ toggle()
┌─────────────┐
│  Completed  │  (completed: true)
└──────┬──────┘
       │
       ▼ toggle()
┌─────────────┐
│   Pending   │  (completed: false)
└──────┬──────┘
       │
       ▼ delete()
┌─────────────┐
│   Deleted   │  (removed from array)
└─────────────┘
```

**State Rules**:
- New tasks always start as `completed: false`
- Toggle switches between `true` and `false`
- Deleted tasks are removed from array (no soft delete)
- Updates preserve `completed` and `createdAt` values

---

## Operations

### Create Task

**Input**:
```javascript
{
  title: string,       // Required, non-empty
  description: string  // Optional, defaults to ""
}
```

**Output**: Created Task object with generated id and createdAt

**Side Effects**:
- Appends task to tasks array
- Persists to tasks.json

---

### Read All Tasks

**Input**: None

**Output**: Array of Task objects (may be empty)

**Filtering** (display only):
- All tasks: No filter
- Pending only: `completed === false`
- Completed only: `completed === true`

---

### Read Single Task

**Input**: `id` (string UUID)

**Output**: Task object or `null` if not found

---

### Update Task

**Input**:
```javascript
{
  id: string,                    // Required
  title?: string,                // Optional (keeps existing if not provided)
  description?: string           // Optional (keeps existing if not provided)
}
```

**Output**: Updated Task object or `null` if not found

**Preserved Fields**: `id`, `completed`, `createdAt`

---

### Toggle Completion

**Input**: `id` (string UUID)

**Output**: Updated Task object with toggled `completed` value

**Logic**: `task.completed = !task.completed`

---

### Delete Task

**Input**: `id` (string UUID)

**Output**: `true` if deleted, `false` if not found

**Side Effects**:
- Removes task from tasks array
- Persists updated array to tasks.json

---

## Display Format

### Task List Display

```
┌────┬────────────────────────────────────────┬──────────┐
│ ID │ Title                                  │ Status   │
├────┼────────────────────────────────────────┼──────────┤
│ 550e │ Buy groceries                        │ ○ Pending │
│ 6ba7 │ Call mom                             │ ✓ Done    │
└────┴────────────────────────────────────────┴──────────┘
```

**Display Rules**:
- ID: Show first 4 characters of UUID
- Title: Truncate at 40 characters with "..." if longer
- Status: Green "✓ Done" for completed, Yellow "○ Pending" for incomplete
- Description: Shown only in detail view or during update

---

## File Operations

### Load Tasks

```
1. Check if tasks.json exists
   - No: Return empty array, log info
   - Yes: Continue
2. Read file contents
3. Parse JSON
   - Success: Validate each task, filter invalid
   - Failure: Backup corrupted file, return empty array
4. Return valid tasks array
```

### Save Tasks

```
1. Serialize tasks array to JSON (pretty-printed)
2. Write to tasks.json (atomic write preferred)
   - Success: Return true
   - Failure: Log error, return false (keep in-memory data)
```

---

## Constraints

| Constraint | Value | Rationale |
|------------|-------|-----------|
| Max tasks | 10,000 | JSON file performance limit |
| Title length | 500 chars | Reasonable for CLI display |
| Description length | 2,000 chars | Adequate for notes |
| ID format | UUID v4 | Globally unique |
| File encoding | UTF-8 | Standard text encoding |
