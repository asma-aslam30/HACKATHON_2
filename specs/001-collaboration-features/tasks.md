---
description: "Task list for Todo App Phase 2 - Claude Skills Workflow implementation"
---

# Tasks: Todo App Phase 2 - Claude Skills Workflow

**Input**: Design documents from `/specs/001-collaboration-features/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No explicit test requirements in feature specification - tests are optional for this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **CLI Todo App**: `phases/phase-1/src/`, `phases/phase-1/data/`, `phases/phase-1/supabase/`
- Following project structure from plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for collaboration features

- [X] T001 Create project structure per implementation plan in todo-app-fullstack/
- [X] T002 Install Next.js 14, Supabase, Tailwind CSS, Prisma dependencies in package.json
- [X] T003 [P] Set up Next.js project with App Router in todo-app-fullstack/

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Set up Supabase project and PostgreSQL database with Prisma schema
- [X] T005 [P] Implement Supabase authentication service in todo-app-fullstack/lib/supabase.js
- [X] T006 [P] Create data models with Prisma schema extending existing entities in todo-app-fullstack/prisma/schema.prisma
- [X] T007 Implement basic real-time sync using Supabase Realtime in todo-app-fullstack/lib/realtime.js
- [X] T008 [P] Extend existing Task model with collaboration fields in todo-app-fullstack/src/services/taskService.js
- [X] T009 Create base collaboration service in todo-app-fullstack/src/services/collaborationService.js
- [X] T010 Update data persistence layer to support both local and database sync in todo-app-fullstack/src/services/dataService.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Task Sharing and Access Control (Priority: P1) 🎯 MVP

**Goal**: Enable users to generate shareable links for todo lists with configurable access permissions

**Independent Test**: User can create a shareable link for a todo list, and another user can access that list using the link

### Implementation for User Story 1

- [X] T011 [P] [US1] Create ShareLink model in todo-app-fullstack/src/models/shareLinkModel.js
- [X] T012 [P] [US1] Create SharedList model in todo-app-fullstack/src/models/sharedListModel.js
- [X] T013 [US1] Implement share link generation in todo-app-fullstack/src/services/collaborationService.js
- [X] T014 [US1] Implement share link validation and access control in todo-app-fullstack/src/services/collaborationService.js
- [ ] T015 [US1] Create "Share List" CLI command in todo-app-fullstack/src/prompts.js (Option 14)
- [X] T016 [US1] Add share link management UI in todo-app-fullstack/components/ShareModal.js
- [ ] T017 [US1] Implement "Join Shared List" functionality in todo-app-fullstack/src/prompts.js (Option 18)
- [X] T018 [US1] Add share link permission management in todo-app-fullstack/src/services/collaborationService.js

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Real-Time Multi-User Updates (Priority: P1)

**Goal**: Provide real-time synchronization of task changes across all users viewing shared lists

**Independent Test**: Two users simultaneously viewing the same shared todo list can see each other's changes instantly as they modify tasks

### Implementation for User Story 2

- [X] T019 [P] [US2] Enhance real-time sync with conflict resolution in todo-app-fullstack/lib/realtime.js
- [X] T020 [P] [US2] Implement optimistic update mechanism in todo-app-fullstack/src/services/collaborationService.js
- [X] T021 [US2] Add connection status indicators in todo-app-fullstack/components/ConnectionStatus.js
- [X] T022 [US2] Implement offline operation queue in todo-app-fullstack/src/services/collaborationService.js
- [X] T023 [US2] Add real-time task update listeners in todo-app-fullstack/lib/realtime.js
- [X] T024 [US2] Update task operations to sync with Supabase in todo-app-fullstack/src/services/taskService.js
- [X] T025 [US2] Implement conflict detection and resolution with version tracking in todo-app-fullstack/src/services/taskService.js
- [X] T026 [US2] Add reconnection logic with exponential backoff in todo-app-fullstack/lib/realtime.js

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Task Comments and Discussion (Priority: P2)

**Goal**: Enable users to add comments to tasks for discussion and context around shared tasks

**Independent Test**: User can add comments to a task, view a timeline of all comments, and receive notifications about new comments

### Implementation for User Story 3

- [X] T027 [P] [US3] Create Comment model in todo-app-fullstack/src/models/commentModel.js
- [X] T028 [P] [US3] Create comment management service in todo-app-fullstack/src/services/commentService.js
- [X] T029 [US3] Add comment functionality to task model in todo-app-fullstack/src/services/taskService.js
- [X] T030 [US3] Implement comment UI in todo-app-fullstack/components/CommentSection.js
- [ ] T031 [US3] Create "View Comments" CLI command in todo-app-fullstack/src/prompts.js (Option 15)
- [X] T032 [US3] Add comment creation interface in todo-app-fullstack/components/CommentForm.js
- [X] T033 [US3] Implement real-time comment synchronization in todo-app-fullstack/lib/realtime.js
- [X] T034 [US3] Add comment validation and sanitization in todo-app-fullstack/src/services/commentService.js

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - User Assignment and Mentions (Priority: P2)

**Goal**: Allow users to assign tasks to specific team members with @mentions and notifications

**Independent Test**: User can assign a task to another team member using @mentions, and the assigned person receives appropriate notifications

### Implementation for User Story 4

- [X] T035 [P] [US4] Create Assignment model in todo-app-fullstack/src/models/assignmentModel.js
- [X] T036 [P] [US4] Create user mention parsing in todo-app-fullstack/src/services/collaborationService.js
- [X] T037 [US4] Implement task assignment functionality in todo-app-fullstack/src/services/collaborationService.js
- [X] T038 [US4] Add @mention notification system in todo-app-fullstack/src/services/notificationService.js
- [ ] T039 [US4] Create "Assign Task" CLI command in todo-app-fullstack/src/prompts.js (Option 16)
- [ ] T040 [US4] Update task display to show assignments in todo-app-fullstack/components/TodoItem.js
- [X] T041 [US4] Implement assignment status tracking in todo-app-fullstack/src/services/collaborationService.js
- [X] T042 [US4] Add @mention handling in comments and task descriptions in todo-app-fullstack/src/services/commentService.js

**Checkpoint**: At this point, User Stories 1, 2, 3 AND 4 should all work independently

---

## Phase 7: User Story 5 - Team Dashboard and Progress Analytics (Priority: P3)

**Goal**: Provide team dashboard showing progress statistics, completion rates, and individual contributions

**Independent Test**: User can view a dashboard showing team progress metrics, task completion rates, and individual contributions

### Implementation for User Story 5

- [X] T043 [P] [US5] Create dashboard service in todo-app-fullstack/src/services/dashboardService.js
- [X] T044 [P] [US5] Create analytics calculation functions in todo-app-fullstack/src/services/analyticsService.js
- [ ] T045 [US5] Implement dashboard display UI in todo-app-fullstack/components/Dashboard.js
- [ ] T046 [US5] Create "Team Dashboard" CLI command in todo-app-fullstack/src/prompts.js (Option 17)
- [X] T047 [US5] Add progress tracking for shared lists in todo-app-fullstack/src/services/collaborationService.js
- [X] T048 [US5] Implement user contribution metrics in todo-app-fullstack/src/services/analyticsService.js
- [X] T049 [US5] Add dashboard export functionality in todo-app-fullstack/src/services/dashboardService.js
- [X] T050 [US5] Create dashboard refresh and update mechanism in todo-app-fullstack/src/services/dashboardService.js

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T051 [P] Update README.md with collaboration features documentation
- [ ] T052 Add Supabase security policies for row-level access control
- [X] T053 Implement proper error handling for collaboration features in todo-app-fullstack/src/services/errorHandler.js
- [X] T054 [P] Add comprehensive logging for collaboration operations in todo-app-fullstack/src/services/logger.js
- [X] T055 Create migration script for existing tasks to collaboration format in todo-app-fullstack/scripts/migrate-to-collaboration.js
- [ ] T056 Run quickstart.md validation for all collaboration features
- [X] T057 Add validation for share link limits and permissions in todo-app-fullstack/src/services/collaborationService.js

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 (sharing needed for sync)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 (shared tasks needed for comments)
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Depends on US1 and US3 (shared tasks and comments needed)
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Depends on US1, US2, US3, US4 (all data needed for analytics)

### Within Each User Story

- Core implementation before UI integration
- Models before services
- Services before endpoints/UI
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all parallel tasks for User Story 1 together:
Task: "Create ShareLink model in todo-app-fullstack/src/models/shareLinkModel.js"
Task: "Create SharedList model in todo-app-fullstack/src/models/sharedListModel.js"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Sharing)
4. Complete Phase 4: User Story 2 (Real-time sync)
5. **STOP and VALIDATE**: Test sharing and sync independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Sharing!)
3. Add User Story 2 → Test independently → Deploy/Demo (Real-time sync!)
4. Add User Story 3 → Test independently → Deploy/Demo (Comments!)
5. Add User Story 4 → Test independently → Deploy/Demo (Assignments!)
6. Add User Story 5 → Test independently → Deploy/Demo (Dashboards!)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Sharing)
   - Developer B: User Story 2 (Sync)
   - Developer C: User Story 3 (Comments)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Note: US2 (real-time sync) depends on US1 (sharing) since sync requires shared lists