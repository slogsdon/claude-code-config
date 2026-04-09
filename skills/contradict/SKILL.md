---
name: contradict
description: Use when asked to find contradictions or inconsistencies in thinking, or when /contradict is invoked.
---

# Skill: /contradict [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Find logical tensions, contradictions, or inconsistencies in the vault related to '[argument]' (or across the full vault). Where does Shane contradict himself or hold competing beliefs?"
   - `skill`: "contradict"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Find logical tensions, contradictions, or inconsistencies in the vault related to '[argument]' (or across the full vault). Where does Shane contradict himself or hold competing beliefs?

## Fallback (if run_gemma_task unavailable)

Execute the skill directly using `mcp__obsidian__search_notes` and `mcp__obsidian__read_notes` to query the vault at ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal.
