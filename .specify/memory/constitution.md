<!--
Sync Impact Report:
- Version: 1.0.0 (Initial Constitution)
- Added sections: All sections new (initial creation)
- Templates requiring updates:
  ✅ .specify/templates/plan-template.md (Constitution Check section references this file)
  ✅ .specify/templates/spec-template.md (User stories and requirements align with principles)
  ✅ .specify/templates/tasks-template.md (Task structure aligns with evolutionary phases)
- Follow-up TODOs: None
-->

# Evolution of Todo – Constitution

**Spec-Driven, AI-Native Todo System**

## Purpose and Vision

The **Evolution of Todo** project demonstrates the progressive transformation of a simple Todo application into a full cloud-native, AI-powered, event-driven platform. Starting from a basic in-memory Python console app (Phase I), the system evolves through five distinct phases: adding a full-stack web interface (Phase II), integrating AI-powered conversational capabilities (Phase III), deploying to local Kubernetes with AIOps observability (Phase IV), and culminating in an advanced cloud deployment with Kafka, Dapr, and enterprise CI/CD (Phase V).

This project serves as a learning vehicle for Spec-Driven Development (SDD) principles where specifications drive all implementation, and AI agents execute the development work. The architectural evolution is intentional—each phase builds upon and extends the previous phase rather than replacing it, creating a living example of incremental, sustainable software evolution.

## Core Principles

### I. Spec-First Development

Every feature, API contract, data model, UI component, infrastructure change, and architectural decision MUST begin as a written specification in `/specs/<feature>/spec.md` before any implementation occurs. Specifications are technology-agnostic, describe user-facing behavior and acceptance criteria, and serve as the contract between planning and implementation phases.

**Rationale**: Specifications capture intent and requirements independently of implementation details, enabling AI agents to generate correct implementations and humans to review work without deep technical context. When runtime behavior diverges from specifications, the specification must be updated first to maintain the single source of truth.

**Non-negotiable rules**:
- No code is written before a spec exists and is reviewed
- Specs describe "what" and "why," not "how"
- All specs must include acceptance criteria and test scenarios
- Spec changes require review and versioning

### II. AI-Implemented Only

All application code—backend services, frontend components, CLI tools, database migrations, Kubernetes manifests, Dapr configurations, infrastructure-as-code, and tests—MUST be generated or edited by AI agents according to approved specifications. Human developers write specifications, review outputs, approve changes, and guide architectural decisions, but do not hand-write production code.

**Rationale**: This constraint ensures consistency, documents all implementation decisions through AI prompts and outputs, demonstrates the feasibility of AI-native development workflows, and forces explicit specification of all requirements (no implicit tribal knowledge).

**Non-negotiable rules**:
- Humans may only write specs, constitution, templates, and documentation
- All `.py`, `.ts`, `.tsx`, `.yaml`, `.tf`, and similar files are AI-generated
- Manual fixes require updating the spec and regenerating code
- Exception: Emergency production fixes may be manual but must be re-specified and regenerated within 48 hours

### III. Single Source of Truth

The Constitution (this document) and the specifications in `/specs/` govern all project behavior and architecture. When code behavior, runtime behavior, or documentation conflicts with specifications, the specifications are presumed correct and must be updated first before any implementation changes.

**Rationale**: Maintaining a single authoritative source prevents drift between documentation and implementation, enables confident refactoring and evolution, and provides clarity during disputes or ambiguity.

**Non-negotiable rules**:
- Constitution supersedes all other guidance
- Specs in `/specs/` supersede code comments or inline documentation
- When conflicts arise: update spec → regenerate code → verify alignment
- All agents must validate their outputs against constitution and relevant specs

### IV. Evolutionary Architecture

Each phase of this project (I through V) builds upon and extends the previous phase rather than replacing it. Code, data models, APIs, and infrastructure from earlier phases are refactored and integrated into later phases, not discarded. This ensures architectural continuity, preserves investment, and demonstrates real-world evolution patterns.

