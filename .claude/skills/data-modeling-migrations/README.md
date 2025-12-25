# Data Modeling & Migrations Skill

**Purpose**: Design SQLModel schemas and Alembic migrations for Evolution of Todo hackathon with evolutionary schema changes, multi-tenant indexes, and zero-downtime migrations

**Owner**: Backend Pro Agent + Database Agent

**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

The **Data Modeling & Migrations Skill** enables systematic database schema design:
- Design SQLModel schemas with proper types and constraints
- Create evolutionary schemas that evolve across phases (II → III → IV → V)
- Implement multi-tenant indexing strategies for performance
- Generate Alembic migrations for zero-downtime deployments
- Handle data migrations (not just schema changes)
- Define database relationships and cascade rules
- Optimize queries with compound indexes

This skill ensures the database schema evolves cleanly as the application grows through phases.

---

## Skill Components

### 1. Evolutionary Schemas per Phase

**Phase II (Base Models)**:
- **User**: id, email, password_hash, full_name, created_at
- **Task**: id, user_id, title, description, status, priority, due_date, created_at, updated_at

**Phase III (AI Chatbot)**:
- **ConversationHistory**: id, user_id, conversation_id, role, content, created_at
- **ToolCallLog**: id, conversation_id, tool_name, tool_input, tool_output, status, created_at

**Phase IV (Analytics)**:
- **TaskAnalytics**: id, user_id, completion_rate, avg_completion_time
- **UserStats**: id, user_id, total_tasks, completed_tasks, streak_days

**Phase V (Advanced Features)**:
- **TaskTags**: id, task_id, tag (for many-to-many with tags)
- **TaskAttachments**: id, task_id, file_url, file_type, uploaded_at

### 2. Migration Strategy

**Alembic Workflow**:
1. Auto-generate migration from model changes
2. Review and edit migration script
3. Add custom data migrations if needed
4. Test on development database
5. Apply to staging, then production

**Zero-Downtime Migrations**:
- Add columns as nullable first
- Backfill data in separate migration
- Add NOT NULL constraint after backfill
- Never drop columns immediately (deprecate first)

### 3. Multi-Tenant Indexing

**Critical Indexes**:
- `user_id` - Single column index (for tenant isolation)
- `(user_id, status)` - Compound index (for filtered queries)
- `(user_id, created_at)` - Compound index (for sorted lists)
- `(user_id, priority, status)` - Compound index (for complex filters)

**Index Strategy**:
- Index all foreign keys
- Index columns used in WHERE clauses
- Index columns used in ORDER BY
- Use compound indexes for common query patterns

### 4. SQLModel Features

**Type Safety**:
- Full Python type hints
- Pydantic validation at runtime
- Auto-generated Pydantic schemas

**Relationships**:
- `Relationship` for foreign keys
- `back_populates` for bidirectional relationships
- Cascade delete rules

**Constraints**:
- `Field(unique=True)` for unique columns
- `Field(index=True)` for indexed columns
- `Field(regex="...")` for validation
- `Field(ge=1, le=5)` for numeric ranges

---

## Skill Instructions

### Step 1: Design SQLModel Schema

Create SQLModel table definitions.

**Template**:
```python
"""
[Model Name] - [Description]

Table: [table_name]
Relationships: [List relationships]
Indexes: [List indexes]
"""

from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

class [ModelName](SQLModel, table=True):
    """
    [Model description]

    Attributes:
        [attr]: [description]
    """
    __tablename__ = "[table_name]"

    # Primary key
    id: Optional[int] = Field(default=None, primary_key=True)

    # Foreign keys
    [foreign_key]: int = Field(foreign_key="[parent_table].id", index=True)

    # Data columns
    [column]: [type] = Field(..., [constraints])

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    [relationship]: Optional["[RelatedModel]"] = Relationship(back_populates="[inverse]")

    # Indexes (defined in migration)
    # - (user_id, status)
    # - (user_id, created_at)

    class Config:
        json_schema_extra = {
            "example": {
                # Example data
            }
        }
```

---

#### Example: Task Model (Phase II)

