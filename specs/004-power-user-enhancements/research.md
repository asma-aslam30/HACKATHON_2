# Research: Todo App Power User Enhancements

**Feature**: 004-power-user-enhancements
**Date**: 2025-12-27
**Status**: Complete

---

## Executive Summary

This research consolidates findings from codebase exploration and technology evaluation for implementing templates, subtasks, time tracking, Pomodoro timer, and keyboard shortcuts in the existing CLI Todo app.

---

## 1. Existing Architecture Analysis

### Current Tech Stack
- **Runtime**: Node.js 18+ with ES6 modules
- **CLI Prompts**: inquirer ^9.2.12
- **Terminal Colors**: chalk ^5.3.0
- **Date/Time**: luxon ^3.7.2
- **Notifications**: node-notifier ^10.0.1
- **IDs**: uuid ^9.0.1

### Current Data Model
```javascript
{
  id, title, description, completed, createdAt,
  priority, tags, sortOrder,
  dueDate, recurrencePattern, reminderOffset, reminderEnabled, suggestionDismissed
}
```

### Existing Patterns
- **Services**: Singleton pattern (taskService exports instance)
- **Persistence**: JSON file at `data/tasks.json`
- **Migration**: `migrateTask()` adds default values for new fields
- **Timers**: setTimeout-based scheduling in notificationService
- **UI**: Modular display functions with chalk styling

---

## 2. Technology Decisions

### 2.1 Template Storage

**Decision**: Store templates in the same `tasks.json` file under a separate `templates` key

**Rationale**:
- Keeps all user data in one place
- Reuses existing JSON persistence mechanism
- Migration system already handles schema evolution
- No additional dependencies needed

**Alternatives Considered**:
- Separate `templates.json` file - rejected (unnecessary complexity, harder to sync)
- In-memory only - rejected (violates persistence requirement)

### 2.2 Subtask Implementation

**Decision**: Embed subtasks as array within parent task object

**Rationale**:
- Simple data model (no foreign key management)
- Parent-child relationship is clear
- Cascading delete is automatic
- Matches existing tags array pattern

**Alternatives Considered**:
- Separate subtasks collection with references - rejected (overkill for single-level nesting)
- Linked list structure - rejected (complexity without benefit)

**Subtask Schema**:
```javascript
subtasks: [
  { id: string, title: string, completed: boolean, createdAt: string }
]
```

### 2.3 Time Tracking Implementation

**Decision**: Use task-embedded time entries with process-level active timer state

**Rationale**:
- Time entries persist with task (survives restart)
- Active timer is process state (session-scoped, auto-stops on exit)
- Follows existing reminder/notification pattern
- No external timer library needed (Date.now() + setTimeout)

**Alternatives Considered**:
- External timer service - rejected (unnecessary for CLI)
- Database with timestamps - rejected (no database in Phase 1)

**TimeEntry Schema**:
```javascript
timeEntries: [
  { id: string, startTime: string, endTime: string, durationMs: number }
],
totalTimeMs: number  // Cached total for quick display
```

### 2.4 Pomodoro Timer Implementation

**Decision**: Build on time tracking with fixed intervals and desktop notifications

