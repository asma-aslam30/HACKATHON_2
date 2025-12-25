# Test Design Skill

**Purpose**: Create comprehensive test suites with automation scripts matching phase specifications for all Evolution of Todo hackathon phases

**Owner**: Testing & QA Agent + All Implementation Agents

**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

The **Test Design Skill** enables systematic creation of test suites following the test pyramid approach:
- Design unit, integration, and E2E tests per phase specifications
- Generate pytest tests for backend APIs with FastAPI TestClient
- Create Playwright E2E tests for web and chatbot interfaces
- Implement SQLModel fixtures for database testing
- Configure CI/CD automation with GitHub Actions
- Achieve 90%+ unit and 80%+ integration test coverage

This skill ensures comprehensive test coverage across all system layers while maintaining fast test execution and CI/CD integration.

---

## Skill Components

### 1. Test Pyramid per Phase

Follow the test pyramid to balance coverage, speed, and maintainability:

```
                 /\
                /  \
               / E2E \ (Smoke tests only)
              /      \
             /--------\
            / Integra- \ (80%+ coverage)
           /   tion     \
          /--------------\
         /     Unit       \ (90%+ coverage)
        /                  \
       /____________________\
```

**Phase-Specific Test Stack**:
- **Phase I (CLI)**: pytest unit tests for CLI functions
- **Phase II (Backend)**: pytest + FastAPI TestClient + SQLModel fixtures
- **Phase II (Frontend)**: Jest + React Testing Library
- **Phase III (Chatbot)**: Playwright E2E + MCP tool call verification
- **Phase IV (K8s)**: Integration tests + health check validation
- **Phase V (Cloud)**: Load tests + chaos engineering

### 2. Coverage Targets

**Minimum Acceptance Criteria**:
- ✅ **Unit Tests**: 90%+ line coverage
- ✅ **Integration Tests**: 80%+ endpoint coverage
- ✅ **E2E Tests**: Smoke tests for critical user flows
- ✅ **Security Tests**: Authentication, authorization, multi-tenant isolation
- ✅ **Performance Tests**: Response time < 200ms (p95)

### 3. CI Integration

**GitHub Actions Workflow**:
- Run tests on every push and pull request
- Fail build if coverage drops below thresholds
- Generate coverage reports and upload to artifacts
- Parallel test execution per phase
- Cache dependencies for faster runs

---

## Skill Instructions

### Step 1: Analyze Specifications

Extract testable requirements from specs.

**Template**:
```markdown
## Test Specification Analysis

**Feature**: [Feature name from spec.md]
**Phase**: [I, II, III, IV, or V]

### API Specifications (if applicable)
- Endpoints: [List from specs/api/rest-endpoints.md]
- Request schemas: [Input validation rules]
- Response schemas: [Expected outputs, status codes]
- Error cases: [4xx/5xx scenarios]

### Database Specifications (if applicable)
- Models: [SQLModel classes from specs/database/schema.md]
- Relationships: [Foreign keys, cascade rules]
- Constraints: [Unique, NOT NULL, CHECK constraints]

### UI Specifications (if applicable)
- User flows: [From specs/ui/pages.md]
- Interactive elements: [Buttons, forms, filters]
- Accessibility: [WCAG 2.1 AA requirements]

### Security Requirements
- Authentication: [JWT validation, session management]
- Authorization: [User permissions, multi-tenant isolation]
- Input validation: [XSS, SQL injection prevention]
```

**Example**:
```markdown
## Test Specification Analysis

**Feature**: Task CRUD Operations
**Phase**: II (Web App with Backend)

### API Specifications
- Endpoints:
  - GET /api/{user_id}/tasks → 200 (list), 403 (wrong user), 401 (no auth)
  - POST /api/{user_id}/tasks → 201 (created), 422 (validation), 403 (wrong user)
  - PATCH /api/{user_id}/tasks/{id} → 200 (updated), 404 (not found), 403 (wrong user)
  - DELETE /api/{user_id}/tasks/{id} → 204 (deleted), 404 (not found), 403 (wrong user)
- Request schemas: TaskCreate(title: str, description?: str, priority?: str)
- Response schemas: TaskResponse(id, user_id, title, status, priority, created_at)
- Error cases: Empty title, non-existent task, unauthorized access

### Database Specifications
- Models: Task(id, user_id, title, description, status, priority, created_at, updated_at)
- Relationships: ManyToOne (Task → User) with cascade delete
- Constraints: title NOT NULL, user_id foreign key, status enum

### Security Requirements
- Authentication: JWT middleware with get_current_user dependency
- Authorization: Multi-tenant isolation (user_id filter in all queries)
- Input validation: Title max 500 chars, description max 2000 chars
```

