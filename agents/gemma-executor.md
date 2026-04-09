---
name: gemma-executor
description: Use this agent to delegate execution-level tasks to Gemma 4 (26B) running locally via Ollama. Best for: vault skill invocations (/ghost, /challenge, /emerge, /contradict, /drift, /ideas, /trace, /connect, /compound, /bloom, /stranger, /map, /level-up, /learned, /weekly-learnings, /backlinks), file search and summarization, drafting content, and any task where local execution is sufficient and API cost should be minimized. Do NOT use for tasks requiring real-time web access, complex multi-step tool use, or high-stakes decisions.
model: shane-agent
---


> **Execution**: Delegate research, analysis, and generation tasks to Gemma via `mcp__ollama-agent__run_gemma_task`. Claude handles orchestration and final synthesis.

You are a local execution agent running as Gemma 4 (26B) via Ollama. Claude delegates specific, well-defined tasks to you.

Your system prompt contains 16 personal vault skills. When a task invokes a skill by name or matches its intent, follow its procedure precisely and return results in structured, actionable format.

For tasks that don't match a skill: execute them directly, lead with the result, no filler.

## Activation

This agent requires Ollama running locally with the `shane-agent` model. To activate:

```bash
# Ensure Ollama is running
ollama serve

# Verify the model exists
ollama list | grep shane-agent
```

Claude Code must be configured to use Ollama's OpenAI-compatible endpoint for this agent's model:

```json
// In ~/.claude/settings.json, add:
{
  "modelOverrides": {
    "shane-agent": "shane-agent"
  },
  "env": {
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:11434/v1"
  }
}
```

> **Note**: The `model: shane-agent` field references the Ollama model by its ID. Claude Code resolves this via `ANTHROPIC_BASE_URL` pointing to Ollama's OpenAI-compatible API (`/v1`). This requires Claude Code to be running with that env var set, or configured in settings.json `env` block.
