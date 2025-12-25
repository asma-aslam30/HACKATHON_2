# Tool Orchestrator Specification

**Version**: 1.0.0
**Phase**: III (AI Chatbot with MCP)
**Last Updated**: 2025-12-25
**Owner**: Spec Architect Agent

---

## Overview

The **Tool Orchestrator** is the decision-making layer in the AI Chatbot Agent that maps user intents to MCP tool calls. It handles:
- Direct tool routing for simple operations
- Multi-step orchestration for complex workflows
- Error recovery and graceful degradation
- Performance optimization through caching and batching

**Responsibility**: Transform natural language → structured tool calls → user-facing responses

---

## Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     User Input (NL)                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│            Intent Classifier + Entity Extractor             │
│  - Classify intent: add_task, list_tasks, complete_all     │
│  - Extract entities: priority=high, tags=["urgent"]        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Tool Orchestrator                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Decision: Simple or Complex?                       │   │
│  │  - Simple → Direct MCP Tool Call                    │   │
│  │  - Complex → Multi-Step Orchestration               │   │
│  └───────────────────┬─────────────────────────────────┘   │
│                      │                                      │
│       ┌──────────────┴──────────────┐                      │
│       ▼                              ▼                      │
│  ┌─────────┐                   ┌────────────┐              │
│  │ Direct  │                   │ Complex    │              │
│  │ Router  │                   │ Orchestr.  │              │
│  └────┬────┘                   └─────┬──────┘              │
│       │                              │                      │
│       │  Single Tool Call            │  Tool Sequence      │
│       ▼                              ▼                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         MCP Tool Execution Layer                    │   │
│  │  - add_task, list_tasks, complete_task, etc.        │   │
│  │  - Error handling & retry logic                     │   │
│  │  - Result caching                                    │   │
│  └───────────────────┬─────────────────────────────────┘   │
└────────────────────────┼─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               Response Generator                            │
│  - Format tool results into natural language               │
│  - Handle errors and edge cases                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  User Response (NL)                         │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## Tool Routing Matrix

### Direct Mappings (1:1)

| **User Intent** | **MCP Tool** | **Parameters** | **Example Query** |
|-----------------|--------------|----------------|-------------------|
| add_task | add_task | title, description, priority, tags, due_date | "Add buy milk to my tasks" |
| list_all_tasks | list_tasks | {} | "Show all my tasks" |
| list_tasks_filtered | list_tasks | status, priority, tags, search, limit | "Show high priority pending tasks" |
| complete_task | complete_task | task_id | "Mark task 5 as complete" |
| delete_task | delete_task | task_id | "Delete task 3" |
| update_task | update_task | task_id, fields | "Change task 2 to high priority" |
| get_task_details | get_task | task_id | "Show details for task 7" |

**Implementation**:
\`\`\`python
DIRECT_ROUTING_MAP = {
    "add_task": {
        "tool": "add_task",
        "extractor": extract_task_creation_params,
        "required": ["title"]
    },
    "list_all_tasks": {
        "tool": "list_tasks",
        "extractor": lambda _: {},
        "required": []
    },
    "list_tasks_filtered": {
        "tool": "list_tasks",
        "extractor": extract_filter_params,
        "required": []
    },
    "complete_task": {
        "tool": "complete_task",
        "extractor": extract_task_id,
        "required": ["task_id"]
    },
    # ... more mappings
}

async def route_direct(intent: str, entities: dict) -> dict:
    """Route simple intent to single MCP tool call"""
    route_config = DIRECT_ROUTING_MAP[intent]

    # Extract parameters
    params = route_config["extractor"](entities)

    # Validate required parameters
    for required_param in route_config["required"]:
        if required_param not in params:
            raise MissingParameterError(f"Missing required parameter: {required_param}")

    # Execute tool
    result = await call_mcp_tool(route_config["tool"], params)

    return result
\`\`\`

---

### Complex Orchestration Mappings

| **User Intent** | **Tool Sequence** | **Pattern** | **Example Query** |
|-----------------|-------------------|-------------|-------------------|
| complete_all_high_priority | 1. list_tasks(priority=high, status=pending)<br>2. complete_task(id) × N | Fan-out/Fan-in | "Complete all high priority tasks" |
| show_overdue_complete_highest | 1. list_tasks(overdue=true)<br>2. sort by priority<br>3. complete_task(top_id) | Sequential Chain | "Show overdue, complete highest" |
| add_multiple_tasks | add_task × N in parallel | Parallel Batch | "Add buy milk, call dentist, finish report" |
| delete_all_completed | 1. list_tasks(status=completed)<br>2. delete_task(id) × N | Fan-out/Fan-in | "Delete all completed tasks" |
| prioritize_urgent_tasks | 1. list_tasks(tags=urgent)<br>2. update_task(id, priority=high) × N | Sequential Loop | "Set all urgent tasks to high priority" |
| smart_complete | 1. list_tasks(due_date<today)<br>2. If empty: list_tasks(priority=high)<br>3. complete_task(first) | Conditional Branch | "Complete my most important task" |

**Implementation**:
\`\`\`python
ORCHESTRATION_MAP = {
    "complete_all_high_priority": orchestrate_complete_all_filtered,
    "show_overdue_complete_highest": orchestrate_smart_complete,
    "add_multiple_tasks": orchestrate_parallel_add,
    # ... more orchestrations
}

async def route_complex(intent: str, entities: dict) -> dict:
    """Route complex intent to orchestration function"""
    orchestrator = ORCHESTRATION_MAP[intent]
    result = await orchestrator(entities)
    return result

# Example orchestration function
async def orchestrate_complete_all_filtered(entities: dict):
    """Fan-out/fan-in: List → Complete all in parallel → Aggregate"""

    # Step 1: Fetch matching tasks
    tasks_result = await call_mcp_tool("list_tasks", {
        "priority": entities.get("priority"),
        "status": "pending"
    })

    if tasks_result["total"] == 0:
        return {
            "message": f"No {entities.get('priority', '')} priority pending tasks found",
            "completed": 0
        }

    # Step 2: Complete all in parallel
    complete_calls = [
        call_mcp_tool("complete_task", {"task_id": task["id"]})
        for task in tasks_result["tasks"]
    ]

    results = await asyncio.gather(*complete_calls, return_exceptions=True)

    # Step 3: Aggregate
    successful = [r for r in results if not isinstance(r, Exception)]
    failed = [r for r in results if isinstance(r, Exception)]

    return {
        "message": f"Completed {len(successful)} out of {tasks_result['total']} tasks",
        "total": tasks_result["total"],
        "completed": len(successful),
        "failed": len(failed),
        "details": {
            "successful_ids": [r["task_id"] for r in successful],
            "failed_ids": [r["task_id"] for r in failed if hasattr(r, "task_id")]
        }
    }
\`\`\`

---

## Decision Tree

### Intent Classification Decision Tree

\`\`\`
User Input
    │
    ├── Keywords: "add", "create", "new"
    │   └── Has task details? → add_task (direct)
    │
    ├── Keywords: "show", "list", "get", "what"
    │   ├── Has "all"? → list_all_tasks (direct)
    │   ├── Has filters (priority, status, tags)? → list_tasks_filtered (direct)
    │   └── Has task ID? → get_task_details (direct)
    │
    ├── Keywords: "complete", "done", "finish", "mark"
    │   ├── Has specific task ID? → complete_task (direct)
    │   ├── Has "all" + filter? → complete_all_filtered (orchestration)
    │   └── Has "most important"? → smart_complete (orchestration)
    │
    ├── Keywords: "delete", "remove"
    │   ├── Has specific task ID? → delete_task (direct)
    │   └── Has "all completed"? → delete_all_completed (orchestration)
    │
    └── Keywords: "update", "change", "modify"
        ├── Has task ID + fields? → update_task (direct)
        └── Has "all" + filter? → batch_update (orchestration)
\`\`\`

### Routing Decision Tree

\`\`\`
Intent Classified
    │
    ├── In DIRECT_ROUTING_MAP?
    │   ├── YES → Extract entities → Validate required params
    │   │        └── All required present? → Execute single MCP tool
    │   │             └── Missing params? → Ask user for clarification
    │   │
    │   └── NO → Check ORCHESTRATION_MAP
    │            └── Match found? → Execute orchestration function
    │                 └── No match? → Fallback: general_help or clarify_intent
    │
    └── Tool Execution
         ├── Success? → Format response → Return to user
         │
         └── Error? → Classify error → Apply recovery strategy
                      ├── Retryable (timeout, 5xx)? → Retry with backoff
                      ├── Cache available? → Return cached + warning
                      └── Non-recoverable? → Inform user + suggest action
\`\`\`

---

## Orchestration Patterns (Detailed)

### Pattern 1: Sequential Chain

**Characteristics**: A → B → C (each depends on previous)

**Use Cases**:
- "Show overdue tasks and complete the highest priority"
- "Find tasks tagged 'urgent' and add them to my calendar"

**Code Template**:
\`\`\`python
async def sequential_chain(entities: dict):
    # Step 1: Initial fetch
    step1_result = await call_mcp_tool("list_tasks", {...})

    # Step 2: Client-side processing
    processed = transform(step1_result)

    # Step 3: Action based on step 1 & 2
    final_result = await call_mcp_tool("complete_task", {
        "task_id": processed["selected_id"]
    })

    return {
        "initial_data": step1_result,
        "final_action": final_result
    }
\`\`\`

**Performance**: Serial execution, latency = sum of all steps

---

### Pattern 2: Parallel Batch

**Characteristics**: [A, B, C] all execute concurrently

**Use Cases**:
- "Add buy milk, call dentist, and finish report"
- "Complete tasks 5, 7, and 9"

**Code Template**:
\`\`\`python
async def parallel_batch(items: List[dict]):
    # Create tool call tasks
    tasks = [
        call_mcp_tool(item["tool"], item["params"])
        for item in items
    ]

    # Execute all concurrently
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Separate success/failure
    successful = [r for r in results if not isinstance(r, Exception)]
    failed = [r for r in results if isinstance(r, Exception)]

    return {
        "total": len(items),
        "successful": len(successful),
        "failed": len(failed),
        "results": results
    }
\`\`\`

**Performance**: Parallel execution, latency = max(individual latencies)

---

### Pattern 3: Fan-Out/Fan-In

**Characteristics**: Single fetch → Multiple parallel actions → Aggregate

**Use Cases**:
- "Complete all high priority tasks"
- "Delete all completed tasks"
- "Set all urgent tasks to high priority"

**Code Template**:
\`\`\`python
async def fan_out_fan_in(filter_params: dict, action: str):
    # Fan-out: Single fetch
    tasks_result = await call_mcp_tool("list_tasks", filter_params)

    if tasks_result["total"] == 0:
        return {"message": "No matching tasks found", "count": 0}

    # Process: Parallel actions
    action_results = await asyncio.gather(*[
        call_mcp_tool(action, {"task_id": task["id"]})
        for task in tasks_result["tasks"]
    ], return_exceptions=True)

    # Fan-in: Aggregate
    successful = [r for r in action_results if not isinstance(r, Exception)]
    failed = [r for r in action_results if isinstance(r, Exception)]

    return {
        "total": tasks_result["total"],
        "successful": len(successful),
        "failed": len(failed)
    }
\`\`\`

**Performance**: 1 fetch + parallel actions, efficient for batch operations

---

### Pattern 4: Conditional Branch

**Characteristics**: Runtime decision based on data

**Use Cases**:
- "Complete my most important task (overdue first, else high priority)"
- "If I have overdue tasks, show them; otherwise show today's tasks"

**Code Template**:
\`\`\`python
async def conditional_branch(condition_check: dict):
    # Check condition
    condition_result = await call_mcp_tool("list_tasks", condition_check)

    # Branch A or B
    if condition_result["total"] > 0:
        # Condition met: Branch A
        return await execute_branch_a(condition_result)
    else:
        # Condition not met: Branch B
        return await execute_branch_b()
\`\`\`

**Performance**: Only one branch executes, reduces unnecessary calls

---

## Error Recovery Strategies

### Error Classification

\`\`\`python
class ToolErrorType(Enum):
    # Retryable
    NETWORK_TIMEOUT = "network_timeout"
    RATE_LIMIT = "rate_limit"
    SERVER_ERROR = "server_error"  # 5xx

    # Non-retryable
    NOT_FOUND = "not_found"  # 404
    UNAUTHORIZED = "unauthorized"  # 401
    VALIDATION_ERROR = "validation_error"  # 400
    PERMISSION_DENIED = "permission_denied"  # 403

def classify_error(error: Exception) -> ToolErrorType:
    if isinstance(error, TimeoutError):
        return ToolErrorType.NETWORK_TIMEOUT
    elif hasattr(error, "status_code"):
        if error.status_code == 429:
            return ToolErrorType.RATE_LIMIT
        elif error.status_code >= 500:
            return ToolErrorType.SERVER_ERROR
        elif error.status_code == 404:
            return ToolErrorType.NOT_FOUND
        elif error.status_code == 401:
            return ToolErrorType.UNAUTHORIZED
        elif error.status_code == 400:
            return ToolErrorType.VALIDATION_ERROR
    return ToolErrorType.SERVER_ERROR
\`\`\`

---

### Recovery Strategy Matrix

| **Error Type** | **Strategy** | **Action** | **User Message** |
|----------------|--------------|------------|------------------|
| NETWORK_TIMEOUT | Retry with exponential backoff (3x) | Wait 1s, 2s, 4s | "Retrying... Network is slow" |
| RATE_LIMIT | Wait for retry-after header | Wait N seconds | "Rate limited. Waiting {N}s..." |
| SERVER_ERROR (5xx) | Retry 2x → Cache fallback | Use cached data | "⚠️ Server issues. Using cached data" |
| NOT_FOUND (404) | No retry | Return error | "Task not found" |
| UNAUTHORIZED (401) | No retry | Prompt re-auth | "Session expired. Please log in again" |
| VALIDATION_ERROR (400) | No retry | Parse error details | "Invalid input: {details}" |

---

### Strategy 1: Retry with Exponential Backoff

\`\`\`python
async def call_with_retry(tool_name: str, params: dict, max_retries: int = 3):
    for attempt in range(max_retries):
        try:
            return await call_mcp_tool(tool_name, params)

        except ToolError as e:
            error_type = classify_error(e)

            if error_type in [ToolErrorType.NETWORK_TIMEOUT, ToolErrorType.SERVER_ERROR]:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt  # 1s, 2s, 4s
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    # Max retries reached
                    raise
            else:
                # Non-retryable error
                raise
\`\`\`

---

### Strategy 2: Graceful Degradation (Cache Fallback)

\`\`\`python
async def list_tasks_resilient(params: dict):
    try:
        # Primary: MCP tool
        result = await call_with_retry("list_tasks", params)
        cache.set("tasks", result)  # Update cache
        return result

    except ToolError:
        # Fallback: Cached data
        cached = cache.get("tasks")
        if cached:
            return {
                **cached,
                "source": "cache",
                "warning": "Using cached data due to server issues"
            }
        else:
            raise Exception("No cached data available")
\`\`\`

---

### Strategy 3: Partial Batch Success

\`\`\`python
async def complete_multiple_resilient(task_ids: List[int]):
    results = []

    for task_id in task_ids:
        try:
            result = await call_mcp_tool("complete_task", {"task_id": task_id})
            results.append({"task_id": task_id, "status": "success"})
        except ToolError as e:
            # Isolate failure, continue with others
            results.append({
                "task_id": task_id,
                "status": "failed",
                "error": str(e)
            })

    return {
        "total": len(task_ids),
        "successful": len([r for r in results if r["status"] == "success"]),
        "failed": len([r for r in results if r["status"] == "failed"]),
        "details": results
    }
\`\`\`

---

## Performance Optimization

### 1. Result Caching

**Strategy**: Cache list_tasks results for short TTL (30-60s)

\`\`\`python
class ToolCache:
    def __init__(self):
        self.cache = {}
        self.ttl = {}

    async def get_or_fetch(self, tool: str, params: dict, ttl: int = 60):
        cache_key = f"{tool}:{hash(frozenset(params.items()))}"

        # Check cache
        if cache_key in self.cache and datetime.now() < self.ttl[cache_key]:
            return self.cache[cache_key]

        # Fetch from MCP
        result = await call_mcp_tool(tool, params)

        # Store in cache
        self.cache[cache_key] = result
        self.ttl[cache_key] = datetime.now() + timedelta(seconds=ttl)

        return result
\`\`\`

**Cache Invalidation**:
- On add_task, complete_task, update_task, delete_task → Clear cache
- TTL-based expiration

---

### 2. Request Batching

**Strategy**: Batch multiple independent calls into single async gather

\`\`\`python
# Instead of:
result1 = await call_mcp_tool("get_task", {"task_id": 1})
result2 = await call_mcp_tool("get_task", {"task_id": 2})
result3 = await call_mcp_tool("get_task", {"task_id": 3})

# Use:
results = await asyncio.gather(
    call_mcp_tool("get_task", {"task_id": 1}),
    call_mcp_tool("get_task", {"task_id": 2}),
    call_mcp_tool("get_task", {"task_id": 3})
)
\`\`\`

**Performance Gain**: Reduces total latency from 3×RTT to 1×RTT

---

### 3. Preemptive Fetching

**Strategy**: Fetch likely-needed data before user asks

\`\`\`python
async def on_user_login(user_id: int):
    # Preemptively fetch tasks in background
    asyncio.create_task(
        cache.get_or_fetch("list_tasks", {"limit": 50})
    )

async def on_task_list_view(user_id: int):
    # User likely to ask about specific tasks
    # Preemptively fetch top 5 task details
    recent_tasks = cache.get("tasks")["tasks"][:5]
    asyncio.gather(*[
        cache.get_or_fetch("get_task", {"task_id": t["id"]})
        for t in recent_tasks
    ])
\`\`\`

---

## Integration Guide

### Integrating with AI Chatbot Agent

\`\`\`python
# chatbot_agent.py
from tool_orchestrator import ToolOrchestrator

class ChatbotAgent:
    def __init__(self):
        self.orchestrator = ToolOrchestrator()

    async def handle_user_message(self, message: str, user_context: dict):
        # Step 1: Classify intent
        intent, entities = self.classify_intent(message)

        # Step 2: Route to orchestrator
        result = await self.orchestrator.execute(intent, entities, user_context)

        # Step 3: Generate natural language response
        response = self.format_response(result, intent)

        return response
\`\`\`

---

## Validation Checklist

Before deploying tool orchestrator:

- [ ] All MCP tools have direct routing rules
- [ ] Complex intents mapped to orchestration patterns
- [ ] Error classification covers all HTTP status codes
- [ ] Retry logic with exponential backoff implemented
- [ ] Cache fallback for critical operations
- [ ] Partial batch success handling
- [ ] Performance: caching, batching, preemptive fetch
- [ ] Unit tests for all orchestration patterns
- [ ] Integration tests with mock MCP server

---

## Testing Strategy

### Unit Tests

\`\`\`python
# test_direct_routing.py
async def test_add_task_direct():
    result = await orchestrator.execute(
        intent="add_task",
        entities={"title": "Buy milk"},
        user_context={"user_id": 123}
    )
    assert result["task_id"] is not None
    assert result["status"] == "created"

# test_orchestration.py
async def test_complete_all_high_priority():
    result = await orchestrator.execute(
        intent="complete_all_high_priority",
        entities={},
        user_context={"user_id": 123}
    )
    assert result["completed"] >= 0
    assert result["total"] >= result["completed"]
\`\`\`

### Integration Tests

\`\`\`python
# test_with_mock_mcp.py
@pytest.mark.asyncio
async def test_with_mock_mcp_server():
    mock_server = MockMCPServer()
    orchestrator = ToolOrchestrator(mcp_client=mock_server)

    # Simulate user request
    result = await orchestrator.execute(
        intent="list_tasks_filtered",
        entities={"priority": "high"},
        user_context={"user_id": 123}
    )

    assert mock_server.calls[0]["tool"] == "list_tasks"
    assert mock_server.calls[0]["params"]["priority"] == "high"
\`\`\`

---

## Revision History

| **Version** | **Date**       | **Changes**                                      |
|-------------|----------------|--------------------------------------------------|
| 1.0.0       | 2025-12-25     | Initial specification                            |

---

## References

- **MCP Tools Specification**: \`specs/api/mcp-tools.md\`
- **AI Chatbot Agent**: \`.claude/agents/ai-chatbot.md\`
- **Tool Orchestration Skill**: \`.claude/skills/tool-orchestration/README.md\`
- **MCP Documentation**: https://modelcontextprotocol.io/

---

**Status**: ✅ Specification Complete
**Next Steps**:
1. Implement ToolOrchestrator class in \`backend/src/ai/tool_orchestrator.py\`
2. Integrate with AI Chatbot Agent
3. Add unit and integration tests
4. Deploy to Phase III environment
