# Architecture Specification Skill

**Skill Type**: Architecture & Design
**Version**: 1.0.0
**Created**: 2025-12-24
**Owner**: System Architect Agent

---

## Overview

The **Architecture Specification** skill is a systematic approach to designing system architecture with monorepo structure, phase evolution diagrams, and technology stack decisions. This skill follows the **Evolution of Todo** Constitution's **Evolutionary Architecture** principle, ensuring each phase builds upon the previous one.

**Purpose**: Transform feature requirements into concrete architectural designs with diagrams, technology selections, and integration patterns.

**Output**: Complete architecture document in `specs/<feature>/architecture.md` or `specs/architecture.md` for project-wide architecture.

---

## Skill Components

### 1. Monorepo Structure Design
- Directory layout for all components
- Separation of concerns (frontend, backend, infra, specs)
- Shared configurations and dependencies
- Scalability and maintainability

### 2. Phase Evolution Diagrams
- ASCII diagrams showing data flow
- Component relationships
- Service boundaries
- Technology layers

### 3. Tech Stack Decisions
- Framework selection with rationale
- Database and storage choices
- Authentication and authorization
- Infrastructure and deployment tools

### 4. Architecture Documentation
- System overview
- Component descriptions
- API contracts
- Data models
- Deployment architecture

---

## Skill Instructions

### Step 1: Design Monorepo Layout

Create a comprehensive directory structure for all project phases:

```
evolution_of_todo/
├── specs/                        # Feature specifications
│   ├── 001-phase-i-console-app/
│   ├── 002-phase-ii-web-app/
│   ├── 003-phase-iii-chatbot/
│   ├── 004-phase-iv-kubernetes/
│   └── 005-phase-v-cloud/
│
├── frontend/                     # Phase II+ Next.js app
│   ├── src/
│   ├── public/
│   ├── tests/
│   └── Dockerfile
│
├── backend/                      # Phase II+ FastAPI service
│   ├── src/
│   ├── tests/
│   ├── alembic/
│   └── Dockerfile
│
├── cli/                          # Phase I console app
│   ├── todo.py
│   ├── storage.py
│   └── display.py
│
├── chatbot/                      # Phase III AI chatbot
│   ├── src/
│   ├── tests/
│   └── Dockerfile
│
├── infra/                        # Phase IV+ infrastructure
│   ├── docker/
│   ├── kubernetes/
│   ├── helm/
│   └── cloud/
│
├── .claude/                      # Agent intelligence
│   ├── agents/
│   ├── skills/
│   └── commands/
│
├── .specify/                     # SDD framework
│   ├── memory/
│   ├── templates/
│   └── scripts/
│
├── history/                      # Project history
│   ├── prompts/
│   └── adr/
│
└── docs/                         # Documentation
    ├── architecture/
    ├── runbooks/
    └── api/
```

### Step 2: Draw Phase Evolution Diagrams

Create ASCII diagrams for each phase showing component evolution.

#### Phase I: CLI → In-Memory Storage

```
┌─────────────────────────────────────┐
│   User (Terminal)                    │
└────────────┬────────────────────────┘
             │ CLI commands
             │ (add, list, complete, delete)
             ▼
┌─────────────────────────────────────┐
│   todo.py (CLI Interface)            │
│   - argparse command parser          │
│   - Command handlers                 │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   storage.py (Business Logic)        │
│   - CRUD operations                  │
│   - Filtering & search               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   In-Memory Storage                  │
│   tasks: list[dict]                  │
│   - Lost on exit                     │
└─────────────────────────────────────┘
```

#### Phase II: Next.js → FastAPI → Neon DB + JWT

