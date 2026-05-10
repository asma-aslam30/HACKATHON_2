# REST API Endpoints

## Base URL
- Development: http://localhost:8000
- Production: https://your-backend.run.app

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```
JWT issued by Better Auth. Shared secret: `BETTER_AUTH_SECRET`

## Task Endpoints

### GET /api/{user_id}/tasks
List all tasks for authenticated user.

Query Parameters:
- `status`: `all` | `pending` | `completed`
- `sort`: `created` | `due_date` | `priority`
- `search`: keyword string

Response: Array of Task objects

### POST /api/{user_id}/tasks
Create a new task.

Request Body:
```json
{ "title": "string (required)", "description": "string (optional)", "priority": "low|medium|high" }
```
Response: Created Task object (201)

### GET /api/{user_id}/tasks/{id}
Get a single task by ID.

### PUT /api/{user_id}/tasks/{id}
Update a task (full update).

### DELETE /api/{user_id}/tasks/{id}
Delete a task (204 No Content).

### PATCH /api/{user_id}/tasks/{id}/complete
Toggle task completion status.

## Chat Endpoints

### POST /api/{user_id}/chat
Send a message and get AI response.

Request Body:
```json
{ "message": "string (required)", "conversation_id": "integer (optional)" }
```
Response:
```json
{ "conversation_id": 1, "response": "AI response text", "tool_calls": ["add_task(...)"] }
```

### GET /api/{user_id}/conversations
List all conversations for a user.

### GET /api/{user_id}/conversations/{id}/messages
Get all messages in a conversation.

### DELETE /api/{user_id}/conversations/{id}
Delete a conversation and its messages.

## Health

### GET /health
Returns `{"status": "ok"}` — used by Docker/K8s health checks.

## MCP Tools (called internally by AI agent)

| Tool | Parameters | Returns |
|------|-----------|---------|
| `add_task` | title(req), description, priority | task_id, status, title |
| `list_tasks` | status(all/pending/completed) | array of tasks |
| `complete_task` | task_id | task_id, status, title |
| `delete_task` | task_id | task_id, status, title |
| `update_task` | task_id, title?, description?, priority? | task_id, status, title |
