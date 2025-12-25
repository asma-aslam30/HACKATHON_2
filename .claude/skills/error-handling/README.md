# Error Handling Skill

**Purpose**: Implement comprehensive error handling across all system layers per phase specifications

**Owner**: All Implementation Agents + Backend / FastAPI Pro Agent + Frontend UI/UX Agent

**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

The **Error Handling Skill** enables robust error management across all architectural layers:
- Define error taxonomy per layer (API, database, external services, infrastructure)
- Implement global error middleware for automatic handling
- Create user-friendly error messages (no stack traces exposed)
- Add retry logic for transient failures
- Implement fallback responses for degraded service
- Generate phase-specific error handlers

This skill ensures users receive clear, actionable error messages and the system gracefully handles failures.

---

## Skill Components

### 1. Error Taxonomy

Define standard error categories per layer.

**API Layer Errors** (HTTP Status Codes):
- `400 Bad Request`: Invalid request body, missing required fields
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User lacks permission (multi-tenant violation)
- `404 Not Found`: Resource doesn't exist or user can't access it
- `409 Conflict`: Resource already exists (duplicate)
- `422 Unprocessable Entity`: Validation failed (Pydantic)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Unexpected server error
- `503 Service Unavailable`: External API or database down

**Database Layer Errors**:
- `IntegrityError`: Unique constraint violation, foreign key violation
- `OperationalError`: Connection refused, timeout
- `DataError`: Invalid data type, out of range
- `ProgrammingError`: SQL syntax error, table doesn't exist

**External API Errors**:
- `APIConnectionError`: Claude/OpenAI API unreachable
- `RateLimitError`: API rate limit exceeded
- `APITimeoutError`: Request took too long
- `AuthenticationError`: Invalid API key

**Infrastructure Errors**:
- `ContainerStartupError`: Docker container failed to start
- `ServiceDiscoveryError`: Kubernetes service not found
- `ConfigurationError`: Missing environment variable
- `HealthCheckFailure`: Service unhealthy

### 2. User-Friendly Error Messages

Map technical errors to user-facing messages.

**Mapping Template**:
```python
ERROR_MESSAGES = {
    # Multi-tenant security
    "USER_MISMATCH": "You don't have permission to access this resource.",
    "INVALID_USER_ID": "Invalid user ID. Please log in again.",

    # Task operations
    "TASK_NOT_FOUND": "Task not found. It may have been deleted.",
    "DUPLICATE_TASK": "A task with this title already exists.",
    "INVALID_TASK_DATA": "Invalid task data. Please check your input.",

    # Authentication
    "TOKEN_EXPIRED": "Your session has expired. Please log in again.",
    "INVALID_TOKEN": "Invalid authentication token. Please log in.",
    "MISSING_TOKEN": "Authentication required. Please log in.",

    # Database
    "DATABASE_ERROR": "Database temporarily unavailable. Please try again.",
    "CONNECTION_FAILED": "Could not connect to database. Please contact support.",

    # External APIs
    "CLAUDE_API_ERROR": "AI assistant temporarily unavailable. Please try again.",
    "RATE_LIMIT_EXCEEDED": "Too many requests. Please wait a moment.",

    # Generic
    "INTERNAL_ERROR": "Something went wrong. Our team has been notified.",
    "SERVICE_UNAVAILABLE": "Service temporarily unavailable. Please try again later.",
}
```

### 3. Global Error Middleware

Catch all unhandled exceptions automatically.

**FastAPI Middleware**:
```python
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import logging
import traceback

logger = logging.getLogger(__name__)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for all unhandled errors.
    Logs error details and returns user-friendly message.
    """
    trace_id = getattr(request.state, "trace_id", "unknown")

    # Log full error for debugging
    logger.error(
        "Unhandled exception",
        extra={
            "trace_id": trace_id,
            "path": request.url.path,
            "method": request.method,
            "error_type": type(exc).__name__,
            "error_message": str(exc),
            "stack_trace": traceback.format_exc(),
        },
    )

    # Return user-friendly error (no stack trace)
    return JSONResponse(
        status_code=500,
        content={
            "error": "INTERNAL_ERROR",
            "message": ERROR_MESSAGES["INTERNAL_ERROR"],
            "trace_id": trace_id,  # For support requests
        },
    )
```

### 4. Retry Logic

Automatically retry transient failures.