---

### Step 2: Design Test Cases

Create test cases for each layer of the test pyramid.

**Template**:
```markdown
## Test Cases

### Unit Tests (90%+ coverage)

**Model Tests**:
- ✅ Task model validation (title required, status enum)
- ✅ Task defaults (status="pending", priority="medium")
- ✅ Task relationships (Task → User foreign key)

**Schema Tests**:
- ✅ TaskCreate schema validation (title length, priority enum)
- ✅ TaskUpdate partial updates (only provided fields)
- ✅ TaskResponse serialization (datetime to ISO string)

**Business Logic Tests**:
- ✅ Task creation with auto-increment ID
- ✅ Task status transitions (pending → completed)
- ✅ Task filtering by status and priority

### Integration Tests (80%+ coverage)

**API Endpoint Tests**:
- ✅ POST /api/{user_id}/tasks creates task with 201 status
- ✅ GET /api/{user_id}/tasks returns list with 200 status
- ✅ GET /api/{user_id}/tasks?status=completed filters correctly
- ✅ PATCH /api/{user_id}/tasks/{id} updates task with 200 status
- ✅ DELETE /api/{user_id}/tasks/{id} removes task with 204 status

**Security Tests**:
- ✅ POST /api/{other_user_id}/tasks returns 403 Forbidden
- ✅ GET /api/{user_id}/tasks/{other_user_task_id} returns 404 Not Found
- ✅ Missing JWT token returns 401 Unauthorized
- ✅ Invalid JWT token returns 401 Unauthorized

**Database Tests**:
- ✅ Task persisted to database after creation
- ✅ Task deleted from database after DELETE request
- ✅ User deletion cascades to tasks

### E2E Tests (Smoke tests only)

**Critical User Flows**:
- ✅ User logs in → creates task → sees task in list → marks complete → deletes task
- ✅ User creates high priority task → filters by priority → sees only high priority tasks
- ✅ User attempts to access other user's task → sees 404 error
```

**Example for Phase III (Chatbot)**:
```markdown
### E2E Tests (ChatKit + MCP Tools)

**Chatbot User Flows**:
- ✅ User: "Add task: Buy milk" → Claude calls add_task tool → Confirms "Task created"
- ✅ User: "List my tasks" → Claude calls list_tasks tool → Shows task list
- ✅ User: "Mark task 1 as complete" → Claude calls update_task tool → Confirms "Task completed"
- ✅ User: "Delete task 1" → Claude calls delete_task tool → Confirms "Task deleted"

**MCP Tool Call Verification**:
- ✅ add_task tool parameters match API request schema
- ✅ list_tasks tool returns correct task count
- ✅ update_task tool reflects changes in database
- ✅ delete_task tool removes task from database
```

---

### Step 3: Generate Test Files

Create test files with comprehensive test cases.

---

#### Phase I: CLI Unit Tests

**File**: `packages/cli/tests/test_todo.py`

