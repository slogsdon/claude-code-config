---
name: stranger
description: Use when asked to build an outside-observer portrait of Shane from the vault, or when /stranger is invoked.
---

# Skill: /stranger [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Build an outside-observer portrait of Shane based on the vault, focusing on '[argument]' or broadly. What would a perceptive stranger conclude about how he thinks?"
   - `skill`: "stranger"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Build an outside-observer portrait of Shane based on the vault, focusing on '[argument]' or broadly. What would a perceptive stranger conclude about how he thinks?

## Fallback (if run_gemma_task unavailable)

Execute the skill directly using `mcp__obsidian__search_notes` and `mcp__obsidian__read_notes` to query the vault at ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal.
