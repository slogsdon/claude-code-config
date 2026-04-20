---
name: ghost
description: Use when you want to answer a question in Shane's voice, when asked to ghost-write as Shane, or when the /ghost command is invoked.
---

# Skill: /ghost [argument]

Delegate to Gemma via the stepped execution protocol. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__plugin_shane-config_ollama-agent__gemma_start` with:
   - `task`: "Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md). Answer the question or topic '[argument]' in Shane's authentic voice. Use the Ghost Writer Context file and vault notes to mirror his vocabulary, reasoning style, and tone. Produce content as Shane would write it."
   - `skill`: "ghost"
   - `context`: any relevant context from the current conversation
3. Loop: if `status` is `"running"`, call `mcp__plugin_shane-config_ollama-agent__gemma_continue` with `session_id`; repeat until `status` is `"done"` or `"error"`
4. Review Gemma's `result`, synthesize if needed, and present to Shane

## Task description for Gemma

Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md).

Answer the question or topic '[argument]' in Shane's authentic voice. Use the Ghost Writer Context file and vault notes to mirror his vocabulary, reasoning style, and tone. Produce content as Shane would write it.

## Fallback (if gemma_start/gemma_continue unavailable)

Execute the skill directly:

1. Run `obsidian search query='[argument]' limit=10` via bash to find notes related to the topic
2. Run `obsidian search query='voice OR style OR writing' limit=10` via bash to find notes that reveal Shane's voice patterns
3. Run `obsidian search query='Ghost Writer' limit=5` via bash to find the Ghost Writer Context file if it exists
4. Read 5–8 relevant notes by running `obsidian read file='[note name]'` via bash for each, to absorb his vocabulary and reasoning style
5. Produce the content in Shane's voice:
   - Mirror his vocabulary (direct, specific, no hedging)
   - Use his reasoning style (builds from first principles, acknowledges tradeoffs)
   - Match his tone (intellectually engaged, occasionally dry, no fluff)
   - Cite specific vault material where relevant, as he would
6. Present the ghost-written content to Shane
