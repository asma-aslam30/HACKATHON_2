# CLI Interface Contract: Todo MVP

**Module**: `index.js` + `prompts.js` + `display.js`
**Purpose**: Define user interaction patterns and display contracts

## Menu Interface

### Main Menu

```
═══════════════════════════════════════════
          TODO APP - Main Menu
═══════════════════════════════════════════

  1. Add Task
  2. List Tasks
  3. Toggle Complete
  4. Delete Task
  5. Update Task
  6. Exit

═══════════════════════════════════════════
Enter your choice (1-6): _
```

**Input Contract**:
- Valid: `1`, `2`, `3`, `4`, `5`, `6`
- Invalid: Any other input → "Invalid option. Please enter 1-6."

---

## Prompt Contracts

### Add Task Prompts

**Sequence**:
1. "Enter task title: " → Required, non-empty
2. "Enter description (optional): " → Optional, can be empty

**Validation**:
- Title empty → "Title cannot be empty. Please try again."
- Title valid → Proceed to description

**Success Output**:
```
✓ Task added successfully!
  ID: 550e8400
  Title: "Buy groceries"
```

---

### List Tasks Display

**With Tasks**:
```
═══════════════════════════════════════════
              Your Tasks (3)
═══════════════════════════════════════════

  [550e] ○ Buy groceries
         Milk, eggs, bread

  [6ba7] ✓ Call mom
         (no description)

  [9f2c] ○ Finish project
         Complete by Friday

═══════════════════════════════════════════
```

**Empty State**:
```
═══════════════════════════════════════════
              Your Tasks (0)
═══════════════════════════════════════════

  No tasks found. Add your first task!

═══════════════════════════════════════════
```

**Color Coding**:
- `○` (pending): Yellow/default
- `✓` (completed): Green
- Task ID: Cyan
- Title: White/default
- Description: Dim/gray

---

### Toggle Complete Prompt

**Task Selection**:
```
═══════════════════════════════════════════
         Select Task to Toggle
═══════════════════════════════════════════

? Select a task: (Use arrow keys)
❯ [550e] ○ Buy groceries
  [6ba7] ✓ Call mom
  [9f2c] ○ Finish project
  ← Back to menu
```

**Success Output**:
```
✓ Task marked as complete!
  [550e] Buy groceries
```

or

```
✓ Task marked as pending!
  [6ba7] Call mom
```

**Empty State**:
```
No tasks to toggle. Add some tasks first!
```

---

### Delete Task Prompt

**Task Selection**:
```
═══════════════════════════════════════════
          Select Task to Delete
═══════════════════════════════════════════

? Select a task to delete: (Use arrow keys)
❯ [550e] Buy groceries
  [6ba7] Call mom
  [9f2c] Finish project
  ← Back to menu
```

**Success Output**:
```
✓ Task deleted!
  [550e] Buy groceries
```

**Empty State**:
```
No tasks to delete.
```

---

### Update Task Prompts

**Task Selection**:
```
═══════════════════════════════════════════
          Select Task to Update
═══════════════════════════════════════════

? Select a task to update: (Use arrow keys)
❯ [550e] Buy groceries
  [6ba7] Call mom
  ← Back to menu
```

**Update Prompts**:
```
Current title: "Buy groceries"
Enter new title (or press Enter to keep): _

Current description: "Milk, eggs, bread"
Enter new description (or press Enter to keep): _
```

**Success Output**:
```
✓ Task updated!
  [550e] Buy organic groceries
```

**Empty State**:
```
No tasks to update. Add some tasks first!
```

---

### Exit Display

```
═══════════════════════════════════════════
  Thanks for using Todo App! Goodbye! 👋
═══════════════════════════════════════════
```

---

## Display Module Contract

```typescript
interface Display {
  // Headers
  showHeader(title: string): void;
  showDivider(): void;

  // Task display
  showTask(task: Task, showDescription?: boolean): void;
  showTaskList(tasks: Task[]): void;
  showEmptyState(message: string): void;

  // Feedback
  showSuccess(message: string): void;
  showError(message: string): void;
  showInfo(message: string): void;

  // Menu
  showMainMenu(): void;
  showGoodbye(): void;
}
```

---

## Prompts Module Contract

```typescript
interface Prompts {
  // Menu
  getMenuChoice(): Promise<number>;

  // Task operations
  getNewTaskInput(): Promise<{ title: string; description: string }>;
  selectTaskForToggle(tasks: Task[]): Promise<string | null>;
  selectTaskForDelete(tasks: Task[]): Promise<string | null>;
  selectTaskForUpdate(tasks: Task[]): Promise<string | null>;
  getUpdateInput(currentTask: Task): Promise<{ title?: string; description?: string }>;
}
```

---

## Error Display Patterns

| Error Type | Display |
|------------|---------|
| Invalid menu choice | "Invalid option. Please enter 1-6." |
| Empty title | "Title cannot be empty. Please try again." |
| Task not found | "Task not found." |
| File error | "Error saving tasks. Please try again." |
| Corrupted file | "Tasks file was corrupted. Starting fresh." |

---

## Accessibility Notes

- All prompts support keyboard navigation
- Colors have fallback for non-color terminals
- Screen reader friendly text (no emoji-only messages)
- Clear error messages with recovery guidance
