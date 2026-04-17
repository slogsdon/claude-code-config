---
name: stranger
description: Use when asked to build an outside-observer portrait of Shane from the vault, or when /stranger is invoked.
---

# Skill: /stranger [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md). Build an outside-observer portrait of Shane based on the vault, focusing on '[argument]' or broadly. What would a perceptive stranger conclude about how he thinks?"
   - `skill`: "stranger"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md).

Build an outside-observer portrait of Shane based on the vault, focusing on '[argument]' or broadly. What would a perceptive stranger conclude about how he thinks?

## Fallback (if run_gemma_task unavailable)

Execute the skill directly:

1. If `[argument]` is provided, run `obsidian search query='[argument]' limit=15` via bash; otherwise run broad topic searches via bash (e.g. `obsidian search query='work' limit=10`, `obsidian search query='ideas' limit=10`, `obsidian search query='journal' limit=10`)
2. Read 10–15 notes by running `obsidian read file='[note name]'` via bash for each, sampling across different topics, time periods, and note types
3. Adopt the perspective of a perceptive stranger reading these notes cold — no insider context, no charity
4. Build a portrait based purely on what the notes reveal:
   - What does this person clearly care about most?
   - What patterns of thinking are immediately visible?
   - What does this person seem to be afraid of or avoiding?
   - What would a stranger guess about their core beliefs, even unstated ones?
   - What would seem strange, inconsistent, or surprising from the outside?
5. Be unflinching — a stranger has no reason to protect Shane's self-image
6. Present the portrait to Shane, with specific evidence from notes for each observation