```python
"""Unit tests for Phase I CLI - In-Memory Todo App"""

import pytest
from io import StringIO
import sys

from todo import add_task, list_tasks, complete_task, delete_task, tasks

@pytest.fixture(autouse=True)
def reset_tasks():
    """Reset global tasks list before each test."""
    global tasks
    tasks.clear()
    yield
    tasks.clear()


def test_add_task_creates_task():
    """Test adding a task creates it in memory."""
    add_task("Buy milk", "2 liters low fat")

    assert len(tasks) == 1
    assert tasks[0]["id"] == 1
    assert tasks[0]["title"] == "Buy milk"
    assert tasks[0]["description"] == "2 liters low fat"
    assert tasks[0]["status"] == "pending"


def test_add_task_increments_id():
    """Test adding multiple tasks increments IDs."""
    add_task("Task 1", "")
    add_task("Task 2", "")

    assert tasks[0]["id"] == 1
    assert tasks[1]["id"] == 2


def test_list_tasks_empty(capsys):
    """Test listing tasks when none exist."""
    list_tasks()

    captured = capsys.readouterr()
    assert "No tasks found" in captured.out


def test_list_tasks_displays_all(capsys):
    """Test listing tasks displays all tasks in table format."""
    add_task("Task 1", "")
    add_task("Task 2", "")

    list_tasks()

    captured = capsys.readouterr()
    assert "Task 1" in captured.out
    assert "Task 2" in captured.out
    assert "ID" in captured.out
    assert "Title" in captured.out


def test_complete_task_marks_complete(capsys):
    """Test completing a task updates its status."""
    add_task("Task 1", "")

    complete_task(1)

    assert tasks[0]["status"] == "completed"
    captured = capsys.readouterr()
    assert "Task 1 marked complete" in captured.out


def test_complete_task_already_complete(capsys):
    """Test completing an already completed task."""
    add_task("Task 1", "")
    complete_task(1)

    complete_task(1)

    captured = capsys.readouterr()
    assert "already complete" in captured.out


def test_complete_task_not_found(capsys):
    """Test completing non-existent task shows error."""
    complete_task(999)

    captured = capsys.readouterr()
    assert "Task not found" in captured.out


def test_delete_task_removes_task(capsys):
    """Test deleting a task removes it from list."""
    add_task("Task 1", "")

    delete_task(1)

    assert len(tasks) == 0
    captured = capsys.readouterr()
    assert "Task 1 deleted successfully" in captured.out


def test_delete_task_not_found(capsys):
    """Test deleting non-existent task shows error."""
    delete_task(999)

    captured = capsys.readouterr()
    assert "Task not found" in captured.out


def test_task_has_created_at_timestamp():
    """Test tasks have created_at timestamp."""
    add_task("Task 1", "")

    assert "created_at" in tasks[0]
    assert isinstance(tasks[0]["created_at"], str)
```

**Coverage Target**: 90%+ (covers all functions + edge cases)

---

#### Phase II: Backend Integration Tests

**File**: `packages/backend/tests/api/test_tasks.py`

