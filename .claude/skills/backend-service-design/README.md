# Backend Service Design Skill

**Purpose**: Design FastAPI services, MCP servers, and backend architecture patterns following api-database-specification for Evolution of Todo hackathon phases II-V

**Owner**: Backend Pro Agent + AI Chatbot Agent

**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

The **Backend Service Design Skill** enables systematic design of backend services:
- Design FastAPI monolith architecture with routers and dependency injection
- Create MCP (Model Context Protocol) servers for AI chatbot integration
- Implement service patterns (repository, dependency injection, middleware)
- Configure background tasks with Celery + Redis
- Define API contracts and error handling strategies
- Generate service specifications for implementation

This skill bridges API specifications and implementation by designing the service layer architecture.

---

## Skill Components

### 1. Service Architecture per Phase

**Phase II (Web App - FastAPI Monolith)**:
- REST API with routers (`/api/{user_id}/tasks`, `/api/auth`)
- SQLModel for ORM and validation
- Better Auth for JWT authentication
- Dependency injection for database sessions and auth
- Middleware (CORS, logging, error handling)
- Background tasks (optional: email notifications)

**Phase III (AI Chatbot - MCP Server)**:
- Stateless FastAPI MCP server
- Tool endpoints (`add_task`, `list_tasks`, `update_task`, `delete_task`)
- Tool execution handlers
- Error handling for tool failures
- Integration with Phase II backend via HTTP

**Phase IV (Kubernetes)**:
- Health check endpoints (`/health`, `/ready`)
- Metrics endpoints for Prometheus
- Service mesh ready (Dapr sidecars)
- Horizontal scaling considerations

**Phase V (Cloud Production)**:
- Background jobs with Celery + Redis
- Event-driven architecture (Kafka producers)
- Distributed tracing (OpenTelemetry)
- Rate limiting and throttling

### 2. Service Patterns

**Dependency Injection**:
- Database session management
- Current user authentication
- Configuration injection
- Service dependencies

**Repository Pattern**:
- Separate data access from business logic
- Reusable database queries
- Testable with mocks

**Middleware**:
- CORS configuration
- Request logging with correlation IDs
- Error handling (global exception handler)
- JWT validation
- Rate limiting

**Background Tasks**:
- Celery for asynchronous jobs
- Redis as message broker
- Task retry logic
- Scheduled tasks (cron)

### 3. API Router Organization

**Modular Router Structure**:
```
app/
├── api/
│   ├── __init__.py
│   ├── tasks.py        # Task CRUD endpoints
│   ├── auth.py         # Authentication endpoints
│   └── users.py        # User management endpoints
├── core/
│   ├── config.py       # Settings (Pydantic BaseSettings)
│   ├── deps.py         # Dependency injection
│   └── security.py     # JWT utilities
├── models/
│   ├── __init__.py
│   ├── task.py         # SQLModel Task
│   └── user.py         # SQLModel User
├── schemas/
│   ├── __init__.py
│   ├── task.py         # Pydantic request/response schemas
│   └── user.py
└── main.py             # FastAPI app entry point
```

### 4. MCP Server Architecture

**Tool-Based Design**:
- Each MCP tool maps to a backend operation
- Stateless request/response pattern
- Tool execution with error handling
- Tool result formatting

**MCP Tools for Task Management**:
- `add_task` - Create new task
- `list_tasks` - Query tasks with filters
- `get_task` - Retrieve single task
- `update_task` - Modify task properties
- `delete_task` - Remove task
- `complete_task` - Mark task as completed

---

## Skill Instructions

### Step 1: Design Service Architecture

Define the overall service structure.

**Template**:
```markdown
## Service Architecture: [Service Name]

**Phase**: [II, III, IV, or V]
**Type**: [Monolith | MCP Server | Microservice]

### Components
- [Component 1]: Description
- [Component 2]: Description

### Dependencies
- [Dependency 1]: Version
- [Dependency 2]: Version

### Configuration
- [Config item 1]: Value/source
- [Config item 2]: Value/source

### Endpoints
- [HTTP Method] [Path]: Description

### Data Flow
[ASCII diagram showing request flow]
```