**Exponential Backoff**:
```python
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import httpx

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((httpx.TimeoutException, httpx.NetworkError)),
)
async def call_claude_api(prompt: str) -> str:
    """
    Call Claude API with automatic retry on transient failures.

    Retries up to 3 times with exponential backoff:
    - Attempt 1: Immediate
    - Attempt 2: Wait 1 second
    - Attempt 3: Wait 2 seconds
    - Attempt 4: Wait 4 seconds
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={"x-api-key": ANTHROPIC_API_KEY},
            json={"model": "claude-opus-4-5", "messages": [{"role": "user", "content": prompt}]},
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()
```

### 5. Fallback Responses

Provide degraded service when dependencies fail.

**Example: Cached Tasks**:
```python
from functools import lru_cache
from datetime import datetime, timedelta

# In-memory cache
task_cache = {}
cache_ttl = timedelta(minutes=5)

async def get_tasks_with_fallback(user_id: int, session: Session) -> list[Task]:
    """
    Get tasks with fallback to cache if database fails.
    """
    try:
        # Try database first
        tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()

        # Update cache
        task_cache[user_id] = {
            "tasks": tasks,
            "cached_at": datetime.utcnow(),
        }

        return tasks

    except OperationalError as e:
        logger.warning(f"Database unavailable, using cache: {e}")

        # Check if cache exists and is recent
        if user_id in task_cache:
            cache_entry = task_cache[user_id]
            age = datetime.utcnow() - cache_entry["cached_at"]

            if age < cache_ttl:
                logger.info(f"Returning cached tasks (age: {age.seconds}s)")
                return cache_entry["tasks"]

        # No cache or stale cache
        raise HTTPException(
            status_code=503,
            detail="Database temporarily unavailable. Please try again.",
        )
```

### 6. Phase-Specific Handlers

Implement error handlers per hackathon phase.

**Phase II: Web App**
- JWT validation errors → 401 with clear message
- Multi-tenant violations → 403 (not 404, to avoid info leakage)
- SQLModel validation → 422 with field-specific errors
- Database connection → 503 with retry suggestion

**Phase III: AI Chatbot**
- MCP tool call failures → Retry 3 times, then fallback message
- Claude API rate limits → Queue request, show "typing..." indicator
- NLU intent unclear → Ask clarifying question instead of error
- Voice input failure → Fallback to text input

**Phase IV: Kubernetes**
- Pod startup failure → Restart policy with exponential backoff
- Service discovery error → Health check returns 503
- ConfigMap missing → Use default values, log warning
- Resource exhausted → Horizontal pod autoscaler kicks in

---

## Skill Instructions

### Step 1: Define Error Taxonomy

Create comprehensive error mapping.

