# Prompt Refinement Skill

**Purpose**: Transform vague prompts into precise, spec-referenced instructions with phase context and technical details for Evolution of Todo hackathon phases

**Owner**: Spec Architect Agent + Project Manager Agent

**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

The **Prompt Refinement Skill** enables transformation of high-level requests into detailed, actionable prompts that:
- Reference existing specifications and architecture
- Include phase-specific context and constraints
- Specify exact technologies and patterns
- Link to relevant documentation and examples
- Reduce ambiguity and back-and-forth clarifications

This skill bridges the gap between **user intent** and **agent execution** by injecting all necessary context from the project's Spec-Driven Development artifacts.

---

## Skill Components

### 1. Prompt Analysis

Identify missing information in the original prompt:
- **Specs**: Which feature specifications apply?
- **Phase**: Which hackathon phase (I-V) is this for?
- **Tech Stack**: Which technologies are required?
- **Architecture**: Which system components are involved?
- **Dependencies**: What must exist before this can be done?

### 2. Spec Reference Injection

Add citations to existing specifications:
- **Architecture**: Monorepo layout, phase evolution diagrams
- **API**: REST endpoints, MCP tools, request/response schemas
- **Database**: SQLModel models, relationships, multi-tenant security
- **UI**: Page layouts, component specs, Tailwind classes
- **Feature Specs**: User stories, acceptance criteria, edge cases

### 3. Phase Context Addition

Inject phase-specific constraints and technologies:
- **Phase I**: Python CLI, argparse, in-memory storage
- **Phase II**: Next.js + FastAPI + Neon PostgreSQL + Better Auth
- **Phase III**: ChatKit + Claude Agents SDK + MCP + multilingual
- **Phase IV**: Docker + Minikube + Helm + Prometheus + Jaeger
- **Phase V**: Cloud K8s + Kafka + Dapr + GitHub Actions

### 4. Technical Detail Expansion

Replace vague terms with precise technical specifications:
- "API" → "FastAPI REST endpoint with JWT middleware and SQLModel ORM"
- "Database" → "Neon PostgreSQL with SQLModel Task model (user_id FK for multi-tenant isolation)"
- "Frontend" → "Next.js 16 Server Component with Better Auth session + Tailwind TaskCard"
- "Chatbot" → "OpenAI ChatKit with Claude Opus 4.5 + MCP add_task tool"

---

## Skill Instructions

### Step 1: Analyze Original Prompt

Extract key information and identify gaps.

**Template**:
```markdown
## Original Prompt Analysis

**User Request**: "[original prompt]"

**Identified Intent**:
- Goal: [What does the user want to achieve?]
- Scope: [How much work is involved?]
- Phase: [Which hackathon phase?]

**Missing Information**:
- [ ] Feature specification reference
- [ ] Technology stack details
- [ ] Phase-specific constraints
- [ ] Architecture component mapping
- [ ] Data model details
- [ ] API endpoint specifications
- [ ] UI component requirements
```

**Example**:
```markdown
## Original Prompt Analysis

**User Request**: "Build task API"

**Identified Intent**:
- Goal: Create REST API for task management
- Scope: CRUD operations (Create, Read, Update, Delete)
- Phase: II (Web App with Backend)

**Missing Information**:
- [x] Feature specification reference → specs/phase-i/spec.md
- [x] Technology stack details → FastAPI, SQLModel, Neon
- [x] Phase-specific constraints → JWT auth, multi-tenant
- [x] Architecture component mapping → backend/ directory
- [x] Data model details → SQLModel Task model
- [x] API endpoint specifications → specs/api/rest-endpoints.md
- [ ] UI component requirements → Not applicable (backend only)
```

---

### Step 2: Inject Spec References

Add links to relevant specification documents.

**Template**:
```markdown
## Applicable Specifications

### Feature Specifications
- **spec.md**: [Link to feature spec]
  - User stories: [relevant stories]
  - Acceptance criteria: [relevant criteria]

### Architecture Specifications
- **architecture-specification**: [.claude/skills/architecture-specification/README.md]
  - Monorepo layout: [relevant directories]
  - Phase diagram: [Phase X evolution]

### API Specifications
- **api-database-specification**: [.claude/skills/api-database-specification/README.md]
  - REST endpoints: [specific endpoints]
  - MCP tools: [if applicable]
  - SQLModel schemas: [relevant models]

### UI Specifications (if applicable)
- **ui-specification**: [.claude/skills/ui-specification/README.md]
  - Pages: [relevant pages]
  - Components: [relevant components]
```

