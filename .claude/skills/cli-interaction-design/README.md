# CLI Interaction Design Skill

**Purpose**: Design Phase I CLI commands with rich UX (tables, colors, spinners) and interactive TUI modes for Evolution of Todo hackathon

**Owner**: CLI Development Agent + Frontend UI/UX Agent

**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

The **CLI Interaction Design Skill** enables creation of delightful command-line experiences:
- Design intuitive CLI commands with arguments and flags
- Create rich terminal UX with tables, colors, and spinners
- Implement interactive TUI (Terminal User Interface) modes
- Ensure cross-platform compatibility (Windows, Mac, Linux)
- Generate CLI specifications for implementation

This skill transforms the simple Phase I console app into a modern, user-friendly CLI tool.

---

## Skill Components

### 1. CLI Commands (Phase I Architecture)

**Core Commands**:
```bash
# List tasks
todo list [--status=pending|completed] [--priority=high|medium|low] [--sort=created|priority]

# Add task
todo add "<title>" [--description="<text>"] [--priority=high|medium|low] [--due=<date>]

# Complete task
todo complete <task_id>

# Delete task
todo delete <task_id>

# Interactive mode
todo interactive

# Help
todo --help
todo <command> --help
```

### 2. Rich CLI UX with Rich Library

**Rich Tables**:
- Colorized priority badges (🔴 High, 🟡 Medium, 🟢 Low)
- Status indicators (⏳ Pending, ✅ Completed)
- Progress bars for task completion percentage
- Sortable columns with headers

**Spinners & Loading States**:
- Task creation: "Creating task..." with spinner
- Task deletion: "Deleting task..." with spinner
- Success messages with checkmarks

**Color Schemes**:
- Success: Green
- Warning: Yellow
- Error: Red
- Info: Blue
- Priority High: Red/Bold
- Priority Medium: Yellow
- Priority Low: Green

### 3. Interactive TUI Mode

**Features**:
- Arrow keys navigation
- Vim keybindings (j/k/h/l)
- Space to toggle task completion
- d to delete (with confirmation)
- a to add new task
- / to search
- q to quit

### 4. Cross-Platform Compatibility

**Terminal Support**:
- Windows Terminal
- macOS Terminal/iTerm2
- Linux GNOME Terminal/Konsole
- VS Code integrated terminal

---

## Skill Instructions

### Step 1: Design CLI Command Structure

**Template**:
```markdown
## Command: [command name]

**Syntax**: `todo [command] [arguments] [flags]`

**Purpose**: [1 sentence description]

**Arguments**:
- `<argument>`: [Required] Description
- `[argument]`: [Optional] Description

**Flags**:
- `--flag=value`: Description (default: value)
- `-f, --flag`: Description

**Examples**:
\`\`\`bash
todo [command] [example usage]
\`\`\`

**Output Format**: [Description of terminal output]
```

---

#### Example: List Command

```markdown
## Command: list

**Syntax**: `todo list [--status=STATUS] [--priority=PRIORITY] [--sort=SORT]`

**Purpose**: Display all tasks in a formatted table

**Flags**:
- `--status=pending|completed`: Filter by status (default: all)
- `--priority=high|medium|low`: Filter by priority (default: all)
- `--sort=created|priority|title`: Sort order (default: created)
- `--limit=N`: Show only first N tasks (default: all)

**Examples**:
\`\`\`bash
# List all tasks
todo list

# List only pending tasks
todo list --status=pending

# List high priority tasks sorted by creation date
todo list --priority=high --sort=created

# Show first 5 tasks
todo list --limit=5
\`\`\`

**Output Format**: Rich table with columns:
- ID (numeric)
- Title (text, truncated to 50 chars)
- Status (⏳ Pending / ✅ Completed)
- Priority (🔴 High / 🟡 Medium / 🟢 Low)
- Created (relative time: "2 days ago")

**Empty State**: "No tasks found. Use 'todo add' to create your first task."
```

