#!/usr/bin/env python3
"""MCP server that delegates tasks to Gemma via Ollama with agentic tool loop."""

import json
import os
import subprocess

from openai import OpenAI
from mcp.server.fastmcp import FastMCP

OLLAMA_BASE_URL = "http://127.0.0.1:11434/v1"
MODEL = "shane-agent"
TIMEOUT = 120.0

mcp = FastMCP("ollama-agent")

client = OpenAI(base_url=OLLAMA_BASE_URL, api_key="ollama")

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
            result = subprocess.run(args["command"], shell=True, capture_output=True, text=True, timeout=30)
            return (result.stdout + result.stderr).strip()
        elif name == "list_directory":
            path = os.path.expanduser(args["path"])
            return "\n".join(os.listdir(path))
        else:
            return f"Unknown tool: {name}"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def run_gemma_task(task: str, skill: str = "", context: str = "") -> str:
    """
    Delegate a task to Gemma 4 running locally via Ollama.

    Args:
        task: The task description or prompt to send to Gemma.
        skill: Optional skill name to invoke (e.g. ghost, challenge, emerge).
               If provided, Gemma is instructed to apply that skill.
        context: Optional additional context to inject alongside the task.
    """
    parts = []

    if skill:
        parts.append(f"Use the /{skill} skill for the following task.")

    if context:
        parts.append(f"Context:\n{context}")

    parts.append(task)

    full_task = "\n\n".join(parts)

    system_prompt = (
        "You are a capable local AI assistant. You have access to filesystem and shell tools. "
        "Use them when needed to complete the task.\n\n"
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

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": full_task},
    ]

    for _ in range(10):
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            timeout=TIMEOUT,
        )
        msg = response.choices[0].message

        if not msg.tool_calls:
            return msg.content or ""

        messages.append({
            "role": "assistant",
            "content": msg.content or "",
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {"name": tc.function.name, "arguments": tc.function.arguments}
                }
                for tc in msg.tool_calls
            ]
        })

        for tc in msg.tool_calls:
            args = json.loads(tc.function.arguments)
            result = execute_tool(tc.function.name, args)
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": str(result)})

    return "Max iterations reached"


if __name__ == "__main__":
    mcp.run(transport="stdio")