**Example**:
```markdown
## Applicable Specifications

### Feature Specifications
- **specs/phase-i/spec.md**:
  - User stories: "As a user, I can add/view/delete tasks"
  - Acceptance criteria: CRUD operations with validation

### Architecture Specifications
- **.claude/skills/architecture-specification/README.md**:
  - Monorepo layout: `backend/app/routers/todos.py`
  - Phase II diagram: Console CLI → FastAPI REST API

### API Specifications
- **.claude/skills/api-database-specification/README.md**:
  - REST endpoints:
    - GET /api/{user_id}/tasks
    - POST /api/{user_id}/tasks
    - PATCH /api/{user_id}/tasks/{task_id}
    - DELETE /api/{user_id}/tasks/{task_id}
  - SQLModel schemas: Task(id, user_id, title, description, status, priority, created_at)
  - Multi-tenant security: Filter by user_id from JWT
```

---

### Step 3: Add Phase Context

Inject phase-specific technologies and constraints.

**Template**:
```markdown
## Phase Context: Phase [X]

**Phase Goal**: [Phase objective from Constitution]

**Technologies Required**:
- [Tech 1]: [Purpose]
- [Tech 2]: [Purpose]
- [Tech 3]: [Purpose]

**Phase Constraints**:
- [Constraint 1]
- [Constraint 2]
- [Constraint 3]

**Evolution from Previous Phase**:
- Previous: [Phase X-1 approach]
- Current: [Phase X approach]
- Change: [What evolved?]
```

**Example**:
```markdown
## Phase Context: Phase II

**Phase Goal**: Build web app with Next.js frontend + FastAPI backend + PostgreSQL database

**Technologies Required**:
- **FastAPI**: REST API framework with async support
- **SQLModel**: ORM for PostgreSQL with Pydantic validation
- **Neon PostgreSQL**: Serverless database (free tier)
- **Better Auth**: JWT authentication with user sessions
- **Alembic**: Database migrations

**Phase Constraints**:
- Multi-tenant isolation (filter all queries by user_id from JWT)
- RESTful API design (GET/POST/PATCH/DELETE)
- JSON request/response bodies
- HTTP status codes (200, 201, 404, 422, 500)
- CORS enabled for Next.js frontend

**Evolution from Previous Phase**:
- Previous: Phase I in-memory storage (global tasks list)
- Current: Phase II Neon PostgreSQL (todos table with user_id FK)
- Change: Data persists, supports multiple users
```

---

### Step 4: Expand Technical Details

Replace vague terms with precise specifications.

**Vague → Precise Mapping**:

| Vague Term | Precise Specification |
|------------|----------------------|
| "Build API" | "Implement FastAPI router at backend/app/routers/todos.py with 4 endpoints (GET/POST/PATCH/DELETE) per specs/api/rest-endpoints.md, using SQLModel Task model with JWT middleware for auth" |
| "Add database" | "Create SQLModel Task model with columns: id (int, PK), user_id (int, FK to users), title (str, 1-500 chars), description (str?, max 2000 chars), status (str, enum: pending/completed), priority (str, enum: high/medium/low), created_at (datetime, auto)" |
| "Create UI" | "Build Next.js Server Component at frontend/app/tasks/page.tsx with TaskGrid layout (3-column desktop, 2-column tablet, 1-column mobile) using TaskCard component per specs/ui/pages.md" |
| "Deploy to cloud" | "Create Dockerfile + Helm chart for backend deployment to Kubernetes with livenessProbe (GET /health), readinessProbe (GET /ready), resource limits (500m CPU, 512Mi memory), HPA (2-10 replicas)" |
| "Add auth" | "Integrate Better Auth with JWT strategy: login endpoint POST /api/auth/login returns access_token (1h expiry), protect routes with get_current_user dependency injecting User from JWT, session stored in PostgreSQL auth.sessions table" |