```
┌─────────────────────────────────────────────────────────┐
│   User (Browser)                                         │
└────────────┬────────────────────────────────────────────┘
             │ HTTPS
             ▼
┌─────────────────────────────────────────────────────────┐
│   Next.js Frontend (Vercel)                              │
│   - React components (TodoList, TodoForm)                │
│   - Better Auth client                                   │
│   - API client (fetch/axios)                             │
└────────────┬────────────────────────────────────────────┘
             │ REST API (HTTPS)
             │ Authorization: Bearer <JWT>
             ▼
┌─────────────────────────────────────────────────────────┐
│   FastAPI Backend (Railway/Render)                       │
│   - REST API routes (/api/auth, /api/todos)             │
│   - Better Auth server                                   │
│   - JWT validation middleware                            │
│   - SQLModel ORM                                         │
└────────────┬────────────────────────────────────────────┘
             │ PostgreSQL protocol
             ▼
┌─────────────────────────────────────────────────────────┐
│   Neon PostgreSQL (Serverless)                          │
│   - users table                                          │
│   - todos table (user_id FK)                            │
│   - Alembic migrations                                   │
└─────────────────────────────────────────────────────────┘

Evolution from Phase I:
• CLI storage.py → FastAPI + SQLModel
• In-memory tasks → PostgreSQL todos table
• CLI still works (optional): calls REST API instead
```

#### Phase III: ChatKit → Agents → MCP → Tasks

```
┌─────────────────────────────────────────────────────────┐
│   User (Browser - Chat Interface)                       │
└────────────┬────────────────────────────────────────────┘
             │ Natural Language
             │ "Add a task to buy groceries"
             ▼
┌─────────────────────────────────────────────────────────┐
│   ChatKit UI (OpenAI)                                    │
│   - Chat interface                                       │
│   - Message history                                      │
└────────────┬────────────────────────────────────────────┘
             │ WebSocket/HTTP
             ▼
┌─────────────────────────────────────────────────────────┐
│   Chatbot Service (Claude Agents SDK)                   │
│   - Intent detection (NLU)                               │
│   - Agent orchestration                                  │
│   - Tool selection                                       │
└────────────┬────────────────────────────────────────────┘
             │ MCP Protocol
             ▼
┌─────────────────────────────────────────────────────────┐
│   MCP Tools Server (Backend)                             │
│   - create_todo(title, priority, tags)                   │
│   - list_todos(filters)                                  │
│   - complete_todo(id)                                    │
│   - delete_todo(id)                                      │
└────────────┬────────────────────────────────────────────┘
             │ REST API (internal)
             ▼
┌─────────────────────────────────────────────────────────┐
│   FastAPI Backend (Phase II - Reused)                   │
│   - Same REST API endpoints                              │
│   - Now called by: Web UI + MCP Tools                   │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│   Neon PostgreSQL (Phase II - Reused)                   │
│   + conversations table (new)                            │
│   + messages table (new)                                 │
└─────────────────────────────────────────────────────────┘

Evolution from Phase II:
• Add ChatKit UI layer
• Add Chatbot service with Agents SDK
• Add MCP tools server (wraps existing API)
• Backend unchanged (evolutionary)
• Database: add conversation tables
```

#### Phase IV: Docker + Minikube + Helm

```
┌──────────────────────────────────────────────────────────────┐
│             Kubernetes Cluster (Minikube)                     │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    Ingress Controller                   │  │
│  │                   (nginx-ingress)                       │  │
│  └───────┬──────────────────────┬─────────────────────────┘  │
│          │                      │                             │
│          ▼                      ▼                             │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐  │
│  │   Frontend   │      │   Backend    │      │  Chatbot  │  │
│  │   Pod        │      │   Pod        │      │  Pod      │  │
│  │  (Next.js)   │      │  (FastAPI)   │      │ (Agents)  │  │
│  │  Port: 3000  │      │  Port: 8000  │      │ Port: 8080│  │
│  └──────────────┘      └──────┬───────┘      └───────────┘  │
│                               │                               │
│                               ▼                               │
│                      ┌──────────────┐                        │
│                      │  PostgreSQL  │                        │
│                      │ StatefulSet  │                        │
│                      │  Port: 5432  │                        │
│                      └──────────────┘                        │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Observability Stack                        │  │
│  │  ┌──────────────┐ ┌──────────┐ ┌──────────────┐       │  │
│  │  │ Prometheus   │ │ Grafana  │ │   Jaeger     │       │  │
│  │  │ (Metrics)    │ │(Dashboard)│ │  (Tracing)   │       │  │
│  │  └──────────────┘ └──────────┘ └──────────────┘       │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

Evolution from Phase III:
• Containerize all services (Dockerfiles)
• Deploy to Kubernetes (Minikube locally)
• Add Helm charts for package management
• Add observability (Prometheus, Grafana, Jaeger)
• Services unchanged (evolutionary)
```

