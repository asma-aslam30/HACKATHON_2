# Implementation Plan: Todo App Organization Features

**Branch**: `002-task-organization` | **Date**: 2025-12-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-task-organization/spec.md`

## Summary

Extend the Phase 1 CLI Todo MVP with comprehensive organization features: priority levels (High/Medium/Low/None) with color coding, tags (predefined + custom) displayed as chips, keyword search across title/description, filtering by status/priority/tag, multiple sort options, and manual drag-drop reordering. All features integrate with the existing Node.js CLI using inquirer prompts and chalk colors.

## Technical Context

**Language/Version**: Node.js 18+ with ES Modules
**Primary Dependencies**: inquirer@^9 (prompts), chalk@^5 (colors), uuid@^9 (IDs)
**Storage**: JSON file (`data/tasks.json`) - extended schema
**Testing**: Manual testing per acceptance scenarios
**Target Platform**: Linux/macOS/Windows terminal with color support
**Project Type**: Single CLI application
**Performance Goals**: All operations <500ms, list render <1s for 100 tasks
**Constraints**: Single-user, local storage, no external services
**Scale/Scope**: Up to 1000 tasks, 10 tags per task, 50 custom tags max

## Constitution Check

*GATE: All checks passed ✅*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-First Development | ✅ PASS | Spec created before plan |
| II. AI-Implemented Only | ✅ PASS | All code will be AI-generated |
| III. Single Source of Truth | ✅ PASS | Spec and plan are authoritative |
| IV. Evolutionary Architecture | ✅ PASS | Extends Phase 1, no rewrite |
| V. Testability | ✅ PASS | 31 acceptance scenarios defined |
| VI. Observability | N/A | CLI app, no observability required |
| VII. Security by Design | ✅ PASS | No secrets, local file only |
| VIII. Incremental Delivery | ✅ PASS | P1/P2/P3 priorities defined |

## Project Structure

### Documentation (this feature)

```text
specs/002-task-organization/
├── spec.md                      # Feature specification
├── plan.md                      # This file
├── research.md                  # Technology decisions
├── data-model.md                # Extended schema
├── quickstart.md                # Usage guide
├── contracts/
│   ├── task-service.md          # Service API contract
│   └── cli-interface.md         # UI/UX contract
├── checklists/
│   └── requirements.md          # Quality checklist
└── tasks.md                     # Implementation tasks (/sp.tasks)
```

### Source Code (extending Phase 1)

```text
phases/phase-1/
├── src/
│   ├── index.js          # Main entry + menu loop (EXTEND)
│   ├── taskService.js    # CRUD + organization ops (EXTEND)
│   ├── display.js        # Colors + priority/tag display (EXTEND)
│   └── prompts.js        # Inquirer prompts (EXTEND)
├── data/
│   └── tasks.json        # Task storage (EXTEND schema)
├── package.json          # No changes needed
└── README.md             # Update with new features
```

**Structure Decision**: Extend existing Phase 1 files in-place. No new directories or files required. All changes are additive to existing modules.

## Implementation Phases

### Phase 1: Data Model & Service Extension (Foundation)

**Goal**: Extend Task schema and TaskService with new fields and methods.

**Tasks**:
1. Add constants (PRIORITIES, PRIORITY_COLORS, PREDEFINED_TAGS, SORT_TYPES)
2. Extend Task schema with priority, tags, sortOrder fields
3. Implement migration logic in loadTasks() for backward compatibility
4. Implement setPriority(id, priority) method
5. Implement tag methods: getAllTags(), getUsedTags(), createCustomTag()
6. Implement setTags(id, tags) method
7. Update createTask() to accept priority and tags
8. Update updateTask() to handle priority and tags

**Deliverables**:
- Extended taskService.js with all new methods
- Backward-compatible migration for existing tasks.json

### Phase 2: Priority Features (US1)

**Goal**: Users can set and view task priorities with color indicators.

**Tasks**:
1. Implement showPriorityIndicator(priority) in display.js
2. Update showTask() to display priority indicator
3. Implement getPriorityChoice() prompt in prompts.js
4. Update getNewTaskInput() to include priority selection
5. Update getUpdateInput() to include priority update
6. Integrate priority into Add Task handler
7. Integrate priority into Update Task handler

**Deliverables**:
- Priority indicators visible in task list
- Priority selection during add/update

### Phase 3: Tag Features (US2)

**Goal**: Users can add/remove tags and see them as colored chips.

**Tasks**:
1. Implement showTagChips() in display.js
2. Update showTask() to display tag chips
3. Implement getTagSelection() multi-select prompt
4. Implement getCustomTagName() prompt
5. Update getNewTaskInput() to include tag selection
6. Update getUpdateInput() to include tag update
7. Integrate tags into Add Task handler
8. Integrate tags into Update Task handler

**Deliverables**:
- Tag chips visible in task list
- Tag selection (multi) during add/update
- Custom tag creation

### Phase 4: Search Features (US3)

**Goal**: Users can search tasks by keyword.

**Tasks**:
1. Implement searchTasks(query) in taskService.js
2. Implement getSearchQuery() prompt in prompts.js
3. Implement showSearchResults() in display.js
4. Add menu option 6: Search Tasks
5. Implement handleSearch() in index.js
6. Handle no results case

**Deliverables**:
- Search menu option
- Case-insensitive search in title/description
- Results display with return to menu

### Phase 5: Filter Features (US4)

**Goal**: Users can filter task list by status, priority, or tag.

**Tasks**:
1. Implement filterTasks(filter) in taskService.js
2. Implement getFilterChoice() prompt in prompts.js
3. Implement showFilterHeader() in display.js
4. Add ViewState tracking (runtime)
5. Add menu option 7: Filter Tasks
6. Implement handleFilter() in index.js
7. Update handleListTasks() to apply filter
8. Implement Clear Filter option

**Deliverables**:
- Filter menu option
- Active filter indicator in header
- Filtered task list display

### Phase 6: Sort Features (US5)

**Goal**: Users can sort task list by various criteria.

**Tasks**:
1. Implement sortTasks(tasks, sortType) in taskService.js
2. Implement getSortChoice() prompt in prompts.js
3. Implement showSortHeader() in display.js
4. Add menu option 8: Sort Tasks
5. Implement handleSort() in index.js
6. Update handleListTasks() to apply sort
7. Implement secondary sort (tiebreaker)

**Deliverables**:
- Sort menu option
- Active sort indicator in header
- Sorted task list display

### Phase 7: Manual Reorder Features (US6)

**Goal**: Users can manually reorder tasks.

**Tasks**:
1. Implement moveTaskUp(id) in taskService.js
2. Implement moveTaskDown(id) in taskService.js
3. Implement moveTaskTo(id, position) in taskService.js
4. Implement getReorderChoice() prompt in prompts.js
5. Implement getNewPosition() prompt in prompts.js
6. Add menu option 9: Reorder Tasks
7. Implement handleReorder() in index.js
8. Clear sort when manually reordering

**Deliverables**:
- Reorder menu option
- Move up/down/to-position functionality
- Persistent manual order

### Phase 8: Polish & Integration

**Goal**: Handle edge cases and polish UX.

**Tasks**:
1. Update main menu to show options 1-10
2. Update header to show filter/sort indicators
3. Handle filter state across operations
4. Handle tag overflow (>5 tags display)
5. Test with 100+ tasks for performance
6. Update README.md with new features
7. Final integration testing

**Deliverables**:
- Complete feature integration
- Edge cases handled
- Updated documentation

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Filter state complexity | Medium | Medium | Keep ViewState in memory only, don't persist between sessions |
| Performance with many tasks | Low | Medium | JSON efficient for <1000 tasks; test with 100 tasks |
| Tag chip display overflow | Low | Low | Truncate to 3 tags with "+N more" |
| Color terminal support | Low | Low | chalk auto-detects; falls back gracefully |
| Backward compatibility | Low | High | Migration in loadTasks() applies defaults |

## Dependencies

### Phase Dependencies

```
Phase 1 (Foundation)
    ↓ BLOCKS ALL
    ├── Phase 2 (Priority) ──┬── Phase 5 (Filter)
    ├── Phase 3 (Tags) ──────┤
    ├── Phase 4 (Search) ────┘
    │       ↓
    └── Phase 6 (Sort) ──┬── Phase 7 (Reorder)
                         │
                         └── Phase 8 (Polish)
