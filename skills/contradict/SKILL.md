---
name: contradict
description: Use when asked to find contradictions or inconsistencies in thinking, or when /contradict is invoked.
---

# Skill: /contradict [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Vault access (bash only, no MCP tools): `obsidian search query=\"TERM\" limit=10`, `obsidian read file=\"Note Name\"` (no .md). Find logical tensions, contradictions, or inconsistencies in the vault related to '[argument]' (or across the full vault). Where does Shane contradict himself or hold competing beliefs?"
   - `skill`: "contradict"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Vault access (bash only, no MCP tools): `obsidian search query="TERM" limit=10`, `obsidian read file="Note Name"` (no .md).

Find logical tensions, contradictions, or inconsistencies in the vault related to '[argument]' (or across the full vault). Where does Shane contradict himself or hold competing beliefs?

## Fallback (if run_gemma_task unavailable)

Execute the skill directly:

1. Run `obsidian search query="[argument]" limit=15` via bash; if no argument, run broad searches via bash: `obsidian search query="believe" limit=10`, `obsidian search query="value" limit=10`, `obsidian search query="decided" limit=10`
2. Read 10–15 notes by running `obsidian read file="[note name]"` via bash for each, prioritizing notes that state positions or make claims
3. Look for contradictions:
   - Direct contradictions: two notes asserting opposite things about the same topic
   - Contextual contradictions: a stated belief that conflicts with a stated decision or habit
   - Temporal contradictions: a position that changed without acknowledgment
   - Value contradictions: two stated values that pull in opposite directions
4. For each contradiction found, present it as: "In [note A], you say [X]. In [note B], you say [Y]. These are in tension because [reason]."
5. Distinguish between healthy tension (holding complexity) and actual inconsistency (one must be wrong)
6. Present 3–5 most significant contradictions to Shane, with note references
