# Tasks: Todo App Power User Enhancements

**Input**: Design documents from `/specs/004-power-user-enhancements/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/cli-contract.md, research.md
**Branch**: `004-power-user-enhancements`

**Tests**: Manual acceptance testing per spec (no automated test framework in current phase)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

All paths are relative to `phases/phase-1/`:
- Source: `src/`
- Data: `data/`
- Config: `package.json`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: New service module scaffolding for power user features

- [X] T001 [P] Create templateService.js skeleton with exports in phases/phase-1/src/templateService.js
- [X] T002 [P] Create timerService.js skeleton with exports in phases/phase-1/src/timerService.js
- [X] T003 [P] Create keyboardService.js skeleton with exports in phases/phase-1/src/keyboardService.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema migration and shared data structures that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Add schema migration for Phase 4 fields (subtasks, timeEntries, totalTimeMs) in phases/phase-1/src/taskService.js migrateTask()
- [X] T005 Add root-level schema initialization (templates, pomodoroConfig, activeTimerState) in phases/phase-1/src/taskService.js loadTasks()
- [X] T006 Add formatDuration(ms) helper function returning "Xh Ym" or "Xm" format in phases/phase-1/src/display.js

**Checkpoint**: Foundation ready - user story implementation can now proceed in priority order

---

## Phase 3: User Story 1 - Task Templates (Priority: P1)

**Goal**: Users can save task configurations as templates and create new tasks from templates

**Independent Test**: Create a template, then create a new task from that template. Verify all template properties are applied.

### Implementation for User Story 1

- [X] T007 [US1] Implement createTemplate(input) function validating name uniqueness in phases/phase-1/src/templateService.js
- [X] T008 [US1] Implement getAllTemplates() returning templates sorted alphabetically in phases/phase-1/src/templateService.js
- [X] T009 [US1] Implement getTemplateById(id) and getTemplateByName(name) in phases/phase-1/src/templateService.js
- [X] T010 [US1] Implement updateTemplate(id, input) with name conflict check in phases/phase-1/src/templateService.js
- [X] T011 [US1] Implement deleteTemplate(id) in phases/phase-1/src/templateService.js
- [X] T012 [US1] Implement createTaskFromTemplate(templateId) returning TaskInput in phases/phase-1/src/templateService.js
- [X] T013 [P] [US1] Add selectTemplate(templates) prompt returning template ID in phases/phase-1/src/prompts.js
- [X] T014 [P] [US1] Add getTemplateInput(fromTask?) prompt for template creation in phases/phase-1/src/prompts.js
- [X] T015 [P] [US1] Add confirmTemplateOverwrite(name) prompt in phases/phase-1/src/prompts.js
- [X] T016 [P] [US1] Add showTemplateList(templates) display function in phases/phase-1/src/display.js
- [X] T017 [P] [US1] Add showTemplateDetails(template) display function in phases/phase-1/src/display.js
- [X] T018 [US1] Add menu option 11 "Templates" with submenu (Create, List, Edit, Delete, Create Task From) in phases/phase-1/src/index.js
- [X] T019 [US1] Implement handleTemplates() function with template CRUD operations in phases/phase-1/src/index.js
- [X] T020 [US1] Extend handleAddTask() to offer "Create from template" option in phases/phase-1/src/index.js

**Checkpoint**: User Story 1 complete - users can save/load task templates

---

## Phase 4: User Story 2 - Subtasks with Nested Checkboxes (Priority: P1)

**Goal**: Users can add subtasks to any task and track completion progress

**Independent Test**: Create a parent task, add 3 subtasks, complete 2 of them, verify progress shows "2/3"

### Implementation for User Story 2

- [X] T021 [US2] Implement addSubtask(taskId, title) validating 20-subtask limit in phases/phase-1/src/taskService.js
- [X] T022 [US2] Implement toggleSubtask(taskId, subtaskId) in phases/phase-1/src/taskService.js
- [X] T023 [US2] Implement deleteSubtask(taskId, subtaskId) in phases/phase-1/src/taskService.js
- [X] T024 [US2] Implement getSubtaskProgress(taskId) returning {completed, total, percentage} in phases/phase-1/src/taskService.js
- [X] T025 [US2] Extend toggleTask() to auto-complete all subtasks when parent completed in phases/phase-1/src/taskService.js
- [X] T026 [P] [US2] Add getSubtaskTitle() prompt in phases/phase-1/src/prompts.js
- [X] T027 [P] [US2] Add selectSubtask(subtasks) prompt returning subtask ID in phases/phase-1/src/prompts.js
- [X] T028 [P] [US2] Add showSubtasks(subtasks) display with indented checkboxes in phases/phase-1/src/display.js
- [X] T029 [P] [US2] Add showSubtaskProgress(progress) returning "[2/5]" format in phases/phase-1/src/display.js
- [X] T030 [US2] Update showTask() to include subtask progress indicator in phases/phase-1/src/display.js
- [X] T031 [US2] Add subtask management to handleUpdateTask() (Add/Toggle/Delete subtask) in phases/phase-1/src/index.js
- [X] T032 [US2] Update handleToggleTask() to allow toggling subtasks in phases/phase-1/src/index.js

**Checkpoint**: User Story 2 complete - users can create and manage subtasks

---

## Phase 5: User Story 3 - Time Tracking per Task (Priority: P2)

**Goal**: Users can start/stop a timer on tasks to track time spent

**Independent Test**: Start timer on a task, wait 30 seconds, stop it, verify duration recorded

### Implementation for User Story 3

- [X] T033 [US3] Implement startTimer(taskId) in phases/phase-1/src/timerService.js
- [X] T034 [US3] Implement stopTimer() creating TimeEntry and updating totalTimeMs in phases/phase-1/src/timerService.js
- [X] T035 [US3] Implement getActiveTimer() returning current timer state in phases/phase-1/src/timerService.js
- [X] T036 [US3] Implement getElapsedTime() returning milliseconds since timer started in phases/phase-1/src/timerService.js
- [X] T037 [US3] Implement recoverOrphanedTimer() for app startup recovery in phases/phase-1/src/timerService.js
- [X] T038 [US3] Implement saveTimerState() and loadTimerState() for persistence in phases/phase-1/src/timerService.js
- [X] T039 [P] [US3] Add confirmTimerRecovery(taskTitle, elapsedMs) prompt in phases/phase-1/src/prompts.js
- [X] T040 [P] [US3] Add selectTaskForTimer(tasks) prompt in phases/phase-1/src/prompts.js
- [X] T041 [P] [US3] Add showActiveTimer(taskTitle, elapsedMs) display in phases/phase-1/src/display.js
- [X] T042 [P] [US3] Add showTaskTime(totalTimeMs) display for task view in phases/phase-1/src/display.js
- [X] T043 [US3] Add menu option 12 "Start/Stop Timer" in phases/phase-1/src/index.js
- [X] T044 [US3] Implement handleTimer() for timer start/stop flow in phases/phase-1/src/index.js
- [X] T045 [US3] Add timer recovery check on app startup in phases/phase-1/src/index.js startApp()
- [X] T046 [US3] Update SIGINT/SIGTERM handlers to auto-stop timer and save in phases/phase-1/src/index.js

**Checkpoint**: User Story 3 complete - users can track time on tasks

---

## Phase 6: User Story 4 - Pomodoro Timer (Priority: P2)

**Goal**: Users can use Pomodoro technique with 25min work / 5min break cycles

**Independent Test**: Start Pomodoro, verify countdown, observe work-to-break transition notification

### Implementation for User Story 4

- [X] T047 [US4] Implement startPomodoro(taskId?) in phases/phase-1/src/timerService.js
- [X] T048 [US4] Implement cancelPomodoro() in phases/phase-1/src/timerService.js
- [X] T049 [US4] Implement getPomodoroState() returning active/type/remainingMs/linkedTaskId in phases/phase-1/src/timerService.js
- [X] T050 [US4] Implement completePomodoroWork() incrementing today count and starting break in phases/phase-1/src/timerService.js
- [X] T051 [US4] Implement completePomodoroBreak() in phases/phase-1/src/timerService.js
- [X] T052 [US4] Implement getPomodoroConfig() and updatePomodoroConfig() in phases/phase-1/src/timerService.js
- [X] T053 [US4] Implement getTodayPomodoroCount() with daily reset check in phases/phase-1/src/timerService.js
- [X] T054 [US4] Implement Pomodoro timeout scheduling with work/break transitions in phases/phase-1/src/timerService.js
- [X] T055 [P] [US4] Add getPomodoroConfigInput(current) prompt for settings in phases/phase-1/src/prompts.js
- [X] T056 [P] [US4] Add showPomodoroStatus(state) display with countdown in phases/phase-1/src/display.js
- [X] T057 [P] [US4] Add showPomodoroCount(count) display with tomato icons in phases/phase-1/src/display.js
- [X] T058 [US4] Add Pomodoro notifications using existing notificationService in phases/phase-1/src/timerService.js
- [X] T059 [US4] Add menu option 13 "Pomodoro" with submenu (Start, Cancel, Settings, Stats) in phases/phase-1/src/index.js
- [X] T060 [US4] Implement handlePomodoro() for Pomodoro workflow in phases/phase-1/src/index.js

**Checkpoint**: User Story 4 complete - users can use Pomodoro technique

---

## Phase 7: User Story 5 - Keyboard Shortcuts (Priority: P3)

**Goal**: Users can use keyboard shortcuts for common actions

**Independent Test**: Press 'N' to verify Add Task starts, press '/' for search, press '?' for help

### Implementation for User Story 5

- [X] T061 [US5] Implement initKeyboard() with TTY detection and readline setup in phases/phase-1/src/keyboardService.js
- [X] T062 [US5] Implement disableKeyboard() and enableKeyboard() for prompt toggle in phases/phase-1/src/keyboardService.js
- [X] T063 [US5] Implement registerShortcut(key, description, handler) in phases/phase-1/src/keyboardService.js
- [X] T064 [US5] Implement getShortcuts() returning registered shortcuts for help in phases/phase-1/src/keyboardService.js
- [X] T065 [US5] Implement handleKeypress(key, keyInfo) dispatcher in phases/phase-1/src/keyboardService.js
- [X] T066 [P] [US5] Add showShortcutHelp(shortcuts) overlay display in phases/phase-1/src/display.js
- [X] T067 [US5] Register shortcuts: N(add), /(search), ?(help), Q(quit), X(toggle), T(timer), P(pomodoro) in phases/phase-1/src/index.js
- [X] T068 [US5] Integrate keyboard initialization in startApp() with fallback message in phases/phase-1/src/index.js
- [X] T069 [US5] Wrap all prompt calls with disableKeyboard()/enableKeyboard() in phases/phase-1/src/index.js

**Checkpoint**: User Story 5 complete - users can use keyboard shortcuts

---

## Phase 8: Polish & Edge Cases

**Purpose**: Edge case handling and documentation

- [X] T070 [P] Handle edge case: template name conflict (prompt overwrite/rename) in phases/phase-1/src/templateService.js
- [X] T071 [P] Handle edge case: subtask limit reached (show error, prevent add) in phases/phase-1/src/taskService.js
- [X] T072 [P] Handle edge case: timer running on deleted task (auto-stop, discard) in phases/phase-1/src/timerService.js
- [X] T073 [P] Handle edge case: Pomodoro daily count reset at midnight in phases/phase-1/src/timerService.js
- [X] T074 [P] Update README.md with Phase 4 features documentation in phases/phase-1/README.md
- [X] T075 Run quickstart.md validation scenarios for all user stories
- [X] T076 Verify timer accuracy (within 1 second) and shortcut response (<100ms)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phases 3-7 (User Stories) → Phase 8 (Polish)
                                             ↓
                                    Can proceed in priority order:
                                    US1 (P1) → US2 (P1) → US3 (P2) → US4 (P2) → US5 (P3)
```

