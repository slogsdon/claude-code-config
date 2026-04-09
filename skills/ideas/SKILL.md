---
name: ideas
description: Use when Shane wants cross-domain idea generation or creative sparks, or when /ideas is invoked.
---

# Skill: /ideas [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Generate 5-10 cross-domain innovation ideas sparked by '[argument]' (or the vault's recurring themes). Draw unexpected connections between disparate fields."
   - `skill`: "ideas"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Generate 5-10 cross-domain innovation ideas sparked by '[argument]' (or the vault's recurring themes). Draw unexpected connections between disparate fields.

## Fallback (if run_gemma_task unavailable)

Execute the skill directly using `mcp__obsidian__search_notes` and `mcp__obsidian__read_notes` to query the vault at ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal.
