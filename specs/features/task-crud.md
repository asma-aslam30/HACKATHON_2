# Feature: Task CRUD Operations

## User Stories
- As a user, I can create a new task with title, description, and priority
- As a user, I can view all my tasks with status indicators
- As a user, I can update a task's title, description, or priority
- As a user, I can delete a task by ID
- As a user, I can mark a task as complete/incomplete
- As a user, I can filter tasks by status (all/pending/completed)
- As a user, I can sort tasks by due date, priority, or creation date
- As a user, I can search tasks by keyword

## Acceptance Criteria

### Create Task
- Title required (1–200 characters)
- Description optional (max 1000 characters)
- Priority: low | medium | high (default: medium)
- Task associated with authenticated user
- Returns task object with id, created_at

### View Tasks
- Only show tasks for current authenticated user
- Support filtering: all | pending | completed | overdue | due_today | due_this_week
- Support sorting: created | due_date | priority
- Support keyword search across title and description
- Each task shows: id, title, description, priority, completed, due_date, subtasks, time_tracked

### Update Task
- Partial updates supported (PATCH)
- Only task owner can update
- Version field incremented on each update
- Recurring tasks auto-spawn next occurrence on completion

### Delete Task
- Only task owner can delete
- Cascades to subtasks, time entries, comments

### Complete Task
- Toggle completed boolean
- When completing a recurring task → auto-create next instance
- When completing parent → auto-complete all subtasks
- Award XP to user (gamification)

## API Endpoints
- GET    /api/{user_id}/tasks        — list with filter/sort/search
- POST   /api/{user_id}/tasks        — create
- GET    /api/{user_id}/tasks/{id}   — get one
- PATCH  /api/{user_id}/tasks/{id}   — update
- DELETE /api/{user_id}/tasks/{id}   — delete
- PATCH  /api/{user_id}/tasks/{id}/complete — toggle complete
