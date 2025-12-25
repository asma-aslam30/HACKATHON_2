# Code Refactoring Skill

**Purpose**: Refactor existing code to match current phase specifications and apply best practices for Evolution of Todo hackathon phases

**Owner**: All Implementation Agents (Backend, Frontend, Console, Chatbot, Code Quality)

**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

The **Code Refactoring Skill** enables systematic evolution of code across hackathon phases:
- Analyze existing code and compare to current specs
- Plan phase evolution migrations (I→II, II→III, III→IV, IV→V)
- Apply modern standards (TypeScript strict, Pydantic v2, Tailwind v4)
- Generate git diffs and migration instructions
- Preserve backward compatibility where required
- Maintain test coverage throughout refactoring

This skill ensures code stays aligned with specifications as the project evolves through hackathon phases.

---

## Skill Components

### 1. Code Analysis

Compare existing code to current specifications:
- **Spec Mapping**: Match code files to architecture, API, database, UI specs
- **Gap Identification**: Find deviations from specs (missing features, outdated patterns)
- **Phase Detection**: Determine current phase and target phase
- **Dependency Analysis**: Identify breaking changes and migration paths

### 2. Phase Evolution Refactoring

Systematic migrations between phases:

**Phase I → II: CLI to Web App**
- In-memory storage → PostgreSQL (SQLModel)
- Global variables → REST API endpoints
- argparse commands → FastAPI routers
- Print statements → JSON responses

**Phase II → III: Web App to AI Chatbot**
- REST endpoints → MCP tools
- Direct API calls → Tool-based execution
- Form inputs → Natural language processing
- HTTP requests → Claude Agents SDK

**Phase III → IV: Chatbot to Kubernetes**
- Local processes → Containerized services
- Environment variables → Kubernetes ConfigMaps/Secrets
- Manual deployment → Helm charts
- Basic logging → Prometheus metrics + Jaeger traces

**Phase IV → V: Kubernetes to Cloud-Native**
- Single cluster → Multi-cloud deployment
- Synchronous APIs → Kafka event streams
- Direct calls → Dapr service mesh
- Manual CI → GitHub Actions pipelines

### 3. Standards Application

Apply modern best practices:
- **TypeScript**: Strict mode, no implicit any, full type coverage
- **Python**: mypy strict, Pydantic v2 with field validators
- **FastAPI**: Async/await, dependency injection, OpenAPI docs
- **Next.js**: App Router (not Pages), Server Components by default
- **Tailwind**: v4 syntax, custom config, dark mode
- **Testing**: 80%+ coverage maintained during refactoring

### 4. Migration Output

Generate comprehensive migration documentation:
- **Git Diffs**: Before/after code changes
- **Migration Steps**: Ordered checklist with commands
- **Breaking Changes**: What will stop working and how to fix
- **Rollback Plan**: How to revert if issues occur
- **Testing Strategy**: How to validate refactored code

---

## Skill Instructions

### Step 1: Analyze Existing Code

Map code to specs and identify gaps.

**Template**:
```markdown
## Code Analysis

**Current Phase**: [I, II, III, IV, or V]
**Target Phase**: [II, III, IV, or V]
**Files Analyzed**: [List of file paths]

### Spec Mapping

| File | Current State | Spec Reference | Gap |
|------|---------------|----------------|-----|
| [file path] | [description] | [spec location] | [what's missing/outdated] |

### Phase Evolution Required

**Current Approach**:
- [How feature currently works]
- [Technologies used]
- [Data storage method]

**Target Approach** (per spec):
- [How feature should work in target phase]
- [Required technologies]
- [New data storage method]

### Breaking Changes

- [ ] [Change 1]: Impact and mitigation
- [ ] [Change 2]: Impact and mitigation

### Dependencies to Update

- [Dependency 1]: [old version] → [new version]
- [Dependency 2]: [old version] → [new version]
```

