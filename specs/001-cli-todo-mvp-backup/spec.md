# Feature Specification: Todo App Core Essentials MVP - Phase 1 CLI

**Feature Branch**: `001-cli-todo-mvp`
**Created**: 2025-12-26
**Status**: Draft
**Input**: User description: "Build CLI-based todo app with essential CRUD operations using Node.js. Features: add task with title and description via prompts, list all tasks with completion status and colors, delete any task by selection, toggle task completion status, update task title/description, data persists in tasks.json file, empty state shown when no tasks, numbered menu for all operations."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add New Task (Priority: P1)

As a user, I want to add a new task with a title and description so that I can track things I need to do.

**Why this priority**: Adding tasks is the fundamental capability of any todo application. Without this, no other features have value.

**Independent Test**: Can be fully tested by running the application, selecting "Add Task" from the menu, entering title and description, and verifying the task appears in tasks.json file.

**Acceptance Scenarios**:

1. **Given** the application is running, **When** user selects "Add Task" option (1), **Then** system prompts for task title
2. **Given** user has entered a title, **When** user presses enter, **Then** system prompts for task description
3. **Given** user has entered title and description, **When** user confirms, **Then** task is created with unique ID, pending status, and saved to tasks.json
4. **Given** user provides empty title, **When** user tries to submit, **Then** system displays error and re-prompts for title

---

### User Story 2 - List All Tasks (Priority: P1)

As a user, I want to see all my tasks with their completion status displayed in colors so that I can quickly understand what needs to be done.

**Why this priority**: Viewing tasks is essential to use the application meaningfully. Users need visibility into their task list.

**Independent Test**: Can be fully tested by adding tasks, then selecting "List Tasks" and verifying all tasks display with correct status indicators and colors.

**Acceptance Scenarios**:

1. **Given** tasks exist in the system, **When** user selects "List Tasks" option (2), **Then** all tasks display with ID, title, description, and completion status
2. **Given** tasks are displayed, **When** viewing the list, **Then** completed tasks show in green color, pending tasks show in yellow/default color
3. **Given** no tasks exist, **When** user selects "List Tasks", **Then** system displays "No tasks found. Add your first task!" message
4. **Given** multiple tasks exist, **When** listing tasks, **Then** tasks display in order of creation (oldest first)

---

### User Story 3 - Toggle Task Completion (Priority: P1)

As a user, I want to mark tasks as complete or incomplete so that I can track my progress.

**Why this priority**: Marking tasks complete is core to task management and provides the primary value of knowing what's done.

**Independent Test**: Can be fully tested by creating a task, toggling it complete, and verifying status change persists.

**Acceptance Scenarios**:

1. **Given** tasks exist, **When** user selects "Toggle Complete" option (3), **Then** system displays numbered list of tasks for selection
2. **Given** user selects a pending task, **When** selection is confirmed, **Then** task status changes to completed and saves to tasks.json
3. **Given** user selects a completed task, **When** selection is confirmed, **Then** task status changes back to pending and saves to tasks.json
4. **Given** no tasks exist, **When** user selects "Toggle Complete", **Then** system displays "No tasks to toggle" message

---

### User Story 4 - Delete Task (Priority: P2)

As a user, I want to delete tasks I no longer need so that my list stays clean and relevant.

**Why this priority**: Deletion is important for list hygiene but not as critical as core CRUD operations for initial MVP.

**Independent Test**: Can be fully tested by creating a task, deleting it, and verifying it no longer appears in list or tasks.json.

**Acceptance Scenarios**:

1. **Given** tasks exist, **When** user selects "Delete Task" option (4), **Then** system displays numbered list of tasks for selection
2. **Given** user selects a task to delete, **When** deletion is confirmed, **Then** task is removed from tasks.json
3. **Given** task is deleted, **When** user lists tasks, **Then** deleted task no longer appears
4. **Given** no tasks exist, **When** user selects "Delete Task", **Then** system displays "No tasks to delete" message

---

### User Story 5 - Update Task (Priority: P2)

As a user, I want to edit task title and description so that I can fix mistakes or add more details.

**Why this priority**: Updates are valuable but users can work around by deleting and re-creating tasks.

