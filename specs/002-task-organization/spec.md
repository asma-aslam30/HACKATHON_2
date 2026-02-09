# Feature Specification: Todo App Organization Features

**Feature Branch**: `002-task-organization`
**Created**: 2025-12-26
**Status**: Draft
**Input**: User description: "Add priorities, tags, search, filter, and sort capabilities to the Todo App CLI with priority levels (High/Med/Low), tags (work/home/personal), keyword search, filters by status/priority/tag, sort options, and real-time list updates."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set Task Priority (Priority: P1)

As a user, I want to assign priority levels (High, Medium, Low) to my tasks so that I can focus on what's most important.

**Why this priority**: Priority is the most fundamental organization feature - it directly impacts how users decide what to work on first.

**Independent Test**: Create a task, set priority to High, verify priority is displayed with appropriate color indicator and persists after restart.

**Acceptance Scenarios**:

1. **Given** I am adding a new task, **When** I complete the title/description, **Then** I am prompted to select a priority level (High/Medium/Low/None)
2. **Given** I select "High" priority, **When** the task is saved, **Then** it displays with a red color indicator
3. **Given** I select "Medium" priority, **When** the task is saved, **Then** it displays with a yellow/orange color indicator
4. **Given** I select "Low" priority, **When** the task is saved, **Then** it displays with a blue color indicator
5. **Given** I don't select a priority, **When** the task is saved, **Then** it defaults to "None" with no color indicator
6. **Given** an existing task, **When** I update it, **Then** I can change its priority level

---

### User Story 2 - Add Tags to Tasks (Priority: P1)

As a user, I want to add tags (work, home, personal, or custom) to my tasks so that I can categorize and group related items.

**Why this priority**: Tags provide essential categorization that enables filtering - a core organization capability.

**Independent Test**: Create a task with multiple tags, verify tags display as chips, and persist after restart.

**Acceptance Scenarios**:

1. **Given** I am adding a new task, **When** I reach the tag prompt, **Then** I can select from predefined tags (work, home, personal) or create custom tags
2. **Given** I am selecting tags, **When** I choose multiple tags, **Then** all selected tags are associated with the task
3. **Given** a task has tags, **When** I view the task list, **Then** tags display as colored chips next to the task
4. **Given** I am updating a task, **When** I modify tags, **Then** I can add or remove tags
5. **Given** I enter a custom tag name, **When** I save, **Then** the custom tag is created and associated with the task
6. **Given** a tag is used by no tasks, **When** I view available tags, **Then** unused custom tags are still available for selection

---

### User Story 3 - Search Tasks (Priority: P1)

As a user, I want to search my tasks by keyword so that I can quickly find specific items.

**Why this priority**: Search is essential for users with many tasks - without it, finding specific items becomes tedious.

**Independent Test**: Create multiple tasks, search for a keyword that appears in one task's title, verify only matching tasks are displayed.

**Acceptance Scenarios**:

1. **Given** I select the search option, **When** I enter a keyword, **Then** tasks matching the keyword in title or description are displayed
2. **Given** I search for "grocery", **When** a task has "grocery" in its title, **Then** that task appears in results
3. **Given** I search for "meeting", **When** a task has "meeting" in its description, **Then** that task appears in results
4. **Given** I search for a keyword, **When** no tasks match, **Then** I see "No tasks found matching 'keyword'"
5. **Given** I search with mixed case "WORK", **When** a task contains "work", **Then** the search is case-insensitive and finds it
6. **Given** search results are displayed, **When** I press Enter or select "Back", **Then** I return to the full task list

---

### User Story 4 - Filter Tasks (Priority: P2)

As a user, I want to filter my task list by status, priority, or tag so that I can focus on specific subsets of tasks.

**Why this priority**: Filtering builds on priority and tags - it's valuable but depends on those features existing first.

**Independent Test**: Create tasks with different statuses/priorities/tags, apply a filter, verify only matching tasks are shown.

**Acceptance Scenarios**:

1. **Given** I select the filter option, **When** I choose "By Status", **Then** I can filter to show only Pending or only Completed tasks
2. **Given** I select the filter option, **When** I choose "By Priority", **Then** I can filter to show only High, Medium, Low, or None priority tasks
3. **Given** I select the filter option, **When** I choose "By Tag", **Then** I see a list of all tags used and can select one to filter
4. **Given** I apply a filter, **When** viewing the task list, **Then** only tasks matching the filter are displayed
5. **Given** a filter is active, **When** I view the list header, **Then** the active filter is clearly indicated
6. **Given** a filter is active, **When** I select "Clear Filter", **Then** all tasks are shown again
7. **Given** I apply a filter with no matching tasks, **When** viewing results, **Then** I see "No tasks match the current filter"

---

### User Story 5 - Sort Tasks (Priority: P2)

As a user, I want to sort my task list by different criteria so that I can view tasks in the most useful order.

**Why this priority**: Sorting enhances organization but users can work without it by visually scanning the list.

