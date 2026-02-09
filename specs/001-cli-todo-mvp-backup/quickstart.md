# Quickstart: Todo App CLI MVP

**Branch**: `001-cli-todo-mvp`
**Version**: Phase 1 MVP

## Prerequisites

- Node.js 18.x or higher (LTS recommended)
- npm 9.x or higher
- Terminal with ANSI color support (most modern terminals)

## Installation

```bash
# Navigate to phase-1 directory
cd phases/phase-1

# Install dependencies
npm install
```

## Running the Application

```bash
# Start the todo app
npm start

# Or directly with node
node src/index.js
```

## Usage

### Main Menu

When you start the app, you'll see the main menu:

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
Enter your choice (1-6):
```

### Adding a Task

1. Select option `1` from the menu
2. Enter the task title (required)
3. Enter a description (optional, press Enter to skip)

```
Enter task title: Buy groceries
Enter description (optional): Milk, eggs, bread

✓ Task added successfully!
  ID: 550e8400
  Title: "Buy groceries"
```

### Viewing Tasks

Select option `2` to see all your tasks:

```
═══════════════════════════════════════════
              Your Tasks (2)
═══════════════════════════════════════════

  [550e] ○ Buy groceries
         Milk, eggs, bread

  [6ba7] ✓ Call mom
         (no description)

═══════════════════════════════════════════
```

- `○` = Pending (yellow)
- `✓` = Completed (green)

### Marking Tasks Complete

1. Select option `3` from the menu
2. Use arrow keys to select a task
3. Press Enter to toggle its status

### Deleting Tasks

1. Select option `4` from the menu
2. Use arrow keys to select the task to delete
3. Press Enter to confirm deletion

### Updating Tasks

1. Select option `5` from the menu
2. Select the task to update
3. Enter new title (or press Enter to keep current)
4. Enter new description (or press Enter to keep current)

### Exiting

Select option `6` or press `Ctrl+C` to exit the application.

## Data Storage

Tasks are automatically saved to `data/tasks.json` after each operation. The file is created automatically on first use.

**File Location**: `phases/phase-1/data/tasks.json`

## Project Structure

```
phases/phase-1/
├── src/
│   ├── index.js          # Entry point + main loop
│   ├── taskService.js    # CRUD operations
│   ├── display.js        # Colored output
│   └── prompts.js        # User prompts
├── data/
│   └── tasks.json        # Task storage (auto-created)
├── tests/
│   └── *.test.js         # Test files
├── package.json
└── README.md
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Troubleshooting

### Colors Not Showing

If colors don't appear:
1. Check if your terminal supports ANSI colors
2. Try a different terminal (VS Code, iTerm2, Windows Terminal)
3. Set environment variable: `FORCE_COLOR=1`

### Permission Denied

If you get a permission error:
1. Check write permissions for the `data/` directory
2. Run: `chmod 755 data/`

### Corrupted tasks.json

If tasks.json becomes corrupted:
1. The app will automatically back up the corrupted file
2. A new empty tasks.json will be created
3. Check `data/tasks.json.backup` for recovery

## Next Steps

After completing Phase 1:
- **Phase 2**: Web application with database persistence
- **Phase 3**: AI chatbot integration
- **Phase 4**: Kubernetes deployment
- **Phase 5**: Cloud deployment with CI/CD
