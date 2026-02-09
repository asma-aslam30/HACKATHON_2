# Quickstart: Power User Enhancements

**Feature**: 004-power-user-enhancements
**Prerequisites**: Phases 1-3 complete (working Todo app with intelligent features)

---

## Quick Test Scenarios

### 1. Templates (US1)

```bash
# Start the app
npm start

# Create a task to use as template base
1. Add Task
   Title: Weekly Team Meeting
   Description: Discuss progress and blockers
   Priority: Medium
   Tags: work, meeting
   Due date: No (skip)

# Save as template (when implemented)
11. Templates
   → Save current task as template
   → Name: "Weekly Meeting"

# Create task from template
1. Add Task
   → Create from template
   → Select "Weekly Meeting"
   → Modify title to "Week 52 Meeting"
   → Save

# Verify template fields were applied
2. List Tasks
   → Check new task has priority=medium, tags=[work, meeting]
```

### 2. Subtasks (US2)

```bash
# Create parent task
1. Add Task
   Title: Plan Sprint
   (complete other fields)

# Add subtasks (when implemented)
5. Update Task
   → Select "Plan Sprint"
   → Add Subtask
   → Title: "Review backlog"
   → Add Subtask
   → Title: "Assign stories"
   → Add Subtask
   → Title: "Set deadlines"

# Toggle subtask completion
3. Toggle Complete
   → Select "Plan Sprint" → subtask "Review backlog"
   → Verify progress shows [1/3]

# Toggle another subtask
3. Toggle Complete
   → Select "Plan Sprint" → subtask "Assign stories"
   → Verify progress shows [2/3]

# Complete parent task
3. Toggle Complete
   → Select "Plan Sprint" (parent)
   → Verify ALL subtasks now marked complete
```

### 3. Time Tracking (US3)

```bash
# Start timer on a task
12. Start/Stop Timer
   → Select task
   → Timer starts (shows elapsed time)

# Wait 30 seconds, then stop
12. Start/Stop Timer
   → Confirms stop
   → Shows "Tracked: 0m 30s"

# Verify time recorded
2. List Tasks
   → Task shows total time: 30s

# Start timer on different task
12. Start/Stop Timer
   → Select different task
   → First task's timer auto-stopped
   → New timer starts
```

### 4. Pomodoro Timer (US4)

```bash
# Start Pomodoro
13. Pomodoro
   → Start Pomodoro
   → Shows: "Work: 25:00 remaining"

# (For quick test, configure shorter duration)
13. Pomodoro
   → Settings
   → Work duration: 1 minute
   → Break duration: 1 minute

# Start short Pomodoro
13. Pomodoro
   → Start Pomodoro
   → Wait for notification
   → Verify break timer starts automatically
   → Wait for break notification
   → Verify "1 Pomodoro completed today"
```

### 5. Keyboard Shortcuts (US5)

```bash
# From main menu
Press 'N' → Add Task flow starts
Press 'Esc' → Cancels back to menu

Press '/' → Search prompt appears
Press 'Esc' → Back to menu

Press '?' → Help overlay shows all shortcuts
Press any key → Dismisses help

Press 'Q' → Quits application (same as option 10)

# From task list
Press 'J' → Selection moves down
Press 'K' → Selection moves up
Press 'X' → Toggles selected task
Press 'Enter' → Opens selected task
```

---

## Validation Checklist

### Templates
- [ ] Can save task as template with unique name
- [ ] Can view list of saved templates
- [ ] Can create task from template (fields pre-filled)
- [ ] Can modify fields before saving task from template
- [ ] Can edit existing template
- [ ] Can delete template without affecting existing tasks
- [ ] Name conflict prompts for rename/overwrite

### Subtasks
- [ ] Can add subtask to any task (max 20)
- [ ] Subtasks display indented under parent
- [ ] Progress shows X/Y format
- [ ] Toggle subtask updates progress
- [ ] Toggle parent marks all subtasks complete
- [ ] All subtasks complete does NOT auto-complete parent
- [ ] Delete parent removes all subtasks

### Time Tracking
- [ ] Can start timer on any task
- [ ] Timer shows elapsed time updating
- [ ] Can stop timer and save duration
- [ ] Total time accumulates across sessions
- [ ] Starting timer on Task B stops timer on Task A
- [ ] Timer recovers on restart (prompt to save/discard)
- [ ] App exit auto-saves timer

### Pomodoro
- [ ] Can start 25-minute work session
- [ ] Countdown displays correctly
- [ ] Notification when work ends
- [ ] Break timer starts automatically (5 min)
- [ ] Notification when break ends
- [ ] Can cancel Pomodoro (no count)
- [ ] Today's count increments on completion
- [ ] Count resets at midnight
- [ ] Can configure work/break durations

### Keyboard Shortcuts
- [ ] 'N' starts Add Task
- [ ] '/' starts Search
- [ ] '?' shows help
- [ ] 'J'/'K' navigate list
- [ ] 'X' toggles completion
- [ ] 'Enter' selects item
- [ ] 'Esc' cancels/back
- [ ] 'Q' quits
- [ ] Shortcuts disabled during text input
- [ ] Help shows all available shortcuts
- [ ] Graceful fallback if not TTY

---

## Test Data Setup

Create test data by running these commands in sequence:

```bash
# 1. Create template-worthy task
Add: "Daily Standup" (priority: high, tags: [work, daily])

# 2. Create task with subtasks
Add: "Release v1.0"
  Subtask: "Code freeze"
  Subtask: "QA testing"
  Subtask: "Documentation"
  Subtask: "Deploy to production"

# 3. Create task for timing
Add: "Write documentation" (simple task for timer test)

# 4. Create multiple tasks for navigation test
Add: "Task A", "Task B", "Task C", "Task D"
```

---

## Common Issues

### Timer Not Recovering
**Symptom**: No prompt about orphaned timer on restart
**Check**: Verify `activeTimerState` in tasks.json is not null
**Fix**: Timer may have been cleanly stopped before exit

### Shortcuts Not Working
**Symptom**: Pressing keys does nothing
**Check**: Is stdin a TTY? (`process.stdin.isTTY`)
**Fix**: Run in interactive terminal, not piped/scripted

### Pomodoro Count Wrong
**Symptom**: Count seems off or reset unexpectedly
**Check**: Verify `lastResetDate` matches today
**Fix**: Check system clock, count resets at midnight

### Subtask Limit Reached
**Symptom**: Cannot add more subtasks
**Message**: "Maximum 20 subtasks per task"
**Fix**: By design - complete/delete existing subtasks

---

## Performance Notes

- Timer display updates every second (minimal redraw)
- Subtask progress is cached (no recount on display)
- Templates load once on startup
- JSON file size monitored (<1MB recommended)
