---
name: level-up
description: Use when asked to assess skill proficiency and recommend growth actions, or when /level-up is invoked.
---

# Skill: /level-up [argument]

Delegate to Qwen via the stepped execution protocol. Claude orchestrates; Qwen executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__lmstudio-agent__qwen_start` (standalone) or `mcp__plugin_shane-config_lmstudio-agent__qwen_start` (plugin — use whichever is available) with:
   - `task`: "Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md). Assess Shane's current proficiency with '[argument]' based on vault evidence. What's the next growth edge? What specific actions would level him up?"
   - `skill`: "level-up"
   - `context`: any relevant context from the current conversation
3. Loop: if `status` is `"running"`, call `mcp__lmstudio-agent__qwen_continue` (or `mcp__plugin_shane-config_lmstudio-agent__qwen_continue` in plugin) with `session_id`; repeat until `status` is `"done"` or `"error"`
4. Review Qwen's `result`, synthesize if needed, and present to Shane

## Task description for Qwen

Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md).

Assess Shane's current proficiency with '[argument]' based on vault evidence. What's the next growth edge? What specific actions would level him up?

## Fallback (if qwen_start/qwen_continue unavailable)

Execute the skill directly:

1. Run `obsidian search query='[argument]' limit=10` via bash to find notes related to the topic
2. Read the relevant notes by running `obsidian read file='[note name]'` via bash for each
3. Assess current proficiency based on vault evidence:
   - What does Shane demonstrate understanding of? (concepts he explains, applies, or questions at depth)
   - What's still surface-level? (concepts mentioned but not interrogated)
   - What's conspicuously absent? (things an expert in this area would typically grapple with)
4. Identify the next growth edge — the specific capability gap that, if closed, would unlock the most
5. Propose 2–3 concrete actions to level up (not generic advice — specific to what the vault shows):
   - A thing to read/learn
   - A thing to practice or build
   - A thing to write or reflect on to solidify the knowledge
6. Present the assessment to Shane
