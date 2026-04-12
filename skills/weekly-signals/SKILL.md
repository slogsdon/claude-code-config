---
name: weekly-signals
description: Use when /weekly-signals is invoked or during weekly review. Reads patterns.md and the week's daily notes, surfaces deferral patterns and flagged items, and outputs a paste-ready Accountability Signals block for the Weekly Review.
---

# Skill: /weekly-signals

Weekly pattern aggregator. Delegate to Gemma; output a paste-ready block.

## Steps

1. Determine the current week's date range (Monday–Sunday, YYYY-MM-DD format)
2. Read these files from the vault:
   - `Context/patterns.md`
   - `Context/accountability.md`
   - All `Daily Notes/[date].md` files for the current week (read each that exists)
3. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "You are Shane's weekly accountability analyst. Review this week's daily notes and patterns.md (provided). Surface: (1) tasks deferred 2+ times this week, (2) any PATTERN ALERT items, (3) logging gaps (days with no session log), (4) OKR alignment score — what % of logged work maps to the 3 active OKRs? Output a markdown block titled '## Accountability Signals' ready to paste into a Weekly Review note. Be honest, not cheerful."
   - `skill`: "weekly-signals"
   - `context`: content of all files concatenated
4. Output the block to Shane — do NOT write to the Weekly Review automatically. Shane pastes it manually.
5. Offer to explain any pattern or signal in more detail.

## Fallback (if run_gemma_task unavailable)

Read patterns.md and daily notes directly and generate the signals block manually.
