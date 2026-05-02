#!/usr/bin/env python3
"""MCP server that delegates tasks to Qwen via LM Studio with agentic tool loop."""

import asyncio
import json
import os
import subprocess
import uuid

from openai import OpenAI
from mcp.server.fastmcp import FastMCP, Context

LMSTUDIO_BASE_URL = "http://localhost:1234/v1"
MODEL = "qwen"
TIMEOUT = 120.0
MAX_ITERATIONS = 25

mcp = FastMCP("lmstudio-agent")
client = OpenAI(base_url=LMSTUDIO_BASE_URL, api_key="lm-studio")

# Session state for stepped execution (qwen_start / qwen_continue)
_sessions: dict[str, dict] = {}

SYSTEM_PROMPT = (
    "You are a capable local AI assistant. You have access to filesystem and shell tools. "
    "Use them when needed to complete the task. "
    "When you need results from multiple independent sources (e.g. reading several notes), "
    "call all relevant tools in a single response rather than one at a time.\n\n"
    "INSTALLED CLI TOOLS (confirmed available, use via run_bash):\n"
    "- obsidian: Obsidian vault CLI, installed at /opt/homebrew/bin/obsidian and in PATH.\n"
    "  This is a REAL, working command. Always use it via run_bash when vault access is needed.\n"
    "  Use single quotes for values that contain spaces to avoid JSON encoding issues.\n"
    "  Examples:\n"
    "    obsidian search query='developer advocacy'\n"
    "    obsidian read file='Note Name'\n"
    "    obsidian list\n"
    "  Do NOT skip or refuse obsidian commands due to doubt about installation — it is installed."
)

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "Read the contents of a file",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Absolute or ~ path to the file"}
                },
                "required": ["path"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "write_file",
            "description": "Write content to a file, creating it if it doesn't exist",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Absolute or ~ path to the file"},
                    "content": {"type": "string", "description": "Content to write"}
                },
                "required": ["path", "content"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "run_bash",
            "description": "Run a bash command and return the output",
            "parameters": {
                "type": "object",
                "properties": {
                    "command": {"type": "string", "description": "The bash command to execute"}
                },
                "required": ["command"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_directory",
            "description": "List files in a directory",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Absolute or ~ path to the directory"}
                },
                "required": ["path"]
            }
        }
    }
]


def _tool_preview(name: str, args: dict) -> str:
    if name == "run_bash":
        cmd = args.get("command", "")
        return f"`{cmd[:120]}`" if len(cmd) <= 120 else f"`{cmd[:120]}…`"
    if name in ("read_file", "write_file", "list_directory"):
        return args.get("path", "")
    return ""


def execute_tool(name: str, args: dict) -> str:
    try:
        if name == "read_file":
            path = os.path.expanduser(args["path"])
            with open(path, "r") as f:
                return f.read()
        elif name == "write_file":
            path = os.path.expanduser(args["path"])
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w") as f:
                f.write(args["content"])
            return f"Written to {path}"
        elif name == "run_bash":
            result = subprocess.run(
                args["command"], shell=True, capture_output=True, text=True, timeout=30
            )
            return (result.stdout + result.stderr).strip()
        elif name == "list_directory":
            path = os.path.expanduser(args["path"])
            return "\n".join(os.listdir(path))
        else:
            return f"Unknown tool: {name}"
    except Exception as e:
        return f"Error: {str(e)}"


def _build_messages(task: str, skill: str, context: str) -> list:
    parts = []
    if skill:
        parts.append(f"Use the /{skill} skill for the following task.")
    if context:
        parts.append(f"Context:\n{context}")
    parts.append(task)
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": "\n\n".join(parts)},
    ]


def _jdump(obj: dict) -> str:
    return json.dumps(obj, ensure_ascii=False)


async def _qwen_step(session_id: str) -> str:
    """Run one Qwen inference + tool execution round. Returns JSON status."""
    if session_id not in _sessions:
        return _jdump({"status": "error", "result": f"Unknown session: {session_id}"})

    session = _sessions[session_id]
    messages = session["messages"]
    iteration = session["iteration"]

    if iteration >= MAX_ITERATIONS:
        del _sessions[session_id]
        return _jdump({"status": "error", "result": "Max iterations reached"})

    session["iteration"] += 1

    response = await asyncio.to_thread(
        client.chat.completions.create,
        model=MODEL,
        messages=messages,
        tools=TOOLS,
        tool_choice="auto",
        timeout=TIMEOUT,
    )
    msg = response.choices[0].message

    if not msg.tool_calls:
        if msg.content:
            del _sessions[session_id]
            return _jdump({"status": "done", "result": msg.content})
        # Empty response — nudge Qwen
        messages.append({"role": "assistant", "content": ""})
        messages.append({"role": "user", "content": "Please provide your complete response now."})
        return _jdump({
            "status": "running",
            "session_id": session_id,
            "step": f"iter {iteration + 1}: empty response, nudging",
        })

    # Execute all tool calls Qwen requested
    tool_summaries = []
    messages.append({
        "role": "assistant",
        "content": msg.content or "",
        "tool_calls": [
            {
                "id": tc.id,
                "type": "function",
                "function": {"name": tc.function.name, "arguments": tc.function.arguments},
            }
            for tc in msg.tool_calls
        ],
    })
    for tc in msg.tool_calls:
        args = json.loads(tc.function.arguments)
        preview = _tool_preview(tc.function.name, args)
        result = await asyncio.to_thread(execute_tool, tc.function.name, args)
        messages.append({"role": "tool", "tool_call_id": tc.id, "content": str(result)})
        tool_summaries.append(preview if preview else tc.function.name)

    step = f"iter {iteration + 1}: " + " | ".join(tool_summaries)
    return _jdump({"status": "running", "session_id": session_id, "step": step})


@mcp.tool()
async def qwen_start(task: str, skill: str = "", context: str = "") -> str:
    """
    Start a stepped Qwen task. Runs one inference round and returns JSON:
      {"status": "running", "session_id": "<id>", "step": "<what happened>"}
      {"status": "done",    "result": "<final response>"}
      {"status": "error",   "result": "<message>"}
    Call qwen_continue with session_id to advance running tasks.
    """
    session_id = uuid.uuid4().hex[:8]
    _sessions[session_id] = {
        "messages": _build_messages(task, skill, context),
        "iteration": 0,
    }
    return await _qwen_step(session_id)


@mcp.tool()
async def qwen_continue(session_id: str) -> str:
    """
    Advance a running Qwen task by one step. Returns the same JSON shape as qwen_start.
    Keep calling until status is 'done' or 'error'.
    """
    return await _qwen_step(session_id)


@mcp.tool()
async def run_qwen_task(task: str, skill: str = "", context: str = "", ctx: Context = None) -> str:
    """
    Delegate a task to Qwen running locally via LM Studio (single blocking call).
    Prefer qwen_start + qwen_continue for long tasks where step visibility matters.
    """
    messages = _build_messages(task, skill, context)
    trace: list[str] = []

    for iteration in range(MAX_ITERATIONS):
        if ctx:
            ctx.report_progress(iteration, MAX_ITERATIONS)

        response = await asyncio.to_thread(
            client.chat.completions.create,
            model=MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            timeout=TIMEOUT,
        )
        msg = response.choices[0].message

        if not msg.tool_calls:
            if msg.content:
                trace_header = (
                    f"[{iteration + 1} iteration(s), {len(trace)} tool call(s)]\n"
                    + "\n".join(trace)
                )
                return f"{trace_header}\n\n---\n\n{msg.content}"
            trace.append(f"iter {iteration + 1}: empty response — nudging")
            messages.append({"role": "assistant", "content": ""})
            messages.append({"role": "user", "content": "Please provide your complete response now."})
            continue

        tool_names = [tc.function.name for tc in msg.tool_calls]
        trace.append(f"iter {iteration + 1}: {', '.join(tool_names)}")

        messages.append({
            "role": "assistant",
            "content": msg.content or "",
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {"name": tc.function.name, "arguments": tc.function.arguments},
                }
                for tc in msg.tool_calls
            ],
        })
        for tc in msg.tool_calls:
            args = json.loads(tc.function.arguments)
            preview = _tool_preview(tc.function.name, args)
            if preview:
                trace.append(f"  → {tc.function.name}: {preview}")
            result = await asyncio.to_thread(execute_tool, tc.function.name, args)
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": str(result)})

    trace_header = (
        f"[{MAX_ITERATIONS} iterations, {len(trace)} tool call(s) — limit reached]\n"
        + "\n".join(trace)
    )
    return f"{trace_header}\n\nMax iterations reached — partial results above."


if __name__ == "__main__":
    mcp.run(transport="stdio")
