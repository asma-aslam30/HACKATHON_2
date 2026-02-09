---
id: 003
title: Create Task Organization Tasks
stage: tasks
date: 2025-12-26
surface: agent
model: claude-sonnet-4-5-20250929
feature: 002-task-organization
branch: 002-task-organization
user: user
command: /sp.tasks
labels: ["phase-2", "organization", "priority", "tags", "search", "filter", "sort", "tasks"]
links:
  spec: specs/002-task-organization/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-task-organization/tasks.md
tests:
  - null
---

## Prompt

Title: Todo App Organization Features
Priority: Medium
Estimate: 10-14 hours
Dependencies: Core Web UI complete
Deliverables:
- Priority/tag system with colors
- Search + filter controls
- Sort + drag-drop reordering
Tech Stack: Existing + drag API
Testing: Filter combos, search accuracy

## Response snapshot

Generated comprehensive task list for Todo App Organization Features:

**Output File**: `specs/002-task-organization/tasks.md`

### Task Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| Phase 1: Setup | 2 | Verify Phase 1, create backup |
| Phase 2: Foundational | 8 | Constants, schema extension, migration |
| Phase 3: US1 Priority | 7 | Priority indicators, prompts, handlers |
| Phase 4: US2 Tags | 10 | Tag chips, multi-select, custom tags |
| Phase 5: US3 Search | 8 | Search function, prompts, results display |
| Phase 6: US4 Filter | 10 | Filter by status/priority/tag, ViewState |
| Phase 7: US5 Sort | 9 | Sort comparators, sort UI |
| Phase 8: US6 Reorder | 10 | Move up/down/to, manual ordering |
| Phase 9: Polish | 9 | Menu update, edge cases, README |
| **TOTAL** | **73** | Complete implementation |

### User Story Mapping

- **US1 (P1)**: Tasks T011-T017 - Set Task Priority
- **US2 (P1)**: Tasks T018-T027 - Add Tags to Tasks
- **US3 (P1)**: Tasks T028-T035 - Search Tasks
- **US4 (P2)**: Tasks T036-T045 - Filter Tasks
- **US5 (P2)**: Tasks T046-T054 - Sort Tasks
- **US6 (P3)**: Tasks T055-T064 - Manual Reordering

### Parallel Opportunities

- Foundational: T003-T006 (constants)
- US1: T011, T012 (display.js, prompts.js)
- US2: T018-T022 (service + display + prompts)
- US3: T028-T031 (all different files)
- US4: T036-T038 (service + prompts + display)
- US5: T046-T048 (service + prompts + display)
- US6: T055-T059 (service functions + prompts)

### MVP Scope

User Stories 1-3 (Priority, Tags, Search) form the P1 MVP:
- Foundational + US1 + US2 + US3 = ~25 tasks
- Estimated time: 4-5 hours

### Testing Approach

Manual testing specified for:
1. Filter combos (status, priority, tag filters)
2. Search accuracy (exact match, case-insensitive, special chars)

## Outcome

- ✅ Impact: 73 implementation tasks organized by user story
- 🧪 Tests: Manual testing approach documented
- 📁 Files: 1 file created (tasks.md)
- 🔁 Next prompts: `/sp.implement` to execute tasks
- 🧠 Reflection: Tasks follow spec user stories, enable independent testing per story

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): All tasks follow checklist format
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run /sp.implement to execute tasks
