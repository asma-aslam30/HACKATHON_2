# Research: Todo App Intelligent Features

**Feature Branch**: `003-intelligent-features`
**Date**: 2025-12-27
**Status**: Complete

## 1. Tech Stack Confirmation

### Decision: Node.js CLI Application (ES6 Modules)

**Rationale**: The existing codebase (Phase 1 and 2) uses Node.js with ES6 modules. Maintaining consistency ensures evolutionary architecture principles are followed.

**Current Stack**:
- **Runtime**: Node.js (ES6 modules with `"type": "module"`)
- **CLI Library**: inquirer v9.2.12
- **Styling**: chalk v5.3.0
- **ID Generation**: uuid v9.0.1
- **Storage**: JSON file-based (`data/tasks.json`)

**Alternatives Considered**:
- TypeScript migration - Rejected: Too large a change for Phase 3, consider for Phase 4
- Database upgrade (SQLite) - Rejected: File-based storage sufficient for CLI app

---

## 2. Due Date/Time Handling

### Decision: ISO-8601 Strings with Luxon Library

**Rationale**: ISO-8601 strings are already used for `createdAt` timestamps. Luxon provides robust timezone handling and human-readable relative time formatting.

**Implementation**:
- Store `dueDate` as ISO-8601 string (e.g., `"2025-12-31T14:00:00.000Z"`)
- Use Luxon for:
  - Parsing user input (date-fns-like API)
  - Timezone conversion (UTC storage, local display)
  - Relative time formatting ("in 3 hours", "2 days overdue")

**New Dependency**: `luxon` (recommended over moment.js - modern, immutable, tree-shakeable)

**Alternatives Considered**:
- Native Date objects - Rejected: Poor timezone handling
- date-fns - Rejected: Less comprehensive than Luxon for timezone support
- moment.js - Rejected: Deprecated, large bundle size

---

## 3. Recurring Task Patterns

### Decision: Enum-based Recurrence with Calculated Next Dates

**Rationale**: Simple enum-based recurrence (daily/weekly/monthly) covers 90% of use cases and avoids complexity of cron expressions or RRULE format.

**Implementation**:
```javascript
recurrencePattern: "none" | "daily" | "weekly" | "monthly"
```

**Next Due Date Calculation**:
- **Daily**: Add 1 day to completed task's due date
- **Weekly**: Add 7 days to completed task's due date
- **Monthly**: Add 1 month (handling month-end edge cases with Luxon)

**Edge Case: Monthly on 31st**:
- If next month has fewer days, use last day of month (e.g., Jan 31 → Feb 28/29)
- Luxon handles this natively with `.plus({ months: 1 })`

**Alternatives Considered**:
- RRULE/iCalendar format - Rejected: Overkill for simple recurrence
- Custom day selection (e.g., "every Tuesday") - Deferred to future phase

---

## 4. Browser Notifications

### Decision: node-notifier for Cross-Platform Desktop Notifications

**Rationale**: This is a CLI application, not a browser app. "Browser notifications" in the spec should be interpreted as "desktop notifications" for the CLI context.

**Implementation**:
- Use `node-notifier` for cross-platform desktop notifications (Windows, macOS, Linux)
- Check notification availability on startup
- Schedule notifications using setTimeout/setInterval with persistence

**Notification Scheduling**:
- On app start: Check all tasks with due dates and schedule notifications
- On task create/update: Schedule/reschedule notification
- Reminder offset stored per task (default: 15 minutes before)

**New Dependency**: `node-notifier` (mature, cross-platform)

**Alternatives Considered**:
- Built-in `notify-send` (Linux) - Rejected: Not cross-platform
- Electron integration - Rejected: Overkill for CLI app

---

## 5. Countdown/Timer Display

### Decision: Real-time Updates with Blessed-Contrib or Interval Refresh

**Rationale**: CLI cannot do true real-time updates like a browser. Two approaches available.

**Chosen Approach**: Interval-based refresh with clear display
- Calculate countdown at display time using Luxon
- For "due soon" tasks (< 24h), show precise countdown
- For overdue tasks, show elapsed time
- Use chalk for color-coded urgency indicators

**Display Format**:
```
Due in 3h 45m    (green - > 2h remaining)
Due in 1h 30m    (yellow - 1-2h remaining)
Due in 45m       (red - < 1h remaining)
2d overdue       (red, bold - past due)
```

**Alternatives Considered**:
- blessed/blessed-contrib for live updates - Rejected: Adds complexity, conflicts with inquirer
- ASCII progress bar for countdown - Deferred: Nice-to-have, not essential

---

## 6. Filter/Sort Integration

### Decision: Extend Existing ViewState with Date Filters

