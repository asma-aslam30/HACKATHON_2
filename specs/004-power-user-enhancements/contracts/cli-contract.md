# CLI Service Contract: Power User Enhancements

**Feature**: 004-power-user-enhancements
**Date**: 2025-12-27

---

## Service Module Overview

### New Services

| Service | File | Responsibility |
|---------|------|----------------|
| templateService | `src/templateService.js` | Template CRUD operations |
| timerService | `src/timerService.js` | Time tracking and Pomodoro logic |
| keyboardService | `src/keyboardService.js` | Key event handling |

### Extended Services

| Service | File | New Methods |
|---------|------|-------------|
| taskService | `src/taskService.js` | Subtask operations |
| prompts | `src/prompts.js` | Template and timer prompts |
| display | `src/display.js` | Timer, subtask, shortcut displays |

---

## templateService.js API

### createTemplate(input)

Create a new template from task fields.

```typescript
interface TemplateInput {
  name: string;                // Required, 1-50 chars, unique
  title: string;               // Required, 1-200 chars
  description?: string;        // Optional
  priority?: Priority;         // Default: 'none'
  tags?: string[];             // Default: []
  recurrencePattern?: RecurrencePattern;  // Default: 'none'
  defaultSubtasks?: string[];  // Default: []
}

function createTemplate(input: TemplateInput): Template
// Throws: Error if name already exists
// Throws: Error if name is empty or >50 chars
```

### getAllTemplates()

Get all saved templates.

```typescript
function getAllTemplates(): Template[]
// Returns: Array sorted by name alphabetically
```

### getTemplateById(id)

Get a single template by ID.

```typescript
function getTemplateById(id: string): Template | null
```

### getTemplateByName(name)

Get a template by name (case-insensitive).

```typescript
function getTemplateByName(name: string): Template | null
```

### updateTemplate(id, input)

Update an existing template.

```typescript
function updateTemplate(id: string, input: Partial<TemplateInput>): Template | null
// Returns: Updated template or null if not found
// Throws: Error if new name conflicts with existing template
```

### deleteTemplate(id)

Delete a template.

```typescript
function deleteTemplate(id: string): boolean
// Returns: true if deleted, false if not found
```

### createTaskFromTemplate(templateId)

Create a task pre-filled with template values.

```typescript
function createTaskFromTemplate(templateId: string): TaskInput | null
// Returns: TaskInput object ready for createTask()
// Returns: null if template not found
// Note: User can modify fields before saving
```

---

## timerService.js API

### Time Tracking

#### startTimer(taskId)

Start timing a task.

```typescript
function startTimer(taskId: string): { success: boolean, error?: string }
// Success: Timer started, activeTimerState set
// Error: "Task not found" | "Task already has active timer"
// Side effect: Stops any existing timer on other task
```

#### stopTimer()

Stop the currently active timer.

```typescript
function stopTimer(): { success: boolean, taskId?: string, durationMs?: number, error?: string }
// Success: Returns taskId and duration of stopped timer
// Error: "No active timer"
// Side effect: Creates TimeEntry on task, updates totalTimeMs
```

#### getActiveTimer()

Get current timer state.

```typescript
function getActiveTimer(): ActiveTimerState | null
// Returns: Current timer state or null if no timer active
```

#### getElapsedTime()

Get elapsed time of current timer.

```typescript
function getElapsedTime(): number
// Returns: Milliseconds since timer started, or 0 if no timer
```

#### recoverOrphanedTimer()

Handle timer from previous session.

```typescript
function recoverOrphanedTimer(): { found: boolean, taskId?: string, elapsedMs?: number }
// Called on app startup
// Returns: Info about orphaned timer if found
```

### Pomodoro Timer

#### startPomodoro(taskId?)

Start a Pomodoro work session.

```typescript
function startPomodoro(taskId?: string): { success: boolean, endTime: string, error?: string }
// taskId: Optional - link Pomodoro to a task for time tracking
// endTime: ISO string when work session ends
// Error: "Pomodoro already running"
```

