# Natural Language Understanding (NLU) Design Skill

**Purpose**: Design natural language understanding for Phase III ChatKit + MCP tools with intent classification, entity extraction, and conversational AI patterns for Evolution of Todo hackathon

**Owner**: AI Chatbot Agent + Backend Pro Agent

**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

The **NLU Design Skill** enables conversational task management:
- Design intent classification for task operations (add, list, update, delete, complete)
- Extract entities from natural language (task titles, priorities, due dates)
- Handle conversation context and multi-turn dialogs
- Define fallback handling and clarification prompts
- Create MCP tool parameter mapping
- Generate NLU specifications for implementation

This skill enables users to manage tasks naturally: "Remind me to call mom on Friday" instead of structured commands.

---

## Skill Components

### 1. Intent Classification (Task Domain)

**Core Intents**:

**add_task**:
- Variations: "Add task", "Create todo", "Remind me to", "I need to", "Don't forget"
- MCP Tool: `add_task`
- Required Entities: task_title
- Optional Entities: priority, due_date, description

**list_tasks**:
- Variations: "Show tasks", "What's on my list", "List todos", "What do I have to do"
- MCP Tool: `list_tasks`
- Optional Entities: status_filter, priority_filter, time_filter

**update_task**:
- Variations: "Change task", "Update task", "Modify task", "Edit task"
- MCP Tool: `update_task`
- Required Entities: task_reference (ID or title)
- Optional Entities: new_priority, new_status, new_due_date

**complete_task**:
- Variations: "Mark done", "Complete task", "Finish task", "I finished", "Check off"
- MCP Tool: `update_task` (status="completed")
- Required Entities: task_reference

**delete_task**:
- Variations: "Delete task", "Remove task", "Cancel task", "Forget about"
- MCP Tool: `delete_task`
- Required Entities: task_reference

**get_task**:
- Variations: "Show task details", "Tell me about task", "What's task X"
- MCP Tool: `get_task`
- Required Entities: task_reference

### 2. Entity Extraction

**Entity Types**:

**task_title** (String):
- Examples: "buy milk", "call mom", "finish report"
- Extraction: Everything after trigger words ("add", "remind me to")
- Validation: 1-500 characters

**priority** (Enum):
- Values: "high", "medium", "low"
- Synonyms:
  - High: "urgent", "important", "ASAP", "critical", "HIGH", "!!!"
  - Medium: "normal", "regular", "MEDIUM"
  - Low: "low", "minor", "when possible", "LOW"
- Default: "medium"

**due_date** (Date):
- Formats:
  - Relative: "today", "tomorrow", "next week", "in 3 days"
  - Specific: "Friday", "Dec 25", "2025-12-25"
  - Time: "5pm", "at 2:30pm"
- Parsing: Use dateparser library or Claude API
- Output: ISO 8601 format

**status_filter** (Enum):
- Values: "pending", "completed"
- Synonyms:
  - Pending: "incomplete", "active", "open", "todo"
  - Completed: "done", "finished", "checked off"

**task_reference** (ID or Title):
- ID: "task 1", "task #5", "number 3"
- Title: "the milk task", "call mom task"
- Fuzzy matching: "the one about milk" → search by title

### 3. Conversation Context

**Multi-Turn Dialogs**:

**Turn 1** (User): "Add task buy milk"
**Turn 2** (AI): "Got it! I've added 'Buy milk' to your list. What priority should it be?"
**Turn 3** (User): "High"
**Turn 4** (AI): "✓ Set to high priority. Anything else?"

**Context Tracking**:
- Last mentioned task (for "make it high priority")
- Last action (for "undo that")
- Pending clarifications (priority, due date)