**Independent Test**: Create tasks with different priorities, sort by priority, verify High priority tasks appear first.

**Acceptance Scenarios**:

1. **Given** I select the sort option, **When** I choose "By Priority", **Then** tasks are ordered High → Medium → Low → None
2. **Given** I select the sort option, **When** I choose "Alphabetical", **Then** tasks are ordered A-Z by title
3. **Given** I select the sort option, **When** I choose "By Date Created", **Then** tasks are ordered newest first (or oldest first as toggle)
4. **Given** I select the sort option, **When** I choose "By Status", **Then** Pending tasks appear before Completed tasks
5. **Given** a sort is applied, **When** I add a new task, **Then** the list automatically re-sorts to include the new task in correct position
6. **Given** a sort is active, **When** I view the list header, **Then** the active sort criteria is displayed

---

### User Story 6 - Manual Task Reordering (Priority: P3)

As a user, I want to manually reorder my tasks so that I can arrange them in my preferred sequence.

**Why this priority**: Manual ordering is a nice-to-have for power users but not essential for basic organization.

**Independent Test**: Create multiple tasks, move one task up or down, verify the new order persists after restart.

**Acceptance Scenarios**:

1. **Given** I select the reorder option, **When** I view the task list, **Then** I can select a task to move
2. **Given** I select a task to move, **When** I choose "Move Up", **Then** the task moves one position higher in the list
3. **Given** I select a task to move, **When** I choose "Move Down", **Then** the task moves one position lower in the list
4. **Given** I manually reorder tasks, **When** I save and restart, **Then** the custom order persists
5. **Given** a sort is active, **When** I apply manual reordering, **Then** the sort is cleared and manual order takes precedence

---

### Edge Cases

- What happens when searching with special characters? → Treat as literal characters, escape regex patterns
- What happens when filtering by a tag that no longer exists? → Clear the filter automatically, show all tasks
- What happens when all tasks are filtered out? → Display "No tasks match the current filter" with option to clear
- What happens when priority colors conflict with completion status colors? → Priority color takes precedence, completion shown via icon (✓/○)
- What happens when a task has many tags (>5)? → Display first 3 tags with "+N more" indicator
- What happens when sorting by priority and priorities are equal? → Secondary sort by date created (newest first)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to assign priority levels (High, Medium, Low, None) to tasks
- **FR-002**: System MUST display priority with distinct color coding (Red=High, Orange=Medium, Blue=Low)
- **FR-003**: System MUST allow users to add one or more tags to tasks from predefined options (work, home, personal) or custom tags
- **FR-004**: System MUST display tags as colored chips next to task title
- **FR-005**: System MUST provide keyword search functionality that matches against task title and description
- **FR-006**: System MUST perform case-insensitive search
- **FR-007**: System MUST allow filtering by completion status (Pending/Completed)
- **FR-008**: System MUST allow filtering by priority level
- **FR-009**: System MUST allow filtering by tag
- **FR-010**: System MUST clearly indicate when a filter is active
- **FR-011**: System MUST allow sorting by priority, alphabetically, by date, or by status
- **FR-012**: System MUST maintain sort order when tasks are added or modified
- **FR-013**: System MUST allow manual reordering of tasks
- **FR-014**: System MUST persist priority, tags, sort preference, and manual order
- **FR-015**: System MUST update the displayed list in real-time after any organization change

### Key Entities

- **Task** (extended): Existing task entity with new attributes:
  - Priority level (enum: high, medium, low, none)
  - Tags (array of tag references)
  - Sort order (numeric position for manual ordering)

- **Tag**: New entity representing a task category
  - Name (unique identifier)
  - Color (display color for chip)
  - Type (predefined or custom)

- **View State**: User's current organization preferences
  - Active filter (status, priority, or tag)
  - Active sort (priority, alpha, date, status, manual)
  - Search query (current search term)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can set task priority in under 5 seconds (single selection)
- **SC-002**: Users can find a specific task via search in under 10 seconds (with 50+ tasks)
- **SC-003**: Filter and sort operations complete instantly (perceived real-time, <500ms)
- **SC-004**: Users can visually distinguish priority levels at a glance via color coding
- **SC-005**: Users can categorize a task with tags in under 10 seconds
- **SC-006**: 100% of organization data (priority, tags, order) persists across app restarts
- **SC-007**: Users can clear filters and return to full list in a single action
- **SC-008**: Task list displays correctly with up to 100 tasks with various priorities and tags

## Assumptions

- This feature extends the existing Phase 1 CLI Todo app
- Single-user application (no multi-user tag sharing)
- Predefined tags (work, home, personal) are always available
- Maximum of 10 tags per task is sufficient
- Color terminal support for priority and tag colors (chalk library)
- Tasks without explicit priority default to "None"
- Manual sort order is stored as a numeric position field
- Search is local (no external search service)
- Filters are single-select (one filter at a time, not combined)
