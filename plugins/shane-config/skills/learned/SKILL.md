---
name: learned
description: Use when asked to transform vault insights into polished written content, or when /learned is invoked.
---

# Skill: /learned [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md). Transform Shane's vault insights about '[argument]' into a polished written piece — a blog post, essay, or reflection. Use his authentic voice."
   - `skill`: "learned"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md).

Transform Shane's vault insights about '[argument]' into a polished written piece — a blog post, essay, or reflection. Use his authentic voice.

## Fallback (if run_gemma_task unavailable)

Execute the skill directly:

1. Run `obsidian search query='[argument]' limit=10` via bash to find notes related to the topic
2. Read the top 5–10 most relevant notes by running `obsidian read file='[note name]'` via bash for each
3. Extract key insights, observations, and recurring ideas from those notes
4. Transform them into a polished written piece in Shane's voice:
   - Use first-person, direct prose (not listicles unless the content demands it)
   - Lead with the most surprising or hard-won insight
   - Build a narrative arc: what changed, what was learned, why it matters
   - End with an open question or implication
5. Present the piece to Shane