### Implementation (Python with Rich)

```python
#!/usr/bin/env python3
"""
Evolution of Todo - Phase I CLI
Rich terminal UI with tables and colors
"""

import argparse
from datetime import datetime
from typing import List, Dict, Optional
from rich.console import Console
from rich.table import Table
from rich import box
from rich.progress import Progress, SpinnerColumn, TextColumn

console = Console()

# Global task storage (in-memory)
tasks: List[Dict] = []
next_id: int = 1

def list_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    sort_by: str = "created",
    limit: Optional[int] = None,
) -> None:
    """Display tasks in rich table format"""

    # Filter tasks
    filtered = tasks
    if status:
        filtered = [t for t in filtered if t['status'] == status]
    if priority:
        filtered = [t for t in filtered if t['priority'] == priority]

    # Sort tasks
    if sort_by == "priority":
        priority_order = {"high": 0, "medium": 1, "low": 2}
        filtered.sort(key=lambda t: priority_order[t['priority']])
    elif sort_by == "title":
        filtered.sort(key=lambda t: t['title'])
    else:  # created (default)
        filtered.sort(key=lambda t: t['created_at'], reverse=True)

    # Apply limit
    if limit:
        filtered = filtered[:limit]

    # Handle empty state
    if not filtered:
        console.print("[yellow]No tasks found.[/yellow]")
        console.print("[dim]Use 'todo add' to create your first task.[/dim]")
        return

    # Create rich table
    table = Table(
        title="📋 My Tasks",
        box=box.ROUNDED,
        show_header=True,
        header_style="bold cyan",
    )

    table.add_column("ID", justify="right", style="dim")
    table.add_column("Title", style="white")
    table.add_column("Status", justify="center")
    table.add_column("Priority", justify="center")
    table.add_column("Created", justify="right", style="dim")

    # Add rows
    for task in filtered:
        # Status icon
        status_icon = "✅" if task['status'] == "completed" else "⏳"
        status_text = f"{status_icon} {task['status'].title()}"

        # Priority badge
        priority_icons = {"high": "🔴", "medium": "🟡", "low": "🟢"}
        priority_icon = priority_icons[task['priority']]
        priority_text = f"{priority_icon} {task['priority'].title()}"

        # Title with strikethrough if completed
        title = task['title']
        if task['status'] == "completed":
            title = f"[dim strikethrough]{title}[/dim strikethrough]"

        # Relative time
        created = datetime.fromisoformat(task['created_at'])
        time_ago = format_time_ago(created)

        table.add_row(
            str(task['id']),
            title,
            status_text,
            priority_text,
            time_ago,
        )

    console.print(table)
    console.print(f"\n[dim]Total: {len(filtered)} tasks[/dim]")


def format_time_ago(dt: datetime) -> str:
    """Format datetime as relative time"""
    now = datetime.now()
    diff = now - dt

    seconds = diff.total_seconds()
    if seconds < 60:
        return "just now"
    elif seconds < 3600:
        minutes = int(seconds / 60)
        return f"{minutes}m ago"
    elif seconds < 86400:
        hours = int(seconds / 3600)
        return f"{hours}h ago"
    elif seconds < 604800:
        days = int(seconds / 86400)
        return f"{days}d ago"
    else:
        weeks = int(seconds / 604800)
        return f"{weeks}w ago"


def add_task(
    title: str,
    description: str = "",
    priority: str = "medium",
    due_date: Optional[str] = None,
) -> None:
    """Add new task with spinner animation"""
    global next_id

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        progress.add_task(description="Creating task...", total=None)

        # Simulate API call (in Phase I, this is instant)
        import time
        time.sleep(0.5)

        task = {
            "id": next_id,
            "title": title,
            "description": description,
            "status": "pending",
            "priority": priority,
            "due_date": due_date,
            "created_at": datetime.now().isoformat(),
        }

        tasks.append(task)
        next_id += 1

    # Success message
    console.print(f"[green]✓[/green] Task {task['id']} created successfully: [bold]{title}[/bold]")

    # Auto-refresh list
    console.print()
    list_tasks(limit=5)


def complete_task(task_id: int) -> None:
    """Mark task as completed"""
    for task in tasks:
        if task['id'] == task_id:
            if task['status'] == "completed":
                console.print(f"[yellow]⚠[/yellow] Task {task_id} is already complete")
            else:
                task['status'] = "completed"
                console.print(f"[green]✓[/green] Task {task_id} marked complete: [dim strikethrough]{task['title']}[/dim strikethrough]")
            return

    console.print(f"[red]✗[/red] Task {task_id} not found")


def delete_task(task_id: int) -> None:
    """Delete task by ID"""
    global tasks

    for i, task in enumerate(tasks):
        if task['id'] == task_id:
            # Confirmation
            from rich.prompt import Confirm
            title = task['title']
            if Confirm.ask(f"Delete task [bold]{title}[/bold]?", default=False):
                with Progress(
                    SpinnerColumn(),
                    TextColumn("[progress.description]{task.description}"),
                    console=console,
                ) as progress:
                    progress.add_task(description="Deleting task...", total=None)
                    import time
                    time.sleep(0.3)
                    tasks.pop(i)

                console.print(f"[green]✓[/green] Task {task_id} deleted successfully")
            else:
                console.print("[dim]Deletion cancelled[/dim]")
            return

    console.print(f"[red]✗[/red] Task {task_id} not found")


def main():
    parser = argparse.ArgumentParser(
        prog="todo",
        description="Evolution of Todo - Phase I CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # List command
    list_parser = subparsers.add_parser("list", help="List tasks")
    list_parser.add_argument("--status", choices=["pending", "completed"], help="Filter by status")
    list_parser.add_argument("--priority", choices=["high", "medium", "low"], help="Filter by priority")
    list_parser.add_argument("--sort", choices=["created", "priority", "title"], default="created", help="Sort order")
    list_parser.add_argument("--limit", type=int, help="Limit number of tasks shown")

    # Add command
    add_parser = subparsers.add_parser("add", help="Add new task")
    add_parser.add_argument("title", help="Task title")
    add_parser.add_argument("--description", default="", help="Task description")
    add_parser.add_argument("--priority", choices=["high", "medium", "low"], default="medium", help="Task priority")
    add_parser.add_argument("--due", help="Due date (YYYY-MM-DD)")

    # Complete command
    complete_parser = subparsers.add_parser("complete", help="Mark task as completed")
    complete_parser.add_argument("task_id", type=int, help="Task ID")

    # Delete command
    delete_parser = subparsers.add_parser("delete", help="Delete task")
    delete_parser.add_argument("task_id", type=int, help="Task ID")

    # Interactive command
    interactive_parser = subparsers.add_parser("interactive", help="Interactive TUI mode")

    args = parser.parse_args()

    if args.command == "list":
        list_tasks(args.status, args.priority, args.sort, args.limit)
    elif args.command == "add":
        add_task(args.title, args.description, args.priority, args.due)
    elif args.command == "complete":
        complete_task(args.task_id)
    elif args.command == "delete":
        delete_task(args.task_id)
    elif args.command == "interactive":
        console.print("[yellow]Interactive mode not yet implemented[/yellow]")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
```