**Rationale**:
- Reuses notification service for alerts
- Leverages existing setTimeout pattern
- Can run independently of task timers
- Session state stored in memory (Pomodoro doesn't persist across restarts)

**Pomodoro Config**:
```javascript
pomodoroConfig: {
  workDuration: 25,      // minutes (configurable)
  breakDuration: 5,      // minutes (configurable)
  completedToday: 0,     // count
  lastResetDate: string  // for daily reset
}
```

### 2.5 Keyboard Shortcuts Implementation

**Decision**: Use readline for raw key input, bypass inquirer for shortcut detection

**Rationale**:
- Inquirer doesn't support single-keypress detection
- readline.emitKeypressEvents() provides raw key events
- Can layer on top of existing menu system
- Works in terminal environments (TTY detection for compatibility)

**Alternatives Considered**:
- blessed/blessed-contrib - rejected (too heavy, changes entire UI paradigm)
- ink (React for CLI) - rejected (major rewrite required)
- keypress npm package - rejected (unmaintained, can use native readline)

**Implementation Pattern**:
```javascript
// In index.js, before menu display:
if (process.stdin.isTTY) {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on('keypress', handleKeypress);
}
```

---

## 3. Risk Analysis and Mitigations

### Risk 1: Timer Persistence Across Restarts
**Risk Level**: Medium
**Impact**: User loses tracked time if app crashes during timing

**Mitigation**:
- Save timer start time immediately when started
- On startup, check for orphaned timer and calculate elapsed time
- Use SIGINT/SIGTERM handlers to save state before exit
- Store `activeTimerState: { taskId, startTime }` in tasks.json

### Risk 2: Keyboard Shortcuts on Non-TTY Environments
**Risk Level**: Low
**Impact**: Shortcuts won't work in piped/scripted environments

**Mitigation**:
- Detect `process.stdin.isTTY` before enabling shortcuts
- Graceful fallback to numeric menu input
- Document terminal requirements in README
- All functionality remains accessible via menu

### Risk 3: Pomodoro Timer Accuracy
**Risk Level**: Low
**Impact**: Timer drift over long sessions

**Mitigation**:
- Store absolute end time, not remaining duration
- Calculate remaining from `endTime - Date.now()`
- Display updates use setTimeout with recalculation

### Risk 4: Subtask Count Performance
**Risk Level**: Low
**Impact**: Slow display if many subtasks

**Mitigation**:
- Limit subtasks to 20 per task (UI constraint)
- Cache completion count in parent task
- Update cache on subtask toggle

---

## 4. Integration Points

### New Service Modules Required
1. **templateService.js** - Template CRUD operations
2. **timerService.js** - Time tracking and Pomodoro logic
3. **keyboardService.js** - Key event handling and shortcuts

### TaskService Extensions
- Add subtask methods: `addSubtask()`, `toggleSubtask()`, `deleteSubtask()`
- Add time entry methods: `startTimer()`, `stopTimer()`, `getTimeEntries()`
- Extend migration for new schema fields

### Display Extensions
- `showSubtasks()` - Indented subtask list with checkboxes
- `showTimer()` - Active timer display with elapsed time
- `showPomodoro()` - Pomodoro status bar
- `showShortcutHelp()` - Keyboard shortcut overlay

### Menu Extensions
- Option 11: Manage Templates
- Option 12: Start/Stop Timer
- Option 13: Pomodoro Timer
- Help shortcut: '?' shows all shortcuts

---

## 5. Dependency Evaluation

### No New Dependencies Required
All features can be implemented with:
- Native Node.js `readline` module (keyboard shortcuts)
- Existing `node-notifier` (Pomodoro alerts)
- Existing `luxon` (timer duration formatting)
- Existing `chalk` (UI styling)
- Existing `inquirer` (prompts)
- Existing `uuid` (subtask/timeEntry IDs)

### Optional Enhancement
- `cli-progress` - Could add progress bar for Pomodoro, but not required

---

## 6. Testing Considerations

### Manual Test Scenarios
1. **Templates**: Create template → Create task from template → Verify fields
2. **Subtasks**: Add subtasks → Toggle some → Verify progress indicator
3. **Time Tracking**: Start timer → Wait → Stop → Verify accumulated time
4. **Pomodoro**: Start session → Wait for notification → Verify break starts
5. **Shortcuts**: Press 'N' → Verify add task starts → Press '?' → Verify help shows

### Edge Cases to Test
- Template with all fields vs minimal fields
- Subtask completion when parent is toggled
- Timer behavior on app exit (SIGINT)
- Pomodoro notification in background
- Shortcut behavior during prompt input
- Timer conflict between task timer and Pomodoro

---

## 7. Performance Considerations

### Timer Update Display
- Don't redraw entire screen every second
- Use ANSI cursor positioning for in-place updates
- Rate-limit display updates to 1/second

### Subtask Count Caching
- Store `completedSubtaskCount` on parent task
- Update on subtask toggle (increment/decrement)
- Avoid counting on every display

### JSON File Size
- Templates and time entries add data
- Estimate: ~500 bytes per template, ~100 bytes per time entry
- Monitor file size, consider archiving old time entries if >1MB

---

## 8. Conclusion

All five features can be implemented using existing patterns and dependencies:

| Feature | Implementation Approach | New Service | Dependencies |
|---------|------------------------|-------------|--------------|
| Templates | JSON storage in tasks.json | templateService.js | None new |
| Subtasks | Embedded array in task | taskService extension | None new |
| Time Tracking | Embedded entries + process state | timerService.js | None new |
| Pomodoro | setTimeout + notifications | timerService.js | None new |
| Shortcuts | Native readline module | keyboardService.js | None new |

**Ready for Phase 1 design artifacts.**