**Rationale**: Real-world systems evolve incrementally; greenfield rewrites are expensive and risky. By evolving the Todo system across phases, we learn how to maintain backward compatibility, migrate data safely, and extend architectures without breaking existing functionality.

**Non-negotiable rules**:
- Phase N builds on Phase N-1; no rewrites from scratch
- Breaking changes require migration plans and backward compatibility periods
- Existing APIs and data schemas must be versioned, not replaced
- Tests from earlier phases must continue passing unless explicitly deprecated

### V. Testability and Documentation

Every feature MUST be independently testable with explicit acceptance criteria. Every API, service, component, infrastructure element, and architectural decision MUST be documented at the appropriate level (specs for features, ADRs for architecture, runbooks for operations). Tests are mandatory for all backend services and APIs; frontend and infrastructure tests are strongly encouraged.

**Rationale**: Testability validates correctness and prevents regressions. Documentation enables onboarding, knowledge transfer, and operational excellence. AI agents require clear acceptance criteria to generate correct implementations.

**Non-negotiable rules**:
- All backend APIs require integration tests
- All data models require validation tests
- All user stories require acceptance tests (automated or manual checklist)
- All architectural decisions require ADRs (Architecture Decision Records)
- All deployment procedures require runbooks

### VI. Observability and Operational Excellence

All services, APIs, background jobs, event streams, and infrastructure components MUST emit structured logs, expose metrics (latency, throughput, errors), and support distributed tracing. Every phase must include observability from the start. Alerting thresholds and runbooks are required before production deployment.

**Rationale**: Observability is not optional in distributed systems. By embedding it from Phase I and evolving it through Phase V, we learn how to instrument systems progressively and demonstrate that observability is achievable even in early-stage projects.

**Non-negotiable rules**:
- All services log in JSON format with correlation IDs
- All HTTP endpoints expose p50/p95/p99 latency metrics
- All error paths log structured error details
- All Phase IV/V deployments require Prometheus/Grafana dashboards
- All critical paths require distributed tracing spans

### VII. Security by Design

Authentication, authorization, input validation, secret management, and audit logging are first-class requirements in every phase. Secrets MUST NOT be hardcoded; environment variables or secret management tools (e.g., Kubernetes Secrets, Vault) are required. All APIs require authentication by Phase II.

**Rationale**: Security cannot be bolted on after the fact. By requiring it from the start, we build secure habits and demonstrate that security is compatible with rapid AI-driven development.

**Non-negotiable rules**:
- No secrets in code or version control (use `.env`, Kubernetes Secrets, or Vault)
- All user input must be validated and sanitized
- All APIs require authentication (JWT or session) by Phase II
- All sensitive operations require audit logs
- All dependencies must pass security scanning before deployment

### VIII. Incremental Delivery and MVP Thinking

Each phase and each feature within a phase must be deliverable as a Minimum Viable Product (MVP). User stories are prioritized (P1, P2, P3), and P1 stories form the MVP. Work proceeds in priority order; lower-priority stories are deferred if time/resources are constrained.

**Rationale**: Incremental delivery reduces risk, provides early feedback, and ensures that even partial completion delivers user value. AI agents work best with clear, scoped tasks; MVP thinking enforces this discipline.

**Non-negotiable rules**:
- Every feature spec includes prioritized user stories (P1, P2, P3)
- P1 stories must be independently testable and deliverable
- Lower-priority stories may be deferred or descoped
- Each phase milestone must be demonstrable to stakeholders

## Scope of the Project

The **Evolution of Todo** project spans five phases, each building upon the previous:

### Phase I: In-Memory Python Console App

Deliver a command-line Todo application with basic CRUD operations (Create, Read, Update, Delete). Todos are stored in memory (no persistence). This phase demonstrates core domain logic and CLI interface patterns.

**Todo Features**: Basic CRUD (add, list, complete, delete tasks)

### Phase II: Full-Stack Web Application