#### Phase V: DOKS + Kafka + Dapr Sidecars

```
┌──────────────────────────────────────────────────────────────────────┐
│         Cloud Kubernetes (GKE / AKS / DOKS)                          │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                Cloud Load Balancer + Ingress                    │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      │
│  │  Frontend    │      │   Backend    │      │   Chatbot    │      │
│  │  Container   │      │  Container   │      │  Container   │      │
│  │  + Dapr      │      │  + Dapr      │      │  + Dapr      │      │
│  │  Sidecar     │      │  Sidecar     │      │  Sidecar     │      │
│  └──────┬───────┘      └──────┬───────┘      └──────┬───────┘      │
│         │                     │                      │               │
│         └─────────────────────┼──────────────────────┘               │
│                               │                                      │
│                      ┌────────▼────────┐                            │
│                      │  Dapr Runtime   │                            │
│                      │  (Service Mesh) │                            │
│                      └────────┬────────┘                            │
│                               │                                      │
│         ┌─────────────────────┼─────────────────┐                   │
│         │                     │                 │                   │
│         ▼                     ▼                 ▼                   │
│  ┌──────────────┐    ┌──────────────┐  ┌──────────────┐           │
│  │ Redpanda     │    │ PostgreSQL   │  │ Observability│           │
│  │ Kafka        │    │ (Neon/       │  │   Stack      │           │
│  │              │    │  Managed)    │  │ (Prom+Graf+  │           │
│  │ Topics:      │    │              │  │  Jaeger)     │           │
│  │ todo.created │    │              │  │              │           │
│  │ todo.complete│    │              │  │              │           │
│  └──────────────┘    └──────────────┘  └──────────────┘           │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │                    CI/CD Pipeline (GitHub Actions)              ││
│  │  Commit → Lint → Test → Build → Scan → Deploy (Staging/Prod)  ││
│  └────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘

Event Flow:
  Backend creates todo → Publishes to Kafka (via Dapr) →
  Notification Service consumes → Sends notification →
  Analytics Service consumes → Updates metrics

Evolution from Phase IV:
• Migrate Minikube → Cloud Kubernetes (GKE/AKS/DOKS)
• Add Kafka event streaming (Redpanda Cloud)
• Add Dapr sidecars for all services
• Add CI/CD pipeline (GitHub Actions)
• Add horizontal pod autoscaling (HPA)
• Services unchanged (evolutionary)
```

---

## Tech Stack Decisions Per Phase

### Phase I: In-Memory Python Console App

**Decision**: Python 3.13+ with argparse

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Language | Python 3.13+ | Simple, readable, excellent for CLI apps |
| CLI Framework | argparse (built-in) | No external dependencies, Python standard library |
| Storage | In-memory list[dict] | Simplest possible storage, acceptable for Phase I demo |
| Display | rich library | Beautiful console output with colors and tables |

**Alternative Considered**: click library (more features but adds dependency)

**Data Structure**:
```python
tasks: list[dict] = [
    {
        "id": 1,
        "title": "Buy milk",
        "description": "2 liters low fat",
        "status": "pending",
        "created_at": "2025-12-24T10:30:00Z"
    }
]
```

---

