# API & Database Specification Skill

**Skill Type**: API & Data Design
**Version**: 1.0.0
**Created**: 2025-12-24
**Owner**: Spec Architect Agent + System Architect Agent

---

## Overview

The **API & Database Specification** skill is a systematic approach to designing REST API endpoints, MCP tools, and database schemas for the **Evolution of Todo** hackathon project. This skill ensures consistent API design, proper multi-tenant isolation, and evolutionary database schemas across Phases II through V.

**Purpose**: Transform feature requirements into concrete API contracts and database models with clear request/response formats, data types, and security constraints.

**Output**:
- `specs/api/rest-endpoints.md` - REST API documentation
- `specs/api/mcp-tools.md` - MCP tools for chatbot
- `specs/database/schema.md` - Database schema and models

---

## Skill Components

### 1. REST API Endpoint Design
- RESTful routes with proper HTTP methods
- Request/response schemas (JSON)
- Authentication and authorization
- Error handling and status codes
- Pagination and filtering

### 2. MCP Tools Definition
- Tool names and descriptions
- Input parameters with types
- Output schemas
- Error handling
- User context injection

### 3. SQLModel Database Schemas
- Table models with relationships
- Data types and constraints
- Indexes for performance
- Multi-tenant isolation (user_id)
- Migration strategy

---

## Step 1: Design REST API Endpoints

### REST API Endpoints Table (Phase II)

**Base URL**: `/api/v1`
**Authentication**: Bearer JWT (required for all endpoints except auth)

#### Authentication Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/auth/register` | Create new user account | No |
| POST | `/auth/login` | Authenticate and get JWT | No |
| POST | `/auth/logout` | Logout (client-side token removal) | Yes |
| GET | `/auth/me` | Get current user profile | Yes |

#### Task Endpoints (Multi-Tenant)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/tasks` | List all tasks for current user | Yes |
| POST | `/api/tasks` | Create new task | Yes |
| GET | `/api/tasks/{id}` | Get single task by ID | Yes |
| PATCH | `/api/tasks/{id}` | Update task (partial) | Yes |
| DELETE | `/api/tasks/{id}` | Delete task permanently | Yes |

**Note**: User ID extracted from JWT token, not from URL path. All queries automatically filtered by `user_id`.

---

### Endpoint Specifications

#### GET /api/tasks

**Purpose**: List all tasks for authenticated user with optional filters

**Authentication**: Required (JWT in Authorization header)

**Query Parameters**:
```
?status=pending|completed      # Filter by status
?priority=low|medium|high      # Filter by priority
?tags=work,urgent              # Filter by tags (comma-separated)
?search=groceries              # Search in title/description
?limit=50                      # Max results (default: 50, max: 200)
?offset=0                      # Pagination offset
?sort=created_at|due_date      # Sort field
?order=asc|desc                # Sort order (default: desc)
```

