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

Execute the skill directly using `mcp__obsidian__search_notes` and `mcp__obsidian__read_notes` to query the vault at ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal.