### Phase II: Full-Stack Web Application

**Decision**: Next.js 16 + FastAPI + SQLModel + Neon + Better Auth

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Frontend Framework | Next.js 16 (App Router) | React with SSR, excellent DX, Vercel deployment |
| Backend Framework | FastAPI | High performance, async, auto OpenAPI docs, type-safe |
| ORM | SQLModel | Combines SQLAlchemy + Pydantic, single source of truth |
| Database | Neon PostgreSQL | Serverless, auto-scaling, generous free tier |
| Auth | Better Auth | Modern, JWT + session support, social logins |
| Styling | Tailwind CSS | Utility-first, rapid development, responsive |

**Alternative Considered**:
- Frontend: Remix (less mature), Vite+React (no SSR)
- Backend: Django REST (too heavy), Flask (less modern)
- Database: Supabase (vendor lock-in), raw PostgreSQL (no serverless)

**Data Flow**:
```
Browser → Next.js (Vercel) → FastAPI (Railway) → Neon PostgreSQL
          ↓
    Better Auth (JWT tokens)
```

**API Contract** (REST):
```
GET    /api/todos          # List todos
POST   /api/todos          # Create todo
PATCH  /api/todos/:id      # Update todo
DELETE /api/todos/:id      # Delete todo
POST   /api/auth/register  # Register user
POST   /api/auth/login     # Login user
```

---

### Phase III: ChatKit + Agents SDK + MCP

**Decision**: OpenAI ChatKit + Claude Agents SDK + Model Context Protocol

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Chat UI | OpenAI ChatKit | Pre-built chat components, excellent UX |
| Agent Orchestration | Claude Agents SDK | Multi-step workflows, tool use, context management |
| Tool Protocol | MCP (Model Context Protocol) | Standardized AI-to-tool communication |
| NLU | Claude 3.5 Sonnet | Best-in-class natural language understanding |

**Alternative Considered**:
- LangChain (more complex, steeper learning curve)
- Custom chat UI (reinventing wheel)
- Direct OpenAI API (less structured agent patterns)

**Data Flow**:
```
User: "Add a task to buy groceries"
  ↓
ChatKit UI
  ↓
Chatbot Service (Agents SDK)
  ↓ (Intent: create_todo, Params: {title: "buy groceries"})
MCP Tools Server
  ↓ (calls REST API)
FastAPI Backend
  ↓
Neon PostgreSQL
```

**MCP Tools**:
- `create_todo(title, priority?, tags?, due_date?)`
- `list_todos(completed?, priority?, search?)`
- `update_todo(id, updates)`
- `complete_todo(id)`
- `delete_todo(id)`

---

### Phase IV: Docker + Minikube + Helm + kubectl-ai

**Decision**: Docker + Kubernetes + Helm + Prometheus/Grafana/Jaeger

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Containerization | Docker (multi-stage) | Industry standard, optimized images |
| Orchestration | Kubernetes (Minikube) | Local K8s for learning, portable to cloud |
| Package Manager | Helm 3 | Templating, multi-environment support |
| Metrics | Prometheus | Time-series DB, Kubernetes-native |
| Dashboards | Grafana | Visualization, alerting |
| Tracing | Jaeger | Distributed tracing, OpenTelemetry |
| AIOps | kubectl-ai + kagent | AI-powered K8s operations |

**Alternative Considered**:
- Docker Compose (not production-ready)
- Nomad (less ecosystem)
- K3s (lightweight but limited features)

**Kubernetes Resources**:
```
Deployments: frontend, backend, chatbot (replicas: 2)
Services: ClusterIP for internal, LoadBalancer for ingress
ConfigMaps: App configuration
Secrets: Database URL, JWT secret, API keys
StatefulSet: PostgreSQL (persistent storage)
Ingress: Route external traffic
HPA: Horizontal Pod Autoscaling (CPU/memory triggers)
```

---

### Phase V: DOKS + Redpanda Kafka + Dapr + GitHub Actions

