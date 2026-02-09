# Contract: CLI Interface (Extended)

**Feature**: `002-task-organization`
**Modules**: `src/display.js`, `src/prompts.js`, `src/index.js`
**Date**: 2025-12-26

## Overview

Extends the Phase 1 CLI interface with organization features: priority selection, tag management, search, filter, sort, and reorder menus.

## Main Menu (Extended)

### Menu Options

```
📋 Todo CLI - [5 tasks] [Filter: High Priority] [Sort: Priority]

1. Add Task
2. List Tasks
3. Toggle Complete
4. Delete Task
5. Update Task
6. 🔍 Search Tasks
7. 🏷️  Filter Tasks
8. 📊 Sort Tasks
9. ↕️  Reorder Tasks
10. Exit

Select an option:
```

### Header Display

Shows active filter and sort when applicable:
- `[Filter: <type>]` - When filter is active
- `[Sort: <type>]` - When non-manual sort is active

---

## Display Module Extensions (`display.js`)

### `showTask(task)` (Extended)

Displays a single task with priority indicator and tag chips.

**Format**:
```
[abc1] ● High   Buy groceries            [work] [home]
       ↑        ↑                        ↑
       Priority Task title (40 chars)   Tag chips
       indicator
```

**Priority Indicators**:
- High: `●` (red, filled circle)
- Medium: `◐` (yellow, half circle)
- Low: `○` (blue, empty circle)
- None: ` ` (no indicator)

**Tag Chip Display**:
- Tags shown as `[tagname]` with background color
- Max 3 tags shown, then `+N more` if more exist
- Colors from Tag entity

### `showPriorityIndicator(priority)`

Returns formatted priority indicator string.

**Input**: `priority: "high" | "medium" | "low" | "none"`

**Output**: `string` (colored indicator)

### `showTagChips(tags, maxShow = 3)`

Returns formatted tag chips string.

**Input**:
- `tags: string[]` - Tag names
- `maxShow: number` - Max tags to display

**Output**: `string` (colored chips)

**Example**:
```javascript
showTagChips(["work", "home", "personal", "urgent"])
// Returns: "[work] [home] [personal] +1 more"
```

### `showFilterHeader(filter)`

Displays active filter information.

**Input**: `filter: { type, value } | null`

**Output**: `string`

**Examples**:
```
[Filter: Status = Pending]
[Filter: Priority = High]
[Filter: Tag = work]
```

### `showSortHeader(sortType)`

Displays active sort information.

**Input**: `sortType: string`

**Output**: `string`

**Examples**:
```
[Sort: Priority ↓]
[Sort: A-Z]
[Sort: Newest First]
[Sort: Status]
[Sort: Manual]
```

### `showSearchResults(tasks, query)`

Displays search results with highlighted matches.

**Input**:
- `tasks: Task[]` - Matching tasks
- `query: string` - Search query

**Output**: Prints formatted list

### `showNoResults(type)`

Displays "no results" message.

**Input**: `type: "search" | "filter"`

**Output**: Prints message

**Messages**:
- Search: `No tasks found matching '<query>'`
- Filter: `No tasks match the current filter`

---

## Prompts Module Extensions (`prompts.js`)

### `getPriorityChoice(currentPriority = null)`

Prompts user to select priority level.

**Input**: `currentPriority: string | null` - Current priority for updates

**Output**: `Promise<"high" | "medium" | "low" | "none">`

**Prompt**:
```
Select priority:
  ○ ● High (urgent, do first)
  ○ ◐ Medium (important)
  ○ ○ Low (can wait)
  ○   None (no priority)
```

### `getTagSelection(availableTags, currentTags = [])`

Prompts user to select tags (multi-select).

**Input**:
- `availableTags: Tag[]` - All available tags
- `currentTags: string[]` - Currently selected tags

**Output**: `Promise<string[]>`

**Prompt**:
```
Select tags (space to select, enter to confirm):
  ☑ work
  ☐ home
  ☐ personal
  ─────────────
  ☐ Add custom tag...
```

### `getCustomTagName()`

Prompts user to enter custom tag name.

**Input**: None

**Output**: `Promise<string>`

**Validation**: 1-30 lowercase characters

### `getSearchQuery()`

Prompts user to enter search keyword.

**Input**: None

**Output**: `Promise<string>`

**Prompt**:
```
Enter search keyword: _
```

### `getFilterChoice()`

Prompts user to select filter type and value.

**Input**: None

**Output**: `Promise<{ type, value } | null>` (null = back to menu)

**Prompt (Step 1)**:
```
Filter by:
  ○ Status (Pending/Completed)
  ○ Priority (High/Medium/Low/None)
  ○ Tag
  ○ Clear Filter
  ○ Back to Menu
```

**Prompt (Step 2 - Status)**:
```
Show tasks:
  ○ Pending only
  ○ Completed only
```

**Prompt (Step 2 - Priority)**:
```
Show priority:
  ○ High
  ○ Medium
  ○ Low
  ○ None
```

**Prompt (Step 2 - Tag)**:
```
Show tasks tagged:
  ○ work
  ○ home
  ○ personal
  ○ [custom tags...]
```

### `getSortChoice()`

Prompts user to select sort order.

**Input**: None