---

#### Example: Add Command

```markdown
## Command: add

**Syntax**: `todo add "<title>" [--description="<text>"] [--priority=PRIORITY] [--due=DATE]`

**Purpose**: Create a new task

**Arguments**:
- `<title>`: [Required] Task title (quoted if contains spaces)

**Flags**:
- `--description="text"`: Task description (optional)
- `--priority=high|medium|low`: Priority level (default: medium)
- `--due=YYYY-MM-DD`: Due date (optional)

**Examples**:
\`\`\`bash
# Simple task
todo add "Buy milk"

# Task with description and priority
todo add "Write report" --description="Q4 financial summary" --priority=high

# Task with due date
todo add "Submit taxes" --due=2025-04-15 --priority=high
\`\`\`

**Animation Sequence**:
1. Spinner: "Creating task..." (500ms)
2. Success: "✓ Task 1 created successfully: Buy milk" (green)
3. Auto-refresh: Show last 5 tasks in table

**Validation**:
- Title required (1-500 characters)
- Priority must be high/medium/low
- Due date must be valid YYYY-MM-DD format
```

---

### Step 2: Design Interactive TUI Mode

```markdown
## Interactive TUI Mode

**Command**: `todo interactive`

**Purpose**: Full-screen terminal UI with keyboard navigation

**Layout**:
\`\`\`
┌─────────────────────────────────────────────────────────┐
│ Evolution of Todo - Interactive Mode          Press ? for help │
├─────────────────────────────────────────────────────────┤
│ Filters: [All] [Pending] [Completed] [High] [Med] [Low]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│ > 1  Buy milk                        ⏳ 🟡  2h ago      │
│   2  Write report                    ⏳ 🔴  1d ago      │
│   3  Submit taxes                    ⏳ 🔴  5d ago      │
│   4  Clean desk                      ✅ 🟢  3d ago      │
│                                                         │
│ [4 tasks] [3 pending, 1 completed]                     │
├─────────────────────────────────────────────────────────┤
│ Commands: [a]dd [d]elete [space]toggle [/]search [q]uit│
└─────────────────────────────────────────────────────────┘
\`\`\`

**Keybindings**:
- `↑` / `k`: Move selection up
- `↓` / `j`: Move selection down
- `Space`: Toggle task completion
- `a`: Add new task (opens prompt)
- `d`: Delete selected task (with confirmation)
- `/`: Search tasks
- `f`: Toggle filters
- `s`: Sort tasks
- `r`: Refresh
- `?`: Show help
- `q` / `Ctrl+C`: Quit

**Implementation Library**: Textual or Prompt Toolkit
```

