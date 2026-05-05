from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship


# ── Task ─────────────────────────────────────────────────────────────────────

class TaskBase(SQLModel):
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    priority: str = Field(default="medium")  # low | medium | high
    due_date: Optional[datetime] = Field(default=None)
    recurrence_pattern: Optional[str] = Field(default=None)  # daily | weekly | monthly


class Task(TaskBase, table=True):
    __tablename__ = "chatbot_tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TaskCreate(TaskBase):
    pass


class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None


class TaskRead(TaskBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime


# ── Conversation ──────────────────────────────────────────────────────────────

class Conversation(SQLModel, table=True):
    __tablename__ = "chatbot_conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    title: Optional[str] = Field(default="New Chat")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    messages: list["Message"] = Relationship(back_populates="conversation")


# ── Message ───────────────────────────────────────────────────────────────────

class Message(SQLModel, table=True):
    __tablename__ = "chatbot_messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="chatbot_conversations.id", index=True)
    user_id: str = Field(index=True)
    role: str  # user | assistant | tool
    content: str
    tool_calls: Optional[str] = Field(default=None)  # JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow)

    conversation: Optional[Conversation] = Relationship(back_populates="messages")


# ── Request / Response schemas ────────────────────────────────────────────────

class ChatRequest(SQLModel):
    message: str
    conversation_id: Optional[int] = None


class ChatResponse(SQLModel):
    conversation_id: int
    response: str
    tool_calls: list[str] = []
