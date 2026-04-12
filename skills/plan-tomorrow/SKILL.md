---
name: plan-tomorrow
description: Use when /plan-tomorrow is invoked or after /eod. Reads today's EOD audit and proposes tomorrow's focus (1 primary, 2 secondary) accounting for known patterns. Writes a Tomorrow block to today's daily note.
---

# Skill: /plan-tomorrow

Tomorrow's plan based on today's audit. Delegate to Gemma.

## Steps

1. Determine today's and tomorrow's dates (YYYY-MM-DD format)
2. Read these files:
   - `Daily Notes/[today's date].md` (must contain EOD Audit — run /eod first if missing)
   - `Context/accountability.md`
   - `Context/patterns.md`
3. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "You are Shane's planning agent. Based on today's EOD audit, known OKRs, and avoidance patterns (all provided), propose tomorrow's plan: 1 primary focus and 2 secondary items. Explicitly account for any 3+ deferral items — either re-commit to them with a reason, or suggest removing them. Be specific, no filler. Output a markdown block ready to paste."
   - `skill`: "plan-tomorrow"
   - `context`: content of all three files
4. Append Gemma's output to today's daily note under `## Tomorrow ([tomorrow's date])`
5. Present the plan to Shane

## Fallback (if run_gemma_task unavailable)

Read the EOD audit directly and propose a plan based on OKR alignment.