**Decision**: Cloud K8s + Kafka + Dapr + CI/CD

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Cloud K8s | DOKS/GKE/AKS | Managed Kubernetes, production-ready |
| Event Streaming | Redpanda Cloud (Kafka) | Kafka-compatible, simpler ops, serverless |
| Service Mesh | Dapr | Pub/sub abstraction, portable, K8s-native |
| CI/CD | GitHub Actions | Native to GitHub, free for public repos |
| Secrets | Kubernetes Secrets | K8s-native, encrypted at rest |

**Alternative Considered**:
- Self-hosted Kafka (operational complexity)
- RabbitMQ (less scalable)
- AWS EventBridge (vendor lock-in)
- GitLab CI (alternative if using GitLab)

**Event-Driven Architecture**:
```
Backend creates todo
  ↓ (publish via Dapr)
Kafka Topic: todo.created
  ↓ (subscribe via Dapr)
┌─────────────────┬──────────────────┬─────────────────┐
│                 │                  │                 │
▼                 ▼                  ▼                 ▼
Notification    Analytics        Chatbot           Email
Service         Service          (update chat)     Service
```

**Dapr Components**:
- Pub/Sub: Kafka integration
- State Store: PostgreSQL for distributed state
- Service Invocation: Service-to-service calls
- Bindings: External integrations (Slack, email)

---

## Step 3: Document Architecture Decisions

Create `specs/architecture.md` with:

### System Overview
- High-level description
- Major components
- Technology stack
- Deployment model

### Component Descriptions
- Purpose of each component
- Responsibilities
- Dependencies
- APIs exposed/consumed

### Data Flow Diagrams
- Request/response flows
- Event flows (Phase V)
- Authentication flows

### Technology Rationale
- Why each tech was chosen
- Alternatives considered
- Trade-offs

### Deployment Architecture
- Phase IV: Minikube
- Phase V: Cloud (GKE/AKS/DOKS)
- Observability stack
- CI/CD pipeline

---

## Step 4: Output Format

**File**: `specs/architecture.md`

```markdown
# Evolution of Todo - System Architecture

**Version**: 1.0.0
**Last Updated**: 2025-12-24
**Covers**: Phases I through V

## System Overview

[High-level description of the system]

## Monorepo Structure

[Directory layout with explanations]

## Phase Evolution

### Phase I: In-Memory Console App
[Diagram + description]

### Phase II: Full-Stack Web Application
[Diagram + description]

### Phase III: AI-Powered Chatbot
[Diagram + description]

### Phase IV: Local Kubernetes Deployment
[Diagram + description]

### Phase V: Cloud-Native Event-Driven
[Diagram + description]

## Technology Stack

### Phase I
[Table of technologies with rationale]

### Phase II
[Table of technologies with rationale]

[Continue for all phases...]

## Architecture Decision Records

- ADR-0001: Monorepo structure
- ADR-0002: FastAPI + SQLModel + Neon
- ADR-0003: Next.js + Better Auth
- ADR-0004: ChatKit + Agents SDK + MCP
- ADR-0005: Kubernetes + Helm + Observability
- ADR-0006: Kafka + Dapr event streaming

## Deployment Architecture

[Cloud deployment diagram]

## Security Architecture

[Authentication, authorization, secrets management]

## Observability Architecture

[Logging, metrics, tracing strategy]
```

---

## Example Output

### specs/architecture.md

