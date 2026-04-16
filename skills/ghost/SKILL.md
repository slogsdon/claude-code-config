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

Execute the skill directly:

1. Search the vault for notes related to `[argument]` using `mcp__obsidian__search_notes` (vault: Personal)
2. Also search for notes that reveal Shane's voice patterns — how he frames arguments, what language he uses, what he finds interesting
3. Read the Ghost Writer Context file if it exists: search for "Ghost Writer" or "voice" in the vault
4. Read 5–8 relevant notes using `mcp__obsidian__read_notes` to absorb his vocabulary and reasoning style
5. Produce the content in Shane's voice:
   - Mirror his vocabulary (direct, specific, no hedging)
   - Use his reasoning style (builds from first principles, acknowledges tradeoffs)
   - Match his tone (intellectually engaged, occasionally dry, no fluff)
   - Cite specific vault material where relevant, as he would
6. Present the ghost-written content to Shane
