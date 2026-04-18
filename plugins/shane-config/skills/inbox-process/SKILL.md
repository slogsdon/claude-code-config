---
name: inbox-process
description: Process the Obsidian Inbox interactively — reads all files, generates routing recommendations, then walks through each item one at a time with user confirmation before acting. Use when /inbox-process is invoked or when Shane wants to clear the Inbox.
---

# Skill: /inbox-process

Interactive inbox triage. Review each item, confirm the action, execute.

## Fixtures to Skip

These files are permanent Inbox fixtures — do not include them in processing:
- `Inbox Processing.md`
- `todo.md`
- `Chores.md`

## Destination Routing

| Recommendation | When to use |
|---|---|
| **Move to Projects/** | Describes an active project, initiative, or ongoing effort |
| **Move to Concepts/** | A mental model, framework, reusable idea, or principle |
| **Move to Context/** | Background reference material, standing context, or reference docs |
| **Move to Meetings/** | Raw conversation or meeting note — process with /meeting first |
| **Move to Clippings/** | Article, link, or external source saved for later |
| **Archive** | Done, resolved, or superseded — worth keeping but not active |
| **Delete** | Transient, already captured elsewhere, or no longer relevant |
| **Keep in Inbox** | Genuinely needs more thought before acting |

## Steps

1. **List inbox contents**
   - Run: `ls "~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal/Inbox/"`
   - Filter out fixture files (see above)
   - If inbox is empty: report "Inbox is clear." and stop

2. **Read each file briefly**
   - For each file, strip the `.md` extension and run: `obsidian read file='Note Name'`
   - Skim the output for content type and intent (first ~40 lines is enough)
   - Note the filename and content type

3. **Generate recommendations upfront**
   - For every non-fixture file, produce a one-line summary and a routing recommendation
   - Be opinionated — give a clear call, don't hedge
   - Present the full list as a table:

   ```
   | File | Summary | Recommendation |
   |------|---------|----------------|
   | [filename] | [one-line summary] | [destination] |
   ```

4. **Walk through items one at a time**
   - For each item, show:
     ```
     [N/Total] filename.md
     Summary: [one-line]
     Recommendation: [destination]

     Handle as recommended, or do something else?
     ```
   - Wait for user response before acting
   - Valid responses: "yes" / "ok" / blank → execute recommendation; "skip" / "keep" → note and move on; any other instruction → execute that instead

5. **Execute each confirmed action**
   - **Move**: `mv "[full vault path/Inbox/filename]" "[full vault path/Destination/filename]"` — bash exception; obsidian CLI has no move command
   - **Archive**: `mv "[full vault path/Inbox/filename]" "[full vault path/Inbox/Archive/filename]"` (create Archive/ if needed)
   - **Delete**: `rm "[full vault path/Inbox/filename]"` — bash exception; obsidian CLI has no delete command
   - **Keep in Inbox**: no action, note it
   - **Raw meeting note → Meetings/**: remind Shane to run `/meeting [filename]` first; skip the move for now

6. **Report summary**
   - After all items are handled, output:
     ```
     Inbox processed: N items
     - Moved to Projects: N
     - Moved to Concepts: N
     - Moved to Context: N
     - Moved to Meetings: N
     - Moved to Clippings: N
     - Archived: N
     - Deleted: N
     - Kept in Inbox: N
     - Skipped: N
     ```
