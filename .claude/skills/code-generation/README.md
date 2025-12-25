# Code Generation Skill

**Purpose**: Generate production-ready code files from specifications for Evolution of Todo hackathon phases I-V

**Owner**: All Implementation Agents (Backend, Frontend, Console, Chatbot, CloudOps)

**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

The **Code Generation Skill** enables automated generation of complete, production-ready code files from specifications:
- Parse architecture, API, database, and UI specs
- Generate phase-appropriate code with correct tech stack
- Follow monorepo structure with exact file paths
- Include type hints, error handling, logging, tests
- Maintain consistency with Constitution principles

This skill bridges the gap between **specification artifacts** and **runnable code** by automating the translation process while maintaining quality standards.

---

## Skill Components

### 1. Spec Parsing

Extract implementation details from specifications:
- **Architecture Specs**: Monorepo layout, directory structure, module organization
- **API Specs**: REST endpoints, request/response schemas, error codes
- **Database Specs**: SQLModel models, relationships, migrations
- **UI Specs**: Component hierarchy, props, styling, accessibility

### 2. Phase-Specific Code Generation

Generate code matching phase requirements:
- **Phase I**: Python CLI with argparse, in-memory storage, global state
- **Phase II**: Next.js pages + FastAPI routers + SQLModel models + Alembic migrations
- **Phase III**: ChatKit components + MCP tool servers + Claude Agents SDK
- **Phase IV**: Dockerfiles + Kubernetes manifests + Helm charts + observability
- **Phase V**: Cloud configurations + Kafka streams + Dapr components + GitHub Actions

### 3. File Structure Generation

Create files in correct monorepo locations:
```
evolution_of_todo/
├── packages/
│   ├── frontend/          # Next.js (Phase II+)
│   │   ├── src/app/       # App Router pages
│   │   └── components/    # Reusable components
│   ├── backend/           # FastAPI (Phase II+)
│   │   ├── app/
│   │   │   ├── api/       # REST routers
│   │   │   ├── models/    # SQLModel schemas
│   │   │   └── core/      # Config, auth, deps
│   │   └── tests/         # Pytest tests
│   ├── chatbot/           # AI Chatbot (Phase III)
│   │   ├── agent.py       # Claude Agents SDK
│   │   └── mcp_server.py  # MCP tool server
│   └── cli/               # Console app (Phase I)
│       └── todo.py        # Python CLI
├── infra/                 # Kubernetes (Phase IV+)
│   ├── k8s/               # Manifests
│   └── helm/              # Helm charts
└── .github/workflows/     # CI/CD (Phase V)
```

### 4. Code Quality Standards

Ensure generated code meets Constitution principles:
- **Type Hints**: Full typing for Python (mypy strict), TypeScript (strict mode)
- **Error Handling**: Try/catch blocks, HTTP status codes, user-friendly messages
- **Logging**: Structured logging (JSON format) with correlation IDs
- **Security**: Input validation, SQL injection prevention, XSS protection, JWT verification
- **Testing**: Unit tests with 80%+ coverage, integration tests for APIs
- **Documentation**: Docstrings, JSDoc comments, README files

---

## Skill Instructions

### Step 1: Parse Specifications

Extract all implementation details from specs.

**Template**:
```markdown
## Specification Analysis

**Feature**: [Feature name from spec.md]
**Phase**: [I, II, III, IV, or V]

### Architecture References
- Monorepo layout: [.claude/skills/architecture-specification/README.md]
- Directory: [packages/backend/, packages/frontend/, etc.]
- Module: [app/api/feature.py, src/app/feature/page.tsx, etc.]

### API Specifications (if applicable)
- Endpoints: [List from specs/api/rest-endpoints.md]
- Request schemas: [Pydantic models, Zod schemas]
- Response schemas: [Return types, status codes]
- Auth: [JWT middleware, session validation]

### Database Specifications (if applicable)
- Models: [SQLModel classes from specs/database/schema.md]
- Relationships: [Foreign keys, joins]
- Migrations: [Alembic scripts]

### UI Specifications (if applicable)
- Pages: [From specs/ui/pages.md]
- Components: [From specs/ui/components.md]
- Styling: [Tailwind classes]
- State: [Server/client components, hooks]

### Testing Requirements
- Unit tests: [What to test]
- Integration tests: [API endpoints, E2E flows]
- Coverage target: [80%+]
```

**Example**:
```markdown
## Specification Analysis

**Feature**: Task CRUD Operations
**Phase**: II (Web App with Backend)

### Architecture References
- Monorepo layout: .claude/skills/architecture-specification/README.md
- Directory: packages/backend/app/api/
- Module: packages/backend/app/api/tasks.py

### API Specifications
- Endpoints (from specs/api/rest-endpoints.md):
  - GET /api/{user_id}/tasks → List tasks
  - POST /api/{user_id}/tasks → Create task
  - PATCH /api/{user_id}/tasks/{task_id} → Update task
  - DELETE /api/{user_id}/tasks/{task_id} → Delete task
- Request schemas: TaskCreate(title, description?, priority?)
- Response schemas: TaskResponse(id, user_id, title, status, priority, created_at)
- Auth: JWT middleware with get_current_user dependency

### Database Specifications
- Models (from specs/database/schema.md):
  - Task(id, user_id, title, description, status, priority, created_at, updated_at)
  - Foreign key: user_id → users.id
- Relationships: ManyToOne (Task → User)
- Migrations: Alembic auto-generate from SQLModel

### Testing Requirements
- Unit tests: Task model validation, TaskCreate schema validation
- Integration tests: All 4 endpoints with test database
- Coverage target: 85%+
```

---

### Step 2: Generate File Structure

Create directory structure and placeholder files.

**Template**:
```bash
# Create directory structure
mkdir -p [directory paths]

# Create empty files
touch [file paths]
```

**Example (Phase II Backend)**:
```bash
# Create backend structure
mkdir -p packages/backend/app/api
mkdir -p packages/backend/app/models
mkdir -p packages/backend/app/schemas
mkdir -p packages/backend/app/core
mkdir -p packages/backend/tests/api

# Create files
touch packages/backend/app/api/__init__.py
touch packages/backend/app/api/tasks.py
touch packages/backend/app/models/__init__.py
touch packages/backend/app/models/task.py
touch packages/backend/app/schemas/__init__.py
touch packages/backend/app/schemas/task.py
touch packages/backend/app/core/deps.py
touch packages/backend/tests/api/test_tasks.py
```

---

### Step 3: Generate Code by Phase

Create phase-appropriate code files.

---

#### Phase I: Python CLI

**Template**:
```python
#!/usr/bin/env python3
"""
[Feature Name] - Phase I Console Application

Usage:
    python todo.py add "Task title" "Description"
    python todo.py list
    python todo.py complete <id>
    python todo.py delete <id>
"""

import argparse
from datetime import datetime
from typing import List, Dict, Optional

# Global in-memory storage
tasks: List[Dict] = []
next_id: int = 1

def add_task(title: str, description: str = "") -> None:
    """Add a new task to in-memory storage."""
    global next_id
    task = {
        "id": next_id,
        "title": title,
        "description": description,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
    }
    tasks.append(task)
    print(f"Task {next_id} created successfully")
    next_id += 1

def list_tasks() -> None:
    """Display all tasks in table format."""
    if not tasks:
        print("No tasks found. Use 'add' to create one.")
        return

    print(f"{'ID':<5} {'Title':<30} {'Status':<10} {'Created':<20}")
    print("-" * 65)
    for task in tasks:
        created = task['created_at'][:16].replace('T', ' ')
        print(f"{task['id']:<5} {task['title']:<30} {task['status']:<10} {created:<20}")

def complete_task(task_id: int) -> None:
    """Mark task as completed."""
    for task in tasks:
        if task["id"] == task_id:
            if task["status"] == "completed":
                print(f"Task {task_id} is already complete")
            else:
                task["status"] = "completed"
                print(f"Task {task_id} marked complete ✓")
            return
    print(f"Task not found - ID must exist")

def delete_task(task_id: int) -> None:
    """Delete task by ID."""
    global tasks
    for i, task in enumerate(tasks):
        if task["id"] == task_id:
            tasks.pop(i)
            print(f"Task {task_id} deleted successfully")
            return
    print(f"Task not found - ID must exist")

def main() -> None:
    parser = argparse.ArgumentParser(description="Evolution of Todo - Phase I CLI")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Add command
    add_parser = subparsers.add_parser("add", help="Add a new task")
    add_parser.add_argument("title", help="Task title")
    add_parser.add_argument("description", nargs="?", default="", help="Task description")

    # List command
    subparsers.add_parser("list", help="List all tasks")

    # Complete command
    complete_parser = subparsers.add_parser("complete", help="Mark task as completed")
    complete_parser.add_argument("id", type=int, help="Task ID")

    # Delete command
    delete_parser = subparsers.add_parser("delete", help="Delete a task")
    delete_parser.add_argument("id", type=int, help="Task ID")

    args = parser.parse_args()

    if args.command == "add":
        add_task(args.title, args.description)
    elif args.command == "list":
        list_tasks()
    elif args.command == "complete":
        complete_task(args.id)
    elif args.command == "delete":
        delete_task(args.id)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
```

---

#### Phase II: FastAPI Backend

**File**: `packages/backend/app/api/tasks.py`

```python
"""
Task Management REST API - Phase II

Endpoints:
    GET    /api/{user_id}/tasks        - List tasks
    POST   /api/{user_id}/tasks        - Create task
    GET    /api/{user_id}/tasks/{id}   - Get task details
    PATCH  /api/{user_id}/tasks/{id}   - Update task
    DELETE /api/{user_id}/tasks/{id}   - Delete task
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.core.deps import get_session, get_current_user
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/{user_id}/tasks", tags=["tasks"])


@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    user_id: int,
    status: Optional[str] = Query(None, regex="^(pending|completed)$"),
    priority: Optional[str] = Query(None, regex="^(high|medium|low)$"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> List[Task]:
    """
    List all tasks for the authenticated user.

    Multi-tenant security: Only returns tasks belonging to current_user.

    Args:
        user_id: User ID from path (must match current_user.id)
        status: Optional filter by status (pending, completed)
        priority: Optional filter by priority (high, medium, low)
        current_user: Authenticated user from JWT
        session: Database session

    Returns:
        List of Task objects matching filters

    Raises:
        HTTPException 403: If user_id doesn't match current_user.id
    """
    # CRITICAL: Multi-tenant security check
    if user_id != current_user.id:
        logger.warning(f"User {current_user.id} attempted to access tasks for user {user_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access tasks for other users"
        )

    # Build query with filters
    query = select(Task).where(Task.user_id == current_user.id)

    if status:
        query = query.where(Task.status == status)
    if priority:
        query = query.where(Task.priority == priority)

    query = query.order_by(Task.created_at.desc())

    tasks = session.exec(query).all()
    logger.info(f"User {current_user.id} listed {len(tasks)} tasks")

    return tasks


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: int,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """
    Create a new task for the authenticated user.

    Args:
        user_id: User ID from path (must match current_user.id)
        task_data: Task creation data (title, description, priority)
        current_user: Authenticated user from JWT
        session: Database session

    Returns:
        Created Task object with generated ID

    Raises:
        HTTPException 403: If user_id doesn't match current_user.id
        HTTPException 422: If validation fails
    """
    # CRITICAL: Multi-tenant security check
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create tasks for other users"
        )

    # Create task with user_id from current_user (not from path)
    task = Task(
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority or "medium",
        status="pending",
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    logger.info(f"User {current_user.id} created task {task.id}: {task.title}")

    return task


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: int,
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Get single task details with multi-tenant security."""
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    task = session.get(Task, task_id)

    if not task or task.user_id != current_user.id:
        logger.warning(f"User {current_user.id} attempted to access task {task_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: int,
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Update task with multi-tenant security."""
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    task = session.get(Task, task_id)

    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    # Update only provided fields
    update_data = task_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    session.add(task)
    session.commit()
    session.refresh(task)

    logger.info(f"User {current_user.id} updated task {task.id}")

    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: int,
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> None:
    """Delete task with multi-tenant security."""
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    task = session.get(Task, task_id)

    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    session.delete(task)
    session.commit()

    logger.info(f"User {current_user.id} deleted task {task_id}")
```

**File**: `packages/backend/app/models/task.py`

```python
"""SQLModel Task model - Phase II Database Schema"""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship


class Task(SQLModel, table=True):
    """
    Task model with multi-tenant isolation.

    Table: tasks
    Indexes: user_id (for multi-tenant queries)
    """
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: str = Field(default="pending", regex="^(pending|completed)$")
    priority: str = Field(default="medium", regex="^(high|medium|low)$")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to User
    user: "User" = Relationship(back_populates="tasks")

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 42,
                "title": "Buy milk",
                "description": "2 liters low fat",
                "status": "pending",
                "priority": "high",
                "created_at": "2025-12-24T10:30:00Z",
                "updated_at": "2025-12-24T10:30:00Z",
            }
        }
```

---

#### Phase II: Next.js Frontend

**File**: `packages/frontend/src/app/tasks/page.tsx`

```tsx
/**
 * TaskListPage - Phase II Web App
 *
 * Server Component that fetches tasks from FastAPI backend.
 * Displays tasks in responsive grid layout with filters.
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { FilterBar } from '@/components/FilterBar';
import { TaskGrid } from '@/components/TaskGrid';
import { EmptyState } from '@/components/EmptyState';

interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  priority: 'high' | 'medium' | 'low';
  created_at: string;
}

async function getTasks(userId: number, accessToken: string): Promise<Task[]> {
  const res = await fetch(
    `${process.env.API_URL}/api/${userId}/tasks`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store', // Always fetch fresh data
    }
  );

  if (res.status === 401) {
    redirect('/login');
  }

  if (!res.ok) {
    throw new Error('Failed to fetch tasks');
  }

  return res.json();
}

export default async function TaskListPage() {
  // Get session from Better Auth (Server Component)
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Fetch tasks server-side
  const tasks = await getTasks(session.user.id, session.accessToken);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          My Tasks
        </h1>
        <a
          href="/tasks/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Task
        </a>
      </div>

      {/* Filter Bar (Client Component) */}
      <FilterBar />

      {/* Task Grid or Empty State */}
      {tasks.length === 0 ? (
        <EmptyState message="No tasks found. Create your first task to get started!" />
      ) : (
        <TaskGrid tasks={tasks} />
      )}
    </div>
  );
}
```

**File**: `packages/frontend/components/TaskCard.tsx`

```tsx
'use client';

/**
 * TaskCard Component - Phase II
 *
 * Displays individual task with priority badge, status chip, and actions.
 * Client Component for interactivity (delete, complete).
 */

import { useState } from 'react';
import { PriorityBadge } from './PriorityBadge';
import { StatusChip } from './StatusChip';

interface TaskCardProps {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

export function TaskCard({
  id,
  title,
  description,
  status,
  priority,
  createdAt,
}: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Refresh page to show updated list
        window.location.reload();
      } else {
        alert('Failed to delete task');
      }
    } catch (error) {
      alert('Network error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article
      role="article"
      aria-labelledby={`task-title-${id}`}
      className="
        bg-white dark:bg-gray-800
        shadow-md hover:shadow-lg
        rounded-lg
        p-4
        border border-gray-200 dark:border-gray-700
        transition-shadow duration-200
      "
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h3
          id={`task-title-${id}`}
          className="text-lg font-semibold text-gray-900 dark:text-gray-100"
        >
          {title}
        </h3>
        <PriorityBadge priority={priority} />
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {description}
        </p>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-4">
        <StatusChip status={status} />

        <div className="flex gap-2">
          <a
            href={`/tasks/${id}`}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            aria-label={`View task: ${title}`}
          >
            View
          </a>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-600 text-sm font-medium disabled:opacity-50"
            aria-label={`Delete task: ${title}`}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Created date */}
      <p className="text-xs text-gray-500 mt-2">
        Created {new Date(createdAt).toLocaleDateString()}
      </p>
    </article>
  );
}
```

---

#### Phase III: ChatKit AI Chatbot

**File**: `packages/chatbot/mcp_server.py`

```python
"""
MCP Tool Server - Phase III AI Chatbot

Provides task management tools for Claude via Model Context Protocol.
"""

import os
import httpx
from typing import Dict, Any, List
from anthropic import Anthropic, Tool

# MCP Tool Definitions
TOOLS: List[Tool] = [
    Tool(
        name="add_task",
        description="Add a new task to the user's todo list",
        input_schema={
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "Task title (1-500 characters, required)",
                },
                "description": {
                    "type": "string",
                    "description": "Optional task description (max 2000 characters)",
                },
                "priority": {
                    "type": "string",
                    "enum": ["high", "medium", "low"],
                    "description": "Task priority level (default: medium)",
                },
            },
            "required": ["title"],
        },
    ),
    Tool(
        name="list_tasks",
        description="List all tasks for the user, optionally filtered by status or priority",
        input_schema={
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "enum": ["pending", "completed"],
                    "description": "Filter by task status",
                },
                "priority": {
                    "type": "string",
                    "enum": ["high", "medium", "low"],
                    "description": "Filter by task priority",
                },
            },
        },
    ),
    Tool(
        name="update_task",
        description="Update an existing task's status or priority",
        input_schema={
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": "ID of the task to update",
                },
                "status": {
                    "type": "string",
                    "enum": ["pending", "completed"],
                    "description": "New task status",
                },
                "priority": {
                    "type": "string",
                    "enum": ["high", "medium", "low"],
                    "description": "New task priority",
                },
            },
            "required": ["task_id"],
        },
    ),
    Tool(
        name="delete_task",
        description="Delete a task by its ID",
        input_schema={
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": "ID of the task to delete",
                },
            },
            "required": ["task_id"],
        },
    ),
]


async def execute_tool(
    tool_name: str,
    tool_input: Dict[str, Any],
    user_id: int,
    access_token: str,
) -> Dict[str, Any]:
    """
    Execute MCP tool by calling FastAPI backend.

    Args:
        tool_name: Name of the tool (add_task, list_tasks, etc.)
        tool_input: Tool parameters from Claude
        user_id: Authenticated user ID
        access_token: JWT access token

    Returns:
        Tool execution result (task data or error)
    """
    api_url = os.environ.get("API_URL", "http://localhost:8000")
    headers = {"Authorization": f"Bearer {access_token}"}

    async with httpx.AsyncClient() as client:
        if tool_name == "add_task":
            response = await client.post(
                f"{api_url}/api/{user_id}/tasks",
                json=tool_input,
                headers=headers,
            )
            response.raise_for_status()
            return response.json()

        elif tool_name == "list_tasks":
            params = {k: v for k, v in tool_input.items() if v is not None}
            response = await client.get(
                f"{api_url}/api/{user_id}/tasks",
                params=params,
                headers=headers,
            )
            response.raise_for_status()
            return response.json()

        elif tool_name == "update_task":
            task_id = tool_input.pop("task_id")
            response = await client.patch(
                f"{api_url}/api/{user_id}/tasks/{task_id}",
                json=tool_input,
                headers=headers,
            )
            response.raise_for_status()
            return response.json()

        elif tool_name == "delete_task":
            task_id = tool_input["task_id"]
            response = await client.delete(
                f"{api_url}/api/{user_id}/tasks/{task_id}",
                headers=headers,
            )
            response.raise_for_status()
            return {"success": True, "message": f"Task {task_id} deleted"}

        else:
            raise ValueError(f"Unknown tool: {tool_name}")


# Claude client initialization
client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
```

---

### Step 4: Generate Tests

Create test files with comprehensive coverage.

**Example: FastAPI Integration Tests**

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
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    def get_current_user_override():
        return User(id=1, email="test@example.com", full_name="Test User")

    app.dependency_overrides[get_session] = get_session_override
    app.dependency_overrides[get_current_user] = get_current_user_override

    client = TestClient(app)
    yield client

    app.dependency_overrides.clear()


def test_create_task(client: TestClient):
    """Test POST /api/{user_id}/tasks creates task."""
    response = client.post(
        "/api/1/tasks",
        json={"title": "Buy milk", "description": "2 liters", "priority": "high"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Buy milk"
    assert data["priority"] == "high"
    assert data["status"] == "pending"
    assert "id" in data


def test_list_tasks(client: TestClient, session: Session):
    """Test GET /api/{user_id}/tasks lists tasks."""
    # Create test tasks
    task1 = Task(user_id=1, title="Task 1", priority="high", status="pending")
    task2 = Task(user_id=1, title="Task 2", priority="low", status="completed")
    session.add(task1)
    session.add(task2)
    session.commit()

    response = client.get("/api/1/tasks")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["title"] in ["Task 1", "Task 2"]


def test_list_tasks_filtered_by_status(client: TestClient, session: Session):
    """Test GET /api/{user_id}/tasks?status=completed filters."""
    task1 = Task(user_id=1, title="Task 1", status="pending")
    task2 = Task(user_id=1, title="Task 2", status="completed")
    session.add_all([task1, task2])
    session.commit()

    response = client.get("/api/1/tasks?status=completed")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["status"] == "completed"


def test_update_task(client: TestClient, session: Session):
    """Test PATCH /api/{user_id}/tasks/{id} updates task."""
    task = Task(user_id=1, title="Task 1", status="pending")
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.patch(
        f"/api/1/tasks/{task.id}",
        json={"status": "completed"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"


def test_delete_task(client: TestClient, session: Session):
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


def test_multi_tenant_security(client: TestClient, session: Session):
    """Test that users can only access their own tasks."""
    # Task belongs to user_id=2, but current_user is user_id=1
    task = Task(user_id=2, title="Other user's task")
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.get(f"/api/1/tasks/{task.id}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


def test_create_task_for_other_user_forbidden(client: TestClient):
    """Test that users cannot create tasks for other users."""
    response = client.post(
        "/api/999/tasks",  # Different user_id
        json={"title": "Malicious task"},
    )

    assert response.status_code == 403
    assert "Cannot create tasks for other users" in response.json()["detail"]
```

---

### Step 5: Generate Documentation

Create README files for each package.

**Example**: `packages/backend/README.md`

```markdown
# Evolution of Todo - Backend API (Phase II)

FastAPI REST API with PostgreSQL database and JWT authentication.

## Setup

\`\`\`bash
# Install dependencies
cd packages/backend
poetry install

# Set environment variables
cp .env.example .env
# Edit .env with your database URL and JWT secret

# Run database migrations
alembic upgrade head

# Start development server
poetry run uvicorn app.main:app --reload
\`\`\`

## API Endpoints

### Tasks

- **GET** `/api/{user_id}/tasks` - List tasks (with filters)
- **POST** `/api/{user_id}/tasks` - Create task
- **GET** `/api/{user_id}/tasks/{id}` - Get task details
- **PATCH** `/api/{user_id}/tasks/{id}` - Update task
- **DELETE** `/api/{user_id}/tasks/{id}` - Delete task

### Authentication

- **POST** `/api/auth/login` - Login with email/password
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/refresh` - Refresh access token

## Testing

\`\`\`bash
# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=app --cov-report=html

# Open coverage report
open htmlcov/index.html
\`\`\`

## Multi-Tenant Security

All task endpoints enforce multi-tenant isolation:
- User ID from JWT must match user_id in path
- All database queries filtered by user_id
- 403 Forbidden if user attempts to access other users' data
- 404 Not Found (not 403) if task doesn't exist or belongs to different user

## Database Migrations

\`\`\`bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
\`\`\`
```

---

## Related Agents

All implementation agents use this skill:

- **Backend / FastAPI Pro Agent**: Generates API routers, SQLModel models, Alembic migrations
- **Frontend UI/UX Agent**: Generates Next.js pages, React components, Tailwind styles
- **Console App Agent**: Generates Python CLI scripts with argparse
- **AI Chatbot Agent**: Generates MCP tool servers, Claude Agents SDK integration
- **CloudOps & Kubernetes Agent**: Generates Dockerfiles, Kubernetes manifests, Helm charts
- **CI/CD Agent**: Generates GitHub Actions workflows, deployment scripts
- **Testing & QA Agent**: Generates pytest and Jest test files

---

## Success Metrics

The Code Generation Skill is successful when:

✅ **Spec Compliance**: Generated code matches specifications exactly
✅ **Type Safety**: Full type hints (Python mypy strict, TypeScript strict mode)
✅ **Error Handling**: All edge cases handled per spec
✅ **Security**: Multi-tenant isolation, input validation, SQL injection prevention
✅ **Testing**: Unit and integration tests with 80%+ coverage
✅ **Documentation**: Docstrings, comments, README files included
✅ **Runnable**: Code executes without errors on first attempt
✅ **Phase Alignment**: Correct tech stack for phase (I: CLI, II: FastAPI+Next.js, III: ChatKit+MCP)

---

## Best Practices

### Do's ✅
- Parse all specs before generating code (architecture, API, database, UI)
- Follow monorepo structure exactly (packages/backend/, packages/frontend/)
- Include type hints for all functions and variables
- Add comprehensive error handling with user-friendly messages
- Implement multi-tenant security for all backend endpoints
- Generate tests alongside implementation code
- Add structured logging with correlation IDs
- Include docstrings and comments for complex logic
- Follow Constitution principles (security, testability, observability)

### Don'ts ❌
- Don't generate code without parsing specs first
- Don't skip type hints or error handling
- Don't forget multi-tenant security checks (critical for hackathon)
- Don't hardcode secrets or configuration
- Don't skip tests (80%+ coverage required)
- Don't use deprecated or insecure patterns
- Don't ignore accessibility for frontend code
- Don't create files in wrong directories

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
UI Design (UI Specification)
  ↓
Refined Prompt (Prompt Refinement)
  ↓
CODE GENERATION (this skill) ← YOU ARE HERE
  ↓
Testing (Testing & QA Agent)
  ↓
Deployment (CloudOps Agent)
```

### Skill Combinations

**Prompt Refinement + Code Generation**:
```
1. User: "Build task API"
2. Prompt Refinement: Add specs, phase context, tech stack
3. Code Generation: Parse refined prompt → Generate FastAPI routers, SQLModel models, tests
```

**UI Specification + Code Generation**:
```
1. UI Specification creates TaskListPage wireframe
2. Code Generation parses wireframe → Generates Next.js page.tsx with exact layout
```

---

## Output Format

When using this skill, generate:

**1. File Structure** (directories and file paths)
**2. Implementation Files** (source code with types, error handling, logging)
**3. Test Files** (unit and integration tests with 80%+ coverage)
**4. Documentation** (README files, docstrings, comments)
**5. Configuration** (environment variables, dependencies)

Save generated code to monorepo:
- `packages/backend/` - FastAPI backend (Phase II+)
- `packages/frontend/` - Next.js frontend (Phase II+)
- `packages/cli/` - Python CLI (Phase I)
- `packages/chatbot/` - AI chatbot (Phase III)
- `infra/` - Kubernetes configs (Phase IV+)

---

## References

- **Architecture Spec**: `.claude/skills/architecture-specification/README.md` (Monorepo layout)
- **API Spec**: `.claude/skills/api-database-specification/README.md` (REST endpoints, MCP tools, SQLModel)
- **UI Spec**: `.claude/skills/ui-specification/README.md` (Next.js pages, components)
- **Constitution**: `.specify/memory/constitution.md` (8 principles, 5 phases)
- **Prompt Refinement**: `.claude/skills/prompt-refinement/README.md` (Context for code generation)

---

**Document Version**: 1.0.0
**Created**: 2025-12-24
**Total Examples**: 6 (CLI, FastAPI router, SQLModel, Next.js page, React component, MCP server)
**Coverage**: All 5 Hackathon II Phases

---

*This code generation skill is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*
