#!/usr/bin/env bash
# Sync Obsidian vault memory note → local Claude memory file at session start.
# Reads CWD from stdin JSON (.workspace.current_dir), maps to vault subfolder,
# writes result to ~/.claude/projects/<project-key>/memory/MEMORY.md.

OBSIDIAN="/opt/homebrew/bin/obsidian"

INPUT=$(cat 2>/dev/null)
CWD=$(echo "$INPUT" | jq -r '.workspace.current_dir // empty' 2>/dev/null)
[ -z "$CWD" ] && CWD="${PWD:-$HOME}"

PROJECT_NAME=$(basename "$CWD")
VAULT_NOTE="Context/Memory/${PROJECT_NAME}/MEMORY.md"

PROJECT_KEY=$(echo "$CWD" | sed 's|/|-|g')
MEMORY_DIR="$HOME/.claude/projects/${PROJECT_KEY}/memory"
MEMORY_FILE="${MEMORY_DIR}/MEMORY.md"

OUTPUT=$("$OBSIDIAN" read "path=${VAULT_NOTE}" 2>/dev/null)
if [ -n "$OUTPUT" ]; then
  mkdir -p "$MEMORY_DIR"
  printf '%s\n' "$OUTPUT" > "$MEMORY_FILE"
fi