```python
"""
Task Model - Todo items for users

Table: tasks
Relationships: User (many-to-one)
Indexes:
- user_id (single)
- (user_id, status) (compound)
- (user_id, created_at) (compound)
- (user_id, priority, status) (compound for complex queries)
"""

from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.user import User


class Task(SQLModel, table=True):
    """
    Task model with multi-tenant isolation.

    A task belongs to a single user and contains task information
    including title, description, status, and priority.

    Attributes:
        id: Unique task identifier (auto-generated)
        user_id: Foreign key to users table (multi-tenant isolation)
        title: Task title (1-500 characters, required)
        description: Detailed task description (optional, max 2000 chars)
        status: Task completion status (pending, completed)
        priority: Task priority level (high, medium, low)
        due_date: Optional due date for task
        tags: JSONB array of tags (Phase V)
        created_at: Timestamp when task was created
        updated_at: Timestamp when task was last updated
    """
    __tablename__ = "tasks"

    # Primary key
    id: Optional[int] = Field(default=None, primary_key=True)

    # Foreign key (multi-tenant isolation)
    user_id: int = Field(
        foreign_key="users.id",
        index=True,
        description="Owner of this task (multi-tenant)",
    )

    # Task data
    title: str = Field(
        min_length=1,
        max_length=500,
        description="Task title",
    )

    description: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Task description (optional)",
    )

    status: str = Field(
        default="pending",
        regex="^(pending|completed)$",
        description="Task status (pending or completed)",
    )

    priority: str = Field(
        default="medium",
        regex="^(high|medium|low)$",
        index=True,  # Indexed for priority filters
        description="Task priority level",
    )

    due_date: Optional[datetime] = Field(
        default=None,
        description="Task due date (optional)",
    )

    # Phase V: JSONB column for tags
    # tags: Optional[List[str]] = Field(
    #     default=None,
    #     sa_column=Column(JSONB, nullable=True),
    #     description="Task tags (JSONB array)",
    # )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Task creation timestamp",
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Task last update timestamp",
    )

    # Relationship to User
    user: Optional["User"] = Relationship(back_populates="tasks")

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 42,
                "title": "Buy milk",
                "description": "2 liters low fat",
                "status": "pending",
                "priority": "high",
                "due_date": "2025-12-25T00:00:00Z",
                "created_at": "2025-12-24T10:30:00Z",
                "updated_at": "2025-12-24T10:30:00Z",
            }
        }


# Compound indexes defined in Alembic migration:
# - Index("idx_tasks_user_status", "user_id", "status")
# - Index("idx_tasks_user_created", "user_id", "created_at")
# - Index("idx_tasks_user_priority_status", "user_id", "priority", "status")
```

---

#### Example: User Model (Phase II)

```python
"""
User Model - Application users

Table: users
Relationships: Task (one-to-many), ConversationHistory (one-to-many)
Indexes:
- email (unique)
- created_at
"""

from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.task import Task


class User(SQLModel, table=True):
    """
    User model for authentication and multi-tenant isolation.

    Attributes:
        id: Unique user identifier
        email: User email (unique, used for login)
        password_hash: Bcrypt hashed password
        full_name: User's full name
        is_active: Account active status
        is_superuser: Admin status
        created_at: Account creation timestamp
        updated_at: Account last update timestamp
    """
    __tablename__ = "users"

    # Primary key
    id: Optional[int] = Field(default=None, primary_key=True)

    # Authentication
    email: str = Field(
        unique=True,
        index=True,
        max_length=255,
        description="User email (unique)",
    )

    password_hash: str = Field(
        max_length=255,
        description="Bcrypt hashed password",
    )

    # Profile
    full_name: str = Field(
        max_length=255,
        description="User's full name",
    )

    # Account status
    is_active: bool = Field(
        default=True,
        description="Account active status",
    )

    is_superuser: bool = Field(
        default=False,
        description="Admin status",
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="Account creation timestamp",
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Account last update timestamp",
    )

    # Relationships
    tasks: List["Task"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": 42,
                "email": "user@example.com",
                "full_name": "John Doe",
                "is_active": True,
                "is_superuser": False,
                "created_at": "2025-12-24T10:00:00Z",
                "updated_at": "2025-12-24T10:00:00Z",
            }
        }
```

---

#### Example: ConversationHistory Model (Phase III)

```python
"""
ConversationHistory Model - AI Chatbot conversations

Table: conversation_history
Relationships: User (many-to-one)
Indexes:
- (user_id, conversation_id, created_at)
"""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship, Column
from sqlalchemy.dialects.postgresql import TEXT


class ConversationHistory(SQLModel, table=True):
    """
    Conversation history for AI chatbot (Phase III).

    Stores all messages exchanged between user and AI assistant,
    grouped by conversation_id.

    Attributes:
        id: Unique message identifier
        user_id: User who owns this conversation
        conversation_id: UUID grouping related messages
        role: Message sender (user or assistant)
        content: Message text content
        tool_calls: JSONB array of tool executions (optional)
        created_at: Message timestamp
    """
    __tablename__ = "conversation_history"

    # Primary key
    id: Optional[int] = Field(default=None, primary_key=True)

    # Foreign key
    user_id: int = Field(
        foreign_key="users.id",
        index=True,
        description="User who owns this conversation",
    )

    # Conversation grouping
    conversation_id: str = Field(
        max_length=36,  # UUID length
        index=True,
        description="Conversation UUID",
    )

    # Message data
    role: str = Field(
        regex="^(user|assistant)$",
        description="Message sender (user or assistant)",
    )

    content: str = Field(
        sa_column=Column(TEXT),
        description="Message text content",
    )

    # Optional tool call data (JSONB)
    # tool_calls: Optional[List[Dict]] = Field(
    #     default=None,
    #     sa_column=Column(JSONB, nullable=True),
    #     description="Tool executions (if assistant message)",
    # )

    # Timestamp
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Message timestamp",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 42,
                "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
                "role": "user",
                "content": "Add task: Buy milk",
                "created_at": "2025-12-24T10:30:00Z",
            }
        }


# Compound index for efficient conversation retrieval
# Index("idx_conversation_user_conv_created", "user_id", "conversation_id", "created_at")
```

---

### Step 2: Create Alembic Migration

Generate and customize Alembic migration scripts.

**Auto-Generate Migration**:
```bash
# Generate migration from model changes
cd packages/backend
alembic revision --autogenerate -m "Add tasks table"

# Review generated migration
cat alembic/versions/[hash]_add_tasks_table.py

# Edit migration if needed (add indexes, data migrations)
```

**Migration Template**:
```python
"""
[Migration description]

Revision ID: [hash]
Revises: [previous_hash]
Create Date: [date]
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# Revision identifiers
revision = '[hash]'
down_revision = '[previous_hash]'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Apply migration: [description]
    """
    # Create table
    op.create_table(
        '[table_name]',
        # Column definitions
    )

    # Create indexes
    op.create_index(
        '[index_name]',
        '[table_name]',
        ['column1', 'column2'],
    )


def downgrade() -> None:
    """
    Revert migration: [description]
    """
    # Drop indexes first
    op.drop_index('[index_name]', table_name='[table_name]')

    # Drop table
    op.drop_table('[table_name]')
```

---

#### Example: Initial Tasks Table Migration

```python
"""
Add tasks table with multi-tenant indexes

Revision ID: 001_add_tasks
Revises: None
Create Date: 2025-12-24 10:00:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# Revision identifiers
revision = '001_add_tasks'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Create tasks table with user relationship and compound indexes.
    """
    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.String(length=2000), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='pending'),
        sa.Column('priority', sa.String(), nullable=False, server_default='medium'),
        sa.Column('due_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )

    # Single column indexes
    op.create_index('ix_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('ix_tasks_priority', 'tasks', ['priority'])

    # Compound indexes for multi-tenant queries
    op.create_index(
        'idx_tasks_user_status',
        'tasks',
        ['user_id', 'status'],
        unique=False,
    )

    op.create_index(
        'idx_tasks_user_created',
        'tasks',
        ['user_id', 'created_at'],
        unique=False,
    )

    op.create_index(
        'idx_tasks_user_priority_status',
        'tasks',
        ['user_id', 'priority', 'status'],
        unique=False,
    )

    # Add check constraints
    op.create_check_constraint(
        'check_status',
        'tasks',
        "status IN ('pending', 'completed')",
    )

    op.create_check_constraint(
        'check_priority',
        'tasks',
        "priority IN ('high', 'medium', 'low')",
    )


def downgrade() -> None:
    """
    Drop tasks table and all indexes.
    """
    # Drop check constraints
    op.drop_constraint('check_priority', 'tasks', type_='check')
    op.drop_constraint('check_status', 'tasks', type_='check')

    # Drop indexes
    op.drop_index('idx_tasks_user_priority_status', table_name='tasks')
    op.drop_index('idx_tasks_user_created', table_name='tasks')
    op.drop_index('idx_tasks_user_status', table_name='tasks')
    op.drop_index('ix_tasks_priority', table_name='tasks')
    op.drop_index('ix_tasks_user_id', table_name='tasks')

    # Drop table
    op.drop_table('tasks')
```

---

#### Example: Add Tags Column (Phase V, Zero-Downtime)

```python
"""
Add tags JSONB column to tasks (zero-downtime migration)

Revision ID: 005_add_task_tags
Revises: 004_add_conversation_history
Create Date: 2025-12-25 10:00:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = '005_add_task_tags'
down_revision = '004_add_conversation_history'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Add tags column as nullable JSONB array (zero-downtime).

    Strategy:
    1. Add column as nullable (this migration)
    2. Backfill default empty arrays in separate migration
    3. Later: Add NOT NULL constraint if needed
    """
    # Add tags column as nullable
    op.add_column(
        'tasks',
        sa.Column(
            'tags',
            JSONB,
            nullable=True,
            server_default='[]',  # Default to empty array for new rows
            comment='Task tags (JSONB array)',
        ),
    )

    # Create GIN index for JSONB queries (PostgreSQL)
    op.execute("""
        CREATE INDEX idx_tasks_tags
        ON tasks USING GIN (tags)
    """)


def downgrade() -> None:
    """
    Remove tags column.
    """
    # Drop index
    op.drop_index('idx_tasks_tags', table_name='tasks')

    # Drop column
    op.drop_column('tasks', 'tags')
```

**Backfill Migration** (run separately):
```python
"""
Backfill tags column with empty arrays

Revision ID: 006_backfill_task_tags
Revises: 005_add_task_tags
Create Date: 2025-12-25 11:00:00
"""

from alembic import op

revision = '006_backfill_task_tags'
down_revision = '005_add_task_tags'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Backfill tags column with empty arrays for existing rows.

    This is a data migration, not a schema migration.
    """
    # Update existing rows with NULL tags to empty array
    op.execute("""
        UPDATE tasks
        SET tags = '[]'::jsonb
        WHERE tags IS NULL
    """)


def downgrade() -> None:
    """
    Revert backfill (set tags back to NULL).
    """
    op.execute("""
        UPDATE tasks
        SET tags = NULL
        WHERE tags = '[]'::jsonb
    """)
```

---

### Step 3: Define Indexes for Performance

Create strategic indexes for common query patterns.

**Index Design Checklist**:
```markdown
## Index Strategy for Tasks Table

### Query Patterns
1. List tasks for user: `WHERE user_id = ?`
2. Filter by status: `WHERE user_id = ? AND status = ?`
3. Filter by priority: `WHERE user_id = ? AND priority = ?`
4. Sort by created: `WHERE user_id = ? ORDER BY created_at DESC`
5. Complex filter: `WHERE user_id = ? AND priority = ? AND status = ?`

### Indexes Needed
- ✅ `user_id` (single) - Multi-tenant isolation
- ✅ `(user_id, status)` - Filter by status
- ✅ `(user_id, created_at)` - Sort by created
- ✅ `(user_id, priority, status)` - Complex filters
- ✅ `priority` (single) - Global priority queries (admin)

### Index Creation
\`\`\`python
# In Alembic migration
op.create_index('idx_tasks_user_status', 'tasks', ['user_id', 'status'])
op.create_index('idx_tasks_user_created', 'tasks', ['user_id', 'created_at'])
op.create_index('idx_tasks_user_priority_status', 'tasks', ['user_id', 'priority', 'status'])
\`\`\`

### Index Usage Verification
\`\`\`sql
-- Check if index is used (PostgreSQL)
EXPLAIN ANALYZE
SELECT * FROM tasks
WHERE user_id = 1 AND status = 'pending'
ORDER BY created_at DESC;

-- Should show: Index Scan using idx_tasks_user_status
\`\`\`
```

---

### Step 4: Handle Cascade Rules

Define what happens when parent records are deleted.

**Cascade Options**:
- `CASCADE` - Delete child records automatically
- `SET NULL` - Set foreign key to NULL
- `RESTRICT` - Prevent deletion if children exist
- `NO ACTION` - Same as RESTRICT (default)

**Example: User Deletion**:
```python
# In Task model
user_id: int = Field(
    foreign_key="users.id",
    # Cascade handled in relationship, not here
)

# In User model
tasks: List["Task"] = Relationship(
    back_populates="user",
    sa_relationship_kwargs={"cascade": "all, delete-orphan"},
)

# In Alembic migration
sa.ForeignKeyConstraint(
    ['user_id'],
    ['users.id'],
    ondelete='CASCADE',  # Delete tasks when user deleted
)
```

**Test Cascade**:
```python
# Delete user should cascade to tasks
user = session.get(User, 1)
session.delete(user)
session.commit()

# All tasks for user_id=1 should be deleted automatically
tasks = session.exec(select(Task).where(Task.user_id == 1)).all()
assert len(tasks) == 0
```

---

### Step 5: Generate Migration Documentation

Document schema evolution for developers.

**specs/database/schema.md**:
```markdown
# Database Schema - Evolution of Todo

**Last Updated**: 2025-12-24

---

## Schema Evolution by Phase

### Phase II (Base Schema)
- users: User accounts with authentication
- tasks: Todo items with multi-tenant isolation

### Phase III (AI Chatbot)
- conversation_history: Chat messages
- tool_call_logs: MCP tool execution logs

### Phase V (Advanced Features)
- Add tags column to tasks (JSONB)

---

## Tables

### users

**Purpose**: User accounts and authentication

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | User ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hash |
| full_name | VARCHAR(255) | NOT NULL | Full name |
| is_active | BOOLEAN | DEFAULT true | Account active |
| is_superuser | BOOLEAN | DEFAULT false | Admin status |
| created_at | TIMESTAMP | DEFAULT now() | Created timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Updated timestamp |

**Indexes**:
- PRIMARY KEY: id
- UNIQUE: email
- INDEX: created_at

**Relationships**:
- tasks (one-to-many, cascade delete)

---

### tasks

**Purpose**: Todo items with multi-tenant isolation

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Task ID |
| user_id | INTEGER | FOREIGN KEY(users.id), NOT NULL | Owner |
| title | VARCHAR(500) | NOT NULL | Task title |
| description | VARCHAR(2000) | NULL | Description |
| status | VARCHAR | CHECK(pending/completed), DEFAULT pending | Status |
| priority | VARCHAR | CHECK(high/medium/low), DEFAULT medium | Priority |
| due_date | TIMESTAMP | NULL | Due date |
| tags | JSONB | NULL, DEFAULT [] | Tags (Phase V) |
| created_at | TIMESTAMP | DEFAULT now() | Created |
| updated_at | TIMESTAMP | DEFAULT now() | Updated |

**Indexes**:
- PRIMARY KEY: id
- INDEX: user_id
- INDEX: priority
- COMPOUND INDEX: (user_id, status)
- COMPOUND INDEX: (user_id, created_at)
- COMPOUND INDEX: (user_id, priority, status)
- GIN INDEX: tags (JSONB, Phase V)

**Relationships**:
- user (many-to-one)

**Check Constraints**:
- status IN ('pending', 'completed')
- priority IN ('high', 'medium', 'low')

---

## Migration History

| Migration | Date | Description |
|-----------|------|-------------|
| 001_add_tasks | 2025-12-24 | Initial tasks table with indexes |
| 002_add_users | 2025-12-24 | Add users table |
| 003_add_foreign_keys | 2025-12-24 | Link tasks to users |
| 004_add_conversation_history | 2025-12-25 | Phase III chat history |
| 005_add_task_tags | 2025-12-26 | Phase V: JSONB tags column |
| 006_backfill_task_tags | 2025-12-26 | Backfill empty arrays |

---

## Query Patterns

### List tasks for user (filtered, sorted)
\`\`\`sql
SELECT * FROM tasks
WHERE user_id = ? AND status = ?
ORDER BY created_at DESC
LIMIT 100 OFFSET 0;

-- Uses index: idx_tasks_user_status
\`\`\`

### Complex filter (priority + status)
\`\`\`sql
SELECT * FROM tasks
WHERE user_id = ?
  AND priority = 'high'
  AND status = 'pending'
ORDER BY created_at DESC;

-- Uses index: idx_tasks_user_priority_status
\`\`\`

### Search tags (Phase V)
\`\`\`sql
SELECT * FROM tasks
WHERE user_id = ?
  AND tags @> '["urgent"]'::jsonb;

-- Uses index: idx_tasks_tags (GIN)
\`\`\`
```

---

## Related Agents

- **Backend Pro Agent**: Implements SQLModel models and Alembic migrations
- **Database Agent**: Optimizes indexes and query performance
- **Testing & QA Agent**: Tests migrations and data integrity

---

## Success Metrics

✅ **Type Safety**: Full SQLModel type hints
✅ **Multi-Tenant**: Compound indexes for user_id filtering
✅ **Zero-Downtime**: Add columns as nullable, backfill separately
✅ **Relationships**: Proper foreign keys with cascade rules
✅ **Performance**: Query plans use indexes (EXPLAIN ANALYZE)
✅ **Documentation**: Schema docs with migration history
✅ **Reversible**: All migrations have downgrade path

---

## Best Practices

### Do's ✅

- **Index user_id**: Always index tenant isolation column
- **Compound Indexes**: Index common query patterns
- **Nullable First**: Add columns as nullable for zero-downtime
- **Cascade Delete**: Use CASCADE for one-to-many relationships
- **Check Constraints**: Enforce enum values in database
- **Default Values**: Set sensible defaults in schema
- **Timestamps**: Always include created_at and updated_at

### Don'ts ❌

- **Don't Drop Columns Immediately**: Deprecate first, drop later
- **Don't Add NOT NULL**: Without default or backfill
- **Don't Skip Indexes**: On foreign keys and WHERE columns
- **Don't Use TEXT**: For short strings (use VARCHAR with limit)
- **Don't Hardcode IDs**: Use sequences/auto-increment
- **Don't Forget Downgrade**: Every migration needs rollback

---

## Integration with Other Skills

```
API & Database Specification (defines schema requirements)
  ↓
DATA MODELING & MIGRATIONS (this skill) ← Schema design
  ↓
Backend Service Design (uses SQLModel models)
  ↓
Code Generation (generates migrations)
  ↓
Test Design (tests data integrity)
```

---

## Output Format

When using this skill, generate:

**1. SQLModel Schemas** (app/models/*.py)
**2. Alembic Migrations** (alembic/versions/*.py)
**3. Index Definitions** (in migrations)
**4. Schema Documentation** (specs/database/schema.md)
**5. Migration Guide** (docs/migrations.md)

---

## References

- **SQLModel**: https://sqlmodel.tiangolo.com/
- **Alembic**: https://alembic.sqlalchemy.org/
- **PostgreSQL Indexes**: https://www.postgresql.org/docs/current/indexes.html
- **JSONB**: https://www.postgresql.org/docs/current/datatype-json.html

---

**Document Version**: 1.0.0
**Created**: 2025-12-24
**Total Examples**: 6 (Task model, User model, ConversationHistory, migrations, indexes)
**Coverage**: Phases II-V (Schema evolution)

---

*This data modeling & migrations skill is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*