**Rationale**: Phase 2 already implements filter/sort with ViewState persistence. Extend, don't replace.

**New Filter Options**:
- "Due today" - Tasks due within today
- "Due this week" - Tasks due within 7 days
- "Overdue" - Tasks past their due date
- "No due date" - Tasks without due dates

**New Sort Option**:
- "By due date" - Ascending, with null dates at end

**Implementation**:
- Add filter predicates to `taskService.js`
- Add sort comparator to existing sort logic
- Update prompts and display for new options

**Alternatives Considered**: None - straightforward extension of existing pattern

---

## 7. Smart Suggestions

### Decision: Keyword-Based Pattern Matching

**Rationale**: Simple keyword matching achieves acceptable accuracy without AI/ML complexity. Matches spec requirement for "simple keyword matching."

**Keyword Patterns for Due Date Suggestions**:
- Time words: "today", "tomorrow", "Monday"-"Sunday", "next week"
- Deadline words: "by", "due", "deadline", "before", "until"
- Date formats: "12/31", "Dec 31", "December 31"

**Implementation**:
```javascript
const patterns = [
  /\b(today|tonight)\b/i,
  /\b(tomorrow)\b/i,
  /\b(by|due|deadline|before|until)\s+/i,
  /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  /\bnext\s+(week|month)\b/i
];
```

**Suggestion UX**:
- After task creation, check title for patterns
- If match found, prompt: "This task mentions a time. Add a due date?"
- User can accept (opens date picker) or dismiss
- Dismissed suggestions stored in task metadata

**Alternatives Considered**:
- NLP/AI parsing - Rejected: Out of scope per spec
- No suggestions - Rejected: Explicitly required by spec

---

## 8. Data Migration Strategy

### Decision: In-Place Schema Extension

**Rationale**: JSON schema is flexible. Add new fields with defaults; existing tasks continue to work.

**New Fields Added to Task Schema**:
```javascript
{
  // Existing fields...
  dueDate: null,              // ISO-8601 string or null
  recurrencePattern: "none",  // "none" | "daily" | "weekly" | "monthly"
  reminderOffset: 15,         // minutes before due date (default 15)
  suggestionDismissed: false  // whether smart suggestion was dismissed
}
```

**Migration on Load**:
- Check each task for new fields
- Add missing fields with defaults
- No explicit migration script needed (handled in `loadData()`)

**Alternatives Considered**:
- Separate migration script - Rejected: Unnecessary for additive schema changes
- New data file format - Rejected: Violates evolutionary architecture principle

---

## 9. Testing Strategy

### Decision: Manual Acceptance Testing with Spec Scenarios

**Rationale**: Current codebase has no test framework. Adding testing infrastructure is out of scope for this feature. Use spec's acceptance scenarios for manual testing.

**Testing Approach**:
1. Follow User Story acceptance scenarios from spec
2. Document test results in checklist format
3. Create edge case test data for boundary conditions

**Future Consideration**: Add Jest/Vitest test framework in Phase 4

**Alternatives Considered**:
- Add Jest now - Rejected: Scope creep, defer to future phase
- No testing - Rejected: Constitution requires testability

---

## 10. Risk Mitigations

### Risk 1: Timezone Issues

**Mitigation**:
- Store all dates in UTC (ISO-8601 with Z suffix)
- Display in user's local timezone (detected by Luxon)
- Test with tasks created in different timezones

### Risk 2: Notification Permission

**Mitigation**:
- node-notifier works without explicit permission on most systems
- Detect notification availability on startup
- Provide fallback console message if notifications fail
- Document OS-specific notification settings in README

### Risk 3: Large Task Lists with Due Dates

**Mitigation**:
- Lazy calculation of overdue/countdown status
- Efficient date comparison using timestamps
- Paginate task lists if needed (defer to future phase)

---

## Dependencies Summary

### New Dependencies to Add

| Package | Version | Purpose |
|---------|---------|---------|
| luxon | ^3.4.0 | Date/time handling, timezone support, relative formatting |
| node-notifier | ^10.0.0 | Cross-platform desktop notifications |

### Existing Dependencies (Unchanged)

| Package | Version | Purpose |
|---------|---------|---------|
| inquirer | ^9.2.12 | Interactive CLI prompts |
| chalk | ^5.3.0 | Terminal colors |
| uuid | ^9.0.1 | Unique ID generation |

---

## Architecture Decisions

### ADR Candidates Identified

1. **ADR: Luxon for Date/Time Handling** - Decision to use Luxon over alternatives
2. **ADR: Desktop Notifications for CLI** - Reinterpretation of "browser notifications" for CLI context

**Note**: Run `/sp.adr` after plan approval if user wants these documented formally.