```

### External Dependencies

- Phase 1 CLI Todo MVP must be complete
- Node.js 18+ runtime
- Terminal with color support (optional but recommended)

## Success Criteria Mapping

| Spec Criteria | Implementation | Verification |
|---------------|----------------|--------------|
| SC-001: Priority <5s | Single selection prompt | Manual timing |
| SC-002: Search <10s | Substring search | Manual timing with 50+ tasks |
| SC-003: Ops <500ms | Native JS operations | Manual timing |
| SC-004: Visual distinction | chalk colors | Visual inspection |
| SC-005: Tags <10s | Multi-select prompt | Manual timing |
| SC-006: 100% persistence | JSON file save | Restart app, verify data |
| SC-007: Clear filter 1 action | "Clear Filter" menu option | Single selection |
| SC-008: 100 tasks display | List rendering | Create 100 tasks, list |

## Artifacts Produced

| Artifact | Location | Status |
|----------|----------|--------|
| Feature Spec | specs/002-task-organization/spec.md | ✅ Complete |
| Quality Checklist | specs/002-task-organization/checklists/requirements.md | ✅ Complete |
| Research | specs/002-task-organization/research.md | ✅ Complete |
| Data Model | specs/002-task-organization/data-model.md | ✅ Complete |
| Task Service Contract | specs/002-task-organization/contracts/task-service.md | ✅ Complete |
| CLI Interface Contract | specs/002-task-organization/contracts/cli-interface.md | ✅ Complete |
| Quickstart Guide | specs/002-task-organization/quickstart.md | ✅ Complete |
| Implementation Tasks | specs/002-task-organization/tasks.md | ⏳ Pending (/sp.tasks) |

## Next Steps

1. Run `/sp.tasks` to generate detailed implementation tasks
2. Execute tasks in phase order
3. Test each user story independently
4. Update README with new features
5. Create PHR for implementation work
