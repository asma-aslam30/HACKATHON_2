"""
MCP Tools — stateless task operations backed by Neon DB.
Each tool takes user_id so requests are fully isolated per user.
"""

from datetime import datetime
from sqlmodel import Session, select
from models.models import Task


# ── Tool implementations (called by the Gemini agent) ─────────────────────────

def add_task(
    session: Session,
    user_id: str,
    title: str,
    description: str = "",
    priority: str = "medium",
) -> dict:
    """Create a new task for the user."""
    task = Task(
        user_id=user_id,
        title=title,
        description=description or None,
        priority=priority,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return {"task_id": task.id, "status": "created", "title": task.title}


def list_tasks(
    session: Session,
    user_id: str,
    status: str = "all",
) -> list[dict]:
    """List tasks — status: all | pending | completed."""
    query = select(Task).where(Task.user_id == user_id)
    if status == "pending":
        query = query.where(Task.completed == False)  # noqa: E712
    elif status == "completed":
        query = query.where(Task.completed == True)  # noqa: E712
    tasks = session.exec(query.order_by(Task.created_at.desc())).all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "completed": t.completed,
            "priority": t.priority,
            "created_at": t.created_at.isoformat(),
        }
        for t in tasks
    ]


def complete_task(session: Session, user_id: str, task_id: int) -> dict:
    """Mark a task as complete."""
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()
    if not task:
        return {"error": f"Task {task_id} not found"}
    task.completed = True
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    return {"task_id": task.id, "status": "completed", "title": task.title}


def delete_task(session: Session, user_id: str, task_id: int) -> dict:
    """Delete a task."""
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()
    if not task:
        return {"error": f"Task {task_id} not found"}
    title = task.title
    session.delete(task)
    session.commit()
    return {"task_id": task_id, "status": "deleted", "title": title}


def update_task(
    session: Session,
    user_id: str,
    task_id: int,
    title: str = None,
    description: str = None,
    priority: str = None,
) -> dict:
    """Update a task's title, description, or priority."""
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()
    if not task:
        return {"error": f"Task {task_id} not found"}
    if title is not None:
        task.title = title
    if description is not None:
        task.description = description
    if priority is not None:
        task.priority = priority
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    return {"task_id": task.id, "status": "updated", "title": task.title}


# ── Tool registry — maps tool name → function ─────────────────────────────────

TOOL_REGISTRY = {
    "add_task": add_task,
    "list_tasks": list_tasks,
    "complete_task": complete_task,
    "delete_task": delete_task,
    "update_task": update_task,
}

# ── Gemini function declarations ───────────────────────────────────────────────
# These are passed to Gemini so it knows what tools are available.

GEMINI_TOOLS = [
    {
        "name": "add_task",
        "description": "Create a new todo task for the user.",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Task title (required)"},
                "description": {"type": "string", "description": "Optional task description"},
                "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high"],
                    "description": "Task priority level",
                },
            },
            "required": ["title"],
        },
    },
    {
        "name": "list_tasks",
        "description": "List the user's tasks. Filter by status.",
        "parameters": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "enum": ["all", "pending", "completed"],
                    "description": "Filter tasks by status. Default is 'all'.",
                }
            },
        },
    },
    {
        "name": "complete_task",
        "description": "Mark a task as complete by its ID.",
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {"type": "integer", "description": "The ID of the task to complete"}
            },
            "required": ["task_id"],
        },
    },
    {
        "name": "delete_task",
        "description": "Delete a task by its ID.",
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {"type": "integer", "description": "The ID of the task to delete"}
            },
            "required": ["task_id"],
        },
    },
    {
        "name": "update_task",
        "description": "Update a task's title, description, or priority.",
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {"type": "integer", "description": "The ID of the task to update"},
                "title": {"type": "string", "description": "New title"},
                "description": {"type": "string", "description": "New description"},
                "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high"],
                    "description": "New priority",
                },
            },
            "required": ["task_id"],
        },
    },
]
