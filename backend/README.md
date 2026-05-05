# Phase III — AI Todo Chatbot Backend

FastAPI + Gemini 2.5 Flash + MCP Tools + Neon PostgreSQL

## Architecture

```
ChatKit UI (Next.js)
      │
      ▼
POST /api/{user_id}/chat
      │
      ▼
Gemini 2.5 Flash Agent
      │  (function calling)
      ▼
MCP Tools (add_task, list_tasks, complete_task, delete_task, update_task)
      │
      ▼
Neon PostgreSQL (chatbot_tasks, chatbot_conversations, chatbot_messages)
```

## Setup

```bash
cd backend
cp .env.example .env
# Fill in GEMINI_API_KEY and DATABASE_URL

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/{user_id}/chat` | Send message, get AI response |
| GET | `/api/{user_id}/conversations` | List conversations |
| GET | `/api/{user_id}/conversations/{id}/messages` | Get messages |
| DELETE | `/api/{user_id}/conversations/{id}` | Delete conversation |
| GET | `/api/{user_id}/tasks` | List tasks (REST) |

## MCP Tools

| Tool | Description |
|------|-------------|
| `add_task` | Create a new task |
| `list_tasks` | List tasks (all/pending/completed) |
| `complete_task` | Mark task as done |
| `delete_task` | Remove a task |
| `update_task` | Edit title/description/priority |

## Example Conversations

```
User: Add a task to buy groceries urgently
AI: ✅ Done! I've added "Buy groceries" with high priority.

User: Show my pending tasks
AI: Here are your pending tasks:
    1. Buy groceries [HIGH] 
    2. Pay bills [MEDIUM]

User: Mark task 1 as done
AI: ✅ "Buy groceries" marked as complete!
```

## Environment Variables

```env
DATABASE_URL=postgresql://...@neon.tech/neondb?sslmode=require
GEMINI_API_KEY=your-key-here
GEMINI_MODEL=gemini-2.5-flash
FRONTEND_URL=http://localhost:3001
```
