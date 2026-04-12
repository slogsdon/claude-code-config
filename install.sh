#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MCP_JSON="$SCRIPT_DIR/.mcp.json"

if [[ ! -f "$MCP_JSON" ]]; then
  echo "ERROR: .mcp.json not found at $MCP_JSON" >&2
  exit 1
fi

if ! command -v jq &>/dev/null; then
  echo "ERROR: jq is required but not installed" >&2
  exit 1
fi

if ! command -v claude &>/dev/null; then
  echo "ERROR: claude CLI not found in PATH" >&2
  exit 1
fi

servers=$(jq -r '.mcpServers | keys[]' "$MCP_JSON")

if [[ -z "$servers" ]]; then
  echo "No MCP servers found in .mcp.json"
  exit 0
fi

success=0
failure=0

register_server() {
  local name="$1"

  # Use python3 to emit a null-delimited arg list for safe parsing
  # Output: command\0arg1\0arg2\0...
  local parsed
  parsed=$(python3 -c "
import json, sys, os

with open('$MCP_JSON') as f:
    config = json.load(f)

server = config['mcpServers']['$name']
parts = [server['command']] + server.get('args', [])
print('\x00'.join(parts), end='')
")

  # Read null-delimited values into array
  local cmd_parts=()
  while IFS= read -r -d '' part; do
    cmd_parts+=("$part")
  done <<< "$parsed"
  # The <<< adds a newline; handle the last element
  # Re-do with process substitution to avoid the trailing newline issue
  cmd_parts=()
  while IFS= read -r -d '' part; do
    cmd_parts+=("$part")
  done < <(python3 -c "
import json, sys

with open('$MCP_JSON') as f:
    config = json.load(f)

server = config['mcpServers']['$name']
parts = [server['command']] + server.get('args', [])
sys.stdout.buffer.write(b'\x00'.join(p.encode() for p in parts) + b'\x00')
")

  local server_command="${cmd_parts[0]}"
  local server_args=("${cmd_parts[@]:1}")

  # Build env flags
  local env_flags=()
  while IFS= read -r line; do
    [[ -n "$line" ]] && env_flags+=("-e" "$line")
  done < <(jq -r ".mcpServers[\"$name\"].env // {} | to_entries[] | .key + \"=\" + .value" "$MCP_JSON" 2>/dev/null)

  # Remove existing registration for idempotency
  if claude mcp remove "$name" --scope user &>/dev/null; then
    echo "  Removed existing registration for '$name'"
  fi

  # Register the server (use -- to prevent args like -y being parsed as claude flags)
  if claude mcp add --scope user "${env_flags[@]+"${env_flags[@]}"}" "$name" -- "$server_command" "${server_args[@]+"${server_args[@]}"}"; then
    echo "  [OK] $name"
    success=$((success + 1))
  else
    echo "  [FAIL] $name"
    failure=$((failure + 1))
  fi
}

echo "Registering MCP servers at user scope..."
echo ""

while IFS= read -r name; do
  register_server "$name"
done <<< "$servers"

echo ""
echo "Done: $success succeeded, $failure failed"

if [[ $failure -gt 0 ]]; then
  exit 1
fi
