# Implementation Plan: Todo App Core Essentials MVP - Phase 1 CLI

**Branch**: `001-cli-todo-mvp` | **Date**: 2025-12-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-cli-todo-mvp/spec.md`

## Summary

Build a CLI-based todo application with essential CRUD operations using Node.js. The application provides an interactive menu-driven interface for managing tasks (add, list, toggle completion, delete, update) with colored terminal output and JSON file persistence.

## Technical Context

**Language/Version**: Node.js 18+ (LTS)
**Primary Dependencies**: inquirer (prompts), chalk (colors), uuid (IDs)
**Storage**: JSON file (`data/tasks.json`)
**Testing**: jest
**Target Platform**: Cross-platform CLI (Linux, macOS, Windows)
**Project Type**: Single project (CLI application)
**Performance Goals**: <1s startup, <100ms per operation
**Constraints**: Single-user, file-based storage, terminal with ANSI color support
**Scale/Scope**: Up to 10,000 tasks (JSON file limit)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-First Development | ✅ PASS | Spec created before implementation |
| II. AI-Implemented Only | ✅ PASS | All code will be AI-generated |
| III. Single Source of Truth | ✅ PASS | Spec governs all implementation |
| IV. Evolutionary Architecture | ✅ PASS | Phase 1 foundation for future phases |
| V. Testability | ✅ PASS | All features have testable acceptance criteria |
| VI. Observability | ✅ PASS | Console logging for CLI (appropriate for Phase 1) |
| VII. Security by Design | ✅ PASS | No secrets, local file storage only |
| VIII. Incremental Delivery | ✅ PASS | P1/P2/P3 prioritized user stories |

**Gate Status**: ALL PASS - Proceed to implementation

## Project Structure

### Documentation (this feature)

```text
specs/001-cli-todo-mvp/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technology decisions
├── data-model.md        # Entity definitions
├── quickstart.md        # Usage guide
├── contracts/           # Interface contracts
│   ├── task-service.md  # Service layer contract
│   └── cli-interface.md # UI/UX contract
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Task breakdown (created by /sp.tasks)
```

### Source Code (repository root)

```text
phases/phase-1/
├── src/
│   ├── index.js          # Entry point + main menu loop
│   ├── taskService.js    # CRUD operations + file persistence
│   ├── display.js        # Colored terminal output formatting
│   └── prompts.js        # Inquirer prompt definitions
├── data/
│   └── tasks.json        # Persisted task data (gitignored)
├── tests/
│   ├── taskService.test.js  # Service unit tests
│   ├── display.test.js      # Display unit tests
│   └── integration.test.js  # Full workflow tests
├── package.json          # Dependencies + scripts
├── .gitignore            # Ignore data/, node_modules/
└── README.md             # Project documentation
```

**Structure Decision**: Single project structure selected. CLI application is a single deployable unit with clear separation of concerns through module files. ES Modules used for modern JavaScript compatibility.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLI Application                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  index.js   │───▶│ prompts.js  │    │ display.js  │     │
│  │ (main loop) │    │ (user input)│    │ (output)    │     │
│  └──────┬──────┘    └─────────────┘    └─────────────┘     │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              taskService.js                          │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │   │
│  │  │ create  │  │  read   │  │ update  │  │ delete │ │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └────────┘ │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  tasks.json                          │   │
│  │                 (file storage)                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Phases (User Input)

Based on user-provided phases:

1. **Setup project + npm packages** - Initialize Node.js project with dependencies
2. **Create tasks.json CRUD functions** - Implement taskService.js
3. **Build main menu with inquirer** - Create interactive menu loop
4. **Implement add/list tasks** - P1 features (add, list)
5. **Implement delete/toggle/update** - P1/P2 features (toggle, delete, update)
6. **Add colors + polish display** - Implement display.js with chalk
7. **Test persistence + edge cases** - Write tests, validate edge cases

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| File write permissions | High | Check permissions on startup, provide clear error message |
| Corrupted JSON | Medium | Validate on read, backup before write, graceful recovery |
| Terminal color support | Low | chalk auto-detects, falls back gracefully |
| Large task list performance | Low | Acceptable for MVP (<10k tasks); Phase II uses database |

## Dependencies

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| inquirer | ^9.x | Interactive CLI prompts |
| chalk | ^5.x | Terminal color output |
| uuid | ^9.x | Unique ID generation |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| jest | ^29.x | Testing framework |

## Success Metrics

| Metric | Target | Validation |
|--------|--------|------------|
| Task add time | <30 seconds | Manual test |
| Startup time | <1 second | Manual test |
| Operations without data loss | 100% | Integration tests |
| Code coverage | >80% | jest --coverage |

## Artifacts Generated

- ✅ `research.md` - Technology decisions documented
- ✅ `data-model.md` - Entity schemas and operations defined
- ✅ `contracts/task-service.md` - Service layer interface
- ✅ `contracts/cli-interface.md` - UI/UX patterns
- ✅ `quickstart.md` - Usage documentation

## Next Steps

Run `/sp.tasks` to generate the detailed task breakdown for implementation.

## Complexity Tracking

> No constitution violations requiring justification. Design follows minimum complexity principles.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Single project | Yes | CLI is single deployable unit |
| No database | Yes | JSON file sufficient for Phase 1 |
| Synchronous I/O | Yes | Single-user, simplicity over performance |
| ES Modules | Yes | Modern JavaScript standard |
