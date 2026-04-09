---
name: compound
description: Use when asked how knowledge has accumulated or compounded around a topic, or when /compound is invoked.
---

# Skill: /compound [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Show how knowledge about '[argument]' has accumulated and compounded in the vault. What insights build on earlier ones? What's the compounding trajectory?"
   - `skill`: "compound"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Show how knowledge about '[argument]' has accumulated and compounded in the vault. What insights build on earlier ones? What's the compounding trajectory?

## Fallback (if run_gemma_task unavailable)

Execute the skill directly using `mcp__obsidian__search_notes` and `mcp__obsidian__read_notes` to query the vault at ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal.
