---
name: trace
description: Use when asked to trace the evolution of an idea over time in the vault, or when /trace is invoked.
---

# Skill: /trace [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Map the chronological evolution of Shane's thinking about '[argument]' in the vault. Show how the idea developed, shifted, or matured over time."
   - `skill`: "trace"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Map the chronological evolution of Shane's thinking about '[argument]' in the vault. Show how the idea developed, shifted, or matured over time.

## Fallback (if run_gemma_task unavailable)

Execute the skill directly using `mcp__obsidian__search_notes` and `mcp__obsidian__read_notes` to query the vault at ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal.
