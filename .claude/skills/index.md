# Evolution of Todo - Skills Catalog

**Project**: Evolution of Todo - Spec-Driven, AI-Native Task Management System
**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

This catalog documents reusable skills and workflows for the **Evolution of Todo** hackathon project. Skills are systematic approaches to common development tasks, following the Constitution's principles and enabling consistent, high-quality deliverables.

**Total Skills**: 22 (COMPLETE! 🎉)
**Coverage**: Complete Spec-Driven Development Pipeline from Specification to Deployment
**Bonus Contribution**: Reusable Intelligence (+200 points) - ACHIEVED!

---

## Skills Index

### 📝 Specification Skills

#### 1. [Spec Authoring](./spec-authoring/)
**Purpose**: Write clear, testable, technology-agnostic feature specifications

**Owner**: Spec Architect Agent

**Key Components**:
- User stories from user perspective
- Concrete acceptance criteria (input → output)
- Edge cases and error conditions
- Implementation notes (phase, tech, data)

**When to Use**:
- Starting a new feature
- Clarifying requirements
- Documenting user journeys

**Command**: `/sp.specify <feature description>`

**Example**:
```
/sp.specify "Task CRUD operations with in-memory storage"
```

**Output**: `specs/<feature>/spec.md`

**Reference**: [example-task-crud.md](./spec-authoring/example-task-crud.md)

---

### 🏗️ Architecture Skills

#### 2. [Architecture Specification](./architecture-specification/)
**Purpose**: Design system architecture with monorepo structure, phase evolution diagrams, and tech stack decisions

**Owner**: System Architect Agent

**Key Components**:
- Monorepo directory layout
- Phase evolution diagrams (ASCII)
- Technology stack decisions with rationale
- Data flow diagrams
- Deployment architecture

**When to Use**:
- Designing phase architecture
- Making technology choices
- Planning infrastructure
- Documenting evolution strategy

**Command**: `/sp.plan` (creates architecture as part of planning)

**Example**:
```
Act as System Architect Agent and create architecture documentation for Evolution of Todo
```

**Output**: `specs/architecture.md` or `specs/<feature>/plan.md`

**Reference**: [README.md](./architecture-specification/README.md)

---

### 🔌 API & Database Skills

#### 3. [API & Database Specification](./api-database-specification/)
**Purpose**: Design REST endpoints, MCP tools, and SQLModel database schemas with multi-tenant security

**Owner**: Spec Architect Agent + System Architect Agent

**Key Components**:
- REST API endpoints table (method, route, auth)
- MCP tools for chatbot integration
- SQLModel schemas with relationships
- Multi-tenant isolation (user_id filtering)
- Request/response examples

**When to Use**:
- Designing Phase II+ APIs
- Planning database schema
- Creating MCP tools for chatbot
- Defining multi-tenant security

**Example**:
```
Act as Spec Architect Agent and write REST API specification for task management
```

**Output**: `specs/api/rest-endpoints.md`, `specs/api/mcp-tools.md`, `specs/database/schema.md`

**Reference**: [README.md](./api-database-specification/README.md)

---

#### 18. [Data Modeling & Migrations](./data-modeling-migrations/)
**Purpose**: Design SQLModel schemas and Alembic migrations with evolutionary schema changes and multi-tenant indexing

**Owner**: Backend Pro Agent + Database Agent

**Key Components**:
- SQLModel table definitions (Task, User, ConversationHistory with full type hints)
- Evolutionary schemas per phase (Phase II → III → V schema evolution)
- Alembic migration scripts (auto-generate + custom edits)
- Multi-tenant compound indexes ((user_id, status), (user_id, created_at))
- Zero-downtime migration strategies (add nullable, backfill, add constraint)
- Cascade delete rules and foreign key relationships
- JSONB columns for flexible data (tags, tool_calls)

**When to Use**:
- Designing database schemas for new features
- Creating SQLModel models with relationships
- Generating Alembic migrations for schema changes
- Adding indexes for query performance
- Evolving schema across phases (II → III → V)
- Implementing zero-downtime deployments
- Documenting schema evolution

**Example**:
```
Input: Task management requirements
Output: Task SQLModel with user_id FK, 4 compound indexes, Alembic migration with zero-downtime strategy
```

