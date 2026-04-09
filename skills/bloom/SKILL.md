---
name: bloom
description: Use when asked to map branching questions or lines of inquiry from a topic, or when /bloom is invoked.
---

# Skill: /bloom [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Map how the question '[argument]' branches into sub-questions across the vault. What related questions does it open up? Create a bloom of inquiry."
   - `skill`: "bloom"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Map how the question '[argument]' branches into sub-questions across the vault. What related questions does it open up? Create a bloom of inquiry.

## Fallback (if run_gemma_task unavailable)

Execute the skill directly using `mcp__obsidian__search_notes` and `mcp__obsidian__read_notes` to query the vault at ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal.