**Example Context State**:
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": 123,
  "last_task_id": 456,
  "last_intent": "add_task",
  "pending_clarification": {
    "task_id": 456,
    "missing": ["priority"],
    "prompt": "What priority should this task be?"
  },
  "history": [
    {"role": "user", "content": "Add task buy milk"},
    {"role": "assistant", "content": "Got it! I've added 'Buy milk'..."}
  ]
}
```

### 4. Fallback Handling

**Ambiguous Input**:
```
User: "the task"
AI: "Which task? You have 5 tasks. Can you be more specific with a task ID or title?"
```

**Missing Entities**:
```
User: "Add task"
AI: "What would you like to add?"

User: "Call mom"
AI: "✓ Added 'Call mom' to your tasks. When is it due?"
```

**Out of Scope**:
```
User: "What's the weather?"
AI: "I can help you manage tasks. Try 'add task', 'list tasks', or 'complete task'."
```

**Tool Errors**:
```
User: "Complete task 999"
AI: "I couldn't find task 999. Use 'list tasks' to see your task IDs."
```

---

## Skill Instructions

### Step 1: Define Intent Taxonomy

Create comprehensive intent classification.

**Template**:
```markdown
## Intent: [intent_name]

**MCP Tool**: [tool_name]
**Category**: [CRUD | Query | Management]

### Trigger Phrases
- [Phrase 1]
- [Phrase 2]
- [Phrase 3]

### Required Entities
- [Entity 1]: [Type] - [Description]
- [Entity 2]: [Type] - [Description]

### Optional Entities
- [Entity 1]: [Type] - [Default value]

### Examples
- User: "[Example input]"
- Intent: [intent_name]
- Entities: { [entity]: [value] }
- Tool Call: [tool_name]([params])

### Clarification Prompts
- Missing [entity]: "[Clarification question]"
- Ambiguous [entity]: "[Clarification question]"
```

---

#### Example: add_task Intent

```markdown
## Intent: add_task

**MCP Tool**: `add_task`
**Category**: CRUD (Create)
**Confidence Threshold**: 0.7

### Trigger Phrases
- "Add task [title]"
- "Create todo [title]"
- "Remind me to [title]"
- "I need to [title]"
- "Don't forget [title]"
- "New task [title]"
- "Add [title] to my list"

### Required Entities
- **task_title** (String): Task description (1-500 chars)

### Optional Entities
- **priority** (Enum): high | medium | low (default: medium)
- **due_date** (Date): When task is due (default: null)
- **description** (String): Additional details (default: null)

### Examples

**Example 1**: Simple task
- User: "Add task buy milk"
- Intent: add_task
- Entities: { task_title: "buy milk" }
- Tool Call: `add_task(title="buy milk", priority="medium")`
- Response: "✓ Added 'Buy milk' to your tasks."

**Example 2**: With priority
- User: "Remind me to call mom HIGH priority"
- Intent: add_task
- Entities: { task_title: "call mom", priority: "high" }
- Tool Call: `add_task(title="call mom", priority="high")`
- Response: "✓ Added 'Call mom' as high priority."

**Example 3**: With due date
- User: "Add task submit taxes due April 15"
- Intent: add_task
- Entities: { task_title: "submit taxes", due_date: "2025-04-15" }
- Tool Call: `add_task(title="submit taxes", due_date="2025-04-15T00:00:00Z")`
- Response: "✓ Added 'Submit taxes' with due date April 15, 2025."

**Example 4**: Complex with all entities
- User: "I need to finish the report by Friday, high priority"
- Intent: add_task
- Entities: {
    task_title: "finish the report",
    priority: "high",
    due_date: "2025-12-27"  # Parsed from "Friday"
  }
- Tool Call: `add_task(title="finish the report", priority="high", due_date="2025-12-27T00:00:00Z")`
- Response: "✓ Added 'Finish the report' as high priority, due Friday, December 27."

### Clarification Prompts

**Missing task_title**:
- User: "Add task"
- AI: "What would you like to add?"
- User: "Buy milk"
- AI: [Proceed with add_task]

**Ambiguous priority**:
- User: "Add task buy milk important"
- AI: "Is this high priority or just important? (High priority = urgent and critical)"
- User: "High"
- AI: [Proceed with priority="high"]

