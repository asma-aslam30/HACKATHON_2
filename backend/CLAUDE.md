# Backend Guidelines

## Stack
- Python FastAPI
- SQLModel (ORM)
- Neon Serverless PostgreSQL
- Gemini 2.5 Flash (replaces OpenAI per project decision)
- MCP Tools (5 tools)

## Project Structure
- `main.py` - FastAPI app entry point
- `models/models.py` - SQLModel database models
- `routes/chat.py` - AI chat endpoint
- `routes/tasks.py` - REST task CRUD endpoints
- `db.py` - Neon DB connection with SSL
- `agent.py` - Gemini 2.5 Flash agent with function calling
- `mcp_server/tools.py` - 5 MCP tools
- `kafka/` - Kafka producer + Dapr publisher

## API Conventions
- All routes under `/api/{user_id}/`
- Return JSON responses
- Use Pydantic/SQLModel models for request/response
- Handle errors with HTTPException

## Auth — JWT Verification
FastAPI verifies JWT tokens issued by Better Auth:
```python
# Every protected route extracts user from JWT
from routes.auth import get_current_user
@router.get("/api/{user_id}/tasks")
def list_tasks(user_id: str, user = Depends(get_current_user)):
    # user.id must match user_id in URL
```

Shared secret: `BETTER_AUTH_SECRET` env var (same in frontend + backend)

## Database
- Use SQLModel for all DB operations
- Connection string: `DATABASE_URL` env var
- Always use `pool_pre_ping=True` for Neon

## Running
```bash
uvicorn main:app --reload --port 8000
```

## Specs Reference
- @specs/features/task-crud.md
- @specs/api/rest-endpoints.md
- @specs/database/schema.md
- @specs/features/chatbot.md