---

#### Example: Phase II FastAPI Monolith

```markdown
## Service Architecture: FastAPI Backend (Phase II)

**Phase**: II (Web App)
**Type**: Monolith with modular routers

### Components
- **API Routers**: Modular route handlers (tasks, auth, users)
- **Database Layer**: SQLModel with PostgreSQL
- **Authentication**: Better Auth with JWT
- **Middleware**: CORS, logging, error handling
- **Dependency Injection**: Database sessions, current user

### Dependencies
- FastAPI 0.109+
- SQLModel 0.0.14+
- Better Auth 0.4+
- Uvicorn 0.27+ (ASGI server)
- PostgreSQL 16+ (via psycopg2)
- Alembic 1.13+ (migrations)

### Configuration
- `DATABASE_URL`: From environment variable
- `JWT_SECRET`: From environment variable
- `CORS_ORIGINS`: ["http://localhost:3000"]
- `LOG_LEVEL`: "INFO"

### Endpoints
- **GET** `/api/{user_id}/tasks` - List tasks (filtered)
- **POST** `/api/{user_id}/tasks` - Create task
- **GET** `/api/{user_id}/tasks/{task_id}` - Get task
- **PATCH** `/api/{user_id}/tasks/{task_id}` - Update task
- **DELETE** `/api/{user_id}/tasks/{task_id}` - Delete task
- **POST** `/api/auth/login` - User login (JWT)
- **POST** `/api/auth/register` - User registration
- **GET** `/health` - Health check
- **GET** `/ready` - Readiness probe

### Data Flow
\`\`\`
Client Request
  ↓
Middleware (CORS, Logging)
  ↓
JWT Validation (if protected route)
  ↓
Router Handler (tasks.py)
  ↓
Dependency Injection (get_session, get_current_user)
  ↓
Business Logic
  ↓
SQLModel Query (with user_id filter)
  ↓
Database (PostgreSQL)
  ↓
Response (JSON)
\`\`\`
```

---

### Step 2: Design API Routers

Create modular router specifications.

**Router Template**:
```python
"""
[Router Name] - [Description]

Endpoints:
- [Method] [Path]: [Description]
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from typing import List, Optional

from app.core.deps import get_session, get_current_user
from app.models.[model] import [Model]
from app.schemas.[schema] import [Schema]

import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/{user_id}/[resource]", tags=["[resource]"])


@router.get("", response_model=List[[ResponseSchema]])
async def list_[resource](
    user_id: int,
    # Query parameters
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> List[[Model]]:
    """List all [resource] for authenticated user."""
    # Implementation
    pass
```

---

#### Example: Tasks Router (Phase II)

