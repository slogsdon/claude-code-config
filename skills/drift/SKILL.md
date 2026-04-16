---
name: drift
description: Use when asked to analyze gaps between stated intentions and behavior, or when /drift is invoked.
---

# Skill: /drift [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Analyze the gap between Shane's stated intentions and actual behavior patterns in the vault around '[argument]' (or broadly). Where is he drifting from his own stated values or goals?"
   - `skill`: "drift"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Analyze the gap between Shane's stated intentions and actual behavior patterns in the vault around '[argument]' (or broadly). Where is he drifting from his own stated values or goals?

## Fallback (if run_gemma_task unavailable)

Execute the skill directly:

1. Search the vault for stated intentions, goals, and values using `mcp__obsidian__search_notes` (vault: Personal) — search terms like "want to", "should", "goal", "intend", "commit", "value"
2. Also read `Context/accountability.md` and `Context/patterns.md` using `mcp__obsidian__read_notes`
3. If `[argument]` is provided, scope the search to that domain; otherwise cast broadly
4. Compare stated intentions against observable behavior:
   - What does Shane say he values? What does the vault show him actually spending time/attention on?
   - What goals appear repeatedly without progress?
   - What beliefs does he state vs. what his decisions imply?
5. Surface 2–4 specific drift patterns, each framed as: "You say [X], but the evidence shows [Y]"
6. Be direct — this is accountability analysis, not cheerleading
7. Present findings with vault evidence for each drift identified
