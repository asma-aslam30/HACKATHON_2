# Evolution of Todo - AI Agent Catalog

**Project**: Evolution of Todo - Spec-Driven, AI-Native Task Management System
**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

This catalog documents all 11 AI agents responsible for developing the **Evolution of Todo** hackathon project across 5 phases. Each agent has specific responsibilities, skills, and activation phrases. All agents follow the project's **Constitution** and implement the **Spec-First Development** principle.

**Total Agents**: 11
**Coverage**: All phases (I through V)
**Bonus Deliverable**: Reusable Intelligence (+200 points)

---

## Agent Index

### 🎯 Management & Coordination

#### 1. [Project Manager Agent](./project-manager.md)
**Role**: Orchestrates the entire project across 5 phases
**Activation**: `Act as Project Manager Agent`

**Key Responsibilities**:
- Phase-wise work breakdown and planning
- Multi-agent coordination workflow
- Deadline and milestone tracking (Dec 7, 14, 21; Jan 4, 18)
- Hackathon deliverable management (GitHub repo, demo video, deployments)
- Bonus feature coordination (Reusable Intelligence +200, Blueprints +200)

**When to Use**:
- Starting a new phase
- Mid-phase status checks
- Risk escalation and mitigation
- Coordinating multiple agents
- Tracking deliverables

---

### 🏗️ Architecture & Design

#### 2. [System Architect Agent](./system-architect.md)
**Role**: Designs overall system architecture for all 5 phases
**Activation**: `Act as System Architect Agent`

**Key Responsibilities**:
- Monorepo structure design (frontend/, backend/, chatbot/, infra/, specs/)
- Phase evolution architecture (CLI → Web → Chatbot → K8s → Cloud)
- Technology stack decisions (FastAPI+SQLModel, Next.js, Kafka+Dapr)
- Architecture Decision Records (ADRs)
- Cloud-native blueprints for bonus deliverables

**When to Use**:
- Designing phase architecture
- Making technology choices
- Creating ADRs for significant decisions
- Extracting reusable blueprints
- Planning infrastructure

---

#### 3. [Spec Architect Agent](./spec-architect.md)
**Role**: Writes and maintains ALL specifications
**Activation**: `Act as Spec Architect Agent`

**Key Responsibilities**:
- Constitution maintenance (`.specify/memory/constitution.md`)
- Feature specifications with user stories (P1, P2, P3)
- API specifications (REST endpoints, MCP tools, Kafka events)
- Database schema specifications (entities, relationships, migrations)
- UI specifications (pages, components, flows)

**When to Use**:
- Creating new feature specs
- Clarifying requirements
- Writing API contracts
- Defining database schemas
- Documenting UI designs

---

### 💻 Implementation Agents

#### 4. [Backend / FastAPI Pro Agent](./backend-fastapi.md)
**Role**: Implements all backend services (Phase II+)
**Activation**: `Act as Backend / FastAPI Pro Agent`

**Key Responsibilities**:
- FastAPI routes (auth, todos, MCP endpoints)
- SQLModel models (User, Todo, Conversation, Message)
- Neon PostgreSQL integration
- Better Auth + JWT middleware
- MCP tools server (Phase III)
- Kafka producers/consumers (Phase V)

**When to Use**:
- Implementing REST APIs
- Creating database models
- Adding authentication
- Integrating MCP tools
- Publishing/consuming Kafka events

---

#### 5. [Frontend UI/UX Agent](./frontend-uiux.md)
**Role**: Builds Next.js frontend + ChatKit UI
**Activation**: `Act as Frontend UI/UX Agent`

**Key Responsibilities**:
- Next.js 16 App Router pages (login, todos, dashboard, chat)
- Task CRUD UI with filters/search/sort
- ChatKit integration (Phase III)
- Custom CSS + responsive design (Tailwind)
- Better Auth login/signup flows

**When to Use**:
- Implementing web pages
- Creating React components
- Styling with Tailwind CSS
- Integrating chatbot UI
- Adding responsive design

---

