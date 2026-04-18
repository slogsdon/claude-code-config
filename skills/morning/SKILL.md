---
name: morning
description: Use when /morning is invoked or when Shane wants to start his day with a focus review. Reads accountability context and yesterday's daily note, surfaces carryovers, runs a knowledge briefing, and writes Today's Focus to today's daily note.
---

# Skill: /morning

Delegate to Gemma via the stepped execution protocol. Claude orchestrates; Gemma executes.

## Steps

1. Determine today's date and yesterday's date (YYYY-MM-DD format)
2. Read both of these files using obsidian CLI:
   - `obsidian read file='Context/accountability'`
   - `obsidian read file='Daily Notes/[yesterday's date]'` (skip if it doesn't exist)
3. Call `mcp__ollama-agent__gemma_start` with:
   - `task`: "You are Shane's morning accountability agent. Review his accountability context and yesterday's daily note (provided). Surface any carry-over tasks that weren't logged as complete. Then ask: what is today's one primary focus? Propose 2 secondary items based on OKR alignment and known patterns. Be direct, no fluff."
   - `skill`: "morning"
   - `context`: full content of both files concatenated
4. Loop: if `status` is `"running"`, call `mcp__ollama-agent__gemma_continue` with `session_id`; repeat until `status` is `"done"` or `"error"`
5. Run the **Knowledge Briefing** (see section below) and collect its output
6. Write focus + briefing to today's daily note:
   - If note exists: `obsidian append file='Daily Notes/[today's date]' content='## Today'\''s Focus\n\n[Gemma result]\n\n## Knowledge Briefing\n\n[briefing output]'`
   - If note doesn't exist: `obsidian create name='Daily Notes/[today's date]' content='# [today'\''s date]\n\n## Today'\''s Focus\n\n[Gemma result]\n\n## Knowledge Briefing\n\n[briefing output]' silent`
6a. Walk check (yesterday):
   - Scan yesterday's daily note content (loaded in step 2) for `🚶 Walk:`
   - If found: skip to step 7
   - If not found: ask "Did you walk yesterday? (y/n)"
     - yes → `obsidian append file='Daily Notes/[yesterday's date]' content='**[HH:MM]** 🚶 Walk: yes'`
     - no → note briefly ("No walk logged for yesterday — noted."), continue
   - Nudge: "Walk scheduled for today?" (one-liner, no reply required)
7. Commit the vault change:
   ```bash
   VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal"
   git -C "$VAULT" add -A && git -C "$VAULT" commit -m "docs: write today's focus to [today's date] daily note"
   ```
8. Present the focus summary and knowledge briefing to Shane

## Knowledge Briefing

Run these three checks using `obsidian` CLI commands via bash, then format results as a brief section:

### New Clippings (last 24h, not yet ingested)

```bash
obsidian search query='Clippings/' limit=20
```

Filter results to files modified in the last 24 hours. Check each for the absence of an `#ingested` tag or a `## Notes` / `## Key Points` section — those indicate it hasn't been processed yet.

Output: list of unprocessed Clipping titles, or "none."

### Open questions from recent /connect or /trace runs

```bash
obsidian search query='open question' limit=10
obsidian search query='unresolved' limit=10
```

Also check yesterday's daily note for any questions flagged during /connect or /trace runs (look for lines starting with `?` or containing "open question").

Output: up to 3 top open questions with source note, or "none."

### vault-index delta since last session

```bash
obsidian read file='Context/vault-index'
```

Compare the current vault-index to the snapshot from yesterday's daily note (look for a `## Knowledge Briefing` section). Surface any new Concept pages, new Clippings folders, or deleted notes since then.

If no vault-index file exists, skip this check and note "vault-index not found."

Output: brief delta summary (e.g., "3 new Concepts, 5 new Clippings") or "no changes."

### Briefing format

```
**New Clippings (unprocessed):** [list or "none"]
**Open questions:** [list or "none"]
**Vault delta:** [summary or "no changes"]
```

## Fallback (if gemma_start/gemma_continue unavailable)

Execute the skill directly:

1. Determine today's and yesterday's dates (YYYY-MM-DD)
2. Run `obsidian read file='Context/accountability'` via bash
3. Run `obsidian read file='Daily Notes/[yesterday's date]'` via bash if it exists
4. Identify carry-overs: compare the `## Today's Focus` section against the `## Session Log` section in yesterday's note — any focus item absent from the session log is a carry-over
5. Read the active OKRs and avoidance patterns from `accountability.md`
6. Propose today's focus:
   - **Primary:** highest-priority OKR-aligned item (prefer carry-overs with 2+ prior deferrals)
   - **Secondary (2 items):** next most important OKR-aligned tasks
   - Flag any item matching a known avoidance pattern
7. Run the Knowledge Briefing checks (described above) directly via bash
8. Run `obsidian append file='Daily Notes/[today's date]' content='...'` via bash to write:
   ```
   ## Today's Focus

   **Primary:** [primary focus]
   **Secondary:**
   - [secondary 1]
   - [secondary 2]

   **Carry-overs from yesterday:** [list or "none"]
   **Pattern flags:** [any avoidance pattern matches or "none"]

   ## Knowledge Briefing

   **New Clippings (unprocessed):** [list or "none"]
   **Open questions:** [list or "none"]
   **Vault delta:** [summary or "no changes"]
   ```
8a. Walk check (yesterday):
    - Scan yesterday's note content (loaded in step 3) for `🚶 Walk:`
    - If found: skip to step 9
    - If not found: ask "Did you walk yesterday? (y/n)"
      - yes → `obsidian append file='Daily Notes/[yesterday's date]' content='**[HH:MM]** 🚶 Walk: yes'` via bash
      - no → note briefly ("No walk logged for yesterday — noted."), continue
    - Nudge: "Walk scheduled for today?" (one-liner)
9. Commit the vault change:
   ```bash
   VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal"
   git -C "$VAULT" add -A && git -C "$VAULT" commit -m "docs: write today's focus to [today's date] daily note"
   ```
10. Present the focus summary and knowledge briefing to Shane