### User Story Dependencies

| Story | Priority | Dependencies | Can Start After |
|-------|----------|--------------|-----------------|
| US1 - Templates | P1 | Phase 2 only | T006 complete |
| US2 - Subtasks | P1 | Phase 2 only | T006 complete |
| US3 - Time Tracking | P2 | Phase 2 only | T006 complete |
| US4 - Pomodoro | P2 | US3 (timerService base) | T046 complete |
| US5 - Shortcuts | P3 | US1-US4 (all menu options exist) | T060 complete |

### Within Each User Story

- Service methods before prompts and display
- Prompts and display can run in parallel (different files)
- Integration (index.js) after service, prompts, display complete

---

## Parallel Opportunities

### Phase 1 Setup (T001-T003 parallel)
```bash
# All skeleton files can be created together:
Task T001: "Create templateService.js skeleton"
Task T002: "Create timerService.js skeleton"
Task T003: "Create keyboardService.js skeleton"
```

### User Story 1 Templates (prompts/display parallel)
```bash
# Prompts and display tasks can run in parallel:
Task T013-T015: prompts.js template functions
Task T016-T017: display.js template functions
```

### User Story 2 Subtasks (prompts/display parallel)
```bash
Task T026-T027: prompts.js subtask functions
Task T028-T029: display.js subtask functions
```