```python
"""
Task Management API Router - Phase II

Endpoints:
- GET    /api/{user_id}/tasks        - List tasks
- POST   /api/{user_id}/tasks        - Create task
- GET    /api/{user_id}/tasks/{id}   - Get task
- PATCH  /api/{user_id}/tasks/{id}   - Update task
- DELETE /api/{user_id}/tasks/{id}   - Delete task
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from typing import List, Optional

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
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> List[Task]:
    """
    List all tasks for the authenticated user.

    Multi-tenant security: Returns only tasks belonging to current_user.

    Query Parameters:
    - status: Filter by task status (pending, completed)
    - priority: Filter by priority (high, medium, low)
    - limit: Maximum number of tasks to return (1-1000)
    - offset: Number of tasks to skip (pagination)

    Returns:
        List of Task objects matching filters
    """
    # CRITICAL: Multi-tenant security check
    if user_id != current_user.id:
        logger.warning(
            f"User {current_user.id} attempted to access tasks for user {user_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access tasks for other users",
        )

    # Build query with filters
    query = select(Task).where(Task.user_id == current_user.id)

    if status:
        query = query.where(Task.status == status)
    if priority:
        query = query.where(Task.priority == priority)

    # Apply pagination
    query = query.offset(offset).limit(limit)
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

    Request Body:
    - title: Task title (1-500 characters, required)
    - description: Task description (optional, max 2000 chars)
    - priority: Task priority (high, medium, low, default: medium)
    - due_date: Task due date (ISO 8601, optional)

    Returns:
        Created Task object with generated ID
    """
    # CRITICAL: Multi-tenant security check
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create tasks for other users",
        )

    # Create task with user_id from current_user (not from path)
    task = Task(
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority or "medium",
        due_date=task_data.due_date,
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
    """
    Get single task details.

    Path Parameters:
    - task_id: Task ID to retrieve

    Returns:
        Task object with all details
    """
    # Multi-tenant security
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    task = session.get(Task, task_id)

    # Return 404 if task not found or belongs to different user
    if not task or task.user_id != current_user.id:
        logger.warning(f"User {current_user.id} attempted to access task {task_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
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
    """
    Update task properties.

    Path Parameters:
    - task_id: Task ID to update

    Request Body (all optional):
    - title: New task title
    - description: New description
    - status: New status (pending, completed)
    - priority: New priority (high, medium, low)
    - due_date: New due date

    Returns:
        Updated Task object
    """
    # Multi-tenant security
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    task = session.get(Task, task_id)

    if not task or task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Update only provided fields (partial update)
    update_data = task_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    # Update updated_at timestamp
    from datetime import datetime
    task.updated_at = datetime.utcnow()

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
    """
    Delete task.

    Path Parameters:
    - task_id: Task ID to delete

    Returns:
        204 No Content on success
    """
    # Multi-tenant security
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    task = session.get(Task, task_id)

    if not task or task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    session.delete(task)
    session.commit()

    logger.info(f"User {current_user.id} deleted task {task_id}")
```

---

### Step 3: Design Dependency Injection

Create reusable dependencies for database sessions and authentication.

**app/core/deps.py**:
```python
"""
Dependency Injection - Reusable FastAPI dependencies

Used in route handlers via Depends()
"""

from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, create_engine
from jose import JWTError, jwt

from app.core.config import settings
from app.models.user import User

import logging

logger = logging.getLogger(__name__)

# Database engine (singleton)
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)

# HTTP Bearer token scheme
security = HTTPBearer()


def get_session() -> Generator[Session, None, None]:
    """
    Database session dependency.

    Yields:
        SQLModel Session for database operations

    Usage:
        @router.get("/tasks")
        async def list_tasks(session: Session = Depends(get_session)):
            tasks = session.exec(select(Task)).all()
    """
    with Session(engine) as session:
        yield session


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session),
) -> User:
    """
    Get current authenticated user from JWT token.

    Args:
        credentials: HTTP Bearer token from Authorization header
        session: Database session

    Returns:
        User object for authenticated user

    Raises:
        HTTPException 401: If token is invalid or user not found

    Usage:
        @router.get("/tasks")
        async def list_tasks(current_user: User = Depends(get_current_user)):
            print(f"User {current_user.id} is accessing tasks")
    """
    token = credentials.credentials

    # Decode JWT token
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=["HS256"],
        )
        user_id: int = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )

    except JWTError as e:
        logger.warning(f"JWT decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    # Fetch user from database
    user = session.get(User, user_id)

    if user is None:
        logger.warning(f"User {user_id} not found in database")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get current active user (not disabled).

    Args:
        current_user: User from get_current_user dependency

    Returns:
        User object if active

    Raises:
        HTTPException 403: If user account is disabled

    Usage:
        @router.delete("/tasks/{id}")
        async def delete_task(user: User = Depends(get_current_active_user)):
            # Only active users can delete
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )

    return current_user
```

---

### Step 4: Design MCP Server (Phase III)