**Example (Phase II Backend)**:
```python
# packages/backend/app/core/errors.py

from enum import Enum
from typing import Dict

class ErrorCode(str, Enum):
    """Standard error codes for API responses."""

    # Authentication & Authorization
    TOKEN_MISSING = "TOKEN_MISSING"
    TOKEN_INVALID = "TOKEN_INVALID"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    USER_MISMATCH = "USER_MISMATCH"
    PERMISSION_DENIED = "PERMISSION_DENIED"

    # Task Operations
    TASK_NOT_FOUND = "TASK_NOT_FOUND"
    TASK_ALREADY_EXISTS = "TASK_ALREADY_EXISTS"
    INVALID_TASK_DATA = "INVALID_TASK_DATA"
    INVALID_TASK_STATUS = "INVALID_TASK_STATUS"
    INVALID_PRIORITY = "INVALID_PRIORITY"

    # Database
    DATABASE_ERROR = "DATABASE_ERROR"
    CONNECTION_FAILED = "CONNECTION_FAILED"
    CONSTRAINT_VIOLATION = "CONSTRAINT_VIOLATION"

    # External APIs
    CLAUDE_API_ERROR = "CLAUDE_API_ERROR"
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
    API_TIMEOUT = "API_TIMEOUT"

    # Generic
    INTERNAL_ERROR = "INTERNAL_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    VALIDATION_ERROR = "VALIDATION_ERROR"


ERROR_MESSAGES: Dict[ErrorCode, str] = {
    # Authentication
    ErrorCode.TOKEN_MISSING: "Authentication required. Please log in.",
    ErrorCode.TOKEN_INVALID: "Invalid authentication token. Please log in again.",
    ErrorCode.TOKEN_EXPIRED: "Your session has expired. Please log in again.",
    ErrorCode.USER_MISMATCH: "You don't have permission to access this resource.",
    ErrorCode.PERMISSION_DENIED: "Permission denied.",

    # Tasks
    ErrorCode.TASK_NOT_FOUND: "Task not found. It may have been deleted.",
    ErrorCode.TASK_ALREADY_EXISTS: "A task with this title already exists.",
    ErrorCode.INVALID_TASK_DATA: "Invalid task data. Please check your input.",
    ErrorCode.INVALID_TASK_STATUS: "Invalid task status. Must be 'pending' or 'completed'.",
    ErrorCode.INVALID_PRIORITY: "Invalid priority. Must be 'high', 'medium', or 'low'.",

    # Database
    ErrorCode.DATABASE_ERROR: "Database error. Please try again.",
    ErrorCode.CONNECTION_FAILED: "Could not connect to database. Please contact support.",
    ErrorCode.CONSTRAINT_VIOLATION: "Operation violates data integrity constraints.",

    # External APIs
    ErrorCode.CLAUDE_API_ERROR: "AI assistant temporarily unavailable. Please try again.",
    ErrorCode.RATE_LIMIT_EXCEEDED: "Too many requests. Please wait a moment and try again.",
    ErrorCode.API_TIMEOUT: "Request timed out. Please try again.",

    # Generic
    ErrorCode.INTERNAL_ERROR: "Something went wrong. Our team has been notified.",
    ErrorCode.SERVICE_UNAVAILABLE: "Service temporarily unavailable. Please try again later.",
    ErrorCode.VALIDATION_ERROR: "Invalid input. Please check your data and try again.",
}


class AppException(Exception):
    """Base exception for application errors."""

    def __init__(
        self,
        error_code: ErrorCode,
        status_code: int = 500,
        detail: str = None,
        context: dict = None,
    ):
        self.error_code = error_code
        self.status_code = status_code
        self.detail = detail or ERROR_MESSAGES[error_code]
        self.context = context or {}
        super().__init__(self.detail)
```

---

### Step 2: Implement Global Error Middleware

Create automatic error handling.

**FastAPI Implementation**:
```python
# packages/backend/app/main.py

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, OperationalError
from pydantic import ValidationError
import logging

app = FastAPI()
logger = logging.getLogger(__name__)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """Handle application-specific exceptions."""
    trace_id = getattr(request.state, "trace_id", "unknown")

    logger.warning(
        f"Application error: {exc.error_code}",
        extra={
            "trace_id": trace_id,
            "error_code": exc.error_code,
            "status_code": exc.status_code,
            "context": exc.context,
        },
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error_code,
            "message": exc.detail,
            "trace_id": trace_id,
            **exc.context,
        },
    )


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    """Handle Pydantic validation errors."""
    trace_id = getattr(request.state, "trace_id", "unknown")

    logger.warning(
        "Validation error",
        extra={
            "trace_id": trace_id,
            "errors": exc.errors(),
        },
    )

    # Extract field-specific errors
    field_errors = {}
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        field_errors[field] = error["msg"]

    return JSONResponse(
        status_code=422,
        content={
            "error": ErrorCode.VALIDATION_ERROR,
            "message": ERROR_MESSAGES[ErrorCode.VALIDATION_ERROR],
            "trace_id": trace_id,
            "field_errors": field_errors,
        },
    )


@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    """Handle database integrity errors (unique constraints, foreign keys)."""
    trace_id = getattr(request.state, "trace_id", "unknown")

    logger.error(
        "Database integrity error",
        extra={
            "trace_id": trace_id,
            "error": str(exc.orig),
        },
    )

    # Check for specific constraint violations
    error_msg = str(exc.orig).lower()

    if "unique constraint" in error_msg or "duplicate key" in error_msg:
        return JSONResponse(
            status_code=409,
            content={
                "error": ErrorCode.TASK_ALREADY_EXISTS,
                "message": ERROR_MESSAGES[ErrorCode.TASK_ALREADY_EXISTS],
                "trace_id": trace_id,
            },
        )
    elif "foreign key constraint" in error_msg:
        return JSONResponse(
            status_code=400,
            content={
                "error": ErrorCode.CONSTRAINT_VIOLATION,
                "message": "Referenced resource does not exist.",
                "trace_id": trace_id,
            },
        )
    else:
        return JSONResponse(
            status_code=500,
            content={
                "error": ErrorCode.DATABASE_ERROR,
                "message": ERROR_MESSAGES[ErrorCode.DATABASE_ERROR],
                "trace_id": trace_id,
            },
        )


@app.exception_handler(OperationalError)
async def operational_error_handler(request: Request, exc: OperationalError):
    """Handle database connection errors."""
    trace_id = getattr(request.state, "trace_id", "unknown")

    logger.error(
        "Database connection error",
        extra={
            "trace_id": trace_id,
            "error": str(exc.orig),
        },
    )

    return JSONResponse(
        status_code=503,
        content={
            "error": ErrorCode.SERVICE_UNAVAILABLE,
            "message": "Database temporarily unavailable. Please try again.",
            "trace_id": trace_id,
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all for unexpected errors."""
    trace_id = getattr(request.state, "trace_id", "unknown")

    logger.error(
        "Unhandled exception",
        extra={
            "trace_id": trace_id,
            "error_type": type(exc).__name__,
            "error_message": str(exc),
        },
        exc_info=True,  # Include stack trace in logs
    )

    return JSONResponse(
        status_code=500,
        content={
            "error": ErrorCode.INTERNAL_ERROR,
            "message": ERROR_MESSAGES[ErrorCode.INTERNAL_ERROR],
            "trace_id": trace_id,
            "support_hint": f"Please provide trace ID {trace_id} when contacting support.",
        },
    )
```