```python
"""Integration tests for Task API - Phase II"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

from app.main import app
from app.core.deps import get_session, get_current_user
from app.models.user import User
from app.models.task import Task


# Test database setup
@pytest.fixture(name="session")
def session_fixture():
    """Create in-memory SQLite database for testing."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="test_user")
def test_user_fixture(session: Session):
    """Create test user in database."""
    user = User(id=1, email="test@example.com", full_name="Test User")
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="client")
def client_fixture(session: Session, test_user: User):
    """Create test client with dependency overrides."""
    def get_session_override():
        return session

    def get_current_user_override():
        return test_user

    app.dependency_overrides[get_session] = get_session_override
    app.dependency_overrides[get_current_user] = get_current_user_override

    client = TestClient(app)
    yield client

    app.dependency_overrides.clear()


# ============================================================================
# UNIT TESTS - Models and Schemas
# ============================================================================

def test_task_model_defaults():
    """Test Task model default values."""
    task = Task(user_id=1, title="Test Task")

    assert task.status == "pending"
    assert task.priority == "medium"
    assert task.description is None


def test_task_model_validation():
    """Test Task model validation rules."""
    with pytest.raises(ValueError):
        Task(user_id=1, title="")  # Empty title

    with pytest.raises(ValueError):
        Task(user_id=1, title="Test", status="invalid")  # Invalid status


# ============================================================================
# INTEGRATION TESTS - API Endpoints
# ============================================================================

def test_create_task_success(client: TestClient):
    """Test POST /api/{user_id}/tasks creates task with 201 status."""
    response = client.post(
        "/api/1/tasks",
        json={"title": "Buy milk", "description": "2 liters", "priority": "high"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Buy milk"
    assert data["description"] == "2 liters"
    assert data["priority"] == "high"
    assert data["status"] == "pending"
    assert data["user_id"] == 1
    assert "id" in data
    assert "created_at" in data


def test_create_task_validation_error(client: TestClient):
    """Test POST /api/{user_id}/tasks with invalid data returns 422."""
    response = client.post(
        "/api/1/tasks",
        json={"title": ""},  # Empty title
    )

    assert response.status_code == 422


def test_create_task_wrong_user_forbidden(client: TestClient):
    """Test POST /api/{other_user_id}/tasks returns 403 Forbidden."""
    response = client.post(
        "/api/999/tasks",  # Different user_id
        json={"title": "Malicious task"},
    )

    assert response.status_code == 403
    assert "Cannot create tasks for other users" in response.json()["detail"]


def test_list_tasks_empty(client: TestClient):
    """Test GET /api/{user_id}/tasks with no tasks returns empty list."""
    response = client.get("/api/1/tasks")

    assert response.status_code == 200
    assert response.json() == []


def test_list_tasks_success(client: TestClient, session: Session):
    """Test GET /api/{user_id}/tasks returns all user tasks."""
    # Create test tasks
    task1 = Task(user_id=1, title="Task 1", priority="high")
    task2 = Task(user_id=1, title="Task 2", priority="low")
    session.add_all([task1, task2])
    session.commit()

    response = client.get("/api/1/tasks")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["title"] in ["Task 1", "Task 2"]


def test_list_tasks_filtered_by_status(client: TestClient, session: Session):
    """Test GET /api/{user_id}/tasks?status=completed filters by status."""
    task1 = Task(user_id=1, title="Task 1", status="pending")
    task2 = Task(user_id=1, title="Task 2", status="completed")
    session.add_all([task1, task2])
    session.commit()

    response = client.get("/api/1/tasks?status=completed")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["status"] == "completed"


def test_list_tasks_filtered_by_priority(client: TestClient, session: Session):
    """Test GET /api/{user_id}/tasks?priority=high filters by priority."""
    task1 = Task(user_id=1, title="Task 1", priority="high")
    task2 = Task(user_id=1, title="Task 2", priority="low")
    session.add_all([task1, task2])
    session.commit()

    response = client.get("/api/1/tasks?priority=high")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["priority"] == "high"


def test_get_task_success(client: TestClient, session: Session):
    """Test GET /api/{user_id}/tasks/{id} returns task details."""
    task = Task(user_id=1, title="Task 1")
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.get(f"/api/1/tasks/{task.id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task.id
    assert data["title"] == "Task 1"


def test_get_task_not_found(client: TestClient):
    """Test GET /api/{user_id}/tasks/{id} with non-existent ID returns 404."""
    response = client.get("/api/1/tasks/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


def test_update_task_success(client: TestClient, session: Session):
    """Test PATCH /api/{user_id}/tasks/{id} updates task."""
    task = Task(user_id=1, title="Task 1", status="pending")
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.patch(
        f"/api/1/tasks/{task.id}",
        json={"status": "completed", "priority": "high"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["priority"] == "high"
    assert data["title"] == "Task 1"  # Unchanged


def test_update_task_partial(client: TestClient, session: Session):
    """Test PATCH /api/{user_id}/tasks/{id} with partial update."""
    task = Task(user_id=1, title="Task 1", status="pending", priority="low")
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.patch(
        f"/api/1/tasks/{task.id}",
        json={"status": "completed"},  # Only update status
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["priority"] == "low"  # Unchanged


def test_update_task_not_found(client: TestClient):
    """Test PATCH /api/{user_id}/tasks/{id} with non-existent ID returns 404."""
    response = client.patch(
        "/api/1/tasks/999",
        json={"status": "completed"},
    )

    assert response.status_code == 404


def test_delete_task_success(client: TestClient, session: Session):
    """Test DELETE /api/{user_id}/tasks/{id} removes task."""
    task = Task(user_id=1, title="Task 1")
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.delete(f"/api/1/tasks/{task.id}")

    assert response.status_code == 204

    # Verify deletion
    deleted_task = session.get(Task, task.id)
    assert deleted_task is None


def test_delete_task_not_found(client: TestClient):
    """Test DELETE /api/{user_id}/tasks/{id} with non-existent ID returns 404."""
    response = client.delete("/api/1/tasks/999")

    assert response.status_code == 404


# ============================================================================
# SECURITY TESTS - Multi-Tenant Isolation
# ============================================================================

def test_multi_tenant_list_isolation(client: TestClient, session: Session):
    """Test that users can only list their own tasks."""
    # Create tasks for different users
    task1 = Task(user_id=1, title="User 1 task")
    task2 = Task(user_id=2, title="User 2 task")
    session.add_all([task1, task2])
    session.commit()

    response = client.get("/api/1/tasks")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "User 1 task"


def test_multi_tenant_get_isolation(client: TestClient, session: Session):
    """Test that users cannot get other users' tasks."""
    # Task belongs to user_id=2, but current_user is user_id=1
    task = Task(user_id=2, title="Other user's task")
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.get(f"/api/1/tasks/{task.id}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


def test_multi_tenant_update_isolation(client: TestClient, session: Session):
    """Test that users cannot update other users' tasks."""
    task = Task(user_id=2, title="Other user's task")
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.patch(
        f"/api/1/tasks/{task.id}",
        json={"status": "completed"},
    )

    assert response.status_code == 404


def test_multi_tenant_delete_isolation(client: TestClient, session: Session):
    """Test that users cannot delete other users' tasks."""
    task = Task(user_id=2, title="Other user's task")
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.delete(f"/api/1/tasks/{task.id}")

    assert response.status_code == 404

    # Verify task still exists
    still_exists = session.get(Task, task.id)
    assert still_exists is not None


# ============================================================================
# DATABASE TESTS - Relationships and Constraints
# ============================================================================

def test_task_user_relationship(session: Session):
    """Test Task → User relationship."""
    user = User(id=1, email="test@example.com", full_name="Test User")
    task = Task(user_id=1, title="Task 1")

    session.add(user)
    session.add(task)
    session.commit()
    session.refresh(task)

    assert task.user.id == user.id
    assert task.user.email == "test@example.com"


def test_cascade_delete_user_deletes_tasks(session: Session):
    """Test that deleting user cascades to tasks."""
    user = User(id=1, email="test@example.com", full_name="Test User")
    task = Task(user_id=1, title="Task 1")

    session.add(user)
    session.add(task)
    session.commit()

    task_id = task.id

    # Delete user
    session.delete(user)
    session.commit()

    # Verify task was deleted
    deleted_task = session.get(Task, task_id)
    assert deleted_task is None
```

