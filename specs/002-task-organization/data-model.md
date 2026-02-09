# Data Model: Todo App Organization Features

**Feature**: `002-task-organization`
**Date**: 2025-12-26
**Input**: Research from `specs/002-task-organization/research.md`

## Entity Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Task                                 │
│  (Extended from Phase 1)                                    │
├─────────────────────────────────────────────────────────────┤
│  id: string (UUID)                                          │
│  title: string (required, 1-200 chars)                      │
│  description: string (optional, 0-1000 chars)               │
│  completed: boolean (default: false)                        │
│  createdAt: number (timestamp)                              │
│  priority: "high" | "medium" | "low" | "none" (NEW)         │
│  tags: string[] (NEW, max 10 items)                         │
│  sortOrder: number (NEW, default: createdAt)                │
└─────────────────────────────────────────────────────────────┘
           │
           │ references
           ▼
┌─────────────────────────────────────────────────────────────┐
│                          Tag                                 │
│  (New Entity - In-Memory Registry)                          │
├─────────────────────────────────────────────────────────────┤
│  name: string (unique, lowercase, 1-30 chars)               │
│  color: string (chalk color name)                           │
│  type: "predefined" | "custom"                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      ViewState                               │
│  (Runtime Only - Not Persisted)                             │
├─────────────────────────────────────────────────────────────┤
│  activeFilter: Filter | null                                │
│  activeSort: SortType                                       │
│  searchQuery: string | null                                 │
└─────────────────────────────────────────────────────────────┘
```

## Task Entity (Extended)

### Schema Definition

```javascript
/**
 * Task entity with organization features
 * @typedef {Object} Task
 */
const TaskSchema = {
  // Existing fields (Phase 1)
  id: {
    type: "string",
    format: "uuid",
    required: true,
    description: "Unique identifier (UUID v4)"
  },
  title: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 200,
    description: "Task title"
  },
  description: {
    type: "string",
    required: false,
    default: "",
    maxLength: 1000,
    description: "Optional task description"
  },
  completed: {
    type: "boolean",
    required: true,
    default: false,
    description: "Completion status"
  },
  createdAt: {
    type: "number",
    required: true,
    description: "Unix timestamp of creation"
  },

  // NEW fields (Phase 2)
  priority: {
    type: "string",
    enum: ["high", "medium", "low", "none"],
    required: true,
    default: "none",
    description: "Task priority level"
  },
  tags: {
    type: "array",
    items: { type: "string" },
    required: true,
    default: [],
    maxItems: 10,
    description: "Array of tag names"
  },
  sortOrder: {
    type: "number",
    required: true,
    default: "createdAt value",
    description: "Manual sort position (lower = earlier)"
  }
};
```

### Example Task Objects

```javascript
// Minimal task (defaults applied)
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Buy groceries",
  "description": "",
  "completed": false,
  "createdAt": 1735228800000,
  "priority": "none",
  "tags": [],
  "sortOrder": 1735228800000
}

// Fully specified task
{
  "id": "b2c3d4e5-f6g7-8901-bcde-f23456789012",
  "title": "Review quarterly report",
  "description": "Check figures for Q4 and prepare summary for meeting",
  "completed": false,
  "createdAt": 1735228900000,
  "priority": "high",
  "tags": ["work", "urgent"],
  "sortOrder": 1735228900000
}
```

## Tag Entity

### Schema Definition

```javascript
/**
 * Tag entity for task categorization
 * @typedef {Object} Tag
 */
const TagSchema = {
  name: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 30,
    pattern: "^[a-z0-9-]+$",
    description: "Unique tag identifier (lowercase, alphanumeric with hyphens)"
  },
  color: {
    type: "string",
    required: true,
    enum: ["cyan", "magenta", "green", "yellow", "blue", "red", "white"],
    description: "Chalk color name for display"
  },
  type: {
    type: "string",
    required: true,
    enum: ["predefined", "custom"],
    description: "Whether tag is system-defined or user-created"
  }
};
```

### Predefined Tags

```javascript
const PREDEFINED_TAGS = [
  { name: "work", color: "cyan", type: "predefined" },
  { name: "home", color: "magenta", type: "predefined" },
  { name: "personal", color: "green", type: "predefined" }
];
```

### Custom Tag Creation

```javascript
// Custom tags are created on-demand
// Default color assignment: yellow
const createCustomTag = (name) => ({
  name: name.toLowerCase().trim(),
  color: "yellow",
  type: "custom"
});
```

## ViewState Entity (Runtime)

### Schema Definition

```javascript
/**
 * View state for filtering, sorting, and searching
 * @typedef {Object} ViewState
 */
