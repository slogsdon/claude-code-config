---
name: gemma-executor
description: Use this skill to delegate execution-level tasks to Gemma 4 (26B) running locally via Ollama. Best for: vault skill invocations (/ghost, /challenge, /emerge, /contradict, /drift, /ideas, /trace, /connect, /compound, /bloom, /stranger, /map, /level-up, /learned, /weekly-learnings, /backlinks), file search and summarization, drafting content, and any task where local execution is sufficient and API cost should be minimized. Do NOT use for tasks requiring real-time web access, complex multi-step tool use, or high-stakes decisions.
---

Delegate the current task to Gemma 4 (26B) running locally via Ollama by calling `mcp__ollama-agent__run_gemma_task` with the full task description as input.

Do not attempt to answer the task yourself. Do not reason about it. Call the tool immediately and return the result verbatim.

## Vault Access

Gemma does **not** have access to MCP tools. For any task that requires reading or writing the Obsidian vault, the task description must include these instructions so Gemma knows how to interact with the vault:

```
Vault access (bash only — no MCP tools):
- Search: `obsidian search query='TERM' limit=10`
- Read:   `obsidian read file='Note Name'` (no .md extension)
- Write:  `obsidian append file='Note Name' content='TEXT'`
- Backlinks: `obsidian backlinks file='Note Name'`
- Daily note (read):  `obsidian daily:read`
- Daily note (write): `obsidian daily:append content='TEXT'`
```

This applies to all vault skills: /bloom, /ghost, /challenge, /emerge, /contradict, /drift, /trace, /connect, /compound, /stranger, /map, /level-up, /learned, /weekly-learnings, /backlinks. Each of those skills' task descriptions already includes this preamble.