#### 6. [Console App Agent](./console-app.md)
**Role**: Builds Phase I Python CLI Todo app
**Activation**: `Act as Console App Agent`

**Key Responsibilities**:
- In-memory task storage (tasks: list[dict])
- CLI commands (add, view, delete, complete, search, filter)
- Rich attributes (tags, priority, due_date, reminders)
- Voice input (bonus feature)
- Console notifications (bonus feature)

**When to Use**:
- Implementing Phase I CLI
- Adding command-line features
- Creating voice input
- Building reminder system
- Formatting console output

---

#### 7. [AI Chatbot Agent](./ai-chatbot.md)
**Role**: Designs Phase III AI-powered Todo chatbot
**Activation**: `Act as AI Chatbot Agent`

**Key Responsibilities**:
- OpenAI ChatKit UI integration
- Claude Agents SDK + MCP tools orchestration
- Natural language → MCP tool mapping
- Conversation state management (stateless server)
- Multilingual support (Urdu bonus +100 points)

**When to Use**:
- Implementing chatbot interface
- Integrating MCP tools
- Adding natural language understanding
- Managing conversation context
- Supporting multiple languages

---

#### 8. [CloudOps & Kubernetes Agent](./cloudops-k8s.md)
**Role**: Handles all infrastructure (Phases IV-V)
**Activation**: `Act as CloudOps & Kubernetes Agent`

**Key Responsibilities**:
- Dockerfiles for frontend/backend/chatbot
- Helm charts for Minikube + DOKS/GKE/AKS
- kubectl-ai + kagent AIOps integration
- Dapr sidecars (pub/sub, state, bindings)
- Kafka on Redpanda Cloud

**When to Use**:
- Containerizing applications
- Creating Kubernetes manifests
- Setting up observability
- Configuring Dapr
- Designing infrastructure

---

### 🔄 Automation & Deployment

#### 9. [CI/CD Agent](./ci-cd-agent.md)
**Role**: Automates continuous integration and deployment
**Activation**: `Act as CI/CD Agent`

**Key Responsibilities**:
- GitHub Actions workflows (build/test/deploy)
- Vercel frontend deployment automation (Phase II)
- Minikube + Docker image builds (Phase IV)
- Multi-cloud deployment (DOKS/GKE/AKS) (Phase V)
- Database migration orchestration
- Multi-stage pipelines with quality gates
- Environment-specific configurations (dev/staging/prod)

**When to Use**:
- Setting up CI/CD pipelines
- Automating deployments
- Configuring Vercel/Railway
- Creating GitHub Actions workflows
- Managing database migrations
- Multi-environment deployments

---

### ✅ Quality Assurance

#### 10. [Testing & QA Agent](./testing-qa.md)
**Role**: Ensures everything works across phases
**Activation**: `Act as Testing & QA Agent`

**Key Responsibilities**:
- Unit tests (Pytest for Python, Jest for JS/TS)
- Integration tests (API endpoints, MCP tools)
- Manual test plans for demo video
- Bug reproduction → spec fixes → code fixes
- Performance/load testing for cloud deployment

**When to Use**:
- Writing unit tests
- Creating integration tests
- Preparing demo test plans
- Triaging and fixing bugs
- Running load tests

---

#### 11. [Code Quality & Integration Agent](./code-quality.md)
**Role**: Ensures production-ready code quality
**Activation**: `Act as Code Quality & Integration Agent`

**Key Responsibilities**:
- Code reviews across all agents' work
- Linting and formatting (ruff, black, ESLint, Prettier)
- Constitution compliance validation
- Integration validation (frontend ↔ backend ↔ chatbot)
- Security reviews (JWT, secrets, dependencies)
- Pre-commit hooks and CI/CD quality gates

**When to Use**:
- Reviewing PRs
- Running linters
- Validating Constitution compliance
- Scanning for security issues
- Setting up quality gates

---

## Agent Interaction Map

