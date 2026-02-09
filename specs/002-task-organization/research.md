# Research: Todo App Organization Features

**Feature**: `002-task-organization`
**Date**: 2025-12-26
**Input**: Feature specification from `specs/002-task-organization/spec.md`

## Problem Statement

Extend the Phase 1 CLI Todo MVP with organization capabilities: priority levels, tags, search, filtering, sorting, and manual reordering. Users need to manage growing task lists efficiently with visual indicators and quick access to relevant subsets.

## Technology Decisions

### Existing Stack (Phase 1)
- **Runtime**: Node.js 18+ with ES Modules
- **CLI Prompts**: inquirer@^9 (interactive prompts)
- **Terminal Colors**: chalk@^5 (colored output)
- **ID Generation**: uuid@^9 (unique identifiers)
- **Persistence**: JSON file (tasks.json)

### New Dependencies Required

#### None Required
The existing stack is sufficient for all organization features:
- **chalk** already supports colors for priority indicators
- **inquirer** already supports list selection for filters/sort
- **fs** already handles JSON persistence
- No additional packages needed

### Rationale

| Requirement | Solution | Why |
|-------------|----------|-----|
| Priority colors (Red/Orange/Blue) | chalk.red/yellow/blue | Already installed, supports all required colors |
| Tag chips display | chalk.bgCyan, chalk.bgMagenta, etc. | Background colors create chip-like appearance |
| Search | String.includes() with toLowerCase() | Built-in, case-insensitive, simple and fast |
| Filter UI | inquirer select/list prompt | Already installed, perfect for filter menus |
| Sort | Array.sort() with custom comparators | Built-in, no external dependency needed |
| Drag-drop (CLI) | inquirer number prompt for position | CLI equivalent of drag-drop is move-to-position |

## Data Model Extensions

### Task Entity Changes
```javascript
// Existing fields (Phase 1)
{
  id: "uuid",           // unchanged
  title: "string",      // unchanged
  description: "string", // unchanged
  completed: false,     // unchanged
  createdAt: timestamp  // unchanged
}

// New fields (Phase 2)
{
  priority: "high" | "medium" | "low" | "none",  // default: "none"
  tags: ["string"],     // array of tag names, default: []
  sortOrder: number     // manual position, default: Date.now()
}
```

### Tag Entity (New)
```javascript
{
  name: "string",       // unique identifier (lowercase, trimmed)
  color: "string",      // chalk color name (cyan, magenta, green, etc.)
  type: "predefined" | "custom"
}
```

### Predefined Tags
```javascript
const PREDEFINED_TAGS = [
  { name: "work", color: "cyan", type: "predefined" },
  { name: "home", color: "magenta", type: "predefined" },
  { name: "personal", color: "green", type: "predefined" }
];
```

### View State (Runtime Only - Not Persisted)
```javascript
{
  activeFilter: { type: "status" | "priority" | "tag", value: any } | null,
  activeSort: "priority" | "alpha" | "date" | "status" | "manual",
  searchQuery: string | null
}
```

## Migration Strategy

### Backward Compatibility
- Existing tasks.json files without new fields remain valid
- loadTasks() applies defaults:
  - `priority: "none"` if missing
  - `tags: []` if missing
  - `sortOrder: createdAt` if missing (preserves creation order)

### Migration Script: Not Required
- Schema migration happens automatically on load
- No separate migration step needed
- First save after load will write updated schema

## UI/UX Design

### Priority Display
```
[abc1] ● High   Buy groceries            [work] [home]
[def2] ◐ Medium Review documents         [work]
[ghi3] ○ Low    Clean garage             [home]
[jkl4]          Call dentist             [personal]
```

Legend:
- `●` Red filled circle = High priority
- `◐` Yellow half circle = Medium priority
- `○` Blue empty circle = Low priority
- No icon = None priority

