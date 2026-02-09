# Tasks: Todo App Intelligent Features

**Input**: Design documents from `/specs/003-intelligent-features/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/cli-contract.md, research.md
**Branch**: `003-intelligent-features`

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

**Purpose**: Project dependencies and new service module scaffolding

- [x] T001 Install new dependencies: `npm install luxon@^3.4.0 node-notifier@^10.0.0` in phases/phase-1/
- [x] T002 [P] Create dateService.js skeleton with exports in phases/phase-1/src/dateService.js
- [x] T003 [P] Create notificationService.js skeleton with exports in phases/phase-1/src/notificationService.js
- [x] T004 [P] Create suggestionService.js skeleton with exports in phases/phase-1/src/suggestionService.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core date utilities and schema migration that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Implement parseDate() function using Luxon in phases/phase-1/src/dateService.js
- [x] T006 Implement formatDate() function (short/long/relative formats) in phases/phase-1/src/dateService.js
- [x] T007 Implement getRelativeTime() returning {text, isOverdue, isDueSoon} in phases/phase-1/src/dateService.js
- [x] T008 Implement isToday(), isPast(), isDueSoon(), isWithinWeek() helpers in phases/phase-1/src/dateService.js
- [x] T009 Implement toUTCString() for timezone conversion in phases/phase-1/src/dateService.js
- [x] T010 Add schema migration for new fields (dueDate, recurrencePattern, reminderOffset, reminderEnabled, suggestionDismissed) in phases/phase-1/src/taskService.js loadData() function

**Checkpoint**: Foundation ready - dateService utilities available, schema migration in place

---

## Phase 3: User Story 1 - Set Due Date on Task (Priority: P1)

**Goal**: Users can set a due date and time on any task during creation or editing

**Independent Test**: Create a task, set a due date, verify the date persists and displays correctly

### Implementation for User Story 1

- [x] T011 [US1] Add promptDueDate() function with date/time input in phases/phase-1/src/prompts.js
- [x] T012 [US1] Update promptAddTask() to include optional due date prompt in phases/phase-1/src/prompts.js
- [x] T013 [US1] Update promptUpdateTask() to allow modifying/clearing due date in phases/phase-1/src/prompts.js
- [x] T014 [US1] Add setDueDate(taskId, dueDate, recurrencePattern) method in phases/phase-1/src/taskService.js
- [x] T015 [US1] Update createTask() to accept and persist dueDate field in phases/phase-1/src/taskService.js
- [x] T016 [US1] Update updateTask() to handle dueDate modifications in phases/phase-1/src/taskService.js
- [x] T017 [US1] Add formatTaskWithDueDate() to show due date in task display in phases/phase-1/src/display.js
- [x] T018 [US1] Update formatTaskList() to use formatTaskWithDueDate() in phases/phase-1/src/display.js

**Checkpoint**: User Story 1 complete - users can set/view due dates on tasks

---

## Phase 4: User Story 2 - View Overdue Tasks (Priority: P1)

**Goal**: Overdue tasks are visually highlighted with countdown/elapsed time display

**Independent Test**: Create a task with a past due date, verify red highlighting and "X days overdue" text

### Implementation for User Story 2

- [x] T019 [US2] Add chalk color scheme for urgency states (overdue red, due-soon yellow) in phases/phase-1/src/display.js
- [x] T020 [US2] Implement showOverdueBanner(overdueCount) function in phases/phase-1/src/display.js
- [x] T021 [US2] Update formatTaskWithDueDate() to apply urgency styling based on getRelativeTime() in phases/phase-1/src/display.js
- [x] T022 [US2] Add overdue check on task list display (count and banner) in phases/phase-1/src/display.js
- [x] T023 [US2] Implement showUpcomingReminders(upcomingTasks) for tasks due within 24h in phases/phase-1/src/display.js

**Checkpoint**: User Stories 1 AND 2 complete - full due date UX with overdue highlighting

---

## Phase 5: User Story 3 - Filter and Sort by Due Date (Priority: P2)

**Goal**: Users can filter (due today/this week/overdue) and sort by due date

**Independent Test**: Create tasks with various due dates, verify filter and sort options work correctly

### Implementation for User Story 3

- [x] T024 [US3] Add filterByDate(filter) method with predicates (due_today, due_this_week, overdue, no_due_date) in phases/phase-1/src/taskService.js
- [x] T025 [US3] Add sortByDueDate(tasks, direction) method (nulls at end) in phases/phase-1/src/taskService.js
- [x] T026 [US3] Add 'due_date' to sort options enum and sortTasks() switch in phases/phase-1/src/taskService.js
- [x] T027 [US3] Add date filters to filter options enum and filterTasks() switch in phases/phase-1/src/taskService.js
- [x] T028 [US3] Update promptFilterTasks() with new date filter options in phases/phase-1/src/prompts.js
- [x] T029 [US3] Update promptSortTasks() with due date sort option in phases/phase-1/src/prompts.js
- [x] T030 [US3] Update filter header display to show date filter name in phases/phase-1/src/display.js

**Checkpoint**: User Story 3 complete - filter/sort by due date functional

---

## Phase 6: User Story 4 - Create Recurring Tasks (Priority: P2)

**Goal**: Recurring tasks auto-reschedule when marked complete (daily/weekly/monthly)

**Independent Test**: Create weekly recurring task, mark complete, verify new task created with next week's due date

### Implementation for User Story 4

- [x] T031 [US4] Implement calculateNextDueDate(currentDueDate, pattern) in phases/phase-1/src/dateService.js
- [x] T032 [US4] Add recurrence pattern selection to promptDueDate() in phases/phase-1/src/prompts.js
- [x] T033 [US4] Extend completeTask() to handle recurring task logic (create new instance) in phases/phase-1/src/taskService.js
- [x] T034 [US4] Add recurrence indicator display in formatTaskWithDueDate() in phases/phase-1/src/display.js
- [x] T035 [US4] Show recurring task creation message after completion in phases/phase-1/src/display.js
- [x] T036 [US4] Handle edge case: monthly recurrence on 31st rolling to shorter month in phases/phase-1/src/dateService.js

**Checkpoint**: User Story 4 complete - recurring tasks auto-reschedule

---

## Phase 7: User Story 5 - Desktop Notifications (Priority: P3)

**Goal**: Users receive desktop notifications when tasks are due soon

**Independent Test**: Create task due in 2 minutes with 1-minute reminder, verify notification appears

### Implementation for User Story 5

- [x] T037 [US5] Implement checkNotificationSupport() using node-notifier in phases/phase-1/src/notificationService.js
- [x] T038 [US5] Implement sendNotification(title, message) in phases/phase-1/src/notificationService.js
- [x] T039 [US5] Implement scheduleNotification(task) with setTimeout in phases/phase-1/src/notificationService.js
- [x] T040 [US5] Implement cancelNotification(taskId) in phases/phase-1/src/notificationService.js
- [x] T041 [US5] Implement rescheduleNotification(task) in phases/phase-1/src/notificationService.js
- [x] T042 [US5] Implement initNotifications(tasks) to schedule on app start in phases/phase-1/src/notificationService.js
- [x] T043 [US5] Implement getPendingNotifications() in phases/phase-1/src/notificationService.js
- [x] T044 [US5] Add setReminder(taskId, reminderOffset, reminderEnabled) method in phases/phase-1/src/taskService.js
- [x] T045 [US5] Add promptReminder() for reminder configuration in phases/phase-1/src/prompts.js
- [x] T046 [US5] Initialize notification service on app startup in phases/phase-1/src/index.js
- [x] T047 [US5] Call rescheduleNotification() on task create/update in phases/phase-1/src/index.js
- [x] T048 [US5] Add graceful fallback when notifications blocked (console message) in phases/phase-1/src/notificationService.js

**Checkpoint**: User Story 5 complete - desktop notifications working

---

## Phase 8: User Story 6 - Smart Suggestions (Priority: P3)

**Goal**: App suggests adding due dates when task title contains time-sensitive keywords

**Independent Test**: Create task titled "Submit report by Friday", verify suggestion prompt appears

### Implementation for User Story 6

- [x] T049 [US6] Implement keyword patterns array in phases/phase-1/src/suggestionService.js
- [x] T050 [US6] Implement analyzeTitleForDateSuggestion(title) in phases/phase-1/src/suggestionService.js
- [x] T051 [US6] Implement getSuggestedDate(keyword) in phases/phase-1/src/suggestionService.js
- [x] T052 [US6] Add promptSuggestionResponse(suggestion) in phases/phase-1/src/prompts.js
- [x] T053 [US6] Add dismissSuggestion(taskId) method in phases/phase-1/src/taskService.js
- [x] T054 [US6] Integrate suggestion check after task creation in phases/phase-1/src/index.js (main menu flow)
- [x] T055 [US6] Display suggestion prompt and handle accept/dismiss response in phases/phase-1/src/index.js

**Checkpoint**: User Story 6 complete - smart suggestions working

---

## Phase 9: Polish & Edge Cases

**Purpose**: Edge case handling and documentation

- [x] T056 [P] Handle edge case: recurring task deleted before completion (no new instance) in phases/phase-1/src/taskService.js
- [x] T057 [P] Handle edge case: idempotent recurring task completion (prevent duplicate instances) in phases/phase-1/src/taskService.js
- [x] T058 [P] Validate date input format with user-friendly error messages in phases/phase-1/src/prompts.js
- [x] T059 [P] Update README.md with new features documentation in phases/phase-1/README.md
- [ ] T060 Run manual acceptance testing per spec scenarios
- [ ] T061 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phases 3-8 (User Stories) → Phase 9 (Polish)
                                              ↓
                                     Can proceed in priority order:
                                     US1 (P1) → US2 (P1) → US3 (P2) → US4 (P2) → US5 (P3) → US6 (P3)
```

