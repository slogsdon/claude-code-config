---
name: emerge
description: Use when asked to surface hidden patterns or implicit ideas in the vault, or when /emerge is invoked.
---

# Skill: /emerge [argument]

Delegate to Qwen via the stepped execution protocol. Claude orchestrates; Qwen executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__lmstudio-agent__qwen_start` (standalone) or `mcp__plugin_shane-config_lmstudio-agent__qwen_start` (plugin — use whichever is available) with:
   - `task`: "Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md). Search the vault for implicit patterns, unspoken assumptions, and emergent ideas around '[argument]' (or across the full vault if no argument given). Surface what Shane is circling without stating directly."
   - `skill`: "emerge"
   - `context`: any relevant context from the current conversation
3. Loop: if `status` is `"running"`, call `mcp__lmstudio-agent__qwen_continue` (or `mcp__plugin_shane-config_lmstudio-agent__qwen_continue` in plugin) with `session_id`; repeat until `status` is `"done"` or `"error"`
4. Review Qwen's `result`, synthesize if needed, and present to Shane

## Task description for Qwen

Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md).

Search the vault for implicit patterns, unspoken assumptions, and emergent ideas around '[argument]' (or across the full vault if no argument given). Surface what Shane is circling without stating directly.

## Fallback (if qwen_start/qwen_continue unavailable)

Execute the skill directly:

1. If `[argument]` is provided, run `obsidian search query='[argument]' limit=15` via bash; otherwise run broad searches via bash: `obsidian search query='goals' limit=10`, `obsidian search query='beliefs' limit=10`, `obsidian search query='habits' limit=10`, `obsidian search query='work' limit=10`
2. Read 10–15 notes spanning different topics and time periods by running `obsidian read file='[note name]'` via bash for each
3. Look for what's implicit — not stated conclusions, but:
   - Topics that recur without being labeled as important
   - Assumptions embedded in how questions are framed
   - Ideas approached from multiple angles but never synthesized
   - Things written around but never directly about
4. Surface 3–5 emergent patterns, each framed as: "You keep circling [X] without naming it directly — the implicit belief seems to be [Y]"
5. Present the findings to Shane with specific note evidence for each pattern
