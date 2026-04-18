---
name: drift
description: Use when asked to analyze gaps between stated intentions and behavior, or when /drift is invoked.
---

# Skill: /drift [argument]

Delegate to Gemma via the stepped execution protocol. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__gemma_start` with:
   - `task`: "Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md), `obsidian read file='Context/accountability'`, `obsidian read file='Context/patterns'`. Analyze the gap between Shane's stated intentions and actual behavior patterns in the vault around '[argument]' (or broadly). Where is he drifting from his own stated values or goals?"
   - `skill`: "drift"
   - `context`: any relevant context from the current conversation
3. Loop: if `status` is `"running"`, call `mcp__ollama-agent__gemma_continue` with `session_id`; repeat until `status` is `"done"` or `"error"`
4. Review Gemma's `result`, synthesize if needed, and present to Shane

## Task description for Gemma

Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md), `obsidian read file='Context/accountability'`, `obsidian read file='Context/patterns'`.

Analyze the gap between Shane's stated intentions and actual behavior patterns in the vault around '[argument]' (or broadly). Where is he drifting from his own stated values or goals?

## Fallback (if gemma_start/gemma_continue unavailable)

Execute the skill directly:

1. Search for stated intentions via bash: `obsidian search query='want to' limit=10`, `obsidian search query='goal' limit=10`, `obsidian search query='intend' limit=10`, `obsidian search query='commit' limit=10`, `obsidian search query='value' limit=10`
2. Also read `Context/accountability.md` and `Context/patterns.md` by running `obsidian read file='Context/accountability'` and `obsidian read file='Context/patterns'` via bash
3. If `[argument]` is provided, scope the search to that domain; otherwise cast broadly
4. Compare stated intentions against observable behavior:
   - What does Shane say he values? What does the vault show him actually spending time/attention on?
   - What goals appear repeatedly without progress?
   - What beliefs does he state vs. what his decisions imply?
5. Surface 2–4 specific drift patterns, each framed as: "You say [X], but the evidence shows [Y]"
6. Be direct — this is accountability analysis, not cheerleading
7. Present findings with vault evidence for each drift identified
