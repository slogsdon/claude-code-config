#!/usr/bin/env bash
# Sync Obsidian vault memory note → local Claude memory file at session start.
# If no vault note exists for the current project, creates one from template and commits it.

OBSIDIAN="/opt/homebrew/bin/obsidian"
VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal"

INPUT=$(cat 2>/dev/null)
CWD=$(echo "$INPUT" | jq -r '.workspace.current_dir // empty' 2>/dev/null)
[ -z "$CWD" ] && CWD="${PWD:-$HOME}"

PROJECT_NAME=$(basename "$CWD")
VAULT_NOTE="Context/Memory/${PROJECT_NAME}/MEMORY.md"

PROJECT_KEY=$(echo "$CWD" | sed 's|/|-|g')
MEMORY_DIR="$HOME/.claude/projects/${PROJECT_KEY}/memory"
MEMORY_FILE="${MEMORY_DIR}/MEMORY.md"

OUTPUT=$("$OBSIDIAN" read "path=${VAULT_NOTE}" 2>/dev/null)

if echo "$OUTPUT" | grep -q "^Error:"; then
  "$OBSIDIAN" create "path=${VAULT_NOTE}" \
    content="# Memory — ${PROJECT_NAME}\n\n> Synced to \`~/.claude/projects/${PROJECT_KEY}/memory/MEMORY.md\` at each session start.\n> To add: \`obsidian append\` a new \`##\` section + update the Index. To update/delete: use Write tool directly on this file (explicit exception to vault rule for \`Context/Memory/\` files).\n\n## Index\n\n_No memories yet._" \
    2>/dev/null
  git -C "$VAULT" add -A 2>/dev/null
  git -C "$VAULT" commit -m "feat: init memory note for ${PROJECT_NAME}" 2>/dev/null
  OUTPUT=$("$OBSIDIAN" read "path=${VAULT_NOTE}" 2>/dev/null)
fi

if [ -n "$OUTPUT" ] && ! echo "$OUTPUT" | grep -q "^Error:"; then
  mkdir -p "$MEMORY_DIR"
  printf '%s\n' "$OUTPUT" > "$MEMORY_FILE"
fi