---

### Step 3: Add Route-Level Error Handling

Handle specific errors in routes.

**Example: Task Creation**:
```python
# packages/backend/app/api/tasks.py

from app.core.errors import AppException, ErrorCode

@router.post("/api/{user_id}/tasks", status_code=201)
async def create_task(
    user_id: int,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Create a new task with comprehensive error handling.
    """
    # Multi-tenant security check
    if user_id != current_user.id:
        raise AppException(
            error_code=ErrorCode.USER_MISMATCH,
            status_code=403,
            context={"requested_user_id": user_id, "authenticated_user_id": current_user.id},
        )

    # Validate priority
    if task_data.priority and task_data.priority not in ["high", "medium", "low"]:
        raise AppException(
            error_code=ErrorCode.INVALID_PRIORITY,
            status_code=422,
            context={"provided_priority": task_data.priority},
        )

    # Check for duplicate title (optional business rule)
    existing_task = session.exec(
        select(Task).where(Task.user_id == current_user.id, Task.title == task_data.title)
    ).first()

    if existing_task:
        raise AppException(
            error_code=ErrorCode.TASK_ALREADY_EXISTS,
            status_code=409,
            context={"existing_task_id": existing_task.id},
        )

    # Create task
    try:
        task = Task(user_id=current_user.id, **task_data.dict())
        session.add(task)
        session.commit()
        session.refresh(task)

        logger.info(f"Task created successfully: {task.id}")
        return task

    except IntegrityError:
        # Rollback transaction
        session.rollback()
        raise  # Let global handler deal with it

    except Exception as e:
        session.rollback()
        logger.error(f"Unexpected error creating task: {e}")
        raise AppException(
            error_code=ErrorCode.INTERNAL_ERROR,
            status_code=500,
        )
```

---

### Step 4: Implement Frontend Error Handling

Create Next.js error boundaries and handlers.

**Global Error Boundary**:
```tsx
// packages/frontend/app/error.tsx

'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-4">
          <svg
            className="w-12 h-12 text-red-500 mr-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900">
            Something went wrong
          </h2>
        </div>

        <p className="text-gray-600 mb-4">
          We're sorry, but something unexpected happened. Our team has been notified.
        </p>

        {error.digest && (
          <p className="text-sm text-gray-500 mb-4">
            Error ID: <code className="bg-gray-100 px-2 py-1 rounded">{error.digest}</code>
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Try again
          </button>
          <a
            href="/"
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded text-center"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
```

