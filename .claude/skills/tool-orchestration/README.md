# Tool Orchestration Skill

**Skill Type**: Tool Selection & Orchestration Design
**Version**: 1.0.0
**Created**: 2025-12-25
**Owner**: Spec Architect Agent

---

## Overview

The **Tool Orchestration** skill provides systematic design patterns for tool selection, sequencing, and error recovery in Phase III MCP-powered AI agents. This skill ensures efficient tool routing, intelligent orchestration of complex multi-step operations, and robust fallback strategies.

**Purpose**: Transform natural language user requests into optimized tool call sequences with proper error handling and recovery mechanisms.

**Output**:
- `specs/ai/tool-orchestrator.md` - Tool orchestration design document
- Tool routing matrices for direct and complex operations
- Sequential and parallel orchestration patterns
- Error recovery and fallback strategies

---

## Skill Components

### 1. Tool Routing Matrix
- Direct MCP tool mapping for simple operations
- Complex multi-step orchestration patterns
- Tool selection decision trees
- Context-aware tool routing

### 2. Orchestration Patterns
- Sequential tool chains (dependent operations)
- Parallel tool execution (independent operations)
- Conditional branching based on tool results
- Loop patterns for batch operations

### 3. Error Recovery
- Tool failure detection and classification
- Graceful degradation strategies
- Fallback to cached data
- Retry policies with exponential backoff
- User notification patterns

### 4. Performance Optimization
- Tool call batching
- Result caching strategies
- Lazy evaluation patterns
- Preemptive data fetching

---

## Tool Routing Matrix

### Direct Tool Mapping (Single Operations)

| User Intent | Tool Called | Parameters | Example |
|-------------|-------------|------------|---------|
| Add task | \`add_task\` | title, description, priority, tags, due_date | "Add buy milk to my tasks" |
| List all tasks | \`list_tasks\` | (no filters) | "Show my tasks" |
| List filtered | \`list_tasks\` | status, priority, tags, search, limit | "Show high priority pending tasks" |
| Complete task | \`complete_task\` | task_id | "Mark task 5 as done" |
| Delete task | \`delete_task\` | task_id | "Delete task 3" |
| Update task | \`update_task\` | task_id, fields | "Change task 2 priority to high" |

**Routing Logic**:
\`\`\`python
def route_simple_intent(intent: str, entities: dict) -> ToolCall:
    """Direct 1:1 mapping of intent to tool"""
    routing_map = {
        "add_task": lambda e: ToolCall("add_task", extract_task_params(e)),
        "list_tasks": lambda e: ToolCall("list_tasks", extract_filters(e)),
        "complete_task": lambda e: ToolCall("complete_task", {"task_id": e["task_id"]}),
        "delete_task": lambda e: ToolCall("delete_task", {"task_id": e["task_id"]}),
    }
    return routing_map[intent](entities)
\`\`\`

---

### Complex Multi-Step Orchestration

| User Intent | Tool Sequence | Orchestration Pattern | Example |
|-------------|---------------|----------------------|---------|
| Complete all high priority | 1. \`list_tasks(priority=high, status=pending)\`<br>2. \`complete_task(id)\` for each | Sequential Loop | "Complete all high priority tasks" |
| Show overdue then complete highest | 1. \`list_tasks(overdue=true)\`<br>2. Sort by priority<br>3. \`complete_task(id)\` | Sequential Chain | "Show overdue, complete highest priority" |
| Add multiple tasks | Multiple \`add_task\` calls | Parallel Batch | "Add buy milk, finish report, and call dentist" |
| Delete completed tasks | 1. \`list_tasks(status=completed)\`<br>2. \`delete_task(id)\` for each | Sequential Loop | "Delete all completed tasks" |
| Prioritize urgent | 1. \`list_tasks(tags=urgent)\`<br>2. \`update_task(id, priority=high)\` for each | Sequential Loop | "Set all urgent tasks to high priority" |

---

## Orchestration Patterns

### Pattern 1: Sequential Chain

**Use Case**: Operations where output of one tool feeds into the next

**Example**: "Show overdue tasks and complete the highest priority one"

\`\`\`python
# Pattern: A → B → C (strict sequential dependency)
async def sequential_chain_pattern(user_request: str):
    # Step 1: Fetch data
    result_a = await call_tool("list_tasks", {
        "due_date": f"<{datetime.now().isoformat()}",
        "status": "pending"
    })

    # Step 2: Transform/filter (client-side logic)
    highest_priority = max(
        result_a["tasks"],
        key=lambda t: priority_score(t["priority"])
    )

    # Step 3: Act on result
    result_c = await call_tool("complete_task", {
        "task_id": highest_priority["id"]
    })

    return {
        "overdue_tasks": result_a["tasks"],
        "completed_task": result_c
    }
\`\`\`

**Characteristics**:
- Each step depends on previous step's output
- Failure at any step aborts the chain
- Total latency = sum of all tool latencies
- No parallelization possible

---

### Pattern 2: Parallel Batch

**Use Case**: Multiple independent operations that can run concurrently

**Example**: "Add buy milk, finish report, and call dentist to my tasks"

\`\`\`python
# Pattern: [A, B, C] → Execute all concurrently
async def parallel_batch_pattern(tasks_to_add: List[dict]):
    # Create multiple tool calls
    tool_calls = [
        ToolCall("add_task", task_data)
        for task_data in tasks_to_add
    ]

    # Execute all in parallel
    results = await asyncio.gather(*[
        call_tool(tc.name, tc.params)
        for tc in tool_calls
    ])

    return {
        "created_tasks": results,
        "total": len(results)
    }
\`\`\`

**Characteristics**:
- Operations are independent
- Failure of one doesn't affect others
- Total latency = max(individual latencies)
- Significant performance improvement

---

### Pattern 3: Fan-Out/Fan-In

**Use Case**: Fetch data, process in parallel, aggregate results

**Example**: "Complete all high priority tasks"

\`\`\`python
# Pattern: Fetch → [Process1, Process2, ...] → Aggregate
async def fan_out_fan_in_pattern():
    # Fan-out: Single fetch
    tasks_result = await call_tool("list_tasks", {
        "priority": "high",
        "status": "pending"
    })

    # Process: Parallel operations
    complete_results = await asyncio.gather(*[
        call_tool("complete_task", {"task_id": task["id"]})
        for task in tasks_result["tasks"]
    ])

    # Fan-in: Aggregate results
    successful = [r for r in complete_results if r.get("status") == "completed"]
    failed = [r for r in complete_results if r.get("error")]

    return {
        "total": len(tasks_result["tasks"]),
        "completed": len(successful),
        "failed": len(failed)
    }
\`\`\`

**Characteristics**:
- Single initial fetch
- Multiple parallel operations on fetched data
- Aggregation of results
- Handles partial failures gracefully

---

## Error Recovery Strategies

### Strategy 1: Graceful Degradation

**Use Case**: Provide partial results when tool fails

\`\`\`python
async def list_tasks_with_degradation():
    try:
        # Try primary data source (MCP tool)
        tasks = await call_tool("list_tasks", {})
        return tasks

    except ToolError as e:
        error_type = classify_error(e)

        if error_type in [ToolErrorType.NETWORK_TIMEOUT, ToolErrorType.SERVER_ERROR]:
            # Fallback: Use cached data
            cached_tasks = get_cached_tasks()
            return {
                "tasks": cached_tasks,
                "source": "cache",
                "warning": "Using cached data due to server issues"
            }
        else:
            # Non-recoverable
            raise
\`\`\`

---

## Performance Optimization

### Technique 1: Result Caching

\`\`\`python
class ToolResultCache:
    def __init__(self):
        self.cache = {}
        self.ttl = {}  # Time-to-live

    async def list_tasks_cached(self, filters: dict):
        # Check cache first
        cached = self.get_cached("list_tasks", filters, ttl_seconds=30)
        if cached:
            return cached

        # Fetch from tool
        result = await call_tool("list_tasks", filters)

        # Cache for 30 seconds
        self.set_cached("list_tasks", filters, result, ttl_seconds=30)

        return result
\`\`\`

---

## Examples

### Example 1: Single Tool Call

**User Input**: "Add buy milk to my tasks"

**Processing**:
\`\`\`python
# Intent classification
intent = classify_intent("Add buy milk to my tasks")
# Result: "add_task"

# Entity extraction
entities = extract_entities("Add buy milk to my tasks")
# Result: {"title": "buy milk"}

# Tool routing (direct)
tool_call = route_simple_intent(intent, entities)
# Result: ToolCall("add_task", {"title": "buy milk"})

# Execution
result = await call_tool(tool_call.name, tool_call.params)
# Result: {"task_id": 5, "status": "created"}

# Response generation
response = f"I've added '{entities['title']}' to your tasks. (Task ID: {result['task_id']})"
\`\`\`

---

### Example 2: Complex Multi-Step

**User Input**: "Complete all high priority tasks"

**Processing**:
\`\`\`python
# Intent classification
intent = classify_intent("Complete all high priority tasks")
# Result: "complete_all_filtered"

# Entity extraction
entities = extract_entities("Complete all high priority tasks")
# Result: {"priority": "high"}

# Tool orchestration (complex)
async def execute_complex_intent():
    # Step 1: Fetch tasks
    tasks_result = await call_tool("list_tasks", {
        "priority": "high",
        "status": "pending"
    })

    if tasks_result["total"] == 0:
        return {"message": "No high priority pending tasks found"}

    # Step 2: Complete in parallel (fan-out/fan-in pattern)
    complete_results = await asyncio.gather(*[
        call_tool("complete_task", {"task_id": task["id"]})
        for task in tasks_result["tasks"]
    ], return_exceptions=True)

    # Step 3: Aggregate results
    successful = [r for r in complete_results if not isinstance(r, Exception)]
    failed = [r for r in complete_results if isinstance(r, Exception)]

    return {
        "total": tasks_result["total"],
        "completed": len(successful),
        "failed": len(failed)
    }

# Execute
result = await execute_complex_intent()

# Response generation
response = f"Completed {result['completed']} out of {result['total']} high priority tasks."
if result['failed'] > 0:
    response += f" {result['failed']} tasks failed to complete."
\`\`\`

---

## Related Agents

- **AI Chatbot Agent** (\`.claude/agents/ai-chatbot.md\`): Implements tool orchestration patterns
- **Spec Architect Agent** (\`.claude/agents/spec-architect.md\`): Designs tool orchestration logic
- **Backend / FastAPI Pro Agent** (\`.claude/agents/backend-fastapi.md\`): Provides MCP tools to orchestrate

---

## Skill Invocation

**For Tool Orchestration Design**:
\`\`\`
Act as Spec Architect Agent and design tool orchestration for the AI chatbot
\`\`\`

**For Implementation**:
\`\`\`
Act as AI Chatbot Agent and implement tool orchestration patterns for task management
\`\`\`

---

## Success Metrics

A well-designed tool orchestration system has:
- ✅ Clear routing matrix (simple → direct, complex → orchestration)
- ✅ Efficient orchestration patterns (sequential, parallel, conditional)
- ✅ Robust error recovery (graceful degradation, retries, compensation)
- ✅ Performance optimizations (caching, batching, preemptive fetching)
- ✅ Clear decision trees for tool selection and error handling
- ✅ Comprehensive code examples for each pattern
- ✅ Integration guide for AI agents

---

## Validation Checklist

Before finalizing tool orchestration design:

### Routing Checklist
- [ ] All MCP tools have direct routing rules
- [ ] Complex intents mapped to orchestration patterns
- [ ] Decision tree documented
- [ ] Entity extraction logic specified

### Orchestration Checklist
- [ ] Sequential patterns for dependent operations
- [ ] Parallel patterns for independent operations
- [ ] Fan-out/fan-in for batch operations
- [ ] Conditional branching for runtime decisions
- [ ] Loop patterns for bulk actions

### Error Recovery Checklist
- [ ] Error classification taxonomy defined
- [ ] Graceful degradation strategy for each error type
- [ ] Retry policies with backoff
- [ ] Circuit breaker for cascade failure prevention
- [ ] Compensation logic for multi-step failures

### Performance Checklist
- [ ] Caching strategy defined (what, TTL, invalidation)
- [ ] Batching strategy for high-volume operations
- [ ] Preemptive fetching for common workflows
- [ ] Lazy evaluation where applicable

---

## Revision History

| **Version** | **Date**       | **Changes**                                      |
|-------------|----------------|--------------------------------------------------|
| 1.0.0       | 2025-12-25     | Initial skill documentation                      |

---

## References

- **Constitution**: \`.specify/memory/constitution.md\` (Principle VI: Performance, Principle VII: Security)
- **AI Chatbot Agent**: \`.claude/agents/ai-chatbot.md\`
- **MCP Tools**: \`specs/api/mcp-tools.md\`
- **API Specification**: \`specs/api/rest-endpoints.md\`
- **MCP Documentation**: https://modelcontextprotocol.io/

---

**Status**: Ready for Phase III implementation
**Activation**: See skill invocation section above