```markdown
# Evolution of Todo - System Architecture

**Version**: 1.0.0
**Last Updated**: 2025-12-24
**Covers**: Phases I through V

## System Overview

The Evolution of Todo system evolves from a simple in-memory Python CLI (Phase I) to a full cloud-native, AI-powered, event-driven platform (Phase V). The architecture follows the **Evolutionary Architecture** principle—each phase builds upon and extends the previous phase without rewrites.

**Key Characteristics**:
- **Spec-Driven**: All features start as specifications
- **AI-Implemented**: All code generated by AI agents
- **Evolutionary**: Phase N builds on Phase N-1
- **Observable**: Metrics, logs, and traces from day one
- **Secure**: Authentication, validation, secret management

## Monorepo Structure

[Include monorepo structure from Step 1]

## Phase Evolution

[Include all 5 phase diagrams from Step 2]

## Technology Stack

[Include tech stack tables from Step 3]

## Data Models

### User
- id (integer, PK)
- email (string, unique)
- password_hash (string)
- created_at (datetime)

### Todo
- id (integer, PK)
- user_id (integer, FK → User)
- title (string, 1-500 chars)
- completed (boolean)
- priority (enum: low/medium/high)
- tags (JSON array)
- due_date (datetime, nullable)
- created_at (datetime)
- updated_at (datetime)

### Conversation (Phase III)
- id (integer, PK)
- user_id (integer, FK → User)
- title (string, nullable)
- created_at (datetime)

### Message (Phase III)
- id (integer, PK)
- conversation_id (integer, FK → Conversation)
- role (enum: user/assistant)
- content (text)
- metadata (JSON)
- created_at (datetime)

## API Architecture

### REST API (Phase II+)

**Base URL**: `/api/v1`

**Authentication**: Bearer JWT

**Endpoints**:
- `POST /auth/register` - Create account
- `POST /auth/login` - Authenticate
- `GET /todos` - List todos (with filters)
- `POST /todos` - Create todo
- `PATCH /todos/:id` - Update todo
- `DELETE /todos/:id` - Delete todo

**Response Format**:
```json
{
  "data": { ... },
  "error": null,
  "meta": { "timestamp": "..." }
}
```

### MCP Tools (Phase III)

**Protocol**: Model Context Protocol

**Tools**:
- `create_todo` - Create new todo
- `list_todos` - List with filters
- `update_todo` - Update todo
- `complete_todo` - Mark complete
- `delete_todo` - Delete todo

### Event Streaming (Phase V)

**Protocol**: Kafka (via Dapr pub/sub)

**Topics**:
- `todo.created` - New todo created
- `todo.completed` - Todo marked complete
- `todo.updated` - Todo updated
- `todo.deleted` - Todo deleted
- `todo.reminder` - Recurring task reminder

**Event Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "todo.created",
  "timestamp": "2025-12-24T10:30:00Z",
  "user_id": 1,
  "data": {
    "id": 1,
    "title": "Buy groceries"
  }
}
```

## Deployment Architecture

### Phase II: Serverless/PaaS

```
Frontend: Vercel (CDN + Edge Functions)
Backend: Railway/Render (Containerized)
Database: Neon (Serverless PostgreSQL)
```

### Phase IV: Local Kubernetes

```
Platform: Minikube (local Kubernetes)
Ingress: nginx-ingress
Observability: Prometheus + Grafana + Jaeger
```

### Phase V: Cloud Kubernetes

```
Platform: DigitalOcean Kubernetes (DOKS) / GKE / AKS
Ingress: Cloud Load Balancer + nginx-ingress
Event Streaming: Redpanda Cloud (Kafka)
Service Mesh: Dapr
Observability: Prometheus + Grafana + Jaeger
CI/CD: GitHub Actions
```

## Security Architecture

### Authentication Flow (Phase II+)

```
1. User submits credentials (email, password)
2. Backend validates credentials
3. Backend generates JWT token (7 day expiry)
4. Frontend stores token (localStorage)
5. Frontend sends token with all API requests (Authorization: Bearer <token>)
6. Backend validates JWT and extracts user_id
7. Backend enforces user_id isolation (users can only access their own todos)
```

### Multi-Tenant Isolation

**Strategy**: Row-Level Security (user_id foreign key)

```sql
-- Every query includes user_id filter
SELECT * FROM todos WHERE user_id = <current_user_id>;
```

