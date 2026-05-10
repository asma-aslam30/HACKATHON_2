"""
Chat endpoint — POST /api/{user_id}/chat
Stateless: fetches history from DB, runs agent, saves response.
"""

import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from db import get_session
from models.models import (
    Conversation, Message, ChatRequest, ChatResponse, Task
)
from agent import run_agent

from routes.auth import get_current_user, verify_user_access, AuthUser

router = APIRouter()


@router.post("/api/{user_id}/chat", response_model=ChatResponse)
async def chat(
    user_id: str,
    request: ChatRequest,
    session: Session = Depends(get_session),
    current_user: AuthUser = Depends(get_current_user),
):
    verify_user_access(user_id, current_user)
    # 1. Get or create conversation
    if request.conversation_id:
        conversation = session.exec(
            select(Conversation).where(
                Conversation.id == request.conversation_id,
                Conversation.user_id == user_id,
            )
        ).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = Conversation(
            user_id=user_id,
            title=request.message[:50],  # Use first 50 chars as title
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(conversation)
        session.commit()
        session.refresh(conversation)

    # 2. Fetch conversation history from DB (stateless approach)
    history_rows = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.asc())
    ).all()

    history = [
        {"role": msg.role, "content": msg.content}
        for msg in history_rows
        if msg.role in ("user", "assistant")
    ]

    # 3. Save user message
    user_msg = Message(
        conversation_id=conversation.id,
        user_id=user_id,
        role="user",
        content=request.message,
        created_at=datetime.utcnow(),
    )
    session.add(user_msg)
    session.commit()

    # 4. Run Gemini agent (stateless — all context in history)
    try:
        response_text, tool_calls = run_agent(
            session=session,
            user_id=user_id,
            history=history,
            new_message=request.message,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")

    # 5. Save assistant response
    assistant_msg = Message(
        conversation_id=conversation.id,
        user_id=user_id,
        role="assistant",
        content=response_text,
        tool_calls=json.dumps(tool_calls) if tool_calls else None,
        created_at=datetime.utcnow(),
    )
    session.add(assistant_msg)

    # Update conversation timestamp and title if first message
    conversation.updated_at = datetime.utcnow()
    session.add(conversation)
    session.commit()

    return ChatResponse(
        conversation_id=conversation.id,
        response=response_text,
        tool_calls=tool_calls,
    )


@router.get("/api/{user_id}/conversations")
def get_conversations(user_id: str, session: Session = Depends(get_session)):
    """List all conversations for a user."""
    convs = session.exec(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
    ).all()
    return convs


@router.get("/api/{user_id}/conversations/{conv_id}/messages")
def get_messages(user_id: str, conv_id: int, session: Session = Depends(get_session)):
    """Get all messages in a conversation."""
    msgs = session.exec(
        select(Message)
        .where(Message.conversation_id == conv_id, Message.user_id == user_id)
        .order_by(Message.created_at.asc())
    ).all()
    return msgs


@router.get("/api/{user_id}/tasks")
def get_tasks(user_id: str, status: str = "all", session: Session = Depends(get_session)):
    """Get tasks for a user (REST fallback)."""
    from mcp_server.tools import list_tasks
    return list_tasks(session=session, user_id=user_id, status=status)


@router.delete("/api/{user_id}/conversations/{conv_id}")
def delete_conversation(user_id: str, conv_id: int, session: Session = Depends(get_session)):
    """Delete a conversation and its messages."""
    conv = session.exec(
        select(Conversation).where(Conversation.id == conv_id, Conversation.user_id == user_id)
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    msgs = session.exec(select(Message).where(Message.conversation_id == conv_id)).all()
    for msg in msgs:
        session.delete(msg)
    session.delete(conv)
    session.commit()
    return {"status": "deleted"}
