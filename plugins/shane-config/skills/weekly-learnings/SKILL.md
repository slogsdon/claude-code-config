---
name: weekly-learnings
description: Use when asked to prepare a weekly reflection or summary of learnings, or when /weekly-learnings is invoked.
---

# Skill: /weekly-learnings [argument]

Delegate to Gemma via the stepped execution protocol. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__plugin_shane-config_ollama-agent__gemma_start` with:
   - `task`: "Synthesize this week's vault additions and highlights into a meaningful weekly reflection or email update. What were the key learnings, themes, and open questions?"
   - `skill`: "weekly-learnings"
   - `context`: any relevant context from the current conversation
3. Loop: if `status` is `"running"`, call `mcp__plugin_shane-config_ollama-agent__gemma_continue` with `session_id`; repeat until `status` is `"done"` or `"error"`
4. Review Gemma's `result`, synthesize if needed, and present to Shane

## Task description for Gemma

Synthesize this week's vault additions and highlights into a meaningful weekly reflection or email update. What were the key learnings, themes, and open questions?

## Fallback (if gemma_start/gemma_continue unavailable)

Execute the skill directly:

1. Determine the current week's date range (Monday–Sunday, YYYY-MM-DD)
2. Read this week's daily notes by running `obsidian read file='Daily Notes/[date]'` via bash for each date in the week
3. Run `obsidian search query='[key theme or topic from the week]' limit=15` via bash to surface active notes from this week
4. Read the most active notes from this week
5. Synthesize into a weekly reflection with these sections:
   - **Key learnings** (3–5 concrete insights, not summaries of activity)
   - **Recurring themes** (what kept coming up across different contexts?)
   - **Open questions** (what is still unresolved or needs more thinking?)
   - **What surprised me** (anything that shifted existing assumptions?)
6. If `[argument]` was provided, scope the reflection to that topic
7. Present the reflection to Shane — format as a written piece, not a bullet dump