**Enforcement**:
- All API endpoints require authentication
- All database queries include user_id filter
- JWT contains user_id claim
- No cross-user data access

### Secrets Management

**Phase II**: Environment variables (`.env`, gitignored)

**Phase IV+**: Kubernetes Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
type: Opaque
stringData:
  database-url: "postgresql://..."
  jwt-secret-key: "random-256-bit-key"
  openai-api-key: "sk-..."
```

**Phase V**: HashiCorp Vault (optional) or cloud secret managers (GCP Secret Manager, Azure Key Vault, DO Secrets)

## Observability Architecture

### Logging

**Format**: Structured JSON logs

```json
{
  "timestamp": "2025-12-24T10:30:00Z",
  "level": "INFO",
  "service": "backend",
  "correlation_id": "abc-123",
  "user_id": 1,
  "message": "Todo created",
  "todo_id": 1
}
```

**Levels**: DEBUG, INFO, WARNING, ERROR, CRITICAL

### Metrics

**Collection**: Prometheus scrapes `/metrics` endpoint

**Key Metrics**:
- `http_requests_total` (counter)
- `http_request_duration_seconds` (histogram)
- `todos_created_total` (counter)
- `active_users` (gauge)

**Alerting**:
- Error rate >5% → Slack alert
- P95 latency >500ms → Slack alert
- Pod crash loop → Slack alert

### Tracing

**Framework**: OpenTelemetry

**Spans**:
- HTTP requests (incoming)
- Database queries
- External API calls (MCP, Kafka)
- Service-to-service calls (Dapr)

**Propagation**: W3C Trace Context headers

---

## Architecture Decision Records

All significant decisions documented in `history/adr/`:

1. **ADR-0001**: Monorepo structure for all phases
2. **ADR-0002**: FastAPI + SQLModel + Neon stack for backend
3. **ADR-0003**: Next.js + Better Auth for frontend
4. **ADR-0004**: ChatKit + Agents SDK + MCP for chatbot
5. **ADR-0005**: Kubernetes + Helm + Observability stack
6. **ADR-0006**: Kafka + Dapr for event streaming
7. **ADR-0007**: GitHub Actions for CI/CD
8. **ADR-0008**: Multi-cloud support (GKE/AKS/DOKS)

See `history/adr/` for full ADR documents.

---

**Created**: 2025-12-24
**Status**: Complete
```

---

## Related Agents

- **System Architect Agent** (`.claude/agents/system-architect.md`): Designs architecture, creates ADRs
- **CloudOps Agent** (`.claude/agents/cloudops-k8s.md`): Implements infrastructure
- **Spec Architect Agent** (`.claude/agents/spec-architect.md`): Writes specifications

---

## Skill Invocation

**Command**: `/sp.plan` (creates architecture as part of planning)

**Example**:
```
/sp.plan
```

**Alternative**: Direct activation
```
Act as System Architect Agent and create architecture documentation for Evolution of Todo
```

---

## Success Metrics

A well-designed architecture has:
- ✅ Clear component boundaries
- ✅ Phase evolution diagrams showing progression
- ✅ Technology stack with rationale
- ✅ Data flow diagrams for all major operations
- ✅ Security architecture (auth, isolation, secrets)
- ✅ Observability architecture (logs, metrics, traces)
- ✅ ADRs for all significant decisions
- ✅ Deployment architecture for each phase

---

## Revision History

| **Version** | **Date**       | **Changes**                                      |
|-------------|----------------|--------------------------------------------------|
| 1.0.0       | 2025-12-24     | Initial skill documentation                      |

---

## References

- **Constitution**: `.specify/memory/constitution.md` (Principle IV: Evolutionary Architecture)
- **System Architect Agent**: `.claude/agents/system-architect.md`
- **Architecture Template**: `.specify/templates/plan-template.md`

---

**Status**: Ready for immediate use
**Activation**: `/sp.plan` or `Act as System Architect Agent`
