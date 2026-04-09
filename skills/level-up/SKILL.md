---
name: level-up
description: Use when asked to assess skill proficiency and recommend growth actions, or when /level-up is invoked.
---

# Skill: /level-up [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Assess Shane's current proficiency with '[argument]' based on vault evidence. What's the next growth edge? What specific actions would level him up?"
   - `skill`: "level-up"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Assess Shane's current proficiency with '[argument]' based on vault evidence. What's the next growth edge? What specific actions would level him up?

## Fallback (if run_gemma_task unavailable)

Execute the skill directly using `mcp__obsidian__search_notes` and `mcp__obsidian__read_notes` to query the vault at ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal.
