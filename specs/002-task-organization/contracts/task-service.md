# Contract: TaskService (Extended)

**Feature**: `002-task-organization`
**Module**: `src/taskService.js`
**Date**: 2025-12-26

## Overview

Extends the Phase 1 TaskService with organization capabilities: priority management, tag handling, search, filter, sort, and manual reordering.

## Dependencies

- `fs` (Node.js built-in)
- `uuid` (v4 generation)
- Existing Phase 1 TaskService methods

## Constants

```javascript
// Priority levels (ordered by importance)
export const PRIORITIES = ["high", "medium", "low", "none"];

// Priority colors for display
export const PRIORITY_COLORS = {
  high: "red",
  medium: "yellow",
  low: "blue",
  none: null
};

// Predefined tags
export const PREDEFINED_TAGS = [
  { name: "work", color: "cyan", type: "predefined" },
  { name: "home", color: "magenta", type: "predefined" },
  { name: "personal", color: "green", type: "predefined" }
];

// Default custom tag color
export const DEFAULT_CUSTOM_TAG_COLOR = "yellow";

// Sort types
export const SORT_TYPES = ["priority", "alpha", "date", "status", "manual"];
```

## Extended Methods

### Priority Management

#### `setPriority(id, priority)`

Sets the priority level for a task.

**Input**:
- `id: string` - Task UUID
- `priority: "high" | "medium" | "low" | "none"`

**Output**: `Task | null`

**Behavior**:
1. Find task by ID
2. If not found, return `null`
3. Validate priority is in PRIORITIES enum
4. Update task.priority
5. Save to file
6. Return updated task

**Errors**:
- Invalid priority → throws `Error("Invalid priority")`

---

### Tag Management

#### `setTags(id, tags)`

Sets tags for a task, creating custom tags as needed.

**Input**:
- `id: string` - Task UUID
- `tags: string[]` - Array of tag names (max 10)

**Output**: `Task | null`

**Behavior**:
1. Find task by ID
2. If not found, return `null`
3. Validate tags.length <= 10
4. Normalize each tag (lowercase, trim)
5. For each tag not in getAllTags(), create custom tag
6. Update task.tags
7. Save to file
8. Return updated task

**Errors**:
- Too many tags → throws `Error("Maximum 10 tags allowed")`

#### `getAllTags()`

Returns all available tags (predefined + custom).

**Input**: None

**Output**: `Tag[]`

**Behavior**:
1. Return PREDEFINED_TAGS + customTags from storage

#### `getUsedTags()`

Returns only tags that are assigned to at least one task.

**Input**: None

**Output**: `Tag[]`

**Behavior**:
1. Get all tasks
2. Collect unique tag names from all tasks
3. Return matching Tag objects

#### `createCustomTag(name)`

Creates a new custom tag.

**Input**:
- `name: string` - Tag name (1-30 chars)

**Output**: `Tag`

**Behavior**:
1. Normalize name (lowercase, trim)
2. Validate length 1-30
3. Check not already exists
4. Create tag with DEFAULT_CUSTOM_TAG_COLOR
5. Add to customTags in storage
6. Save to file
7. Return new tag

**Errors**:
- Invalid name → throws `Error("Tag name must be 1-30 lowercase characters")`
- Already exists → throws `Error("Tag already exists")`

---

### Search

#### `searchTasks(query)`

Searches tasks by keyword in title and description.

**Input**:
- `query: string` - Search keyword

**Output**: `Task[]`

**Behavior**:
1. If query is empty, return empty array
2. Normalize query (lowercase, trim)
3. Filter tasks where:
   - title.toLowerCase().includes(query) OR
   - description.toLowerCase().includes(query)
4. Return matching tasks (unsorted)

---

### Filter

#### `filterTasks(filter)`

Filters tasks by status, priority, or tag.

**Input**:
- `filter: { type: "status" | "priority" | "tag", value: any }`

**Output**: `Task[]`

**Behavior**:
1. Get all tasks
2. Apply filter based on type:
   - `status`: filter by completed === value (boolean)
   - `priority`: filter by priority === value (string)
   - `tag`: filter by tags.includes(value) (string)
3. Return filtered tasks (unsorted)

**Examples**:
```javascript
filterTasks({ type: "status", value: false })  // Pending tasks
filterTasks({ type: "priority", value: "high" }) // High priority
filterTasks({ type: "tag", value: "work" })    // Tagged "work"
```

---

### Sort

#### `sortTasks(tasks, sortType)`

