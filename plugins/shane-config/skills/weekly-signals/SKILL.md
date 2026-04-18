---
name: weekly-signals
description: Use when /weekly-signals is invoked or during weekly review. Reads patterns.md and the week's daily notes, surfaces deferral patterns and flagged items, and outputs a paste-ready Accountability Signals block for the Weekly Review.
---

# Skill: /weekly-signals

Weekly pattern aggregator. Delegate to Gemma; output a paste-ready block.

## Steps

1. **Check inbox** — count non-fixture files in `Inbox/` (exclude: `Inbox Processing.md`, `todo.md`, `Chores.md`)
   - If count > 0: "Your Inbox has N unprocessed items. Run /inbox-process first, or continue with the weekly review?"
   - If count = 0: proceed
2. Determine the current week's date range (Monday–Sunday, YYYY-MM-DD format)
3. Read these files from the vault:
   - `Context/patterns.md`
   - `Context/accountability.md`
   - All `Daily Notes/[date].md` files for the current week (read each that exists)
4. Call `mcp__ollama-agent__gemma_start` with:
   - `task`: "You are Shane's weekly accountability analyst. Review this week's daily notes and patterns.md (provided). Surface: (1) tasks deferred 2+ times this week, (2) any PATTERN ALERT items, (3) logging gaps (days with no session log), (4) OKR alignment score — what % of logged work maps to the 3 active OKRs? Output a markdown block titled '## Accountability Signals' ready to paste into a Weekly Review note. Be honest, not cheerful."
   - `skill`: "weekly-signals"
   - `context`: content of all files concatenated
5. Loop: if `status` is `"running"`, call `mcp__ollama-agent__gemma_continue` with `session_id`; repeat until `status` is `"done"` or `"error"`
6. Output Gemma's `result` to Shane — do NOT write to the Weekly Review automatically. Shane pastes it manually.
7. Offer to explain any pattern or signal in more detail.

## Fallback (if gemma_start/gemma_continue unavailable)

Execute the skill directly:

1. **Check inbox** — same as main step 1
2. Determine the current week's Monday–Sunday date range (YYYY-MM-DD)
3. Read the following files via bash:
   - `obsidian read file="Context/patterns"`
   - `obsidian read file="Context/accountability"`
   - `obsidian read file="Daily Notes/[date]"` for each date in the week that exists
4. Aggregate signals:
   - **Deferred 2+ times this week:** count how many EOD Audits each task appeared in as deferred
   - **PATTERN ALERTs:** collect any PATTERN ALERT lines from the week's EOD Audits
   - **Logging gaps:** note any days where the session log was empty or missing
   - **OKR alignment:** for each day's session log, classify each logged item as OKR-aligned or not; compute a rough percentage
5. Output the following block to Shane (do NOT write to vault — Shane pastes manually):
   ```markdown
   ## Accountability Signals — Week of [Monday date]

   **Deferred 2+ times:**
   - [task] — deferred [N] times

   **Pattern Alerts:**
   - [PATTERN ALERT items from patterns.md with 3+ deferrals]

   **Logging Gaps:** [days with no session log, or "none"]

   **OKR Alignment:** ~[N]% of logged work mapped to active OKRs
   - Aligned: [examples]
   - Off-OKR: [examples]
   ```
6. Offer to explain any signal in more detail
