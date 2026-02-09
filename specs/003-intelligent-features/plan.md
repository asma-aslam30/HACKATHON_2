# Implementation Plan: Todo App Intelligent Features

**Branch**: `003-intelligent-features` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-intelligent-features/spec.md`

## Summary

Add intelligent time-based features to the CLI todo app: due date/time picker for tasks, overdue highlighting with countdown timers, recurring task patterns (daily/weekly/monthly) that auto-reschedule on completion, desktop notifications for reminders, filter/sort by due date, and smart suggestions that detect time-sensitive keywords in task titles.

**Technical Approach**: Extend existing Node.js CLI with Luxon for robust date/time handling and node-notifier for cross-platform desktop notifications. Schema extension adds new fields with defaults for backward compatibility.

## Technical Context

**Language/Version**: Node.js (ES6 modules)
**Primary Dependencies**: inquirer v9.2.12, chalk v5.3.0, uuid v9.0.1, **luxon v3.4.0** (new), **node-notifier v10.0.0** (new)
**Storage**: JSON file (`phases/phase-1/data/tasks.json`)
**Testing**: Manual acceptance testing (no automated framework in current phase)
**Target Platform**: Cross-platform CLI (Windows, macOS, Linux)
**Project Type**: Single CLI application
**Performance Goals**: All operations < 100ms, notification scheduling within 1 second
**Constraints**: Offline-capable, file-based storage, no external services
**Scale/Scope**: Personal use, 1000+ tasks supported

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-First Development | PASS | spec.md created and approved before plan.md |
| II. AI-Implemented Only | PASS | All code will be AI-generated per spec |
| III. Single Source of Truth | PASS | Spec defines requirements, plan defines implementation |
| IV. Evolutionary Architecture | PASS | Extends Phase 2; no rewrites; backward-compatible schema |
| V. Testability and Documentation | PASS | Acceptance scenarios in spec; manual testing plan |
| VI. Observability | PASS | Console logging for notifications; no distributed tracing needed for CLI |
| VII. Security by Design | PASS | No secrets; local-only storage; no user input validation concerns |
| VIII. Incremental Delivery | PASS | User stories prioritized P1→P3; MVP = P1 stories only |

**Gate Result**: PASS - No violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/003-intelligent-features/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (complete)
├── research.md          # Phase 0 output (complete)
├── data-model.md        # Phase 1 output (this planning session)
├── quickstart.md        # Phase 1 output (this planning session)
├── contracts/           # Phase 1 output (CLI contract - internal APIs)
│   └── cli-contract.md  # Internal service API definitions
├── checklists/
│   └── requirements.md  # Quality validation checklist (complete)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
phases/phase-1/
├── src/
│   ├── index.js              # Main entry point - ADD notification scheduler init
│   ├── taskService.js        # Core CRUD - EXTEND with due date, recurrence, reminders
│   ├── display.js            # Terminal output - EXTEND with countdown, overdue styling
│   ├── prompts.js            # CLI prompts - EXTEND with date picker, recurrence selection
│   ├── dateService.js        # NEW: Date/time utilities using Luxon
│   ├── notificationService.js # NEW: Desktop notification scheduling
│   └── suggestionService.js  # NEW: Smart suggestion pattern matching
├── data/
│   └── tasks.json            # Task storage - schema extended with new fields
├── package.json              # ADD luxon, node-notifier dependencies
└── README.md                 # Update with new features documentation
```

**Structure Decision**: Extend existing Phase 1 single-project structure. Add three new service modules for separation of concerns: `dateService.js` (date utilities), `notificationService.js` (reminder scheduling), `suggestionService.js` (keyword detection).

## Implementation Phases

### Phase 1: Due Date Picker + Overdue States

**User Stories Covered**: US1 (P1), US2 (P1)

**Components**:
1. `dateService.js` - Luxon wrapper for date parsing, formatting, relative time
2. `prompts.js` - Date/time picker using inquirer-datepicker-prompt or manual input
3. `display.js` - Overdue highlighting (red), due soon (yellow), countdown formatting
4. `taskService.js` - Add `dueDate` field to task schema, update CRUD operations

