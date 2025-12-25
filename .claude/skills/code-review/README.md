# Code Review Skill

**Purpose**: Perform spec-compliant code reviews for Evolution of Todo hackathon contributions with security, performance, and phase compliance audits

**Owner**: Code Quality Agent + All Implementation Agents

**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

The **Code Review Skill** enables systematic code review following Spec-Driven Development principles:
- Audit code against specifications (API, database, UI, architecture)
- Verify phase compliance (correct tech stack and patterns)
- Check security requirements (multi-tenant isolation, input validation, JWT auth)
- Review performance characteristics (database queries, N+1 problems, caching)
- Enforce Constitution principles (testability, observability, maintainability)
- Generate structured review reports with APPROVE/CHANGES_REQUESTED/BLOCK verdict

This skill ensures all code contributions meet quality standards before merging to main branch.

---

## Skill Components

### 1. Spec Compliance Checklist

Audit code against all relevant specifications:

**API Specification Audit** (`.claude/skills/api-database-specification/README.md`):
- [ ] REST endpoints match method, route, and parameters from spec
- [ ] Request schemas match Pydantic/Zod models from spec
- [ ] Response schemas include all required fields with correct types
- [ ] HTTP status codes match spec (200, 201, 204, 400, 401, 403, 404, 422, 500)
- [ ] Error messages match user-friendly messages from spec
- [ ] MCP tool signatures match input_schema definitions (Phase III)

**Database Specification Audit** (`.claude/skills/api-database-specification/README.md`):
- [ ] SQLModel models match table schema from spec
- [ ] Relationships (foreign keys) correctly defined
- [ ] Constraints (NOT NULL, UNIQUE, CHECK) implemented
- [ ] Indexes created for user_id and frequently queried columns
- [ ] Alembic migrations generated and tested
- [ ] Cascade delete rules match spec

**UI Specification Audit** (`.claude/skills/ui-specification/README.md`):
- [ ] Next.js pages follow layout from wireframes
- [ ] Component props match interface definitions
- [ ] Tailwind classes follow design system
- [ ] Accessibility attributes present (WCAG 2.1 AA)
- [ ] Responsive breakpoints implemented (mobile, tablet, desktop)
- [ ] Dark mode support included
- [ ] ChatKit conversational flows match spec (Phase III)

**Architecture Specification Audit** (`.claude/skills/architecture-specification/README.md`):
- [ ] Files in correct monorepo locations (`packages/backend/`, `packages/frontend/`)
- [ ] Module imports follow dependency rules (no circular dependencies)
- [ ] Directory structure matches phase architecture
- [ ] Configuration files present (.env.example, docker-compose.yml)

### 2. Phase Compliance Review

Verify code uses correct technology stack for phase:

**Phase I (CLI)**:
- [ ] Python 3.13+ with type hints
- [ ] argparse or click for CLI parsing
- [ ] In-memory storage (global variables or class attributes)
- [ ] No database or web framework dependencies

**Phase II (Backend)**:
- [ ] FastAPI with async/await patterns
- [ ] SQLModel for ORM and schema validation
- [ ] Better Auth for JWT authentication
- [ ] Alembic for database migrations
- [ ] PostgreSQL database connection
- [ ] Structured logging (JSON format)

**Phase II (Frontend)**:
- [ ] Next.js 15+ with App Router
- [ ] Server Components for data fetching
- [ ] Client Components for interactivity
- [ ] Tailwind CSS v4 for styling
- [ ] Better Auth client for authentication
- [ ] Fetch API with JWT bearer tokens

**Phase III (Chatbot)**:
- [ ] ChatKit for conversational UI
- [ ] MCP tool server implementation
- [ ] Claude Agents SDK integration
- [ ] Tool call handlers for backend API
- [ ] Error handling for tool failures

**Phase IV (Kubernetes)**:
- [ ] Dockerfiles with multi-stage builds
- [ ] Kubernetes manifests (Deployment, Service, ConfigMap)
- [ ] Health check endpoints (/health, /ready)
- [ ] Resource limits and requests defined
- [ ] Horizontal Pod Autoscaler configured

**Phase V (Cloud)**:
- [ ] GitHub Actions workflows for CI/CD
- [ ] Kafka producers/consumers (if streaming)
- [ ] Dapr components (if microservices)
- [ ] Cloud provider configurations (AWS/GCP/Azure)

### 3. Security Review

**CRITICAL**: Multi-tenant isolation and security checks:

**Authentication & Authorization**:
- [ ] JWT middleware applied to protected endpoints
- [ ] Access tokens validated on every request
- [ ] Refresh tokens handled securely
- [ ] User ID extracted from JWT, not path parameters
- [ ] Session management follows Better Auth patterns

