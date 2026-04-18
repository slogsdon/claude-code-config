---
name: meeting
description: Process a raw conversation note from the Obsidian Inbox into a clean Meetings note with key points and action items. Use when /meeting is invoked or when Shane wants to process a raw chat/meeting note.
---

# Skill: /meeting

Process a raw note from the Obsidian Inbox into a structured Meetings note.

## Steps

1. **Find the raw note**
   - If the user named a note (e.g. "Chat with Sean"), run: `obsidian search query='Chat with Sean'` to confirm it exists, then `obsidian read file='Chat with Sean'`
   - If no name given, run `ls "~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal/Inbox/"` and pick the most recently modified non-fixture file, then `obsidian read file='Note Name'` (strip .md)
   - Read the full note content

2. **Extract structured content**
   - Identify the other person(s) in the conversation
   - Extract key points: meaningful decisions, context shared, topics discussed — one tight bullet per point, no filler
   - Separate action items into two buckets:
     - Shane's actions (owner implied)
     - Their actions (prefix with `PersonName:`)

3. **Write the processed note**
   - Determine the date from the filename or content (format: YYYY-MM-DD)
   - Run `obsidian create name='Meetings/[original filename without .md]' silent` with the following content:

   ```markdown
   ---
   date: YYYY-MM-DD
   people: [[People/PersonName]]
   ---

   # [Title] — [Month Day]

   ## Key Points
   - (bullet per meaningful point, concise)

   ## Actions
   - [ ] (Shane's action items)
   - [ ] PersonName: (their action items)
   ```

4. **Check/create Person note**
   - Run `obsidian read file='PersonName'` — if it errors or returns empty, the note doesn't exist
   - If missing, run `obsidian create name='People/PersonName' silent` with this stub:

   ```markdown
   ---
   type: person
   role: 
   ---

   # PersonName

   ## Context
   - 

   ## Preferences & Working Style
   -

   ## Related
   ```

5. **Handle the raw Inbox note**
   - Delete the raw note from Inbox/ using bash (obsidian CLI has no delete command):
     `rm "~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal/Inbox/[filename].md"`
   - Or move to Archive/ if user prefers to keep it
   - Default: delete unless user says otherwise

6. **Commit vault changes**
   ```bash
   VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal"
   git -C "$VAULT" add -A && git -C "$VAULT" commit -m "docs: process meeting note [filename]"
   ```

7. **Confirm**
   - Tell Shane what was written and where
   - Surface any action items that need immediate attention
