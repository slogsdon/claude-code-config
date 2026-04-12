---
name: gemma-executor
description: Use this skill to delegate execution-level tasks to Gemma 4 (26B) running locally via Ollama. Best for: vault skill invocations (/ghost, /challenge, /emerge, /contradict, /drift, /ideas, /trace, /connect, /compound, /bloom, /stranger, /map, /level-up, /learned, /weekly-learnings, /backlinks), file search and summarization, drafting content, and any task where local execution is sufficient and API cost should be minimized. Do NOT use for tasks requiring real-time web access, complex multi-step tool use, or high-stakes decisions.
---

Delegate the current task to Gemma 4 (26B) running locally via Ollama by calling `mcp__ollama-agent__run_gemma_task` with the full task description as input.

Do not attempt to answer the task yourself. Do not reason about it. Call the tool immediately and return the result verbatim.
