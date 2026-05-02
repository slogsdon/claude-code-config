---
name: map
description: Use when asked to audit or map the structure of the knowledge graph, or when /map is invoked.
---

# Skill: /map [argument]

Delegate to Qwen via the stepped execution protocol. Claude orchestrates; Qwen executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__lmstudio-agent__qwen_start` (standalone) or `mcp__plugin_shane-config_lmstudio-agent__qwen_start` (plugin — use whichever is available) with:
   - `task`: "Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md), `obsidian backlinks file='Note Name'`. Audit the structure and health of the knowledge graph around '[argument]' (or the full vault). What's well-connected, what's orphaned, what's missing?"
   - `skill`: "map"
   - `context`: any relevant context from the current conversation
3. Loop: if `status` is `"running"`, call `mcp__lmstudio-agent__qwen_continue` (or `mcp__plugin_shane-config_lmstudio-agent__qwen_continue` in plugin) with `session_id`; repeat until `status` is `"done"` or `"error"`
4. Review Qwen's `result`, synthesize if needed, and present to Shane

## Task description for Qwen

Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md), `obsidian backlinks file='Note Name'`.

Audit the structure and health of the knowledge graph around '[argument]' (or the full vault). What's well-connected, what's orphaned, what's missing?

## Fallback (if qwen_start/qwen_continue unavailable)

Execute the skill directly:

1. If `[argument]` is provided, run `obsidian search query='[argument]' limit=15` via bash; otherwise run broad searches across topic clusters via bash (e.g. `obsidian search query='MOC' limit=10`, `obsidian search query='projects' limit=10`, `obsidian search query='ideas' limit=10`)
2. Read a sampling of notes by running `obsidian read file='[note name]'` via bash for each — aim for breadth across different sections of the vault
3. Assess knowledge graph health:
   - **Well-connected:** notes with rich cross-references and backlinks to other notes
   - **Orphaned:** notes that exist but aren't referenced from anywhere (no inbound links)
   - **Stub clusters:** areas with shallow coverage — a topic that should have depth but only has surface notes
   - **Missing nodes:** concepts that appear as `[[links]]` in notes but don't have their own notes yet
4. If scoped to `[argument]`, produce a local map of that cluster; if broad, produce a top-level structural overview
5. Present findings as: what's healthy, what's orphaned, what's missing, and 2–3 recommended connections to add
