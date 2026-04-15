---
name: meeting
description: Process a raw conversation note from the Obsidian Inbox into a clean Meetings note with key points and action items. Use when /meeting is invoked or when Shane wants to process a raw chat/meeting note.
---

# Skill: /meeting

Process a raw note from the Obsidian Inbox into a structured Meetings note.

## Vault Root

`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal/`

## Steps

1. **Find the raw note**
   - If the user named a note (e.g. "Chat with Sean"), find the matching file in `Inbox/`
   - Otherwise, list files in `Inbox/` and pick the most recently modified one
   - Read the raw note content

2. **Extract structured content**
   - Identify the other person(s) in the conversation
   - Extract key points: meaningful decisions, context shared, topics discussed — one tight bullet per point, no filler
   - Separate action items into two buckets:
     - Shane's actions (owner implied)
     - Their actions (prefix with `PersonName:`)

3. **Write the processed note**
   - Determine the date from the filename or content (format: YYYY-MM-DD)
   - Write to `Meetings/[original filename].md` using this format:

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
   - Check if `People/[PersonName].md` exists
   - If not, create a minimal stub:

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
   - Delete the raw note from `Inbox/` (or move to `Inbox/Archive/` if the user prefers to keep it)
   - Default: delete unless user says otherwise

6. **Confirm**
   - Tell Shane what was written and where
   - Surface any action items that need immediate attention