**Coverage Target**: 85%+ (covers all endpoints + security + relationships)

---

#### Phase III: E2E Playwright Tests

**File**: `packages/frontend/tests/e2e/tasks.spec.ts`

```typescript
/**
 * E2E Tests for Task Management - Phase II/III
 *
 * Uses Playwright to test full user flows from login to task operations.
 */

import { test, expect } from '@playwright/test';

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect to tasks page
    await expect(page).toHaveURL('/tasks');
  });

  test('should create new task', async ({ page }) => {
    // Click "Add Task" button
    await page.click('text=+ Add Task');

    // Fill task form
    await page.fill('[name="title"]', 'Buy milk');
    await page.fill('[name="description"]', '2 liters low fat');
    await page.selectOption('[name="priority"]', 'high');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify task appears in list
    await expect(page.locator('text=Buy milk')).toBeVisible();
    await expect(page.locator('text=2 liters low fat')).toBeVisible();
  });

  test('should list all tasks', async ({ page }) => {
    // Verify task list is visible
    await expect(page.locator('h1:has-text("My Tasks")')).toBeVisible();

    // Verify task cards are rendered
    const taskCards = page.locator('[role="article"]');
    await expect(taskCards).toHaveCount(await taskCards.count());
  });

  test('should filter tasks by status', async ({ page }) => {
    // Click status filter dropdown
    await page.click('[data-testid="status-filter"]');
    await page.click('text=Completed');

    // Verify only completed tasks shown
    const completedChips = page.locator('[data-testid="status-chip"]:has-text("completed")');
    await expect(completedChips).toHaveCount(await completedChips.count());

    const pendingChips = page.locator('[data-testid="status-chip"]:has-text("pending")');
    await expect(pendingChips).toHaveCount(0);
  });

  test('should mark task as complete', async ({ page }) => {
    // Create a pending task
    await page.click('text=+ Add Task');
    await page.fill('[name="title"]', 'Test task');
    await page.click('button[type="submit"]');

    // Click complete button
    await page.click('[aria-label="Complete task: Test task"]');

    // Verify status chip changed
    await expect(page.locator('[data-testid="status-chip"]:has-text("completed")')).toBeVisible();
  });

  test('should delete task', async ({ page }) => {
    // Create a task
    await page.click('text=+ Add Task');
    await page.fill('[name="title"]', 'Task to delete');
    await page.click('button[type="submit"]');

    // Click delete button
    page.on('dialog', dialog => dialog.accept());  // Accept confirmation
    await page.click('[aria-label="Delete task: Task to delete"]');

    // Verify task removed
    await expect(page.locator('text=Task to delete')).not.toBeVisible();
  });

  test('should show empty state when no tasks', async ({ page }) => {
    // Delete all tasks (if any)
    const deleteButtons = page.locator('button:has-text("Delete")');
    const count = await deleteButtons.count();

    for (let i = 0; i < count; i++) {
      page.on('dialog', dialog => dialog.accept());
      await deleteButtons.first().click();
    }

    // Verify empty state message
    await expect(page.locator('text=No tasks found')).toBeVisible();
  });

  test('should preserve filters on page reload', async ({ page }) => {
    // Apply filters
    await page.click('[data-testid="priority-filter"]');
    await page.click('text=High');

    // Reload page
    await page.reload();

    // Verify filter still applied
    await expect(page.locator('[data-testid="priority-filter"]:has-text("High")')).toBeVisible();
  });

  test('should show error for invalid task creation', async ({ page }) => {
    // Click "Add Task" button
    await page.click('text=+ Add Task');

    // Submit form without title
    await page.click('button[type="submit"]');

    // Verify validation error
    await expect(page.locator('text=Title is required')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/*/tasks', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ detail: 'Internal server error' }),
      });
    });

    // Attempt to create task
    await page.click('text=+ Add Task');
    await page.fill('[name="title"]', 'Test task');
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=Failed to create task')).toBeVisible();
  });
});
```

