---
name: connect
description: Use when asked to find non-obvious connections between concepts in the vault, or when /connect is invoked.
---

# Skill: /connect [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Find non-obvious bridges between '[argument]' and other concepts in the vault. What unexpected connections exist? What synthesis hasn't been made yet?"
   - `skill`: "connect"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Find non-obvious bridges between '[argument]' and other concepts in the vault. What unexpected connections exist? What synthesis hasn't been made yet?

## Fallback (if run_gemma_task unavailable)

Execute the skill directly:

1. Search the vault for notes related to `[argument]` using `mcp__obsidian__search_notes` (vault: Personal)
2. Read the relevant notes using `mcp__obsidian__read_notes`
3. Search for notes in adjacent and seemingly unrelated domains to cast a wide net
4. Look for non-obvious connections:
   - Structural similarities: two ideas that have the same underlying pattern even though the surface topics differ
   - Causal links: one idea that might explain or predict something in another note
   - Tensions that illuminate: two ideas that seem to conflict but the conflict reveals something new
   - Synthesis opportunities: two notes that together imply a third insight neither states
5. Reject obvious connections — the value is in the surprising ones
6. Present 3–5 non-obvious connections, each framed as: "[Concept A] connects to [Concept B] because [non-obvious bridge]. The unexplored synthesis is [new insight]."