### Implementation (Python with Textual)

```python
from textual.app import App, ComposeResult
from textual.containers import Container
from textual.widgets import Header, Footer, DataTable, Static
from textual.binding import Binding

class TodoApp(App):
    """Interactive TUI for Evolution of Todo"""

    CSS = """
    DataTable {
        height: 1fr;
    }
    """

    BINDINGS = [
        Binding("a", "add_task", "Add"),
        Binding("d", "delete_task", "Delete"),
        Binding("space", "toggle_complete", "Toggle"),
        Binding("/", "search", "Search"),
        Binding("q", "quit", "Quit"),
    ]

    def compose(self) -> ComposeResult:
        yield Header()
        yield DataTable()
        yield Footer()

    def on_mount(self) -> None:
        table = self.query_one(DataTable)
        table.add_columns("ID", "Title", "Status", "Priority", "Created")

        # Load tasks
        for task in tasks:
            status = "✅" if task['status'] == "completed" else "⏳"
            priority_icons = {"high": "🔴", "medium": "🟡", "low": "🟢"}
            priority = priority_icons[task['priority']]

            table.add_row(
                str(task['id']),
                task['title'],
                status,
                priority,
                format_time_ago(datetime.fromisoformat(task['created_at'])),
            )

    def action_add_task(self) -> None:
        self.push_screen("add")

    def action_delete_task(self) -> None:
        # Get selected row and delete
        pass

    def action_toggle_complete(self) -> None:
        # Toggle selected task
        pass

    def action_search(self) -> None:
        self.push_screen("search")

if __name__ == "__main__":
    app = TodoApp()
    app.run()
```

---

### Step 3: Error Handling & Edge Cases

