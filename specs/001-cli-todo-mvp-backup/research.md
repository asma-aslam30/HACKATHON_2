# Research: Todo App Core Essentials MVP - Phase 1 CLI

**Branch**: `001-cli-todo-mvp`
**Date**: 2025-12-26
**Purpose**: Resolve technical unknowns and document technology decisions

## Research Tasks

### 1. CLI Framework Selection

**Decision**: Use `inquirer` for interactive prompts

**Rationale**:
- Industry-standard Node.js library for interactive CLI applications
- Built-in support for list selection, input prompts, and confirmation dialogs
- Handles user input validation and formatting
- Well-documented with active maintenance
- Aligns with user input specifying "prompts" for task input

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| `prompts` | Less feature-rich for menu-based selection |
| `readline` (native) | Too low-level, requires significant boilerplate |
| `commander` | Better for command-line args, not interactive menus |
| `yargs` | Designed for argument parsing, not interactive flows |

---

### 2. Terminal Color Library

**Decision**: Use `chalk` for colored terminal output

**Rationale**:
- De facto standard for Node.js terminal colors
- Simple API: `chalk.green()`, `chalk.yellow()`
- Automatic detection of terminal color support
- Zero configuration required
- Excellent cross-platform support

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| `colors` | Modifies String prototype (bad practice) |
| `ansi-colors` | Less feature-rich than chalk |
| Raw ANSI codes | Not portable, hard to maintain |
| `kleur` | Smaller community, less documentation |

---

### 3. Unique ID Generation

**Decision**: Use `uuid` library (v4) for task identifiers

**Rationale**:
- Universally unique identifiers prevent collisions
- No need for sequential ID management
- Standard approach for distributed systems (future-proof for Phase II+)
- Simple API: `uuid.v4()`

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Auto-increment integers | Requires state tracking, collision risk on file corruption |
| `nanoid` | Shorter IDs less readable for CLI display |
| Timestamp-based | Collision risk if tasks created rapidly |
| `shortid` | Deprecated library |

**Note**: For CLI display, we'll show shortened IDs (first 8 characters) while storing full UUIDs.

---

### 4. File Persistence Strategy

**Decision**: Use native `fs` module with synchronous operations for simplicity

**Rationale**:
- Single-user CLI app doesn't need async I/O complexity
- Synchronous operations ensure data consistency
- JSON.parse/stringify handles serialization natively
- No external dependencies for file operations

**Implementation Pattern**:
```
Load: fs.readFileSync → JSON.parse → tasks array
Save: JSON.stringify → fs.writeFileSync → tasks.json
```

**Error Handling**:
- File not found: Create empty tasks.json
- Invalid JSON: Backup corrupted file, create fresh
- Write failure: Display error, don't lose in-memory data

---

### 5. Project Structure

**Decision**: Single-project structure with ES Modules

**Rationale**:
- CLI application is a single deployable unit
- ES Modules are modern JavaScript standard
- Separation of concerns via module files (not directories)
- Simple structure appropriate for Phase 1 MVP

**Structure**:
```
phases/phase-1/
├── src/
│   ├── index.js          # Entry point + main menu loop
│   ├── taskService.js    # CRUD operations + persistence
│   ├── display.js        # Colored output formatting
│   └── prompts.js        # Inquirer prompt definitions
├── data/
│   └── tasks.json        # Persisted task data (gitignored)
├── tests/
│   ├── taskService.test.js
│   └── display.test.js
├── package.json
└── README.md
```

---

### 6. Testing Framework

**Decision**: Use `jest` for unit and integration testing

**Rationale**:
- Most popular JavaScript testing framework
- Built-in assertions, mocking, and coverage
- ES Modules support with configuration
- Watch mode for development
- Familiar to most Node.js developers

**Test Coverage Targets**:
- Unit tests: taskService.js (CRUD operations)
- Integration tests: Full menu workflows
- Edge cases: Empty state, invalid JSON, validation errors

---

### 7. Error Handling Strategy

**Decision**: Graceful degradation with user-friendly messages

**Patterns**:
| Error Type | Handling |
|------------|----------|
| Invalid menu input | Re-show menu with "Invalid option" message |
| Empty title | Re-prompt with validation message |
| File read error | Create new tasks.json, warn user |
| File write error | Display error, retain in-memory data |
| Corrupted JSON | Backup file, create fresh, warn user |
| Ctrl+C interrupt | Exit gracefully (process event handler) |

---

### 8. Menu Structure

**Decision**: Numbered menu with loop-back pattern

**Menu Options**:
```
═══════════════════════════════════
       TODO APP - Main Menu
═══════════════════════════════════
  1. Add Task
  2. List Tasks
  3. Toggle Complete
  4. Delete Task
  5. Update Task
  6. Exit
═══════════════════════════════════
Enter your choice (1-6):
```

**Flow**:
1. Display menu
2. Get user choice
3. Execute operation
4. Show result
5. Return to menu (except Exit)

---

## Dependencies Summary

| Package | Version | Purpose |
|---------|---------|---------|
| `inquirer` | ^9.x | Interactive prompts |
| `chalk` | ^5.x | Terminal colors |
| `uuid` | ^9.x | Unique ID generation |
| `jest` | ^29.x | Testing (devDependency) |

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| File write permissions | Check permissions on startup, provide clear error |
| Corrupted JSON | Backup before overwrite, validate on read |
| Terminal color support | chalk auto-detects, falls back gracefully |
| Large task list performance | Acceptable for MVP; Phase II will use database |

---

## Open Questions Resolved

All technical unknowns from Technical Context have been resolved:
- ✅ Language/Version: Node.js 18+ (LTS)
- ✅ CLI Framework: inquirer
- ✅ Colors: chalk
- ✅ IDs: uuid v4
- ✅ Storage: JSON file (fs module)
- ✅ Testing: jest
- ✅ Project Structure: Single project, ES Modules
