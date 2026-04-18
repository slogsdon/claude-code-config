---
name: log
description: Use when /log is invoked or when Shane wants to capture a lightweight session note. Appends a timestamped entry to today's daily note under Session Log.
---

# Skill: /log

Lightweight session capture. No Gemma needed — this is a direct write.

## Steps

1. Determine today's date (YYYY-MM-DD format)
2. Get the current time (HH:MM format)
3. Capture Shane's session note from his message (everything after /log)
4. Run: `obsidian append file='[today's date]' content='**[HH:MM]** [Shane's note]'`
   - If today's daily note doesn't exist yet, first run: `obsidian create name='Daily Notes/[today's date]' content='# [YYYY-MM-DD]\n\n## Session Log\n\n**[HH:MM]** [Shane's note]' silent`
   - If it exists but has no `## Session Log` heading, prepend `## Session Log\n\n` to the content being appended

5. Commit the vault change:
   ```bash
   VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal"
   git -C "$VAULT" add -A && git -C "$VAULT" commit -m "docs: log session entry [HH:MM]"
   ```
6. Confirm to Shane: "Logged at [HH:MM]."

## Notes

- Keep it fast — this skill should feel like a 2-second action