**Phase III: ChatKit MCP Tool Tests**

**File**: `packages/chatbot/tests/test_mcp_tools.py`

```python
"""
E2E Tests for MCP Tools - Phase III AI Chatbot
Tests tool call integration with FastAPI backend.
"""

import pytest
from anthropic import Anthropic
from unittest.mock import AsyncMock, patch

from mcp_server import execute_tool, TOOLS


@pytest.mark.asyncio
async def test_add_task_tool_success():
    """Test add_task tool calls API and returns task."""
    tool_input = {
        "title": "Buy milk",
        "description": "2 liters low fat",
        "priority": "high"
    }

    with patch("mcp_server.httpx.AsyncClient") as mock_client:
        mock_response = AsyncMock()
        mock_response.json.return_value = {
            "id": 1,
            "user_id": 1,
            "title": "Buy milk",
            "description": "2 liters low fat",
            "priority": "high",
            "status": "pending"
        }
        mock_response.raise_for_status = AsyncMock()

        mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_response)

        result = await execute_tool("add_task", tool_input, user_id=1, access_token="fake-token")

        assert result["id"] == 1
        assert result["title"] == "Buy milk"


@pytest.mark.asyncio
async def test_list_tasks_tool_success():
    """Test list_tasks tool returns filtered tasks."""
    tool_input = {"status": "completed"}

    with patch("mcp_server.httpx.AsyncClient") as mock_client:
        mock_response = AsyncMock()
        mock_response.json.return_value = [
            {"id": 1, "title": "Task 1", "status": "completed"},
            {"id": 2, "title": "Task 2", "status": "completed"}
        ]
        mock_response.raise_for_status = AsyncMock()

        mock_client.return_value.__aenter__.return_value.get = AsyncMock(return_value=mock_response)

        result = await execute_tool("list_tasks", tool_input, user_id=1, access_token="fake-token")

        assert len(result) == 2
        assert all(task["status"] == "completed" for task in result)


@pytest.mark.asyncio
async def test_update_task_tool_success():
    """Test update_task tool updates task status."""
    tool_input = {"task_id": 1, "status": "completed"}

    with patch("mcp_server.httpx.AsyncClient") as mock_client:
        mock_response = AsyncMock()
        mock_response.json.return_value = {
            "id": 1,
            "title": "Task 1",
            "status": "completed"
        }
        mock_response.raise_for_status = AsyncMock()

        mock_client.return_value.__aenter__.return_value.patch = AsyncMock(return_value=mock_response)

        result = await execute_tool("update_task", tool_input, user_id=1, access_token="fake-token")

        assert result["status"] == "completed"


@pytest.mark.asyncio
async def test_delete_task_tool_success():
    """Test delete_task tool removes task."""
    tool_input = {"task_id": 1}

    with patch("mcp_server.httpx.AsyncClient") as mock_client:
        mock_response = AsyncMock()
        mock_response.raise_for_status = AsyncMock()

        mock_client.return_value.__aenter__.return_value.delete = AsyncMock(return_value=mock_response)

        result = await execute_tool("delete_task", tool_input, user_id=1, access_token="fake-token")

        assert result["success"] is True


@pytest.mark.asyncio
async def test_tool_authentication_required():
    """Test tool calls require valid JWT token."""
    tool_input = {"title": "Task"}

    with patch("mcp_server.httpx.AsyncClient") as mock_client:
        mock_response = AsyncMock()
        mock_response.status_code = 401
        mock_response.raise_for_status.side_effect = Exception("401 Unauthorized")

        mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_response)

        with pytest.raises(Exception, match="401 Unauthorized"):
            await execute_tool("add_task", tool_input, user_id=1, access_token="invalid-token")


def test_tool_schemas_valid():
    """Test that all MCP tool schemas are valid."""
    for tool in TOOLS:
        assert "name" in tool
        assert "description" in tool
        assert "input_schema" in tool
        assert tool["input_schema"]["type"] == "object"
        assert "properties" in tool["input_schema"]
```