**Invalid due date**:
- User: "Add task buy milk due yesterday"
- AI: "Due dates must be in the future. When should this be due?"
- User: "Tomorrow"
- AI: [Proceed with due_date=tomorrow]

### Edge Cases

**Multiple tasks in one input**:
- User: "Add buy milk, call mom, and finish report"
- AI: "I'll add three tasks for you. Should they all be the same priority?"
- [Create three separate tasks]

**Task title extraction from context**:
- User: "Remind me to buy milk and eggs from the store on my way home"
- Entities: { task_title: "buy milk and eggs from the store on my way home" }
- (Extract full context, not just "buy milk")
```

---

#### Example: list_tasks Intent

```markdown
## Intent: list_tasks

**MCP Tool**: `list_tasks`
**Category**: Query
**Confidence Threshold**: 0.8

### Trigger Phrases
- "Show tasks"
- "List tasks"
- "What's on my list"
- "What do I have to do"
- "Show my todos"
- "What's pending"
- "What's completed"

### Required Entities
- None

### Optional Entities
- **status_filter** (Enum): pending | completed (default: all)
- **priority_filter** (Enum): high | medium | low (default: all)
- **time_filter** (Enum): today | tomorrow | this_week | overdue (default: all)
- **limit** (Integer): Max tasks to show (default: 10)

### Examples

**Example 1**: All tasks
- User: "Show my tasks"
- Intent: list_tasks
- Entities: {}
- Tool Call: `list_tasks()`
- Response: "You have 5 tasks:\n1. Buy milk (pending, medium)\n2. Call mom (pending, high)\n..."

**Example 2**: Filter by status
- User: "What's pending?"
- Intent: list_tasks
- Entities: { status_filter: "pending" }
- Tool Call: `list_tasks(status="pending")`
- Response: "You have 3 pending tasks:\n1. Buy milk\n2. Call mom\n3. Finish report"

**Example 3**: Filter by priority
- User: "Show high priority tasks"
- Intent: list_tasks
- Entities: { priority_filter: "high" }
- Tool Call: `list_tasks(priority="high")`
- Response: "You have 2 high priority tasks:\n1. Call mom\n2. Submit taxes"

**Example 4**: Time-based filter
- User: "What's due tomorrow?"
- Intent: list_tasks
- Entities: { time_filter: "tomorrow" }
- Tool Call: `list_tasks()` + filter by due_date in application
- Response: "You have 1 task due tomorrow:\n1. Submit taxes (high priority)"

**Example 5**: Complex filter
- User: "Show pending high priority tasks"
- Intent: list_tasks
- Entities: { status_filter: "pending", priority_filter: "high" }
- Tool Call: `list_tasks(status="pending", priority="high")`
- Response: "You have 2 pending high priority tasks:\n1. Call mom\n2. Submit taxes"

### Clarification Prompts

**Empty result**:
- Tool returns: []
- AI: "You don't have any [filtered] tasks. Would you like to add one?"

**Too many results**:
- Tool returns: 50 tasks
- AI: "You have 50 tasks. Would you like to filter by priority or status?"

### Response Formatting

**Table Format**:
```
You have 5 tasks:
┌────┬─────────────┬─────────┬──────────┐
│ ID │ Title       │ Status  │ Priority │
├────┼─────────────┼─────────┼──────────┤
│ 1  │ Buy milk    │ Pending │ Medium   │
│ 2  │ Call mom    │ Pending │ High     │
│ 3  │ Finish rep… │ Pending │ High     │
└────┴─────────────┴─────────┴──────────┘
```

**List Format** (Conversational):
```
You have 3 pending tasks:
1. 🔴 Call mom (high priority, due tomorrow)
2. 🟡 Buy milk (medium priority)
3. 🟡 Finish report (medium priority, due Friday)
```
```

---

### Step 2: Design Entity Extraction

Create entity recognition specifications.

**Entity Template**:
```markdown
## Entity: [entity_name]

