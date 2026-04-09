# ollama-agent MCP Server

Thin MCP server that exposes Gemma 4 (`shane-agent` model in Ollama) as a tool Claude can call.

## Tool: `run_gemma_task`

| Parameter | Type   | Required | Description                                      |
|-----------|--------|----------|--------------------------------------------------|
| `task`    | string | Yes      | Task description or prompt to send to Gemma      |
| `skill`   | string | No       | Skill name to invoke (ghost, challenge, emerge…) |
| `context` | string | No       | Additional context to inject alongside the task  |

Returns Gemma's full response as a string.

## Setup

```bash
pip3 install mcp httpx
```

## Requirements

- Ollama running at `http://127.0.0.1:11434`
- `shane-agent` model available (`ollama list` to verify)

## Configuration (mcp.json)

```json
"ollama-agent": {
  "command": "python3",
  "args": ["/Users/shane/Code/claude-code-config/mcp-servers/ollama-agent/server.py"],
  "env": {}
}
```
