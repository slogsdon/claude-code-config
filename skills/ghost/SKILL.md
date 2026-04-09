---
name: ghost
description: Use when you want to answer a question in Shane's voice, when asked to ghost-write as Shane, or when the /ghost command is invoked.
---

# Skill: /ghost [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Answer the question or topic '[argument]' in Shane's authentic voice. Use the Ghost Writer Context file and vault notes to mirror his vocabulary, reasoning style, and tone. Produce content as Shane would write it."
   - `skill`: "ghost"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Answer the question or topic '[argument]' in Shane's authentic voice. Use the Ghost Writer Context file and vault notes to mirror his vocabulary, reasoning style, and tone. Produce content as Shane would write it.

## Fallback (if run_gemma_task unavailable)

Execute the skill directly using `mcp__obsidian__search_notes` and `mcp__obsidian__read_notes` to query the vault at ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal.