**Acceptance Criteria**:
- User can set due date/time on new and existing tasks
- Overdue tasks display in red with "X days overdue" text
- Tasks due within 24h show countdown (e.g., "Due in 3h 45m")
- Tasks without due dates display normally (no highlighting)

### Phase 2: Recurring Task Logic/UI

**User Stories Covered**: US4 (P2)

**Components**:
1. `taskService.js` - Add `recurrencePattern` field, implement auto-reschedule on complete
2. `prompts.js` - Recurrence selection (None/Daily/Weekly/Monthly)
3. `display.js` - Recurrence indicator in task display

**Acceptance Criteria**:
- User can set recurrence pattern when setting due date
- Completing a recurring task creates a new task with next due date
- Monthly tasks handle month-end edge cases correctly
- User can edit or remove recurrence pattern

### Phase 3: Notification System + Permissions

**User Stories Covered**: US5 (P3)

**Components**:
1. `notificationService.js` - Schedule/cancel notifications using node-notifier
2. `taskService.js` - Add `reminderOffset` field (default 15 minutes)
3. `index.js` - Initialize notification scheduler on app start
4. `prompts.js` - Reminder configuration option

**Acceptance Criteria**:
- Desktop notification appears at scheduled reminder time
- User can configure reminder timing per task
- App startup schedules notifications for all upcoming tasks
- Graceful fallback if notifications are blocked

### Phase 4: Filter/Sort by Date Integration

**User Stories Covered**: US3 (P2)

**Components**:
1. `taskService.js` - Add date-based filter predicates and sort comparator
2. `prompts.js` - Add filter options (Due today, Due this week, Overdue, No due date)
3. `display.js` - Filter header shows current date filter

**Acceptance Criteria**:
- Sort by due date puts soonest first, nulls at end
- Filter "Due today" shows only today's tasks
- Filter "Due this week" shows tasks within 7 days
- Filter "Overdue" shows past-due tasks only

### Phase 5: Smart UX Polish

**User Stories Covered**: US6 (P3)

**Components**:
1. `suggestionService.js` - Pattern matching for time-sensitive keywords
2. `taskService.js` - Add `suggestionDismissed` field
3. `prompts.js` - Suggestion prompt after task creation
4. `display.js` - Suggestion display formatting

**Acceptance Criteria**:
- Task with "by Friday" in title prompts "Add due date?" after creation
- User can accept (opens date picker) or dismiss suggestion
- Dismissed suggestions don't reappear for same task

### Phase 6: Edge Cases + Testing

**Components**:
1. All services - Edge case handling per spec
2. Manual testing - Follow acceptance scenarios from spec

**Edge Cases**:
- Recurring task deleted before completion
- Timezone differences (UTC storage, local display)
- Idempotent recurring task completion
- Notifications blocked at OS level
- Monthly task on 31st rolling to shorter month

## Complexity Tracking

> No Constitution violations identified. Table below documents intentional complexity.

| Decision | Justification | Simpler Alternative |
|----------|---------------|---------------------|
| Three new service modules | Separation of concerns; testable units | All code in taskService.js - rejected for maintainability |
| Luxon library | Robust timezone/DST handling | Native Date - rejected for complexity and bugs |
| node-notifier | Cross-platform support | OS-specific commands - rejected for portability |

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Timezone bugs | Medium | UTC storage, Luxon for all conversions, test with multiple timezones |
| Notification permission | Low | Graceful degradation to console message; document OS settings |
| Large task list performance | Low | Lazy calculation; defer pagination to future phase |
| Inquirer date picker complexity | Medium | Fallback to manual text input if plugin issues |

## Dependencies to Add

```json
{
  "dependencies": {
    "luxon": "^3.4.0",
    "node-notifier": "^10.0.0"
  }
}
```

## ADR Candidates

Two architectural decisions warrant formal ADRs:

1. **ADR: Luxon for Date/Time Handling** - Why Luxon over moment.js, date-fns, or native Date
2. **ADR: Desktop Notifications for CLI App** - Reinterpreting "browser notifications" for CLI context

Run `/sp.adr <title>` to document these if desired.

## Next Steps

1. Run `/sp.tasks` to generate detailed, dependency-ordered task list
2. Execute tasks in order using AI implementation
3. Manual acceptance testing against spec scenarios
4. Create PHR on completion
