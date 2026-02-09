# Tasks: Todo App Core Essentials MVP - Phase 1 CLI

**Input**: Design documents from `/specs/001-cli-todo-mvp/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual testing as specified in user input. No automated test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Estimate**: 4-6 hours total

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md structure:
```
phases/phase-1/
├── src/
│   ├── index.js          # Entry point + main menu loop
│   ├── taskService.js    # CRUD operations + file persistence
│   ├── display.js        # Colored terminal output formatting
│   └── prompts.js        # Inquirer prompt definitions
├── data/
│   └── tasks.json        # Persisted task data
├── package.json
└── README.md
```

---

## Phase 1: Setup

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directory structure at phases/phase-1/ with src/, data/ subdirectories
- [x] T002 Initialize Node.js project with package.json at phases/phase-1/package.json (type: module, name: cli-todo-mvp)
- [x] T003 Install production dependencies (inquirer@^9, chalk@^5, uuid@^9) at phases/phase-1/
- [x] T004 [P] Create .gitignore at phases/phase-1/.gitignore to exclude node_modules/, data/tasks.json
- [x] T005 [P] Create README.md at phases/phase-1/README.md with project overview and usage instructions

---

## Phase 2: Foundational (Core Service Layer)

**Purpose**: TaskService that ALL user stories depend on - MUST complete before any user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create Task entity class/factory with id, title, description, completed, createdAt fields in phases/phase-1/src/taskService.js
- [x] T007 Implement loadTasks() - read and parse tasks.json, handle file not found, handle corrupted JSON with backup in phases/phase-1/src/taskService.js
- [x] T008 Implement saveTasks() - write tasks array to tasks.json with pretty-print JSON in phases/phase-1/src/taskService.js
- [x] T009 Implement createTask(input) - validate title, generate UUID, create timestamp, save to file in phases/phase-1/src/taskService.js
- [x] T010 Implement getAllTasks() - return all tasks array in phases/phase-1/src/taskService.js
- [x] T011 Implement getTaskById(id) - find task by ID or return null in phases/phase-1/src/taskService.js
- [x] T012 Implement toggleTask(id) - flip completed status, save to file in phases/phase-1/src/taskService.js
- [x] T013 Implement deleteTask(id) - remove task from array, save to file in phases/phase-1/src/taskService.js
- [x] T014 Implement updateTask(id, input) - update title/description, preserve completed/createdAt, save to file in phases/phase-1/src/taskService.js
- [x] T015 Implement hasAnyTasks() and getTaskCount() utility methods in phases/phase-1/src/taskService.js
- [x] T016 Export TaskService class/module from phases/phase-1/src/taskService.js

**Checkpoint**: TaskService ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Add New Task (Priority: P1) 🎯 MVP

**Goal**: User can add a new task with title and description via interactive prompts

**Independent Test**: Run app → Select "1. Add Task" → Enter title and description → Verify task appears in tasks.json

### Implementation for User Story 1

- [x] T017 [P] [US1] Create display module skeleton with showHeader(), showDivider(), showSuccess(), showError() functions using chalk in phases/phase-1/src/display.js
- [x] T018 [P] [US1] Create prompts module skeleton with getMenuChoice() function using inquirer in phases/phase-1/src/prompts.js
- [x] T019 [US1] Implement getNewTaskInput() prompt - ask for title (required, validate non-empty) and description (optional) in phases/phase-1/src/prompts.js
- [x] T020 [US1] Create main menu display with numbered options (1-6) using display.showMainMenu() in phases/phase-1/src/display.js
- [x] T021 [US1] Create entry point with main menu loop, import TaskService, display, prompts in phases/phase-1/src/index.js
- [x] T022 [US1] Implement Add Task menu handler - call prompts.getNewTaskInput(), taskService.createTask(), display success in phases/phase-1/src/index.js
- [x] T023 [US1] Add title validation error display "Title cannot be empty" in phases/phase-1/src/prompts.js

**Checkpoint**: User Story 1 complete - can add tasks and see them in tasks.json

---

## Phase 4: User Story 2 - List All Tasks (Priority: P1)

**Goal**: User can see all tasks with colored completion status indicators

**Independent Test**: Add tasks → Select "2. List Tasks" → Verify all tasks display with green (done) or yellow (pending) colors

### Implementation for User Story 2

- [x] T024 [US2] Implement showTask(task) - display [id] status title with colors (green ✓ for done, yellow ○ for pending) in phases/phase-1/src/display.js
- [x] T025 [US2] Implement showTaskList(tasks) - iterate tasks, call showTask for each, show count header in phases/phase-1/src/display.js
- [x] T026 [US2] Implement showEmptyState(message) - display "No tasks found. Add your first task!" message in phases/phase-1/src/display.js
- [x] T027 [US2] Implement List Tasks menu handler - get all tasks, show list or empty state in phases/phase-1/src/index.js

**Checkpoint**: User Story 2 complete - can list all tasks with colored status

---

## Phase 5: User Story 3 - Toggle Task Completion (Priority: P1)

**Goal**: User can mark tasks as complete or incomplete by selecting from a list

**Independent Test**: Add task → Select "3. Toggle Complete" → Select task → Verify status changes in tasks.json

### Implementation for User Story 3

- [x] T028 [US3] Implement selectTaskForToggle(tasks) - display task list with inquirer select, include "Back to menu" option in phases/phase-1/src/prompts.js
- [x] T029 [US3] Implement Toggle Complete menu handler - check for empty, show selector, call toggleTask(), display result in phases/phase-1/src/index.js
- [x] T030 [US3] Add success messages "Task marked as complete!" or "Task marked as pending!" based on new status in phases/phase-1/src/display.js

**Checkpoint**: User Story 3 complete - can toggle task completion status

---

## Phase 6: User Story 4 - Delete Task (Priority: P2)

**Goal**: User can delete tasks by selecting from a list

**Independent Test**: Add task → Select "4. Delete Task" → Select task → Verify task removed from tasks.json

### Implementation for User Story 4

- [x] T031 [US4] Implement selectTaskForDelete(tasks) - display task list with inquirer select, include "Back to menu" option in phases/phase-1/src/prompts.js
- [x] T032 [US4] Implement Delete Task menu handler - check for empty, show selector, call deleteTask(), display result in phases/phase-1/src/index.js
- [x] T033 [US4] Add success message "Task deleted!" and empty state "No tasks to delete" in phases/phase-1/src/display.js

**Checkpoint**: User Story 4 complete - can delete tasks

---

## Phase 7: User Story 5 - Update Task (Priority: P2)

**Goal**: User can edit task title and description

**Independent Test**: Add task → Select "5. Update Task" → Select task → Enter new values → Verify changes in tasks.json

### Implementation for User Story 5

- [x] T034 [US5] Implement selectTaskForUpdate(tasks) - display task list with inquirer select, include "Back to menu" option in phases/phase-1/src/prompts.js
- [x] T035 [US5] Implement getUpdateInput(currentTask) - prompt for new title/description, show current values, allow Enter to keep in phases/phase-1/src/prompts.js
- [x] T036 [US5] Implement Update Task menu handler - check for empty, show selector, get update input, call updateTask(), display result in phases/phase-1/src/index.js
- [x] T037 [US5] Add success message "Task updated!" and empty state "No tasks to update" in phases/phase-1/src/display.js

**Checkpoint**: User Story 5 complete - can update tasks

---

## Phase 8: User Story 6 - Exit Application (Priority: P3)

**Goal**: User can exit the application cleanly with a goodbye message

**Independent Test**: Select "6. Exit" → Verify goodbye message displays and app terminates

### Implementation for User Story 6

- [x] T038 [US6] Implement showGoodbye() - display farewell message with decorative borders in phases/phase-1/src/display.js
- [x] T039 [US6] Implement Exit menu handler - call showGoodbye(), process.exit(0) in phases/phase-1/src/index.js
- [x] T040 [US6] Add Ctrl+C handler for graceful exit with goodbye message in phases/phase-1/src/index.js

**Checkpoint**: User Story 6 complete - clean exit implemented

---

## Phase 9: Polish & Edge Cases

**Purpose**: Handle edge cases and polish the user experience

- [x] T041 Handle invalid menu input - display "Invalid option. Please enter 1-6." and re-show menu in phases/phase-1/src/index.js
- [x] T042 Handle tasks.json corrupted/invalid JSON - backup corrupted file, create fresh, warn user in phases/phase-1/src/taskService.js
- [x] T043 Handle file permission errors - display clear error message in phases/phase-1/src/taskService.js
- [x] T044 Truncate long task titles (>40 chars) in display with "..." in phases/phase-1/src/display.js
- [x] T045 Add ID shortening - show first 4 chars of UUID in task display in phases/phase-1/src/display.js
- [x] T046 Final manual test - run full CRUD cycle, restart app, verify persistence

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational - TaskService)
    ↓ BLOCKS ALL USER STORIES
    ├── Phase 3 (US1: Add Task) ──────┐
    │       ↓                          │
    ├── Phase 4 (US2: List Tasks) ←───┤ Can run after US1
    │       ↓                          │
    ├── Phase 5 (US3: Toggle) ←───────┤ Can run after US1
    │       ↓                          │
    ├── Phase 6 (US4: Delete) ←───────┤ Can run after US1
    │       ↓                          │
    ├── Phase 7 (US5: Update) ←───────┤ Can run after US1
    │       ↓                          │
    └── Phase 8 (US6: Exit) ←─────────┘
            ↓
    Phase 9 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Run In Parallel With |
|-------|------------|-------------------------|
| US1 (Add) | Phase 2 | - (first story) |
| US2 (List) | Phase 2, US1 (for display module) | US3, US4, US5, US6 |
| US3 (Toggle) | Phase 2, US1 | US2, US4, US5, US6 |
| US4 (Delete) | Phase 2, US1 | US2, US3, US5, US6 |
| US5 (Update) | Phase 2, US1 | US2, US3, US4, US6 |
| US6 (Exit) | Phase 2 | US2, US3, US4, US5 |

### Parallel Opportunities

**Within Phase 1 (Setup)**:
- T004 and T005 can run in parallel (different files)

**Within Phase 2 (Foundational)**:
- Tasks are sequential (same file: taskService.js)

**Within Phase 3 (US1)**:
- T017 and T018 can run in parallel (display.js and prompts.js)

**Across User Stories (after US1 complete)**:
- US2, US3, US4, US5, US6 can all start in parallel

---

## Parallel Example: After Foundational

```bash
# After Phase 2 complete, launch US1 first (sets up display/prompts modules)