**Request Example**:
```http
GET /api/tasks?status=pending&priority=high&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "tasks": [
    {
      "id": 1,
      "user_id": 123,
      "title": "Buy groceries",
      "description": "2 liters low fat milk",
      "status": "pending",
      "priority": "high",
      "tags": ["personal", "urgent"],
      "due_date": "2025-12-25T18:00:00Z",
      "created_at": "2025-12-24T10:30:00Z",
      "updated_at": "2025-12-24T10:30:00Z"
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `400 Bad Request`: Invalid query parameters

---

#### POST /api/tasks

**Purpose**: Create a new task for authenticated user

**Authentication**: Required

**Request Body**:
```json
{
  "title": "Buy groceries",
  "description": "2 liters low fat milk",
  "priority": "high",
  "tags": ["personal", "urgent"],
  "due_date": "2025-12-25T18:00:00Z"
}
```

**Request Schema**:
| Field | Type | Required | Constraints | Default |
|-------|------|----------|-------------|---------|
| title | string | Yes | 1-500 chars | - |
| description | string | No | Max 2000 chars | null |
| priority | enum | No | low/medium/high | medium |
| tags | string[] | No | Each tag max 50 chars | [] |
| due_date | datetime | No | ISO 8601 format | null |

**Response** (201 Created):
```json
{
  "id": 1,
  "user_id": 123,
  "title": "Buy groceries",
  "description": "2 liters low fat milk",
  "status": "pending",
  "priority": "high",
  "tags": ["personal", "urgent"],
  "due_date": "2025-12-25T18:00:00Z",
  "created_at": "2025-12-24T10:30:00Z",
  "updated_at": "2025-12-24T10:30:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT
- `400 Bad Request`: Title empty or too long, invalid priority, invalid due_date format
- `422 Unprocessable Entity`: Validation failed

**Example Error**:
```json
{
  "detail": "Title is required and must be 1-500 characters",
  "error_code": "INVALID_TITLE"
}
```

---

#### PATCH /api/tasks/{id}

**Purpose**: Update a task (partial update)

**Authentication**: Required

**URL Parameters**:
- `id` (integer): Task ID to update

**Request Body** (all fields optional):
```json
{
  "title": "Buy groceries and cook dinner",
  "description": "Updated description",
  "status": "completed",
  "priority": "medium",
  "tags": ["personal"],
  "due_date": "2025-12-26T18:00:00Z"
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "user_id": 123,
  "title": "Buy groceries and cook dinner",
  "description": "Updated description",
  "status": "completed",
  "priority": "medium",
  "tags": ["personal"],
  "due_date": "2025-12-26T18:00:00Z",
  "created_at": "2025-12-24T10:30:00Z",
  "updated_at": "2025-12-24T15:45:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT
- `404 Not Found`: Task doesn't exist OR user doesn't own it (security: don't reveal existence)
- `400 Bad Request`: Invalid field values

---

#### DELETE /api/tasks/{id}

**Purpose**: Delete a task permanently

**Authentication**: Required

**URL Parameters**:
- `id` (integer): Task ID to delete

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "task_id": 1
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT
- `404 Not Found`: Task doesn't exist OR user doesn't own it

---

## Step 2: Define MCP Tools for Phase III Chatbot

### MCP Tools Specification

**Protocol**: Model Context Protocol (MCP)
**Transport**: HTTP/JSON
**Authentication**: JWT token passed in context

#### Tool: add_task

**Purpose**: Create a new task for the user

**Name**: `add_task`

**Description**: "Create a new task with title and optional description, priority, tags, and due date"

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Task title (1-500 characters)",
      "minLength": 1,
      "maxLength": 500
    },
    "description": {
      "type": "string",
      "description": "Optional task description",
      "maxLength": 2000
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high"],
      "description": "Task priority level",
      "default": "medium"
    },
    "tags": {
      "type": "array",
      "items": {"type": "string", "maxLength": 50},
      "description": "Tags for categorization"
    },
    "due_date": {
      "type": "string",
      "format": "date-time",
      "description": "Due date in ISO 8601 format"
    }
  },
  "required": ["title"]
}
```

**Output**:
```json
{
  "task_id": 5,
  "status": "created",
  "message": "Task created successfully: Buy groceries"
}
```

**Example Usage** (from chatbot):
```
User: "Add a task to buy groceries tomorrow with high priority"

Agent extracts:
  - title: "buy groceries"
  - priority: "high"
  - due_date: "2025-12-25T23:59:59Z"

MCP Call:
  add_task(
    title="buy groceries",
    priority="high",
    due_date="2025-12-25T23:59:59Z"
  )

Result:
  {"task_id": 5, "status": "created"}

Agent responds:
  "I've added 'Buy groceries' to your tasks with high priority, due tomorrow. (Task ID: 5)"
```

---

#### Tool: list_tasks

**Name**: `list_tasks`

**Description**: "List all tasks for the user with optional filters"

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": ["pending", "completed"],
      "description": "Filter by task status"
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high"],
      "description": "Filter by priority"
    },
    "tags": {
      "type": "array",
      "items": {"type": "string"},
      "description": "Filter by tags (AND logic)"
    },
    "search": {
      "type": "string",
      "description": "Search in title and description"
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100,
      "default": 50,
      "description": "Maximum tasks to return"
    }
  }
}
```

**Output**:
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "description": "2 liters low fat milk",
      "status": "pending",
      "priority": "high",
      "tags": ["personal", "urgent"],
      "due_date": "2025-12-25T18:00:00Z",
      "created_at": "2025-12-24T10:30:00Z"
    }
  ],
  "total": 1
}
```

**Example Usage**:
```
User: "Show my high priority pending tasks"

Agent extracts:
  - status: "pending"
  - priority: "high"

MCP Call:
  list_tasks(status="pending", priority="high")

Result:
  {"tasks": [...], "total": 2}

Agent responds:
  "You have 2 high priority pending tasks:
   1. Buy groceries (due tomorrow)
   2. Finish project report (due next week)"
```