**Independent Test**: Can be fully tested by creating a task, updating its title/description, and verifying changes persist.

**Acceptance Scenarios**:

1. **Given** tasks exist, **When** user selects "Update Task" option (5), **Then** system displays numbered list of tasks for selection
2. **Given** user selects a task, **When** prompted for new title, **Then** user can enter new title (or press enter to keep current)
3. **Given** user has updated title, **When** prompted for description, **Then** user can enter new description (or press enter to keep current)
4. **Given** updates are provided, **When** user confirms, **Then** changes are saved to tasks.json
5. **Given** no tasks exist, **When** user selects "Update Task", **Then** system displays "No tasks to update" message

---

### User Story 6 - Exit Application (Priority: P3)

As a user, I want to exit the application cleanly so that I know my data is saved.

**Why this priority**: Exit is a convenience feature; users can always Ctrl+C but clean exit improves UX.

**Independent Test**: Can be fully tested by selecting exit option and verifying application terminates gracefully.

**Acceptance Scenarios**:

1. **Given** application is running, **When** user selects "Exit" option (6), **Then** system displays goodbye message and terminates
2. **Given** user exits, **When** application closes, **Then** all data remains persisted in tasks.json

---

### Edge Cases

- What happens when tasks.json file doesn't exist? → System creates empty file on first task add
- What happens when tasks.json is corrupted/invalid JSON? → System displays error, backs up corrupted file, creates fresh tasks.json
- What happens when user enters very long title (>200 characters)? → System truncates display but stores full title
- What happens when user presses Ctrl+C during input? → Application exits gracefully, preserving any saved data
- What happens when tasks.json has invalid task entries? → System skips invalid entries and logs warning
- What happens when user enters non-numeric menu choice? → System displays "Invalid option" and re-shows menu

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a numbered menu with all available operations on startup
- **FR-002**: System MUST allow users to add tasks with a title (required) and description (optional)
- **FR-003**: System MUST generate unique identifiers for each task automatically
- **FR-004**: System MUST display all tasks with ID, title, description, and completion status
- **FR-005**: System MUST use color coding to distinguish completed tasks (green) from pending tasks (yellow/default)
- **FR-006**: System MUST allow users to toggle task completion status by selecting from a list
- **FR-007**: System MUST allow users to delete tasks by selecting from a list
- **FR-008**: System MUST allow users to update task title and/or description
- **FR-009**: System MUST persist all task data to a tasks.json file in the application directory
- **FR-010**: System MUST load existing tasks from tasks.json on startup
- **FR-011**: System MUST display appropriate empty state message when no tasks exist
- **FR-012**: System MUST validate that task title is not empty before saving
- **FR-013**: System MUST return to main menu after each operation completes
- **FR-014**: System MUST provide clean exit option that displays goodbye message

### Key Entities

- **Task**: Represents a todo item with the following attributes:
  - Unique identifier (auto-generated)
  - Title (required, user-provided text)
  - Description (optional, user-provided text)
  - Completion status (boolean: pending or completed)
  - Creation timestamp (when task was added)

- **Task List**: Collection of all tasks managed by the application
  - Persisted as JSON array in tasks.json
  - Loaded on startup, saved after each modification

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add a new task in under 30 seconds (title + description + save)
- **SC-002**: Users can identify completed vs pending tasks at a glance via color differentiation
- **SC-003**: 100% of task operations (add, list, toggle, delete, update) complete without data loss
- **SC-004**: Application loads existing tasks from storage within 1 second of startup
- **SC-005**: Users can navigate all menu options using single-digit number input
- **SC-006**: Empty state is clearly communicated when no tasks exist
- **SC-007**: All task data survives application restart (persistence validation)
- **SC-008**: Users can complete any single task operation (add/delete/toggle/update) in 3 or fewer interactions

## Assumptions

- Single-user application (no multi-user/authentication needed)
- Tasks.json stored in same directory as application
- Terminal supports ANSI color codes for colored output
- User has read/write permissions to application directory
- No concurrent access to tasks.json (single instance)
- No task categories, priorities, or due dates in Phase 1 MVP
- No search or filter functionality in Phase 1 MVP