**Multi-Tenant Isolation** (CRITICAL for hackathon):
- [ ] All database queries filtered by `user_id`
- [ ] User ID from JWT (`current_user.id`), NOT from path
- [ ] Path `user_id` validated against JWT `user_id` (403 if mismatch)
- [ ] 404 (not 403) returned when task not found or belongs to other user
- [ ] No ability to access other users' data

**Input Validation**:
- [ ] Request body validated with Pydantic schemas
- [ ] Path parameters validated (integer IDs, enum values)
- [ ] Query parameters validated with regex patterns
- [ ] File uploads validated (size, type, content)
- [ ] SQL injection prevented (SQLModel parameterized queries)
- [ ] XSS prevented (React escapes output by default, verify no `dangerouslySetInnerHTML`)

**Secrets Management**:
- [ ] No hardcoded secrets in code
- [ ] Environment variables for all secrets (DATABASE_URL, JWT_SECRET, API_KEY)
- [ ] .env.example provided with placeholder values
- [ ] Secrets not logged or exposed in error messages

### 4. Performance Review

**Database Optimization**:
- [ ] Indexes created for foreign keys and frequently queried columns
- [ ] N+1 query problem avoided (use `selectinload` for relationships)
- [ ] Pagination implemented for list endpoints (limit/offset)
- [ ] Database connection pooling configured
- [ ] Queries use `.where()` filters before `.all()` (not filter in Python)

**API Performance**:
- [ ] Response time < 200ms for p95 (no blocking operations)
- [ ] Async/await used for I/O operations
- [ ] Background tasks for long-running operations
- [ ] Caching headers set for static content
- [ ] Compression enabled (gzip)

**Frontend Performance**:
- [ ] Server Components used for data fetching (no client-side fetching for initial render)
- [ ] Images optimized (Next.js Image component)
- [ ] Code splitting enabled (dynamic imports for large components)
- [ ] CSS purged (Tailwind removes unused classes)
- [ ] Fonts loaded efficiently (next/font)

### 5. Code Quality Review

**Constitution Compliance** (`.specify/memory/constitution.md`):
- [ ] **Spec-First**: Code matches specification (not extra features)
- [ ] **Type Safety**: Full type hints (Python mypy strict, TypeScript strict)
- [ ] **Error Handling**: Try/catch blocks with user-friendly messages
- [ ] **Testing**: Unit and integration tests with 80%+ coverage
- [ ] **Observability**: Structured logging with correlation IDs
- [ ] **Security**: Input validation, multi-tenant isolation, JWT auth
- [ ] **Simplicity**: No over-engineering, clear variable names
- [ ] **Documentation**: Docstrings, JSDoc, README files

**Code Standards**:
- [ ] Functions < 50 lines (extract complex logic to helpers)
- [ ] Classes follow Single Responsibility Principle
- [ ] No duplicate code (DRY principle)
- [ ] Descriptive variable names (not `x`, `tmp`, `data`)
- [ ] Comments explain "why", not "what"
- [ ] No commented-out code (use git history)
- [ ] Consistent formatting (Black for Python, Prettier for TypeScript)

---

## Skill Instructions

### Step 1: Gather Review Context

Collect all information needed for review.

**Template**:
```markdown
## Code Review Context

**Feature**: [Feature name]
**Phase**: [I, II, III, IV, or V]
**Pull Request**: [PR number and title]
**Author**: [GitHub username]

### Files Changed
- [List all modified files with line counts]

### Related Specifications
- Architecture: [Path to architecture spec]
- API: [Path to REST/MCP spec]
- Database: [Path to schema spec]
- UI: [Path to UI spec]

### Test Coverage
- Unit tests: [X% coverage]
- Integration tests: [Y% coverage]
- E2E tests: [Pass/Fail status]
```

**Example**:
```markdown
## Code Review Context

**Feature**: Task CRUD Operations
**Phase**: II (Web App with Backend)
**Pull Request**: #42 - Implement FastAPI Task endpoints with SQLModel
**Author**: @backend-dev

### Files Changed
- packages/backend/app/api/tasks.py (+300 lines)
- packages/backend/app/models/task.py (+50 lines)
- packages/backend/app/schemas/task.py (+40 lines)
- packages/backend/tests/api/test_tasks.py (+200 lines)

### Related Specifications
- Architecture: .claude/skills/architecture-specification/README.md
- API: specs/api/rest-endpoints.md (Task CRUD endpoints)
- Database: specs/database/schema.md (Task model)
- UI: N/A (backend only)

### Test Coverage
- Unit tests: 92% coverage
- Integration tests: 88% coverage (20 tests, all passing)
- E2E tests: Not applicable for backend
```