const ViewStateSchema = {
  activeFilter: {
    type: "object",
    nullable: true,
    properties: {
      type: {
        type: "string",
        enum: ["status", "priority", "tag"]
      },
      value: {
        type: "any",
        description: "Filter value (boolean for status, string for priority/tag)"
      }
    }
  },
  activeSort: {
    type: "string",
    enum: ["priority", "alpha", "date", "status", "manual"],
    default: "manual"
  },
  searchQuery: {
    type: "string",
    nullable: true,
    default: null
  }
};
```

### Filter Types

```javascript
// Filter by status
{ type: "status", value: true }   // Show completed only
{ type: "status", value: false }  // Show pending only

// Filter by priority
{ type: "priority", value: "high" }
{ type: "priority", value: "medium" }
{ type: "priority", value: "low" }
{ type: "priority", value: "none" }

// Filter by tag
{ type: "tag", value: "work" }
{ type: "tag", value: "home" }
{ type: "tag", value: "custom-tag-name" }
```

### Sort Comparators

```javascript
const SORT_COMPARATORS = {
  // Priority: high → medium → low → none
  priority: (a, b) => {
    const order = { high: 0, medium: 1, low: 2, none: 3 };
    return order[a.priority] - order[b.priority];
  },

  // Alphabetical: A → Z (case-insensitive)
  alpha: (a, b) => {
    return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
  },

  // Date: newest first
  date: (a, b) => {
    return b.createdAt - a.createdAt;
  },

  // Status: pending first, then completed
  status: (a, b) => {
    return Number(a.completed) - Number(b.completed);
  },

  // Manual: by sortOrder field
  manual: (a, b) => {
    return a.sortOrder - b.sortOrder;
  }
};
```

## Persistence Format

### tasks.json Structure

```json
{
  "tasks": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Buy groceries",
      "description": "Milk, bread, eggs",
      "completed": false,
      "createdAt": 1735228800000,
      "priority": "high",
      "tags": ["home", "personal"],
      "sortOrder": 1735228800000
    }
  ],
  "customTags": [
    { "name": "urgent", "color": "yellow", "type": "custom" }
  ]
}
```

### Migration from Phase 1

```javascript
/**
 * Migrate task from Phase 1 schema to Phase 2 schema
 * @param {Object} task - Phase 1 task object
 * @returns {Object} - Phase 2 task object with defaults applied
 */
function migrateTask(task) {
  return {
    ...task,
    priority: task.priority || "none",
    tags: task.tags || [],
    sortOrder: task.sortOrder || task.createdAt
  };
}
```

## Validation Rules

### Task Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| title | Required, 1-200 chars | "Title is required (1-200 characters)" |
| description | Optional, max 1000 chars | "Description too long (max 1000 characters)" |
| priority | Must be valid enum | "Invalid priority (use: high, medium, low, none)" |
| tags | Max 10 items | "Too many tags (max 10)" |
| tags[n] | Max 30 chars, lowercase | "Tag name invalid (1-30 lowercase chars)" |

### Tag Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| name | Required, 1-30 chars, lowercase | "Tag name required (1-30 lowercase characters)" |
| name | No special chars except hyphen | "Tag name can only contain letters, numbers, hyphens" |
| name | Unique | "Tag already exists" |

## Operations Summary

### Task Operations

| Operation | Input | Output | Side Effects |
|-----------|-------|--------|--------------|
| createTask | title, description?, priority?, tags? | Task | Persists to file |
| updateTask | id, updates | Task | Persists to file |
| deleteTask | id | boolean | Persists to file |
| toggleTask | id | Task | Persists to file |
| setPriority | id, priority | Task | Persists to file |
| setTags | id, tags[] | Task | Persists to file, creates custom tags |
| moveTo | id, position | Task | Updates sortOrder, persists |

### Query Operations

| Operation | Input | Output | Side Effects |
|-----------|-------|--------|--------------|
| getAllTasks | - | Task[] | None |
| searchTasks | query | Task[] | None |
| filterTasks | filter | Task[] | None |
| sortTasks | sortType | Task[] | None |
| getTaskById | id | Task \| null | None |

### Tag Operations

| Operation | Input | Output | Side Effects |
|-----------|-------|--------|--------------|
| getAllTags | - | Tag[] | None |
| getUsedTags | - | Tag[] | None (filters to only tags with tasks) |
| createCustomTag | name | Tag | Persists to file |
