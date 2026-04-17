---
name: plan-tomorrow
description: Use when /plan-tomorrow is invoked or after /eod. Reads today's EOD audit and proposes tomorrow's focus (1 primary, 2 secondary) accounting for known patterns. Writes a Tomorrow block to today's daily note.
---

# Skill: /plan-tomorrow

Tomorrow's plan based on today's audit. Delegate to Gemma.

## Steps

1. Determine today's and tomorrow's dates (YYYY-MM-DD format)
2. Read these files using obsidian CLI:
   - `obsidian read file='Daily Notes/[today's date]'` (must contain EOD Audit — run /eod first if missing)
   - `obsidian read file='Context/accountability'`
   - `obsidian read file='Context/patterns'`
3. Call `mcp__ollama-agent__gemma_start` with:
   - `task`: "You are Shane's planning agent. Based on today's EOD audit, known OKRs, and avoidance patterns (all provided), propose tomorrow's plan: 1 primary focus and 2 secondary items. Explicitly account for any 3+ deferral items — either re-commit to them with a reason, or suggest removing them. Be specific, no filler. Output a markdown block ready to paste."
   - `skill`: "plan-tomorrow"
   - `context`: content of all three files
4. Loop: if `status` is `"running"`, call `mcp__ollama-agent__gemma_continue` with `session_id`; repeat until `status` is `"done"` or `"error"`
5. Run `obsidian append file='Daily Notes/[today's date]' content='## Tomorrow ([tomorrow's date])\n\n[Gemma result]'`
6. Commit the vault change:
   ```bash
   VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal"
   git -C "$VAULT" add -A && git -C "$VAULT" commit -m "docs: write tomorrow's plan to [today's date] daily note"
   ```
7. Present the plan to Shane

## Fallback (if gemma_start/gemma_continue unavailable)

Execute the skill directly:

1. Determine today's and tomorrow's dates (YYYY-MM-DD)
2. Read the following files via bash:
   - `obsidian read file='Daily Notes/[today's date]'` — look for `## EOD Audit`; if missing, tell Shane to run /eod first
   - `obsidian read file='Context/accountability'`
   - `obsidian read file='Context/patterns'`
3. Analyze the EOD Audit:
   - Note deferred items and their deferral counts
   - Note any PATTERN ALERT items
4. Review active OKRs in `accountability.md` and avoidance patterns in `patterns.md`
5. Propose tomorrow's plan:
   - **Primary (1):** most important OKR-aligned item; if a 3+ deferral item is genuinely high priority, either re-commit with a specific reason or explicitly recommend removing it
   - **Secondary (2):** next two OKR-aligned tasks
   - For each 3+ deferral item: either include it with a "re-commit reason" or mark "suggest removing — not actually a priority"
6. Write the following block to `Daily Notes/[today's date].md` under `## Tomorrow ([tomorrow's date])`:
   ```markdown
   ## Tomorrow ([tomorrow's date])

   **Primary:** [task]
   **Secondary:**
   - [task 1]
   - [task 2]

   **On deferred items:**
   - [task]: [re-commit reason] OR [suggest removing]
   ```
7. Commit the vault change:
   ```bash
   VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal"
   git -C "$VAULT" add -A && git -C "$VAULT" commit -m "docs: write tomorrow's plan to [today's date] daily note"
   ```
8. Present the plan to Shane
