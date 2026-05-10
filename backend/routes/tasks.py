"""
REST Tasks API — /api/{user_id}/tasks
Phase II spec-compliant endpoints + Phase V Kafka events.
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from db import get_session
from models.models import Task, TaskCreate, TaskUpdate, TaskRead
from kafka.dapr_publisher import publish_task_event
from routes.auth import get_current_user, verify_user_access, AuthUser

router = APIRouter()


def get_task_or_404(task_id: int, user_id: str, session: Session) -> Task:
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    return task


@router.get("/api/{user_id}/tasks", response_model=list[TaskRead])
def list_tasks(
    user_id: str,
    status: str = "all",
    sort: str = "created",
    search: str = "",
    session: Session = Depends(get_session),
    current_user: AuthUser = Depends(get_current_user),
):
    verify_user_access(user_id, current_user)
    query = select(Task).where(Task.user_id == user_id)

    if status == "pending":
        query = query.where(Task.completed == False)  # noqa
    elif status == "completed":
        query = query.where(Task.completed == True)  # noqa

    if search:
        query = query.where(
            Task.title.ilike(f"%{search}%") | Task.description.ilike(f"%{search}%")
        )

    if sort == "due_date":
        query = query.order_by(Task.due_date.asc())
    elif sort == "priority":
        query = query.order_by(Task.priority.desc())
    else:
        query = query.order_by(Task.created_at.desc())

    return session.exec(query).all()


@router.post("/api/{user_id}/tasks", response_model=TaskRead, status_code=201)
async def create_task(
    user_id: str,
    body: TaskCreate,
    session: Session = Depends(get_session),
    current_user: AuthUser = Depends(get_current_user),
):
    verify_user_access(user_id, current_user)
    task = Task(
        **body.model_dump(),
        user_id=user_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    # Publish Kafka event (Phase V — no-op if Kafka disabled)
    await publish_task_event("created", task.id, {"title": task.title}, user_id)

    return task


@router.get("/api/{user_id}/tasks/{task_id}", response_model=TaskRead)
def get_task(user_id: str, task_id: int, session: Session = Depends(get_session),
             current_user: AuthUser = Depends(get_current_user)):
    verify_user_access(user_id, current_user)
    return get_task_or_404(task_id, user_id, session)


@router.put("/api/{user_id}/tasks/{task_id}", response_model=TaskRead)
async def update_task(
    user_id: str, task_id: int, body: TaskUpdate,
    session: Session = Depends(get_session),
    current_user: AuthUser = Depends(get_current_user),
):
    verify_user_access(user_id, current_user)
    task = get_task_or_404(task_id, user_id, session)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    await publish_task_event("updated", task.id, {"title": task.title}, user_id)
    return task


@router.delete("/api/{user_id}/tasks/{task_id}", status_code=204)
async def delete_task(user_id: str, task_id: int,
                      session: Session = Depends(get_session),
                      current_user: AuthUser = Depends(get_current_user)):
    verify_user_access(user_id, current_user)
    task = get_task_or_404(task_id, user_id, session)
    title = task.title
    session.delete(task)
    session.commit()
    await publish_task_event("deleted", task_id, {"title": title}, user_id)


@router.patch("/api/{user_id}/tasks/{task_id}/complete", response_model=TaskRead)
async def toggle_complete(
    user_id: str, task_id: int,
    session: Session = Depends(get_session),
    current_user: AuthUser = Depends(get_current_user),
):
    verify_user_access(user_id, current_user)
    task = get_task_or_404(task_id, user_id, session)
    task.completed = not task.completed
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    event_type = "completed" if task.completed else "uncompleted"
    await publish_task_event(event_type, task.id, {"title": task.title}, user_id)
    return task


# ── Dapr Cron Binding — called every 5 minutes for reminders ─────────────────

@router.post("/reminder-cron")
async def check_reminders(session: Session = Depends(get_session)):
    """Dapr calls this endpoint every 5 minutes via cron binding."""
    now = datetime.utcnow()
    # Find tasks due in next 15 minutes that haven't been reminded yet
    tasks = session.exec(
        select(Task).where(
            Task.completed == False,  # noqa
            Task.due_date != None,    # noqa
        )
    ).all()

    reminders_sent = 0
    for task in tasks:
        if task.due_date:
            mins_until_due = (task.due_date - now).total_seconds() / 60
            if 0 < mins_until_due <= 15:
                from kafka.dapr_publisher import publish_reminder
                await publish_reminder(
                    task_id=task.id,
                    title=task.title,
                    due_at=task.due_date.isoformat(),
                    remind_at=now.isoformat(),
                    user_id=task.user_id,
                )
                reminders_sent += 1

    return {"reminders_sent": reminders_sent, "checked_at": now.isoformat()}