### Phase 8 Polish (T070-T074 parallel)
```bash
# Edge cases are independent:
Task T070: "Handle template name conflict"
Task T071: "Handle subtask limit"
Task T072: "Handle timer on deleted task"
Task T073: "Handle Pomodoro daily reset"
Task T074: "Update README.md"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T006)
3. Complete Phase 3: US1 - Templates (T007-T020)
4. Complete Phase 4: US2 - Subtasks (T021-T032)
5. **STOP and VALIDATE**: Manual test per spec acceptance scenarios
6. Deploy/demo if ready (MVP complete!)

### Full Feature Delivery

Continue from MVP:
7. Phase 5: US3 - Time Tracking (T033-T046)
8. Phase 6: US4 - Pomodoro (T047-T060)
9. Phase 7: US5 - Keyboard Shortcuts (T061-T069)
10. Phase 8: Polish (T070-T076)

---

## Summary

| Category | Count |
|----------|-------|
| Total Tasks | 76 |
| Phase 1 (Setup) | 3 |
| Phase 2 (Foundational) | 3 |
| US1 - Templates | 14 |
| US2 - Subtasks | 12 |
| US3 - Time Tracking | 14 |
| US4 - Pomodoro | 14 |
| US5 - Keyboard Shortcuts | 9 |
| Phase 8 (Polish) | 7 |
| Parallel Opportunities | 24 tasks marked [P] |

---

## Notes

- All dates/times use existing Luxon from Phase 3
- Timer state persisted in tasks.json for crash recovery
- Keyboard shortcuts require TTY - graceful fallback to menu
- Manual testing per quickstart.md scenarios
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently