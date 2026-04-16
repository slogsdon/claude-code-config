---
name: emerge
description: Use when asked to surface hidden patterns or implicit ideas in the vault, or when /emerge is invoked.
---

# Skill: /emerge [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Search the vault for implicit patterns, unspoken assumptions, and emergent ideas around '[argument]' (or across the full vault if no argument given). Surface what Shane is circling without stating directly."
   - `skill`: "emerge"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Search the vault for implicit patterns, unspoken assumptions, and emergent ideas around '[argument]' (or across the full vault if no argument given). Surface what Shane is circling without stating directly.

## Fallback (if run_gemma_task unavailable)

Execute the skill directly:

1. If `[argument]` is provided, search for it using `mcp__obsidian__search_notes` (vault: Personal); otherwise use broad searches across multiple clusters (goals, beliefs, decisions, work, habits)
2. Read 10–15 notes spanning different topics and time periods using `mcp__obsidian__read_notes`
3. Look for what's implicit — not stated conclusions, but:
   - Topics that recur without being labeled as important
   - Assumptions embedded in how questions are framed
   - Ideas approached from multiple angles but never synthesized
   - Things written around but never directly about
4. Surface 3–5 emergent patterns, each framed as: "You keep circling [X] without naming it directly — the implicit belief seems to be [Y]"
5. Present the findings to Shane with specific note evidence for each pattern
