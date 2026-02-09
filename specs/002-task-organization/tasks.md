# Tasks: Todo App Organization Features

**Input**: Design documents from `/specs/002-task-organization/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual testing as specified in acceptance scenarios. No automated test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Estimate**: 10-14 hours total

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md structure (extending Phase 1):
```
phases/phase-1/
├── src/
│   ├── index.js          # Entry point + main menu loop
│   ├── taskService.js    # CRUD + organization operations
│   ├── display.js        # Colored terminal output formatting
│   └── prompts.js        # Inquirer prompt definitions
├── data/
│   └── tasks.json        # Persisted task data (extended schema)
├── package.json
└── README.md
```

---

## Phase 1: Setup

**Purpose**: Prepare Phase 1 codebase for organization features extension

- [x] T001 Verify Phase 1 CLI Todo MVP is complete and running in phases/phase-1/
- [x] T002 [P] Create backup of existing tasks.json for migration testing in phases/phase-1/data/tasks.backup.json

---

## Phase 2: Foundational (Data Model & Service Extension)

**Purpose**: Extend Task schema and TaskService with new fields and methods - MUST complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Add PRIORITIES constant array ['high', 'medium', 'low', 'none'] in phases/phase-1/src/taskService.js
- [x] T004 Add PRIORITY_COLORS constant mapping { high: 'red', medium: 'yellow', low: 'blue', none: null } in phases/phase-1/src/taskService.js
- [x] T005 Add PREDEFINED_TAGS constant array with work/home/personal objects in phases/phase-1/src/taskService.js
- [x] T006 Add SORT_TYPES constant array ['priority', 'alpha', 'date', 'status', 'manual'] in phases/phase-1/src/taskService.js
- [x] T007 Extend Task schema with priority, tags, sortOrder fields in createTask() default values in phases/phase-1/src/taskService.js
- [x] T008 Implement migration logic in loadTasks() to add default priority/tags/sortOrder to existing tasks in phases/phase-1/src/taskService.js
- [x] T009 Add customTags array to storage structure in loadTasks()/saveTasks() in phases/phase-1/src/taskService.js
- [x] T010 Export all new constants from phases/phase-1/src/taskService.js

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Set Task Priority (Priority: P1) 🎯 MVP

**Goal**: Users can assign priority levels (High/Medium/Low/None) to tasks and see color indicators

**Independent Test**: Create a task, set priority to High, verify priority is displayed with red color indicator and persists after restart

### Implementation for User Story 1

- [x] T011 [P] [US1] Implement showPriorityIndicator(priority) function returning colored symbol (●/◐/○) in phases/phase-1/src/display.js
- [x] T012 [P] [US1] Implement getPriorityChoice(currentPriority) prompt with inquirer select in phases/phase-1/src/prompts.js
- [x] T013 [US1] Update showTask(task) to display priority indicator before title in phases/phase-1/src/display.js
- [x] T014 [US1] Update getNewTaskInput() to include priority selection after description in phases/phase-1/src/prompts.js
- [x] T015 [US1] Update getUpdateInput(currentTask) to include priority update option in phases/phase-1/src/prompts.js
- [x] T016 [US1] Update handleAddTask() to pass priority to createTask() in phases/phase-1/src/index.js
- [x] T017 [US1] Update handleUpdate() to pass priority to updateTask() in phases/phase-1/src/index.js

**Checkpoint**: User Story 1 complete - priorities visible and selectable

---

## Phase 4: User Story 2 - Add Tags to Tasks (Priority: P1)

**Goal**: Users can add/remove tags (work/home/personal/custom) and see them as colored chips

**Independent Test**: Create a task with multiple tags, verify tags display as chips, and persist after restart

### Implementation for User Story 2

- [x] T018 [P] [US2] Implement getAllTags() returning predefined + custom tags in phases/phase-1/src/taskService.js
- [x] T019 [P] [US2] Implement createCustomTag(name) adding to customTags array in phases/phase-1/src/taskService.js
- [x] T020 [P] [US2] Implement showTagChips(tags, maxShow=3) returning colored chip strings in phases/phase-1/src/display.js
- [x] T021 [P] [US2] Implement getTagSelection(availableTags, currentTags) multi-select prompt in phases/phase-1/src/prompts.js
- [x] T022 [P] [US2] Implement getCustomTagName() prompt with validation in phases/phase-1/src/prompts.js
- [x] T023 [US2] Update showTask(task) to display tag chips after title in phases/phase-1/src/display.js
- [x] T024 [US2] Update getNewTaskInput() to include tag selection (with custom tag option) in phases/phase-1/src/prompts.js
- [x] T025 [US2] Update getUpdateInput(currentTask) to include tag update option in phases/phase-1/src/prompts.js
- [x] T026 [US2] Update handleAddTask() to pass tags to createTask() in phases/phase-1/src/index.js
- [x] T027 [US2] Update handleUpdate() to pass tags to updateTask() in phases/phase-1/src/index.js

**Checkpoint**: User Story 2 complete - tags visible and selectable with custom creation

---

## Phase 5: User Story 3 - Search Tasks (Priority: P1)

**Goal**: Users can search tasks by keyword in title or description

**Independent Test**: Create multiple tasks, search for a keyword in one task's title, verify only matching tasks displayed

### Implementation for User Story 3

- [x] T028 [P] [US3] Implement searchTasks(query) returning matching tasks (case-insensitive) in phases/phase-1/src/taskService.js
- [x] T029 [P] [US3] Implement getSearchQuery() prompt in phases/phase-1/src/prompts.js
- [x] T030 [P] [US3] Implement showSearchResults(tasks, query) with match highlighting in phases/phase-1/src/display.js
- [x] T031 [P] [US3] Implement showNoResults(type, query) for empty search/filter results in phases/phase-1/src/display.js
- [x] T032 [US3] Add menu option 6 "Search Tasks" to showMainMenu() in phases/phase-1/src/display.js
- [x] T033 [US3] Update getMenuChoice() to handle option 6 in phases/phase-1/src/prompts.js
- [x] T034 [US3] Implement handleSearch() calling searchTasks and showSearchResults in phases/phase-1/src/index.js
- [x] T035 [US3] Add case 6 to menu switch calling handleSearch() in phases/phase-1/src/index.js

**Checkpoint**: User Story 3 complete - search works with keyword matching

---

## Phase 6: User Story 4 - Filter Tasks (Priority: P2)

**Goal**: Users can filter task list by status, priority, or tag

**Independent Test**: Create tasks with different statuses/priorities/tags, apply a filter, verify only matching tasks shown

### Implementation for User Story 4

- [x] T036 [P] [US4] Implement filterTasks(tasks, filter) returning filtered array in phases/phase-1/src/taskService.js
- [x] T037 [P] [US4] Implement getFilterChoice(usedTags) prompt with status/priority/tag options in phases/phase-1/src/prompts.js
- [x] T038 [P] [US4] Implement showFilterHeader(filter) returning active filter indicator in phases/phase-1/src/display.js
- [x] T039 [US4] Add ViewState object { activeFilter, activeSort, searchQuery } to main() in phases/phase-1/src/index.js
- [x] T040 [US4] Add menu option 7 "Filter Tasks" to showMainMenu() in phases/phase-1/src/display.js
- [x] T041 [US4] Update getMenuChoice() to handle option 7 in phases/phase-1/src/prompts.js
- [x] T042 [US4] Implement handleFilter(viewState) updating activeFilter in phases/phase-1/src/index.js
- [x] T043 [US4] Update handleListTasks(viewState) to apply filter before display in phases/phase-1/src/index.js
- [x] T044 [US4] Add case 7 to menu switch calling handleFilter() in phases/phase-1/src/index.js
- [x] T045 [US4] Update showHeader(viewState) to include filter indicator in phases/phase-1/src/display.js

**Checkpoint**: User Story 4 complete - filters work with clear indicator

---

## Phase 7: User Story 5 - Sort Tasks (Priority: P2)

**Goal**: Users can sort task list by priority, alphabetical, date, or status

**Independent Test**: Create tasks with different priorities, sort by priority, verify High priority tasks appear first

### Implementation for User Story 5

- [x] T046 [P] [US5] Implement sortTasks(tasks, sortType) with comparators for all types in phases/phase-1/src/taskService.js
- [x] T047 [P] [US5] Implement getSortChoice() prompt with all sort options in phases/phase-1/src/prompts.js
- [x] T048 [P] [US5] Implement showSortHeader(sortType) returning active sort indicator in phases/phase-1/src/display.js
- [x] T049 [US5] Add menu option 8 "Sort Tasks" to showMainMenu() in phases/phase-1/src/display.js
- [x] T050 [US5] Update getMenuChoice() to handle option 8 in phases/phase-1/src/prompts.js
- [x] T051 [US5] Implement handleSort(viewState) updating activeSort in phases/phase-1/src/index.js
- [x] T052 [US5] Update handleListTasks(viewState) to apply sort after filter in phases/phase-1/src/index.js
- [x] T053 [US5] Add case 8 to menu switch calling handleSort() in phases/phase-1/src/index.js
- [x] T054 [US5] Update showHeader(viewState) to include sort indicator in phases/phase-1/src/display.js

**Checkpoint**: User Story 5 complete - sorts work with clear indicator

---

## Phase 8: User Story 6 - Manual Task Reordering (Priority: P3)

**Goal**: Users can manually reorder tasks (move up/down/to position)

**Independent Test**: Create multiple tasks, move one task up or down, verify the new order persists after restart

### Implementation for User Story 6

- [x] T055 [P] [US6] Implement moveTaskUp(id) swapping sortOrder with previous task in phases/phase-1/src/taskService.js
- [x] T056 [P] [US6] Implement moveTaskDown(id) swapping sortOrder with next task in phases/phase-1/src/taskService.js
- [x] T057 [P] [US6] Implement moveTaskTo(id, position) recalculating sortOrder in phases/phase-1/src/taskService.js
- [x] T058 [P] [US6] Implement getReorderChoice(tasks) prompt to select task and action in phases/phase-1/src/prompts.js
- [x] T059 [P] [US6] Implement getNewPosition(max) prompt for move-to-position in phases/phase-1/src/prompts.js
- [x] T060 [US6] Add menu option 9 "Reorder Tasks" to showMainMenu() in phases/phase-1/src/display.js
- [x] T061 [US6] Update getMenuChoice() to handle option 9 in phases/phase-1/src/prompts.js
- [x] T062 [US6] Implement handleReorder(viewState) calling move functions in phases/phase-1/src/index.js
- [x] T063 [US6] Add case 9 to menu switch calling handleReorder() in phases/phase-1/src/index.js
- [x] T064 [US6] Clear activeSort when manual reorder applied in handleReorder() in phases/phase-1/src/index.js

**Checkpoint**: User Story 6 complete - manual reorder works and persists

---

## Phase 9: Polish & Integration

**Purpose**: Handle edge cases and polish UX

- [x] T065 Update Exit menu option from 6 to 10 in phases/phase-1/src/display.js
- [x] T066 Update getMenuChoice() validation for options 1-10 in phases/phase-1/src/prompts.js
- [x] T067 Update Exit handler case from 6 to 10 in phases/phase-1/src/index.js
- [x] T068 Handle tag overflow (>5 tags) with "+N more" in showTagChips() in phases/phase-1/src/display.js
- [x] T069 Handle special characters in search (escape regex) in searchTasks() in phases/phase-1/src/taskService.js
- [x] T070 Handle invalid filter (tag doesn't exist) with auto-clear in handleListTasks() in phases/phase-1/src/index.js
- [x] T071 Implement secondary sort (date tiebreaker) in sortTasks() in phases/phase-1/src/taskService.js
- [x] T072 [P] Update phases/phase-1/README.md with new features documentation
- [x] T073 Final manual test - run full organization workflow, restart, verify persistence

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational - Service Extension)
    ↓ BLOCKS ALL USER STORIES
    ├── Phase 3 (US1: Priority) ────┐
    │       ↓                        │
    ├── Phase 4 (US2: Tags) ────────┤ P1 stories (can run after Phase 2)
    │       ↓                        │
    ├── Phase 5 (US3: Search) ──────┘
    │       ↓
    ├── Phase 6 (US4: Filter) ──────┐ P2 stories (depends on Priority/Tags)
    │       ↓                        │
    ├── Phase 7 (US5: Sort) ────────┘
    │       ↓
    └── Phase 8 (US6: Reorder) ───── P3 story (depends on Sort)
            ↓
    Phase 9 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Run In Parallel With |
|-------|------------|--------------------------|
| US1 (Priority) | Phase 2 | US2, US3 |
| US2 (Tags) | Phase 2 | US1, US3 |
| US3 (Search) | Phase 2 | US1, US2 |
| US4 (Filter) | US1, US2 | US5 |
| US5 (Sort) | US1 | US4 |
| US6 (Reorder) | US5 | - |

### Parallel Opportunities

**Within Phase 2 (Foundational)**:
- T003, T004, T005, T006 can run in parallel (different constants)

**Within Phase 3 (US1 Priority)**:
- T011, T012 can run in parallel (display.js and prompts.js)

**Within Phase 4 (US2 Tags)**:
- T018, T019 can run in parallel (different functions in taskService.js)
- T020, T021, T022 can run in parallel (display.js and prompts.js)

**Within Phase 5 (US3 Search)**:
- T028, T029, T030, T031 can run in parallel (different files)

**Within Phase 6 (US4 Filter)**:
- T036, T037, T038 can run in parallel (different files)

**Within Phase 7 (US5 Sort)**:
- T046, T047, T048 can run in parallel (different files)

**Within Phase 8 (US6 Reorder)**:
- T055, T056, T057 can run in parallel (independent functions)
- T058, T059 can run in parallel (prompts.js different functions)

---

## Parallel Example: After Foundational

```bash
# After Phase 2 complete, these P1 stories can run in parallel:
Task: T011 [P] [US1] showPriorityIndicator() in display.js
Task: T018 [P] [US2] getAllTags() in taskService.js
Task: T028 [P] [US3] searchTasks() in taskService.js
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup (~5 min)
2. Complete Phase 2: Foundational (~30 min)
3. Complete Phase 3: User Story 1 - Priority (~1 hr)
4. Complete Phase 4: User Story 2 - Tags (~1.5 hr)
5. Complete Phase 5: User Story 3 - Search (~1 hr)
6. **STOP and VALIDATE**: All P1 features working
7. Demo if ready - this is a functional MVP with core organization!

