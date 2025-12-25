# Spec Authoring Skill

**Skill Type**: Specification & Requirements
**Version**: 1.0.0
**Created**: 2025-12-24
**Owner**: Spec Architect Agent

---

## Overview

The **Spec Authoring** skill is a systematic approach to writing clear, testable, technology-agnostic feature specifications following the **Evolution of Todo** Constitution's **Spec-First Development** principle. This skill ensures all features are properly specified before implementation begins.

**Purpose**: Transform user requirements into structured specifications with user stories, acceptance criteria, and implementation notes.

**Output**: Complete feature specification in `specs/<feature>/spec.md`

---

## Skill Components

### 1. User Stories
- Written from user perspective ("As a user, I can...")
- Focus on user value, not implementation
- Prioritized (P1, P2, P3)
- Independently testable

### 2. Acceptance Criteria
- Concrete, testable scenarios
- Input → Expected output format
- Edge cases and error conditions
- Technology-agnostic

### 3. Implementation Notes
- Phase assignment (I, II, III, IV, V)
- Technology constraints (if any)
- Data structures (conceptual level)
- Integration points

---

## Template Structure

```markdown
# Feature: [Feature Name]

## User Stories

- As a [user role], I can [action] so that [benefit]
- As a [user role], I can [action] so that [benefit]
- As a [user role], I can [action] so that [benefit]

## Acceptance Criteria

### Happy Path
- [Input/Action] → [Expected Output]
- [Input/Action] → [Expected Output]

### Edge Cases
- [Edge Case Input] → [Expected Behavior]
- [Error Condition] → [Error Message]

### Data Constraints
- [Constraint description]
- [Validation rule]

## Implementation Notes

- **Phase**: [I | II | III | IV | V]
- **Storage**: [Storage mechanism]
- **Tech**: [Technology constraints]
- **Data structure**: [Conceptual data model]
- **Integration**: [Related systems/components]
```

---

## Example: Task CRUD Operations

### Feature: Task CRUD Operations

## User Stories

- As a user, I can add tasks with title + description
- As a user, I can view all tasks with status indicators
- As a user, I can delete tasks by ID
- As a user, I can mark tasks complete/incomplete

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