**Example: Phase I → II**:
```markdown
## Code Analysis

**Current Phase**: I (Console CLI)
**Target Phase**: II (Web App with Backend)
**Files Analyzed**: cli/todo.py

### Spec Mapping

| File | Current State | Spec Reference | Gap |
|------|---------------|----------------|-----|
| cli/todo.py | In-memory list storage | specs/api/rest-endpoints.md | Missing REST API, no persistence |
| cli/todo.py | argparse commands | specs/database/schema.md | Missing SQLModel Task model |
| cli/todo.py | Global variables | specs/phase-ii/spec.md | No multi-user support |

### Phase Evolution Required

**Current Approach**:
- Global `tasks: List[Dict]` in-memory
- argparse CLI commands (add, list, complete, delete)
- Data lost on exit

**Target Approach** (per Phase II spec):
- Neon PostgreSQL with SQLModel Task model
- FastAPI REST endpoints (GET/POST/PATCH/DELETE)
- Data persists, supports multiple users (multi-tenant)

### Breaking Changes

- [x] **Storage**: In-memory → PostgreSQL
  - Impact: Data will be lost during migration
  - Mitigation: Export CLI data to JSON before migration
- [x] **Interface**: CLI commands → REST API
  - Impact: CLI will need to call API instead of manipulating list
  - Mitigation: Update CLI to use `httpx` for API calls
- [x] **Data Structure**: `Dict` → SQLModel `Task` class
  - Impact: Add `user_id` field for multi-tenant support
  - Mitigation: Seed database with default user_id=1

### Dependencies to Update

- Add: fastapi>=0.115.0
- Add: sqlmodel>=0.0.18
- Add: alembic>=1.13.0
- Add: psycopg2-binary>=2.9.9 (PostgreSQL driver)
```

---

### Step 2: Plan Refactoring Strategy

Create ordered migration steps.

**Template**:
```markdown
## Refactoring Strategy

### Step 1: [Preparation]
- [ ] Backup existing data
- [ ] Create feature branch: `git checkout -b phase-[N]-migration`
- [ ] Update dependencies in pyproject.toml / package.json

### Step 2: [Data Layer Migration]
- [ ] Create new data models (SQLModel, Prisma, etc.)
- [ ] Generate database migrations
- [ ] Test migrations on empty database
- [ ] Migrate existing data (if applicable)

### Step 3: [API Layer Migration]
- [ ] Create new API endpoints/tools
- [ ] Implement new business logic
- [ ] Add authentication/authorization
- [ ] Update error handling

### Step 4: [UI Layer Migration] (if applicable)
- [ ] Migrate to new framework version
- [ ] Update components to new patterns
- [ ] Apply new styling standards
- [ ] Add accessibility improvements

### Step 5: [Testing]
- [ ] Update unit tests
- [ ] Update integration tests
- [ ] Add new tests for added functionality
- [ ] Verify 80%+ coverage maintained

### Step 6: [Deployment]
- [ ] Update configuration
- [ ] Test in staging environment
- [ ] Deploy to production
- [ ] Monitor for errors

### Step 7: [Cleanup]
- [ ] Remove deprecated code
- [ ] Update documentation
- [ ] Create git tag for release
```

---

### Step 3: Generate Refactored Code

Show before/after with git diff format.

**Template**:
```diff
--- a/[old file path]
+++ b/[new file path]
@@ line numbers @@
-[old code]
+[new code]
```

---

#### Example 1: Phase I → II Storage Migration

**Before (Phase I): In-Memory Storage**

```python
# cli/todo.py (Phase I)
tasks: List[Dict] = []  # Global in-memory storage
next_id: int = 1

def add_task(title: str, description: str = "") -> None:
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
    if not tasks:
        print("No tasks found.")
        return
    for task in tasks:
        print(f"{task['id']}: {task['title']} [{task['status']}]")
```

**After (Phase II): SQLModel + FastAPI**

```python
# packages/backend/app/models/task.py (Phase II)
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel

class Task(SQLModel, table=True):
    """Task model with multi-tenant isolation."""
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)  # NEW: Multi-tenant
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: str = Field(default="pending", regex="^(pending|completed)$")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# packages/backend/app/api/tasks.py (Phase II)
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.deps import get_session, get_current_user
from app.models.task import Task
from app.models.user import User

router = APIRouter(prefix="/api/{user_id}/tasks")

@router.post("", status_code=201)
async def create_task(
    user_id: int,
    title: str,
    description: str = "",
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Create task with multi-tenant security."""
    if user_id != current_user.id:
        raise HTTPException(status_code=403)

    task = Task(
        user_id=current_user.id,
        title=title,
        description=description,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    return task

@router.get("")
async def list_tasks(
    user_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> list[Task]:
    """List tasks with multi-tenant filtering."""
    if user_id != current_user.id:
        raise HTTPException(status_code=403)

    query = select(Task).where(Task.user_id == current_user.id)
    tasks = session.exec(query).all()

    return tasks
```

**Git Diff**:
```diff
diff --git a/cli/todo.py b/packages/backend/app/models/task.py
new file mode 100644
index 0000000..1234567
--- /dev/null
+++ b/packages/backend/app/models/task.py
@@ -0,0 +1,18 @@
+from datetime import datetime
+from typing import Optional
+from sqlmodel import Field, SQLModel
+
+class Task(SQLModel, table=True):
+    __tablename__ = "tasks"
+
+    id: Optional[int] = Field(default=None, primary_key=True)
+    user_id: int = Field(foreign_key="users.id", index=True)
+    title: str = Field(min_length=1, max_length=500)
+    description: Optional[str] = Field(default=None, max_length=2000)
+    status: str = Field(default="pending", regex="^(pending|completed)$")
+    created_at: datetime = Field(default_factory=datetime.utcnow)

diff --git a/cli/todo.py b/packages/backend/app/api/tasks.py
new file mode 100644
--- /dev/null
+++ b/packages/backend/app/api/tasks.py
@@ -0,0 +1,35 @@
+from fastapi import APIRouter, Depends, HTTPException
+from sqlmodel import Session, select
+
+router = APIRouter(prefix="/api/{user_id}/tasks")
+
+@router.post("", status_code=201)
+async def create_task(...) -> Task:
+    if user_id != current_user.id:
+        raise HTTPException(status_code=403)
+    ...
```

**Migration Instructions**:
```bash
# Step 1: Install dependencies
cd packages/backend
poetry add fastapi sqlmodel alembic psycopg2-binary

# Step 2: Set up database
export DATABASE_URL="postgresql://user:pass@localhost/evolution_todo"

# Step 3: Create migration
alembic revision --autogenerate -m "Add tasks table"
alembic upgrade head

# Step 4: Migrate CLI data (if needed)
python scripts/migrate_cli_to_db.py

# Step 5: Start FastAPI server
uvicorn app.main:app --reload
```

---

#### Example 2: Phase II → III REST to MCP Migration

**Before (Phase II): Direct REST API Calls**

```typescript
// packages/frontend/lib/api.ts (Phase II)
export async function createTask(title: string, description: string) {
  const session = await auth();

  const res = await fetch(`${API_URL}/api/${session.user.id}/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description }),
  });

  if (!res.ok) throw new Error('Failed to create task');

  return res.json();
}
```

**After (Phase III): MCP Tool-Based**

```typescript
// packages/chatbot/mcp_server.ts (Phase III)
import { Anthropic, Tool } from '@anthropic-ai/sdk';

const ADD_TASK_TOOL: Tool = {
  name: 'add_task',
  description: 'Add a new task to the user\'s todo list',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Task title' },
      description: { type: 'string', description: 'Task description' },
    },
    required: ['title'],
  },
};

export async function executeAddTask(
  input: { title: string; description?: string },
  userId: number,
  accessToken: string
) {
  // Call FastAPI backend (same endpoint as Phase II)
  const res = await fetch(`${API_URL}/api/${userId}/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) throw new Error('Failed to create task');

  return res.json();
}

// ChatKit integration
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function chat(message: string, userId: number, accessToken: string) {
  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    tools: [ADD_TASK_TOOL, LIST_TASKS_TOOL, UPDATE_TASK_TOOL, DELETE_TASK_TOOL],
    messages: [{ role: 'user', content: message }],
  });

  // Handle tool calls
  for (const block of response.content) {
    if (block.type === 'tool_use') {
      if (block.name === 'add_task') {
        const result = await executeAddTask(block.input, userId, accessToken);
        return { toolCall: block, result };
      }
    }
  }

  return response;
}
```

**Git Diff**:
```diff
diff --git a/packages/frontend/lib/api.ts b/packages/chatbot/mcp_server.ts
--- a/packages/frontend/lib/api.ts
+++ b/packages/chatbot/mcp_server.ts
@@ -1,15 +1,40 @@
-export async function createTask(title: string, description: string) {
-  const session = await auth();
+import { Anthropic, Tool } from '@anthropic-ai/sdk';

-  const res = await fetch(`${API_URL}/api/${session.user.id}/tasks`, {
+const ADD_TASK_TOOL: Tool = {
+  name: 'add_task',
+  description: 'Add a new task to the user\'s todo list',
+  input_schema: {
+    type: 'object',
+    properties: {
+      title: { type: 'string' },
+      description: { type: 'string' },
+    },
+    required: ['title'],
+  },
+};
+
+export async function executeAddTask(
+  input: { title: string; description?: string },
+  userId: number,
+  accessToken: string
+) {
+  const res = await fetch(`${API_URL}/api/${userId}/tasks`, {
     method: 'POST',
-    headers: {
-      'Authorization': `Bearer ${session.accessToken}`,
-      'Content-Type': 'application/json',
-    },
-    body: JSON.stringify({ title, description }),
+    headers: { 'Authorization': `Bearer ${accessToken}` },
+    body: JSON.stringify(input),
   });

   return res.json();
 }
+
+export async function chat(message: string, userId: number, accessToken: string) {
+  const response = await client.messages.create({
+    model: 'claude-opus-4-5',
+    tools: [ADD_TASK_TOOL],
+    messages: [{ role: 'user', content: message }],
+  });
+
+  // Handle tool calls...
+}
```

**Migration Instructions**:
```bash
# Step 1: Install Anthropic SDK
cd packages/chatbot
npm install @anthropic-ai/sdk

# Step 2: Set up API key
export ANTHROPIC_API_KEY="sk-ant-..."

# Step 3: Keep existing FastAPI backend (no changes needed)
# MCP tools will call the same REST endpoints

# Step 4: Create ChatKit UI
cd packages/frontend
npm install @openai/chatkit

# Step 5: Test MCP tools
node packages/chatbot/test_mcp.js
```

---

#### Example 3: Next.js Pages Router → App Router

**Before (Phase II): Pages Router**

```tsx
// pages/tasks/index.tsx (Old)
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';

export default function TasksPage({ tasks }: { tasks: Task[] }) {
  const { data: session } = useSession();

  return (
    <div>
      <h1>My Tasks</h1>
      {tasks.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  const res = await fetch(`${API_URL}/api/${session.user.id}/tasks`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  const tasks = await res.json();

  return { props: { tasks } };
};
```

**After (Phase II): App Router with Server Components**

```tsx
// app/tasks/page.tsx (New)
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TaskGrid } from '@/components/TaskGrid';

async function getTasks(userId: number, accessToken: string) {
  const res = await fetch(`${process.env.API_URL}/api/${userId}/tasks`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store', // Always fresh data
  });

  if (res.status === 401) redirect('/login');

  return res.json();
}

export default async function TasksPage() {
  // Server Component - no useSession hook
  const session = await auth();

  if (!session) redirect('/login');

  const tasks = await getTasks(session.user.id, session.accessToken);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Tasks</h1>
      <TaskGrid tasks={tasks} />
    </div>
  );
}
```

**Git Diff**:
```diff
diff --git a/pages/tasks/index.tsx b/app/tasks/page.tsx
--- a/pages/tasks/index.tsx
+++ b/app/tasks/page.tsx
@@ -1,27 +1,25 @@
-import { GetServerSideProps } from 'next';
-import { useSession } from 'next-auth/react';
+import { auth } from '@/lib/auth';
+import { redirect } from 'next/navigation';

-export default function TasksPage({ tasks }: { tasks: Task[] }) {
-  const { data: session } = useSession();
+async function getTasks(userId: number, accessToken: string) {
+  const res = await fetch(`${process.env.API_URL}/api/${userId}/tasks`, {
+    headers: { Authorization: `Bearer ${accessToken}` },
+    cache: 'no-store',
+  });
+  return res.json();
+}

+export default async function TasksPage() {
+  const session = await auth();
+  if (!session) redirect('/login');
+
+  const tasks = await getTasks(session.user.id, session.accessToken);
+
   return (
-    <div>
-      <h1>My Tasks</h1>
-      {tasks.map(task => (
-        <div key={task.id}>{task.title}</div>
-      ))}
+    <div className="container mx-auto px-4 py-8">
+      <h1 className="text-3xl font-bold mb-6">My Tasks</h1>
+      <TaskGrid tasks={tasks} />
     </div>
   );
 }
-
-export const getServerSideProps: GetServerSideProps = async (context) => {
-  const session = await getSession(context);
-  const res = await fetch(`${API_URL}/api/${session.user.id}/tasks`);
-  const tasks = await res.json();
-  return { props: { tasks } };
-};
```

**Migration Instructions**:
```bash
# Step 1: Update Next.js to 16+
npm install next@16 react@19 react-dom@19

# Step 2: Create app/ directory
mkdir -p app/tasks

# Step 3: Move pages to app router
# pages/tasks/index.tsx → app/tasks/page.tsx
# pages/tasks/[id].tsx → app/tasks/[id]/page.tsx

# Step 4: Update imports
# next/router → next/navigation
# useRouter → useRouter (from next/navigation)
# GetServerSideProps → Server Components (async function)

# Step 5: Update auth
# useSession → await auth() (Server Component)

# Step 6: Remove pages/ directory after migration
rm -rf pages/

# Step 7: Update next.config.js
# Add experimental: { appDir: true } (if needed)
```

---

### Step 4: Update Tests

Maintain 80%+ coverage during refactoring.

**Before (Phase I): CLI Tests**
```python
# tests/test_cli.py
def test_add_task():
    add_task("Buy milk", "2 liters")
    assert len(tasks) == 1
    assert tasks[0]["title"] == "Buy milk"
```

**After (Phase II): API Tests**
```python
# packages/backend/tests/api/test_tasks.py
def test_create_task(client: TestClient):
    response = client.post(
        "/api/1/tasks",
        json={"title": "Buy milk", "description": "2 liters"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Buy milk"
    assert data["user_id"] == 1
```

---

### Step 5: Generate Migration Checklist

Provide step-by-step migration guide.

**Template**:
```markdown
## Migration Checklist: Phase [X] → Phase [Y]

### Pre-Migration

- [ ] Create backup of current code: `git tag phase-[X]-final`
- [ ] Backup production data (if applicable)
- [ ] Create migration branch: `git checkout -b phase-[Y]-migration`
- [ ] Review target specifications:
  - [ ] specs/phase-[Y]/spec.md
  - [ ] .claude/skills/architecture-specification/README.md (Phase [Y] diagram)
  - [ ] specs/api/ (if backend changes)
  - [ ] specs/ui/ (if frontend changes)

### Dependencies

- [ ] Update package managers:
  - [ ] Python: `poetry add [dependencies]`
  - [ ] Node.js: `npm install [dependencies]`
- [ ] Update configuration files:
  - [ ] pyproject.toml / package.json
  - [ ] .env.example with new variables

### Data Layer

- [ ] Create new models (SQLModel, Prisma, etc.)
- [ ] Generate migrations: `alembic revision --autogenerate`
- [ ] Test migrations on local database: `alembic upgrade head`
- [ ] Migrate existing data: `python scripts/migrate_phase_[X]_to_[Y].py`
- [ ] Verify data integrity: Check row counts, sample records

### API Layer

- [ ] Implement new endpoints/tools
- [ ] Update authentication/authorization
- [ ] Add input validation (Pydantic, Zod)
- [ ] Implement error handling
- [ ] Add structured logging

### UI Layer (if applicable)

- [ ] Migrate to new framework version
- [ ] Update routing (Pages → App Router)
- [ ] Refactor components to new patterns
- [ ] Apply accessibility improvements (ARIA, keyboard nav)
- [ ] Test responsive layouts

### Testing

- [ ] Update existing tests
- [ ] Add tests for new functionality
- [ ] Run full test suite: `pytest` / `npm test`
- [ ] Verify coverage: `pytest --cov` (target: 80%+)
- [ ] Manual testing checklist:
  - [ ] Happy path flows
  - [ ] Edge cases
  - [ ] Error scenarios
  - [ ] Multi-tenant security (backend)

### Deployment

- [ ] Update infrastructure config (Dockerfile, K8s manifests)
- [ ] Deploy to staging environment
- [ ] Run smoke tests in staging
- [ ] Monitor logs for errors
- [ ] Deploy to production
- [ ] Run post-deployment verification

### Post-Migration

- [ ] Remove deprecated code
- [ ] Update documentation (README.md, API docs)
- [ ] Create git tag: `git tag phase-[Y]-release`
- [ ] Announce migration completion to team
- [ ] Monitor production for 24 hours

### Rollback Plan (if issues occur)

- [ ] Revert git commit: `git revert [commit-hash]`
- [ ] Rollback database: `alembic downgrade -1`
- [ ] Restore from backup (if needed)
- [ ] Redeploy previous version
```

---

## Related Agents

All implementation agents use this skill:

- **Backend / FastAPI Pro Agent**: Refactors API endpoints, SQLModel models
- **Frontend UI/UX Agent**: Migrates Next.js Pages → App Router, React patterns
- **Console App Agent**: Evolves CLI to call REST API instead of in-memory
- **AI Chatbot Agent**: Refactors direct API calls to MCP tool execution
- **CloudOps & Kubernetes Agent**: Migrates local processes to containerized
- **Code Quality & Integration Agent**: Applies linting, type checking, standards
- **CI/CD Agent**: Updates pipelines for new deployment targets

---

## Success Metrics

The Code Refactoring Skill is successful when:

✅ **Spec Compliance**: Refactored code matches current phase specs exactly
✅ **No Functionality Loss**: All features work after refactoring
✅ **Tests Pass**: 80%+ coverage maintained, all tests green
✅ **No Breaking Changes**: Or clearly documented with migration paths
✅ **Standards Applied**: Type safety, error handling, logging improved
✅ **Documentation Updated**: README, API docs, comments reflect changes
✅ **Backward Compatible**: Or deprecation warnings provided
✅ **Rollback Possible**: Clear rollback instructions if issues occur

---

## Best Practices

### Do's ✅
- Analyze existing code against specs before refactoring
- Create feature branch for refactoring work
- Refactor in small, testable increments
- Run tests after each increment
- Generate git diffs showing before/after
- Provide migration instructions with exact commands
- Update tests alongside code changes
- Document breaking changes clearly
- Include rollback plan for critical changes
- Tag releases before and after migration

### Don'ts ❌
- Don't refactor without comparing to current specs
- Don't make breaking changes without migration guide
- Don't skip tests (coverage must stay 80%+)
- Don't remove deprecated code immediately (deprecate first)
- Don't refactor multiple phases at once (incremental migration)
- Don't forget to update dependencies
- Don't ignore type errors or linting warnings
- Don't deploy refactored code without staging tests

---

## Integration with Other Skills

### Workflow Integration

```
Specification (Spec Authoring)
  ↓
Phase Evolution (Architecture Specification - Phase diagrams)
  ↓
Current Code Analysis
  ↓
CODE REFACTORING (this skill) ← YOU ARE HERE
  ↓
Testing (verify no regressions)
  ↓
Code Review (Code Quality Agent)
  ↓
Deployment
```

### Skill Combinations

**Architecture Specification + Code Refactoring**:
```
1. Architecture Specification shows Phase I → II evolution diagram
2. Code Refactoring maps current CLI code to Phase II REST API
3. Generate migration steps and refactored code
```

**Code Generation + Code Refactoring**:
```
1. Code Generation creates Phase II boilerplate
2. Code Refactoring migrates Phase I data to Phase II structures
3. Preserve existing business logic while updating infrastructure
```

---

## Output Format

When using this skill, generate:

**1. Code Analysis** (current state, target state, gaps)
**2. Refactoring Strategy** (ordered migration steps)
**3. Refactored Code** (before/after with git diffs)
**4. Updated Tests** (maintain 80%+ coverage)
**5. Migration Checklist** (step-by-step with commands)
**6. Rollback Plan** (how to revert if issues)

Save outputs to:
- `docs/migrations/phase-[X]-to-[Y].md` - Migration documentation
- Feature branch: `phase-[Y]-migration` - Refactored code
- Git tags: `phase-[X]-final` and `phase-[Y]-release`

---

## References

- **Architecture Spec**: `.claude/skills/architecture-specification/README.md` (Phase evolution diagrams)
- **Code Generation**: `.claude/skills/code-generation/README.md` (Target code patterns)
- **API Spec**: `.claude/skills/api-database-specification/README.md` (REST → MCP migration)
- **UI Spec**: `.claude/skills/ui-specification/README.md` (Pages → App Router)
- **Constitution**: `.specify/memory/constitution.md` (Principle 3: Evolutionary Architecture)

---

**Document Version**: 1.0.0
**Created**: 2025-12-24
**Total Examples**: 3 (Phase I→II storage, Phase II→III MCP, Next.js Pages→App Router)
**Coverage**: All Phase Migrations (I→II, II→III, III→IV, IV→V)

---

*This code refactoring skill is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*