**Output**: `Promise<"priority" | "alpha" | "date" | "status" | "manual" | null>`

**Prompt**:
```
Sort by:
  ○ Priority (High → Low)
  ○ Alphabetical (A → Z)
  ○ Date Created (Newest First)
  ○ Status (Pending First)
  ○ Manual Order
  ○ Back to Menu
```

### `getReorderChoice(tasks)`

Prompts user to select task to reorder.

**Input**: `tasks: Task[]` - Current task list

**Output**: `Promise<{ taskId, action } | null>`

**Prompt (Step 1)**:
```
Select task to move:
  1. [task 1 title]
  2. [task 2 title]
  ...
  ○ Back to Menu
```

**Prompt (Step 2)**:
```
Move "[task title]":
  ○ Move Up
  ○ Move Down
  ○ Move to Position...
  ○ Cancel
```

### `getNewPosition(max)`

Prompts user to enter target position.

**Input**: `max: number` - Maximum valid position

**Output**: `Promise<number>` (0-based position)

**Prompt**:
```
Enter new position (1-{max}): _
```

---

## Index Module Extensions (`index.js`)

### Menu Handlers

#### `handleSearch()`

1. Call `getSearchQuery()`
2. Call `searchTasks(query)`
3. Display results with `showSearchResults()`
4. If no results, show `showNoResults("search")`
5. Wait for Enter to return to menu

#### `handleFilter()`

1. Call `getFilterChoice()`
2. If null (back/clear), clear viewState.activeFilter
3. Otherwise, set viewState.activeFilter
4. List tasks will now use filter

#### `handleSort()`

1. Call `getSortChoice()`
2. If null (back), do nothing
3. Otherwise, set viewState.activeSort
4. List tasks will now use sort

#### `handleReorder()`

1. If activeSort !== "manual", warn and ask to switch
2. Call `getReorderChoice(tasks)`
3. Based on action:
   - "up": call `moveTaskUp(taskId)`
   - "down": call `moveTaskDown(taskId)`
   - "position": call `getNewPosition()`, then `moveTaskTo(taskId, position)`
4. Display success/failure message

### Extended Menu Loop

```javascript
async function main() {
  let viewState = {
    activeFilter: null,
    activeSort: "manual",
    searchQuery: null
  };

  while (true) {
    showHeader(viewState);
    const choice = await getMenuChoice();

    switch (choice) {
      case "1": await handleAddTask(); break;      // Extended with priority/tags
      case "2": await handleListTasks(viewState); break;  // Uses filter/sort
      case "3": await handleToggle(); break;
      case "4": await handleDelete(); break;
      case "5": await handleUpdate(); break;       // Extended with priority/tags
      case "6": await handleSearch(); break;       // NEW
      case "7": viewState = await handleFilter(viewState); break;  // NEW
      case "8": viewState = await handleSort(viewState); break;    // NEW
      case "9": await handleReorder(viewState); break;             // NEW
      case "10": handleExit(); return;
    }
  }
}
```

---

## Extended Flows

### Add Task Flow (Extended)

1. Get title (required)
2. Get description (optional)
3. Get priority (optional, default "none")
4. Get tags (optional, multi-select)
5. Create task
6. Show success

### Update Task Flow (Extended)

1. Select task
2. Show current values
3. Get new title (Enter to keep)
4. Get new description (Enter to keep)
5. Get new priority (Enter to keep)
6. Get new tags (Enter to keep)
7. Update task
8. Show success

### List Tasks Flow (Extended)

1. Get all tasks
2. Apply filter if viewState.activeFilter
3. Apply sort using viewState.activeSort
4. Show tasks with priority indicators and tag chips
5. Show filter/sort header if active

---

## Keyboard Shortcuts

| Key | Context | Action |
|-----|---------|--------|
| Enter | Menu | Select option |
| Space | Multi-select | Toggle selection |
| Escape | Any prompt | Cancel/Back |
| Ctrl+C | Any | Graceful exit |

---

## Color Scheme

### Priority Colors
- High: `chalk.red`
- Medium: `chalk.yellow`
- Low: `chalk.blue`
- None: default (no color)

### Tag Colors (Background)
- work: `chalk.bgCyan.black`
- home: `chalk.bgMagenta.white`
- personal: `chalk.bgGreen.black`
- custom: `chalk.bgYellow.black`

### Status Colors (unchanged from Phase 1)
- Completed: `chalk.green` (✓)
- Pending: `chalk.yellow` (○)

---

## Exports

### display.js
```javascript
export {
  // Existing
  showHeader,
  showDivider,
  showMainMenu,
  showTask,
  showTaskList,
  showEmptyState,
  showSuccess,
  showError,
  showInfo,
  showGoodbye,

  // New
  showPriorityIndicator,
  showTagChips,
  showFilterHeader,
  showSortHeader,
  showSearchResults,
  showNoResults
};
```

### prompts.js
```javascript
export {
  // Existing
  getMenuChoice,
  getNewTaskInput,
  selectTaskForToggle,
  selectTaskForDelete,
  selectTaskForUpdate,
  getUpdateInput,

  // New
  getPriorityChoice,
  getTagSelection,
  getCustomTagName,
  getSearchQuery,
  getFilterChoice,
  getSortChoice,
  getReorderChoice,
  getNewPosition
};
```