```
┌─────────────────────────────────────────────────────────────┐
│                   PROJECT MANAGER AGENT                      │
│              (Orchestration & Coordination)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
     ▼               ▼               ▼
┌─────────┐   ┌──────────┐   ┌──────────────┐
│  SPEC   │   │  SYSTEM  │   │   TESTING    │
│ARCHITECT│   │ARCHITECT │   │   & QA       │
└────┬────┘   └────┬─────┘   └──────┬───────┘
     │             │                 │
     │  ┌──────────┴──────────┐      │
     │  │                     │      │
     ▼  ▼                     ▼      ▼
┌────────────────┐    ┌──────────────────┐
│IMPLEMENTATION  │    │  CODE QUALITY &  │
│    AGENTS      │◄───┤   INTEGRATION    │
│                │    └──────────────────┘
│ • Backend      │
│ • Frontend     │
│ • Console      │
│ • Chatbot      │
│ • CloudOps     │
└────────────────┘
```

**Workflow**:
1. **Project Manager** coordinates overall work
2. **Spec Architect** writes specifications
3. **System Architect** designs architecture
4. **Implementation Agents** build features
5. **Testing & QA** validates implementations
6. **Code Quality** reviews and approves

---

## Agent Skills Matrix

| Agent | Spec Writing | Architecture | Implementation | Testing | DevOps | Automation | Management |
|-------|-------------|-------------|----------------|---------|---------|-----------|-----------|
| Project Manager | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | 🟡 | 🟢🟢🟢 |
| System Architect | ⚪ | 🟢🟢🟢 | ⚪ | ⚪ | 🟡 | ⚪ | 🟡 |
| Spec Architect | 🟢🟢🟢 | 🟡 | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| Backend Agent | ⚪ | ⚪ | 🟢🟢🟢 | 🟡 | ⚪ | ⚪ | ⚪ |
| Frontend Agent | ⚪ | ⚪ | 🟢🟢🟢 | 🟡 | ⚪ | ⚪ | ⚪ |
| Console Agent | ⚪ | ⚪ | 🟢🟢🟢 | 🟡 | ⚪ | ⚪ | ⚪ |
| Chatbot Agent | ⚪ | 🟡 | 🟢🟢🟢 | 🟡 | ⚪ | ⚪ | ⚪ |
| CloudOps Agent | ⚪ | 🟡 | 🟡 | ⚪ | 🟢🟢🟢 | 🟡 | ⚪ |
| CI/CD Agent | ⚪ | ⚪ | ⚪ | 🟡 | 🟢 | 🟢🟢🟢 | ⚪ |
| Testing & QA | ⚪ | ⚪ | ⚪ | 🟢🟢🟢 | 🟡 | ⚪ | ⚪ |
| Code Quality | ⚪ | 🟡 | 🟡 | 🟢 | 🟡 | 🟡 | 🟡 |

**Legend**: 🟢🟢🟢 Expert | 🟢 Proficient | 🟡 Intermediate | ⚪ Basic/None

---

## Phase Coverage

| Phase | Primary Agents | Supporting Agents |
|-------|---------------|-------------------|
| **Phase I: Console App** | Console App | Spec Architect, Testing & QA, Code Quality |
| **Phase II: Web App** | Backend, Frontend, CI/CD | System Architect, Spec Architect, Testing & QA, Code Quality |
| **Phase III: AI Chatbot** | Chatbot, Backend | System Architect, Frontend, CI/CD, Testing & QA, Code Quality |
| **Phase IV: Kubernetes** | CloudOps, CI/CD | All (for deployment) |
| **Phase V: Cloud-Native** | CloudOps, CI/CD, Backend | System Architect, Testing & QA, Code Quality |

**Cross-Phase Agents**: Project Manager, System Architect, Spec Architect, CI/CD, Testing & QA, Code Quality

---

## Quick Start Guide

### For New Features

1. **Specify** (Spec Architect Agent):
   ```
   Act as Spec Architect Agent and write specification for [feature name]
   ```

2. **Design** (System Architect Agent):
   ```
   Act as System Architect Agent and design architecture for [feature name]
   ```

