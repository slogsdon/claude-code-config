# ollama-agent MCP Server

Thin MCP server that delegates tasks to a local model **via the LiteLLM proxy** at `http://localhost:4000`. The server does not talk to Ollama directly — LiteLLM is the chokepoint that handles tracing, Langfuse callbacks, and routing.

The default target is the `fast-general` role alias (which LiteLLM resolves to `gemma4:e4b-mlx`). Override with the `OLLAMA_AGENT_MODEL` env var.

> Naming note: the dir, MCP name, and Python file all still say `ollama-agent` because that name is referenced by ~15 skill files. The actual transport is OpenAI-compatible against LiteLLM; "ollama-agent" survives as the human-friendly handle for "the local model delegate."

## Tools

| Name             | Purpose                                                              |
|------------------|----------------------------------------------------------------------|
| `qwen_start`     | Start a stepped agentic task. Returns JSON with `status`/`session_id`. |
| `qwen_continue`  | Advance a running task by one step (call until `status` is `done`/`error`). |
| `run_qwen_task`  | Single blocking call — runs the full agent loop and returns the result.    |

Tool names retain the `qwen_` prefix for backward compatibility with the skills that invoke them.

## Setup

```bash
pip3 install mcp openai
```

## Requirements

- LiteLLM proxy running at `http://localhost:4000` (docker-compose in `~/Code/otel-local-ai`)
- Ollama running at `http://localhost:11434` with the target model pulled (`ollama pull gemma4:e4b-mlx`)
- `LITELLM_MASTER_KEY` exported in the parent shell (read from `~/Code/otel-local-ai/.env`)

## Environment

| Variable             | Default                          | Purpose                                              |
|----------------------|----------------------------------|------------------------------------------------------|
| `LITELLM_BASE_URL`   | `http://localhost:4000/v1`       | Where the proxy lives.                               |
| `LITELLM_API_KEY`    | falls back to `LITELLM_MASTER_KEY` | Bearer token for the proxy.                         |
| `OLLAMA_AGENT_MODEL` | `fast-general`                   | Role alias to call (see `models.yaml`).              |

## Configuration (.mcp.json)

```json
"ollama-agent": {
  "command": "/opt/homebrew/bin/python3.13",
  "args": ["/Users/shane/Code/claude-code-config/mcp-servers/ollama-agent/server.py"],
  "env": {
    "LITELLM_BASE_URL": "http://localhost:4000/v1",
    "OLLAMA_AGENT_MODEL": "fast-general"
  }
}
```

The auth key is read from the inherited shell env (`LITELLM_MASTER_KEY`) so it stays out of this repo.