Create MCP tool server for AI chatbot integration.

**packages/chatbot/mcp_server.py**:
```python
"""
MCP Tool Server - Phase III AI Chatbot

Provides task management tools for Claude via Model Context Protocol.

Tools:
- add_task: Create new task
- list_tasks: Query tasks with filters
- get_task: Retrieve single task
- update_task: Modify task properties
- delete_task: Remove task
- complete_task: Mark task as completed
"""

import os
import httpx
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI MCP server
app = FastAPI(title="Evolution of Todo - MCP Server")

# Backend API URL
API_URL = os.getenv("API_URL", "http://localhost:8000")


# Tool Schemas
class AddTaskInput(BaseModel):
    title: str = Field(..., min_length=1, max_length=500, description="Task title")
    description: Optional[str] = Field(None, max_length=2000, description="Task description")
    priority: Optional[str] = Field("medium", regex="^(high|medium|low)$", description="Task priority")
    due_date: Optional[str] = Field(None, description="Due date (ISO 8601)")


class ListTasksInput(BaseModel):
    status: Optional[str] = Field(None, regex="^(pending|completed)$", description="Filter by status")
    priority: Optional[str] = Field(None, regex="^(high|medium|low)$", description="Filter by priority")
    limit: int = Field(100, ge=1, le=1000, description="Maximum tasks to return")


class UpdateTaskInput(BaseModel):
    task_id: int = Field(..., description="Task ID to update")
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[str] = Field(None, regex="^(pending|completed)$")
    priority: Optional[str] = Field(None, regex="^(high|medium|low)$")


class DeleteTaskInput(BaseModel):
    task_id: int = Field(..., description="Task ID to delete")


# MCP Tool Handlers
@app.post("/tools/add_task")
async def add_task_tool(
    input: AddTaskInput,
    user_id: int,
    access_token: str,
) -> Dict[str, Any]:
    """
    MCP Tool: add_task

    Create a new task for the user.

    Args:
        input: Task creation parameters
        user_id: User ID from chatbot session
        access_token: JWT access token for authentication

    Returns:
        Created task object

    Raises:
        HTTPException: If backend API call fails
    """
    headers = {"Authorization": f"Bearer {access_token}"}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{API_URL}/api/{user_id}/tasks",
                json=input.model_dump(exclude_none=True),
                headers=headers,
                timeout=10.0,
            )
            response.raise_for_status()

            task = response.json()
            logger.info(f"Tool add_task: Created task {task['id']} for user {user_id}")

            return {
                "success": True,
                "task": task,
                "message": f"✓ Task '{task['title']}' created successfully",
            }

        except httpx.HTTPStatusError as e:
            logger.error(f"Tool add_task failed: {e}")
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Failed to create task: {e.response.text}",
            )


@app.post("/tools/list_tasks")
async def list_tasks_tool(
    input: ListTasksInput,
    user_id: int,
    access_token: str,
) -> Dict[str, Any]:
    """
    MCP Tool: list_tasks

    List tasks for the user with optional filters.

    Args:
        input: Filter parameters (status, priority, limit)
        user_id: User ID from chatbot session
        access_token: JWT access token for authentication

    Returns:
        List of task objects
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    params = input.model_dump(exclude_none=True)

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{API_URL}/api/{user_id}/tasks",
                params=params,
                headers=headers,
                timeout=10.0,
            )
            response.raise_for_status()

            tasks = response.json()
            logger.info(f"Tool list_tasks: Retrieved {len(tasks)} tasks for user {user_id}")

            # Format response for chatbot
            if not tasks:
                return {
                    "success": True,
                    "tasks": [],
                    "message": "No tasks found.",
                }

            return {
                "success": True,
                "tasks": tasks,
                "message": f"Found {len(tasks)} tasks.",
            }

        except httpx.HTTPStatusError as e:
            logger.error(f"Tool list_tasks failed: {e}")
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Failed to list tasks: {e.response.text}",
            )


@app.post("/tools/update_task")
async def update_task_tool(
    input: UpdateTaskInput,
    user_id: int,
    access_token: str,
) -> Dict[str, Any]:
    """
    MCP Tool: update_task

    Update task properties.

    Args:
        input: Task update parameters (task_id + fields to update)
        user_id: User ID from chatbot session
        access_token: JWT access token for authentication

    Returns:
        Updated task object
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    task_id = input.task_id

    # Exclude task_id from update payload
    update_data = input.model_dump(exclude={"task_id"}, exclude_none=True)

    async with httpx.AsyncClient() as client:
        try:
            response = await client.patch(
                f"{API_URL}/api/{user_id}/tasks/{task_id}",
                json=update_data,
                headers=headers,
                timeout=10.0,
            )
            response.raise_for_status()

            task = response.json()
            logger.info(f"Tool update_task: Updated task {task_id} for user {user_id}")

            return {
                "success": True,
                "task": task,
                "message": f"✓ Task '{task['title']}' updated successfully",
            }

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return {
                    "success": False,
                    "message": f"✗ Task {task_id} not found",
                }
            logger.error(f"Tool update_task failed: {e}")
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Failed to update task: {e.response.text}",
            )


@app.post("/tools/delete_task")
async def delete_task_tool(
    input: DeleteTaskInput,
    user_id: int,
    access_token: str,
) -> Dict[str, Any]:
    """
    MCP Tool: delete_task

    Delete a task by ID.

    Args:
        input: Task ID to delete
        user_id: User ID from chatbot session
        access_token: JWT access token for authentication

    Returns:
        Success confirmation
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    task_id = input.task_id

    async with httpx.AsyncClient() as client:
        try:
            response = await client.delete(
                f"{API_URL}/api/{user_id}/tasks/{task_id}",
                headers=headers,
                timeout=10.0,
            )
            response.raise_for_status()

            logger.info(f"Tool delete_task: Deleted task {task_id} for user {user_id}")

            return {
                "success": True,
                "message": f"✓ Task {task_id} deleted successfully",
            }

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return {
                    "success": False,
                    "message": f"✗ Task {task_id} not found",
                }
            logger.error(f"Tool delete_task failed: {e}")
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Failed to delete task: {e.response.text}",
            )


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint for Kubernetes probes."""
    return {"status": "healthy", "service": "mcp-server"}
```

