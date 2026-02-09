# Task Service Contract: CLI Todo MVP

**Module**: `taskService.js`
**Purpose**: Core CRUD operations for task management with file persistence

## Interface Definition

### TaskService

```typescript
interface Task {
  id: string;           // UUID v4
  title: string;        // Required, 1-500 chars
  description: string;  // Optional, 0-2000 chars
  completed: boolean;   // Default: false
  createdAt: string;    // ISO 8601 timestamp
}

interface CreateTaskInput {
  title: string;
  description?: string;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
}

interface TaskService {
  // Load tasks from file on initialization
  loadTasks(): Task[];

  // Save tasks to file
  saveTasks(): boolean;

  // CRUD Operations
  createTask(input: CreateTaskInput): Task;
  getAllTasks(): Task[];
  getTaskById(id: string): Task | null;
  updateTask(id: string, input: UpdateTaskInput): Task | null;
  toggleTask(id: string): Task | null;
  deleteTask(id: string): boolean;

  // Utility
  getTaskCount(): number;
  hasAnyTasks(): boolean;
}
```

---

## Method Contracts

### loadTasks()

**Purpose**: Load tasks from tasks.json file into memory

**Preconditions**: None

**Postconditions**:
- Returns array of valid Task objects
- Invalid entries are filtered out
- Corrupted file triggers backup + empty array return

**Return**: `Task[]`

**Errors**:
- File not found: Returns `[]`, creates empty file
- Invalid JSON: Backs up file, returns `[]`
- Permission denied: Throws Error with message

---

### saveTasks()

**Purpose**: Persist in-memory tasks to tasks.json

**Preconditions**: Tasks array exists in memory

**Postconditions**:
- tasks.json contains current tasks array
- File is valid JSON

**Return**: `boolean` (success/failure)

**Errors**:
- Write failure: Returns `false`, logs error

---

### createTask(input)

**Purpose**: Create a new task with generated ID and timestamp

**Preconditions**:
- `input.title` is non-empty string (after trim)

**Postconditions**:
- New task added to tasks array
- tasks.json updated
- Task has unique UUID

**Input**:
```javascript
{
  title: "Buy groceries",      // Required
  description: "Milk, eggs"    // Optional
}
```

**Return**: Created `Task` object

**Errors**:
- Empty title: Throws `ValidationError("Title is required")`

---

### getAllTasks()

**Purpose**: Retrieve all tasks

**Preconditions**: None

**Postconditions**: None (read-only)

**Return**: `Task[]` (may be empty)

---

### getTaskById(id)

**Purpose**: Find a specific task by ID

**Preconditions**: `id` is valid string

**Postconditions**: None (read-only)

**Return**: `Task | null`

---

### updateTask(id, input)

**Purpose**: Update task title and/or description

**Preconditions**:
- `id` exists in tasks array
- At least one of `title` or `description` provided

**Postconditions**:
- Task updated in memory
- tasks.json updated
- `completed` and `createdAt` unchanged

**Input**:
```javascript
{
  title: "New title",           // Optional
  description: "New description" // Optional
}
```

**Return**: Updated `Task | null` (null if not found)

**Errors**:
- Task not found: Returns `null`
- Empty title (if provided): Throws `ValidationError`

---

### toggleTask(id)

**Purpose**: Toggle task completion status

**Preconditions**: `id` exists in tasks array

**Postconditions**:
- `task.completed` flipped
- tasks.json updated

**Return**: Updated `Task | null`

---

### deleteTask(id)

**Purpose**: Remove task from list

**Preconditions**: `id` exists in tasks array

**Postconditions**:
- Task removed from memory
- tasks.json updated

**Return**: `boolean` (true if deleted, false if not found)

---

## Error Types

```typescript
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class FileError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'FileError';
    this.cause = cause;
  }
}
```

---

## Usage Example

```javascript
import { TaskService } from './taskService.js';

const service = new TaskService();

// Load existing tasks
service.loadTasks();

// Create task
const task = service.createTask({
  title: 'Buy groceries',
  description: 'Milk and eggs'
});

// List all
const tasks = service.getAllTasks();

// Toggle complete
service.toggleTask(task.id);

// Update
service.updateTask(task.id, { title: 'Buy organic groceries' });

// Delete
service.deleteTask(task.id);
```
