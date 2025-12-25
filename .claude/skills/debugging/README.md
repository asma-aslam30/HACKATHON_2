# Debugging Skill

**Purpose**: Systematic debugging following Evolution of Todo architecture and phase specifications

**Owner**: All Implementation Agents + Testing & QA Agent + Code Quality Agent

**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

The **Debugging Skill** enables systematic troubleshooting across all system layers:
- Reproduce errors consistently
- Map errors to architectural layers (frontend, backend, database, infrastructure)
- Follow phase-specific debugging checklists
- Apply structured logging with trace IDs
- Generate spec-verified solutions
- Verify fixes with tests

This skill ensures bugs are fixed correctly according to specifications and Constitution principles.

---

## Skill Components

### 1. Error Reproduction

Create minimal reproducible test case.

**Steps**:
1. Identify exact inputs that trigger error
2. Note environment (dev/staging/production)
3. Capture full error message and stack trace
4. Document expected vs actual behavior
5. Create failing test case

**Template**:
```markdown
## Error Reproduction

**Error Message**: [Full error text]
**Stack Trace**: [Stack trace if available]
**Environment**: [dev/staging/production]
**User ID**: [If multi-tenant issue]
**Request**: [HTTP method, endpoint, body]
**Expected**: [What should happen]
**Actual**: [What actually happened]

### Minimal Reproduction

\`\`\`python
# Test case that reproduces the error
def test_reproduce_bug():
    response = client.post("/api/1/tasks", json={"title": "Test"})
    assert response.status_code == 201  # Fails with 500
\`\`\`
```

### 2. Layer Mapping

Map error to architectural layer per phase diagrams.

**Layer Identification**:
- **Frontend**: UI rendering, state management, API calls
- **Backend**: API endpoints, business logic, validation
- **Database**: Queries, migrations, connection issues
- **Infrastructure**: Docker, Kubernetes, networking
- **External APIs**: Claude, OpenAI, third-party services

**Decision Tree**:
```
Error occurs during:
├─ Page render? → Frontend layer
├─ API request? → Backend layer
├─ Database query? → Database layer
├─ Container startup? → Infrastructure layer
└─ External API call? → External APIs layer
```

### 3. Phase-Specific Debugging

Use phase-appropriate debugging checklist.

**Phase II: Web App (Next.js + FastAPI + PostgreSQL)**
- [ ] **JWT Authentication**: Is token valid? Check expiration, signature
- [ ] **CORS**: Is origin allowed? Check ALLOWED_ORIGINS
- [ ] **SQLModel Queries**: Is user_id filter applied? Check multi-tenant security
- [ ] **Database Connection**: Is Neon reachable? Check DATABASE_URL, SSL mode
- [ ] **Validation**: Are Pydantic schemas enforced? Check request body

**Phase III: AI Chatbot (ChatKit + MCP + Claude)**
- [ ] **MCP Tool Calls**: Does tool signature match spec? Check input_schema
- [ ] **Claude API**: Is API key valid? Check rate limits
- [ ] **Task Mutations**: Do MCP tools call correct backend endpoints?
- [ ] **NLU Intent**: Is Claude detecting correct intent? Check prompt engineering
- [ ] **Voice Input**: Is Whisper API working? Check audio format

**Phase IV: Kubernetes (Docker + Minikube + Helm)**
- [ ] **Service Discovery**: Can pods reach each other? Check DNS
- [ ] **ConfigMaps/Secrets**: Are env vars injected? Check pod logs
- [ ] **Health Checks**: Are liveness/readiness probes passing? Check /health endpoint
- [ ] **Resource Limits**: Are pods OOMKilled? Check memory limits
- [ ] **Networking**: Is Ingress routing correctly? Check ingress rules

### 4. Structured Logging

Implement JSON logging with trace ID propagation.

**Log Format**:
```json
{
  "timestamp": "2025-12-24T10:30:00Z",
  "level": "ERROR",
  "trace_id": "abc123def456",
  "user_id": 42,
  "endpoint": "/api/42/tasks",
  "method": "POST",
  "status_code": 500,
  "error_type": "IntegrityError",
  "error_message": "duplicate key value violates unique constraint",
  "stack_trace": "...",
  "context": {
    "task_id": 5,
    "title": "Buy milk"
  }
}
```

**Trace ID Propagation**:
```python
# Backend middleware
import uuid

@app.middleware("http")
async def add_trace_id(request: Request, call_next):
    trace_id = request.headers.get("X-Trace-ID") or str(uuid.uuid4())
    request.state.trace_id = trace_id

    response = await call_next(request)
    response.headers["X-Trace-ID"] = trace_id

    return response

# Usage in route
@router.post("/api/{user_id}/tasks")
async def create_task(request: Request, ...):
    logger.info(
        "Creating task",
        extra={"trace_id": request.state.trace_id, "user_id": user_id}
    )
```

### 5. Root Cause Analysis

Identify underlying cause, not symptoms.

**5 Whys Technique**:
```
Error: "Task not found"
Why? → SELECT query returned no rows
Why? → user_id filter didn't match
Why? → JWT token had user_id=1, path param had user_id=2
Why? → Frontend sent wrong user_id in API call
Why? → Frontend used hardcoded user_id instead of session.user.id
Root Cause: Frontend bug (hardcoded user ID)
```

**Checklist**:
- [ ] Is this a symptom or root cause?
- [ ] Can I reproduce it consistently?
- [ ] Does it violate a spec requirement?
- [ ] Is it a regression (worked before)?
- [ ] Does it affect multiple users/environments?

### 6. Solution Generation

Create spec-verified fix with tests.

**Template**:
```markdown
## Solution

**Root Cause**: [Brief description]
**Spec Reference**: [Which spec this violates]
**Layer**: [Frontend/Backend/Database/Infrastructure]

### Fix

\`\`\`diff
--- a/packages/frontend/lib/api.ts
+++ b/packages/frontend/lib/api.ts
@@ -10,7 +10,8 @@
-  const userId = 1;  // Bug: hardcoded
+  const session = await auth();
+  const userId = session.user.id;  // Fix: get from session
\`\`\`

### Test Verification

\`\`\`python
def test_task_creation_uses_correct_user_id():
    # Login as user 1
    session1 = auth_as_user(1)
    response1 = client.post("/api/1/tasks",
        headers={"Authorization": f"Bearer {session1.access_token}"},
        json={"title": "Task 1"}
    )
    assert response1.status_code == 201

    # Login as user 2, try to access user 1's endpoint (should fail)
    session2 = auth_as_user(2)
    response2 = client.post("/api/1/tasks",  # Wrong user_id
        headers={"Authorization": f"Bearer {session2.access_token}"},
        json={"title": "Task 2"}
    )
    assert response2.status_code == 403  # Forbidden
\`\`\`

### Verification Steps

- [x] Reproduce error with failing test
- [x] Apply fix
- [x] Test passes
- [x] No regressions (full test suite passes)
- [x] Deploy to staging, verify in production-like environment
```

---

## Skill Instructions

### Step 1: Reproduce Error

Create minimal failing test case.

**Example (Phase II: Backend)**:
```python
# tests/api/test_tasks_bug.py

def test_create_task_multi_tenant_security():
    """Reproduce bug: user can create tasks for other users."""

    # Login as user 1
    user1_token = get_jwt_token(user_id=1)

    # Try to create task for user 2 (should fail)
    response = client.post(
        "/api/2/tasks",  # user_id=2 in path
        headers={"Authorization": f"Bearer {user1_token}"},  # JWT has user_id=1
        json={"title": "Malicious task"}
    )

    # Expected: 403 Forbidden
    # Actual: 201 Created (BUG!)
    assert response.status_code == 403
```

---

### Step 2: Map to Layer

Identify which architectural layer has the bug.

**Example Analysis**:
```markdown
## Layer Mapping

**Error**: User can create tasks for other users (security vulnerability)

**Layer Analysis**:
- Frontend? ❌ Not a UI issue
- Backend? ✅ API endpoint allows unauthorized access
- Database? ❌ Query is fine, authorization is the problem
- Infrastructure? ❌ Not a deployment issue

**Layer**: Backend (FastAPI router)
**Spec Reference**: specs/api/rest-endpoints.md (multi-tenant security requirement)
```

---

### Step 3: Apply Phase-Specific Checklist

**Phase II Debugging Checklist**:

```markdown
## Phase II: Web App Debugging

**Error**: 403 Forbidden on task creation

### JWT Authentication
- [x] Is token present? Yes
- [x] Is token valid? Yes (not expired, correct signature)
- [x] Does token contain user_id? Yes (user_id=1 in payload)

### CORS
- [x] Is origin allowed? Yes (localhost:3000 in ALLOWED_ORIGINS)

### Multi-Tenant Security
- [ ] Is user_id from JWT compared to path param? **NO - BUG HERE**
- [ ] Is SQLModel query filtered by user_id? Not reached due to above

### Database Connection
- [x] Is Neon reachable? Yes (health check passes)

### Validation
- [x] Is request body valid? Yes (Pydantic validation passed)

**Root Cause Identified**: Missing JWT user_id validation in route
```

---

### Step 4: Implement Structured Logging

Add logging to trace execution.

**Before (No Logging)**:
```python
@router.post("/api/{user_id}/tasks")
async def create_task(user_id: int, ...):
    task = Task(user_id=user_id, ...)  # Bug: uses path param, not JWT
    session.add(task)
    session.commit()
    return task
```

**After (With Logging)**:
```python
import logging
import structlog

logger = structlog.get_logger()

@router.post("/api/{user_id}/tasks")
async def create_task(
    user_id: int,
    current_user: User = Depends(get_current_user),
    request: Request,
    ...
):
    trace_id = request.state.trace_id

    logger.info(
        "create_task_start",
        trace_id=trace_id,
        path_user_id=user_id,
        jwt_user_id=current_user.id,
        endpoint="/api/{user_id}/tasks",
    )

    # CRITICAL: Multi-tenant security check
    if user_id != current_user.id:
        logger.warning(
            "create_task_unauthorized",
            trace_id=trace_id,
            path_user_id=user_id,
            jwt_user_id=current_user.id,
            reason="user_id mismatch",
        )
        raise HTTPException(status_code=403, detail="Cannot create tasks for other users")

    task = Task(user_id=current_user.id, ...)  # Fix: use JWT user_id
    session.add(task)
    session.commit()

    logger.info(
        "create_task_success",
        trace_id=trace_id,
        task_id=task.id,
        user_id=current_user.id,
    )

    return task
```

**Log Output**:
```json
{
  "timestamp": "2025-12-24T10:30:00Z",
  "level": "WARNING",
  "event": "create_task_unauthorized",
  "trace_id": "abc123",
  "path_user_id": 2,
  "jwt_user_id": 1,
  "reason": "user_id mismatch"
}
```

---

### Step 5: Perform Root Cause Analysis

Use 5 Whys technique.

**Example 1: "Task not found" Error**

```markdown
## 5 Whys Analysis

**Error**: GET /api/1/tasks/5 returns 404 "Task not found"

1. **Why?** SQLModel query returned None
   ```python
   task = session.get(Task, 5)  # Returns None
   ```

2. **Why?** task_id=5 doesn't exist in database for user_id=1
   ```sql
   SELECT * FROM tasks WHERE id = 5 AND user_id = 1;  -- No rows
   ```

3. **Why?** Task 5 belongs to user_id=2, not user_id=1
   ```sql
   SELECT * FROM tasks WHERE id = 5;  -- EXISTS, but user_id=2
   ```

4. **Why?** Multi-tenant filter in SQLModel query worked correctly
   ```python
   if not task or task.user_id != current_user.id:
       raise HTTPException(404)  # Correct behavior!
   ```

5. **Why was error reported?** User mistakenly tried to access another user's task

**Root Cause**: Not a bug - working as intended (multi-tenant security)
**Resolution**: Return 404 (correct), update error message for clarity
```

**Example 2: MCP Tool Call Failure**

```markdown
## 5 Whys Analysis

**Error**: MCP tool call failed: "add_task() missing 1 required positional argument: 'user_id'"

1. **Why?** MCP tool didn't provide user_id parameter
   ```python
   # MCP tool call
   add_task(title="Buy milk", description="2 liters")  # Missing user_id
   ```

2. **Why?** MCP tool input_schema doesn't include user_id
   ```python
   Tool(
       name="add_task",
       input_schema={
           "properties": {
               "title": {"type": "string"},
               "description": {"type": "string"},
           },
           "required": ["title"],
       },
   )
   ```

3. **Why?** user_id should come from JWT, not tool parameters
   ```python
   # Correct: MCP server extracts user_id from session
   async def execute_add_task(input, user_id: int, access_token: str):
       response = await client.post(
           f"/api/{user_id}/tasks",  # user_id from session, not input
           json=input,
       )
   ```

4. **Why wasn't JWT available?** MCP server wasn't receiving access_token
   ```python
   # Bug: MCP server not getting token from ChatKit session
   execute_add_task(input)  # Missing user_id and access_token
   ```

5. **Why?** ChatKit integration missing session context

**Root Cause**: MCP server not receiving ChatKit session context
**Fix**: Pass session.accessToken to MCP tool execution
```

---

### Step 6: Generate Spec-Verified Solution

Create fix that matches specifications.

**Solution Template**:
```markdown
## Spec-Verified Solution

### Spec Reference

**Document**: specs/api/rest-endpoints.md
**Section**: POST /api/{user_id}/tasks
**Requirement**:
> "Multi-tenant security: user_id from JWT must match user_id in path.
> Return 403 Forbidden if mismatch."

### Current Implementation (Bug)

\`\`\`python
@router.post("/api/{user_id}/tasks")
async def create_task(user_id: int, task_data: TaskCreate):
    # Bug: No JWT validation, anyone can create tasks for any user
    task = Task(user_id=user_id, **task_data.dict())
    session.add(task)
    return task
\`\`\`

### Fixed Implementation

\`\`\`python
@router.post("/api/{user_id}/tasks")
async def create_task(
    user_id: int,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),  # Add JWT validation
    session: Session = Depends(get_session),
):
    # CRITICAL: Multi-tenant security check per spec
    if user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Cannot create tasks for other users"
        )

    # Use current_user.id from JWT, not path param
    task = Task(user_id=current_user.id, **task_data.dict())
    session.add(task)
    session.commit()
    session.refresh(task)

    return task
\`\`\`

### Test Verification

\`\`\`python
def test_multi_tenant_security_enforcement():
    """Verify users can only create tasks for themselves."""

    # User 1 creates task for themselves (should succeed)
    user1_token = get_jwt_token(user_id=1)
    response1 = client.post(
        "/api/1/tasks",
        headers={"Authorization": f"Bearer {user1_token}"},
        json={"title": "My task"}
    )
    assert response1.status_code == 201

    # User 1 tries to create task for user 2 (should fail)
    response2 = client.post(
        "/api/2/tasks",  # Different user_id
        headers={"Authorization": f"Bearer {user1_token}"},
        json={"title": "Malicious task"}
    )
    assert response2.status_code == 403
    assert "Cannot create tasks for other users" in response2.json()["detail"]
\`\`\`

### Verification Checklist

- [x] Spec requirement implemented exactly
- [x] Test case reproduces original bug
- [x] Test case passes after fix
- [x] Full test suite passes (no regressions)
- [x] Logging added for traceability
- [x] Security review (multi-tenant check)
```

---

## Common Debugging Scenarios

### Scenario 1: CORS Error

**Error**: `Access to fetch at 'http://localhost:8000/api/1/tasks' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Debug Checklist**:
- [ ] Is origin in ALLOWED_ORIGINS env var?
- [ ] Is CORS middleware configured in FastAPI?
- [ ] Are credentials (cookies/auth headers) being sent?
- [ ] Is `allow_credentials=True` in CORS config?

**Solution**:
```python
# packages/backend/app/main.py

# Check environment variable
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
print(f"ALLOWED_ORIGINS: {ALLOWED_ORIGINS}")  # Debug output

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,  # Required for JWT in Authorization header
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Scenario 2: Database Connection Failure

**Error**: `sqlalchemy.exc.OperationalError: could not connect to server: Connection refused`

**Debug Checklist**:
- [ ] Is DATABASE_URL correct?
- [ ] Is PostgreSQL running? (`docker-compose ps postgres`)
- [ ] Is SSL mode correct for Neon? (`?sslmode=require`)
- [ ] Are firewall rules blocking connection?
- [ ] Is connection pool exhausted?

**Solution**:
```python
# Test connection
from sqlmodel import create_engine, text, Session

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Connecting to: {DATABASE_URL}")

engine = create_engine(DATABASE_URL, echo=True)  # Enable SQL logging

try:
    with Session(engine) as session:
        result = session.exec(text("SELECT 1")).one()
        print(f"✓ Database connection successful: {result}")
except Exception as e:
    print(f"✗ Database connection failed: {e}")
    # Check common issues
    if "Connection refused" in str(e):
        print("→ Is PostgreSQL running? Try: docker-compose up postgres")
    elif "SSL" in str(e):
        print("→ Add ?sslmode=require to DATABASE_URL for Neon")
```

---

### Scenario 3: JWT Token Expired

**Error**: `401 Unauthorized: Token has expired`

**Debug Checklist**:
- [ ] Is token expiration time reasonable? (default: 1 hour)
- [ ] Is frontend refreshing tokens before expiry?
- [ ] Is system time in sync? (clock skew)
- [ ] Is JWT_SECRET same across services?

**Solution**:
```python
# packages/backend/app/core/auth.py

from jose import jwt, JWTError
from datetime import datetime, timedelta

def create_access_token(user_id: int) -> str:
    """Create JWT with expiration."""
    expiration = datetime.utcnow() + timedelta(seconds=3600)  # 1 hour

    payload = {
        "sub": user_id,
        "exp": expiration,
        "iat": datetime.utcnow(),  # Issued at
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

def decode_token(token: str) -> dict:
    """Decode JWT and check expiration."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        # Check expiration manually for better error messages
        exp = datetime.fromtimestamp(payload["exp"])
        now = datetime.utcnow()

        if now > exp:
            raise HTTPException(
                status_code=401,
                detail=f"Token expired {(now - exp).seconds} seconds ago"
            )

        return payload

    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
```

---

### Scenario 4: MCP Tool Call Signature Mismatch

**Error**: `TypeError: add_task() got an unexpected keyword argument 'priority_level'`

**Debug Checklist**:
- [ ] Does MCP tool input_schema match backend API?
- [ ] Are parameter names identical? (case-sensitive)
- [ ] Are required vs optional parameters correct?
- [ ] Is Pydantic schema validation passing?

**Solution**:
```python
# Compare MCP tool schema with backend API

# MCP Tool (packages/chatbot/mcp_server.py)
Tool(
    name="add_task",
    input_schema={
        "properties": {
            "title": {"type": "string"},
            "description": {"type": "string"},
            "priority": {"type": "string", "enum": ["high", "medium", "low"]},  # Correct name
        },
        "required": ["title"],
    },
)

# Backend API (packages/backend/app/schemas/task.py)
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = Field(None, regex="^(high|medium|low)$")  # Matches MCP

# Fix: Ensure parameter names match exactly
```

---

## Related Agents

All agents use this skill:

- **Backend / FastAPI Pro Agent**: Debugs API endpoints, SQLModel queries
- **Frontend UI/UX Agent**: Debugs React components, API calls, state management
- **AI Chatbot Agent**: Debugs MCP tool calls, Claude API integration
- **CloudOps & Kubernetes Agent**: Debugs container issues, service discovery
- **Testing & QA Agent**: Creates failing tests to reproduce bugs
- **Code Quality & Integration Agent**: Identifies code smells that cause bugs

---

## Success Metrics

The Debugging Skill is successful when:

✅ **Error Reproduced**: Minimal failing test case created
✅ **Layer Identified**: Bug mapped to correct architectural layer
✅ **Root Cause Found**: Not just symptoms, but underlying cause
✅ **Spec-Verified Fix**: Solution matches specification requirements
✅ **Tests Pass**: Failing test now passes, no regressions
✅ **Logging Added**: Structured logs for future debugging
✅ **Documentation Updated**: Fix documented in comments and docs

---

## Best Practices

### Do's ✅
- Create failing test before fixing bug
- Map error to architectural layer per phase diagram
- Use structured logging with trace IDs
- Perform root cause analysis (5 Whys)
- Verify fix matches specification requirements
- Add regression test to prevent recurrence
- Document fix in code comments and changelog

### Don'ts ❌
- Don't fix symptoms without finding root cause
- Don't skip test creation (how will you verify fix?)
- Don't deploy without testing in staging
- Don't ignore logging (future debugging depends on it)
- Don't make untested assumptions about what's broken
- Don't skip spec verification (fix might introduce new bugs)

---

## Integration with Other Skills

### Workflow Integration

```
Bug Report
  ↓
Error Reproduction (failing test)
  ↓
Layer Mapping (architecture diagram)
  ↓
DEBUGGING (this skill) ← YOU ARE HERE
  ↓
Root Cause Analysis (5 Whys)
  ↓
Spec-Verified Solution (Code Generation/Refactoring)
  ↓
Test Verification (Testing & QA)
  ↓
Deployment (CI/CD)
```

### Skill Combinations

**Debugging + Code Generation**:
```
1. Debugging identifies missing validation
2. Code Generation creates validator per spec
3. Tests verify fix
```

**Debugging + Integration Wiring**:
```
1. Debugging finds CORS misconfiguration
2. Integration Wiring regenerates CORS config
3. Verify cross-origin requests work
```

---

## Output Format

When using this skill, generate:

**1. Error Reproduction** (failing test case)
**2. Layer Mapping** (which architectural layer)
**3. Debug Checklist** (phase-specific checks)
**4. Structured Logging** (JSON logs with trace IDs)
**5. Root Cause Analysis** (5 Whys)
**6. Spec-Verified Solution** (code fix + tests)
**7. Verification** (proof fix works)

---

## References

- **Architecture Spec**: `.claude/skills/architecture-specification/README.md` (Layer diagrams)
- **API Spec**: `.claude/skills/api-database-specification/README.md` (Endpoint requirements)
- **Integration Wiring**: `.claude/skills/integration-wiring/README.md` (Connection debugging)
- **Constitution**: `.specify/memory/constitution.md` (Principle 6: Observability)

---

**Document Version**: 1.0.0
**Created**: 2025-12-24
**Total Examples**: 4 complete debugging scenarios (CORS, Database, JWT, MCP tools)
**Coverage**: All 5 Phases (I-V)

---

*This debugging skill is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*
