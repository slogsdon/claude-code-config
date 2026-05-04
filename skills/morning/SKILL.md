---
name: morning
description: Use when /morning is invoked or when Shane wants to start his day with a focus review. Reads accountability context and yesterday's daily note, surfaces carryovers, runs a knowledge briefing, and writes Today's Focus to today's daily note.
---

# Skill: /morning

Delegate to Qwen via the stepped execution protocol. Claude orchestrates; Qwen executes.

## Steps

1. Determine today's date and yesterday's date (YYYY-MM-DD format)
2. Read these files using obsidian CLI:
   - `obsidian read file='Context/accountability'`
   - `obsidian read file='Context/patterns'`
   - `obsidian read file='Daily Notes/[yesterday's date]'` — if it doesn't exist, try the 3 prior days in order (D-2, D-3, D-4) and use the most recent one found. Label the context clearly with the actual date so Qwen knows the gap.
3. Call `mcp__lmstudio-agent__qwen_start` (standalone) or `mcp__plugin_shane-config_lmstudio-agent__qwen_start` (plugin — use whichever is available) with:
   - `task`: "You are Shane's morning accountability agent. You have three sources: (1) accountability.md — OKR context, may have stale status lines; (2) patterns.md — authoritative completion log, ✅ rows are definitively done; (3) the most recent daily note. Cross-reference all three. Do NOT flag items marked ✅ in patterns.md as carry-overs, even if accountability.md still mentions them as in-progress. Surface only items that are unresolved in patterns.md. Then propose today's one primary focus and 2 secondaries based on OKR alignment. Be direct, no fluff."
   - `skill`: "morning"
   - `context`: full content of all three files concatenated, with clear section headers indicating which file each block came from
4. Loop: if `status` is `"running"`, call `mcp__lmstudio-agent__qwen_continue` (or `mcp__plugin_shane-config_lmstudio-agent__qwen_continue` in plugin) with `session_id`; repeat until `status` is `"done"` or `"error"`
5. Run the **Knowledge Briefing** (see section below) and collect its output
6. Write focus + briefing to today's daily note:
   - If note exists: `obsidian append file='Daily Notes/[today's date]' content='## Today'\''s Focus\n\n[Qwen result]\n\n## Knowledge Briefing\n\n[briefing output]'`
   - If note doesn't exist: `obsidian create name='Daily Notes/[today's date]' content='# [today'\''s date]\n\n## Today'\''s Focus\n\n[Qwen result]\n\n## Knowledge Briefing\n\n[briefing output]' silent`
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
obsidian read file='vault-index'
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


## Fallback (if qwen_start/qwen_continue unavailable)

Execute the skill directly:

1. Determine today's and yesterday's dates (YYYY-MM-DD)
2. Run `obsidian read file='Context/accountability'` via bash
3. Run `obsidian read file='Context/patterns'` via bash
4. Run `obsidian read file='Daily Notes/[yesterday's date]'` via bash — if it doesn't exist, try D-2, D-3, D-4 in order; use the first one found and note the gap
5. Identify carry-overs: check patterns.md Deferred Tasks Log — items without a ✅ COMPLETED marker are active. Do NOT surface items that have ✅ in patterns.md, even if accountability.md mentions them. Cross-check against the most recent daily note's EOD Audit for any same-day completions not yet in patterns.md.
6. Read the active OKRs and avoidance patterns from `accountability.md`
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
