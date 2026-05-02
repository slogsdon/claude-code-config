# lmstudio-agent MCP Server

Thin MCP server that exposes Qwen (`shane-agent` model in LM Studio) as a tool Claude can call.

## Tool: `run_qwen_task`

| Parameter | Type   | Required | Description                                      |
|-----------|--------|----------|--------------------------------------------------|
| `task`    | string | Yes      | Task description or prompt to send to Qwen      |
| `skill`   | string | No       | Skill name to invoke (ghost, challenge, emerge…) |
| `context` | string | No       | Additional context to inject alongside the task  |

Returns Qwen's full response as a string.

## Setup

```bash
pip3 install mcp httpx
```

## Requirements

- LM Studio running at `http://127.0.0.1:1234`
- Qwen model loaded in LM Studio

## Configuration (mcp.json)

```json
"lmstudio-agent": {
  "command": "python3",
  "args": ["/Users/shane/Code/claude-code-config/mcp-servers/lmstudio-agent/server.py"],
  "env": {}
}
```