---

#### Tool: complete_task

**Name**: `complete_task`

**Description**: "Mark a task as completed"

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "integer",
      "description": "ID of the task to complete"
    }
  },
  "required": ["task_id"]
}
```

**Output**:
```json
{
  "task_id": 1,
  "status": "completed",
  "message": "Task 'Buy groceries' marked as completed"
}
```

**Error Output**:
```json
{
  "error": "Task not found or you don't have permission",
  "error_code": "TASK_NOT_FOUND"
}
```

---

#### Tool: delete_task

**Name**: `delete_task`

**Description**: "Delete a task permanently"

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "integer",
      "description": "ID of the task to delete"
    }
  },
  "required": ["task_id"]
}
```

**Output**:
```json
{
  "success": true,
  "task_id": 1,
  "message": "Task deleted successfully"
}
```

---

## Step 3: Define SQLModel Database Models

### Task Model (SQLModel)

**File**: `backend/src/models/task.py`

```python
from sqlmodel import SQLModel, Field, Relationship, Column, JSON
from datetime import datetime
from typing import Optional, List
from enum import Enum

class TaskStatus(str, Enum):
    """Task status enumeration"""
    pending = "pending"
    completed = "completed"

class TaskPriority(str, Enum):
    """Task priority enumeration"""
    low = "low"
    medium = "medium"
    high = "high"

class TaskBase(SQLModel):
    """Base task model with common fields"""
    title: str = Field(min_length=1, max_length=500, index=True)
    description: Optional[str] = Field(None, max_length=2000)
    priority: TaskPriority = Field(default=TaskPriority.medium)
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    due_date: Optional[datetime] = Field(None, index=True)

class Task(TaskBase, table=True):
    """Task database table model"""
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)  # Multi-tenant isolation
    status: TaskStatus = Field(default=TaskStatus.pending, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: Optional["User"] = Relationship(back_populates="tasks")

    class Config:
        """SQLModel configuration"""
        use_enum_values = True  # Store enum values as strings in DB

class TaskCreate(TaskBase):
    """Model for creating tasks (no id, user_id, status)"""
    pass

class TaskUpdate(SQLModel):
    """Model for updating tasks (all fields optional)"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None

class TaskPublic(TaskBase):
    """Public task model for API responses"""
    id: int
    user_id: int
    status: TaskStatus
    created_at: datetime
    updated_at: datetime

class TaskList(SQLModel):
    """Paginated task list response"""
    tasks: List[TaskPublic]
    total: int
    limit: int
    offset: int
```

---

### User Model (SQLModel)

**File**: `backend/src/models/user.py`

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List
from pydantic import EmailStr, validator
import re

class UserBase(SQLModel):
    """Base user model"""
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    name: str = Field(min_length=2, max_length=100)

class User(UserBase, table=True):
    """User database table model"""
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    tasks: List["Task"] = Relationship(back_populates="user")
    conversations: List["Conversation"] = Relationship(back_populates="user")  # Phase III

class UserCreate(UserBase):
    """Model for user registration"""
    password: str = Field(min_length=8, max_length=100)

    @validator('password')
    def validate_password_strength(cls, v):
        """Validate password meets security requirements"""
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>?]', v):
            raise ValueError('Password must contain at least one special character')
        return v

class UserLogin(SQLModel):
    """Model for user login"""
    email: EmailStr
    password: str

class UserPublic(UserBase):
    """Public user model (no password_hash)"""
    id: int
    created_at: datetime

class TokenResponse(SQLModel):
    """JWT token response"""
    user: UserPublic
    token: str
    expires_at: datetime
```

---

### Conversation Model (Phase III)

**File**: `backend/src/models/conversation.py`

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List

class ConversationBase(SQLModel):
    """Base conversation model"""
    title: Optional[str] = Field(None, max_length=200)

class Conversation(ConversationBase, table=True):
    """Conversation database table model"""
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: Optional["User"] = Relationship(back_populates="conversations")
    messages: List["Message"] = Relationship(back_populates="conversation")
```

---

### Message Model (Phase III)

**File**: `backend/src/models/message.py`

```python
from sqlmodel import SQLModel, Field, Relationship, Column, JSON
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum

class MessageRole(str, Enum):
    """Message role enumeration"""
    user = "user"
    assistant = "assistant"

class MessageBase(SQLModel):
    """Base message model"""
    role: MessageRole
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))

class Message(MessageBase, table=True):
    """Message database table model"""
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Relationships
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")
```

---

## Multi-Tenant Isolation (Critical Security)

### Principle: ALL Queries Filter by user_id from JWT

**Authentication Flow**:
```python
# 1. Extract user_id from JWT
def get_current_user(token: str) -> User:
    payload = decode_jwt(token)
    user_id = payload["sub"]
    return get_user_by_id(user_id)

# 2. ALL database queries include user_id filter
def get_tasks(current_user: User, filters: dict) -> List[Task]:
    query = select(Task).where(Task.user_id == current_user.id)
    # Add additional filters
    if filters.get("status"):
        query = query.where(Task.status == filters["status"])
    return session.exec(query).all()
```

**Security Rules**:
- ✅ User ID from JWT token (not from URL or request body)
- ✅ All queries include `WHERE user_id = <current_user_id>`
- ✅ Return 404 (not 403) if task exists but belongs to another user
- ✅ Never expose other users' data in error messages

**Example - Secure Endpoint**:
```python
@router.get("/api/tasks/{task_id}", response_model=TaskPublic)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get single task - with user_id isolation"""
    task = session.get(Task, task_id)

    # Security check: user owns this task
    if not task or task.user_id != current_user.id:
        raise HTTPException(
            status_code=404,
            detail="Task not found"  # Don't reveal if it exists
        )

    return task
```

---

## Step 4: Output Format

### File 1: specs/api/rest-endpoints.md

```markdown
# REST API Endpoints Specification

**Version**: 1.0.0
**Base URL**: `/api/v1`
**Authentication**: Bearer JWT

## Authentication Endpoints

[Table of auth endpoints]
[Detailed specs for each endpoint]

## Task Endpoints

[Table of task endpoints]
[Detailed specs for each endpoint]

## Error Response Format

[Standard error format]

## Multi-Tenant Security

[user_id isolation strategy]
```

---

### File 2: specs/api/mcp-tools.md

```markdown
# MCP Tools Specification

**Version**: 1.0.0
**Protocol**: Model Context Protocol
**Phase**: III (AI Chatbot)

## Available Tools

### add_task
[Full tool specification]

### list_tasks
[Full tool specification]

### complete_task
[Full tool specification]

### delete_task
[Full tool specification]

## Security

[user_id context injection]
```

---

### File 3: specs/database/schema.md

```markdown
# Database Schema Specification

**Version**: 1.0.0
**Database**: PostgreSQL 15+
**ORM**: SQLModel

## Tables

### users
[Table definition with columns, types, constraints]

### tasks
[Table definition with multi-tenant user_id FK]

### conversations (Phase III)
[Table definition]

### messages (Phase III)
[Table definition]

## Relationships

[ER diagram or description]

## Indexes

[Index strategy for performance]

## Migration Strategy

[Alembic migration approach]
```

---

## Examples

### Example: REST API Response

**Request**:
```http
GET /api/tasks?status=pending&limit=2
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**:
```json
{
  "tasks": [
    {
      "id": 1,
      "user_id": 123,
      "title": "Buy milk",
      "description": "2 liters low fat",
      "status": "pending",
      "priority": "medium",
      "tags": ["personal"],
      "due_date": null,
      "created_at": "2025-12-24T10:00:00Z",
      "updated_at": "2025-12-24T10:00:00Z"
    },
    {
      "id": 2,
      "user_id": 123,
      "title": "Finish report",
      "description": "Project status update",
      "status": "pending",
      "priority": "high",
      "tags": ["work", "urgent"],
      "due_date": "2025-12-25T17:00:00Z",
      "created_at": "2025-12-24T09:00:00Z",
      "updated_at": "2025-12-24T09:00:00Z"
    }
  ],
  "total": 2,
  "limit": 2,
  "offset": 0
}
```

---

### Example: MCP Tool Call

**Natural Language Input**:
```
"Add a task to buy milk for tomorrow"
```

**Agent Processing**:
```
Intent: add_task
Extracted Parameters:
  - title: "buy milk"
  - due_date: "2025-12-25T23:59:59Z" (tomorrow)
```

**MCP Tool Call**:
```json
{
  "tool": "add_task",
  "parameters": {
    "title": "buy milk",
    "due_date": "2025-12-25T23:59:59Z"
  },
  "context": {
    "user_id": 123
  }
}
```

**MCP Tool Response**:
```json
{
  "task_id": 5,
  "status": "created",
  "message": "Task created successfully: buy milk"
}
```

**Agent Response to User**:
```
"I've added 'buy milk' to your tasks, due tomorrow. (Task ID: 5)"
```

---

### Example: SQLModel Usage

**Create Task**:
```python
from models.task import Task, TaskCreate
from models.user import User

# Create task
task_data = TaskCreate(
    title="Buy groceries",
    description="2 liters low fat milk",
    priority="high",
    tags=["personal", "urgent"],
    due_date=datetime.fromisoformat("2025-12-25T18:00:00")
)

task = Task(
    **task_data.dict(),
    user_id=current_user.id,  # From JWT
    status="pending"
)

session.add(task)
session.commit()
session.refresh(task)

# Result: task.id = 1 (auto-generated)
```

**Query Tasks (Multi-Tenant)**:
```python
# CRITICAL: Always filter by user_id
query = select(Task).where(Task.user_id == current_user.id)

# Add filters
if status:
    query = query.where(Task.status == status)

if priority:
    query = query.where(Task.priority == priority)

# Execute
tasks = session.exec(query).all()
```

**Update Task**:
```python
# Get task (with user_id check)
task = session.get(Task, task_id)

if not task or task.user_id != current_user.id:
    raise NotFoundError()  # Security: don't reveal existence

# Update fields
task.status = "completed"
task.updated_at = datetime.utcnow()

session.add(task)
session.commit()
```

---

## Related Agents

- **Backend / FastAPI Pro Agent** (`.claude/agents/backend-fastapi.md`): Implements REST API and SQLModel models
- **AI Chatbot Agent** (`.claude/agents/ai-chatbot.md`): Uses MCP tools to interact with backend
- **Spec Architect Agent** (`.claude/agents/spec-architect.md`): Writes API and database specifications

---

## Skill Invocation

**For REST API Design**:
```
Act as Spec Architect Agent and write REST API specification for task management
```

**For Database Schema**:
```
Act as System Architect Agent and design database schema for multi-tenant task system
```

**For Implementation**:
```
Act as Backend / FastAPI Pro Agent and implement the tasks API endpoints
```

---

## Success Metrics

A well-designed API and database has:
- ✅ RESTful endpoints with proper HTTP methods
- ✅ Clear request/response schemas
- ✅ Multi-tenant isolation (user_id in all queries)
- ✅ Proper indexes for performance
- ✅ Validation at API and database levels
- ✅ Error responses with helpful messages
- ✅ MCP tools match REST API capabilities
- ✅ Security: JWT authentication, no cross-user access

---

## Validation Checklist

Before finalizing API/database specs:

### API Checklist
- [ ] All endpoints documented (method, route, purpose)
- [ ] Request schemas with types and constraints
- [ ] Response schemas with examples
- [ ] Error responses with status codes
- [ ] Authentication requirements specified
- [ ] Pagination for list endpoints
- [ ] Filtering and sorting documented
- [ ] Multi-tenant isolation enforced

### Database Checklist
- [ ] All tables defined with columns and types
- [ ] Primary keys and foreign keys specified
- [ ] Indexes for frequently queried fields
- [ ] Relationships documented
- [ ] user_id foreign key on all user-owned tables
- [ ] Validation constraints specified
- [ ] Migration strategy planned
- [ ] Data retention policy defined

### MCP Tools Checklist
- [ ] Tool names are descriptive verbs
- [ ] Parameters have clear descriptions
- [ ] Required vs optional parameters marked
- [ ] Output schemas defined
- [ ] Error handling specified
- [ ] User context injection documented

---

## Revision History

| **Version** | **Date**       | **Changes**                                      |
|-------------|----------------|--------------------------------------------------|
| 1.0.0       | 2025-12-24     | Initial skill documentation                      |

---

## References

- **Constitution**: `.specify/memory/constitution.md` (Principle V: Testability, Principle VII: Security)
- **Backend Agent**: `.claude/agents/backend-fastapi.md`
- **Chatbot Agent**: `.claude/agents/ai-chatbot.md`
- **SQLModel Documentation**: https://sqlmodel.tiangolo.com/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **MCP Documentation**: https://modelcontextprotocol.io/

---

**Status**: Ready for Phase II+ implementation
**Activation**: See skill invocation section above
