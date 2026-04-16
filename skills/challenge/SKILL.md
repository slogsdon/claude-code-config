---
name: challenge
description: Use when Shane wants to pressure-test a belief, steelman an opposing view, or invoke /challenge.
---

# Skill: /challenge [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Steelman the strongest opposition to '[argument]'. Identify the most vulnerable assumptions, surface counterevidence from the vault, and pressure-test the position rigorously."
   - `skill`: "challenge"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Steelman the strongest opposition to '[argument]'. Identify the most vulnerable assumptions, surface counterevidence from the vault, and pressure-test the position rigorously.

## Fallback (if run_gemma_task unavailable)

Execute the skill directly:

1. Run `obsidian search query="[argument]" limit=10` via bash to find notes related to the topic
2. Read the relevant notes by running `obsidian read file="[note name]"` via bash for each — look especially for where Shane states the position most confidently
3. Steelman the opposition:
   - Build the strongest possible case against `[argument]` — not a strawman, the actual best version
   - Find the most vulnerable assumptions underlying `[argument]`; name them explicitly
   - Search the vault for any counterevidence — places where Shane's own notes undermine the position
4. Pressure-test the position:
   - What would have to be true for `[argument]` to be wrong?
   - What's the most common smart objection to this position?
   - What would a rigorous critic say?
5. Don't soften it — the value is in the discomfort
6. Present the challenge to Shane as: the strongest opposition case, the most vulnerable assumptions, and the counterevidence found in his own vault