Evolve the console app into a web application with a Next.js frontend, FastAPI backend, SQLModel ORM, Neon PostgreSQL database, and Better Auth authentication. Todos are persisted in a database. APIs are RESTful and authenticated.

**Todo Features**: Basic CRUD + Intermediate features (priorities, tags, due dates)

### Phase III: AI-Powered Todo Chatbot

Integrate an AI chatbot using OpenAI ChatKit, Claude Agents SDK, and Model Context Protocol (MCP). Users interact with the Todo system via natural language. The chatbot translates conversational input into API calls.

**Todo Features**: All previous + Advanced features (search, filter, sort, natural language input)

### Phase IV: Local Kubernetes Deployment

Deploy the full-stack application (Phase II) and AI chatbot (Phase III) to a local Kubernetes cluster (Minikube). Use Docker for containerization, Helm for package management, and AIOps tools (Prometheus, Grafana, Jaeger) for observability.

**Todo Features**: All previous + Recurring tasks and reminders

**Infrastructure**: Docker, Kubernetes, Helm, Prometheus, Grafana, Jaeger

### Phase V: Advanced Cloud Deployment

Extend the Kubernetes deployment to a cloud provider (GCP, AWS, or Azure). Add Kafka for event streaming, Dapr for microservice abstractions, and a full CI/CD pipeline (GitHub Actions or GitLab CI). Demonstrate horizontal scaling, zero-downtime deployments, and event-driven architecture.

**Todo Features**: All previous + Event-driven notifications and real-time updates

**Infrastructure**: Cloud Kubernetes (GKE/EKS/AKS), Kafka, Dapr, CI/CD, horizontal pod autoscaling

## Agents and Responsibilities

The following AI agents are responsible for different aspects of the project. Each agent has ownership over specific domains and is invoked by skills or direct prompts.

### Project Manager Agent

Coordinates work across phases, tracks dependencies, manages priorities, and ensures alignment between user stories, tasks, and deliverables. Owns the `/sp.tasks` workflow and ensures that task lists are dependency-ordered and independently testable.

### System Architect Agent

Designs overall system architecture, defines service boundaries, selects technologies, and documents architectural decisions in ADRs. Owns the `/sp.plan` workflow and ensures architectural consistency across phases.

### Spec Architect Agent

Writes and refines feature specifications based on user input. Owns the `/sp.specify` and `/sp.clarify` workflows. Ensures specs are clear, testable, and include prioritized user stories.

### Backend / FastAPI Pro Agent

Implements all backend services, APIs, database models, and business logic using FastAPI, SQLModel, and Python. Responsible for API contracts, data validation, and backend tests.

### Frontend UI/UX Agent

Implements all frontend components, pages, and user interactions using Next.js, React, and TypeScript. Responsible for UI/UX consistency, responsive design, and frontend tests.

### Console App Agent

Implements the Phase I command-line interface using Python `argparse` or `click`. Responsible for CLI design, help text, and console-based user experience.

### AI Chatbot Agent

Implements the Phase III conversational interface using OpenAI ChatKit, Claude Agents SDK, and MCP. Responsible for natural language understanding, intent classification, and chatbot-to-API integration.

### CloudOps & Kubernetes Agent

Implements all Dockerfiles, Kubernetes manifests, Helm charts, Dapr configurations, Kafka topics, and CI/CD pipelines. Responsible for infrastructure-as-code, deployment scripts, and runbooks for Phase IV and V.

### Testing & QA Agent

Writes and executes all tests: unit tests, integration tests, contract tests, end-to-end tests. Validates acceptance criteria from specs. Owns test plans and test coverage reports.

### Code Quality & Integration Agent

Reviews all generated code for quality, consistency, and adherence to constitution principles. Runs linters, formatters, and static analysis tools. Ensures all code passes CI checks before merge.

## Skills and Workflows

The project is organized around the following skill groups, each mapped to one or more agents:

### Specification Skills

