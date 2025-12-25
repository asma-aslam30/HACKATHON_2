# Feature: Task CRUD Operations

**Example Specification** - Reference template for spec authoring

---

## User Stories

- As a user, I can add tasks with title + description
- As a user, I can view all tasks with status indicators
- As a user, I can delete tasks by ID
- As a user, I can mark tasks complete/incomplete

---

## Acceptance Criteria

### Happy Path

- `add "Buy milk" "2 liters low fat"` → "Task 1 created successfully"
- `list` → Table format: ID | Title | Status | Created Date
- `complete 1` → "Task 1 marked complete ✓"
- `delete 1` → "Task 1 deleted successfully"

### Edge Cases

- `delete 999` → "Task not found - ID must exist"
- `add ""` → "Error: Title cannot be empty"
- `list` (when no tasks) → "No tasks found. Use 'add' to create one."
- `complete 1` (already complete) → "Task 1 is already complete"
- `complete 999` → "Task not found - ID must exist"

### Data Constraints

- In-memory storage only - data lost on app restart (Phase I)
- Task IDs auto-increment starting from 1
- Title required (1-500 characters)
- Description optional (max 2000 characters)
- Status: "pending" (default) or "completed"
- Created date: ISO 8601 format

---

## Implementation Notes

- **Phase**: I (Console CLI App)
- **Storage**: Global `tasks: list[dict]` in main.py
- **Tech**: Python 3.13+, argparse or click for CLI
- **Data structure**:
  ```python
  {
    "id": int,
    "title": str,
    "description": str,
    "status": "pending" | "completed",
    "created_at": str  # ISO format: "2025-12-24T10:30:00Z"
  }
  ```

### CLI Commands

```bash
# Add task
python todo.py add "Buy milk" "2 liters low fat"
python todo.py add "Finish report"  # Description optional

# List tasks
python todo.py list
# Expected output:
# ID | Title         | Status    | Created
# ---+---------------+-----------+--------------------
# 1  | Buy milk      | Pending   | 2025-12-24 10:30
# 2  | Finish report | Completed | 2025-12-24 09:15

# Complete task
python todo.py complete 1

# Mark task as incomplete (toggle)
python todo.py incomplete 1

# Delete task
python todo.py delete 1
```

### Evolution to Phase II

In Phase II, this feature will evolve:
- Storage: `tasks` list → PostgreSQL `todos` table
- CLI: Direct storage manipulation → REST API calls
- Data structure: Add `user_id` foreign key for multi-user support

**Backward Compatibility**:
- CLI commands remain identical
- Add optional `--api-url` flag to point to backend

---

## Validation Checklist

Before finalizing this spec:

- ✅ User stories written from user perspective
- ✅ Acceptance criteria are concrete and testable
- ✅ Edge cases identified and specified
- ✅ Error messages specified verbatim
- ✅ Data constraints documented
- ✅ Technology-agnostic (except Implementation Notes)
- ✅ Phase assigned (Phase I)
- ✅ Evolution path considered (Phase II)

---

## Usage

This example demonstrates:
1. ✅ Clear user stories (4 stories covering CRUD)
2. ✅ Concrete acceptance criteria (input → output format)
3. ✅ Edge cases (invalid IDs, empty inputs)
4. ✅ Error messages (exactly as user will see them)
5. ✅ Data constraints (in-memory, auto-increment IDs)
6. ✅ Implementation notes (phase, tech, data structure)
7. ✅ CLI command examples
8. ✅ Evolution strategy (Phase I → II)

**Use this as a reference template when writing new feature specifications.**

---

## Related Examples

For more complex specifications, see:
- API Specification Example: `.claude/skills/spec-authoring/example-api-spec.md` (to be created)
- Database Schema Example: `.claude/skills/spec-authoring/example-db-schema.md` (to be created)
- UI Specification Example: `.claude/skills/spec-authoring/example-ui-spec.md` (to be created)

---

**Created**: 2025-12-24
**Last Updated**: 2025-12-24
**Version**: 1.0.0