**Template**:
```markdown
## Technical Detail Expansion

### Original Terms → Precise Specifications

**API Implementation**:
- Framework: [FastAPI / Express / Django]
- File location: [backend/app/routers/feature.py]
- Endpoints: [List all routes with methods]
- Auth: [JWT / OAuth / API Key]
- Validation: [Pydantic / Joi / Zod]

**Database Implementation**:
- ORM: [SQLModel / Prisma / TypeORM]
- Model location: [backend/app/models/feature.py]
- Schema: [All columns with types and constraints]
- Relationships: [Foreign keys, joins]
- Migrations: [Alembic / Prisma Migrate]

**Frontend Implementation**:
- Framework: [Next.js / React / Vue]
- File location: [frontend/app/feature/page.tsx]
- Components: [List all UI components used]
- State: [Server Component / useState / Zustand]
- Styling: [Tailwind classes]

**Deployment**:
- Container: [Dockerfile location]
- Orchestration: [Kubernetes / Docker Compose]
- Config: [Helm chart / manifests]
- Observability: [Prometheus metrics, Jaeger traces]
```

---

### Step 5: Generate Refined Prompt

Combine all elements into a comprehensive prompt.

**Template**:
```markdown
## Refined Prompt

Act as [Agent Name] and implement [feature] for Phase [X] of Evolution of Todo.

**Specification Reference**: [Link to spec.md]

**Feature Requirements**:
- User stories: [List relevant stories]
- Acceptance criteria: [List testable criteria]
- Edge cases: [List error conditions]

**Technical Implementation**:

### Backend ([if applicable])
- Framework: [FastAPI]
- File: [backend/app/routers/feature.py]
- Endpoints:
  - [METHOD] [/api/path] - [Description]
  - [METHOD] [/api/path/{id}] - [Description]
- Models: [backend/app/models/feature.py]
  - [ModelName]: [columns with types]
- Auth: [JWT middleware with get_current_user]
- Validation: [Pydantic schemas]

### Frontend ([if applicable])
- Framework: [Next.js 16]
- File: [frontend/app/feature/page.tsx]
- Components:
  - [ComponentName] - [specs/ui/components.md reference]
- Data fetching: [Server Component / API route]
- Styling: [Tailwind classes per specs/ui]

### Database ([if applicable])
- Model: [SQLModel class]
- Schema: [Column definitions]
- Relationships: [Foreign keys]
- Multi-tenant: [user_id filtering]
- Migration: [Alembic auto-generate]

### Testing
- Unit tests: [pytest / jest]
- Integration tests: [API endpoints with test DB]
- Test cases: [Based on acceptance criteria]

**Phase Context**: Phase [X] - [Phase goal]
- Technologies: [List required stack]
- Constraints: [List phase-specific rules]
- Evolution: [How this differs from previous phase]

**Success Criteria**:
- [ ] All acceptance criteria pass
- [ ] Tests pass (unit + integration)
- [ ] Multi-tenant security enforced
- [ ] Error handling for edge cases
- [ ] Documentation updated

**References**:
- Architecture: [.claude/skills/architecture-specification/README.md]
- API Spec: [specs/api/rest-endpoints.md]
- Database Schema: [specs/database/schema.md]
- UI Spec: [specs/ui/pages.md]
- Constitution: [.specify/memory/constitution.md]
```

---

## Example Output

### Example 1: Vague → Refined (Backend API)

**Before (Vague)**:
```
"Build task API"
```