**API Error Handler**:
```typescript
// packages/frontend/lib/api-error.ts

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    public message: string,
    public traceId?: string,
    public fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = 'APIError';
  }

  static async fromResponse(response: Response): Promise<APIError> {
    const data = await response.json();

    return new APIError(
      response.status,
      data.error || 'UNKNOWN_ERROR',
      data.message || 'An unexpected error occurred',
      data.trace_id,
      data.field_errors
    );
  }

  getUserMessage(): string {
    // Return user-friendly message based on error code
    const messages: Record<string, string> = {
      TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
      TASK_NOT_FOUND: 'Task not found. It may have been deleted.',
      PERMISSION_DENIED: "You don't have permission to perform this action.",
      DATABASE_ERROR: 'Service temporarily unavailable. Please try again.',
      RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment.',
    };

    return messages[this.errorCode] || this.message;
  }

  shouldRetry(): boolean {
    // Determine if error is retryable
    const retryableErrors = [
      'DATABASE_ERROR',
      'SERVICE_UNAVAILABLE',
      'API_TIMEOUT',
      'CONNECTION_FAILED',
    ];

    return retryableErrors.includes(this.errorCode);
  }

  shouldRedirectToLogin(): boolean {
    return ['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_MISSING'].includes(this.errorCode);
  }
}


// packages/frontend/lib/api.ts

export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await APIError.fromResponse(response);

    // Auto-redirect to login if token expired
    if (error.shouldRedirectToLogin()) {
      window.location.href = '/login';
    }

    throw error;
  }

  return response.json();
}


// Usage in components
async function handleCreateTask() {
  try {
    const task = await apiRequest('/api/1/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: 'New task' }),
    });

    console.log('Task created:', task);
  } catch (error) {
    if (error instanceof APIError) {
      // Show user-friendly error message
      toast.error(error.getUserMessage());

      // Log trace ID for support
      if (error.traceId) {
        console.error(`Error trace ID: ${error.traceId}`);
      }

      // Show field-specific errors
      if (error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          setFieldError(field, message);
        });
      }
    } else {
      toast.error('An unexpected error occurred');
    }
  }
}
```

---

### Step 5: Add Retry Logic

Implement automatic retries for transient failures.

**Python (Backend)**:
```python
# packages/backend/app/core/retry.py

from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)
import logging

logger = logging.getLogger(__name__)


def retry_on_transient_errors():
    """
    Decorator for retrying operations that may fail transiently.

    Retries up to 3 times with exponential backoff.
    Only retries on specific exception types.
    """
    return retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((
            OperationalError,  # Database connection errors
            httpx.TimeoutException,  # API timeouts
            httpx.NetworkError,  # Network errors
        )),
        before_sleep=before_sleep_log(logger, logging.WARNING),
    )


# Usage
@retry_on_transient_errors()
async def call_external_api(url: str) -> dict:
    """Call external API with automatic retry."""
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=30.0)
        response.raise_for_status()
        return response.json()
```

**TypeScript (Frontend)**:
```typescript
// packages/frontend/lib/retry.ts

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Only retry on specific errors
      if (error instanceof APIError && !error.shouldRetry()) {
        throw error;
      }

      if (attempt === maxAttempts) {
        throw error;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Retry failed');
}


// Usage
const tasks = await retryWithBackoff(async () => {
  return apiRequest<Task[]>('/api/1/tasks');
}, 3);
```

---

### Step 6: Implement Phase III MCP Error Handling

Handle ChatKit tool call failures.

**MCP Tool Error Handling**:
```python
# packages/chatbot/mcp_server.py

from anthropic import Anthropic, ToolUseBlock
import logging

logger = logging.getLogger(__name__)


async def execute_mcp_tool_with_fallback(
    tool_name: str,
    tool_input: dict,
    user_id: int,
    access_token: str,
) -> dict:
    """
    Execute MCP tool with retry and fallback.
    """
    try:
        # Try to execute tool
        result = await execute_tool(tool_name, tool_input, user_id, access_token)
        return {"success": True, "result": result}

    except httpx.TimeoutException:
        logger.warning(f"MCP tool timeout: {tool_name}")

        # Retry once
        try:
            result = await execute_tool(tool_name, tool_input, user_id, access_token)
            return {"success": True, "result": result}
        except Exception:
            # Fallback response
            return {
                "success": False,
                "error": "TOOL_TIMEOUT",
                "fallback_message": "Tools are temporarily slow. Showing cached data.",
            }

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 503:
            # Service unavailable - use fallback
            logger.error(f"Backend unavailable for tool: {tool_name}")
            return {
                "success": False,
                "error": "SERVICE_UNAVAILABLE",
                "fallback_message": "Backend is temporarily unavailable. Please try again.",
            }
        else:
            raise

    except Exception as e:
        logger.error(f"MCP tool error: {tool_name}", exc_info=True)
        return {
            "success": False,
            "error": "TOOL_ERROR",
            "fallback_message": f"Could not complete {tool_name}. Please try again.",
        }


# ChatKit integration with error handling
async def handle_chat_message(message: str, user_id: int, access_token: str) -> str:
    """Handle chat message with graceful error handling."""

    try:
        # Call Claude with tools
        response = client.messages.create(
            model="claude-opus-4-5",
            tools=MCP_TOOLS,
            messages=[{"role": "user", "content": message}],
        )

        # Handle tool calls
        for block in response.content:
            if isinstance(block, ToolUseBlock):
                tool_result = await execute_mcp_tool_with_fallback(
                    block.name,
                    block.input,
                    user_id,
                    access_token,
                )

                if not tool_result["success"]:
                    # Return fallback message to user
                    return tool_result["fallback_message"]

                return f"Task completed: {tool_result['result']}"

        return response.content[0].text

    except RateLimitError:
        return "I'm receiving too many requests right now. Please wait a moment and try again."

    except APIConnectionError:
        return "I'm temporarily unavailable. Please try again in a moment."

    except Exception as e:
        logger.error("Chat error", exc_info=True)
        return "I encountered an error. Please try rephrasing your request."
```

