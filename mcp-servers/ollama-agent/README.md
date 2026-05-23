# ollama-agent MCP Server

Thin MCP server that exposes a local Ollama model as a tool Claude can call. Default target is `gemma4:e4b-mlx` (the "fast general / vault" role from the roster in `~/Code/claude-code-config/models.json`); override with the `OLLAMA_AGENT_MODEL` environment variable.

## Tools

| Name             | Purpose                                                              |
|------------------|----------------------------------------------------------------------|
| `qwen_start`     | Start a stepped agentic task. Returns JSON with `status`/`session_id`. |
| `qwen_continue`  | Advance a running task by one step (call until `status` is `done`/`error`). |
| `run_qwen_task`  | Single blocking call — runs the full agent loop and returns the result.    |

Tool names retain the `qwen_` prefix for backward compatibility with the skills that invoke them; the underlying model is now whatever Ollama tag is configured.

## Setup

```bash
pip3 install mcp openai
```

## Requirements

- Ollama running at `http://localhost:11434`
- Target model pulled (`ollama pull gemma4:e4b-mlx`)

## Configuration (mcp.json)

```json
"ollama-agent": {
  "command": "/opt/homebrew/bin/python3.13",
  "args": ["/Users/shane/Code/claude-code-config/mcp-servers/ollama-agent/server.py"],
  "env": {
    "OLLAMA_AGENT_MODEL": "gemma4:e4b-mlx"
  }
}
```
