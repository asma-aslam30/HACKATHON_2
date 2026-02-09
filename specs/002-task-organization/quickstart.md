# Quickstart: Todo App Organization Features

**Feature**: `002-task-organization`
**Prerequisites**: Phase 1 CLI Todo MVP (`phases/phase-1/`)

## Overview

This feature extends the Phase 1 CLI Todo app with organization capabilities:
- Priority levels (High/Medium/Low)
- Tags (work/home/personal + custom)
- Keyword search
- Filters by status/priority/tag
- Sort options
- Manual reordering

## Quick Start

```bash
# Navigate to Phase 1 directory
cd phases/phase-1

# Install dependencies (if not already done)
npm install

# Run the app
npm start
# or: node src/index.js
```

## New Features

### Setting Priority

When adding or updating a task:
```
Select priority:
  ● High (urgent, do first)
  ◐ Medium (important)
  ○ Low (can wait)
    None (no priority)
```

Priority is displayed with colored indicators in the task list.

### Adding Tags

When adding or updating a task:
```
Select tags (space to select, enter to confirm):
  ☑ work
  ☐ home
  ☐ personal
  ─────────────
  ☐ Add custom tag...
```

Tags display as colored chips: `[work] [home]`

### Search Tasks

Menu option 6: Search Tasks
```
Enter search keyword: meeting

Search results for "meeting":
[abc1] ● High   Team meeting tomorrow    [work]
[def2]   None   Book meeting room        [work]

Press Enter to continue...
```

### Filter Tasks

Menu option 7: Filter Tasks
```
Filter by:
  Status (Pending/Completed)
  Priority (High/Medium/Low/None)
  Tag
  Clear Filter
  Back to Menu
```

Active filter shown in header: `[Filter: Priority = High]`

### Sort Tasks

Menu option 8: Sort Tasks
```
Sort by:
  Priority (High → Low)
  Alphabetical (A → Z)
  Date Created (Newest First)
  Status (Pending First)
  Manual Order
  Back to Menu
```

### Reorder Tasks

Menu option 9: Reorder Tasks
```
Select task to move:
  1. Buy groceries
  2. Review documents
  3. Call dentist

Move "Buy groceries":
  Move Up
  Move Down
  Move to Position...
  Cancel
```

## Data Migration

Existing tasks from Phase 1 are automatically migrated:
- `priority` defaults to `"none"`
- `tags` defaults to `[]`
- `sortOrder` defaults to `createdAt`

No manual migration required.

## File Structure

```
phases/phase-1/
├── src/
│   ├── index.js          # Main entry (extended menu)
│   ├── taskService.js    # CRUD + organization (extended)
│   ├── display.js        # Colors + chips (extended)
│   └── prompts.js        # Prompts (extended)
├── data/
│   └── tasks.json        # Extended schema
└── package.json
```

## tasks.json Schema (Extended)

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
      "tags": ["work", "urgent"],
      "sortOrder": 1735228800000
    }
  ],
  "customTags": [
    { "name": "urgent", "color": "yellow", "type": "custom" }
  ]
}
```

## Common Workflows

### Focus on High Priority Work Tasks

1. Menu → 7. Filter Tasks
2. Select "Priority"
3. Select "High"
4. List shows only high priority tasks
5. Menu → 7. Filter Tasks → Clear Filter (when done)

### Find a Specific Task

1. Menu → 6. Search Tasks
2. Enter keyword
3. View matching tasks
4. Press Enter to return

### Organize Tasks by Category

1. Add tasks with appropriate tags during creation
2. Menu → 7. Filter Tasks → Tag
3. Select tag to view category
4. Use sort to order within category

### Custom Task Order

1. Menu → 9. Reorder Tasks
2. Select task to move
3. Choose "Move Up", "Move Down", or "Move to Position"
4. Repeat as needed

## Troubleshooting

### Tasks don't show priority/tags
- Restart app to trigger migration
- Check tasks.json has new fields

### Filter shows no tasks
- Verify tasks exist with that filter value
- Clear filter and check list

### Sort not working
- Ensure sort is selected (check header)
- Manual sort requires manual reordering

### Custom tags missing
- Custom tags saved in `customTags` array
- Check tasks.json for `customTags` section
