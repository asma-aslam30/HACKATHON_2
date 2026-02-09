---
id: 0002
title: Plan Todo App Intelligent Features
stage: plan
date: 2025-12-27
surface: agent
model: claude-sonnet-4-5-20250929
feature: 003-intelligent-features
branch: 003-intelligent-features
user: system
command: /sp.plan
labels: ["due-dates", "recurring-tasks", "notifications", "luxon", "node-notifier"]
links:
  spec: specs/003-intelligent-features/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-intelligent-features/plan.md
  - specs/003-intelligent-features/research.md
  - specs/003-intelligent-features/data-model.md
  - specs/003-intelligent-features/contracts/cli-contract.md
  - specs/003-intelligent-features/quickstart.md
  - CLAUDE.md
tests:
  - null
---

## Prompt

Title: Todo App Intelligent Features
Phases:
1. Due date picker + overdue states (2h)
2. Recurring task logic/UI (4h)
3. Notification system + permissions (3h)
4. Filter/sort by date integration (2h)
5. Smart UX polish (2h)
6. Edge cases + testing (2-3h)
Risks: Timezone issues, notification perms
Milestone: Production-ready smart todo

## Response snapshot

Completed implementation planning with:

**Phase 0 (Research)**:
- Resolved tech stack (Node.js ES6 modules)
- Selected Luxon for date/time handling (over moment.js, date-fns)
- Selected node-notifier for desktop notifications (CLI reinterpretation of "browser notifications")
- Defined in-place schema migration strategy

**Phase 1 (Design)**:
- Extended Task entity with 5 new fields: dueDate, recurrencePattern, reminderOffset, reminderEnabled, suggestionDismissed
- Defined 3 new service modules: dateService.js, notificationService.js, suggestionService.js
- Created CLI service contracts with full API signatures
- Documented recurrence calculation logic with edge cases

**Constitution Check**: All 8 principles PASS

**Artifacts Created**:
1. plan.md - Implementation plan with 6 phases
2. research.md - Technology decisions and rationale
3. data-model.md - Entity definitions and migration strategy
4. contracts/cli-contract.md - Internal service APIs
5. quickstart.md - User-facing feature documentation

## Outcome

- Impact: Complete implementation blueprint for intelligent features
- Tests: Manual acceptance testing planned (spec scenarios)
- Files: 5 new files + CLAUDE.md updated with tech stack
- Next prompts: /sp.tasks to generate dependency-ordered task list
- Reflection: Reinterpreted "browser notifications" as desktop notifications for CLI context

## Evaluation notes (flywheel)

- Failure modes observed: None - spec was clear, existing codebase well-structured
- Graders run and results (PASS/FAIL): Constitution Check PASS (all 8 principles)
- Prompt variant (if applicable): Standard /sp.plan flow
- Next experiment: N/A
