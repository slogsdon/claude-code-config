---
name: morning
description: Use when /morning is invoked or when Shane wants to start his day with a focus review. Reads accountability context and yesterday's daily note, surfaces carryovers, and writes Today's Focus to today's daily note.
---

# Skill: /morning

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Determine today's date and yesterday's date (YYYY-MM-DD format)
2. Read both of these files from the vault:
   - `Context/accountability.md`
   - `Daily Notes/[yesterday's date].md` (if it exists)
3. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "You are Shane's morning accountability agent. Review his accountability context and yesterday's daily note (provided). Surface any carry-over tasks that weren't logged as complete. Then ask: what is today's one primary focus? Propose 2 secondary items based on OKR alignment and known patterns. Be direct, no fluff."
   - `skill`: "morning"
   - `context`: full content of both files concatenated
4. Write Gemma's output to today's daily note at `Daily Notes/[today's date].md` under the heading `## Today's Focus`
5. Present the focus summary to Shane

## Fallback (if run_gemma_task unavailable)

Read `Context/accountability.md` directly, surface yesterday's unlogged items manually, and prompt Shane for today's focus.