```markdown
## Error Handling

**Invalid Command**:
\`\`\`bash
$ todo invalid
[red]✗[/red] Unknown command: invalid
Use 'todo --help' to see available commands
\`\`\`

**Missing Arguments**:
\`\`\`bash
$ todo add
[red]✗[/red] Error: Task title is required
Usage: todo add "<title>" [--description="<text>"]
\`\`\`

**Invalid Task ID**:
\`\`\`bash
$ todo complete 999
[red]✗[/red] Task 999 not found
\`\`\`

**Empty Task List**:
\`\`\`bash
$ todo list
[yellow]No tasks found.[/yellow]
[dim]Use 'todo add' to create your first task.[/dim]
\`\`\`

**Duplicate Detection** (if implemented):
\`\`\`bash
$ todo add "Buy milk"
[yellow]⚠[/yellow] Similar task exists: "Buy milk" (ID: 1)
Add anyway? [y/N]:
\`\`\`
```

---

### Step 4: Help System

```markdown
## Help Command

**Global Help**:
\`\`\`bash
$ todo --help

Evolution of Todo - Phase I CLI

Usage:
  todo [command] [arguments] [flags]

Commands:
  list        List all tasks with filters
  add         Create a new task
  complete    Mark task as completed
  delete      Delete a task
  interactive Launch interactive TUI mode

Flags:
  -h, --help     Show help
  -v, --version  Show version

Examples:
  todo list --status=pending
  todo add "Buy milk" --priority=high
  todo complete 1

For command-specific help, use:
  todo <command> --help
\`\`\`

**Command-Specific Help**:
\`\`\`bash
$ todo add --help

Add a new task

Usage:
  todo add "<title>" [flags]

Flags:
  --description string    Task description
  --priority string       Priority level (high|medium|low) (default: medium)
  --due string            Due date (YYYY-MM-DD)

Examples:
  todo add "Buy milk"
  todo add "Write report" --description="Q4 summary" --priority=high
\`\`\`
```

---

## Output Specifications

### File Structure

```
specs/
└── cli/
    ├── commands.md      # All CLI commands
    ├── tui.md           # Interactive TUI mode
    ├── colors.md        # Color scheme
    └── examples.md      # Usage examples
```

---

## Related Agents

- **CLI Development Agent**: Primary owner, implements CLI
- **Frontend UI/UX Agent**: Designs terminal UX patterns
- **Testing & QA Agent**: Tests CLI across platforms

---

## Success Metrics

✅ **Intuitive Commands**: Clear command structure with help
✅ **Rich UX**: Colored output, tables, spinners
✅ **Cross-Platform**: Works on Windows, Mac, Linux
✅ **Error Handling**: Clear error messages with suggestions
✅ **Performance**: Commands execute < 100ms
✅ **Accessibility**: Screen reader compatible
✅ **Interactive Mode**: Full TUI with keyboard navigation

---

## Best Practices

### Do's ✅

- **Use Rich Library**: For tables, colors, spinners
- **Clear Error Messages**: Include suggested fix
- **Consistent Naming**: Use verb-noun pattern
- **Confirmation Prompts**: For destructive actions
- **Auto-completion**: Support shell auto-complete
- **Help Everywhere**: --help on all commands
- **Relative Times**: "2 days ago" not "2025-12-22"

### Don'ts ❌

- **Don't Use Complex Flags**: Keep it simple
- **Don't Print Stack Traces**: Show user-friendly errors
- **Don't Overuse Color**: Too much is distracting
- **Don't Block Terminal**: Use spinners for async ops
- **Don't Hardcode Paths**: Use cross-platform paths

---

## References

- **Rich Library**: https://rich.readthedocs.io/
- **Textual**: https://textual.textualize.io/
- **Click**: https://click.palletsprojects.com/
- **Typer**: https://typer.tiangolo.com/

---

**Document Version**: 1.0.0
**Created**: 2025-12-24
**Total Examples**: 5 (list, add, complete, delete, interactive TUI)
**Coverage**: Phase I (Console CLI App)

---

*This CLI interaction design skill is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*