---

## Related Agents

All agents use this skill:

- **Backend / FastAPI Pro Agent**: Implements API error handlers, validation errors
- **Frontend UI/UX Agent**: Creates error boundaries, user-facing error messages
- **AI Chatbot Agent**: Handles MCP tool failures, Claude API errors
- **CloudOps & Kubernetes Agent**: Configures liveness/readiness probes, restart policies
- **Testing & QA Agent**: Tests error scenarios, validates error messages

---

## Success Metrics

The Error Handling Skill is successful when:

✅ **No Stack Traces Exposed**: Users never see technical error details
✅ **Clear Messages**: Every error has user-friendly message
✅ **Trace IDs Provided**: Support can debug with trace_id
✅ **Automatic Retries**: Transient failures retry automatically
✅ **Fallback Responses**: Degraded service instead of total failure
✅ **Field-Specific Errors**: Validation errors show which field failed
✅ **Global Coverage**: All unhandled exceptions caught

---

## Best Practices

### Do's ✅
- Always return user-friendly error messages
- Include trace_id for support debugging
- Log full error details server-side
- Implement retry logic for transient failures
- Use specific HTTP status codes
- Provide field-specific validation errors
- Add fallback responses for degraded service
- Test all error scenarios

### Don'ts ❌
- Don't expose stack traces to users
- Don't return generic "Error occurred" messages
- Don't retry on non-retryable errors (e.g., 403 Forbidden)
- Don't ignore errors (always log)
- Don't use wrong HTTP status codes
- Don't leak sensitive data in error messages
- Don't make users guess what went wrong

---

## Integration with Other Skills

### Workflow Integration

```
Code Implementation
  ↓
ERROR HANDLING (this skill) ← YOU ARE HERE
  ├─→ Add global error middleware
  ├─→ Implement route-level handlers
  ├─→ Add retry logic
  ├─→ Create fallback responses
  └─→ Add frontend error boundaries
  ↓
Testing (verify error scenarios)
  ↓
Deployment
```

---

## Output Format

When using this skill, generate:

**1. Error Taxonomy** (`app/core/errors.py`)
**2. Global Middleware** (`app/main.py` exception handlers)
**3. Route-Level Handlers** (in API endpoints)
**4. Frontend Error Boundary** (`app/error.tsx`)
**5. API Error Handler** (`lib/api-error.ts`)
**6. Retry Logic** (`core/retry.py`, `lib/retry.ts`)
**7. MCP Error Handling** (`chatbot/mcp_server.py`)

---

## References

- **API Spec**: `.claude/skills/api-database-specification/README.md` (Error responses)
- **Debugging**: `.claude/skills/debugging/README.md` (Error reproduction)
- **Integration Wiring**: `.claude/skills/integration-wiring/README.md` (Health checks)
- **Constitution**: `.specify/memory/constitution.md` (Principle 6: Observability)

---

**Document Version**: 1.0.0
**Created**: 2025-12-24
**Total Examples**: 7 (Error taxonomy, middleware, route handlers, frontend boundary, retry logic, MCP fallback)
**Coverage**: All 5 Phases (I-V)

---

*This error handling skill is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*
