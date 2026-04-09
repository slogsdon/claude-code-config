---
name: emerge
description: Use when asked to surface hidden patterns or implicit ideas in the vault, or when /emerge is invoked.
---

# Skill: /emerge [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Search the vault for implicit patterns, unspoken assumptions, and emergent ideas around '[argument]' (or across the full vault if no argument given). Surface what Shane is circling without stating directly."
   - `skill`: "emerge"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Search the vault for implicit patterns, unspoken assumptions, and emergent ideas around '[argument]' (or across the full vault if no argument given). Surface what Shane is circling without stating directly.

## Fallback (if run_gemma_task unavailable)

Execute the skill directly using `mcp__obsidian__search_notes` and `mcp__obsidian__read_notes` to query the vault at ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal.