---

### Step 5: Design Background Tasks (Phase V)

Configure Celery for asynchronous job processing.

**app/tasks/celery_app.py**:
```python
"""
Celery Configuration - Phase V Background Tasks

Tasks:
- send_email_notification: Email on task completion
- generate_daily_report: Daily task summary
- cleanup_old_tasks: Archive completed tasks > 30 days
"""

from celery import Celery
from celery.schedules import crontab
import os

# Redis broker
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Celery app
celery_app = Celery(
    "evolution_todo",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes
    task_soft_time_limit=240,  # 4 minutes
)

# Periodic tasks (cron schedule)
celery_app.conf.beat_schedule = {
    "daily-report": {
        "task": "app.tasks.reports.generate_daily_report",
        "schedule": crontab(hour=0, minute=0),  # Midnight UTC
    },
    "cleanup-old-tasks": {
        "task": "app.tasks.cleanup.cleanup_old_tasks",
        "schedule": crontab(hour=2, minute=0),  # 2 AM UTC daily
    },
}


@celery_app.task(name="send_email_notification")
def send_email_notification(user_email: str, task_title: str):
    """
    Send email notification when task is completed.

    Args:
        user_email: Recipient email address
        task_title: Title of completed task

    Returns:
        Success status
    """
    # Email sending logic (use SendGrid, AWS SES, etc.)
    import smtplib
    from email.mime.text import MIMEText

    msg = MIMEText(f"Task '{task_title}' has been completed!")
    msg["Subject"] = "Task Completed - Evolution of Todo"
    msg["From"] = "noreply@evolution-todo.com"
    msg["To"] = user_email

    # Send email (simplified example)
    # with smtplib.SMTP("localhost") as server:
    #     server.send_message(msg)

    return {"status": "sent", "to": user_email}
```

**Usage in FastAPI route**:
```python
from app.tasks.celery_app import send_email_notification

@router.patch("/{task_id}")
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    # Update task logic...

    # If task marked as completed, send async notification
    if task_data.status == "completed":
        send_email_notification.delay(
            user_email=current_user.email,
            task_title=task.title,
        )

    return task
```

---

## Related Agents

- **Backend Pro Agent**: Primary owner, implements FastAPI services
- **AI Chatbot Agent**: Implements MCP server integration
- **CloudOps Agent**: Deploys backend services to Kubernetes
- **Testing & QA Agent**: Tests API endpoints and MCP tools

---

## Success Metrics

✅ **Modular Architecture**: Clear separation of routers, models, schemas
✅ **Security**: Multi-tenant isolation enforced in all endpoints
✅ **Dependency Injection**: Reusable deps for session and auth
✅ **Error Handling**: Consistent error responses with helpful messages
✅ **Documentation**: OpenAPI schema auto-generated by FastAPI
✅ **Testing**: 85%+ coverage with pytest
✅ **Performance**: < 200ms response time (p95)
✅ **MCP Integration**: Stateless tool endpoints for chatbot

---

## Best Practices

### Do's ✅

- **Dependency Injection**: Use Depends() for database and auth
- **Multi-Tenant Security**: Always filter by user_id from JWT
- **Return 404, Not 403**: For non-existent or unauthorized resources
- **Async/Await**: Use async functions for I/O operations
- **Type Hints**: Full type hints for all functions
- **Logging**: Structured logging with correlation IDs
- **Pagination**: Implement limit/offset for list endpoints
- **Validation**: Use Pydantic schemas for request validation

### Don'ts ❌

- **Don't Trust Path user_id**: Always use JWT user_id
- **Don't Expose Stack Traces**: Return user-friendly error messages
- **Don't Block Event Loop**: Use async for database ops
- **Don't Hardcode**: Use environment variables for config
- **Don't Skip Tests**: Write tests for all endpoints
- **Don't Ignore Performance**: Monitor slow queries
- **Don't Forget Health Checks**: /health and /ready endpoints

---

## Integration with Other Skills

```
API & Database Specification (defines contracts)
  ↓
BACKEND SERVICE DESIGN (this skill) ← Architecture
  ↓
Code Generation (implements services)
  ↓
Test Design (tests endpoints)
  ↓
Deployment & Install UX (deploys services)
```

---

## Output Format

When using this skill, generate:

**1. Service Architecture** (components, dependencies, data flow)
**2. API Routers** (FastAPI routers with endpoints)
**3. Dependency Injection** (get_session, get_current_user)
**4. MCP Server** (tool endpoints for chatbot)
**5. Background Tasks** (Celery tasks for async jobs)
**6. Configuration** (settings with Pydantic BaseSettings)

Save specifications to:
- `specs/backend/services.md` - Service architecture
- `specs/backend/routers.md` - Router specifications
- `specs/backend/mcp.md` - MCP tool specifications

---

## References

- **FastAPI**: https://fastapi.tiangolo.com/
- **SQLModel**: https://sqlmodel.tiangolo.com/
- **Celery**: https://docs.celeryq.dev/
- **MCP**: https://modelcontextprotocol.io/
- **Better Auth**: https://www.better-auth.com/

---

**Document Version**: 1.0.0
**Created**: 2025-12-24
**Total Examples**: 5 (FastAPI monolith, Tasks router, Dependencies, MCP server, Celery tasks)
**Coverage**: Phases II-V (Web App + AI Chatbot + Cloud)

---

*This backend service design skill is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*