### Data Constraints
- In-memory storage only - data lost on app restart (Phase I)
- Task IDs auto-increment starting from 1
- Title required (1-500 characters)
- Description optional
- Status: "pending" (default) or "completed"

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
    "created_at": str  # ISO format
  }
  ```
- **CLI Commands**:
  - `python todo.py add <title> [description]`
  - `python todo.py list`
  - `python todo.py complete <id>`
  - `python todo.py delete <id>`

---

## Skill Workflow

### Step 1: Gather Requirements
- Read user request or feature description
- Identify user needs and goals
- Note any constraints or preferences

### Step 2: Extract User Stories
- Identify 3-7 user stories
- Write in "As a [role], I can [action]" format
- Focus on user value, not implementation
- Assign priorities (P1 = MVP, P2 = Nice-to-have, P3 = Future)

### Step 3: Define Acceptance Criteria
- Write concrete input → output examples
- Cover happy path scenarios
- Identify edge cases and errors
- Ensure criteria are testable (manual or automated)

### Step 4: Document Implementation Notes
- Assign to phase (I through V)
- Note technology constraints (if any)
- Describe data structures conceptually
- Identify integration points

### Step 5: Mark Ambiguities
- Flag unclear requirements with `[NEEDS CLARIFICATION: ...]`
- Prepare clarifying questions for user
- Use `/sp.clarify` skill if needed

### Step 6: Validate Against Constitution
- ✅ Technology-agnostic (no "use React hooks" in spec)
- ✅ Testable (all acceptance criteria can be verified)
- ✅ Complete (user stories, acceptance, implementation notes)
- ✅ Prioritized (P1/P2/P3 or similar)

---

## Anti-Patterns (What NOT to Do)

❌ **Don't specify implementation details in spec**:
- Bad: "Use useState hook to manage form state"
- Good: "Form maintains current input values"

❌ **Don't write untestable acceptance criteria**:
- Bad: "The UI should feel smooth"
- Good: "List renders in <100ms with 100 items"

❌ **Don't mix multiple features in one spec**:
- Bad: "User authentication, todo CRUD, and reporting"
- Good: Separate specs for auth, todos, and reporting

❌ **Don't skip edge cases**:
- Bad: Only happy path scenarios
- Good: Happy path + edge cases + error conditions

❌ **Don't use vague language**:
- Bad: "System should handle errors gracefully"
- Good: "When API fails, show error: 'Unable to connect. Try again.'"

---

## Best Practices

✅ **Use concrete examples**:
- Input: `add "Buy milk" "2 liters"`
- Output: "Task 1 created successfully"

✅ **Show error messages verbatim**:
- "Task not found - ID must exist"
- "Error: Title cannot be empty"

✅ **Describe data formats**:
- "ISO 8601 datetime format"
- "Table format: ID | Title | Status"

✅ **Specify validation rules**:
- "Title required (1-500 characters)"
- "ID must be positive integer"

✅ **Include boundary conditions**:
- Empty list behavior
- Non-existent ID handling
- Duplicate prevention (if applicable)

---

## Related Skills

- **Clarification Skill** (`/sp.clarify`): Resolve ambiguities in specs
- **Planning Skill** (`/sp.plan`): Convert specs to implementation plans
- **Task Breakdown Skill** (`/sp.tasks`): Convert plans to actionable tasks

---

## Skill Invocation

**Command**: `/sp.specify <feature description>`

**Example**:
```
/sp.specify "Phase I: In-Memory Python Console App with basic Todo CRUD operations"
```

**Alternative**: Direct activation
```
Act as Spec Architect Agent and write specification for Task CRUD Operations
```

---

## Success Metrics

A well-written spec has:
- ✅ 3-7 clear user stories
- ✅ 10+ concrete acceptance criteria
- ✅ Edge cases and error conditions documented
- ✅ No ambiguities (or marked with [NEEDS CLARIFICATION])
- ✅ Technology-agnostic language
- ✅ Testable criteria (can verify pass/fail)
- ✅ Implementation notes for context

---

## Examples

### Example 1: Minimal Valid Spec

```markdown
# Feature: User Authentication

## User Stories

- As a user, I can register with email and password
- As a user, I can log in with my credentials
- As a user, I can log out of my account

## Acceptance Criteria

- `register "user@example.com" "SecurePass123!"` → "Account created successfully"
- `login "user@example.com" "SecurePass123!"` → "Logged in as user@example.com"
- `login "user@example.com" "WrongPass"` → "Error: Invalid email or password"
- `logout` → "Logged out successfully"

## Implementation Notes

- **Phase**: II
- **Storage**: PostgreSQL users table
- **Tech**: FastAPI + Better Auth + JWT
- **Data structure**: { id, email, password_hash, created_at }
```

### Example 2: Feature with Ambiguities

```markdown
# Feature: Todo Priorities

## User Stories

- As a user, I can assign priorities to todos
- As a user, I can filter todos by priority

## Acceptance Criteria

- `add "Buy milk" --priority high` → "Task 1 created (High priority)"
- `list --priority high` → Shows only high priority tasks
- [NEEDS CLARIFICATION: What priority levels are supported? low/medium/high or 1-5?]
- [NEEDS CLARIFICATION: Can users change priority after creation?]

## Implementation Notes

- **Phase**: II
- **Storage**: Add `priority` field to todos table
- **Tech**: [NEEDS CLARIFICATION: Dropdown or numeric input?]
```

**Next Step**: Use `/sp.clarify` to resolve ambiguities before finalizing spec.

---

## Revision History

| **Version** | **Date**       | **Changes**                                      |
|-------------|----------------|--------------------------------------------------|
| 1.0.0       | 2025-12-24     | Initial skill documentation                      |

---

## References

- **Constitution**: `.specify/memory/constitution.md` (Principle I: Spec-First Development)
- **Spec Template**: `.specify/templates/spec-template.md`
- **Spec Architect Agent**: `.claude/agents/spec-architect.md`
- **Example Specs**: `specs/001-phase-i-console-app/spec.md` (to be created)

---

**Status**: Ready for immediate use across all phases
**Activation**: `/sp.specify <feature>` or `Act as Spec Architect Agent`