#### cancelPomodoro()

Cancel the current Pomodoro session.

```typescript
function cancelPomodoro(): boolean
// Returns: true if cancelled, false if no Pomodoro active
// Does not increment completedToday
```

#### getPomodoroState()

Get current Pomodoro state.

```typescript
interface PomodoroState {
  active: boolean;
  type: 'work' | 'break' | null;
  remainingMs: number;
  linkedTaskId: string | null;
}

function getPomodoroState(): PomodoroState
```

#### completePomodoroWork()

Mark work session complete, start break.

```typescript
function completePomodoroWork(): { breakEndTime: string }
// Called automatically when work timer expires
// Increments completedToday
// Starts break timer
```

#### completePomodoroBreak()

Mark break complete.

```typescript
function completePomodoroBreak(): void
// Called automatically when break timer expires
// Pomodoro cycle complete
```

#### getPomodoroConfig()

Get Pomodoro settings.

```typescript
function getPomodoroConfig(): PomodoroConfig
```

#### updatePomodoroConfig(config)

Update Pomodoro settings.

```typescript
function updatePomodoroConfig(config: Partial<PomodoroConfig>): PomodoroConfig
// Validates: workDurationMinutes 1-120, breakDurationMinutes 1-60
```

#### getTodayPomodoroCount()

Get completed Pomodoros today.

```typescript
function getTodayPomodoroCount(): number
// Resets count if date has changed
```

---

## taskService.js Extensions

### Subtask Operations

#### addSubtask(taskId, title)

Add a subtask to a task.

```typescript
function addSubtask(taskId: string, title: string): Subtask | null
// Returns: Created subtask or null if task not found
// Throws: Error if title empty
// Throws: Error if task already has 20 subtasks
```

#### toggleSubtask(taskId, subtaskId)

Toggle subtask completion status.

```typescript
function toggleSubtask(taskId: string, subtaskId: string): Subtask | null
// Returns: Updated subtask or null if not found
```

#### deleteSubtask(taskId, subtaskId)

Delete a subtask.

```typescript
function deleteSubtask(taskId: string, subtaskId: string): boolean
// Returns: true if deleted, false if not found
```

#### getSubtaskProgress(taskId)

Get subtask completion progress.

```typescript
interface SubtaskProgress {
  completed: number;
  total: number;
  percentage: number;
}

function getSubtaskProgress(taskId: string): SubtaskProgress | null
```

---

## keyboardService.js API

### initKeyboard()

Initialize keyboard shortcut handling.

```typescript
function initKeyboard(): boolean
// Returns: true if shortcuts enabled (TTY), false if not available
// Sets up stdin raw mode and keypress events
```

### disableKeyboard()

Temporarily disable shortcuts (during prompts).

```typescript
function disableKeyboard(): void
```

### enableKeyboard()

Re-enable shortcuts after prompts.

```typescript
function enableKeyboard(): void
```

### registerShortcut(key, handler)

Register a keyboard shortcut.

```typescript
function registerShortcut(key: string, handler: () => void): void
// key: Single character or special key name
// handler: Function to call when key pressed
```

### getShortcuts()

Get all registered shortcuts for help display.

```typescript
interface Shortcut {
  key: string;
  description: string;
}

function getShortcuts(): Shortcut[]
```

---

## prompts.js Extensions

### Template Prompts

```typescript
// Select template for task creation
function selectTemplate(templates: Template[]): Promise<string | null>
// Returns: Template ID or null if cancelled

// Get template creation input
function getTemplateInput(fromTask?: Task): Promise<TemplateInput>
// fromTask: Pre-fill from existing task

// Confirm template overwrite
function confirmTemplateOverwrite(name: string): Promise<boolean>
```

### Subtask Prompts

```typescript
// Get subtask title
function getSubtaskTitle(): Promise<string>

// Select subtask for action
function selectSubtask(subtasks: Subtask[]): Promise<string | null>
// Returns: Subtask ID or null if cancelled
```