### User Story Dependencies

| Story | Priority | Dependencies | Can Start After |
|-------|----------|--------------|-----------------|
| US1 - Set Due Date | P1 | Phase 2 only | T010 complete |
| US2 - Overdue Display | P1 | US1 complete | T018 complete |
| US3 - Filter/Sort | P2 | Phase 2 only | T010 complete |
| US4 - Recurring Tasks | P2 | US1 complete | T018 complete |
| US5 - Notifications | P3 | US1 complete | T018 complete |
| US6 - Smart Suggestions | P3 | US1 complete | T018 complete |

### Within Each Phase

- Tasks marked [P] can run in parallel (different files)
- Sequential tasks within a user story must complete in order
- Service methods before UI integration

---

## Parallel Opportunities

### Phase 1 Setup (T002-T004 parallel)
```bash
# All skeleton files can be created together:
Task T002: "Create dateService.js skeleton"
Task T003: "Create notificationService.js skeleton"
Task T004: "Create suggestionService.js skeleton"
```

### Phase 9 Polish (T056-T059 parallel)
```bash
# Edge cases are independent:
Task T056: "Handle recurring task deleted"
Task T057: "Handle idempotent completion"
Task T058: "Validate date input"
Task T059: "Update README"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T010)
3. Complete Phase 3: US1 - Set Due Date (T011-T018)
4. Complete Phase 4: US2 - Overdue Display (T019-T023)
5. **STOP and VALIDATE**: Manual test per spec acceptance scenarios
6. Deploy/demo if ready (MVP complete!)

### Full Feature Delivery

Continue from MVP:
7. Phase 5: US3 - Filter/Sort (T024-T030)
8. Phase 6: US4 - Recurring Tasks (T031-T036)
9. Phase 7: US5 - Notifications (T037-T048)
10. Phase 8: US6 - Smart Suggestions (T049-T055)
11. Phase 9: Polish (T056-T061)

---

## Summary

| Category | Count |
|----------|-------|
| Total Tasks | 61 |
| Phase 1 (Setup) | 4 |
| Phase 2 (Foundational) | 6 |
| US1 - Set Due Date | 8 |
| US2 - Overdue Display | 5 |
| US3 - Filter/Sort | 7 |
| US4 - Recurring Tasks | 6 |
| US5 - Notifications | 12 |
| US6 - Smart Suggestions | 7 |
| Phase 9 (Polish) | 6 |
| Parallel Opportunities | 12 tasks marked [P] |

---

## Notes

- All dates stored as ISO-8601 UTC strings
- Luxon handles all timezone conversions
- node-notifier provides cross-platform desktop notifications
- Manual testing per spec.md acceptance scenarios
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
