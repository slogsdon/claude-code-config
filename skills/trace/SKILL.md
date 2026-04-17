---
name: trace
description: Use when asked to trace the evolution of an idea over time in the vault, or when /trace is invoked.
---

# Skill: /trace [argument]

Delegate to Gemma via the stepped execution protocol. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__gemma_start` with:
   - `task`: "Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md). Map the chronological evolution of Shane's thinking about '[argument]' in the vault. Show how the idea developed, shifted, or matured over time."
   - `skill`: "trace"
   - `context`: any relevant context from the current conversation
3. Loop: if `status` is `"running"`, call `mcp__ollama-agent__gemma_continue` with `session_id`; repeat until `status` is `"done"` or `"error"`
4. Review Gemma's `result`, synthesize if needed, and present to Shane

## Task description for Gemma

Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md).

Map the chronological evolution of Shane's thinking about '[argument]' in the vault. How did the idea develop, shift, or mature over time?

## Fallback (if gemma_start/gemma_continue unavailable)

Execute the skill directly:

1. Run `obsidian search query='[argument]' limit=10` via bash to find notes related to the topic
2. Read the relevant notes by running `obsidian read file='[note name]'` via bash for each, paying attention to note dates and timestamps
3. Sort the notes chronologically by creation/modification date
4. Identify the evolution of thinking:
   - What was the earliest framing of the idea?
   - What shifted, and what triggered each shift?
   - What's the current settled position (if any), or what remains unresolved?
5. Present a chronological narrative showing how the idea developed, with specific note references and dates
6. Highlight inflection points — moments where the thinking meaningfully changed direction