### Timer Prompts

```typescript
// Confirm timer recovery
function confirmTimerRecovery(taskTitle: string, elapsedMs: number): Promise<'save' | 'discard'>

// Get Pomodoro config input
function getPomodoroConfigInput(current: PomodoroConfig): Promise<Partial<PomodoroConfig>>
```

---

## display.js Extensions

### Subtask Display

```typescript
// Show subtasks under a task
function showSubtasks(subtasks: Subtask[]): void
// Format: "  □ Subtask title" or "  ✓ Subtask title (completed)"

// Show subtask progress indicator
function showSubtaskProgress(progress: SubtaskProgress): string
// Format: "[2/5]" with color based on completion
```

### Timer Display

```typescript
// Show active timer
function showActiveTimer(taskTitle: string, elapsedMs: number): void
// Format: "⏱ Timing: Task title - 00:12:34"

// Show Pomodoro status
function showPomodoroStatus(state: PomodoroState): void
// Format: "🍅 Work: 15:32 remaining" or "☕ Break: 03:21 remaining"

// Show today's Pomodoro count
function showPomodoroCount(count: number): void
// Format: "🍅🍅🍅 3 Pomodoros today"
```

### Time Format

```typescript
// Format duration for display
function formatDuration(ms: number): string
// Returns: "1h 23m" or "45m" or "12s"
```

### Shortcut Help

```typescript
// Show keyboard shortcut overlay
function showShortcutHelp(shortcuts: Shortcut[]): void
// Format: Key column + Description column
```

---

## Menu Extensions

### New Menu Options (index.js)

```
11. Templates        - Manage task templates
12. Start/Stop Timer - Track time on tasks
13. Pomodoro         - Focus timer (25/5)
```

### Keyboard Shortcuts

| Key | Action | Menu Equivalent |
|-----|--------|-----------------|
| N | Add new task | Option 1 |
| / | Search tasks | Option 6 |
| ? or H | Show help | - |
| J | Move selection down | - |
| K | Move selection up | - |
| Enter | Select/Open item | - |
| X | Toggle task complete | Option 3 |
| Esc | Back/Cancel | - |
| Q | Quit application | Option 10 |
| T | Start/Stop timer | Option 12 |
| P | Pomodoro | Option 13 |

---

## Error Handling

### Standard Error Responses

All service methods use consistent error handling:

```typescript
// Synchronous methods throw errors
throw new Error('Descriptive error message');

// Async methods return error in result
return { success: false, error: 'Descriptive error message' };
```

### Error Categories

| Category | Example | Handling |
|----------|---------|----------|
| Validation | "Title cannot be empty" | Show error, retry prompt |
| Not Found | "Task not found" | Show error, return to menu |
| Conflict | "Template name already exists" | Prompt to rename/overwrite |
| Limit | "Maximum 20 subtasks" | Show error, prevent action |
| State | "No active timer" | Show info, no action |

---

## Events and Side Effects

### Timer Events

| Event | Trigger | Side Effect |
|-------|---------|-------------|
| Timer Start | startTimer() | Stops existing timer, saves state |
| Timer Stop | stopTimer() | Creates TimeEntry, clears state |
| App Exit | SIGINT/SIGTERM | Auto-stops timer, saves |
| App Start | Init | Checks for orphaned timer |

### Pomodoro Events

| Event | Trigger | Side Effect |
|-------|---------|-------------|
| Work End | 25 min elapsed | Notification, start break |
| Break End | 5 min elapsed | Notification, ready for next |
| Complete | Work session done | Increment today count |
| Cancel | User action | Clear state, no count |

### Task Events

| Event | Trigger | Side Effect |
|-------|---------|-------------|
| Parent Complete | toggleTask() | All subtasks marked complete |
| Parent Delete | deleteTask() | All subtasks removed |
| Subtask Toggle | toggleSubtask() | Progress indicator updates |