**Type**: [String | Integer | Date | Enum]
**Required**: [Yes | No]
**Default**: [Value or null]

### Extraction Patterns
- Pattern 1: [Regex or example]
- Pattern 2: [Regex or example]

### Synonyms (for Enum)
- [Value 1]: [Synonym 1], [Synonym 2]
- [Value 2]: [Synonym 3], [Synonym 4]

### Validation
- [Constraint 1]
- [Constraint 2]

### Examples
- Input: "[Example input]"
- Extracted: { [entity_name]: [value] }
```

---

#### Example: priority Entity

```markdown
## Entity: priority

**Type**: Enum
**Required**: No
**Default**: "medium"
**Values**: "high" | "medium" | "low"

### Extraction Patterns
- Explicit: "HIGH priority", "medium priority", "low priority"
- Synonyms: "urgent" (high), "important" (high), "when possible" (low)
- Markers: "!!!" (high), "!" (medium), "(low)" (low)
- Position: Usually after task title or at end of sentence

### Synonyms
- **high**: urgent, important, ASAP, critical, top priority, must do, !!!, 🔴
- **medium**: normal, regular, standard, !, 🟡
- **low**: low, minor, when possible, someday, 🟢

### Validation
- Must be one of: high, medium, low
- Case-insensitive matching
- Default to medium if not specified

### Examples

**Example 1**: Explicit
- Input: "Add task buy milk HIGH priority"
- Extracted: { priority: "high" }

**Example 2**: Synonym
- Input: "Remind me to call mom, it's urgent"
- Extracted: { priority: "high" }

**Example 3**: Marker
- Input: "Add task finish report!!!"
- Extracted: { priority: "high" }

**Example 4**: Positional
- Input: "Add task buy milk low"
- Extracted: { priority: "low" }

**Example 5**: Default
- Input: "Add task buy milk"
- Extracted: { priority: "medium" } (default)

### Ambiguity Handling
- Input: "Add important task buy milk"
- Ambiguous: Does "important" mean high priority or just emphasis?
- Resolution: Default to high priority (better to assume urgency)
```

---

#### Example: due_date Entity

```markdown
## Entity: due_date

**Type**: Date (ISO 8601)
**Required**: No
**Default**: null

### Extraction Patterns

**Relative Dates**:
- "today" → 2025-12-24T23:59:59Z
- "tomorrow" → 2025-12-25T23:59:59Z
- "in 3 days" → 2025-12-27T23:59:59Z
- "next week" → 2025-12-31T23:59:59Z (end of next week)
- "next Monday" → 2025-12-30T23:59:59Z

**Specific Dates**:
- "Friday" → Next Friday (2025-12-27T23:59:59Z)
- "Dec 25" → 2025-12-25T23:59:59Z
- "12/25" → 2025-12-25T23:59:59Z
- "2025-04-15" → 2025-04-15T23:59:59Z

**With Time**:
- "tomorrow at 5pm" → 2025-12-25T17:00:00Z
- "Friday 2:30pm" → 2025-12-27T14:30:00Z

### Parsing Library
- Use: dateparser (Python) or Chrono (JavaScript)
- Timezone: User's timezone (from profile or browser)
- Fallback: UTC if timezone unknown

### Validation
- Due date must be in the future
- If past date detected, ask for clarification

### Examples

**Example 1**: Relative
- Input: "Add task buy milk due tomorrow"
- Extracted: { due_date: "2025-12-25T23:59:59Z" }

**Example 2**: Specific day
- Input: "Remind me to call mom on Friday"
- Extracted: { due_date: "2025-12-27T23:59:59Z" }

**Example 3**: With time
- Input: "Submit report by Friday 5pm"
- Extracted: { due_date: "2025-12-27T17:00:00Z" }

**Example 4**: Natural language
- Input: "Buy milk in 3 days"
- Extracted: { due_date: "2025-12-27T23:59:59Z" }

### Ambiguity Handling
- Input: "Add task call mom Monday"
- Ambiguous: This Monday (past) or next Monday (future)?
- Resolution: Always assume next occurrence (next Monday)

### Clarification Prompts
- Input: "Add task buy milk due yesterday"
- AI: "Due dates must be in the future. When should this be due?"
```

---

### Step 3: Design Conversation Flows

Create multi-turn dialog specifications.

**Flow Template**:
```markdown
## Conversation Flow: [flow_name]

**Scenario**: [Description]
**Turns**: [Number of turns]

### Dialog
1. **User**: [User input]
2. **AI**: [AI response]
   - Intent: [intent_name]
   - Tool Call: [tool_call]
   - Entities: { [extracted entities] }
3. **User**: [User response]
4. **AI**: [AI response]
   - Context: [Used previous context]

### Success Criteria
- [Criterion 1]
- [Criterion 2]
```

---

#### Example: Task Creation with Clarification

```markdown
## Conversation Flow: add_task_with_clarification

**Scenario**: User creates task but doesn't specify priority or due date
**Turns**: 4-6 turns

### Dialog

**Turn 1**:
- User: "Add task buy milk"
- AI Intent: add_task
- Entities: { task_title: "buy milk" }
- Tool Call: `add_task(title="buy milk", priority="medium")`
- Tool Result: { id: 1, title: "buy milk", status: "pending", priority: "medium" }
- AI Response: "✓ Added 'Buy milk' to your tasks. When is it due?"

**Turn 2**:
- User: "Tomorrow"
- AI Intent: update_task (from context)
- Entities: { task_reference: 1, due_date: "2025-12-25" }
- Context: { last_task_id: 1, pending_clarification: "due_date" }
- Tool Call: `update_task(task_id=1, due_date="2025-12-25T23:59:59Z")`
- Tool Result: { id: 1, title: "buy milk", due_date: "2025-12-25T23:59:59Z" }
- AI Response: "✓ Set due date to tomorrow (Dec 25). What priority should it be?"

**Turn 3**:
- User: "It's pretty important"
- AI Intent: update_task (from context)
- Entities: { task_reference: 1, priority: "high" }
- Context: { last_task_id: 1, pending_clarification: "priority" }
- Tool Call: `update_task(task_id=1, priority="high")`
- Tool Result: { id: 1, title: "buy milk", priority: "high" }
- AI Response: "✓ Set to high priority. Your task is ready:\n  🔴 Buy milk (due tomorrow)"

**Turn 4**:
- User: "Thanks!"
- AI Intent: acknowledge
- AI Response: "You're welcome! Anything else I can help with?"

### Success Criteria
- Task created with all details
- User feels guided (not interrogated)
- Natural conversation flow
- Context maintained across turns
```

---

### Step 4: Design Fallback & Error Handling

**Fallback Strategy**:

**Low Confidence Intent**:
```
User: "milk"
AI Confidence: 0.3 (below 0.7 threshold)
AI Response: "I'm not sure what you'd like to do. Did you mean:
  • Add task 'milk'
  • Search for tasks with 'milk'
  • Something else?"
```

**Out of Scope**:
```
User: "What's the weather today?"
AI: "I specialize in task management. I can help you:
  • Add tasks
  • List tasks
  • Complete tasks
  • Delete tasks

  Would you like to manage your tasks?"
```

**Tool Execution Error**:
```
User: "Complete task 999"
Tool Call: delete_task(task_id=999)
Tool Error: 404 Not Found
AI Response: "I couldn't find task 999. Would you like to see your task list?

  (Tip: Use 'list tasks' to see all task IDs)"
```

**Conversation Context Lost**:
```
User: "Make it high priority"
Context: { last_task_id: null }  # No recent task
AI Response: "Which task would you like to set as high priority? Please provide the task ID or title."
```

---

### Step 5: Generate NLU Specifications

**specs/ai/nlu-intents.md**:
```markdown
# NLU Intent Classification - Evolution of Todo

**Phase**: III (AI Chatbot)
**NLU Engine**: Claude API (native understanding)
**Confidence Threshold**: 0.7

---

## Intent Catalog

| Intent | Tool | Required Entities | Example |
|--------|------|-------------------|---------|
| add_task | add_task | task_title | "Add task buy milk" |
| list_tasks | list_tasks | None | "Show my tasks" |
| complete_task | update_task | task_reference | "Mark task 1 done" |
| delete_task | delete_task | task_reference | "Delete task 2" |
| update_task | update_task | task_reference + field | "Change task 1 priority to high" |
| get_task | get_task | task_reference | "Show task 1 details" |

---

[Include full intent specifications from Step 1]
```

**specs/ai/entities.md**:
```markdown
# Entity Extraction - Evolution of Todo

**Phase**: III (AI Chatbot)
**Extraction Method**: Claude API + dateparser
**Validation**: Pydantic schemas

---

## Entity Catalog

| Entity | Type | Required | Default | Example |
|--------|------|----------|---------|---------|
| task_title | String | Yes (add_task) | N/A | "buy milk" |
| priority | Enum | No | medium | "high" |
| due_date | Date | No | null | "2025-12-25" |
| status_filter | Enum | No | all | "pending" |
| task_reference | ID/String | Yes (update/delete) | N/A | "task 1" or "milk" |

---

[Include full entity specifications from Step 2]
```

**specs/ai/conversation-flows.md**:
```markdown
# Conversation Flows - Evolution of Todo

**Phase**: III (AI Chatbot)
**Pattern**: Multi-turn dialogs with context

---

## Flow Catalog

| Flow | Turns | Complexity | Example |
|------|-------|------------|---------|
| Simple Task Add | 2 | Low | "Add task" → "Buy milk" → Done |
| Task with Details | 4-6 | Medium | Add → Title → Priority → Due date |
| Batch Operations | 3-5 | Medium | "Complete tasks 1, 2, 3" |
| Search & Update | 5-7 | High | "Find milk task" → Select → Update |

---

[Include full conversation flows from Step 3]
```

---

## Related Agents

- **AI Chatbot Agent**: Primary owner, implements NLU with Claude API
- **Backend Pro Agent**: Implements MCP tool handlers
- **Frontend UI/UX Agent**: Designs ChatKit conversation UI
- **Testing & QA Agent**: Tests intent accuracy and entity extraction

---

## Success Metrics

✅ **Intent Accuracy**: 95%+ correct intent classification
✅ **Entity Extraction**: 90%+ correct entity values
✅ **Conversation Flow**: Natural multi-turn dialogs
✅ **Error Handling**: Graceful fallbacks for low confidence
✅ **Clarification**: Helpful prompts for missing entities
✅ **User Satisfaction**: Intuitive natural language interface
✅ **Tool Success**: 98%+ successful tool executions

---

## Best Practices

### Do's ✅

- **Use Claude's Native NLU**: Claude API handles intent + entities
- **Extract Full Context**: Include surrounding words in task titles
- **Handle Synonyms**: Map variations to canonical values
- **Validate Dates**: Ensure future dates for due_date
- **Provide Fallbacks**: Clear error messages for failures
- **Maintain Context**: Remember last task for follow-up commands
- **Ask for Clarification**: When entities missing or ambiguous
- **Format Responses**: Use tables or lists for readability

### Don'ts ❌

- **Don't Over-Engineer**: Claude handles most NLU automatically
- **Don't Require Exact Syntax**: Accept natural variations
- **Don't Ignore Context**: Use conversation history
- **Don't Skip Validation**: Validate extracted entities
- **Don't Assume Intent**: Ask when confidence is low
- **Don't Truncate Titles**: Extract full task description
- **Don't Forget Timezone**: Parse dates in user's timezone
- **Don't Expose Errors**: Handle tool errors gracefully

---

## Integration with Other Skills

```
UI Specification (defines ChatKit interface)
  ↓