Sorts tasks by specified criteria.

**Input**:
- `tasks: Task[]` - Tasks to sort
- `sortType: "priority" | "alpha" | "date" | "status" | "manual"`

**Output**: `Task[]` (new array, does not mutate input)

**Behavior**:
1. Clone input array
2. Apply sort comparator based on sortType:
   - `priority`: high → medium → low → none
   - `alpha`: A → Z by title (case-insensitive)
   - `date`: newest first (by createdAt)
   - `status`: pending first (completed = false first)
   - `manual`: by sortOrder ascending
3. Return sorted array

**Secondary Sort**: When primary sort values are equal, use `createdAt` descending as tiebreaker.

---

### Manual Reordering

#### `moveTaskUp(id)`

Moves a task one position up in manual order.

**Input**:
- `id: string` - Task UUID

**Output**: `boolean` - true if moved, false if already at top

**Behavior**:
1. Get all tasks sorted by sortOrder
2. Find task index
3. If index === 0, return false (already at top)
4. Swap sortOrder with previous task
5. Save to file
6. Return true

#### `moveTaskDown(id)`

Moves a task one position down in manual order.

**Input**:
- `id: string` - Task UUID

**Output**: `boolean` - true if moved, false if already at bottom

**Behavior**:
1. Get all tasks sorted by sortOrder
2. Find task index
3. If index === lastIndex, return false (already at bottom)
4. Swap sortOrder with next task
5. Save to file
6. Return true

#### `moveTaskTo(id, position)`

Moves a task to a specific position.

**Input**:
- `id: string` - Task UUID
- `position: number` - Target position (0-based)

**Output**: `boolean` - true if moved

**Behavior**:
1. Get all tasks sorted by sortOrder
2. Remove task from current position
3. Insert at target position
4. Recalculate sortOrder for all affected tasks
5. Save to file
6. Return true

---

### Extended CRUD

#### `createTask(input)` (Extended)

**Input** (extended):
```javascript
{
  title: string,        // required
  description?: string, // optional, default ""
  priority?: string,    // optional, default "none"
  tags?: string[]       // optional, default []
}
```

**Behavior** (extended):
1. Validate title (required, 1-200 chars)
2. Generate UUID
3. Set createdAt = Date.now()
4. Set completed = false
5. Set priority = input.priority || "none"
6. Set tags = input.tags || []
7. Set sortOrder = Date.now() (places at end)
8. Create custom tags if needed
9. Save to file
10. Return new task

#### `updateTask(id, input)` (Extended)

**Input** (extended):
```javascript
{
  title?: string,
  description?: string,
  priority?: string,
  tags?: string[]
}
```

**Behavior**: Same as Phase 1, plus handles priority and tags fields.

---

## Storage Format

### tasks.json (Extended)

```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "completed": false,
      "createdAt": 1735228800000,
      "priority": "high",
      "tags": ["work"],
      "sortOrder": 1735228800000
    }
  ],
  "customTags": [
    { "name": "urgent", "color": "yellow", "type": "custom" }
  ]
}
```

### Migration

When loading tasks.json from Phase 1:
```javascript
// Old format (Phase 1)
{
  "tasks": [{ id, title, description, completed, createdAt }]
}

// Migration applied automatically
task.priority = task.priority || "none";
task.tags = task.tags || [];
task.sortOrder = task.sortOrder || task.createdAt;
```

## Error Handling

| Error | Thrown By | Message |
|-------|-----------|---------|
| Invalid priority | setPriority | "Invalid priority" |
| Too many tags | setTags | "Maximum 10 tags allowed" |
| Invalid tag name | createCustomTag | "Tag name must be 1-30 lowercase characters" |
| Tag exists | createCustomTag | "Tag already exists" |
| Task not found | setPriority, setTags | Returns null (no error) |

## Exports

```javascript
export {
  // Constants
  PRIORITIES,
  PRIORITY_COLORS,
  PREDEFINED_TAGS,
  SORT_TYPES,

  // Existing (Phase 1)
  loadTasks,
  saveTasks,
  createTask,
  getAllTasks,
  getTaskById,
  toggleTask,
  deleteTask,
  updateTask,
  hasAnyTasks,
  getTaskCount,

  // New (Phase 2)
  setPriority,
  setTags,
  getAllTags,
  getUsedTags,
  createCustomTag,
  searchTasks,
  filterTasks,
  sortTasks,
  moveTaskUp,
  moveTaskDown,
  moveTaskTo
};
```