3. **Implement**:
   - Backend: `Act as Backend / FastAPI Pro Agent and implement [feature]`
   - Frontend: `Act as Frontend UI/UX Agent and implement [feature]`
   - Chatbot: `Act as AI Chatbot Agent and implement [feature]`
   - CLI: `Act as Console App Agent and implement [feature]`

4. **Test** (Testing & QA Agent):
   ```
   Act as Testing & QA Agent and write tests for [feature]
   ```

5. **Review** (Code Quality Agent):
   ```
   Act as Code Quality & Integration Agent and review [feature] implementation
   ```

6. **Deploy** (CloudOps Agent):
   ```
   Act as CloudOps & Kubernetes Agent and deploy [feature] to [environment]
   ```

7. **Automate** (CI/CD Agent):
   ```
   Act as CI/CD Agent and create deployment pipeline for [phase/feature]
   ```

---

### For Project Management

**Start New Phase**:
```
Act as Project Manager Agent and plan Phase [I/II/III/IV/V] work breakdown
```

**Status Check**:
```
Act as Project Manager Agent and provide status update for Phase [X]
```

**Risk Escalation**:
```
Act as Project Manager Agent. [Describe blocker/risk] - provide mitigation options
```

---

## Success Criteria

The agent system is successful when:

✅ **All 11 agents documented** with clear roles and responsibilities
✅ **Reusable across projects** - patterns extractable to other domains
✅ **Complete coverage** - all phases (I through V) supported
✅ **Clear activation** - each agent has unambiguous activation phrase
✅ **Constitution aligned** - all agents follow 8 core principles
✅ **Independently testable** - each agent's outputs can be validated
✅ **Well-integrated** - agents coordinate smoothly via handoffs

**Status**: ✅ ALL CRITERIA MET (2025-12-24)

---

## Bonus Deliverables

### ✅ Reusable Intelligence (+200 Points)

**What**: All 11 agents documented with reusable patterns

**Location**: `.claude/agents/` (this directory)

**Reusability Test**: These agents can be applied to:
- E-commerce platform development
- Blogging system implementation
- Project management tool creation
- Any Spec-Driven, AI-Native software project

**Evidence**: This index + 10 detailed agent specifications

---

### 🔄 Blueprints (+200 Points - In Progress)

**What**: Reusable infrastructure and architecture blueprints

**Location**:
- Infrastructure blueprints: `infra/helm/evolution-todo/` (Helm charts)
- Architecture patterns: Documented in System Architect Agent
- Testing blueprints: Documented in Testing & QA Agent

**Status**: Partially complete (infrastructure blueprints in CloudOps Agent documentation)

---

## Maintenance

### Adding New Agents

To add a new agent to this catalog:

1. Create agent specification: `.claude/agents/new-agent.md`
2. Follow template structure (Role, Responsibilities, Activation, Skills, Examples)
3. Update this index with agent entry
4. Update interaction map if needed
5. Update skills matrix
6. Document integration points with existing agents

### Updating Agents

When updating an agent:

1. Update agent specification file
2. Increment version in agent file
3. Update "Last Updated" date in this index
4. Document changes in agent's Revision History section

---

## References

- **Constitution**: `.specify/memory/constitution.md`
- **Project Structure**: See System Architect Agent
- **Workflow**: Plan → Specify → Design → Implement → Test → Review → Deploy
- **Hackathon Timeline**: Dec 7, 14, 21 (Phases I-III); Jan 4, 18 (Phases IV-V)

---

## Contact & Support

For questions about:
- **Agent Usage**: Review individual agent documentation
- **Project Workflow**: See Project Manager Agent
- **Architecture Decisions**: See System Architect Agent
- **Constitution Compliance**: See Code Quality & Integration Agent

---

**Document Version**: 1.1.0
**Total Agents**: 11/11 (100% Complete)
**Bonus Status**: Reusable Intelligence ✅ (+200 points achieved)
**Last Review**: 2025-12-24

---

*This agent catalog is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*
