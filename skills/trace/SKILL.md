---
name: trace
description: Use when asked to trace the evolution of an idea over time in the vault, or when /trace is invoked.
---

# Skill: /trace [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Map the chronological evolution of Shane's thinking about '[argument]' in the vault. Show how the idea developed, shifted, or matured over time."
   - `skill`: "trace"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Map the chronological evolution of Shane's thinking about '[argument]' in the vault. Show how the idea developed, shifted, or matured over time.

## Fallback (if run_gemma_task unavailable)

Execute the skill directly:

1. Search the vault for notes related to `[argument]` using `mcp__obsidian__search_notes` (vault: Personal)
2. Read the relevant notes using `mcp__obsidian__read_notes`, paying attention to note dates and timestamps
3. Sort the notes chronologically by creation/modification date
4. Identify the evolution of thinking:
   - What was the earliest framing of the idea?
   - What shifted, and what triggered each shift?
   - What's the current settled position (if any), or what remains unresolved?
5. Present a chronological narrative showing how the idea developed, with specific note references and dates
6. Highlight inflection points — moments where the thinking meaningfully changed direction