**After (Refined)**:
```markdown
Act as Backend / FastAPI Pro Agent and implement Task CRUD REST API for Phase II of Evolution of Todo.

**Specification Reference**: specs/phase-ii/spec.md (User stories: Task management)

**Feature Requirements**:
- User stories:
  - As a user, I can create tasks with title, description, priority
  - As a user, I can view all my tasks with filtering (status, priority)
  - As a user, I can update task status (pending → completed)
  - As a user, I can delete tasks
- Acceptance criteria:
  - POST /api/{user_id}/tasks creates task and returns 201
  - GET /api/{user_id}/tasks returns all tasks for authenticated user
  - PATCH /api/{user_id}/tasks/{task_id} updates task and returns 200
  - DELETE /api/{user_id}/tasks/{task_id} removes task and returns 204
- Edge cases:
  - 404 if task_id not found or belongs to different user
  - 422 if validation fails (empty title, invalid priority)

**Technical Implementation**:

### Backend
- Framework: FastAPI 0.115+
- File: backend/app/routers/todos.py
- Endpoints (per specs/api/rest-endpoints.md):
  - GET /api/{user_id}/tasks - List tasks with optional filters (?status=completed&priority=high)
  - POST /api/{user_id}/tasks - Create new task (body: TodoCreate schema)
  - GET /api/{user_id}/tasks/{task_id} - Get single task details
  - PATCH /api/{user_id}/tasks/{task_id} - Update task (body: TodoUpdate schema)
  - DELETE /api/{user_id}/tasks/{task_id} - Delete task
- Models: backend/app/models/todo.py
  - Task(SQLModel, table=True):
    - id: int (primary key, auto-increment)
    - user_id: int (foreign key to users.id, indexed)
    - title: str (min 1, max 500 chars)
    - description: str | None (max 2000 chars)
    - status: str (enum: "pending", "completed", default="pending")
    - priority: str (enum: "high", "medium", "low", default="medium")
    - created_at: datetime (auto-generate on insert)
    - updated_at: datetime (auto-update on modification)
- Auth: JWT middleware
  - Dependency: get_current_user from backend/app/dependencies/auth.py
  - Extracts user_id from JWT access_token
  - All endpoints protected with Depends(get_current_user)
- Validation: Pydantic schemas
  - TodoCreate(title, description?, priority?)
  - TodoUpdate(title?, description?, status?, priority?)
  - TodoResponse(id, user_id, title, description, status, priority, created_at, updated_at)

### Database
- Model: Task (SQLModel)
- Schema: todos table
  - id SERIAL PRIMARY KEY
  - user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
  - title VARCHAR(500) NOT NULL
  - description TEXT
  - status VARCHAR(20) CHECK (status IN ('pending', 'completed'))
  - priority VARCHAR(20) CHECK (priority IN ('high', 'medium', 'low'))
  - created_at TIMESTAMP DEFAULT NOW()
  - updated_at TIMESTAMP DEFAULT NOW()
  - INDEX idx_todos_user_id ON todos(user_id)
- Multi-tenant security: CRITICAL - Always filter by user_id
  ```python
  query = select(Task).where(Task.user_id == current_user.id)
  if task.user_id != current_user.id:
      raise HTTPException(status_code=404, detail="Task not found")
  ```
- Migration: Alembic
  ```bash
  alembic revision --autogenerate -m "Add todos table"
  alembic upgrade head
  ```

### Testing
- Unit tests: pytest (backend/tests/test_todos.py)
  - Test TodoCreate validation (empty title → 422)
  - Test priority enum validation (invalid value → 422)
- Integration tests: TestClient with test database
  - Test POST /api/{user_id}/tasks → 201 with valid data
  - Test GET /api/{user_id}/tasks → 200 with task list
  - Test PATCH with wrong user_id → 404 (multi-tenant check)
  - Test DELETE → 204 and verify task removed

**Phase Context**: Phase II - Web App with Backend + Frontend
- Technologies: FastAPI, SQLModel, Neon PostgreSQL, Better Auth (JWT)
- Constraints:
  - Multi-tenant isolation (user_id filtering mandatory)
  - RESTful design (proper HTTP methods and status codes)
  - JSON request/response bodies
  - CORS enabled for Next.js frontend at http://localhost:3000
- Evolution: Phase I in-memory list → Phase II persistent PostgreSQL with multi-user support

**Success Criteria**:
- [x] All CRUD endpoints implemented per specs/api/rest-endpoints.md
- [x] SQLModel Task model with user_id foreign key
- [x] JWT authentication on all routes
- [x] Multi-tenant security enforced (user can only access own tasks)
- [x] Validation errors return 422 with detailed messages
- [x] Not found errors return 404
- [x] All tests pass (unit + integration)
- [x] Alembic migration created and applied

**References**:
- Architecture: .claude/skills/architecture-specification/README.md (Monorepo layout, Phase II diagram)
- API Spec: .claude/skills/api-database-specification/README.md (REST endpoints table)
- Database Schema: .claude/skills/api-database-specification/README.md (SQLModel Task model)
- Constitution: .specify/memory/constitution.md (Principle 7: Security - Multi-tenant isolation)
```

---

### Example 2: Vague → Refined (Frontend Page)

**Before (Vague)**:
```
"Create task list page"
```

**After (Refined)**:
```markdown
Act as Frontend UI/UX Agent and implement TaskListPage for Phase II of Evolution of Todo.

**Specification Reference**: specs/phase-ii/spec.md + specs/ui/pages.md

**Feature Requirements**:
- User stories:
  - As a user, I can view all my tasks in a grid layout
  - As a user, I can filter tasks by status (all, active, completed)
  - As a user, I can filter tasks by priority (high, medium, low)
  - As a user, I can click a task to view details
- Acceptance criteria:
  - Page displays 3-column grid on desktop, 2-column on tablet, 1-column on mobile
  - Filter bar at top with status and priority dropdowns
  - Each task shows: title, priority badge, status chip, created date
  - Clicking task navigates to /tasks/{id} detail page
  - Loading state while fetching tasks
  - Empty state when no tasks found

**Technical Implementation**:

### Frontend
- Framework: Next.js 16 (App Router)
- File: frontend/app/tasks/page.tsx
- Type: Server Component (initial render) + Client Component (filtering)
- Components used (per specs/ui/components.md):
  - TaskListPage (Server Component)
    - FilterBar (Client Component) - Status/priority dropdowns
    - TaskGrid (Server Component) - Responsive grid container
      - TaskCard (Client Component × N) - Individual task display
        - PriorityBadge - Color-coded priority indicator
        - StatusChip - Pending/completed indicator
        - ActionButtons - View/edit/delete actions
    - Pagination (Client Component) - Page navigation
  - EmptyState - Shown when no tasks
  - LoadingSkeleton - Shown during fetch

### Data Fetching
- Method: Server Component with async fetch
  ```tsx
  // app/tasks/page.tsx (Server Component)
  async function TaskListPage() {
    const session = await auth(); // Better Auth session
    const tasks = await fetch(`${API_URL}/api/${session.user.id}/tasks`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }).then(res => res.json());

    return <TaskGrid tasks={tasks} />;
  }
  ```
- Error handling:
  - Network errors → Show error toast
  - 401 Unauthorized → Redirect to /login
  - Empty result → Show EmptyState component

### Styling (Tailwind per specs/ui/pages.md)
- Page container: `container mx-auto px-4 py-8`
- Grid layout:
  - Desktop: `grid grid-cols-3 gap-6` (3 columns)
  - Tablet: `sm:grid-cols-2` (2 columns)
  - Mobile: `grid-cols-1` (1 column)
- TaskCard: `bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-lg p-4`
- PriorityBadge variants:
  - High: `bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`
  - Medium: `bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`
  - Low: `bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`
- StatusChip variants:
  - Pending: `bg-blue-100 text-blue-800`
  - Completed: `bg-green-100 text-green-800`

### Accessibility (WCAG 2.1 AA per specs/ui)
- ARIA labels: `<div role="article" aria-labelledby="task-title-{id}">`
- Keyboard navigation: Tab order follows visual flow
- Focus indicators: `focus:ring-2 focus:ring-blue-500`
- Screen reader: `<span className="sr-only">Task {id}: {title}</span>`

### Testing
- Unit tests: Jest + React Testing Library
  - Render TaskListPage with mock data
  - Filter by status → Verify filtered results
  - Click task card → Verify navigation to /tasks/{id}
- Integration tests: Playwright
  - E2E flow: Login → Navigate to /tasks → See task list
  - Responsive test: Verify 1/2/3 column layout at different widths

**Phase Context**: Phase II - Next.js Frontend with FastAPI Backend
- Technologies: Next.js 16, React Server Components, Better Auth, Tailwind CSS
- Constraints:
  - Server Components for initial data fetch (SEO, performance)
  - Client Components for interactivity (filters, buttons)
  - JWT authentication (accessToken in Authorization header)
  - Mobile-first responsive design
- Evolution: Phase I CLI → Phase II web UI with modern React patterns

**Success Criteria**:
- [x] Page renders task list from FastAPI backend
- [x] Responsive grid (3-col → 2-col → 1-col)
- [x] FilterBar filters tasks by status and priority
- [x] TaskCard displays all required fields (title, priority, status, date)
- [x] Click task navigates to detail page
- [x] Loading and empty states implemented
- [x] WCAG 2.1 AA accessibility (ARIA, keyboard, focus)
- [x] Dark mode support
- [x] Tests pass (unit + E2E)

**References**:
- Architecture: .claude/skills/architecture-specification/README.md (Frontend structure)
- UI Spec: .claude/skills/ui-specification/README.md (TaskListPage wireframe + TaskCard component)
- API Spec: .claude/skills/api-database-specification/README.md (GET /api/{user_id}/tasks endpoint)
```

---

### Example 3: Vague → Refined (AI Chatbot)

**Before (Vague)**:
```
"Add chatbot for tasks"
```

**After (Refined)**:
```markdown
Act as AI Chatbot Agent and implement ChatKit conversational interface for task management in Phase III of Evolution of Todo.

**Specification Reference**: specs/phase-iii/spec.md + specs/ui/chatkit.md

**Feature Requirements**:
- User stories:
  - As a user, I can add tasks via natural language ("Add a task to buy milk with high priority")
  - As a user, I can list tasks via conversational query ("Show my pending tasks")
  - As a user, I can update tasks ("Mark task 5 as completed")
  - As a user, I can delete tasks ("Delete the milk task")
  - As a user, I can use voice input (Phase III enhancement)
- Acceptance criteria:
  - Chatbot understands task intents (add, list, update, delete)
  - MCP tools execute backend operations (add_task, list_tasks, update_task, delete_task)
  - Tool calls shown as visual indicators ("Calling add_task tool...")
  - Task results embedded as TaskCard previews in chat
  - Multi-turn conversation support (context retention)
  - Multilingual support (English, Spanish, French)

**Technical Implementation**:

### Frontend
- Framework: OpenAI ChatKit SDK + Next.js 16
- File: frontend/app/chat/page.tsx
- Components (per specs/ui/chatkit.md):
  - ChatWindow (Client Component)
    - ChatHeader - "Evolution of Todo Assistant" + user menu
    - MessageList - Scrollable conversation history
      - UserMessage (right-aligned, blue bubble)
      - AssistantMessage (left-aligned, gray bubble)
      - ToolCallIndicator (centered, yellow bubble with status)
      - TaskCardPreview (embedded in assistant message)
    - ChatInput - Text area + voice button + send button
- Styling: Tailwind per specs/ui/chatkit.md
  - User message: `bg-blue-500 text-white rounded-lg rounded-br-none px-4 py-2`
  - Assistant message: `bg-gray-100 dark:bg-gray-700 rounded-lg rounded-bl-none`
  - Tool indicator: `bg-yellow-100 border border-yellow-300 flex items-center gap-2`

### AI Integration
- Model: Claude Opus 4.5 (via Claude Agents SDK)
- File: chatbot/agent.py
- MCP Tools (per specs/api/mcp-tools.md):
  1. **add_task**
     - Parameters: title (str, required), description (str, optional), priority (str, enum: high/medium/low)
     - Backend call: POST /api/{user_id}/tasks
     - Response: Task object with id
  2. **list_tasks**
     - Parameters: status (str, optional), priority (str, optional)
     - Backend call: GET /api/{user_id}/tasks?status={status}&priority={priority}
     - Response: List of Task objects
  3. **update_task**
     - Parameters: task_id (int, required), status (str, optional), priority (str, optional)
     - Backend call: PATCH /api/{user_id}/tasks/{task_id}
     - Response: Updated Task object
  4. **delete_task**
     - Parameters: task_id (int, required)
     - Backend call: DELETE /api/{user_id}/tasks/{task_id}
     - Response: Success message

### MCP Server Configuration
- File: chatbot/mcp_server.py
- Tool registration:
  ```python
  from anthropic import Anthropic, Tool

  tools = [
      Tool(
          name="add_task",
          description="Add a new task to the user's todo list",
          input_schema={
              "type": "object",
              "properties": {
                  "title": {"type": "string", "description": "Task title (1-500 chars)"},
                  "description": {"type": "string", "description": "Optional task description"},
                  "priority": {"type": "string", "enum": ["high", "medium", "low"]},
              },
              "required": ["title"],
          },
      ),
      # ... list_tasks, update_task, delete_task tools
  ]

  client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
  response = client.messages.create(
      model="claude-opus-4-5",
      tools=tools,
      messages=[{"role": "user", "content": user_input}],
  )
  ```

### NLU Intent Detection
- Extract task operations from natural language:
  - "Add milk" → add_task(title="milk")
  - "High priority: Finish report" → add_task(title="Finish report", priority="high")
  - "Show completed tasks" → list_tasks(status="completed")
  - "Mark 5 as done" → update_task(task_id=5, status="completed")
  - "Delete the milk task" → Requires disambiguation if multiple matches

### Voice Input (Phase III Enhancement)
- Technology: Web Speech API (browser) + Whisper API (server fallback)
- File: frontend/components/VoiceInput.tsx
- Flow:
  1. User clicks microphone button
  2. Browser records audio (Web Speech API)
  3. Audio sent to backend: POST /api/transcribe
  4. Whisper API transcribes: "Add a task to buy milk"
  5. Transcription sent to chatbot as text message
  6. Chatbot responds with add_task tool call

### Multilingual Support
- Languages: English, Spanish, French
- Detection: Automatic language detection from user message
- Response: Claude Opus 4.5 responds in detected language
- Example:
  - User: "Ajouter une tâche: Acheter du lait" (French)
  - Assistant: "J'ai ajouté la tâche 'Acheter du lait' avec succès!" (French response)

### Testing
- Unit tests: pytest (chatbot/tests/test_agent.py)
  - Test intent detection ("Add milk" → add_task intent)
  - Test tool parameter extraction (priority parsing)
- Integration tests: Playwright
  - E2E: Type message → See tool call indicator → See task preview
  - Voice input: Click mic → Speak → See transcription → Task added
  - Multilingual: Type Spanish message → Receive Spanish response

**Phase Context**: Phase III - AI-Native Chatbot with MCP Tools
- Technologies: OpenAI ChatKit, Claude Opus 4.5, Claude Agents SDK, MCP, Whisper API
- Constraints:
  - All task operations must go through MCP tools (no direct DB access)
  - Tool calls must be visible to user (transparency)
  - Multi-turn conversation context retained (session-based)
  - Voice input optional (graceful degradation if browser unsupported)
- Evolution: Phase II web forms → Phase III conversational AI interface

**Success Criteria**:
- [x] ChatKit UI renders with message bubbles
- [x] Claude Opus 4.5 detects task intents from natural language
- [x] MCP tools (add_task, list_tasks, update_task, delete_task) implemented
- [x] Tool calls shown as indicators with completion status
- [x] TaskCard previews embedded in assistant messages
- [x] Voice input functional (Web Speech API + Whisper fallback)
- [x] Multilingual support (EN, ES, FR)
- [x] Multi-turn conversation works (context retained)
- [x] Tests pass (unit + E2E)

**References**:
- Architecture: .claude/skills/architecture-specification/README.md (Phase III diagram)
- API Spec: .claude/skills/api-database-specification/README.md (MCP tools definitions)
- UI Spec: .claude/skills/ui-specification/README.md (ChatKit interface wireframes)
- Constitution: .specify/memory/constitution.md (Principle 2: AI-Implemented, Phase III)
```

---

## Related Agents

All Evolution of Todo agents benefit from this skill:

- **Project Manager Agent**: Refines milestone and deliverable requests
- **Spec Architect Agent**: Transforms feature ideas into detailed specs
- **System Architect Agent**: Adds architecture context to design requests
- **Backend / FastAPI Pro Agent**: Gets precise API implementation instructions
- **Frontend UI/UX Agent**: Receives detailed UI component specifications
- **Console App Agent**: Gets Phase I CLI requirements with exact commands
- **AI Chatbot Agent**: Receives MCP tool specs and NLU requirements
- **CloudOps & Kubernetes Agent**: Gets precise deployment configurations
- **CI/CD Agent**: Receives pipeline specs with exact workflows
- **Testing & QA Agent**: Gets test case details from acceptance criteria
- **Code Quality & Integration Agent**: Receives linting and compliance rules

---

## Success Metrics

The Prompt Refinement Skill is successful when:

✅ **Complete Context**: Refined prompts include all necessary specifications, phase details, and technical context
✅ **Zero Ambiguity**: Agents can execute without clarification questions
✅ **Spec Citations**: All relevant specification documents referenced with exact sections
✅ **Phase Alignment**: Technology stack matches phase requirements from Constitution
✅ **Testable**: Success criteria are concrete and measurable
✅ **Efficient**: Reduces back-and-forth by 80%+ (1 refined prompt vs 5+ clarifications)
✅ **Reusable**: Pattern applicable to any Spec-Driven Development project

---

## Best Practices

### Do's ✅
- Always cite existing specs (architecture, API, database, UI)
- Include phase number and technologies explicitly
- Add multi-tenant security reminders for backend tasks
- Specify exact file paths for implementation
- Include both happy path and edge cases
- Link to Constitution principles when relevant
- Add success criteria checklist
- Provide code snippets for critical patterns (e.g., user_id filtering)

### Don'ts ❌
- Don't assume agent knows the project structure (specify file paths)
- Don't skip phase context (technologies change per phase)
- Don't forget multi-tenant security (critical for hackathon)
- Don't use vague terms like "API" without specifying FastAPI/Express/etc.
- Don't omit error handling requirements
- Don't forget testing requirements
- Don't skip accessibility for frontend tasks
- Don't ignore Constitution principles (they're constraints)

---

## Integration with Other Skills

### Workflow Integration

```
User Request (vague)
  ↓
Prompt Refinement Skill (this skill)
  ↓
Refined Prompt (spec-referenced, phase-specific)
  ↓
Agent Execution (Spec Authoring, Architecture, Implementation)
  ↓
Output Validation (Testing & QA Agent)
```

### Skill Combinations

**Spec Authoring + Prompt Refinement**:
```
1. User: "Build task management"
2. Prompt Refinement: Add phase context, tech stack
3. Spec Authoring: Create specs/phase-ii/spec.md
4. Prompt Refinement: Reference new spec in implementation prompts
```

**Architecture + Prompt Refinement**:
```
1. System Architect creates Phase II architecture diagram
2. Prompt Refinement injects diagram reference into prompts
3. Backend Agent implements per architecture layout
```

**UI Specification + Prompt Refinement**:
```
1. Spec Architect creates TaskListPage wireframe
2. Prompt Refinement references wireframe in implementation prompt
3. Frontend Agent implements exact layout
```

---

## Output Format

When using this skill, output:

**1. Original Prompt Analysis** (gaps identified)
**2. Applicable Specifications** (links to existing docs)
**3. Phase Context** (technologies, constraints, evolution)
**4. Technical Detail Expansion** (vague → precise mapping)
**5. Refined Prompt** (complete, actionable, spec-referenced)

Save refined prompts to:
- `history/prompts/<feature-name>/refined-prompt.md` (for reuse)
- Or use directly in agent activation

---

## References

- **Constitution**: `.specify/memory/constitution.md` (8 principles, 5 phases)
- **Architecture Skill**: `.claude/skills/architecture-specification/README.md` (Monorepo layout, phase diagrams)
- **API/DB Skill**: `.claude/skills/api-database-specification/README.md` (REST endpoints, MCP tools, SQLModel)
- **UI Skill**: `.claude/skills/ui-specification/README.md` (Next.js pages, ChatKit UI)
- **Spec Authoring Skill**: `.claude/skills/spec-authoring/README.md` (User stories, acceptance criteria)

---

**Document Version**: 1.0.0
**Created**: 2025-12-24
**Total Examples**: 3 (Backend API, Frontend Page, AI Chatbot)
**Coverage**: All 5 Hackathon II Phases

---

*This prompt refinement skill is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*