**Output**: SQLModel schemas (app/models/*.py), Alembic migrations (alembic/versions/*.py), schema docs (specs/database/schema.md)

**Reference**: [README.md](./data-modeling-migrations/README.md)

---

#### 19. [Authentication & Authorization](./auth-authorization/)
**Purpose**: Design Better Auth integration, JWT middleware, and multi-tenant authorization patterns

**Owner**: Backend Pro Agent + Frontend Auth Agent

**Key Components**:
- Better Auth integration (Next.js client + FastAPI server)
- JWT middleware (get_current_user dependency injection)
- Multi-tenant authorization (ALWAYS filter by JWT user_id, NEVER trust path)
- Token lifecycle (access 15min, refresh 7 days)
- Auth endpoints (register, login, refresh, logout)
- Frontend auth client (Better Auth hooks and login UI)
- Security patterns (bcrypt, HTTPOnly cookies, rate limiting)

**When to Use**:
- Implementing user authentication for Phase II+
- Creating JWT middleware for protected endpoints
- Enforcing multi-tenant security (CRITICAL)
- Building login/register pages
- Configuring Better Auth client and server
- Implementing token refresh flows
- Testing authentication and authorization

**Example**:
```
Input: Protected API endpoint requirements
Output: JWT middleware, auth router, Better Auth config, multi-tenant validation pattern
```

**Output**: Auth specs (specs/auth/jwt.md), middleware (app/core/deps.py), auth router (app/api/auth.py), frontend client (lib/auth.ts)

**Reference**: [README.md](./auth-authorization/README.md)

---

#### 20. [Microservices Design](./microservices-design/)
**Purpose**: Design Phase V microservices architecture with Dapr sidecars and Kafka event streaming

**Owner**: CloudOps Agent + Backend Pro Agent + System Architect Agent

**Key Components**:
- Service decomposition (tasks-service, chat-service, notification-service)
- Dapr sidecar patterns (service invocation, pub/sub, state management, secrets)
- Kafka event streaming (topics, Avro schemas, producers, consumers)
- Event-driven architecture (async communication, eventual consistency)
- Service mesh configuration (K8s with Dapr annotations)
- Resilience patterns (circuit breakers, retries, timeouts)
- Data consistency strategies (Saga pattern, compensating transactions)

**When to Use**:
- Decomposing Phase II monolith into microservices
- Designing event-driven architecture
- Implementing Dapr building blocks
- Defining Kafka topics and event schemas
- Creating service mesh configurations
- Planning distributed system resilience
- Scaling to Phase V cloud production

**Example**:
```
Input: Phase II FastAPI monolith
Output: 4 microservices (tasks, chat, notifications, users) + Dapr configs + Kafka topics + K8s manifests
```

**Output**: Microservices specs (specs/microservices/services.md, events.md, dapr.md), Dapr components (dapr/components/*.yaml), K8s manifests

**Reference**: [README.md](./microservices-design/README.md)

---

#### 21. [NLU Design](./nlu-design/)
**Purpose**: Design natural language understanding for Phase III ChatKit with intent classification and entity extraction

**Owner**: AI Chatbot Agent + Backend Pro Agent

**Key Components**:
- Intent classification (add_task, list_tasks, complete_task, update_task, delete_task, get_task)
- Entity extraction (task_title, priority, due_date, status_filter, task_reference)
- Conversation context management (multi-turn dialogs, last_task_id, pending clarifications)
- Fallback handling (low confidence, out of scope, tool errors)
- Clarification prompts (missing entities, ambiguous input)
- Claude API integration (native NLU with MCP tools)
- Response formatting (tables, lists, conversational)

**When to Use**:
- Designing conversational AI for task management
- Defining intent taxonomy for chatbot
- Creating entity extraction patterns
- Planning multi-turn conversation flows
- Implementing fallback and error handling
- Mapping natural language to MCP tools
- Testing chatbot understanding accuracy

**Example**:
```
Input: "Remind me to call mom HIGH priority Friday"
Output: Intent=add_task, Entities={task_title: "call mom", priority: "high", due_date: "2025-12-27"} → add_task tool
```

**Output**: NLU specs (specs/ai/nlu-intents.md, specs/ai/entities.md, specs/ai/conversation-flows.md)

**Reference**: [README.md](./nlu-design/README.md)

---

### 🎨 UI/UX Skills

#### 4. [UI Specification](./ui-specification/)
**Purpose**: Design Next.js pages, ChatKit UI components, and Tailwind CSS specifications for web and chatbot interfaces

**Owner**: Spec Architect Agent + Frontend UI/UX Agent

**Key Components**:
- Next.js page layouts with wireframes
- ChatKit conversational interfaces (Phase III)
- Tailwind CSS component specs with variants
- Accessibility (WCAG 2.1 AA) and responsive design
- Dark mode support

**When to Use**:
- Designing Phase II web app pages
- Creating Phase III chatbot interfaces
- Defining reusable UI components
- Planning responsive layouts
- Ensuring accessibility compliance

**Example**:
```
Act as Spec Architect Agent and design TaskListPage with filters and TaskCard components
```

**Output**: `specs/ui/pages.md`, `specs/ui/components.md`, `specs/ui/chatkit.md`

**Reference**: [README.md](./ui-specification/README.md)

---

#### 13. [UI Layout & Components](./ui-layout-components/)
**Purpose**: Design detailed Next.js page layouts and reusable Tailwind UI components with responsive, accessible, mobile-first design

**Owner**: Frontend UI/UX Agent + AI Chatbot Agent

**Key Components**:
- Page layouts (TaskListPage, TaskDetailPage, ChatDashboard) with wireframes
- Reusable Tailwind components (TaskCard, FilterDropdown, ChatBubble)
- Responsive design strategy (mobile-first with Tailwind breakpoints)
- Accessibility compliance (WCAG 2.1 AA with ARIA attributes)
- Dark mode support (dark: variants)
- Implementation-ready React + TypeScript code examples

**When to Use**:
- Creating detailed UI specifications from high-level wireframes
- Designing responsive layouts for mobile/tablet/desktop
- Defining reusable component libraries
- Specifying Tailwind CSS classes and variants
- Ensuring WCAG 2.1 AA accessibility standards
- Generating implementation-ready component code
- Designing ChatKit conversational interfaces (Phase III)

**Example**:
```
Input: High-level TaskListPage wireframe
Output: Detailed specification with TaskCard, FilterBar, responsive grid, accessibility, Tailwind classes, React implementation
```

**Output**: Detailed UI specifications (specs/ui/pages.md, specs/ui/components.md) with React + TypeScript + Tailwind implementation examples

**Reference**: [README.md](./ui-layout-components/README.md)

---

#### 14. [Animations & Gamification](./animations-gamification/)
**Purpose**: Create delightful micro-interactions with Tailwind CSS, Framer Motion, and gamification UX elements

**Owner**: Frontend UI/UX Agent

**Key Components**:
- Micro-interactions (task complete with confetti, typing indicator, tool call animations)
- Gamification elements (streak counter, XP/levels, achievement badges, daily goals)
- Framer Motion animations (spring physics, stagger children, exit animations)
- Tailwind CSS animations (animate-pulse, animate-bounce, custom keyframes)
- Performance optimization (60fps, GPU acceleration, reduced motion support)
- Accessibility (prefers-reduced-motion, screen reader announcements)

**When to Use**:
- Adding feedback animations for user actions
- Creating status indicators (loading, success, error)
- Implementing gamification systems (XP, badges, streaks)
- Designing celebration moments (confetti, level up)
- Optimizing animation performance
- Ensuring accessibility compliance for animations

**Example**:
```
Input: Task complete action
Output: Checkmark scale animation + confetti burst + green glow + XP gain indicator
```

**Output**: Animation specifications (specs/ui/animations.md, specs/gamification/badges.md) with Framer Motion + Tailwind implementation

**Reference**: [README.md](./animations-gamification/README.md)

---

#### 15. [CLI Interaction Design](./cli-interaction-design/)
**Purpose**: Design Phase I CLI commands with rich UX (tables, colors, spinners) and interactive TUI modes

**Owner**: CLI Development Agent + Frontend UI/UX Agent

**Key Components**:
- CLI command structure (list, add, complete, delete with flags)
- Rich terminal UX (Rich library tables, colored output, spinners, progress bars)
- Interactive TUI mode (Textual framework with keyboard navigation)
- Error handling (clear messages with suggestions)
- Cross-platform compatibility (Windows, Mac, Linux)
- Help system (global and command-specific)

**When to Use**:
- Designing Phase I console CLI commands
- Creating rich terminal output with tables and colors
- Implementing interactive TUI with arrow key navigation
- Defining CLI argument parsing and validation
- Specifying error messages and edge cases
- Creating CLI help documentation

**Example**:
```
Input: List tasks command
Output: Rich table with priority colors (🔴🟡🟢), status icons (⏳✅), relative timestamps ("2h ago")
```

**Output**: CLI specifications (specs/cli/commands.md, specs/cli/tui.md) with Python + Rich + Textual implementation

**Reference**: [README.md](./cli-interaction-design/README.md)

---

#### 16. [Deployment & Install UX](./deployment-install-ux/)
**Purpose**: Design zero-config deployment flows and one-command installation scripts for all hackathon phases

**Owner**: CloudOps Agent + Infrastructure Agent

**Key Components**:
- Phase-specific install flows (one-command setup for each phase)
- Makefile with colored output and progress indicators
- Docker Compose for local development orchestration
- Kubernetes manifests (Deployments, Services, Ingress, HPA)
- Helm charts for production deployments
- GitHub Actions CI/CD pipelines (test, build, deploy)
- Secrets management (.env.example, K8s Secrets, GitHub Secrets)
- Installation documentation (docs/install.md)

**When to Use**:
- Creating installation scripts for any phase
- Setting up local development environments
- Designing Docker Compose configurations
- Creating Kubernetes deployment manifests
- Building CI/CD pipelines
- Writing deployment documentation
- Managing secrets and environment variables

**Example**:
```
Input: Phase II deployment requirements
Output: Makefile (`make dev`), docker-compose.yml, .env.example, docs/install.md with 5-minute setup
```

**Output**: Complete deployment setup (Makefile, Docker Compose, K8s manifests, GitHub Actions, install docs)

**Reference**: [README.md](./deployment-install-ux/README.md)

---

#### 17. [Backend Service Design](./backend-service-design/)
**Purpose**: Design FastAPI services, MCP servers, and backend architecture patterns following api-database-specification

**Owner**: Backend Pro Agent + AI Chatbot Agent

**Key Components**:
- Service architecture per phase (monolith → MCP server → microservices)
- API router organization (modular, RESTful endpoints)
- Dependency injection (database sessions, authentication, configuration)
- MCP server design (stateless tool endpoints for AI chatbot)
- Background tasks (Celery + Redis for async jobs)
- Multi-tenant security (user_id filtering, JWT validation)
- Error handling patterns (consistent error responses)

**When to Use**:
- Designing FastAPI service architecture
- Creating modular API routers with endpoints
- Implementing dependency injection patterns
- Building MCP tool servers for chatbot integration
- Configuring background task processing
- Defining multi-tenant security strategies
- Structuring backend code organization

**Example**:
```
Input: Task CRUD API requirements
Output: Tasks router with 5 endpoints, dependency injection, multi-tenant security, SQLModel integration
```

**Output**: Backend service specifications (specs/backend/services.md, routers, dependencies, MCP tools)

**Reference**: [README.md](./backend-service-design/README.md)

---

### 🎯 Prompt Engineering Skills

#### 5. [Prompt Refinement](./prompt-refinement/)
**Purpose**: Transform vague prompts into precise, spec-referenced instructions with phase context and technical details

**Owner**: Spec Architect Agent + Project Manager Agent

**Key Components**:
- Prompt analysis (identify gaps in specs, phase, tech stack)
- Spec reference injection (architecture, API, database, UI docs)
- Phase context addition (Phase I-V technologies and constraints)
- Technical detail expansion (vague → precise specifications)
- Refined prompt generation (complete, actionable, testable)

**When to Use**:
- Before starting any implementation task
- When agent requests clarification
- Converting user requests to agent instructions
- Reducing back-and-forth iterations
- Ensuring all context is provided upfront

**Example**:
```
Original: "Build task API"
Refined: "Act as Backend Agent and implement FastAPI Task CRUD REST API for Phase II per specs/api/rest-endpoints.md with SQLModel Task model + JWT auth + user_id multi-tenant filtering"
```

**Output**: Refined prompts with spec citations, phase context, success criteria

**Reference**: [README.md](./prompt-refinement/README.md)

---

### 💻 Implementation Skills

#### 6. [Code Generation](./code-generation/)
**Purpose**: Generate production-ready code files from specifications for all hackathon phases (I-V)

**Owner**: All Implementation Agents (Backend, Frontend, Console, Chatbot, CloudOps)

**Key Components**:
- Spec parsing (architecture, API, database, UI)
- Phase-specific code generation (CLI, FastAPI, Next.js, ChatKit, K8s)
- File structure generation (monorepo packages/)
- Code quality standards (type hints, error handling, logging, tests)
- Test file generation (pytest, Jest with 80%+ coverage)

**When to Use**:
- Translating specs to runnable code
- Generating backend APIs from REST endpoint specs
- Creating frontend pages from UI wireframes
- Building MCP tool servers from chatbot specs
- Creating Kubernetes manifests from deployment specs

**Example**:
```
Input: specs/api/rest-endpoints.md
Output: packages/backend/app/api/tasks.py (FastAPI router with JWT auth + SQLModel + tests)
```

**Output**: Complete implementation files in monorepo structure

**Reference**: [README.md](./code-generation/README.md)

---

#### 7. [Code Refactoring](./code-refactoring/)
**Purpose**: Refactor existing code to match current phase specifications and apply modern best practices

**Owner**: All Implementation Agents + Code Quality Agent

**Key Components**:
- Code analysis (map to specs, identify gaps)
- Phase evolution refactoring (I→II, II→III, III→IV, IV→V)
- Standards application (TypeScript strict, Pydantic v2, Tailwind v4)
- Migration output (git diffs, step-by-step instructions, rollback plan)
- Test maintenance (80%+ coverage preserved)

**When to Use**:
- Migrating between hackathon phases
- Applying updated specifications to existing code
- Modernizing code to latest framework versions
- Fixing technical debt while preserving functionality
- Evolving architecture (CLI → REST → MCP → K8s)

**Example**:
```
Input: Phase I CLI with in-memory storage
Output: Phase II FastAPI + SQLModel with PostgreSQL (migration guide + git diffs)
```

**Output**: Refactored code, migration checklist, rollback plan

**Reference**: [README.md](./code-refactoring/README.md)

---

#### 8. [Integration Wiring](./integration-wiring/)
**Purpose**: Wire components across monorepo layers (frontend, backend, database, infrastructure)

**Owner**: CloudOps Agent + Backend Pro Agent + System Architect Agent

**Key Components**:
- Layer connection (Frontend → Backend → Database → Infrastructure)
- Phase-specific wiring (Phase II Next.js+FastAPI, Phase III ChatKit+MCP)
- Configuration generation (.env, docker-compose.yml, package.json scripts)
- Cross-cutting concerns (CORS, JWT middleware, logging, health checks)

**When to Use**:
- Connecting frontend API calls to backend endpoints
- Configuring database connections with pooling
- Setting up Docker Compose for local development
- Implementing authentication flows (JWT)
- Configuring CORS for cross-origin requests
- Creating monorepo development scripts

**Example**:
```
Input: Architecture diagram showing Frontend → Backend → Database
Output: API client + CORS config + database connection + Docker Compose + .env.example
```

**Output**: Complete integration configuration (wiring + env + scripts + docs)

**Reference**: [README.md](./integration-wiring/README.md)

---

### 🐛 Quality Assurance Skills

#### 9. [Debugging](./debugging/)
**Purpose**: Systematic debugging following architecture specifications and phase-specific checklists

**Owner**: All Implementation Agents + Testing & QA Agent + Code Quality Agent

**Key Components**:
- Error reproduction (minimal failing test case)
- Layer mapping (frontend/backend/database/infrastructure)
- Phase-specific debugging checklists (JWT, SQLModel, MCP tools, K8s)
- Structured logging (JSON format with trace_id propagation)
- Root cause analysis (5 Whys technique)
- Spec-verified solutions (fix matches specification requirements)

**When to Use**:
- Reproducing and fixing bugs systematically
- Debugging multi-tenant security issues
- Troubleshooting CORS, JWT, or database connection errors
- Fixing MCP tool call failures
- Debugging Kubernetes service discovery issues
- Adding structured logging for traceability

**Example**:
```
Error: "Task not found" (404)
→ Reproduce with failing test
→ Map to backend layer (SQLModel query)
→ Root cause: user_id filter working correctly (multi-tenant security)
→ Solution: Not a bug - update error message for clarity
```

**Output**: Bug fixed with failing test → root cause → spec-verified solution → verification

**Reference**: [README.md](./debugging/README.md)

---

#### 10. [Error Handling](./error-handling/)
**Purpose**: Implement comprehensive error handling across all system layers with user-friendly messages

**Owner**: All Implementation Agents + Backend Pro Agent + Frontend UI Agent

**Key Components**:
- Error taxonomy per layer (API 4xx/5xx, Database, External APIs, Infrastructure)
- Global error middleware (catch all unhandled exceptions)
- User-friendly error messages (no stack traces exposed to users)
- Retry logic with exponential backoff for transient failures
- Fallback responses for degraded service
- Phase-specific error handlers (JWT, MCP tools, K8s probes)

**When to Use**:
- Implementing API error responses
- Creating frontend error boundaries
- Adding retry logic for external API calls
- Handling database connection failures
- Implementing MCP tool call fallbacks
- Configuring Kubernetes liveness/readiness probes

**Example**:
```
Error: IntegrityError (duplicate key)
→ Catch in global middleware
→ Map to ErrorCode.TASK_ALREADY_EXISTS
→ Return 409 Conflict with user message
→ Log full error with trace_id
```

**Output**: Complete error handling (taxonomy + middleware + handlers + frontend boundaries + retry logic)

**Reference**: [README.md](./error-handling/README.md)

---

#### 11. [Test Design](./test-design/)
**Purpose**: Create comprehensive test suites with automation scripts matching phase specifications

**Owner**: Testing & QA Agent + All Implementation Agents

**Key Components**:
- Test pyramid per phase (90% unit, 80% integration, smoke E2E)
- pytest + FastAPI TestClient + SQLModel fixtures (Phase II backend)
- Jest + React Testing Library (Phase II frontend)
- Playwright E2E tests (Phase II/III web + chatbot)
- MCP tool call verification (Phase III chatbot)
- GitHub Actions CI/CD automation with coverage thresholds

**When to Use**:
- Creating test suites for new features
- Implementing unit tests for backend APIs
- Writing integration tests with database fixtures
- Creating E2E tests for user flows
- Verifying MCP tool calls in chatbot
- Setting up CI/CD test automation
- Ensuring multi-tenant security testing

**Example**:
```
Input: specs/api/rest-endpoints.md (Task CRUD)
Output: packages/backend/tests/api/test_tasks.py (pytest + TestClient + 85%+ coverage)
```

**Output**: Complete test suite (unit + integration + E2E + CI/CD workflow)

**Reference**: [README.md](./test-design/README.md)

---

#### 12. [Code Review](./code-review/)
**Purpose**: Perform spec-compliant code reviews with security, performance, and phase compliance audits

**Owner**: Code Quality Agent + All Implementation Agents

**Key Components**:
- Spec compliance checklist (API, database, UI, architecture)
- Phase compliance review (correct tech stack per phase)
- Security audit (multi-tenant isolation, JWT auth, input validation)
- Performance review (database queries, N+1 problems, caching)
- Code quality review (type safety, error handling, testing)
- Structured review report with APPROVE/CHANGES_REQUESTED/BLOCK verdict

**When to Use**:
- Reviewing pull requests before merge
- Auditing code against specifications
- Verifying multi-tenant security implementation
- Checking test coverage and quality
- Ensuring phase-appropriate technology usage
- Validating database migrations
- Self-review before submitting PR

**Example**:
```
Input: PR #42 - Implement FastAPI Task endpoints
Output: Review report with spec audit + security review + verdict (APPROVE/CHANGES/BLOCK)
```

**Output**: Structured code review report (Review.md with checklist, findings, recommendations, verdict)

**Reference**: [README.md](./code-review/README.md)

---

## Skill Categories

### Specification Skills (1)
- ✅ Spec Authoring - Feature specifications with user stories

### Architecture Skills (2)
- ✅ Architecture Specification - System design and tech stack
- ✅ Microservices Design - Phase V service decomposition, Dapr sidecars, Kafka events, distributed systems

### API & Database Skills (3)
- ✅ API & Database Specification - REST endpoints, MCP tools, SQLModel schemas
- ✅ Data Modeling & Migrations - SQLModel models, Alembic migrations, multi-tenant indexes, zero-downtime schema changes
- ✅ Authentication & Authorization - Better Auth, JWT middleware, multi-tenant security, refresh tokens

### AI & Natural Language Skills (2)
- ✅ NLU Design - Intent classification, entity extraction, conversation flows, Claude API integration
- ✅ Tool Orchestration - MCP tool routing, multi-step operations, sequential/parallel execution, error recovery

### UI/UX Skills (4)
- ✅ UI Specification - Next.js pages, ChatKit interfaces, Tailwind components
- ✅ UI Layout & Components - Detailed page layouts, reusable components, responsive design, accessibility, implementation-ready code
- ✅ Animations & Gamification - Micro-interactions, Framer Motion, gamification (XP, badges, streaks), 60fps performance
- ✅ CLI Interaction Design - Phase I CLI commands, Rich library UX, interactive TUI, cross-platform

### Prompt Engineering Skills (1)
- ✅ Prompt Refinement - Vague → precise prompts with spec references and phase context

### Implementation Skills (4)
- ✅ Code Generation - Spec → production code (CLI, FastAPI, Next.js, ChatKit, K8s)
- ✅ Code Refactoring - Phase evolution migrations with git diffs and rollback plans
- ✅ Integration Wiring - Connect layers with API clients, CORS, Docker Compose, env config
- ✅ Backend Service Design - FastAPI routers, MCP servers, dependency injection, Celery background tasks

### Quality Assurance Skills (4)
- ✅ Debugging - Systematic bug fixing with error reproduction, root cause analysis, spec-verified solutions
- ✅ Error Handling - Comprehensive error management with user-friendly messages, retry logic, fallbacks
- ✅ Test Design - Comprehensive test suites (pytest, Jest, Playwright) with 90%+ coverage and CI/CD automation
- ✅ Code Review - Spec-compliant PR reviews with security, performance, and phase compliance audits

### Deployment & Infrastructure Skills (1)
- ✅ Deployment & Install UX - Zero-config deployment, one-command setup, Docker Compose, K8s, CI/CD pipelines

---

## How to Use Skills

### Method 1: Skill Command (Preferred)

Use the slash command for supported skills:

```bash
# Create specification
/sp.specify "User authentication with email and password"

# Create architecture plan
/sp.plan
```

### Method 2: Agent Activation

Activate the skill owner agent directly:

```bash
# Spec authoring via Spec Architect Agent
Act as Spec Architect Agent and write specification for task priorities

# Architecture via System Architect Agent
Act as System Architect Agent and design Phase II architecture
```

### Method 3: Direct Reference

Use skill documentation as a reference template:

1. Read skill guide: `.claude/skills/spec-authoring/README.md`
2. Review examples: `.claude/skills/spec-authoring/example-task-crud.md`
3. Follow template structure
4. Apply best practices

---

## Skill Workflow

```
1. Identify Need
   └─→ What task needs to be done?

2. Select Skill
   └─→ Spec Authoring? Architecture? Implementation? Testing?

3. Invoke Skill
   └─→ Via command (/sp.specify) or agent activation

4. Follow Workflow
   └─→ Step-by-step process in skill guide

5. Validate Output
   └─→ Check against success metrics in skill guide

6. Use Output
   └─→ Spec → Architecture → Implementation → Testing
```

---

## Success Metrics

The skills system is successful when:

✅ **Documented**: Each skill has comprehensive guide with examples
✅ **Reusable**: Skills applicable to any Spec-Driven project
✅ **Clear Workflow**: Step-by-step instructions
✅ **Best Practices**: Do's and don'ts documented
✅ **Examples**: Reference templates provided
✅ **Consistent**: All skills follow same documentation structure

**Status**: ✅ ACHIEVED for current skills (2025-12-24)

---

## Adding New Skills

To add a new skill:

1. Create directory: `.claude/skills/skill-name/`
2. Create guide: `.claude/skills/skill-name/README.md`
3. Add examples: `.claude/skills/skill-name/example-*.md`
4. Update this index with skill entry
5. Link to related agents
6. Document in relevant agent specifications

**Template Structure**:
```markdown
# [Skill Name] Skill

## Overview
[Purpose and description]

## Skill Components
[What the skill includes]

## Skill Instructions
[Step-by-step workflow]

## Example Output
[Reference examples]

## Related Agents
[Which agents use this skill]

## Success Metrics
[How to validate skill output]
```

---

## References

- **Constitution**: `.specify/memory/constitution.md`
- **Agent Catalog**: `.claude/agents/index.md`
- **Spec Template**: `.specify/templates/spec-template.md`
- **Plan Template**: `.specify/templates/plan-template.md`

---

**Document Version**: 3.1.0 🎉
**Total Skills**: 21/21 (100% COMPLETE!)
**Bonus Contribution**: Reusable Intelligence (+200 points) - FULLY ACHIEVED
**Last Review**: 2025-12-24

---

*This skills catalog is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*