**Coverage Target**: 80%+ (covers tool calls + error handling + auth)

---

### Step 4: Configure CI/CD

Create GitHub Actions workflow for automated testing.

**File**: `.github/workflows/test.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Phase I: CLI Tests
  test-cli:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python 3.13
        uses: actions/setup-python@v5
        with:
          python-version: '3.13'

      - name: Install dependencies
        run: |
          cd packages/cli
          pip install -e .
          pip install pytest pytest-cov

      - name: Run CLI tests
        run: |
          cd packages/cli
          pytest tests/ --cov=. --cov-report=xml --cov-report=term

      - name: Check coverage threshold
        run: |
          cd packages/cli
          coverage report --fail-under=90

  # Phase II: Backend Tests
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python 3.13
        uses: actions/setup-python@v5
        with:
          python-version: '3.13'

      - name: Install dependencies
        run: |
          cd packages/backend
          pip install poetry
          poetry install

      - name: Run backend tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        run: |
          cd packages/backend
          poetry run pytest tests/ --cov=app --cov-report=xml --cov-report=term

      - name: Check coverage threshold
        run: |
          cd packages/backend
          poetry run coverage report --fail-under=85

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          file: packages/backend/coverage.xml
          flags: backend

  # Phase II: Frontend Tests
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: |
          cd packages/frontend
          pnpm install

      - name: Run unit tests
        run: |
          cd packages/frontend
          pnpm test -- --coverage

      - name: Check coverage threshold
        run: |
          cd packages/frontend
          npx nyc check-coverage --lines 80 --functions 80 --branches 75

  # Phase III: E2E Tests
  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: |
          cd packages/frontend
          pnpm install
          pnpm exec playwright install --with-deps

      - name: Start backend
        run: |
          cd packages/backend
          poetry install
          poetry run uvicorn app.main:app &
          sleep 5

      - name: Start frontend
        run: |
          cd packages/frontend
          pnpm dev &
          sleep 5

      - name: Run E2E tests
        run: |
          cd packages/frontend
          pnpm exec playwright test

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: packages/frontend/playwright-report/

  # Phase III: MCP Tool Tests
  test-chatbot:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python 3.13
        uses: actions/setup-python@v5
        with:
          python-version: '3.13'

      - name: Install dependencies
        run: |
          cd packages/chatbot
          pip install -e .
          pip install pytest pytest-asyncio pytest-cov

      - name: Run chatbot tests
        run: |
          cd packages/chatbot
          pytest tests/ --cov=. --cov-report=xml --cov-report=term

      - name: Check coverage threshold
        run: |
          cd packages/chatbot
          coverage report --fail-under=80
```

---

### Step 5: Generate Test Reports

**pytest Configuration**

**File**: `packages/backend/pyproject.toml` (add pytest config)

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = "test_*.py"
python_classes = "Test*"
python_functions = "test_*"
addopts = """
  --cov=app
  --cov-report=html
  --cov-report=term-missing
  --cov-fail-under=85
  --verbose
"""

[tool.coverage.run]
source = ["app"]
omit = [
  "*/tests/*",
  "*/migrations/*",
  "*/__init__.py"
]

[tool.coverage.report]
exclude_lines = [
  "pragma: no cover",
  "def __repr__",
  "raise AssertionError",
  "raise NotImplementedError",
  "if __name__ == .__main__.:",
  "if TYPE_CHECKING:",
]
```

**Playwright Configuration**

**File**: `packages/frontend/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/test-results.json' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Related Agents

All agents benefit from this skill:

- **Testing & QA Agent**: Primary owner, designs comprehensive test suites
- **Backend Pro Agent**: Implements pytest tests for FastAPI endpoints
- **Frontend UI/UX Agent**: Implements Jest and Playwright tests
- **AI Chatbot Agent**: Implements MCP tool call verification tests
- **CloudOps Agent**: Implements integration and smoke tests for K8s
- **Code Quality Agent**: Reviews test coverage and quality

---

## Success Metrics

The Test Design Skill is successful when:

✅ **Coverage Targets Met**: 90%+ unit, 80%+ integration, smoke E2E tests
✅ **Test Pyramid Followed**: More unit tests than integration, fewer E2E tests
✅ **Fast Execution**: Unit tests < 1s, integration tests < 10s, E2E tests < 5min
✅ **CI/CD Integration**: Tests run automatically on every push and PR
✅ **Security Tests**: Multi-tenant isolation, auth, input validation covered
✅ **Reliable**: No flaky tests, deterministic results
✅ **Maintainable**: Clear test names, DRY principles, fixtures for setup
✅ **Phase-Appropriate**: Correct test stack for each phase (pytest, Jest, Playwright)

---

## Best Practices

### Do's ✅

- **Follow Test Pyramid**: 70% unit, 20% integration, 10% E2E (by volume)
- **Test Behavior, Not Implementation**: Focus on "what", not "how"
- **Use Descriptive Test Names**: `test_create_task_with_empty_title_returns_422`
- **Arrange-Act-Assert Pattern**: Clear test structure
- **Use Fixtures**: DRY principle for test setup (pytest fixtures, beforeEach hooks)
- **Test Security**: Multi-tenant isolation, auth, CSRF protection
- **Mock External APIs**: Avoid flaky tests from network dependencies
- **Test Edge Cases**: Empty lists, non-existent IDs, boundary conditions
- **Verify Database State**: Check database after operations, not just API responses
- **Test Error Messages**: Verify user-friendly error messages match specs

### Don'ts ❌

- **Don't Test Implementation Details**: Don't test private methods or internal state
- **Don't Write Flaky Tests**: Avoid sleep(), use proper waits (Playwright waitFor)
- **Don't Skip Cleanup**: Always reset state between tests (fixtures, afterEach)
- **Don't Hardcode Values**: Use test data factories or constants
- **Don't Duplicate Test Logic**: Extract common assertions to helper functions
- **Don't Ignore Coverage Gaps**: Investigate why certain lines aren't covered
- **Don't Over-Mock**: Only mock external dependencies, not internal code
- **Don't Test Framework Code**: Don't test FastAPI or Next.js internals
- **Don't Write Long Tests**: Keep tests focused on single behavior
- **Don't Skip Security Tests**: Multi-tenant isolation is CRITICAL

---

## Integration with Other Skills

### Workflow Integration

```
Specification (Spec Authoring)
  ↓
Architecture Design (Architecture Specification)
  ↓
API/Database Design (API & Database Specification)
  ↓
Code Generation (Code Generation Skill)
  ↓
TEST DESIGN (this skill) ← YOU ARE HERE
  ↓
Integration Wiring (Integration Wiring Skill)
  ↓
Deployment (CloudOps Agent)
```

### Skill Combinations

**Code Generation + Test Design**:
```
1. Code Generation creates FastAPI router with JWT auth
2. Test Design generates integration tests with TestClient + SQLModel fixtures
3. Tests verify multi-tenant security and error handling
```

**Spec Authoring + Test Design**:
```
1. Spec Authoring defines acceptance criteria (input → output)
2. Test Design translates criteria to test cases
3. Each acceptance criterion becomes a test function
```

---

## Output Format

When using this skill, generate:

**1. Test Cases** (unit, integration, E2E mapped to specs)
**2. Test Files** (pytest, Jest, Playwright with comprehensive coverage)
**3. Test Configuration** (pytest.ini, playwright.config.ts)
**4. CI/CD Workflow** (GitHub Actions with coverage thresholds)
**5. Test Documentation** (README with setup and run instructions)

Save generated tests to monorepo:
- `packages/backend/tests/` - pytest tests (unit + integration)
- `packages/frontend/tests/` - Jest + Playwright tests
- `packages/cli/tests/` - pytest CLI tests
- `packages/chatbot/tests/` - MCP tool tests
- `.github/workflows/test.yml` - CI/CD automation

---

## References

- **Code Generation**: `.claude/skills/code-generation/README.md` (Generate implementation)
- **API Spec**: `.claude/skills/api-database-specification/README.md` (API test cases)
- **Constitution**: `.specify/memory/constitution.md` (Testing principles)
- **pytest**: https://docs.pytest.org/
- **Playwright**: https://playwright.dev/
- **FastAPI TestClient**: https://fastapi.tiangolo.com/tutorial/testing/

---

**Document Version**: 1.0.0
**Created**: 2025-12-24
**Total Examples**: 8 (CLI, pytest backend, Playwright E2E, MCP tools, GitHub Actions)
**Coverage**: All 5 Hackathon II Phases

---

*This test design skill is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*