### Incremental Delivery

1. Setup + Foundational → Core service ready
2. Add US1 (Priority) → Can set/see priorities ✓
3. Add US2 (Tags) → Can categorize tasks ✓
4. Add US3 (Search) → Can find tasks ✓
5. Add US4 (Filter) → Can focus on subsets ✓
6. Add US5 (Sort) → Can order tasks ✓
7. Add US6 (Reorder) → Can customize order ✓
8. Polish → Edge cases handled ✓

---

## Summary

| Phase | Tasks | Parallel Opportunities |
|-------|-------|------------------------|
| Setup | 2 | T002 |
| Foundational | 8 | T003-T006 |
| US1 (Priority) | 7 | T011, T012 |
| US2 (Tags) | 10 | T018-T022 |
| US3 (Search) | 8 | T028-T031 |
| US4 (Filter) | 10 | T036-T038 |
| US5 (Sort) | 9 | T046-T048 |
| US6 (Reorder) | 10 | T055-T059 |
| Polish | 9 | T072 |
| **TOTAL** | **73** | Multiple opportunities |

---

## Testing Approach

Per user input request for testing filter combos and search accuracy:

### Filter Combo Tests (Manual)
1. Create tasks with varied priorities and tags
2. Apply filter by status → verify only matching tasks
3. Apply filter by priority → verify only matching tasks
4. Apply filter by tag → verify only matching tasks
5. Clear filter → verify all tasks return

### Search Accuracy Tests (Manual)
1. Create tasks with unique keywords in title
2. Create tasks with keywords only in description
3. Search for exact match → verify found
4. Search with mixed case → verify case-insensitive
5. Search for non-existent keyword → verify "no results"
6. Search with special characters → verify no regex errors

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after Phase 2
- Manual testing specified per acceptance scenarios (no automated test tasks)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies
