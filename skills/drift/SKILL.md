---
name: drift
description: Use when asked to analyze gaps between stated intentions and behavior, or when /drift is invoked.
---

# Skill: /drift [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Analyze the gap between Shane's stated intentions and actual behavior patterns in the vault around '[argument]' (or broadly). Where is he drifting from his own stated values or goals?"
   - `skill`: "drift"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Analyze the gap between Shane's stated intentions and actual behavior patterns in the vault around '[argument]' (or broadly). Where is he drifting from his own stated values or goals?

## Fallback (if run_gemma_task unavailable)

Execute the skill directly using `mcp__obsidian__search_notes` and `mcp__obsidian__read_notes` to query the vault at ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal.