---

### Step 2: Perform Spec Compliance Audit

Check each file against specifications.

**Template**:
```markdown
## Spec Compliance Audit

### ✅ Passes Spec Requirements
- [List specific requirements that are correctly implemented]

### ❌ Spec Violations
- [List deviations from specifications with file:line references]

### ⚠️ Spec Ambiguities
- [List areas where spec is unclear and assumptions were made]
```

**Example**:
```markdown
## Spec Compliance Audit

### ✅ Passes Spec Requirements
- REST endpoints match spec (GET/POST/PATCH/DELETE at correct routes)
- Request schemas (TaskCreate) match spec (title, description, priority)
- Response schemas (TaskResponse) include all required fields
- HTTP status codes correct (201 for POST, 204 for DELETE, 404 for not found)
- SQLModel Task model matches database schema (all columns present)
- Foreign key relationship to User model correctly defined
- Multi-tenant isolation implemented (user_id filter in all queries)

### ❌ Spec Violations
1. **Missing priority filter in list endpoint** (packages/backend/app/api/tasks.py:45)
   - Spec requires: GET /api/{user_id}/tasks?priority=high
   - Implementation: Missing priority query parameter
   - Impact: Users cannot filter tasks by priority
   - Fix: Add `priority: Optional[str] = Query(None)` parameter

2. **Error message doesn't match spec** (packages/backend/app/api/tasks.py:78)
   - Spec requires: "Task not found - ID must exist"
   - Implementation: "Task not found"
   - Impact: Less helpful error message
   - Fix: Update detail message to match spec

3. **Missing description max length validation** (packages/backend/app/models/task.py:15)
   - Spec requires: Description max 2000 characters
   - Implementation: No max_length constraint
   - Impact: Database could store oversized descriptions
   - Fix: Add `max_length=2000` to Field definition

### ⚠️ Spec Ambiguities
- Spec doesn't specify default sort order for list endpoint
- Assumed: Sort by created_at DESC (newest first)
- Recommendation: Clarify in spec or add query parameter for sort order
```

---

### Step 3: Security & Performance Review

Check critical security and performance requirements.

**Template**:
```markdown
## Security Review

### ✅ Security Passes
- [List security requirements that are correctly implemented]

### 🚨 Security Issues (BLOCKING)
- [List critical security vulnerabilities that must be fixed]

### ⚠️ Security Warnings (CHANGES REQUESTED)
- [List security concerns that should be addressed]

## Performance Review

### ✅ Performance Passes
- [List performance optimizations correctly implemented]

### ⚠️ Performance Concerns
- [List potential performance issues with recommendations]
```

**Example**:
```markdown
## Security Review

### ✅ Security Passes
- JWT middleware applied to all protected endpoints
- User ID extracted from JWT token (not path parameter)
- Path user_id validated against current_user.id (403 if mismatch)
- All database queries filtered by user_id (multi-tenant isolation)
- 404 returned for non-existent or other user's tasks (not 403)
- Request body validated with Pydantic schemas
- No secrets hardcoded (all in environment variables)

### 🚨 Security Issues (BLOCKING)
**None** - All critical security requirements met

### ⚠️ Security Warnings (CHANGES REQUESTED)
1. **Missing rate limiting** (packages/backend/app/api/tasks.py)
   - Risk: User could spam create endpoint with thousands of tasks
   - Recommendation: Add rate limiting (e.g., 100 requests/minute per user)
   - Implementation: Use slowapi or FastAPI-Limiter

2. **Correlation ID not propagated** (packages/backend/app/api/tasks.py)
   - Risk: Difficult to trace requests across logs
   - Recommendation: Add correlation_id to logger context
   - Implementation: Add middleware to extract/generate correlation_id from headers

## Performance Review

### ✅ Performance Passes
- Async/await used for all database operations
- Index created on user_id column for fast filtering
- Pagination not needed (users have < 1000 tasks typically)
- SQLModel uses parameterized queries (no string concatenation)

### ⚠️ Performance Concerns
1. **Potential N+1 query problem** (packages/backend/app/api/tasks.py:120)
   - Location: Accessing `task.user.email` in loop
   - Impact: Triggers separate query for each task's user relationship
   - Recommendation: Use `selectinload(Task.user)` if user data needed
   - Workaround: Current code doesn't access user relationship, so no issue yet

2. **No database connection pooling configured** (packages/backend/app/core/database.py)
   - Impact: New connection created for each request (slower)
   - Recommendation: Configure pool_size and max_overflow in create_engine
   - Example: `create_engine(url, pool_size=20, max_overflow=10)`
```