- Feature specification (`/sp.specify`)
- Clarification and refinement (`/sp.clarify`)
- Architecture decision recording (`/sp.adr`)

### Coding & Quality Skills

- Implementation planning (`/sp.plan`)
- Task generation (`/sp.tasks`)
- Task execution (`/sp.implement`)
- Code review and quality checks

### UX & Experience Skills

- UI/UX design and prototyping
- Conversational interface design (chatbot)
- CLI experience design

### Backend & Security Skills

- API design and implementation (FastAPI)
- Database modeling (SQLModel)
- Authentication and authorization (Better Auth)
- Secret management and audit logging

### AI & Language Skills

- Natural language understanding (OpenAI, Claude)
- Agent orchestration (Agents SDK)
- MCP server integration

### Cloud & Operations Skills

- Containerization (Docker)
- Orchestration (Kubernetes, Helm)
- Observability (Prometheus, Grafana, Jaeger)
- Event streaming (Kafka)
- Service mesh and sidecars (Dapr)
- CI/CD (GitHub Actions, GitLab CI)

### Product & Analytics Skills

- User story prioritization
- Metrics and KPIs
- A/B testing and feature flags

## Standard Workflow

All work in this project follows a strict workflow to maintain quality and alignment with the Constitution:

1. **Plan**: Identify the feature or phase to be implemented. Review existing specs and architecture.
2. **Write/Update Specs**: Use `/sp.specify` to create or update the feature specification. Include user stories, acceptance criteria, and success metrics. Use `/sp.clarify` if requirements are unclear.
3. **Implement with AI**: Use `/sp.plan` to generate an implementation plan, then `/sp.tasks` to generate tasks. Execute tasks using AI agents (Backend, Frontend, Console, Chatbot, CloudOps, etc.). All code is AI-generated according to specs.
4. **Test**: Use the Testing & QA Agent to validate acceptance criteria. Run unit, integration, and end-to-end tests. Ensure tests pass before proceeding.
5. **Review & Refine**: Use the Code Quality & Integration Agent to review generated code. Check adherence to Constitution principles. If issues are found, update specs and regenerate code.

**Critical checkpoints**:
- Specs must be reviewed and approved before `/sp.plan`
- Plans must be reviewed and approved before `/sp.tasks`
- Tests must pass before marking tasks complete
- Constitution compliance must be validated before merging to main branch

## Constraints and Non-Negotiables

The following constraints are absolute and cannot be overridden without amending the Constitution:

### AI-Only Code Generation

**Rule**: The human developer (student) MUST NOT hand-write application code. All `.py`, `.ts`, `.tsx`, `.yaml`, `.tf`, and similar files are generated or edited by AI agents.

**Exceptions**: Humans may write specs, constitution, templates, documentation (`.md` files), and `.env` configuration. Emergency production hotfixes may be manual but must be re-specified and regenerated within 48 hours.

### Mandatory Testing

**Rule**: Every feature MUST include testable acceptance criteria. All backend APIs require integration tests. All data models require validation tests. Tests must be written before or alongside implementation (TDD preferred but not required).

**No exceptions**: Untestable features will not be merged.

### Architectural Decision Documentation

**Rule**: All major technical decisions (choice of framework, database schema, service boundaries, API contracts, Kafka topics, Dapr components, Kubernetes resource limits) MUST be captured in Architecture Decision Records (ADRs) in `history/adr/` or in the relevant spec's `plan.md`.

**No exceptions**: Undocumented architectural decisions are considered technical debt and must be documented retroactively.

### No Secrets in Code

**Rule**: Secrets (API keys, database passwords, JWT secrets, OAuth client secrets) MUST NOT be committed to version control. Use `.env` files (gitignored), Kubernetes Secrets, or HashiCorp Vault.

**No exceptions**: Committed secrets trigger immediate rollback and secret rotation.

### Evolutionary Changes Only

