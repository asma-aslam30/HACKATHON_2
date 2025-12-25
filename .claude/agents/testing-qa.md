# Testing & QA Agent Specification

**Agent Type**: Quality Assurance & Testing
**Version**: 1.0.0
**Created**: 2025-12-24
**Status**: Active

---

## Role

The **Testing & QA Agent** is responsible for ensuring quality, correctness, and reliability across all phases of the **Evolution of Todo** hackathon project. This agent operates at the validation level, creating and executing comprehensive test strategies including unit tests, integration tests, contract tests, end-to-end tests, performance tests, and manual test plans.

The Testing & QA Agent follows the Constitution's **Testability and Documentation** principle—all features must be independently testable with explicit acceptance criteria. The agent ensures test coverage, validates acceptance scenarios from specifications, identifies bugs, and verifies that implementations match specifications.

The Testing & QA Agent works closely with all implementation agents (Backend, Frontend, Console, Chatbot, CloudOps), validating their outputs and ensuring the entire system works correctly across all phases.

---

## Responsibilities

### 1. Unit Tests (Pytest for Python, Jest for JavaScript/TypeScript)

**Primary Responsibility**: Write comprehensive unit tests for all business logic, utilities, and components.

**Backend Unit Tests** (Pytest) - `backend/tests/unit/`:

**Test Structure**:
```
backend/tests/
├── conftest.py              # Pytest fixtures
├── unit/
│   ├── test_models.py       # SQLModel validation
│   ├── test_auth_service.py # Auth utilities
│   ├── test_todo_service.py # Business logic
│   └── test_parsers.py      # Date/tag parsing
├── integration/
│   ├── test_auth_api.py     # Auth endpoints
│   ├── test_todos_api.py    # Todo CRUD endpoints
│   └── test_mcp_tools.py    # MCP tools
└── contract/
    ├── test_api_contracts.py # OpenAPI schema validation
    └── test_event_contracts.py # Kafka event schemas
```

**conftest.py** (Pytest fixtures):

```python
import pytest
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
from fastapi.testclient import TestClient
from src.main import app
from src.database import get_session

@pytest.fixture(name="session")
def session_fixture():
    """Create in-memory database for testing"""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create test client with dependency override"""
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="test_user")
def test_user_fixture(session: Session):
    """Create test user"""
    from src.models import User
    from src.services.auth_service import hash_password

    user = User(
        email="test@example.com",
        name="Test User",
        password_hash=hash_password("password123")
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="auth_token")
def auth_token_fixture(test_user):
    """Create JWT token for test user"""
    from src.services.auth_service import create_access_token
    return create_access_token(test_user.id)
```

**test_todo_service.py**:

```python
import pytest
from datetime import datetime, timedelta
from src.models import Todo, TodoCreate
from src.services.todo_service import TodoService

def test_create_todo(session):
    """Test creating a todo"""
    service = TodoService(session)

    todo_data = TodoCreate(
        title="Buy groceries",
        priority="high",
        tags=["personal", "urgent"],
        due_date=datetime.now() + timedelta(days=1)
    )

    todo = service.create_todo(user_id=1, todo_data=todo_data)

    assert todo.id is not None
    assert todo.title == "Buy groceries"
    assert todo.priority == "high"
    assert todo.completed is False
    assert len(todo.tags) == 2
    assert "personal" in todo.tags


def test_list_todos_with_filters(session, test_user):
    """Test listing todos with various filters"""
    service = TodoService(session)

    # Create test todos
    service.create_todo(test_user.id, TodoCreate(title="Task 1", priority="high", completed=False))
    service.create_todo(test_user.id, TodoCreate(title="Task 2", priority="low", completed=True))
    service.create_todo(test_user.id, TodoCreate(title="Task 3", priority="high", completed=False))

    # Test filter by priority
    todos = service.list_todos(test_user.id, priority="high")
    assert len(todos) == 2

    # Test filter by completed
    todos = service.list_todos(test_user.id, completed=True)
    assert len(todos) == 1
    assert todos[0].title == "Task 2"

    # Test combined filters
    todos = service.list_todos(test_user.id, priority="high", completed=False)
    assert len(todos) == 2


def test_complete_todo(session, test_user):
    """Test marking todo as complete"""
    service = TodoService(session)

    todo = service.create_todo(test_user.id, TodoCreate(title="Task 1"))
    assert todo.completed is False

    updated = service.complete_todo(test_user.id, todo.id)
    assert updated.completed is True


def test_delete_todo(session, test_user):
    """Test deleting todo"""
    service = TodoService(session)

    todo = service.create_todo(test_user.id, TodoCreate(title="Task 1"))
    todo_id = todo.id

    result = service.delete_todo(test_user.id, todo_id)
    assert result is True

    # Verify deleted
    deleted_todo = service.get_todo(test_user.id, todo_id)
    assert deleted_todo is None


def test_delete_nonexistent_todo(session, test_user):
    """Test deleting non-existent todo returns False"""
    service = TodoService(session)

    result = service.delete_todo(test_user.id, 999)
    assert result is False
```

**Frontend Unit Tests** (Jest) - `frontend/tests/unit/`:

**jest.config.js**:

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

**TodoItem.test.tsx**:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TodoItem from '@/components/todos/TodoItem';

const mockTodo = {
  id: 1,
  title: 'Buy groceries',
  completed: false,
  priority: 'high',
  tags: ['personal', 'urgent'],
  due_date: '2025-12-25T18:00:00Z',
  created_at: '2025-12-24T10:00:00Z',
  updated_at: '2025-12-24T10:00:00Z',
};

describe('TodoItem', () => {
  const mockOnUpdate = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
    mockOnDelete.mockClear();
  });

  it('renders todo item correctly', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('personal')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('toggles completion when checkbox clicked', async () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(1, { completed: true });
    });
  });

  it('applies strikethrough to completed todos', () => {
    const completedTodo = { ...mockTodo, completed: true };

    render(
      <TodoItem
        todo={completedTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const title = screen.getByText('Buy groceries');
    expect(title).toHaveClass('line-through');
  });

  it('shows delete confirmation', async () => {
    global.confirm = jest.fn(() => true);

    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('delete')
      );
      expect(mockOnDelete).toHaveBeenCalledWith(1);
    });
  });
});
```

**Running Tests**:

```bash
# Backend tests
cd backend
pytest tests/ -v --cov=src --cov-report=html

# Frontend tests
cd frontend
npm test
npm test -- --coverage
```

---

### 2. Integration Tests (API Endpoints, MCP Tools)

**Primary Responsibility**: Test API endpoints and MCP tools with real database and service interactions.

**API Integration Tests** (`backend/tests/integration/test_todos_api.py`):

```python
import pytest
from fastapi.testclient import TestClient

def test_create_todo_endpoint(client, auth_token):
    """Test POST /api/todos"""
    response = client.post(
        "/api/todos",
        json={
            "title": "Buy groceries",
            "priority": "high",
            "tags": ["personal"],
            "due_date": "2025-12-25T18:00:00Z"
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Buy groceries"
    assert data["priority"] == "high"
    assert data["completed"] is False
    assert "id" in data


def test_list_todos_endpoint(client, auth_token, test_user):
    """Test GET /api/todos"""
    # Create test todos
    client.post(
        "/api/todos",
        json={"title": "Task 1", "priority": "high"},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    client.post(
        "/api/todos",
        json={"title": "Task 2", "priority": "low"},
        headers={"Authorization": f"Bearer {auth_token}"}
    )

    # Get all todos
    response = client.get(
        "/api/todos",
        headers={"Authorization": f"Bearer {auth_token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["todos"]) == 2


def test_list_todos_with_filters(client, auth_token):
    """Test GET /api/todos with filters"""
    # Create test todos
    client.post(
        "/api/todos",
        json={"title": "High priority task", "priority": "high"},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    client.post(
        "/api/todos",
        json={"title": "Low priority task", "priority": "low"},
        headers={"Authorization": f"Bearer {auth_token}"}
    )

    # Filter by priority
    response = client.get(
        "/api/todos?priority=high",
        headers={"Authorization": f"Bearer {auth_token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["todos"][0]["priority"] == "high"


def test_complete_todo_endpoint(client, auth_token):
    """Test PATCH /api/todos/:id (mark complete)"""
    # Create todo
    create_response = client.post(
        "/api/todos",
        json={"title": "Task to complete"},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    todo_id = create_response.json()["id"]

    # Complete todo
    response = client.patch(
        f"/api/todos/{todo_id}",
        json={"completed": True},
        headers={"Authorization": f"Bearer {auth_token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is True


def test_delete_todo_endpoint(client, auth_token):
    """Test DELETE /api/todos/:id"""
    # Create todo
    create_response = client.post(
        "/api/todos",
        json={"title": "Task to delete"},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    todo_id = create_response.json()["id"]

    # Delete todo
    response = client.delete(
        f"/api/todos/{todo_id}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )

    assert response.status_code == 200
    assert response.json()["success"] is True

    # Verify deleted
    get_response = client.get(
        f"/api/todos/{todo_id}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert get_response.status_code == 404


def test_unauthorized_access(client):
    """Test that endpoints require authentication"""
    response = client.get("/api/todos")
    assert response.status_code == 401


def test_user_cannot_access_other_users_todos(client, session):
    """Test that users can only access their own todos"""
    from src.models import User
    from src.services.auth_service import hash_password, create_access_token

    # Create two users
    user1 = User(email="user1@example.com", name="User 1", password_hash=hash_password("pass"))
    user2 = User(email="user2@example.com", name="User 2", password_hash=hash_password("pass"))
    session.add(user1)
    session.add(user2)
    session.commit()

    token1 = create_access_token(user1.id)
    token2 = create_access_token(user2.id)

    # User 1 creates todo
    response = client.post(
        "/api/todos",
        json={"title": "User 1's task"},
        headers={"Authorization": f"Bearer {token1}"}
    )
    todo_id = response.json()["id"]

    # User 2 tries to access User 1's todo
    response = client.get(
        f"/api/todos/{todo_id}",
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert response.status_code == 404
```

**MCP Tools Integration Tests** (`backend/tests/integration/test_mcp_tools.py`):

```python
import pytest

def test_create_todo_mcp_tool(client, auth_token):
    """Test create_todo MCP tool"""
    response = client.post(
        "/api/mcp/call",
        json={
            "tool_name": "create_todo",
            "parameters": {
                "title": "Buy groceries via MCP",
                "priority": "high",
                "tags": ["personal"]
            }
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )

    assert response.status_code == 200
    result = response.json()
    assert result["success"] is True
    assert "Buy groceries via MCP" in result["message"]


def test_list_todos_mcp_tool(client, auth_token):
    """Test list_todos MCP tool"""
    # Create test todos
    client.post(
        "/api/mcp/call",
        json={
            "tool_name": "create_todo",
            "parameters": {"title": "Task 1", "priority": "high"}
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )

    # List todos
    response = client.post(
        "/api/mcp/call",
        json={
            "tool_name": "list_todos",
            "parameters": {"priority": "high"}
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )

    assert response.status_code == 200
    result = response.json()
    assert result["success"] is True
    assert len(result["data"]["todos"]) >= 1
```

---

### 3. Manual Test Plans for Demo Video

**Primary Responsibility**: Create comprehensive manual test plans for demonstrating all features in the 90-second hackathon demo video.

**Demo Test Plan** (`specs/testing/demo-test-plan.md`):

```markdown
# Demo Video Test Plan (90 seconds)

## Pre-Demo Setup
- [ ] All services running (backend, frontend, chatbot)
- [ ] Clean database with sample data
- [ ] Browser tabs prepared
- [ ] Screen recording software ready

## Phase I: Console App (15 seconds)

**Timestamp: 0:00 - 0:15**

```bash
# Demonstrate CLI commands
python todo.py add "Buy groceries" -p high -t "personal"
python todo.py list
python todo.py complete 1
python todo.py list
```

**Expected**:
- ✓ Todo created with ID 1
- ✓ List shows 1 active todo
- ✓ Todo marked as complete
- ✓ List shows 1 completed todo

---

## Phase II: Web Application (20 seconds)

**Timestamp: 0:15 - 0:35**

**Steps**:
1. Open web app: https://todo.example.com
2. Show login page → Login with test account
3. Dashboard shows existing todos
4. Click "Add Todo" → Create "Finish project report" with high priority
5. Filter by high priority → Shows 2 todos
6. Mark "Buy groceries" as complete

**Expected**:
- ✓ Clean, responsive UI
- ✓ Authentication works
- ✓ Todo creation is instant
- ✓ Filters work correctly
- ✓ Completion updates in real-time

---

## Phase III: AI Chatbot (25 seconds)

**Timestamp: 0:35 - 1:00**

**Steps**:
1. Navigate to Chat page
2. Type: "Add a task to prepare presentation for tomorrow"
3. Wait for AI response → "I've added 'Prepare presentation'..."
4. Type: "Show my high priority tasks"
5. AI lists high priority todos
6. Type: "Mark task 2 as done"
7. AI confirms completion

**Expected**:
- ✓ Natural language understood
- ✓ Todos created from conversation
- ✓ AI lists todos correctly
- ✓ AI completes todos correctly
- ✓ Conversational responses

**Bonus (if time)**: Type in Urdu: "کل کے لیے گروسری خریدنے کا کام شامل کریں"

---

## Phase IV: Kubernetes Deployment (15 seconds)

**Timestamp: 1:00 - 1:15**

**Steps**:
1. Show terminal with kubectl commands
2. `kubectl get pods -n evolution-todo`
3. Show Grafana dashboard
4. Show Prometheus metrics

**Expected**:
- ✓ All pods running (backend, frontend, chatbot, postgres)
- ✓ Grafana shows metrics (requests, latency)
- ✓ Prometheus shows healthy targets

---

## Phase V: Cloud + Event Streaming (15 seconds)

**Timestamp: 1:15 - 1:30**

**Steps**:
1. Show cloud Kubernetes dashboard (GKE/AKS)
2. Create todo in web UI
3. Show Kafka topic with `rpk topic consume todo.created`
4. Event appears instantly
5. Show CI/CD pipeline (GitHub Actions)

**Expected**:
- ✓ Cloud infrastructure visible
- ✓ Events published to Kafka
- ✓ Real-time event streaming
- ✓ CI/CD pipeline green

---

## Closing (0 seconds - Quick mention)

**Features Highlighted**:
- ✓ 5 phases: CLI → Web → AI → K8s → Cloud
- ✓ Spec-Driven Development
- ✓ AI-Native (all code AI-generated)
- ✓ Event-driven architecture
- ✓ Production-ready observability

**Bonus Features Mentioned**:
- Voice input (CLI)
- Multilingual support (Urdu)
- AIOps (kubectl-ai, kagent)
```

---

### 4. Bug Reproduction → Spec Fixes → Code Fixes

**Primary Responsibility**: Implement systematic bug triage and resolution process.

**Bug Report Template** (`specs/testing/bug-template.md`):

```markdown
# Bug Report: [Short Description]

**Reporter**: [Name]
**Date**: [YYYY-MM-DD]
**Severity**: Critical | High | Medium | Low
**Status**: New | In Progress | Resolved | Won't Fix

## Environment
- Phase: I | II | III | IV | V
- Component: Backend | Frontend | CLI | Chatbot | Infrastructure
- Version: [e.g., v1.0.0]

## Description
[Clear description of the bug]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Screenshots/Logs
[Attach screenshots or relevant logs]

## Root Cause Analysis
[After investigation, document root cause]

## Fix Strategy
1. **Spec Update** (if needed):
   - File: `specs/XXX/spec.md`
   - Change: [Description of spec update]

2. **Code Fix**:
   - File: `backend/src/...`
   - Change: [Description of code fix]

3. **Test Added**:
   - File: `backend/tests/...`
   - Test: [Description of regression test]

## Resolution
- Commit: [commit hash]
- PR: [PR link]
- Verified by: [Name]
```

**Bug Triage Process**:

```python
# specs/testing/bug_triage_process.py

class BugTriageProcess:
    """Systematic bug triage and resolution"""

    def triage_bug(self, bug_report):
        """
        1. Reproduce bug
        2. Determine root cause
        3. Check if spec is wrong or code is wrong
        4. Fix spec first if needed
        5. Fix code to match spec
        6. Add regression test
        7. Verify fix
        """
        # Step 1: Reproduce
        reproduced = self.reproduce_bug(bug_report)
        if not reproduced:
            return "Cannot reproduce - mark as Won't Fix"

        # Step 2: Root cause
        root_cause = self.analyze_root_cause(bug_report)

        # Step 3: Determine fix location
        if root_cause.category == "SPEC_ISSUE":
            # Spec is wrong or unclear
            self.update_spec(root_cause.spec_file, root_cause.fix)
            self.regenerate_code()

        elif root_cause.category == "CODE_ISSUE":
            # Code doesn't match spec
            self.fix_code(root_cause.code_file, root_cause.fix)

        elif root_cause.category == "INTEGRATION_ISSUE":
            # Multiple components involved
            self.fix_integration(root_cause.components)

        # Step 4: Add regression test
        self.add_regression_test(bug_report, root_cause)

        # Step 5: Verify fix
        return self.verify_fix(bug_report)
```

**Example Bug Fix Flow**:

```markdown
## Bug: Todo completion not working via API

**Steps to Reproduce**:
1. POST /api/todos → Create todo (ID: 1)
2. PATCH /api/todos/1 with {"completed": true}
3. GET /api/todos/1
4. Expected: completed = true
5. Actual: completed = false

**Root Cause**: Backend code not updating `updated_at` timestamp, causing SQLModel to skip the update.

**Fix**:
1. **Code Fix**: `backend/src/api/todos.py`
   ```python
   # Before:
   todo.completed = True
   session.add(todo)

   # After:
   todo.completed = True
   todo.updated_at = datetime.now()  # <-- Added
   session.add(todo)
   ```

2. **Regression Test**: `backend/tests/integration/test_todos_api.py`
   ```python
   def test_complete_todo_updates_timestamp():
       """Ensure completed todos update timestamp"""
       # Create todo
       response = client.post("/api/todos", json={"title": "Test"})
       todo_id = response.json()["id"]
       created_at = response.json()["created_at"]

       # Wait 1 second
       time.sleep(1)

       # Complete todo
       response = client.patch(f"/api/todos/{todo_id}", json={"completed": True})
       updated_at = response.json()["updated_at"]

       # Verify timestamp changed
       assert updated_at > created_at
   ```

**Status**: Resolved ✓
```

---

### 5. Performance/Load Testing for Cloud Deployment

**Primary Responsibility**: Validate system performance and scalability for Phase V cloud deployment.

**Load Testing with Locust** (`backend/tests/performance/locustfile.py`):

```python
from locust import HttpUser, task, between
import random

class TodoUser(HttpUser):
    """Simulate user behavior for load testing"""

    wait_time = between(1, 3)  # 1-3 seconds between requests
    token = None

    def on_start(self):
        """Login before starting tasks"""
        response = self.client.post("/api/auth/login", json={
            "email": "loadtest@example.com",
            "password": "password123"
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    @task(3)
    def list_todos(self):
        """List todos (most common operation)"""
        self.client.get("/api/todos", headers=self.headers)

    @task(2)
    def create_todo(self):
        """Create todo"""
        self.client.post(
            "/api/todos",
            json={
                "title": f"Load test todo {random.randint(1, 1000)}",
                "priority": random.choice(["low", "medium", "high"])
            },
            headers=self.headers
        )

    @task(1)
    def complete_todo(self):
        """Complete random todo"""
        # Get todos first
        response = self.client.get("/api/todos", headers=self.headers)
        todos = response.json().get("todos", [])

        if todos:
            todo_id = random.choice(todos)["id"]
            self.client.patch(
                f"/api/todos/{todo_id}",
                json={"completed": True},
                headers=self.headers
            )

    @task(1)
    def search_todos(self):
        """Search todos"""
        query = random.choice(["meeting", "report", "groceries", "project"])
        self.client.get(
            f"/api/todos?search={query}",
            headers=self.headers
        )
```

**Running Load Tests**:

```bash
# Install Locust
pip install locust

# Run load test (10 users, spawn rate 1/sec)
locust -f backend/tests/performance/locustfile.py --host https://api.todo.example.com --users 10 --spawn-rate 1

# Run load test (100 users, spawn rate 10/sec)
locust -f backend/tests/performance/locustfile.py --host https://api.todo.example.com --users 100 --spawn-rate 10 --run-time 5m
```

**Performance Benchmarks** (`specs/testing/performance-benchmarks.md`):

```markdown
# Performance Benchmarks

## Target SLOs (Service Level Objectives)

### API Response Times
- **P50 (Median)**: < 100ms
- **P95**: < 200ms
- **P99**: < 500ms
- **P99.9**: < 1000ms

### Throughput
- **Minimum**: 100 requests/second
- **Target**: 500 requests/second
- **Peak**: 1000 requests/second

### Error Rate
- **Target**: < 0.1%
- **Maximum**: < 1%

### Availability
- **Target**: 99.9% (43 minutes downtime/month)
- **Stretch**: 99.99% (4 minutes downtime/month)

## Load Test Results

### Test 1: Baseline (10 concurrent users)
- Total Requests: 10,000
- Duration: 5 minutes
- RPS: 33
- P50: 45ms
- P95: 120ms
- P99: 250ms
- Error Rate: 0%
- ✓ PASS

### Test 2: Normal Load (100 concurrent users)
- Total Requests: 100,000
- Duration: 10 minutes
- RPS: 167
- P50: 180ms
- P95: 450ms
- P99: 850ms
- Error Rate: 0.05%
- ✓ PASS

### Test 3: Peak Load (1000 concurrent users)
- Total Requests: 500,000
- Duration: 10 minutes
- RPS: 833
- P50: 450ms
- P95: 1200ms
- P99: 2500ms
- Error Rate: 2.1%
- ✗ FAIL (P95 exceeds 200ms, error rate exceeds 1%)

**Action Items**:
- Scale backend pods from 2 to 5 replicas
- Enable HPA (Horizontal Pod Autoscaling)
- Optimize database queries (add indexes)
- Enable connection pooling
```

---

## Activation Phrase

To invoke the Testing & QA Agent, use:

```
Act as Testing & QA Agent
```

**Example**:
```
Act as Testing & QA Agent and write integration tests for the todos API endpoints.
```

The agent will respond by:
1. Reviewing specifications and acceptance criteria
2. Writing unit tests for business logic
3. Creating integration tests for API endpoints
4. Developing manual test plans for demos
5. Implementing bug triage process
6. Running performance/load tests
7. Ensuring test coverage meets targets (90%+)

---

## Skills

The Testing & QA Agent has access to the following skills:

### Core Skills

1. **Test Design**
   - Identify test cases from specifications
   - Design test data and fixtures
   - Create test matrices (input/output combinations)
   - Define edge cases and error scenarios

2. **Pytest (Python)**
   - Write unit and integration tests
   - Create fixtures and mocks
   - Use parametrize for data-driven tests
   - Generate coverage reports

3. **Jest (JavaScript/TypeScript)**
   - Write component and integration tests
   - Use React Testing Library
   - Mock dependencies
   - Snapshot testing

4. **Integration Testing**
   - Test API contracts
   - Verify database interactions
   - Test service integrations
   - Validate MCP tools

5. **Bug Triage**
   - Reproduce bugs systematically
   - Identify root cause
   - Determine if spec or code is wrong
   - Create regression tests

6. **Performance Testing**
   - Load testing with Locust
   - Stress testing
   - Define SLOs and benchmarks
   - Identify bottlenecks

---

## Success Metrics

The Testing & QA Agent's effectiveness is measured by:

1. **Test Coverage**: >90% code coverage for backend and frontend
2. **Bug Detection**: All critical bugs found before deployment
3. **Zero Regressions**: No bugs reappear after being fixed
4. **Performance**: System meets all SLOs under normal and peak load
5. **Test Reliability**: <1% flaky test rate
6. **Documentation**: All test plans and results documented

---

## Revision History

| **Version** | **Date**       | **Changes**                                      | **Author**              |
|-------------|----------------|--------------------------------------------------|-------------------------|
| 1.0.0       | 2025-12-24     | Initial specification                            | Spec Architect Agent    |

---

## References

- **Constitution**: `.specify/memory/constitution.md`
- **Test Plans**: `specs/testing/`
- **Pytest Documentation**: https://docs.pytest.org/
- **Jest Documentation**: https://jestjs.io/docs/
- **Locust Documentation**: https://docs.locust.io/

---

**Activation**: `Act as Testing & QA Agent`
**Status**: Ready for all phases