---

### Step 4: Code Quality Review

Review code style, testing, and maintainability.

**Template**:
```markdown
## Code Quality Review

### ✅ Quality Passes
- [List code quality standards that are met]

### ⚠️ Quality Concerns
- [List code quality issues with recommendations]

### 📊 Test Coverage
- Unit tests: [X%]
- Integration tests: [Y%]
- Coverage report: [Link or summary]
```

**Example**:
```markdown
## Code Quality Review

### ✅ Quality Passes
- Full type hints on all functions (mypy strict mode compatible)
- Comprehensive error handling with user-friendly messages
- Structured logging with logger.info/warning/error
- Docstrings present on all public functions
- Functions under 50 lines (good separation of concerns)
- No duplicate code (DRY principle followed)
- Consistent formatting (Black applied)
- Tests organized with fixtures for setup

### ⚠️ Quality Concerns
1. **Magic numbers in code** (packages/backend/app/api/tasks.py:85)
   - Issue: Hard-coded limit of 100 in query
   - Recommendation: Extract to constant `MAX_TASKS_PER_PAGE = 100`
   - Location: Move to app/core/config.py

2. **Generic exception catching** (packages/backend/app/api/tasks.py:150)
   - Issue: `except Exception:` catches all exceptions (too broad)
   - Recommendation: Catch specific exceptions (IntegrityError, ValueError)
   - Impact: Harder to debug unexpected errors

3. **Missing integration between components** (packages/backend/app/api/tasks.py)
   - Issue: Task creation doesn't trigger any events
   - Recommendation: Consider adding event hooks for future Phase V (Kafka)
   - Future work: Add event emitter interface (not blocking)

### 📊 Test Coverage
- **Unit tests**: 92% coverage (46/50 lines covered)
  - Missing: Error path when database connection fails
  - Missing: Edge case with very long titles (499 chars)

- **Integration tests**: 88% coverage (20 tests, all passing)
  - ✅ All CRUD operations tested
  - ✅ Multi-tenant security tested (5 test cases)
  - ✅ Input validation tested
  - ✅ Error responses tested
  - Missing: Concurrent request handling

- **Overall**: Exceeds 85% threshold ✅

- **Test Quality**:
  - Clear test names following convention
  - Good use of fixtures for test data
  - Proper cleanup between tests
  - Tests are fast (< 5 seconds total)
```

---

### Step 5: Generate Review Report

Create structured review report with verdict.

**Template**:
```markdown
# Code Review Report

**Feature**: [Feature name]
**Phase**: [Phase]
**Pull Request**: [PR number]
**Reviewer**: [Reviewer name/agent]
**Review Date**: [YYYY-MM-DD]

---

## 🎯 Verdict: [APPROVE | CHANGES_REQUESTED | BLOCK]

[1-2 sentence summary of overall assessment]

---

## ✅ Strengths

[Bullet list of well-implemented aspects]

---

## 🚨 Critical Issues (BLOCKING)

[List issues that MUST be fixed before merge]

[If none: "No blocking issues found"]

---

## ⚠️ Changes Requested

[List issues that SHOULD be fixed before merge]

[If none: "No changes requested"]

---

## 💡 Recommendations (Optional)

[List suggestions for improvement that are nice-to-have]

[If none: "No additional recommendations"]

---

## 📋 Checklist Summary

### Spec Compliance
- [X] API endpoints match specification
- [X] Database schema matches specification
- [ ] UI components match specification (N/A for backend)
- [X] Error messages match specification

### Phase Compliance
- [X] Correct tech stack for Phase II
- [X] FastAPI + SQLModel + Better Auth
- [X] Proper async/await patterns
- [X] Alembic migrations included

### Security
- [X] Multi-tenant isolation implemented
- [X] JWT authentication required
- [X] Input validation with Pydantic
- [X] No hardcoded secrets
- [X] SQL injection prevented

### Performance
- [X] Async database operations
- [X] Indexed columns for queries
- [X] No N+1 query problems
- [ ] Connection pooling configured (SHOULD FIX)

### Code Quality
- [X] Type hints on all functions
- [X] Error handling implemented
- [X] Tests with 85%+ coverage
- [X] Structured logging
- [ ] No magic numbers (SHOULD FIX)

### Testing
- [X] Unit tests (92% coverage)
- [X] Integration tests (88% coverage)
- [X] All tests passing
- [X] Security tests included

---

## 📝 Detailed Findings

[Copy findings from Steps 2-4 above]

---

## ✅ Next Steps

1. [Action item 1 with file:line reference]
2. [Action item 2 with file:line reference]
3. [Action item 3 with file:line reference]

---

**Review Status**: [APPROVE ✅ | CHANGES REQUESTED ⚠️ | BLOCKED 🚨]
```

