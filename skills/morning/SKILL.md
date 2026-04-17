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
5. Commit the vault change:
   ```bash
   VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal"
   git -C "$VAULT" add -A && git -C "$VAULT" commit -m "docs: write today's focus to [today's date] daily note"
   ```
6. Present the focus summary to Shane

## Fallback (if run_gemma_task unavailable)

Execute the skill directly:

1. Determine today's and yesterday's dates (YYYY-MM-DD)
2. Run `obsidian read file="Context/accountability"` via bash
3. Run `obsidian read file="Daily Notes/[yesterday's date]"` via bash if it exists
4. Identify carry-overs: compare the `## Today's Focus` section against the `## Session Log` section in yesterday's note — any focus item absent from the session log is a carry-over
5. Read the active OKRs and avoidance patterns from `accountability.md`
6. Propose today's focus:
   - **Primary:** highest-priority OKR-aligned item (prefer carry-overs with 2+ prior deferrals)
   - **Secondary (2 items):** next most important OKR-aligned tasks
   - Flag any item matching a known avoidance pattern
7. Run `obsidian append file="Daily Notes/[today's date]" content="..."` via bash to write the following block under `## Today's Focus`:
   ```
   **Primary:** [primary focus]
   **Secondary:**
   - [secondary 1]
   - [secondary 2]

   **Carry-overs from yesterday:** [list or "none"]
   **Pattern flags:** [any avoidance pattern matches or "none"]
   ```
8. Commit the vault change:
   ```bash
   VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal"
   git -C "$VAULT" add -A && git -C "$VAULT" commit -m "docs: write today's focus to [today's date] daily note"
   ```
9. Present the focus summary to Shane
