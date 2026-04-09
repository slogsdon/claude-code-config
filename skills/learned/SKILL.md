---
name: learned
description: Use when asked to transform vault insights into polished written content, or when /learned is invoked.
---

# Skill: /learned [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Transform Shane's vault insights about '[argument]' into a polished written piece — a blog post, essay, or reflection. Use his authentic voice."
   - `skill`: "learned"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Transform Shane's vault insights about '[argument]' into a polished written piece — a blog post, essay, or reflection. Use his authentic voice.

## Fallback (if run_gemma_task unavailable)

Execute the skill directly using `mcp__obsidian__search_notes` and `mcp__obsidian__read_notes` to query the vault at ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal.
