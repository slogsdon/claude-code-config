#!/usr/bin/env python3
"""MCP server that delegates tasks to Gemma via Ollama."""

import httpx
from mcp.server.fastmcp import FastMCP

OLLAMA_BASE_URL = "http://127.0.0.1:11434/v1"
MODEL = "shane-agent"
TIMEOUT = 120.0

mcp = FastMCP("ollama-agent")


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

    prompt = "\n\n".join(parts)

    with httpx.Client(timeout=TIMEOUT) as client:
        response = client.post(
            f"{OLLAMA_BASE_URL}/chat/completions",
            headers={"Authorization": "Bearer ollama"},
            json={
                "model": MODEL,
                "messages": [{"role": "user", "content": prompt}],
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


if __name__ == "__main__":
    mcp.run(transport="stdio")