NLU DESIGN (this skill) ← Intent + entity design
  ↓
Backend Service Design (MCP tool implementation)
  ↓
Code Generation (implements chatbot)
  ↓
Test Design (tests conversation flows)
```

---

## Output Format

When using this skill, generate:

**1. Intent Taxonomy** (add_task, list_tasks, complete_task, etc.)
**2. Entity Specifications** (task_title, priority, due_date, etc.)
**3. Conversation Flows** (multi-turn dialogs with context)
**4. Fallback Strategies** (low confidence, errors, out of scope)
**5. MCP Tool Mapping** (intent → tool → parameters)
**6. Response Templates** (formatted output for users)

Save specifications to:
- `specs/ai/nlu-intents.md` - Intent catalog
- `specs/ai/entities.md` - Entity extraction specs
- `specs/ai/conversation-flows.md` - Dialog patterns
- `specs/ai/fallbacks.md` - Error handling

---

## Implementation Example

**ChatKit Integration**:

```python
"""
NLU Handler - Phase III ChatKit Integration

Uses Claude API for intent classification and entity extraction.
"""

from anthropic import Anthropic
import os
from typing import Dict, Any, List

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

# MCP Tools definition
TOOLS = [
    {
        "name": "add_task",
        "description": "Add a new task to the user's todo list",
        "input_schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Task title (1-500 chars)"},
                "description": {"type": "string", "description": "Task description (optional)"},
                "priority": {"type": "string", "enum": ["high", "medium", "low"]},
                "due_date": {"type": "string", "description": "Due date (ISO 8601)"},
            },
            "required": ["title"],
        },
    },
    {
        "name": "list_tasks",
        "description": "List tasks with optional filters",
        "input_schema": {
            "type": "object",
            "properties": {
                "status": {"type": "string", "enum": ["pending", "completed"]},
                "priority": {"type": "string", "enum": ["high", "medium", "low"]},
                "limit": {"type": "integer", "minimum": 1, "maximum": 100},
            },
        },
    },
    # ... other tools
]


async def process_message(user_message: str, conversation_history: List[Dict]) -> str:
    """
    Process user message with Claude API.

    Args:
        user_message: User's natural language input
        conversation_history: Previous messages in conversation

    Returns:
        AI response with tool calls executed
    """
    # Build messages array
    messages = conversation_history + [
        {"role": "user", "content": user_message}
    ]

    # Call Claude API with tools
    response = client.messages.create(
        model="claude-opus-4-5-20251101",
        max_tokens=1024,
        tools=TOOLS,
        messages=messages,
    )

    # Process tool calls
    if response.stop_reason == "tool_use":
        for block in response.content:
            if block.type == "tool_use":
                tool_name = block.name
                tool_input = block.input

                # Execute MCP tool
                tool_result = await execute_tool(tool_name, tool_input)

                # Continue conversation with tool result
                messages.append({"role": "assistant", "content": response.content})
                messages.append({
                    "role": "user",
                    "content": [{
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": str(tool_result),
                    }],
                })

                # Get final response
                final_response = client.messages.create(
                    model="claude-opus-4-5-20251101",
                    max_tokens=1024,
                    messages=messages,
                )

                return final_response.content[0].text

    # No tool calls needed
    return response.content[0].text
```

---

## References

- **Claude API**: https://docs.anthropic.com/
- **MCP**: https://modelcontextprotocol.io/
- **ChatKit**: (Anthropic ChatKit documentation)
- **dateparser**: https://dateparser.readthedocs.io/
- **Chrono**: https://github.com/wanasit/chrono

---

**Document Version**: 1.0.0
**Created**: 2025-12-24
**Total Examples**: 8 (Intents, entities, conversation flows, fallbacks, Claude integration)
**Coverage**: Phase III (AI Chatbot with Natural Language Understanding)

---

*This NLU design skill is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*