---

## Review Examples

### Example 1: APPROVE ✅

```markdown
# Code Review Report

**Feature**: Task CRUD Operations
**Phase**: II (Web App with Backend)
**Pull Request**: #42 - Implement FastAPI Task endpoints with SQLModel
**Reviewer**: Code Quality Agent
**Review Date**: 2025-12-24

---

## 🎯 Verdict: APPROVE ✅

Excellent implementation that fully complies with specifications and security requirements. Minor recommendations for future enhancements, but no blocking issues.

---

## ✅ Strengths

- **Spec Compliance**: All REST endpoints match API specification exactly
- **Security**: Comprehensive multi-tenant isolation with proper JWT validation
- **Testing**: 90% test coverage with thorough security test cases
- **Code Quality**: Clean code with full type hints and clear error handling
- **Performance**: Proper use of async/await and database indexes
- **Documentation**: Well-documented with docstrings and inline comments

---

## 🚨 Critical Issues (BLOCKING)

No blocking issues found

---

## ⚠️ Changes Requested

No changes requested

---

## 💡 Recommendations (Optional)

1. **Add rate limiting** (packages/backend/app/api/tasks.py)
   - Not blocking, but recommended for production
   - Prevents abuse of create endpoint
   - Can be added in future PR

2. **Configure connection pooling** (packages/backend/app/core/database.py)
   - Improves performance under load
   - Add pool_size=20, max_overflow=10 to create_engine

3. **Add correlation IDs** (packages/backend/app/main.py)
   - Improves observability for distributed tracing
   - Add middleware to extract/generate correlation_id

---

## 📋 Checklist Summary

### Spec Compliance ✅
- [X] API endpoints match specification
- [X] Database schema matches specification
- [X] Error messages match specification

### Security ✅
- [X] Multi-tenant isolation implemented
- [X] JWT authentication required
- [X] Input validation with Pydantic
- [X] No hardcoded secrets

### Performance ✅
- [X] Async database operations
- [X] Indexed columns for queries
- [X] No N+1 query problems

### Code Quality ✅
- [X] Type hints on all functions
- [X] Error handling implemented
- [X] Tests with 90% coverage
- [X] Structured logging

---

## ✅ Next Steps

**Ready to merge!** 🚀

Optional follow-ups for future PRs:
1. Add rate limiting middleware
2. Configure database connection pooling
3. Add correlation ID tracing

---

**Review Status**: APPROVE ✅
```

---

### Example 2: CHANGES_REQUESTED ⚠️

```markdown
# Code Review Report

**Feature**: Task Priority Filtering
**Phase**: II (Web App with Backend)
**Pull Request**: #57 - Add priority filter to task list endpoint
**Reviewer**: Code Quality Agent
**Review Date**: 2025-12-24

---

## 🎯 Verdict: CHANGES_REQUESTED ⚠️

Good implementation overall, but requires fixes for spec compliance and performance before merge. No critical security issues.

---

## ✅ Strengths

- Multi-tenant security maintained
- Clean code with type hints
- Tests added for new functionality
- Error handling present

---

## 🚨 Critical Issues (BLOCKING)

No blocking issues found

---

## ⚠️ Changes Requested

1. **Priority enum validation missing** (packages/backend/app/api/tasks.py:48)
   - Issue: Priority accepts any string value
   - Spec requires: Only "high", "medium", "low" allowed
   - Fix: Add `regex="^(high|medium|low)$"` to Query parameter
   - Example: `priority: Optional[str] = Query(None, regex="^(high|medium|low)$")`

2. **Missing test for invalid priority** (packages/backend/tests/api/test_tasks.py)
   - Issue: No test for invalid priority value (e.g., "urgent")
   - Expected: Should return 422 Unprocessable Entity
   - Fix: Add test case `test_list_tasks_invalid_priority_returns_422`

3. **Performance: Missing index on priority column** (packages/backend/app/models/task.py:12)
   - Issue: Priority filter will trigger full table scan
   - Impact: Slow queries when users have many tasks
   - Fix: Add `index=True` to priority Field definition
   - Example: `priority: str = Field(default="medium", index=True)`

---

## 💡 Recommendations (Optional)

1. **Add priority filter to UI** (packages/frontend/components/FilterBar.tsx)
   - Current: Only status filter in UI
   - Recommendation: Add priority dropdown to match backend capability
   - Not blocking: Backend can merge first, frontend in separate PR

---

## 📋 Checklist Summary

### Spec Compliance ⚠️
- [X] API endpoint signature correct
- [ ] Priority validation matches spec enum (MUST FIX)
- [X] Response format correct

### Security ✅
- [X] Multi-tenant isolation maintained
- [X] JWT authentication required
- [X] Input validation (needs enum fix)

### Performance ⚠️
- [X] Async database operations
- [ ] Index on filtered column (SHOULD FIX)

### Code Quality ✅
- [X] Type hints present
- [X] Error handling implemented
- [ ] Test coverage for edge cases (MUST FIX)

---

## 📝 Detailed Findings

### Spec Compliance Issues

**Missing Priority Enum Validation** (packages/backend/app/api/tasks.py:48)
```python
# Current (INCORRECT)
priority: Optional[str] = Query(None)