# After US1 complete, these can run in parallel:
Task: T024 [US2] showTask() in display.js
Task: T028 [US3] selectTaskForToggle() in prompts.js
Task: T031 [US4] selectTaskForDelete() in prompts.js
Task: T034 [US5] selectTaskForUpdate() in prompts.js
Task: T038 [US6] showGoodbye() in display.js
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (~15 min)
2. Complete Phase 2: Foundational TaskService (~45 min)
3. Complete Phase 3: User Story 1 - Add Task (~30 min)
4. **STOP and VALIDATE**: Can add tasks, see them in tasks.json
5. Demo if ready - this is a functional MVP!

### Incremental Delivery

1. Setup + Foundational → Core service ready
2. Add US1 (Add) → Can add tasks ✓
3. Add US2 (List) → Can see tasks ✓
4. Add US3 (Toggle) → Can complete tasks ✓
5. Add US4 (Delete) → Can remove tasks ✓
6. Add US5 (Update) → Can edit tasks ✓
7. Add US6 (Exit) → Clean UX ✓
8. Polish → Edge cases handled ✓

---

## Summary

| Phase | Tasks | Parallel Opportunities |
|-------|-------|----------------------|
| Setup | 5 | T004, T005 |
| Foundational | 11 | None (same file) |
| US1 (Add) | 7 | T017, T018 |
| US2 (List) | 4 | All with other US |
| US3 (Toggle) | 3 | All with other US |
| US4 (Delete) | 3 | All with other US |
| US5 (Update) | 4 | All with other US |
| US6 (Exit) | 3 | All with other US |
| Polish | 6 | T044, T045 |
| **TOTAL** | **46** | Multiple opportunities |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after US1
- Manual testing specified (no automated test tasks)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies
