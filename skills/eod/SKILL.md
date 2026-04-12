---
name: eod
description: Use when /eod is invoked or when Shane wants to close out his day. Diffs Today's Focus vs Session Log, increments deferrals in patterns.md for unlogged tasks, flags items at 3+ deferrals, and writes an EOD Audit to today's daily note.
---

# Skill: /eod

End-of-day accountability audit. Delegate analysis to Gemma; Claude handles writes.

## Steps

1. Determine today's date (YYYY-MM-DD format)
2. Read these files from the vault:
   - `Daily Notes/[today's date].md`
   - `Context/patterns.md`
   - `Context/accountability.md`
3. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "You are Shane's EOD accountability agent. Compare the 'Today's Focus' section against the 'Session Log' section in today's daily note (provided). For each focus item NOT reflected in the session log, flag it as deferred. Check patterns.md for existing deferral counts and increment them. Flag any item now at 3+ deferrals with: 'PATTERN ALERT: [task] has been deferred [N] times. Is this actually a priority?' Output: (1) EOD Audit block for the daily note, (2) updated rows for patterns.md Deferred Tasks Log."
   - `skill`: "eod"
   - `context`: content of all three files
4. Parse Gemma's output:
   - Append the EOD Audit block to today's daily note under `## EOD Audit`
   - Update `Context/patterns.md` Deferred Tasks Log with new/incremented rows
5. If any day had no session log entries at all, add a `## Logging Gap` entry to that day's note
6. Present the audit summary to Shane

## Fallback (if run_gemma_task unavailable)

Read the files directly, do the diff manually, and write the audit block.