# Should be (CORRECT)
priority: Optional[str] = Query(None, regex="^(high|medium|low)$")
```

### Performance Issues

**Missing Index** (packages/backend/app/models/task.py:12)
```python
# Current (SLOW)
priority: str = Field(default="medium")

# Should be (OPTIMIZED)
priority: str = Field(default="medium", index=True)
```

### Testing Gaps

**Missing Test Case** (packages/backend/tests/api/test_tasks.py)
```python
def test_list_tasks_invalid_priority_returns_422(client: TestClient):
    """Test GET /api/{user_id}/tasks?priority=invalid returns 422."""
    response = client.get("/api/1/tasks?priority=urgent")

    assert response.status_code == 422
    assert "priority" in response.json()["detail"][0]["loc"]
```

---

## ✅ Next Steps

1. Add regex validation to priority Query parameter (packages/backend/app/api/tasks.py:48)
2. Add `index=True` to priority field (packages/backend/app/models/task.py:12)
3. Generate Alembic migration for index: `alembic revision --autogenerate -m "Add index to task priority"`
4. Add test case for invalid priority value (packages/backend/tests/api/test_tasks.py)
5. Run tests and verify 85%+ coverage maintained

---

**Review Status**: CHANGES REQUESTED ⚠️

Please address the 3 changes above and request re-review.
```

---

### Example 3: BLOCK 🚨

```markdown
# Code Review Report

**Feature**: Task Sharing Between Users
**Phase**: II (Web App with Backend)
**Pull Request**: #73 - Allow users to share tasks with other users
**Reviewer**: Code Quality Agent
**Review Date**: 2025-12-24

---

## 🎯 Verdict: BLOCK 🚨

**CRITICAL SECURITY VULNERABILITY DETECTED**. This implementation breaks multi-tenant isolation and allows unauthorized access to other users' data. Must be completely redesigned before merge.

---

## ✅ Strengths

- Attempted to implement a useful feature
- Tests were added

---

## 🚨 Critical Issues (BLOCKING)

1. **SECURITY: Multi-tenant isolation violated** (packages/backend/app/api/tasks.py:180)
   - Issue: Query removes user_id filter when shared=true parameter present
   - Vulnerability: User can access ALL tasks in database with ?shared=true
   - Exploit: `GET /api/1/tasks?shared=true` returns tasks for ALL users
   - Impact: Complete data breach - CRITICAL
   - Required Fix: Remove this feature entirely or redesign with proper security model

```python
# VULNERABLE CODE (MUST NOT MERGE)
if shared:
    query = select(Task)  # NO USER FILTER - EXPOSES ALL DATA
else:
    query = select(Task).where(Task.user_id == current_user.id)
```

2. **SECURITY: Missing authorization check** (packages/backend/app/api/shared_tasks.py:45)
   - Issue: No validation that user has permission to view shared task
   - Vulnerability: Any user can guess shared_task_id and access it
   - Impact: High - bypass of access controls
   - Required Fix: Implement proper authorization model (share table, permissions)

3. **SPEC VIOLATION: Feature not in specification** (specs/api/rest-endpoints.md)
   - Issue: Task sharing feature not defined in any specification
   - Impact: Adds complexity without requirements or design
   - Required Fix: Create specification with security model before implementing

---

## ⚠️ Changes Requested

N/A - Must address blocking issues first

---

## 💡 Recommendations (Optional)

If task sharing is needed, follow this approach:

1. **Create specification** (specs/features/task-sharing.md)
   - Define security model (who can share, permissions, revocation)
   - Define UI/UX (how users discover shared tasks)
   - Define API contracts (share endpoints, list shared tasks)

2. **Implement sharing table**
   - `task_shares` table with (task_id, owner_id, shared_with_user_id, permission_level)
   - Multi-tenant isolation: Filter by owner_id OR shared_with_user_id
   - Foreign keys with cascade delete

3. **Add authorization middleware**
   - Check if current_user owns task OR has share permission
   - Return 403 if unauthorized (not 404)
   - Log access attempts for security audit

4. **Add comprehensive security tests**
   - Test that users cannot access unshared tasks
   - Test that sharing works only for authorized users
   - Test revocation of sharing

---

## 📋 Checklist Summary

### Spec Compliance 🚨
- [ ] Feature defined in specification (MISSING)
- [ ] API contract matches spec (N/A - no spec)
- [ ] Security model documented (MISSING)

### Security 🚨 CRITICAL FAILURES
- [ ] Multi-tenant isolation maintained (VIOLATED)
- [ ] Authorization checks present (MISSING)
- [ ] Security tests for sharing (INADEQUATE)
- [X] Input validation with Pydantic

### Code Quality
- [X] Type hints present
- [X] Error handling implemented
- [ ] Tests comprehensive (GAPS)

---

## 📝 Detailed Findings

### CRITICAL: Multi-Tenant Isolation Violated

**File**: packages/backend/app/api/tasks.py:180-185

**Vulnerable Code**:
```python
@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    user_id: int,
    shared: bool = Query(False),  # DANGEROUS PARAMETER
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> List[Task]:
    if shared:
        # 🚨 CRITICAL VULNERABILITY: Returns ALL tasks for ALL users
        query = select(Task)
    else:
        query = select(Task).where(Task.user_id == current_user.id)

    tasks = session.exec(query).all()
    return tasks
```

**Exploit Scenario**:
1. Attacker creates account (user_id = 999)
2. Attacker requests: `GET /api/999/tasks?shared=true`
3. Backend returns ALL tasks for ALL users (complete data breach)
4. Attacker can see sensitive task data for all application users

**Required Fix**:
```python
# CORRECT IMPLEMENTATION
@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    user_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> List[Task]:
    # ALWAYS filter by user_id - no exceptions
    query = select(Task).where(Task.user_id == current_user.id)
    tasks = session.exec(query).all()
    return tasks
```

### Security Test Failure

**Missing Test**: packages/backend/tests/api/test_tasks.py
```python
def test_shared_parameter_does_not_bypass_isolation(client: TestClient, session: Session):
    """Test that shared=true does not expose other users' tasks."""
    # Create tasks for different users
    task1 = Task(user_id=1, title="User 1 task")
    task2 = Task(user_id=2, title="User 2 task")
    session.add_all([task1, task2])
    session.commit()

    # Current user is user_id=1
    response = client.get("/api/1/tasks?shared=true")

    data = response.json()
    # Should ONLY see own tasks
    assert len(data) == 1
    assert data[0]["user_id"] == 1

    # FAILS WITH CURRENT IMPLEMENTATION
    # Actual result: Returns tasks for BOTH users
```

---

## ✅ Next Steps

**DO NOT MERGE THIS PR**

1. Close this PR
2. Revert all changes from this branch
3. Create specification for task sharing feature (if needed)
4. Review specification with security team
5. Implement with proper authorization model
6. Add comprehensive security tests
7. Request new code review

---

**Review Status**: BLOCKED 🚨

This PR contains critical security vulnerabilities that violate multi-tenant isolation. Cannot be merged in current state.
```

---

## Related Agents

All agents use this skill for code review:

- **Code Quality Agent**: Primary owner, performs comprehensive reviews
- **Backend Pro Agent**: Reviews FastAPI code for API compliance
- **Frontend UI/UX Agent**: Reviews Next.js code for UI specification compliance
- **Testing & QA Agent**: Reviews test coverage and quality
- **Security Agent**: Focuses on security audit (auth, multi-tenant, input validation)
- **Performance Agent**: Focuses on performance review (queries, N+1, caching)
- **All Implementation Agents**: Self-review before submitting PR

---

## Success Metrics

The Code Review Skill is successful when:

✅ **Spec Compliance**: All code matches specifications (API, database, UI, architecture)
✅ **Security**: No vulnerabilities (multi-tenant isolation, JWT auth, input validation)
✅ **Performance**: No obvious performance issues (N+1 queries, missing indexes)
✅ **Code Quality**: Meets Constitution principles (type safety, error handling, testing)
✅ **Test Coverage**: 85%+ coverage with comprehensive test cases
✅ **Clear Verdict**: APPROVE/CHANGES_REQUESTED/BLOCK with actionable feedback
✅ **Actionable Feedback**: Specific file:line references with fix recommendations
✅ **Consistent**: Same standards applied to all PRs

---

## Best Practices

### Do's ✅

- **Review Against Specs First**: Check API/database/UI specs before code style
- **Focus on Security**: Multi-tenant isolation is CRITICAL for hackathon
- **Be Specific**: Always provide file:line references with findings
- **Suggest Fixes**: Include code examples for recommended changes
- **Explain Impact**: Describe why each issue matters (security, performance, UX)
- **Test the Tests**: Verify test coverage and quality, not just existence
- **Check Phase Compliance**: Ensure correct tech stack for phase
- **Prioritize Issues**: Separate BLOCKING vs CHANGES_REQUESTED vs OPTIONAL
- **Verify Migrations**: Check Alembic migrations for database changes
- **Review Error Messages**: Ensure user-friendly messages match spec

### Don'ts ❌

- **Don't Nitpick Style**: Use automated formatters (Black, Prettier), not manual review
- **Don't Assume Malice**: Frame feedback constructively ("Consider X" not "Why did you...")
- **Don't Approve Without Testing**: Run code locally or verify CI passes
- **Don't Skip Security**: Always audit multi-tenant isolation and JWT validation
- **Don't Ignore Specs**: Code that works but doesn't match spec is still wrong
- **Don't Request Perfection**: Focus on issues that matter (security, correctness)
- **Don't Block on Opinions**: Block only on security, spec violations, or critical bugs
- **Don't Review in Isolation**: Check related files (models, schemas, tests together)
- **Don't Skip Positive Feedback**: Acknowledge well-implemented aspects
- **Don't Rush**: Take time to understand context and intent

---

## Integration with Other Skills

### Workflow Integration

```
Code Generation (Code Generation Skill)
  ↓
Implementation (Developer writes code)
  ↓
Self-Review (Developer uses Code Review Skill)
  ↓
Tests (Test Design Skill)
  ↓
Pull Request
  ↓
CODE REVIEW (this skill) ← YOU ARE HERE
  ↓
Fixes Applied (if CHANGES_REQUESTED)
  ↓
Merge to Main
```

### Skill Combinations

**Spec Authoring + Code Review**:
```
1. Spec Authoring creates API specification
2. Code Generation implements endpoints
3. Code Review verifies implementation matches spec exactly
```

**Test Design + Code Review**:
```
1. Test Design creates test cases from spec
2. Developer implements code + tests
3. Code Review verifies test coverage and quality
```

**Debugging + Code Review**:
```
1. Code Review identifies bug in multi-tenant isolation
2. Debugging Skill systematically reproduces and fixes
3. Code Review verifies fix and test coverage
```

---

## Output Format

When using this skill, generate:

**1. Review Context** (feature, phase, PR, files changed)
**2. Spec Compliance Audit** (passes, violations, ambiguities)
**3. Security Review** (passes, blocking issues, warnings)
**4. Performance Review** (passes, concerns)
**5. Code Quality Review** (passes, concerns, test coverage)
**6. Review Report** (verdict, strengths, issues, recommendations, checklist, next steps)

Save review report to:
- `reviews/pr-{number}-{feature-slug}.md` (project reviews directory)
- Or post directly as GitHub PR comment

---

## References

- **Spec Authoring**: `.claude/skills/spec-authoring/README.md` (What code should implement)
- **API Specification**: `.claude/skills/api-database-specification/README.md` (Endpoint contracts)
- **Code Generation**: `.claude/skills/code-generation/README.md` (How code is generated)
- **Test Design**: `.claude/skills/test-design/README.md` (Test requirements)
- **Constitution**: `.specify/memory/constitution.md` (Quality principles)
- **Security Guidelines**: Look for multi-tenant isolation, JWT auth, input validation

---

## Automation Integration

### GitHub Actions Workflow

**File**: `.github/workflows/code-review.yml`

```yaml
name: Automated Code Review

on:
  pull_request:
    branches: [main, develop]

jobs:
  spec-compliance-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run spec compliance audit
        run: |
          # Check API endpoints match spec
          python scripts/check_api_compliance.py

      - name: Check security requirements
        run: |
          # Verify multi-tenant isolation
          python scripts/check_security.py

      - name: Check test coverage
        run: |
          pytest --cov=app --cov-fail-under=85

      - name: Post review comment
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ Automated checks failed. Please review and fix issues before requesting human review.'
            })
```

---

**Document Version**: 1.0.0
**Created**: 2025-12-24
**Total Examples**: 3 (APPROVE, CHANGES_REQUESTED, BLOCK)
**Coverage**: All 5 Hackathon II Phases

---

*This code review skill is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*
