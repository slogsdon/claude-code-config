---
name: map
description: Use when asked to audit or map the structure of the knowledge graph, or when /map is invoked.
---

# Skill: /map [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Audit the structure and health of the knowledge graph around '[argument]' (or the full vault). What's well-connected, what's orphaned, what's missing?"
   - `skill`: "map"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Audit the structure and health of the knowledge graph around '[argument]' (or the full vault). What's well-connected, what's orphaned, what's missing?

## Fallback (if run_gemma_task unavailable)

Execute the skill directly using `mcp__obsidian__search_notes` and `mcp__obsidian__read_notes` to query the vault at ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal.
