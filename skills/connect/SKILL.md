---
name: connect
description: Use when asked to find non-obvious connections between concepts in the vault, or when /connect is invoked.
---

# Skill: /connect [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Find non-obvious bridges between '[argument]' and other concepts in the vault. What unexpected connections exist? What synthesis hasn't been made yet?"
   - `skill`: "connect"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Find non-obvious bridges between '[argument]' and other concepts in the vault. What unexpected connections exist? What synthesis hasn't been made yet?

## Fallback (if run_gemma_task unavailable)

Execute the skill directly using `mcp__obsidian__search_notes` and `mcp__obsidian__read_notes` to query the vault at ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal.