**Rule**: Each phase builds on the previous phase. No greenfield rewrites. Existing APIs and data models must be versioned and migrated, not replaced.

**Exceptions**: Proof-of-concept spikes may start fresh but must be integrated into the main codebase following evolutionary principles.

## Success Criteria

This project is considered successful when the following conditions are met:

### All Phases Delivered

- **Phase I**: Console app with basic CRUD operations runs successfully
- **Phase II**: Web app with frontend, backend, database, and authentication is deployed and accessible
- **Phase III**: AI chatbot can interpret natural language Todo commands and execute them via API
- **Phase IV**: Application runs in local Kubernetes (Minikube) with observability dashboards (Prometheus, Grafana, Jaeger)
- **Phase V**: Application is deployed to a cloud Kubernetes cluster with Kafka event streaming, Dapr service mesh, and automated CI/CD pipeline

### Self-Explanatory Repository

The repository is understandable to another engineer or AI agent using only:
- This Constitution
- Specifications in `/specs/`
- Architecture Decision Records in `history/adr/`
- Quickstart and runbook documentation

**Test**: A new engineer should be able to onboard, understand the architecture, and contribute a new feature within 4 hours using only documentation.

### Reusable Intelligence

The project demonstrates reusable patterns that can be applied to other projects:
- **Agents**: Documented agent roles and responsibilities (see "Agents and Responsibilities" section)
- **Skills**: Reusable workflows (`/sp.specify`, `/sp.plan`, `/sp.tasks`, `/sp.implement`, `/sp.adr`)
- **Architectural Patterns**: Event-driven architecture, microservices with Dapr, Kubernetes deployment patterns
- **AI-Native Development Workflow**: Spec-first → AI-implement → test → review cycle

**Test**: The agents, skills, and architectural patterns should be extractable and applicable to a different domain (e.g., evolving an e-commerce system or a blogging platform).

### Demonstrable Hackathon Deliverables

- Live demonstration of each phase (recorded or presented)
- Comprehensive documentation (this Constitution + specs + ADRs + runbooks)
- Metrics: code coverage, API response times, deployment success rate, chatbot accuracy
- Retrospective: lessons learned, what worked, what didn't, recommendations for future projects

## Governance

This Constitution is the supreme governing document for the **Evolution of Todo** project. All agents, humans, and processes must comply with its principles and constraints.

### Amendment Process

1. **Proposal**: Any team member or agent may propose a constitutional amendment by creating a document in `history/adr/` titled `Proposed Amendment: <topic>`.
2. **Review**: The System Architect Agent and Project Manager Agent review the proposal for consistency, necessity, and impact.
3. **Approval**: The human project lead (student) approves or rejects the amendment.
4. **Migration**: If approved, update this Constitution, increment the version (MAJOR for breaking changes, MINOR for additions, PATCH for clarifications), and propagate changes to all templates and dependent artifacts.

### Versioning Policy

- **Version Format**: `MAJOR.MINOR.PATCH`
- **MAJOR**: Backward-incompatible changes (principle removal, redefinition of core concepts)
- **MINOR**: New principles, new sections, material expansions
- **PATCH**: Clarifications, typo fixes, wording improvements

### Compliance Review

- **Pre-Merge**: All pull requests must include a Constitution compliance checklist
- **Quarterly**: The Code Quality & Integration Agent performs a full compliance audit
- **Violations**: Must be documented in `history/adr/` with justification or remediation plan

### Conflict Resolution

When conflicts arise between Constitution, specs, and code:
1. Constitution is authoritative for principles and governance
2. Specs are authoritative for feature requirements
3. Code must be updated to match specs; specs must be updated to match Constitution
4. If Constitution and specs conflict, amend the Constitution or update the spec

### Runtime Guidance

For detailed runtime guidance on using Claude Code, agents, skills, and MCP servers, refer to `CLAUDE.md` in the project root.

---

**Version**: 1.0.0 | **Ratified**: 2025-12-24 | **Last Amended**: 2025-12-24
