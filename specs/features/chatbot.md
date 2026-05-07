# Feature: AI Chatbot with MCP Tools

## Overview
Conversational interface for managing todos via natural language.
Uses Gemini 2.5 Flash with function calling + 5 MCP tools.

## Architecture
```
ChatKit UI (Next.js /chat page)
    │
    ▼
POST /api/{user_id}/chat  (FastAPI)
    │
    ▼
Gemini 2.5 Flash Agent
    │  (function calling agentic loop)
    ▼
MCP Tools → Neon PostgreSQL
```

## MCP Tools

| Tool | Parameters | Returns |
|------|-----------|---------|
| add_task | title(req), description, priority | task_id, status, title |
| list_tasks | status(all/pending/completed) | array of tasks |
| complete_task | task_id | task_id, status, title |
| delete_task | task_id | task_id, status, title |
| update_task | task_id, title?, description?, priority? | task_id, status, title |

## Conversation Flow (Stateless)
1. Receive user message
2. Fetch conversation history from DB
3. Build messages array (history + new message)
4. Store user message in DB
5. Run Gemini agent with MCP tools
6. Agent invokes appropriate tool(s)
7. Store assistant response in DB
8. Return response to client
9. Server holds NO state

## Natural Language Mapping
| User Says | Agent Action |
|-----------|-------------|
| "Add task to buy groceries" | add_task("Buy groceries") |
| "Show my pending tasks" | list_tasks("pending") |
| "Mark task 3 as done" | complete_task(3) |
| "Delete the meeting task" | list_tasks() → delete_task(id) |
| "Change task 1 to Call mom" | update_task(1, title="Call mom") |

## Urdu Support
Agent system prompt includes Urdu instruction.
Responds in Urdu when user writes in Urdu.
Example: "گروسری خریدنے کا کام شامل کریں" → add_task("گروسری خریدنا")
