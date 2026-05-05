"""
Gemini Agent — uses gemini-2.5-flash with function calling
to manage todos via MCP tools. Fully stateless per request.
"""

import os
import json
from typing import Optional
import google.generativeai as genai
from sqlmodel import Session

from mcp_server.tools import GEMINI_TOOLS, TOOL_REGISTRY

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

SYSTEM_PROMPT = """You are a helpful, friendly Todo assistant. You help users manage their task list through natural conversation.

You have access to these tools:
- add_task: Create a new task
- list_tasks: Show tasks (all, pending, or completed)  
- complete_task: Mark a task as done
- delete_task: Remove a task
- update_task: Edit a task's title, description, or priority

Guidelines:
- Always be friendly and confirm actions clearly (e.g., "✅ Done! I've added 'Buy groceries' to your list.")
- When listing tasks, format them neatly with their ID, title, status, and priority.
- If a user mentions "urgent", "important", or "asap", set priority to "high".
- If a user says "delete the meeting task" or similar (no ID), first call list_tasks to find the right task.
- Handle errors gracefully — if a task ID doesn't exist, say so kindly.
- Support Urdu language if the user writes in Urdu.
- Keep responses concise and action-focused."""


def build_tool_config():
    """Build Gemini tool declarations from our tool specs."""
    return genai.protos.Tool(
        function_declarations=[
            genai.protos.FunctionDeclaration(
                name=t["name"],
                description=t["description"],
                parameters=genai.protos.Schema(
                    type=genai.protos.Type.OBJECT,
                    properties={
                        k: genai.protos.Schema(
                            type=_map_type(v.get("type", "string")),
                            description=v.get("description", ""),
                            enum=v.get("enum", []) or [],
                        )
                        for k, v in t["parameters"].get("properties", {}).items()
                    },
                    required=t["parameters"].get("required", []),
                ),
            )
            for t in GEMINI_TOOLS
        ]
    )


def _map_type(type_str: str):
    return {
        "string": genai.protos.Type.STRING,
        "integer": genai.protos.Type.INTEGER,
        "number": genai.protos.Type.NUMBER,
        "boolean": genai.protos.Type.BOOLEAN,
        "array": genai.protos.Type.ARRAY,
        "object": genai.protos.Type.OBJECT,
    }.get(type_str, genai.protos.Type.STRING)


def run_agent(
    session: Session,
    user_id: str,
    history: list[dict],
    new_message: str,
) -> tuple[str, list[str]]:
    """
    Run the Gemini agent with the conversation history + new message.
    Returns (assistant_response_text, list_of_tool_calls_made).
    This function is STATELESS — all state comes in via history parameter.
    """
    model = genai.GenerativeModel(
        model_name=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        system_instruction=SYSTEM_PROMPT,
        tools=[build_tool_config()],
    )

    # Build Gemini history format from our DB history
    gemini_history = []
    for msg in history:
        role = "user" if msg["role"] == "user" else "model"
        gemini_history.append({"role": role, "parts": [msg["content"]]})

    chat = model.start_chat(history=gemini_history)

    # Send the new user message
    response = chat.send_message(new_message)

    tool_calls_made = []
    final_response = ""

    # Agentic loop — handle tool calls until model returns text
    while True:
        candidate = response.candidates[0]
        parts = candidate.content.parts

        # Check for function calls
        function_calls = [p for p in parts if hasattr(p, "function_call") and p.function_call.name]

        if not function_calls:
            # No more tool calls — extract final text response
            final_response = "".join(
                p.text for p in parts if hasattr(p, "text") and p.text
            )
            break

        # Execute each tool call
        tool_results = []
        for part in function_calls:
            fc = part.function_call
            tool_name = fc.name
            tool_args = dict(fc.args)

            tool_calls_made.append(f"{tool_name}({json.dumps(tool_args)})")

            # Call the actual tool function with session + user_id injected
            tool_fn = TOOL_REGISTRY.get(tool_name)
            if tool_fn:
                result = tool_fn(session=session, user_id=user_id, **tool_args)
            else:
                result = {"error": f"Unknown tool: {tool_name}"}

            tool_results.append(
                genai.protos.Part(
                    function_response=genai.protos.FunctionResponse(
                        name=tool_name,
                        response={"result": result},
                    )
                )
            )

        # Send tool results back to the model
        response = chat.send_message(tool_results)

    return final_response, tool_calls_made