### Tag Chips
```
[work]     - cyan background
[home]     - magenta background
[personal] - green background
[custom]   - yellow background (user-defined)
```

### Menu Extensions

#### Main Menu (Extended)
```
📋 Todo CLI - [5 tasks]

1. Add Task
2. List Tasks
3. Toggle Complete
4. Delete Task
5. Update Task
6. 🔍 Search Tasks      [NEW]
7. 🏷️  Filter Tasks     [NEW]
8. 📊 Sort Tasks        [NEW]
9. ↕️  Reorder Tasks    [NEW]
10. Exit

Select an option:
```

#### Filter Submenu
```
🏷️  Filter Tasks

Filter by:
  ○ Status (Pending/Completed)
  ○ Priority (High/Medium/Low/None)
  ○ Tag (work/home/personal/custom)
  ○ Clear Filter
  ○ Back to Menu
```

#### Sort Submenu
```
📊 Sort Tasks

Sort by:
  ○ Priority (High → Low)
  ○ Alphabetical (A → Z)
  ○ Date Created (Newest First)
  ○ Status (Pending First)
  ○ Manual Order
  ○ Back to Menu
```

## Implementation Phases

### Phase 1: Model & Service Extension (Foundation)
- Extend Task schema with priority, tags, sortOrder
- Add migration logic to loadTasks()
- Implement TagService for tag management
- Add predefined tags initialization

### Phase 2: Priority Features (US1)
- Add priority prompt during task creation
- Add priority selection during task update
- Implement priority color display
- Update task list formatting

### Phase 3: Tag Features (US2)
- Add tag prompt during task creation (multi-select)
- Add tag management during task update
- Implement tag chip display
- Handle custom tag creation

### Phase 4: Search Feature (US3)
- Implement keyword search function
- Add search menu option
- Display search results
- Handle no-results state

### Phase 5: Filter Feature (US4)
- Implement filter by status
- Implement filter by priority
- Implement filter by tag
- Add filter indicator to list header
- Implement clear filter

### Phase 6: Sort Feature (US5)
- Implement sort comparators (priority, alpha, date, status)
- Add sort menu option
- Persist sort preference (optional)
- Auto-sort on task changes

### Phase 7: Manual Reorder (US6)
- Implement move up/down functions
- Add reorder menu option
- Update sortOrder field
- Clear sort when manually reordering

### Phase 8: Polish & Edge Cases
- Handle filter/sort state persistence
- Test all edge cases from spec
- Validate performance with 100+ tasks

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Filter state complexity | Medium | Keep view state in memory, don't persist between sessions |
| Tag overflow (>5 tags) | Low | Truncate display with "+N more" |
| Performance with many tasks | Low | JSON file is efficient for <1000 tasks |
| Color terminal support | Low | chalk auto-detects; fallback to plain text |

## Alternatives Considered

### External Search Library (Rejected)
- **Option**: Use fuse.js or lunr for fuzzy search
- **Rejected because**: Simple substring search is sufficient for task titles
- **Revisit if**: Users request typo-tolerant search

### SQLite for Persistence (Rejected)
- **Option**: Migrate from JSON to SQLite
- **Rejected because**: Adds complexity; JSON sufficient for single-user CLI
- **Revisit if**: Performance issues with >1000 tasks

### Tag Normalization (Deferred)
- **Option**: Normalize tags (lowercase, trim, dedupe)
- **Decision**: Implement basic normalization (lowercase, trim)
- **Defer**: Advanced normalization (synonyms, plurals)

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Priority assignment time | <5s | Manual timing |
| Search response time | <500ms | Console timing |
| Filter application time | <500ms | Console timing |
| Sort application time | <500ms | Console timing |
| Task list with 100 items | Renders <1s | Manual timing |

## References

- Phase 1 Implementation: `phases/phase-1/src/`
- Feature Spec: `specs/002-task-organization/spec.md`
- Constitution: `.specify/memory/constitution.md`
