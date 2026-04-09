---
name: weekly-learnings
description: Use when asked to prepare a weekly reflection or summary of learnings, or when /weekly-learnings is invoked.
---

# Skill: /weekly-learnings [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Synthesize this week's vault additions and highlights into a meaningful weekly reflection or email update. What were the key learnings, themes, and open questions?"
   - `skill`: "weekly-learnings"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Synthesize this week's vault additions and highlights into a meaningful weekly reflection or email update. What were the key learnings, themes, and open questions?

## Fallback (if run_gemma_task unavailable)

Execute the skill directly using `mcp__obsidian__search_notes` and `mcp__obsidian__read_notes` to query the vault at ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal.
